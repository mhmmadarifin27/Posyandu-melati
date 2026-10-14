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
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AddWeighingModal from '@/components/AddWeighingModal';
import KMSLegendCard from '@/components/KMSLegendCard';
import { PosyanduStore } from '@/lib/supabase';
import { Balita, PemeriksaanBalita, UserRole, KMS_STATUS_INFO } from '@/types/posyandu';

export default function BalitaPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>('kader');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [balitaList, setBalitaList] = useState<Balita[]>([]);
  const [pemeriksaanList, setPemeriksaanList] = useState<PemeriksaanBalita[]>([]);
  const [isWeighingOpen, setIsWeighingOpen] = useState<boolean>(false);
  const [activeBalitaId, setActiveBalitaId] = useState<string>('');
  const [isAddBalitaOpen, setIsAddBalitaOpen] = useState<boolean>(false);

  // Form Balita Baru
  const [newNama, setNewNama] = useState('');
  const [newNik, setNewNik] = useState('');
  const [newJK, setNewJK] = useState<'L' | 'P'>('L');
  const [newTglLahir, setNewTglLahir] = useState('2024-02-10');
  const [newNamaIbu, setNewNamaIbu] = useState('');

  const loadData = () => {
    setBalitaList(PosyanduStore.getBalita());
    setPemeriksaanList(PosyanduStore.getPemeriksaan());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveBalita = (e: React.FormEvent) => {
    e.preventDefault();
    const newB: Balita = {
      id: `b-${Date.now()}`,
      nik: newNik || `3201${Date.now()}`,
      nama: newNama,
      jenisKelamin: newJK,
      tanggalLahir: newTglLahir,
      namaIbu: newNamaIbu,
      namaAyah: '-',
      alamat: 'RT 01 / RW 01',
      rt: '01',
      rw: '01',
      posyandu: 'Posyandu Melati',
      noHp: '08123456789',
      desilEkonomi: 2,
      statusBansos: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    PosyanduStore.addBalita(newB);
    setIsAddBalitaOpen(false);
    loadData();
  };

  const filtered = balitaList.filter((b) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = b.nama.toLowerCase().includes(q);
      const matchIbu = b.namaIbu.toLowerCase().includes(q);
      const matchNik = b.nik.includes(q);
      if (!matchName && !matchIbu && !matchNik) return false;
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#f5f7f9]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header currentRole={currentRole} onRoleChange={setCurrentRole} />

        <main className="p-8 space-y-6 flex-1 overflow-y-auto">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#fff5f6] border border-[#fce1e4] text-[#80000f] flex items-center justify-center font-bold">
                  <Baby className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Data Sasaran Balita & Penimbangan
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Posyandu Melati &bull; Register kohort balita, status antropometri WHO, dan deteksi dini gagal tumbuh
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsAddBalitaOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-[#fff5f6] text-slate-700 hover:text-[#80000f] font-bold text-xs border border-slate-300 hover:border-[#fce1e4] transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#80000f]" />
                <span>Daftar Balita Baru</span>
              </button>
              <button
                onClick={() => {
                  setActiveBalitaId(balitaList[0]?.id || '');
                  setIsWeighingOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#80000f] hover:bg-[#66000c] text-white font-bold text-xs shadow-md shadow-[#80000f]/20 transition-transform hover:scale-102"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Catat Penimbangan</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama balita, NIK, atau nama ibu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-1.5 bg-slate-50 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] font-medium"
              />
            </div>
            <div className="text-slate-500 font-medium">
              Menampilkan <strong>{filtered.length}</strong> balita terdaftar di Posyandu Melati
            </div>
          </div>

          {/* Table Data Balita */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="p-3">Nama Balita & JK</th>
                    <th className="p-3">Tanggal Lahir</th>
                    <th className="p-3">Ibu Kandung</th>
                    <th className="p-3 text-right">BB Terakhir</th>
                    <th className="p-3 text-center">Z-Score BB/U</th>
                    <th className="p-3 text-center">Status Tren KMS</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((b) => {
                    const records = pemeriksaanList
                      .filter((p) => p.balitaId === b.id)
                      .sort(
                        (x, y) =>
                          new Date(y.tanggalPeriksa).getTime() - new Date(x.tanggalPeriksa).getTime()
                      );
                    const lastP = records[0];
                    const kmsInfo = lastP ? KMS_STATUS_INFO[lastP.statusKMS] : null;

                    return (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
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
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            NIK: {b.nik}
                          </div>
                        </td>

                        <td className="p-3 text-slate-700">
                          <div>{b.tanggalLahir}</div>
                          <div className="text-[10px] text-slate-400">
                            {lastP ? `Usia: ${lastP.usiaBulan} bln` : '-'}
                          </div>
                        </td>

                        <td className="p-3 text-slate-700 font-medium">
                          Ny. {b.namaIbu}
                        </td>

                        <td className="p-3 text-right font-bold text-slate-900">
                          {lastP ? `${lastP.beratBadan} kg` : '-'}
                        </td>

                        <td className="p-3 text-center">
                          {lastP ? (
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                lastP.zScoreBBU < -3
                                  ? 'bg-red-100 text-red-800 font-bold border border-red-200'
                                  : lastP.zScoreBBU < -2
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-[#fff5f6] text-[#80000f] border border-[#fce1e4]'
                              }`}
                            >
                              {lastP.zScoreBBU} SD
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>

                        <td className="p-3 text-center">
                          {lastP && kmsInfo ? (
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-[11px] border ${kmsInfo.warnaBadge}`}
                              title={kmsInfo.arti}
                            >
                              {lastP.statusKMS} - {kmsInfo.nama}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/e-kms?id=${b.id}`}
                              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-[#80000f] hover:text-white text-slate-800 font-bold text-[11px] flex items-center gap-1 transition-all"
                            >
                              <LineChart className="w-3.5 h-3.5" />
                              <span>E-KMS</span>
                            </Link>
                            <button
                              onClick={() => {
                                setActiveBalitaId(b.id);
                                setIsWeighingOpen(true);
                              }}
                              className="px-3 py-1 rounded-full bg-[#fff5f6] hover:bg-[#fce1e4] text-[#80000f] font-bold text-[11px] transition-colors"
                            >
                              Timbang
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Panduan Visual Kode Status KMS */}
          <KMSLegendCard />
        </main>
      </div>

      {/* Modal Tambah Balita */}
      {isAddBalitaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Registrasi Balita Baru (Posyandu Melati)</h3>
            <form onSubmit={handleSaveBalita} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Balita:</label>
                <input
                  type="text"
                  required
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
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Ibu Kandung:</label>
                <input
                  type="text"
                  required
                  value={newNamaIbu}
                  onChange={(e) => setNewNamaIbu(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBalitaOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#80000f] hover:bg-[#66000c] text-white font-bold shadow-md shadow-[#80000f]/20"
                >
                  Simpan Balita
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
