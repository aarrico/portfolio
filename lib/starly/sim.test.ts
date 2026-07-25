import { describe, expect, it } from "vitest";
import {
  fillQueue,
  initialState,
  queuedCount,
  redriveDlq,
  requestRealtimeStats,
  runUntilQuiescent,
  sendBurst,
  sendPoison,
  setEs,
  setRedis,
  tickSim,
  setMongo,
  CACHE_TTL_TICKS,
  PROBE_TICKS,
  BASE_RETRY_DELAY_TICKS,
  MAX_RECEIVE_COUNT,
  QUEUE_CAPACITY,
  STAGE_TICKS,
} from "./sim";

const codes = (s: { log: { code: string }[] }) => s.log.map((l) => l.code);

describe("sim happy path", () => {
  it("starts empty and healthy", () => {
    const s = initialState();
    expect(s.events).toHaveLength(0);
    expect(s.dlq).toHaveLength(0);
    expect(s.esUp).toBe(true);
    expect(s.redisUp).toBe(true);
  });

  it("does not mutate its input", () => {
    const s = initialState();
    const after = sendBurst(s, 1);
    expect(s.events).toHaveLength(0);
    expect(after.events).toHaveLength(1);
    const ticked = tickSim(after);
    expect(after.tick).toBe(0);
    expect(ticked.tick).toBe(1);
  });

  it("accepts an event with 202 and acks it after both stores", () => {
    let s = sendBurst(initialState(), 1);
    s = runUntilQuiescent(s);
    expect(codes(s)).toEqual(["202", "ack"]);
    expect(s.events).toHaveLength(0);
    expect(s.dlq).toHaveLength(0);
  });

  it("logs one 202 per event in a burst and acks all of them", () => {
    let s = sendBurst(initialState(), 5);
    s = runUntilQuiescent(s);
    expect(codes(s).filter((c) => c === "202")).toHaveLength(5);
    expect(codes(s).filter((c) => c === "ack")).toHaveLength(5);
  });

  it("moves an event into the queue after STAGE_TICKS", () => {
    let s = sendBurst(initialState(), 1);
    for (let i = 0; i < STAGE_TICKS; i++) s = tickSim(s);
    expect(queuedCount(s)).toBeLessThanOrEqual(1);
    expect(codes(s)).toContain("202");
  });

  it("never exceeds queue capacity", () => {
    let s = sendBurst(initialState(), QUEUE_CAPACITY + 10);
    for (let i = 0; i < 2000; i++) {
      s = tickSim(s);
      expect(queuedCount(s)).toBeLessThanOrEqual(QUEUE_CAPACITY);
    }
  });
});

describe("backpressure and poison", () => {
  it("returns 503 with Retry-After when the queue is full", () => {
    let s = fillQueue(initialState());
    for (let i = 0; i < STAGE_TICKS + 2; i++) s = tickSim(s);
    const rejections = s.log.filter((l) => l.code === "503");
    expect(rejections.length).toBeGreaterThanOrEqual(1);
    expect(rejections[0]!.text).toContain("Retry-After");
    expect(queuedCount(s)).toBeLessThanOrEqual(QUEUE_CAPACITY);
  });

  it("drains a full queue completely once sends stop", () => {
    let s = fillQueue(initialState());
    s = runUntilQuiescent(s, 10_000);
    expect(s.events).toHaveLength(0);
    expect(codes(s).filter((c) => c === "ack")).toHaveLength(QUEUE_CAPACITY);
  });

  it("rejects a poison message straight to the DLQ on first receive", () => {
    let s = sendPoison(initialState());
    s = runUntilQuiescent(s);
    expect(codes(s)).toContain("reject");
    expect(codes(s)).not.toContain("nack");
    expect(s.dlq).toHaveLength(1);
    expect(s.dlq[0]!.receiveCount).toBe(1);
  });
});

describe("es outage, redrive, redis fallback", () => {
  it("nacks with doubling backoff and DLQs at the receive ceiling", () => {
    let s = setEs(sendBurst(initialState(), 1), false);
    s = runUntilQuiescent(s, 10_000);

    const nacks = s.log.filter((l) => l.code === "nack");
    expect(nacks).toHaveLength(MAX_RECEIVE_COUNT - 1);
    const delays = nacks.map((l) =>
      Number(/backoff (\d+) ticks/.exec(l.text)![1]),
    );
    expect(delays).toEqual(
      [0, 1, 2, 3].map((i) => BASE_RETRY_DELAY_TICKS * 2 ** i),
    );

    expect(s.dlq).toHaveLength(1);
    expect(s.dlq[0]!.receiveCount).toBe(MAX_RECEIVE_COUNT);
    expect(s.dlq[0]!.mongoWritten).toBe(true);
  });

  it("logs idempotent Mongo no-ops on redelivery", () => {
    let s = setEs(sendBurst(initialState(), 1), false);
    s = runUntilQuiescent(s, 10_000);
    const noops = s.log.filter((l) => l.code === "mongo");
    expect(noops).toHaveLength(MAX_RECEIVE_COUNT - 1);
    expect(noops[0]!.text).toContain("no-op");
  });

  it("redrives the DLQ to successful acks once ES is back", () => {
    let s = setEs(sendBurst(initialState(), 1), false);
    s = runUntilQuiescent(s, 10_000);
    expect(s.dlq).toHaveLength(1);

    s = redriveDlq(setEs(s, true));
    expect(s.dlq).toHaveLength(0);
    s = runUntilQuiescent(s, 10_000);
    expect(codes(s)).toContain("redrive");
    expect(codes(s).filter((c) => c === "ack")).toHaveLength(1);
  });

  it("redrive on an empty DLQ is a no-op", () => {
    const s = initialState();
    expect(redriveDlq(s).log).toHaveLength(0);
  });

  it("serves realtime stats from Mongo when Redis is down", () => {
    let s = requestRealtimeStats(initialState());
    expect(s.log[0]!.text).toContain("served from Redis");

    s = requestRealtimeStats(setRedis(initialState(), false));
    const last = s.log[s.log.length - 1]!;
    expect(last.code).toBe("200");
    expect(last.text).toContain("recomputed from Mongo");
  });
});

describe("mongo outage", () => {
  it("keeps accepting writes while Mongo is down", () => {
    let s = setMongo(initialState(), false);
    s = sendBurst(s, 3);
    for (let i = 0; i < STAGE_TICKS + 2; i++) s = tickSim(s);
    expect(codes(s).filter((c) => c === "202")).toHaveLength(3);
    expect(codes(s)).not.toContain("503");
  });

  it("nacks on the same backoff ladder and DLQs at the ceiling", () => {
    let s = setMongo(sendBurst(initialState(), 1), false);
    s = runUntilQuiescent(s, 20_000);

    const nacks = s.log.filter((l) => l.code === "nack");
    expect(nacks).toHaveLength(MAX_RECEIVE_COUNT - 1);
    expect(nacks[0]!.text).toContain("mongo unavailable");
    const delays = nacks.map((l) =>
      Number(/backoff (\d+) ticks/.exec(l.text)![1]),
    );
    expect(delays).toEqual(
      [0, 1, 2, 3].map((i) => BASE_RETRY_DELAY_TICKS * 2 ** i),
    );

    expect(s.dlq).toHaveLength(1);
    expect(s.dlq[0]!.receiveCount).toBe(MAX_RECEIVE_COUNT);
    expect(s.dlq[0]!.mongoWritten).toBe(false);
  });

  it("never reaches Elasticsearch, since ES only gets what Mongo accepted", () => {
    let s = setMongo(sendBurst(initialState(), 1), false);
    s = runUntilQuiescent(s, 20_000);
    expect(codes(s)).not.toContain("ack");
  });
});

describe("realtime stats cache", () => {
  it("serves from Redis and refreshes the cache when both stores are up", () => {
    const s = requestRealtimeStats(initialState());
    expect(s.log[0]!.code).toBe("200");
    expect(s.log[0]!.text).toContain("served from Redis");
    expect(s.statsCachedAtTick).toBe(s.tick);
  });

  it("serves a cached snapshot while Mongo is down and the TTL is warm", () => {
    let s = requestRealtimeStats(initialState());
    s = setMongo(s, false);
    s = requestRealtimeStats(s);
    const last = s.log[s.log.length - 1]!;
    expect(last.code).toBe("200");
    expect(last.text).toContain("cached snapshot");
  });

  it("503s once the cached snapshot outlives its TTL", () => {
    let s = requestRealtimeStats(initialState());
    s = setMongo(s, false);
    for (let i = 0; i < CACHE_TTL_TICKS + 1; i++) s = tickSim(s);
    s = requestRealtimeStats(s);
    const last = s.log[s.log.length - 1]!;
    expect(last.code).toBe("503");
    expect(last.text).toContain("storage_unavailable");
  });

  it("recomputes from Mongo when only Redis is down", () => {
    const s = requestRealtimeStats(setRedis(initialState(), false));
    const last = s.log[s.log.length - 1]!;
    expect(last.code).toBe("200");
    expect(last.text).toContain("recomputed from Mongo");
  });

  it("503s when both Redis and Mongo are down", () => {
    let s = setRedis(initialState(), false);
    s = requestRealtimeStats(setMongo(s, false));
    const last = s.log[s.log.length - 1]!;
    expect(last.code).toBe("503");
  });

  it("emits a probe aimed at whichever store answers", () => {
    const viaRedis = requestRealtimeStats(initialState());
    expect(viaRedis.probes).toHaveLength(1);
    expect(viaRedis.probes[0]!.target).toBe("redis");

    const viaMongo = requestRealtimeStats(setRedis(initialState(), false));
    expect(viaMongo.probes[0]!.target).toBe("mongo");
    expect(viaMongo.probes[0]!.ok).toBe(true);

    const failed = requestRealtimeStats(
      setMongo(setRedis(initialState(), false), false),
    );
    expect(failed.probes[0]!.ok).toBe(false);
  });

  it("retires probes once they have travelled out and back", () => {
    let s = requestRealtimeStats(initialState());
    for (let i = 0; i < PROBE_TICKS + 1; i++) s = tickSim(s);
    expect(s.probes).toHaveLength(0);
  });
});
