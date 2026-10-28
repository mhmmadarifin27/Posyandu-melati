'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  LineChart as ChartIcon,
  Baby,
  Calendar,
  Scale,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import KMSChart from '@/components/KMSChart';
import AddWeighingModal from '@/components/AddWeighingModal';
import KMSLegendCard from '@/components/KMSLegendCard';
import { PosyanduStore } from '@/lib/supabase';
import { Balita, PemeriksaanBalita, UserRole, KMS_STATUS_INFO } from '@/types/posyandu';

function EKMSContent() {
  const searchParams = useSearchParams();
  const urlId = searchParams.get('id');

  const [currentRole, setCurrentRole] = useState<UserRole>('bidan');
  const [balitaList, setBalitaList] = useState<Balita[]>([]);
  const [pemeriksaanList, setPemeriksaanList] = useState<PemeriksaanBalita[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [isWeighingOpen, setIsWeighingOpen] = useState<boolean>(false);

  const loadData = () => {
    const bList = PosyanduStore.getBalita();
    const pList = PosyanduStore.getPemeriksaan();
    setBalitaList(bList);
    setPemeriksaanList(pList);

    if (urlId && bList.some((b) => b.id === urlId)) {
      setSelectedChildId(urlId);
    } else if (bList.length > 0 && !selectedChildId) {
      setSelectedChildId(bList[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, [urlId]);

  const activeChild = balitaList.find((b) => b.id === selectedChildId) || balitaList[0];
  const historyPemeriksaan = pemeriksaanList
    .filter((p) => p.balitaId === activeChild?.id)
    .sort((a, b) => a.usiaBulan - b.usiaBulan);

  const lastPeriksa = historyPemeriksaan[historyPemeriksaan.length - 1];
  const kmsDetail = lastPeriksa ? KMS_STATUS_INFO[lastPeriksa.statusKMS] : null;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header currentRole={currentRole} onRoleChange={setCurrentRole} />

        <main className="p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {/* Header Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#fff5f6] border border-[#fce1e4] text-[#80000f] flex items-center justify-center font-bold shadow-2xs">
                  <ChartIcon className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    E-KMS (Kartu Menuju Sehat Digital)
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Posyandu Melati &bull; Kurva pertumbuhan antropometri WHO BB/U terintegrasi deteksi Weight Faltering (2T)
                  </p>
                </div>
              </div>
            </div>

            {/* Child Selector Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700">Pilih Balita:</label>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="p-2.5 px-4 bg-white rounded-full border border-[#fce1e4] font-bold text-xs text-[#80000f] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#80000f]"
              >
                {balitaList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nama} ({b.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeChild && (
            <>
              {/* Profil Balita & Status Terkini */}
              <div className="bg-white p-6 rounded-3xl border border-[#fce1e4] shadow-sm space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#fce1e4]">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md bg-gradient-to-br from-[#80000f] to-[#990012] shadow-[#80000f]/25">
                      <Baby className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-slate-900">{activeChild.nama}</h2>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            activeChild.jenisKelamin === 'L'
                              ? 'bg-[#fce1e4] text-[#80000f] border border-[#f8c8c8]'
                              : 'bg-[#fce1e4] text-[#80000f] border border-[#f8c8c8]'
                          }`}
                        >
                          {activeChild.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                        <span>Lahir: {activeChild.tanggalLahir}</span>
                        <span>&bull;</span>
                        <span>Ibu: {activeChild.namaIbu}</span>
                        <span>&bull;</span>
                        <span>Posyandu Melati</span>
                        <span>&bull;</span>
                        <span>Desil Ekonomi: {activeChild.desilEkonomi} (DTKS)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setIsWeighingOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#80000f] hover:bg-[#66000c] text-white rounded-full text-xs font-bold shadow-md shadow-[#80000f]/25 transition-all hover:scale-102"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Catat Timbang</span>
                    </button>
                    <Link
                      href="/rekomendasi-mbg"
                      className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-[#fff5f6] text-[#80000f] border border-[#fce1e4] rounded-full text-xs font-bold transition-all shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#80000f]" />
                      <span>Rekomendasi MBG</span>
                    </Link>
                  </div>
                </div>

                {/* Status Diagnosa Klinis (Maroon Theme) */}
                {lastPeriksa && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div className="p-4 bg-[#fff5f6] rounded-2xl border border-[#fce1e4] shadow-2xs">
                      <div className="text-[#80000f] font-semibold text-[11px]">BB &amp; TB Terakhir</div>
                      <div className="text-lg font-black text-slate-900 mt-0.5">
                        {lastPeriksa.beratBadan} kg{' '}
                        <span className="text-xs font-normal text-slate-500">
                          / {lastPeriksa.tinggiBadan} cm
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Usia: {lastPeriksa.usiaBulan} bulan
                      </div>
                    </div>

                    <div className="p-4 bg-[#fff5f6] rounded-2xl border border-[#fce1e4] shadow-2xs">
                      <div className="text-[#80000f] font-semibold text-[11px]">Z-Score BB/U (WHO)</div>
                      <div className="text-lg font-black text-[#80000f] mt-0.5">
                        {lastPeriksa.zScoreBBU} SD
                      </div>
                      <div className="text-[11px] font-bold text-slate-700 mt-1">
                        Status: {lastPeriksa.statusBBU}
                      </div>
                    </div>

                    <div
                      className={`p-4 rounded-2xl border shadow-2xs ${
                        lastPeriksa.statusKMS === 'N'
                          ? 'bg-[#fff5f6] border-[#fce1e4]'
                          : 'bg-[#fce1e4] border-[#f8c8c8]'
                      }`}
                    >
                      <div className="text-[#80000f] font-semibold text-[11px]">Status Tren KMS</div>
                      <div
                        className={`text-base font-black mt-0.5 ${
                          lastPeriksa.statusKMS === 'N' ? 'text-[#80000f]' : 'text-[#80000f]'
                        }`}
                      >
                        [{lastPeriksa.statusKMS}] {kmsDetail?.nama}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        {kmsDetail?.arti}
                      </div>
                    </div>

                    <div className="p-4 bg-[#fff5f6] rounded-2xl border border-[#fce1e4] shadow-2xs">
                      <div className="text-[#80000f] font-semibold text-[11px]">Suplementasi &amp; Imunisasi</div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {lastPeriksa.vitaminA ? 'Vit A (Sudah)' : 'Vit A (-)'} &bull;{' '}
                        {lastPeriksa.obatCacing ? 'Cacing (Sudah)' : 'Cacing (-)'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 truncate">
                        {lastPeriksa.imunisasi || 'Lengkap sesuai usia'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Kurva Grafik KMS Interaktif */}
              <KMSChart
                gender={activeChild.jenisKelamin}
                childName={activeChild.nama}
                historyPemeriksaan={historyPemeriksaan}
              />

              {/* Riwayat Penimbangan Lengkap Balita */}
              <div className="bg-white rounded-3xl p-6 border border-[#fce1e4] shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-sm md:text-base">
                  Riwayat Buku Timbang E-KMS ({activeChild.nama})
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#fff5f6] text-[#80000f] font-bold border-b border-[#fce1e4]">
                        <th className="p-3.5">Tanggal Timbang</th>
                        <th className="p-3.5">Usia</th>
                        <th className="p-3.5 text-right">Berat (kg)</th>
                        <th className="p-3.5 text-right">Tinggi (cm)</th>
                        <th className="p-3.5 text-center">Z-Score BB/U</th>
                        <th className="p-3.5 text-center">KBM Kemenkes</th>
                        <th className="p-3.5 text-center">Status Tren KMS</th>
                        <th className="p-3.5">Catatan / Keluhan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#fce1e4]">
                      {historyPemeriksaan.map((p) => {
                        const info = KMS_STATUS_INFO[p.statusKMS];
                        return (
                          <tr key={p.id} className="hover:bg-[#fff5f6]/50 transition-colors">
                            <td className="p-3.5 font-semibold text-slate-900">{p.tanggalPeriksa}</td>
                            <td className="p-3.5">{p.usiaBulan} bln</td>
                            <td className="p-3.5 text-right font-bold text-slate-900">
                              {p.beratBadan} kg
                            </td>
                            <td className="p-3.5 text-right">{p.tinggiBadan} cm</td>
                            <td className="p-3.5 text-center font-mono font-bold text-[#80000f]">
                              {p.zScoreBBU} SD
                            </td>
                            <td className="p-3.5 text-center font-medium">{p.kbm} kg</td>
                            <td className="p-3.5 text-center">
                              <span
                                className={`px-2.5 py-1 rounded-full font-bold text-[11px] border ${info.warnaBadge}`}
                                title={info.arti}
                              >
                                {p.statusKMS} - {info.nama}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-600 max-w-xs truncate">{p.catatanKader}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Panduan Visual Kode Status KMS */}
              <KMSLegendCard />
            </>
          )}
        </main>
      </div>

      <AddWeighingModal
        isOpen={isWeighingOpen}
        onClose={() => setIsWeighingOpen(false)}
        balitaList={balitaList}
        selectedBalitaId={activeChild?.id}
        onSuccess={loadData}
      />
    </div>
  );
}

export default function EKMSPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-bold">Memuat modul E-KMS...</div>}>
      <EKMSContent />
    </Suspense>
  );
}
