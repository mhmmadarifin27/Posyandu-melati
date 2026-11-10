-- =========================================================================
-- MIGRATION: MULTI-TENANT SAAS ARCHITECTURE UNTUK POSYANDU.JS
-- =========================================================================
-- Fitur Migrasi:
-- 1. Tabel Master Tenant: public.posyandu
-- 2. Dukungan Role Baru: 'super_admin' & 'admin_posyandu' (Penggabungan Kader + Bidan)
-- 3. Foreign Key posyandu_id pada profiles, balita, ibu_hamil, ibu_menyusui, dan lansia
-- 4. Sinkronisasi Data Eksisting (Backfill posyandu_id)
-- 5. Seed Akun Super Admin & Admin Posyandu
-- 6. Kebijakan Keamanan Row Level Security (RLS) Multi-Tenant
-- =========================================================================

-- Aktifkan ekstensi pgcrypto & uuid
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- 1. TABEL MASTER POSYANDU (TENANT)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.posyandu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode VARCHAR(50) UNIQUE NOT NULL,
  nama VARCHAR(150) UNIQUE NOT NULL,
  kelurahan VARCHAR(100) DEFAULT 'Sukamaju',
  rw VARCHAR(10) NOT NULL,
  alamat TEXT NOT NULL,
  puskesmas VARCHAR(150) DEFAULT 'Puskesmas Pembina',
  nama_ketua VARCHAR(150) NOT NULL,
  no_hp VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger updated_at pada posyandu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_posyandu_updated_at ON public.posyandu;
CREATE TRIGGER trigger_update_posyandu_updated_at
BEFORE UPDATE ON public.posyandu
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- 2. SEED DATA POSYANDU TENANT AWAL
-- =========================================================================
INSERT INTO public.posyandu (kode, nama, kelurahan, rw, alamat, puskesmas, nama_ketua, no_hp)
VALUES 
  ('POSY-001', 'Posyandu Melati', 'Sukamaju', 'RW 03', 'Balai Warga RW 03, Jl. Melati No. 12', 'Puskesmas Pembina', 'Ny. Anisa Rahmawati', '6281367895678'),
  ('POSY-002', 'Posyandu Mawar', 'Sukamaju', 'RW 05', 'Balai Pertemuan RW 05, Jl. Mawar Indah No. 45', 'Puskesmas Pembina', 'Ny. Dewi Sartika', '6281234567890'),
  ('POSY-003', 'Posyandu Anggrek', 'Sukamaju', 'RW 01', 'Gedung Serbaguna RW 01, Jl. Anggrek Raya No. 8', 'Puskesmas Pembina', 'Ny. Rina Marlina', '6281987654321')
ON CONFLICT (nama) DO UPDATE 
SET 
  kode = EXCLUDED.kode,
  kelurahan = EXCLUDED.kelurahan,
  rw = EXCLUDED.rw,
  alamat = EXCLUDED.alamat,
  puskesmas = EXCLUDED.puskesmas,
  nama_ketua = EXCLUDED.nama_ketua,
  no_hp = EXCLUDED.no_hp;

-- =========================================================================
-- 3. PERBAHARUI TABEL PROFILES DENGAN ROLE SAAS & POSYANDU_ID
-- =========================================================================
DO $$
BEGIN
  -- Tambah kolom posyandu_id ke profiles jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'posyandu_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN posyandu_id UUID REFERENCES public.posyandu(id) ON DELETE SET NULL;
  END IF;

  -- Perbarui CHECK constraint pada role untuk mendukung super_admin & admin_posyandu
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('super_admin', 'admin_posyandu', 'admin', 'bidan', 'kader', 'petugas', 'warga'));
END $$;

-- =========================================================================
-- 4. TAMBAH POSYANDU_ID PADA TABEL OPERASIONAL
-- =========================================================================
DO $$
BEGIN
  -- Balita
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'balita' AND column_name = 'posyandu_id'
  ) THEN
    ALTER TABLE public.balita ADD COLUMN posyandu_id UUID REFERENCES public.posyandu(id) ON DELETE SET NULL;
  END IF;

  -- Ibu Hamil
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ibu_hamil' AND column_name = 'posyandu_id'
  ) THEN
    ALTER TABLE public.ibu_hamil ADD COLUMN posyandu_id UUID REFERENCES public.posyandu(id) ON DELETE SET NULL;
  END IF;

  -- Ibu Menyusui
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ibu_menyusui' AND column_name = 'posyandu_id'
  ) THEN
    ALTER TABLE public.ibu_menyusui ADD COLUMN posyandu_id UUID REFERENCES public.posyandu(id) ON DELETE SET NULL;
  END IF;

  -- Lansia
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'lansia' AND column_name = 'posyandu_id'
  ) THEN
    ALTER TABLE public.lansia ADD COLUMN posyandu_id UUID REFERENCES public.posyandu(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =========================================================================
-- 5. SINKRONISASI DATA EKSISTING (BACKFILL POSYANDU_ID)
-- =========================================================================
UPDATE public.balita b
SET posyandu_id = p.id
FROM public.posyandu p
WHERE b.posyandu_id IS NULL AND (b.posyandu = p.nama OR (b.posyandu IS NULL AND p.nama = 'Posyandu Melati'));

UPDATE public.ibu_hamil b
SET posyandu_id = p.id
FROM public.posyandu p
WHERE b.posyandu_id IS NULL AND (b.posyandu = p.nama OR (b.posyandu IS NULL AND p.nama = 'Posyandu Melati'));

UPDATE public.ibu_menyusui b
SET posyandu_id = p.id
FROM public.posyandu p
WHERE b.posyandu_id IS NULL AND (b.posyandu = p.nama OR (b.posyandu IS NULL AND p.nama = 'Posyandu Melati'));

UPDATE public.lansia b
SET posyandu_id = p.id
FROM public.posyandu p
WHERE b.posyandu_id IS NULL AND (b.posyandu = p.nama OR (b.posyandu IS NULL AND p.nama = 'Posyandu Melati'));

UPDATE public.profiles pr
SET posyandu_id = p.id
FROM public.posyandu p
WHERE pr.posyandu_id IS NULL AND pr.posyandu = p.nama;

-- =========================================================================
-- 6. SEED AKUN SUPER ADMIN & ADMIN POSYANDU
-- =========================================================================
-- Helper DO block untuk mendaftarkan akun di auth.users & public.profiles
DO $$
DECLARE
  v_super_id UUID;
  v_admin_melati_id UUID;
  v_admin_mawar_id UUID;
  v_admin_anggrek_id UUID;

  v_posy_melati_id UUID;
  v_posy_mawar_id UUID;
  v_posy_anggrek_id UUID;
BEGIN
  -- Ambil ID Tenant
  SELECT id INTO v_posy_melati_id FROM public.posyandu WHERE kode = 'POSY-001';
  SELECT id INTO v_posy_mawar_id FROM public.posyandu WHERE kode = 'POSY-002';
  SELECT id INTO v_posy_anggrek_id FROM public.posyandu WHERE kode = 'POSY-003';

  -- A. SUPER ADMIN: superadmin@posyandu.id / admin123
  SELECT id INTO v_super_id FROM auth.users WHERE email = 'superadmin@posyandu.id';
  IF v_super_id IS NULL THEN
    v_super_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token,
      email_change_token_new, email_change, email_change_token_current, reauthentication_token,
      created_at, updated_at
    ) VALUES (
      v_super_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'superadmin@posyandu.id', crypt('admin123', gen_salt('bf')), NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"role": "super_admin", "nama": "dr. H. Hendra Wijaya (Puskesmas)"}'::jsonb,
      '', '', '', '', '', '', NOW(), NOW()
    );
  END IF;

  INSERT INTO public.profiles (id, nama, email, role, posyandu, posyandu_id, no_hp)
  VALUES (v_super_id, 'dr. H. Hendra Wijaya', 'superadmin@posyandu.id', 'super_admin', 'Puskesmas Pembina', NULL, '6281122334455')
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin', nama = 'dr. H. Hendra Wijaya';

  -- B. ADMIN POSYANDU MELATI: admin.melati@posyandu.id / 123456
  SELECT id INTO v_admin_melati_id FROM auth.users WHERE email = 'admin.melati@posyandu.id';
  IF v_admin_melati_id IS NULL THEN
    v_admin_melati_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token,
      email_change_token_new, email_change, email_change_token_current, reauthentication_token,
      created_at, updated_at
    ) VALUES (
      v_admin_melati_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'admin.melati@posyandu.id', crypt('123456', gen_salt('bf')), NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"role": "admin_posyandu", "nama": "Bdn. Siti Rahma & Tim Kader Melati"}'::jsonb,
      '', '', '', '', '', '', NOW(), NOW()
    );
  END IF;

  INSERT INTO public.profiles (id, nama, email, role, posyandu, posyandu_id, no_hp)
  VALUES (v_admin_melati_id, 'Bdn. Siti Rahma & Tim Melati', 'admin.melati@posyandu.id', 'admin_posyandu', 'Posyandu Melati', v_posy_melati_id, '6281367895678')
  ON CONFLICT (id) DO UPDATE SET role = 'admin_posyandu', posyandu = 'Posyandu Melati', posyandu_id = v_posy_melati_id;

  -- C. ADMIN POSYANDU MAWAR: admin.mawar@posyandu.id / 123456
  SELECT id INTO v_admin_mawar_id FROM auth.users WHERE email = 'admin.mawar@posyandu.id';
  IF v_admin_mawar_id IS NULL THEN
    v_admin_mawar_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token,
      email_change_token_new, email_change, email_change_token_current, reauthentication_token,
      created_at, updated_at
    ) VALUES (
      v_admin_mawar_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'admin.mawar@posyandu.id', crypt('123456', gen_salt('bf')), NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"role": "admin_posyandu", "nama": "Bdn. Dewi Lestari & Tim Kader Mawar"}'::jsonb,
      '', '', '', '', '', '', NOW(), NOW()
    );
  END IF;

  INSERT INTO public.profiles (id, nama, email, role, posyandu, posyandu_id, no_hp)
  VALUES (v_admin_mawar_id, 'Bdn. Dewi Lestari & Tim Mawar', 'admin.mawar@posyandu.id', 'admin_posyandu', 'Posyandu Mawar', v_posy_mawar_id, '6281234567890')
  ON CONFLICT (id) DO UPDATE SET role = 'admin_posyandu', posyandu = 'Posyandu Mawar', posyandu_id = v_posy_mawar_id;

  -- D. ADMIN POSYANDU ANGGREK: admin.anggrek@posyandu.id / 123456
  SELECT id INTO v_admin_anggrek_id FROM auth.users WHERE email = 'admin.anggrek@posyandu.id';
  IF v_admin_anggrek_id IS NULL THEN
    v_admin_anggrek_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token,
      email_change_token_new, email_change, email_change_token_current, reauthentication_token,
      created_at, updated_at
    ) VALUES (
      v_admin_anggrek_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'admin.anggrek@posyandu.id', crypt('123456', gen_salt('bf')), NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"role": "admin_posyandu", "nama": "Bdn. Rina Marlina & Tim Kader Anggrek"}'::jsonb,
      '', '', '', '', '', '', NOW(), NOW()
    );
  END IF;

  INSERT INTO public.profiles (id, nama, email, role, posyandu, posyandu_id, no_hp)
  VALUES (v_admin_anggrek_id, 'Bdn. Rina Marlina & Tim Anggrek', 'admin.anggrek@posyandu.id', 'admin_posyandu', 'Posyandu Anggrek', v_posy_anggrek_id, '6281987654321')
  ON CONFLICT (id) DO UPDATE SET role = 'admin_posyandu', posyandu = 'Posyandu Anggrek', posyandu_id = v_posy_anggrek_id;
END $$;

-- =========================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.posyandu ENABLE ROW LEVEL SECURITY;

-- Publik & Authenticated dapat membaca daftar posyandu
DROP POLICY IF EXISTS "posyandu_select_policy" ON public.posyandu;
CREATE POLICY "posyandu_select_policy" ON public.posyandu
  FOR SELECT TO authenticated, anon
  USING (true);

-- Hanya Super Admin yang dapat menambah/mengedit/menghapus posyandu
DROP POLICY IF EXISTS "posyandu_modify_policy" ON public.posyandu;
CREATE POLICY "posyandu_modify_policy" ON public.posyandu
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );

-- Function helper: Cek apakah user saat ini adalah super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function helper: Ambil posyandu_id user saat ini
CREATE OR REPLACE FUNCTION public.current_user_posyandu_id()
RETURNS UUID AS $$
DECLARE
  v_posy_id UUID;
BEGIN
  SELECT posyandu_id INTO v_posy_id FROM public.profiles WHERE id = auth.uid();
  RETURN v_posy_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Terapkan Tenant Scoping pada tabel Balita
DROP POLICY IF EXISTS "balita_tenant_policy" ON public.balita;
CREATE POLICY "balita_tenant_policy" ON public.balita
  FOR ALL TO authenticated
  USING (
    public.is_super_admin() OR 
    posyandu_id = public.current_user_posyandu_id() OR
    posyandu = (SELECT posyandu FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    public.is_super_admin() OR 
    posyandu_id = public.current_user_posyandu_id() OR
    posyandu = (SELECT posyandu FROM public.profiles WHERE id = auth.uid())
  );

-- =========================================================================
-- SELESAI: DATABASE SIAP DIGUNAKAN SEBAGAI SAAS MULTI-TENANT
-- =========================================================================

