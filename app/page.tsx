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
  Building2,
  FileText,
  Sparkles,
  Check,
  Info,
  Search,
  Award,
  ChevronDown,
  Layers,
  Database,
  Cpu,
  BarChart3,
  UserCheck,
  Send,
  Lock,
  Mail,
  HelpCircle,
} from 'lucide-react';
import CurvedMenu from '@/components/ui/curved-menu';
import TiltedGridHero from '@/components/ui/tilted-grid-hero';
import StackingCards, { ServiceStackItem } from '@/components/ui/stacking-cards';
import {
  LandingStore,
  DEFAULT_GALLERY_PHOTOS,
} from '@/lib/landing-store';
import { PosyanduStore } from '@/lib/supabase';
import { PosyanduRegistrationRequest } from '@/types/posyandu';
import { toast } from '@/components/ui/custom-toast';
import { Language, TRANSLATIONS } from '@/lib/translations';

const IndonesiaFlag = () => (
  <svg className="w-4 h-2.5 rounded-2xs shadow-2xs overflow-hidden shrink-0 border border-slate-300/40" viewBox="0 0 18 12" fill="none">
    <rect width="18" height="6" fill="#E11D48" />
    <rect y="6" width="18" height="6" fill="#FFFFFF" />
  </svg>
);

const UkFlag = () => (
  <svg className="w-4 h-2.5 rounded-2xs shadow-2xs overflow-hidden shrink-0 border border-slate-300/40" viewBox="0 0 18 12" fill="none">
    <rect width="18" height="12" fill="#012169" />
    <path d="M0 0L18 12M18 0L0 12" stroke="#FFFFFF" strokeWidth="2.4" />
    <path d="M0 0L18 12M18 0L0 12" stroke="#C8102E" strokeWidth="1.2" />
    <path d="M9 0V12M0 6H18" stroke="#FFFFFF" strokeWidth="4" />
    <path d="M9 0V12M0 6H18" stroke="#C8102E" strokeWidth="2.4" />
  </svg>
);

export default function LandingPage() {
  const [activeModalCard, setActiveModalCard] = useState<any | null>(null);

  // Bahasa (ID / EN)
  const [lang, setLang] = useState<Language>('id');
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('posyandugo_lang') as Language | null;
      if (saved === 'id' || saved === 'en') {
        setLang(saved);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem('posyandugo_lang', newLang);
    } catch (e) {
      // ignore
    }
  };

  // Koleksi Foto Dokumentasi Kegiatan
  const [galleryImages, setGalleryImages] = useState(DEFAULT_GALLERY_PHOTOS);

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
    setGalleryImages(LandingStore.getGalleryImages());
  }, []);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const saasNavItems = [
    { heading: lang === 'id' ? 'Beranda' : 'Home', href: '/', subheading: 'Portal SaaS PosyanduGo' },
    { heading: t.nav.howItWorks, href: '#cara-kerja', subheading: lang === 'id' ? 'Alur Operasional & Isolasi Data' : 'Operational Workflow & Data Isolation' },
    { heading: t.nav.features, href: '#fitur-saas', subheading: 'e-KMS WHO & SPK MBG SAW' },
    { heading: t.nav.documentation, href: '#galeri', subheading: lang === 'id' ? 'Galeri Kegiatan Posyandu' : 'Healthcare Activity Gallery' },
    { heading: t.nav.faq, href: '#faq', subheading: lang === 'id' ? 'Pusat Informasi & Bantuan' : 'Information & Support' },
    { heading: lang === 'id' ? 'Daftar Mandiri' : 'Self-Register', href: '/daftar', subheading: lang === 'id' ? 'Formulir Lengkap 3-Tahap' : 'Comprehensive 3-Stage Form' },
    { heading: t.nav.login, href: '/login', subheading: 'Super Admin & Admin Posyandu' },
  ];

  return (
    <div className="min-h-screen bg-[#faf6f6] text-slate-800 font-sans selection:bg-[#80000f]/20 selection:text-[#80000f] scroll-smooth">
      {/* ========================================================================= */}
      {/* 1. MAIN NAVBAR (Centered Desktop Floating Bar + Smart Scroll Direction)     */}
      {/* ========================================================================= */}
      <header
        className={`fixed top-4 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-4 flex justify-center pointer-events-none ${
          scrollDirection === 'down' && scrollY > 60
            ? '-translate-y-28 opacity-0'
            : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="w-full max-w-5xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md shadow-slate-200/40 rounded-full px-5 sm:px-7 py-2 sm:py-2.5 flex items-center justify-between pointer-events-auto">
          {/* Brand Logo - PosyanduGo (Sleek & Pas Ukurannya) */}
          <Link
            href="/"
            className="flex items-center gap-2 group cursor-pointer"
            title="PosyanduGo — Platform SaaS Multi-Tenant"
          >
            <img
              src="/images/logo-posyandugo-maroon.png"
              alt="Logo PosyanduGo"
              className="h-6 sm:h-7 md:h-7.5 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop Center Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#cara-kerja" className="hover:text-[#80000f] transition-colors">{t.nav.howItWorks}</a>
            <a href="#fitur-saas" className="hover:text-[#80000f] transition-colors">{t.nav.features}</a>
            <a href="#galeri" className="hover:text-[#80000f] transition-colors">{t.nav.documentation}</a>
            <a href="#faq" className="hover:text-[#80000f] transition-colors">{t.nav.faq}</a>
          </nav>

          {/* Right Action: Language Switcher Capsule & Maroon Login Button */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Language Capsule Switcher (ID / EN) - Maroon Active State */}
            <div className="flex items-center rounded-full bg-slate-100/95 border border-slate-300/80 p-0.5 select-none shadow-2xs">
              <button
                type="button"
                onClick={() => handleLangChange('id')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  lang === 'id'
                    ? 'bg-[#80000f] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Bahasa Indonesia"
              >
                <IndonesiaFlag />
                <span>ID</span>
              </button>
              <button
                type="button"
                onClick={() => handleLangChange('en')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-[#80000f] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="English"
              >
                <UkFlag />
                <span>EN</span>
              </button>
            </div>

            {/* Login Button (Maroon #80000f) */}
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-[#80000f] hover:bg-[#9c0013] text-white font-bold text-xs shadow-md shadow-rose-950/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <span>{t.nav.login}</span>
              <ArrowRight className="w-3.5 h-3.5 text-rose-200" />
            </Link>
            <div className="md:hidden">
              <CurvedMenu navItems={saasNavItems} />
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION (Noxus.ai Inspired Minimalist SaaS Hero with Dot Clusters) */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-[#faf6f6] pt-28 sm:pt-36 pb-16 sm:pb-22">
        {/* Subtle Top-Center Semi-Circle Maroon Glow (Menyelimuti Latar Belakang Navbar ke Puncak Layar) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] lg:w-[1300px] h-[360px] sm:h-[460px] pointer-events-none rounded-b-[100%] bg-gradient-to-b from-[#80000f]/[0.08] via-[#80000f]/[0.03] to-transparent blur-2xl" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_45%_at_50%_0%,rgba(128,0,15,0.06),rgba(250,246,246,0))]" />

        {/* Center Typography & CTAs (Z-20) */}
        <div className="relative z-20 max-w-2xl mx-auto px-4 sm:px-6 text-center space-y-4 mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-extrabold text-[#18181B] tracking-tight leading-[1.12]">
            {t.hero.titleLine1} <br className="hidden sm:inline" />
            <span className="text-[#80000f] font-black">
              {t.hero.titleHighlight}
            </span>
          </h1>

          <p className="text-zinc-500 text-xs sm:text-sm md:text-[15px] leading-relaxed max-w-lg mx-auto">
            {t.hero.subtitle}
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/daftar"
              className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 rounded-full bg-[#80000f] hover:bg-[#9c0013] text-white font-medium text-xs sm:text-sm shadow-md shadow-rose-950/20 transition-all hover:scale-102 active:scale-98 group cursor-pointer"
            >
              <span>{t.hero.ctaPrimary}</span>
              <span className="w-5 h-5 rounded-full bg-[#60000b] flex items-center justify-center text-[10px] text-white font-bold group-hover:translate-x-0.5 transition-transform">
                &gt;
              </span>
            </Link>
            <Link
              href="/login"
              className="px-6 sm:px-7 py-3 rounded-full bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-xs sm:text-sm border border-zinc-200 shadow-2xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              {t.hero.ctaSecondary}
            </Link>
          </div>
        </div>

        {/* Floating Collage Stage (Cascading Gracefully Below CTAs) */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          {/* Decorative Dot Matrix Clusters (soft-maroon rounded tiles) */}
          {/* Cluster 1: Middle-Right (Behind the Menu MBG badge & Top-Right card) */}
          <div className="hidden lg:grid absolute right-[23%] xl:right-[26%] top-[110px] z-0 grid-cols-3 gap-2.5 opacity-65 pointer-events-none select-none">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="w-10 h-10 xl:w-11 xl:h-11 rounded-2xl bg-[#80000f]/[0.08]" />
            ))}
          </div>

          {/* Cluster 2: Far-Right Edge */}
          <div className="hidden lg:grid absolute -right-2 top-4 z-0 grid-cols-2 gap-2 opacity-35 pointer-events-none select-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-9 h-9 xl:w-10 xl:h-10 rounded-2xl bg-[#80000f]/[0.08]" />
            ))}
          </div>

          {/* Cluster 3: Bottom Left / Behind Sofa Card */}
          <div className="hidden lg:grid absolute left-[12%] bottom-6 z-0 grid-cols-3 gap-2 opacity-40 pointer-events-none select-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-9 h-9 xl:w-10 xl:h-10 rounded-2xl bg-[#80000f]/[0.08]" />
            ))}
          </div>

          {/* Desktop & Tablet Asymmetrical Collage */}
          <div className="hidden lg:block relative h-[560px] xl:h-[620px] w-full">
            {/* 1. Top-Left: Woman portrait card */}
            <div className="absolute top-2 left-4 xl:left-8 w-44 xl:w-52 h-44 xl:h-52 rounded-2xl overflow-hidden shadow-md border-2 border-white ring-1 ring-zinc-200/50 z-10 group">
              <img
                src="/images/dok_bumil_checkup.jpg"
                alt="Pemeriksaan Ibu Hamil"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Badge 1: Credit Statement Handled -> e-KMS Balita Tervalidasi */}
            {/* Overlaps bottom-right of Top-Left card & top-left of Center-Left wide card */}
            <div className="absolute top-[145px] left-14 xl:left-20 z-30 bg-white/95 backdrop-blur-md border border-zinc-200/80 shadow-md rounded-full px-4 py-2 flex items-center gap-2 text-xs font-semibold text-zinc-800 whitespace-nowrap">
              <MessageCircle className="w-3.5 h-3.5 text-zinc-600" />
              <span>{t.hero.badge1}</span>
            </div>

            {/* 2. Center-Left Wide Card (Man on yellow sofa with laptop -> Penimbangan Balita) */}
            <div className="absolute top-[170px] left-28 xl:left-36 w-[340px] xl:w-[410px] h-48 xl:h-56 rounded-2xl overflow-hidden shadow-lg border-2 border-white ring-1 ring-zinc-200/50 z-10 group">
              <img
                src="/images/dok_timbang_balita.jpg"
                alt="Penimbangan Balita Serentak"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* 3. Bottom-Left: Vertical portrait card (Man in yellow sweater on phone -> Imunisasi Balita) */}
            <div className="absolute top-[290px] left-4 xl:left-8 w-44 xl:w-52 h-64 xl:h-72 rounded-2xl overflow-hidden shadow-md border-2 border-white ring-1 ring-zinc-200/50 z-10 group">
              <img
                src="/images/galeri_imunisasi.jpg"
                alt="Pelayanan Imunisasi Balita"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* 4. Top-Right Card (Woman at desk -> Konseling Gizi) */}
            <div className="absolute top-2 right-4 xl:right-8 w-56 xl:w-64 h-48 xl:h-54 rounded-2xl overflow-hidden shadow-md border-2 border-white ring-1 ring-zinc-200/50 z-10 group">
              <img
                src="/images/konseling_pilihan_tepat.jpg"
                alt="Konseling Gizi Balita & Ibu"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Badge 2: Flight Upgraded 📅 -> Menu MBG Terhitung (SAW) */}
            <div className="absolute top-[125px] right-[24%] xl:right-[27%] z-30 bg-white/95 backdrop-blur-md border border-zinc-200/80 shadow-md rounded-full px-4 py-2 flex items-center gap-2 text-xs font-semibold text-zinc-800 whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-zinc-600" />
              <span>{t.hero.badge2}</span>
            </div>

            {/* 5. Bottom-Center: Small vertical room shot (Woman at table -> PMT Balita) */}
            <div className="absolute top-[260px] right-[35%] xl:right-[38%] w-32 xl:w-36 h-48 xl:h-56 rounded-2xl overflow-hidden shadow-md border-2 border-white ring-1 ring-zinc-200/50 z-10 group">
              <img
                src="/images/galeri_pmt.jpg"
                alt="Distribusi Makanan Bergizi"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Badge 3: Insurance Documents Processed 📄 -> KOP Surat Laporan Otomatis */}
            <div className="absolute top-[370px] right-[37%] xl:right-[41%] z-30 bg-white/95 backdrop-blur-md border border-zinc-200/80 shadow-md rounded-full px-4 py-2 flex items-center gap-2 text-xs font-semibold text-zinc-800 whitespace-nowrap">
              <FileText className="w-3.5 h-3.5 text-zinc-600" />
              <span>{t.hero.badge3}</span>
            </div>

            {/* 6. Bottom-Right: Wide landscape card (Woman on laptop -> Pemeriksaan Kesehatan Lansia) */}
            <div className="absolute top-[210px] right-4 xl:right-8 w-72 xl:w-80 h-48 xl:h-56 rounded-2xl overflow-hidden shadow-lg border-2 border-white ring-1 ring-zinc-200/50 z-10 group">
              <img
                src="/images/galeri_lansia.jpg"
                alt="Pemeriksaan Kesehatan Lansia"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Mobile & Tablet Fallback (Neat 2-Column Responsive Grid) */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-white aspect-[4/3]">
              <img src="/images/dok_timbang_balita.jpg" alt="Penimbangan Balita" className="w-full h-full object-cover" />
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md border border-zinc-100 shadow-sm rounded-full px-3 py-1 flex items-center gap-1.5 text-[11px] font-semibold text-zinc-800">
                <MessageCircle className="w-3.5 h-3.5 text-zinc-600" />
                <span>{t.hero.badge1}</span>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-white aspect-[4/3]">
              <img src="/images/konseling_pilihan_tepat.jpg" alt="Konseling Gizi" className="w-full h-full object-cover" />
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md border border-zinc-100 shadow-sm rounded-full px-3 py-1 flex items-center gap-1.5 text-[11px] font-semibold text-zinc-800">
                <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                <span>{t.hero.badge2}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. VALUE PROPOSITION STAT STRIP                                           */}
      {/* ========================================================================= */}
      <section className="relative -mt-8 sm:-mt-10 z-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-white border border-[#80000f]/15 shadow-xl shadow-stone-300/40 p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
            <div className="pt-2 sm:pt-0">
              <div className="font-serif text-3xl font-black text-[#80000f]">{t.stats.stat1.number}</div>
              <div className="text-xs font-bold text-slate-900 mt-1">{t.stats.stat1.title}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{t.stats.stat1.desc}</div>
            </div>

            <div className="pt-4 sm:pt-0">
              <div className="font-serif text-3xl font-black text-slate-900">{t.stats.stat2.number}</div>
              <div className="text-xs font-bold text-slate-900 mt-1">{t.stats.stat2.title}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{t.stats.stat2.desc}</div>
            </div>

            <div className="pt-4 sm:pt-0">
              <div className="font-serif text-3xl font-black text-[#80000f]">{t.stats.stat3.number}</div>
              <div className="text-xs font-bold text-slate-900 mt-1">{t.stats.stat3.title}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{t.stats.stat3.desc}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CARA KERJA SISTEM (Alur Operasional & Isolasi Data)                    */}
      {/* ========================================================================= */}
      <section id="cara-kerja" className="pt-14 sm:pt-18 pb-20 sm:pb-24 bg-[#faf6f6] border-b border-[#80000f]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              {t.howItWorks.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {t.howItWorks.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Card 1: Admin Posyandu (Unit Operasional) */}
            <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#80000f]/15 hover:border-[#80000f]/40 shadow-sm hover:shadow-xl hover:shadow-[#80000f]/10 hover:-translate-y-1 transition-all duration-300 space-y-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-[#80000f]/5 group-hover:bg-[#80000f]/10 border border-[#80000f]/15 text-[#80000f] flex items-center justify-center transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#80000f]">{t.howItWorks.card1.tag}</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{t.howItWorks.card1.title}</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t.howItWorks.card1.desc}
              </p>
              <ul className="space-y-2.5 text-xs text-slate-600 pt-3 border-t border-[#80000f]/10">
                {t.howItWorks.card1.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#80000f] shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 2: Data Scoping & Multi-Tenancy */}
            <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#80000f]/15 hover:border-[#80000f]/40 shadow-sm hover:shadow-xl hover:shadow-[#80000f]/10 hover:-translate-y-1 transition-all duration-300 space-y-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-[#80000f]/5 group-hover:bg-[#80000f]/10 border border-[#80000f]/15 text-[#80000f] flex items-center justify-center transition-colors">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#80000f]">{t.howItWorks.card2.tag}</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{t.howItWorks.card2.title}</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t.howItWorks.card2.desc}
              </p>
              <ul className="space-y-2.5 text-xs text-slate-600 pt-3 border-t border-[#80000f]/10">
                {t.howItWorks.card2.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#80000f] shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FITUR UNGGULAN (Sticky Stacking Cards - Latar Maroon & Kartu Putih)      */}
      {/* ========================================================================= */}
      <section id="fitur-saas" className="relative w-full bg-[#80000f] text-white border-b border-[#60000b] pt-20 sm:pt-24 pb-20 sm:pb-28">
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_75%_50%_at_50%_0%,rgba(255,255,255,0.08),transparent)]" />

        <div className="relative z-10 max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12 sm:mb-16 space-y-4">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              {t.features.title}
            </h2>
            <p className="text-rose-100/90 text-sm sm:text-base lg:text-lg leading-relaxed">
              {t.features.desc}
            </p>
          </div>

          <StackingCards
            services={t.features.items as ServiceStackItem[]}
            onSelectService={(item) => setActiveModalCard(item)}
          />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. GALERI DOKUMENTASI KEGIATAN (Tilted Grid Hero 3D)                      */}
      {/* ========================================================================= */}
      <section id="galeri" className="py-16 sm:py-20 bg-white border-b border-stone-200/80 overflow-hidden scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center space-y-3">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            {t.gallery.title}
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t.gallery.desc}
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
          className="h-[460px] sm:h-[520px] lg:h-[560px] w-full bg-gradient-to-b from-stone-50/40 via-white to-white"
        >
          <div className="relative z-10 flex h-full flex-col items-center justify-between py-10 text-center pointer-events-none">
            <div className="px-6 space-y-1 pointer-events-auto">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#80000f]">
                Ekosistem Posyandu Terpadu
              </span>
            </div>
            <p className="max-w-md text-balance px-6 text-xs text-slate-400 font-medium pointer-events-auto">
              Pencegahan stunting, pemantauan kurva KMS WHO, dan penyaluran menu gizi tambahan secara transparan.
            </p>
          </div>
        </TiltedGridHero>
      </section>

      {/* ========================================================================= */}
      {/* 7. PERTANYAAN UMUM (FAQ) SEPUTAR POSYANDUGO (Latar Maroon)                 */}
      {/* ========================================================================= */}
      <section id="faq" className="relative py-20 sm:py-24 bg-[#80000f] text-white border-b-0 scroll-mt-20 overflow-hidden">
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_75%_50%_at_50%_0%,rgba(255,255,255,0.08),transparent)]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {t.faq.title}
            </h2>
            <p className="text-sm text-rose-100/90 leading-relaxed">
              {t.faq.desc}
            </p>
          </div>

          {/* FAQ Accordion List (Kartu Putih Elegan di atas Kanvas Maroon) */}
          <div className="space-y-3.5">
            {t.faq.items.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-stone-200/90 shadow-md overflow-hidden transition-all text-slate-800"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/80 transition-colors"
                  >
                    <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {item.question}
                    </span>
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-200 ${
                        isOpen
                          ? 'bg-[#80000f] text-white border-[#80000f] rotate-180'
                          : 'bg-stone-100 text-slate-600 border-stone-200'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-stone-100 bg-[#fffdfd]">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. MODAL LIGHTBOX DETAIL FITUR                                            */}
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
                  Modul #{activeModalCard.number} &bull; {activeModalCard.title}
                </p>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  {activeModalCard.headline}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-2">
                  {activeModalCard.description}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#fff8fa] border border-rose-100 space-y-2">
                <div className="text-xs font-bold text-slate-900">Keunggulan Modul:</div>
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
                  <span className="text-slate-400 block text-[11px]">Penanggung Jawab</span>
                  <span className="font-bold text-slate-800">{activeModalCard.lead}</span>
                </div>
                <button
                  onClick={() => setActiveModalCard(null)}
                  className="px-5 py-2.5 rounded-full bg-[#80000f] hover:bg-[#9c0013] text-white font-bold text-xs shadow-md shadow-rose-950/20 transition-colors"
                >
                  {lang === 'id' ? 'Tutup' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. FOOTER SAAS PLATFORM                                                   */}
      {/* ========================================================================= */}
      <footer className="relative bg-white text-slate-700 text-xs overflow-hidden">
        {/* Maroon Wave Transition Divider between Gallery and Footer */}
        <div className="w-full bg-[#80000f] overflow-hidden leading-none select-none">
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
            {/* Left Section: Logo + 3 Columns Links */}
            <div className="lg:col-span-8 space-y-6">
              {/* Brand Header with Real Posyandu Logo (Tanpa Bingkai & Transparan) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <img
                  src="/images/logo-posyandugo-maroon.png"
                  alt="Logo PosyanduGo"
                  className="h-7 sm:h-8 w-auto object-contain"
                />
                <span className="text-slate-400 hidden sm:inline">|</span>
                <p className="text-[11px] font-sans text-slate-500 font-semibold tracking-wider uppercase">
                  {t.footer.tagline}
                </p>
              </div>

              {/* 3 Clean Columns: Tentang, Jelajahi, Layanan */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 pt-2 text-xs text-slate-600">
                {/* Kolom 1: Penjelasan Tentang PosyanduGo (Sejajar Rata Kiri-Kanan & Luas Proporsional) */}
                <div className="sm:col-span-5 space-y-2.5">
                  <div className="font-bold text-slate-900 text-xs uppercase tracking-wider text-[#80000f]">
                    {t.footer.aboutTitle}
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed text-justify">
                    {t.footer.aboutDesc}
                  </p>
                </div>

                {/* Kolom 2: Jelajahi */}
                <div className="sm:col-span-3 space-y-2.5 font-semibold">
                  <div className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-700">
                    {t.footer.exploreTitle}
                  </div>
                  <div>
                    <Link href="/" className="hover:text-[#80000f] transition-colors">
                      {t.footer.links.home}
                    </Link>
                  </div>
                  <div>
                    <a href="#cara-kerja" className="hover:text-[#80000f] transition-colors">
                      {t.footer.links.howItWorks}
                    </a>
                  </div>
                  <div>
                    <a href="#fitur-saas" className="hover:text-[#80000f] transition-colors">
                      {t.footer.links.features}
                    </a>
                  </div>
                  <div>
                    <a href="#galeri" className="hover:text-[#80000f] transition-colors">
                      {t.footer.links.documentation}
                    </a>
                  </div>
                  <div>
                    <a href="#faq" className="hover:text-[#80000f] transition-colors">
                      {t.footer.links.faq}
                    </a>
                  </div>
                </div>

                {/* Kolom 3: Layanan */}
                <div className="sm:col-span-4 space-y-2.5 font-semibold">
                  <div className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-700">
                    {t.footer.servicesTitle}
                  </div>
                  <div>
                    <a href="#fitur-saas" className="hover:text-[#80000f] transition-colors">
                      {t.footer.links.ekms}
                    </a>
                  </div>
                  <div>
                    <a href="#fitur-saas" className="hover:text-[#80000f] transition-colors">
                      {t.footer.links.saw}
                    </a>
                  </div>
                  <div>
                    <a href="#fitur-saas" className="hover:text-[#80000f] transition-colors">
                      {t.footer.links.screening}
                    </a>
                  </div>
                  <div>
                    <a href="#cara-kerja" className="hover:text-[#80000f] transition-colors">
                      {t.footer.links.kop}
                    </a>
                  </div>
                  <div>
                    <a href="#cara-kerja" className="hover:text-[#80000f] transition-colors">
                      {t.footer.links.dashboard}
                    </a>
                  </div>
                  <div>
                    <a href="#fitur-saas" className="hover:text-[#80000f] transition-colors">
                      {t.footer.links.stunting}
                    </a>
                  </div>
                </div>
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

          {/* Copyright Bottom Bar & Konsultasi PosyanduGo Button */}
          <div className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <p>
              {t.footer.copyright}
            </p>

            {/* Warm Golden Amber "KONSULTASI POSYANDUGO" Button */}
            <a
              href="https://wa.me/6281234567890?text=Halo%20Tim%20PosyanduGo,%20saya%20ingin%20berkonsultasi%20mengenai%20platform%20SaaS%20PosyanduGo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#f4b63f] hover:bg-[#e6a832] text-slate-900 font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-slate-900 stroke-none" />
              <span>{t.footer.consultButton}</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
