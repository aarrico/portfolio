"use client";

import { useEffect, useRef } from "react";

type SceneProps = {
  snapshot: { t: number; x: Float64Array; u: Float64Array };
  uMax: number;
  className?: string;
};

type Particle = { px: number; py: number; vx: number; life: number };

export function Scene({ snapshot, uMax, className }: SceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (canvas.width !== cssW * dpr) canvas.width = cssW * dpr;
    if (canvas.height !== cssH * dpr) canvas.height = cssH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const sky = ctx.createLinearGradient(0, 0, 0, cssH);
    sky.addColorStop(0, "#1a0b2e");
    sky.addColorStop(1, "#2d1052");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, cssW, cssH);

    ctx.fillStyle = "#0a0816";
    ctx.fillRect(0, cssH - 24, cssW, 24);

    const stackX = cssW * 0.08;
    const stackBaseY = cssH - 24;
    const stackTopY = cssH * 0.45;
    const stackW = 18;
    ctx.fillStyle = "#3a2a4a";
    ctx.fillRect(stackX - stackW / 2, stackTopY, stackW, stackBaseY - stackTopY);
    ctx.fillStyle = "#4a3a5a";
    ctx.fillRect(stackX - stackW / 2 - 2, stackTopY - 6, stackW + 4, 6);

    const { x, u } = snapshot;
    const xMin = x[0] ?? 0;
    const xMax = x[x.length - 1] ?? 1;
    const xRange = xMax - xMin || 1;
    const screenXOf = (xVal: number) =>
      stackX + ((xVal - xMin) / xRange) * (cssW - stackX);

    const plumeCenterY = stackTopY - 4;
    const bandHalfHeight = 32;
    for (let i = 0; i < x.length - 1; i++) {
      const px0 = screenXOf(x[i]!);
      const px1 = screenXOf(x[i + 1]!);
      const intensity = Math.max(0, Math.min(1, (u[i] ?? 0) / (uMax || 1)));
      if (intensity < 0.01) continue;
      const w = px1 - px0;
      for (let dy = -bandHalfHeight; dy <= bandHalfHeight; dy += 2) {
        const fall = Math.exp(-(dy * dy) / (2 * 14 * 14));
        const alpha = intensity * fall * 0.85;
        if (alpha < 0.02) continue;
        ctx.fillStyle = `rgba(248, 240, 230, ${alpha.toFixed(3)})`;
        ctx.fillRect(px0, plumeCenterY + dy, w + 1, 2);
      }
    }

    const dt =
      lastTimeRef.current < 0
        ? 0
        : Math.max(0, snapshot.t - lastTimeRef.current);
    lastTimeRef.current = snapshot.t;

    const particles = particlesRef.current;
    const stackIntensity = Math.max(
      0,
      Math.min(1, (u[0] ?? 0) / (uMax || 1)),
    );
    const emitCount = Math.floor(dt * 80 * stackIntensity);
    for (let k = 0; k < emitCount; k++) {
      particles.push({
        px: stackX,
        py: plumeCenterY + (Math.random() - 0.5) * 10,
        vx: 30 + Math.random() * 40,
        life: 1.0,
      });
    }
    for (const p of particles) {
      p.px += p.vx * dt;
      p.life -= dt * 0.25;
    }
    particlesRef.current = particles.filter(
      (p) => p.life > 0 && p.px < cssW + 10,
    );
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    for (const p of particlesRef.current) {
      ctx.globalAlpha = Math.max(0, p.life) * 0.5;
      ctx.fillRect(p.px, p.py, 2, 2);
    }
    ctx.globalAlpha = 1;
  }, [snapshot, uMax]);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "h-64 w-full"}
      role="img"
      aria-label={`Smokestack plume at t = ${snapshot.t.toFixed(2)}`}
    />
  );
}
