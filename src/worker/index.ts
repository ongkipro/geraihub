import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const pool = new Pool({ connectionString: databaseUrl });
await pool.query("select 1");
console.info("GeraiHub worker ready; provider dispatch is not configured");

const heartbeat = setInterval(() => console.info("GeraiHub worker heartbeat"), 60_000);
const shutdown = async () => {
  clearInterval(heartbeat);
  await pool.end();
  process.exitCode = 0;
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
