import assert from "node:assert/strict";
import test from "node:test";
import { Pool } from "pg";

test("foundation migration and synthetic seed are readable", async () => {
  const databaseUrl = process.env.DATABASE_URL;
  assert.ok(databaseUrl, "DATABASE_URL is required for integration tests");
  const pool = new Pool({ connectionString: databaseUrl });
  try {
    const result = await pool.query<{ marker: string }>(
      "select marker from foundation_probe where marker = $1",
      ["synthetic-foundation"],
    );
    assert.deepEqual(result.rows, [{ marker: "synthetic-foundation" }]);
  } finally {
    await pool.end();
  }
});
