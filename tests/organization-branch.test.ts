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

test("organization and branch identity, ownership, and lifecycle stay constrained", async () => {
  const databaseUrl = process.env.DATABASE_URL;
  assert.ok(databaseUrl, "DATABASE_URL is required for integration tests");
  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const first = await client.query<{ id: string; version: string }>(
      "insert into organizations (name) values ($1) returning id, version",
      ["Synthetic Organization A"],
    );
    const second = await client.query<{ id: string }>(
      "insert into organizations (name) values ($1) returning id",
      ["Synthetic Organization B"],
    );
    const organizationA = first.rows[0];
    const organizationB = second.rows[0];
    assert.equal(organizationA.version, "1");

    const inserted = await client.query<{ id: string; organization_id: string; status: string; version: string }>(
      "insert into branches (organization_id, name, address, timezone) values ($1, $2, $3, $4) returning id, organization_id, status, version",
      [organizationA.id, "Synthetic Branch A", "Synthetic Address A", "Asia/Jakarta"],
    );
    const branch = inserted.rows[0];
    assert.equal(branch.organization_id, organizationA.id);
    assert.equal(branch.status, "draft");
    assert.equal(branch.version, "1");

    await rejectsSql(client,
      "insert into branches (organization_id, name, address, timezone) values (gen_random_uuid(), $1, $2, $3)",
      ["Orphan", "Synthetic Address", "Asia/Jakarta"], "23503");
    await rejectsSql(client,
      "insert into branches (organization_id, name, address, timezone, status) values ($1, $2, $3, $4, $5)",
      [organizationA.id, "Invalid", "Synthetic Address", "Asia/Jakarta", "ready"], "23514");
    await rejectsSql(client,
      "insert into branches (organization_id, name, address, timezone) values ($1, $2, $3, $4)",
      [organizationA.id, "Invalid", "Synthetic Address", " "], "23514");
    await rejectsSql(client, "update branches set organization_id = $1 where id = $2", [organizationB.id, branch.id], "23514");
    await rejectsSql(client, "update branches set id = gen_random_uuid() where id = $1", [branch.id], "23514");
    await rejectsSql(client, "delete from branches where id = $1", [branch.id], "23514");
    await rejectsSql(client, "update organizations set id = gen_random_uuid() where id = $1", [organizationA.id], "23514");
    await rejectsSql(client, "delete from organizations where id = $1", [organizationB.id], "23514");

    const updated = await client.query<{ version: string }>(
      "update branches set name = $1 where id = $2 and version = $3 returning version",
      ["Synthetic Branch Renamed", branch.id, "1"],
    );
    assert.equal(updated.rows[0].version, "2");
    const stale = await client.query("update branches set name = $1 where id = $2 and version = $3", ["Stale", branch.id, "1"]);
    assert.equal(stale.rowCount, 0);

    await client.query("update branches set status = 'retired' where id = $1", [branch.id]);
    await rejectsSql(client, "update branches set status = 'draft' where id = $1", [branch.id], "23514");
    const orgUpdated = await client.query<{ version: string }>(
      "update organizations set name = $1 where id = $2 returning version",
      ["Synthetic Organization Renamed", organizationA.id],
    );
    assert.equal(orgUpdated.rows[0].version, "2");
  } finally {
    await client.query("ROLLBACK");
    client.release();
    await pool.end();
  }
});
