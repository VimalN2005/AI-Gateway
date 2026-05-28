import React from "react";

const SERVICES = [
  { key: "nlp", label: "NLP Service", port: 5001, icon: "🧠" },
  { key: "vision", label: "Vision Service", port: 5002, icon: "👁️" },
  { key: "embed", label: "Embedding Service", port: 5003, icon: "🔢" },
];

export default function ServiceHealth({ data }) {
  return (
    <div style={s.card}>
      <h3 style={s.title}><span style={s.accent}>◈</span> SERVICE STATUS</h3>
      <div style={s.grid}>
        {SERVICES.map((svc) => {
          const info = data?.services?.find((x) => x.key === svc.key);
          const breaker = data?.circuitBreakers?.[svc.key];
          const healthy = info?.status === "healthy";
          const cbState = breaker?.state || "closed";

          return (
            <div key={svc.key} style={{ ...s.serviceCard, borderColor: healthy ? "#00ff9540" : "#ff4d4d40" }}>
              <div style={s.serviceTop}>
                <span style={s.serviceIcon}>{svc.icon}</span>
                <div>
                  <p style={s.serviceName}>{svc.label}</p>
                  <p style={s.servicePort}>:{svc.port}</p>
                </div>
                <div style={{ ...s.statusDot, background: healthy ? "#00ff95" : "#ff4d4d", boxShadow: `0 0 8px ${healthy ? "#00ff95" : "#ff4d4d"}` }} />
              </div>
              <div style={s.serviceStats}>
                <div style={s.stat}>
                  <span style={s.statLabel}>STATUS</span>
                  <span style={{ ...s.statVal, color: healthy ? "#00ff95" : "#ff4d4d" }}>{info?.status || "unknown"}</span>
                </div>
                <div style={s.stat}>
                  <span style={s.statLabel}>LATENCY</span>
                  <span style={s.statVal}>{info?.latencyMs ?? "—"}ms</span>
                </div>
                <div style={s.stat}>
                  <span style={s.statLabel}>CIRCUIT</span>
                  <span style={{ ...s.statVal, color: cbState === "open" ? "#ff4d4d" : cbState === "half_open" ? "#fbbf24" : "#00ff95" }}>
                    {cbState}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  card: { background: "#0d1117", border: "1px solid #1e2a38", borderRadius: 12, padding: "1.2rem" },
  title: { fontSize: "0.7rem", letterSpacing: "0.15em", color: "#4a6280", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 },
  accent: { color: "#00ff95", fontSize: "0.9rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 },
  serviceCard: { background: "#080c10", border: "1px solid", borderRadius: 10, padding: "1rem", transition: "border-color 0.3s" },
  serviceTop: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  serviceIcon: { fontSize: "1.3rem" },
  serviceName: { fontSize: "0.82rem", fontWeight: 700, color: "#e2e8f0" },
  servicePort: { fontSize: "0.68rem", color: "#4a6280", fontFamily: "'JetBrains Mono', monospace" },
  statusDot: { marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", animation: "pulse-dot 2s infinite" },
  serviceStats: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 },
  stat: { display: "flex", flexDirection: "column", gap: 2 },
  statLabel: { fontSize: "0.6rem", color: "#4a6280", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono', monospace" },
  statVal: { fontSize: "0.72rem", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8" },
};
