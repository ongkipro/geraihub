import { betterAuth } from "better-auth";

// T-3 schema generation only; T-4 owns the runtime OAuth and session configuration.
export const auth = betterAuth({
  advanced: { database: { generateId: "uuid" } },
});
