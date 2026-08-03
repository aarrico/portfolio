"use client";

import { useEffect, useRef, useState } from "react";
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
  const [playing, setPlaying] = useState(true);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    if (reducedRef.current || !playing) return;
    let raf = 0;
    const loop = () => {
      setState((s) => {
        let next = tickSim(s);
        if (
          next.tick % AMBIENT_INTERVAL_TICKS === 0 &&
          next.events.length < AMBIENT_MAX_IN_FLIGHT
        ) {
          next = sendBurst(next, 1);
        }
        return next;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  useEffect(() => {
    const onVis = () => {
      setPlaying(!document.hidden);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const apply = (fn: (s: SimState) => SimState) => {
    setState((s) => {
      const next = fn(s);
      return reducedRef.current ? runUntilQuiescent(next, 10_000) : next;
    });
  };

  return (
    <div className="my-6">
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
        inspection (GET /admin/dlq).
      </p>
    </div>
  );
}
