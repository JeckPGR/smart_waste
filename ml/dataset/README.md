# Dataset

Dataset **tidak** di-commit ke repo (ribuan gambar membuat repo berat). Dataset diunduh otomatis oleh notebook `ml/notebooks/train_waste_classifier.ipynb` (langkah 2) memakai `kagglehub`.

## Sumber

| Kode | Dataset | Dipakai untuk | Lisensi |
|---|---|---|---|
| A | [Garbage Classification (TrashNet), `asdasdasasdas/garbage-classification`](https://www.kaggle.com/datasets/asdasdasasdas/garbage-classification) | `paper` (termasuk `cardboard`), `plastic` | Cek halaman Kaggle (tidak tercantum saat dicek) |
| B | [Garbage Classification 12 classes, `mostafaabla/garbage-classification`](https://www.kaggle.com/datasets/mostafaabla/garbage-classification) | `organic` (folder `biological`), plus `paper` dan `plastic` | Cek halaman Kaggle |

Dataset A hanya memiliki 6 kelas (cardboard, glass, metal, paper, plastic, trash) dan tidak memiliki kelas organik, sehingga kelas Organic diambil dari dataset B.

Folder lain (glass, metal, trash, clothes, shoes, battery, dst.) tidak dipakai.

## Pemetaan kelas

| Kelas model | Folder sumber |
|---|---|
| `organic` | `biological` |
| `paper` | `paper`, `cardboard` |
| `plastic` | `plastic` |

## Pemrosesan

1. Gambar dari kedua sumber digabung per kelas, diacak (seed 42).
2. Duplikat dibuang (hash MD5) dan file rusak dibuang.
3. Maksimal 800 gambar per kelas.
4. Dibagi 70% train / 15% val / 15% test per kelas. Data test tidak dipakai saat training.

## Ringkasan jumlah gambar

Isi dari `dataset_summary.json` (dicetak notebook langkah 4) setelah training dijalankan:

| Kelas | Train | Val | Test | Total | Sumber |
|---|---|---|---|---|---|
| organic | TODO | TODO | TODO | TODO | TODO |
| paper | TODO | TODO | TODO | TODO | TODO |
| plastic | TODO | TODO | TODO | TODO | TODO |

Syarat tes: minimal 150 gambar.

## Keterbatasan

- Dua sumber memiliki gaya foto berbeda (TrashNet berlatar putih polos, dataset B lebih beragam). Kelas organic hanya berasal dari satu sumber, sehingga ada risiko model ikut belajar gaya foto.
- Foto dunia nyata dari HP (gelap, ramai, banyak objek) dapat menurunkan akurasi dibanding angka test.
