export type Stage =
  | "toApi"
  | "queued"
  | "mongoWrite"
  | "esWrite"
  | "acked"
  | "rejected503"
  | "dlq";

export type SimEvent = {
  id: number;
  stage: Stage;
  stageTick: number;
  receiveCount: number;
  poison: boolean;
  mongoWritten: boolean;
  retryAtTick: number | null;
};

export type LogEntry = { tick: number; code: string; text: string };

// A read request animated separately from the write pipeline: out from the
// API to whichever store answers it, then back.
export type Probe = {
  id: number;
  target: "redis" | "mongo";
  tick: number;
  ok: boolean;
};

export type SimState = {
  tick: number;
  nextId: number;
  // Separate counter so a stats probe never consumes an event id; the log
  // shows event ids to the reader and gaps would look like dropped events.
  nextProbeId: number;
  events: SimEvent[];
  dlq: SimEvent[];
  probes: Probe[];
  esUp: boolean;
  redisUp: boolean;
  mongoUp: boolean;
  // Tick at which the realtime stats cache was last filled from Mongo; the
  // cache is what keeps realtime answering during a Mongo outage.
  statsCachedAtTick: number | null;
  log: LogEntry[];
};
