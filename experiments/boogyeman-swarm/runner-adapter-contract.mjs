/**
 * Runtime adapter contract gate. This module never executes generated source.
 * A passing assessment means metadata meets the declared contract, not that the
 * sandbox implementation has been security-audited or runtime-verified.
 */
export function assessRunnerAdapter(adapter) {
  if (!adapter || typeof adapter !== "object") {
    return { status: "BLOCKED", ready: false, missing: ["runner adapter is not configured"] };
  }
  const missing = [];
  if (typeof adapter.id !== "string" || !adapter.id.trim()) missing.push("adapter id");
  if (typeof adapter.version !== "string" || !adapter.version.trim()) missing.push("adapter version");
  if (adapter.isolated !== true) missing.push("isolation");
  if (!new Set(["denied", "allowlisted"]).has(adapter.networkDefault)) missing.push("network deny/allowlist policy");
  if (adapter.ephemeralWorkspace !== true) missing.push("ephemeral workspace cleanup");
  for (const capability of ["supportsTimeout", "supportsMemoryLimit", "supportsCpuLimit", "supportsOutputLimit", "supportsCancellation"]) {
    if (adapter[capability] !== true) missing.push(capability.replace(/^supports/, "").replace(/([A-Z])/g, " $1").toLowerCase());
  }
  return { status: missing.length ? "BLOCKED" : "READY_FOR_REVIEW", ready: missing.length === 0, missing };
}
