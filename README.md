# ♻️ Smart Waste Management System

> **Sistem Manajemen dan Pelaporan Tumpukan Sampah Berbasis AI (Mobile, Web Admin, Backend API, Machine Learning, & Self-Managed PostgreSQL Database)**  

---

## 📌 Daftar Isi
1. [Tentang Sistem & Fitur Utama](#-tentang-sistem--fitur-utama)
2. [Arsitektur & Struktur Folder Monorepo](#-arsitektur--struktur-folder-monorepo)
3. [Entity Relationship Diagram (ERD)](#-entity-relationship-diagram-erd)
4. [Alur & Cara Kerja Sistem (End-to-End Workflow)](#-alur--cara-kerja-sistem-end-to-end-workflow)
5. [Spesifikasi Teknis & Tech Stack](#-spesifikasi-teknis--tech-stack)
6. [Panduan Menjalankan Sistem (How to Run)](#-panduan-menjalankan-sistem-how-to-run)
7. [Infrastruktur Database Mandiri & Disaster Recovery](#-infrastruktur-database-mandiri--disaster-recovery)
8. [Akun Demo Pengujian](#-akun-demo-pengujian)
9. [Status Deployment Produksi](#-status-deployment-produksi)

---

## 🌟 Tentang Sistem & Fitur Utama

**Smart Waste Management System** adalah platform cerdas terintegrasi yang memudahkan masyarakat melaporkan tumpukan sampah liar secara cepat, transparan, dan berbasis kecerdasan buatan, sekaligus membantu dinas kebersihan dan administrator memverifikasi serta menindaklanjuti laporan secara efisien.

### 🚀 Fitur Unggulan
1. **Deteksi Sampah Otomatis Berbasis AI (MobileNetV2)**:
   - Menggunakan model deep learning transfer learning **MobileNetV2** yang mengklasifikasikan 3 jenis sampah secara akurat: **Organik**, **Plastik**, dan **Kertas** dengan akurasi pengujian **96.7%**.
   - Dideploy di Hugging Face Spaces dengan server ganda: **FastAPI REST API** (`/predict`) untuk backend dan **Gradio UI** untuk demo publik interaktif.
2. **Kamera & Geocoding GPS Presisi**:
   - Pengambilan foto resolusi penuh (*full capture*) dari kamera atau galeri dengan penanganan otomatis orientasi EXIF (*EXIF orientation fix*), dilengkapi reverse geocoding alamat jalan otomatis.
3. **Penyimpanan Cloud Terdistribusi**:
   - Foto tersimpan secara aman di **Cloudflare R2 Object Storage** (kompatibel S3) dengan akses URL CDN publik berkecepatan tinggi tanpa biaya egress.
4. **Audit Trail & Jejak Status Transparan**:
   - Setiap perubahan status (`Menunggu` $\rightarrow$ `Diproses` $\rightarrow$ `Selesai` / `Ditolak`) mencatat identitas petugas, stempel waktu, dan catatan resmi penanganan di tabel `report_status_logs`.
5. **Gamifikasi & Podium Leaderboard Warga**:
   - Sistem **Eco XP** dan **Level Warga** (+50 XP per laporan diajukan, +50 XP per laporan selesai diverifikasi).
   - Layar **Podium Top 10** dengan pilar olimpiade berwarna (Emas 🥇, Perak 🥈, Perunggu 🥉) serta kartu peringkat 4–10.
6. **Infrastruktur Database PostgreSQL Mandiri (*Self-Managed*)**:
   - Bebas dari ketergantungan BaaS (*no vendor lock-in*). Dilengkapi skema DDL murni, *connection pooling*, orkestrator kontainer Docker Compose, serta skrip otomatis *disaster recovery* (backup & restore).

---

## 📂 Arsitektur & Struktur Folder Monorepo

Sistem dibangun dalam satu kesatuan repository (*monorepo*) yang terbagi menjadi modul-modul independen:

```text
smart-waste/
├── database/           # Infrastruktur & Pengelolaan Database Mandiri
│   ├── docker-compose.yml # Kontainer PostgreSQL 16 + pgAdmin 4
│   ├── init.sql        # Script DDL inisialisasi tabel, enum, trigger, & seed data
│   ├── backup.bat/sh   # Script otomatisasi backup pg_dump bertanggal
│   ├── restore.bat/sh  # Script pemulihan basis data (disaster recovery)
│   └── README.md       # Dokumentasi teknis konfigurasi database mandiri
│
├── backend/            # REST API Service (NestJS 11 + Prisma 6 + PostgreSQL + Cloudflare R2)
│   ├── prisma/         # Prisma Schema & Database Seeder
│   ├── src/
│   │   ├── ai/         # Klien integrasi ke layanan ML/Hugging Face Space
│   │   ├── auth/       # Autentikasi JWT, login, register, roles guard
│   │   ├── dashboard/  # Statistik, tren harian, dan endpoint Leaderboard Top 10
│   │   ├── reports/    # CRUD Laporan sampah, audit status logs, update status
│   │   ├── storage/    # Upload & manajemen Cloudflare R2 (AWS S3 SDK v3)
│   │   └── users/      # Manajemen akun dan profil pengguna
│   └── uploads/        # Fallback direktori lokal jika S3 tidak aktif
│
├── web/                # Portal Web Admin & Warga (Next.js 16 + Tailwind CSS v4)
│   ├── src/
│   │   ├── app/        # Next.js App Router (/dashboard, /reports, /users, /login)
│   │   ├── modules/    # UI views & komponen per modul
│   │   └── shared/     # Komponen UI bersama (Button, Card, Dialog, Input, Sidebar)
│
├── mobile/             # Aplikasi Mobile Warga (React Native + Expo SDK 58)
│   ├── assets/         # Ikon aplikasi maskot, splash screen
│   ├── src/
│   │   ├── modules/    # Auth (Login/Register), Beranda, Podium, Buat Laporan, Detail
│   │   ├── navigation/ # React Navigation (Tab Navigator 4 Menu & Native Stack)
│   │   └── shared/     # Komponen Pixel & Slate Theme
│
├── ml/                 # Layanan Machine Learning & Deep Learning (FastAPI + Keras)
│   ├── api/            # Server inferensi FastAPI & entrypoint Hugging Face (app.py)
│   │   └── model/      # Model terlatih (waste_model.keras) & metadata kelas
│   ├── dataset/        # Panduan dataset dan ringkasan data train/val/test
│   ├── evaluation/     # Confusion matrix, classification report, training curves
│   └── notebooks/      # Jupyter notebook pipeline pelatihan MobileNetV2
│
└── docs/               # Dokumentasi rancangan sistem, arsitektur, dan referensi DDL
```

---

## 🗄️ Entity Relationship Diagram (ERD)

Database menggunakan **PostgreSQL** dengan integritas data relasional ACID yang dikelola melalui **Prisma ORM** dan skema DDL murni:

```mermaid
erDiagram
    USERS ||--o{ REPORTS : "melaporkan (user_id)"
    USERS ||--o{ REPORT_STATUS_LOGS : "diubah_oleh (changed_by_id)"
    REPORTS ||--o{ REPORT_STATUS_LOGS : "memiliki_riwayat (report_id)"

    USERS {
        uuid id PK "gen_random_uuid()"
        varchar name "Nama Lengkap (max 100)"
        varchar email UK "Email Unik (max 150)"
        varchar password "Hash bcrypt"
        varchar phone "Nomor Telepon Opsional"
        user_role role "ENUM: ADMIN / USER"
        boolean is_active "Status aktif akun"
        timestamptz created_at "Waktu pendaftaran"
        timestamptz updated_at "Waktu pembaruan"
    }

    REPORTS {
        uuid id PK "gen_random_uuid()"
        uuid user_id FK "Relasi ke Users (Cascade)"
        text description "Deskripsi kondisi tumpukan"
        text image_url "URL gambar publik di Cloudflare R2"
        float latitude "Titik lintang GPS (-90 s/d 90)"
        float longitude "Titik bujur GPS (-180 s/d 180)"
        text address "Alamat / patokan jalan"
        waste_category category "ENUM: ORGANIC / PLASTIC / PAPER"
        float ai_confidence "Tingkat keyakinan AI (0.0 - 1.0)"
        report_status status "ENUM: PENDING / IN_PROGRESS / COMPLETED / REJECTED"
        text admin_note "Catatan penanganan admin terakhir"
        timestamptz created_at "Waktu laporan diajukan"
        timestamptz updated_at "Waktu pembaruan terakhir"
    }

    REPORT_STATUS_LOGS {
        uuid id PK "gen_random_uuid()"
        uuid report_id FK "Relasi ke Reports (Cascade)"
        uuid changed_by_id FK "Relasi ke Users (Set Null)"
        report_status from_status "Status sebelum diubah"
        report_status to_status "Status baru diterapkan"
        text note "Catatan resmi tindak lanjut petugas"
        timestamptz created_at "Waktu pencatatan log"
    }
```

---

## 🔄 Alur & Cara Kerja Sistem (End-to-End Workflow)

```mermaid
sequenceDiagram
    autonumber
    actor Warga as 📱 Warga (Mobile / Web)
    participant Backend as ⚙️ Backend (NestJS)
    participant ML as 🧠 ML API (Hugging Face)
    participant Storage as ☁️ Cloudflare R2
    participant DB as 🗄️ PostgreSQL (Self-Managed)
    actor Admin as 💻 Admin (Web Portal)

    Warga->>Warga: Ambil Foto Sampah (Kamera / Galeri)
    Warga->>Backend: Kirim Foto untuk Deteksi (POST /ai/predict)
    Backend->>ML: Forward Gambar ke Space (POST /predict)
    ML-->>Backend: Hasil Klasifikasi (e.g. PLASTIC, Akurasi 95%)
    Backend-->>Warga: Rekomendasi Kategori Otomatis
    Warga->>Warga: Bisa Ganti Foto Kamera / Galeri atau Ubah Kategori

    Warga->>Backend: Submit Laporan + Titik GPS (POST /reports)
    Backend->>Storage: Unggah Gambar ke Bucket R2
    Storage-->>Backend: URL Gambar CDN Terverifikasi
    Backend->>DB: Simpan Laporan (Status: PENDING)
    Backend-->>Warga: Laporan Berhasil & Tambah +50 XP

    Admin->>Backend: Buka Dashboard & Ambil Laporan (Prioritas PENDING Teratas)
    Backend->>DB: Query Laporan Terurut & Filter Kategori
    Backend-->>Admin: Tampilkan Daftar Laporan Urgensi Tinggi

    Admin->>Backend: Update Status ke SELESAI + Catatan Petugas
    Backend->>DB: Transaksi Update Status & Insert report_status_logs
    Backend-->>Admin: Status Berhasil Diperbarui

    Warga->>Backend: Buka Detail Laporan & Podium
    Backend->>DB: Hitung Akumulasi XP & Riwayat Penanganan
    Backend-->>Warga: Tampilkan Audit Log Petugas & Peringkat Jawara di Podium
```

---

## 🛠️ Spesifikasi Teknis & Tech Stack

| Layer | Teknologi Utama | Deskripsi & Peran |
|---|---|---|
| **Database** | PostgreSQL 16+ (Self-Managed) | Penyimpanan relasional ACID mandiri, custom enum, check constraints, trigger PL/pgSQL, indeks performa, dan connection pooling |
| **Database Tooling** | pgAdmin 4 & Docker Compose | GUI manajemen basis data terisolasi & otomatisasi kontainer lokal/VPS |
| **Disaster Recovery** | `pg_dump` & `psql` scripts | Skrip otomatis backup dan restore bertanggal (`backup.bat` / `backup.sh`) |
| **Backend API** | NestJS 11, TypeScript, Prisma 6 | REST API arsitektur modular, validasi DTO, JWT Authentication, Swagger OpenAPI |
| **Object Storage** | Cloudflare R2 (AWS S3 SDK v3) | Penyimpanan file gambar terdistribusi dengan zero-egress fees |
| **Machine Learning** | FastAPI, TensorFlow 2.x, Keras 3 | Transfer Learning MobileNetV2 (Organik, Plastik, Kertas) dengan akurasi 96.7% |
| **AI Hosting** | Hugging Face Spaces (CPU 8 vCPU) | Dual-mode: Web Demo Gradio interaktif + REST API `/predict` kencang (~30ms) |
| **Web Console** | Next.js 16 (App Router), Tailwind v4 | Dashboard analitik admin & portal warga responsif |
| **Mobile App** | React Native, Expo SDK 58 | Aplikasi Android & iOS dengan kamera AI, deteksi lokasi GPS, onboarding carousel, dan podium jawara |

---

## 🚀 Panduan Menjalankan Sistem (How to Run)

Berikut adalah panduan menjalankan seluruh ekosistem **Smart Waste** di komputer lokal langkah demi langkah:

### 📋 Prasyarat Sistem
- **Node.js** v18+ atau v20+ ([Download Node.js](https://nodejs.org/))
- **Python** 3.10+ atau 3.11+ ([Download Python](https://www.python.org/))
- **PostgreSQL 16+** (Native Windows Service atau via Docker)
- **Git**

---

### Langkah 0: Menjalankan Database Mandiri (Pilih Salah Satu)

#### Opsi A: Menjalankan via Docker Compose (Rekomendasi)
```bash
cd database
docker compose up -d
```
* PostgreSQL berjalan di `localhost:5432` (User: `postgres`, Password: `postgres123`, DB: `smartwaste`).
* Web GUI pgAdmin 4 dapat diakses di `http://localhost:5050` (Email: `admin@smartwaste.id`, Pass: `admin123`).

#### Opsi B: Menjalankan via Service PostgreSQL Lokal
Pastikan service PostgreSQL aktif di port 5432, lalu jalankan DDL inisialisasi:
```bash
psql -U postgres -h localhost -p 5432 -d smartwaste -f database/init.sql
```

---

### Langkah 1: Setup & Jalankan Backend (NestJS)

1. Masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Pastikan file `.env` mengarah ke database PostgreSQL mandiri Anda:
   ```env
   DATABASE_URL="postgresql://postgres:password_db_anda@localhost:5432/smartwaste?schema=public"
   DIRECT_URL="postgresql://postgres:password_db_anda@localhost:5432/smartwaste?schema=public"
   JWT_SECRET="smart-waste-super-secret-key-2026"
   PORT=3000
   PUBLIC_URL="http://localhost:3000"
   ML_API_URL="http://127.0.0.1:8000"  # atau URL Hugging Face Space AI Anda
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Jalankan sinkronisasi Prisma dan seed data awal:
   ```bash
   npx prisma db push
   npm run prisma:seed
   ```
5. Jalankan server backend:
   ```bash
   npm run start:dev
   ```
   * Backend berjalan di: `http://localhost:3000`
   * Dokumentasi Swagger: `http://localhost:3000/api/docs`

---

### Langkah 2: Setup & Jalankan Layanan AI/ML (FastAPI - Opsional Lokal)

*Catatan: Backend dapat dihubungkan ke server AI cloud di Hugging Face Space atau dijalankan secara lokal di komputer pengembang:*

1. Buka terminal baru, masuk ke direktori ML API:
   ```bash
   cd ml/api
   ```
2. Buat virtual environment Python dan aktifkan:
   ```bash
   # Windows PowerShell
   python -m venv .venv
   .venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Jalankan server inferensi AI:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *Layanan AI berjalan di: `http://localhost:8000` (Swagger docs: `http://localhost:8000/docs`)*

---

### Langkah 3: Setup & Jalankan Web Admin (Next.js)

1. Buka terminal baru, masuk ke direktori web:
   ```bash
   cd web
   npm install
   npm run dev
   ```
2. Buka browser di: `http://localhost:3001` (atau port yang ditampilkan di terminal).

---

### Langkah 4: Menjalankan Aplikasi Mobile (Expo / APK)

#### A. Menjalankan di Development Mode (Expo Go):
```bash
cd mobile
npm install
npx expo start
```
Scan QR Code yang muncul di terminal menggunakan aplikasi **Expo Go** pada HP Android Anda.

#### B. Build File APK Standalone (Siap Install):
```bash
cd mobile
npx eas-cli build -p android --profile preview
```
Tunggu hingga proses cloud build selesai, lalu unduh file `.apk` langsung ke HP Anda.

---

## 🛡️ Infrastruktur Database Mandiri & Disaster Recovery

Seluruh berkas administrasi basis data terpusat di direktori [`database/`](./database/):

### 1. Pencadangan Data (*Backup*)
Jalankan script backup otomatis (akan membaca kontainer Docker atau instance lokal secara cerdas):
```bash
# Windows
cd database
backup.bat

# Linux / macOS
cd database
./backup.sh
```
*File dump SQL otomatis tersimpan di folder `database/backups/smartwaste_backup_YYYYMMDD_HHMMSS.sql`.*

### 2. Pemulihan Data (*Restore*)
```bash
# Windows
cd database
restore.bat

# Linux / macOS
cd database
./restore.sh smartwaste_backup_xxxx.sql
```

---

## 👤 Akun Demo Pengujian

Untuk mempermudah pengujian instan, sistem menyediakan akun terkonfigurasi:

| Peran (Role) | Email | Password | Akses & Wewenang |
|---|---|---|---|
| **Administrator** | `admin@smartwaste.id` | `Admin123!` | Verifikasi laporan, ubah status penanganan, kelola pengguna, analitik tren |
| **Warga (User)** | `warga@smartwaste.id` | `Warga123!` | Melaporkan sampah, deteksi kamera AI, melihat status audit & podium jawara |

---

## 🌐 Status Deployment Produksi

Seluruh ekosistem telah siap dan aktif di lingkungan *cloud production* untuk kebutuhan evaluasi dan pengujian penguji/dosen:

| Layanan | Platform | Status | Keterangan & Aksesibilitas |
|---|---|:---:|---|
| **Backend REST API** | Render Cloud | 🟢 Active | Terproteksi JWT, Rate-Limiting, & SSL (`https://<smart-waste-backend>.onrender.com/api/v1`) |
| **Swagger API Docs** | Render Cloud | 🟢 Active | Dokumentasi interaktif OpenAPI (`/api/docs`) |
| **AI Inference & Demo** | Hugging Face Spaces | 🟢 Active | Dual-Mode: Web Demo Gradio interaktif & REST API `/predict` |
| **Object Storage (CDN)** | Cloudflare R2 | 🟢 Active | Multi-region edge storage untuk foto tumpukan sampah |
| **Web Console Admin** | Vercel | 🟢 Active | Dashboard analitik & portal manajemen laporan petugas |
| **Mobile Android App** | EAS Cloud Build | 🟢 Ready | File APK mandiri (v1.0.2) siap dipasang di perangkat Android |

> [!NOTE]
> **Akses Pengujian Evaluator / Penguji:**  
> Untuk melindungi kuota server gratis (*free-tier*) dari serangan *automated web-crawler* dan bot *spamming*, tautan langsung produksi (*live endpoint*) serta kredensial pengujian khusus evaluator disertakan secara terpisah dalam dokumen pengumpulan tugas / lembar presentasi resmi.

---
*Smart Waste Management System — Dikembangkan oleh Dzaky.*
