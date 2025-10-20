# Dokumentasi Website Citra Overseas

## 📋 Konsep Aplikasi

**Citra Overseas** adalah platform digital untuk memfasilitasi pencarian dan pengelolaan lowongan kerja di luar negeri. Platform ini menghubungkan pencari kerja Indonesia dengan peluang karier internasional secara aman, transparan, dan terpercaya.

## 🎯 Tujuan Platform

1. Memudahkan pencari kerja menemukan lowongan internasional yang sesuai
2. Menyediakan sistem manajemen dokumen yang terorganisir
3. Memberikan rekomendasi lowongan berdasarkan profil pengguna
4. Memfasilitasi proses aplikasi kerja yang efisien
5. Menyediakan dashboard admin untuk mengelola lowongan dan peserta

## 👥 Jenis Pengguna

### 1. Peserta (Job Seekers)
- Dapat mendaftar dan membuat profil
- Melihat lowongan kerja yang tersedia
- Mendapatkan rekomendasi lowongan berdasarkan profil
- Mengajukan lamaran pekerjaan
- Mengelola dokumen (CV, paspor, sertifikat)
- Melacak status lamaran

### 2. Admin
- Mengelola lowongan kerja (tambah, edit, hapus)
- Melihat dan mengelola data peserta
- Memproses aplikasi peserta
- Mengakses laporan dan statistik
- Melihat grafik performa platform

## 🏗️ Struktur Website

### Halaman Publik (Tanpa Login)
1. **Landing Page** (`/`)
   - Hero section dengan CTA
   - Keunggulan platform
   - Proses pendaftaran
   - Testimoni alumni
   - Footer dengan informasi kontak

2. **Halaman Lowongan** (`/jobs`)
   - Daftar semua lowongan aktif
   - Detail lowongan (negara, gaji, persyaratan)
   - Tombol apply yang mengarahkan ke login

3. **Halaman Auth** (`/login`, `/register`)
   - Form login dan registrasi
   - Validasi input
   - Redirect berdasarkan role

### Dashboard Peserta (`/dashboard`)
1. **Profil** (`/dashboard/profile`)
   - Edit data pribadi
   - Informasi target negara
   - Level pendidikan dan pengalaman
   - Bahasa yang dikuasai

2. **Rekomendasi** (`/dashboard/recommended`)
   - Lowongan yang cocok dengan profil
   - Match score berdasarkan kriteria

3. **Lowongan** (`/dashboard/jobs`)
   - Semua lowongan aktif
   - Filter dan pencarian

4. **Lamaran Saya** (`/dashboard/applications`)
   - Status lamaran (pending, approved, rejected)
   - Riwayat aplikasi
   - Match score per aplikasi

5. **Dokumen** (`/dashboard/documents`)
   - Upload CV/Resume
   - Upload Paspor
   - Upload Sertifikat Bahasa
   - Upload Ijazah
   - Dokumen lainnya
   - Download dan hapus dokumen

### Dashboard Admin (`/admin`)
1. **Dashboard** (`/admin`)
   - Overview statistik
   - Grafik aplikasi
   - Metrik utama

2. **Kelola Lowongan** (`/admin/jobs`)
   - Tambah lowongan baru
   - Edit lowongan existing
   - Aktifkan/nonaktifkan lowongan

3. **Kelola Peserta** (`/admin/participants`)
   - Lihat semua peserta
   - Detail profil peserta
   - Manage user roles

4. **Laporan** (`/admin/reports`)
   - Grafik aplikasi per bulan
   - Statistik lowongan per negara
   - Status aplikasi
   - Export data

## 🗄️ Struktur Database

### Tabel: `profiles`
- Data pribadi pengguna
- Target negara, pendidikan, pengalaman
- Bahasa yang dikuasai
- Dokumen yang diupload

### Tabel: `jobs`
- Informasi lowongan kerja
- Kategori, negara, gaji
- Persyaratan (pendidikan, pengalaman)
- Status aktif/nonaktif

### Tabel: `applications`
- Lamaran kerja dari peserta
- Link ke CV dan cover letter
- Status (pending, approved, rejected)
- Match score

### Tabel: `user_roles`
- Role pengguna (admin/participant)
- Digunakan untuk authorization

## 🔐 Keamanan & Authorization

### Row Level Security (RLS)
- Peserta hanya bisa melihat data mereka sendiri
- Admin bisa melihat semua data
- File storage terproteksi per user

### Authentication
- Email & password authentication
- Session management otomatis
- Auto-confirm email untuk development
- Secure logout functionality

### File Storage
- Bucket: `documents` (private)
- RLS policies untuk akses file
- Max upload: 5MB per file
- Format: PDF, DOC, DOCX, JPG, PNG

## 🎨 Fitur UI/UX

### Multi-bahasa
- Indonesia (default)
- English
- Language switcher di navbar

### Responsive Design
- Mobile-first approach
- Tablet dan desktop optimized
- Adaptive layouts

### Animasi
- Framer Motion untuk smooth transitions
- Scroll animations di landing page
- Loading states

### Components
- Shadcn UI components
- Custom design system
- Dark/light mode ready

## 🤖 AI Features

### ChatBot Assistant
- Floating chatbot di semua halaman
- Menjawab pertanyaan umum
- Panduan penggunaan platform

### Job Matching Algorithm
- Algoritma scoring berdasarkan:
  - Kesesuaian negara (30 poin)
  - Pengalaman kerja (30 poin)
  - Pendidikan (20 poin)
  - Kelengkapan profil (20 poin)
- Score 0-100 untuk setiap aplikasi

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router DOM** - Navigation
- **i18next** - Internationalization
- **Shadcn UI** - Component library

### Backend (Supabase)
- **Authentication** - Email/password
- **PostgreSQL** - Database
- **Storage** - File uploads
- **Edge Functions** - Chat assistant
- **RLS Policies** - Data security

### State Management
- **TanStack Query** - Server state
- **React Hooks** - Local state

## 📦 Deployment

### Hosting
- Frontend 
- Auto-deployment on push
- Custom domain support

### Environment Variables
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## 🔄 User Flow

### Flow Pencari Kerja:
1. Kunjungi landing page
2. Lihat lowongan atau daftar langsung
3. Buat akun (role: participant)
4. Lengkapi profil
5. Upload dokumen
6. Lihat rekomendasi lowongan
7. Apply ke lowongan yang sesuai
8. Monitor status lamaran

### Flow Admin:
1. Login dengan akun admin
2. Dashboard overview
3. Tambah lowongan baru
4. Review aplikasi masuk
5. Update status aplikasi
6. Lihat laporan & statistik
7. Manage peserta

## 📊 Metrics & Analytics

### Key Metrics
- Total peserta terdaftar
- Total lowongan aktif
- Total aplikasi
- Conversion rate
- Aplikasi per bulan
- Lowongan per negara

### Reports
- Grafik aplikasi bulanan
- Distribusi lowongan per negara
- Status aplikasi (pie chart)
- Export ke PDF/Excel (coming soon)

## 🚀 Future Enhancements

### Planned Features
1. Email notifications
2. SMS notifications
3. Video interview integration
4. Document verification
5. Payment integration
6. Training module
7. Alumni network
8. Mobile app
9. Advanced filtering
10. Saved job searches

## 📝 Notes untuk Developer

### Setup Development
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

### Code Structure
```
src/
├── components/        # Reusable components
│   ├── ui/           # Shadcn components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── ChatBot.tsx
├── pages/            # Page components
│   ├── Landing.tsx
│   ├── Auth.tsx
│   ├── Jobs.tsx
│   ├── dashboard/    # Participant pages
│   └── admin/        # Admin pages
├── i18n/             # Translations
│   ├── config.ts
│   └── locales/
├── integrations/     # Supabase
└── lib/             # Utilities
```

### Best Practices
- Gunakan semantic tokens untuk colors
- Follow component composition pattern
- Implement proper error handling
- Use TypeScript types strictly
- Keep components small & focused
- Write reusable hooks

## 📞 Support

Untuk pertanyaan atau bantuan:
- Website: https://citraoverseas.com
- Email: info@citraoverseas.com
- WhatsApp: +62 XXX XXX XXX

---

**Version:** 1.0.0  
**Last Updated:** 2025-01-13  
**Maintained by:** Citra Overseas Team
