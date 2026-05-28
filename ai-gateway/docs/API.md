# API Reference

Base URL: `http://localhost:8000`

All protected routes require: `Authorization: Bearer <token>`

---

## Authentication

Generate a token:
```bash
node scripts/generate-token.js --user "vimal" --tier "pro"
```

---

## NLP Service  `/api/nlp`

### POST `/api/nlp/analyze`
```json
{ "text": "Your text here" }
```
Response:
```json
{ "word_count": 3, "sentence_count": 1, "char_count": 14, "avg_word_length": 3.67 }
```

### POST `/api/nlp/sentiment`
```json
{ "text": "This product is amazing!" }
```
Response:
```json
{ "sentiment": { "label": "positive", "score": 0.85 } }
```

### POST `/api/nlp/summarize`
```json
{ "text": "Long article text...", "max_sentences": 3 }
```

---

## Vision Service  `/api/vision`

All endpoints require base64-encoded image:

### POST `/api/vision/classify`
```json
{ "image": "<base64>", "top_k": 3 }
```

### POST `/api/vision/detect`
```json
{ "image": "<base64>" }
```

### POST `/api/vision/caption`
```json
{ "image": "<base64>" }
```

---

## Embedding Service  `/api/embed`

### POST `/api/embed/encode`
```json
{ "texts": ["sentence one", "sentence two"] }
```
Response:
```json
{ "embeddings": [[...], [...]], "dimensions": 128 }
```

### POST `/api/embed/similarity`
```json
{ "text_a": "I love dogs", "text_b": "I like cats" }
```
Response:
```json
{ "similarity": 0.92, "interpretation": "very similar" }
```

---

## Health & Metrics

### GET `/health`
Gateway liveness check.

### GET `/health/services`
All downstream service statuses + circuit breaker states.

### GET `/metrics`
Request counts per service from Redis.

---

## Response Headers

| Header | Description |
|--------|-------------|
| `X-Trace-ID` | Unique request trace ID |
| `X-Cache` | `HIT` or `MISS` |
| `X-RateLimit-Limit` | Your tier's request limit |
| `X-RateLimit-Remaining` | Remaining requests this minute |
| `X-RateLimit-Tier` | Your tier (free/pro/enterprise) |

---

## Error Codes

| Code | Meaning |
|------|---------|
| 401 | Missing or invalid token |
| 429 | Rate limit exceeded |
| 503 | Service unavailable (circuit open) |
| 502 | Upstream service error |
