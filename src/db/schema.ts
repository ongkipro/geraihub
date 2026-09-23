import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// T-1 exercises migrations only; business tables belong to T-3 and T-7.
export const foundationProbe = pgTable("foundation_probe", {
  id: uuid("id").defaultRandom().primaryKey(),
  marker: text("marker").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
