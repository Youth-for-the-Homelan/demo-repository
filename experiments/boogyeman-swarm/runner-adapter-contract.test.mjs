import test from "node:test";
import assert from "node:assert/strict";
import { assessRunnerAdapter } from "./runner-adapter-contract.mjs";

test("missing runner adapter is blocked", () => {
  assert.equal(assessRunnerAdapter(null).status, "BLOCKED");
});

test("adapter missing isolation, limits, cleanup or safe networking is blocked", () => {
  const result = assessRunnerAdapter({ id: "demo", version: "0.1", isolated: false, networkDefault: "open", ephemeralWorkspace: false, supportsTimeout: true, supportsMemoryLimit: false, supportsCpuLimit: false, supportsOutputLimit: true, supportsCancellation: false });
  assert.equal(result.ready, false);
  assert.ok(result.missing.includes("isolation"));
  assert.ok(result.missing.includes("network deny/allowlist policy"));
  assert.ok(result.missing.includes("memory limit"));
});

test("complete metadata contract is only ready for review, not proof of execution safety", () => {
  const result = assessRunnerAdapter({ id: "isolated-runner", version: "1.0", isolated: true, networkDefault: "denied", ephemeralWorkspace: true, supportsTimeout: true, supportsMemoryLimit: true, supportsCpuLimit: true, supportsOutputLimit: true, supportsCancellation: true });
  assert.deepEqual(result, { status: "READY_FOR_REVIEW", ready: true, missing: [] });
});
