import React, { useState, useEffect, useCallback } from "react";
import ServiceHealth from "./components/ServiceHealth";
import MetricsPanel from "./components/MetricsPanel";
import RequestLog from "./components/RequestLog";
import RateLimitPanel from "./components/RateLimitPanel";

const GATEWAY = import.meta.env.VITE_GATEWAY_URL || "http://localhost:8000";
const MAX_LOGS = 50;
const MAX_HISTORY = 20;

// Simulate mock data when gateway unreachable
function mockHealth() {
  return {
    gateway: "healthy",
    services: [
      { key: "nlp", name: "NLP Service", status: "healthy", latencyMs: Math.round(20 + Math.random() * 30) },
      { key: "vision", name: "Vision Service", status: "healthy", latencyMs: Math.round(30 + Math.random() * 50) },
      { key: "embed", name: "Embedding Service", status: "healthy", latencyMs: Math.round(15 + Math.random() * 20) },
    ],
    circuitBreakers: { nlp: { state: "closed" }, vision: { state: "closed" }, embed: { state: "closed" } },
  };
}

function mockMetrics() {
  return { requests: { nlp: String(Math.round(100 + Math.random() * 50)), vision: String(Math.round(60 + Math.random() * 30)), embed: String(Math.round(200 + Math.random() * 80)) } };
}

export default function App() {
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [logs, setLogs] = useState([]);
  const [latencyHistory, setLatencyHistory] = useState([]);
  const [uptime, setUptime] = useState(0);
  const [connected, setConnected] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [hRes, mRes] = await Promise.all([
        fetch(`${GATEWAY}/health/services`),
        fetch(`${GATEWAY}/metrics`),
      ]);
      const h = await hRes.json();
      const m = await mRes.json();
      setHealth(h);
      setMetrics(m.requests || {});
      setConnected(true);

      // Build latency history point
      const t = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLatencyHistory((prev) => {
        const svcs = h.services || [];
        const point = { t };
        for (const s of svcs) point[s.key] = s.latencyMs;
        return [...prev.slice(-MAX_HISTORY + 1), point];
      });
    } catch {
      // Use mock data for demo
      const h = mockHealth();
      const m = mockMetrics();
      setHealth(h);
      setMetrics(m.requests);
      setConnected(false);

      const t = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLatencyHistory((prev) => {
        const point = { t, nlp: 20 + Math.round(Math.random() * 30), vision: 30 + Math.round(Math.random() * 50), embed: 15 + Math.round(Math.random() * 20) };
        return [...prev.slice(-MAX_HISTORY + 1), point];
      });
    }
    setUptime((u) => u + 5);

    // Simulate a log entry
    const services = ["nlp", "vision", "embed"];
    const paths = ["/analyze", "/sentiment", "/classify", "/detect", "/encode", "/similarity"];
    const statuses = [200, 200, 200, 200, 201, 429, 401];
    setLogs((prev) => {
      const entry = {
        status: statuses[Math.floor(Math.random() * statuses.length)],
        method: "POST",
        path: `/api/${services[Math.floor(Math.random() * services.length)]}${paths[Math.floor(Math.random() * paths.length)]}`,
        latencyMs: Math.round(15 + Math.random() * 80),
        userId: ["user_abc123", "user_xyz789", "anonymous"][Math.floor(Math.random() * 3)],
        tier: ["free", "pro", "enterprise"][Math.floor(Math.random() * 3)],
        cache: Math.random() > 0.6 ? "HIT" : "MISS",
        ts: new Date().toISOString(),
      };
      return [...prev.slice(-MAX_LOGS + 1), entry];
    });
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 5000);
    return () => clearInterval(iv);
  }, [fetchData]);

  const totalRequests = Object.values(metrics).reduce((s, v) => s + parseInt(v || 0), 0);
  const avgLatency = health?.services?.length
    ? Math.round(health.services.reduce((s, x) => s + (x.latencyMs || 0), 0) / health.services.length)
    : 0;
  const errorRate = logs.length
    ? Math.round((logs.filter((l) => l.status >= 400).length / logs.length) * 100)
    : 0;
  const cacheHitRate = logs.length
    ? Math.round((logs.filter((l) => l.cache === "HIT").length / logs.length) * 100)
    : 0;

  return (
    <div style={layout.root}>
      {/* Header */}
      <header style={layout.header}>
        <div style={layout.headerLeft}>
          <div style={layout.logo}>
            <span style={layout.logoIcon}>⬡</span>
            <div>
              <p style={layout.logoTitle}>AI GATEWAY</p>
              <p style={layout.logoSub}>CONTROL PLANE</p>
            </div>
          </div>
        </div>
        <div style={layout.headerRight}>
          <div style={layout.connBadge}>
            <span style={{ ...layout.connDot, background: connected ? "#00ff95" : "#f59e0b", boxShadow: `0 0 6px ${connected ? "#00ff95" : "#f59e0b"}` }} />
            <span style={layout.connLabel}>{connected ? "LIVE" : "DEMO MODE"}</span>
          </div>
          <span style={layout.uptime}>UPTIME {String(Math.floor(uptime / 60)).padStart(2, "0")}:{String(uptime % 60).padStart(2, "0")}</span>
        </div>
      </header>

      {/* KPI strip */}
      <div style={layout.kpiStrip}>
        {[
          { label: "TOTAL REQUESTS", val: totalRequests.toLocaleString(), color: "#00ff95" },
          { label: "AVG LATENCY", val: `${avgLatency}ms`, color: "#3b82f6" },
          { label: "ERROR RATE", val: `${errorRate}%`, color: errorRate > 5 ? "#ff4d4d" : "#00ff95" },
          { label: "CACHE HIT RATE", val: `${cacheHitRate}%`, color: "#f59e0b" },
          { label: "SERVICES", val: `${health?.services?.filter(s => s.status === "healthy").length ?? 0} / 3`, color: "#a78bfa" },
        ].map((kpi) => (
          <div key={kpi.label} style={layout.kpiCard}>
            <p style={layout.kpiLabel}>{kpi.label}</p>
            <p style={{ ...layout.kpiVal, color: kpi.color }}>{kpi.val}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={layout.main}>
        <div style={layout.col}>
          <ServiceHealth data={health} />
          <RateLimitPanel rateLimitStats={{}} />
        </div>
        <div style={{ ...layout.col, flex: 1.6 }}>
          <MetricsPanel requests={metrics} latencyHistory={latencyHistory} />
          <RequestLog logs={logs} />
        </div>
      </div>
    </div>
  );
}

const layout = {
  root: { minHeight: "100vh", background: "#080c10", padding: "0 0 2rem" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", borderBottom: "1px solid #1e2a38", background: "#0d1117" },
  headerLeft: { display: "flex", alignItems: "center", gap: 16 },
  logo: { display: "flex", alignItems: "center", gap: 12 },
  logoIcon: { fontSize: "1.8rem", color: "#00ff95", lineHeight: 1 },
  logoTitle: { fontSize: "1rem", fontWeight: 800, color: "#e2e8f0", letterSpacing: "0.1em" },
  logoSub: { fontSize: "0.6rem", color: "#4a6280", letterSpacing: "0.2em", fontFamily: "'JetBrains Mono', monospace" },
  headerRight: { display: "flex", alignItems: "center", gap: 20 },
  connBadge: { display: "flex", alignItems: "center", gap: 6, background: "#080c10", border: "1px solid #1e2a38", borderRadius: 20, padding: "4px 12px" },
  connDot: { width: 8, height: 8, borderRadius: "50%", animation: "pulse-dot 2s infinite" },
  connLabel: { fontSize: "0.65rem", fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8", letterSpacing: "0.1em" },
  uptime: { fontSize: "0.65rem", fontFamily: "'JetBrains Mono', monospace", color: "#334155", letterSpacing: "0.08em" },
  kpiStrip: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1, background: "#1e2a38", borderBottom: "1px solid #1e2a38" },
  kpiCard: { background: "#0d1117", padding: "0.9rem 1.4rem" },
  kpiLabel: { fontSize: "0.6rem", letterSpacing: "0.12em", color: "#4a6280", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 },
  kpiVal: { fontSize: "1.5rem", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" },
  main: { display: "flex", gap: 12, padding: "1rem 1.5rem", alignItems: "flex-start" },
  col: { display: "flex", flexDirection: "column", gap: 12, flex: 1 },
};
