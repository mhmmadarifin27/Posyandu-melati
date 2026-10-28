# Use Case Diagram — SIP-MBG Posyandu Melati RW 03

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
skinparam usecase {
  BackgroundColor White
  BorderColor Black
  ArrowColor Black
  ActorBorderColor Black
  ActorBackgroundColor White
}

' ─── ACTORS ───────────────────────────────────────────────
actor "Warga" as Warga
actor "Kader" as Kader
actor "Bidan" as Bidan

' Kader dan Bidan keduanya login ke sistem
Bidan --|> Kader : <<extend>>

' ─── SYSTEM BOUNDARY ──────────────────────────────────────
rectangle "SIP-MBG — Sistem Informasi Posyandu" {

  ' ── Warga (publik, tanpa login) ──
  usecase "Melihat Informasi Posyandu" as UC01
  usecase "Melihat Jadwal Posyandu" as UC02
  usecase "Melihat Galeri Foto" as UC03
  usecase "Melihat Kontak & Lokasi" as UC04

  ' ── Autentikasi ──
  usecase "Login ke Sistem" as UC05

  ' ── Kader ──
  usecase "Melihat Dashboard" as UC06
  usecase "Mendaftarkan Data Balita" as UC07
  usecase "Mengubah Data Balita" as UC08
  usecase "Menghapus Data Balita" as UC09
  usecase "Mencatat Penimbangan Balita" as UC10
  usecase "Melihat E-KMS Balita" as UC11
  usecase "Mendaftarkan Data Ibu Hamil" as UC12
  usecase "Mengubah Data Ibu Hamil" as UC13
  usecase "Menghapus Data Ibu Hamil" as UC14
  usecase "Mendaftarkan Data Ibu Menyusui" as UC15
  usecase "Mengubah Data Ibu Menyusui" as UC16
  usecase "Menghapus Data Ibu Menyusui" as UC17
  usecase "Mendaftarkan Data Lansia" as UC18
  usecase "Mengubah Data Lansia" as UC19
  usecase "Menghapus Data Lansia" as UC20
  usecase "Mencatat Pemeriksaan PTM Lansia" as UC21
  usecase "Melihat Rekomendasi MBG" as UC22
  usecase "Melihat Laporan Bulanan" as UC23
  usecase "Mengelola Galeri CMS" as UC24
  usecase "Mengelola Jadwal CMS" as UC25

  ' ── Bidan (tambahan eksklusif) ──
  usecase "Menghitung Rekomendasi MBG (SAW)" as UC26
  usecase "Mencetak Laporan PDF" as UC27
  usecase "Mengekspor Laporan CSV" as UC28

  ' ── Include & Extend ──
  UC10 .> UC11 : <<include>>
  UC26 .> UC22 : <<extend>>
  UC27 .> UC23 : <<extend>>
  UC28 .> UC23 : <<extend>>
}

' ─── WARGA → USE CASE ────────────────────────────────────
Warga --> UC01
Warga --> UC02
Warga --> UC03
Warga --> UC04

' ─── KADER → USE CASE ────────────────────────────────────
Kader --> UC05
Kader --> UC06
Kader --> UC07
Kader --> UC08
Kader --> UC09
Kader --> UC10
Kader --> UC11
Kader --> UC12
Kader --> UC13
Kader --> UC14
Kader --> UC15
Kader --> UC16
Kader --> UC17
Kader --> UC18
Kader --> UC19
Kader --> UC20
Kader --> UC21
Kader --> UC22
Kader --> UC23
Kader --> UC24
Kader --> UC25

' ─── BIDAN → USE CASE (eksklusif) ───────────────────────
Bidan --> UC26
Bidan --> UC27
Bidan --> UC28

@enduml
```

---

## Keterangan Aktor

| Aktor | Deskripsi |
|-------|-----------|
| **Warga** | Masyarakat umum, akses publik tanpa login |
| **Kader** | Petugas posyandu, login wajib, akses operasional penuh |
| **Bidan** | Supervisi klinis, mewarisi semua hak Kader + fitur eksklusif |

> **Relasi generalisasi:** Bidan `--|>` Kader — Bidan memiliki semua use case Kader ditambah use case eksklusif (UC26, UC27, UC28).

---

## Keterangan Use Case

| Kode | Use Case | Aktor |
|------|----------|-------|
| UC01 | Melihat Informasi Posyandu | Warga |
| UC02 | Melihat Jadwal Posyandu | Warga |
| UC03 | Melihat Galeri Foto | Warga |
| UC04 | Melihat Kontak & Lokasi | Warga |
| UC05 | Login ke Sistem | Kader, Bidan |
| UC06 | Melihat Dashboard | Kader, Bidan |
| UC07 | Mendaftarkan Data Balita | Kader, Bidan |
| UC08 | Mengubah Data Balita | Kader, Bidan |
| UC09 | Menghapus Data Balita | Kader, Bidan |
| UC10 | Mencatat Penimbangan Balita | Kader, Bidan |
| UC11 | Melihat E-KMS Balita | Kader, Bidan |
| UC12 | Mendaftarkan Data Ibu Hamil | Kader, Bidan |
| UC13 | Mengubah Data Ibu Hamil | Kader, Bidan |
| UC14 | Menghapus Data Ibu Hamil | Kader, Bidan |
| UC15 | Mendaftarkan Data Ibu Menyusui | Kader, Bidan |
| UC16 | Mengubah Data Ibu Menyusui | Kader, Bidan |
| UC17 | Menghapus Data Ibu Menyusui | Kader, Bidan |
| UC18 | Mendaftarkan Data Lansia | Kader, Bidan |
| UC19 | Mengubah Data Lansia | Kader, Bidan |
| UC20 | Menghapus Data Lansia | Kader, Bidan |
| UC21 | Mencatat Pemeriksaan PTM Lansia | Kader, Bidan |
| UC22 | Melihat Rekomendasi MBG | Kader, Bidan |
| UC23 | Melihat Laporan Bulanan | Kader, Bidan |
| UC24 | Mengelola Galeri CMS | Kader, Bidan |
| UC25 | Mengelola Jadwal CMS | Kader, Bidan |
| UC26 | Menghitung Rekomendasi MBG (SAW) | Bidan |
| UC27 | Mencetak Laporan PDF | Bidan |
| UC28 | Mengekspor Laporan CSV | Bidan |

---

## Relasi

| Relasi | Dari | Ke | Keterangan |
|--------|------|----|------------|
| `<<include>>` | UC10 Mencatat Penimbangan | UC11 Melihat E-KMS | Setiap catat timbang selalu tersedia akses KMS |
| `<<extend>>` | UC26 Hitung SAW | UC22 Lihat Rekomendasi | Bidan bisa eksekusi kalkulasi SAW, Kader hanya lihat hasil |
| `<<extend>>` | UC27 Cetak PDF | UC23 Lihat Laporan | Cetak PDF memperluas fitur lihat laporan |
| `<<extend>>` | UC28 Ekspor CSV | UC23 Lihat Laporan | Ekspor CSV memperluas fitur lihat laporan |
| Generalisasi | Bidan | Kader | Bidan mewarisi semua hak Kader |
