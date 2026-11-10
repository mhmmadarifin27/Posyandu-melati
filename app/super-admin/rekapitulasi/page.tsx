'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Building2,
  Baby,
  HeartPulse,
  Activity,
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import { PosyanduStore } from '@/lib/supabase';
import { PosyanduTenant, Balita, PemeriksaanBalita, IbuHamil, Lansia } from '@/types/posyandu';
import { toast } from '@/components/ui/custom-toast';

export default function SuperAdminRekapitulasiPage() {
  const [tenants, setTenants] = useState<PosyanduTenant[]>([]);
  const [allBalita, setAllBalita] = useState<Balita[]>([]);
  const [allPemeriksaan, setAllPemeriksaan] = useState<PemeriksaanBalita[]>([]);
  const [allBumil, setAllBumil] = useState<IbuHamil[]>([]);
  const [allLansia, setAllLansia] = useState<Lansia[]>([]);

  useEffect(() => {
    // Load un-filtered global data for Super Admin
    setTenants(PosyanduStore.getPosyanduList());
    setAllBalita(PosyanduStore.getBalita('all'));
    setAllPemeriksaan(PosyanduStore.getPemeriksaan('all'));
    setAllBumil(PosyanduStore.getBumil('all'));
    setAllLansia(PosyanduStore.getLansia('all'));
  }, []);

  // Perhitungan Global Wilayah
  const totalBalita = allBalita.length;
  const totalBumil = allBumil.length;
  const totalLansia = allLansia.length;

  const totalBumilKEK = allBumil.filter((b) => b.statusKEK || b.lilaSaatIni < 23.5).length;
  const totalStunting = allPemeriksaan.filter(
    (p) => p.statusKMS === '2T' || p.statusKMS === 'BGM' || p.zScoreBBU < -2
  ).length;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#fce1e4] selection:text-[#80000f]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {/* Breadcrumb & Lokasi Navigasi */}
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/super-admin/dashboard' },
              { label: 'Audit Rekapitulasi Wilayah' },
            ]}
            backHref="/super-admin/dashboard"
            backLabel="Kembali ke Dashboard"
          />

          {/* Header Card */}
          <div
            className="p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#f8c8c8]"
            style={{
              background: 'linear-gradient(135deg, #4a0009 0%, #80000f 50%, #66000c 100%)',
              backgroundColor: '#80000f',
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30">
                  Rekapitulasi Wilayah Puskesmas
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                  Kecamatan Sukamaju
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight">
                Audit Status Gizi &amp; Komparasi Posyandu
              </h1>
              <p className="text-xs sm:text-sm text-red-100 max-w-2xl leading-relaxed">
                Pemantauan komparatif seluruh unit Posyandu untuk mendeteksi sebaran balita gagal tumbuh (Weight Faltering 2T), ibu hamil KEK, dan efektivitas intervensi menu MBG berbasis metode SAW.
              </p>
            </div>

            <button
              onClick={() => {
                toast.success('Laporan Siap', 'Rekapitulasi wilayah berhasil dikompilasi untuk laporan Puskesmas.');
                window.print();
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-[#80000f] hover:bg-[#fff5f6] text-xs font-bold transition-all shadow-md shrink-0 hover:scale-102 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#80000f]" />
              <span>Cetak Rekap Wilayah</span>
            </button>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#fff0f2] border border-[#fce1e4] text-[#80000f] flex items-center justify-center text-xl shrink-0">
                🏥
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">Total Unit Posyandu</p>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">{tenants.length}</h3>
                <p className="text-[10.5px] text-[#80000f] font-semibold">Semua Aktif</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#fff0f2] border border-[#fce1e4] text-[#80000f] flex items-center justify-center text-xl shrink-0">
                👶
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">Total Balita Se-Kecamatan</p>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalBalita}</h3>
                <p className="text-[10.5px] text-emerald-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> E-KMS Terintegrasi
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-xl shrink-0">
                ⚠️ï¸
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">Kasus Berisiko Stunting</p>
                <h3 className="text-2xl font-black text-amber-700 mt-0.5">{totalStunting}</h3>
                <p className="text-[10.5px] text-amber-600 font-semibold">Prioritas SAW MBG</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 text-pink-700 flex items-center justify-center text-xl shrink-0">
                🤰
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">Ibu Hamil KEK / Anemia</p>
                <h3 className="text-2xl font-black text-pink-700 mt-0.5">{totalBumilKEK}</h3>
                <p className="text-[10.5px] text-pink-600 font-semibold">LiLA &lt; 23.5 cm</p>
              </div>
            </div>
          </div>

          {/* Posyandu Comparative Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif font-black text-slate-900 text-base">
                  Tabel Komparasi &amp; Kinerja Antar-Posyandu
                </h3>
                <p className="text-xs text-slate-500">
                  Data real-time yang terisolasi dari tiap unit tenant di wilayah kerja Puskesmas.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-black text-[10px] tracking-wider">
                  <tr>
                    <th className="py-4 px-5">Unit Posyandu</th>
                    <th className="py-4 px-4 text-center">Sasaran Balita</th>
                    <th className="py-4 px-4 text-center">Bumil / KEK</th>
                    <th className="py-4 px-4 text-center">Lansia</th>
                    <th className="py-4 px-4 text-center">Weight Faltering (2T)</th>
                    <th className="py-4 px-4 text-center">Status Alokasi SAW</th>
                    <th className="py-4 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {tenants.map((tenant) => {
                    const bList = PosyanduStore.getBalita(tenant.nama);
                    const pList = PosyanduStore.getPemeriksaan(tenant.nama);
                    const bmList = PosyanduStore.getBumil(tenant.nama);
                    const lList = PosyanduStore.getLansia(tenant.nama);

                    const wf2tCount = pList.filter((p) => p.statusKMS === '2T' || p.statusKMS === 'BGM').length;
                    const kekCount = bmList.filter((b) => b.statusKEK || b.lilaSaatIni < 23.5).length;

                    return (
                      <tr key={tenant.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#fff0f2] border border-[#fce1e4] text-[#80000f] flex items-center justify-center font-bold text-sm shrink-0">
                              🏥
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{tenant.nama}</div>
                              <div className="text-[11px] text-slate-400">
                                RW {tenant.rw} Kel. {tenant.kelurahan} &bull; PJ: {tenant.namaKetua}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className="font-bold text-slate-900">{bList.length}</span>
                          <span className="text-[11px] text-slate-400 ml-1">Anak</span>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className="font-bold text-slate-900">{bmList.length}</span>
                          {kekCount > 0 && (
                            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                              {kekCount} KEK
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className="font-bold text-slate-900">{lList.length}</span>
                          <span className="text-[11px] text-slate-400 ml-1">Lansia</span>
                        </td>

                        <td className="py-4 px-4 text-center">
                          {wf2tCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[10.5px] font-bold border border-red-200">
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                              {wf2tCount} Kasus
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Terkendali
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold bg-[#fff0f2] text-[#80000f] border border-[#fce1e4]">
                            <Sparkles className="w-3 h-3 text-[#80000f]" />
                            Siap Hitung
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <Link
                            href={`/super-admin/rekomendasi-mbg?posyandu=${encodeURIComponent(tenant.nama)}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fff0f2] hover:bg-[#80000f] text-[#80000f] hover:text-white font-bold text-xs transition-colors border border-[#fce1e4] hover:border-[#80000f] cursor-pointer"
                          >
                            <span>Lihat SAW</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
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
    </div>
  );
}


