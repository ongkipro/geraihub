import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { foundationProbe } from "../src/db/schema.ts";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");
const target = new URL(databaseUrl);
if (!["127.0.0.1", "localhost"].includes(target.hostname)) {
  throw new Error("The synthetic foundation seed runs only against local PostgreSQL");
}

const pool = new Pool({ connectionString: databaseUrl });
try {
  const db = drizzle(pool);
  await db.insert(foundationProbe).values({ marker: "synthetic-foundation" }).onConflictDoNothing();
  console.info("Synthetic foundation seed applied");
} finally {
  await pool.end();
}
