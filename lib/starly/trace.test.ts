import { describe, expect, it } from "vitest";
import fixture from "./trace-reference.json";
import {
  initialState,
  requestRealtimeStats,
  runUntilQuiescent,
  sendBurst,
  setEs,
  setRedis,
  BASE_RETRY_DELAY_TICKS,
  MAX_RECEIVE_COUNT,
} from "./sim";

const nackDelays = (): number[] => {
  let s = setEs(sendBurst(initialState(), 1), false);
  s = runUntilQuiescent(s, 10_000);
  return s.log
    .filter((l) => l.code === "nack")
    .map((l) => Number(/backoff (\d+) ticks/.exec(l.text)![1]));
};

describe("sim matches the recorded run of the real system", () => {
  it("accepts a full seed burst, like the real API did", () => {
    expect(fixture.seedBurst.accepted202).toBe(fixture.seedBurst.sent);
    let s = sendBurst(initialState(), fixture.seedBurst.sent);
    s = runUntilQuiescent(s, 20_000);
    const accepted = s.log.filter((l) => l.code === "202").length;
    expect(accepted).toBe(fixture.seedBurst.sent);
  });

  it("redelivers the recorded number of times before the DLQ", () => {
    let s = setEs(sendBurst(initialState(), 1), false);
    s = runUntilQuiescent(s, 10_000);
    const nacks = s.log.filter((l) => l.code === "nack").length;
    expect(nacks).toBe(fixture.esOutage.redeliveriesBeforeDlq);
  });

  it("DLQs at the recorded receive count", () => {
    expect(MAX_RECEIVE_COUNT).toBe(fixture.esOutage.dlqReceiveCount);
    expect(MAX_RECEIVE_COUNT).toBe(fixture.queueBackoff.receipts);
    let s = setEs(sendBurst(initialState(), 1), false);
    s = runUntilQuiescent(s, 10_000);
    expect(s.dlq[0]!.receiveCount).toBe(fixture.esOutage.dlqReceiveCount);
  });

  // The recorded delays come from queueBackoff (jitter disabled), not from the
  // esOutage wall-clock gaps — those are dominated by the ES client's own
  // dead-node backoff. One sim tick per recorded second.
  it("retries on the recorded backoff schedule", () => {
    expect(fixture.queueBackoff.doubles).toBe(true);
    const recorded = fixture.queueBackoff.delaysSeconds;
    expect(recorded).toHaveLength(fixture.esOutage.redeliveriesBeforeDlq);
    expect(nackDelays()).toEqual(
      recorded.map((s) => Math.round(s) * BASE_RETRY_DELAY_TICKS),
    );
  });

  it("doubles its backoff, as the recorded delays did", () => {
    const delays = nackDelays();
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBe(delays[i - 1]! * 2);
    }
  });

  it("serves realtime stats without Redis, like the real API did", () => {
    expect(fixture.redisOutage.realtimeStatsStatus).toBe(200);
    expect(fixture.redisOutage.servedWithoutRedis).toBe(true);
    const s = requestRealtimeStats(setRedis(initialState(), false));
    const last = s.log[s.log.length - 1]!;
    expect(last.code).toBe("200");
  });
});
