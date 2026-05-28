"""
NLP Microservice
Provides: text analysis, sentiment analysis, summarization
"""
import os
import time
import re
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

PORT = int(os.getenv("SERVICE_PORT", 5001))


def simple_sentiment(text: str) -> dict:
    """Rule-based sentiment (replace with transformer model in production)."""
    positive_words = {"good", "great", "excellent", "amazing", "wonderful", "love", "best", "happy", "fantastic", "positive"}
    negative_words = {"bad", "terrible", "awful", "horrible", "hate", "worst", "sad", "negative", "poor", "disgusting"}
    words = set(text.lower().split())
    pos = len(words & positive_words)
    neg = len(words & negative_words)
    if pos > neg:
        return {"label": "positive", "score": round(0.5 + pos * 0.1, 2)}
    elif neg > pos:
        return {"label": "negative", "score": round(0.5 + neg * 0.1, 2)}
    return {"label": "neutral", "score": 0.5}


@app.get("/health")
def health():
    return jsonify({"status": "healthy", "service": "nlp-service"})


@app.post("/analyze")
def analyze():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "text field required"}), 400

    words = text.split()
    sentences = re.split(r'[.!?]+', text)

    return jsonify({
        "word_count": len(words),
        "sentence_count": len([s for s in sentences if s.strip()]),
        "char_count": len(text),
        "avg_word_length": round(sum(len(w) for w in words) / max(len(words), 1), 2),
        "language": "en",
        "processed_at": time.time(),
    })


@app.post("/sentiment")
def sentiment():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "text field required"}), 400

    result = simple_sentiment(text)
    return jsonify({"text": text[:100], "sentiment": result, "processed_at": time.time()})


@app.post("/summarize")
def summarize():
    data = request.get_json()
    text = data.get("text", "")
    max_sentences = data.get("max_sentences", 3)
    if not text:
        return jsonify({"error": "text field required"}), 400

    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
    summary = ". ".join(sentences[:max_sentences]) + ("." if sentences else "")
    return jsonify({
        "summary": summary,
        "original_length": len(text),
        "summary_length": len(summary),
        "compression_ratio": round(len(summary) / max(len(text), 1), 2),
        "processed_at": time.time(),
    })


if __name__ == "__main__":
    print(f"🧠 NLP Service running on port {PORT}")
    app.run(host="0.0.0.0", port=PORT)
