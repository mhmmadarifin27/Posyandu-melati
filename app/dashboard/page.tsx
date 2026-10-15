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
import { LandingStore, PosyanduScheduleConfig } from '@/lib/landing-store';
import { Balita, PemeriksaanBalita, IbuHamil, Lansia, UserRole } from '@/types/posyandu';

export default function DashboardPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>('bidan');
  const [balitaList, setBalitaList] = useState<Balita[]>([]);
  const [pemeriksaanList, setPemeriksaanList] = useState<PemeriksaanBalita[]>([]);
  const [bumilList, setBumilList] = useState<IbuHamil[]>([]);
  const [lansiaList, setLansiaList] = useState<Lansia[]>([]);
  const [isWeighingModalOpen, setIsWeighingModalOpen] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState<PosyanduScheduleConfig>(() =>
    LandingStore.getSchedule()
  );

  const loadData = () => {
    setBalitaList(PosyanduStore.getBalita());
    setPemeriksaanList(PosyanduStore.getPemeriksaan());
    setBumilList(PosyanduStore.getBumil());
    setLansiaList(PosyanduStore.getLansia());
  };

  useEffect(() => {
    loadData();
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

  const bumilKEKCount = bumilList.filter((b) => b.statusKEK || b.lilaSaatIni < 23.5).length;

  return (
    <div className="flex min-h-screen bg-[#fffafb] text-slate-900 font-sans selection:bg-[#fce1e4] selection:text-[#80000f]">
      {/* Sidebar (Collapsible with Framer Motion, fixed in place while page scrolls) */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          onOpenWeighing={() => setIsWeighingModalOpen(true)}
          urgentCount={urgentBalita.length + bumilKEKCount}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {/* Top Page Header (Simplified as requested: Only Title & Subtitle) */}
          <div className="pt-1">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Dashboard <span className="text-[#80000f]">Pelayanan &amp; Gizi</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Pusat data digital Posyandu Melati &bull; Pemantauan tumbuh kembang balita, KIA, lansia, dan rekomendasi menu MBG.
            </p>
          </div>

          {/* Quick Landing Page Integration Banner (Maroon Theme with Guaranteed Inline Fallback) */}
          <div
            className="p-5 sm:p-6 rounded-3xl shadow-lg border border-[#f8c8c8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white"
            style={{
              background: 'linear-gradient(135deg, #80000f 0%, #990012 50%, #66000c 100%)',
              backgroundColor: '#80000f',
            }}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30 shadow-xs">
                <PanelsTopLeft className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                    Integrasi Landing Page Publik
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-[#80000f] text-[10.5px] font-black uppercase shadow-xs">
                    Aktif
                  </span>
                </div>
                <p className="text-xs text-white/95 mt-1 font-medium leading-relaxed max-w-2xl">
                  Update foto galeri (tanpa judul/deskripsi) dan tentukan tanggal jadwal Posyandu yang langsung tampil di halaman depan.
                </p>
              </div>
            </div>
            <Link
              href="/kelola-galeri"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#80000f] text-xs font-bold hover:bg-[#fff5f6] transition-all shadow-md shrink-0 hover:scale-102"
            >
              <ImageIcon className="w-4 h-4 text-[#80000f]" />
              <span>Kelola Galeri &amp; Jadwal</span>
              <ChevronRight className="w-4 h-4 text-[#80000f]" />
            </Link>
          </div>

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

          {/* 4 Top Metric Cards (Unified Harmonious Maroon Theme across all 4 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Total Balita Terdaftar (Master Data Kohort Tidak Hilang) */}
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
                  <span className="text-xs font-bold text-slate-800">Total Balita Terdaftar</span>
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
                  {balitaList.length}
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fce1e4] text-[11px] font-bold text-[#80000f] border border-[#f8c8c8]">
                  <span>{ditimbangCount} dari {balitaList.length} Ditimbang</span>
                  <span>&bull;</span>
                  <span>{percentDitimbang}%</span>
                </div>
              </div>
            </div>

            {/* Card 2: Balita Gizi Baik (N) - Reset 0 jika sesi belum terlaksana */}
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
                  <span className="text-xs font-bold text-slate-800">Balita Naik Adekuat (N)</span>
                </div>
                <Link
                  href="/e-kms"
                  className="w-8 h-8 rounded-full border border-[#fce1e4] bg-white flex items-center justify-center text-[#80000f] hover:bg-[#fff5f6] transition-colors shadow-2xs"
                  title="Buka E-KMS Digital"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
              <div>
                <div className="text-4xl font-black tracking-tight text-[#80000f]">
                  {giziBaikCount}
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fce1e4] text-[11px] font-bold text-[#80000f] border border-[#f8c8c8]">
                  <span>{ditimbangCount > 0 ? 'Pertumbuhan Optimal' : 'Belum Ditimbang (0)'}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Balita Weight Faltering (2T / BGM) Alert - Reset 0 jika sesi belum terlaksana */}
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
                    !
                  </span>
                  <span className="text-xs font-bold text-slate-800">Weight Faltering (2T / BGM)</span>
                </div>
                <Link
                  href="/rekomendasi-mbg"
                  className="w-8 h-8 rounded-full border border-[#fce1e4] bg-white flex items-center justify-center text-[#80000f] hover:bg-[#fff5f6] transition-colors shadow-2xs"
                  title="Lihat Rekomendasi Menu MBG"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
              <div>
                <div className="text-4xl font-black tracking-tight text-[#80000f]">
                  {urgentBalita.length}
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fce1e4] text-[11px] font-bold text-[#80000f] border border-[#f8c8c8]">
                  <span>{ditimbangCount > 0 ? 'Wajib Menu Tambahan MBG' : 'Menunggu Sesi (0 Kasus)'}</span>
                </div>
              </div>
            </div>

            {/* Card 4: Bumil & Lansia (Master Kohort Tetap Terpantau) */}
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
                    ♥
                  </span>
                  <span className="text-xs font-bold text-slate-800">Bumil &amp; Lansia Terbina</span>
                </div>
                <Link
                  href="/lansia"
                  className="w-8 h-8 rounded-full border border-[#fce1e4] bg-white flex items-center justify-center text-[#80000f] hover:bg-[#fff5f6] transition-colors shadow-2xs"
                  title="Buka Data Lansia"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
              <div>
                <div className="text-4xl font-black tracking-tight text-[#80000f]">
                  {bumilList.length + lansiaList.length}
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fce1e4] border border-[#f8c8c8] text-[11px] font-bold text-[#80000f]">
                  <span>{bumilList.length} Bumil &bull; {lansiaList.length} Lansia</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section: Pengingat Jadwal & Sasaran Prioritas Gizi MBG */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Widget: Reminders Card (Pengingat Jadwal Pelayanan) */}
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
                    <span>Pengingat Jadwal Posyandu</span>
                  </div>
                  <Link
                    href="/kelola-jadwal"
                    className="text-[11px] font-bold text-[#80000f] hover:text-[#66000c] hover:underline px-2.5 py-1 rounded-full bg-white border border-[#fce1e4] shadow-2xs transition-colors"
                  >
                    Ubah Tanggal
                  </Link>
                </div>
                <h3 className="font-serif font-black text-slate-900 text-lg sm:text-xl mt-3 leading-snug">
                  {scheduleConfig.sessionDayName}, {scheduleConfig.sessionDate} {scheduleConfig.sessionMonth} {scheduleConfig.sessionYear}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#80000f]" />
                  <span>{scheduleConfig.sessionTime} &bull; {scheduleConfig.sessionLocation}</span>
                </p>

                <div className="mt-4 p-3.5 bg-white/80 rounded-2xl border border-[#fce1e4] text-xs text-[#80000f] space-y-1.5 shadow-2xs">
                  <div className="font-bold flex items-center justify-between">
                    <span className="text-[#80000f] font-extrabold">Sasaran Utama:</span>
                    <span className="text-[10px] text-[#80000f] font-bold px-2 py-0.5 rounded-full bg-[#fce1e4] border border-[#f8c8c8]">
                      {scheduleConfig.targetSummary}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-slate-700 leading-relaxed">
                    Timbang BB/TB balita, pemantauan kurva KMS WHO, skrining antenatal LiLA, dan verifikasi alokasi Menu MBG.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsWeighingModalOpen(true)}
                className="w-full py-3.5 rounded-2xl bg-[#80000f] hover:bg-[#66000c] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#80000f]/25 transition-all hover:scale-102 active:scale-98"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Mulai Catat Penimbangan Hari Ini</span>
              </button>
            </div>

            {/* Widget: Sasaran Prioritas MBG List */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border-2 border-[#fce1e4] shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#fce1e4]">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Sasaran Prioritas Gizi &amp; Intervensi ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Balita 2T/BGM dan Bumil KEK prioritas distribusi menu MBG
                  </p>
                </div>
                <Link
                  href="/rekomendasi-mbg"
                  className="text-xs font-bold text-[#80000f] hover:underline flex items-center gap-1 shrink-0 px-3 py-1 rounded-full bg-[#fff5f6] border border-[#fce1e4]"
                >
                  <span>Lihat SAW</span>
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
                      Sesi penimbangan periode ini belum terlaksana. Sesuai standar Kemenkes RI, data indikator bulanan otomatis berada di angka 0 sampai sesi posyandu dimulai.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsWeighingModalOpen(true)}
                      className="px-4 py-2 rounded-full bg-[#80000f] hover:bg-[#66000c] text-white font-bold text-xs shadow-xs transition-transform hover:scale-102 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Mulai Catat Penimbangan Hari Ini</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMonth(10);
                        setSelectedYear(2026);
                      }}
                      className="px-4 py-2 rounded-full bg-white hover:bg-[#fff5f6] text-[#80000f] border border-[#fce1e4] font-bold text-xs transition-colors cursor-pointer"
                    >
                      Buka Data Sesi Oktober 2026
                    </button>
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
                      badge: item.periksa?.statusKMS === '2T' ? 'Wajib MBG' : 'Prioritas 1',
                      badgeColor: 'bg-[#80000f] text-white shadow-xs',
                    })),
                    {
                      nama: 'Sri Wahyuni',
                      kategori: 'Ibu Hamil (28 mgg)',
                      status: 'LiLA 21.4 cm (Risiko KEK)',
                      badge: 'Menu Padat',
                      badgeColor: 'bg-[#fce1e4] text-[#80000f] border border-[#f8c8c8]',
                    },
                    {
                      nama: 'Mbah Sastro',
                      kategori: 'Lansia (72 thn)',
                      status: 'Tensi 155/95 mmHg (Hipertensi)',
                      badge: 'Diet Garam',
                      badgeColor: 'bg-[#fff5f6] text-[#80000f] border border-[#fce1e4]',
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-[#fff5f6]/50 hover:bg-[#fff5f6] rounded-2xl border border-[#fce1e4] flex items-center justify-between transition-colors shadow-2xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{item.nama}</div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {item.kategori} &bull; <span className="text-[#80000f] font-semibold">{item.status}</span>
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
