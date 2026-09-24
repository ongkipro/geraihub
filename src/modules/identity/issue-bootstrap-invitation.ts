import { createHash, randomBytes } from "node:crypto";
import { Pool } from "pg";

export type BootstrapApproval = {
  email: string;
  approvalReference: string;
  operatorReference: string;
  environmentName: string;
};

export function createBootstrapProof() {
  return randomBytes(32).toString("base64url");
}

export async function issueBootstrapInvitation(pool: Pool, approval: BootstrapApproval, proof: string) {
  const email = approval.email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254
    || !approval.approvalReference.trim() || !approval.operatorReference.trim()
    || !approval.environmentName.trim() || !/^[A-Za-z0-9_-]{43}$/.test(proof)) {
    throw new Error("Bootstrap approval is invalid");
  }
  const digest = createHash("sha256").update(proof).digest("hex");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const marker = await client.query<{ environment_name: string | null; current_invitation_id: string | null; completed_at: Date | null }>(
      "select environment_name, current_invitation_id, completed_at from bootstrap_control where id = 'platform' for update",
    );
    if (!marker.rows[0] || marker.rows[0].completed_at
      || (marker.rows[0].environment_name !== null && marker.rows[0].environment_name !== approval.environmentName.trim())) {
      throw new Error("Bootstrap unavailable");
    }
    if (marker.rows[0].environment_name === null) {
      await client.query("update bootstrap_control set environment_name = $1 where id = 'platform'", [approval.environmentName.trim()]);
    }
    if (marker.rows[0].current_invitation_id) {
      const old = await client.query<{ expires_at: Date; consumed_at: Date | null; revoked_at: Date | null }>(
        "select expires_at, consumed_at, revoked_at from invitations where id = $1",
        [marker.rows[0].current_invitation_id],
      );
      if (!old.rows[0] || old.rows[0].consumed_at) throw new Error("Bootstrap unavailable");
      if (!old.rows[0].revoked_at) {
        if (old.rows[0].expires_at > new Date()) throw new Error("Bootstrap invitation remains active");
        await client.query("update invitations set revoked_at = now() where id = $1", [marker.rows[0].current_invitation_id]);
      }
    }
    const invitation = await client.query<{ id: string }>(
      "insert into invitations (proof_digest, intended_email, role, scope_kind, approval_reference, operator_reference, environment_name, expires_at) values ($1, $2, 'platform_super_admin', 'platform', $3, $4, $5, now() + interval '24 hours') returning id",
      [digest, email, approval.approvalReference.trim(), approval.operatorReference.trim(), approval.environmentName.trim()],
    );
    await client.query("update bootstrap_control set current_invitation_id = $1 where id = 'platform'", [invitation.rows[0].id]);
    await client.query("COMMIT");
    return invitation.rows[0].id;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
