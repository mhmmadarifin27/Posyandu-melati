# Sequence Diagram — SIP-MBG Posyandu Melati RW 03

> **Simbol UML Sequence Diagram (draw.io style):**
> - `Actor` — Aktor (orang/sistem, simbol stick figure atau kotak)
> - `:ClassName` — Lifeline (garis vertikal mewakili objek/komponen)
> - `→` — Synchronous Message (panah solid, pesan/pemanggilan)
> - `-->` — Return Message (panah putus-putus, nilai kembalian)
> - `→>` — Asynchronous Message
> - `[kondisi]` — Guard / kondisi
> - `loop [kondisi]` — Combined Fragment: Loop
> - `alt [kondisi] / else` — Combined Fragment: Alternatif (if/else)
> - `opt [kondisi]` — Combined Fragment: Opsional
> - `par` — Combined Fragment: Paralel
> - `▓▓▓▓` — Activation Bar (kotak sempit di lifeline saat aktif)

---

## Daftar Sequence

1. [Login & Autentikasi](#1-login--autentikasi)
2. [Dashboard — Load Data](#2-dashboard--load-data)
3. [Tambah Data Balita](#3-tambah-data-balita)
4. [Pencatatan Penimbangan Balita](#4-pencatatan-penimbangan-balita)
5. [Lihat E-KMS](#5-lihat-e-kms)
6. [Tambah Ibu Hamil](#6-tambah-ibu-hamil)
7. [Tambah Lansia & Pemeriksaan PTM](#7-tambah-lansia--pemeriksaan-ptm)
8. [Rekomendasi MBG (SAW)](#8-rekomendasi-mbg-saw)
9. [Cetak & Ekspor Laporan](#9-cetak--ekspor-laporan)
10. [Kelola Galeri & Jadwal CMS](#10-kelola-galeri--jadwal-cms)

---

## 1. Login & Autentikasi

```
Actor          :LoginPage       :PosyanduStore    :SupabaseAuth     :localStorage
  |                |                  |                 |                 |
  |  Buka /login   |                  |                 |                 |
  |--------------->|                  |                 |                 |
  |                |                  |                 |                 |
  |  Isi email &   |                  |                 |                 |
  |  password      |                  |                 |                 |
  |--------------->|                  |                 |                 |
  |                |                  |                 |                 |
  |  Klik Login    |                  |                 |                 |
  |--------------->|                  |                 |                 |
  |                |                  |                 |                 |
  |         alt [email/password kosong]                 |                 |
  |                |                  |                 |                 |
  |                | Tampilkan error  |                 |                 |
  |<---------------|  "Mohon isi..."  |                 |                 |
  |                |                  |                 |                 |
  |         else [lengkap]            |                 |                 |
  |                |                  |                 |                 |
  |         alt [Supabase terkonfigurasi]               |                 |
  |                |                  |                 |                 |
  |                | signInWithPassword(email, password)|                 |
  |                |---------------------------------------->|            |
  |                |                  |                 |                 |
  |                |         alt [login gagal]          |                 |
  |                |                  |       error     |                 |
  |                |<----------------------------------------|            |
  |                |                  |                 |                 |
  |  Tampilkan error Supabase         |                 |                 |
  |<---------------|                  |                 |                 |
  |                |                  |                 |                 |
  |         else [login berhasil]     |                 |                 |
  |                |                  |       user data |                 |
  |                |<----------------------------------------|            |
  |                |                  |                 |                 |
  |                | Baca role dari user_metadata        |                 |
  |                |----------------->|                 |                 |
  |                |                  |                 |                 |
  |         alt [role valid: kader/bidan]               |                 |
  |                |   gunakan role dari metadata        |                 |
  |                |                  |                 |                 |
  |         else [role tidak valid]   |                 |                 |
  |                |   inferensi role dari email         |                 |
  |                |                  |                 |                 |
  |                | setItem('posyandu_auth_user')       |  setItem(role)  |
  |                |----------------------------------------------------->|
  |                |                  |                 |                 |
  |  Tampilkan sukses, redirect /dashboard              |                 |
  |<---------------|                  |                 |                 |
  |                |                  |                 |                 |
  |         else [Supabase tidak terkonfigurasi / offline]                |
  |                |                  |                 |                 |
  |                | Inferensi role dari email           |                 |
  |                |----------------->|                 |                 |
  |                | setItem auth + role                |                 |
  |                |----------------------------------------------------->|
  |                |                  |                 |                 |
  |  Redirect /dashboard              |                 |                 |
  |<---------------|                  |                 |                 |
  |                |                  |                 |                 |
```

---

## 2. Dashboard — Load Data

```
Actor          :Dashboard        :PosyanduStore    :localStorage    :SupabaseDB
  |                |                  |                 |                |
  |  Buka          |                  |                 |                |
  |  /dashboard    |                  |                 |                |
  |--------------->|                  |                 |                |
  |                |                  |                 |                |
  |                | getItem('posyandu_active_role')    |                |
  |                |------------------------------>|                    |
  |                |<------------------------------|  role              |
  |                |                  |                 |                |
  |                | par [Muat semua data paralel]       |                |
  |                | getBalita()       |                 |                |
  |                |----------------->| getItem('posyandu_balita')       |
  |                |                  |--------------->|                 |
  |                |                  |<---------------|  data[]         |
  |                |<-----------------|  Balita[]       |                |
  |                |                  |                 |                |
  |                | getPemeriksaan() |                 |                |
  |                |----------------->| getItem('posyandu_pemeriksaan')  |
  |                |                  |--------------->|                 |
  |                |                  |<---------------|  data[]         |
  |                |<-----------------|  PemeriksaanBalita[]            |
  |                |                  |                 |                |
  |                | getBumil()        |                 |                |
  |                |----------------->| getItem(...)   |                |
  |                |<-----------------|  IbuHamil[]     |                |
  |                |                  |                 |                |
  |                | getLansia()       |                 |                |
  |                |----------------->| getItem(...)   |                |
  |                |<-----------------|  Lansia[]       |                |
  |                | end par           |                 |                |
  |                |                  |                 |                |
  |                | Hitung KPI (filter bulan terpilih) |                |
  |                |----------------->|                 |                |
  |                |<-----------------| KPI values      |                |
  |                |                  |                 |                |
  |                | opt [background sync]              |                |
  |                | syncFromSupabase()                 |                |
  |                |----------------->|                 |    SELECT *    |
  |                |                  |--------------------------------->|
  |                |                  |<---------------------------------|
  |                |                  | setItem(fresh data)             |
  |                |                  |--------------->|                 |
  |                | end opt           |                 |                |
  |                |                  |                 |                |
  |  Render Dashboard                 |                 |                |
  |  (role-based: Bidan / Kader view) |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
```

---

## 3. Tambah Data Balita

```
Actor          :BalitaPage       :PosyanduStore    :localStorage    :SupabaseDB
  |                |                  |                 |                |
  |  Buka /balita  |                  |                 |                |
  |--------------->|                  |                 |                |
  |                | loadData()        |                 |                |
  |                |----------------->| getItem(balita) |                |
  |                |<-----------------|  Balita[]       |                |
  |                |                  |                 |                |
  |  Klik "Tambah Balita"             |                 |                |
  |--------------->|                  |                 |                |
  |                | Buka modal form   |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  |  Isi form      |                  |                 |                |
  |  (NIK, nama,   |                  |                 |                |
  |   TTL, ortu,   |                  |                 |                |
  |   alamat, desil)|                 |                 |                |
  |--------------->|                  |                 |                |
  |                |                  |                 |                |
  |                | loop [setiap perubahan NIK]         |                |
  |                | Cek duplikat NIK real-time          |                |
  |                |----------------->|                 |                |
  |                |<-----------------| existingBalita? |                |
  |                |                  |                 |                |
  |         opt [NIK duplikat ditemukan]                |                |
  |  Tampilkan warning NIK terdaftar  |                 |                |
  |  Tombol simpan disabled           |                 |                |
  |<---------------|                  |                 |                |
  |                | end opt           |                 |                |
  |                |                  |                 |                |
  |  Klik "Simpan" |                  |                 |                |
  |--------------->|                  |                 |                |
  |                |                  |                 |                |
  |         alt [NIK kosong atau < 8 karakter]          |                |
  |  Toast warning "NIK Belum Valid"  |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  |         else [NIK duplikat]       |                 |                |
  |  Toast warning "NIK Sudah Terdaftar"                |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  |         else [valid]              |                 |                |
  |                | addBalita(newBalita)                |                |
  |                |----------------->| setItem(balita) |                |
  |                |                  |--------------->|                 |
  |                |                  |                 | INSERT balita  |
  |                |                  |--------------------------------->|
  |                |                  |<---------------------------------|
  |  Toast sukses  |                  |                 |                |
  |<---------------|                  |                 |                |
  |                | Tutup modal, loadData()             |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
```

---

## 4. Pencatatan Penimbangan Balita

```
Actor          :WeighingModal    :PosyanduStore    :MCDMEngine      :localStorage
  |                |                  |                 |                |
  |  Klik "Timbang |                  |                 |                |
  |   Sekarang"    |                  |                 |                |
  |--------------->|                  |                 |                |
  |                | getPemeriksaan() |                 |                |
  |                |----------------->|                 |                |
  |                |<-----------------| riwayat[]       |                |
  |                |                  |                 |                |
  |  Pilih balita  |                  |                 |                |
  |  dari dropdown |                  |                 |                |
  |--------------->|                  |                 |                |
  |                |                  |                 |                |
  |                | Hitung usia (bulan) dari TTL        |                |
  |                |----------------->|                 |                |
  |                |<-----------------| usiaBulan       |                |
  |                |                  |                 |                |
  |  Isi BB, TB,   |                  |                 |                |
  |  LK, vitamin,  |                  |                 |                |
  |  imunisasi     |                  |                 |                |
  |--------------->|                  |                 |                |
  |                |                  |                 |                |
  |                | loop [setiap perubahan BB]          |                |
  |                | calculateZScoreBBU(gender, usia, BB)|                |
  |                |------------------------------>|                    |
  |                |<------------------------------| zScore            |
  |                |                  |                 |                |
  |                | Ambil lastPeriksa dari riwayat      |                |
  |                |----------------->|                 |                |
  |                |<-----------------| lastPeriksa     |                |
  |                |                  |                 |                |
  |         alt [lastPeriksa ada]     |                 |                |
  |                | Hitung kenaikanBB = BB - lastBB    |                |
  |                |----------------->|                 |                |
  |                |                  |                 |                |
  |         alt [zScore < -3]         |                 |                |
  |                | statusKMS = 'BGM'|                 |                |
  |                |                  |                 |                |
  |         else [kenaikanBB < KBM]   |                 |                |
  |                |                  |                 |                |
  |         alt [lastKMS = 'T' atau '2T']               |                |
  |                | statusKMS = '2T' |                 |                |
  |         else   |                  |                 |                |
  |                | statusKMS = 'T'  |                 |                |
  |                |                  |                 |                |
  |         else [kenaikanBB >= KBM]  |                 |                |
  |                | statusKMS = 'N'  |                 |                |
  |                |                  |                 |                |
  |         else [lastPeriksa tidak ada / pertama kali]  |                |
  |         alt [zScore < -3]         |                 |                |
  |                | statusKMS = 'BGM'|                 |                |
  |         else   | statusKMS = 'N'  |                 |                |
  |                |                  |                 |                |
  |  Tampilkan badge KMS real-time    |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  |  Klik "Simpan  |                  |                 |                |
  |  Timbang"      |                  |                 |                |
  |--------------->|                  |                 |                |
  |                | addPemeriksaan(record)             |                |
  |                |----------------->| setItem(...)    |                |
  |                |                  |--------------->|                 |
  |  Toast sukses  |                  |                 |                |
  |<---------------|                  |                 |                |
  |                | onSuccess(), tutup modal            |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
```

---

## 5. Lihat E-KMS

```
Actor          :EKMSPage         :PosyanduStore    :KMSChart        :localStorage
  |                |                  |                 |                |
  |  Buka /e-kms   |                  |                 |                |
  |  (?id=xxx)     |                  |                 |                |
  |--------------->|                  |                 |                |
  |                |                  |                 |                |
  |                | par [load paralel]|                 |                |
  |                | getBalita()       |                 |                |
  |                |----------------->| getItem(balita) |                |
  |                |<-----------------| Balita[]        |                |
  |                |                  |                 |                |
  |                | getPemeriksaan() |                 |                |
  |                |----------------->| getItem(...)    |                |
  |                |<-----------------| Pemeriksaan[]   |                |
  |                | end par           |                 |                |
  |                |                  |                 |                |
  |         alt [URL memiliki ?id dan id valid]         |                |
  |                | setSelectedChildId(urlId)           |                |
  |         else   |                  |                 |                |
  |                | setSelectedChildId(balitaList[0].id)|               |
  |                |                  |                 |                |
  |                | Filter pemeriksaan by selectedChildId              |
  |                | Sort ASC by usiaBulan              |                |
  |                |----------------->|                 |                |
  |                |<-----------------| historyPemeriksaan[]            |
  |                |                  |                 |                |
  |                | Ambil lastPeriksa (record terbaru) |                |
  |                |----------------->|                 |                |
  |                |<-----------------| lastPeriksa     |                |
  |                |                  |                 |                |
  |         opt [lastPeriksa ada]     |                 |                |
  |  Tampilkan stat cards             |                 |                |
  |  (BB, TB, Z-Score, Status KMS,    |                 |                |
  |   Suplementasi)                   |                 |                |
  |<---------------|                  |                 |                |
  |                | end opt           |                 |                |
  |                |                  |                 |                |
  |                | render(historyPemeriksaan, gender)  |                |
  |                |------------------------------>|                    |
  |  Tampilkan grafik Z-Score kurva WHO            |                    |
  |<----------------------------------------------|                    |
  |                |                  |                 |                |
  |  Tampilkan tabel riwayat & legenda KMS          |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  |  Pilih balita  |                  |                 |                |
  |  lain dari     |                  |                 |                |
  |  dropdown      |                  |                 |                |
  |--------------->|                  |                 |                |
  |                | setSelectedChildId(newId)           |                |
  |                | Recalculate history & lastPeriksa  |                |
  |                | render(newHistory, gender)          |                |
  |                |------------------------------>|                    |
  |  Update grafik & tabel            |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
```

---

## 6. Tambah Ibu Hamil

```
Actor          :BumilPage        :PosyanduStore    :localStorage    :SupabaseDB
  |                |                  |                 |                |
  |  Buka /bumil   |                  |                 |                |
  |--------------->|                  |                 |                |
  |                | getBumil()        |                 |                |
  |                |----------------->| getItem(bumil)  |                |
  |                |<-----------------| IbuHamil[]      |                |
  |                |                  |                 |                |
  |  Klik "Tambah Ibu Hamil"          |                 |                |
  |--------------->|                  |                 |                |
  |  Isi form      |                  |                 |                |
  |  (NIK, nama,   |                  |                 |                |
  |   HPHT/HPL,    |                  |                 |                |
  |   LiLA, Hb,    |                  |                 |                |
  |   desil)       |                  |                 |                |
  |--------------->|                  |                 |                |
  |                |                  |                 |                |
  |                | loop [setiap perubahan NIK/Nama]    |                |
  |                | Cek duplikat (NIK atau Nama)        |                |
  |                |----------------->|                 |                |
  |                |<-----------------| duplicateBumil? |                |
  |                |                  |                 |                |
  |         opt [duplikat ditemukan]  |                 |                |
  |  Warning banner + tombol disabled |                 |                |
  |<---------------|                  |                 |                |
  |                | end opt           |                 |                |
  |                |                  |                 |                |
  |  Klik "Simpan" |                  |                 |                |
  |--------------->|                  |                 |                |
  |                |                  |                 |                |
  |         alt [NIK ≠ 16 digit]      |                 |                |
  |  Toast warning "NIK Tidak Valid"  |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  |         else [duplikat]           |                 |                |
  |  Toast error "Data Sudah Terdaftar"                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  |         else [valid]              |                 |                |
  |                | Auto-hitung:      |                 |                |
  |                | statusKEK = LiLA < 23.5            |                |
  |                | statusAnemia = Hb < 11             |                |
  |                |----------------->|                 |                |
  |                |                  |                 |                |
  |                | addBumil(newBumil)|                 |                |
  |                |----------------->| setItem(bumil)  |                |
  |                |                  |--------------->|                 |
  |                |                  |                 | INSERT ibu_hamil|
  |                |                  |--------------------------------->|
  |                |                  |<---------------------------------|
  |  Toast sukses  |                  |                 |                |
  |<---------------|                  |                 |                |
  |                | Tutup modal, loadData()             |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
```

---

## 7. Tambah Lansia & Pemeriksaan PTM

```
Actor          :LansiaPage       :AddLansiaModal   :PosyanduStore   :localStorage
  |                |                  |                 |                |
  |  Buka /lansia  |                  |                 |                |
  |--------------->|                  |                 |                |
  |                | getLansia() + getPemeriksaanLansia()|               |
  |                |--------------------------------->|                  |
  |                |<---------------------------------|  data[]          |
  |                |                  |                 |                |
  |  Klik "Tambah  |                  |                 |                |
  |  Lansia"       |                  |                 |                |
  |--------------->|                  |                 |                |
  |                | Buka form tambah  |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  |  Isi NIK,      |                  |                 |                |
  |  nama, usia,   |                  |                 |                |
  |  alamat, dll   |                  |                 |                |
  |--------------->|                  |                 |                |
  |                |                  |                 |                |
  |         alt [NIK ≠ 16 digit]      |                 |                |
  |  Toast warning |                  |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  |         else [duplikat NIK/Nama ditemukan]          |                |
  |  Warning + tawarkan "Langsung Periksa"              |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  |         opt [user klik "Langsung Periksa"]          |                |
  |                | Tutup form tambah                  |                |
  |                | Buka AddLansiaModal(lansiaId)      |                |
  |                |----------------->|                 |                |
  |                | end opt           |                 |                |
  |                |                  |                 |                |
  |         else [valid, klik Simpan] |                 |                |
  |                | addLansia(newLansia)               |                |
  |                |--------------------------------->|                  |
  |                |<---------------------------------|  OK              |
  |  Toast sukses  |                  |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  | === Alur Pemeriksaan PTM ===      |                 |                |
  |                |                  |                 |                |
  |  Klik "+ Periksa" pada lansia     |                 |                |
  |--------------->|                  |                 |                |
  |                | Buka AddLansiaModal(lansiaId)      |                |
  |                |----------------->|                 |                |
  |                |                  |                 |                |
  |  Pilih lansia  |                  |                 |                |
  |  dari dropdown |                  |                 |                |
  |--------------->|                  |                 |                |
  |                |                  | Tampilkan profil lansia          |
  |<---------------|------------------|                 |                |
  |                |                  |                 |                |
  |  Isi BB, TB,   |                  |                 |                |
  |  tensi, GDS,   |                  |                 |                |
  |  kolesterol,   |                  |                 |                |
  |  asam urat     |                  |                 |                |
  |--------------->|                  |                 |                |
  |                |                  |                 |                |
  |                | loop [setiap input berubah]         |                |
  |                |                  | Hitung IMT = BB / (TB/100)²      |
  |                |                  |                 |                |
  |                |                  | Tentukan statusGizi dari IMT     |
  |                |                  |                 |                |
  |                |                  | Tentukan statusTensi             |
  |                |                  | (Hipotensi/Normal/Pre/Hipertensi)|
  |                |                  |                 |                |
  |                |                  | Tentukan statusGulaDarah         |
  |                |                  | (Normal/Pre-Diabetes/Diabetes)   |
  |                |                  |                 |                |
  |  Tampilkan badge IMT, Tensi,      |                 |                |
  |  GDS real-time                    |                 |                |
  |<---------------+------------------|                 |                |
  |                |                  |                 |                |
  |  Klik "Simpan  |                  |                 |                |
  |  Pemeriksaan"  |                  |                 |                |
  |--------------->|                  |                 |                |
  |                |                  | addPemeriksaanLansia(record)     |
  |                |                  |--------------->|                 |
  |                |                  |<---------------| OK              |
  |  Toast sukses  |                  |                 |                |
  |<---------------+------------------|                 |                |
  |                | Tutup modal, loadData()             |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
```

---

## 8. Rekomendasi MBG (SAW)

```
Bidan          :RekomendasiPage  :PosyanduStore    :MCDMEngine      :localStorage
  |                |                  |                 |                |
  |  Buka          |                  |                 |                |
  |  /rekomendasi-mbg                 |                 |                |
  |--------------->|                  |                 |                |
  |                | getItem('posyandu_active_role')    |                |
  |                |------------------------------>|                    |
  |                |<------------------------------| role              |
  |                |                  |                 |                |
  |         alt [role = 'kader']      |                 |                |
  |  Tampilkan halaman LOCK           |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  |         else [role = 'bidan']     |                 |                |
  |                | par [muat data paralel]            |                |
  |                | getBalita(), getPemeriksaan(),      |                |
  |                | getBumil(), getBusui(),             |                |
  |                | getLansia(), getPemeriksaanLansia(),|               |
  |                | getMenuMBG()                       |                |
  |                |----------------->|                 |                |
  |                |<-----------------| semua data[]    |                |
  |                | end par           |                 |                |
  |                |                  |                 |                |
  |                | par [bangun kandidat per sasaran]   |                |
  |                | Score Balita (C1–C5)                |                |
  |                |------------------------------>|                    |
  |                | Score IbuHamil (C1–C5)             |                |
  |                |------------------------------>|                    |
  |                | Score IbuMenyusui (C1–C5)          |                |
  |                |------------------------------>|                    |
  |                | Score Lansia (C1–C5)               |                |
  |                |------------------------------>|                    |
  |                | end par           |                 |                |
  |                |                  |                 |                |
  |                | calculateSAW(candidates, KRITERIA_MBG)             |
  |                |------------------------------>|                    |
  |                |                  | Normalisasi matriks: Rij = xij / max(kolom)|
  |                |                  | Hitung Vi = Σ(bobot × Rij)     |
  |                |                  | Sort descending Vi              |
  |                |                  | Assign rank & prioritas         |
  |                |<------------------------------| SAWResult         |
  |                |                  |                 |                |
  |  Tampilkan tabel ranking          |                 |                |
  |  + rekomendasi menu               |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  |  Pilih filter  |                  |                 |                |
  |  sasaran       |                  |                 |                |
  |--------------->|                  |                 |                |
  |                | Filter results by jenisSasaran     |                |
  |  Update tabel  |                  |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  |  Klik "Lihat   |                  |                 |                |
  |  Langkah SAW"  |                  |                 |                |
  |--------------->|                  |                 |                |
  |                | Buka modal SAWStepDetail            |                |
  |  Tampilkan:    |                  |                 |                |
  |  1. Matriks Keputusan             |                 |                |
  |  2. Matriks Normalisasi           |                 |                |
  |  3. Skor Akhir & Ranking          |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
```

---

## 9. Cetak & Ekspor Laporan

```
Bidan          :LaporanPage      :PosyanduStore    :ExportModal     :Browser
  |                |                  |                 |                |
  |  Buka /laporan |                  |                 |                |
  |--------------->|                  |                 |                |
  |                | Baca role localStorage              |                |
  |                |----------------->|                 |                |
  |                |<-----------------| role            |                |
  |                |                  |                 |                |
  |         alt [role = 'kader']      |                 |                |
  |  Tampilkan halaman LOCK           |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  |         else [role = 'bidan']     |                 |                |
  |                | par [muat data]   |                 |                |
  |                | getBalita(), getPemeriksaan(),      |                |
  |                | getBumil(), getLansia()             |                |
  |                |----------------->|                 |                |
  |                |<-----------------| data[]          |                |
  |                | end par           |                 |                |
  |                |                  |                 |                |
  |  Pilih bulan & |                  |                 |                |
  |  tahun laporan |                  |                 |                |
  |--------------->|                  |                 |                |
  |                | Hitung statistik bulan:            |                |
  |                | D/S coverage, N/T/2T/BGM, KEK count|               |
  |                |----------------->|                 |                |
  |                |<-----------------| stats           |                |
  |                |                  |                 |                |
  |  Render dokumen laporan kop       |                 |                |
  |  surat + tabel + tanda tangan     |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  |  Klik "Cetak PDF"                 |                 |                |
  |--------------->|                  |                 |                |
  |                | Toast "Menyiapkan Lembar Cetak"    |                |
  |                | Sembunyikan Sidebar & Header       |                |
  |                | (CSS class no-print)               |                |
  |                | window.print()                     |                |
  |                |--------------------------------------------->|     |
  |  Dialog print browser tampil      |                 |                |
  |<---------------------------------------------|                     |
  |                |                  |                 |                |
  |  Klik "Ekspor  |                  |                 |                |
  |  CSV"          |                  |                 |                |
  |--------------->|                  |                 |                |
  |                | Buka ExportReportModal              |                |
  |                |------------------------------>|                    |
  |<-------------------------------|  Modal tampil   |                   |
  |                |                  |                 |                |
  |  Konfirmasi    |                  |                 |                |
  |  ekspor        |                  |                 |                |
  |--------------->|                  |                 |                |
  |                |                  | Generate CSV string             |
  |                |                  |--------------->|                 |
  |                |                  |                | Blob + URL.createObjectURL|
  |                |                  |                |--------------->|
  |                |                  |                | click() → download|
  |  File CSV terunduh               |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
```

---

## 10. Kelola Galeri & Jadwal CMS

```
Kader          :KelolaLanding    :LandingStore     :localStorage    :SupabaseDB
  |                |                  |                 |                |
  |  Buka          |                  |                 |                |
  |  /kelola-landing                  |                 |                |
  |--------------->|                  |                 |                |
  |                | Baca role localStorage              |                |
  |                |------------------------------>|                    |
  |                |<------------------------------| role              |
  |                |                  |                 |                |
  |         alt [role = 'bidan']      |                 |                |
  |  Tampilkan halaman LOCK           |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  |         else [role = 'kader']     |                 |                |
  |                | getGalleryImages()                 |                |
  |                |----------------->| getItem(galeri) |                |
  |                |<-----------------| GalleryPhoto[]  |                |
  |                | getSchedule()     |                 |                |
  |                |----------------->| getItem(jadwal) |                |
  |                |<-----------------| LandingJadwal   |                |
  |                |                  |                 |                |
  |  Tampilkan tab Galeri & Jadwal    |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  | === Tab Galeri ===                |                 |                |
  |                |                  |                 |                |
  |  Pilih file    |                  |                 |                |
  |  gambar        |                  |                 |                |
  |--------------->|                  |                 |                |
  |                |                  |                 |                |
  |         alt [bukan image/*]       |                 |                |
  |  Toast warning "Format Tidak Sesuai"                |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  |         else [valid image]        |                 |                |
  |                | FileReader.readAsDataURL(file)      |                |
  |                |----------------->|                 |                |
  |  Tampilkan preview foto          |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  |  Klik "Simpan  |                  |                 |                |
  |  Foto"         |                  |                 |                |
  |--------------->|                  |                 |                |
  |                | addGalleryPhoto(base64)             |                |
  |                |----------------->| setItem(galeri) |                |
  |                |                  |--------------->|                 |
  |                |                  |                 | INSERT galeri  |
  |                |                  |--------------------------------->|
  |                | Trigger event 'posyandu_landing_updated'            |
  |                |----------------->|                 |                |
  |  Toast sukses, update grid galeri |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  |  Klik "Hapus"  |                  |                 |                |
  |  pada foto     |                  |                 |                |
  |--------------->|                  |                 |                |
  |                |                  |                 |                |
  |         alt [jumlah foto ≤ 1]     |                 |                |
  |  Toast info "Minimal 1 Foto"      |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  |         else [foto > 1]           |                 |                |
  |  Dialog konfirmasi hapus          |                 |                |
  |<---------------|                  |                 |                |
  |  Konfirmasi    |                  |                 |                |
  |--------------->|                  |                 |                |
  |                | deleteGalleryPhoto(id)              |                |
  |                |----------------->| setItem(galeri) |                |
  |                |                  |--------------->|                 |
  |  Toast sukses, grid diperbarui    |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
  | === Tab Jadwal ===                |                 |                |
  |                |                  |                 |                |
  |  Edit field    |                  |                 |                |
  |  jadwal        |                  |                 |                |
  |  (tanggal,     |                  |                 |                |
  |   waktu, lokasi,                  |                 |                |
  |   kontak WA)   |                  |                 |                |
  |--------------->|                  |                 |                |
  |                |                  |                 |                |
  |  Klik "Simpan  |                  |                 |                |
  |  Jadwal"       |                  |                 |                |
  |--------------->|                  |                 |                |
  |                | saveSchedule(partial)               |                |
  |                |----------------->| setItem(jadwal) |                |
  |                |                  |--------------->|                 |
  |                |                  |                 | UPSERT jadwal  |
  |                |                  |--------------------------------->|
  |                | Trigger event 'posyandu_landing_updated'            |
  |                |----------------->|                 |                |
  |  Toast sukses  |                  |                 |                |
  |<---------------|                  |                 |                |
  |                |                  |                 |                |
```
