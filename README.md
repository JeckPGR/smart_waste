# ♻️ Smart Waste Management System

> **Sistem Manajemen dan Pelaporan Tumpukan Sampah Berbasis AI (Mobile, Web Admin, Backend API, & Deep Learning)**  
> Technical Coding Test — Fullstack Developer (Bilcode Technology)

---

## 📌 Daftar Isi
1. [Tentang Sistem & Fitur Utama](#-tentang-sistem--fitur-utama)
2. [Arsitektur & Struktur Folder Monorepo](#-arsitektur--struktur-folder-monorepo)
3. [Entity Relationship Diagram (ERD)](#-entity-relationship-diagram-erd)
4. [Alur & Cara Kerja Sistem (End-to-End Workflow)](#-alur--cara-kerja-sistem-end-to-end-workflow)
5. [Spesifikasi Teknis & Tech Stack](#-spesifikasi-teknis--tech-stack)
6. [Panduan Menjalankan Sistem (How to Run)](#-panduan-menjalankan-sistem-how-to-run)
7. [Akun Demo Pengujian](#-akun-demo-pengujian)

---

## 🌟 Tentang Sistem & Fitur Utama

**Smart Waste Management System** adalah platform terintegrasi yang memudahkan masyarakat melaporkan tumpukan sampah liar secara cepat dan transparan, sekaligus membantu petugas kebersihan/admin memverifikasi dan mengelola penanganan sampah secara efisien.

### 🚀 Fitur Unggulan
1. **Deteksi Sampah Otomatis Berbasis AI**:
   - Menggunakan model transfer learning **MobileNetV2** yang mampu mengklasifikasikan 3 jenis sampah secara akurat: **Organik**, **Plastik**, dan **Kertas** dengan akurasi pengujian **96.7%**.
2. **Kamera & Geocoding GPS Presisi**:
   - Pengambilan foto resolusi penuh (*full capture*) tanpa pemotongan paksa, dilengkapi reverse geocoding alamat jalan otomatis.
3. **Penyimpanan Cloud Terpusat**:
   - Foto tersimpan secara aman di **Cloudflare R2 Object Storage** (kompatibel S3) dengan akses URL CDN publik berkecepatan tinggi.
4. **Audit Log & Perjalanan Status Transparan**:
   - Setiap perubahan status (`Menunggu` $\rightarrow$ `Diproses` $\rightarrow$ `Selesai` / `Ditolak`) mencatat identitas petugas, stempel waktu, dan catatan resmi penanganan.
5. **Gamifikasi & Podium Leaderboard Warga**:
   - Sistem **Eco XP** dan **Level Warga** (+50 XP per temuan, +50 XP per sampah tuntas diverifikasi).
   - Layar **Podium Top 10** dengan pilar olimpiade berwarna (Emas 🥇, Perak 🥈, Perunggu 🥉) serta kartu horizontal peringkat 4–10.
6. **Web Console Modern dengan Urutan Prioritas**:
   - Filter instan kategori dan status, dengan urutan prioritas tindakan petugas:  
     $$\text{Menunggu (PENDING)} \longrightarrow \text{Diproses (IN\_PROGRESS)} \longrightarrow \text{Ditolak (REJECTED)} \longrightarrow \text{Selesai (COMPLETED)}$$

---

## 📂 Arsitektur & Struktur Folder Monorepo

Sistem dibangun dalam satu kesatuan repository (*monorepo*) yang terbagi menjadi modul-modul independen:

```
smart-waste/
├── backend/            # REST API Service (NestJS + Prisma + PostgreSQL + R2)
│   ├── prisma/         # Prisma Schema & Database Migrations
│   ├── src/
│   │   ├── ai/         # Klien integrasi ke layanan ML/FastAPI
│   │   ├── auth/       # Autentikasi JWT, login, register, roles guard
│   │   ├── common/     # Middleware, decorators, pagination, exception filters
│   │   ├── dashboard/  # Statistik, grafik tren harian, dan endpoint Leaderboard Top 10
│   │   ├── reports/    # CRUD Laporan sampah, audit status logs, update status
│   │   ├── storage/    # Upload & manajemen Cloudflare R2 (AWS S3 SDK)
│   │   └── users/      # Manajemen akun dan profil pengguna
│   └── uploads/        # Fallback direktori lokal jika S3 tidak aktif
│
├── web/                # Portal Web Admin & Warga (Next.js 16 + Tailwind CSS v4)
│   ├── src/
│   │   ├── app/        # Next.js App Router (/dashboard, /reports, /users, /login)
│   │   ├── modules/    # UI views & komponen per modul (auth, dashboard, reports, users)
│   │   └── shared/     # Komponen UI bersama (Button, Card, Dialog, Input, Sidebar)
│
├── mobile/             # Aplikasi Mobile Warga (React Native + Expo SDK 58)
│   ├── assets/         # Ikon aplikasi, splash screen, sprite maskot
│   ├── src/
│   │   ├── modules/    # Layar Auth, Beranda, Podium Leaderboard, Buat Laporan, Detail
│   │   ├── navigation/ # React Navigation (Tab Navigator 4 Menu & Native Stack)
│   │   └── shared/     # Komponen Retro Pixel & Slate (PixelCard, PixelBadge, Dialog)
│
├── ml/                 # Layanan Machine Learning & Deep Learning (FastAPI + Keras)
│   ├── api/            # Server inferensi FastAPI (/predict) & Dockerfile
│   │   └── model/      # Model terlatih (waste_model.keras) & metadata kelas
│   ├── dataset/        # Panduan dataset dan ringkasan data train/val/test
│   ├── evaluation/     # Confusion matrix, classification report, training curves
│   └── notebooks/      # Jupyter notebook pipeline pelatihan MobileNetV2
│
└── docs/               # Dokumentasi rancangan sistem & skema database mentah (schema.sql)
```

---

## 🗄️ Entity Relationship Diagram (ERD)

Database menggunakan **PostgreSQL** dengan integritas data relasional yang dikelola melalui **Prisma ORM**:

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
    participant ML as 🧠 ML API (FastAPI)
    participant Storage as ☁️ Cloudflare R2
    participant DB as 🗄️ PostgreSQL
    actor Admin as 💻 Admin (Web Portal)

    Warga->>Warga: Buka Kamera & Potret Tumpukan Sampah
    Warga->>Backend: Kirim Foto untuk Deteksi (POST /ai/predict)
    Backend->>ML: Forward Gambar (POST /predict)
    ML-->>Backend: Hasil Klasifikasi (e.g. PLASTIC, Akurasi 95%)
    Backend-->>Warga: Rekomendasi Kategori Otomatis

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
| **Backend API** | NestJS 11, TypeScript, Prisma 6 | REST API arsitektur modular, validasi DTO, JWT Authentication |
| **Database** | PostgreSQL | Penyimpanan relasional ACID dengan trigger auto `updated_at` |
| **Object Storage** | Cloudflare R2 (AWS S3 SDK v3) | Penyimpanan file gambar terdistribusi dengan zero-egress fees |
| **Machine Learning** | FastAPI, TensorFlow 2.x, Keras 3 | Transfer Learning MobileNetV2 (Organik, Plastik, Kertas) |
| **Web Console** | Next.js 16 (App Router), Tailwind v4 | Dashboard analitik admin & portal warga dengan tema Brand Green |
| **Mobile App** | React Native, Expo SDK 58 | Aplikasi Android & iOS dengan kamera AI, GPS, dan Podium |

---

## 🚀 Panduan Menjalankan Sistem (How to Run)

Berikut adalah panduan menjalankan seluruh ekosistem **Smart Waste** di komputer lokal langkah demi langkah:

### 📋 Prasyarat Sistem
- **Node.js** v18+ atau v20+ ([Download Node.js](https://nodejs.org/))
- **Python** 3.10+ atau 3.11+ ([Download Python](https://www.python.org/))
- **PostgreSQL** running di `localhost:5432` (Database: `smartwaste`)
- **Git**

---

### Langkah 1: Setup & Jalankan Backend (NestJS)

1. Masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Salin environment file dan sesuaikan kredensial:
   ```bash
   cp .env.example .env
   ```
   *Pastikan `DATABASE_URL` mengarah ke database PostgreSQL lokal Anda:*
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smartwaste?schema=public"
   JWT_SECRET="smart-waste-super-secret-key-2026"
   PORT=3000
   ML_API_URL="http://127.0.0.1:8000"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Jalankan migrasi Prisma dan seed data awal:
   ```bash
   npx prisma db push
   npm run prisma:seed
   ```
5. Jalankan server backend:
   ```bash
   npm run start:dev
   ```
   *Backend berjalan di: `http://localhost:3000` (Dokumentasi Swagger: `http://localhost:3000/api/docs`)*

---

### Langkah 2: Setup & Jalankan Layanan AI/ML (FastAPI)

1. Buka terminal baru, masuk ke direktori ML API:
   ```bash
   cd ml/api
   ```
2. Buat virtual environment Python dan aktifkan:
   ```bash
   # Windows PowerShell
   python -m venv .venv
   .venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv .venv
   source .venv/bin/activate
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
   ```
2. Salin environment file:
   ```bash
   cp .env.example .env.local
   ```
   *Isi environment (`.env.local`):*
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Jalankan server development:
   ```bash
   npm run dev
   ```
   *Buka browser di: `http://localhost:3001` (atau port yang ditampilkan di terminal).*

---

### Langkah 4: Setup & Jalankan Aplikasi Mobile (Expo)

1. Buka terminal baru, masuk ke direktori mobile:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Jalankan Expo dev server:
   ```bash
   npx expo start
   ```
4. **Cara Menjalankan di Perangkat**:
   - **HP Fisik**: Install aplikasi **Expo Go** dari Google Play Store / App Store, sambungkan HP ke Wi-Fi yang sama dengan laptop/PC, lalu scan QR Code yang muncul di terminal.
   - **Android Emulator**: Tekan huruf `a` di terminal.

> [!TIP]
> **Pengujian di HP Fisik**:
> Jika menguji langsung menggunakan HP fisik, pastikan IP server diatur menggunakan alamat IP LAN komputer Anda (contoh: `http://192.168.1.10:3000/api/v1`). Anda dapat langsung mengubah alamat URL server ini secara fleksibel melalui menu **Pengaturan Akun** di dalam aplikasi mobile.

---

## 👤 Akun Demo Pengujian

Untuk mempermudah pengujian instan, sistem telah menyediakan tombol *1-Click Demo Login* pada halaman login Web dan Mobile:

| Peran (Role) | Email | Password | Akses & Wewenang |
|---|---|---|---|
| **Administrator** | `admin@smartwaste.id` | `Admin123!` | Verifikasi laporan, ubah status penanganan, kelola pengguna, analitik tren |
| **Warga (User)** | `warga@smartwaste.id` | `Warga123!` | Melaporkan sampah, deteksi kamera AI, melihat status audit & podium jawara |

---

## 🏆 Kriteria Penilaian Teknis yang Terpenuhi
- ✅ **Backend**: Arsitektur modular, validasi ketat, DTO, transaksi Prisma, JWT auth, Swagger dokumentasi.
- ✅ **Frontend Web**: Next.js 16 App Router, responsive design, visualisasi tren & distribusi kategori, filter prioritas penanganan.
- ✅ **Mobile**: Expo SDK 58, navigasi tab & stack, kamera full capture, perlindungan reload memori (*LMK recovery*), GPS location.
- ✅ **Machine Learning**: Model klasifikasi akurat MobileNetV2 (96.7%), inferensi cepat via FastAPI, graceful fallback simulator jika server AI offline.
- ✅ **Cloud Storage**: Integrasi Cloudflare R2 bucket untuk efisiensi penyimpanan gambar berskala besar.

---
*Smart Waste Management System — Dikembangkan oleh Dzaky.*

