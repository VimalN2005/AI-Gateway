const crypto = require("crypto");

/**
 * Redis response cache middleware.
 * Cache key = hash(serviceKey + path + body).
 * TTL configured per service.
 */
function cacheMiddleware(redis, ttl = 300) {
  return async (req, res, next) => {
    if (req.method !== "POST" && req.method !== "GET") return next();

    const raw = `${req.path}:${JSON.stringify(req.body)}`;
    const cacheKey = "cache:" + crypto.createHash("sha256").update(raw).digest("hex");

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        return res.json(JSON.parse(cached));
      }
    } catch (_) {}

    // Intercept res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      res.setHeader("X-Cache", "MISS");
      try {
        await redis.setex(cacheKey, ttl, JSON.stringify(data));
      } catch (_) {}
      return originalJson(data);
    };

    next();
  };
}

module.exports = cacheMiddleware;
