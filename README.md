# E-Paper Radar Kediri (Digital Newspaper & Books Portal)

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Midtrans](https://img.shields.io/badge/Midtrans-Payment-007FFF?style=for-the-badge)](https://midtrans.com/)

Portal koran digital (E-Paper) dan katalog koleksi buku digital resmi milik **Radar Kediri** (Jawa Pos Group). Aplikasi web ini dirancang secara profesional dengan arsitektur modern berbasis Next.js App Router, sistem perlindungan berkas PDF (read-only), serta integrasi sistem langganan paket dan pembayaran Midtrans Snap.

---

## 🚀 Fitur Utama Sistem

### 1. 🔐 Sistem Autentikasi Pengguna
*   Registrasi dan Login menggunakan **Supabase Auth** (Email/Password & Google Single Sign-On).
*   Manajemen sesi yang aman dengan JWT (JSON Web Token) yang dikirimkan secara otomatis dalam header `Authorization` ke setiap endpoint API yang dilindungi.
*   Pembedaan hak akses berbasis peran (*Role-Based Access Control*): `user` dan `admin`.

### 2. 📰 Katalog E-Paper Koran
*   Penyajian arsip koran harian digital yang diunggah secara berkala oleh Admin.
*   **Pratinjau Aman (Anti-Auto Download)**: Pratinjau koran di halaman detail menggunakan gambar cover resolusi tinggi dengan efek hover interaktif, alih-alih iframe PDF mentah. Solusi ini 100% mencegah peramban mobile (Chrome/Safari) dari melakukan unduhan berkas PDF secara otomatis sebelum berlangganan.
*   **PDF Reader Kustom**: Pembaca PDF internal yang dinonaktifkan toolbar dan panel kontrol default bawaan browsernya (`#toolbar=0`) untuk estetika yang lebih bersih.
*   Fitur **Unduh (Download)** berkas PDF koran harian secara sah yang hanya terbuka bagi pengguna berlangganan aktif atau pembeli edisi koran terkait.

### 3. 📚 Katalog Buku Digital (Read-Only)
*   Daftar koleksi buku digital lokal (Sejarah, Kuliner, Pariwisata, dan UMKM Kediri) gratis dibaca bagi seluruh pengguna terdaftar.
*   **Proteksi PDF Ketat**: Pembaca PDF buku bersifat murni **baca-saja (read-only)**. Tombol unduh dinonaktifkan sepenuhnya, panel cetak browser disembunyikan, dan klik kanan (`contextmenu`) dinonaktifkan guna meminimalkan plagiarisme.
*   **Integrasi Kontak**: Tombol *"Tanya Pembelian"* yang menghubungkan langsung ke WhatsApp resmi Radar Kediri jika pengguna tertarik membeli buku versi cetak fisik.

### 4. 💳 Langganan & Sistem Pembayaran (Midtrans Snap)
*   **Keranjang Belanja (Shopping Cart)**: Dibangun dengan Zustand state management untuk mengelola pembelian edisi koran e-paper satuan.
*   **Tingkatan Paket Langganan**: Menyediakan 5 pilihan paket harga langganan premium:
    *   **1 Bulan**: IDR 30.000 (30 Hari)
    *   **3 Bulan**: IDR 90.000 (90 Hari)
    *   **6 Bulan**: IDR 180.000 (180 Hari)
    *   **9 Bulan**: IDR 270.000 (270 Hari)
    *   **1 Tahun**: IDR 360.000 (365 Hari - Best Value)
*   **Midtrans Sandbox**: Pembayaran instan via Gopay, QRIS, ShopeePay, dan Transfer Bank. Status transaksi (pending, success, expired) langsung diperbarui otomatis di database melalui API Webhook Midtrans.

### 5. 🛠️ Panel Dashboard Administrasi
*   Antarmuka khusus Admin untuk mengelola katalog koran dan buku digital.
*   Unggah berkas cover (JPG/PNG) dan dokumen PDF. Berkas akan diunggah langsung ke **AWS S3 bucket** (menggunakan `@aws-sdk/client-s3`) dengan fallback ke penyimpanan disk lokal jika konfigurasi S3 tidak aktif.

### 6. 🔍 Pencarian Navigasi Cerdas
*   Fitur kotak pencarian (*Search Bar*) di header navigasi utama terintegrasi dengan URL parameter `q`. 
*   Pencarian akan secara cerdas memfilter katalog `/books` ketika user berada di menu Buku, dan memfilter katalog `/newspapers` ketika berada di menu Koran.

---

## 🛠️ Tech Stack & Dependensi

*   **Core**: React 18, Next.js 14 (App Router), TypeScript.
*   **Database**: PostgreSQL, Prisma ORM.
*   **Styling & UI**: Tailwind CSS, Lucide React (Ikon).
*   **Auth**: Supabase Auth Client & Server SDK.
*   **Payment Gateway**: Midtrans Client SDK.
*   **File Storage**: AWS S3 Client SDK (`@aws-sdk/client-s3`).
*   **State Management**: Zustand (Cart & Storage Persistence).

---

## ⚙️ Persiapan & Instalasi

### 1. Kloning Repositori
```bash
git clone https://github.com/ragilaryakusuma/E-Paper_Radar_Kediri.git
cd E-Paper_Radar_Kediri
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin berkas `.env.example` menjadi `.env` atau `.env.local` dan lengkapi nilai variabel berikut:
```bash
cp .env.example .env
```

Isi berkas `.env`:
```env
# Database PostgreSQL (Lokal/Supabase)
DATABASE_URL="postgresql://postgres:password@localhost:5432/radar_kediri?schema=public"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Midtrans Payment (Sandbox)
MIDTRANS_SERVER_KEY="SB-Mid-server-..."
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-..."

# AWS S3 Storage (Kosongkan jika ingin fallback ke Disk Lokal)
AWS_REGION="ap-southeast-1"
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="your-s3-bucket-name"

# Konfigurasi Aplikasi
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Sinkronisasi Database (Prisma)
Jalankan migrasi database PostgreSQL dan regenerasi Prisma Client:
```bash
# Push skema prisma ke database
npx prisma db push

# Regenerasi Prisma Client
npx prisma generate
```

### 5. Seeding Database
Jalankan seed data untuk menyuntikkan user admin bawaan, 5 paket langganan baru, contoh buku, edisi koran, dan agenda kegiatan:
```bash
npm run prisma:seed
```

*Akun bawaan dari seed data:*
*   **Akun Admin**: `admin@radarkediri.id` / Password: `admin123`
*   **Akun Demo**: `demo@radarkediri.id` (otomatis login via tombol demo di menu Koleksi)

---

## 🏃 Memulai Server Pengembangan

Jalankan server lokal dalam mode pengembangan:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di peramban Anda.

Untuk memverifikasi kesiapan kompilasi produksi:
```bash
npm run build
```

---

## 📂 Struktur Direktori Utama

```text
├── prisma/
│   ├── schema.prisma   # Skema Database PostgreSQL
│   └── seed.ts         # Script Seeding Data Awal & 5 Paket Langganan
├── public/
│   └── uploads/        # Fallback Penyimpanan PDF & Cover Lokal
├── src/
│   ├── app/
│   │   ├── admin/      # Halaman Dashboard Administrasi (Upload Buku & Koran)
│   │   ├── api/        # Endpoint API (Library, Payment, Reader Access, Edisi)
│   │   ├── auth/       # Fitur Autentikasi (Register & Login)
│   │   ├── books/      # Katalog Buku Digital & Proteksi Reader
│   │   ├── cart/       # Keranjang Belanja Koran Satuan
│   │   ├── library/    # Koleksi Saya (Koran & Buku Milik User)
│   │   ├── newspapers/ # Katalog E-Paper & Detail Koran
│   │   └── subscription/ # Halaman Pilihan 5 Paket Langganan Premium
│   ├── components/     # Komponen Reusable (Header, Footer, EditionCard, dll)
│   ├── lib/
│   │   ├── context/    # AuthContext (Supabase Sesi)
│   │   ├── store/      # Zustand CartStore (Keranjang Belanja)
│   │   ├── midtrans.ts # Utilitas Integrasi SDK Midtrans
│   │   └── s3.ts       # Handler Upload S3 & Local Fallback
```

---

## 🛡️ Kebijakan Lisensi & Kontribusi

*   Hak Cipta © 2026 Radar Kediri. Semua hak dilindungi undang-undang.
*   Direpositori ini dibangun khusus untuk program pengembangan digitalisasi surat kabar dan kegiatan Kerja Praktik (KP).
