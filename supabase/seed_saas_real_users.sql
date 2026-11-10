-- =========================================================================
-- SKRIP SEED AKUN RESMI SAAS MULTI-TENANT SUPABASE AUTH & PROFILES
-- =========================================================================
-- Jalankan skrip ini langsung di SUPABASE SQL EDITOR pada dashboard Anda.
-- 
-- Manfaat:
-- 1. Mendaftarkan akun resmi Super Admin & Admin Posyandu langsung ke auth.users
-- 2. Menghapus / menonaktifkan akun kader dan bidan lama agar tidak bisa login lagi
-- 3. Mencegah error "Database error querying schema" dengan memastikan token string kosong ('')
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Nonaktifkan atau hapus akun kader & bidan lama dari auth.users
DELETE FROM auth.users WHERE email IN ('kadermelati@gmail.com', 'bidanmelati@gmail.com');
DELETE FROM public.profiles WHERE email IN ('kadermelati@gmail.com', 'bidanmelati@gmail.com');

-- 2. Pastikan tabel master tenant public.posyandu tersedia
CREATE TABLE IF NOT EXISTS public.posyandu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode VARCHAR(50) UNIQUE NOT NULL,
  nama VARCHAR(150) UNIQUE NOT NULL,
  logo TEXT,
  pemerintah_daerah VARCHAR(150) DEFAULT 'Pemerintah Daerah',
  dinas_kesehatan VARCHAR(150) DEFAULT 'Dinas Kesehatan',
  puskesmas VARCHAR(150) DEFAULT 'Puskesmas Pembina',
  provinsi VARCHAR(100) DEFAULT 'Sumatera Selatan',
  kota_kab VARCHAR(100) DEFAULT 'Kota Palembang',
  kecamatan VARCHAR(100) DEFAULT 'Sako',
  kelurahan VARCHAR(100) DEFAULT 'Sukamaju',
  rw VARCHAR(10) NOT NULL,
  rt VARCHAR(10) DEFAULT '01',
  alamat TEXT NOT NULL,
  kode_pos VARCHAR(10) DEFAULT '30164',
  nama_ketua VARCHAR(150) NOT NULL,
  nama_bidan VARCHAR(150) DEFAULT 'Bdn. Siti Rahma, S.Tr.Keb',
  no_hp VARCHAR(20) NOT NULL,
  email VARCHAR(150),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed 3 Posyandu Awal
INSERT INTO public.posyandu (kode, nama, kelurahan, rw, alamat, puskesmas, nama_ketua, no_hp)
VALUES 
  ('POSY-001', 'Posyandu Melati', 'Sukamaju', 'RW 03', 'Balai Warga RW 03, Jl. Melati No. 12', 'Puskesmas Pembina', 'Ny. Anisa Rahmawati', '6281367895678'),
  ('POSY-002', 'Posyandu Mawar', 'Sukamaju', 'RW 05', 'Balai Pertemuan RW 05, Jl. Mawar Indah No. 45', 'Puskesmas Pembina', 'Ny. Dewi Sartika', '6281234567890'),
  ('POSY-003', 'Posyandu Anggrek', 'Sukamaju', 'RW 01', 'Gedung Serbaguna RW 01, Jl. Anggrek Raya No. 8', 'Puskesmas Pembina', 'Ny. Rina Marlina', '6281987654321')
ON CONFLICT (nama) DO UPDATE SET
  kode = EXCLUDED.kode,
  kelurahan = EXCLUDED.kelurahan,
  rw = EXCLUDED.rw,
  alamat = EXCLUDED.alamat,
  puskesmas = EXCLUDED.puskesmas,
  nama_ketua = EXCLUDED.nama_ketua,
  no_hp = EXCLUDED.no_hp;

-- 3. Perbaharui kolom dan constraint pada public.profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'posyandu_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN posyandu_id UUID REFERENCES public.posyandu(id) ON DELETE SET NULL;
  END IF;

  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('super_admin', 'admin_posyandu', 'admin', 'bidan', 'kader', 'petugas', 'warga'));
END $$;

-- 4. Blok Pendaftaran Akun Resmi ke auth.users, auth.identities, & public.profiles
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

  -- =======================================================================
  -- A. SUPER ADMIN: superadmin@posyandu.id / admin123
  -- =======================================================================
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

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_super_id, v_super_id,
      jsonb_build_object('sub', v_super_id::text, 'email', 'superadmin@posyandu.id'),
      'email', v_super_id::text, NOW(), NOW(), NOW()
    );
  ELSE
    UPDATE auth.users 
    SET encrypted_password = crypt('admin123', gen_salt('bf')),
        raw_user_meta_data = '{"role": "super_admin", "nama": "dr. H. Hendra Wijaya (Puskesmas)"}'::jsonb,
        updated_at = NOW()
    WHERE id = v_super_id;
  END IF;

  INSERT INTO public.profiles (id, nama, email, role, posyandu, posyandu_id, no_hp)
  VALUES (v_super_id, 'dr. H. Hendra Wijaya', 'superadmin@posyandu.id', 'super_admin', 'Puskesmas Pembina', NULL, '6281122334455')
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin', nama = 'dr. H. Hendra Wijaya';

  -- =======================================================================
  -- B. ADMIN POSYANDU MELATI: admin.melati@posyandu.id / 123456
  -- =======================================================================
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
      jsonb_build_object('role', 'admin_posyandu', 'nama', 'Bdn. Siti Rahma & Tim Melati', 'posyandu', 'Posyandu Melati', 'posyandu_id', v_posy_melati_id::text),
      '', '', '', '', '', '', NOW(), NOW()
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_admin_melati_id, v_admin_melati_id,
      jsonb_build_object('sub', v_admin_melati_id::text, 'email', 'admin.melati@posyandu.id'),
      'email', v_admin_melati_id::text, NOW(), NOW(), NOW()
    );
  ELSE
    UPDATE auth.users 
    SET encrypted_password = crypt('123456', gen_salt('bf')),
        raw_user_meta_data = jsonb_build_object('role', 'admin_posyandu', 'nama', 'Bdn. Siti Rahma & Tim Melati', 'posyandu', 'Posyandu Melati', 'posyandu_id', v_posy_melati_id::text),
        updated_at = NOW()
    WHERE id = v_admin_melati_id;
  END IF;

  INSERT INTO public.profiles (id, nama, email, role, posyandu, posyandu_id, no_hp)
  VALUES (v_admin_melati_id, 'Bdn. Siti Rahma & Tim Melati', 'admin.melati@posyandu.id', 'admin_posyandu', 'Posyandu Melati', v_posy_melati_id, '6281367895678')
  ON CONFLICT (id) DO UPDATE SET role = 'admin_posyandu', posyandu = 'Posyandu Melati', posyandu_id = v_posy_melati_id;

  -- =======================================================================
  -- C. ADMIN POSYANDU MAWAR: admin.mawar@posyandu.id / 123456
  -- =======================================================================
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
      jsonb_build_object('role', 'admin_posyandu', 'nama', 'Bdn. Dewi Lestari & Tim Mawar', 'posyandu', 'Posyandu Mawar', 'posyandu_id', v_posy_mawar_id::text),
      '', '', '', '', '', '', NOW(), NOW()
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_admin_mawar_id, v_admin_mawar_id,
      jsonb_build_object('sub', v_admin_mawar_id::text, 'email', 'admin.mawar@posyandu.id'),
      'email', v_admin_mawar_id::text, NOW(), NOW(), NOW()
    );
  ELSE
    UPDATE auth.users 
    SET encrypted_password = crypt('123456', gen_salt('bf')),
        raw_user_meta_data = jsonb_build_object('role', 'admin_posyandu', 'nama', 'Bdn. Dewi Lestari & Tim Mawar', 'posyandu', 'Posyandu Mawar', 'posyandu_id', v_posy_mawar_id::text),
        updated_at = NOW()
    WHERE id = v_admin_mawar_id;
  END IF;

  INSERT INTO public.profiles (id, nama, email, role, posyandu, posyandu_id, no_hp)
  VALUES (v_admin_mawar_id, 'Bdn. Dewi Lestari & Tim Mawar', 'admin.mawar@posyandu.id', 'admin_posyandu', 'Posyandu Mawar', v_posy_mawar_id, '6281234567890')
  ON CONFLICT (id) DO UPDATE SET role = 'admin_posyandu', posyandu = 'Posyandu Mawar', posyandu_id = v_posy_mawar_id;

  -- =======================================================================
  -- D. ADMIN POSYANDU ANGGREK: admin.anggrek@posyandu.id / 123456
  -- =======================================================================
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
      jsonb_build_object('role', 'admin_posyandu', 'nama', 'Bdn. Rina Marlina & Tim Anggrek', 'posyandu', 'Posyandu Anggrek', 'posyandu_id', v_posy_anggrek_id::text),
      '', '', '', '', '', '', NOW(), NOW()
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_admin_anggrek_id, v_admin_anggrek_id,
      jsonb_build_object('sub', v_admin_anggrek_id::text, 'email', 'admin.anggrek@posyandu.id'),
      'email', v_admin_anggrek_id::text, NOW(), NOW(), NOW()
    );
  ELSE
    UPDATE auth.users 
    SET encrypted_password = crypt('123456', gen_salt('bf')),
        raw_user_meta_data = jsonb_build_object('role', 'admin_posyandu', 'nama', 'Bdn. Rina Marlina & Tim Anggrek', 'posyandu', 'Posyandu Anggrek', 'posyandu_id', v_posy_anggrek_id::text),
        updated_at = NOW()
    WHERE id = v_admin_anggrek_id;
  END IF;

  INSERT INTO public.profiles (id, nama, email, role, posyandu, posyandu_id, no_hp)
  VALUES (v_admin_anggrek_id, 'Bdn. Rina Marlina & Tim Anggrek', 'admin.anggrek@posyandu.id', 'admin_posyandu', 'Posyandu Anggrek', v_posy_anggrek_id, '6281987654321')
  ON CONFLICT (id) DO UPDATE SET role = 'admin_posyandu', posyandu = 'Posyandu Anggrek', posyandu_id = v_posy_anggrek_id;
END $$;

-- Pastikan semua token di auth.users bernilai string kosong (bukan NULL)
UPDATE auth.users
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE confirmation_token IS NULL 
   OR recovery_token IS NULL 
   OR email_change IS NULL
   OR email_change_token_new IS NULL;

-- Selesai: Akun siap dipakai login via Supabase

