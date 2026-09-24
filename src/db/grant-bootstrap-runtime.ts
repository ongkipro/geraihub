import { Pool } from "pg";

export async function grantBootstrapRuntimePrivileges(pool: Pool, roleName: string) {
  if (!/^[a-z][a-z0-9_]{2,62}$/.test(roleName)) throw new Error("Invalid runtime database role");
  const role = `"${roleName}"`;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`GRANT USAGE ON SCHEMA public TO ${role}`);
    await client.query(`GRANT SELECT ON invitations, bootstrap_control TO ${role}`);
    await client.query(`GRANT INSERT (proof_digest, intended_email, role, scope_kind, organization_id, branch_id, invited_by_user_id, expires_at) ON invitations TO ${role}`);
    await client.query(`GRANT UPDATE (completed_at) ON bootstrap_control TO ${role}`);
    const exposure = await client.query<{ can_issue: boolean; can_retarget: boolean; can_relabel: boolean }>(
      `select has_column_privilege($1, 'public.invitations', 'approval_reference', 'INSERT') as can_issue,
        has_column_privilege($1, 'public.bootstrap_control', 'current_invitation_id', 'UPDATE') as can_retarget,
        has_column_privilege($1, 'public.bootstrap_control', 'environment_name', 'UPDATE') as can_relabel`,
      [roleName],
    );
    if (!exposure.rows[0] || Object.values(exposure.rows[0]).some(Boolean)) {
      throw new Error("Runtime database role has bootstrap operator privileges");
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
