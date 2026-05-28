# 🧠 AI Microservices Gateway

A production-grade API Gateway that routes, rate-limits, authenticates, and load-balances requests across multiple AI microservices — NLP, Vision, and Embeddings — with a live monitoring dashboard.

---

## 🏗️ Architecture

```
Client Request
      │
      ▼
┌─────────────────────────────────┐
│        API Gateway (Node.js)    │  ← Auth, Rate Limit, Routing, Logging
│  /api/nlp  /api/vision          │
│  /api/embed  /api/health        │
└──────┬──────────┬───────────────┘
       │          │
  ┌────▼──┐  ┌───▼──────┐  ┌────────────────┐
  │  NLP  │  │  Vision  │  │  Embeddings    │
  │ :5001 │  │  :5002   │  │    :5003       │
  └───────┘  └──────────┘  └────────────────┘
       │          │                │
       └──────────┴────────────────┘
                  │
         ┌────────▼────────┐
         │  Redis (Cache + │
         │   Rate Limiting)│
         └─────────────────┘
```

---

## 🚀 Features

- 🔐 **JWT Authentication** — API key + token-based access
- 🚦 **Rate Limiting** — Per-user, per-service limits via Redis
- 🔁 **Request Routing** — Intelligent routing to correct AI service
- ⚡ **Response Caching** — Redis-backed cache with TTL per service
- 📊 **Live Dashboard** — Real-time metrics, latency, request logs
- 🔄 **Circuit Breaker** — Auto-failover on service downtime
- 📝 **Request Logging** — Structured JSON logs with trace IDs
- 🐳 **Docker Compose** — One command to run everything
- ☸️ **Kubernetes** — Production-ready manifests included

---

## 📁 Project Structure

```
ai-gateway/
├── gateway/                    # Core API Gateway
│   ├── src/
│   │   ├── server.js           # Express entry point
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT validation
│   │   │   ├── rateLimit.js    # Redis rate limiter
│   │   │   ├── cache.js        # Response cache
│   │   │   ├── circuitBreaker.js
│   │   │   └── logger.js       # Structured logging
│   │   ├── routes/
│   │   │   ├── proxy.js        # Service proxy router
│   │   │   └── health.js       # Health check endpoints
│   │   └── config/
│   │       └── services.js     # Service registry
│   ├── package.json
│   └── Dockerfile
├── services/
│   ├── nlp-service/            # Text analysis microservice
│   │   ├── app.py
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   ├── vision-service/         # Image analysis microservice
│   │   ├── app.py
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   └── embedding-service/      # Vector embeddings microservice
│       ├── app.py
│       ├── requirements.txt
│       └── Dockerfile
├── dashboard/                  # React monitoring dashboard
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│   │       ├── MetricsPanel.jsx
│   │       ├── RequestLog.jsx
│   │       ├── ServiceHealth.jsx
│   │       └── RateLimitPanel.jsx
│   └── package.json
├── k8s/                        # Kubernetes manifests
│   ├── gateway-deployment.yaml
│   ├── services.yaml
│   └── ingress.yaml
├── scripts/
│   └── generate-token.js       # CLI tool to generate API keys
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ⚙️ Quick Start

### Prerequisites
- Docker + Docker Compose
- Node.js >= 18
- Python >= 3.10

### 1. Clone & configure
```bash
git clone https://github.com/VimalN2005/ai-gateway.git
cd ai-gateway
cp .env.example .env
```

### 2. Start everything
```bash
docker-compose up --build
```

| Service         | URL                          |
|-----------------|------------------------------|
| API Gateway     | http://localhost:8000         |
| Dashboard       | http://localhost:3000         |
| NLP Service     | http://localhost:5001         |
| Vision Service  | http://localhost:5002         |
| Embedding Svc   | http://localhost:5003         |
| Redis           | localhost:6379               |

### 3. Generate an API key
```bash
node scripts/generate-token.js --user "vimal" --tier "pro"
```

---

## 🔌 API Usage

### Authenticate
```bash
curl -H "Authorization: Bearer <your-token>" \
     -H "Content-Type: application/json" \
     -d '{"text": "Analyze this sentence"}' \
     http://localhost:8000/api/nlp/analyze
```

### NLP — Text Analysis
```
POST /api/nlp/analyze
POST /api/nlp/sentiment
POST /api/nlp/summarize
```

### Vision — Image Analysis
```
POST /api/vision/classify
POST /api/vision/detect
POST /api/vision/caption
```

### Embeddings
```
POST /api/embed/encode
POST /api/embed/similarity
```

### Health & Metrics
```
GET  /health
GET  /health/services
GET  /metrics
```

---

## 📊 Rate Limits

| Tier    | Requests/min | Tokens/day |
|---------|-------------|------------|
| free    | 10          | 1,000      |
| pro     | 100         | 50,000     |
| enterprise | unlimited | unlimited |

---

## 🐳 Docker

```bash
# Build and run
docker-compose up --build

# Scale a service
docker-compose up --scale nlp-service=3

# View logs
docker-compose logs -f gateway
```

---

## ☸️ Kubernetes

```bash
kubectl apply -f k8s/
kubectl get pods -n ai-gateway
```

---

## 📄 License

MIT License

## 👤 Author

**Vimal Sahani**  
[GitHub](https://github.com/VimalN2005) · [Email](mailto:vimalsahani2005@gmail.com)
