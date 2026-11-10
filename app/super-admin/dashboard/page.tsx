'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  Baby,
  HeartPulse,
  AlertTriangle,
  ClipboardCheck,
  LineChart,
  PanelsTopLeft,
  ArrowRight,
  MapPin,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Activity,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { PosyanduStore } from '@/lib/supabase';
import { PosyanduTenant, Balita, IbuHamil, PemeriksaanBalita, PosyanduRegistrationRequest } from '@/types/posyandu';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function SuperAdminDashboardPage() {
  const [tenants, setTenants] = useState<PosyanduTenant[]>([]);
  const [registrations, setRegistrations] = useState<PosyanduRegistrationRequest[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(11);
  const [selectedYear, setSelectedYear] = useState(2026);

  const [balitaList, setBalitaList] = useState<Balita[]>([]);
  const [pemeriksaanList, setPemeriksaanList] = useState<PemeriksaanBalita[]>([]);
  const [bumilList, setBumilList] = useState<IbuHamil[]>([]);

  const loadData = () => {
    const allTenants = PosyanduStore.getPosyanduList();
    setTenants(allTenants);

    const allRegs = PosyanduStore.getRegistrations();
    setRegistrations(allRegs);

    // Dashboard Super Admin selalu menampilkan agregat total se-Kecamatan
    const balitas = PosyanduStore.getBalita();
    const periksas = PosyanduStore.getPemeriksaan();
    const bumils = PosyanduStore.getBumil();

    setBalitaList(balitas);
    setPemeriksaanList(periksas);
    setBumilList(bumils);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('posyandu_tenants_updated', handleUpdate);
    window.addEventListener('posyandu_registrations_updated', handleUpdate);
    window.addEventListener('posyandu_balita_updated', handleUpdate);
    window.addEventListener('posyandu_bumil_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('posyandu_tenants_updated', handleUpdate);
      window.removeEventListener('posyandu_registrations_updated', handleUpdate);
      window.removeEventListener('posyandu_balita_updated', handleUpdate);
      window.removeEventListener('posyandu_bumil_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const pendingCount = registrations.filter((r) => r.status === 'pending').length;

  // Filter pemeriksaan balita berisiko stunting / 2T / BGM se-Kecamatan
  const urgentBalita = pemeriksaanList.filter(
    (p) => p.statusKMS === '2T' || p.statusKMS === 'BGM' || p.zScoreBBU < -2
  );

  // Filter Bumil KEK se-Kecamatan (LiLA < 23.5)
  const bumilKEK = bumilList.filter((bm) => bm.statusKEK || bm.lilaSaatIni < 23.5);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#fce1e4] selection:text-[#80000f]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {/* Top Title Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                  Supervisi Wilayah <span className="text-[#80000f]">Puskesmas</span>
                </h1>
                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase border shadow-2xs bg-[#80000f] text-white border-[#80000f]">
                  👑 SaaS Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Portal supervisi agregat: monitoring status kesehatan balita, verifikasi pendaftaran unit baru, audit stunting &amp; KEK, serta tata kelola akun posyandu se-Kecamatan.
              </p>
            </div>
          </div>

          {/* Super Admin Supervision Banner */}
          <div
            className="p-5 sm:p-6 rounded-3xl shadow-lg border border-[#f8c8c8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white"
            style={{
              background: 'linear-gradient(135deg, #4a0009 0%, #80000f 50%, #66000c 100%)',
              backgroundColor: '#80000f',
            }}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30 shadow-xs text-2xl">
                👑
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                    Supervisi Multi-Tenant SaaS — UPTD Puskesmas Pembina
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-[#80000f] text-[10.5px] font-black uppercase shadow-xs">
                    Pusat
                  </span>
                </div>
                <p className="text-xs text-white/95 mt-1 font-medium leading-relaxed max-w-2xl">
                  Kelola jaringan posyandu binaan, verifikasi &amp; persetujuan (ACC) unit pendaftar baru, serta pantau risiko gagal tumbuh se-Kecamatan Sako / Palembang.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href="/super-admin/posyandu"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white text-[#80000f] text-xs font-bold hover:bg-[#fff5f6] transition-all shadow-md shrink-0 hover:scale-102"
              >
                <Building2 className="w-4 h-4 text-[#80000f]" />
                <span>Master Unit Posyandu</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#80000f] text-white text-[9px] font-black animate-pulse">
                    {pendingCount} Baru
                  </span>
                )}
              </Link>
              <Link
                href="/super-admin/rekapitulasi"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/20 text-white border border-white/40 text-xs font-bold hover:bg-white/30 transition-all shadow-xs shrink-0"
              >
                <LineChart className="w-4 h-4 text-white" />
                <span>Rekapitulasi Wilayah</span>
              </Link>
              <Link
                href="/super-admin/kelola-landing"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/20 text-white border border-white/40 text-xs font-bold hover:bg-white/30 transition-all shadow-xs shrink-0"
              >
                <PanelsTopLeft className="w-4 h-4 text-white" />
                <span>Landing Page</span>
              </Link>
            </div>
          </div>

          {/* Pending Alert Bar */}
          {pendingCount > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  ⚠️
                </span>
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    Ada {pendingCount} Permohonan Pendaftaran Posyandu Baru Menunggu Persetujuan
                  </h4>
                  <p className="text-[11px] text-amber-700 font-medium">
                    Pendaftar belum dapat login hingga disetujui oleh Super Admin Puskesmas.
                  </p>
                </div>
              </div>
              <Link
                href="/super-admin/persetujuan"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
              >
                <span>Proses Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* 4 Macro Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Unit Posyandu */}
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
                    🏥
                  </span>
                  <span className="text-xs font-bold text-slate-800">Unit Posyandu Aktif</span>
                </div>
                <Link
                  href="/super-admin/posyandu"
                  className="w-8 h-8 rounded-full border border-[#fce1e4] bg-white flex items-center justify-center text-[#80000f] hover:bg-[#fff5f6] transition-colors shadow-2xs"
                  title="Lihat Master Posyandu"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div>
                <div className="text-4xl font-black tracking-tight text-[#80000f]">
                  {tenants.length}
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fce1e4] text-[11px] font-bold text-[#80000f] border border-[#f8c8c8]">
                  <span>Puskesmas Pembina</span>
                </div>
              </div>
            </div>

            {/* Card 2: Total Balita Agregat */}
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
                  <span className="text-xs font-bold text-slate-800">Total Sasaran Balita</span>
                </div>
                <Link
                  href="/super-admin/rekapitulasi"
                  className="w-8 h-8 rounded-full border border-[#fce1e4] bg-white flex items-center justify-center text-[#80000f] hover:bg-[#fff5f6] transition-colors shadow-2xs"
                  title="Buka Audit Rekapitulasi"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div>
                <div className="text-4xl font-black tracking-tight text-[#80000f]">
                  {balitaList.length}
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fce1e4] text-[11px] font-bold text-[#80000f] border border-[#f8c8c8]">
                  <span>Se-Kecamatan</span>
                </div>
              </div>
            </div>

            {/* Card 3: Balita Berisiko Stunting / 2T */}
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
                    🚨
                  </span>
                  <span className="text-xs font-bold text-slate-800">Risiko Stunting (2T/BGM)</span>
                </div>
                <Link
                  href="/super-admin/rekapitulasi"
                  className="w-8 h-8 rounded-full border border-[#fce1e4] bg-white flex items-center justify-center text-[#80000f] hover:bg-[#fff5f6] transition-colors shadow-2xs"
                  title="Buka Rekapitulasi"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div>
                <div className="text-4xl font-black tracking-tight text-[#80000f]">
                  {urgentBalita.length}
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fce1e4] text-[11px] font-bold text-[#80000f] border border-[#f8c8c8]">
                  <span>Prioritas PMT &amp; MBG</span>
                </div>
              </div>
            </div>

            {/* Card 4: Ibu Hamil KEK */}
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
                    🤰
                  </span>
                  <span className="text-xs font-bold text-slate-800">Bumil Risiko KEK</span>
                </div>
                <Link
                  href="/super-admin/rekapitulasi"
                  className="w-8 h-8 rounded-full border border-[#fce1e4] bg-white flex items-center justify-center text-[#80000f] hover:bg-[#fff5f6] transition-colors shadow-2xs"
                  title="Buka Rekapitulasi"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div>
                <div className="text-4xl font-black tracking-tight text-[#80000f]">
                  {bumilKEK.length}
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fce1e4] text-[11px] font-bold text-[#80000f] border border-[#f8c8c8]">
                  <span>Dari {bumilList.length} Bumil Terdaftar</span>
                </div>
              </div>
            </div>
          </div>

          {/* Unit Posyandu Binaan Grid */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-serif font-black text-lg text-slate-900">
                  Daftar Unit Posyandu Binaan Puskesmas
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Ringkasan cakupan data sasaran balita dan risiko kesehatan per unit posyandu.
                </p>
              </div>
              <Link
                href="/super-admin/posyandu"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#fff0f2] text-[#80000f] hover:bg-[#80000f] hover:text-white transition-all text-xs font-bold self-start sm:self-auto"
              >
                <span>Kelola Master Posyandu</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tenants.map((t) => {
                const balitas = PosyanduStore.getBalita(t.nama);
                const bumils = PosyanduStore.getBumil(t.nama);
                const periksas = PosyanduStore.getPemeriksaan(t.nama);
                const stunting = periksas.filter(
                  (p) => p.statusKMS === '2T' || p.statusKMS === 'BGM' || p.zScoreBBU < -2
                ).length;

                return (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl border-2 border-slate-100 hover:border-[#fce1e4] transition-all bg-white hover:shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-[#fff0f2] border border-[#fce1e4] flex items-center justify-center shrink-0 overflow-hidden">
                            {t.logo ? (
                              <img src={t.logo} alt={t.nama} className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-base">🏥</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-serif font-black text-sm text-slate-900 line-clamp-1">
                              {t.nama}
                            </h4>
                            <p className="text-[11px] text-[#80000f] font-bold">
                              RW {t.rw} • Kel. {t.kelurahan}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                          {t.kode}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                        <div className="p-2 rounded-xl bg-slate-50">
                          <div className="text-xs font-black text-slate-800">{balitas.length}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">Balita</div>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50">
                          <div className="text-xs font-black text-slate-800">{bumils.length}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">Bumil</div>
                        </div>
                        <div className="p-2 rounded-xl bg-rose-50 border border-rose-100">
                          <div className="text-xs font-black text-rose-700">{stunting}</div>
                          <div className="text-[10px] text-rose-500 font-semibold">Risiko 2T</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Ketua: {t.namaKetua}</span>
                      <Link
                        href="/super-admin/posyandu"
                        className="text-[#80000f] font-bold hover:underline cursor-pointer"
                      >
                        Master Unit →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
