import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_BOTS,
  MAX_ATTEMPTS,
  MAX_BOTS,
  createCandidateBatch,
  runSwarm,
  spawnChildBot,
  validateCandidate,
} from "./engine.mjs";

test("candidate generation is bounded and reproducible for a fixed seed", () => {
  const bot = DEFAULT_BOTS.find((entry) => entry.role === "builder");
  const a = createCandidateBatch("Create a task queue", bot, 123);
  const b = createCandidateBatch("Create a task queue", bot, 123);
  assert.ok(a.length > 0 && a.length <= 8);
  assert.deepEqual(a.map((candidate) => candidate.source), b.map((candidate) => candidate.source));
});

test("static validator accepts safe templates and rejects deliberately invalid candidates", () => {
  const candidates = createCandidateBatch("Create a queue", DEFAULT_BOTS.find((entry) => entry.role === "builder"), 10);
  const checked = candidates.map(validateCandidate);
  assert.ok(checked.some((candidate) => candidate.passed));
  assert.ok(checked.some((candidate) => !candidate.passed));
  assert.ok(checked.every((candidate) => candidate.checks.length === 5));
});

test("every candidate remains non-executed even after static acceptance", async () => {
  const result = await runSwarm({ goal: "Create a project", runId: 200 });
  assert.equal(result.status, "CANDIDATE_ACCEPTED_STATIC_ONLY");
  assert.equal(result.runtimeExecution, "NOT_EXECUTED");
  assert.ok(result.winner.passed);
  assert.ok(result.project.files.some((file) => file.path === result.winner.name));
  assert.ok(result.project.files.some((file) => file.path === "verification-report.json"));
});

test("a passing worker creates a bounded child agent and project artifact", async () => {
  const result = await runSwarm({ goal: "Build worker pipeline", runId: 201 });
  assert.ok(result.childBot);
  assert.equal(result.childBot.enabled, true);
  assert.equal(result.childBot.generation, result.winner.generation + 1);
  assert.ok(result.childBot.codeBudget >= 3 && result.childBot.codeBudget <= 7);
  assert.ok(result.bots.length <= MAX_BOTS);
});

test("the engine reports blocked when no builder-capable bot is enabled", async () => {
  const bots = DEFAULT_BOTS.map((bot) => ({ ...bot, enabled: ["spider", "ant"].includes(bot.role) }));
  const result = await runSwarm({ goal: "Make a project", bots, runId: 202 });
  assert.equal(result.status, "BLOCKED");
  assert.match(result.reason, /builder/i);
});

test("an aborted run stops without creating a project", async () => {
  const controller = new AbortController();
  controller.abort();
  const result = await runSwarm({ goal: "Create a project", signal: controller.signal, runId: 203 });
  assert.equal(result.status, "STOPPED");
  assert.equal(result.project, null);
});

test("attempt limits are normalized to a hard cap", async () => {
  const result = await runSwarm({ goal: "Test bounded retries", maxAttempts: MAX_ATTEMPTS + 500, runId: 204 });
  assert.ok(result.attempts <= MAX_ATTEMPTS);
});
