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
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { PosyanduStore } from '@/lib/supabase';
import { IbuHamil, IbuMenyusui, UserRole } from '@/types/posyandu';
import { toast } from '@/components/ui/custom-toast';

export default function IbuPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>('petugas');
  const [activeTab, setActiveTab] = useState<'bumil' | 'busui'>('bumil');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [bumilList, setBumilList] = useState<IbuHamil[]>([]);
  const [busuiList, setBusuiList] = useState<IbuMenyusui[]>([]);

  // Modals
  const [isAddBumilOpen, setIsAddBumilOpen] = useState<boolean>(false);
  const [isAddBusuiOpen, setIsAddBusuiOpen] = useState<boolean>(false);

  // Form Bumil Baru
  const [namaBumil, setNamaBumil] = useState('');
  const [nikBumil, setNikBumil] = useState('');
  const [suamiBumil, setSuamiBumil] = useState('');
  const [usiaMinggu, setUsiaMinggu] = useState(20);
  const [lilaBumil, setLilaBumil] = useState(22.5);
  const [hbBumil, setHbBumil] = useState(10.5);

  // Form Busui Baru
  const [namaBusui, setNamaBusui] = useState('');
  const [nikBusui, setNikBusui] = useState('');
  const [suamiBusui, setSuamiBusui] = useState('');
  const [namaBayi, setNamaBayi] = useState('');
  const [usiaBayi, setUsiaBayi] = useState(3);
  const [lilaBusui, setLilaBusui] = useState(22.8);
  const [asiEksklusif, setAsiEksklusif] = useState(true);
  const [keluhanBusui, setKeluhanBusui] = useState('Produksi ASI agak berkurang');

  const loadData = () => {
    setBumilList(PosyanduStore.getBumil());
    setBusuiList(PosyanduStore.getBusui());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveBumil = (e: React.FormEvent) => {
    e.preventDefault();
    const newB: IbuHamil = {
      id: `bumil-${Date.now()}`,
      nik: nikBumil || `3201${Date.now()}`,
      nama: namaBumil,
      tanggalLahir: '1996-01-01',
      namaSuami: suamiBumil,
      alamat: 'RT 01 / RW 01',
      posyandu: 'Posyandu Melati',
      noHp: '08123456789',
      hpht: '2024-04-01',
      hpl: '2025-01-08',
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
      `Ibu ${namaBumil} (Usia Kehamilan: ${usiaMinggu} Minggu) berhasil didaftarkan.`
    );
    setIsAddBumilOpen(false);
    loadData();
  };

  const handleSaveBusui = (e: React.FormEvent) => {
    e.preventDefault();
    const newB: IbuMenyusui = {
      id: `busui-${Date.now()}`,
      nik: nikBusui || `3201${Date.now()}`,
      nama: namaBusui,
      tanggalLahir: '1997-01-01',
      namaSuami: suamiBusui,
      alamat: 'RT 02 / RW 01',
      posyandu: 'Posyandu Melati',
      noHp: '08123456789',
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
    loadData();
  };

  const filteredBumil = bumilList.filter((b) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return b.nama.toLowerCase().includes(q) || b.nik.includes(q);
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
    <div className="flex min-h-screen bg-[#f5f7f9]">
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
                  <span>+ Daftar Ibu Hamil</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsAddBusuiOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#80000f] hover:bg-[#66000c] text-white font-bold text-xs shadow-md shadow-[#80000f]/20 transition-transform hover:scale-102"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Daftar Ibu Menyusui</span>
                </button>
              )}
            </div>
          </div>

          {/* Tab Selector [Ibu Hamil] vs [Ibu Menyusui] */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
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
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#80000f] text-white font-black">
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
              <span>Ibu Menyusui / Busui ({busuiList.length})</span>
              {busuiKekCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#80000f] text-white font-black">
                  {busuiKekCount} KEK
                </span>
              )}
            </button>
          </div>

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
                <h3 className="font-bold text-slate-900 text-sm md:text-base">
                  Daftar Ibu Hamil Posyandu Melati
                </h3>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari nama ibu hamil..."
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
                      <th className="p-3">Nama Bumil & Suami</th>
                      <th className="p-3">Usia Kehamilan</th>
                      <th className="p-3">Perkiraan Lahir (HPL)</th>
                      <th className="p-3 text-center">LiLA Saat Ini</th>
                      <th className="p-3 text-center">Kadar Hb</th>
                      <th className="p-3 text-center">Status KEK</th>
                      <th className="p-3 text-center">Konsumsi TTD</th>
                      <th className="p-3 text-center">Aksi MBG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBumil.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-900 text-sm">{b.nama}</div>
                          <div className="text-[11px] text-slate-400">
                            Suami: {b.namaSuami} &bull; Posyandu Melati
                          </div>
                        </td>

                        <td className="p-3 text-slate-700">
                          <span className="font-semibold text-slate-900">
                            {b.usiaKehamilanMinggu} Minggu
                          </span>
                          <div className="text-[10px] text-slate-400">Gravida: G{b.gravida}P{b.partus}A{b.abortus}</div>
                        </td>

                        <td className="p-3 text-slate-700 font-medium">{b.hpl || '-'}</td>

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

                        <td className="p-3 text-center font-medium text-slate-700">
                          {b.konsumsiTTD} Tablet
                        </td>

                        <td className="p-3 text-center">
                          <Link
                            href="/rekomendasi-mbg"
                            className="px-3.5 py-1.5 rounded-full bg-[#fff5f6] hover:bg-[#80000f] hover:text-white text-[#80000f] font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                          >
                            <UtensilsCrossed className="w-3.5 h-3.5" />
                            <span>Rekomendasi MBG</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 2. IBU MENYUSUI */}
          {activeTab === 'busui' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm md:text-base">
                  Daftar Ibu Menyusui (Busui) Posyandu Melati
                </h3>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari nama ibu atau bayi..."
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
                      <th className="p-3">Nama Ibu Menyusui</th>
                      <th className="p-3">Bayi yang Disusui</th>
                      <th className="p-3 text-center">ASI Eksklusif</th>
                      <th className="p-3 text-center">LiLA Saat Ini</th>
                      <th className="p-3 text-center">Status Gizi</th>
                      <th className="p-3 text-center">Vit A Nifas</th>
                      <th className="p-3">Keluhan Laktasi</th>
                      <th className="p-3 text-center">Aksi MBG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBusui.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-900 text-sm">{b.nama}</div>
                          <div className="text-[11px] text-slate-400">
                            Suami: {b.namaSuami} &bull; Posyandu Melati
                          </div>
                        </td>

                        <td className="p-3 text-slate-700">
                          <div className="font-semibold text-slate-900">{b.namaBayi}</div>
                          <div className="text-[10px] text-slate-400">Usia Bayi: {b.usiaBayiBulan} Bulan</div>
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
                            {b.statusKEK ? 'Risiko KEK Busui' : 'Normal'}
                          </span>
                        </td>

                        <td className="p-3 text-center font-medium text-slate-700">
                          {b.vitaminANifas ? 'Lengkap (2 Kapsul)' : 'Belum'}
                        </td>

                        <td className="p-3 text-slate-600 max-w-xs truncate">
                          {b.keluhan}
                        </td>

                        <td className="p-3 text-center">
                          <Link
                            href="/rekomendasi-mbg"
                            className="px-3.5 py-1.5 rounded-full bg-[#fff5f6] hover:bg-[#80000f] hover:text-white text-[#80000f] font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                          >
                            <UtensilsCrossed className="w-3.5 h-3.5" />
                            <span>Menu MBG</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal Tambah Bumil */}
      {isAddBumilOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Registrasi Ibu Hamil (Posyandu Melati)</h3>
            <form onSubmit={handleSaveBumil} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Ibu Hamil:</label>
                <input
                  type="text"
                  required
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
                  <label className="block font-semibold text-slate-700 mb-1">LiLA Saat Ini (cm):</label>
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
                  className="px-5 py-2 rounded-xl bg-[#80000f] hover:bg-[#66000c] text-white font-bold shadow-md shadow-[#80000f]/20"
                >
                  Simpan Bumil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Busui */}
      {isAddBusuiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Registrasi Ibu Menyusui (Posyandu Melati)</h3>
            <form onSubmit={handleSaveBusui} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Ibu Menyusui:</label>
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
                  className="px-5 py-2 rounded-xl bg-[#80000f] hover:bg-[#66000c] text-white font-bold shadow-md shadow-[#80000f]/20"
                >
                  Simpan Busui
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
