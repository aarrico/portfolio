import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Alexander Arrico — Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "80px",
          background:
            "linear-gradient(180deg, #0d0820 0%, #2a3658 28%, #6b3a7a 55%, #a8275a 78%, #ff8559 100%)",
          fontFamily: "sans-serif",
          color: "#f5ede0",
          position: "relative",
        }}
      >
        <svg
          width="420"
          height="420"
          viewBox="0 0 200 200"
          style={{ position: "absolute", top: 80, right: 80 }}
        >
          <defs>
            <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff8559" />
              <stop offset="55%" stopColor="#ffb347" />
              <stop offset="100%" stopColor="#a8275a" />
            </linearGradient>
            <mask id="cuts">
              <rect width="200" height="200" fill="white" />
              <g fill="black">
                <rect x="0" y="118" width="200" height="2" />
                <rect x="0" y="128" width="200" height="3" />
                <rect x="0" y="140" width="200" height="4" />
                <rect x="0" y="153" width="200" height="5" />
                <rect x="0" y="167" width="200" height="6" />
                <rect x="0" y="183" width="200" height="8" />
              </g>
            </mask>
          </defs>
          <circle cx="100" cy="100" r="68" fill="url(#sun)" mask="url(#cuts)" />
        </svg>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            opacity: 0.7,
            marginBottom: 24,
          }}
        >
          arrico.me
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          Alexander Arrico
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 40,
            marginTop: 16,
            opacity: 0.85,
          }}
        >
          Software Engineer · Tech Leader
        </div>
      </div>
    ),
    { ...size },
  );
}
