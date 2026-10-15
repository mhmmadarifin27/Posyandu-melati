'use client';

import React from 'react';
import {
  X,
  Printer,
  Download,
  FileSpreadsheet,
  Baby,
  HeartPulse,
  Users,
  CheckCircle2,
  FileText,
  Calendar,
} from 'lucide-react';
import { Balita, PemeriksaanBalita, IbuHamil, Lansia, PemeriksaanLansia } from '@/types/posyandu';
import { PosyanduStore } from '@/lib/supabase';
import { toast } from '@/components/ui/custom-toast';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  balitaList: Balita[];
  pemeriksaanList: PemeriksaanBalita[];
  bumilList: IbuHamil[];
  lansiaList?: Lansia[];
  selectedMonth?: number;
  selectedYear?: number;
}

export default function ExportReportModal({
  isOpen,
  onClose,
  balitaList,
  pemeriksaanList = [],
  bumilList,
  lansiaList = [],
  selectedMonth = 10,
  selectedYear = 2026,
}: ExportReportModalProps) {
  if (!isOpen) return null;

  const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const currentMonthName = MONTH_NAMES[selectedMonth - 1] || 'Oktober';

  // Tutup modal terlebih dahulu agar tidak menutupi tampilan cetak / PDF kertas A4
  const handlePrint = () => {
    onClose();
    toast.info('Menyiapkan Lembar Cetak', 'Membuka dialog cetak laporan resmi Puskesmas.');
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Helper untuk escape format CSV agar aman di Excel
  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const exportCSV = (type: 'balita' | 'bumil' | 'lansia') => {
    let csvContent = '';
    let filename = '';
    const dateStamp = `${selectedYear}_${String(selectedMonth).padStart(2, '0')}`;

    if (type === 'balita') {
      filename = `Data_Balita_Antropometri_Posyandu_Melati_${dateStamp}.csv`;
      
      // Header Kolom Lengkap Standar e-PPGBM Kemenkes RI
      const headers = [
        'No',
        'NIK Balita',
        'Nama Balita',
        'Jenis Kelamin',
        'Tanggal Lahir',
        'Usia Saat Ini (Bulan)',
        'Nama Ibu Kandung',
        'Nama Ayah',
        'Alamat RT/RW',
        'Posyandu',
        'Desil Ekonomi',
        'Tanggal Timbang Terakhir',
        'Berat Badan (kg)',
        'Tinggi/Panjang Badan (cm)',
        'Lingkar Kepala (cm)',
        'Cara Ukur',
        'Z-Score BB/U (SD)',
        'Status Gizi (BB/U)',
        'Status KMS (N/T/2T/BGM)',
        'Kenaikan BB (kg)',
        'KBM Target (kg)',
        'Pemberian Vitamin A',
        'Obat Cacing',
        'Status Imunisasi',
        'Keluhan Kesehatan',
        'Catatan Kader / Rekomendasi MBG',
      ];
      csvContent += headers.map(escapeCSV).join(',') + '\n';

      balitaList.forEach((b, idx) => {
        // Ambil pemeriksaan bulan terpilih atau yang terakhir
        const targetMonthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        const records = pemeriksaanList
          .filter((p) => p.balitaId === b.id)
          .sort((x, y) => new Date(y.tanggalPeriksa).getTime() - new Date(x.tanggalPeriksa).getTime());
        
        const monthlyRec = records.find((p) => p.tanggalPeriksa.startsWith(targetMonthStr)) || records[0];

        const row = [
          idx + 1,
          b.nik,
          b.nama,
          b.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
          b.tanggalLahir,
          monthlyRec ? monthlyRec.usiaBulan : '-',
          b.namaIbu,
          b.namaAyah,
          b.alamat,
          'Posyandu Melati RW 03',
          `Desil ${b.desilEkonomi}`,
          monthlyRec ? monthlyRec.tanggalPeriksa : 'Belum Ditimbang',
          monthlyRec ? monthlyRec.beratBadan : '-',
          monthlyRec ? monthlyRec.tinggiBadan : '-',
          monthlyRec ? monthlyRec.lingkarKepala : '-',
          monthlyRec ? monthlyRec.caraUkur : '-',
          monthlyRec ? monthlyRec.zScoreBBU : '-',
          monthlyRec ? monthlyRec.statusBBU : '-',
          monthlyRec ? monthlyRec.statusKMS : 'Belum Ditimbang',
          monthlyRec ? monthlyRec.kenaikanBB : '-',
          monthlyRec ? monthlyRec.kbm : '-',
          monthlyRec ? (monthlyRec.vitaminA ? 'Sudah Diberikan' : 'Belum') : '-',
          monthlyRec ? (monthlyRec.obatCacing ? 'Sudah Diberikan' : 'Belum') : '-',
          monthlyRec ? monthlyRec.imunisasi : '-',
          monthlyRec ? monthlyRec.keluhan : '-',
          monthlyRec
            ? monthlyRec.catatanKader
            : `Menunggu pelaksanaan posyandu bulan ${currentMonthName} ${selectedYear}`,
        ];
        csvContent += row.map(escapeCSV).join(',') + '\n';
      });
    } else if (type === 'bumil') {
      filename = `Data_Ibu_Hamil_KIA_Posyandu_Melati_${dateStamp}.csv`;

      // Header Kolom Lengkap Standar Maternal Dinkes
      const headers = [
        'No',
        'NIK Ibu Hamil',
        'Nama Ibu Hamil',
        'Tanggal Lahir',
        'Nama Suami',
        'Alamat Lengkap',
        'Posyandu',
        'No WhatsApp / Telepon',
        'HPHT',
        'HPL',
        'Usia Kehamilan (Minggu)',
        'Gravida (G)',
        'Partus (P)',
        'Abortus (A)',
        'LiLA Awal (cm)',
        'LiLA Saat Ini (cm)',
        'Kadar Hb (g/dL)',
        'Status Risiko KEK',
        'Status Anemia',
        'Buku KIA',
        'Konsumsi TTD (Butir)',
        'Desil Ekonomi',
        'Rencana Intervensi MBG',
      ];
      csvContent += headers.map(escapeCSV).join(',') + '\n';

      bumilList.forEach((bm, idx) => {
        const isKEK = bm.statusKEK || bm.lilaSaatIni < 23.5;
        const row = [
          idx + 1,
          bm.nik,
          bm.nama,
          bm.tanggalLahir,
          bm.namaSuami,
          bm.alamat,
          'Posyandu Melati RW 03',
          bm.noHp,
          bm.hpht,
          bm.hpl,
          bm.usiaKehamilanMinggu,
          bm.gravida,
          bm.partus,
          bm.abortus,
          bm.lilaAwal,
          bm.lilaSaatIni,
          bm.hb,
          isKEK ? 'Risiko KEK (Wajib MBG)' : 'Normal',
          bm.statusAnemia ? 'Anemia' : 'Normal',
          bm.bukuKIA ? 'Lengkap & Terverifikasi' : 'Belum Lengkap',
          bm.konsumsiTTD,
          `Desil ${bm.desilEkonomi}`,
          isKEK
            ? 'Alokasi Menu Tambahan Padat Protein & Tablet Tambah Darah Harian'
            : 'Pemantauan Rutin Antenatal',
        ];
        csvContent += row.map(escapeCSV).join(',') + '\n';
      });
    } else {
      filename = `Data_Lansia_PTM_Posyandu_Melati_${dateStamp}.csv`;
      const periksaLansiaList = PosyanduStore.getPemeriksaanLansia();

      // Header Kolom Lengkap Standar Posyandu Lansia
      const headers = [
        'No',
        'NIK Lansia',
        'Nama Lansia',
        'Jenis Kelamin',
        'Tanggal Lahir',
        'Usia (Tahun)',
        'Nama Keluarga / Pendamping',
        'Alamat Lengkap',
        'Posyandu',
        'No WhatsApp / Telepon',
        'Golongan Darah',
        'Riwayat Penyakit Komorbid',
        'Tanggal Periksa Terakhir',
        'Berat Badan (kg)',
        'Tinggi Badan (cm)',
        'Indeks Massa Tubuh (IMT)',
        'Status Gizi Lansia',
        'Tensi Sistolik (mmHg)',
        'Tensi Diastolik (mmHg)',
        'Status Tekanan Darah',
        'Gula Darah Sewaktu (mg/dL)',
        'Status Gula Darah',
        'Kolesterol Total (mg/dL)',
        'Asam Urat (mg/dL)',
        'Keluhan Kesehatan',
        'Tindakan Edukasi & Rekomendasi Menu MBG Lansia',
      ];
      csvContent += headers.map(escapeCSV).join(',') + '\n';

      lansiaList.forEach((l, idx) => {
        const lastExam = periksaLansiaList.find((p) => p.lansiaId === l.id);
        const row = [
          idx + 1,
          l.nik,
          l.nama,
          l.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
          l.tanggalLahir,
          l.usiaTahun,
          l.namaKeluarga,
          l.alamat,
          'Posyandu Melati RW 03',
          l.noHp,
          l.golonganDarah,
          Array.isArray(l.riwayatPenyakit) ? l.riwayatPenyakit.join('; ') : l.riwayatPenyakit,
          lastExam ? lastExam.tanggalPeriksa : 'Belum Diperiksa Bulan Ini',
          lastExam ? lastExam.beratBadan : '-',
          lastExam ? lastExam.tinggiBadan : '-',
          lastExam ? lastExam.imt : '-',
          lastExam ? lastExam.statusGizi : '-',
          lastExam ? lastExam.tensiSistolik : '-',
          lastExam ? lastExam.tensiDiastolik : '-',
          lastExam ? lastExam.statusTensi : '-',
          lastExam ? lastExam.gulaDarah : '-',
          lastExam ? lastExam.statusGulaDarah : '-',
          lastExam ? lastExam.kolesterol : '-',
          lastExam ? lastExam.asamUrat : '-',
          lastExam ? lastExam.keluhan : '-',
          lastExam
            ? lastExam.tindakanEdukasi
            : 'Konseling diet sehat rendah garam & senam lansia',
        ];
        csvContent += row.map(escapeCSV).join(',') + '\n';
      });
    }

    // Menggunakan UTF-8 BOM (\uFEFF) agar Microsoft Excel di Windows membaca huruf, angka, dan aksen secara rapi tanpa berantakan
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const typeLabels = {
      balita: 'Data Balita & Antropometri',
      bumil: 'Data Ibu Hamil & Antenatal',
      lansia: 'Data Lansia & Skrining PTM',
    };

    toast.success(
      'Ekspor CSV Berhasil Diunduh',
      `File ${typeLabels[type]} telah diunduh dengan rapi & kompatibel dengan Microsoft Excel.`
    );
  };

  return (
    <div className="no-print print:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="p-6 border-b border-[#fce1e4] flex items-center justify-between bg-gradient-to-r from-[#fff5f6] to-white">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#80000f] text-white flex items-center justify-center font-bold shadow-md shadow-[#80000f]/20">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Ekspor &amp; Cetak Dokumen Resmi
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#fce1e4] text-[#80000f] text-[10px] font-bold border border-[#f8c8c8]">
                  {currentMonthName} {selectedYear}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Format resmi pelaporan bulanan UPTD Puskesmas Pembina &amp; Posyandu Melati
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Opsi Ekspor & Cetak yang Tertata Rapi */}
        <div className="p-6 space-y-3.5 text-xs">
          {/* Opsi 1: Cetak Lembar Resmi A4 (PDF) */}
          <div className="p-4 bg-gradient-to-r from-[#fff5f6] to-white border-2 border-[#fce1e4] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#80000f] text-white flex items-center justify-center text-xs font-bold">
                  <Printer className="w-3.5 h-3.5" />
                </span>
                <h4 className="font-bold text-slate-900 text-sm">
                  Cetak Lembar Resmi Puskesmas (A4 / PDF)
                </h4>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed pl-8">
                Format cetak dinas formal hitam putih lengkap dengan Kop Pemprov Sumsel, Nomor Surat Romawi, dan Tanda Tangan Bidan Pembina.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#80000f] hover:bg-[#66000c] text-white rounded-full font-bold shadow-md shadow-[#80000f]/20 transition-all hover:scale-102 shrink-0 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
          </div>

          {/* Opsi 2: Data Balita & Antropometri KMS (CSV) */}
          <div className="p-4 bg-slate-50 hover:bg-slate-50/80 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  <Baby className="w-3.5 h-3.5" />
                </span>
                <h4 className="font-bold text-slate-900 text-sm">
                  Data Balita &amp; Antropometri KMS (CSV)
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {balitaList.length} Balita
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed pl-8">
                Data master balita, NIK, orang tua, rekam penimbangan BB/TB, Z-Score WHO, status KMS (N/T/2T/BGM), dan vitamin A.
              </p>
            </div>
            <button
              type="button"
              onClick={() => exportCSV('balita')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold shadow-sm transition-all hover:scale-102 shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
          </div>

          {/* Opsi 3: Data Ibu Hamil Maternal & LiLA (CSV) */}
          <div className="p-4 bg-slate-50 hover:bg-slate-50/80 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-pink-600 text-white flex items-center justify-center text-xs font-bold">
                  <HeartPulse className="w-3.5 h-3.5" />
                </span>
                <h4 className="font-bold text-slate-900 text-sm">
                  Data Ibu Hamil Maternal &amp; LiLA (CSV)
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 text-[10px] font-bold">
                  {bumilList.length} Bumil
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed pl-8">
                Data antenatal HPHT, HPL, usia gestasi, pengukuran LiLA, skrining KEK, kadar Hb anemia, dan buku KIA.
              </p>
            </div>
            <button
              type="button"
              onClick={() => exportCSV('bumil')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold shadow-sm transition-all hover:scale-102 shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
          </div>

          {/* Opsi 4: Data Lansia & Skrining PTM (CSV) */}
          <div className="p-4 bg-slate-50 hover:bg-slate-50/80 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  <Users className="w-3.5 h-3.5" />
                </span>
                <h4 className="font-bold text-slate-900 text-sm">
                  Data Posyandu Lansia &amp; Skrining PTM (CSV)
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  {lansiaList.length} Lansia
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed pl-8">
                Data kohort lansia, tensi darah hipertensi, gula darah, asam urat, kolesterol, dan edukasi gizi sehat.
              </p>
            </div>
            <button
              type="button"
              onClick={() => exportCSV('lansia')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold shadow-sm transition-all hover:scale-102 shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Format CSV kompatibel dengan Microsoft Excel &amp; Google Sheets</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
