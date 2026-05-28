import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0d1117", border: "1px solid #1e2a38", padding: "8px 12px", borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem" }}>
      <p style={{ color: "#4a6280", marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function MetricsPanel({ requests, latencyHistory }) {
  const barData = Object.entries(requests || {}).map(([key, value]) => ({
    name: key, requests: parseInt(value),
  }));

  return (
    <div style={s.card}>
      <h3 style={s.title}><span style={s.accent}>◈</span> REQUEST METRICS</h3>
      <div style={s.grid}>
        <div style={s.chartBox}>
          <p style={s.chartLabel}>REQUESTS BY SERVICE</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid stroke="#1e2a38" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#4a6280", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4a6280", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="requests" fill="#00ff95" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={s.chartBox}>
          <p style={s.chartLabel}>LATENCY OVER TIME (ms)</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={latencyHistory} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid stroke="#1e2a38" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="t" tick={{ fill: "#4a6280", fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4a6280", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="nlp" stroke="#00ff95" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="vision" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="embed" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div style={s.legend}>
            {[["nlp","#00ff95"],["vision","#3b82f6"],["embed","#f59e0b"]].map(([k,c]) => (
              <span key={k} style={s.legendItem}><span style={{ ...s.legendDot, background: c }} />{k}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  card: { background: "#0d1117", border: "1px solid #1e2a38", borderRadius: 12, padding: "1.2rem" },
  title: { fontSize: "0.7rem", letterSpacing: "0.15em", color: "#4a6280", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 },
  accent: { color: "#00ff95" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  chartBox: { background: "#080c10", borderRadius: 10, padding: "0.8rem" },
  chartLabel: { fontSize: "0.62rem", letterSpacing: "0.1em", color: "#4a6280", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" },
  legend: { display: "flex", gap: 16, marginTop: 8, justifyContent: "center" },
  legendItem: { display: "flex", alignItems: "center", gap: 5, fontSize: "0.65rem", color: "#4a6280", fontFamily: "'JetBrains Mono', monospace" },
  legendDot: { width: 8, height: 8, borderRadius: "50%" },
};
