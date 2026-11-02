# Smart Waste ML API (FastAPI)

Layanan prediksi jenis sampah: **Organic Waste**, **Paper Waste**, **Plastic Waste**.
Dipanggil oleh backend NestJS lewat `ML_API_URL`. Mobile dan web tidak memanggilnya langsung.

## Isi folder

| File | Fungsi |
|---|---|
| `main.py` | Aplikasi FastAPI (`/health`, `/model-info`, `/predict`) |
| `model/waste_model.keras` | Model hasil training (dari notebook, langkah 10) |
| `model/model_meta.json` | Urutan kelas, nama tampilan, versi TensorFlow |
| `requirements.txt` | Dependensi Python |
| `Dockerfile` | Untuk deploy (Hugging Face Spaces / Render) |

Dua file di `model/` dihasilkan notebook `ml/notebooks/train_waste_classifier.ipynb`. Taruh keduanya di folder `model/` sebelum menjalankan API.

## Menjalankan lokal (Windows PowerShell)

Disarankan Python 3.10 sampai 3.12.

```powershell
cd ml\api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Dokumentasi interaktif: http://localhost:8000/docs

Cek cepat:

```powershell
curl.exe http://localhost:8000/health
curl.exe -F "file=@foto-sampah.jpg" http://localhost:8000/predict
```

Contoh respons:

```json
{
  "label": "Plastic Waste",
  "confidence": 0.92,
  "probabilities": { "Organic Waste": 0.03, "Plastic Waste": 0.92, "Paper Waste": 0.05 }
}
```

## Menyambungkan ke backend

Di `backend/.env`:

```
ML_API_URL="http://localhost:8000"
```

Restart backend. Respons `POST /api/v1/ai/predict` sekarang berisi `"mock": false`. Kalau `ML_API_URL` dikosongkan, backend kembali memakai hasil mock.

## Endpoint

| Method | Path | Keterangan |
|---|---|---|
| GET | `/health` | `{"status":"ok","model_loaded":true}` |
| GET | `/model-info` | Isi `model_meta.json` (kelas, versi, akurasi test) |
| POST | `/predict` | `multipart/form-data`, field `file` (JPG/PNG/WEBP, maks 5 MB) |

Kode error: `400` bukan gambar atau tipe salah, `413` lebih dari 5 MB, `503` model belum dimuat.

## Catatan teknis

- **Preprocessing**: RGB, resize 224x224 (bilinear), float32 0..255. Normalisasi ke -1..1 dilakukan lapisan `Rescaling` di dalam model, jadi tidak ada langkah normalisasi terpisah yang bisa menyimpang dari training.
- **Urutan kelas** dibaca dari `model_meta.json`, bukan ditulis manual di kode.
- Foto HP diputar sesuai metadata EXIF sebelum diproses.
- Model dimuat sekali saat server menyala.
- Versi TensorFlow di `requirements.txt` harus sama dengan versi di Colab (dicetak di langkah 10 notebook).

## Deploy

**Hugging Face Spaces (Docker):** buat Space bertipe Docker, unggah isi folder ini (termasuk `model/`), dan tambahkan di bagian atas README Space:

```
---
sdk: docker
app_port: 7860
---
```

**Render:** Web Service dari repo, Root Directory `ml/api`, Runtime Docker. TensorFlow cukup berat, jadi pantau memori di paket gratis (512 MB bisa mepet).

Setelah deploy, isi `ML_API_URL` di environment backend dengan URL layanan ini (tanpa garis miring di akhir).
