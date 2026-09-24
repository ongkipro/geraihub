ALTER TABLE "bootstrap_control" ADD COLUMN "environment_name" text;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION protect_bootstrap_control() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'bootstrap marker cannot be deleted' USING ERRCODE = '23514';
  END IF;
  IF NEW.id IS DISTINCT FROM OLD.id OR (OLD.completed_at IS NOT NULL AND NEW IS DISTINCT FROM OLD)
     OR (OLD.environment_name IS NOT NULL AND NEW.environment_name IS DISTINCT FROM OLD.environment_name) THEN
    RAISE EXCEPTION 'completed bootstrap or environment marker is permanent' USING ERRCODE = '23514';
  END IF;
  IF NEW.environment_name IS NOT NULL AND length(btrim(NEW.environment_name)) = 0 THEN
    RAISE EXCEPTION 'bootstrap environment marker is invalid' USING ERRCODE = '23514';
  END IF;
  IF OLD.completed_at IS NULL AND NEW.completed_at IS NOT NULL AND OLD.current_invitation_id IS DISTINCT FROM NEW.current_invitation_id THEN
    RAISE EXCEPTION 'bootstrap completion must retain invitation identity' USING ERRCODE = '23514';
  END IF;
  IF NEW.completed_at IS NOT NULL AND (NEW.environment_name IS NULL OR NEW.current_invitation_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM invitations i WHERE i.id = NEW.current_invitation_id
      AND i.scope_kind = 'platform' AND i.role = 'platform_super_admin'
      AND i.environment_name = NEW.environment_name
      AND i.consumed_at IS NOT NULL AND i.revoked_at IS NULL
      AND EXISTS (SELECT 1 FROM platform_grants g WHERE g.user_id = i.accepted_user_id
        AND g.role = 'platform_super_admin' AND g.status = 'active')
  )) THEN
    RAISE EXCEPTION 'bootstrap completion requires consumed approval' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION protect_invitation_history() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'invitation history cannot be deleted' USING ERRCODE = '23514';
  END IF;
  IF OLD.consumed_at IS NOT NULL OR OLD.revoked_at IS NOT NULL
     OR NEW.id IS DISTINCT FROM OLD.id OR NEW.proof_digest IS DISTINCT FROM OLD.proof_digest
     OR NEW.intended_email IS DISTINCT FROM OLD.intended_email OR NEW.role IS DISTINCT FROM OLD.role
     OR NEW.scope_kind IS DISTINCT FROM OLD.scope_kind OR NEW.organization_id IS DISTINCT FROM OLD.organization_id
     OR NEW.branch_id IS DISTINCT FROM OLD.branch_id OR NEW.invited_by_user_id IS DISTINCT FROM OLD.invited_by_user_id
     OR NEW.approval_reference IS DISTINCT FROM OLD.approval_reference
     OR NEW.operator_reference IS DISTINCT FROM OLD.operator_reference
     OR NEW.environment_name IS DISTINCT FROM OLD.environment_name
     OR NEW.expires_at IS DISTINCT FROM OLD.expires_at OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'invitation identity and history are immutable' USING ERRCODE = '23514';
  END IF;
  IF NEW.consumed_at IS NOT NULL AND (NEW.consumed_at > now() OR OLD.expires_at <= now() OR NEW.revoked_at IS NOT NULL) THEN
    RAISE EXCEPTION 'invitation is not consumable' USING ERRCODE = '23514';
  END IF;
  IF NEW.consumed_at IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM account a WHERE a.user_id = NEW.accepted_user_id
      AND a.account_id = NEW.provider_subject AND a.provider_id = 'google'
      AND a.issuer = 'https://accounts.google.com'
  ) THEN
    RAISE EXCEPTION 'invitation subject is not linked to user' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
