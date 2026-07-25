import {
  FADE_TICKS,
  PROBE_TICKS,
  QUEUE_CAPACITY,
  STAGE_TICKS,
  queuedCount,
} from "@/lib/starly/sim";
import type { Probe, SimEvent, SimState } from "@/lib/starly/types";

type Point = { x: number; y: number };

// Deep enough to hold a whole outage-to-redrive story: in reduced-motion mode
// one click can emit 20+ lines at once.
const LOG_WINDOW = 60;

// The console keeps a fixed dark surface in both themes, like the advection
// Scene — a dense diagram needs stable contrast, and it lets the palette
// tokens carry state meaning instead of theme-dependent grays.
const INK = "#eaddcd";
const SURFACE = "var(--color-blue)";
const MOVING = INK;
const WAITING = "var(--color-ember)";
const DONE = "var(--color-accent)";
const FAILED = "var(--color-rose)";

const NODE = {
  client: { x: 50, y: 130 },
  api: { x: 165, y: 130 },
  queue: { x: 290, y: 130 },
  worker: { x: 420, y: 130 },
  dlq: { x: 420, y: 40 },
  mongo: { x: 340, y: 260 },
  es: { x: 500, y: 260 },
  redis: { x: 165, y: 260 },
} as const;

const TRAVEL: Partial<Record<SimEvent["stage"], Point[]>> = {
  toApi: [NODE.client, NODE.api, NODE.queue],
  mongoWrite: [NODE.worker, NODE.mongo],
  esWrite: [NODE.mongo, NODE.es],
};

const REST: Partial<Record<SimEvent["stage"], Point>> = {
  acked: NODE.es,
  rejected503: NODE.api,
  dlq: NODE.dlq,
};

function along(path: Point[], t: number): Point {
  const segs = path.length - 1;
  const clamped = Math.min(Math.max(t, 0), 0.999);
  const i = Math.floor(clamped * segs);
  const local = clamped * segs - i;
  const a = path[i]!;
  const b = path[i + 1]!;
  return { x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local };
}

function dotProps(
  e: SimEvent,
  index: number,
): { p: Point; fill: string; opacity: number } {
  const travel = TRAVEL[e.stage];
  if (travel) {
    return {
      p: along(travel, e.stageTick / STAGE_TICKS),
      fill: e.poison ? FAILED : MOVING,
      opacity: 1,
    };
  }
  const rest = REST[e.stage];
  if (rest) {
    return {
      p: rest,
      fill: e.stage === "acked" ? DONE : FAILED,
      opacity: 1 - e.stageTick / FADE_TICKS,
    };
  }
  return {
    p: {
      x: NODE.queue.x - 18 + (index % 5) * 9,
      y: NODE.queue.y + 16 - Math.floor((index % 20) / 5) * 9,
    },
    fill: e.retryAtTick !== null ? WAITING : MOVING,
    opacity: 1,
  };
}

function Box({
  p,
  label,
  down = false,
}: {
  p: Point;
  label: string;
  down?: boolean;
}) {
  return (
    <g>
      <rect
        x={p.x - 44}
        y={p.y - 22}
        width={88}
        height={44}
        rx={6}
        fill={SURFACE}
        stroke={down ? FAILED : INK}
        strokeOpacity={down ? 0.9 : 0.35}
        strokeWidth={1.5}
      />
      <text
        x={p.x}
        y={p.y - 28}
        textAnchor="middle"
        fill={down ? FAILED : INK}
        fillOpacity={down ? 1 : 0.65}
        className="font-mono text-[11px]"
      >
        {label}
      </text>
    </g>
  );
}

// Read probes fly from the client, through the API, to whichever store
// answered, then retrace the same path back.
function probePoint(p: Probe): Point {
  const half = PROBE_TICKS / 2;
  const t = p.tick < half ? p.tick / half : 1 - (p.tick - half) / half;
  return along(
    [NODE.client, NODE.api, p.target === "redis" ? NODE.redis : NODE.mongo],
    t,
  );
}

function Edge({ a, b }: { a: Point; b: Point }) {
  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={INK}
      strokeOpacity={0.2}
      strokeWidth={1}
    />
  );
}

export function Diagram({ state }: { state: SimState }) {
  const depth = queuedCount(state);
  let queuedIndex = 0;
  return (
    <div
      className="overflow-hidden rounded-md border"
      style={{ background: SURFACE, borderColor: `${INK}33` }}
    >
      <svg
        role="img"
        aria-label="Starly pipeline simulation"
        viewBox="0 0 580 310"
        className="w-full"
      >
        <Edge a={NODE.client} b={NODE.api} />
        <Edge a={NODE.api} b={NODE.queue} />
        <Edge a={NODE.queue} b={NODE.worker} />
        <Edge a={NODE.worker} b={NODE.dlq} />
        <Edge a={NODE.worker} b={NODE.mongo} />
        <Edge a={NODE.mongo} b={NODE.es} />
        <Edge a={NODE.api} b={NODE.redis} />
        <Edge a={NODE.api} b={NODE.mongo} />

        <Box p={NODE.client} label="client" />
        <Box p={NODE.api} label="API" />
        <Box p={NODE.queue} label={`queue ${depth}/${QUEUE_CAPACITY}`} />
        <Box p={NODE.worker} label="worker" />
        <Box p={NODE.dlq} label={`DLQ ${state.dlq.length}`} />
        <Box p={NODE.mongo} label="MongoDB" down={!state.mongoUp} />
        <Box p={NODE.es} label="Elasticsearch" down={!state.esUp} />
        <Box p={NODE.redis} label="Redis" down={!state.redisUp} />

        <rect
          x={NODE.queue.x - 44}
          y={NODE.queue.y + 24}
          width={88 * (depth / QUEUE_CAPACITY)}
          height={4}
          rx={2}
          fill={depth >= QUEUE_CAPACITY ? FAILED : DONE}
        />

        {state.events.map((e) => {
          const idx = e.stage === "queued" ? queuedIndex++ : 0;
          const { p, fill, opacity } = dotProps(e, idx);
          return (
            <circle
              key={e.id}
              cx={p.x}
              cy={p.y}
              r={4}
              fill={fill}
              opacity={opacity}
            />
          );
        })}

        {/* Hollow ring so a read request never reads as a queued event. */}
        {state.probes.map((p) => {
          const { x, y } = probePoint(p);
          return (
            <circle
              key={`probe-${p.id}`}
              cx={x}
              cy={y}
              r={4.5}
              fill="none"
              stroke={p.ok ? DONE : FAILED}
              strokeWidth={1.75}
            />
          );
        })}
      </svg>
      {/* col-reverse pins the scroll to the newest line without a ref. */}
      <div
        role="log"
        aria-live="polite"
        className="flex h-40 flex-col-reverse overflow-y-auto border-t p-2 font-mono text-xs"
        style={{ borderColor: `${INK}22`, color: INK }}
      >
        <div>
          {state.log.slice(-LOG_WINDOW).map((l, i) => (
            <div key={`${l.tick}-${i}`} className="leading-5">
              <span style={{ color: DONE }}>{l.code}</span>{" "}
              <span style={{ opacity: 0.8 }}>{l.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
