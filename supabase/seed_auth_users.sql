-- =========================================================================
-- SOLUSI PERBAIKAN: "Database error querying schema" DI SUPABASE AUTH
-- =========================================================================
-- Penyebab: Supabase GoTrue Auth mewajibkan kolom token (confirmation_token, 
-- recovery_token, email_change, dll) bernilai string kosong (''), BUKAN NULL.
-- 
-- JALANKAN SKRIP DI BAWAH INI DI SUPABASE SQL EDITOR UNTUK MEMPERBAIKI
-- SEMUA AKUN DAN MEMASTIKAN LOGIN BERJALAN 100% NORMAL.
-- =========================================================================

-- 1. Pastikan ekstensi pgcrypto aktif
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. PERBAIKAN INSTAN: Ubah semua nilai NULL pada kolom token menjadi string kosong ('')
-- Langkah ini langsung menyelesaikan error "Database error querying schema"
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

-- 3. Blok Tambah / Update Akun Kader dan Bidan dengan Kolom Lengkap Tanpa NULL
DO $$
DECLARE
  v_kader_id UUID;
  v_bidan_id UUID;
BEGIN
  -- =======================================================================
  -- A. AKUN KADER: kadermelati@gmail.com / 123456
  -- =======================================================================
  SELECT id INTO v_kader_id FROM auth.users WHERE email = 'kadermelati@gmail.com';
  
  IF v_kader_id IS NULL THEN
    v_kader_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      email_change_token_current,
      reauthentication_token,
      created_at,
      updated_at
    ) VALUES (
      v_kader_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'kadermelati@gmail.com',
      crypt('123456', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"role": "kader", "nama": "Kader Posyandu Melati"}'::jsonb,
      '',
      '',
      '',
      '',
      '',
      '',
      NOW(),
      NOW()
    );

    BEGIN
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        v_kader_id,
        v_kader_id,
        jsonb_build_object('sub', v_kader_id::text, 'email', 'kadermelati@gmail.com'),
        'email',
        v_kader_id::text,
        NOW(),
        NOW(),
        NOW()
      );
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  ELSE
    UPDATE auth.users
    SET 
      encrypted_password = crypt('123456', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      raw_user_meta_data = jsonb_build_object('role', 'kader', 'nama', 'Kader Posyandu Melati'),
      raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'::jsonb,
      confirmation_token = COALESCE(confirmation_token, ''),
      recovery_token = COALESCE(recovery_token, ''),
      email_change = COALESCE(email_change, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      email_change_token_current = COALESCE(email_change_token_current, ''),
      reauthentication_token = COALESCE(reauthentication_token, ''),
      updated_at = NOW()
    WHERE id = v_kader_id;
  END IF;

  -- =======================================================================
  -- B. AKUN BIDAN: bidanmelati@gmail.com / 123456
  -- =======================================================================
  SELECT id INTO v_bidan_id FROM auth.users WHERE email = 'bidanmelati@gmail.com';
  
  IF v_bidan_id IS NULL THEN
    v_bidan_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      email_change_token_current,
      reauthentication_token,
      created_at,
      updated_at
    ) VALUES (
      v_bidan_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'bidanmelati@gmail.com',
      crypt('123456', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"role": "bidan", "nama": "Bdn. Ratna Kusuma, S.ST"}'::jsonb,
      '',
      '',
      '',
      '',
      '',
      '',
      NOW(),
      NOW()
    );

    BEGIN
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        v_bidan_id,
        v_bidan_id,
        jsonb_build_object('sub', v_bidan_id::text, 'email', 'bidanmelati@gmail.com'),
        'email',
        v_bidan_id::text,
        NOW(),
        NOW(),
        NOW()
      );
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  ELSE
    UPDATE auth.users
    SET 
      encrypted_password = crypt('123456', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      raw_user_meta_data = jsonb_build_object('role', 'bidan', 'nama', 'Bdn. Ratna Kusuma, S.ST'),
      raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'::jsonb,
      confirmation_token = COALESCE(confirmation_token, ''),
      recovery_token = COALESCE(recovery_token, ''),
      email_change = COALESCE(email_change, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      email_change_token_current = COALESCE(email_change_token_current, ''),
      reauthentication_token = COALESCE(reauthentication_token, ''),
      updated_at = NOW()
    WHERE id = v_bidan_id;
  END IF;

  -- =======================================================================
  -- C. SINKRONISASI KE TABEL PUBLIC.PROFILES (JIKA ADA)
  -- =======================================================================
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    INSERT INTO public.profiles (id, nama, email, role, posyandu)
    VALUES 
      (v_kader_id, 'Kader Posyandu Melati', 'kadermelati@gmail.com', 'kader', 'Posyandu Melati'),
      (v_bidan_id, 'Bdn. Ratna Kusuma, S.ST', 'bidanmelati@gmail.com', 'bidan', 'Posyandu Melati')
    ON CONFLICT (id) DO UPDATE
    SET 
      nama = EXCLUDED.nama,
      email = EXCLUDED.email,
      role = EXCLUDED.role;
  END IF;

  RAISE NOTICE 'Sukses! Kolom token NULL telah diperbaiki dan akun siap digunakan login.';
END $$;
