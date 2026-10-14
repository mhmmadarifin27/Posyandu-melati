'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calculator,
  Baby,
  HeartPulse,
  Activity,
  Info,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
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
  UserRole,
} from '@/types/posyandu';
import { calculateSAW, CandidateItem, KRITERIA_MBG } from '@/lib/mcdm-engine';

export default function RekomendasiMBGPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>('petugas');
  const [filterSasaran, setFilterSasaran] = useState<'Semua' | 'Balita' | 'Bumil' | 'Busui' | 'Lansia'>('Semua');
  const [kuotaPorsi, setKuotaPorsi] = useState<number>(10);

  const [balitaList, setBalitaList] = useState<Balita[]>([]);
  const [pemeriksaanList, setPemeriksaanList] = useState<PemeriksaanBalita[]>([]);
  const [bumilList, setBumilList] = useState<IbuHamil[]>([]);
  const [busuiList, setBusuiList] = useState<IbuMenyusui[]>([]);
  const [lansiaList, setLansiaList] = useState<Lansia[]>([]);
  const [pemeriksaanLansia, setPemeriksaanLansia] = useState<PemeriksaanLansia[]>([]);
  const [menuList, setMenuList] = useState<MenuMBG[]>([]);

  const [isCalcModalOpen, setIsCalcModalOpen] = useState<boolean>(false);
  const [stepDetail, setStepDetail] = useState<SAWStepDetail | null>(null);

  const loadData = () => {
    setBalitaList(PosyanduStore.getBalita());
    setPemeriksaanList(PosyanduStore.getPemeriksaan());
    setBumilList(PosyanduStore.getBumil());
    setBusuiList(PosyanduStore.getBusui());
    setLansiaList(PosyanduStore.getLansia());
    setPemeriksaanLansia(PosyanduStore.getPemeriksaanLansia());
    setMenuList(PosyanduStore.getMenuMBG());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Bentuk Kandidat untuk Engine SAW
  const candidates: CandidateItem[] = [];

  // 1. Kandidat Balita
  balitaList.forEach((b) => {
    const history = pemeriksaanList
      .filter((p) => p.balitaId === b.id)
      .sort((x, y) => new Date(y.tanggalPeriksa).getTime() - new Date(x.tanggalPeriksa).getTime());
    const lastP = history[0];
    if (!lastP) return;

    let c1Score = 20; // Defisit Z-score
    if (lastP.zScoreBBU < -3) c1Score = 100;
    else if (lastP.zScoreBBU < -2) c1Score = 80;
    else if (lastP.zScoreBBU < -1) c1Score = 40;

    let c2Score = 20; // Tren KMS (Weight Faltering)
    if (lastP.statusKMS === '2T') c2Score = 100; // 2x tidak naik
    else if (lastP.statusKMS === 'BGM') c2Score = 95;
    else if (lastP.statusKMS === 'T') c2Score = 70;

    let c3Score = 20; // Wasting
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

    candidates.push({
      id: b.id,
      nama: b.nama,
      subjek: 'Balita',
      posyandu: 'Posyandu Melati',
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

    candidates.push({
      id: bumil.id,
      nama: bumil.nama,
      subjek: 'Bumil',
      posyandu: 'Posyandu Melati',
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
    let c5Score = busui.keluhan.length > 3 ? 80 : 20;

    const klinis: string[] = [];
    if (busui.lila < 23.5) klinis.push(`Risiko KEK Menyusui: LiLA ${busui.lila} cm (< 23.5 cm)`);
    if (busui.statusAsiEksklusif) klinis.push(`Menyusui Bayi Usia ${busui.usiaBayiBulan} Bulan (Periode Emas ASI)`);
    if (busui.keluhan) klinis.push(`Keluhan Laktasi: ${busui.keluhan}`);

    candidates.push({
      id: busui.id,
      nama: busui.nama,
      subjek: 'Busui',
      posyandu: 'Posyandu Melati',
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
    let c5Score = lastL.keluhan.length > 3 ? 80 : 20;

    const klinis: string[] = [];
    if (lastL.statusGizi === 'Kurus') klinis.push(`Gizi Kurang Lansia: IMT ${lastL.imt} kg/m²`);
    if (lastL.statusTensi === 'Hipertensi')
      klinis.push(`Hipertensi: Tensi ${lastL.tensiSistolik}/${lastL.tensiDiastolik} mmHg`);
    if (lastL.statusGulaDarah === 'Tinggi (Diabetes)')
      klinis.push(`Gula Darah Tinggi: GDS ${lastL.gulaDarah} mg/dL`);

    candidates.push({
      id: l.id,
      nama: l.nama,
      subjek: 'Lansia',
      posyandu: 'Posyandu Melati',
      usia: `${l.usiaTahun} Thn (Lansia)`,
      kriteriaValues: { C1: c1Score, C2: c2Score, C3: c3Score, C4: c4Score, C5: c5Score },
      alasanKlinis: klinis.length > 0 ? klinis : ['Pemeriksaan lansia berkala'],
      rawDetail: { lansia: l, periksa: lastL },
    });
  });

  // Eksekusi Rekomendasi SAW Tunggal
  const sawResult = calculateSAW(candidates, KRITERIA_MBG);

  const defaultBalitaMenu = menuList.find((m) => m.kategori === 'Balita Gizi Kurang') || menuList[0];
  const defaultBumilMenu = menuList.find((m) => m.kategori === 'Bumil KEK') || menuList[0];
  const defaultBusuiMenu = menuList.find((m) => m.kategori === 'Busui Gizi Tambahan') || menuList[0];
  const defaultLansiaMenu = menuList.find((m) => m.kategori === 'Lansia Gizi Khusus') || menuList[0];

  const results: RekomendasiResult[] = sawResult.ranked.map((item) => {
    const cand = candidates.find((c) => c.id === item.id)!;
    const isBalita = cand.subjek === 'Balita';
    const isBumil = cand.subjek === 'Bumil';
    const isBusui = cand.subjek === 'Busui';

    const menu = isBusui
      ? defaultBusuiMenu
      : isBumil
      ? defaultBumilMenu
      : isBalita
      ? defaultBalitaMenu
      : defaultLansiaMenu;

    return {
      sasaranId: cand.id,
      nama: cand.nama,
      jenisSasaran: cand.subjek,
      usia: cand.usia,
      posyandu: 'Posyandu Melati',
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
      alasanKlinis: cand.alasanKlinis,
      indikatorKunci: {
        zScoreBBU: cand.rawDetail?.periksa?.zScoreBBU,
        statusKMS: cand.rawDetail?.periksa?.statusKMS,
        lila: cand.rawDetail?.bumil?.lilaSaatIni || cand.rawDetail?.busui?.lila,
        hb: cand.rawDetail?.bumil?.hb,
        tensi: cand.rawDetail?.periksa?.statusTensi,
        desilEkonomi: cand.rawDetail?.balita?.desilEkonomi || cand.rawDetail?.bumil?.desilEkonomi || 2,
      },
      rekomendasiMenu: menu,
      terpilihMBG: item.rank <= kuotaPorsi,
    };
  });

  const filteredResults = results.filter((r) => {
    if (filterSasaran === 'Semua') return true;
    return r.jenisSasaran === filterSasaran;
  });

  return (
    <div className="flex min-h-screen bg-[#fffafb]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header currentRole={currentRole} onRoleChange={setCurrentRole} />

        <main className="p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {/* Header Card (Maroon Gradient) */}
          <div className="bg-gradient-to-r from-[#80000f] via-[#990012] to-[#66000c] p-6 sm:p-7 rounded-3xl text-white shadow-md shadow-[#80000f]/25 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center font-bold shadow-xs">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                      Sistem Rekomendasi Menu MBG Tambahan (Metode SAW)
                    </h1>
                    <p className="text-xs text-white/90 mt-0.5 font-medium">
                      Posyandu Melati &bull; Seleksi cerdas alokasi menu bergizi untuk Balita, Ibu Hamil, Ibu Menyusui, dan Lansia
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setStepDetail(sawResult.steps);
                  setIsCalcModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#fff5f6] text-[#80000f] font-bold text-xs shadow-sm transition-transform hover:scale-102 shrink-0"
              >
                <Calculator className="w-3.5 h-3.5 text-[#80000f]" />
                <span>Lihat Langkah Perhitungan SAW</span>
              </button>
            </div>

            {/* Filter Sasaran & Kuota Porsi */}
            <div className="pt-4 border-t border-white/25 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-white">Filter Sasaran:</span>
                <div className="inline-flex p-1 bg-white/20 backdrop-blur rounded-full border border-white/30">
                  {(['Semua', 'Balita', 'Bumil', 'Busui', 'Lansia'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterSasaran(t)}
                      className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
                        filterSasaran === t
                          ? 'bg-white text-[#80000f] shadow-sm'
                          : 'text-white/90 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-white">
                <span className="font-bold">Alokasi Kuota MBG:</span>
                <div className="flex items-center gap-1.5 bg-white/20 px-3.5 py-1.5 rounded-full border border-white/30 font-bold">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={kuotaPorsi}
                    onChange={(e) => setKuotaPorsi(Number(e.target.value))}
                    className="w-10 text-center font-black text-white bg-transparent focus:outline-none placeholder-white"
                  />
                  <span className="text-white/90 font-medium">Porsi Tambahan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bobot Kriteria SAW */}
          <div className="bg-white p-5 rounded-3xl border border-[#fce1e4] shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#fce1e4] text-[#80000f] flex items-center justify-center font-bold">
                <Info className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-800">
                Bobot Kriteria SAW (Total Bobot = 100%):
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="px-3 py-1.5 bg-[#fff5f6] border border-[#fce1e4] rounded-xl text-[#80000f] font-semibold">
                <strong>C1:</strong> Defisit Status Gizi (30%)
              </span>
              <span className="px-3 py-1.5 bg-[#fff5f6] border border-[#fce1e4] rounded-xl text-[#80000f] font-semibold">
                <strong>C2:</strong> Tren KMS / ASI Eksklusif (25%)
              </span>
              <span className="px-3 py-1.5 bg-[#fff5f6] border border-[#fce1e4] rounded-xl text-[#80000f] font-semibold">
                <strong>C3:</strong> Komplikasi Fisik / KEK / Anemia (20%)
              </span>
              <span className="px-3 py-1.5 bg-[#fff5f6] border border-[#fce1e4] rounded-xl text-[#80000f] font-semibold">
                <strong>C4:</strong> Desil Ekonomi DTKS (15%)
              </span>
              <span className="px-3 py-1.5 bg-[#fff5f6] border border-[#fce1e4] rounded-xl text-[#80000f] font-semibold">
                <strong>C5:</strong> Riwayat Keluhan Sakit (10%)
              </span>
            </div>
          </div>

          {/* Tabel Hasil Ranking Rekomendasi SAW */}
          <div className="bg-white rounded-3xl p-6 border border-[#fce1e4] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#fce1e4]">
              <div>
                <h3 className="font-bold text-slate-900 text-sm md:text-base">
                  Daftar Prioritas Penerima Menu MBG Tambahan (Hasil SAW)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Diurutkan otomatis dari nilai preferensi Vi tertinggi ke terendah
                </p>
              </div>
              <span className="text-xs px-3.5 py-1.5 rounded-full font-bold bg-[#80000f] text-white shadow-xs">
                Kuota Terpilih: {Math.min(kuotaPorsi, filteredResults.length)} Sasaran
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#fff5f6] text-[#80000f] font-bold border-b border-[#fce1e4]">
                    <th className="p-3.5 w-16 text-center">Peringkat</th>
                    <th className="p-3.5">Nama Sasaran &amp; Kategori</th>
                    <th className="p-3.5 text-center">Skor SAW (Vi)</th>
                    <th className="p-3.5">Alasan Klinis Gizi Rendah</th>
                    <th className="p-3.5">Rekomendasi Menu MBG Tambahan</th>
                    <th className="p-3.5 text-center">Status Intervensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#fce1e4]">
                  {filteredResults.map((item) => (
                    <tr
                      key={item.sasaranId}
                      className={`hover:bg-[#fff5f6]/50 transition-colors ${
                        item.rank === 1
                          ? 'bg-[#fff5f6] font-medium'
                          : item.terpilihMBG
                          ? 'bg-[#fff5f6]/40'
                          : ''
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <span
                          className={`w-7 h-7 rounded-full inline-flex items-center justify-center font-black text-xs ${
                            item.rank === 1
                              ? 'bg-[#80000f] text-white shadow-sm'
                              : item.rank <= kuotaPorsi
                              ? 'bg-[#fce1e4] text-[#80000f] font-bold border border-[#f8c8c8]'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          #{item.rank}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm">{item.nama}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              item.jenisSasaran === 'Balita'
                                ? 'bg-[#fce1e4] text-[#80000f] border border-[#f8c8c8]'
                                : item.jenisSasaran === 'Bumil'
                                ? 'bg-[#fce1e4] text-[#80000f] border border-[#f8c8c8]'
                                : item.jenisSasaran === 'Busui'
                                ? 'bg-[#fff5f6] text-[#80000f] border border-[#fce1e4]'
                                : 'bg-purple-100 text-purple-800 border border-purple-200'
                            }`}
                          >
                            {item.jenisSasaran}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Usia: {item.usia} &bull; Posyandu Melati
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="font-mono font-black text-[#80000f] text-sm">
                          {item.skorPreferensi.toFixed(4)}
                        </div>
                        <span
                          className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.prioritas === 'Sangat Mendesak'
                              ? 'bg-[#80000f] text-white shadow-xs'
                              : item.prioritas === 'Prioritas Tinggi'
                              ? 'bg-[#fce1e4] text-[#80000f] border border-[#f8c8c8]'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.prioritas}
                        </span>
                      </td>

                      <td className="p-3.5 max-w-xs">
                        <ul className="space-y-1">
                          {item.alasanKlinis.map((alasan, idx) => (
                            <li
                              key={idx}
                              className="text-[11px] text-slate-700 flex items-start gap-1.5 leading-snug"
                            >
                              <span className="text-[#80000f] font-bold shrink-0">&bull;</span>
                              <span>{alasan}</span>
                            </li>
                          ))}
                        </ul>
                      </td>

                      <td className="p-3.5 max-w-xs">
                        <div className="p-3 bg-[#fff5f6] rounded-2xl border border-[#fce1e4] space-y-1">
                          <div className="font-bold text-slate-900 text-xs">
                            {item.rekomendasiMenu.namaMenu}
                          </div>
                          <div className="text-[11px] text-slate-600 line-clamp-1">
                            {item.rekomendasiMenu.deskripsi}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#80000f] font-bold pt-0.5">
                            <span>{item.rekomendasiMenu.kalori} kkal</span>
                            <span>&bull;</span>
                            <span>Protein: {item.rekomendasiMenu.protein}g</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold inline-block ${
                            item.terpilihMBG
                              ? 'bg-[#80000f] text-white shadow-sm shadow-[#80000f]/25'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {item.terpilihMBG ? 'Dialokasikan MBG' : 'Pemantauan Rutin'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Langkah Perhitungan SAW */}
      {isCalcModalOpen && stepDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#fce1e4] w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden text-xs">
            <div className="p-6 border-b border-[#fce1e4] flex items-center justify-between bg-[#fff5f6]">
              <div className="flex items-center gap-2.5">
                <Calculator className="w-5 h-5 text-[#80000f]" />
                <h3 className="font-bold text-slate-900 text-base">
                  Transparansi Langkah Perhitungan Metode SAW
                </h3>
              </div>
              <button
                onClick={() => setIsCalcModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-[#fce1e4] hover:bg-[#f8c8c8] text-[#80000f] font-bold transition-colors"
              >
                Tutup
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-3.5 bg-[#fff5f6] rounded-2xl border border-[#fce1e4] text-[#80000f]">
                <strong>Rumus SAW (Simple Additive Weighting):</strong>
                <p className="mt-1 text-slate-700 leading-relaxed">
                  1. Normalisasi: <code className="font-mono bg-white px-1.5 py-0.5 rounded">R_ij = x_ij / Max(x_j)</code><br />
                  2. Skor Akhir: <code className="font-mono bg-white px-1.5 py-0.5 rounded">V_i = Σ (w_j × R_ij)</code>
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">1. Matriks Keputusan (X):</h4>
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

              <div>
                <h4 className="font-bold text-slate-800 mb-2">2. Matriks Normalisasi (R):</h4>
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

              <div>
                <h4 className="font-bold text-slate-800 mb-2">3. Skor Preferensi Akhir (Vi) & Ranking:</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="p-2.5 w-16 text-center">Rank</th>
                        <th className="p-2.5">Nama Sasaran</th>
                        <th className="p-2.5 text-right font-mono">Nilai Vi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stepDetail.skorAkhir.map((s) => (
                        <tr key={s.id} className={s.rank === 1 ? 'bg-amber-50 font-bold' : ''}>
                          <td className="p-2.5 text-center font-bold">#{s.rank}</td>
                          <td className="p-2.5">{s.nama}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-[#80000f]">{s.skor.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
