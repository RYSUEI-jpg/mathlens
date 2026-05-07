import { ImageResponse } from "next/og";

export const alt = "MathLens - 数学の問題を撮って学ぼう";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 28,
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 80,
              fontWeight: 800,
              color: "#6366f1",
            }}
          >
            M
          </div>
          <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -2 }}>
            MathLens
          </div>
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 40,
            fontWeight: 600,
            opacity: 0.95,
            textAlign: "center",
          }}
        >
          数学の問題を撮って学ぼう
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 26,
            opacity: 0.85,
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          AIが画像から問題を読み取り、考え方から答えまで丁寧に解説
        </div>
        <div
          style={{
            marginTop: 48,
            display: "flex",
            gap: 16,
            fontSize: 22,
          }}
        >
          <span style={{ background: "rgba(255,255,255,0.18)", padding: "8px 20px", borderRadius: 999 }}>
            📷 撮影
          </span>
          <span style={{ background: "rgba(255,255,255,0.18)", padding: "8px 20px", borderRadius: 999 }}>
            ✏️ テキスト
          </span>
          <span style={{ background: "rgba(255,255,255,0.18)", padding: "8px 20px", borderRadius: 999 }}>
            📐 図解
          </span>
          <span style={{ background: "rgba(255,255,255,0.18)", padding: "8px 20px", borderRadius: 999 }}>
            💬 追加質問
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
