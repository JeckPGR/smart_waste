"""Smart Waste ML API.

Layanan prediksi jenis sampah (Organic / Paper / Plastic).
Dipanggil oleh backend NestJS (env ML_API_URL), bukan langsung oleh mobile/web.

Jalankan lokal:  uvicorn main:app --reload --port 8000
Dokumentasi:     http://localhost:8000/docs
"""
import io
import json
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError

logger = logging.getLogger("waste-api")

MODEL_DIR = Path(os.getenv("MODEL_DIR", Path(__file__).parent / "model"))
MAX_BYTES = 5 * 1024 * 1024  # 5 MB, sama dengan batas upload di NestJS
ALLOWED_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/octet-stream",
    "binary/octet-stream",
}

# Dipakai kalau model_meta.json tidak punya display_names.
DEFAULT_DISPLAY = {
    "organic": "Organic Waste",
    "paper": "Paper Waste",
    "plastic": "Plastic Waste",
}

state: dict = {"model": None, "meta": None}


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Model dimuat SEKALI saat server menyala, bukan di setiap request.
    import tensorflow as tf

    model_path = MODEL_DIR / "waste_model.keras"
    if not model_path.exists():
        model_path = Path(__file__).parent / "waste_model.keras"

    meta_path = MODEL_DIR / "model_meta.json"
    if not meta_path.exists():
        meta_path = Path(__file__).parent / "model_meta.json"

    if model_path.exists() and meta_path.exists():
        state["meta"] = json.loads(meta_path.read_text())
        state["model"] = tf.keras.models.load_model(model_path)
        logger.info("Model dimuat dari %s. Kelas: %s", model_path, state["meta"]["class_names"])
    else:
        logger.error("Model tidak ditemukan di %s maupun di root folder", MODEL_DIR)
    yield
    state["model"] = None


app = FastAPI(
    title="Smart Waste ML API",
    version="1.0.0",
    description="Klasifikasi gambar sampah: Organic, Paper, Plastic.",
    lifespan=lifespan,
)


def display_name(meta: dict, class_name: str) -> str:
    return meta.get("display_names", {}).get(class_name) or DEFAULT_DISPLAY.get(class_name, class_name)


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": state["model"] is not None}


@app.get("/model-info")
def model_info():
    if state["meta"] is None:
        raise HTTPException(503, "Model belum dimuat")
    return state["meta"]


@app.post("/predict")
def predict(file: UploadFile = File(...)):
    """Terima satu gambar (field `file`), balas label + confidence + probabilitas tiap kelas."""
    model, meta = state["model"], state["meta"]
    if model is None or meta is None:
        raise HTTPException(503, "Model belum dimuat")

    content_type = (file.content_type or "").lower().split(";")[0].strip()
    if content_type and content_type not in ALLOWED_TYPES:
        logger.warning("Predict ditolak karena content_type tidak didukung: %s", file.content_type)
        raise HTTPException(400, "File harus berupa gambar JPG, PNG, atau WEBP")

    data = file.file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "Ukuran gambar maksimal 5 MB")

    try:
        img = Image.open(io.BytesIO(data))
        img = ImageOps.exif_transpose(img).convert("RGB")  # foto HP sering terputar lewat EXIF
    except (UnidentifiedImageError, OSError) as err:
        logger.warning("Gagal membaca file gambar dengan PIL: %s", err)
        raise HTTPException(400, "File bukan gambar yang valid")

    # Preprocessing HARUS sama dengan training: RGB, 224x224, float32 0..255.
    # Normalisasi ke -1..1 sudah dilakukan lapisan Rescaling di dalam model.
    size = tuple(meta.get("img_size", [224, 224]))
    x = np.asarray(img.resize(size, Image.BILINEAR), dtype="float32")[None, ...]

    probs = model(x, training=False).numpy()[0]
    names = meta["class_names"]
    top = int(np.argmax(probs))

    return {
        "label": display_name(meta, names[top]),
        "confidence": float(probs[top]),
        "probabilities": {display_name(meta, n): float(p) for n, p in zip(names, probs)},
    }
