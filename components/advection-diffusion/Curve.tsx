"use client";

import { useEffect, useRef } from "react";

type CurveProps = {
  snapshot: { t: number; x: Float64Array; u: Float64Array };
  uMax: number;
  className?: string;
};

const PDE_WATERMARK = "∂U/∂t + v ∂U/∂x = D ∂²U/∂x²";

export function Curve({ snapshot, uMax, className }: CurveProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    ctx.fillStyle = "#0a0816";
    ctx.fillRect(0, 0, cssW, cssH);

    ctx.strokeStyle = "rgba(255, 64, 192, 0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 12; i++) {
      const px = (i / 12) * cssW;
      ctx.moveTo(px, 0);
      ctx.lineTo(px, cssH);
    }
    for (let j = 0; j <= 8; j++) {
      const py = (j / 8) * cssH;
      ctx.moveTo(0, py);
      ctx.lineTo(cssW, py);
    }
    ctx.stroke();

    const { x, u } = snapshot;
    const xMin = x[0] ?? 0;
    const xMax = x[x.length - 1] ?? 1;
    const xRange = xMax - xMin || 1;
    const pad = 8;
    const plotH = cssH - pad * 2;
    const yScale = uMax > 0 ? plotH / uMax : 0;

    ctx.strokeStyle = "#00f0ff";
    ctx.shadowColor = "rgba(0, 240, 255, 0.65)";
    ctx.shadowBlur = 8;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < x.length; i++) {
      const px = ((x[i]! - xMin) / xRange) * cssW;
      const py = cssH - pad - (u[i] ?? 0) * yScale;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "12px ui-monospace, SFMono-Regular, monospace";
    ctx.fillText(`t = ${snapshot.t.toFixed(2)}`, 10, 18);
    ctx.fillText(PDE_WATERMARK, 10, cssH - 10);
  }, [snapshot, uMax]);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "h-48 w-full"}
      role="img"
      aria-label={`Concentration curve at t = ${snapshot.t.toFixed(2)}`}
    />
  );
}
