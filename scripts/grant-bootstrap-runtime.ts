import { Pool } from "pg";
import { grantBootstrapRuntimePrivileges } from "../src/db/grant-bootstrap-runtime.ts";

const databaseUrl = process.env.BOOTSTRAP_DATABASE_URL;
const roleName = process.env.GERAIHUB_RUNTIME_DB_ROLE;
if (!databaseUrl || !roleName) throw new Error("Operator database URL and runtime role are required");

const pool = new Pool({ connectionString: databaseUrl });
try {
  await grantBootstrapRuntimePrivileges(pool, roleName);
  console.info("Bootstrap runtime privileges configured for the named database role");
} finally {
  await pool.end();
}
