// Captures golden traces from a locally running starly instance.
// Prereq: `make up` (and healthy) in the starly repo.
// Usage: node scripts/capture-starly-traces.mjs [path-to-starly-repo]
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const STARLY_DIR = process.argv[2] ?? "../event-processing-platform";
const BASE = "http://localhost:8000";
const OUT = "lib/starly/trace-reference.json";

const compose = (args) =>
  execSync(`docker compose ${args}`, {
    cwd: STARLY_DIR,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const makeEvent = (i) => ({
  event_type: "page_view",
  timestamp: new Date().toISOString(),
  user_id: `trace-user-${i}`,
  source_url: `https://example.com/trace/${i}`,
});

async function post(body) {
  const res = await fetch(`${BASE}/events`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

// docker compose prefixes every line with the service name, e.g. "app-1  | ".
export function stripComposePrefix(line) {
  return line.replace(/^[^|]*\| /, "");
}

// "2026-07-24 18:01:02,345 ERROR ..." -> ms since epoch. The container clock is
// UTC; only gaps between timestamps are used, so any fixed offset cancels out.
export function parseLogTime(line) {
  const m = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}),(\d{3})/);
  if (!m) return null;
  return new Date(`${m[1].replace(" ", "T")}.${m[2]}Z`).getTime();
}

function timesMatching(logText, pattern, key) {
  const times = new Map();
  for (const raw of logText.split("\n")) {
    const line = stripComposePrefix(raw);
    const m = line.match(pattern);
    const t = parseLogTime(line);
    if (!m || t === null) continue;
    const k = key(m);
    const arr = times.get(k) ?? [];
    arr.push(t);
    times.set(k, arr);
  }
  for (const arr of times.values()) arr.sort((a, b) => a - b);
  return times;
}

// The consumer logs this per message, but only when Elasticsearch *responds*
// with per-item errors — the path where index_many returns a BulkResult.
export function messageNackTimes(logText) {
  return timesMatching(logText, /nacked message ([0-9a-f]{32})/, (m) => m[1]);
}

// When the ES container is stopped the bulk call raises instead, so the batch
// is nacked in the worker's `finally` with no per-message line. This ERROR line
// is then the only per-attempt signal, which is why the outage scenario sends a
// single event: one message in flight makes batch attempts unambiguous.
export function batchFailureTimes(logText) {
  return (
    timesMatching(
      logText,
      /unhandled error processing batch of \d+/,
      () => "batch",
    ).get("batch") ?? []
  );
}

export function gapsSeconds(sortedTimes) {
  const gaps = [];
  for (let i = 1; i < sortedTimes.length; i++) {
    gaps.push((sortedTimes[i] - sortedTimes[i - 1]) / 1000);
  }
  return gaps;
}

export function doubles(values, tolerance = 0.01) {
  if (values.length < 2) return false;
  return values
    .slice(1)
    .every((v, i) => Math.abs(v / values[i] - 2) <= 2 * tolerance);
}

// Drives starly's own SimulatedQueue with a deterministic clock and no jitter,
// inside the running app container. The wall-clock gaps between failed batches
// cannot isolate the queue's schedule (the Elasticsearch client's dead-node
// backoff dominates them), so the retry schedule is recorded from the real
// queue code directly.
const QUEUE_BACKOFF_PROBE = `
import asyncio, json
from app.queue.simulated import SimulatedQueue

STEP = 0.001

class Clock:
    def __init__(self): self.t = 0.0
    def __call__(self): return self.t

class NoJitter:
    def uniform(self, a, b): return 0.0

async def main():
    clock = Clock()
    q = SimulatedQueue(clock=clock, rng=NoJitter())
    await q.send({"event_id": "trace"})
    delays, receipts = [], 0
    while True:
        elapsed = 0.0
        while True:
            batch = await q.receive_batch(1, 0.0)
            if batch: break
            clock.t += STEP; elapsed += STEP
            if elapsed > 60: raise SystemExit("message never became ready")
        message = batch[0]; receipts += 1
        if receipts > 1: delays.append(round(elapsed, 3))
        before = len(q.dlq)
        await q.nack(message, "es: unavailable")
        if len(q.dlq) > before:
            print(json.dumps({"delaysSeconds": delays,
                              "dlqReceiveCount": message.receive_count,
                              "receipts": receipts}))
            return

asyncio.run(main())
`;

function lastJsonLine(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("{"));
  const line = lines[lines.length - 1];
  if (!line) throw new Error(`no JSON in probe output:\n${text}`);
  return JSON.parse(line);
}

function captureQueueBackoff() {
  const out = execSync("docker compose exec -T app python -", {
    cwd: STARLY_DIR,
    input: QUEUE_BACKOFF_PROBE,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    maxBuffer: 4 * 1024 * 1024,
  });
  const probe = lastJsonLine(out);
  return {
    ...probe,
    doubles: doubles(probe.delaysSeconds),
    clock: "deterministic, jitter disabled, 1 ms polling resolution",
  };
}

async function main() {
  const capturedAt = new Date().toISOString();

  // Scenario 1: seed burst — real 202 responses.
  const seed = [];
  for (let i = 0; i < 20; i++) seed.push(await post(makeEvent(i)));
  const accepted202 = seed.filter((r) => r.status === 202).length;

  // Let the burst drain so only the outage event is in flight below.
  await sleep(5000);

  // Scenario 2: ES outage — redelivery, backoff, DLQ at the receive ceiling.
  const t0 = new Date().toISOString();
  compose("stop elasticsearch");
  const outage = await post(makeEvent(100));
  const outageEventId = outage.body?.event_id;
  if (!outageEventId) {
    throw new Error(`outage event was not accepted: ${JSON.stringify(outage)}`);
  }

  let entry = null;
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const res = await fetch(`${BASE}/admin/dlq`);
    const data = await res.json();
    entry =
      data.entries.find((e) => e.body?.event_id === outageEventId) ?? null;
    if (entry) break;
    await sleep(2000);
  }
  if (!entry) {
    throw new Error("outage event did not reach the DLQ within 120s");
  }

  const logs = compose(`logs app --since "${t0}"`);
  const perMessage = messageNackTimes(logs).get(entry.message_id) ?? [];
  const attemptSource = perMessage.length >= 2 ? "message" : "batch";
  const attemptTimes =
    attemptSource === "message" ? perMessage : batchFailureTimes(logs);
  const attemptGapsSeconds = [gapsSeconds(attemptTimes)];

  compose("start elasticsearch");

  // The queue's retry schedule, recorded from starly's own queue code.
  const queueBackoff = captureQueueBackoff();

  // Scenario 3: Redis outage — realtime stats recomputed from Mongo.
  compose("stop redis");
  await sleep(1000);
  const stats = await fetch(`${BASE}/events/stats/realtime`);
  const redisOutage = {
    realtimeStatsStatus: stats.status,
    servedWithoutRedis: stats.status === 200,
  };
  compose("start redis");

  const fixture = {
    capturedAt,
    seedBurst: { sent: seed.length, accepted202 },
    esOutage: {
      events: 1,
      redeliveriesBeforeDlq: entry.receive_count - 1,
      dlqReceiveCount: entry.receive_count,
      dlqError: entry.error.slice(0, 120),
      attemptSource,
      attemptGapsSeconds,
      attemptGapsNote:
        "Wall-clock gaps between failed batch attempts. Dominated by the " +
        "Elasticsearch client's own dead-node backoff, so they do not isolate " +
        "the queue's retry schedule — see queueBackoff for that.",
    },
    queueBackoff,
    redisOutage,
  };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(fixture, null, 2) + "\n");
  console.log(`wrote ${OUT}`);
  console.log(JSON.stringify(fixture, null, 2));
}

const isMain = process.argv[1]?.endsWith("capture-starly-traces.mjs");
if (isMain) {
  await main();
}
