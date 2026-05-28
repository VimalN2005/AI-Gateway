const { v4: uuidv4 } = require("uuid");

/**
 * Structured JSON request logger.
 * Adds X-Trace-ID header and logs: method, path, status, latency, userId.
 */
function loggerMiddleware(req, res, next) {
  const traceId = uuidv4();
  const start = Date.now();

  req.traceId = traceId;
  res.setHeader("X-Trace-ID", traceId);

  res.on("finish", () => {
    const log = {
      traceId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      latencyMs: Date.now() - start,
      userId: req.user?.userId || "anonymous",
      tier: req.user?.tier || "none",
      cache: res.getHeader("X-Cache") || "N/A",
      ts: new Date().toISOString(),
    };
    console.log(JSON.stringify(log));
  });

  next();
}

module.exports = loggerMiddleware;
