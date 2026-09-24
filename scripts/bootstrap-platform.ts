import { open, realpath, unlink } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { createBootstrapProof, issueBootstrapInvitation } from "../src/modules/identity/issue-bootstrap-invitation.ts";

const outputFlag = process.argv[2];
const outputArgument = process.argv[3];
if (outputFlag !== "--output" || !outputArgument || process.argv.length !== 4 || !isAbsolute(outputArgument)) {
  throw new Error("Pass one absolute --output path outside the repository");
}
const outputPath = resolve(outputArgument);
const repositoryRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const actualParent = await realpath(dirname(outputPath));
const relativePath = relative(repositoryRoot, actualParent);
if (relativePath === "" || (!relativePath.startsWith("..") && !isAbsolute(relativePath))) {
  throw new Error("Bootstrap proof must be outside the repository");
}
const databaseUrl = process.env.BOOTSTRAP_DATABASE_URL;
if (!databaseUrl) throw new Error("BOOTSTRAP_DATABASE_URL is required");
const approval = {
  email: process.env.BOOTSTRAP_INTENDED_EMAIL ?? "",
  approvalReference: process.env.BOOTSTRAP_APPROVAL_REFERENCE ?? "",
  operatorReference: process.env.BOOTSTRAP_OPERATOR_REFERENCE ?? "",
  environmentName: process.env.BOOTSTRAP_ENVIRONMENT_NAME ?? "",
};
const proof = createBootstrapProof();
const handle = await open(outputPath, "wx", 0o600);
try {
  await handle.writeFile(`${proof}\n`);
  await handle.sync();
} finally {
  await handle.close();
}

const pool = new Pool({ connectionString: databaseUrl });
try {
  await issueBootstrapInvitation(pool, approval, proof);
  console.info("Bootstrap invitation issued; the proof is stored in the protected output file");
} catch {
  await unlink(outputPath);
  throw new Error("Bootstrap invitation was not issued; review the approval and current marker state");
} finally {
  await pool.end();
}
