const express = require("express");
const { services } = require("../config/services");
const authMiddleware = require("../middleware/auth");
const rateLimitMiddleware = require("../middleware/rateLimit");
const cacheMiddleware = require("../middleware/cache");
const { getBreaker } = require("../middleware/circuitBreaker");

/**
 * Creates proxy routes for each registered AI service.
 * Route pattern: /api/<serviceKey>/<servicePath>
 */
function createProxyRouter(redis) {
  const router = express.Router();

  for (const [serviceKey, config] of Object.entries(services)) {
    const breaker = getBreaker(serviceKey, config.url, config.timeout);

    router.use(
      `/api/${serviceKey}`,
      authMiddleware,
      rateLimitMiddleware(redis),
      cacheMiddleware(redis, config.cacheTTL),
      async (req, res) => {
        try {
          const result = await breaker.fire({
            method: req.method,
            path: req.path,
            data: req.body,
            headers: {
              "Content-Type": "application/json",
              "X-Trace-ID": req.traceId,
              "X-User-ID": req.user?.userId,
              "X-User-Tier": req.user?.tier,
            },
          });

          // Track request count in Redis for dashboard
          await redis.hincrby("gateway:stats:requests", serviceKey, 1).catch(() => {});

          res.json(result);
        } catch (err) {
          if (err.code === "EOPENBREAKER") {
            return res.status(503).json({
              error: "Service temporarily unavailable",
              service: config.name,
              traceId: req.traceId,
            });
          }
          const status = err.response?.status || 502;
          res.status(status).json({
            error: err.response?.data?.error || err.message,
            service: config.name,
            traceId: req.traceId,
          });
        }
      }
    );
  }

  return router;
}

module.exports = createProxyRouter;
