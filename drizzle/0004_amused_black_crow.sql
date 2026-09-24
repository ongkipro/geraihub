DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM invitations WHERE invited_by_user_id IS NULL) THEN
    RAISE EXCEPTION 'review existing bootstrap invitation provenance before migration';
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "operator_reference" text;
--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "environment_name" text;
--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_bootstrap_approval_next" CHECK ("invitations"."invited_by_user_id" is not null or ("invitations"."scope_kind" = 'platform' and "invitations"."role" = 'platform_super_admin' and "invitations"."approval_reference" is not null and length(btrim("invitations"."approval_reference")) > 0 and "invitations"."operator_reference" is not null and length(btrim("invitations"."operator_reference")) > 0 and "invitations"."environment_name" is not null and length(btrim("invitations"."environment_name")) > 0)) NOT VALID;
--> statement-breakpoint
ALTER TABLE "invitations" VALIDATE CONSTRAINT "invitations_bootstrap_approval_next";
--> statement-breakpoint
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_bootstrap_approval";
--> statement-breakpoint
ALTER TABLE "invitations" RENAME CONSTRAINT "invitations_bootstrap_approval_next" TO "invitations_bootstrap_approval";
