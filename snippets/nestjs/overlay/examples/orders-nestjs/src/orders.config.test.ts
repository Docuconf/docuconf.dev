// Compiled with the app (npm run build), then: node --test dist/orders.config.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { DocuconfValidationError } from "@docuconf/nestjs";
import { validate } from "./orders.config.js";

// validate is the function ConfigModule.forRoot calls with the environment.
// A test passes its own object, so process.env is never read or changed.
test("defaults", () => {
  const config = validate({ DATABASE_URL: "postgres://orders@db/orders" });
  assert.equal(config.PORT, 8080);
  assert.equal(config.REQUEST_TIMEOUT, 30_000);
});

test("rejects bad values", () => {
  assert.throws(
    () => validate({ PORT: "70000" }),
    (e: unknown) =>
      e instanceof DocuconfValidationError &&
      e.violations.some((v) => v.input === "PORT" && v.code === "out_of_range") &&
      e.violations.some((v) => v.input === "DATABASE_URL" && v.code === "missing_required"),
  );
});
