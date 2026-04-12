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
            "linear-gradient(135deg, #f8fafc 0%, #ffffff 46%, #ecfdf5 100%)",
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
              "radial-gradient(circle at top right, rgba(16,185,129,0.14), transparent 26%), radial-gradient(circle at bottom left, rgba(148,163,184,0.14), transparent 24%)",
          }}
        />

        <div
          style={{
            display: "flex",
            width: "100%",
            padding: "60px 64px",
            justifyContent: "space-between",
            alignItems: "stretch",
            gap: 42,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "58%",
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
                PocketDiet Upload
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 66,
                  lineHeight: 1,
                  letterSpacing: "-0.06em",
                  fontWeight: 800,
                  maxWidth: 590,
                }}
              >
                Importa il piano alimentare in pochi secondi
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 28,
                  lineHeight: 1.35,
                  color: "#475569",
                  maxWidth: 620,
                }}
              >
                Carica PDF, foto o testo del piano del nutrizionista e
                trasformalo in una versione piu chiara da consultare dal
                telefono.
              </div>
            </div>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {["Upload diretto", "PDF, foto e testo", "Consultazione piu chiara"].map(
                (item) => (
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
                ),
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              width: "38%",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                width: "100%",
                padding: 24,
                borderRadius: 34,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94))",
                border: "1px solid rgba(148,163,184,0.22)",
                boxShadow: "0 22px 50px rgba(15,23,42,0.10)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 220,
                  borderRadius: 28,
                  border: "3px dashed rgba(100,116,139,0.42)",
                  background: "rgba(255,255,255,0.94)",
                  color: "#334155",
                  textAlign: "center",
                  padding: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", fontSize: 48 }}>↑</div>
                  <div
                    style={{ display: "flex", fontSize: 26, fontWeight: 800 }}
                  >
                    Carica la tua dieta
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 18,
                      lineHeight: 1.4,
                      color: "#64748b",
                    }}
                  >
                    PDF, foto o testo del piano alimentare
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {[
                  "1. Caricamento file",
                  "2. Analisi della dieta",
                  "3. Preparazione dei menu",
                ].map((step) => (
                  <div
                    key={step}
                    style={{
                      display: "flex",
                      padding: "12px 16px",
                      borderRadius: 18,
                      background: "rgba(15,23,42,0.05)",
                      color: "#334155",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
