# Activity Diagram — SIP-MBG Posyandu Melati RW 03

> Simbol standar UML Activity Diagram:
> - `(●)` — Initial Node (titik awal)
> - `(◉)` — Activity Final Node (titik akhir)
> - `[ ]` — Action (aktivitas)
> - `< >` — Decision Node (keputusan / percabangan)
> - `═══` — Fork / Join (paralel)
> - `→` — Control Flow (alur)
> - `[kondisi]` — Guard Condition

---

## Daftar Modul

1. [Login & Autentikasi](#1-login--autentikasi)
2. [Dashboard](#2-dashboard)
3. [Manajemen Data Balita](#3-manajemen-data-balita)
4. [Pencatatan Penimbangan Balita](#4-pencatatan-penimbangan-balita)
5. [E-KMS (Kartu Menuju Sehat)](#5-e-kms-kartu-menuju-sehat)
6. [Manajemen Ibu Hamil & Ibu Menyusui](#6-manajemen-ibu-hamil--ibu-menyusui)
7. [Manajemen Lansia](#7-manajemen-lansia)
8. [Pemeriksaan PTM Lansia](#8-pemeriksaan-ptm-lansia)
9. [Rekomendasi MBG (SAW)](#9-rekomendasi-mbg-saw)
10. [Laporan Bulanan](#10-laporan-bulanan)
11. [Kelola Landing CMS](#11-kelola-landing-cms)

---

## 1. Login & Autentikasi

```
(●)
 │
 ▼
[Buka Halaman Login]
 │
 ▼
[Isi Email & Password]
 │
 ▼
< Email atau Password kosong? >
 │ [Ya]                │ [Tidak]
 ▼                     ▼
[Tampilkan Pesan    < Supabase terkonfigurasi? >
 Error "Mohon Isi"]    │ [Ya]          │ [Tidak]
 │                     ▼               ▼
 │          [Login via Supabase]  [Login Offline /
 │                     │           Fallback Mode]
 │              < Login berhasil? >
 │               │ [Tidak]    │ [Ya]
 │               ▼            ▼
 │    [Tampilkan Error   [Baca Role dari
 │     Supabase]          user_metadata]
 │               │            │
 │               │     < Role = 'kader'
 │               │       atau 'bidan'? >
 │               │       │ [Ya]   │ [Tidak]
 │               │       │        ▼
 │               │       │  < Email mengandung
 │               │       │    'kader'? >
 │               │       │    │ [Ya]  │ [Tidak]
 │               │       │    ▼       ▼
 │               │       │  [Role =  [Role =
 │               │       │  'kader'] 'bidan']
 │               │       │        │
 │               │       └────────┘
 │               │            │
 │               │     [Simpan Auth ke
 │               │      localStorage]
 │               │            │
 │               │     [Tampilkan Pesan
 │               │      Sukses Login]
 │               │            │
 │               │     [Redirect ke /dashboard]
 │               │            │
 └───────────────┴────────────┘
                              │
                             (◉)
```

---

## 2. Dashboard

```
(●)
 │
 ▼
[Buka /dashboard]
 │
 ▼
[Baca Role dari localStorage]
 │
 ▼
[Muat Data: Balita, Pemeriksaan,
 Bumil, Lansia, Jadwal Posyandu]
 │
 ▼
[Pilih Bulan & Tahun Periode]
 │
 ▼
[Hitung KPI:
 - Jumlah ditimbang bulan ini
 - Status gizi (N/T/2T/BGM)
 - Bumil KEK
 - Belum hadir (sweeping)]
 │
 ▼
< Role = 'bidan'? >
 │ [Ya]                     │ [Tidak / Kader]
 ▼                          ▼
[Tampilkan Dashboard       [Tampilkan Dashboard
 Bidan:                     Kader:
 - KPI Stunting & KEK       - KPI Ditimbang & PMT
 - Audit Kasus Prioritas    - Daftar Balita Belum Hadir
 - Link Laporan & SAW]      - Tombol Catat Timbang]
 │                          │
 ▼                          ▼
< Ada kasus prioritas /    < Semua balita sudah hadir? >
  urgent? >                  │ [Ya]          │ [Tidak]
  │ [Ya]  │ [Tidak]          ▼               ▼
  ▼       ▼           [Tampilkan State   [Tampilkan List
[Daftar  [Tampilkan    "Semua Hadir"]    Sweeping Balita]
 Kasus    State                               │
 Audit]  "Kosong"]                           │
  │       │                                  │
  └───────┴──────────────────────────────────┘
                    │
                   (◉)
```

---

## 3. Manajemen Data Balita

```
(●)
 │
 ▼
[Buka /balita]
 │
 ▼
════════════════════════════
[Muat Data Balita dari
 localStorage + Supabase]
════════════════════════════
 │
 ▼
[Tampilkan Daftar Balita]
 │
 ├─────────────────────────┬──────────────────────────┐
 ▼                         ▼                          ▼
[TAMBAH BALITA]      [EDIT BALITA]              [HAPUS BALITA]
 │                         │                          │
 ▼                         ▼                          ▼
[Buka Form Tambah]  [Buka Form Edit          [Tampilkan Dialog
                     dengan data terkini]     Konfirmasi Hapus]
 │                         │                          │
 ▼                         ▼                    < Konfirmasi? >
[Isi: NIK, Nama,    [Ubah field yang            │ [Ya]   │ [Tidak]
 TTL, Ortu,          diperlukan]                ▼        ▼
 Alamat, Desil]      │                    [Hapus Data]  [Batal]
 │                   ▼                          │
 ▼           < NIK kosong atau                  │
< NIK kosong  < 8 karakter? >                   │
  atau < 8         │ [Ya]  │ [Tidak]             │
  karakter? >      ▼       ▼                    │
  │ [Ya] │[Tidak] [Warning] [Simpan Perubahan]  │
  ▼       ▼         │       │                   │
[Warning][Cek       │       │                   │
          NIK       │       │                   │
          Duplikat] │       │                   │
            │               │                   │
     < NIK sudah ada? >     │                   │
      │ [Ya]  │ [Tidak]     │                   │
      ▼       ▼             │                   │
  [Warning] [Simpan         │                   │
  Tombol     Data Baru]     │                   │
  Disabled]  │              │                   │
             └──────────────┘                   │
                    │                           │
             [Reload Data]◄──────────────────── ┘
                    │
                   (◉)
```

**Filter & Pencarian (alur terpisah, real-time):**

```
(●)
 │
 ▼
[User mengetik kata kunci pencarian
 atau memilih filter]
 │
 ▼
< Mode tampilan = 'Sesi Bulan Ini'? >
 │ [Ya]                        │ [Tidak]
 ▼                             ▼
< Filter kehadiran? >   [Tampilkan semua
 │[Sudah] │[Belum] │[Semua]  data tersimpan]
 ▼        ▼        ▼
[Filter  [Filter  [Tampilkan
 sudah   belum    semua]
 hadir]  hadir]
 │        │        │
 └────────┴────────┘
          │
    [Filter nama /
     NIK / ibu]
          │
    [Render tabel
     hasil filter]
          │
         (◉)
```

---

## 4. Pencatatan Penimbangan Balita

```
(●)
 │
 ▼
[Buka Modal Penimbangan]
 │
 ▼
[Pilih Balita dari Dropdown]
 │
 ▼
════════════════════════════════
[Hitung otomatis (real-time):
 - Usia (bulan) dari TTL
 - Z-Score BB/U dari tabel WHO
 - Status Gizi BBU]
════════════════════════════════
 │
 ▼
[Isi: Berat Badan, Tinggi Badan,
 Lingkar Kepala, Suplementasi,
 Imunisasi, Keluhan]
 │
 ▼
════════════════════════════════
[Hitung Status KMS (real-time):
 Cek riwayat timbang terakhir]
════════════════════════════════
 │
 ▼
< Riwayat timbang sebelumnya ada? >
 │ [Ya]                     │ [Tidak]
 ▼                          ▼
[Hitung kenaikan BB:       [Tidak ada
 Δ BB = BB sekarang -       kenaikan BB,
 BB terakhir]               status awal]
 │                          │
 ▼                          │
< Z-Score < -3? >           │
 │ [Ya]       │ [Tidak]     │
 ▼            ▼             │
[KMS = 'BGM'] < Kenaikan BB < KBM? >
              │ [Ya]           │ [Tidak]
              ▼                ▼
      < Status KMS lalu      [KMS = 'N'
        = 'T' atau '2T'? >    (Naik)]
        │ [Ya]   │ [Tidak]
        ▼        ▼
    [KMS='2T'] [KMS='T'
    (2x gagal]  (gagal 1x)]
                │        │
                └────────┘
                     │
 ─────────────────── ┘ ───────────────────
 │(Semua path bergabung)
 ▼
< Z-Score < -3? (cek pertama) >
 │ [Ya]       │ [Tidak]
 ▼            ▼
[KMS='BGM']  [KMS = sesuai
              kalkulasi di atas]
 │            │
 └────────────┘
      │
      ▼
[Tampilkan badge KMS live
 (N=hijau, T=kuning, 2T/BGM=merah)]
      │
      ▼
[User klik "Simpan Timbang"]
      │
      ▼
[Simpan record pemeriksaan
 ke PosyanduStore]
      │
      ▼
[Toast sukses + tutup modal]
      │
      ▼
[Reload data balita]
      │
     (◉)
```

---

## 5. E-KMS (Kartu Menuju Sehat)

```
(●)
 │
 ▼
[Buka /e-kms]
 │
 ▼
< URL mengandung ?id=... ? >
 │ [Ya]                │ [Tidak]
 ▼                     ▼
[Set selectedChild    [Set selectedChild
 = balita dari ?id]    = balita pertama]
 │                     │
 └──────────┬──────────┘
            │
            ▼
[Muat riwayat pemeriksaan
 balita terpilih]
            │
            ▼
< Ada riwayat pemeriksaan? >
 │ [Ya]                 │ [Tidak]
 ▼                      ▼
[Tampilkan stat cards: [Tampilkan grafik
 BB, TB, Z-Score,       kosong (belum
 Status KMS,            ada data)]
 Suplementasi]
 │                      │
 └──────────┬──────────┘
            │
            ▼
[Render grafik Z-Score
 kurva WHO per bulan]
            │
            ▼
[Tampilkan tabel riwayat
 semua penimbangan]
            │
            ▼
[Tampilkan legenda KMS
 (N/T/2T/BGM/O/B)]
            │
            ▼
< User pilih balita lain
  dari dropdown? >
 │ [Ya]       │ [Tidak]
 ▼            │
[Ganti        │
 selectedChild]
 │            │
 └────────────┘
      │
      ▼
     (◉)
```

---

## 6. Manajemen Ibu Hamil & Ibu Menyusui

```
(●)
 │
 ▼
[Buka /bumil]
 │
 ▼
[Pilih Tab: Ibu Hamil | Ibu Menyusui]
 │
 ▼
[Muat Data (Bumil / Busui)]
 │
 ├──────────────────────────┬────────────────────────────┐
 ▼                          ▼                            ▼
[TAMBAH DATA]          [EDIT DATA]                [HAPUS DATA]
 │                          │                            │
 ▼                          ▼                            ▼
[Buka Form Tambah]    [Buka Form Edit]     [Tampilkan Dialog
                                            Konfirmasi Hapus]
 │                          │                    │
 ▼                          ▼              < Konfirmasi? >
[Isi: NIK (16 digit),  [Ubah field]         │[Ya]   │[Tidak]
 Nama, HPHT/HPL atau                        ▼        ▼
 Data Busui, LiLA, Hb]                [Hapus Data] [Batal]
 │                          │                │
 ▼                          ▼                │
< NIK kosong atau       < NIK kosong atau    │
  ≠ 16 digit? >           ≠ 16 digit? >     │
 │[Ya]  │[Tidak]          │[Ya] │[Tidak]     │
 ▼      ▼                 ▼     ▼            │
[Warning][Cek          [Warning][Simpan]     │
          Duplikat               │           │
          NIK / Nama]            │           │
               │                 │           │
      < Duplikat ditemukan? >    │           │
        │[Ya]      │[Tidak]      │           │
        ▼          ▼             │           │
    [Warning]  [Auto-hitung:     │           │
    [Tombol     statusKEK =      │           │
     Disabled]  LiLA < 23.5]    │           │
                    │            │           │
               [Auto-hitung:     │           │
                statusAnemia =   │           │
                Hb < 11]        │           │
                    │            │           │
               [Simpan Data]     │           │
                    │            │           │
                    └────────────┘           │
                         │                  │
                  [Reload Data]◄─────────── ┘
                         │
                        (◉)
```

---

## 7. Manajemen Lansia

```
(●)
 │
 ▼
[Buka /lansia]
 │
 ▼
[Muat Data Lansia & Pemeriksaan]
 │
 ▼
[Pilih Mode: Sesi Bulan Ini | Master Data]
 │
 ├──────────────────────────┬───────────────────────────┐
 ▼                          ▼                           ▼
[TAMBAH LANSIA]        [EDIT LANSIA]             [HAPUS LANSIA]
 │                          │                           │
 ▼                          ▼                           ▼
[Buka Form Tambah]    [Buka Form Edit]      [Dialog Konfirmasi]
 │                          │                     │
 ▼                          ▼               < Konfirmasi? >
[Isi: NIK (16 digit),  [Ubah field]          │[Ya]  │[Tidak]
 Nama, Usia, Alamat,        │                ▼       ▼
 Pendamping, Riwayat   [Validasi NIK]   [Hapus]   [Batal]
 Penyakit]              16 digit            │
 │                          │               │
 ▼                          ▼               │
< NIK ≠ 16 digit? >   < NIK ≠ 16 digit? >  │
 │[Ya]  │[Tidak]       │[Ya]   │[Tidak]     │
 ▼      ▼              ▼       ▼            │
[Warning][Cek      [Warning] [Simpan]       │
          Duplikat]           │             │
              │               │             │
     < Duplikat NIK          │             │
       atau Nama? >          │             │
       │[Ya]   │[Tidak]      │             │
       ▼       ▼             │             │
  [Warning + [Simpan         │             │
   Tombol     Data Baru]     │             │
   Disabled +    │           │             │
   Tawarkan      └───────────┘             │
   "Langsung Periksa"]                     │
       │                                   │
 [Buka Modal                               │
  Pemeriksaan]                             │
       │                                   │
       └──────────── [Reload Data]◄────────┘
                            │
                           (◉)
```

---

## 8. Pemeriksaan PTM Lansia

```
(●)
 │
 ▼
[Buka Modal Pemeriksaan Lansia]
 │
 ▼
[Pilih Lansia dari Dropdown]
 │
 ▼
[Tampilkan profil lansia
 (nama, NIK, usia, pendamping)]
 │
 ▼
[Isi: BB, TB, Tensi Sistolik/Diastolik,
 Gula Darah (GDS), Kolesterol,
 Asam Urat, Keluhan]
 │
 ▼
════════════════════════════════════════
[Hitung otomatis (real-time):
 IMT = BB / (TB/100)²]
════════════════════════════════════════
 │
 ▼
< IMT < 18.5? >──[Ya]──► [Status Gizi = 'Kurus']
 │[Tidak]                         │
 ▼                                │
< IMT ≤ 24.9? >──[Ya]──► [Status Gizi = 'Normal']
 │[Tidak]                         │
 ▼                                │
< IMT ≤ 29.9? >──[Ya]──► [Status Gizi = 'Kelebihan BB']
 │[Tidak]                         │
 ▼                                │
[Status Gizi = 'Obesitas']        │
 │                                │
 └───────────────┬────────────────┘
                 │
                 ▼
════════════════════════════════════════
[Hitung Status Tensi (real-time):
 Sistolik ≥ 140 atau Diastolik ≥ 90
  → 'Hipertensi'
 Sistolik ≥ 120 atau Diastolik ≥ 80
  → 'Pre-Hipertensi'
 Sistolik < 90
  → 'Hipotensi'
 else → 'Normal']
════════════════════════════════════════
 │
 ▼
════════════════════════════════════════
[Hitung Status Gula Darah (real-time):
 GDS ≥ 200 → 'Tinggi (Diabetes)'
 GDS ≥ 140 → 'Pre-Diabetes'
 else      → 'Normal']
════════════════════════════════════════
 │
 ▼
[Tampilkan badge live:
 IMT, Status Tensi (merah jika Hipertensi),
 Status GDS (merah jika Diabetes)]
 │
 ▼
[User klik "Simpan Pemeriksaan"]
 │
 ▼
[Simpan record pemeriksaan
 ke PosyanduStore]
 │
 ▼
[Toast sukses + tutup modal]
 │
 ▼
[Reload data lansia]
 │
(◉)
```

---

## 9. Rekomendasi MBG (SAW)

```
(●)
 │
 ▼
[Buka /rekomendasi-mbg]
 │
 ▼
[Baca Role dari localStorage]
 │
 ▼
< Role = 'kader'? >
 │ [Ya]                       │ [Tidak / Bidan]
 ▼                            ▼
[Tampilkan halaman       [Muat semua data:
 LOCK "Akses Dibatasi"    Balita, Bumil, Busui,
 → link ke /dashboard]    Lansia, Menu MBG]
 │                            │
(◉)                           ▼
                    [Bangun Daftar Kandidat]
                              │
                   ═══════════════════════════
                   [Paralel scoring per sasaran:]
                   ┌──────────┬────────────┬──────────┐
                   ▼          ▼            ▼          ▼
                [Balita]  [Ibu Hamil] [Ibu Menyusui] [Lansia]
                [Hitung    [Hitung     [Hitung        [Hitung
                 C1-C5]    C1-C5]      C1-C5]         C1-C5]
                   │          │            │          │
                   └──────────┴────────────┴──────────┘
                   ═══════════════════════════
                              │
                              ▼
                   [Jalankan Algoritma SAW:
                    1. Normalisasi Matriks:
                       R_ij = x_ij / max(kolom_j)
                    2. Nilai Akhir:
                       V_i = Σ(bobot_j × R_ij)
                    3. Urutkan V_i menurun]
                              │
                              ▼
                   [Tentukan Prioritas per rank:
                    Rank 1        → 'Sangat Mendesak'
                    Rank 2-3      → 'Prioritas Tinggi'
                    Rank ≤ kuota  → 'Prioritas Sedang'
                    Lainnya       → 'Pemantauan Rutin']
                              │
                              ▼
                   [Tampilkan tabel hasil
                    ranking + rekomendasi menu]
                              │
                              ▼
                   < Filter sasaran dipilih? >
                    │ [Ya]            │ [Tidak]
                    ▼                 ▼
                   [Filter tabel     [Tampilkan
                    berdasar sasaran] semua]
                              │
                              ▼
                   < Klik "Lihat Langkah
                     Perhitungan SAW"? >
                    │ [Ya]       │ [Tidak]
                    ▼            │
                   [Buka Modal:   │
                    1. Matriks    │
                       Keputusan  │
                    2. Matriks    │
                       Ternormali │
                    3. Skor Akhir │
                       + Ranking] │
                    │             │
                    └─────────────┘
                              │
                             (◉)
```

**Kriteria SAW:**

| Kode | Kriteria | Bobot |
|------|----------|-------|
| C1 | Defisit Gizi / Status Nutrisi | 30% |
| C2 | Tren Pertumbuhan / KMS | 25% |
| C3 | Komplikasi Fisik / Anemia | 20% |
| C4 | Kondisi Ekonomi (Desil DTKS) | 15% |
| C5 | Riwayat Penyakit / Keluhan | 10% |

---

## 10. Laporan Bulanan

```
(●)
 │
 ▼
[Buka /laporan]
 │
 ▼
[Baca Role dari localStorage]
 │
 ▼
< Role = 'kader'? >
 │ [Ya]                    │ [Tidak / Bidan]
 ▼                         ▼
[Tampilkan halaman    [Pilih Bulan & Tahun Laporan]
 LOCK "Akses               │
 Dibatasi"]                ▼
 │                [Muat Data: Balita, Pemeriksaan,
(◉)                Bumil, Lansia]
                           │
                           ▼
                  [Hitung statistik bulan terpilih:
                   - Ditimbang (D) vs Sasaran (S)
                   - % D/S coverage
                   - Jumlah N, T, 2T, BGM
                   - Jumlah Bumil KEK]
                           │
                           ▼
                  < Ditimbang > 0? >
                   │ [Ya]          │ [Tidak]
                   ▼               ▼
                  [Banner hijau:  [Banner kuning:
                   "Sesi          "Sesi Belum
                   Terlaksana"]    Berlangsung"]
                           │
                           ▼
                  [Render Dokumen Laporan:
                   - Kop surat Puskesmas
                   - Tabel Balita per record
                   - Tindakan per status KMS
                   - Rangkuman KEK & Lansia
                   - Kolom tanda tangan]
                           │
                           ├──────────────────────┐
                           ▼                      ▼
                   [Klik "Cetak PDF"]    [Klik "Ekspor CSV"]
                           │                      │
                           ▼                      ▼
                   [window.print()        [Buka Modal
                    → Sidebar &            ExportReport]
                    Header tersembunyi          │
                    via CSS no-print]           ▼
                           │            [Generate file CSV]
                           │                      │
                           │             [Download otomatis]
                           │                      │
                           └──────────────────────┘
                                        │
                                       (◉)
```

---

## 11. Kelola Landing CMS

```
(●)
 │
 ▼
[Buka /kelola-landing]
 │
 ▼
[Baca Role dari localStorage]
 │
 ▼
< Role = 'bidan'? >
 │ [Ya]                      │ [Tidak / Kader]
 ▼                           ▼
[Tampilkan halaman      [Baca URL / path
 LOCK "Untuk Kader"]     untuk tab aktif]
 │                           │
(◉)                          ▼
                    < Path/param = 'jadwal'? >
                     │ [Ya]           │ [Tidak]
                     ▼               ▼
                  [Aktifkan tab   [Aktifkan tab
                   Jadwal]         Galeri (default)]
                          │
                          ▼
           ┌──────────────┴──────────────┐
           ▼                             ▼
     [TAB GALERI]                  [TAB JADWAL]
           │                             │
           ▼                             ▼
    [Tampilkan foto          [Tampilkan form
     galeri terkini]          konfigurasi jadwal]
           │                             │
    ┌──────┴──────┐               ┌──────┴──────┐
    ▼             ▼               ▼             ▼
 [UPLOAD      [HAPUS FOTO]   [SIMPAN        [RESET
  FOTO]                       JADWAL]        JADWAL]
    │             │               │             │
    ▼             ▼               ▼             ▼
 [Pilih file] < Jumlah foto   [Validasi     [Dialog
              ≤ 1? >           form]         Konfirmasi]
                │[Ya] │[Tidak]     │            │
                ▼     ▼            ▼       < Konfirmasi? >
 < File adalah [Info] [Dialog  [Simpan ke    │[Ya]  │[Tidak]
   image/*? >         Konfirmasi LandingStore] ▼     ▼
  │[Ya] │[Tidak]       Hapus]       │      [Reset] [Batal]
  ▼     ▼               │[Ya]       ▼         │
 [Baca [Warning         ▼       [Trigger event │
  Base64 Format] [Hapus Foto]    'posyandu_    │
  Preview]         │            landing_       │
    │              │            updated']      │
    ▼              │              │            │
 [Tampilkan        │              ▼            │
  Preview Foto]    │         [Toast Sukses]    │
    │              │              │            │
    ▼              │              │            │
 [Klik             │              │            │
  "Simpan Foto"]   │              │            │
    │              │              │            │
    ▼              │              │            │
 [Simpan ke        │              │            │
  LandingStore]    │              │            │
    │              │              │            │
    └──────────────┴──────────────┴────────────┘
                         │
                  [Reload data galeri /
                   jadwal dari store]
                         │
                        (◉)
```
