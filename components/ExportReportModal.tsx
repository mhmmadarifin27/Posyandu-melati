'use client';

import React from 'react';
import { X, Printer, Download, FileSpreadsheet } from 'lucide-react';
import { Balita, PemeriksaanBalita, IbuHamil, Lansia } from '@/types/posyandu';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  balitaList: Balita[];
  pemeriksaanList: PemeriksaanBalita[];
  bumilList: IbuHamil[];
  lansiaList?: Lansia[];
}

export default function ExportReportModal({
  isOpen,
  onClose,
  balitaList,
  bumilList,
  lansiaList = [],
}: ExportReportModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = (type: 'balita' | 'bumil' | 'lansia') => {
    let csvContent = '';
    let filename = '';

    if (type === 'balita') {
      filename = 'data_balita_posyandu_melati.csv';
      csvContent = 'NIK,Nama,Jenis Kelamin,Tgl Lahir,Nama Ibu,Posyandu,Desil Ekonomi\n';
      balitaList.forEach((b) => {
        csvContent += `"${b.nik}","${b.nama}","${b.jenisKelamin}","${b.tanggalLahir}","${b.namaIbu}","Posyandu Melati",${b.desilEkonomi}\n`;
      });
    } else if (type === 'bumil') {
      filename = 'data_ibu_hamil_posyandu_melati.csv';
      csvContent = 'NIK,Nama,Usia Kehamilan,LiLA,Hb,Status KEK,Buku KIA\n';
      bumilList.forEach((bm) => {
        csvContent += `"${bm.nik}","${bm.nama}",${bm.usiaKehamilanMinggu},${bm.lilaSaatIni},${bm.hb},${bm.statusKEK},${bm.bukuKIA}\n`;
      });
    } else {
      filename = 'data_lansia_posyandu_melati.csv';
      csvContent = 'NIK,Nama,Jenis Kelamin,Usia,Nama Keluarga,Posyandu\n';
      lansiaList.forEach((l) => {
        csvContent += `"${l.nik}","${l.nama}","${l.jenisKelamin}",${l.usiaTahun},"${l.namaKeluarga}","Posyandu Melati"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#80000f] text-white flex items-center justify-center font-bold shadow-md shadow-[#80000f]/20">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Ekspor & Cetak Laporan (Posyandu Melati)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Format resmi pelaporan bulanan ke Puskesmas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 space-y-3 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Cetak Dokumen Resmi (PDF)</h4>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Format cetak standar lengkap dengan kop surat Posyandu Melati & tanda tangan Bidan.
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#80000f] hover:bg-[#66000c] text-white rounded-full font-bold shadow-md shadow-[#80000f]/20 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Data Balita (CSV)</h4>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Data master balita dan rekam penimbangan antropometri.
              </p>
            </div>
            <button
              onClick={() => exportCSV('balita')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full font-bold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Data Ibu Hamil (CSV)</h4>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Data pemantauan kehamilan, status KEK, dan anemia.
              </p>
            </div>
            <button
              onClick={() => exportCSV('bumil')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full font-bold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Data Lansia (CSV)</h4>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Rekap kohort lansia dan riwayat penyakit tidak menular.
              </p>
            </div>
            <button
              onClick={() => exportCSV('lansia')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full font-bold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
