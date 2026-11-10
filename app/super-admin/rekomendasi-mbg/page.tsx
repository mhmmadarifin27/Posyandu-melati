'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Calculator,
  Baby,
  HeartPulse,
  Activity,
  ArrowRight,
  ArrowLeft,
  Building2,
  Printer,
  Info,
  CheckCircle2,
  X,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import { PosyanduStore } from '@/lib/supabase';
import {
  Balita,
  PemeriksaanBalita,
  IbuHamil,
  IbuMenyusui,
  Lansia,
  PemeriksaanLansia,
  MenuMBG,
  RekomendasiResult,
  SAWStepDetail,
  PosyanduTenant,
} from '@/types/posyandu';
import { calculateSAW, CandidateItem, KRITERIA_MBG } from '@/lib/mcdm-engine';

function SuperAdminSAWContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const posyanduParam = searchParams.get('posyandu') || 'all';

  const [tenants, setTenants] = useState<PosyanduTenant[]>([]);
  const [selectedPosyandu, setSelectedPosyandu] = useState<string>(posyanduParam);
  const [filterSasaran, setFilterSasaran] = useState<'Semua' | 'Balita' | 'Bumil' | 'Busui' | 'Lansia'>('Semua');
  const [kuotaPorsi, setKuotaPorsi] = useState<number>(15);

  const [balitaList, setBalitaList] = useState<Balita[]>([]);
  const [pemeriksaanList, setPemeriksaanList] = useState<PemeriksaanBalita[]>([]);
  const [bumilList, setBumilList] = useState<IbuHamil[]>([]);
  const [busuiList, setBusuiList] = useState<IbuMenyusui[]>([]);
  const [lansiaList, setLansiaList] = useState<Lansia[]>([]);
  const [pemeriksaanLansia, setPemeriksaanLansia] = useState<PemeriksaanLansia[]>([]);
  const [menuList, setMenuList] = useState<MenuMBG[]>([]);

  const [isCalcModalOpen, setIsCalcModalOpen] = useState<boolean>(false);
  const [stepDetail, setStepDetail] = useState<SAWStepDetail | null>(null);

  // Sinkronisasi data awal
  const loadData = () => {
    const allTenants = PosyanduStore.getPosyanduList();
    setTenants(allTenants);

    const filterArg = selectedPosyandu === 'all' ? undefined : selectedPosyandu;
    setBalitaList(PosyanduStore.getBalita(filterArg));
    setPemeriksaanList(PosyanduStore.getPemeriksaan(filterArg));
    setBumilList(PosyanduStore.getBumil(filterArg));
    setBusuiList(PosyanduStore.getBusui(filterArg));
    setLansiaList(PosyanduStore.getLansia(filterArg));
    setPemeriksaanLansia(PosyanduStore.getPemeriksaanLansia(filterArg));
    setMenuList(PosyanduStore.getMenuMBG());
  };

  useEffect(() => {
    if (posyanduParam) {
      setSelectedPosyandu(posyanduParam);
    }
  }, [posyanduParam]);

  useEffect(() => {
    loadData();
  }, [selectedPosyandu]);

  const handlePosyanduChange = (val: string) => {
    setSelectedPosyandu(val);
    const url = val === 'all' 
      ? '/super-admin/rekomendasi-mbg' 
      : `/super-admin/rekomendasi-mbg?posyandu=${encodeURIComponent(val)}`;
    router.replace(url);
  };

  // Bentuk Kandidat untuk Engine SAW
  const candidates: CandidateItem[] = useMemo(() => {
    const list: CandidateItem[] = [];

    // 1. Kandidat Balita
    balitaList.forEach((b) => {
      const history = pemeriksaanList
        .filter((p) => p.balitaId === b.id)
        .sort((x, y) => new Date(y.tanggalPeriksa).getTime() - new Date(x.tanggalPeriksa).getTime());
      const lastP = history[0];
      if (!lastP) return;

      let c1Score = 20;
      if (lastP.zScoreBBU < -3) c1Score = 100;
      else if (lastP.zScoreBBU < -2) c1Score = 80;
      else if (lastP.zScoreBBU < -1) c1Score = 40;

      let c2Score = 20;
      if (lastP.statusKMS === '2T') c2Score = 100;
      else if (lastP.statusKMS === 'BGM') c2Score = 95;
      else if (lastP.statusKMS === 'T') c2Score = 70;

      let c3Score = 20;
      if (lastP.statusBBTB.includes('Buruk')) c3Score = 100;
      else if (lastP.statusBBTB.includes('Kurang')) c3Score = 75;

      let c4Score = b.desilEkonomi === 1 ? 100 : b.desilEkonomi === 2 ? 80 : 40;
      let c5Score = lastP.keluhan !== '-' ? 85 : 20;

      const klinis: string[] = [];
      if (lastP.statusKMS === '2T')
        klinis.push('Weight Faltering (2T): Kenaikan BB tidak adekuat 2 bulan berurutan');
      if (lastP.zScoreBBU < -3)
        klinis.push(`Gizi Buruk: Z-score BB/U (${lastP.zScoreBBU} SD) berada di bawah -3 SD (BGM)`);
      else if (lastP.zScoreBBU < -2)
        klinis.push(`Gizi Kurang: Z-score BB/U (${lastP.zScoreBBU} SD) butuh intervensi porsi MBG`);
      if (lastP.statusKMS === 'BGM') klinis.push('KMS: Titik BB Berada di Bawah Garis Merah');
      if (b.desilEkonomi === 1) klinis.push('Keluarga Prasejahtera (Desil 1 DTKS)');

      list.push({
        id: b.id,
        nama: b.nama,
        subjek: 'Balita',
        posyandu: b.posyandu || 'Posyandu Melati',
        usia: `${lastP.usiaBulan} bln`,
        kriteriaValues: { C1: c1Score, C2: c2Score, C3: c3Score, C4: c4Score, C5: c5Score },
        alasanKlinis: klinis.length > 0 ? klinis : ['Pemantauan tumbuh kembang rutin'],
        rawDetail: { balita: b, periksa: lastP },
      });
    });

    // 2. Kandidat Ibu Hamil
    bumilList.forEach((bumil) => {
      let c1Score = bumil.lilaSaatIni < 21.5 ? 100 : bumil.lilaSaatIni < 23.5 ? 85 : 30;
      let c2Score = bumil.statusKEK ? 90 : 30;
      let c3Score = bumil.hb < 10 ? 95 : bumil.hb < 11 ? 75 : 20;
      let c4Score = bumil.desilEkonomi === 1 ? 100 : bumil.desilEkonomi === 2 ? 80 : 40;
      let c5Score = 30;

      const klinis: string[] = [];
      if (bumil.lilaSaatIni < 23.5)
        klinis.push(`Risiko KEK: LiLA ${bumil.lilaSaatIni} cm (< 23.5 cm) rentan BBLR`);
      if (bumil.statusAnemia) klinis.push(`Anemia Kehamilan: Kadar Hb ${bumil.hb} g/dL (< 11 g/dL)`);
      if (bumil.desilEkonomi === 1) klinis.push('Keluarga Prasejahtera (Desil 1 DTKS)');

      list.push({
        id: bumil.id,
        nama: bumil.nama,
        subjek: 'Bumil',
        posyandu: bumil.posyandu || 'Posyandu Melati',
        usia: `${bumil.usiaKehamilanMinggu} mgg (Hamil)`,
        kriteriaValues: { C1: c1Score, C2: c2Score, C3: c3Score, C4: c4Score, C5: c5Score },
        alasanKlinis: klinis.length > 0 ? klinis : ['Pemeriksaan antenatal rutin'],
        rawDetail: { bumil },
      });
    });

    // 3. Kandidat Ibu Menyusui (Busui)
    busuiList.forEach((busui) => {
      let c1Score = busui.lila < 23.5 ? 90 : 30;
      let c2Score = busui.statusAsiEksklusif ? 85 : 40;
      let c3Score = busui.statusKEK ? 85 : 25;
      let c4Score = busui.desilEkonomi === 1 ? 100 : busui.desilEkonomi === 2 ? 80 : 40;
      let c5Score = busui.keluhan && busui.keluhan.length > 3 ? 80 : 20;

      const klinis: string[] = [];
      if (busui.lila < 23.5) klinis.push(`Risiko KEK Menyusui: LiLA ${busui.lila} cm (< 23.5 cm)`);
      if (busui.statusAsiEksklusif) klinis.push(`Menyusui Bayi Usia ${busui.usiaBayiBulan} Bulan (Periode Emas ASI)`);
      if (busui.keluhan) klinis.push(`Keluhan Laktasi: ${busui.keluhan}`);

      list.push({
        id: busui.id,
        nama: busui.nama,
        subjek: 'Busui',
        posyandu: busui.posyandu || 'Posyandu Melati',
        usia: `Ibu Menyusui (Bayi ${busui.usiaBayiBulan} bln)`,
        kriteriaValues: { C1: c1Score, C2: c2Score, C3: c3Score, C4: c4Score, C5: c5Score },
        alasanKlinis: klinis.length > 0 ? klinis : ['Pemantauan nifas & laktasi rutin'],
        rawDetail: { busui },
      });
    });

    // 4. Kandidat Lansia
    lansiaList.forEach((l) => {
      const history = pemeriksaanLansia
        .filter((p) => p.lansiaId === l.id)
        .sort((x, y) => new Date(y.tanggalPeriksa).getTime() - new Date(x.tanggalPeriksa).getTime());
      const lastL = history[0];
      if (!lastL) return;

      let c1Score = lastL.statusGizi === 'Kurus' ? 90 : lastL.statusGizi === 'Obesitas' ? 70 : 30;
      let c2Score = lastL.statusTensi === 'Hipertensi' ? 85 : 30;
      let c3Score = lastL.statusGulaDarah === 'Tinggi (Diabetes)' ? 90 : 30;
      let c4Score = 60;
      let c5Score = lastL.keluhan && lastL.keluhan.length > 3 ? 80 : 20;

      const klinis: string[] = [];
      if (lastL.statusGizi === 'Kurus') klinis.push(`Gizi Kurang Lansia: IMT ${lastL.imt} kg/m²`);
      if (lastL.statusTensi === 'Hipertensi')
        klinis.push(`Hipertensi: Tensi ${lastL.tensiSistolik}/${lastL.tensiDiastolik} mmHg`);
      if (lastL.statusGulaDarah === 'Tinggi (Diabetes)')
        klinis.push(`Gula Darah Tinggi: GDS ${lastL.gulaDarah} mg/dL`);

      list.push({
        id: l.id,
        nama: l.nama,
        subjek: 'Lansia',
        posyandu: l.posyandu || 'Posyandu Melati',
        usia: `${l.usiaTahun} Thn (Lansia)`,
        kriteriaValues: { C1: c1Score, C2: c2Score, C3: c3Score, C4: c4Score, C5: c5Score },
        alasanKlinis: klinis.length > 0 ? klinis : ['Pemeriksaan lansia berkala'],
        rawDetail: { lansia: l, periksa: lastL },
      });
    });

    return list;
  }, [balitaList, pemeriksaanList, bumilList, busuiList, lansiaList, pemeriksaanLansia]);

  // Eksekusi Rekomendasi SAW
  const sawResult = useMemo(() => {
    return calculateSAW(candidates, KRITERIA_MBG);
  }, [candidates]);

  const defaultBalitaMenu = menuList.find((m) => m.kategori === 'Balita Gizi Kurang') || menuList[0];
  const defaultBumilMenu = menuList.find((m) => m.kategori === 'Bumil KEK') || menuList[0];
  const defaultBusuiMenu = menuList.find((m) => m.kategori === 'Busui Gizi Tambahan') || menuList[0];
  const defaultLansiaMenu = menuList.find((m) => m.kategori === 'Lansia Gizi Khusus') || menuList[0];

  // Format Hasil Ranking sesuai interface RekomendasiResult
  const results: RekomendasiResult[] = useMemo(() => {
    return sawResult.ranked.map((item) => {
      const cand = candidates.find((c) => c.id === item.id);
      const isBalita = cand?.subjek === 'Balita';
      const isBumil = cand?.subjek === 'Bumil';
      const isBusui = cand?.subjek === 'Busui';

      const menu = isBusui
        ? defaultBusuiMenu
        : isBumil
        ? defaultBumilMenu
        : isBalita
        ? defaultBalitaMenu
        : defaultLansiaMenu;

      return {
        sasaranId: cand?.id || item.id,
        nama: cand?.nama || item.nama,
        jenisSasaran: cand?.subjek || 'Balita',
        usia: cand?.usia || '-',
        posyandu: cand?.posyandu || 'Posyandu Melati',
        skorPreferensi: item.skor,
        rank: item.rank,
        prioritas:
          item.rank === 1
            ? 'Sangat Mendesak'
            : item.rank <= 3
            ? 'Prioritas Tinggi'
            : item.rank <= kuotaPorsi
            ? 'Prioritas Sedang'
            : 'Pemantauan Rutin',
        alasanKlinis: cand?.alasanKlinis || [],
        indikatorKunci: {
          zScoreBBU: cand?.rawDetail?.periksa?.zScoreBBU,
          statusKMS: cand?.rawDetail?.periksa?.statusKMS,
          lila: cand?.rawDetail?.bumil?.lilaSaatIni || cand?.rawDetail?.busui?.lila,
          hb: cand?.rawDetail?.bumil?.hb,
          tensi: cand?.rawDetail?.periksa?.statusTensi,
          desilEkonomi: cand?.rawDetail?.balita?.desilEkonomi || cand?.rawDetail?.bumil?.desilEkonomi || 2,
        },
        rekomendasiMenu: menu,
        terpilihMBG: item.rank <= kuotaPorsi,
      };
    });
  }, [sawResult, candidates, defaultBalitaMenu, defaultBumilMenu, defaultBusuiMenu, defaultLansiaMenu, kuotaPorsi]);

  const filteredResults = results.filter((r) => {
    if (filterSasaran === 'Semua') return true;
    return r.jenisSasaran === filterSasaran;
  });

  const activePosyanduLabel =
    selectedPosyandu === 'all'
      ? 'Seluruh Posyandu Se-Kecamatan'
      : selectedPosyandu;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#fce1e4] selection:text-[#80000f]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {/* Breadcrumb & Lokasi Navigasi */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Breadcrumbs
              items={[
                { label: 'Dashboard', href: '/super-admin/dashboard' },
                { label: 'Audit Rekapitulasi', href: '/super-admin/rekapitulasi' },
                { label: 'Kalkulasi SAW Rekomendasi MBG' },
              ]}
            />

            <Link
              href="/super-admin/rekapitulasi"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:text-[#80000f] hover:bg-[#fff5f6] hover:border-[#fce1e4] transition-all shadow-2xs self-start cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Audit Wilayah</span>
            </Link>
          </div>

          {/* Header Card (Maroon Super Admin Gradient) */}
          <div className="bg-gradient-to-r from-[#80000f] via-[#990012] to-[#66000c] p-6 sm:p-7 rounded-3xl text-white shadow-lg shadow-[#80000f]/20 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center font-bold shadow-xs text-xl">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                        Kalkulasi SAW Rekomendasi MBG
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full bg-white text-[#80000f] text-[10px] font-black uppercase shadow-xs">
                        👑 Supervisi Super Admin
                      </span>
                    </div>
                    <p className="text-xs text-white/90 mt-1 font-medium">
                      {activePosyanduLabel} &bull; Perangkingan multi-kriteria berbasis bobot klinis &amp; ekonomi untuk penetapan sasaran Makanan Bergizi Gratis (MBG).
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => {
                    setStepDetail(sawResult.steps);
                    setIsCalcModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-[#fff5f6] text-[#80000f] font-bold text-xs shadow-sm transition-transform hover:scale-102 shrink-0 cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5 text-[#80000f]" />
                  <span>Lihat Langkah Matriks SAW</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 font-bold text-xs shadow-xs transition-transform hover:scale-102 shrink-0 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-white" />
                  <span>Cetak / Ekspor Laporan</span>
                </button>
              </div>
            </div>

            {/* Selector Posyandu Khusus Super Admin & Kuota Filter */}
            <div className="pt-4 border-t border-white/25 flex flex-wrap items-center justify-between gap-4">
              {/* Posyandu Selector Dropdown */}
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/30">
                <Building2 className="w-4 h-4 text-white shrink-0" />
                <span className="text-xs font-bold text-white shrink-0">Pilih Unit Posyandu:</span>
                <select
                  value={selectedPosyandu}
                  onChange={(e) => handlePosyanduChange(e.target.value)}
                  className="px-3 py-1 bg-white text-[#80000f] rounded-xl text-xs font-bold shadow-2xs focus:outline-none cursor-pointer border-0"
                >
                  <option value="all">🌐 Seluruh Posyandu Se-Kecamatan ({tenants.length} Unit)</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.nama}>
                      📍 {t.nama} (RW {t.rw})
                    </option>
                  ))}
                </select>
              </div>

              {/* Kuota Porsi Spinner */}
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/30">
                <span className="text-xs font-bold text-white">Alokasi Kuota MBG:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={kuotaPorsi}
                    onChange={(e) => setKuotaPorsi(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 px-2 py-1 rounded-xl bg-white text-[#80000f] font-black text-center text-xs shadow-2xs focus:outline-none"
                  />
                  <span className="text-xs text-white/90 font-bold">Porsi</span>
                </div>
              </div>
            </div>

            {/* Filter Sasaran Chips */}
            <div className="pt-3 border-t border-white/15 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-white shrink-0 mr-1">Filter Sasaran:</span>
              {(['Semua', 'Balita', 'Bumil', 'Busui', 'Lansia'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterSasaran(t)}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    filterSasaran === t
                      ? 'bg-white text-[#80000f] shadow-sm scale-105'
                      : 'bg-white/15 text-white/90 hover:text-white hover:bg-white/25 border border-white/20'
                  }`}
                >
                  {t}
                </button>
              ))}
              <span className="text-xs text-white/80 font-medium ml-auto">
                Total Kandidat: <strong>{filteredResults.length}</strong> sasaran
              </span>
            </div>
          </div>

          {/* Bobot Kriteria SAW */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Info className="w-4 h-4 text-[#80000f]" />
              <span>Matriks Bobot 5 Kriteria Standar SPK SAW (Total Bobot = 100%):</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {KRITERIA_MBG.map((k) => (
                <div
                  key={k.kode}
                  className="p-3 rounded-2xl bg-[#fff5f6] border border-[#fce1e4] space-y-1 hover:border-[#80000f] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-[#80000f]">{k.kode}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#80000f] text-white text-[10px] font-black">
                      {(k.bobot * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-900 line-clamp-1">{k.nama}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                    {k.deskripsi}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabel Hasil Ranking Rekomendasi SAW */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#fff5f6] to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#80000f] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  🏆
                </div>
                <div>
                  <h3 className="font-serif font-black text-slate-900 text-base">
                    Daftar Prioritas Penerima Menu MBG Tambahan (Hasil SAW)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kandidat dengan nilai preferensi ($V_i$) tertinggi mendapat prioritas utama intervensi porsi gizi.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  {results.filter((r) => r.terpilihMBG).length} Terpilih Kuota
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                  {results.filter((r) => !r.terpilihMBG).length} Cadangan
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4 text-center">Rank</th>
                    <th className="py-3.5 px-4">Nama Sasaran &amp; Unit</th>
                    <th className="py-3.5 px-4">Kategori &amp; Usia</th>
                    <th className="py-3.5 px-4">Alasan Klinis / Diagnosa Kritis</th>
                    <th className="py-3.5 px-4 text-center">Skor SAW ($V_i$)</th>
                    <th className="py-3.5 px-4">Rekomendasi Menu MBG</th>
                    <th className="py-3.5 px-4 text-center">Status Alokasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        Belum ada kandidat pemeriksaan yang tercatat di {activePosyanduLabel}.
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((item) => {
                      const medal = item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : null;

                      return (
                        <tr
                          key={item.sasaranId}
                          className={`hover:bg-[#fff5f6]/50 transition-colors ${
                            item.terpilihMBG ? 'bg-white' : 'bg-slate-50/40 text-slate-500'
                          }`}
                        >
                          {/* Rank */}
                          <td className="py-4 px-4 text-center font-black">
                            {medal ? (
                              <span className="text-lg" title={`Peringkat ${item.rank}`}>
                                {medal}
                              </span>
                            ) : (
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                                  item.terpilihMBG
                                    ? 'bg-[#80000f] text-white'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {item.rank}
                              </span>
                            )}
                          </td>

                          {/* Nama & Posyandu */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-900 text-sm">{item.nama}</div>
                            <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-[#fff0f2] text-[#80000f] border border-[#fce1e4] text-[10px] font-bold">
                              <Building2 className="w-3 h-3" />
                              <span>{item.posyandu}</span>
                            </div>
                          </td>

                          {/* Kategori */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                              {item.jenisSasaran === 'Balita' && <Baby className="w-3.5 h-3.5 text-[#80000f]" />}
                              {item.jenisSasaran === 'Bumil' && <HeartPulse className="w-3.5 h-3.5 text-pink-600" />}
                              {item.jenisSasaran === 'Busui' && <HeartPulse className="w-3.5 h-3.5 text-purple-600" />}
                              {item.jenisSasaran === 'Lansia' && <Activity className="w-3.5 h-3.5 text-emerald-600" />}
                              <span>{item.jenisSasaran}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">{item.usia}</div>
                          </td>

                          {/* Alasan Klinis */}
                          <td className="py-4 px-4 max-w-xs">
                            <ul className="space-y-1">
                              {item.alasanKlinis.map((alasan: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-1 text-[11px] leading-tight text-slate-700">
                                  <span className="text-[#80000f] font-black shrink-0">&bull;</span>
                                  <span>{alasan}</span>
                                </li>
                              ))}
                            </ul>
                          </td>

                          {/* Skor SAW ($V_i$) */}
                          <td className="py-4 px-4 text-center">
                            <div className="font-black text-sm text-[#80000f] font-mono">
                              {item.skorPreferensi.toFixed(4)}
                            </div>
                            <div className="w-20 bg-slate-100 h-1.5 rounded-full mx-auto mt-1 overflow-hidden border border-slate-200">
                              <div
                                className="bg-[#80000f] h-full rounded-full"
                                style={{ width: `${Math.min(100, item.skorPreferensi * 100)}%` }}
                              />
                            </div>
                          </td>

                          {/* Rekomendasi Menu */}
                          <td className="py-4 px-4">
                            {item.rekomendasiMenu ? (
                              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 max-w-xs">
                                <div className="font-bold text-slate-900 text-xs">
                                  {item.rekomendasiMenu.namaMenu}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  {item.rekomendasiMenu.kalori} kkal &bull; Prot {item.rekomendasiMenu.protein}g
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Menu standar</span>
                            )}
                          </td>

                          {/* Status Alokasi */}
                          <td className="py-4 px-4 text-center">
                            {item.terpilihMBG ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Terpilih Kuota
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                                Cadangan Intervensi
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Langkah Perhitungan SAW */}
      {isCalcModalOpen && stepDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#fff0f2] text-[#80000f] flex items-center justify-center font-bold">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-slate-900 text-lg">
                    Transparansi Langkah Perhitungan SAW
                  </h3>
                  <p className="text-xs text-slate-500">
                    Simple Additive Weighting &bull; Posyandu: {activePosyanduLabel}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCalcModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs text-slate-700">
              {/* Formula & Teori */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#80000f]" />
                  <span>Formula Matematis Simple Additive Weighting (SAW):</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  1. <strong>Normalisasi Matriks Keputusan ($R$):</strong> $R_{`{ij}`} = \frac{`{x_{ij}}`}{`{\max_i(x_{ij})}`}$ (untuk kriteria benefit).<br />
                  2. <strong>Nilai Preferensi ($V_i$):</strong> $V_i = \sum_{`{j=1}`}^n w_j \cdot R_{`{ij}`}$, dengan $w_j$ adalah bobot kepentingan kriteria.
                </p>
              </div>

              {/* Matriks Nilai Keputusan (X) */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2">1. Matriks Keputusan ($X$):</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-slate-100 font-sans font-bold text-slate-700">
                      <tr>
                        <th className="p-2.5">Alternatif</th>
                        {stepDetail.kriteria.map((c) => (
                          <th key={c.kode} className="p-2.5 text-right">{c.kode}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stepDetail.alternatif.map((alt, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-sans font-medium text-slate-900">{alt}</td>
                          {stepDetail.matriksKeputusan[i]?.map((v, j) => (
                            <td key={j} className="p-2.5 text-right">{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Matriks Normalisasi (R) */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2">2. Matriks Normalisasi ($R$):</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-slate-100 font-sans font-bold text-slate-700">
                      <tr>
                        <th className="p-2.5">Alternatif</th>
                        {stepDetail.kriteria.map((c) => (
                          <th key={c.kode} className="p-2.5 text-right">{c.kode}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stepDetail.alternatif.map((alt, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-sans font-medium text-slate-900">{alt}</td>
                          {stepDetail.matriksNormalisasi[i]?.map((v, j) => (
                            <td key={j} className="p-2.5 text-right text-[#80000f] font-semibold">{v.toFixed(4)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Skor Preferensi Akhir ($V_i$) */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2">3. Skor Preferensi Akhir ($V_i$) &amp; Ranking:</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="p-2.5 text-center">Rank</th>
                        <th className="p-2.5">Nama Alternatif</th>
                        <th className="p-2.5 text-right">Nilai Preferensi ($V_i$)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stepDetail.skorAkhir.slice(0, 15).map((sa) => (
                        <tr key={sa.id}>
                          <td className="p-2.5 text-center font-bold">{sa.rank}</td>
                          <td className="p-2.5 font-medium text-slate-900">{sa.nama}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-[#80000f]">{sa.skor.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsCalcModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#80000f] hover:bg-[#66000c] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  Tutup Rincian
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SuperAdminSAWPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
          <div className="p-6 rounded-2xl bg-white border border-[#fce1e4] text-[#80000f] font-bold text-sm shadow-sm flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>Memuat Kalkulasi SAW Super Admin...</span>
          </div>
        </div>
      }
    >
      <SuperAdminSAWContent />
    </Suspense>
  );
}
