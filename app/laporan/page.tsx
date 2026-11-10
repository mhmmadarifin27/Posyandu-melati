'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Award,
  Lock,
  ArrowLeft,
  Settings,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Check,
  X,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ExportReportModal from '@/components/ExportReportModal';
import { PosyanduStore } from '@/lib/supabase';
import { Balita, PemeriksaanBalita, IbuHamil, Lansia, UserRole, PosyanduKopConfig } from '@/types/posyandu';
import { toast } from '@/components/ui/custom-toast';
import { compressImageFile } from '@/lib/utils';

export default function LaporanPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>('admin_posyandu');
  const [balitaList, setBalitaList] = useState<Balita[]>([]);
  const [pemeriksaanList, setPemeriksaanList] = useState<PemeriksaanBalita[]>([]);
  const [bumilList, setBumilList] = useState<IbuHamil[]>([]);
  const [lansiaList, setLansiaList] = useState<Lansia[]>([]);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [activeTenantName, setActiveTenantName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return PosyanduStore.resolveActivePosyanduFilter() || 'Posyandu Melati';
    }
    return 'Posyandu Melati';
  });

  // Kop Surat Dinamis & Kustomisasi Otomatis per Posyandu
  const [kopConfig, setKopConfig] = useState<PosyanduKopConfig>(() => {
    if (typeof window !== 'undefined') {
      const current = PosyanduStore.resolveActivePosyanduFilter() || 'Posyandu Melati';
      return PosyanduStore.getKopConfig(current);
    }
    return PosyanduStore.getKopConfig('Posyandu Melati');
  });
  const [isCustomKopOpen, setIsCustomKopOpen] = useState(false);
  const [kopForm, setKopForm] = useState<PosyanduKopConfig>(kopConfig);

  // State Pilihan Periode Bulan & Tahun Pelaporan
  const [selectedMonth, setSelectedMonth] = useState<number>(10); // Default Oktober (1-12)
  const [selectedYear, setSelectedYear] = useState<number>(2026); // Default 2026

  const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const ROMAN_MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

  const loadReportData = () => {
    // Menyesuaikan unit posyandu secara otomatis berdasarkan akun/sesi aktif yang sedang dibuka
    const currentTenant = PosyanduStore.resolveActivePosyanduFilter() || 'Posyandu Melati';
    setActiveTenantName(currentTenant);

    // Ambil konfigurasi KOP surat resmi & logo khusus posyandu ini
    const config = PosyanduStore.getKopConfig(currentTenant);
    setKopConfig(config);
    setKopForm(config);

    // Ambil data sasaran & pemeriksaan khusus posyandu ini
    setBalitaList(PosyanduStore.getBalita(currentTenant));
    setPemeriksaanList(PosyanduStore.getPemeriksaan(currentTenant));
    setBumilList(PosyanduStore.getBumil(currentTenant));
    setLansiaList(PosyanduStore.getLansia(currentTenant));

    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('posyandu_active_role');
      if (savedRole) {
        setCurrentRole(savedRole as UserRole);
      }
    }
  };

  useEffect(() => {
    loadReportData();
    window.addEventListener('posyandu_filter_changed', loadReportData);
    window.addEventListener('posyandu_kop_updated', loadReportData);
    window.addEventListener('posyandu_auth_changed', loadReportData);
    return () => {
      window.removeEventListener('posyandu_filter_changed', loadReportData);
      window.removeEventListener('posyandu_kop_updated', loadReportData);
      window.removeEventListener('posyandu_auth_changed', loadReportData);
    };
  }, []);

  const handlePrint = () => {
    toast.info('Menyiapkan Lembar Cetak', 'Membuka dialog cetak laporan resmi.');
    window.print();
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning('Format Salah', 'Harap pilih berkas gambar (PNG, JPG, atau WEBP).');
      return;
    }

    try {
      // Kompres logo ke resolusi optimal 300x300 px agar ringan (< 30 KB) dan bebas QuotaExceededError
      const compressedDataUrl = await compressImageFile(file, 300, 300, 0.85);
      setKopForm((prev) => ({ ...prev, logoPosyandu: compressedDataUrl }));
      toast.success('Logo Dimuat', 'Pratinjau logo berhasil diperbarui.');
    } catch (err) {
      console.warn('Kompresi logo gagal, menggunakan pembaca standar:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setKopForm((prev) => ({ ...prev, logoPosyandu: event.target?.result as string }));
          toast.success('Logo Dimuat', 'Pratinjau logo berhasil diperbarui.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCustomKop = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const matched = PosyanduStore.findTenant(activeTenantName);
      const targetId = matched?.id || activeTenantName;
      PosyanduStore.saveKopConfig(targetId, kopForm);
      setKopConfig(kopForm);
      setIsCustomKopOpen(false);
      toast.success('Kop Surat Disimpan', `Kop surat untuk ${matched?.nama || activeTenantName} berhasil diperbarui.`);
    } catch (err: any) {
      console.error('Gagal menyimpan KOP surat:', err);
      toast.error('Gagal Menyimpan Kop', err?.message || 'Terjadi kesalahan saat menyimpan KOP surat.');
    }
  };

  const handleResetKop = () => {
    const matched = PosyanduStore.findTenant(activeTenantName);
    if (matched && typeof window !== 'undefined') {
      const storageKey = `posyandu_kop_config_${matched.id}`;
      try {
        localStorage.removeItem(storageKey);
        sessionStorage.removeItem(storageKey);
      } catch {}
      // Jika Posyandu Melati, pulihkan logo resmi bawaan
      if (matched.id === 'pos-melati' || matched.nama.toLowerCase().includes('melati')) {
        matched.logo = '/images/logo-posyandu.png';
        PosyanduStore.updatePosyandu(matched);
      }
    }
    const fresh = PosyanduStore.getKopConfig(activeTenantName);
    setKopConfig(fresh);
    setKopForm(fresh);
    setIsCustomKopOpen(false);
    toast.info('Kop Direset', `Kop surat untuk ${matched?.nama || activeTenantName} dikembalikan ke data profil standar.`);
  };

  // Filter Pemeriksaan Balita Berdasarkan Bulan & Tahun yang Dipilih
  const targetMonthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  const monthlyPemeriksaan = balitaList.map((b) => {
    const records = pemeriksaanList
      .filter((p) => p.balitaId === b.id && p.tanggalPeriksa.startsWith(targetMonthStr))
      .sort((x, y) => new Date(y.tanggalPeriksa).getTime() - new Date(x.tanggalPeriksa).getTime());
    return { balita: b, periksa: records[0] || null };
  });

  const ditimbangCount = monthlyPemeriksaan.filter((i) => i.periksa !== null).length;
  const percentDitimbang =
    balitaList.length > 0 ? Math.round((ditimbangCount / balitaList.length) * 100) : 0;

  const countN = monthlyPemeriksaan.filter((i) => i.periksa?.statusKMS === 'N').length;
  const countT = monthlyPemeriksaan.filter((i) => i.periksa?.statusKMS === 'T').length;
  const count2T = monthlyPemeriksaan.filter((i) => i.periksa?.statusKMS === '2T').length;
  const countBGM = monthlyPemeriksaan.filter((i) => i.periksa?.statusKMS === 'BGM').length;
  const countBumilKEK = bumilList.filter((b) => b.statusKEK || b.lilaSaatIni < 23.5).length;

  const hasAccess = currentRole === 'admin_posyandu' || currentRole === 'super_admin' || currentRole === 'bidan';

  return (
    <div className="flex min-h-screen bg-[#f8fafc] print:bg-white print:min-h-0 print:block">
      <div className="no-print print:hidden">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 print:w-full print:block">
        <div className="no-print print:hidden">
          <Header />
        </div>

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto max-w-[1600px] mx-auto w-full print:p-0 print:m-0 print:max-w-none print:w-full print:space-y-0 print:overflow-visible">
          {!hasAccess ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-[#fce1e4] shadow-sm text-center max-w-xl mx-auto my-12 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#fff5f6] border border-[#fce1e4] text-[#80000f] flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-8 h-8 text-[#80000f]" />
              </div>
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase bg-[#fce1e4] text-[#80000f] border border-[#f8c8c8]">
                  Wewenang Khusus Admin Posyandu
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Akses Laporan Resmi Dibatasi
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                  Pencetakan dokumen resmi dan ekspor file rekapitulasi data merupakan wewenang Admin Posyandu dan Super Admin Puskesmas.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#80000f] hover:bg-[#66000c] text-white text-xs font-bold transition-all shadow-md hover:scale-102"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Dashboard</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Action Header - Disembunyikan saat cetak */}
              <div className="no-print print:hidden space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#fff5f6] border border-[#fce1e4] text-[#80000f] flex items-center justify-center font-bold shadow-2xs">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                          Laporan Rekapitulasi {activeTenantName}
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          Format cetak dinas resmi bertanda tangan &bull; Kop Surat dinamis dapat dikustomisasi
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      onClick={() => {
                        const fresh = PosyanduStore.getKopConfig(activeTenantName);
                        setKopConfig(fresh);
                        setKopForm(fresh);
                        setIsCustomKopOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#80000f]" />
                      <span>Kustomisasi Kop Surat</span>
                    </button>
                    <button
                      onClick={() => setIsExportOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#fff5f6] text-slate-800 hover:text-[#80000f] font-bold text-xs border border-[#fce1e4] shadow-2xs transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#80000f]" />
                      <span>Ekspor Excel / CSV</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#80000f] hover:bg-[#66000c] text-white font-bold text-xs shadow-md shadow-[#80000f]/20 transition-transform hover:scale-102 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Lembar Resmi (A4)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Filter Bar Periode Laporan Bulanan - Disembunyikan saat cetak */}
              <div className="no-print print:hidden p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Pilih Periode Bulan &amp; Tahun Pelaporan:
                    </span>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {ditimbangCount > 0 ? (
                        <span className="text-emerald-700 font-semibold">
                          &bull; Sesi terlaksana: {ditimbangCount} dari {balitaList.length} balita telah ditimbang ({percentDitimbang}%)
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold">
                          &bull; Sesi bulan {MONTH_NAMES[selectedMonth - 1]} {selectedYear} belum berlangsung (data penimbangan dimulai dari 0)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <label className="text-[11px] font-bold text-slate-600">Bulan:</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 cursor-pointer"
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
                      className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 cursor-pointer"
                    >
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* DOKUMEN CETAK RESMI FORMAT KERTAS A4 PEMERINTAH (FORMAL DINAS) */}
              <div className="bg-white rounded-xl p-8 sm:p-12 border border-slate-300 shadow-sm max-w-[210mm] mx-auto text-black font-serif print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:rounded-none">
                {/* ========================================================================= */}
                {/* KOP SURAT DINAS RESMI (LOGO POSYANDU DINAMIS & TEKS KUSTOMISASI)          */}
                {/* ========================================================================= */}
                <div className="flex items-center justify-between gap-4 pb-2">
                  {/* Logo Kiri: Logo Posyandu Masing-Masing Tenant */}
                  <div className="w-20 shrink-0 flex items-center justify-center">
                    <img
                      src={kopConfig.logoPosyandu || '/images/logo-posyandu.png'}
                      alt={`Logo ${kopConfig.namaPosyandu}`}
                      className="h-20 w-auto object-contain max-w-[80px]"
                    />
                  </div>

                  {/* Teks Kop Surat Dinas Formal */}
                  <div className="flex-1 text-center space-y-0.5">
                    <h3 className="font-serif font-black text-sm uppercase tracking-wider text-black leading-tight">
                      {kopConfig.pemerintahDaerah}
                    </h3>
                    <h4 className="font-sans font-bold text-xs uppercase tracking-wide text-black leading-tight">
                      {kopConfig.dinasKesehatan}
                    </h4>
                    <h4 className="font-sans font-extrabold text-xs uppercase tracking-wide text-black leading-tight">
                      {kopConfig.puskesmas}
                    </h4>
                    <h2 className="font-serif font-black text-sm sm:text-base uppercase tracking-widest text-black leading-tight pt-0.5">
                      {kopConfig.namaPosyandu}
                    </h2>
                    <p className="text-[10px] text-black leading-tight pt-1 font-sans">
                      {kopConfig.alamat}
                    </p>
                    <p className="text-[9.5px] text-black font-sans leading-tight">
                      {kopConfig.kontak}
                    </p>
                  </div>

                  {/* Spacer Kanan Penyeimbang Tata Letak (Hanya 1 Logo di Kiri) */}
                  <div className="w-20 shrink-0" aria-hidden="true" />
                </div>

                {/* Garis Ganda Pembatas Kop Surat Resmi (Tebal + Tipis) */}
                <div className="w-full border-b-[2.5px] border-black mt-1"></div>
                <div className="w-full border-b border-black mt-[2px] mb-5"></div>

                {/* Judul Laporan Formal & Nomor Surat */}
                <div className="text-center space-y-1 mb-5">
                  <h2 className="font-serif font-bold text-sm sm:text-base uppercase tracking-wider text-black underline decoration-black underline-offset-4">
                    Laporan Bulanan Hasil Penimbangan dan Pemantauan Status Gizi
                  </h2>
                  <p className="font-sans text-xs font-semibold text-black">
                    Nomor: 440 / 108 / {kopConfig.puskesmas.replace(/[^A-Z0-9]/g, '').slice(0, 8)} / {ROMAN_MONTHS[selectedMonth - 1]} / {selectedYear}
                  </p>
                </div>

                {/* Identitas Wilayah & Periode Pelaporan */}
                <div className="mb-5 text-xs text-black font-sans leading-relaxed">
                  <table className="w-full border-none">
                    <tbody>
                      <tr>
                        <td className="w-36 font-semibold py-0.5">Unit Posyandu</td>
                        <td className="w-4 py-0.5">:</td>
                        <td className="py-0.5 font-bold">{activeTenantName}</td>
                        <td className="w-36 font-semibold py-0.5 pl-4">Bulan / Tahun</td>
                        <td className="w-4 py-0.5">:</td>
                        <td className="py-0.5 font-bold">{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-0.5">Puskesmas Pembina</td>
                        <td className="py-0.5">:</td>
                        <td className="py-0.5">{kopConfig.puskesmas}</td>
                        <td className="font-semibold py-0.5 pl-4">Bidan Pembina</td>
                        <td className="py-0.5">:</td>
                        <td className="py-0.5">{kopConfig.namaBidan}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Bagian I: Tabel Rekapitulasi Cakupan Program (SKDN & Indikator Gizi Kemenkes RI) */}
                <div className="space-y-2 mb-6">
                  <h4 className="font-bold text-black text-xs uppercase tracking-wider">
                    I. Rekapitulasi Hasil Penimbangan (SKDN) &amp; Prioritas Gizi
                  </h4>
                  <table className="w-full text-xs border-collapse border border-black text-black font-sans">
                    <thead>
                      <tr className="bg-slate-100 font-bold border-b border-black text-center">
                        <th className="border border-black p-2 w-10">No</th>
                        <th className="border border-black p-2 text-left">Indikator Pelayanan Posyandu</th>
                        <th className="border border-black p-2 w-28 text-center">Jumlah Sasaran</th>
                        <th className="border border-black p-2 text-left">Capaian &amp; Standar Operasional Kemenkes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black p-2 text-center font-bold">1</td>
                        <td className="border border-black p-2 font-semibold">
                          Total Sasaran Balita Terdaftar (S)
                        </td>
                        <td className="border border-black p-2 text-center font-bold">
                          {balitaList.length} Anak
                        </td>
                        <td className="border border-black p-2">
                          100% data kependudukan wilayah {activeTenantName} tercatat lengkap.
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 text-center font-bold">2</td>
                        <td className="border border-black p-2 font-semibold">
                          Memiliki Buku KIA / KMS (K)
                        </td>
                        <td className="border border-black p-2 text-center font-bold">
                          {balitaList.length} Anak
                        </td>
                        <td className="border border-black p-2">
                          Cakupan kepemilikan buku KMS mencapai 100%.
                        </td>
                      </tr>
                      <tr className="bg-slate-50 font-bold">
                        <td className="border border-black p-2 text-center">3</td>
                        <td className="border border-black p-2">
                          Balita Hadir &amp; Ditimbang Bulan Ini (D)
                        </td>
                        <td className="border border-black p-2 text-center text-sm font-black">
                          {ditimbangCount} Anak
                        </td>
                        <td className="border border-black p-2">
                          Tingkat Partisipasi (D/S): <strong>{percentDitimbang}%</strong>{' '}
                          {percentDitimbang >= 85 ? (
                            <span className="text-emerald-800 font-bold">(Target Tercapai &ge; 85%)</span>
                          ) : (
                            <span className="text-amber-800 font-bold">(Perlu Peningkatan Kunjungan Rumah)</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 text-center font-bold">4</td>
                        <td className="border border-black p-2">
                          Berat Badan Naik Adekuat Sesuai KBM (N)
                        </td>
                        <td className="border border-black p-2 text-center font-bold">
                          {countN} Anak
                        </td>
                        <td className="border border-black p-2">
                          Kenaikan BB di atas Kenaikan Berat Minimal (KBM Kemenkes).
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 text-center font-bold">5</td>
                        <td className="border border-black p-2 text-amber-900 font-bold">
                          Berat Badan Tidak Naik 1 Kali (T)
                        </td>
                        <td className="border border-black p-2 text-center font-bold text-amber-900">
                          {countT} Anak
                        </td>
                        <td className="border border-black p-2 text-amber-900">
                          Diberikan konseling gizi dan pendampingan pola asuh makan.
                        </td>
                      </tr>
                      <tr className="bg-rose-50 font-bold text-rose-900">
                        <td className="border border-black p-2 text-center">6</td>
                        <td className="border border-black p-2">
                          Weight Faltering / Tidak Naik 2x Berturut (2T)
                        </td>
                        <td className="border border-black p-2 text-center text-sm font-black">
                          {count2T} Anak
                        </td>
                        <td className="border border-black p-2">
                          Prioritas Utama SPK SAW Makanan Bergizi Gratis (MBG) &amp; Rujukan Puskesmas.
                        </td>
                      </tr>
                      <tr className="bg-red-50 font-bold text-red-900">
                        <td className="border border-black p-2 text-center">7</td>
                        <td className="border border-black p-2">
                          Bawah Garis Merah (BGM / Gizi Buruk)
                        </td>
                        <td className="border border-black p-2 text-center text-sm font-black">
                          {countBGM} Anak
                        </td>
                        <td className="border border-black p-2">
                          Kasus gawat darurat stunting. Protokol tatalaksana gizi buruk aktif.
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 text-center font-bold">8</td>
                        <td className="border border-black p-2">
                          Ibu Hamil Risiko KEK (LiLA &lt; 23.5 cm)
                        </td>
                        <td className="border border-black p-2 text-center font-bold">
                          {countBumilKEK} Ibu
                        </td>
                        <td className="border border-black p-2">
                          Menerima formula PMT Pemulihan Bumil &amp; Tablet Tambah Darah (TTD).
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Bagian II: Daftar Rekomendasi Sasaran Rentan Periode Berjalan */}
                <div className="space-y-2 mb-6">
                  <h4 className="font-bold text-black text-xs uppercase tracking-wider">
                    II. Pemantauan Balita Prioritas Intervensi Gizi Periode {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] border-collapse border border-black text-black font-sans">
                      <thead>
                        <tr className="bg-slate-100 font-bold border-b border-black text-center">
                          <th className="border border-black p-1.5 w-8">No</th>
                          <th className="border border-black p-1.5 text-left">Nama Balita</th>
                          <th className="border border-black p-1.5 w-12">JK</th>
                          <th className="border border-black p-1.5 w-14">Usia</th>
                          <th className="border border-black p-1.5 w-16">BB (kg)</th>
                          <th className="border border-black p-1.5 w-16">TB (cm)</th>
                          <th className="border border-black p-1.5 w-14">KMS</th>
                          <th className="border border-black p-1.5 w-24">Z-Score WHO</th>
                          <th className="border border-black p-1.5 text-left">Tindakan / Intervensi Gizi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyPemeriksaan.slice(0, 10).map((item, idx) => {
                          const p = item.periksa;
                          const isUrgent = p?.statusKMS === '2T' || p?.statusKMS === 'BGM';
                          return (
                            <tr key={item.balita.id} className={isUrgent ? 'bg-rose-50/70 font-semibold' : ''}>
                              <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                              <td className="border border-black p-1.5">
                                <strong>{item.balita.nama}</strong>
                                <span className="block text-[9.5px] text-slate-500 font-mono">
                                  NIK: {item.balita.nik.slice(0, 6)}...{item.balita.nik.slice(-4)}
                                </span>
                              </td>
                              <td className="border border-black p-1.5 text-center font-bold">{item.balita.jenisKelamin}</td>
                              <td className="border border-black p-1.5 text-center">{p ? `${p.usiaBulan} bln` : '-'}</td>
                              <td className="border border-black p-1.5 text-center font-bold">{p ? p.beratBadan : '-'}</td>
                              <td className="border border-black p-1.5 text-center">{p ? p.tinggiBadan : '-'}</td>
                              <td className="border border-black p-1.5 text-center">
                                {p ? (
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                                    p.statusKMS === '2T' || p.statusKMS === 'BGM'
                                      ? 'bg-rose-200 text-rose-900 border border-rose-400'
                                      : p.statusKMS === 'T'
                                      ? 'bg-amber-100 text-amber-900'
                                      : 'bg-emerald-100 text-emerald-900'
                                  }`}>
                                    {p.statusKMS}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="border border-black p-1.5 text-center">
                                {p ? (
                                  <div>
                                    <span className="block text-[10px]">{p.statusBBU}</span>
                                    <span className="text-[9.5px] font-mono text-slate-500">
                                      ({p.zScoreBBU > 0 ? `+${p.zScoreBBU}` : p.zScoreBBU} SD)
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="border border-black p-1.5">
                                {p ? (
                                  p.statusKMS === '2T' || p.statusKMS === 'BGM'
                                    ? 'Intervensi MBG Protein Hewani & Rujukan'
                                    : p.statusKMS === 'T'
                                    ? 'Konseling Diet PMT Tambahan'
                                    : 'Pemantauan Asupan Gizi Normal'
                                ) : (
                                  <span className="text-slate-400 italic">Belum ditimbang bulan ini</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bagian III: Pengesahan Formal Dua Pihak (Bidan Pembina & Ketua Posyandu) */}
                <div className="pt-6 text-xs text-black font-sans">
                  <div className="grid grid-cols-2 text-center">
                    {/* Mengetahui: Bidan Pembina */}
                    <div className="flex flex-col justify-between h-36">
                      <div>
                        <p>Mengetahui / Memverifikasi,</p>
                        <p className="font-bold uppercase pt-0.5">
                          Bidan Pembina {kopConfig.puskesmas}
                        </p>
                      </div>
                      <div>
                        <p className="font-bold underline underline-offset-4">
                          {kopConfig.namaBidan}
                        </p>
                        <p className="text-[10px] font-mono mt-0.5">
                          NIP. {kopConfig.nipBidan || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Pelaksana: Ketua Posyandu */}
                    <div className="flex flex-col justify-between h-36">
                      <div>
                        <p>Ditetapkan pada: 15 {MONTH_NAMES[selectedMonth - 1]} {selectedYear}</p>
                        <p className="font-bold uppercase pt-0.5">
                          Pengelola &amp; Admin {kopConfig.namaPosyandu}
                        </p>
                      </div>
                      <div>
                        <p className="font-bold underline underline-offset-4">
                          {kopConfig.namaKetua}
                        </p>
                        <p className="text-[10px] font-mono mt-0.5">
                          Ketua Penanggung Jawab Posyandu
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* MODAL KUSTOMISASI KOP SURAT (LIVE EDITING) */}
      {isCustomKopOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#fff0f2] text-[#80000f] flex items-center justify-center font-bold">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Kustomisasi Kop Surat — {activeTenantName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sesuaikan identitas lembaga, logo, dan penandatangan dokumen resmi untuk {activeTenantName}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomKopOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomKop} className="space-y-4 text-xs">
              {/* Upload & Pratinjau Logo Posyandu */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  <img
                    src={kopForm.logoPosyandu || '/images/logo-posyandu.png'}
                    alt="Logo Kop"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <label className="font-bold text-slate-800 block">Logo Kop Surat</label>
                  <p className="text-[11px] text-slate-500">
                    Gunakan logo resmi posyandu Anda untuk dicetak pada lembar A4.
                  </p>
                  <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-[11px] cursor-pointer inline-flex items-center gap-1.5 shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Ganti File Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Teks Lembaga & Dinas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Baris 1: Pemerintah Daerah</label>
                  <input
                    type="text"
                    required
                    value={kopForm.pemerintahDaerah}
                    onChange={(e) => setKopForm({ ...kopForm, pemerintahDaerah: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f] font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Baris 2: Dinas Kesehatan</label>
                  <input
                    type="text"
                    required
                    value={kopForm.dinasKesehatan}
                    onChange={(e) => setKopForm({ ...kopForm, dinasKesehatan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f] font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Baris 3: UPTD Puskesmas Pembina</label>
                  <input
                    type="text"
                    required
                    value={kopForm.puskesmas}
                    onChange={(e) => setKopForm({ ...kopForm, puskesmas: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f] font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Baris 4: Nama Posyandu</label>
                  <input
                    type="text"
                    required
                    value={kopForm.namaPosyandu}
                    onChange={(e) => setKopForm({ ...kopForm, namaPosyandu: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f] font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Baris 5: Alamat Lengkap &amp; Kode Pos</label>
                <textarea
                  rows={2}
                  required
                  value={kopForm.alamat}
                  onChange={(e) => setKopForm({ ...kopForm, alamat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Baris 6: Kontak (Telepon / WhatsApp / Email)</label>
                <input
                  type="text"
                  required
                  value={kopForm.kontak}
                  onChange={(e) => setKopForm({ ...kopForm, kontak: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f]"
                />
              </div>

              {/* Tanda Tangan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama Ketua Posyandu</label>
                  <input
                    type="text"
                    required
                    value={kopForm.namaKetua}
                    onChange={(e) => setKopForm({ ...kopForm, namaKetua: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama Bidan Pembina</label>
                  <input
                    type="text"
                    required
                    value={kopForm.namaBidan}
                    onChange={(e) => setKopForm({ ...kopForm, namaBidan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">NIP Bidan Pembina</label>
                  <input
                    type="text"
                    value={kopForm.nipBidan || ''}
                    onChange={(e) => setKopForm({ ...kopForm, nipBidan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-[#80000f]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetKop}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset ke Standar Profil</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomKopOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#80000f] hover:bg-[#66000c] text-white font-bold transition-all shadow-md hover:scale-102 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Terapkan Kop Surat</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        balitaList={balitaList}
        pemeriksaanList={pemeriksaanList}
        bumilList={bumilList}
        lansiaList={lansiaList}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
    </div>
  );
}
