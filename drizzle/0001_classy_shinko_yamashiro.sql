CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"timezone" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"version" bigint DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "branches_organization_id_id_unique" UNIQUE("organization_id","id"),
	CONSTRAINT "branches_name_length" CHECK (length(btrim("branches"."name")) between 1 and 120),
	CONSTRAINT "branches_address_length" CHECK (length(btrim("branches"."address")) between 1 and 500),
	CONSTRAINT "branches_timezone_length" CHECK (length(btrim("branches"."timezone")) between 1 and 100),
	CONSTRAINT "branches_status_valid" CHECK ("branches"."status" in ('draft', 'active', 'suspended', 'retired')),
	CONSTRAINT "branches_version_positive" CHECK ("branches"."version" >= 1)
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"version" bigint DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_name_length" CHECK (length(btrim("organizations"."name")) between 1 and 120),
	CONSTRAINT "organizations_version_positive" CHECK ("organizations"."version" >= 1)
);
--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE restrict;
--> statement-breakpoint
CREATE FUNCTION protect_organization_identity() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'organization identity cannot be deleted' USING ERRCODE = '23514';
  END IF;
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'organization identity cannot be changed' USING ERRCODE = '23514';
  END IF;
  NEW.version := OLD.version + 1;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER organizations_identity_guard BEFORE UPDATE OR DELETE ON organizations
FOR EACH ROW EXECUTE FUNCTION protect_organization_identity();
--> statement-breakpoint
CREATE FUNCTION protect_branch_identity() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'branch identity cannot be deleted' USING ERRCODE = '23514';
  END IF;
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
    RAISE EXCEPTION 'branch ownership cannot be changed' USING ERRCODE = '23514';
  END IF;
  IF OLD.status = 'retired' AND NEW.status IS DISTINCT FROM 'retired' THEN
    RAISE EXCEPTION 'retired branch cannot be reactivated' USING ERRCODE = '23514';
  END IF;
  NEW.version := OLD.version + 1;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER branches_identity_guard BEFORE UPDATE OR DELETE ON branches
FOR EACH ROW EXECUTE FUNCTION protect_branch_identity();
