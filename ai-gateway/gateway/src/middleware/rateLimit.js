const { rateLimits } = require("../config/services");

/**
 * Redis-backed sliding window rate limiter.
 * Limits per user per minute based on their tier.
 */
function rateLimitMiddleware(redis) {
  return async (req, res, next) => {
    const userId = req.user?.userId || req.ip;
    const tier = req.user?.tier || "free";
    const limit = rateLimits[tier]?.rpm ?? rateLimits.free.rpm;

    if (limit === Infinity) return next(); // enterprise bypass

    const key = `ratelimit:${userId}:${Math.floor(Date.now() / 60000)}`;

    try {
      const current = await redis.incr(key);
      if (current === 1) await redis.expire(key, 65); // slightly over 60s for safety

      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, limit - current));
      res.setHeader("X-RateLimit-Tier", tier);

      if (current > limit) {
        return res.status(429).json({
          error: "Rate limit exceeded",
          tier,
          limit,
          retryAfter: "60s",
        });
      }
      next();
    } catch (err) {
      // Redis unavailable — fail open (don't block requests)
      console.error("[RateLimit] Redis error, failing open:", err.message);
      next();
    }
  };
}

module.exports = rateLimitMiddleware;
