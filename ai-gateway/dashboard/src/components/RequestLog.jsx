import React from "react";

const STATUS_COLOR = { "2": "#00ff95", "4": "#f59e0b", "5": "#ff4d4d" };

export default function RequestLog({ logs }) {
  return (
    <div style={s.card}>
      <h3 style={s.title}><span style={s.accent}>◈</span> LIVE REQUEST LOG</h3>
      <div style={s.logBox}>
        {logs.length === 0 && <p style={s.empty}>Waiting for requests...</p>}
        {[...logs].reverse().map((log, i) => {
          const statusGroup = String(log.status)[0];
          const color = STATUS_COLOR[statusGroup] || "#94a3b8";
          return (
            <div key={i} style={{ ...s.logRow, animation: i === 0 ? "fadeIn 0.3s ease" : "none" }}>
              <span style={{ ...s.status, color }}>{log.status}</span>
              <span style={s.method}>{log.method}</span>
              <span style={s.path}>{log.path}</span>
              <span style={s.latency}>{log.latencyMs}ms</span>
              <span style={s.user}>{log.userId}</span>
              <span style={{ ...s.cache, color: log.cache === "HIT" ? "#00ff95" : "#4a6280" }}>{log.cache}</span>
              <span style={s.ts}>{new Date(log.ts).toLocaleTimeString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const mono = { fontFamily: "'JetBrains Mono', monospace" };
const s = {
  card: { background: "#0d1117", border: "1px solid #1e2a38", borderRadius: 12, padding: "1.2rem" },
  title: { fontSize: "0.7rem", letterSpacing: "0.15em", color: "#4a6280", marginBottom: "0.8rem", display: "flex", alignItems: "center", gap: 8 },
  accent: { color: "#00ff95" },
  logBox: { maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 },
  empty: { color: "#4a6280", fontSize: "0.78rem", ...mono, textAlign: "center", padding: "2rem" },
  logRow: { display: "grid", gridTemplateColumns: "44px 52px 1fr 64px 100px 48px 80px", gap: 8, alignItems: "center", padding: "5px 8px", borderRadius: 6, background: "#080c10", ...mono, fontSize: "0.72rem" },
  status: { fontWeight: 700 },
  method: { color: "#3b82f6" },
  path: { color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  latency: { color: "#f59e0b", textAlign: "right" },
  user: { color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  cache: { textAlign: "center", fontSize: "0.65rem" },
  ts: { color: "#334155", fontSize: "0.65rem" },
};
