import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import test from "node:test";
import { Pool, type PoolClient } from "pg";
import { acceptInvitation } from "../src/modules/identity/accept-invitation.ts";

async function rejectsSql(client: PoolClient, statement: string, values: unknown[], code: string) {
  await client.query("SAVEPOINT expected_error");
  try {
    await assert.rejects(client.query(statement, values), (error: unknown) =>
      (error as { code?: string }).code === code,
    );
  } finally {
    await client.query("ROLLBACK TO SAVEPOINT expected_error");
    await client.query("RELEASE SAVEPOINT expected_error");
  }
}

test("membership constraints deny cross-organization and duplicate active grants", async () => {
  const databaseUrl = process.env.DATABASE_URL;
  assert.ok(databaseUrl);
  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const user = await client.query<{ id: string }>(
      "insert into \"user\" (name, email) values ('Synthetic Member', 'member@example.invalid') returning id",
    );
    const organizations = await client.query<{ id: string }>(
      "insert into organizations (name) values ('Synthetic A'), ('Synthetic B') returning id",
    );
    const [orgA, orgB] = organizations.rows;
    const branch = await client.query<{ id: string }>(
      "insert into branches (organization_id, name, address, timezone) values ($1, 'Branch A', 'Synthetic Address', 'Asia/Jakarta') returning id",
      [orgA.id],
    );
    const branchB = await client.query<{ id: string }>(
      "insert into branches (organization_id, name, address, timezone) values ($1, 'Branch B', 'Synthetic Address', 'Asia/Jakarta') returning id",
      [orgA.id],
    );
    await rejectsSql(client,
      "insert into memberships (user_id, organization_id, branch_id, role) values ($1, $2, $3, 'admin')",
      [user.rows[0].id, orgB.id, branch.rows[0].id], "23503");
    await rejectsSql(client,
      "insert into memberships (user_id, organization_id, branch_id, role) values ($1, $2, null, 'admin')",
      [user.rows[0].id, orgA.id], "23514");
    const grant = await client.query<{ id: string }>(
      "insert into memberships (user_id, organization_id, branch_id, role) values ($1, $2, $3, 'admin') returning id",
      [user.rows[0].id, orgA.id, branch.rows[0].id],
    );
    await rejectsSql(client,
      "insert into memberships (user_id, organization_id, branch_id, role) values ($1, $2, $3, 'admin')",
      [user.rows[0].id, orgA.id, branch.rows[0].id], "23505");
    await rejectsSql(client,
      "update memberships set organization_id = $1 where id = $2",
      [orgB.id, grant.rows[0].id], "23514");
    const revoked = await client.query<{ version: string }>(
      "update memberships set status = 'revoked', revoked_at = now() where id = $1 returning version",
      [grant.rows[0].id],
    );
    assert.equal(revoked.rows[0].version, "2");
    await rejectsSql(client,
      "update memberships set status = 'active', revoked_at = null where id = $1",
      [grant.rows[0].id], "23514");
    await client.query(
      "insert into memberships (user_id, organization_id, branch_id, role) values ($1, $2, $3, 'admin')",
      [user.rows[0].id, orgA.id, branch.rows[0].id],
    );
    await client.query(
      "insert into memberships (user_id, organization_id, branch_id, role) values ($1, $2, $3, 'admin')",
      [user.rows[0].id, orgA.id, branchB.rows[0].id],
    );
    await client.query(
      "insert into memberships (user_id, organization_id, branch_id, role) values ($1, $2, null, 'owner')",
      [user.rows[0].id, orgA.id],
    );
    const platformGrant = await client.query<{ id: string }>(
      "insert into platform_grants (user_id, role) values ($1, 'platform_support') returning id",
      [user.rows[0].id],
    );
    await rejectsSql(client,
      "insert into platform_grants (user_id, role) values ($1, 'platform_support')",
      [user.rows[0].id], "23505");
    await client.query(
      "update platform_grants set status = 'revoked', revoked_at = now() where id = $1",
      [platformGrant.rows[0].id],
    );
    await rejectsSql(client,
      "update platform_grants set status = 'active', revoked_at = null where id = $1",
      [platformGrant.rows[0].id], "23514");
  } finally {
    await client.query("ROLLBACK");
    client.release();
    await pool.end();
  }
});

test("invitation acceptance is single-use and requires the verified subject and email", async () => {
  const databaseUrl = process.env.DATABASE_URL;
  assert.ok(databaseUrl);
  const pool = new Pool({ connectionString: databaseUrl });
  const prefix = randomUUID();
  const proof = `synthetic-proof-${prefix}`;
  const digest = createHash("sha256").update(proof).digest("hex");
  const setup = await pool.connect();
  let userId = "";
  let invitationId = "";
  try {
    await setup.query("BEGIN");
    const user = await setup.query<{ id: string }>(
      "insert into \"user\" (name, email, email_verified) values ('Synthetic Invitee', $1, true) returning id",
      [`${prefix}@example.invalid`],
    );
    userId = user.rows[0].id;
    const organization = await setup.query<{ id: string }>(
      "insert into organizations (name) values ('Synthetic Invite Organization') returning id",
    );
    await setup.query(
      "insert into account (account_id, provider_id, user_id, updated_at) values ($1, 'google', $2, now())",
      [`subject-${prefix}`, userId],
    );
    const invitation = await setup.query<{ id: string }>(
      "insert into invitations (proof_digest, intended_email, role, scope_kind, organization_id, invited_by_user_id, expires_at) values ($1, $2, 'owner', 'organization', $3, $4, now() + interval '1 day') returning id",
      [digest, `${prefix}@example.invalid`, organization.rows[0].id, userId],
    );
    invitationId = invitation.rows[0].id;
    await setup.query("COMMIT");
  } finally {
    setup.release();
  }

  try {
    const identity = { userId, subject: `subject-${prefix}`, email: `${prefix}@example.invalid`, emailVerified: true as const };
    await assert.rejects(acceptInvitation(pool, proof, { ...identity, subject: "wrong-subject" }), /not eligible/);
    await assert.rejects(acceptInvitation(pool, proof, { ...identity, email: "wrong@example.invalid" }), /not eligible/);
    const attempts = await Promise.allSettled([acceptInvitation(pool, proof, identity), acceptInvitation(pool, proof, identity)]);
    assert.equal(attempts.filter((attempt) => attempt.status === "fulfilled").length, 1);
    assert.equal(attempts.filter((attempt) => attempt.status === "rejected").length, 1);
    const rows = await pool.query(
      "select m.id from memberships m join invitations i on i.organization_id = m.organization_id where i.id = $1 and m.user_id = $2 and m.status = 'active'",
      [invitationId, userId],
    );
    assert.equal(rows.rowCount, 1);
    await assert.rejects(acceptInvitation(pool, proof, identity), /not eligible/);
  } finally {
    await pool.end();
  }
});

test("expired and revoked invitations deny acceptance; bootstrap completion cannot reopen", async () => {
  const databaseUrl = process.env.DATABASE_URL;
  assert.ok(databaseUrl);
  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();
  const nonce = randomUUID();
  const identity = { userId: "", subject: `subject-${nonce}`, email: `${nonce}@example.invalid`, emailVerified: true as const };
  const expiredProof = `expired-${nonce}`;
  const revokedProof = `revoked-${nonce}`;
  try {
    await client.query("BEGIN");
    const user = await client.query<{ id: string }>(
      "insert into \"user\" (name, email, email_verified) values ('Synthetic Invited User', $1, true) returning id",
      [identity.email],
    );
    identity.userId = user.rows[0].id;
    await client.query(
      "insert into account (account_id, provider_id, user_id, updated_at) values ($1, 'google', $2, now())",
      [identity.subject, identity.userId],
    );
    const organization = await client.query<{ id: string }>(
      "insert into organizations (name) values ('Synthetic Expiry Organization') returning id",
    );
    const branch = await client.query<{ id: string }>(
      "insert into branches (organization_id, name, address, timezone) values ($1, 'Synthetic Branch', 'Synthetic Address', 'Asia/Jakarta') returning id",
      [organization.rows[0].id],
    );
    for (const [proof, expiration] of [[expiredProof, "-1 day"], [revokedProof, "1 day"]]) {
      await client.query(
        "insert into invitations (proof_digest, intended_email, role, scope_kind, organization_id, branch_id, invited_by_user_id, expires_at) values ($1, $2, 'staff_pengiriman', 'branch', $3, $4, $5, now() + $6::interval)",
        [createHash("sha256").update(proof).digest("hex"), identity.email, organization.rows[0].id, branch.rows[0].id, identity.userId, expiration],
      );
    }
    await client.query("update invitations set revoked_at = now() where proof_digest = $1", [createHash("sha256").update(revokedProof).digest("hex")]);
    await rejectsSql(client,
      "update bootstrap_control set completed_at = now() where id = 'platform'",
      [], "23514");
    await client.query("SAVEPOINT bootstrap_check");
    await client.query("update bootstrap_control set environment_name = 'test' where id = 'platform'");
    await rejectsSql(client,
      "update bootstrap_control set environment_name = 'other' where id = 'platform'",
      [], "23514");
    const bootstrapProof = createHash("sha256").update(`bootstrap-${nonce}`).digest("hex");
    const bootstrapInvitation = await client.query<{ id: string }>(
      "insert into invitations (proof_digest, intended_email, role, scope_kind, approval_reference, operator_reference, environment_name, expires_at) values ($1, $2, 'platform_super_admin', 'platform', 'synthetic-approval', 'synthetic-operator', 'test', now() + interval '1 day') returning id",
      [bootstrapProof, identity.email],
    );
    await client.query("update bootstrap_control set current_invitation_id = $1 where id = 'platform'", [bootstrapInvitation.rows[0].id]);
    await rejectsSql(client,
      "update bootstrap_control set completed_at = now() where id = 'platform'",
      [], "23514");
    await rejectsSql(client,
      "update invitations set consumed_at = now(), accepted_user_id = $1, provider_subject = 'mismatched-subject' where id = $2",
      [identity.userId, bootstrapInvitation.rows[0].id], "23514");
    await client.query(
      "update invitations set consumed_at = now(), accepted_user_id = $1, provider_subject = $2 where id = $3",
      [identity.userId, identity.subject, bootstrapInvitation.rows[0].id],
    );
    await rejectsSql(client,
      "update bootstrap_control set completed_at = now() where id = 'platform'",
      [], "23514");
    await client.query(
      "insert into platform_grants (user_id, role) values ($1, 'platform_super_admin')",
      [identity.userId],
    );
    await client.query("update bootstrap_control set completed_at = now() where id = 'platform'");
    await rejectsSql(client,
      "update bootstrap_control set completed_at = null where id = 'platform'",
      [], "23514");
    await rejectsSql(client,
      "delete from bootstrap_control where id = 'platform'",
      [], "23514");
    await client.query("ROLLBACK TO SAVEPOINT bootstrap_check");
    await client.query("RELEASE SAVEPOINT bootstrap_check");
    await client.query("COMMIT");
  } finally {
    client.release();
  }
  try {
    await assert.rejects(acceptInvitation(pool, expiredProof, identity), /not eligible/);
    await assert.rejects(acceptInvitation(pool, revokedProof, identity), /not eligible/);
    const grants = await pool.query("select 1 from memberships where user_id = $1", [identity.userId]);
    assert.equal(grants.rowCount, 0);
  } finally {
    await pool.end();
  }
});
