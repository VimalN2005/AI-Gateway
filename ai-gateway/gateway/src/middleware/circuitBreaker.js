const CircuitBreaker = require("opossum");
const axios = require("axios");

const breakers = new Map();

/**
 * Get or create a circuit breaker for a service.
 * Opens after 50% failure rate over 10 requests.
 * Tries to close (half-open) after 30s.
 */
function getBreaker(serviceKey, serviceUrl, timeout) {
  if (breakers.has(serviceKey)) return breakers.get(serviceKey);

  const options = {
    timeout,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
    volumeThreshold: 5,
  };

  const breaker = new CircuitBreaker(
    async ({ method, path, data, headers }) => {
      const response = await axios({ method, url: serviceUrl + path, data, headers, timeout });
      return response.data;
    },
    options
  );

  breaker.on("open", () => console.warn(`[CircuitBreaker] OPEN for ${serviceKey}`));
  breaker.on("halfOpen", () => console.info(`[CircuitBreaker] HALF-OPEN for ${serviceKey}`));
  breaker.on("close", () => console.info(`[CircuitBreaker] CLOSED for ${serviceKey}`));

  breakers.set(serviceKey, breaker);
  return breaker;
}

function getBreakerStatus() {
  const status = {};
  for (const [key, breaker] of breakers.entries()) {
    status[key] = {
      state: breaker.opened ? "open" : breaker.halfOpen ? "half_open" : "closed",
      stats: breaker.stats,
    };
  }
  return status;
}

module.exports = { getBreaker, getBreakerStatus };
