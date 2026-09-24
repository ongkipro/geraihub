import { createHash } from "node:crypto";
import { Pool } from "pg";

export type VerifiedIdentity = {
  userId: string;
  subject: string;
  email: string;
  emailVerified: true;
};

type Invitation = {
  id: string;
  intended_email: string;
  role: string;
  invited_by_user_id: string | null;
  scope_kind: "platform" | "organization" | "branch";
  organization_id: string | null;
  branch_id: string | null;
  expires_at: Date;
  consumed_at: Date | null;
  revoked_at: Date | null;
};

export async function acceptInvitation(pool: Pool, proof: string, identity: VerifiedIdentity) {
  if (!identity.emailVerified || !identity.subject || !identity.userId || !proof) {
    throw new Error("Invitation not eligible");
  }
  const digest = createHash("sha256").update(proof).digest("hex");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const candidate = await client.query<Pick<Invitation, "id" | "scope_kind" | "role" | "invited_by_user_id">>(
      "select id, scope_kind, role, invited_by_user_id from invitations where proof_digest = $1",
      [digest],
    );
    const bootstrapInvitation = candidate.rows[0]?.scope_kind === "platform"
      && candidate.rows[0]?.role === "platform_super_admin" && candidate.rows[0]?.invited_by_user_id === null;
    if (bootstrapInvitation) {
      // Match the operator's marker-then-invitation lock order during replacement.
      const marker = await client.query<{ current_invitation_id: string | null; completed_at: Date | null }>(
        "select current_invitation_id, completed_at from bootstrap_control where id = 'platform' for update",
      );
      if (!marker.rows[0] || marker.rows[0].completed_at || marker.rows[0].current_invitation_id !== candidate.rows[0].id) {
        throw new Error("Invitation not eligible");
      }
    }
    const invitationResult = await client.query<Invitation>(
      "select id, intended_email, role, scope_kind, invited_by_user_id, organization_id, branch_id, expires_at, consumed_at, revoked_at from invitations where proof_digest = $1 for update",
      [digest],
    );
    const invitation = invitationResult.rows[0];
    if (!invitation || invitation.consumed_at || invitation.revoked_at || invitation.expires_at <= new Date()
      || invitation.intended_email !== identity.email.trim().toLowerCase()) {
      throw new Error("Invitation not eligible");
    }
    const account = await client.query(
      "select 1 from account where user_id = $1 and provider_id = 'google' and issuer = 'https://accounts.google.com' and account_id = $2",
      [identity.userId, identity.subject],
    );
    if (account.rowCount !== 1) throw new Error("Invitation not eligible");

    if (invitation.scope_kind === "platform") {
      if (invitation.role === "platform_super_admin" && invitation.invited_by_user_id === null && !bootstrapInvitation) {
        throw new Error("Invitation not eligible");
      }
      await client.query("insert into platform_grants (user_id, role) values ($1, $2)", [identity.userId, invitation.role]);
    } else {
      await client.query(
        "insert into memberships (user_id, organization_id, branch_id, role) values ($1, $2, $3, $4)",
        [identity.userId, invitation.organization_id, invitation.branch_id, invitation.role],
      );
    }
    await client.query(
      "update invitations set consumed_at = now(), accepted_user_id = $1, provider_subject = $2 where id = $3",
      [identity.userId, identity.subject, invitation.id],
    );
    if (invitation.scope_kind === "platform" && invitation.role === "platform_super_admin") {
      await client.query("update bootstrap_control set completed_at = now() where id = 'platform'");
    }
    await client.query("COMMIT");
    return { scopeKind: invitation.scope_kind, role: invitation.role, organizationId: invitation.organization_id, branchId: invitation.branch_id };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
