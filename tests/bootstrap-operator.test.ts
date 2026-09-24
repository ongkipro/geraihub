import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";
import test from "node:test";
import { Pool } from "pg";
import { grantBootstrapRuntimePrivileges } from "../src/db/grant-bootstrap-runtime.ts";
import { acceptInvitation } from "../src/modules/identity/accept-invitation.ts";
import { createBootstrapProof, issueBootstrapInvitation } from "../src/modules/identity/issue-bootstrap-invitation.ts";

const run = promisify(execFile);

test("first bootstrap invitation binds the environment without a public initializer", async () => {
  const databaseUrl = process.env.DATABASE_URL;
  assert.ok(databaseUrl, "DATABASE_URL is required for integration tests");
  const databaseName = `geraihub_bootstrap_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
  const url = new URL(databaseUrl);
  const admin = new Pool({ connectionString: databaseUrl });
  await admin.query(`CREATE DATABASE "${databaseName}"`);
  url.pathname = `/${databaseName}`;
  const isolatedUrl = url.toString();
  const pool = new Pool({ connectionString: isolatedUrl });
  try {
    await run("pnpm", ["db:migrate"], { cwd: process.cwd(), env: { ...process.env, DATABASE_URL: isolatedUrl } });
    const approval = {
      email: "initial@example.invalid",
      approvalReference: "synthetic-initial-approval",
      operatorReference: "synthetic-operator",
      environmentName: "test",
    };
    const invitationId = await issueBootstrapInvitation(pool, approval, createBootstrapProof());
    const marker = await pool.query<{ environment_name: string; current_invitation_id: string }>(
      "select environment_name, current_invitation_id from bootstrap_control where id = 'platform'",
    );
    assert.deepEqual(marker.rows[0], { environment_name: "test", current_invitation_id: invitationId });
    await assert.rejects(issueBootstrapInvitation(pool, approval, createBootstrapProof()), /remains active/);
    await assert.rejects(issueBootstrapInvitation(pool, { ...approval, environmentName: "other" }, createBootstrapProof()), /unavailable/);
  } finally {
    await pool.end();
    await admin.query(`DROP DATABASE "${databaseName}"`);
    await admin.end();
  }
});

test("controlled bootstrap replaces only an expired invite and never reopens", async () => {
  const databaseUrl = process.env.DATABASE_URL;
  assert.ok(databaseUrl, "DATABASE_URL is required for integration tests");
  const databaseName = `geraihub_bootstrap_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
  const runtimeRole = `geraihub_runtime_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
  const url = new URL(databaseUrl);
  const admin = new Pool({ connectionString: databaseUrl });
  const approval = {
    email: "bootstrap@example.invalid",
    approvalReference: "synthetic-approval",
    operatorReference: "synthetic-operator",
    environmentName: "test",
  };
  await admin.query(`CREATE DATABASE "${databaseName}"`);
  await admin.query(`CREATE ROLE "${runtimeRole}" NOLOGIN`);
  url.pathname = `/${databaseName}`;
  const isolatedUrl = url.toString();
  const pool = new Pool({ connectionString: isolatedUrl });
  try {
    await run("pnpm", ["db:migrate"], {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: isolatedUrl },
    });
    await grantBootstrapRuntimePrivileges(pool, runtimeRole);
    const scopeOwner = await pool.query<{ id: string }>(
      "insert into \"user\" (name, email) values ('Synthetic Scope Owner', 'scope-owner@example.invalid') returning id",
    );
    const organization = await pool.query<{ id: string }>(
      "insert into organizations (name) values ('Synthetic Runtime Organization') returning id",
    );
    const guard = await pool.connect();
    try {
      await guard.query(`SET ROLE "${runtimeRole}"`);
      await guard.query(
        "insert into invitations (proof_digest, intended_email, role, scope_kind, organization_id, invited_by_user_id, expires_at) values (repeat('b', 64), 'owner@example.invalid', 'owner', 'organization', $1, $2, now() + interval '1 day')",
        [organization.rows[0].id, scopeOwner.rows[0].id],
      );
      await assert.rejects(
        guard.query("insert into invitations (proof_digest, intended_email, role, scope_kind, approval_reference, operator_reference, environment_name, expires_at) values (repeat('c', 64), 'admin@example.invalid', 'platform_super_admin', 'platform', 'approval', 'operator', 'test', now() + interval '1 day')"),
        (error: unknown) => (error as { code?: string }).code === "42501",
      );
      await assert.rejects(
        guard.query("update bootstrap_control set current_invitation_id = gen_random_uuid() where id = 'platform'"),
        (error: unknown) => (error as { code?: string }).code === "42501",
      );
      await assert.rejects(
        guard.query("update bootstrap_control set environment_name = 'production' where id = 'platform'"),
        (error: unknown) => (error as { code?: string }).code === "42501",
      );
    } finally {
      await guard.query("RESET ROLE");
      guard.release();
    }
    const expired = await pool.query<{ id: string }>(
      "insert into invitations (proof_digest, intended_email, role, scope_kind, approval_reference, operator_reference, environment_name, expires_at) values (repeat('a', 64), $1, 'platform_super_admin', 'platform', $2, $3, $4, now() - interval '1 hour') returning id",
      [approval.email, approval.approvalReference, approval.operatorReference, approval.environmentName],
    );
    await pool.query("update bootstrap_control set current_invitation_id = $1, environment_name = 'test' where id = 'platform'", [expired.rows[0].id]);
    await assert.rejects(issueBootstrapInvitation(pool, { ...approval, environmentName: "production" }, createBootstrapProof()), /unavailable/);

    const proofs = [createBootstrapProof(), createBootstrapProof()];
    const attempts = await Promise.allSettled(proofs.map((proof) => issueBootstrapInvitation(pool, approval, proof)));
    assert.equal(attempts.filter((attempt) => attempt.status === "fulfilled").length, 1);
    assert.equal(attempts.filter((attempt) => attempt.status === "rejected").length, 1);
    const winner = attempts.findIndex((attempt) => attempt.status === "fulfilled");
    const old = await pool.query<{ revoked_at: Date | null }>("select revoked_at from invitations where id = $1", [expired.rows[0].id]);
    assert.ok(old.rows[0].revoked_at);
    const current = await pool.query<{ current_invitation_id: string }>(
      "select current_invitation_id from bootstrap_control where id = 'platform'",
    );
    await assert.rejects(
      pool.query("update invitations set operator_reference = 'altered' where id = $1", [current.rows[0].current_invitation_id]),
      (error: unknown) => (error as { code?: string }).code === "23514",
    );
    await assert.rejects(
      pool.query("update invitations set environment_name = 'other' where id = $1", [current.rows[0].current_invitation_id]),
      (error: unknown) => (error as { code?: string }).code === "23514",
    );

    const user = await pool.query<{ id: string }>(
      "insert into \"user\" (name, email, email_verified) values ('Synthetic Bootstrap Admin', $1, true) returning id",
      [approval.email],
    );
    const identity = { userId: user.rows[0].id, subject: "synthetic-bootstrap-subject", email: approval.email, emailVerified: true as const };
    await pool.query(
      "insert into account (account_id, provider_id, user_id, updated_at) values ($1, 'google', $2, now())",
      [identity.subject, identity.userId],
    );
    const grant = await acceptInvitation(pool, proofs[winner], identity);
    assert.deepEqual(grant, { scopeKind: "platform", role: "platform_super_admin", organizationId: null, branchId: null });
    const marker = await pool.query<{ completed_at: Date | null }>("select completed_at from bootstrap_control where id = 'platform'");
    assert.ok(marker.rows[0].completed_at);
    const tenantGrants = await pool.query("select 1 from memberships where user_id = $1", [identity.userId]);
    assert.equal(tenantGrants.rowCount, 0);
    await assert.rejects(issueBootstrapInvitation(pool, approval, createBootstrapProof()), /unavailable/);
  } finally {
    await pool.query(`DROP OWNED BY "${runtimeRole}"`);
    await pool.end();
    await admin.query(`DROP DATABASE "${databaseName}"`);
    await admin.query(`DROP ROLE "${runtimeRole}"`);
    await admin.end();
  }
});
