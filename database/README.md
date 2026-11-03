# 🐘 Smart Waste Management - Self-Managed PostgreSQL Database

Dokumentasi arsitektur, konfigurasi infrastruktur, pengelolaan skema, dan prosedur *disaster recovery* basis data **PostgreSQL** yang dikelola secara mandiri (*self-managed*) untuk proyek Smart Waste.

---

## 📌 Daftar Isi
1. [Arsitektur & Konsep Mandiri](#1-arsitektur--konsep-mandiri)
2. [Spesifikasi Skema & Relasi (DDL)](#2-spesifikasi-skema--relasi-ddl)
3. [Menjalankan Database Lokal via Docker Compose](#3-menjalankan-database-lokal-via-docker-compose)
4. [Menjalankan Database Lokal secara Native (Windows / Linux)](#4-menjalankan-database-lokal-secara-native)
5. [Panduan Deploy Live Database Mandiri di Cloud](#5-panduan-deploy-live-database-mandiri-di-cloud)
6. [Konfigurasi Connection Pooling & Tuning](#6-konfigurasi-connection-pooling--tuning)
7. [Prosedur Backup & Restore (Disaster Recovery)](#7-prosedur-backup--restore-disaster-recovery)
8. [Panduan Menjawab Penguji / Dosen](#8-panduan-menjawab-penguji--dosen)

---

## 1. Arsitektur & Konsep Mandiri

Berbeda dengan solusi *Backend-as-a-Service* (BaaS seperti Supabase atau Firebase) yang membungkus database dengan REST API dan otentikasi otomatis, implementasi ini menggunakan **PostgreSQL Murni (*Pure Relational Database*)**:
- **Kendali Penuh Skema:** Integritas relasional, enum, trigger `updated_at`, dan constraint spasial dikonfigurasi melalui DDL native SQL dan Prisma Schema.
- **Koneksi Langsung (*Direct Pooling*):** Backend NestJS berkomunikasi langsung melalui TCP socket port 5432 ke PostgreSQL driver tanpa layer perantara.
- **Portabilitas Tinggi:** Dapat dijalankan di laptop pengembang (Windows native), kontainer Docker, maupun server produksi cloud (Render / VPS Ubuntu).

---

## 2. Spesifikasi Skema & Relasi (DDL)

File skema inisialisasi tersedia di [`init.sql`](./init.sql).

### A. Tipe Enum Kustom
- `user_role`: `'ADMIN'`, `'USER'`
- `report_status`: `'PENDING'`, `'IN_PROGRESS'`, `'COMPLETED'`, `'REJECTED'`
- `waste_category`: `'ORGANIC'`, `'PLASTIC'`, `'PAPER'`

### B. Tabel-Tabel Utama
1. **`users`**: Menyimpan identitas pengguna dan kredensial (password ter-hash bcrypt dengan salt rounds 10).
2. **`reports`**: Menyimpan laporan sampah dari warga, mencakup koordinat GPS (`latitude` & `longitude`), URL gambar dari Cloudflare R2, hasil prediksi model AI (`category` & `ai_confidence`), dan status penanganan.
   - Relasi: `ON DELETE CASCADE` ke tabel `users`.
   - Validasi: `CHECK (latitude BETWEEN -90 AND 90)` dan `CHECK (longitude BETWEEN -180 AND 180)`.
3. **`report_status_logs`**: Menyimpan jejak audit (*audit trail*) setiap kali status laporan berubah (siapa yang mengubah, kapan, status sebelum/sesudah, dan catatan admin).
   - Relasi: `ON DELETE CASCADE` ke tabel `reports`, `ON DELETE SET NULL` ke tabel `users`.

### C. Indeks Performa
- `idx_reports_user_id`: Mempercepat query riwayat laporan per user.
- `idx_reports_status`: Mempercepat filter laporan pending/selesai pada dashboard admin.
- `idx_reports_category`: Mempercepat agregasi statistik jenis sampah (Organik, Plastik, Kertas).
- `idx_reports_created_at`: Mengoptimalkan sorting kronologis laporan terbaru.

---

## 3. Menjalankan Database Lokal via Docker Compose

Jika Anda ingin menjalankan database dalam kontainer terisolasi bersama GUI web **pgAdmin**:

### Jalankan Layanan:
```bash
cd database
docker compose up -d
```

### Akses Layanan:
| Layanan | Host / Port | Kredensial Default |
|---|---|---|
| **PostgreSQL** | `localhost:5432` | User: `postgres`, Password: `postgres123`, DB: `smartwaste` |
| **pgAdmin 4 (GUI)** | `http://localhost:5050` | Email: `admin@smartwaste.id`, Password: `admin123` |

### Menghubungkan pgAdmin ke PostgreSQL Docker:
1. Buka browser di `http://localhost:5050`.
2. Login dengan akun pgAdmin di atas.
3. Klik kanan **Servers** > **Register** > **Server...**.
4. Tab **General**: beri nama `Smart Waste DB`.
5. Tab **Connection**:
   - Host name/address: `postgres` (nama service docker) atau `host.docker.internal`
   - Port: `5432`
   - Maintenance database: `smartwaste`
   - Username: `postgres`
   - Password: `postgres123`
6. Klik **Save**. Seluruh tabel dan view langsung dapat diinspeksi.

---

## 4. Menjalankan Database Lokal secara Native

Jika menjalankan PostgreSQL langsung di sistem operasi (misal PostgreSQL 16/17/18 for Windows):

1. Buka command prompt / PowerShell, masuk ke folder `database/`:
   ```powershell
   psql -U postgres -h localhost -p 5432 -d postgres
   ```
2. Buat database baru:
   ```sql
   CREATE DATABASE smartwaste;
   \c smartwaste;
   ```
3. Eksekusi script DDL inisialisasi:
   ```powershell
   psql -U postgres -h localhost -p 5432 -d smartwaste -f init.sql
   ```
4. Hubungkan Backend NestJS dengan mengatur file `backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/smartwaste?schema=public"
   ```

---

## 5. Panduan Deploy Live Database Mandiri di Cloud

Untuk men-deploy database ke server publik tanpa BaaS:

### Opsi 1: Render PostgreSQL (Gratis, Terisolasi, & Cloud-Native)
1. Buka [dashboard.render.com](https://dashboard.render.com).
2. Klik tombol **New +** > pilih **PostgreSQL**.
3. Isi parameter:
   - **Name:** `smart-waste-db`
   - **Database:** `smartwaste`
   - **User:** `postgres`
   - **Region:** Singapore (atau terdekat dengan backend)
   - **Plan:** Free
4. Setelah dibuat, salin **Internal Database URL** (jika backend di Render) atau **External Database URL**.
5. Buka service `smart-waste-backend` di Render > menu **Environment**:
   - Update `DATABASE_URL` ke URL Render PostgreSQL baru.
6. Migrasikan tabel secara otomatis dari lokal:
   ```bash
   cd backend
   npx prisma db push
   npx prisma db seed
   ```

### Opsi 2: VPS Mandiri (Ubuntu 22.04 / 24.04 via Docker)
1. Masuk ke server VPS via SSH.
2. Clone repository:
   ```bash
   git clone https://github.com/USERNAME/smart-waste.git
   cd smart-waste/database
   ```
3. Jalankan Docker Compose:
   ```bash
   docker compose up -d
   ```
4. Database siap diakses pada port 5432 dengan firewall yang diamankan (`ufw allow 5432/tcp`).

---

## 6. Konfigurasi Connection Pooling & Tuning

Prisma ORM di NestJS dikonfigurasi untuk menangani *connection lifecycle*:

```text
DATABASE_URL="postgresql://user:pass@host:5432/smartwaste?schema=public&connection_limit=10&pool_timeout=20"
```

- `connection_limit=10`: Membatasi maksimal 10 koneksi simultan dari backend per worker instance, mencegah kehabisan memory (*Out of Memory / Too Many Connections*) pada server database.
- `pool_timeout=20`: Batas waktu tunggu maksimal (20 detik) sebelum query melempar error timeout jika semua koneksi pool sedang sibuk.

---

## 7. Prosedur Backup & Restore (Disaster Recovery)

Folder ini menyediakan script siap pakai untuk mencadangkan dan memulihkan data:

### A. Melakukan Backup
- **Windows:** Klik ganda atau jalankan `backup.bat`.
- **Linux / macOS:**
  ```bash
  chmod +x backup.sh
  ./backup.sh
  ```
*File dump SQL akan otomatis terbuat di folder `database/backups/smartwaste_backup_YYYYMMDD_HHMMSS.sql`.*

### B. Melakukan Restore
- **Windows:** Jalankan `restore.bat` (Anda akan diminta memilih file backup).
- **Linux / macOS:**
  ```bash
  chmod +x restore.sh
  ./restore.sh smartwaste_backup_xxx.sql
  ```

---

## 8. Panduan Menjawab Penguji / Dosen

| Pertanyaan Penguji | Jawaban Teknis Rekomendasi |
|---|---|
| *"Kenapa tidak pakai Supabase atau Firebase saja?"* | *"Kami sengaja mengelola PostgreSQL mandiri agar memiliki kendali penuh atas indeks relasional, constraint spasial, trigger audit trail, dan connection pooling, serta menghindari vendor lock-in. Backend NestJS kami mengontrol penuh enkripsi password bcrypt dan logika bisnis."* |
| *"Bagaimana struktur relasi datanya?"* | *"Ada 3 entitas inti: `users`, `reports`, dan `report_status_logs`. Relasi `reports` ke `users` bersifat 1-to-many dengan `ON DELETE CASCADE`. Sedangkan perubahan status memiliki audit trail log tersendiri di `report_status_logs` sehingga histori perubahan dapat ditelusuri."* |
| *"Bagaimana jika server database mengalami crash?"* | *"Kami telah menyiapkan strategi disaster recovery menggunakan otomatisasi `pg_dump` terjadwal (tersedia di `database/backup.bat` dan `backup.sh`), serta orkestrasinya dapat dideploy ulang secara instan melalui `docker-compose.yml`."* |
