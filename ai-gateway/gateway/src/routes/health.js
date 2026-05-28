const express = require("express");
const axios = require("axios");
const { services } = require("../config/services");
const { getBreakerStatus } = require("../middleware/circuitBreaker");

const router = express.Router();

// GET /health — Gateway liveness
router.get("/", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), ts: new Date().toISOString() });
});

// GET /health/services — Check all downstream services
router.get("/services", async (_req, res) => {
  const results = await Promise.allSettled(
    Object.entries(services).map(async ([key, config]) => {
      const start = Date.now();
      try {
        await axios.get(`${config.url}/health`, { timeout: 3000 });
        return { key, name: config.name, status: "healthy", latencyMs: Date.now() - start };
      } catch {
        return { key, name: config.name, status: "unhealthy", latencyMs: Date.now() - start };
      }
    })
  );

  const services_status = results.map((r) => r.value || r.reason);
  const allHealthy = services_status.every((s) => s.status === "healthy");

  res.status(allHealthy ? 200 : 207).json({
    gateway: "healthy",
    services: services_status,
    circuitBreakers: getBreakerStatus(),
    ts: new Date().toISOString(),
  });
});

// GET /metrics — Request counts from Redis
router.get("/metrics", async (req, res) => {
  try {
    const stats = await req.redis.hgetall("gateway:stats:requests");
    res.json({ requests: stats || {}, ts: new Date().toISOString() });
  } catch {
    res.json({ requests: {}, ts: new Date().toISOString() });
  }
});

module.exports = router;
