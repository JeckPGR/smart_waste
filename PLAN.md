# Smart Waste Management System: Project Plan

Technical Coding Test, Fullstack Developer (Bilcode Technology)

## Status Ringkas

| Fase | Nama | Status |
|---|---|---|
| 0 | Fondasi (repo, struktur, skema DB) | ✅ Selesai |
| 1 | Backend inti (NestJS + PostgreSQL + R2) | ✅ Selesai |
| 2 | Machine Learning (model + FastAPI) | ✅ Selesai |
| 3 | Website admin (Next.js 16 + Tailwind v4) | ✅ Selesai |
| 4 | Aplikasi mobile (Expo SDK 58 / React Native) | ✅ Selesai |
| 5 | Deploy + integrasi end-to-end | ✅ Selesai |
| 6 | Dokumentasi lengkap & README | ✅ Selesai |

Legenda: ✅ selesai, ⏳ sedang/berikutnya, ⬜ belum dimulai.

---

## Fase 4: Aplikasi Mobile Warga (React Native + Expo) ✅ Selesai

Hasil akhir: Aplikasi mobile React Native (Expo) bertema Light Slate dengan sentuhan Retro Pixel Art, tombol utama hijau, onboarding splash screen pertama, dan terintegrasi penuh ke backend NestJS.

- [x] **Setup Expo & TypeScript**:
  - Inisialisasi Expo SDK 58 dengan React Native 0.88 & TypeScript.
  - Path alias `@/*` di `tsconfig.json`.
  - Typecheck lolos (`npx tsc --noEmit` 0 error).
  - Dry run export Metro Bundler lolos untuk Android & iOS.
- [x] **First Splash Screen**:
  - Halaman sambutan onboarding warga dengan estetika pixel art (`[ LEVEL 1 ECO CITIZEN ]`, sprite maskot `♻️`, highlight 3 fitur unggulan, tombol hijau `[ MULAI SEKARANG ➔ ]`).
- [x] **Autentikasi (JWT)**:
  - Register & Login warga dengan token disimpan di `AsyncStorage`.
  - Tombol demo instant login untuk warga & admin.
  - Proteksi navigasi (transisi otomatis Splash ➔ Auth ➔ MainTabs).
- [x] **Dashboard Pengguna**:
  - Pangkat Eco Citizen & XP bar (`LVL 1 • 100 XP`).
  - 4 Kotak statistik laporan harian (Total, Menunggu, Diproses, Selesai).
  - Kartu ajakan cepat lapor sampah dengan tombol hijau.
  - Kartu misi harian eco warga.
  - Riwayat 3 laporan sampah terbaru warga.
  - Pull-to-refresh untuk sinkronisasi data.
- [x] **Pembuatan Laporan Sampah (Formulir Multi-Langkah)**:
  - Ambil foto via Kamera atau Galeri (`expo-image-picker`).
  - Deteksi jenis sampah otomatis via AI (`POST /ai/predict`) dengan badge persentase akurasi.
  - Pemilihan kategori sampah: Organik, Plastik, Kertas.
  - Deteksi GPS otomatis (`expo-location`) dan reverse geocoding alamat jalan.
  - Input deskripsi laporan sampah.
  - Pengiriman multipart/form-data ke backend NestJS.
- [x] **Riwayat & Detail Laporan**:
  - Tab riwayat laporan dengan filter status (Semua, Menunggu, Diproses, Selesai, Ditolak).
  - Tampilan detail laporan: foto resolusi penuh, koordinat, tombol buka Google Maps.
  - Audit log status: mencatat transisi status dan catatan tindak lanjut petugas secara transparan.
  - Opsi pembatalan/penghapusan laporan oleh warga selama status masih `PENDING`.
- [x] **Profil & Pengaturan URL Backend**:
  - Tampilan profil pengguna dan status akun.
  - Pengaturan URL server dinamis (memudahkan pengujian via HP fisik di jaringan Wi-Fi LAN `http://192.168.1.10:3000/api/v1` atau emulator `http://10.0.2.2:3000/api/v1`).
  - Tombol logout dengan dialog konfirmasi.
- [x] **Desain & Sentuhan Pixel Art**:
  - Tombol hijau retro dengan bayangan bertingkat (`PixelButton`).
  - Kartu bergaris tegas dengan drop shadow retro (`PixelCard`).
  - Tag status berkurung pixel (`PixelBadge`: `[ ♻️ ORGANIK ]`, `[ ⏳ MENUNGGU ]`).
  - State kosong pixel art (`PixelEmptyState`).
  - Placeholder loading animasi denyut (`PixelSkeleton`).

---

## Fase 3: Website Admin (Next.js) ✅ Selesai

Hasil akhir: Website Next.js responsive dengan Tailwind CSS terintegrasi penuh ke backend NestJS.

- [x] **Setup Next.js & Tailwind CSS**: Project Next.js App Router dengan TypeScript, Tailwind CSS, Lucide Icons.
- [x] **Autentikasi & Role**:
  - Halaman login (`/login`) & pendaftaran (`/register`)
  - Tombol demo instant login untuk Admin (`admin@smartwaste.id` / `Admin123!`) dan Warga (`warga@smartwaste.id` / `Warga123!`)
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
