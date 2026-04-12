import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background:
            "linear-gradient(135deg, #f8fafc 0%, #ecfdf5 42%, #ffffff 100%)",
          color: "#0f172a",
          fontFamily: "system-ui, sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top left, rgba(16,185,129,0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(14,165,233,0.12), transparent 24%)",
          }}
        />

        <div
          style={{
            display: "flex",
            width: "100%",
            padding: "56px 64px",
            justifyContent: "space-between",
            alignItems: "stretch",
            gap: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "62%",
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 32,
                  fontWeight: 800,
                  color: "#10b981",
                  letterSpacing: "-0.04em",
                }}
              >
                PocketDiet
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 68,
                  lineHeight: 1,
                  letterSpacing: "-0.06em",
                  fontWeight: 800,
                  maxWidth: 620,
                }}
              >
                La dieta del nutrizionista, piu chiara da seguire
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 28,
                  lineHeight: 1.35,
                  color: "#475569",
                  maxWidth: 660,
                }}
              >
                Pasti, porzioni, alternative e lista della spesa in un formato
                semplice da consultare ogni giorno dal telefono.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              {[
                "PDF, foto e testo",
                "Piu ordine quotidiano",
                "Non sostituisce il nutrizionista",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    padding: "12px 18px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.88)",
                    border: "1px solid rgba(148,163,184,0.22)",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#334155",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              width: "34%",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                width: "100%",
                padding: 22,
                borderRadius: 34,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.97), rgba(248,250,252,0.94))",
                border: "1px solid rgba(148,163,184,0.2)",
                boxShadow: "0 22px 50px rgba(15,23,42,0.10)",
              }}
            >
              <div style={{ display: "flex", gap: 10 }}>
                {["Oggi", "Menu"].map((chip) => (
                  <div
                    key={chip}
                    style={{
                      display: "flex",
                      padding: "8px 14px",
                      borderRadius: 999,
                      background: "rgba(15,23,42,0.06)",
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#334155",
                    }}
                  >
                    {chip}
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  padding: 20,
                  borderRadius: 24,
                  background:
                    "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                  color: "#ffffff",
                }}
              >
                <div style={{ display: "flex", fontSize: 28, fontWeight: 800 }}>
                  Cosa mangi oggi
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 18,
                    color: "rgba(255,255,255,0.94)",
                  }}
                >
                  Tutto in una schermata semplice
                </div>
              </div>
              {[
                ["Colazione", "Yogurt greco, avena, fragole"],
                ["Pranzo", "Riso basmati, pollo, zucchine"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    padding: "16px 18px",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.92)",
                    border: "1px solid rgba(148,163,184,0.18)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: 14,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#10b981",
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
