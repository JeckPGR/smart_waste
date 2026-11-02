"""Hugging Face Space Entrypoint (Gradio SDK + FastAPI REST API).

Menyediakan:
1. Web UI interaktif Gradio untuk demo publik di browser
2. REST API /predict & /health untuk dipanggil oleh Backend NestJS
"""
import io
import json
import logging
from pathlib import Path

# pyrefly: ignore[missing-import]
import gradio as gr
from fastapi import FastAPI, File, HTTPException, UploadFile
import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError
import tensorflow as tf

from main import app as fastapi_app, state, display_name, MODEL_DIR, ALLOWED_TYPES, MAX_BYTES

# Inisialisasi model saat startup jika belum dimuat oleh lifespan
model_path = MODEL_DIR / "waste_model.keras"
meta_path = MODEL_DIR / "model_meta.json"
if model_path.exists() and meta_path.exists():
    state["meta"] = json.loads(meta_path.read_text())
    state["model"] = tf.keras.models.load_model(model_path)
    print("Model MobileNetV2 loaded successfully into memory.")

def predict_gradio(img: Image.Image):
    if img is None:
        return "Silakan masukkan foto sampah", {}

    meta = state.get("meta")
    model = state.get("model")
    if not model or not meta:
        return "Model belum siap", {}

    img = ImageOps.exif_transpose(img).convert("RGB")
    size = tuple(meta.get("img_size", [224, 224]))
    x = np.asarray(img.resize(size, Image.BILINEAR), dtype="float32")[None, ...]
    probs = model(x, training=False).numpy()[0]
    names = meta["class_names"]

    probabilities = {display_name(meta, n): float(p) for n, p in zip(names, probs)}
    top_idx = int(np.argmax(probs))
    top_label = display_name(meta, names[top_idx])

    return top_label, probabilities

# Gradio Web Demo UI
demo = gr.Interface(
    fn=predict_gradio,
    inputs=gr.Image(type="pil", label="Foto Tumpukan Sampah"),
    outputs=[
        gr.Textbox(label="Hasil Prediksi Utama", interactive=False),
        gr.Label(num_top_classes=3, label="Akurasi / Probabilitas per Kategori")
    ],
    title="🌱 Smart Waste Management AI (MobileNetV2)",
    description="Sistem Deteksi Jenis Sampah Otomatis (Organik, Plastik, Kertas) dengan akurasi 96.7%. Berfungsi ganda: Web Demo interaktif & REST API /predict untuk Backend NestJS.",
)

# Mount Gradio ke FastAPI agar endpoint REST API (/predict) dan Web UI aktif bersamaan di port 7860
app = gr.mount_gradio_app(fastapi_app, demo, path="/")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)

