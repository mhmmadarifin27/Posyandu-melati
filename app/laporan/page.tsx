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
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ExportReportModal from '@/components/ExportReportModal';
import { PosyanduStore } from '@/lib/supabase';
import { Balita, PemeriksaanBalita, IbuHamil, Lansia, UserRole } from '@/types/posyandu';
import { toast } from '@/components/ui/custom-toast';

export default function LaporanPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>('bidan');
  const [balitaList, setBalitaList] = useState<Balita[]>([]);
  const [pemeriksaanList, setPemeriksaanList] = useState<PemeriksaanBalita[]>([]);
  const [bumilList, setBumilList] = useState<IbuHamil[]>([]);
  const [lansiaList, setLansiaList] = useState<Lansia[]>([]);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // State Pilihan Periode Bulan & Tahun Pelaporan
  const [selectedMonth, setSelectedMonth] = useState<number>(10); // Default Oktober (1-12)
  const [selectedYear, setSelectedYear] = useState<number>(2026); // Default 2026

  const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const ROMAN_MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

  useEffect(() => {
    setBalitaList(PosyanduStore.getBalita());
    setPemeriksaanList(PosyanduStore.getPemeriksaan());
    setBumilList(PosyanduStore.getBumil());
    setLansiaList(PosyanduStore.getLansia());

    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('posyandu_active_role');
      if (savedRole === 'kader' || savedRole === 'bidan') {
        setCurrentRole(savedRole as UserRole);
      }
    }
  }, []);

  const handlePrint = () => {
    toast.info('Menyiapkan Lembar Cetak', 'Membuka dialog cetak laporan resmi Puskesmas.');
    window.print();
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

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <div className="no-print">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="no-print">
          <Header currentRole={currentRole} onRoleChange={setCurrentRole} />
        </div>

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {currentRole === 'kader' ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-[#fce1e4] shadow-sm text-center max-w-xl mx-auto my-12 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#fff5f6] border border-[#fce1e4] text-[#80000f] flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-8 h-8 text-[#80000f]" />
              </div>
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase bg-[#fce1e4] text-[#80000f] border border-[#f8c8c8]">
                  Wewenang Khusus Bidan Desa
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Akses Laporan Resmi Puskesmas Dibatasi
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                  Pencetakan dokumen resmi ber-kop Puskesmas, pengesahan tanda tangan hukum, serta ekspor file rekapitulasi data kependudukan (CSV) merupakan kewenangan Bidan Desa / Tenaga Kesehatan Penanggung Jawab.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#80000f] hover:bg-[#66000c] text-white text-xs font-bold transition-all shadow-md hover:scale-102"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Dashboard Kader</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Action Header - Disembunyikan saat cetak */}
              <div className="no-print space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#fff5f6] border border-[#fce1e4] text-[#80000f] flex items-center justify-center font-bold shadow-2xs">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                          Laporan Rekapitulasi Posyandu Melati
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          Format cetak dinas resmi bertanda tangan &bull; Dilengkapi Kop Surat Provinsi Sumatera Selatan &amp; Posyandu Melati
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      onClick={() => setIsExportOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#fff5f6] text-slate-800 hover:text-[#80000f] font-bold text-xs border border-[#fce1e4] shadow-2xs transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#80000f]" />
                      <span>Ekspor CSV</span>
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

            {/* Filter Bar Periode Laporan Bulanan */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
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

          {/* DOKUMEN CETAK RESMI FORMAT KERTAS A4 PEMERINTAH (FORMAL HITAM PUTIH DINAS) */}
          <div className="bg-white rounded-xl p-8 sm:p-12 border border-slate-300 shadow-sm max-w-[210mm] mx-auto text-black font-serif print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:rounded-none">
            {/* ========================================================================= */}
            {/* KOP SURAT DINAS RESMI (LOGO SUMSEL - TEKS RESMI - LOGO POSYANDU)          */}
            {/* ========================================================================= */}
            <div className="flex items-center justify-between gap-4 pb-2">
              {/* Logo Kiri: Lambang Resmi Provinsi Sumatera Selatan */}
              <div className="w-20 shrink-0 flex items-center justify-center">
                <img
                  src="/images/logo-sumsel.png"
                  alt="Lambang Provinsi Sumatera Selatan"
                  className="h-20 w-auto object-contain"
                />
              </div>

              {/* Teks Kop Surat Dinas Formal */}
              <div className="flex-1 text-center space-y-0.5">
                <h3 className="font-serif font-black text-sm uppercase tracking-wider text-black leading-tight">
                  Pemerintah Provinsi Sumatera Selatan
                </h3>
                <h4 className="font-sans font-bold text-xs uppercase tracking-wide text-black leading-tight">
                  Dinas Kesehatan Kota Palembang
                </h4>
                <h4 className="font-sans font-extrabold text-xs uppercase tracking-wide text-black leading-tight">
                  UPTD Puskesmas Pembina
                </h4>
                <h2 className="font-serif font-black text-sm sm:text-base uppercase tracking-widest text-black leading-tight pt-0.5">
                  Posyandu Melati RW 03 Kelurahan Sukamaju
                </h2>
                <p className="text-[10px] text-black leading-tight pt-1 font-sans">
                  Jl. Sukamaju Raya No. 03 RT 12 RW 03, Kel. Sukamaju, Kec. Sako, Palembang, Sumatera Selatan 30164
                </p>
                <p className="text-[9.5px] text-black font-sans leading-tight">
                  Posko Pelayanan: 0812-7890-1234 &bull; Email: posyandumelati.rw03@sumselprov.go.id &bull; Kode Pos: 30164
                </p>
              </div>

              {/* Logo Kanan: Logo Resmi Posyandu Melati */}
              <div className="w-20 shrink-0 flex items-center justify-center">
                <img
                  src="/images/logo-posyandu.png"
                  alt="Logo Posyandu Melati"
                  className="h-20 w-auto object-contain"
                />
              </div>
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
                Nomor: 440 / 108 / PUSK-PEMB / {ROMAN_MONTHS[selectedMonth - 1]} / {selectedYear}
              </p>
            </div>

            {/* Identitas Wilayah & Periode Pelaporan (Format List Formal Tanpa Kotak) */}
            <div className="mb-5 text-xs text-black font-sans leading-relaxed">
              <table className="w-full border-none">
                <tbody>
                  <tr>
                    <td className="w-36 font-semibold py-0.5">Wilayah Kerja</td>
                    <td className="w-4 py-0.5">:</td>
                    <td className="py-0.5">RW 03 Sukamaju, Kecamatan Sako, Kota Palembang</td>
                    <td className="w-36 font-semibold py-0.5 pl-4">Bulan / Tahun</td>
                    <td className="w-4 py-0.5">:</td>
                    <td className="py-0.5 font-bold">{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-0.5">Puskesmas Pembina</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5">UPTD Puskesmas Pembina Palembang</td>
                    <td className="font-semibold py-0.5 pl-4">Bidan Pembina</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5">Bdn. Siti Rahma, S.Tr.Keb</td>
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
                    <td className="border border-black p-1.5 text-center">1</td>
                    <td className="border border-black p-1.5 font-semibold">Total Sasaran Balita Terdaftar (S)</td>
                    <td className="border border-black p-1.5 text-center font-bold">{balitaList.length} Anak</td>
                    <td className="border border-black p-1.5">100% Kohort Balita Usia 0–59 Bulan Terdata di RW 03</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5 text-center">2</td>
                    <td className="border border-black p-1.5 font-semibold">Balita Memiliki Buku KIA / KMS (K)</td>
                    <td className="border border-black p-1.5 text-center font-bold">{balitaList.length} Anak</td>
                    <td className="border border-black p-1.5">Cakupan K/S: 100% (Seluruh balita memiliki KMS/Buku KIA)</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5 text-center">3</td>
                    <td className="border border-black p-1.5 font-semibold">Balita Ditimbang Bulan Ini (D)</td>
                    <td className="border border-black p-1.5 text-center font-bold">{ditimbangCount} Anak</td>
                    <td className="border border-black p-1.5">Cakupan D/S: {percentDitimbang}% ({ditimbangCount} dari {balitaList.length} balita ditimbang)</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5 text-center">4</td>
                    <td className="border border-black p-1.5">Balita Naik Berat Badan (N)</td>
                    <td className="border border-black p-1.5 text-center font-bold">{countN} Anak</td>
                    <td className="border border-black p-1.5">Pertumbuhan memadai mengikuti garis kurva pertumbuhan WHO</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5 text-center">5</td>
                    <td className="border border-black p-1.5">Balita Tidak Naik Berat Badan (T)</td>
                    <td className="border border-black p-1.5 text-center font-bold">{countT} Anak</td>
                    <td className="border border-black p-1.5">Edukasi pemenuhan asupan kalori &amp; konsultasi PMBA pada ibu</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5 text-center">6</td>
                    <td className="border border-black p-1.5">Weight Faltering / Risiko Stunting (2T)</td>
                    <td className="border border-black p-1.5 text-center font-bold">{count2T} Anak</td>
                    <td className="border border-black p-1.5">Prioritas Utama Distribusi Paket Menu Tambahan Bergizi (MBG)</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5 text-center">7</td>
                    <td className="border border-black p-1.5">Balita Bawah Garis Merah (BGM)</td>
                    <td className="border border-black p-1.5 text-center font-bold">{countBGM} Anak</td>
                    <td className="border border-black p-1.5">Rujukan pemeriksaan medis intensif &amp; tatalaksana gizi Puskesmas</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5 text-center">8</td>
                    <td className="border border-black p-1.5">Ibu Hamil Risiko KEK (LiLA &lt; 23.5 cm)</td>
                    <td className="border border-black p-1.5 text-center font-bold">{countBumilKEK} Orang</td>
                    <td className="border border-black p-1.5">Dari total {bumilList.length} Ibu Hamil; Diberikan biskuit PMT &amp; Tablet TTD</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1.5 text-center">9</td>
                    <td className="border border-black p-1.5">Sasaran Posyandu Lansia Terlayani</td>
                    <td className="border border-black p-1.5 text-center font-bold">{lansiaList.length} Orang</td>
                    <td className="border border-black p-1.5">Pemeriksaan tensi darah, skrining PTM, dan bimbingan pola hidup sehat</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bagian II: Tabel Detail Balita Standar e-PPGBM Kemenkes RI */}
            <div className="space-y-2 mb-6">
              <h4 className="font-bold text-black text-xs uppercase tracking-wider">
                II. Data Individual Hasil Penimbangan Balita (Bulan {MONTH_NAMES[selectedMonth - 1]} {selectedYear})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10.5px] border-collapse border border-black text-black font-sans">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-black text-center">
                      <th className="border border-black p-1.5 w-7">No</th>
                      <th className="border border-black p-1.5 w-28">NIK Balita</th>
                      <th className="border border-black p-1.5 text-left">Nama Balita / Ibu</th>
                      <th className="border border-black p-1.5 w-8">JK</th>
                      <th className="border border-black p-1.5 w-12">Usia</th>
                      <th className="border border-black p-1.5 w-14 text-right">BB (kg)</th>
                      <th className="border border-black p-1.5 w-14 text-right">TB (cm)</th>
                      <th className="border border-black p-1.5 w-20 text-center">Z-Score</th>
                      <th className="border border-black p-1.5 w-16 text-center">Status</th>
                      <th className="border border-black p-1.5 text-left">Tindakan / Rekomendasi Medis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyPemeriksaan.map((item, idx) => {
                      const b = item.balita;
                      const last = item.periksa;

                      return (
                        <tr key={b.id} className="border-b border-black">
                          <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                          <td className="border border-black p-1.5 text-center font-mono text-[9.5px]">{b.nik}</td>
                          <td className="border border-black p-1.5">
                            <span className="font-bold">{b.nama}</span>
                            <span className="text-[9.5px] text-slate-700 block">Ibu: {b.namaIbu}</span>
                          </td>
                          <td className="border border-black p-1.5 text-center font-semibold">{b.jenisKelamin}</td>
                          <td className="border border-black p-1.5 text-center">{last ? `${last.usiaBulan} bln` : '-'}</td>
                          <td className="border border-black p-1.5 text-right font-bold">{last ? last.beratBadan.toFixed(1) : '-'}</td>
                          <td className="border border-black p-1.5 text-right">{last ? last.tinggiBadan.toFixed(1) : '-'}</td>
                          <td className="border border-black p-1.5 text-center font-mono text-[10px]">
                            {last ? `${last.zScoreBBU.toFixed(2)} SD` : '-'}
                          </td>
                          <td className="border border-black p-1.5 text-center font-bold">
                            {last ? last.statusKMS : '-'}
                          </td>
                          <td className="border border-black p-1.5 text-[10px]">
                            {last ? (
                              last.statusKMS === '2T'
                                ? 'Weight Faltering: Alokasi Menu Tambahan MBG Protein Hewani'
                                : last.statusKMS === 'BGM'
                                ? 'Bawah Garis Merah: Intervensi Khusus Puskesmas & Menu MBG'
                                : last.statusKMS === 'N'
                                ? 'Pertumbuhan Normal: Pemantauan Rutin Bulan Depan'
                                : 'Pemantauan Asupan Gizi & Edukasi Ibu Balita'
                            ) : (
                              <span className="text-slate-600 italic">
                                Belum ditimbang pada periode {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bagian III: Pengesahan Formal Dua Pihak (Bidan Pembina & Ketua Kader) */}
            <div className="pt-6 text-xs text-black font-sans">
              <div className="grid grid-cols-2 text-center">
                {/* Mengetahui: Bidan Pembina Puskesmas Pembina */}
                <div className="flex flex-col justify-between h-36">
                  <div>
                    <p>Mengetahui / Memverifikasi,</p>
                    <p className="font-bold uppercase pt-0.5">
                      Bidan Pembina Puskesmas Pembina
                    </p>
                  </div>
                  <div>
                    <p className="font-bold underline underline-offset-4">
                      Bdn. Siti Rahma, S.Tr.Keb
                    </p>
                    <p className="text-[10px] font-mono mt-0.5">
                      NIP. 19880415 201101 2 004
                    </p>
                  </div>
                </div>

                {/* Pelaksana: Ketua Kader Posyandu Melati RW 03 */}
                <div className="flex flex-col justify-between h-36">
                  <div>
                    <p>Palembang, 15 {MONTH_NAMES[selectedMonth - 1]} {selectedYear}</p>
                    <p className="font-bold uppercase pt-0.5">
                      Ketua Kader Posyandu Melati RW 03
                    </p>
                  </div>
                  <div>
                    <p className="font-bold underline underline-offset-4">
                      Ny. Anisa Rahmawati
                    </p>
                    <p className="text-[10px] font-mono mt-0.5">
                      No. Reg. Kader: 16.71.04.2003.01
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
