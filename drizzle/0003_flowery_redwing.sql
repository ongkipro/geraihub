CREATE TABLE "bootstrap_control" (
	"id" text PRIMARY KEY NOT NULL,
	"current_invitation_id" uuid,
	"completed_at" timestamp with time zone,
	CONSTRAINT "bootstrap_control_singleton" CHECK ("bootstrap_control"."id" = 'platform')
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proof_digest" text NOT NULL,
	"intended_email" text NOT NULL,
	"role" text NOT NULL,
	"scope_kind" text NOT NULL,
	"organization_id" uuid,
	"branch_id" uuid,
	"invited_by_user_id" uuid,
	"approval_reference" text,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"accepted_user_id" uuid,
	"provider_subject" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_proof_digest_unique" UNIQUE("proof_digest"),
	CONSTRAINT "invitations_digest_format" CHECK ("invitations"."proof_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "invitations_email_normalized" CHECK ("invitations"."intended_email" = lower(btrim("invitations"."intended_email")) and length("invitations"."intended_email") between 3 and 254 and "invitations"."intended_email" like '%@%'),
	CONSTRAINT "invitations_scope_role" CHECK ((
    ("invitations"."scope_kind" = 'platform' and "invitations"."role" in ('platform_super_admin', 'platform_support') and "invitations"."organization_id" is null and "invitations"."branch_id" is null)
    or ("invitations"."scope_kind" = 'organization' and "invitations"."role" = 'owner' and "invitations"."organization_id" is not null and "invitations"."branch_id" is null)
    or ("invitations"."scope_kind" = 'branch' and "invitations"."role" in ('admin', 'staff_pengiriman', 'finance_viewer') and "invitations"."organization_id" is not null and "invitations"."branch_id" is not null)
  )),
	CONSTRAINT "invitations_result_complete" CHECK (("invitations"."consumed_at" is null and "invitations"."accepted_user_id" is null and "invitations"."provider_subject" is null) or ("invitations"."consumed_at" is not null and "invitations"."accepted_user_id" is not null and "invitations"."provider_subject" is not null)),
	CONSTRAINT "invitations_not_revoked_after_consumption" CHECK ("invitations"."revoked_at" is null or "invitations"."consumed_at" is null),
	CONSTRAINT "invitations_bootstrap_approval" CHECK ("invitations"."invited_by_user_id" is not null or ("invitations"."scope_kind" = 'platform' and "invitations"."role" = 'platform_super_admin' and "invitations"."approval_reference" is not null and length(btrim("invitations"."approval_reference")) > 0))
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"branch_id" uuid,
	"role" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"version" bigint DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "memberships_role_scope" CHECK (("memberships"."role" = 'owner' and "memberships"."branch_id" is null) or ("memberships"."role" in ('admin', 'staff_pengiriman', 'finance_viewer') and "memberships"."branch_id" is not null)),
	CONSTRAINT "memberships_status_valid" CHECK (("memberships"."status" = 'active' and "memberships"."revoked_at" is null) or ("memberships"."status" = 'revoked' and "memberships"."revoked_at" is not null)),
	CONSTRAINT "memberships_version_positive" CHECK ("memberships"."version" >= 1)
);
--> statement-breakpoint
CREATE TABLE "platform_grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"version" bigint DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "platform_grants_role_valid" CHECK ("platform_grants"."role" in ('platform_super_admin', 'platform_support')),
	CONSTRAINT "platform_grants_status_valid" CHECK (("platform_grants"."status" = 'active' and "platform_grants"."revoked_at" is null) or ("platform_grants"."status" = 'revoked' and "platform_grants"."revoked_at" is not null)),
	CONSTRAINT "platform_grants_version_positive" CHECK ("platform_grants"."version" >= 1)
);
--> statement-breakpoint
ALTER TABLE "bootstrap_control" ADD CONSTRAINT "bootstrap_control_current_invitation_id_invitations_id_fk" FOREIGN KEY ("current_invitation_id") REFERENCES "public"."invitations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_user_id_user_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_accepted_user_id_user_id_fk" FOREIGN KEY ("accepted_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_branch_organization_fk" FOREIGN KEY ("branch_id","organization_id") REFERENCES "public"."branches"("id","organization_id") ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_branch_organization_fk" FOREIGN KEY ("branch_id","organization_id") REFERENCES "public"."branches"("id","organization_id") ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "platform_grants" ADD CONSTRAINT "platform_grants_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "invitations_one_pending_bootstrap" ON "invitations" USING btree ("role") WHERE "invitations"."role" = 'platform_super_admin' and "invitations"."invited_by_user_id" is null and "invitations"."consumed_at" is null and "invitations"."revoked_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "memberships_one_active_org_role" ON "memberships" USING btree ("user_id","organization_id","role") WHERE "memberships"."status" = 'active' and "memberships"."branch_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "memberships_one_active_branch_role" ON "memberships" USING btree ("user_id","organization_id","branch_id","role") WHERE "memberships"."status" = 'active' and "memberships"."branch_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "platform_grants_one_active_role" ON "platform_grants" USING btree ("user_id","role") WHERE "platform_grants"."status" = 'active';
--> statement-breakpoint
INSERT INTO bootstrap_control (id) VALUES ('platform');
--> statement-breakpoint
CREATE FUNCTION protect_bootstrap_control() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'bootstrap marker cannot be deleted' USING ERRCODE = '23514';
  END IF;
  IF NEW.id IS DISTINCT FROM OLD.id OR (OLD.completed_at IS NOT NULL AND NEW IS DISTINCT FROM OLD) THEN
    RAISE EXCEPTION 'completed bootstrap is permanent' USING ERRCODE = '23514';
  END IF;
  IF OLD.completed_at IS NULL AND NEW.completed_at IS NOT NULL AND OLD.current_invitation_id IS DISTINCT FROM NEW.current_invitation_id THEN
    RAISE EXCEPTION 'bootstrap completion must retain invitation identity' USING ERRCODE = '23514';
  END IF;
  IF NEW.completed_at IS NOT NULL AND (NEW.current_invitation_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM invitations i WHERE i.id = NEW.current_invitation_id
      AND i.scope_kind = 'platform' AND i.role = 'platform_super_admin'
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
CREATE TRIGGER bootstrap_control_guard BEFORE UPDATE OR DELETE ON bootstrap_control
FOR EACH ROW EXECUTE FUNCTION protect_bootstrap_control();
--> statement-breakpoint
CREATE FUNCTION protect_invitation_history() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'invitation history cannot be deleted' USING ERRCODE = '23514';
  END IF;
  IF OLD.consumed_at IS NOT NULL OR OLD.revoked_at IS NOT NULL
     OR NEW.id IS DISTINCT FROM OLD.id OR NEW.proof_digest IS DISTINCT FROM OLD.proof_digest
     OR NEW.intended_email IS DISTINCT FROM OLD.intended_email OR NEW.role IS DISTINCT FROM OLD.role
     OR NEW.scope_kind IS DISTINCT FROM OLD.scope_kind OR NEW.organization_id IS DISTINCT FROM OLD.organization_id
     OR NEW.branch_id IS DISTINCT FROM OLD.branch_id OR NEW.invited_by_user_id IS DISTINCT FROM OLD.invited_by_user_id
     OR NEW.approval_reference IS DISTINCT FROM OLD.approval_reference OR NEW.expires_at IS DISTINCT FROM OLD.expires_at
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
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
--> statement-breakpoint
CREATE TRIGGER invitations_history_guard BEFORE UPDATE OR DELETE ON invitations
FOR EACH ROW EXECUTE FUNCTION protect_invitation_history();
--> statement-breakpoint
CREATE FUNCTION protect_grant_lifecycle() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'grant history cannot be deleted' USING ERRCODE = '23514';
  END IF;
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.role IS DISTINCT FROM OLD.role OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR OLD.status = 'revoked' OR NEW.status IS DISTINCT FROM 'revoked' OR NEW.revoked_at IS NULL THEN
    RAISE EXCEPTION 'grant ownership and revocation are immutable' USING ERRCODE = '23514';
  END IF;
  IF TG_TABLE_NAME = 'memberships' THEN
    IF NEW.organization_id IS DISTINCT FROM OLD.organization_id OR NEW.branch_id IS DISTINCT FROM OLD.branch_id THEN
      RAISE EXCEPTION 'membership scope cannot be changed' USING ERRCODE = '23514';
    END IF;
  END IF;
  NEW.version := OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER memberships_lifecycle_guard BEFORE UPDATE OR DELETE ON memberships
FOR EACH ROW EXECUTE FUNCTION protect_grant_lifecycle();
--> statement-breakpoint
CREATE TRIGGER platform_grants_lifecycle_guard BEFORE UPDATE OR DELETE ON platform_grants
FOR EACH ROW EXECUTE FUNCTION protect_grant_lifecycle();
