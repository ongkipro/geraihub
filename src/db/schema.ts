import { sql } from "drizzle-orm";
import { bigint, check, foreignKey, pgTable, text, timestamp, unique, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { session, user } from "./auth-schema.ts";

// The probe keeps the foundation migration independently verifiable.
export const foundationProbe = pgTable("foundation_probe", {
  id: uuid("id").defaultRandom().primaryKey(),
  marker: text("marker").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  version: bigint("version", { mode: "bigint" }).default(sql`1`).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  check("organizations_name_length", sql`length(btrim(${table.name})) between 1 and 120`),
  check("organizations_version_positive", sql`${table.version} >= 1`),
]);

export const branches = pgTable("branches", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, {
    onDelete: "restrict",
    onUpdate: "restrict",
  }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  timezone: text("timezone").notNull(),
  status: text("status").default("draft").notNull(),
  version: bigint("version", { mode: "bigint" }).default(sql`1`).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique("branches_organization_id_id_unique").on(table.organizationId, table.id),
  check("branches_name_length", sql`length(btrim(${table.name})) between 1 and 120`),
  check("branches_address_length", sql`length(btrim(${table.address})) between 1 and 500`),
  check("branches_timezone_length", sql`length(btrim(${table.timezone})) between 1 and 100`),
  check("branches_status_valid", sql`${table.status} in ('draft', 'active', 'suspended', 'retired')`),
  check("branches_version_positive", sql`${table.version} >= 1`),
]);

export const sessionBranchContexts = pgTable("session_branch_contexts", {
  sessionId: uuid("session_id").primaryKey(),
  userId: uuid("user_id").notNull(),
  organizationId: uuid("organization_id").notNull(),
  branchId: uuid("branch_id").notNull(),
  version: bigint("version", { mode: "bigint" }).default(sql`1`).notNull(),
  selectedAt: timestamp("selected_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  foreignKey({
    name: "session_context_session_user_fk",
    columns: [table.sessionId, table.userId],
    foreignColumns: [session.id, session.userId],
  }).onDelete("cascade").onUpdate("restrict"),
  foreignKey({
    name: "session_context_branch_organization_fk",
    columns: [table.branchId, table.organizationId],
    foreignColumns: [branches.id, branches.organizationId],
  }).onDelete("restrict").onUpdate("restrict"),
  check("session_context_version_positive", sql`${table.version} >= 1`),
]);

export const invitations = pgTable("invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  proofDigest: text("proof_digest").notNull().unique(),
  intendedEmail: text("intended_email").notNull(),
  role: text("role").notNull(),
  scopeKind: text("scope_kind").notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "restrict" }),
  branchId: uuid("branch_id"),
  invitedByUserId: uuid("invited_by_user_id").references(() => user.id, { onDelete: "restrict" }),
  approvalReference: text("approval_reference"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  acceptedUserId: uuid("accepted_user_id").references(() => user.id, { onDelete: "restrict" }),
  providerSubject: text("provider_subject"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  foreignKey({
    name: "invitations_branch_organization_fk",
    columns: [table.branchId, table.organizationId],
    foreignColumns: [branches.id, branches.organizationId],
  }).onDelete("restrict").onUpdate("restrict"),
  check("invitations_digest_format", sql`${table.proofDigest} ~ '^[0-9a-f]{64}$'`),
  check("invitations_email_normalized", sql`${table.intendedEmail} = lower(btrim(${table.intendedEmail})) and length(${table.intendedEmail}) between 3 and 254 and ${table.intendedEmail} like '%@%'`),
  check("invitations_scope_role", sql`(
    (${table.scopeKind} = 'platform' and ${table.role} in ('platform_super_admin', 'platform_support') and ${table.organizationId} is null and ${table.branchId} is null)
    or (${table.scopeKind} = 'organization' and ${table.role} = 'owner' and ${table.organizationId} is not null and ${table.branchId} is null)
    or (${table.scopeKind} = 'branch' and ${table.role} in ('admin', 'staff_pengiriman', 'finance_viewer') and ${table.organizationId} is not null and ${table.branchId} is not null)
  )`),
  check("invitations_result_complete", sql`(${table.consumedAt} is null and ${table.acceptedUserId} is null and ${table.providerSubject} is null) or (${table.consumedAt} is not null and ${table.acceptedUserId} is not null and ${table.providerSubject} is not null)`),
  check("invitations_not_revoked_after_consumption", sql`${table.revokedAt} is null or ${table.consumedAt} is null`),
  check("invitations_bootstrap_approval", sql`${table.invitedByUserId} is not null or (${table.scopeKind} = 'platform' and ${table.role} = 'platform_super_admin' and ${table.approvalReference} is not null and length(btrim(${table.approvalReference})) > 0)`),
  uniqueIndex("invitations_one_pending_bootstrap").on(table.role).where(sql`${table.role} = 'platform_super_admin' and ${table.invitedByUserId} is null and ${table.consumedAt} is null and ${table.revokedAt} is null`),
]);

export const memberships = pgTable("memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "restrict" }),
  branchId: uuid("branch_id"),
  role: text("role").notNull(),
  status: text("status").default("active").notNull(),
  version: bigint("version", { mode: "bigint" }).default(sql`1`).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
}, (table) => [
  foreignKey({
    name: "memberships_branch_organization_fk",
    columns: [table.branchId, table.organizationId],
    foreignColumns: [branches.id, branches.organizationId],
  }).onDelete("restrict").onUpdate("restrict"),
  check("memberships_role_scope", sql`(${table.role} = 'owner' and ${table.branchId} is null) or (${table.role} in ('admin', 'staff_pengiriman', 'finance_viewer') and ${table.branchId} is not null)`),
  check("memberships_status_valid", sql`(${table.status} = 'active' and ${table.revokedAt} is null) or (${table.status} = 'revoked' and ${table.revokedAt} is not null)`),
  check("memberships_version_positive", sql`${table.version} >= 1`),
  uniqueIndex("memberships_one_active_org_role").on(table.userId, table.organizationId, table.role).where(sql`${table.status} = 'active' and ${table.branchId} is null`),
  uniqueIndex("memberships_one_active_branch_role").on(table.userId, table.organizationId, table.branchId, table.role).where(sql`${table.status} = 'active' and ${table.branchId} is not null`),
]);

export const platformGrants = pgTable("platform_grants", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  role: text("role").notNull(),
  status: text("status").default("active").notNull(),
  version: bigint("version", { mode: "bigint" }).default(sql`1`).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
}, (table) => [
  check("platform_grants_role_valid", sql`${table.role} in ('platform_super_admin', 'platform_support')`),
  check("platform_grants_status_valid", sql`(${table.status} = 'active' and ${table.revokedAt} is null) or (${table.status} = 'revoked' and ${table.revokedAt} is not null)`),
  check("platform_grants_version_positive", sql`${table.version} >= 1`),
  uniqueIndex("platform_grants_one_active_role").on(table.userId, table.role).where(sql`${table.status} = 'active'`),
]);

export const bootstrapControl = pgTable("bootstrap_control", {
  id: text("id").primaryKey(),
  currentInvitationId: uuid("current_invitation_id").references(() => invitations.id, { onDelete: "restrict" }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => [
  check("bootstrap_control_singleton", sql`${table.id} = 'platform'`),
]);
