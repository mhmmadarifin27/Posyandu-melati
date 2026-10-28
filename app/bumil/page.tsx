'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HeartPulse,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  AlertCircle,
  Baby,
  CheckCircle2,
  Calendar,
  UtensilsCrossed,
  Edit,
  Trash2,
  CalendarCheck,
  Users,
  Check,
  Clock,
  ChevronRight,
  Phone,
  MapPin,
  X,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { PosyanduStore } from '@/lib/supabase';
import { IbuHamil, IbuMenyusui, UserRole } from '@/types/posyandu';
import { toast } from '@/components/ui/custom-toast';

export default function IbuPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>('petugas');
  const [activeTab, setActiveTab] = useState<'bumil' | 'busui'>('bumil');
  const [viewMode, setViewMode] = useState<'sesi_bulan_ini' | 'master_tersimpan'>('sesi_bulan_ini');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [bumilList, setBumilList] = useState<IbuHamil[]>([]);
  const [busuiList, setBusuiList] = useState<IbuMenyusui[]>([]);

  // Modals Tambah
  const [isAddBumilOpen, setIsAddBumilOpen] = useState<boolean>(false);
  const [isAddBusuiOpen, setIsAddBusuiOpen] = useState<boolean>(false);

  // Modals Edit
  const [editingBumil, setEditingBumil] = useState<IbuHamil | null>(null);
  const [editingBusui, setEditingBusui] = useState<IbuMenyusui | null>(null);

  // Form Bumil Baru
  const [namaBumil, setNamaBumil] = useState('');
  const [nikBumil, setNikBumil] = useState('');
  const [suamiBumil, setSuamiBumil] = useState('');
  const [usiaMinggu, setUsiaMinggu] = useState(20);
  const [lilaBumil, setLilaBumil] = useState(22.5);
  const [hbBumil, setHbBumil] = useState(10.5);
  const [alamatBumil, setAlamatBumil] = useState('RT 01 / RW 03');
  const [noHpBumil, setNoHpBumil] = useState('081234567890');
  const [hplBumil, setHplBumil] = useState('2025-01-08');

  // Form Busui Baru
  const [namaBusui, setNamaBusui] = useState('');
  const [nikBusui, setNikBusui] = useState('');
  const [suamiBusui, setSuamiBusui] = useState('');
  const [namaBayi, setNamaBayi] = useState('');
  const [usiaBayi, setUsiaBayi] = useState(3);
  const [lilaBusui, setLilaBusui] = useState(22.8);
  const [asiEksklusif, setAsiEksklusif] = useState(true);
  const [keluhanBusui, setKeluhanBusui] = useState('Produksi ASI agak berkurang');
  const [alamatBusui, setAlamatBusui] = useState('RT 02 / RW 03');
  const [noHpBusui, setNoHpBusui] = useState('081234567891');

  const loadData = () => {
    setBumilList(PosyanduStore.getBumil());
    setBusuiList(PosyanduStore.getBusui());
    PosyanduStore.syncFromSupabase().then(() => {
      setBumilList(PosyanduStore.getBumil());
      setBusuiList(PosyanduStore.getBusui());
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Deteksi Duplikasi NIK / Nama saat input Bumil
  const duplicateBumil = bumilList.find(
    (b) =>
      (nikBumil && b.nik.trim() === nikBumil.trim()) ||
      (namaBumil && b.nama.trim().toLowerCase() === namaBumil.trim().toLowerCase())
  );

  // Deteksi Duplikasi NIK / Nama saat input Busui
  const duplicateBusui = busuiList.find(
    (b) =>
      (nikBusui && b.nik.trim() === nikBusui.trim()) ||
      (namaBusui && b.nama.trim().toLowerCase() === namaBusui.trim().toLowerCase())
  );

  const handleSaveBumil = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nikBumil || nikBumil.length !== 16) {
      toast.warning('NIK Tidak Valid', 'NIK Ibu Hamil wajib 16 digit angka sesuai KTP/KK.');
      return;
    }
    if (duplicateBumil) {
      toast.error('Data Sudah Terdaftar', `Ibu ${duplicateBumil.nama} sudah terdaftar dengan NIK ${duplicateBumil.nik}.`);
      return;
    }

    const newB: IbuHamil = {
      id: `bumil-${Date.now()}`,
      nik: nikBumil,
      nama: namaBumil,
      tanggalLahir: '1996-01-01',
      namaSuami: suamiBumil,
      alamat: alamatBumil,
      posyandu: 'Posyandu Melati',
      noHp: noHpBumil,
      hpht: '2024-04-01',
      hpl: hplBumil,
      usiaKehamilanMinggu: usiaMinggu,
      gravida: 1,
      partus: 0,
      abortus: 0,
      lilaAwal: lilaBumil,
      lilaSaatIni: lilaBumil,
      hb: hbBumil,
      statusKEK: lilaBumil < 23.5,
      statusAnemia: hbBumil < 11,
      desilEkonomi: 2,
      bukuKIA: true,
      konsumsiTTD: 30,
    };
    PosyanduStore.addBumil(newB);
    toast.success(
      'Data Ibu Hamil Ditambahkan',
      `Ibu ${namaBumil} (NIK: ${nikBumil}) berhasil didaftarkan di Posyandu Melati.`
    );
    setIsAddBumilOpen(false);
    resetFormBumil();
    loadData();
  };

  const handleUpdateBumil = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBumil) return;
    if (!editingBumil.nik || editingBumil.nik.length !== 16) {
      toast.warning('NIK Tidak Valid', 'NIK Ibu Hamil harus 16 digit angka.');
      return;
    }

    PosyanduStore.updateBumil(editingBumil);
    toast.success('Data Ibu Hamil Diperbarui', `Perubahan data untuk Ibu ${editingBumil.nama} berhasil disimpan.`);
    setEditingBumil(null);
    loadData();
  };

  const handleDeleteBumil = (bumil: IbuHamil) => {
    toast.confirm(
      'Hapus Data Ibu Hamil?',
      `Apakah Anda yakin ingin menghapus data sasaran Ibu ${bumil.nama} (NIK: ${bumil.nik})? Data yang dihapus tidak dapat dipulihkan.`,
      () => {
        PosyanduStore.deleteBumil(bumil.id);
        toast.success('Data Berhasil Dihapus', `Data sasaran Ibu ${bumil.nama} telah dihapus.`);
        loadData();
      }
    );
  };

  const resetFormBumil = () => {
    setNamaBumil('');
    setNikBumil('');
    setSuamiBumil('');
    setUsiaMinggu(20);
    setLilaBumil(22.5);
    setHbBumil(10.5);
  };

  const handleSaveBusui = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nikBusui || nikBusui.length !== 16) {
      toast.warning('NIK Tidak Valid', 'NIK Ibu Menyusui wajib 16 digit angka sesuai KTP/KK.');
      return;
    }
    if (duplicateBusui) {
      toast.error('Data Sudah Terdaftar', `Ibu ${duplicateBusui.nama} sudah terdaftar dengan NIK ${duplicateBusui.nik}.`);
      return;
    }

    const newB: IbuMenyusui = {
      id: `busui-${Date.now()}`,
      nik: nikBusui,
      nama: namaBusui,
      tanggalLahir: '1997-01-01',
      namaSuami: suamiBusui,
      alamat: alamatBusui,
      posyandu: 'Posyandu Melati',
      noHp: noHpBusui,
      namaBayi,
      usiaBayiBulan: usiaBayi,
      statusAsiEksklusif: asiEksklusif,
      lila: lilaBusui,
      statusKEK: lilaBusui < 23.5,
      vitaminANifas: true,
      konsumsiTTD: 30,
      keluhan: keluhanBusui,
      desilEkonomi: 2,
      createdAt: new Date().toISOString().split('T')[0],
    };
    PosyanduStore.addBusui(newB);
    toast.success(
      'Data Ibu Menyusui Ditambahkan',
      `Ibu ${namaBusui} (Bayi: ${namaBayi}, ${usiaBayi} Bulan) berhasil didaftarkan.`
    );
    setIsAddBusuiOpen(false);
    resetFormBusui();
    loadData();
  };

  const handleUpdateBusui = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusui) return;
    if (!editingBusui.nik || editingBusui.nik.length !== 16) {
      toast.warning('NIK Tidak Valid', 'NIK Ibu Menyusui harus 16 digit angka.');
      return;
    }

    PosyanduStore.updateBusui(editingBusui);
    toast.success('Data Ibu Menyusui Diperbarui', `Perubahan data untuk Ibu ${editingBusui.nama} berhasil disimpan.`);
    setEditingBusui(null);
    loadData();
  };

  const handleDeleteBusui = (busui: IbuMenyusui) => {
    toast.confirm(
      'Hapus Data Ibu Menyusui?',
      `Apakah Anda yakin ingin menghapus data sasaran Ibu ${busui.nama} (NIK: ${busui.nik})? Data yang dihapus tidak dapat dipulihkan.`,
      () => {
        PosyanduStore.deleteBusui(busui.id);
        toast.success('Data Berhasil Dihapus', `Data sasaran Ibu ${busui.nama} telah dihapus.`);
        loadData();
      }
    );
  };

  const resetFormBusui = () => {
    setNamaBusui('');
    setNikBusui('');
    setSuamiBusui('');
    setNamaBayi('');
    setUsiaBayi(3);
    setLilaBusui(22.8);
    setAsiEksklusif(true);
    setKeluhanBusui('Produksi ASI agak berkurang');
  };

  const filteredBumil = bumilList.filter((b) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return b.nama.toLowerCase().includes(q) || b.nik.includes(q) || b.namaSuami.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredBusui = busuiList.filter((b) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return b.nama.toLowerCase().includes(q) || b.nik.includes(q) || b.namaBayi.toLowerCase().includes(q);
    }
    return true;
  });

  const bumilKekCount = filteredBumil.filter((b) => b.statusKEK || b.lilaSaatIni < 23.5).length;
  const busuiKekCount = filteredBusui.filter((b) => b.statusKEK || b.lila < 23.5).length;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header currentRole={currentRole} onRoleChange={setCurrentRole} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
          {/* Header Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#fff5f6] border border-[#fce1e4] text-[#80000f] flex items-center justify-center font-bold">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Kesehatan Ibu Hamil & Menyusui (KIA)
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Posyandu Melati &bull; Pemantauan status gizi (LiLA &lt; 23.5 cm), pencegahan anemia, dan kelancaran ASI Eksklusif
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {activeTab === 'bumil' ? (
                <button
                  onClick={() => setIsAddBumilOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#80000f] hover:bg-[#66000c] text-white font-bold text-xs shadow-md shadow-[#80000f]/20 transition-transform hover:scale-102"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Registrasi Ibu Hamil Baru</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsAddBusuiOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#80000f] hover:bg-[#66000c] text-white font-bold text-xs shadow-md shadow-[#80000f]/20 transition-transform hover:scale-102"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Registrasi Ibu Menyusui Baru</span>
                </button>
              )}
            </div>
          </div>

          {/* Dual Toggle 1: Tab Bumil vs Busui */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('bumil')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'bumil'
                    ? 'bg-[#80000f] text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <HeartPulse className="w-4 h-4" />
                <span>Ibu Hamil ({bumilList.length})</span>
                {bumilKekCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-600 text-white font-black">
                    {bumilKekCount} KEK
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('busui')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'busui'
                    ? 'bg-[#80000f] text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Baby className="w-4 h-4" />
                <span>Ibu Menyusui ({busuiList.length})</span>
                {busuiKekCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-600 text-white font-black">
                    {busuiKekCount} KEK
                  </span>
                )}
              </button>
            </div>

            {/* Dual Toggle 2: Pembeda "Pelayanan Bulan Ini" vs "Semua Data Tersimpan" */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-full w-fit">
              <button
                onClick={() => setViewMode('sesi_bulan_ini')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  viewMode === 'sesi_bulan_ini'
                    ? 'bg-[#80000f] text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>📋 Pelayanan Sesi Bulan Ini</span>
              </button>
              <button
                onClick={() => setViewMode('master_tersimpan')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  viewMode === 'master_tersimpan'
                    ? 'bg-[#80000f] text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>👥 Semua Data Tersimpan</span>
              </button>
            </div>
          </div>

          {/* Context Banner: Menjelaskan Perbedaan Bulan Ini vs Data Tersimpan */}
          {viewMode === 'sesi_bulan_ini' ? (
            <div className="bg-[#fff5f6] border border-[#fce1e4] p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#80000f] text-white flex items-center justify-center font-bold shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-[#80000f] text-sm">
                    Sesi Pemeriksaan & Pemantauan Gizi: Bulan {selectedMonth === '2026-10' ? 'Oktober 2026' : 'November 2026'}
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    Menampilkan hasil pemeriksaan LiLA, kadar hemoglobin (Hb), dan konsumsi TTD bulan ini. Data tersimpan tidak hilang saat berganti bulan.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-semibold text-slate-700">Pilih Bulan:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-[#80000f] text-xs focus:ring-2 focus:ring-[#80000f]/20 focus:outline-none"
                >
                  <option value="2026-10">Oktober 2026 (Aktif)</option>
                  <option value="2026-11">November 2026 (Mendatang)</option>
                  <option value="2026-09">September 2026 (Lalu)</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 border border-slate-200 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    Master Data Tersimpan ({activeTab === 'bumil' ? 'Ibu Hamil' : 'Ibu Menyusui'} RW 03 Sukamaju)
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    Daftar seluruh warga sasaran yang tercatat secara permanen dengan NIK 16 digit. Anda dapat memperbarui (Edit) identitas atau menghapus data jika warga pindah domisili.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="text-slate-400 font-semibold">
                Total {activeTab === 'bumil' ? 'Ibu Hamil' : 'Ibu Menyusui'} Terdaftar
              </div>
              <div className="text-2xl font-black text-slate-900">
                {activeTab === 'bumil' ? filteredBumil.length : filteredBusui.length} Orang
              </div>
              <p className="text-[11px] text-slate-400">Wilayah Posyandu Melati</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#fce1e4] bg-[#fff5f6] shadow-xs space-y-1">
              <div className="text-[#80000f] font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#80000f]" />
                <span>Risiko KEK (LiLA &lt; 23.5 cm)</span>
              </div>
              <div className="text-2xl font-black text-[#80000f]">
                {activeTab === 'bumil' ? bumilKekCount : busuiKekCount} Orang
              </div>
              <p className="text-[11px] text-[#80000f]/80">Wajib Menu MBG Tambahan</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#fce1e4] bg-[#fff5f6] shadow-xs space-y-1">
              <div className="text-[#80000f] font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#80000f]" />
                <span>{activeTab === 'bumil' ? 'Buku KIA & TTD' : 'ASI Eksklusif 0-6 Bulan'}</span>
              </div>
              <div className="text-2xl font-black text-[#80000f]">
                {activeTab === 'bumil' ? '100% Memiliki' : 'Aktif Menyusui'}
              </div>
              <p className="text-[11px] text-[#80000f]/80">Terverifikasi oleh Bidan Desa</p>
            </div>
          </div>

          {/* TAB CONTENT: 1. IBU HAMIL */}
          {activeTab === 'bumil' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm md:text-base">
                    {viewMode === 'sesi_bulan_ini'
                      ? `Hasil Pemantauan Ibu Hamil (${selectedMonth === '2026-10' ? 'Oktober 2026' : 'November 2026'})`
                      : 'Data Master Lengkap Ibu Hamil (Tersimpan)'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {viewMode === 'sesi_bulan_ini'
                      ? 'Rekap LiLA, kadar Hb, dan intervensi gizi'
                      : 'Daftar identitas resmi dengan NIK 16 digit, alamat, dan kontak keluarga'}
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari nama ibu atau NIK 16 digit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-1.5 bg-slate-50 rounded-full border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <th className="p-3">Nama Bumil & NIK</th>
                      <th className="p-3">Suami & Domisili</th>
                      <th className="p-3">Usia Kehamilan</th>
                      <th className="p-3 text-center">LiLA Saat Ini</th>
                      <th className="p-3 text-center">Kadar Hb</th>
                      <th className="p-3 text-center">Status Gizi</th>
                      <th className="p-3 text-center">Aksi / Kontrol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBumil.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400">
                          Tidak ada data ibu hamil ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredBumil.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-slate-900 text-sm">{b.nama}</div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                              <span>NIK: {b.nik}</span>
                            </div>
                          </td>

                          <td className="p-3">
                            <div className="font-semibold text-slate-800">Suami: {b.namaSuami}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{b.alamat} &bull; {b.noHp}</span>
                            </div>
                          </td>

                          <td className="p-3 text-slate-700">
                            <span className="font-semibold text-slate-900">
                              {b.usiaKehamilanMinggu} Minggu
                            </span>
                            <div className="text-[10px] text-slate-400">HPL: {b.hpl || '-'}</div>
                          </td>

                          <td className="p-3 text-center font-mono font-bold">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] ${
                                b.lilaSaatIni < 23.5
                                  ? 'bg-red-100 text-red-800 font-black border border-red-200'
                                  : 'bg-[#fff5f6] text-[#80000f] border border-[#fce1e4]'
                              }`}
                            >
                              {b.lilaSaatIni} cm
                            </span>
                          </td>

                          <td className="p-3 text-center font-mono font-bold">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] ${
                                b.hb < 11
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-[#fff5f6] text-[#80000f] border border-[#fce1e4]'
                              }`}
                            >
                              {b.hb} g/dL
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                                b.statusKEK
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-[#fff5f6] text-[#80000f] border border-[#fce1e4]'
                              }`}
                            >
                              {b.statusKEK ? 'Risiko KEK' : 'Normal'}
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {viewMode === 'sesi_bulan_ini' ? (
                                <Link
                                  href="/rekomendasi-mbg"
                                  className="px-3 py-1.5 rounded-full bg-[#fff5f6] hover:bg-[#80000f] hover:text-white text-[#80000f] font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                                >
                                  <UtensilsCrossed className="w-3.5 h-3.5" />
                                  <span>Menu MBG</span>
                                </Link>
                              ) : null}

                              {/* Tombol Edit */}
                              <button
                                onClick={() => setEditingBumil(b)}
                                title="Edit Data Ibu Hamil"
                                className="p-1.5 rounded-xl text-slate-500 hover:text-[#80000f] hover:bg-[#fff5f6] border border-slate-200 transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Tombol Hapus */}
                              <button
                                onClick={() => handleDeleteBumil(b)}
                                title="Hapus Data Ibu Hamil"
                                className="p-1.5 rounded-xl text-slate-400 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 2. IBU MENYUSUI */}
          {activeTab === 'busui' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm md:text-base">
                    {viewMode === 'sesi_bulan_ini'
                      ? `Hasil Pemantauan Ibu Menyusui (${selectedMonth === '2026-10' ? 'Oktober 2026' : 'November 2026'})`
                      : 'Data Master Lengkap Ibu Menyusui (Tersimpan)'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {viewMode === 'sesi_bulan_ini'
                      ? 'Pemantauan ASI Eksklusif 0-6 bulan, LiLA, dan kesehatan laktasi'
                      : 'Daftar identitas resmi warga sasaran menyusui dengan NIK 16 digit'}
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari nama ibu, bayi, atau NIK..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-1.5 bg-slate-50 rounded-full border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <th className="p-3">Nama Ibu & NIK</th>
                      <th className="p-3">Bayi yang Disusui</th>
                      <th className="p-3 text-center">ASI Eksklusif</th>
                      <th className="p-3 text-center">LiLA Saat Ini</th>
                      <th className="p-3 text-center">Status Gizi</th>
                      <th className="p-3">Keluhan Laktasi</th>
                      <th className="p-3 text-center">Aksi / Kontrol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBusui.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400">
                          Tidak ada data ibu menyusui ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredBusui.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-slate-900 text-sm">{b.nama}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              NIK: {b.nik}
                            </div>
                            <div className="text-[10px] text-slate-400">Suami: {b.namaSuami} &bull; {b.noHp}</div>
                          </td>

                          <td className="p-3 text-slate-700">
                            <div className="font-semibold text-slate-900">{b.namaBayi}</div>
                            <div className="text-[10px] text-slate-400">Usia: {b.usiaBayiBulan} Bulan</div>
                          </td>

                          <td className="p-3 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                                b.statusAsiEksklusif
                                  ? 'bg-[#fff5f6] text-[#80000f] border border-[#fce1e4]'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {b.statusAsiEksklusif ? 'Ya (ASI Eksklusif)' : 'MPASI Lanjutan'}
                            </span>
                          </td>

                          <td className="p-3 text-center font-mono font-bold">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] ${
                                b.lila < 23.5
                                  ? 'bg-red-100 text-red-800 font-black border border-red-200'
                                  : 'bg-[#fff5f6] text-[#80000f] border border-[#fce1e4]'
                              }`}
                            >
                              {b.lila} cm
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                                b.statusKEK
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-[#fff5f6] text-[#80000f] border border-[#fce1e4]'
                              }`}
                            >
                              {b.statusKEK ? 'Risiko KEK' : 'Normal'}
                            </span>
                          </td>

                          <td className="p-3 text-slate-600 max-w-xs">
                            <div className="truncate font-medium">{b.keluhan}</div>
                            <div className="text-[10px] text-slate-400">
                              Vit A Nifas: {b.vitaminANifas ? 'Lengkap (2 Kapsul)' : 'Belum'}
                            </div>
                          </td>

                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {viewMode === 'sesi_bulan_ini' ? (
                                <Link
                                  href="/rekomendasi-mbg"
                                  className="px-3 py-1.5 rounded-full bg-[#fff5f6] hover:bg-[#80000f] hover:text-white text-[#80000f] font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                                >
                                  <UtensilsCrossed className="w-3.5 h-3.5" />
                                  <span>Menu MBG</span>
                                </Link>
                              ) : null}

                              {/* Tombol Edit */}
                              <button
                                onClick={() => setEditingBusui(b)}
                                title="Edit Data Ibu Menyusui"
                                className="p-1.5 rounded-xl text-slate-500 hover:text-[#80000f] hover:bg-[#fff5f6] border border-slate-200 transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Tombol Hapus */}
                              <button
                                onClick={() => handleDeleteBusui(b)}
                                title="Hapus Data Ibu Menyusui"
                                className="p-1.5 rounded-xl text-slate-400 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal Tambah Bumil */}
      {isAddBumilOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Registrasi Ibu Hamil Baru</h3>
              <button
                onClick={() => setIsAddBumilOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Peringatan Duplikasi Real-time */}
            {duplicateBumil && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold">⚠️ Data Sudah Pernah Terdaftar!</div>
                  <div className="text-[11px] text-red-700 mt-0.5">
                    Ibu <strong>{duplicateBumil.nama}</strong> sudah tercatat dengan NIK{' '}
                    <strong>{duplicateBumil.nik}</strong>. Anda tidak perlu mendaftar ulang.
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveBumil} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NIK Ibu Hamil (16 Digit KTP) <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="Contoh: 1671044502960001"
                  value={nikBumil}
                  onChange={(e) => setNikBumil(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono tracking-wider focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">
                  {nikBumil.length}/16 digit {nikBumil.length === 16 ? '✓ Lengkap' : ''}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Ibu Hamil <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama sesuai KTP"
                  value={namaBumil}
                  onChange={(e) => setNamaBumil(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Suami:</label>
                <input
                  type="text"
                  required
                  placeholder="Nama suami / kepala keluarga"
                  value={suamiBumil}
                  onChange={(e) => setSuamiBumil(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Usia Kehamilan (Minggu):</label>
                  <input
                    type="number"
                    required
                    value={usiaMinggu}
                    onChange={(e) => setUsiaMinggu(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">LiLA Awal (cm):</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={lilaBumil}
                    onChange={(e) => setLilaBumil(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kadar Hb (g/dL):</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={hbBumil}
                    onChange={(e) => setHbBumil(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Perkiraan Lahir (HPL):</label>
                  <input
                    type="date"
                    required
                    value={hplBumil}
                    onChange={(e) => setHplBumil(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alamat Domisili:</label>
                  <input
                    type="text"
                    value={alamatBumil}
                    onChange={(e) => setAlamatBumil(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp / HP:</label>
                  <input
                    type="text"
                    value={noHpBumil}
                    onChange={(e) => setNoHpBumil(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBumilOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={Boolean(duplicateBumil)}
                  className="px-5 py-2 rounded-xl bg-[#80000f] hover:bg-[#66000c] disabled:opacity-50 text-white font-bold shadow-md shadow-[#80000f]/20"
                >
                  Simpan Data Ibu Hamil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Bumil */}
      {editingBumil && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Data Ibu Hamil</h3>
              <button
                onClick={() => setEditingBumil(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateBumil} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIK (16 Digit):</label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={editingBumil.nik}
                  onChange={(e) =>
                    setEditingBumil({ ...editingBumil, nik: e.target.value.replace(/\D/g, '') })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono tracking-wider"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Ibu Hamil:</label>
                <input
                  type="text"
                  required
                  value={editingBumil.nama}
                  onChange={(e) => setEditingBumil({ ...editingBumil, nama: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Suami:</label>
                <input
                  type="text"
                  required
                  value={editingBumil.namaSuami}
                  onChange={(e) => setEditingBumil({ ...editingBumil, namaSuami: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Usia Kehamilan (Minggu):</label>
                  <input
                    type="number"
                    required
                    value={editingBumil.usiaKehamilanMinggu}
                    onChange={(e) =>
                      setEditingBumil({ ...editingBumil, usiaKehamilanMinggu: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">LiLA Saat Ini (cm):</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editingBumil.lilaSaatIni}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingBumil({
                        ...editingBumil,
                        lilaSaatIni: val,
                        statusKEK: val < 23.5,
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kadar Hb (g/dL):</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editingBumil.hb}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingBumil({
                        ...editingBumil,
                        hb: val,
                        statusAnemia: val < 11,
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Perkiraan Lahir (HPL):</label>
                  <input
                    type="date"
                    value={editingBumil.hpl}
                    onChange={(e) => setEditingBumil({ ...editingBumil, hpl: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat:</label>
                <input
                  type="text"
                  value={editingBumil.alamat}
                  onChange={(e) => setEditingBumil({ ...editingBumil, alamat: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBumil(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#80000f] hover:bg-[#66000c] text-white font-bold shadow-md shadow-[#80000f]/20"
                >
                  Perbarui Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Busui */}
      {isAddBusuiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Registrasi Ibu Menyusui Baru</h3>
              <button
                onClick={() => setIsAddBusuiOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Peringatan Duplikasi Real-time */}
            {duplicateBusui && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold">⚠️ Data Sudah Pernah Terdaftar!</div>
                  <div className="text-[11px] text-red-700 mt-0.5">
                    Ibu <strong>{duplicateBusui.nama}</strong> sudah tercatat dengan NIK{' '}
                    <strong>{duplicateBusui.nik}</strong>. Anda tidak perlu mendaftar ulang.
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveBusui} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NIK Ibu Menyusui (16 Digit) <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="Contoh: 1671044502970002"
                  value={nikBusui}
                  onChange={(e) => setNikBusui(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono tracking-wider focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">
                  {nikBusui.length}/16 digit {nikBusui.length === 16 ? '✓ Lengkap' : ''}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Ibu Menyusui <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={namaBusui}
                  onChange={(e) => setNamaBusui(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Suami:</label>
                  <input
                    type="text"
                    required
                    value={suamiBusui}
                    onChange={(e) => setSuamiBusui(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Bayi:</label>
                  <input
                    type="text"
                    required
                    value={namaBayi}
                    onChange={(e) => setNamaBayi(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Usia Bayi (Bulan):</label>
                  <input
                    type="number"
                    required
                    value={usiaBayi}
                    onChange={(e) => setUsiaBayi(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">LiLA Ibu (cm):</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={lilaBusui}
                    onChange={(e) => setLilaBusui(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={asiEksklusif}
                    onChange={(e) => setAsiEksklusif(e.target.checked)}
                    className="rounded text-[#80000f] focus:ring-[#80000f] w-4 h-4"
                  />
                  <span>Status ASI Eksklusif (Hanya Diberi ASI Saja)</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keluhan Laktasi / Fisik:</label>
                <input
                  type="text"
                  value={keluhanBusui}
                  onChange={(e) => setKeluhanBusui(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBusuiOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={Boolean(duplicateBusui)}
                  className="px-5 py-2 rounded-xl bg-[#80000f] hover:bg-[#66000c] disabled:opacity-50 text-white font-bold shadow-md shadow-[#80000f]/20"
                >
                  Simpan Data Ibu Menyusui
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Busui */}
      {editingBusui && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Data Ibu Menyusui</h3>
              <button
                onClick={() => setEditingBusui(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateBusui} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIK (16 Digit):</label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={editingBusui.nik}
                  onChange={(e) =>
                    setEditingBusui({ ...editingBusui, nik: e.target.value.replace(/\D/g, '') })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono tracking-wider"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Ibu Menyusui:</label>
                <input
                  type="text"
                  required
                  value={editingBusui.nama}
                  onChange={(e) => setEditingBusui({ ...editingBusui, nama: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Suami:</label>
                  <input
                    type="text"
                    required
                    value={editingBusui.namaSuami}
                    onChange={(e) => setEditingBusui({ ...editingBusui, namaSuami: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Bayi:</label>
                  <input
                    type="text"
                    required
                    value={editingBusui.namaBayi}
                    onChange={(e) => setEditingBusui({ ...editingBusui, namaBayi: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Usia Bayi (Bulan):</label>
                  <input
                    type="number"
                    required
                    value={editingBusui.usiaBayiBulan}
                    onChange={(e) =>
                      setEditingBusui({ ...editingBusui, usiaBayiBulan: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">LiLA Ibu (cm):</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editingBusui.lila}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingBusui({
                        ...editingBusui,
                        lila: val,
                        statusKEK: val < 23.5,
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingBusui.statusAsiEksklusif}
                    onChange={(e) =>
                      setEditingBusui({ ...editingBusui, statusAsiEksklusif: e.target.checked })
                    }
                    className="rounded text-[#80000f] focus:ring-[#80000f] w-4 h-4"
                  />
                  <span>Status ASI Eksklusif</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keluhan Laktasi:</label>
                <input
                  type="text"
                  value={editingBusui.keluhan}
                  onChange={(e) => setEditingBusui({ ...editingBusui, keluhan: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBusui(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#80000f] hover:bg-[#66000c] text-white font-bold shadow-md shadow-[#80000f]/20"
                >
                  Perbarui Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
