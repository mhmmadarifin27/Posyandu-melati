'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Baby,
  Plus,
  Scale,
  Search,
  LineChart,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  Users,
  Check,
  ChevronRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AddWeighingModal from '@/components/AddWeighingModal';
import KMSLegendCard from '@/components/KMSLegendCard';
import { PosyanduStore } from '@/lib/supabase';
import { Balita, PemeriksaanBalita, UserRole, KMS_STATUS_INFO } from '@/types/posyandu';
import { toast } from '@/components/ui/custom-toast';

export default function BalitaPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>('kader');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mode Tampilan: 'sesi_bulan_ini' (Data pemeriksaan bulan ini) vs 'semua_tersimpan' (Master data kohort tersimpan)
  const [viewMode, setViewMode] = useState<'sesi_bulan_ini' | 'semua_tersimpan'>('sesi_bulan_ini');

  // Filter Bulan & Tahun Pelayanan Sesi
  const [selectedMonth, setSelectedMonth] = useState<number>(10); // Default Oktober (1-12)
  const [selectedYear, setSelectedYear] = useState<number>(2026); // Default 2026

  // Sub-filter status kehadiran di bulan ini: 'semua' | 'sudah' | 'belum'
  const [kehadiranFilter, setKehadiranFilter] = useState<'semua' | 'sudah' | 'belum'>('semua');

  const [balitaList, setBalitaList] = useState<Balita[]>([]);
  const [pemeriksaanList, setPemeriksaanList] = useState<PemeriksaanBalita[]>([]);
  const [isWeighingOpen, setIsWeighingOpen] = useState<boolean>(false);
  const [activeBalitaId, setActiveBalitaId] = useState<string>('');
  
  // Modal Tambah Balita
  const [isAddBalitaOpen, setIsAddBalitaOpen] = useState<boolean>(false);
  const [newNama, setNewNama] = useState('');
  const [newNik, setNewNik] = useState('');
  const [newJK, setNewJK] = useState<'L' | 'P'>('L');
  const [newTglLahir, setNewTglLahir] = useState('2024-02-10');
  const [newNamaIbu, setNewNamaIbu] = useState('');
  const [newNamaAyah, setNewNamaAyah] = useState('');
  const [newAlamat, setNewAlamat] = useState('RT 01 / RW 01');
  const [newNoHp, setNewNoHp] = useState('08123456789');

  // Modal Edit Balita
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editBalita, setEditBalita] = useState<Balita | null>(null);

  const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const loadData = () => {
    setBalitaList(PosyanduStore.getBalita());
    setPemeriksaanList(PosyanduStore.getPemeriksaan());
    PosyanduStore.syncFromSupabase().then(() => {
      setBalitaList(PosyanduStore.getBalita());
      setPemeriksaanList(PosyanduStore.getPemeriksaan());
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Cek apakah NIK yang diketik sudah terdaftar (Pencegah Duplikasi)
  const existingBalitaByNik = newNik.trim()
    ? balitaList.find((b) => b.nik.trim() === newNik.trim())
    : null;

  // Simpan Balita Baru
  const handleSaveBalita = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newNik.trim() || newNik.trim().length < 8) {
      toast.warning('NIK Belum Valid', 'Mohon isi NIK dengan minimal 8-16 digit angka resmi.');
      return;
    }

    if (existingBalitaByNik) {
      toast.warning(
        'NIK Sudah Terdaftar',
        `NIK ${newNik} sudah terdaftar atas nama ananda ${existingBalitaByNik.nama}. Silakan langsung catat penimbangannya.`
      );
      return;
    }

    const newB: Balita = {
      id: `b-${Date.now()}`,
      nik: newNik.trim(),
      nama: newNama.trim(),
      jenisKelamin: newJK,
      tanggalLahir: newTglLahir,
      namaIbu: newNamaIbu.trim(),
      namaAyah: newNamaAyah.trim() || '-',
      alamat: newAlamat.trim() || 'RT 01 / RW 01',
      rt: '01',
      rw: '01',
      posyandu: 'Posyandu Melati',
      noHp: newNoHp.trim() || '08123456789',
      desilEkonomi: 2,
      statusBansos: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    PosyanduStore.addBalita(newB);
    toast.success('Balita Berhasil Didaftarkan', `Ananda ${newNama} (NIK: ${newNik}) berhasil terdaftar di master data RW 03.`);
    setIsAddBalitaOpen(false);
    resetAddForm();
    loadData();
  };

  const resetAddForm = () => {
    setNewNama('');
    setNewNik('');
    setNewNamaIbu('');
    setNewNamaAyah('');
    setNewAlamat('RT 01 / RW 01');
    setNewNoHp('08123456789');
  };

  // Buka Modal Edit
  const handleOpenEdit = (balita: Balita) => {
    setEditBalita({ ...balita });
    setIsEditModalOpen(true);
  };

  // Simpan Perubahan Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBalita) return;

    PosyanduStore.updateBalita(editBalita);
    toast.success('Profil Balita Diperbarui', `Data ananda ${editBalita.nama} berhasil diperbarui.`);
    setIsEditModalOpen(false);
    setEditBalita(null);
    loadData();
  };

  // Hapus Balita dari Master Data
  const handleDeleteBalita = (b: Balita) => {
    toast.confirm({
      title: 'Hapus Data Balita',
      description: `Apakah Anda yakin ingin menghapus ananda ${b.nama} (NIK: ${b.nik}) dari master sasaran Posyandu Melati? Seluruh riwayat penimbangan terkait akan terhapus.`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger',
      onConfirm: () => {
        PosyanduStore.deleteBalita(b.id);
        toast.success('Data Balita Dihapus', `Data ananda ${b.nama} telah dihapus dari sistem.`);
        loadData();
      },
    });
  };

  // Filter Berdasarkan Bulan yang Dipilih
  const targetMonthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  const balitaWithMonthExam = balitaList.map((b) => {
    const records = pemeriksaanList
      .filter((p) => p.balitaId === b.id && p.tanggalPeriksa.startsWith(targetMonthStr))
      .sort((x, y) => new Date(y.tanggalPeriksa).getTime() - new Date(x.tanggalPeriksa).getTime());
    return {
      balita: b,
      periksaBulanIni: records[0] || null,
    };
  });

  const weighedInMonth = balitaWithMonthExam.filter((item) => item.periksaBulanIni !== null);
  const unweighedInMonth = balitaWithMonthExam.filter((item) => item.periksaBulanIni === null);

  // Filter Pencarian
  const filteredList = balitaWithMonthExam.filter(({ balita, periksaBulanIni }) => {
    // 1. Filter Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = balita.nama.toLowerCase().includes(q);
      const matchIbu = balita.namaIbu.toLowerCase().includes(q);
      const matchNik = balita.nik.includes(q);
      if (!matchName && !matchIbu && !matchNik) return false;
    }

    // 2. Filter Tab Sesi Bulan Ini (Kehadiran)
    if (viewMode === 'sesi_bulan_ini') {
      if (kehadiranFilter === 'sudah' && !periksaBulanIni) return false;
      if (kehadiranFilter === 'belum' && periksaBulanIni) return false;
    }

    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#f5f7f9]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header currentRole={currentRole} onRoleChange={setCurrentRole} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#fff5f6] border border-[#fce1e4] text-[#80000f] flex items-center justify-center font-bold shadow-2xs">
                  <Baby className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Data Sasaran Balita &amp; Pelayanan
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Posyandu Melati RW 03 &bull; Terhubung dengan NIK resmi, register kohort bulanan, dan grafik kurva WHO.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setIsAddBalitaOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-[#fff5f6] text-slate-700 hover:text-[#80000f] font-bold text-xs border border-slate-300 hover:border-[#fce1e4] shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#80000f]" />
                <span>Registrasi Balita Baru (NIK)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveBalitaId(balitaList[0]?.id || '');
                  setIsWeighingOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#80000f] hover:bg-[#66000c] text-white font-bold text-xs shadow-md shadow-[#80000f]/20 transition-transform hover:scale-102 cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Catat Penimbangan Baru</span>
              </button>
            </div>
          </div>

          {/* DUA TAB NAVIGASI UTAMA (MEMBEDAKAN SESI BULAN INI VS SEMUA DATA TERSIMPAN) */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setViewMode('sesi_bulan_ini')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'sesi_bulan_ini'
                  ? 'bg-[#80000f] text-white shadow-md shadow-[#80000f]/20'
                  : 'bg-white text-slate-600 hover:bg-[#fff5f6] border border-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>📋 Pelayanan Sesi Bulan Ini ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('semua_tersimpan')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'semua_tersimpan'
                  ? 'bg-[#80000f] text-white shadow-md shadow-[#80000f]/20'
                  : 'bg-white text-slate-600 hover:bg-[#fff5f6] border border-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>👥 Semua Data Tersimpan (Master Kohort: {balitaList.length} Anak)</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: PELAYANAN SESI BULAN INI (KEHADIRAN & STATUS TIMBANG BULANAN)      */}
          {/* ========================================================================= */}
          {viewMode === 'sesi_bulan_ini' && (
            <div className="space-y-4">
              {/* Bilah Pemilih Bulan & Ringkasan Kehadiran */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#fff5f6] border border-[#fce1e4] text-[#80000f] flex items-center justify-center font-bold shadow-2xs shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Periode Penimbangan Posyandu
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          weighedInMonth.length > 0
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {weighedInMonth.length > 0 ? 'Sesi Berlangsung' : 'Belum Ada Penimbangan (0)'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Capaian: <strong>{weighedInMonth.length}</strong> sudah ditimbang &bull; <strong>{unweighedInMonth.length}</strong> belum ditimbang dari total {balitaList.length} balita terdaftar.
                    </p>
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

                  {/* Quick Switcher Chips */}
                  <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMonth(10);
                        setSelectedYear(2026);
                      }}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                        selectedMonth === 10 && selectedYear === 2026
                          ? 'bg-[#80000f] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Okt 2026
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
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Nov 2026 (0)
                    </button>
                  </div>
                </div>
              </div>

              {/* Sub-Filter Kehadiran & Search */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                  <span className="font-bold text-slate-700">Filter Status:</span>
                  <button
                    type="button"
                    onClick={() => setKehadiranFilter('semua')}
                    className={`px-3 py-1.5 rounded-full font-bold text-[11px] transition-colors cursor-pointer ${
                      kehadiranFilter === 'semua'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Semua ({balitaList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setKehadiranFilter('sudah')}
                    className={`px-3 py-1.5 rounded-full font-bold text-[11px] transition-colors cursor-pointer ${
                      kehadiranFilter === 'sudah'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    ✓ Sudah Ditimbang ({weighedInMonth.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setKehadiranFilter('belum')}
                    className={`px-3 py-1.5 rounded-full font-bold text-[11px] transition-colors cursor-pointer ${
                      kehadiranFilter === 'belum'
                        ? 'bg-amber-700 text-white'
                        : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    ⏳ Belum Ditimbang ({unweighedInMonth.length})
                  </button>
                </div>

                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari balita, NIK, atau ibu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-1.5 bg-slate-50 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 font-medium"
                  />
                </div>
              </div>

              {/* Tabel Pelayanan Bulan Ini */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <th className="p-3">Balita &amp; NIK Resmi</th>
                        <th className="p-3">Ibu Kandung</th>
                        <th className="p-3 text-center">Kehadiran Bulan Ini</th>
                        <th className="p-3 text-right">BB Bulan Ini</th>
                        <th className="p-3 text-right">TB Bulan Ini</th>
                        <th className="p-3 text-center">Z-Score BB/U</th>
                        <th className="p-3 text-center">Status KMS</th>
                        <th className="p-3 text-center">Aksi Sesi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredList.map(({ balita: b, periksaBulanIni: p }) => {
                        const kmsInfo = p ? KMS_STATUS_INFO[p.statusKMS] : null;

                        return (
                          <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm">{b.nama}</span>
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    b.jenisKelamin === 'L'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-[#fff5f6] text-[#80000f] border border-[#fce1e4]'
                                  }`}
                                >
                                  {b.jenisKelamin === 'L' ? 'L' : 'P'}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                                <span>NIK: {b.nik}</span>
                                <span>&bull;</span>
                                <span>Lahir: {b.tanggalLahir}</span>
                              </div>
                            </td>

                            <td className="p-3 text-slate-700 font-medium">
                              Ny. {b.namaIbu}
                            </td>

                            <td className="p-3 text-center">
                              {p ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10.5px] bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                                  <Check className="w-3 h-3 text-emerald-700" />
                                  <span>Sudah Ditimbang</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10.5px] bg-amber-50 text-amber-800 border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Belum Ditimbang</span>
                                </span>
                              )}
                            </td>

                            <td className="p-3 text-right font-bold text-slate-900">
                              {p ? `${p.beratBadan} kg` : <span className="text-slate-400 font-normal">-</span>}
                            </td>

                            <td className="p-3 text-right font-medium text-slate-700">
                              {p ? `${p.tinggiBadan} cm` : <span className="text-slate-400 font-normal">-</span>}
                            </td>

                            <td className="p-3 text-center">
                              {p ? (
                                <span
                                  className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                    p.zScoreBBU < -3
                                      ? 'bg-red-100 text-red-800 font-bold border border-red-200'
                                      : p.zScoreBBU < -2
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : 'bg-[#fff5f6] text-[#80000f] border border-[#fce1e4]'
                                  }`}
                                >
                                  {p.zScoreBBU} SD
                                </span>
                              ) : (
                                <span className="text-slate-400 font-normal">-</span>
                              )}
                            </td>

                            <td className="p-3 text-center">
                              {p && kmsInfo ? (
                                <span
                                  className={`px-2.5 py-1 rounded-full font-bold text-[11px] border ${kmsInfo.warnaBadge}`}
                                  title={kmsInfo.arti}
                                >
                                  {p.statusKMS} - {kmsInfo.nama}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-normal">-</span>
                              )}
                            </td>

                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveBalitaId(b.id);
                                    setIsWeighingOpen(true);
                                  }}
                                  className={`px-3 py-1 rounded-full font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                                    p
                                      ? 'bg-slate-100 hover:bg-[#fff5f6] text-slate-700 hover:text-[#80000f] border border-slate-300'
                                      : 'bg-[#80000f] hover:bg-[#66000c] text-white shadow-xs hover:scale-102'
                                  }`}
                                >
                                  <Scale className="w-3 h-3" />
                                  <span>{p ? 'Update BB' : 'Timbang Sekarang'}</span>
                                </button>

                                <Link
                                  href={`/e-kms?id=${b.id}`}
                                  className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                                >
                                  <LineChart className="w-3 h-3" />
                                  <span>E-KMS</span>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: SEMUA DATA TERSIMPAN (MASTER KOHORT WARGA RW 03 DENGAN EDIT/HAPUS) */}
          {/* ========================================================================= */}
          {viewMode === 'semua_tersimpan' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Master Data Balita Terdaftar ({balitaList.length} Anak)
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Data induk kependudukan balita RW 03 Sukamaju. Anda dapat mengedit identitas atau menghapus data jika anak pindah domisili.
                  </p>
                </div>

                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari NIK, nama balita, atau orang tua..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-1.5 bg-slate-50 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 font-medium"
                  />
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <th className="p-3 w-10 text-center">No</th>
                        <th className="p-3">NIK Resmi (16 Digit)</th>
                        <th className="p-3">Nama Lengkap Balita</th>
                        <th className="p-3 text-center">JK</th>
                        <th className="p-3">Tanggal Lahir</th>
                        <th className="p-3">Orang Tua (Ibu / Ayah)</th>
                        <th className="p-3">Alamat Domisili</th>
                        <th className="p-3 text-center">Aksi Manajemen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {balitaList
                        .filter((b) => {
                          if (!searchQuery) return true;
                          const q = searchQuery.toLowerCase();
                          return (
                            b.nama.toLowerCase().includes(q) ||
                            b.nik.includes(q) ||
                            b.namaIbu.toLowerCase().includes(q)
                          );
                        })
                        .map((b, idx) => (
                          <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 text-center text-slate-500 font-medium">{idx + 1}</td>
                            <td className="p-3 font-mono font-bold text-slate-900">
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                                {b.nik}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-slate-900 text-sm">
                              {b.nama}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  b.jenisKelamin === 'L'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-[#fff5f6] text-[#80000f] border border-[#fce1e4]'
                                }`}
                              >
                                {b.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-700">
                              {b.tanggalLahir}
                            </td>
                            <td className="p-3 text-slate-700">
                              <div>Ibu: <strong>{b.namaIbu}</strong></div>
                              <div className="text-[10.5px] text-slate-400">Ayah: {b.namaAyah}</div>
                            </td>
                            <td className="p-3 text-slate-700">
                              {b.alamat}
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(b)}
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 transition-colors cursor-pointer"
                                  title="Edit Data Balita"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBalita(b)}
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
                                  title="Hapus Data Balita"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <Link
                                  href={`/e-kms?id=${b.id}`}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#80000f] hover:text-white text-slate-700 font-bold text-[11px] transition-all"
                                  title="Buka Grafik E-KMS"
                                >
                                  E-KMS
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Panduan Visual Kode Status KMS */}
          <KMSLegendCard />
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL REGISTRASI BALITA BARU (LENGKAP DENGAN NIK 16 DIGIT & AUTOCHECK)     */}
      {/* ========================================================================= */}
      {isAddBalitaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 sm:p-7 space-y-5 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Registrasi Sasaran Balita Baru
                </h3>
                <p className="text-xs text-slate-500">
                  Masukkan NIK 16 digit anak sebagai identitas unik utama di Posyandu Melati.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddBalitaOpen(false);
                  resetAddForm();
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBalita} className="space-y-4">
              {/* Field NIK 16 Digit dengan Deteksi Duplikasi Realtime */}
              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Nomor Induk Kependudukan (NIK Balita) <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="Contoh: 1671041510200001 (16 digit angka)"
                  value={newNik}
                  onChange={(e) => setNewNik(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
                />
                {existingBalitaByNik && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 space-y-1">
                    <p className="font-bold flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>NIK Sudah Terdaftar:</span>
                    </p>
                    <p className="text-[11px]">
                      Ananda <strong>{existingBalitaByNik.nama}</strong> (Ibu: {existingBalitaByNik.namaIbu}) telah ada di data tersimpan. Tidak perlu didaftarkan ulang!
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddBalitaOpen(false);
                        setActiveBalitaId(existingBalitaByNik.id);
                        setIsWeighingOpen(true);
                      }}
                      className="mt-1 px-3 py-1 rounded-lg bg-amber-700 text-white font-bold text-[10.5px] hover:bg-amber-800"
                    >
                      Langsung Timbang {existingBalitaByNik.nama} Bulan Ini
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Balita <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap anak sesuai Akta / KIA"
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin:</label>
                  <select
                    value={newJK}
                    onChange={(e) => setNewJK(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir:</label>
                  <input
                    type="date"
                    required
                    value={newTglLahir}
                    onChange={(e) => setNewTglLahir(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Ibu Kandung <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Ibu"
                    value={newNamaIbu}
                    onChange={(e) => setNewNamaIbu(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Ayah:</label>
                  <input
                    type="text"
                    placeholder="Nama Ayah"
                    value={newNamaAyah}
                    onChange={(e) => setNewNamaAyah(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alamat Domisili:</label>
                  <input
                    type="text"
                    value={newAlamat}
                    onChange={(e) => setNewAlamat(e.target.value)}
                    placeholder="RT 01 / RW 01"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No WhatsApp / HP:</label>
                  <input
                    type="text"
                    value={newNoHp}
                    onChange={(e) => setNewNoHp(e.target.value)}
                    placeholder="08123456789"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddBalitaOpen(false);
                    resetAddForm();
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={Boolean(existingBalitaByNik)}
                  className="px-5 py-2 rounded-xl bg-[#80000f] hover:bg-[#66000c] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold shadow-md shadow-[#80000f]/20 cursor-pointer"
                >
                  Simpan Balita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EDIT DATA BALITA (KOREKSI DATA INDUK)                                */}
      {/* ========================================================================= */}
      {isEditModalOpen && editBalita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 sm:p-7 space-y-5 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Data Induk Balita
                </h3>
                <p className="text-xs text-slate-500">
                  Koreksi NIK, nama, tanggal lahir, atau orang tua balita.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Nomor Induk Kependudukan (NIK 16 Digit):
                </label>
                <input
                  type="text"
                  required
                  value={editBalita.nik}
                  onChange={(e) => setEditBalita({ ...editBalita, nik: e.target.value.replace(/\D/g, '') })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Balita:</label>
                <input
                  type="text"
                  required
                  value={editBalita.nama}
                  onChange={(e) => setEditBalita({ ...editBalita, nama: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin:</label>
                  <select
                    value={editBalita.jenisKelamin}
                    onChange={(e) => setEditBalita({ ...editBalita, jenisKelamin: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir:</label>
                  <input
                    type="date"
                    required
                    value={editBalita.tanggalLahir}
                    onChange={(e) => setEditBalita({ ...editBalita, tanggalLahir: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Ibu Kandung:</label>
                  <input
                    type="text"
                    required
                    value={editBalita.namaIbu}
                    onChange={(e) => setEditBalita({ ...editBalita, namaIbu: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Ayah:</label>
                  <input
                    type="text"
                    value={editBalita.namaAyah}
                    onChange={(e) => setEditBalita({ ...editBalita, namaAyah: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alamat Domisili:</label>
                  <input
                    type="text"
                    value={editBalita.alamat}
                    onChange={(e) => setEditBalita({ ...editBalita, alamat: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No WhatsApp / HP:</label>
                  <input
                    type="text"
                    value={editBalita.noHp}
                    onChange={(e) => setEditBalita({ ...editBalita, noHp: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#80000f] hover:bg-[#66000c] text-white font-bold shadow-md shadow-[#80000f]/20 cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Penimbangan */}
      <AddWeighingModal
        isOpen={isWeighingOpen}
        onClose={() => setIsWeighingOpen(false)}
        balitaList={balitaList}
        selectedBalitaId={activeBalitaId}
        onSuccess={loadData}
      />
    </div>
  );
}
