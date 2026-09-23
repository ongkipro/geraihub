import assert from "node:assert/strict";
import test from "node:test";
import { Pool, type PoolClient } from "pg";

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

test("provider subject and server session context retain their identity and scope", async () => {
  const databaseUrl = process.env.DATABASE_URL;
  assert.ok(databaseUrl, "DATABASE_URL is required for integration tests");
  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const users = await client.query<{ id: string }>(
      "insert into \"user\" (name, email, email_verified) values ($1, $2, true), ($3, $4, true) returning id",
      ["Synthetic Operator A", "operator-a@example.invalid", "Synthetic Operator B", "operator-b@example.invalid"],
    );
    const [userA, userB] = users.rows;
    const session = await client.query<{ id: string }>(
      "insert into \"session\" (expires_at, token, updated_at, user_id) values (now() + interval '1 day', $1, now(), $2) returning id",
      ["synthetic-session-a", userA.id],
    );
    const sessionId = session.rows[0].id;
    const organizations = await client.query<{ id: string }>(
      "insert into organizations (name) values ($1), ($2) returning id",
      ["Synthetic Organization A", "Synthetic Organization B"],
    );
    const [organizationA, organizationB] = organizations.rows;
    const branches = await client.query<{ id: string; organization_id: string }>(
      "insert into branches (organization_id, name, address, timezone) values ($1, $2, $3, $4), ($5, $6, $7, $8) returning id, organization_id",
      [organizationA.id, "Synthetic Branch A", "Synthetic Address A", "Asia/Jakarta",
        organizationB.id, "Synthetic Branch B", "Synthetic Address B", "Asia/Jakarta"],
    );
    const branchA = branches.rows.find((branch) => branch.organization_id === organizationA.id);
    assert.ok(branchA);

    await client.query(
      "insert into account (account_id, provider_id, user_id, updated_at) values ($1, 'google', $2, now())",
      ["synthetic-google-subject", userA.id],
    );
    await rejectsSql(client,
      "insert into account (account_id, provider_id, user_id, updated_at) values ($1, 'google', $2, now())",
      ["synthetic-google-subject", userB.id], "23505");
    await rejectsSql(client,
      "insert into account (account_id, provider_id, user_id, access_token, updated_at) values ($1, 'google', $2, $3, now())",
      ["different-subject", userB.id, "synthetic-disallowed-value"], "23514");
    await rejectsSql(client,
      "insert into account (account_id, provider_id, user_id, updated_at) values ($1, 'other', $2, now())",
      ["other-subject", userB.id], "23514");
    await rejectsSql(client,
      "update account set user_id = $1 where account_id = $2",
      [userB.id, "synthetic-google-subject"], "23514");
    await rejectsSql(client,
      "delete from account where account_id = $1",
      ["synthetic-google-subject"], "23514");
    await rejectsSql(client,
      "update \"session\" set user_id = $1 where id = $2",
      [userB.id, sessionId], "23514");

    await rejectsSql(client,
      "insert into session_branch_contexts (session_id, user_id, organization_id, branch_id) values ($1, $2, $3, $4)",
      [sessionId, userB.id, organizationA.id, branchA.id], "23503");
    await rejectsSql(client,
      "insert into session_branch_contexts (session_id, user_id, organization_id, branch_id) values ($1, $2, $3, $4)",
      [sessionId, userA.id, organizationB.id, branchA.id], "23503");
    const context = await client.query<{ version: string }>(
      "insert into session_branch_contexts (session_id, user_id, organization_id, branch_id) values ($1, $2, $3, $4) returning version",
      [sessionId, userA.id, organizationA.id, branchA.id],
    );
    assert.equal(context.rows[0].version, "1");
    await rejectsSql(client,
      "insert into session_branch_contexts (session_id, user_id, organization_id, branch_id) values ($1, $2, $3, $4)",
      [sessionId, userA.id, organizationA.id, branchA.id], "23505");
    await rejectsSql(client,
      "update session_branch_contexts set user_id = $1 where session_id = $2",
      [userB.id, sessionId], "23514");
    const updated = await client.query<{ version: string }>(
      "update session_branch_contexts set branch_id = $1 where session_id = $2 and version = $3 returning version",
      [branchA.id, sessionId, "1"],
    );
    assert.equal(updated.rows[0].version, "2");
    const stale = await client.query(
      "update session_branch_contexts set branch_id = $1 where session_id = $2 and version = $3",
      [branchA.id, sessionId, "1"],
    );
    assert.equal(stale.rowCount, 0);

    await client.query("delete from \"session\" where id = $1", [sessionId]);
    const afterRevocation = await client.query("select 1 from session_branch_contexts where session_id = $1", [sessionId]);
    assert.equal(afterRevocation.rowCount, 0);
  } finally {
    await client.query("ROLLBACK");
    client.release();
    await pool.end();
  }
});
