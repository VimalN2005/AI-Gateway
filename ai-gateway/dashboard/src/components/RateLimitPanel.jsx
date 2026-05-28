import React from "react";

const TIERS = [
  { key: "free", label: "FREE", rpm: 10, color: "#4a6280" },
  { key: "pro", label: "PRO", rpm: 100, color: "#3b82f6" },
  { key: "enterprise", label: "ENTERPRISE", rpm: "∞", color: "#00ff95" },
];

export default function RateLimitPanel({ rateLimitStats }) {
  return (
    <div style={s.card}>
      <h3 style={s.title}><span style={s.accent}>◈</span> RATE LIMIT TIERS</h3>
      <div style={s.grid}>
        {TIERS.map((t) => (
          <div key={t.key} style={{ ...s.tierCard, borderColor: t.color + "40" }}>
            <span style={{ ...s.tierLabel, color: t.color }}>{t.label}</span>
            <p style={s.rpm}>{t.rpm}<span style={s.rpmUnit}> req/min</span></p>
            <p style={s.usage}>
              Active users: <span style={{ color: t.color }}>{rateLimitStats?.[t.key] || 0}</span>
            </p>
          </div>
        ))}
      </div>
      <div style={s.note}>
        Rate limits enforced via Redis sliding window. Upgrades instant via token re-issue.
      </div>
    </div>
  );
}

const s = {
  card: { background: "#0d1117", border: "1px solid #1e2a38", borderRadius: 12, padding: "1.2rem" },
  title: { fontSize: "0.7rem", letterSpacing: "0.15em", color: "#4a6280", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 },
  accent: { color: "#00ff95" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 12 },
  tierCard: { background: "#080c10", border: "1px solid", borderRadius: 10, padding: "0.9rem", textAlign: "center" },
  tierLabel: { fontSize: "0.62rem", letterSpacing: "0.15em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 },
  rpm: { fontSize: "1.6rem", fontWeight: 800, color: "#e2e8f0", marginTop: 6, fontFamily: "'JetBrains Mono', monospace" },
  rpmUnit: { fontSize: "0.65rem", color: "#4a6280" },
  usage: { fontSize: "0.68rem", color: "#4a6280", marginTop: 6, fontFamily: "'JetBrains Mono', monospace" },
  note: { fontSize: "0.68rem", color: "#334155", fontFamily: "'JetBrains Mono', monospace", textAlign: "center" },
};
