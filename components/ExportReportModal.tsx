'use client';

import React from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  Baby,
  HeartPulse,
  Users,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import * as XLSX from 'xlsx';
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
  const targetMonthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  // =========================================================================
  // DATASET GENERATOR: BALITA & KMS
  // =========================================================================
  const getBalitaData = () => {
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

    const rows = balitaList.map((b, idx) => {
      const records = pemeriksaanList
        .filter((p) => p.balitaId === b.id)
        .sort((x, y) => new Date(y.tanggalPeriksa).getTime() - new Date(x.tanggalPeriksa).getTime());

      const monthlyRec = records.find((p) => p.tanggalPeriksa.startsWith(targetMonthStr)) || records[0];

      return [
        idx + 1,
        String(b.nik),
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
          : `Menunggu sesi penimbangan posyandu bulan ${currentMonthName} ${selectedYear}`,
      ];
    });

    const colWidths = [
      6, 22, 26, 15, 16, 14, 24, 24, 30, 24, 15, 18, 15, 16, 16, 14, 16, 18, 16, 15, 15, 16, 15, 18, 22, 45,
    ];

    return { headers, rows, colWidths };
  };

  // =========================================================================
  // DATASET GENERATOR: IBU HAMIL & KIA
  // =========================================================================
  const getBumilData = () => {
    const headers = [
      'No',
      'NIK Ibu Hamil',
      'Nama Ibu Hamil',
      'Tanggal Lahir',
      'Nama Suami',
      'Alamat Lengkap',
      'Posyandu',
      'No WhatsApp / HP',
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

    const rows = bumilList.map((bm, idx) => {
      const isKEK = bm.statusKEK || bm.lilaSaatIni < 23.5;
      return [
        idx + 1,
        String(bm.nik),
        bm.nama,
        bm.tanggalLahir,
        bm.namaSuami,
        bm.alamat,
        'Posyandu Melati RW 03',
        String(bm.noHp),
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
    });

    const colWidths = [
      6, 22, 26, 16, 24, 30, 24, 22, 16, 16, 16, 12, 12, 12, 16, 16, 16, 24, 16, 22, 18, 16, 45,
    ];

    return { headers, rows, colWidths };
  };

  // =========================================================================
  // DATASET GENERATOR: LANSIA & PTM
  // =========================================================================
  const getLansiaData = () => {
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
      'Riwayat Komorbid',
      'Tanggal Periksa Terakhir',
      'Berat Badan (kg)',
      'Tinggi Badan (cm)',
      'Indeks Massa Tubuh (IMT)',
      'Status Gizi Lansia',
      'Tensi Sistolik (mmHg)',
      'Tensi Diastolik (mmHg)',
      'Status Tekanan Darah',
      'Gula Darah (mg/dL)',
      'Status Gula Darah',
      'Kolesterol Total (mg/dL)',
      'Asam Urat (mg/dL)',
      'Keluhan Kesehatan',
      'Tindakan Edukasi & Rekomendasi Menu MBG Lansia',
    ];

    const periksaLansiaList = PosyanduStore.getPemeriksaanLansia();

    const rows = lansiaList.map((l, idx) => {
      const lastExam = periksaLansiaList.find((p) => p.lansiaId === l.id);
      return [
        idx + 1,
        String(l.nik),
        l.nama,
        l.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        l.tanggalLahir,
        l.usiaTahun,
        l.namaKeluarga,
        l.alamat,
        'Posyandu Melati RW 03',
        String(l.noHp),
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
          : 'Konseling pola makan rendah garam & aktivitas fisik rutin',
      ];
    });

    const colWidths = [
      6, 22, 26, 14, 16, 14, 24, 30, 24, 22, 14, 26, 18, 15, 15, 14, 18, 16, 16, 20, 16, 18, 18, 16, 22, 45,
    ];

    return { headers, rows, colWidths };
  };

  // =========================================================================
  // EKSPOR FORMAT EXCEL RESMI (.XLSX) - KOLOM PAS & NIK 16 DIGIT UTUH
  // =========================================================================
  const exportExcel = (type: 'balita' | 'bumil' | 'lansia') => {
    const dateStamp = `${selectedYear}_${String(selectedMonth).padStart(2, '0')}`;
    let dataset: { headers: string[]; rows: any[][]; colWidths: number[] };
    let sheetName = '';
    let filename = '';

    if (type === 'balita') {
      dataset = getBalitaData();
      sheetName = 'Data Balita & KMS';
      filename = `Data_Balita_Antropometri_Posyandu_Melati_${dateStamp}.xlsx`;
    } else if (type === 'bumil') {
      dataset = getBumilData();
      sheetName = 'Data Bumil & KIA';
      filename = `Data_Ibu_Hamil_KIA_Posyandu_Melati_${dateStamp}.xlsx`;
    } else {
      dataset = getLansiaData();
      sheetName = 'Data Lansia PTM';
      filename = `Data_Lansia_PTM_Posyandu_Melati_${dateStamp}.xlsx`;
    }

    const allData = [dataset.headers, ...dataset.rows];
    const ws = XLSX.utils.aoa_to_sheet(allData);

    // Set kolom agar lebar pas dan TIDAK PERNAH muncul tanda ######
    ws['!cols'] = dataset.colWidths.map((w) => ({ wch: w }));

    // Pastikan setiap cell NIK (kolom B / C=1) dan nomor HP bertipe 's' (string) agar tidak jadi scientific 3.2E+15
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[cellAddress];
        if (!cell) continue;

        // Kolom 1 adalah NIK
        if (C === 1 && R > 0) {
          cell.t = 's';
          cell.z = '@';
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, filename);

    toast.success(
      'File Excel (.xlsx) Berhasil Diunduh',
      `File ${filename} telah diunduh. Format rapi, NIK utuh 16 digit, dan kolom tidak terpotong.`
    );
  };

  // =========================================================================
  // EKSPOR FORMAT CSV STANDAR (.CSV) - FORMULA NIK AGAR AMAN DI EXCEL
  // =========================================================================
  const exportCSV = (type: 'balita' | 'bumil' | 'lansia') => {
    const dateStamp = `${selectedYear}_${String(selectedMonth).padStart(2, '0')}`;
    let dataset: { headers: string[]; rows: any[][]; colWidths: number[] };
    let filename = '';

    if (type === 'balita') {
      dataset = getBalitaData();
      filename = `Data_Balita_Antropometri_Posyandu_Melati_${dateStamp}.csv`;
    } else if (type === 'bumil') {
      dataset = getBumilData();
      filename = `Data_Ibu_Hamil_KIA_Posyandu_Melati_${dateStamp}.csv`;
    } else {
      dataset = getLansiaData();
      filename = `Data_Lansia_PTM_Posyandu_Melati_${dateStamp}.csv`;
    }

    // Escape sel CSV: jika NIK (16 digit angka), format sebagai formula ="..." agar saat dibuka di Excel tidak jadi 3.2E+15
    const escapeCSVCell = (val: any, colIdx: number) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');

      if (colIdx === 1 && /^\d{10,}$/.test(String(val))) {
        return `="""${str}"""`;
      }
      return `"${str}"`;
    };

    let csvContent = dataset.headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';
    dataset.rows.forEach((row) => {
      csvContent += row.map((cell, colIdx) => escapeCSVCell(cell, colIdx)).join(',') + '\n';
    });

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(
      'File CSV Berhasil Diunduh',
      `File ${filename} telah diunduh dengan proteksi formula NIK 16 digit.`
    );
  };

  return (
    <div className="no-print print:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="p-6 border-b border-[#fce1e4] flex items-center justify-between bg-gradient-to-r from-[#fff5f6] to-white">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#80000f] text-white flex items-center justify-center font-bold shadow-md shadow-[#80000f]/20">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Ekspor Data Posyandu Melati
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#fce1e4] text-[#80000f] text-[10px] font-bold border border-[#f8c8c8]">
                  {currentMonthName} {selectedYear}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih format <strong>Excel (.xlsx)</strong> untuk tampilan rapi otomatis di Microsoft Excel, atau <strong>CSV</strong> untuk integrasi sistem.
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

        {/* 3 Opsi Unduhan Data */}
        <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
          {/* Card 1: Data Balita & Antropometri KMS */}
          <div className="p-4 bg-slate-50 hover:bg-slate-50/80 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3.5 transition-colors">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  <Baby className="w-3.5 h-3.5" />
                </span>
                <h4 className="font-bold text-slate-900 text-sm">
                  Data Balita &amp; Antropometri KMS
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {balitaList.length} Balita
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed pl-8">
                Master balita, NIK 16 digit, orang tua, hasil timbang BB/TB, Z-Score WHO, status KMS (N/T/2T/BGM), vitamin A, dan obat cacing.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 pl-8 md:pl-0">
              <button
                type="button"
                onClick={() => exportExcel('balita')}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all hover:scale-102 cursor-pointer"
                title="Unduh format Microsoft Excel resmi dengan kolom rapi & NIK utuh"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Unduh Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => exportCSV('balita')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                title="Unduh format teks CSV standar"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Card 2: Data Ibu Hamil Maternal & LiLA */}
          <div className="p-4 bg-slate-50 hover:bg-slate-50/80 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3.5 transition-colors">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-pink-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  <HeartPulse className="w-3.5 h-3.5" />
                </span>
                <h4 className="font-bold text-slate-900 text-sm">
                  Data Ibu Hamil Maternal &amp; LiLA
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 text-[10px] font-bold">
                  {bumilList.length} Bumil
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed pl-8">
                Data antenatal HPHT, HPL, usia gestasi, pengukuran LiLA, skrining risiko KEK, kadar Hb anemia, dan buku KIA.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 pl-8 md:pl-0">
              <button
                type="button"
                onClick={() => exportExcel('bumil')}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all hover:scale-102 cursor-pointer"
                title="Unduh format Microsoft Excel resmi dengan kolom rapi & NIK utuh"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Unduh Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => exportCSV('bumil')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                title="Unduh format teks CSV standar"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Card 3: Data Posyandu Lansia & Skrining PTM */}
          <div className="p-4 bg-slate-50 hover:bg-slate-50/80 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3.5 transition-colors">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </span>
                <h4 className="font-bold text-slate-900 text-sm">
                  Data Posyandu Lansia &amp; Skrining PTM
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  {lansiaList.length} Lansia
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed pl-8">
                Data lansia, tensi hipertensi, skrining gula darah, asam urat, kolesterol total, dan konseling gizi.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 pl-8 md:pl-0">
              <button
                type="button"
                onClick={() => exportExcel('lansia')}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all hover:scale-102 cursor-pointer"
                title="Unduh format Microsoft Excel resmi dengan kolom rapi & NIK utuh"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Unduh Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => exportCSV('lansia')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                title="Unduh format teks CSV standar"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Modal dengan Tips Nyata */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Format <strong>Excel (.xlsx)</strong> otomatis mengatur lebar kolom &amp; menjaga NIK 16-digit agar tidak berubah menjadi <em>3.2E+15</em>.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer shrink-0"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
