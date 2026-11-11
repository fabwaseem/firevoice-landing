import { ImageResponse } from "next/og";

export const alt = "FireVoice: natural voices made on your own computer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const bars = Array.from({ length: 64 }, (_, i) => 0.18 + Math.abs(Math.sin(i * 0.55) * Math.cos(i * 0.21)) * 0.82);

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(circle at 78% 40%, #4a1406 0%, #120604 38%, #07080b 70%)",
          color: "#f3f4f7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #ff8a4c, #ff4d2e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            {[10, 24, 36, 24, 10].map((h, i) => (
              <div key={i} style={{ width: 5, height: h, borderRadius: 3, background: "#fff" }} />
            ))}
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>FireVoice</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -4, lineHeight: 1, maxWidth: 900 }}>
            Natural voices, made on your own computer.
          </div>
          <div style={{ fontSize: 30, color: "#9aa0ae" }}>
            Speech, voice cloning, dictation and dubbing. Private, on your GPU.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, height: 70 }}>
          {bars.map((v, i) => (
            <div
              key={i}
              style={{
                width: 9,
                height: Math.round(v * 70),
                borderRadius: 5,
                background: i < 40 ? "linear-gradient(180deg,#ffb184,#ff5a2d)" : "#2a2d36",
              }}
            />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
