import type { SimState } from "@/lib/starly/types";

type ControlsProps = {
  state: SimState;
  onSend: () => void;
  onFillQueue: () => void;
  onPoison: () => void;
  onToggleEs: () => void;
  onToggleMongo: () => void;
  onToggleRedis: () => void;
  onStats: () => void;
  onRedrive: () => void;
};

const btn =
  "rounded-md border border-[color:var(--accent)]/40 px-3 py-1 font-mono text-sm transition hover:bg-[color:var(--accent)]/10 disabled:opacity-40 disabled:hover:bg-transparent";

export function Controls({
  state,
  onSend,
  onFillQueue,
  onPoison,
  onToggleEs,
  onToggleMongo,
  onToggleRedis,
  onStats,
  onRedrive,
}: ControlsProps) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <button type="button" className={btn} onClick={onSend}>
        Send events
      </button>
      <button type="button" className={btn} onClick={onFillQueue}>
        Fill queue
      </button>
      <button type="button" className={btn} onClick={onPoison}>
        Poison message
      </button>
      <button type="button" className={btn} onClick={onToggleEs}>
        {state.esUp ? "Kill Elasticsearch" : "Revive Elasticsearch"}
      </button>
      <button type="button" className={btn} onClick={onToggleMongo}>
        {state.mongoUp ? "Kill MongoDB" : "Revive MongoDB"}
      </button>
      <button type="button" className={btn} onClick={onToggleRedis}>
        {state.redisUp ? "Kill Redis" : "Revive Redis"}
      </button>
      <button type="button" className={btn} onClick={onStats}>
        Realtime stats
      </button>
      <button
        type="button"
        className={btn}
        onClick={onRedrive}
        disabled={state.dlq.length === 0}
      >
        Redrive DLQ
      </button>
    </div>
  );
}
