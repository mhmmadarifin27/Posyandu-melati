'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Baby,
  Heart,
  HeartPulse,
  Stethoscope,
  Droplets,
  Activity,
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ExternalLink,
  Users,
  CheckCircle2,
  Bell,
  Menu,
  X,
  CalendarCheck,
  Building2,
  FileText,
  Sparkles,
  Check,
  Info,
  Search,
  Award,
  ChevronDown,
} from 'lucide-react';
import CurvedMenu from '@/components/ui/curved-menu';
import PosyanduCalendar from '@/components/PosyanduCalendar';
import TiltedGridHero from '@/components/ui/tilted-grid-hero';
import StackingCards from '@/components/ui/stacking-cards';
import { LandingStore, PosyanduScheduleConfig } from '@/lib/landing-store';

export default function LandingPage() {
  const [activeModalCard, setActiveModalCard] = useState<any | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Koleksi Foto Dokumentasi Kegiatan & Jadwal dari LandingStore (Sinkron Realtime dengan Dashboard)
  const [galleryImages, setGalleryImages] = useState(() => LandingStore.getGalleryImages());
  const [scheduleConfig, setScheduleConfig] = useState<PosyanduScheduleConfig>(() =>
    LandingStore.getSchedule()
  );

  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 20) {
        setScrollDirection('up');
      } else if (currentScrollY > lastScrollY + 4) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY - 4) {
        setScrollDirection('up');
      }
      setScrollY(currentScrollY);
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      setGalleryImages(LandingStore.getGalleryImages());
      setScheduleConfig(LandingStore.getSchedule());
    };
    window.addEventListener('posyandu_landing_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('posyandu_landing_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // 3 Opsi Layanan Utama (Sesuai 3 Cards di Screenshot 4 Sinceri Senior Living)
  const serviceCards = [
    {
      id: 1,
      image: '/images/dok_timbang_balita.jpg',
      category: 'Usia 0 - 59 Bulan',
      title: 'Pemantauan Balita & KMS WHO',
      subtitle: 'Pediatri & Pertumbuhan Anak',
      description:
        'Penimbangan berat badan balita (BB), pengukuran tinggi badan (TB), dan lingkar kepala secara rutin menggunakan timbangan digital terstandar. Plotting otomatis ke kurva Z-Score WHO untuk deteksi dini stunting dan pemantauan weight faltering (2T).',
      features: [
        'Plotting Kurva Z-Score KMS WHO Digital',
        'Imunisasi Dasar Lengkap (Polio, DPT-HB-Hib, MR)',
        'Distribusi Menu MBG Tambahan (Protein Hewani)',
        'Pemberian Vitamin A & Obat Cacing Rutin',
      ],
      schedule: 'Setiap Tanggal 15 (08.30 - 12.00 WIB)',
      lead: 'Bdn. Siti Rahma, S.Tr.Keb & Tim Kader',
    },
    {
      id: 2,
      image: '/images/dok_bumil_checkup.jpg',
      category: 'Maternal & Pasca Salin',
      title: 'Ibu Hamil & Konseling Laktasi',
      subtitle: 'Kesehatan Ibu & Janin',
      description:
        'Pemeriksaan antenatal menyeluruh meliputi pengukuran tekanan darah, tinggi fundus, dan pita lingkar lengan atas (LiLA) guna mencegah risiko Kurang Energi Kronis (KEK) dan anemia. Dilengkapi bimbingan laktasi serta persiapan persalinan aman.',
      features: [
        'Skrining LiLA (< 23.5 cm) & Deteksi Dini KEK',
        'Pemeriksaan Tekanan Darah & Buku KIA',
        'Pemberian Tablet Tambah Darah (TTD)',
        'Bimbingan Perlekatan Menyusui & Manajemen ASI',
      ],
      schedule: 'Setiap Tanggal 15 (09.00 - 11.30 WIB)',
      lead: 'Bidan Pembina Puskesmas Pembina',
    },
    {
      id: 3,
      image: '/images/hero_posyandu.jpg',
      category: 'Usia 60+ Tahun',
      title: 'Posyandu Lansia & Skrining PTM',
      subtitle: 'Geriatri Sehat & Produktif',
      description:
        'Pemeriksaan kesehatan terpadu faktor risiko Penyakit Tidak Menular (PTM) bagi para lanjut usia di lingkungan RW 03. Meliputi tensi darah digital, cek gula darah sewaktu (GDS), asam urat, kolesterol, dan senam kebugaran lansia bersama.',
      features: [
        'Pemeriksaan Tekanan Darah & Hipertensi',
        'Tes Laboratorium Sederhana (Gula Darah & Asam Urat)',
        'Senam Jantung & Kebugaran Lansia Bersama',
        'Konsultasi Diet Rendah Garam & Kolesterol',
      ],
      schedule: 'Setiap Tanggal 15 (08.00 - 11.00 WIB)',
      lead: 'Tim Medis Puskesmas & Kader Lansia',
    },
    {
      id: 4,
      image: '/images/galeri_pmt.jpg',
      category: 'Gizi & Nutrisi Terpadu',
      title: 'Pendampingan Menu MBG & PMT',
      subtitle: 'Nutrisi Seimbang Keluarga',
      description:
        'Distribusi makanan bergizi tambahan berbasis protein hewani lokal, panduan Isi Piringku Kemenkes RI, serta pendampingan pola asuh makan anak untuk mewujudkan generasi bebas stunting di RW 03.',
      features: [
        'Menu Tambahan Berbasis Protein Hewani',
        'Formula Rekomendasi Menu MBG Teruji',
        'Pendampingan Pola Makan Balita 2T',
        'Konsultasi Ahli Gizi Binaan Puskesmas',
      ],
      schedule: 'Setiap Tanggal 15 (08.30 - 12.00 WIB)',
      lead: 'Bidan Desa & Ahli Gizi Puskesmas',
    },
  ];

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? serviceCards.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev === serviceCards.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-rose-200 selection:text-rose-900 scroll-smooth">
      {/* ========================================================================= */}
      {/* MAIN NAVBAR (Smart Scroll: Transparent & Hidden on Scroll Down, Resurfaces on Up) */}
      {/* ========================================================================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${
          scrollDirection === 'down' && scrollY > 20
            ? 'bg-transparent border-transparent shadow-none backdrop-blur-none'
            : 'bg-white/95 backdrop-blur-md border-b border-rose-100/90 shadow-2xs'
        }`}
      >
        <div className="w-full pl-4 sm:pl-6 lg:pl-8 pr-2 sm:pr-4 h-20 sm:h-22 flex items-center justify-between">
          {/* Brand Logo - Clicking Goes Directly to Dashboard */}
          <div
            className={`transition-all duration-300 ease-in-out transform ${
              scrollDirection === 'down' && scrollY > 160
                ? 'opacity-0 -translate-y-10 pointer-events-none'
                : 'opacity-100 translate-y-0 pointer-events-auto'
            }`}
          >
            <Link
              href="/dashboard"
              className="flex items-center gap-3.5 group cursor-pointer"
              title="Posyandu Melati RW 03"
            >
              <img
                src="/images/logo-posyandu.png"
                alt="Logo Posyandu Melati"
                className="h-14 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-lg sm:text-xl tracking-wide text-slate-900 group-hover:text-rose-600 transition-colors">
                    POSYANDU <span className="text-rose-600">MELATI</span>
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-sans uppercase tracking-widest text-slate-500 font-bold">
                  Kesehatan Ibu &amp; Anak &bull; RW 03 Sukamaju
                </p>
              </div>
            </Link>
          </div>

          {/* Right Action: Clean Modern Curved Menu Toggle */}
          <div
            className={`flex items-center gap-3 transition-all duration-300 ease-in-out transform ${
              scrollDirection === 'down' && scrollY > 160
                ? 'opacity-0 -translate-y-10 pointer-events-none'
                : 'opacity-100 translate-y-0 pointer-events-auto'
            }`}
          >
            <CurvedMenu />
          </div>
        </div>
      </header>

      {/* Fixed Header Spacer */}
      <div className="h-20 sm:h-22 shrink-0 pointer-events-none" />

      {/* ========================================================================= */}
      {/* 3. HERO SECTION (Sinceri Senior Living Exact Full-Bleed Layout)           */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-white min-h-[500px] lg:min-h-[560px] xl:min-h-[600px] flex items-center border-b border-rose-100">
        {/* Right Full-Bleed Image Background that Blends into Left */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-[62%] xl:w-[58%] h-full overflow-hidden">
          <img
            src="/images/hero_posyandu.jpg"
            alt="Kehangatan Pelayanan Posyandu Melati"
            className="w-full h-full object-cover object-center lg:object-[center_right]"
          />
          {/* Smooth Gradient Overlay: Fades from solid white into transparent on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 sm:via-white/70 to-transparent hidden sm:block" />
          <div className="absolute inset-0 bg-white/85 sm:hidden" />
        </div>

        {/* Faint Concentric / Floral Watermark Pattern on Left Background (Sinceri Signature) */}
        <div className="absolute -left-16 top-1/2 -translate-y-1/2 w-[540px] h-[540px] pointer-events-none opacity-[0.06] text-rose-800 hidden md:block">
          <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" stroke="currentColor">
            <circle cx="100" cy="100" r="90" strokeWidth="2" />
            <circle cx="100" cy="100" r="70" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="50" strokeWidth="1.5" />
            <path d="M20 100 Q 100 20 180 100 Q 100 180 20 100 Z" strokeWidth="2" />
            <path d="M100 20 Q 180 100 100 180 Q 20 100 100 20 Z" strokeWidth="2" />
            <circle cx="65" cy="100" r="22" strokeWidth="1.5" />
            <circle cx="135" cy="100" r="22" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Hero Left Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 w-full">
          <div className="max-w-2xl lg:max-w-xl xl:max-w-2xl space-y-5 sm:space-y-6">
            {/* Sinceri-style Big Warm Serif Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 tracking-tight leading-[1.12]">
              Mari Datang dan Rasakan Kehangatan di Posyandu
            </h1>

            {/* Sinceri-style Bullet Categories Subtitle */}
            <div className="text-sm sm:text-base font-bold text-slate-800 tracking-wide flex items-center gap-2 flex-wrap">
              <span>Balita &amp; Anak</span>
              <span className="text-rose-500 font-bold">&bull;</span>
              <span>Ibu Hamil &amp; Menyusui</span>
              <span className="text-rose-500 font-bold">&bull;</span>
              <span>Lansia Sehat</span>
            </div>

            {/* Sinceri-style Warm Emotional Paragraph */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
              Pelayanan kesehatan keluarga seharusnya terasa ramah, dekat, dan berlandaskan kepedulian yang tulus. Di Posyandu Melati RW 03, setiap layanan kami dirancang melalui dukungan personal, pemantauan gizi terukur standar WHO, serta lingkungan yang nyaman untuk tumbuh kembang buah hati dan kesehatan orang tua. Setiap warga didampingi dengan penuh cinta &mdash; layaknya keluarga sendiri.
            </p>

            {/* Sinceri-style Dual Pill Buttons (Side by Side) */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <a
                href="#jadwal"
                className="px-8 py-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-rose-200 text-center transition-all hover:scale-102 active:scale-98"
              >
                Jadwal Kunjungan Posyandu
              </a>

              <a
                href="https://wa.me/6281278901234?text=Halo%20Bidan%20Siti%20Rahma,%20saya%20warga%20RW%2003%20ingin%20konsultasi%20kesehatan%20keluarga"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-full bg-white hover:bg-rose-50 text-rose-800 font-bold text-xs uppercase tracking-wider border-2 border-rose-300 shadow-2xs text-center transition-colors"
              >
                Konsultasi Bidan Desa
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. OVERLAPPING WIDE BANNER (Selamat Datang)                              */}
      {/* ========================================================================= */}
      <section className="relative -mt-6 z-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-white border border-rose-200 shadow-lg shadow-rose-100/60 p-6 sm:p-7 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Selamat Datang di Posyandu Melati
          </h2>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. WELCOME DESCRIPTION SECTION                                            */}
      {/* ========================================================================= */}
      <section id="tentang" className="py-10 sm:py-14 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
            Bayangkan kehidupan keluarga yang tenang dan bebas dari rasa cemas, di mana setiap fase tumbuh kembang buah hati dipantau dengan penuh kasih sayang, ibu hamil mendapatkan bimbingan nutrisi terbaik, dan para lansia menikmati masa tua yang sehat, aktif, dan bahagia. Pelayanan kesehatan berkualitas dan program gizi berkelanjutan yang Anda impikan kini siap mendampingi keluarga Anda di Posyandu Melati RW 03.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FEATURE SECTION 1: TRUSTED COMMUNITY PARTNER (Sinceri Exact 50/50 Full-Bleed) */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#fdf8f9] border-y border-rose-100 overflow-hidden">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-stretch">
          {/* Left: 50% Full-bleed Image (Touches left screen edge, 0 margin) */}
          <div className="w-full h-[360px] sm:h-[440px] lg:h-auto min-h-[420px] lg:min-h-[520px] relative">
            <img
              src="/images/dok_timbang_balita.jpg"
              alt="Pemantauan Balita di Posyandu Melati"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Right: 50% Spacious Editorial Text Container */}
          <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-14 lg:py-20 space-y-6 text-left">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15]">
              Posyandu Melati adalah Mitra Terpercaya Tumbuh Kembang &amp; Kesehatan Keluarga
            </h2>

            <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed">
              Rangkaian layanan kami dirancang untuk menjawab kebutuhan kesehatan seluruh anggota keluarga di lingkungan RW 03 Sukamaju. Bersama tenaga bidan berlisensi dan kader posyandu yang tulus, Anda selalu memiliki tempat yang ramah dan nyaman untuk berkonsultasi mengenai nutrisi anak, kehamilan, hingga keluhan kesehatan lansia.
            </p>

            <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed">
              Temukan jadwal sesi posyandu terdekat untuk keluarga Anda dan pastikan kehadiran buah hati Anda untuk mendapatkan pemantauan kurva KMS WHO secara cuma-cuma!
            </p>

            <div className="pt-2">
              <a
                href="#jadwal"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-rose-200 transition-all hover:scale-102 active:scale-98"
              >
                Temukan Jadwal Sesi Terdekat
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. 3-CARD OPTIONS CAROUSEL / GRID (Screenshot 4: Independent/Assisted...)  */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 8. 4 PILAR LAYANAN TERPADU (Sticky Stacking Frames - DrDoctor Style)      */}
      {/* ========================================================================= */}
      <section id="layanan-opsi" className="w-full bg-[#fffafb] border-t border-rose-100 pt-16 sm:pt-20 pb-20 sm:pb-28">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="max-w-3xl mb-12 sm:mb-16 space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Fokus Layanan di Setiap Tahapan Hidup
            </h2>

            <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed">
              Mulai dari penimbangan digital berkala untuk memastikan kecukupan nutrisi anak, hingga bimbingan laktasi bagi ibu baru dan skrining penyakit tidak menular bagi lansia—seluruh layanan disesuaikan secara personal saat Anda berkunjung ke Posyandu Melati RW 03.
            </p>
          </div>

          {/* Sticky Stacking Cards Container */}
          <StackingCards
            onSelectService={(item) => {
              const matched = serviceCards.find((c) => c.id === item.id) || serviceCards[0];
              setActiveModalCard(matched);
            }}
          />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. JADWAL PELAYANAN RUTIN & AGENDA (SWAPPED TO TOP AS REQUESTED)          */}
      {/* ========================================================================= */}
      <section id="jadwal" className="py-20 bg-white border-t border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Jadwal Sesi Posyandu Melati RW 03
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Jadwal pelaksanaan posyandu untuk seluruh peserta (Balita, Ibu Hamil, Ibu Menyusui, dan Lansia) diselenggarakan <strong>serentak pada tanggal {scheduleConfig.sessionDate} {scheduleConfig.sessionMonth} {scheduleConfig.sessionYear}</strong> di {scheduleConfig.sessionLocation}. Silakan pilih tanggal pada kalender interaktif untuk melihat frame detail kegiatan terpadu.
            </p>
          </div>

          {/* Interactive Calendar & Unified Activity Frame */}
          <PosyanduCalendar />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. FEATURE SECTION: DECISION GUIDE (NOW POSITIONED BELOW JADWAL)          */}
      {/* ========================================================================= */}
      <section id="sasaran" className="w-full bg-[#fffafb] border-t border-rose-100 overflow-hidden">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-stretch">
          {/* Left: 50% Spacious Editorial Text Container */}
          <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-14 lg:py-20 space-y-6 text-left order-2 lg:order-1">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15]">
              Apakah Posyandu Melati Pilihan Tepat untuk Keluarga Anda?
            </h2>

            <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed">
              Memastikan buah hati tumbuh optimal dan orang tua tercinta tetap sehat adalah keputusan penting bagi setiap keluarga. Anda berhak mendapatkan seluruh informasi dan sarana pendukung terbaik untuk memandu keputusan gizi keluarga.
            </p>

            <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed">
              Di Posyandu Melati, kami percaya bahwa setiap warga berhak melangkah dengan keyakinan penuh. Manfaatkan sarana pelayanan terpadu kami seperti <strong>Kalkulator Status Gizi KMS WHO</strong>, <strong>Rekomendasi Menu Gizi Tambahan PMT</strong>, dan <strong>Buku Panduan KIA</strong> untuk membantu Anda memantau kebutuhan nutrisi keluarga. Bidan dan kader kami hadir mendampingi di setiap langkah!
            </p>

            <div className="pt-2">
              <a
                href="https://wa.me/6281278901234?text=Halo%20Bidan%20Siti,%20saya%20ingin%20berkonsultasi%20seputar%20posyandu%20dan%20gizi%20keluarga"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-rose-200 transition-all hover:scale-102 active:scale-98"
              >
                Mulai Konsultasi Sekarang
              </a>
            </div>
          </div>

          {/* Right: 50% Full-bleed Image (Touches right screen edge, 0 margin) */}
          <div className="w-full h-[360px] sm:h-[440px] lg:h-auto min-h-[420px] lg:min-h-[520px] relative order-1 lg:order-2">
            <img
              src="/images/dok_bumil_checkup.jpg"
              alt="Konseling Personal di Posyandu Melati"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. FASILITAS, LOKASI & KONTAK KADER                                      */}
      {/* ========================================================================= */}
      <section id="kontak" className="py-20 bg-[#fffafb] border-t border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Kunjungi Balai Posyandu Melati
            </h2>
            <p className="text-sm text-slate-600">
              {scheduleConfig.sessionLocation} selalu terbuka bagi seluruh warga. Hubungi Bidan Desa atau Ketua Kader kami untuk pertanyaan seputar posyandu.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
            {/* Left: Detail Info & Kader Directory */}
            <div className="lg:col-span-6 space-y-5">
              <div className="p-6 rounded-3xl bg-white border border-rose-200 shadow-sm space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-slate-900">
                      Alamat Balai Posyandu
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {scheduleConfig.sessionLocation}, {scheduleConfig.address}.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Patokan: Tepat di samping Lapangan Bulutangkis Warga RW 03.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-rose-100 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-slate-900">
                      Jadwal Pelayanan
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      &bull; Posyandu Serentak ({scheduleConfig.targetSummary}): Setiap Tanggal {scheduleConfig.sessionDate} ({scheduleConfig.sessionTime})<br />
                      &bull; Pelaksanaan: {scheduleConfig.sessionLocation} (Seluruh Sasaran Hadir Bersama)<br />
                      &bull; Konsultasi WhatsApp Bidan Desa: Setiap Hari Kerja (08.00 - 16.00 WIB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Staff Directory Cards */}
              <div className="p-6 rounded-3xl bg-white border border-rose-200 shadow-sm space-y-3">
                <h4 className="font-serif text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-rose-600" />
                  <span>Kontak Langsung Petugas Siaga</span>
                </h4>

                {/* Bidan Desa */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/60 border border-rose-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🩺</span>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Bdn. Siti Rahma, S.Tr.Keb</div>
                      <div className="text-[11px] text-rose-700">Bidan Pembina Wilayah RW 03</div>
                    </div>
                  </div>
                  <a
                    href="https://wa.me/6281278901234?text=Halo%20Bidan%20Siti,%20saya%20warga%20RW%2003%20ingin%20konsultasi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors"
                  >
                    Chat WA
                  </a>
                </div>

                {/* Ketua Kader */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-pink-50/60 border border-pink-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🌸</span>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Ibu Hj. Aminah</div>
                      <div className="text-[11px] text-pink-700">Ketua Kader Posyandu Melati</div>
                    </div>
                  </div>
                  <a
                    href="https://wa.me/6281367895678?text=Halo%20Ibu%20Aminah,%20saya%20ingin%20bertanya%20seputar%20posyandu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors"
                  >
                    Chat WA
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Map Embed */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-white border border-rose-200 p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="font-serif font-bold text-xs text-slate-900">Denah Balai RW 03 Sukamaju</span>
                  </div>
                  <a
                    href="https://maps.google.com/?q=Balai+Pertemuan+RW+03+Sukamaju"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-rose-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="w-full h-80 rounded-2xl bg-rose-50 overflow-hidden relative border border-rose-100">
                  <iframe
                    title="Peta Lokasi Posyandu Melati"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.498457639535!2d104.761000!3d-2.930000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMsKwNTUnNDguMCJTIDEwNMKwNDUnMzkuNiJF!5e0!3m2!1sid!2sid!4v1680000000000!5m2!1sid!2sid"
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="absolute bottom-3 left-3 bg-white/95 px-3 py-1.5 rounded-xl border border-rose-200 text-[11px] font-bold text-slate-800 shadow-2xs flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>Balai Warga RW 03 Sukamaju</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 px-2 leading-relaxed">
                  Akses jalan mudah dijangkau kendaraan roda dua &amp; empat warga. Area parkir luas tersedia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11.5 GALERI DOKUMENTASI KEGIATAN (Tilted Grid Hero 3D Curved Row)        */}
      {/* ========================================================================= */}
      <section id="galeri" className="py-16 sm:py-20 bg-white border-t border-rose-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center space-y-3">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Dokumentasi &amp; Galeri Pelayanan
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Potret kehangatan dan dedikasi tim bidan bersama para kader dalam mendampingi tumbuh kembang buah hati, ibu hamil, serta kebugaran lansia di lingkungan RW 03 Sukamaju.
          </p>
        </div>

        <TiltedGridHero
          images={galleryImages}
          speed={4}
          tileHeight={30}
          aspectRatio={16 / 9}
          gap={6}
          curve={75}
          fade={14}
          className="h-[460px] sm:h-[520px] lg:h-[560px] w-full bg-gradient-to-b from-rose-50/25 via-white to-white"
        >
          <div className="relative z-10 flex h-full flex-col items-center justify-between py-10 text-center pointer-events-none">
            <div className="px-6 space-y-1 pointer-events-auto">
              <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600">
                Dokumentasi Terpadu Posyandu Melati
              </span>
            </div>
            <p className="max-w-md text-balance px-6 text-xs text-slate-400 font-medium pointer-events-auto">
              Aliran dokumentasi penimbangan balita, bimbingan ibu hamil, senam lansia, dan menu gizi PMT.
            </p>
          </div>
        </TiltedGridHero>
      </section>

      {/* ========================================================================= */}
      {/* MODAL LIGHTBOX DETAIL 3-CARD LAYANAN                                      */}
      {/* ========================================================================= */}
      {activeModalCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="relative aspect-[16/9] bg-rose-50">
              <img
                src={activeModalCard.image}
                alt={activeModalCard.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveModalCard(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 flex items-center justify-center transition-colors"
                aria-label="Tutup Detail"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
                  {activeModalCard.category}
                </p>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  {activeModalCard.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-2">
                  {activeModalCard.description}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#fff8fa] border border-rose-100 space-y-2">
                <div className="text-xs font-bold text-slate-900">Protokol Pelayanan Unggulan:</div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {activeModalCard.features.map((feat: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Jadwal Pelayanan</span>
                  <span className="font-bold text-slate-800">{activeModalCard.schedule}</span>
                </div>
                <button
                  onClick={() => setActiveModalCard(null)}
                  className="px-5 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 12. PHOENIX CHILDREN'S EXACT REPLICA FOOTER (Curved Arch Wave Transition)  */}
      {/* ========================================================================= */}
      <footer className="relative bg-white text-slate-700 text-xs overflow-hidden">
        {/* Soft Pastel Pink Curved Wave Top Divider (Pink Theme) */}
        <div className="w-full bg-[#fff0f3] overflow-hidden leading-none select-none">
          <svg
            viewBox="0 0 1440 90"
            className="w-full h-12 sm:h-16 lg:h-20 text-white fill-current block"
            preserveAspectRatio="none"
          >
            <path d="M0,50 C360,95 720,10 1140,40 C1280,50 1380,25 1440,30 L1440,90 L0,90 Z" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8 sm:pt-10 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Section: Logo + 2 Columns Links + Social Media Icons */}
            <div className="lg:col-span-8 space-y-6">
              {/* Brand Header with Real Posyandu Logo */}
              <div className="flex items-center gap-3.5">
                <img
                  src="/images/logo-posyandu.png"
                  alt="Logo Posyandu Melati"
                  className="h-14 sm:h-16 w-auto object-contain shrink-0 drop-shadow-sm"
                />
                <div>
                  <h3 className="font-serif font-black text-2xl sm:text-3xl text-slate-900 tracking-tight leading-none">
                    Posyandu <span className="text-rose-600">Melati</span>
                  </h3>
                  <p className="text-[11px] font-sans text-slate-500 font-semibold tracking-wider uppercase mt-1">
                    Kesehatan Ibu &amp; Anak &bull; RW 03 Sukamaju
                  </p>
                </div>
              </div>

              {/* 2 Side-by-Side Clean Links Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 pt-2 text-xs font-semibold text-slate-600">
                <div className="space-y-2.5">
                  <div>
                    <a href="#kontak" className="hover:text-rose-600 transition-colors">
                      Contact Us (Hubungi Kami)
                    </a>
                  </div>
                  <div>
                    <a href="tel:081278901234" className="hover:text-rose-600 transition-colors text-slate-900 font-bold">
                      Scheduling &amp; Hotline: (0812) 7890-1234
                    </a>
                  </div>
                  <div>
                    <a href="#kontak" className="hover:text-rose-600 transition-colors">
                      Phone Directory (Bidan &amp; Kader)
                    </a>
                  </div>
                  <div>
                    <a href="#tentang" className="hover:text-rose-600 transition-colors">
                      About Us (Tentang Posyandu)
                    </a>
                  </div>
                  <div>
                    <a href="#jadwal" className="hover:text-rose-600 transition-colors">
                      Manage Health Preference
                    </a>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <a href="#layanan-opsi" className="hover:text-rose-600 transition-colors">
                      Pemantauan Balita &amp; KMS WHO
                    </a>
                  </div>
                  <div>
                    <a href="#layanan-opsi" className="hover:text-rose-600 transition-colors">
                      Ibu Hamil &amp; Konseling Laktasi
                    </a>
                  </div>
                  <div>
                    <a href="#layanan-opsi" className="hover:text-rose-600 transition-colors">
                      Posyandu Lansia Sehat
                    </a>
                  </div>
                  <div>
                    <a href="#layanan-opsi" className="hover:text-rose-600 transition-colors">
                      Menu Gizi Tambahan PMT &amp; MBG
                    </a>
                  </div>
                </div>
              </div>

              {/* 5 Dark Squircle Social Media Buttons */}
              <div className="flex items-center gap-2.5 pt-3">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook Posyandu Melati"
                  className="w-9 h-9 rounded-lg bg-[#182a3a] hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-2xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7v-3h3V9.5C10 6.57 11.76 5 14.43 5c1.28 0 2.62.23 2.62.23v2.88h-1.48c-1.45 0-1.9.9-1.9 1.83V12h3.25l-.52 3H13.67v6.8c4.56-.93 8-4.96 8-9.8z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Posyandu Melati"
                  className="w-9 h-9 rounded-lg bg-[#182a3a] hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-2xs"
                >
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube Posyandu Melati"
                  className="w-9 h-9 rounded-lg bg-[#182a3a] hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-2xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M21.58 7.19a2.5 2.5 0 0 0-1.76-1.77C18.26 5 12 5 12 5s-6.26 0-7.82.42A2.5 2.5 0 0 0 2.42 7.19C2 8.76 2 12 2 12s0 3.24.42 4.81a2.5 2.5 0 0 0 1.76 1.77C5.74 19 12 19 12 19s6.26 0 7.82-.42a2.5 2.5 0 0 0 1.76-1.77C22 15.24 22 12 22 12s0-3.24-.42-4.81zM10 15V9l5.2 3-5.2 3z"/>
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Posyandu Melati"
                  className="w-9 h-9 rounded-lg bg-[#182a3a] hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-2xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 0 0 0-3.06 1.53 1.53 0 0 0 0 3.06m1.39 9.74v-8.37H5.07v8.37h2.78z"/>
                  </svg>
                </a>

                {/* X (Twitter) */}
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X Posyandu Melati"
                  className="w-9 h-9 rounded-lg bg-[#182a3a] hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Right Section: Whimsical Southwestern Landscape (Smiling Sun, Clouds, Cacti & Hills) */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center space-y-4">
              <div className="relative w-64 h-36 pointer-events-none select-none">
                <svg viewBox="0 0 240 140" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Fluffy Blue Cloud 1 */}
                  <path
                    d="M185 30 A12 12 0 0 1 205 24 A15 15 0 0 1 228 35 A10 10 0 0 1 220 50 L180 50 A10 10 0 0 1 185 30 Z"
                    fill="#67b8e3"
                    opacity="0.9"
                  />
                  {/* Fluffy Blue Cloud 2 */}
                  <path
                    d="M135 48 A10 10 0 0 1 152 42 A12 12 0 0 1 170 52 A9 9 0 0 1 164 64 L130 64 A8 8 0 0 1 135 48 Z"
                    fill="#7bc5eb"
                    opacity="0.85"
                  />

                  {/* Smiling Yellow Sun with Rays */}
                  <g transform="translate(210, 50)">
                    <line x1="0" y1="-28" x2="0" y2="-38" stroke="#f6a93b" strokeWidth="4" strokeLinecap="round" />
                    <line x1="20" y1="-20" x2="28" y2="-28" stroke="#f6a93b" strokeWidth="4" strokeLinecap="round" />
                    <line x1="28" y1="0" x2="38" y2="0" stroke="#f6a93b" strokeWidth="4" strokeLinecap="round" />
                    <line x1="20" y1="20" x2="28" y2="28" stroke="#f6a93b" strokeWidth="4" strokeLinecap="round" />
                    <line x1="-20" y1="-20" x2="-28" y2="-28" stroke="#f6a93b" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="0" cy="0" r="22" fill="#fed049" stroke="#f6a93b" strokeWidth="2.5" />
                    <circle cx="-6" cy="-4" r="2.5" fill="#5c3c10" />
                    <circle cx="6" cy="-4" r="2.5" fill="#5c3c10" />
                    <path d="M-7 4 Q0 12 7 4" stroke="#5c3c10" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <circle cx="-10" cy="3" r="2" fill="#f87171" opacity="0.8" />
                    <circle cx="10" cy="3" r="2" fill="#f87171" opacity="0.8" />
                  </g>

                  {/* Gentle Rolling Hill in Soft Olive Green */}
                  <path
                    d="M0 135 Q100 125 180 132 Q210 135 240 130 L240 140 L0 140 Z"
                    fill="#b1cf7c"
                  />

                  {/* Saguaro Cactus Silhouette */}
                  <g transform="translate(192, 70)" stroke="#8cb861" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none">
                    <path d="M20 65 L20 15 A8 8 0 0 1 28 15 L28 65" />
                    <path d="M20 40 L6 40 L6 25" />
                    <path d="M28 34 L40 34 L40 18" />
                  </g>

                  {/* Smaller Cactus */}
                  <g transform="translate(148, 92)" stroke="#98c36f" strokeWidth="6" strokeLinecap="round" fill="none">
                    <path d="M12 40 L12 12" />
                    <path d="M12 26 L2 26 L2 16" />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Copyright Bottom Bar & CHAT WITH US Button */}
          <div className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <p>
              &copy; 2026 Posyandu Melati RW 03. All Rights Reserved. | <a href="#tentang" className="hover:underline">Standar Pelayanan &amp; Kebijakan Privasi</a>
            </p>

            {/* Warm Golden Amber "CHAT WITH US" Button (Exact Phoenix Children's Style) */}
            <a
              href="https://wa.me/6281278901234?text=Halo%20Bidan%20Siti%20Rahma,%20saya%20warga%20RW%2003%20ingin%20berkonsultasi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#f4b63f] hover:bg-[#e6a832] text-slate-900 font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <MessageCircle className="w-4 h-4 fill-slate-900 stroke-none" />
              <span>Chat With Us</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
