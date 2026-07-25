import type { Probe, SimEvent, SimState } from "./types";

// Mirrors the real system: max_receive_count 5, delay doubling per receive.
// QUEUE_CAPACITY scales the real 10k depth down to a legible gauge.
export const QUEUE_CAPACITY = 20;
export const MAX_RECEIVE_COUNT = 5;
export const BASE_RETRY_DELAY_TICKS = 40;
export const STAGE_TICKS = 36;
export const FADE_TICKS = 30;
export const CACHE_TTL_TICKS = 300;
// Round trip is client → API → store → API → client, so the budget covers
// roughly twice the distance the old API-only hop did.
export const PROBE_TICKS = 96;

export function initialState(): SimState {
  return {
    tick: 0,
    nextId: 1,
    nextProbeId: 1,
    events: [],
    dlq: [],
    probes: [],
    esUp: true,
    redisUp: true,
    mongoUp: true,
    statsCachedAtTick: null,
    log: [],
  };
}

export function queuedCount(state: SimState): number {
  return state.events.filter((e) => e.stage === "queued").length;
}

function clone(state: SimState): SimState {
  return {
    ...state,
    events: state.events.map((e) => ({ ...e })),
    dlq: state.dlq.map((e) => ({ ...e })),
    probes: state.probes.map((p) => ({ ...p })),
    log: [...state.log],
  };
}

function addProbe(state: SimState, target: Probe["target"], ok: boolean): void {
  state.probes.push({ id: state.nextProbeId++, target, tick: 0, ok });
}

// Shared by both store writes: a failed durable write is nacked for
// redelivery until the receive ceiling, then dead-lettered.
function failWrite(state: SimState, e: SimEvent, reason: string): void {
  e.stageTick = 0;
  if (e.receiveCount >= MAX_RECEIVE_COUNT) {
    e.stage = "dlq";
    state.dlq.push({ ...e });
    pushLog(
      state,
      "dlq",
      `event ${e.id} — exhausted ${e.receiveCount}/${MAX_RECEIVE_COUNT} receives, moved to DLQ`,
    );
  } else {
    const delay = BASE_RETRY_DELAY_TICKS * 2 ** (e.receiveCount - 1);
    e.stage = "queued";
    e.retryAtTick = state.tick + delay;
    pushLog(
      state,
      "nack",
      `event ${e.id} — nack (${reason}), backoff ${delay} ticks`,
    );
  }
}

function pushLog(state: SimState, code: string, text: string): void {
  state.log.push({ tick: state.tick, code, text });
}

function addEvent(state: SimState, poison: boolean): void {
  state.events.push({
    id: state.nextId++,
    stage: "toApi",
    stageTick: 0,
    receiveCount: 0,
    poison,
    mongoWritten: false,
    retryAtTick: null,
  });
}

export function sendBurst(state: SimState, count = 5): SimState {
  const next = clone(state);
  for (let i = 0; i < count; i++) addEvent(next, false);
  return next;
}

export function sendPoison(state: SimState): SimState {
  const next = clone(state);
  addEvent(next, true);
  return next;
}

export function fillQueue(state: SimState): SimState {
  const next = clone(state);
  const room = Math.max(0, QUEUE_CAPACITY - queuedCount(next));
  for (let i = 0; i < room + 3; i++) addEvent(next, false);
  return next;
}

export function tickSim(state: SimState): SimState {
  const next = clone(state);
  next.tick++;

  for (const e of next.events) {
    e.stageTick++;
    if (e.stageTick < STAGE_TICKS) continue;

    switch (e.stage) {
      case "toApi":
        if (queuedCount(next) >= QUEUE_CAPACITY) {
          e.stage = "rejected503";
          e.stageTick = 0;
          pushLog(next, "503", "POST /events — queue full, Retry-After: 1");
        } else {
          e.stage = "queued";
          e.stageTick = 0;
          pushLog(next, "202", `POST /events — event ${e.id} queued`);
        }
        break;
      case "mongoWrite":
        if (!next.mongoUp) {
          failWrite(next, e, "mongo unavailable");
          break;
        }
        if (e.mongoWritten) {
          pushLog(
            next,
            "mongo",
            `event ${e.id} — upsert no-op (idempotent replay)`,
          );
        } else {
          e.mongoWritten = true;
        }
        e.stage = "esWrite";
        e.stageTick = 0;
        break;
      case "esWrite":
        if (next.esUp) {
          e.stage = "acked";
          e.stageTick = 0;
          pushLog(next, "ack", `event ${e.id} — indexed, acked`);
        } else {
          failWrite(next, e, "es unavailable");
        }
        break;
      default:
        break;
    }
  }

  next.events = next.events.filter(
    (e) =>
      !(
        (e.stage === "acked" ||
          e.stage === "rejected503" ||
          e.stage === "dlq") &&
        e.stageTick >= FADE_TICKS
      ),
  );

  for (const p of next.probes) p.tick++;
  next.probes = next.probes.filter((p) => p.tick < PROBE_TICKS);

  const workerBusy = next.events.some(
    (e) => e.stage === "mongoWrite" || e.stage === "esWrite",
  );
  if (!workerBusy) {
    const candidate = next.events.find(
      (e) =>
        e.stage === "queued" &&
        (e.retryAtTick === null || e.retryAtTick <= next.tick),
    );
    if (candidate) {
      candidate.receiveCount++;
      candidate.stageTick = 0;
      if (candidate.poison) {
        candidate.stage = "dlq";
        next.dlq.push({ ...candidate });
        pushLog(
          next,
          "reject",
          `event ${candidate.id} — poison payload, rejected to DLQ`,
        );
      } else {
        candidate.stage = "mongoWrite";
      }
    }
  }

  return next;
}

export function runUntilQuiescent(state: SimState, maxTicks = 5000): SimState {
  let s = state;
  for (
    let i = 0;
    i < maxTicks && (s.events.length > 0 || s.probes.length > 0);
    i++
  ) {
    s = tickSim(s);
  }
  return s;
}

export function setEs(state: SimState, up: boolean): SimState {
  const next = clone(state);
  next.esUp = up;
  pushLog(
    next,
    "es",
    up ? "elasticsearch back up" : "elasticsearch down — search_unavailable",
  );
  return next;
}

export function setRedis(state: SimState, up: boolean): SimState {
  const next = clone(state);
  next.redisUp = up;
  pushLog(next, "redis", up ? "redis back up" : "redis down");
  return next;
}

export function setMongo(state: SimState, up: boolean): SimState {
  const next = clone(state);
  next.mongoUp = up;
  pushLog(
    next,
    "mongo",
    up ? "mongodb back up" : "mongodb down — storage_unavailable",
  );
  return next;
}

// Per the real system's degradation table: Redis answers when it can, Mongo
// recomputes when Redis is gone, and a warm cache is what keeps realtime
// alive through a Mongo outage until the TTL runs out.
export function requestRealtimeStats(state: SimState): SimState {
  const next = clone(state);
  const cacheWarm =
    next.statsCachedAtTick !== null &&
    next.tick - next.statsCachedAtTick < CACHE_TTL_TICKS;

  if (next.redisUp && next.mongoUp) {
    addProbe(next, "redis", true);
    next.statsCachedAtTick = next.tick;
    pushLog(next, "200", "GET /events/stats/realtime — served from Redis");
  } else if (next.redisUp && cacheWarm) {
    addProbe(next, "redis", true);
    pushLog(
      next,
      "200",
      "GET /events/stats/realtime — Mongo down, cached snapshot (TTL warm)",
    );
  } else if (next.mongoUp) {
    addProbe(next, "mongo", true);
    next.statsCachedAtTick = next.tick;
    pushLog(
      next,
      "200",
      "GET /events/stats/realtime — Redis down, recomputed from Mongo",
    );
  } else {
    addProbe(next, "mongo", false);
    pushLog(
      next,
      "503",
      "GET /events/stats/realtime — storage_unavailable (cache expired)",
    );
  }
  return next;
}

export function redriveDlq(state: SimState): SimState {
  const next = clone(state);
  if (next.dlq.length === 0) return next;
  const n = next.dlq.length;
  next.events = next.events.filter((e) => e.stage !== "dlq");
  for (const entry of next.dlq) {
    next.events.push({
      ...entry,
      stage: "queued",
      stageTick: 0,
      receiveCount: 0,
      retryAtTick: null,
    });
  }
  next.dlq = [];
  pushLog(
    next,
    "redrive",
    `DLQ redrive — ${n} re-enqueued (designed operation)`,
  );
  return next;
}
