# ERD (Entity Relationship Diagram) — SIP-MBG Posyandu Melati RW 03

> **Notasi ERD (Crow's Foot / IE Notation):**
> - `PK` — Primary Key
> - `FK` — Foreign Key
> - `||--||` — One to One
> - `||--o{` — One to Many (wajib ke opsional banyak)
> - `||--|{` — One to Many (wajib ke wajib banyak)
> - `}o--o{` — Many to Many (opsional)
> - `--` — Garis relasi

---

## Diagram ERD (Mermaid)

```mermaid
erDiagram

    PROFILES {
        uuid    id          PK
        varchar nama
        varchar email
        varchar role
        varchar no_hp
        varchar posyandu
        timestamptz created_at
        timestamptz updated_at
    }

    BALITA {
        uuid    id              PK
        varchar nik             UK
        varchar nama
        char    jenis_kelamin
        date    tanggal_lahir
        varchar nama_ibu
        varchar nama_ayah
        text    alamat
        varchar rt
        varchar rw
        varchar posyandu
        varchar no_hp
        int     desil_ekonomi
        boolean status_bansos
        timestamptz created_at
        timestamptz updated_at
    }

    PEMERIKSAAN_BALITA {
        uuid        id              PK
        uuid        balita_id       FK
        uuid        petugas_id      FK
        date        tanggal_periksa
        int         usia_bulan
        numeric     berat_badan
        numeric     tinggi_badan
        numeric     lingkar_kepala
        varchar     cara_ukur
        numeric     z_score_bbu
        numeric     z_score_tbu
        numeric     z_score_bbtb
        varchar     status_bbu
        varchar     status_tbu
        varchar     status_bbtb
        varchar     status_kms
        numeric     kenaikan_bb
        numeric     kbm
        boolean     vitamin_a
        boolean     obat_cacing
        varchar     imunisasi
        text        keluhan
        text        catatan_kader
        timestamptz created_at
    }

    IBU_HAMIL {
        uuid        id              PK
        varchar     nik             UK
        varchar     nama
        date        tanggal_lahir
        varchar     nama_suami
        text        alamat
        varchar     posyandu
        varchar     no_hp
        date        hpht
        date        hpl
        int         usia_kehamilan_minggu
        int         gravida
        int         partus
        int         abortus
        numeric     lila_awal
        numeric     lila_saat_ini
        numeric     hb
        boolean     status_kek
        boolean     status_anemia
        int         desil_ekonomi
        boolean     buku_kia
        int         konsumsi_ttd
        timestamptz created_at
        timestamptz updated_at
    }

    IBU_MENYUSUI {
        uuid        id              PK
        varchar     nik             UK
        varchar     nama
        date        tanggal_lahir
        varchar     nama_suami
        text        alamat
        varchar     posyandu
        varchar     no_hp
        varchar     nama_bayi
        int         usia_bayi_bulan
        boolean     status_asi_eksklusif
        numeric     lila
        boolean     status_kek
        boolean     vitamin_a_nifas
        int         konsumsi_ttd
        text        keluhan
        int         desil_ekonomi
        timestamptz created_at
        timestamptz updated_at
    }

    LANSIA {
        uuid        id              PK
        varchar     nik             UK
        varchar     nama
        char        jenis_kelamin
        date        tanggal_lahir
        int         usia_tahun
        varchar     nama_keluarga
        text        alamat
        varchar     no_hp
        varchar     posyandu
        varchar     golongan_darah
        text[]      riwayat_penyakit
        timestamptz created_at
        timestamptz updated_at
    }

    PEMERIKSAAN_LANSIA {
        uuid        id              PK
        uuid        lansia_id       FK
        uuid        petugas_id      FK
        date        tanggal_periksa
        numeric     berat_badan
        numeric     tinggi_badan
        numeric     imt
        varchar     status_gizi
        int         tensi_sistolik
        int         tensi_diastolik
        varchar     status_tensi
        numeric     gula_darah
        varchar     status_gula_darah
        numeric     kolesterol
        numeric     asam_urat
        text        keluhan
        text        tindakan_edukasi
        varchar     petugas
        timestamptz created_at
    }

    MENU_MBG {
        uuid        id              PK
        varchar     nama_menu
        varchar     kategori
        varchar     target_sasaran
        text        deskripsi
        text[]      komposisi
        int         kalori
        numeric     protein
        numeric     zat_besi
        text        anjuran_pemberian
        text        foto_url
        timestamptz created_at
        timestamptz updated_at
    }

    DISTRIBUSI_MBG {
        uuid        id              PK
        uuid        menu_id         FK
        date        tanggal
        uuid        sasaran_id
        varchar     nama_sasaran
        varchar     jenis_sasaran
        varchar     nama_menu
        int         porsi
        numeric     skor_saw
        int         ranking
        varchar     prioritas
        text        keterangan
        varchar     petugas
        varchar     status_konsumsi
        numeric     evaluasi_bb
        timestamptz created_at
    }

    LANDING_GALERI {
        uuid        id          PK
        text        src
        varchar     alt
        int         urutan
        boolean     is_active
        timestamptz created_at
    }

    LANDING_JADWAL {
        uuid        id                  PK
        int         session_date
        varchar     session_month
        int         session_year
        varchar     session_day_name
        varchar     session_time
        varchar     session_location
        text        address
        text        target_summary
        varchar     contact_person_name
        varchar     contact_whatsapp
        boolean     is_active
        timestamptz created_at
        timestamptz updated_at
    }

    %% ─── RELASI ───────────────────────────────────

    BALITA              ||--|{  PEMERIKSAAN_BALITA  : "memiliki"
    LANSIA              ||--|{  PEMERIKSAAN_LANSIA  : "memiliki"
    MENU_MBG            ||--o{  DISTRIBUSI_MBG      : "digunakan dalam"
    PROFILES            ||--o{  PEMERIKSAAN_BALITA  : "dicatat oleh"
    PROFILES            ||--o{  PEMERIKSAAN_LANSIA  : "dicatat oleh"
```

---

## Keterangan Entitas

| Entitas | Tabel DB | Keterangan |
|---------|----------|------------|
| `PROFILES` | `public.profiles` | Akun pengguna sistem (Bidan / Kader), terhubung ke Supabase Auth |
| `BALITA` | `public.balita` | Data anak usia 0–59 bulan, NIK unik |
| `PEMERIKSAAN_BALITA` | `public.pemeriksaan_balita` | Rekam timbang bulanan per balita — BB, TB, Z-Score, KMS |
| `IBU_HAMIL` | `public.ibu_hamil` | Data ibu hamil, auto-deteksi KEK (LiLA < 23.5) & anemia (Hb < 11) |
| `IBU_MENYUSUI` | `public.ibu_menyusui` | Data ibu menyusui, auto-deteksi KEK |
| `LANSIA` | `public.lansia` | Data warga usia ≥ 60 tahun |
| `PEMERIKSAAN_LANSIA` | `public.pemeriksaan_lansia` | Rekam pemeriksaan PTM — IMT, tensi, GDS, kolesterol, asam urat |
| `MENU_MBG` | `public.menu_mbg` | Katalog menu Makanan Bergizi (read-only, diisi via seed) |
| `DISTRIBUSI_MBG` | `public.distribusi_mbg` | Log distribusi MBG + hasil ranking SAW per sasaran |
| `LANDING_GALERI` | `public.landing_galeri` | Foto galeri halaman publik (CMS) |
| `LANDING_JADWAL` | `public.landing_jadwal` | Konfigurasi jadwal posyandu halaman publik (CMS) |

---

## Keterangan Relasi

| Dari | Ke | Kardinalitas | Keterangan |
|------|----|--------------|------------|
| `BALITA` | `PEMERIKSAAN_BALITA` | 1 → banyak (wajib) | Satu balita punya banyak rekam timbang. Hapus balita → hapus semua rekam (CASCADE) |
| `LANSIA` | `PEMERIKSAAN_LANSIA` | 1 → banyak (wajib) | Satu lansia punya banyak rekam PTM. Hapus lansia → hapus semua rekam (CASCADE) |
| `MENU_MBG` | `DISTRIBUSI_MBG` | 1 → banyak (opsional) | Satu menu bisa dipakai banyak distribusi. Hapus menu → `menu_id` jadi NULL (SET NULL) |
| `PROFILES` | `PEMERIKSAAN_BALITA` | 1 → banyak (opsional) | Petugas yang mencatat timbang. Hapus profil → `petugas_id` jadi NULL (SET NULL) |
| `PROFILES` | `PEMERIKSAAN_LANSIA` | 1 → banyak (opsional) | Petugas yang mencatat PTM. Hapus profil → `petugas_id` jadi NULL (SET NULL) |

---

## Catatan Desain

| Hal | Penjelasan |
|-----|------------|
| `DISTRIBUSI_MBG.sasaran_id` | Polymorphic — bisa merujuk ID dari `balita`, `ibu_hamil`, `ibu_menyusui`, atau `lansia`. Tidak ada FK constraint karena multi-tabel |
| `IBU_HAMIL` & `IBU_MENYUSUI` | Entitas terpisah, tidak ada relasi langsung ke `BALITA` di DB (relasi logis via NIK ibu di aplikasi) |
| `LANDING_GALERI` & `LANDING_JADWAL` | Berdiri sendiri, tidak berelasi ke entitas klinis manapun |
| `PROFILES` | FK ke `auth.users` Supabase, bukan tabel internal. Hapus user auth → hapus profil (CASCADE) |
| Kolom `status_kek`, `status_anemia` | Dihitung otomatis di aplikasi saat simpan, disimpan redundan di DB untuk query cepat |
