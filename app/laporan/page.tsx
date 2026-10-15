'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Award,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ExportReportModal from '@/components/ExportReportModal';
import { PosyanduStore } from '@/lib/supabase';
import { Balita, PemeriksaanBalita, IbuHamil, Lansia, UserRole } from '@/types/posyandu';
import { toast } from '@/components/ui/custom-toast';

export default function LaporanPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>('bidan');
  const [balitaList, setBalitaList] = useState<Balita[]>([]);
  const [pemeriksaanList, setPemeriksaanList] = useState<PemeriksaanBalita[]>([]);
  const [bumilList, setBumilList] = useState<IbuHamil[]>([]);
  const [lansiaList, setLansiaList] = useState<Lansia[]>([]);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  useEffect(() => {
    setBalitaList(PosyanduStore.getBalita());
    setPemeriksaanList(PosyanduStore.getPemeriksaan());
    setBumilList(PosyanduStore.getBumil());
    setLansiaList(PosyanduStore.getLansia());
  }, []);

  const handlePrint = () => {
    toast.info('Menyiapkan Lembar Cetak', 'Membuka dialog cetak laporan resmi Puskesmas.');
    window.print();
  };

  // Hitung metrik rekapitulasi
  const latestPemeriksaan = balitaList.map((b) => {
    const records = pemeriksaanList
      .filter((p) => p.balitaId === b.id)
      .sort((x, y) => new Date(y.tanggalPeriksa).getTime() - new Date(x.tanggalPeriksa).getTime());
    return { balita: b, periksa: records[0] };
  });

  const countN = latestPemeriksaan.filter((i) => i.periksa?.statusKMS === 'N').length;
  const countT = latestPemeriksaan.filter((i) => i.periksa?.statusKMS === 'T').length;
  const count2T = latestPemeriksaan.filter((i) => i.periksa?.statusKMS === '2T').length;
  const countBGM = latestPemeriksaan.filter((i) => i.periksa?.statusKMS === 'BGM').length;
  const countBumilKEK = bumilList.filter((b) => b.statusKEK || b.lilaSaatIni < 23.5).length;

  return (
    <div className="flex min-h-screen bg-[#f5f7f9]">
      <div className="no-print">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="no-print">
          <Header currentRole={currentRole} onRoleChange={setCurrentRole} />
        </div>

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {/* Action Header - Disembunyikan saat cetak */}
          <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#fff5f6] border border-[#fce1e4] text-[#80000f] flex items-center justify-center font-bold shadow-2xs">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Laporan Rekapitulasi Posyandu Melati
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Format cetak dinas resmi bertanda tangan &bull; Dilengkapi Kop Surat Provinsi Sumatera Selatan &amp; Posyandu Melati
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setIsExportOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#fff5f6] text-slate-800 hover:text-[#80000f] font-bold text-xs border border-[#fce1e4] shadow-2xs transition-all"
              >
                <Download className="w-3.5 h-3.5 text-[#80000f]" />
                <span>Ekspor CSV</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#80000f] hover:bg-[#66000c] text-white font-bold text-xs shadow-md shadow-[#80000f]/20 transition-transform hover:scale-102"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Lembar Resmi (A4)</span>
              </button>
            </div>
          </div>

          {/* DOKUMEN CETAK RESMI FORMAT KERTAS A4 PEMERINTAH (FORMAL HITAM PUTIH DINAS) */}
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-300 shadow-sm max-w-[210mm] mx-auto text-slate-900 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
            {/* ========================================================================= */}
            {/* KOP SURAT DINAS RESMI (LOGO SUMSEL - TEKS RESMI - LOGO POSYANDU)          */}
            {/* ========================================================================= */}
            <div className="flex items-center justify-between gap-4 pb-2">
              {/* Logo Kiri: Lambang Resmi Provinsi Sumatera Selatan */}
              <div className="w-20 sm:w-24 shrink-0 flex items-center justify-center">
                <img
                  src="/images/logo-sumsel.png"
                  alt="Lambang Provinsi Sumatera Selatan"
                  className="h-20 sm:h-24 w-auto object-contain"
                />
              </div>

              {/* Teks Kop Surat Dinas Formal */}
              <div className="flex-1 text-center space-y-0.5">
                <h3 className="font-serif font-black text-sm sm:text-base uppercase tracking-wider text-slate-950 leading-tight">
                  Pemerintah Provinsi Sumatera Selatan
                </h3>
                <h4 className="font-sans font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-900 leading-tight">
                  Dinas Kesehatan Kota Palembang
                </h4>
                <h4 className="font-sans font-extrabold text-xs sm:text-sm uppercase tracking-wide text-slate-900 leading-tight">
                  UPTD Puskesmas Pembina
                </h4>
                <h2 className="font-serif font-black text-sm sm:text-base uppercase tracking-widest text-slate-950 leading-tight pt-0.5">
                  Posyandu Melati RW 03 Kelurahan Sukamaju
                </h2>
                <p className="text-[10px] sm:text-[10.5px] text-slate-600 leading-tight pt-1">
                  Jl. Sukamaju Raya No. 03 RT 12 RW 03, Kel. Sukamaju, Kec. Sako, Palembang, Sumatera Selatan 30164
                </p>
                <p className="text-[9.5px] sm:text-[10px] text-slate-500 font-medium leading-tight">
                  Posko: 0812-7890-1234 &bull; Email: posyandumelati.rw03@sumselprov.go.id &bull; Kode Pos: 30164
                </p>
              </div>

              {/* Logo Kanan: Logo Resmi Posyandu Melati */}
              <div className="w-20 sm:w-24 shrink-0 flex items-center justify-center">
                <img
                  src="/images/logo-posyandu.png"
                  alt="Logo Posyandu Melati"
                  className="h-20 sm:h-24 w-auto object-contain"
                />
              </div>
            </div>

            {/* Garis Ganda Pembatas Kop Surat Resmi (Tebal + Tipis) */}
            <div className="w-full border-b-[3px] border-slate-950 mt-2"></div>
            <div className="w-full border-b border-slate-950 mt-[2px] mb-5"></div>

            {/* Judul Laporan Formal & Nomor Surat */}
            <div className="text-center space-y-1 mb-5">
              <h2 className="font-serif font-black text-sm sm:text-base uppercase tracking-wider text-slate-950 underline decoration-slate-950 underline-offset-4">
                Laporan Rekapitulasi Pelayanan Posyandu &amp; Intervensi Gizi MBG
              </h2>
              <p className="font-mono text-xs font-bold text-slate-800">
                Nomor: 440 / 108 / PUSK-PEMB / X / 2026
              </p>
            </div>

            {/* Informasi Metadata Wilayah & Periode Formal (Tata Letak Kolom Resmi Bergaris Rapi) */}
            <div className="border border-slate-400 rounded-md p-3.5 mb-5 text-[11px] bg-slate-50/40">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5">
                <div className="flex items-start">
                  <span className="w-36 text-slate-700 font-medium shrink-0">Wilayah Kerja</span>
                  <span className="font-semibold text-slate-950">: RW 03 Sukamaju, Kec. Sako, Palembang</span>
                </div>
                <div className="flex items-start">
                  <span className="w-36 text-slate-700 font-medium shrink-0">Bulan / Tahun Pelaporan</span>
                  <span className="font-semibold text-slate-950">: Oktober 2026</span>
                </div>
                <div className="flex items-start">
                  <span className="w-36 text-slate-700 font-medium shrink-0">Fasilitas Pembina</span>
                  <span className="font-semibold text-slate-950">: UPTD Puskesmas Pembina (Kota Palembang)</span>
                </div>
                <div className="flex items-start">
                  <span className="w-36 text-slate-700 font-medium shrink-0">Tenaga Bidan Pembina</span>
                  <span className="font-semibold text-slate-950">: Bdn. Siti Rahma, S.Tr.Keb</span>
                </div>
              </div>
            </div>

            {/* Bagian I: Ringkasan Kohort Sasaran & Kasus Prioritas (Format Matriks Formal) */}
            <div className="space-y-2 mb-6">
              <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>I.</span>
                <span>Ringkasan Kohort Sasaran &amp; Kasus Prioritas</span>
              </h4>
              <div className="overflow-x-auto border border-slate-400 rounded-md">
                <table className="w-full text-center text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-950 border-b border-slate-400 divide-x divide-slate-300">
                      <th className="p-2.5 w-1/4">Total Balita Terdaftar</th>
                      <th className="p-2.5 w-1/4">Balita Gizi Baik (N)</th>
                      <th className="p-2.5 w-1/4">Weight Faltering (2T / BGM)</th>
                      <th className="p-2.5 w-1/4">Bumil KEK &amp; Lansia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-x divide-slate-300 bg-white">
                    <tr>
                      <td className="p-3">
                        <div className="text-xl font-black text-slate-950">{balitaList.length} Anak</div>
                        <div className="text-[10.5px] text-slate-600 font-medium mt-0.5">100% Ditimbang</div>
                      </td>
                      <td className="p-3">
                        <div className="text-xl font-black text-slate-950">{countN} Anak</div>
                        <div className="text-[10.5px] text-slate-600 font-medium mt-0.5">Tren Adekuat</div>
                      </td>
                      <td className="p-3 bg-slate-50/60">
                        <div className="text-xl font-black text-slate-950">{count2T + countBGM} Anak</div>
                        <div className="text-[10.5px] font-bold text-slate-950 mt-0.5">Wajib Menu MBG</div>
                      </td>
                      <td className="p-3">
                        <div className="text-xl font-black text-slate-950">{countBumilKEK + lansiaList.length} Sasaran</div>
                        <div className="text-[10.5px] text-slate-600 font-medium mt-0.5">{countBumilKEK} Bumil &bull; {lansiaList.length} Lansia</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bagian II: Tabel Detail Balita & Status KMS Standar Kemenkes RI */}
            <div className="space-y-2 mb-6">
              <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>II.</span>
                <span>Daftar Balita &amp; Evaluasi Antropometri Kurva WHO</span>
              </h4>
              <div className="overflow-x-auto border border-slate-400 rounded-md">
                <table className="w-full min-w-[720px] text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-950 border-b border-slate-400">
                      <th className="p-2.5 w-8 text-center border-r border-slate-300">No</th>
                      <th className="p-2.5 border-r border-slate-300">Nama Balita</th>
                      <th className="p-2.5 w-12 text-center border-r border-slate-300">JK</th>
                      <th className="p-2.5 w-16 text-center border-r border-slate-300">Usia</th>
                      <th className="p-2.5 text-right w-16 border-r border-slate-300">BB (kg)</th>
                      <th className="p-2.5 text-right w-16 border-r border-slate-300">TB (cm)</th>
                      <th className="p-2.5 text-center w-24 border-r border-slate-300">Z-Score BB/U</th>
                      <th className="p-2.5 text-center w-20 border-r border-slate-300">Status KMS</th>
                      <th className="p-2.5">Tindakan Intervensi Gizi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {balitaList.map((b, idx) => {
                      const records = pemeriksaanList
                        .filter((p) => p.balitaId === b.id)
                        .sort(
                          (x, y) =>
                            new Date(y.tanggalPeriksa).getTime() - new Date(x.tanggalPeriksa).getTime()
                        );
                      const last = records[0];

                      return (
                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 text-center font-medium border-r border-slate-300">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900 border-r border-slate-300">
                            {b.nama}
                            <div className="text-[10px] font-normal text-slate-500">Ibu: {b.namaIbu}</div>
                          </td>
                          <td className="p-2.5 text-center border-r border-slate-300 font-semibold">{b.jenisKelamin}</td>
                          <td className="p-2.5 text-center border-r border-slate-300">{last ? `${last.usiaBulan} bln` : '-'}</td>
                          <td className="p-2.5 text-right font-bold border-r border-slate-300">{last?.beratBadan ?? '-'}</td>
                          <td className="p-2.5 text-right border-r border-slate-300">{last?.tinggiBadan ?? '-'}</td>
                          <td className="p-2.5 text-center font-mono font-bold border-r border-slate-300 text-slate-950">
                            {last ? `${last.zScoreBBU} SD` : '-'}
                          </td>
                          <td className="p-2.5 text-center font-bold border-r border-slate-300">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                last?.statusKMS === 'N'
                                  ? 'bg-slate-100 text-slate-900 border border-slate-300'
                                  : last?.statusKMS === '2T' || last?.statusKMS === 'BGM'
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-slate-200 text-slate-800 border border-slate-300'
                              }`}
                            >
                              {last?.statusKMS || '-'}
                            </span>
                          </td>
                          <td className="p-2.5 font-medium text-slate-700">
                            {last?.statusKMS === '2T'
                              ? 'Weight Faltering: Alokasi Menu Tambahan MBG Protein Hewani'
                              : last?.statusKMS === 'BGM'
                              ? 'Bawah Garis Merah: Intervensi Khusus Puskesmas & Menu MBG'
                              : last?.statusKMS === 'N'
                              ? 'Pertumbuhan Normal: Pemantauan Rutin Bulan Depan'
                              : 'Pemantauan Asupan Gizi & Edukasi Ibu Balita'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bagian III: Rekapitulasi Sasaran Khusus (Ibu Hamil & Lansia) */}
            <div className="space-y-2 mb-8">
              <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>III.</span>
                <span>Rekapitulasi Sasaran Ibu Hamil (Maternal) &amp; Posyandu Lansia</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div className="border border-slate-400 rounded-md p-3.5 space-y-2 bg-slate-50/20">
                  <div className="font-bold text-slate-950 border-b border-slate-300 pb-1">
                    A. Sasaran Ibu Hamil ({bumilList.length} Orang)
                  </div>
                  <ul className="space-y-1 text-slate-700">
                    <li>&bull; Sasaran dengan Risiko KEK (LiLA &lt; 23.5 cm): <strong>{countBumilKEK} Orang</strong></li>
                    <li>&bull; Distribusi Tablet Tambah Darah (TTD 90 butir): <strong>100% Terdistribusi</strong></li>
                    <li>&bull; Verifikasi Buku KIA Lengkap: <strong>{bumilList.filter(b => b.bukuKIA).length} Orang</strong></li>
                  </ul>
                </div>

                <div className="border border-slate-400 rounded-md p-3.5 space-y-2 bg-slate-50/20">
                  <div className="font-bold text-slate-950 border-b border-slate-300 pb-1">
                    B. Sasaran Posyandu Lansia ({lansiaList.length} Orang)
                  </div>
                  <ul className="space-y-1 text-slate-700">
                    <li>&bull; Skrining Tekanan Darah (Hipertensi): <strong>1 Orang Terpantau</strong></li>
                    <li>&bull; Skrining Glukosa Darah &amp; Kolesterol: <strong>Sesuai Jadwal Berkala</strong></li>
                    <li>&bull; Konseling Gizi Khusus Lansia: <strong>Diet Rendah Garam &amp; Menu Sehat</strong></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bagian IV: Lembar Pengesahan Formal Dua Pihak (Bidan & Ketua Kader) */}
            <div className="pt-4 border-t border-slate-400 text-xs text-slate-900">
              <div className="grid grid-cols-2 text-center">
                {/* Pihak Mengetahui: Bidan Pembina Puskesmas Pembina */}
                <div className="flex flex-col justify-between h-40">
                  <div>
                    <p className="text-slate-600">Mengetahui / Memverifikasi:</p>
                    <p className="font-bold text-slate-950 uppercase pt-0.5">
                      Bidan Pembina Puskesmas Pembina
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-950 underline underline-offset-4">
                      Bdn. Siti Rahma, S.Tr.Keb
                    </p>
                    <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                      NIP. 19880415 201101 2 004
                    </p>
                  </div>
                </div>

                {/* Pihak Pelaksana: Ketua Kader Posyandu Melati RW 03 */}
                <div className="flex flex-col justify-between h-40">
                  <div>
                    <p className="text-slate-600">Palembang, 15 Oktober 2026</p>
                    <p className="font-bold text-slate-950 uppercase pt-0.5">
                      Ketua Kader Posyandu Melati RW 03
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-950 underline underline-offset-4">
                      Ny. Anisa Rahmawati
                    </p>
                    <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                      Reg. Kader: 16.71.04.2003.01
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        balitaList={balitaList}
        pemeriksaanList={pemeriksaanList}
        bumilList={bumilList}
        lansiaList={lansiaList}
      />
    </div>
  );
}
