'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Baby,
  HeartPulse,
  Sparkles,
  Activity,
  ArrowUpRight,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  Play,
  Square,
  Users,
  ChevronRight,
  ShieldAlert,
  PanelsTopLeft,
  Image as ImageIcon,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AddWeighingModal from '@/components/AddWeighingModal';
import KMSLegendCard from '@/components/KMSLegendCard';
import { PosyanduStore } from '@/lib/supabase';
import { LandingStore, PosyanduScheduleConfig, DEFAULT_SCHEDULE_CONFIG } from '@/lib/landing-store';
import { Balita, PemeriksaanBalita, IbuHamil, Lansia, UserRole } from '@/types/posyandu';

export default function DashboardPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>('bidan');
  const [balitaList, setBalitaList] = useState<Balita[]>([]);
  const [pemeriksaanList, setPemeriksaanList] = useState<PemeriksaanBalita[]>([]);
  const [bumilList, setBumilList] = useState<IbuHamil[]>([]);
  const [lansiaList, setLansiaList] = useState<Lansia[]>([]);
  const [isWeighingModalOpen, setIsWeighingModalOpen] = useState(false);
  // Default SSR aman untuk mencegah Hydration Mismatch antara server dan localStorage client
  const [scheduleConfig, setScheduleConfig] = useState<PosyanduScheduleConfig>(DEFAULT_SCHEDULE_CONFIG);

  const loadData = () => {
    setBalitaList(PosyanduStore.getBalita());
    setPemeriksaanList(PosyanduStore.getPemeriksaan());
    setBumilList(PosyanduStore.getBumil());
    setLansiaList(PosyanduStore.getLansia());
  };

  useEffect(() => {
    loadData();
    // Sinkronkan jadwal dari localStorage setelah komponen ter-mount (Client-side only)
    setScheduleConfig(LandingStore.getSchedule());

    const handleLandingUpdate = () => {
      setScheduleConfig(LandingStore.getSchedule());
    };
    window.addEventListener('posyandu_landing_updated', handleLandingUpdate);
    window.addEventListener('storage', handleLandingUpdate);
    return () => {
      window.removeEventListener('posyandu_landing_updated', handleLandingUpdate);
      window.removeEventListener('storage', handleLandingUpdate);
    };
  }, []);

  // Load saved role preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('posyandu_active_role');
      const savedAuth = localStorage.getItem('posyandu_auth_user');
      if (savedRole === 'kader' || savedRole === 'bidan') {
        setCurrentRole(savedRole as UserRole);
      } else if (savedAuth) {
        try {
          const parsed = JSON.parse(savedAuth);
          if (parsed.role === 'kader' || parsed.role === 'bidan') {
            setCurrentRole(parsed.role as UserRole);
          }
        } catch (e) {}
      }
    }
  }, []);

  const handleRoleSwitch = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('posyandu_active_role', newRole);
    }
  };

  // State Periode Bulan & Tahun Posyandu (Menjawab kebutuhan kader & bidan untuk siklus bulanan)
  const [selectedMonth, setSelectedMonth] = useState<number>(10); // Default Oktober (1-12)
  const [selectedYear, setSelectedYear] = useState<number>(2026); // Default 2026

  const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  // Hitung status balita berdasarkan bulan yang dipilih
  const targetMonthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  const monthlyBalita = balitaList.map((b) => {
    const records = pemeriksaanList
      .filter((p) => p.balitaId === b.id && p.tanggalPeriksa.startsWith(targetMonthStr))
      .sort((x, y) => new Date(y.tanggalPeriksa).getTime() - new Date(x.tanggalPeriksa).getTime());
    return { balita: b, periksa: records[0] || null };
  });

  const ditimbangCount = monthlyBalita.filter((i) => i.periksa !== null).length;
  const percentDitimbang =
    balitaList.length > 0 ? Math.round((ditimbangCount / balitaList.length) * 100) : 0;

  const giziBaikCount = monthlyBalita.filter(
    (item) => item.periksa && item.periksa.statusKMS === 'N'
  ).length;

  const percentGiziBaik =
    ditimbangCount > 0 ? Math.round((giziBaikCount / ditimbangCount) * 100) : 0;

  const urgentBalita = monthlyBalita.filter(
    (item) =>
      item.periksa &&
      (item.periksa.statusKMS === '2T' ||
        item.periksa.statusKMS === 'BGM' ||
        item.periksa.zScoreBBU < -2)
  );

  const unvisitedBalita = monthlyBalita.filter((i) => i.periksa === null);

  const bumilKEKList = bumilList.filter((b) => b.statusKEK || b.lilaSaatIni < 23.5);
  const bumilKEKCount = bumilKEKList.length;

  const isBidan = currentRole === 'bidan';

  return (
    <div className="flex min-h-screen bg-[#fffafb] text-slate-900 font-sans selection:bg-[#fce1e4] selection:text-[#80000f]">
      {/* Sidebar (Collapsible with Framer Motion, fixed in place while page scrolls) */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentRole={currentRole}
          onRoleChange={handleRoleSwitch}
          onOpenWeighing={() => setIsWeighingModalOpen(true)}
          urgentCount={urgentBalita.length + bumilKEKCount}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {/* Top Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                  {isBidan ? (
                    <>
                      Dashboard <span className="text-[#80000f]">Bidan Desa</span>
                    </>
                  ) : (
                    <>
                      Dashboard <span className="text-[#80000f]">Kader Posyandu</span>
                    </>
                  )}
                </h1>
                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase border shadow-2xs bg-[#80000f] text-white border-[#80000f]">
                  {isBidan ? '👩‍⚕️ Supervisi Medis' : '🧕 Pelaksana Meja 1-4'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {isBidan
                  ? 'Pusat supervisi klinis, audit kasus gizi tinggi (Stunting & KEK), sistem rekomendasi menu MBG (SAW), dan pengesahan laporan resmi Puskesmas.'
                  : 'Pusat operasional pelayanan hari-H Posyandu: registrasi sasaran baru, pencatatan penimbangan balita & lansia, serta pembagian menu MBG.'}
              </p>
            </div>
          </div>

          {/* Quick Role-Specific Banner (Keduanya Menggunakan Tema Maroon yang Sama Persis) */}
          {isBidan ? (
            /* Banner Bidan: Wewenang Medis & Pelaporan */
            <div
              className="p-5 sm:p-6 rounded-3xl shadow-lg border border-[#f8c8c8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white"
              style={{
                background: 'linear-gradient(135deg, #80000f 0%, #990012 50%, #66000c 100%)',
                backgroundColor: '#80000f',
              }}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30 shadow-xs text-xl">
                  👩‍⚕️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                      Wewenang Supervisi Bidan &amp; Nakes Puskesmas
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white text-[#80000f] text-[10.5px] font-black uppercase shadow-xs">
                      Resmi
                    </span>
                  </div>
                  <p className="text-xs text-white/95 mt-1 font-medium leading-relaxed max-w-2xl">
                    Sebagai Bidan penanggung jawab, Anda berwenang melakukan validasi rujukan stunting/KEK, mengolah rekomendasi menu MBG berbasis SAW, dan menerbitkan laporan PDF resmi ber-kop Puskesmas.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href="/rekomendasi-mbg"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white text-[#80000f] text-xs font-bold hover:bg-[#fff5f6] transition-all shadow-md shrink-0 hover:scale-102"
                >
                  <Sparkles className="w-4 h-4 text-[#80000f]" />
                  <span>Kalkulasi SAW MBG</span>
                </Link>
                <Link
                  href="/laporan"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/15 text-white border border-white/40 text-xs font-bold hover:bg-white/25 transition-all shadow-xs shrink-0"
                >
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                  <span>Cetak Laporan PDF</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Banner Kader: Wewenang Operasional Meja 1-4 (Warna Maroon Identik dengan Dashboard Pertama) */
            <div
              className="p-5 sm:p-6 rounded-3xl shadow-lg border border-[#f8c8c8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white"
              style={{
                background: 'linear-gradient(135deg, #80000f 0%, #990012 50%, #66000c 100%)',
                backgroundColor: '#80000f',
              }}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30 shadow-xs text-xl">
                  🧕
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                      Alur Kerja Operasional Kader Posyandu
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white text-[#80000f] text-[10.5px] font-black uppercase shadow-xs">
                      Meja 1–4
                    </span>
                  </div>
                  <p className="text-xs text-white/95 mt-1 font-medium leading-relaxed max-w-2xl">
                    Melayani pendaftaran sasaran baru (Meja 1), pengukuran antropometri balita BB/TB/LK (Meja 2), pencatatan rekam penimbangan (Meja 3), dan edukasi orang tua serta pembagian PMT/MBG (Meja 4).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsWeighingModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white text-[#80000f] text-xs font-bold hover:bg-[#fff5f6] transition-all shadow-md shrink-0 hover:scale-102 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-[#80000f]" />
                  <span>Catat Penimbangan Balita</span>
                </button>
                <Link
                  href="/balita"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/15 text-white border border-white/40 text-xs font-bold hover:bg-white/25 transition-all shadow-xs shrink-0"
                >
                  <Users className="w-4 h-4 text-white" />
                  <span>Daftar Balita Baru</span>
                </Link>
              </div>
            </div>
          )}

          {/* Filter Bar Periode Sesi Posyandu (Menampilkan data bulan ini & reset ke 0 saat masuk bulan baru yang belum terlaksana) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-[#fce1e4] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#fff5f6] border border-[#fce1e4] text-[#80000f] flex items-center justify-center font-bold shadow-2xs shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Periode Sesi Pemantauan Posyandu
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      ditimbangCount > 0
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {ditimbangCount > 0 ? 'Sesi Terlaksana' : 'Belum Terlaksana (0)'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {ditimbangCount > 0 ? (
                    <span>
                      Data sesi <strong>{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</strong>: {ditimbangCount} dari {balitaList.length} balita telah ditimbang ({percentDitimbang}%).
                    </span>
                  ) : (
                    <span>
                      Sesi <strong>{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</strong> belum berjalan. Data penimbangan bulanan otomatis 0, historis bulan lalu tetap tersimpan.
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <label className="text-[11px] font-bold text-slate-600">Bulan:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-[#fce1e4] bg-[#fff5f6] text-xs font-bold text-[#80000f] focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 cursor-pointer"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-[11px] font-bold text-slate-600">Tahun:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl border border-[#fce1e4] bg-[#fff5f6] text-xs font-bold text-[#80000f] focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 cursor-pointer"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>

              {/* Quick Switcher Chips */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-[#fce1e4]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMonth(10);
                    setSelectedYear(2026);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                    selectedMonth === 10 && selectedYear === 2026
                      ? 'bg-[#80000f] text-white shadow-2xs'
                      : 'bg-[#fff5f6] text-[#80000f] hover:bg-[#fce1e4]'
                  }`}
                >
                  Okt 2026 (Ada Data)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMonth(11);
                    setSelectedYear(2026);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                    selectedMonth === 11 && selectedYear === 2026
                      ? 'bg-[#80000f] text-white shadow-2xs'
                      : 'bg-[#fff5f6] text-[#80000f] hover:bg-[#fce1e4]'
                  }`}
                >
                  Nov 2026 (Bulan Depan / 0)
                </button>
              </div>
            </div>
          </div>

          {/* 4 Metric Cards — Beda Tampilan Antara Bidan & Kader */}
          {isBidan ? (
            /* 4 Metric Cards Khusus Bidan (Fokus Klinis, Audit Risiko, dan Dokumen Resmi) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Bidan Card 1: Total Sasaran Terdaftar (Master Cohort) */}
              <div
                className="p-6 rounded-3xl border-2 border-[#fce1e4] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fff5f6 50%, #fde8e9 100%)',
                  backgroundColor: '#fff5f6',
                }}
              >
                <div className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#80000f] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      👶
                    </span>
                    <span className="text-xs font-bold text-slate-800">Master Data Balita</span>
                  </div>
                  <Link
                    href="/balita"
                    className="w-8 h-8 rounded-full border border-[#fce1e4] bg-white flex items-center justify-center text-[#80000f] hover:bg-[#fff5f6] transition-colors shadow-2xs"
                    title="Buka Data Balita"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tight text-[#80000f]">
                    {balitaList.length}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fce1e4] text-[11px] font-bold text-[#80000f] border border-[#f8c8c8]">
                    <span>Cakupan D/S: {percentDitimbang}% ({ditimbangCount}/{balitaList.length})</span>
                  </div>
                </div>
              </div>

              {/* Bidan Card 2: Balita Weight Faltering (2T / BGM) - Prioritas Intervensi Medis */}
              <div
                className="p-6 rounded-3xl border-2 border-[#fce1e4] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fff5f6 50%, #fde8e9 100%)',
                  backgroundColor: '#fff5f6',
                }}
              >
                <div className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#80000f] text-white flex items-center justify-center text-xs font-black shadow-xs">
                      🚨
                    </span>
                    <span className="text-xs font-bold text-slate-800">Risiko Stunting (2T / BGM)</span>
                  </div>
                  <Link
                    href="/rekomendasi-mbg"
                    className="w-8 h-8 rounded-full border border-[#fce1e4] bg-white flex items-center justify-center text-[#80000f] hover:bg-[#fff5f6] transition-colors shadow-2xs"
                    title="Buka Rekomendasi Menu MBG"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tight text-[#80000f]">
                    {urgentBalita.length}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fce1e4] text-[11px] font-bold text-[#80000f] border border-[#f8c8c8]">
                    <span>{ditimbangCount > 0 ? 'Wajib Rekomendasi MBG SAW' : 'Menunggu Sesi (0)'}</span>
                  </div>
                </div>
              </div>

              {/* Bidan Card 3: Ibu Hamil KEK & Anemia */}
              <div
                className="p-6 rounded-3xl border-2 border-[#fce1e4] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fff5f6 50%, #fde8e9 100%)',
                  backgroundColor: '#fff5f6',
                }}
              >
                <div className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#80000f] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      🤰
                    </span>
                    <span className="text-xs font-bold text-slate-800">Bumil Risiko KEK (LiLA &lt; 23.5)</span>
                  </div>
                  <Link
                    href="/bumil"
                    className="w-8 h-8 rounded-full border border-[#fce1e4] bg-white flex items-center justify-center text-[#80000f] hover:bg-[#fff5f6] transition-colors shadow-2xs"
                    title="Buka KIA Ibu Hamil"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tight text-[#80000f]">
                    {bumilKEKCount}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fce1e4] border border-[#f8c8c8] text-[11px] font-bold text-[#80000f]">
                    <span>Dari {bumilList.length} Bumil Terdaftar</span>
                  </div>
                </div>
              </div>

              {/* Bidan Card 4: Dokumen & Pelaporan Resmi Puskesmas */}
              <div
                className="p-6 rounded-3xl border-2 border-[#fce1e4] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fff5f6 50%, #fde8e9 100%)',
                  backgroundColor: '#fff5f6',
                }}
              >
                <div className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#80000f] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      📄
                    </span>
                    <span className="text-xs font-bold text-slate-800">Laporan Resmi Puskesmas</span>
                  </div>
                  <Link
                    href="/laporan"
                    className="w-8 h-8 rounded-full border border-[#fce1e4] bg-white flex items-center justify-center text-[#80000f] hover:bg-[#fff5f6] transition-colors shadow-2xs"
                    title="Buka Laporan Puskesmas"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tight text-[#80000f]">
                    {ditimbangCount > 0 ? 'Siap' : 'Pending'}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fce1e4] border border-[#f8c8c8] text-[11px] font-bold text-[#80000f]">
                    <span>PDF Ber-kop &amp; Ekspor CSV</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 4 Metric Cards Khusus Kader (Fokus Operasional Hari-H, Kehadiran, dan Sweeping - Tema Maroon Identik) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Kader Card 1: Balita Hadir & Ditimbang Hari Ini */}
              <div
                className="p-6 rounded-3xl border-2 border-[#fce1e4] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fff5f6 50%, #fde8e9 100%)',
                  backgroundColor: '#fff5f6',
                }}
              >
                <div className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#80000f] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      ⚖️
                    </span>
                    <span className="text-xs font-bold text-slate-800">Sudah Hadir &amp; Ditimbang</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsWeighingModalOpen(true)}
                    className="w-8 h-8 rounded-full border border-[#fce1e4] bg-white flex items-center justify-center text-[#80000f] hover:bg-[#fff5f6] transition-colors shadow-2xs cursor-pointer"
                    title="Tambah Penimbangan"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tight text-[#80000f]">
                    {ditimbangCount}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fce1e4] text-[11px] font-bold text-[#80000f] border border-[#f8c8c8]">
                    <span>{percentDitimbang}% dari {balitaList.length} Balita RW 03</span>
                  </div>
                </div>
              </div>

              {/* Kader Card 2: Balita Tumbuh Optimal (N) */}
              <div
                className="p-6 rounded-3xl border-2 border-[#fce1e4] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fff5f6 50%, #fde8e9 100%)',
                  backgroundColor: '#fff5f6',
                }}
              >
                <div className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#80000f] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      ✓
                    </span>
                    <span className="text-xs font-bold text-slate-800">Berat Badan Naik (N)</span>
                  </div>
                  <Link
                    href="/e-kms"
                    className="w-8 h-8 rounded-full border border-[#fce1e4] bg-white flex items-center justify-center text-[#80000f] hover:bg-[#fff5f6] transition-colors shadow-2xs"
                    title="Lihat Kurva KMS"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tight text-[#80000f]">
                    {giziBaikCount}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fce1e4] text-[11px] font-bold text-[#80000f] border border-[#f8c8c8]">
                    <span>{percentGiziBaik}% Balita Pertumbuhan Baik</span>
                  </div>
                </div>
              </div>

              {/* Kader Card 3: Belum Hadir (Sasaran Sweeping Kunjungan Rumah) */}
              <div
                className="p-6 rounded-3xl border-2 border-[#fce1e4] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fff5f6 50%, #fde8e9 100%)',
                  backgroundColor: '#fff5f6',
                }}
              >
                <div className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#80000f] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      🏃
                    </span>
                    <span className="text-xs font-bold text-slate-800">Belum Hadir (Perlu Sweeping)</span>
                  </div>
                  <Link
                    href="/balita"
                    className="w-8 h-8 rounded-full border border-[#fce1e4] bg-white flex items-center justify-center text-[#80000f] hover:bg-[#fff5f6] transition-colors shadow-2xs"
                    title="Lihat Daftar Balita"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tight text-[#80000f]">
                    {unvisitedBalita.length}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fce1e4] border border-[#f8c8c8] text-[11px] font-bold text-[#80000f]">
                    <span>Kader Siap Hubungi &amp; Kunjungi</span>
                  </div>
                </div>
              </div>

              {/* Kader Card 4: Penyaluran Paket MBG / PMT */}
              <div
                className="p-6 rounded-3xl border-2 border-[#fce1e4] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fff5f6 50%, #fde8e9 100%)',
                  backgroundColor: '#fff5f6',
                }}
              >
                <div className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#80000f] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      🍱
                    </span>
                    <span className="text-xs font-bold text-slate-800">Distribusi Paket MBG / PMT</span>
                  </div>
                  <Link
                    href="/e-kms"
                    className="w-8 h-8 rounded-full border border-[#fce1e4] bg-white flex items-center justify-center text-[#80000f] hover:bg-[#fff5f6] transition-colors shadow-2xs"
                    title="Lihat Konseling MBG"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tight text-[#80000f]">
                    {ditimbangCount}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fce1e4] border border-[#f8c8c8] text-[11px] font-bold text-[#80000f]">
                    <span>Paket Disalurkan ke Sasaran Hadir</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Middle Section: Widget Peran Khusus */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Widget Kiri: Jadwal & Action */}
            <div
              className="lg:col-span-5 rounded-3xl p-6 border-2 border-[#fce1e4] shadow-sm flex flex-col justify-between space-y-4"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fff5f6 50%, #fde8e9 100%)',
                backgroundColor: '#fff5f6',
              }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#80000f] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Jadwal Posyandu RW 03</span>
                  </div>
                  {!isBidan && (
                    <Link
                      href="/kelola-jadwal"
                      className="text-[11px] font-bold text-[#80000f] hover:text-[#66000c] hover:underline px-2.5 py-1 rounded-full bg-white border border-[#fce1e4] shadow-2xs transition-colors"
                    >
                      Atur Jadwal
                    </Link>
                  )}
                </div>
                <h3 suppressHydrationWarning className="font-serif font-black text-slate-900 text-lg sm:text-xl mt-3 leading-snug">
                  {scheduleConfig.sessionDayName}, {scheduleConfig.sessionDate} {scheduleConfig.sessionMonth} {scheduleConfig.sessionYear}
                </h3>
                <p suppressHydrationWarning className="text-xs text-slate-600 mt-1.5 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#80000f]" />
                  <span>{scheduleConfig.sessionTime} &bull; {scheduleConfig.sessionLocation}</span>
                </p>

                <div className="mt-4 p-3.5 bg-white/80 rounded-2xl border border-[#fce1e4] text-xs text-[#80000f] space-y-1.5 shadow-2xs">
                  <div className="font-bold flex items-center justify-between">
                    <span className="text-[#80000f] font-extrabold">Sasaran Utama:</span>
                    <span suppressHydrationWarning className="text-[10px] text-[#80000f] font-bold px-2 py-0.5 rounded-full bg-[#fce1e4] border border-[#f8c8c8]">
                      {scheduleConfig.targetSummary}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-slate-700 leading-relaxed">
                    {isBidan
                      ? 'Supervisi validasi data penimbangan, deteksi dini kasus gizi buruk (2T/BGM), dan penentuan rujukan puskesmas.'
                      : 'Pendaftaran balita & lansia di Meja 1, timbang BB/TB di Meja 2, catat hasil di Meja 3, dan bagikan PMT/MBG di Meja 4.'}
                  </div>
                </div>
              </div>

              {isBidan ? (
                <div className="space-y-2">
                  <Link
                    href="/laporan"
                    className="w-full py-3.5 rounded-2xl bg-[#80000f] hover:bg-[#66000c] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#80000f]/25 transition-all hover:scale-102"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Validasi &amp; Cetak Laporan Puskesmas (PDF)</span>
                  </Link>
                  <Link
                    href="/rekomendasi-mbg"
                    className="w-full py-2.5 rounded-2xl bg-white hover:bg-[#fff5f6] text-[#80000f] border border-[#fce1e4] font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Kalkulasi Rekomendasi Menu MBG (SAW)</span>
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsWeighingModalOpen(true)}
                  className="w-full py-3.5 rounded-2xl bg-[#80000f] hover:bg-[#66000c] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#80000f]/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Mulai Catat Penimbangan Hari Ini (Meja 2–3)</span>
                </button>
              )}
            </div>

            {/* Widget Kanan: Berbeda Konten Antara Bidan dan Kader */}
            {isBidan ? (
              /* Widget Kanan Bidan: Audit Kasus Prioritas & Rekomendasi Klinis */
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 border-2 border-[#fce1e4] shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#fce1e4]">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                      <span>Audit Kasus Gizi Prioritas &amp; Intervensi Medis</span>
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold border border-red-300">
                        {urgentBalita.length + bumilKEKCount} Kasus Perlu Tindakan
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Evaluasi rujukan balita 2T/BGM, ibu hamil KEK, dan skrining hipertensi lansia
                    </p>
                  </div>
                  <Link
                    href="/rekomendasi-mbg"
                    className="text-xs font-bold text-[#80000f] hover:underline flex items-center gap-1 shrink-0 px-3 py-1 rounded-full bg-[#fff5f6] border border-[#fce1e4]"
                  >
                    <span>Formula SAW</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {ditimbangCount === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-[#fff5f6]/50 border border-[#fce1e4] space-y-3 my-2">
                    <div className="w-10 h-10 rounded-2xl bg-[#fce1e4] text-[#80000f] flex items-center justify-center mx-auto font-black text-sm shadow-xs">
                      0
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Belum Ada Kasus Gizi Terdeteksi Bulan Ini ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                        Sesi penimbangan belum terlaksana. Sesuai standar Kemenkes RI, data indikator bulanan otomatis berada di angka 0 sampai sesi posyandu dimulai oleh kader.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {[
                      ...urgentBalita.map((item) => ({
                        nama: item.balita.nama,
                        kategori: `Balita (${item.periksa?.usiaBulan} bln)`,
                        status:
                          item.periksa?.statusKMS === '2T'
                            ? '2T (Weight Faltering - 2 Bulan BB Tidak Naik)'
                            : item.periksa?.statusKMS === 'BGM'
                            ? 'BGM (Bawah Garis Merah / Gizi Buruk)'
                            : 'Perlu Perhatian Gizi',
                        badge: item.periksa?.statusKMS === '2T' ? 'Intervensi MBG' : 'Rujukan Segera',
                        badgeColor: 'bg-red-700 text-white shadow-xs',
                        tindakan: 'Rekomendasikan porsi protein MBG & pantau z-score',
                      })),
                      ...bumilKEKList.map((item) => ({
                        nama: item.nama,
                        kategori: `Ibu Hamil (Usia ${item.usiaKehamilanMinggu} mgg)`,
                        status: `LiLA ${item.lilaSaatIni} cm (Risiko KEK) • Hb: ${item.hb} g/dL`,
                        badge: 'Bumil KEK',
                        badgeColor: 'bg-amber-600 text-white shadow-xs',
                        tindakan: 'Pemberian PMT padat kalori & tablet tambah darah',
                      })),
                    ].slice(0, 5).map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-[#fff5f6]/50 hover:bg-[#fff5f6] rounded-2xl border border-[#fce1e4] flex items-center justify-between transition-colors shadow-2xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">{item.nama}</div>
                          <div
                            className="text-[11px] text-slate-500 font-medium mt-0.5"
                            dangerouslySetInnerHTML={{ __html: `${item.kategori} &bull; <span class="text-[#80000f] font-semibold">${item.status}</span>` }}
                          />
                          <div className="text-[10.5px] text-slate-400 mt-0.5 italic">
                            Tindakan Medis Bidan: {item.tindakan}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Widget Kanan Kader: Daftar Balita Belum Hadir (Prioritas Sweeping Kunjungan Rumah - Tema Maroon Identik) */
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 border-2 border-[#fce1e4] shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#fce1e4]">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                      <span>Daftar Balita Belum Hadir (Sasaran Sweeping)</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#fce1e4] text-[#80000f] text-[10px] font-bold border border-[#f8c8c8]">
                        {unvisitedBalita.length} Anak Belum Datang
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tugas kader untuk menghubungi atau melakukan kunjungan rumah agar cakupan 100%
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsWeighingModalOpen(true)}
                    className="text-xs font-bold text-[#80000f] hover:underline flex items-center gap-1 shrink-0 px-3 py-1 rounded-full bg-[#fff5f6] border border-[#fce1e4] cursor-pointer"
                  >
                    <span>+ Timbang Sekarang</span>
                  </button>
                </div>

                {unvisitedBalita.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-[#fff5f6]/50 border border-[#fce1e4] space-y-2 my-2">
                    <div className="w-10 h-10 rounded-2xl bg-[#fce1e4] text-[#80000f] flex items-center justify-center mx-auto text-lg shadow-xs font-black">
                      ✓
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Luar Biasa! Semua Balita Telah Hadir Ditimbang
                    </h4>
                    <p className="text-[11px] text-slate-600 max-w-md mx-auto">
                      Seluruh {balitaList.length} balita terdaftar telah tercatat pada sesi bulan ini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {unvisitedBalita.slice(0, 6).map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#fffafb] hover:bg-[#fff5f6] rounded-2xl border border-[#fce1e4] flex items-center justify-between transition-colors shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#fce1e4] text-[#80000f] flex items-center justify-center text-sm font-bold shrink-0">
                            👶
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs sm:text-sm">
                              {item.balita.nama} ({item.balita.jenisKelamin === 'L' ? 'L' : 'P'})
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              Ibu: {item.balita.namaIbu} &bull; Alamat: {item.balita.alamat} &bull; NIK: {item.balita.nik}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsWeighingModalOpen(true)}
                          className="px-3 py-1.5 rounded-xl bg-[#80000f] hover:bg-[#66000c] text-white text-[11px] font-bold shadow-2xs transition-colors shrink-0 cursor-pointer"
                        >
                          Catat Timbang
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Info Hak Akses Kader */}
                <div className="p-3 rounded-2xl bg-[#fff5f6] border border-[#fce1e4] text-[11px] text-[#80000f] flex items-start gap-2">
                  <span className="text-base leading-none">ℹ️</span>
                  <div>
                    <strong>Pemberitahuan Wewenang:</strong> Ekspor file CSV mentah dan Cetak Laporan PDF resmi berkop disahkan secara legal oleh Bidan Desa penanggung jawab posyandu.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Section: Kader Collaboration & Status Gizi Balita Donut Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Widget: Kader Collaboration */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border-2 border-[#fce1e4] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#fce1e4]">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Petugas &amp; Kader Posyandu Melati</h3>
                  <p className="text-xs text-slate-400">Tim Pelayanan Aktif Pembinaan Puskesmas Pembina</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-[#fce1e4] text-[#80000f] font-bold border border-[#f8c8c8]">
                  4 Petugas Siaga
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    name: 'Bdn. Ratna Kusuma, S.ST',
                    role: 'Bidan Desa & Ahli Gizi',
                    status: 'Verifikasi Gizi',
                    color: 'bg-[#fce1e4] text-[#80000f] border border-[#f8c8c8]',
                    avatar: '👩‍⚕️',
                  },
                  {
                    name: 'Ny. Anisa Rahmawati',
                    role: 'Ketua Kader Posyandu Melati',
                    status: 'Meja Timbang (BB/TB)',
                    color: 'bg-[#fce1e4] text-[#80000f] border border-[#f8c8c8]',
                    avatar: '🧕',
                  },
                  {
                    name: 'Ny. Siti Rohayati',
                    role: 'Kader Meja 4 (Konseling MBG)',
                    status: 'Edukasi Menu',
                    color: 'bg-[#fff5f6] text-[#80000f] border border-[#fce1e4]',
                    avatar: '👩',
                  },
                  {
                    name: 'Ny. Nurul Hidayah',
                    role: 'Kader Meja 1 (Pendaftaran)',
                    status: 'Registrasi KIA',
                    color: 'bg-[#fff5f6] text-[#80000f] border border-[#fce1e4]',
                    avatar: '🧕',
                  },
                ].map((k, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[#fffafb] hover:bg-[#fff5f6] rounded-2xl border border-[#fce1e4] transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#fff5f6] flex items-center justify-center text-xl shadow-xs border border-[#fce1e4] shrink-0">
                        {k.avatar}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-slate-900 text-xs truncate">{k.name}</div>
                        <div className="text-[10.5px] text-slate-400 truncate">{k.role}</div>
                      </div>
                    </div>
                    <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0 ${k.color}`}>
                      {k.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget: Donut Progress Gauge (Status Gizi Balita) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border-2 border-[#fce1e4] shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Distribusi Status Gizi Balita ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})
                </h3>
                <p className="text-xs text-slate-400">
                  {ditimbangCount > 0
                    ? `${ditimbangCount} dari ${balitaList.length} balita telah ditimbang`
                    : 'Belum ada data penimbangan bulan ini'}
                </p>
              </div>

              {/* Semi-circular visual ring gauge with Maroon Primary Ring */}
              <div className="py-2 flex flex-col items-center justify-center">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#fce1e4"
                      strokeWidth="12"
                      fill="transparent"
                    />
                    {ditimbangCount > 0 && (
                      <>
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#80000f"
                          strokeWidth="12"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 * (1 - percentGiziBaik / 100)}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#f8c8c8"
                          strokeWidth="12"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 * (1 - urgentBalita.length / (ditimbangCount || 1))}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </>
                    )}
                  </svg>
                  <div className="absolute flex flex-col items-center text-center px-2">
                    <span className="text-3xl font-black text-slate-900">
                      {ditimbangCount > 0 ? `${percentGiziBaik}%` : '0%'}
                    </span>
                    <span className="text-[10px] text-[#80000f] font-bold uppercase tracking-wider">
                      {ditimbangCount > 0 ? 'Gizi Baik (N)' : 'Belum Ditimbang'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-700 mt-2 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#80000f]"></span>
                    <span>Gizi Baik (N): {giziBaikCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f8c8c8]"></span>
                    <span>2T / BGM: {urgentBalita.length}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#fff5f6] border border-[#fce1e4] rounded-2xl text-xs text-[#80000f] text-center font-bold">
                {ditimbangCount > 0
                  ? '🎯 Target Bebas Gagal Tumbuh Posyandu Melati 2026'
                  : '⏳ Menunggu Pelaksanaan Hari-H Posyandu Periode Ini'}
              </div>
            </div>
          </div>

          {/* Section Penjabaran Kode KMS (Menjawab kebingungan user mengenai N, T, 2T, BGM, dll) */}
          <KMSLegendCard />
        </main>
      </div>

      {/* Modal Input Penimbangan Baru */}
      <AddWeighingModal
        isOpen={isWeighingModalOpen}
        onClose={() => setIsWeighingModalOpen(false)}
        balitaList={balitaList}
        onSuccess={loadData}
      />
    </div>
  );
}
