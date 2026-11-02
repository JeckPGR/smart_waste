"""Hugging Face Space Entrypoint (Gradio + FastAPI REST API).

Menyediakan:
1. Web UI interaktif Gradio untuk demo publik di browser
2. REST API /predict & /health untuk dipanggil oleh Backend NestJS
"""
import io
import json
import logging
import os
from pathlib import Path

# Nonaktifkan GPU agar TensorFlow berjalan aman di CPU dan tidak bentrok dengan ZeroGPU sandbox
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

from fastapi import File, HTTPException, UploadFile
import gradio as gr
import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError
import tensorflow as tf

# Inisialisasi model saat startup (mendukung lokasi di root atau di folder model/)
model_path = Path(__file__).parent / "model" / "waste_model.keras"
if not model_path.exists():
    model_path = Path(__file__).parent / "waste_model.keras"

meta_path = Path(__file__).parent / "model" / "model_meta.json"
if not meta_path.exists():
    meta_path = Path(__file__).parent / "model_meta.json"

if not model_path.exists() or not meta_path.exists():
    raise RuntimeError(f"Model atau meta tidak ditemukan: {model_path}, {meta_path}")

meta = json.loads(meta_path.read_text())
model = tf.keras.models.load_model(model_path)
print(f"Model MobileNetV2 loaded successfully from {model_path}.")

DEFAULT_DISPLAY = {
    "organic": "Organic Waste",
    "paper": "Paper Waste",
    "plastic": "Plastic Waste",
}

def display_name(class_name: str) -> str:
    return meta.get("display_names", {}).get(class_name) or DEFAULT_DISPLAY.get(class_name, class_name)

def process_and_predict(pil_img: Image.Image):
    pil_img = ImageOps.exif_transpose(pil_img).convert("RGB")
    size = tuple(meta.get("img_size", [224, 224]))
    x = np.asarray(pil_img.resize(size, Image.BILINEAR), dtype="float32")[None, ...]
    probs = model(x, training=False).numpy()[0]
    names = meta["class_names"]

    probabilities = {display_name(n): float(p) for n, p in zip(names, probs)}
    top_idx = int(np.argmax(probs))
    top_label = display_name(names[top_idx])
    return top_label, float(probs[top_idx]), probabilities

# Fungsi untuk Web UI Gradio
def gradio_predict(img: Image.Image):
    if img is None:
        return "Silakan masukkan foto sampah", {}
    top_label, confidence, probabilities = process_and_predict(img)
    return top_label, probabilities

# Buat Gradio Interface
demo = gr.Interface(
    fn=gradio_predict,
    inputs=gr.Image(type="pil", label="Foto Tumpukan Sampah"),
    outputs=[
        gr.Textbox(label="Hasil Prediksi Utama", interactive=False),
        gr.Label(num_top_classes=3, label="Akurasi / Probabilitas per Kategori")
    ],
    title="🌱 Smart Waste Management AI (MobileNetV2)",
    description="Sistem Deteksi Jenis Sampah Otomatis (Organik, Plastik, Kertas) dengan akurasi 96.7%. Berfungsi ganda: Web Demo interaktif & REST API /predict untuk Backend NestJS.",
)

# Daftarkan REST API endpoints langsung ke FastAPI bawaan Gradio (demo.app)
@demo.app.get("/health")
def health():
    return {"status": "ok", "model": "MobileNetV2", "classes": meta.get("class_names")}

@demo.app.post("/predict")
async def predict_api(file: UploadFile = File(...)):
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(413, "Ukuran gambar maksimal 5 MB")

    try:
        pil_img = Image.open(io.BytesIO(contents))
    except (UnidentifiedImageError, OSError):
        raise HTTPException(400, "File bukan gambar yang valid")

    top_label, confidence, probabilities = process_and_predict(pil_img)
    return {
        "label": top_label,
        "confidence": confidence,
        "probabilities": probabilities,
    }

if __name__ == "__main__":
    demo.launch()
