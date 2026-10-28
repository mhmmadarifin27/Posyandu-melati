"use client";

import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export interface ServiceStackItem {
  id: number;
  number: string;
  title: string;
  headline: string;
  description: string;
  features: string[];
  schedule: string;
  lead: string;
  image: string;
  themeGradient?: string;
}

export const defaultServicesData: ServiceStackItem[] = [
  {
    id: 1,
    number: "01",
    title: "Pemantauan Balita & KMS WHO",
    headline: "Deteksi Dini Stunting & Pertumbuhan Optimal Buah Hati",
    description:
      "Penimbangan berat badan balita (BB), pengukuran tinggi badan (TB), dan lingkar kepala secara rutin menggunakan timbangan digital terstandar. Plotting otomatis ke kurva Z-Score WHO untuk deteksi dini stunting dan pemantauan weight faltering (2T).",
    features: [
      "Plotting Kurva Z-Score KMS WHO Digital",
      "Imunisasi Dasar Lengkap (Polio, DPT-HB-Hib, MR)",
      "Distribusi Menu MBG Tambahan (Protein Hewani)",
      "Pemberian Vitamin A & Obat Cacing Rutin",
    ],
    schedule: "Setiap Tanggal 15 (08.30 - 12.00 WIB)",
    lead: "Bdn. Siti Rahma, S.Tr.Keb & Tim Kader",
    image: "/images/deteksi_stunting_balita.jpg",
    themeGradient: "from-white via-[#fff7f8] to-[#ffedf0]",
  },
  {
    id: 2,
    number: "02",
    title: "Ibu Hamil & Konseling Laktasi",
    headline: "Pemeriksaan Antenatal Menyeluruh & Persiapan Melahirkan Aman",
    description:
      "Pemeriksaan antenatal menyeluruh meliputi pengukuran tekanan darah, tinggi fundus, dan pita lingkar lengan atas (LiLA) guna mencegah risiko Kurang Energi Kronis (KEK) dan anemia. Dilengkapi bimbingan laktasi serta persiapan persalinan aman.",
    features: [
      "Skrining LiLA (< 23.5 cm) & Deteksi Dini KEK",
      "Pemeriksaan Tekanan Darah & Buku KIA",
      "Pemberian Tablet Tambah Darah (TTD)",
      "Bimbingan Perlekatan Menyusui & Manajemen ASI",
    ],
    schedule: "Setiap Tanggal 15 (09.00 - 11.30 WIB)",
    lead: "Bidan Pembina Puskesmas Pembina",
    image: "/images/dok_bumil_checkup.jpg",
    themeGradient: "from-white via-[#fff9f6] to-[#fff1ea]",
  },
  {
    id: 3,
    number: "03",
    title: "Posyandu Lansia & Skrining PTM",
    headline: "Skrining Penyakit Tidak Menular & Kebugaran Usia Emas",
    description:
      "Pemeriksaan kesehatan terpadu faktor risiko Penyakit Tidak Menular (PTM) bagi para lanjut usia di lingkungan RW 03. Meliputi tensi darah digital, cek gula darah sewaktu (GDS), kolesterol, asam urat berkala, dan senam kebugaran lansia bersama.",
    features: [
      "Pemeriksaan Tekanan Darah & Hipertensi",
      "Tes Laboratorium Sederhana (GDS & Asam Urat)",
      "Senam Jantung & Kebugaran Lansia Bersama",
      "Konsultasi Diet Rendah Garam & Kolesterol",
    ],
    schedule: "Setiap Tanggal 15 (08.00 - 11.00 WIB)",
    lead: "Tim Medis Puskesmas & Kader Lansia",
    image: "/images/galeri_lansia.jpg",
    themeGradient: "from-white via-[#faf6fc] to-[#f4ebf8]",
  },
  {
    id: 4,
    number: "04",
    title: "Pendampingan Menu MBG & PMT",
    headline: "Distribusi Menu Makanan Bergizi Tambahan Kaya Protein Hewani",
    description:
      "Distribusi makanan bergizi tambahan berbasis protein hewani lokal, panduan Isi Piringku Kemenkes RI, serta pendampingan pola asuh makan anak untuk mewujudkan generasi bebas stunting di RW 03 Sukamaju.",
    features: [
      "Menu Tambahan Berbasis Protein Hewani",
      "Formula Rekomendasi Menu MBG Teruji",
      "Pendampingan Pola Makan Balita 2T",
      "Konsultasi Ahli Gizi Binaan Puskesmas",
    ],
    schedule: "Setiap Tanggal 15 (08.30 - 12.00 WIB)",
    lead: "Bidan Desa & Ahli Gizi Puskesmas",
    image: "/images/galeri_pmt.jpg",
    themeGradient: "from-white via-[#f6faf7] to-[#eaf5ec]",
  },
];

interface StackingCardsProps {
  services?: ServiceStackItem[];
  onSelectService?: (service: ServiceStackItem) => void;
}

export default function StackingCards({
  services = defaultServicesData,
  onSelectService,
}: StackingCardsProps) {
  return (
    <div className="w-full relative">
      {/* Expanded Max Width Frame Container */}
      <div className="relative max-w-[1380px] mx-auto space-y-10 sm:space-y-16">
        {services.map((item, index) => {
          // Dynamic sticky top offset creating the stacked tab effect like DrDoctor
          const stickyTop = 84 + index * 22; // 84px, 106px, 128px, 150px
          const zIndex = (index + 1) * 10;
          const isLast = index === services.length - 1;

          return (
            <div
              key={item.id}
              className="sticky will-change-transform"
              style={{
                top: `${stickyTop}px`,
                zIndex,
                marginBottom: isLast ? '0px' : '6rem',
              }}
            >
              {/* Card Frame (Lebar & Mewah) */}
              <div
                className={`w-full rounded-[24px] sm:rounded-[32px] bg-gradient-to-br ${item.themeGradient} border border-rose-200/90 shadow-[0_25px_60px_-15px_rgba(128,0,15,0.12)] overflow-hidden transition-all duration-300`}
              >
                {/* Top Tab Bar (Always visible when stacked, clean without category badge) */}
                <div className="w-full px-6 sm:px-10 py-3.5 bg-white/80 backdrop-blur-md border-b border-rose-100/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-serif font-black text-lg sm:text-xl text-[#80000f]">
                      {item.number}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span className="font-serif font-bold text-sm sm:text-base text-slate-900 tracking-wide">
                      {item.title}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-rose-900/60 uppercase tracking-wider">
                    Posyandu Melati RW 03
                  </span>
                </div>

                {/* Card Main Body */}
                <div className="p-6 sm:p-8 lg:p-10 xl:p-12">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    {/* Left Column: Editorial & Protocols */}
                    <div className="lg:col-span-7 space-y-5 text-left">
                      <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-[1.2]">
                        {item.headline}
                      </h3>

                      <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                        {item.description}
                      </p>

                      {/* 2x2 Feature Checklist Grid */}
                      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {item.features.map((feat, fIdx) => (
                          <div
                            key={fIdx}
                            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/80 border border-rose-100 text-xs sm:text-sm font-medium text-slate-700 shadow-2xs"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="line-clamp-1">{feat}</span>
                          </div>
                        ))}
                      </div>

                      {/* Footer Actions (Clean without date/time) */}
                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={() => onSelectService && onSelectService(item)}
                          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#80000f] hover:bg-[#9c0013] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-rose-950/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                        >
                          <span>Pelajari Protokol Layanan</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Right Column: High-Res Photo Frame (Kotak Tegas & Bersih Tanpa Tulisan) */}
                    <div className="lg:col-span-5">
                      <div className="relative aspect-[4/3] lg:aspect-[5/4] rounded-none overflow-hidden shadow-md border-2 border-slate-200/90 group bg-slate-100">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 rounded-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
