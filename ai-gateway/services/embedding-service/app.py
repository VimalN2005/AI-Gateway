"""
Embedding Microservice
Provides: text vectorization and cosine similarity.
Uses deterministic pseudo-embeddings (replace with sentence-transformers in production).
"""
import os
import time
import math
import hashlib
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

PORT = int(os.getenv("SERVICE_PORT", 5003))
EMBED_DIM = 128


def pseudo_embed(text: str) -> list[float]:
    """Deterministic pseudo-embedding from text hash (for demo)."""
    seed = int(hashlib.sha256(text.encode()).hexdigest(), 16)
    vec = []
    for i in range(EMBED_DIM):
        val = math.sin(seed * (i + 1) * 0.0001) * math.cos(seed * 0.00001 * i)
        vec.append(round(val, 6))
    # L2 normalize
    norm = math.sqrt(sum(x ** 2 for x in vec)) or 1.0
    return [round(x / norm, 6) for x in vec]


def cosine_similarity(a: list, b: list) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    return round(dot, 4)  # already normalized


@app.get("/health")
def health():
    return jsonify({"status": "healthy", "service": "embedding-service"})


@app.post("/encode")
def encode():
    data = request.get_json()
    texts = data.get("texts")
    if not texts:
        return jsonify({"error": "texts (list of strings) field required"}), 400
    if isinstance(texts, str):
        texts = [texts]

    embeddings = [pseudo_embed(t) for t in texts]
    return jsonify({
        "embeddings": embeddings,
        "dimensions": EMBED_DIM,
        "model": "embed-v1",
        "count": len(embeddings),
        "processed_at": time.time(),
    })


@app.post("/similarity")
def similarity():
    data = request.get_json()
    text_a = data.get("text_a")
    text_b = data.get("text_b")
    if not text_a or not text_b:
        return jsonify({"error": "text_a and text_b fields required"}), 400

    vec_a = pseudo_embed(text_a)
    vec_b = pseudo_embed(text_b)
    score = cosine_similarity(vec_a, vec_b)

    return jsonify({
        "text_a": text_a[:80],
        "text_b": text_b[:80],
        "similarity": score,
        "interpretation": "very similar" if score > 0.9 else "similar" if score > 0.7 else "dissimilar",
        "processed_at": time.time(),
    })


if __name__ == "__main__":
    print(f"🔢 Embedding Service running on port {PORT}")
    app.run(host="0.0.0.0", port=PORT)
