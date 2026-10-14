-- =========================================================================
-- SKEMA LENGKAP DATABASE SUPABASE (POSTGRESQL)
-- SISTEM INFORMASI POSYANDU MELATI RW 03 SUKAMAJU
-- =========================================================================
-- Modul:
-- 1. Autentikasi & Profil Pengguna (Bidan, Kader, Petugas, Admin)
-- 2. Master Data Balita & Riwayat Penimbangan E-KMS WHO (Z-Score & 2T Stunting)
-- 3. Master Data Ibu Hamil (Bumil) & Skrining KEK / Anemia
-- 4. Master Data Ibu Menyusui (Busui) & Pemantauan ASI Eksklusif
-- 5. Master Data Lansia & Riwayat Pemeriksaan Penyakit Tidak Menular (PTM)
-- 6. Katalog Menu Makanan Bergizi Gratis (MBG) & Formula PMT
-- 7. Log Rekomendasi Menu MBG (Metode SAW) & Penyaluran PMT
-- 8. Pengelolaan Konten Landing Page Publik (Galeri Foto & Jadwal Posyandu)
-- 9. Row Level Security (RLS) & Kebijakan Akses Keamanan
-- 10. Data Awal (Seed Data) Siap Pakai
-- =========================================================================

-- Aktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- FUNGSI HELPER: AUTOMATIC TIMESTAMP UPDATER
-- =========================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- 1. TABEL PROFIL PENGGUNA (TERHUBUNG KE SUPABASE AUTH)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  role VARCHAR(50) NOT NULL DEFAULT 'kader' CHECK (role IN ('admin', 'bidan', 'kader', 'petugas', 'warga')),
  no_hp VARCHAR(20),
  posyandu VARCHAR(100) DEFAULT 'Posyandu Melati',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER trigger_update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 2. TABEL DATA BALITA (0 - 59 BULAN)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.balita (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nik VARCHAR(16) UNIQUE NOT NULL,
  nama VARCHAR(150) NOT NULL,
  jenis_kelamin CHAR(1) NOT NULL CHECK (jenis_kelamin IN ('L', 'P')),
  tanggal_lahir DATE NOT NULL,
  nama_ibu VARCHAR(150) NOT NULL,
  nama_ayah VARCHAR(150),
  alamat TEXT NOT NULL,
  rt VARCHAR(5) DEFAULT '01',
  rw VARCHAR(5) DEFAULT '03',
  posyandu VARCHAR(100) DEFAULT 'Posyandu Melati',
  no_hp VARCHAR(20),
  desil_ekonomi INT DEFAULT 2 CHECK (desil_ekonomi BETWEEN 1 AND 5),
  status_bansos BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER trigger_update_balita_updated_at
BEFORE UPDATE ON public.balita
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 3. TABEL PEMERIKSAAN BULANAN BALITA (E-KMS WHO)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.pemeriksaan_balita (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  balita_id UUID NOT NULL REFERENCES public.balita(id) ON DELETE CASCADE,
  tanggal_periksa DATE NOT NULL DEFAULT CURRENT_DATE,
  usia_bulan INT NOT NULL CHECK (usia_bulan >= 0),
  berat_badan NUMERIC(5,2) NOT NULL CHECK (berat_badan > 0), -- dalam kg
  tinggi_badan NUMERIC(5,2) NOT NULL CHECK (tinggi_badan > 0), -- dalam cm
  lingkar_kepala NUMERIC(5,2), -- dalam cm
  cara_ukur VARCHAR(20) DEFAULT 'terlentang' CHECK (cara_ukur IN ('terlentang', 'berdiri')),
  z_score_bbu NUMERIC(4,2), -- BB/U Z-Score WHO
  z_score_tbu NUMERIC(4,2), -- TB/U Z-Score WHO
  z_score_bbtb NUMERIC(4,2), -- BB/TB Z-Score WHO
  status_bbu VARCHAR(50) CHECK (status_bbu IN ('Gizi Buruk', 'Gizi Kurang', 'Gizi Baik', 'Risiko Lebih')),
  status_tbu VARCHAR(50) CHECK (status_tbu IN ('Sangat Pendek', 'Pendek', 'Normal', 'Tinggi')),
  status_bbtb VARCHAR(50) CHECK (status_bbtb IN ('Gizi Buruk (Wasting)', 'Gizi Kurang', 'Normal', 'Beresiko Obesitas')),
  status_kms VARCHAR(10) NOT NULL CHECK (status_kms IN ('N', 'T', '2T', 'BGM', 'O', 'B')),
  kenaikan_bb NUMERIC(5,2) DEFAULT 0, -- kg dibanding bulan lalu
  kbm NUMERIC(5,2) DEFAULT 0, -- Kenaikan Berat Minimal standar Kemenkes
  vitamin_a BOOLEAN DEFAULT false,
  obat_cacing BOOLEAN DEFAULT false,
  imunisasi VARCHAR(150) DEFAULT '-',
  keluhan TEXT,
  catatan_kader TEXT,
  petugas_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 4. TABEL IBU HAMIL (BUMIL) & SKRINING KEK / ANEMIA
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.ibu_hamil (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nik VARCHAR(16) UNIQUE NOT NULL,
  nama VARCHAR(150) NOT NULL,
  tanggal_lahir DATE NOT NULL,
  nama_suami VARCHAR(150),
  alamat TEXT NOT NULL,
  posyandu VARCHAR(100) DEFAULT 'Posyandu Melati',
  no_hp VARCHAR(20),
  hpht DATE, -- Hari Pertama Haid Terakhir
  hpl DATE, -- Hari Perkiraan Lahir
  usia_kehamilan_minggu INT DEFAULT 0,
  gravida INT DEFAULT 1,
  partus INT DEFAULT 0,
  abortus INT DEFAULT 0,
  lila_awal NUMERIC(4,1), -- cm
  lila_saat_ini NUMERIC(4,1), -- cm
  hb NUMERIC(4,1), -- g/dL
  status_kek BOOLEAN DEFAULT false, -- LiLA < 23.5 cm
  status_anemia BOOLEAN DEFAULT false, -- Hb < 11.0 g/dL
  desil_ekonomi INT DEFAULT 2 CHECK (desil_ekonomi BETWEEN 1 AND 5),
  buku_kia BOOLEAN DEFAULT true,
  konsumsi_ttd INT DEFAULT 0, -- jumlah tablet tambah darah
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER trigger_update_ibu_hamil_updated_at
BEFORE UPDATE ON public.ibu_hamil
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 5. TABEL IBU MENYUSUI (BUSUI) & DUKUNGAN LAKTASI
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.ibu_menyusui (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nik VARCHAR(16) UNIQUE NOT NULL,
  nama VARCHAR(150) NOT NULL,
  tanggal_lahir DATE NOT NULL,
  nama_suami VARCHAR(150),
  alamat TEXT NOT NULL,
  posyandu VARCHAR(100) DEFAULT 'Posyandu Melati',
  no_hp VARCHAR(20),
  nama_bayi VARCHAR(150) NOT NULL,
  usia_bayi_bulan INT NOT NULL DEFAULT 0,
  status_asi_eksklusif BOOLEAN DEFAULT true,
  lila NUMERIC(4,1), -- cm
  status_kek BOOLEAN DEFAULT false,
  vitamin_a_nifas BOOLEAN DEFAULT true,
  konsumsi_ttd INT DEFAULT 0,
  keluhan TEXT,
  desil_ekonomi INT DEFAULT 2 CHECK (desil_ekonomi BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER trigger_update_ibu_menyusui_updated_at
BEFORE UPDATE ON public.ibu_menyusui
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 6. TABEL POSYANDU LANSIA (USIA 60+ TAHUN)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.lansia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nik VARCHAR(16) UNIQUE NOT NULL,
  nama VARCHAR(150) NOT NULL,
  jenis_kelamin CHAR(1) NOT NULL CHECK (jenis_kelamin IN ('L', 'P')),
  tanggal_lahir DATE NOT NULL,
  usia_tahun INT NOT NULL,
  nama_keluarga VARCHAR(150),
  alamat TEXT NOT NULL,
  no_hp VARCHAR(20),
  posyandu VARCHAR(100) DEFAULT 'Posyandu Melati',
  golongan_darah VARCHAR(3),
  riwayat_penyakit TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER trigger_update_lansia_updated_at
BEFORE UPDATE ON public.lansia
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 7. TABEL PEMERIKSAAN KESEHATAN LANSIA (SKRINING PTM)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.pemeriksaan_lansia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lansia_id UUID NOT NULL REFERENCES public.lansia(id) ON DELETE CASCADE,
  tanggal_periksa DATE NOT NULL DEFAULT CURRENT_DATE,
  berat_badan NUMERIC(5,2) NOT NULL,
  tinggi_badan NUMERIC(5,2) NOT NULL,
  imt NUMERIC(4,1), -- Indeks Massa Tubuh
  status_gizi VARCHAR(50) CHECK (status_gizi IN ('Kurus', 'Normal', 'Kelebihan Berat', 'Obesitas')),
  tensi_sistolik INT NOT NULL, -- mmHg
  tensi_diastolik INT NOT NULL, -- mmHg
  status_tensi VARCHAR(50) CHECK (status_tensi IN ('Hipotensi', 'Normal', 'Pre-Hipertensi', 'Hipertensi')),
  gula_darah NUMERIC(5,1) NOT NULL, -- mg/dL (GDS)
  status_gula_darah VARCHAR(50) CHECK (status_gula_darah IN ('Normal', 'Pre-Diabetes', 'Tinggi (Diabetes)')),
  kolesterol NUMERIC(5,1), -- mg/dL
  asam_urat NUMERIC(4,1), -- mg/dL
  keluhan TEXT,
  tindakan_edukasi TEXT,
  petugas VARCHAR(100),
  petugas_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 8. TABEL KATALOG MENU MAKANAN BERGIZI (MBG) & FORMULA PMT
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.menu_mbg (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_menu VARCHAR(200) NOT NULL,
  kategori VARCHAR(100) NOT NULL CHECK (kategori IN (
    'Balita Gizi Kurang',
    'Balita Stunting',
    'Bumil KEK',
    'Busui Gizi Tambahan',
    'Lansia Gizi Khusus',
    'Gizi Seimbang Umum'
  )),
  target_sasaran VARCHAR(50) NOT NULL CHECK (target_sasaran IN ('Balita', 'Bumil', 'Busui', 'Lansia', 'Semua')),
  deskripsi TEXT,
  komposisi TEXT[] DEFAULT '{}',
  kalori INT NOT NULL, -- kkal
  protein NUMERIC(5,2) NOT NULL, -- gram
  zat_besi NUMERIC(5,2) NOT NULL, -- mg
  anjuran_pemberian TEXT,
  foto_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER trigger_update_menu_mbg_updated_at
BEFORE UPDATE ON public.menu_mbg
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 9. TABEL DISTRIBUSI & LOG REKOMENDASI MBG (SISTEM SAW)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.distribusi_mbg (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  sasaran_id UUID NOT NULL,
  nama_sasaran VARCHAR(150) NOT NULL,
  jenis_sasaran VARCHAR(20) NOT NULL CHECK (jenis_sasaran IN ('Balita', 'Bumil', 'Busui', 'Lansia')),
  menu_id UUID REFERENCES public.menu_mbg(id) ON DELETE SET NULL,
  nama_menu VARCHAR(200) NOT NULL,
  porsi INT DEFAULT 1,
  skor_saw NUMERIC(5,4), -- Nilai Vi Metode SAW
  ranking INT,
  prioritas VARCHAR(50) CHECK (prioritas IN ('Sangat Mendesak', 'Prioritas Tinggi', 'Prioritas Sedang', 'Pemantauan Rutin')),
  keterangan TEXT,
  petugas VARCHAR(100),
  status_konsumsi VARCHAR(50) DEFAULT 'Habis',
  evaluasi_bb NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 10. TABEL CMS LANDING PAGE: GALERI FOTO PUBLIK
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.landing_galeri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  src TEXT NOT NULL,
  alt VARCHAR(255) DEFAULT 'Dokumentasi Pelayanan Posyandu Melati',
  urutan INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- 11. TABEL CMS LANDING PAGE: JADWAL SESI POSYANDU
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.landing_jadwal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date INT NOT NULL DEFAULT 15,
  session_month VARCHAR(30) NOT NULL DEFAULT 'Oktober',
  session_year INT NOT NULL DEFAULT 2026,
  session_day_name VARCHAR(30) NOT NULL DEFAULT 'Kamis',
  session_time VARCHAR(50) NOT NULL DEFAULT '08.00 - 12.00 WIB',
  session_location VARCHAR(200) NOT NULL DEFAULT 'Balai Pertemuan Warga RW 03',
  address TEXT NOT NULL DEFAULT 'Jl. Melati Raya No. 12, Kelurahan Sukamaju',
  target_summary TEXT NOT NULL DEFAULT 'Balita (0-59 bln), Ibu Hamil, Busui, dan Lansia',
  contact_person_name VARCHAR(100) NOT NULL DEFAULT 'Bdn. Siti Rahma, S.Tr.Keb',
  contact_whatsapp VARCHAR(30) NOT NULL DEFAULT '6281278901234',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER trigger_update_landing_jadwal_updated_at
BEFORE UPDATE ON public.landing_jadwal
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- INDEXING UNTUK MENGOPTIMALKAN PERFORMA QUERY
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_balita_nik ON public.balita(nik);
CREATE INDEX IF NOT EXISTS idx_pemeriksaan_balita_id ON public.pemeriksaan_balita(balita_id);
CREATE INDEX IF NOT EXISTS idx_pemeriksaan_tanggal ON public.pemeriksaan_balita(tanggal_periksa);
CREATE INDEX IF NOT EXISTS idx_pemeriksaan_status_kms ON public.pemeriksaan_balita(status_kms);
CREATE INDEX IF NOT EXISTS idx_ibu_hamil_nik ON public.ibu_hamil(nik);
CREATE INDEX IF NOT EXISTS idx_ibu_menyusui_nik ON public.ibu_menyusui(nik);
CREATE INDEX IF NOT EXISTS idx_lansia_nik ON public.lansia(nik);
CREATE INDEX IF NOT EXISTS idx_pemeriksaan_lansia_id ON public.pemeriksaan_lansia(lansia_id);
CREATE INDEX IF NOT EXISTS idx_distribusi_sasaran_id ON public.distribusi_mbg(sasaran_id);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) & ACCESS CONTROL POLICIES
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pemeriksaan_balita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ibu_hamil ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ibu_menyusui ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lansia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pemeriksaan_lansia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_mbg ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribusi_mbg ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_galeri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_jadwal ENABLE ROW LEVEL SECURITY;

-- 1. Kebijakan Publik untuk Landing Page (Bebas Dibaca Warga Tanpa Login)
DROP POLICY IF EXISTS "Public can view active landing gallery" ON public.landing_galeri;
CREATE POLICY "Public can view active landing gallery"
  ON public.landing_galeri FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active landing schedule" ON public.landing_jadwal;
CREATE POLICY "Public can view active landing schedule"
  ON public.landing_jadwal FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active MBG menu" ON public.menu_mbg;
CREATE POLICY "Public can view active MBG menu"
  ON public.menu_mbg FOR SELECT
  USING (true);

-- 2. Kebijakan Akses Penuh untuk Kader, Bidan & Aplikasi Web (Anon & Authenticated)
DROP POLICY IF EXISTS "Authenticated users full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Full access to profiles" ON public.profiles;
CREATE POLICY "Full access to profiles"
  ON public.profiles FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to balita" ON public.balita;
DROP POLICY IF EXISTS "Full access to balita" ON public.balita;
CREATE POLICY "Full access to balita"
  ON public.balita FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to pemeriksaan balita" ON public.pemeriksaan_balita;
DROP POLICY IF EXISTS "Full access to pemeriksaan balita" ON public.pemeriksaan_balita;
CREATE POLICY "Full access to pemeriksaan balita"
  ON public.pemeriksaan_balita FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to ibu hamil" ON public.ibu_hamil;
DROP POLICY IF EXISTS "Full access to ibu hamil" ON public.ibu_hamil;
CREATE POLICY "Full access to ibu hamil"
  ON public.ibu_hamil FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to ibu menyusui" ON public.ibu_menyusui;
DROP POLICY IF EXISTS "Full access to ibu menyusui" ON public.ibu_menyusui;
CREATE POLICY "Full access to ibu menyusui"
  ON public.ibu_menyusui FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to lansia" ON public.lansia;
DROP POLICY IF EXISTS "Full access to lansia" ON public.lansia;
CREATE POLICY "Full access to lansia"
  ON public.lansia FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to pemeriksaan lansia" ON public.pemeriksaan_lansia;
DROP POLICY IF EXISTS "Full access to pemeriksaan lansia" ON public.pemeriksaan_lansia;
CREATE POLICY "Full access to pemeriksaan lansia"
  ON public.pemeriksaan_lansia FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to menu mbg" ON public.menu_mbg;
DROP POLICY IF EXISTS "Full access to menu mbg" ON public.menu_mbg;
CREATE POLICY "Full access to menu mbg"
  ON public.menu_mbg FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to distribusi mbg" ON public.distribusi_mbg;
DROP POLICY IF EXISTS "Full access to distribusi mbg" ON public.distribusi_mbg;
CREATE POLICY "Full access to distribusi mbg"
  ON public.distribusi_mbg FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to landing galeri" ON public.landing_galeri;
DROP POLICY IF EXISTS "Full access to landing galeri" ON public.landing_galeri;
CREATE POLICY "Full access to landing galeri"
  ON public.landing_galeri FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to landing jadwal" ON public.landing_jadwal;
DROP POLICY IF EXISTS "Full access to landing jadwal" ON public.landing_jadwal;
CREATE POLICY "Full access to landing jadwal"
  ON public.landing_jadwal FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- =========================================================================
-- FUNGSI & TRIGGER OTOMATIS: AUTO PROFILE ON AUTH USER SIGNUP
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nama, email, role, posyandu)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama', 'Kader Posyandu Melati'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'kader'),
    'Posyandu Melati'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pada skema auth.users Supabase
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- 12. DATA AWAL (SEED DATA)
-- =========================================================================

-- Seed Galeri Landing Page
INSERT INTO public.landing_galeri (src, alt, urutan) VALUES
('/images/hero_posyandu.jpg', 'Pelayanan Ramah Ibu dan Anak di Posyandu Melati', 1),
('/images/dok_timbang_balita.jpg', 'Penimbangan Digital dan Pengukuran Antropometri Balita', 2),
('/images/dok_bumil_checkup.jpg', 'Pemeriksaan Kesehatan Antenatal dan Bimbingan KIA', 3),
('/images/galeri_imunisasi.jpg', 'Pemberian Vitamin A dan Imunisasi Lengkap Balita', 4),
('/images/galeri_lansia.jpg', 'Senam Kebugaran Lansia dan Skrining PTM Bersama', 5),
('/images/galeri_pmt.jpg', 'Penyajian Menu Tambahan Gizi Sehat PMT MBG', 6)
ON CONFLICT DO NOTHING;

-- Seed Jadwal Sesi Posyandu
INSERT INTO public.landing_jadwal (
  session_date, session_month, session_year, session_day_name,
  session_time, session_location, address, target_summary,
  contact_person_name, contact_whatsapp
) VALUES (
  15, 'Oktober', 2026, 'Kamis',
  '08.00 - 12.00 WIB', 'Balai Pertemuan Warga RW 03', 'Jl. Melati Raya No. 12, Kelurahan Sukamaju',
  'Balita (0-59 bln), Ibu Hamil, Busui, dan Lansia',
  'Bdn. Siti Rahma, S.Tr.Keb', '6281278901234'
) ON CONFLICT DO NOTHING;

-- Seed Katalog Menu MBG & Formula PMT
INSERT INTO public.menu_mbg (id, nama_menu, kategori, target_sasaran, deskripsi, komposisi, kalori, protein, zat_besi, anjuran_pemberian, foto_url) VALUES
('b0000000-0000-0000-0000-000000000001', 'Bubur Singgang Telur Puyuh & Hati Ayam Fortifikasi', 'Balita Gizi Kurang', 'Balita', 'Formula pemulihan padat kalori dengan protein hewani ganda (telur puyuh + hati ayam) untuk mengejar ketertinggalan BB (Weight Faltering).', ARRAY['Beras organik fortifikasi', 'Hati ayam cincang (30g)', 'Telur puyuh (2 butir)', 'Minyak kelapa', 'Bayam cincang'], 245, 9.8, 4.2, '1 porsi di sela waktu makan utama (pukul 10.00 atau 15.30).', '/images/galeri_pmt.jpg'),
('b0000000-0000-0000-0000-000000000002', 'Nasi Tim Semur Ikan Kembung & Tahu Daun Kelor', 'Balita Stunting', 'Balita', 'Kaya asam lemak omega-3, zinc, dan kalsium alami dari ikan kembung dan daun kelor untuk stimulasi pertumbuhan tulang balita pendek.', ARRAY['Beras merah campur', 'Fillet ikan kembung segar (40g)', 'Tahu sutra kukus', 'Daun kelor muda', 'Wortel parut halus'], 220, 10.5, 3.1, '1 kali sehari sebagai makanan kaya mikronutrien.', '/images/galeri_pmt.jpg'),
('b0000000-0000-0000-0000-000000000003', 'Paket Padat Energi Bumil: Semur Daging Sapi & Sup Rolade Hati', 'Bumil KEK', 'Bumil', 'Menu intervensi bumil KEK (LiLA < 23.5 cm) padat protein hewani dan folat tinggi untuk mencegah BBLR.', ARRAY['Nasi pulen hangat', 'Daging sapi cincang (60g)', 'Kacang merah rendam (35g)', 'Hati ayam rempah', 'Sayur bayam bening'], 520, 24.5, 8.6, 'Porsi tambahan dikonsumsi setiap hari bersama tablet tambah darah (TTD).', '/images/dok_bumil_checkup.jpg'),
('b0000000-0000-0000-0000-000000000004', 'Sup Bening Daun Katuk Jagung Manis & Ikan Gabus Panggang Rempah', 'Busui Gizi Tambahan', 'Busui', 'Formula laktogenik alami untuk merangsang hormon prolaktin & oksitosin pelancar ASI, diperkaya protein albumin ikan gabus.', ARRAY['Daun katuk segar petik', 'Fillet ikan gabus bakar rempah (60g)', 'Jagung manis pipil', 'Tahu sutra kukus', 'Bawang putih & jahe'], 360, 22.0, 6.5, 'Konsumsi selagi hangat 1 mangkuk setiap kali makan untuk memaksimalkan produksi ASI.', '/images/galeri_pmt.jpg'),
('b0000000-0000-0000-0000-000000000005', 'Sup Ikan Gabus Sayur Labu Siam & Tahu Kukus (Khusus Lansia)', 'Lansia Gizi Khusus', 'Lansia', 'Tinggi albumin dan kalsium alami, rendah garam dan bebas kolesterol jahat, mudah dicerna untuk persendian lansia.', ARRAY['Fillet ikan gabus kukus rempah (50g)', 'Labu siam iris lembut', 'Tahu sutra', 'Kuah kaldu jahe bawang putih'], 280, 18.2, 3.5, 'Sajikan hangat saat makan siang atau sore.', '/images/galeri_lansia.jpg')
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Data Balita
INSERT INTO public.balita (id, nik, nama, jenis_kelamin, tanggal_lahir, nama_ibu, nama_ayah, alamat, rt, rw, posyandu, no_hp, desil_ekonomi, status_bansos) VALUES
('c0000000-0000-0000-0000-000000000001', '3201123456780001', 'Muhammad Kenzo Ramadhan', 'L', '2024-03-10', 'Siti Rohayati', 'Ahmad Syafii', 'RT 02 / RW 01', '02', '03', 'Posyandu Melati', '081298765431', 1, true),
('c0000000-0000-0000-0000-000000000002', '3201123456780002', 'Aisyah Putri Azzahra', 'P', '2023-11-20', 'Nurul Hidayah', 'Bambang Irawan', 'RT 03 / RW 01', '03', '03', 'Posyandu Melati', '081377889900', 1, true),
('c0000000-0000-0000-0000-000000000003', '3201123456780003', 'Rafka Alvaro Pratama', 'L', '2024-01-15', 'Dewi Lestari', 'Dodi Hendrawan', 'RT 01 / RW 02', '01', '03', 'Posyandu Melati', '082155443322', 2, true)
ON CONFLICT (nik) DO NOTHING;

-- Seed Sample Data Pemeriksaan Balita (KMS & Stunting)
INSERT INTO public.pemeriksaan_balita (
  balita_id, tanggal_periksa, usia_bulan, berat_badan, tinggi_badan, lingkar_kepala,
  cara_ukur, z_score_bbu, z_score_tbu, z_score_bbtb, status_bbu, status_tbu, status_bbtb,
  status_kms, kenaikan_bb, kbm, vitamin_a, obat_cacing, imunisasi, keluhan, catatan_kader
) VALUES
('c0000000-0000-0000-0000-000000000001', '2024-09-15', 6, 6.4, 65.0, 42.0, 'terlentang', -2.3, -1.8, -2.1, 'Gizi Kurang', 'Normal', 'Gizi Kurang', '2T', 0.1, 0.4, true, false, 'DPT-HB-Hib 3, Polio 4', 'Nafsu makan menurun', 'Weight faltering 2x berturut-turut tidak naik. Prioritas Menu MBG.'),
('c0000000-0000-0000-0000-000000000002', '2024-09-15', 10, 6.8, 68.5, 43.0, 'terlentang', -3.1, -2.4, -2.9, 'Gizi Buruk', 'Pendek', 'Gizi Kurang', 'BGM', -0.1, 0.2, false, false, '-', 'BB turun 100 gram, lesu', 'BGM Z-Score < -3 SD, butuh intervensi MBG intensif dan rujukan.')
ON CONFLICT DO NOTHING;

-- Seed Sample Data Ibu Hamil
INSERT INTO public.ibu_hamil (nik, nama, tanggal_lahir, nama_suami, alamat, posyandu, no_hp, hpht, hpl, usia_kehamilan_minggu, gravida, partus, abortus, lila_awal, lila_saat_ini, hb, status_kek, status_anemia, desil_ekonomi, buku_kia, konsumsi_ttd) VALUES
('3201123456781001', 'Sri Wahyuni', '1998-04-14', 'Sunardi', 'RT 01 / RW 01', 'Posyandu Melati', '081399887711', '2024-03-01', '2024-12-08', 28, 1, 0, 0, 21.0, 21.4, 9.8, true, true, 1, true, 60),
('3201123456781002', 'Endah Sulistyowati', '1995-09-22', 'Wahyudi', 'RT 02 / RW 02', 'Posyandu Melati', '085811223399', '2024-05-10', '2025-02-17', 18, 2, 1, 0, 22.8, 23.0, 10.6, true, true, 2, true, 45)
ON CONFLICT (nik) DO NOTHING;

-- Seed Sample Data Ibu Menyusui
INSERT INTO public.ibu_menyusui (nik, nama, tanggal_lahir, nama_suami, alamat, posyandu, no_hp, nama_bayi, usia_bayi_bulan, status_asi_eksklusif, lila, status_kek, vitamin_a_nifas, konsumsi_ttd, keluhan, desil_ekonomi) VALUES
('3201123456783001', 'Fitri Handayani', '1997-03-15', 'Rian Saputra', 'RT 02 / RW 01', 'Posyandu Melati', '081233445566', 'Khanza Zunaira', 3, true, 22.8, true, true, 30, 'Sering merasa lapar dan haus, produksi ASI agak berkurang bila lelah', 2)
ON CONFLICT (nik) DO NOTHING;

-- Seed Sample Data Lansia
INSERT INTO public.lansia (id, nik, nama, jenis_kelamin, tanggal_lahir, usia_tahun, nama_keluarga, alamat, no_hp, posyandu, golongan_darah, riwayat_penyakit) VALUES
('d0000000-0000-0000-0000-000000000001', '3201123456782001', 'Mbah Sastro Dimejo', 'L', '1952-04-12', 72, 'Siti Rohayati (Anak)', 'RT 02 / RW 01', '081298765431', 'Posyandu Melati', 'O', ARRAY['Hipertensi', 'Nyeri Sendi Lutut']),
('d0000000-0000-0000-0000-000000000002', '3201123456782002', 'Ibu Warsini', 'P', '1956-08-20', 68, 'Bambang Irawan (Menantu)', 'RT 03 / RW 01', '081377889900', 'Posyandu Melati', 'B', ARRAY['Diabetes Melitus Tipe 2', 'Asam Urat'])
ON CONFLICT (nik) DO NOTHING;

-- Seed Sample Data Pemeriksaan Lansia
INSERT INTO public.pemeriksaan_lansia (
  lansia_id, tanggal_periksa, berat_badan, tinggi_badan, imt, status_gizi,
  tensi_sistolik, tensi_diastolik, status_tensi, gula_darah, status_gula_darah,
  kolesterol, asam_urat, keluhan, tindakan_edukasi, petugas
) VALUES
('d0000000-0000-0000-0000-000000000001', '2024-09-15', 46.5, 160.0, 18.2, 'Kurus', 155, 95, 'Hipertensi', 135, 'Normal', 215, 6.8, 'Pusing bila bangun tidur, kedua lutut ngilu', 'Rekomendasi Menu MBG Lansia Rendah Garam & Tinggi Kalsium', 'Bidan Ratna & Kader Anisa'),
('d0000000-0000-0000-0000-000000000002', '2024-09-15', 58.0, 150.0, 25.8, 'Kelebihan Berat', 125, 82, 'Normal', 215, 'Tinggi (Diabetes)', 190, 7.4, 'Sering haus malam hari, kaki kesemutan', 'Konseling gizi rendah glikemik, batasi purin', 'Bidan Ratna')
ON CONFLICT DO NOTHING;
