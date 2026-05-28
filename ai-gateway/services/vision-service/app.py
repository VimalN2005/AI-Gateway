"""
Vision Microservice
Provides: image classification, object detection (metadata), captioning
Accepts base64-encoded images.
"""
import os
import time
import base64
import hashlib
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

PORT = int(os.getenv("SERVICE_PORT", 5002))

# Mock label sets (replace with real model inference in production)
LABELS = ["cat", "dog", "car", "person", "tree", "building", "food", "phone", "laptop", "bicycle"]
OBJECTS = ["person", "car", "tree", "chair", "table", "bottle", "laptop", "phone", "book", "bag"]


def image_hash_seed(b64: str) -> int:
    """Deterministic pseudo-random seed from image content."""
    return int(hashlib.md5(b64[:100].encode()).hexdigest(), 16)


@app.get("/health")
def health():
    return jsonify({"status": "healthy", "service": "vision-service"})


@app.post("/classify")
def classify():
    data = request.get_json()
    image_b64 = data.get("image")
    if not image_b64:
        return jsonify({"error": "image (base64) field required"}), 400

    seed = image_hash_seed(image_b64)
    top_k = data.get("top_k", 3)
    selected = [LABELS[(seed + i) % len(LABELS)] for i in range(min(top_k, len(LABELS)))]
    predictions = [{"label": lbl, "confidence": round(0.95 - i * 0.15, 3)} for i, lbl in enumerate(selected)]

    return jsonify({"predictions": predictions, "model": "vision-classifier-v1", "processed_at": time.time()})


@app.post("/detect")
def detect():
    data = request.get_json()
    image_b64 = data.get("image")
    if not image_b64:
        return jsonify({"error": "image (base64) field required"}), 400

    seed = image_hash_seed(image_b64)
    num_objects = (seed % 4) + 1
    detections = []
    for i in range(num_objects):
        label = OBJECTS[(seed + i * 3) % len(OBJECTS)]
        detections.append({
            "label": label,
            "confidence": round(0.9 - i * 0.1, 3),
            "bbox": [int((seed >> i) % 100), int((seed >> (i + 1)) % 100), 150, 150],
        })

    return jsonify({"detections": detections, "count": len(detections), "model": "vision-detector-v1", "processed_at": time.time()})


@app.post("/caption")
def caption():
    data = request.get_json()
    image_b64 = data.get("image")
    if not image_b64:
        return jsonify({"error": "image (base64) field required"}), 400

    seed = image_hash_seed(image_b64)
    captions = [
        "A person standing in a well-lit room.",
        "An outdoor scene with trees and a clear sky.",
        "A close-up of an electronic device on a desk.",
        "Multiple objects arranged on a surface.",
        "A urban street scene with vehicles.",
    ]
    caption = captions[seed % len(captions)]

    return jsonify({"caption": caption, "model": "vision-captioner-v1", "processed_at": time.time()})


if __name__ == "__main__":
    print(f"👁️  Vision Service running on port {PORT}")
    app.run(host="0.0.0.0", port=PORT)
