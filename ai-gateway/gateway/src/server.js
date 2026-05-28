require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Redis = require("ioredis");

const loggerMiddleware = require("./middleware/logger");
const createProxyRouter = require("./routes/proxy");
const healthRouter = require("./routes/health");

const app = express();

// Redis client
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 100, 3000),
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err.message));

// Attach redis to req for use in route handlers
app.use((req, _res, next) => { req.redis = redis; next(); });

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(loggerMiddleware);

// Routes
app.use("/health", healthRouter);
app.use("/metrics", async (req, res) => {
  const stats = await redis.hgetall("gateway:stats:requests").catch(() => ({}));
  res.json({ requests: stats || {}, uptime: process.uptime(), ts: new Date().toISOString() });
});
app.use(createProxyRouter(redis));

// 404
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error("[Gateway Error]", err);
  res.status(500).json({ error: "Internal gateway error" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 AI Gateway running on http://localhost:${PORT}`);
  console.log(`   Routes: /api/nlp | /api/vision | /api/embed`);
  console.log(`   Health: /health | /health/services | /metrics`);
});
