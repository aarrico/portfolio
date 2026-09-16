"use client";

import { useRef, useState } from "react";
import { useSimulationClock } from "@/lib/use-simulation-clock";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Controls } from "./Controls";
import { Diagram } from "./Diagram";
import {
  fillQueue,
  initialState,
  redriveDlq,
  requestRealtimeStats,
  runUntilQuiescent,
  sendBurst,
  sendPoison,
  setEs,
  setMongo,
  setRedis,
  tickSim,
} from "@/lib/starly/sim";
import type { SimState } from "@/lib/starly/types";

const AMBIENT_INTERVAL_TICKS = 180;
const AMBIENT_MAX_IN_FLIGHT = 4;

export function Pipeline() {
  const [state, setState] = useState<SimState>(initialState);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useSimulationClock(containerRef, !reduced, (steps) => {
    setState((s) => {
      let next = s;
      for (let i = 0; i < steps; i++) {
        next = tickSim(next);
        if (
          next.tick % AMBIENT_INTERVAL_TICKS === 0 &&
          next.events.length < AMBIENT_MAX_IN_FLIGHT
        ) {
          next = sendBurst(next, 1);
        }
      }
      return next;
    });
  });

  const apply = (fn: (s: SimState) => SimState) => {
    setState((s) => {
      const next = fn(s);
      return reduced ? runUntilQuiescent(next, 10_000) : next;
    });
  };

  return (
    <div ref={containerRef} className="my-6">
      <Diagram state={state} />
      <Controls
        state={state}
        onSend={() => apply((s) => sendBurst(s))}
        onFillQueue={() => apply(fillQueue)}
        onPoison={() => apply(sendPoison)}
        onToggleEs={() => apply((s) => setEs(s, !s.esUp))}
        onToggleMongo={() => apply((s) => setMongo(s, !s.mongoUp))}
        onToggleRedis={() => apply((s) => setRedis(s, !s.redisUp))}
        onStats={() => apply(requestRealtimeStats)}
        onRedrive={() => apply(redriveDlq)}
      />
      <p className="mt-2 text-xs opacity-70">
        Simulation of Starly&apos;s behavior as submitted for a take-home
        project, validated in tests against a recorded run of the real system.
        DLQ redrive is the designed operation; the real service ships DLQ
        inspection (GET /admin/dlq). This demo retains the latest 200 log
        entries and 100 dead-letter events; redrive applies to those retained
        events.
      </p>
    </div>
  );
}
