import assert from "node:assert/strict";
import test from "node:test";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

test("installed Better Auth and Drizzle adapter exports remain available", () => {
  assert.equal(typeof betterAuth, "function");
  assert.equal(typeof drizzleAdapter, "function");
});
