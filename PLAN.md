# Smart Waste Management System: Project Plan

Technical Coding Test, Fullstack Developer (Bilcode Technology)

## Status Ringkas

| Fase | Nama | Status |
|---|---|---|
| 0 | Fondasi (repo, struktur, skema DB) | ✅ Selesai |
| 1 | Backend inti (NestJS + PostgreSQL) | ✅ Selesai |
| 2 | Machine Learning (model + FastAPI) | ⏳ Ditunda sementara |
| 3 | Website admin (Next.js) | ✅ Selesai |
| 4 | Aplikasi mobile (Expo / React Native) | ⏳ Berikutnya |
| 5 | Deploy + integrasi end-to-end | ⬜ Belum |
| 6 | Dokumentasi + video demo + submit | ⬜ Belum |

Legenda: ✅ selesai, ⏳ sedang/berikutnya, ⬜ belum dimulai.

---

## Fase 3: Website Admin (Next.js) ✅ Selesai

Hasil akhir: Website Next.js responsive dengan Tailwind CSS terintegrasi penuh ke backend NestJS.

- [x] **Setup Next.js & Tailwind CSS**: Project Next.js App Router dengan TypeScript, Tailwind CSS, Lucide Icons.
- [x] **Autentikasi & Role**:
  - Halaman login (`/login`) & pendaftaran (`/register`)
  - Tombol demo instant login untuk Admin (`admin@smartwaste.id` / `Admin123!`) dan User
  - AuthProvider (Context), token storage, auto-restore session via `/auth/me`
  - Proteksi route dan pembedaan antarmuka berdasarkan role (`ADMIN` vs `USER`)
- [x] **Dashboard Statistik Laporan**:
  - 4 Kartu metrik utama (Total Laporan, Pengguna Warga, Perlu Ditindak, Selesai Ditangani)
  - Distribusi status (Pending, In Progress, Completed, Rejected)
  - Distribusi kategori sampah (Organik, Plastik, Kertas) dengan visualisasi bar
  - Grafik tren laporan harian interaktif (rentang 7, 14, 30 hari)
  - Preview 5 laporan sampah terbaru dengan link ke detail
  - Tampilan khusus User yang disesuaikan (`/dashboard/me`)
- [x] **Manajemen Laporan Sampah (CRUD)**:
  - Form buat laporan (`CreateReportModal`): upload foto, deteksi kategori otomatis via AI (`/ai/predict`), deteksi koordinat GPS HTML5, deskripsi, alamat
  - Tabel dan card responsif dengan sorting (tanggal, status), pagination dinamis, limit per halaman
  - Modal detail laporan (`ReportDetailModal`): preview foto ukuran penuh, koordinat + tombol buka di Google Maps, audit log riwayat status, pelapor
  - Hapus laporan dengan konfirmasi modal (`ConfirmModal`)
- [x] **Filter dan Pencarian Laporan**:
  - Pencarian teks real-time / form (deskripsi, alamat, nama pelapor)
  - Filter status (Semua, Pending, In Progress, Completed, Rejected)
  - Filter kategori (Semua, Organik, Plastik, Kertas)
  - Pengurutan (Terbaru/Terlama) dan tombol reset filter
- [x] **Update Status Laporan**:
  - Khusus Admin via `UpdateStatusModal`
  - Pilihan status: Pending, In Progress, Completed, Rejected
  - Catatan tindak lanjut admin (tersimpan ke `report_status_logs` via transaksi DB)
- [x] **Manajemen Pengguna (CRUD User)**:
  - Khusus Admin di route `/users`
  - Daftar pengguna dengan filter role & pencarian
  - Tambah pengguna baru (Admin / User)
  - Edit pengguna (Nama, Nomor Telepon, Role, Switch Status Aktif/Nonaktif)
  - Hapus pengguna dengan konfirmasi modal
- [x] **Profil & Keamanan Akun**:
  - Halaman `/profile` untuk memperbarui data diri (Nama, No HP) dan ganti password
- [x] **Desain Responsif**:
  - Sidebar dinamis (desktop sticky, mobile slide drawer)
  - Responsif di layar HP, tablet, maupun desktop

