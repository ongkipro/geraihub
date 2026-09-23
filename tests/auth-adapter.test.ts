import assert from "node:assert/strict";
import test from "node:test";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as authSchema from "../src/db/auth-schema.ts";

test("installed Better Auth Drizzle adapter reads and writes the constrained identity schema", async () => {
  const databaseUrl = process.env.DATABASE_URL;
  assert.ok(databaseUrl, "DATABASE_URL is required for integration tests");
  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const db = drizzle(client, { schema: authSchema });
    const adapter = drizzleAdapter(db, { provider: "pg", schema: authSchema })({
      advanced: { database: { generateId: "uuid" } },
    });
    const user = await adapter.create<{ name: string; email: string; emailVerified: boolean }, { id: string }>({
      model: "user",
      data: { name: "Synthetic Adapter User", email: "adapter@example.invalid", emailVerified: true },
    });
    assert.match(user.id, /^[0-9a-f-]{36}$/);
    const found = await adapter.findOne<{ id: string; email: string }>({
      model: "user",
      where: [{ field: "id", value: user.id }],
    });
    assert.equal(found?.email, "adapter@example.invalid");

    await adapter.create({
      model: "account",
      data: {
        accountId: "synthetic-adapter-subject",
        providerId: "google",
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    const link = await client.query<{ issuer: string; access_token: string | null }>(
      "select issuer, access_token from account where account_id = $1",
      ["synthetic-adapter-subject"],
    );
    assert.deepEqual(link.rows, [{ issuer: "https://accounts.google.com", access_token: null }]);
  } finally {
    await client.query("ROLLBACK");
    client.release();
    await pool.end();
  }
});
