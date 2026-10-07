// node --test src/env.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

// Load src/env.ts in a child process with exactly this environment,
// so the test never reads or changes its own process.env.
function load(env: Record<string, string>) {
  const script = 'const { env } = await import("./src/env.ts"); console.log(env.PORT, env.WORKER_COUNT);';
  return spawnSync(process.execPath, ["--input-type=module", "-e", script], {
    env: { PATH: process.env.PATH, DOCUCONF_TERMINATION_LOG: "/dev/null", ...env },
    encoding: "utf8",
  });
}

test("defaults", () => {
  const r = load({ DATABASE_URL: "postgres://orders@db/orders" });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout.trim(), "8080 4");
});

test("rejects bad values", () => {
  const r = load({ PORT: "70000" });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /PORT \[out_of_range\]/);
  assert.match(r.stderr, /DATABASE_URL \[missing_required\]/);
});
