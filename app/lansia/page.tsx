'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Plus,
  Search,
  HeartPulse,
  Scale,
  Calendar,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AddLansiaModal from '@/components/AddLansiaModal';
import { PosyanduStore } from '@/lib/supabase';
import { Lansia, PemeriksaanLansia, UserRole } from '@/types/posyandu';
import { toast } from '@/components/ui/custom-toast';

export default function LansiaPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>('bidan');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lansiaList, setLansiaList] = useState<Lansia[]>([]);
  const [pemeriksaanList, setPemeriksaanList] = useState<PemeriksaanLansia[]>([]);

  const [isCheckupOpen, setIsCheckupOpen] = useState(false);
  const [activeLansiaId, setActiveLansiaId] = useState('');
  const [isAddLansiaOpen, setIsAddLansiaOpen] = useState(false);

  // Form Lansia Baru
  const [nama, setNama] = useState('');
  const [nik, setNik] = useState('');
  const [jk, setJk] = useState<'L' | 'P'>('L');
  const [tglLahir, setTglLahir] = useState('1955-05-10');
  const [usia, setUsia] = useState(69);
  const [namaKeluarga, setNamaKeluarga] = useState('');

  const loadData = () => {
    setLansiaList(PosyanduStore.getLansia());
    setPemeriksaanList(PosyanduStore.getPemeriksaanLansia());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveLansia = (e: React.FormEvent) => {
    e.preventDefault();
    const newL: Lansia = {
      id: `lan-${Date.now()}`,
      nik: nik || `3201${Date.now()}`,
      nama,
      jenisKelamin: jk,
      tanggalLahir: tglLahir,
      usiaTahun: usia,
      namaKeluarga,
      alamat: 'RT 02 / RW 01',
      noHp: '08123456789',
      posyandu: 'Posyandu Melati',
      riwayatPenyakit: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    PosyanduStore.addLansia(newL);
    toast.success(
      'Lansia Berhasil Didaftarkan',
      `Data atas nama ${nama} (${usia} tahun) berhasil disimpan ke Posyandu Melati.`
    );
    setIsAddLansiaOpen(false);
    loadData();
  };

  const filtered = lansiaList.filter((l) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return l.nama.toLowerCase().includes(q) || l.nik.includes(q);
    }
    return true;
  });

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
                  <Activity className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Posyandu Lansia (Posyandu Melati)
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Pemeriksaan skrining penyakit tidak menular (hipertensi, diabetes, asam urat) dan status gizi lansia
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsAddLansiaOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-[#fff5f6] text-slate-700 hover:text-[#80000f] font-bold text-xs border border-slate-300 hover:border-[#fce1e4] transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#80000f]" />
                <span>Daftar Lansia Baru</span>
              </button>
              <button
                onClick={() => {
                  setActiveLansiaId(lansiaList[0]?.id || '');
                  setIsCheckupOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#80000f] hover:bg-[#66000c] text-white font-bold text-xs shadow-md shadow-[#80000f]/20 transition-transform hover:scale-102"
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Pemeriksaan Kesehatan</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Lansia */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
              <div className="text-xs font-semibold text-slate-400">Total Lansia Terbina</div>
              <div className="text-2xl font-black text-slate-900">{filtered.length} Orang</div>
              <p className="text-[11px] text-slate-400">Usia 60 tahun ke atas</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#fce1e4] bg-[#fff5f6] shadow-sm space-y-1">
              <div className="text-xs font-bold text-[#80000f]">Terdeteksi Hipertensi</div>
              <div className="text-2xl font-black text-[#80000f]">1 Orang</div>
              <p className="text-[11px] text-[#80000f]/80">Tensi &ge; 140/90 mmHg</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-amber-200 bg-amber-50/20 shadow-sm space-y-1">
              <div className="text-xs font-bold text-amber-700">Gula Darah Tinggi (GDS)</div>
              <div className="text-2xl font-black text-amber-800">1 Orang</div>
              <p className="text-[11px] text-amber-700/80">Kadar GDS &ge; 200 mg/dL</p>
            </div>
          </div>

          {/* Tabel Lansia & Rekam Medis */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm md:text-base">
                Buku Register Kesehatan Lansia
              </h3>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama lansia atau NIK..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-full border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="p-3">Nama Lansia & JK</th>
                    <th className="p-3">Usia</th>
                    <th className="p-3">Keluarga Pendamping</th>
                    <th className="p-3 text-center">Tensi Terakhir</th>
                    <th className="p-3 text-center">Gula Darah (GDS)</th>
                    <th className="p-3 text-center">Status Gizi (IMT)</th>
                    <th className="p-3">Keluhan & Edukasi</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((l) => {
                    const records = pemeriksaanList
                      .filter((p) => p.lansiaId === l.id)
                      .sort(
                        (x, y) =>
                          new Date(y.tanggalPeriksa).getTime() - new Date(x.tanggalPeriksa).getTime()
                      );
                    const last = records[0];

                    return (
                      <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-900 text-sm">{l.nama}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            NIK: {l.nik} ({l.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'})
                          </div>
                        </td>

                        <td className="p-3 font-semibold text-slate-800">{l.usiaTahun} Tahun</td>

                        <td className="p-3 text-slate-600">{l.namaKeluarga}</td>

                        <td className="p-3 text-center">
                          {last ? (
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                last.statusTensi === 'Hipertensi'
                                  ? 'bg-red-100 text-red-800 font-black border border-red-200'
                                  : 'bg-[#fff5f6] text-[#80000f] border border-[#fce1e4]'
                              }`}
                            >
                              {last.tensiSistolik}/{last.tensiDiastolik} mmHg
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>

                        <td className="p-3 text-center font-mono">
                          {last ? (
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                last.statusGulaDarah === 'Tinggi (Diabetes)'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {last.gulaDarah} mg/dL
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>

                        <td className="p-3 text-center">
                          {last ? (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                              IMT {last.imt} ({last.statusGizi})
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>

                        <td className="p-3 max-w-xs">
                          <div className="text-slate-800 font-medium truncate">{last?.keluhan || '-'}</div>
                          <div className="text-[10px] text-slate-400 truncate">{last?.tindakanEdukasi}</div>
                        </td>

                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              setActiveLansiaId(l.id);
                              setIsCheckupOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-[#80000f] hover:text-white text-slate-800 font-bold text-[11px] transition-all"
                          >
                            Periksa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Daftar Lansia Baru */}
      {isAddLansiaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Registrasi Lansia Baru (Posyandu Melati)</h3>
            <form onSubmit={handleSaveLansia} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Lansia:</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin:</label>
                  <select
                    value={jk}
                    onChange={(e) => setJk(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Usia (Tahun):</label>
                  <input
                    type="number"
                    required
                    value={usia}
                    onChange={(e) => setUsia(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keluarga Pendamping / Anak:</label>
                <input
                  type="text"
                  required
                  value={namaKeluarga}
                  onChange={(e) => setNamaKeluarga(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLansiaOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#80000f] hover:bg-[#66000c] text-white font-bold shadow-md shadow-[#80000f]/20"
                >
                  Simpan Lansia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pemeriksaan Lansia */}
      <AddLansiaModal
        isOpen={isCheckupOpen}
        onClose={() => setIsCheckupOpen(false)}
        lansiaList={lansiaList}
        selectedLansiaId={activeLansiaId}
        onSuccess={loadData}
      />
    </div>
  );
}
