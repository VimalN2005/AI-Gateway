/**
 * Service Registry
 * Central configuration for all downstream AI microservices.
 */
const services = {
  nlp: {
    name: "NLP Service",
    url: process.env.NLP_SERVICE_URL || "http://localhost:5001",
    timeout: 10000,
    cacheTTL: parseInt(process.env.CACHE_TTL_NLP) || 300,
    routes: ["/analyze", "/sentiment", "/summarize"],
  },
  vision: {
    name: "Vision Service",
    url: process.env.VISION_SERVICE_URL || "http://localhost:5002",
    timeout: 15000,
    cacheTTL: parseInt(process.env.CACHE_TTL_VISION) || 600,
    routes: ["/classify", "/detect", "/caption"],
  },
  embed: {
    name: "Embedding Service",
    url: process.env.EMBEDDING_SERVICE_URL || "http://localhost:5003",
    timeout: 8000,
    cacheTTL: parseInt(process.env.CACHE_TTL_EMBED) || 3600,
    routes: ["/encode", "/similarity"],
  },
};

const rateLimits = {
  free: { rpm: parseInt(process.env.RATE_LIMIT_FREE) || 10 },
  pro: { rpm: parseInt(process.env.RATE_LIMIT_PRO) || 100 },
  enterprise: { rpm: Infinity },
};

module.exports = { services, rateLimits };
