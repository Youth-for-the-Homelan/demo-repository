/**
 * BOOGYEMAN Swarm Core — bounded code-candidate search.
 * Generated source comes from local templates and is NEVER evaluated/executed here.
 * PASS means static contract checks passed, not that generated code ran successfully.
 */

export const MAX_ATTEMPTS = 24;
export const MAX_BOTS = 20;

export const SWARM_ROLES = Object.freeze({
  spider: { label: "Spider Scout", purpose: "Map task threads and dependencies." },
  ant: { label: "Ant Coordinator", purpose: "Rank work, share findings, and reduce duplicate attempts." },
  builder: { label: "Code Builder", purpose: "Produce bounded candidate variants from trusted templates." },
  tester: { label: "Static Validator", purpose: "Check source contracts and structural safety." },
  evolver: { label: "Offspring Builder", purpose: "Spawn a bounded child agent after a candidate passes." },
});

export const DEFAULT_BOTS = Object.freeze([
  { id: "spider-1", name: "Spider Scout 01", role: "spider", enabled: true, generation: 0, codeBudget: 4, attempts: 0, successes: 0 },
  { id: "ant-1", name: "Ant Coordinator 01", role: "ant", enabled: true, generation: 0, codeBudget: 4, attempts: 0, successes: 0 },
  { id: "builder-1", name: "Builder Worker 01", role: "builder", enabled: true, generation: 0, codeBudget: 6, attempts: 0, successes: 0 },
  { id: "tester-1", name: "Static Validator 01", role: "tester", enabled: true, generation: 0, codeBudget: 4, attempts: 0, successes: 0 },
]);

const cleanComment = (value) => String(value).replace(/[\r\n\u2028\u2029]+/g, " ").replace(/\*\//g, "* /").slice(0, 280);
const hash = (value) => Array.from(String(value)).reduce((result, char) => Math.imul(result ^ char.charCodeAt(0), 16777619), 2166136261) >>> 0;

function shuffle(items, seed) {
  const copy = [...items];
  let state = seed >>> 0;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const TEMPLATES = [
  {
    name: "priority-task-queue.mjs",
    strategy: "Priority-ranked task queue",
    source: (goal) => `// BOOGYEMAN-SWARM / bundled safe template\n// Objective: ${cleanComment(goal)}\nexport function rankTasks(tasks) {\n  return [...tasks].sort((a, b) => b.priority - a.priority || String(a.id).localeCompare(String(b.id)));\n}\n`,
  },
  {
    name: "task-runner-incomplete.mjs",
    strategy: "Deliberate contract-failure candidate",
    source: (goal) => `// BOOGYEMAN-SWARM / deliberate failed candidate\n// Objective: ${cleanComment(goal)}\nfunction rankTasks(tasks) {\n  return [...tasks].sort((a, b) => b.priority - a.priority);\n}\n`,
  },
  {
    name: "task-runner-unbalanced.mjs",
    strategy: "Deliberate structure-failure candidate",
    source: (goal) => `// BOOGYEMAN-SWARM / deliberate failed candidate\n// Objective: ${cleanComment(goal)}\nexport function hasGoal(goal) {\n  return String(goal).trim().length > 0;\n`,
  },
  {
    name: "bounded-attempt-ledger.mjs",
    strategy: "Bounded retry ledger",
    source: (goal) => `// BOOGYEMAN-SWARM / bundled safe template\n// Objective: ${cleanComment(goal)}\nexport function nextAttempt(results, limit) {\n  if (results.some((result) => result.passed)) return null;\n  const next = results.length + 1;\n  return next <= Math.max(0, limit) ? next : null;\n}\n`,
  },
];

export function normalizeAttemptLimit(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(1, Math.min(MAX_ATTEMPTS, Math.floor(number))) : 12;
}

export function createCandidateBatch(goal, bot, runId = Date.now()) {
  const safeBudget = Math.max(1, Math.min(8, Math.floor(Number(bot.codeBudget) || 4)));
  const seed = hash(`${goal}|${bot.id}|${runId}`);
  return shuffle(TEMPLATES, seed).slice(0, safeBudget).map((template, index) => ({
    id: `${runId}-${bot.id}-${index}-${seed.toString(16)}`,
    name: template.name,
    strategy: template.strategy,
    generatedBy: bot.name,
    generation: Number(bot.generation) || 0,
    source: template.source(goal),
    checks: [],
    passed: false,
  }));
}

/** Never eval candidate source. This function only inspects source text. */
export function validateCandidate(candidate) {
  const source = String(candidate.source || "");
  const braceBalanced = (source.match(/{/g) || []).length === (source.match(/}/g) || []).length;
  const parenBalanced = (source.match(/\(/g) || []).length === (source.match(/\)/g) || []).length;
  const hasExport = /\bexport\s+(?:function|const|class|type|interface)\b/.test(source);
  const noBlockedTokens = !/\b(?:eval|Function|require)\s*\(/.test(source)
    && !/\b(?:child_process|process\.env|Deno\.run|fetch|WebSocket|XMLHttpRequest)\b/.test(source);
  const withinSize = source.length > 80 && source.length <= 12000;
  const expectedContract = /\b(?:rankTasks|nextAttempt)\b/.test(source);
  const checks = [
    { name: "balanced-delimiters", passed: braceBalanced && parenBalanced, detail: braceBalanced && parenBalanced ? "Braces and parentheses balance." : "Unbalanced delimiters." },
    { name: "export-contract", passed: hasExport, detail: hasExport ? "An exported entry point exists." : "Missing exported entry point." },
    { name: "blocked-operations", passed: noBlockedTokens, detail: noBlockedTokens ? "No blocked dynamic-execution or privileged-operation token found." : "Blocked execution/network/privileged-operation pattern detected." },
    { name: "size-limit", passed: withinSize, detail: withinSize ? `${source.length} characters, within limit.` : "Candidate is empty or too large." },
    { name: "task-contract", passed: expectedContract, detail: expectedContract ? "A known task API contract is present." : "The candidate does not expose a recognized task API." },
  ];
  return { ...candidate, checks, passed: checks.every((check) => check.passed) };
}

export function spawnChildBot(parent, candidate, runId = Date.now()) {
  const role = parent.role === "builder" ? "tester" : "builder";
  return {
    id: `bot-${runId}-${hash(`${parent.id}|${candidate.id}`).toString(36)}`,
    name: `${role === "builder" ? "Builder" : "Validator"} Gen-${(Number(parent.generation) || 0) + 1}-${String(runId).slice(-5)}`,
    role,
    enabled: true,
    generation: (Number(parent.generation) || 0) + 1,
    codeBudget: 3 + (hash(candidate.id) % 5),
    attempts: 0,
    successes: 0,
    parentId: parent.id,
  };
}

export function createProjectArtifact(goal, candidate, childBot, runId = Date.now()) {
  const safeGoal = String(goal).trim().slice(0, 500);
  const slug = safeGoal.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "swarm-generated-project";
  const readme = [
    "# BOOGYEMAN Swarm Project",
    "",
    `- Project key: swarm-${runId}`,
    `- Goal: ${safeGoal}`,
    `- Selected candidate: ${candidate.name}`,
    `- Strategy: ${candidate.strategy}`,
    `- Accepted by local static checks: ${candidate.passed ? "YES" : "NO"}`,
    "- Runtime execution: NOT EXECUTED",
    "- External CI: NOT EXECUTED by this function",
    `- Child bot: ${childBot.name} (${childBot.id})`,
    "",
    "The generated source comes from a bundled template. Passing local static checks does not prove runtime correctness.",
  ].join("\n");
  return {
    id: `swarm-${runId}`,
    name: `swarm-${slug}-${String(runId).slice(-5)}`,
    status: "CANDIDATE_ACCEPTED_STATIC_ONLY",
    runtimeExecution: "NOT_EXECUTED",
    files: [
      { path: "README.md", content: readme },
      { path: candidate.name, content: candidate.source },
      { path: "verification-report.json", content: JSON.stringify({ checks: candidate.checks, passed: candidate.passed, runtimeExecution: "NOT_EXECUTED" }, null, 2) },
    ],
  };
}

export async function runSwarm({ goal, bots = DEFAULT_BOTS, maxAttempts = 12, runId = Date.now(), signal, onEvent = () => {} } = {}) {
  const objective = String(goal || "").trim();
  if (!objective) return { status: "BLOCKED", reason: "A non-empty goal is required.", attempts: 0, bots: [...bots] };
  const limit = normalizeAttemptLimit(maxAttempts);
  const population = [...bots].slice(0, MAX_BOTS);
  const enabled = population.filter((bot) => bot.enabled);
  if (!enabled.length) return { status: "BLOCKED", reason: "All bots are disabled.", attempts: 0, bots: population };
  const builders = enabled.filter((bot) => ["builder", "tester", "evolver"].includes(bot.role));
  if (!builders.length) return { status: "BLOCKED", reason: "Enable a builder, tester, or evolver bot.", attempts: 0, bots: population };

  for (const bot of enabled.filter((item) => item.role === "spider")) {
    onEvent({ kind: "discovery", bot: bot.name, message: "Mapped objective threads and dependencies." });
  }
  for (const bot of enabled.filter((item) => item.role === "ant")) {
    onEvent({ kind: "coordination", bot: bot.name, message: "Prioritized validation and shared the attempt budget." });
  }

  let attempts = 0;
  let winner = null;
  let winnerBot = null;
  const updatedBots = population.map((bot) => ({ ...bot }));
  for (let index = 0; index < builders.length && attempts < limit && !winner; index += 1) {
    const originalBot = builders[index];
    const bot = updatedBots.find((entry) => entry.id === originalBot.id);
    for (const candidate of createCandidateBatch(objective, bot, runId + attempts + index)) {
      if (signal?.aborted || attempts >= limit || winner) break;
      attempts += 1;
      const checked = validateCandidate(candidate);
      bot.attempts += 1;
      if (checked.passed) bot.successes += 1;
      onEvent({
        kind: checked.passed ? "pass" : "reject",
        bot: bot.name,
        candidate: checked.name,
        attempt: attempts,
        message: checked.passed ? "Candidate passed local static checks." : checked.checks.filter((check) => !check.passed).map((check) => check.name).join(", "),
      });
      if (checked.passed) { winner = checked; winnerBot = bot; break; }
    }
  }

  if (signal?.aborted) return { status: "STOPPED", attempts, bots: updatedBots, winner: null, project: null, childBot: null };
  if (!winner || !winnerBot) return { status: "NO_CANDIDATE_PASSED", attempts, bots: updatedBots, winner: null, project: null, childBot: null };

  const childBot = spawnChildBot(winnerBot, winner, runId);
  const evolvedBots = [...updatedBots];
  if (evolvedBots.length < MAX_BOTS) evolvedBots.push(childBot);
  onEvent({ kind: "spawn", bot: childBot.name, message: `Spawned from ${winnerBot.name}; code budget ${childBot.codeBudget}.` });
  const project = createProjectArtifact(objective, winner, childBot, runId);
  onEvent({ kind: "project", bot: "SWARM", message: `Created project artifact ${project.name}; runtime execution remains NOT EXECUTED.` });
  return {
    status: "CANDIDATE_ACCEPTED_STATIC_ONLY",
    attempts,
    bots: evolvedBots,
    winner,
    winnerBot: winnerBot.id,
    childBot: evolvedBots.includes(childBot) ? childBot : null,
    project,
    runtimeExecution: "NOT_EXECUTED",
  };
}
