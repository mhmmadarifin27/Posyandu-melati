'use client';

import React, { useState, useEffect } from 'react';
import { X, Activity, Check, HeartPulse, User } from 'lucide-react';
import { Lansia, PemeriksaanLansia } from '@/types/posyandu';
import { PosyanduStore } from '@/lib/supabase';
import { toast } from '@/components/ui/custom-toast';

interface AddLansiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  lansiaList: Lansia[];
  selectedLansiaId?: string;
  onSuccess: () => void;
}

export default function AddLansiaModal({
  isOpen,
  onClose,
  lansiaList,
  selectedLansiaId,
  onSuccess,
}: AddLansiaModalProps) {
  const [lansiaId, setLansiaId] = useState<string>('');
  const [tanggalPeriksa, setTanggalPeriksa] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [beratBadan, setBeratBadan] = useState<number>(50.0);
  const [tinggiBadan, setTinggiBadan] = useState<number>(155.0);
  const [tensiSistolik, setTensiSistolik] = useState<number>(130);
  const [tensiDiastolik, setTensiDiastolik] = useState<number>(85);
  const [gulaDarah, setGulaDarah] = useState<number>(120);
  const [kolesterol, setKolesterol] = useState<number>(190);
  const [asamUrat, setAsamUrat] = useState<number>(6.0);
  const [keluhan, setKeluhan] = useState<string>('Nyeri sendi ringan');
  const [tindakanEdukasi, setTindakanEdukasi] = useState<string>(
    'Anjuran gizi rendah purin dan senam lansia rutin'
  );
  const [petugas, setPetugas] = useState<string>('Bidan Desa / Kader Posyandu Melati');

  useEffect(() => {
    if (selectedLansiaId) {
      setLansiaId(selectedLansiaId);
    } else if (lansiaList.length > 0 && !lansiaId) {
      setLansiaId(lansiaList[0].id);
    }
  }, [selectedLansiaId, lansiaList]);

  if (!isOpen) return null;

  // Kalkulasi IMT otomatis
  const tbMeter = tinggiBadan / 100;
  const imt = tbMeter > 0 ? Math.round((beratBadan / (tbMeter * tbMeter)) * 10) / 10 : 0;
  const statusGizi =
    imt < 18.5 ? 'Kurus' : imt <= 24.9 ? 'Normal' : imt <= 29.9 ? 'Kelebihan Berat' : 'Obesitas';

  // Status Tekanan Darah
  const statusTensi =
    tensiSistolik >= 140 || tensiDiastolik >= 90
      ? 'Hipertensi'
      : tensiSistolik >= 120 || tensiDiastolik >= 80
      ? 'Pre-Hipertensi'
      : tensiSistolik < 90
      ? 'Hipotensi'
      : 'Normal';

  // Status Gula Darah
  const statusGulaDarah =
    gulaDarah >= 200 ? 'Tinggi (Diabetes)' : gulaDarah >= 140 ? 'Pre-Diabetes' : 'Normal';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const record: PemeriksaanLansia = {
      id: `plan-${Date.now()}`,
      lansiaId,
      tanggalPeriksa,
      beratBadan,
      tinggiBadan,
      imt,
      statusGizi,
      tensiSistolik,
      tensiDiastolik,
      statusTensi,
      gulaDarah,
      statusGulaDarah,
      kolesterol,
      asamUrat,
      keluhan,
      tindakanEdukasi,
      petugas,
    };

    PosyanduStore.addPemeriksaanLansia(record);
    const selectedLansia = lansiaList.find((l) => l.id === lansiaId);
    toast.success(
      'Pemeriksaan Lansia Berhasil Disimpan',
      `Tensi: ${tensiSistolik}/${tensiDiastolik} mmHg (${statusTensi}) untuk ${selectedLansia?.nama || 'Lansia'}`
    );
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pemeriksaan Kesehatan Lansia (Posyandu Melati)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pencatatan tekanan darah, gula darah sewaktu, kolesterol, dan status gizi lansia
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Lansia Sasaran:</label>
            <select
              value={lansiaId}
              onChange={(e) => setLansiaId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
            >
              {lansiaList.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nama} (NIK: {l.nik} • {l.usiaTahun} Thn • {l.jenisKelamin === 'L' ? 'L' : 'P'})
                </option>
              ))}
            </select>

            {/* Quick Profile Card Lansia */}
            {(() => {
              const selectedLansia = lansiaList.find((l) => l.id === lansiaId);
              if (!selectedLansia) return null;
              return (
                <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{selectedLansia.nama}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono">
                        NIK: {selectedLansia.nik}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Usia: {selectedLansia.usiaTahun} Tahun &bull; Pendamping: {selectedLansia.namaKeluarga} &bull; {selectedLansia.alamat}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Pemeriksaan:</label>
              <input
                type="date"
                value={tanggalPeriksa}
                onChange={(e) => setTanggalPeriksa(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">BB (kg):</label>
                <input
                  type="number"
                  step="0.1"
                  value={beratBadan}
                  onChange={(e) => setBeratBadan(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">TB (cm):</label>
                <input
                  type="number"
                  step="0.1"
                  value={tinggiBadan}
                  onChange={(e) => setTinggiBadan(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pengukuran Vital Signs */}
          <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-200/70 space-y-3">
            <div className="font-bold text-teal-900 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-teal-700" />
              <span>Tekanan Darah & Pemeriksaan Laboratorium Sederhana</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Sistolik (mmHg):</label>
                <input
                  type="number"
                  value={tensiSistolik}
                  onChange={(e) => setTensiSistolik(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Diastolik (mmHg):</label>
                <input
                  type="number"
                  value={tensiDiastolik}
                  onChange={(e) => setTensiDiastolik(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">GDS (mg/dL):</label>
                <input
                  type="number"
                  value={gulaDarah}
                  onChange={(e) => setGulaDarah(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Asam Urat (mg/dL):</label>
                <input
                  type="number"
                  step="0.1"
                  value={asamUrat}
                  onChange={(e) => setAsamUrat(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold"
                />
              </div>
            </div>

            {/* Badges Status Otomatis */}
            <div className="pt-2 border-t border-[#fce1e4] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-600">IMT: <strong>{imt}</strong></span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-slate-200">
                  {statusGizi}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Tensi:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    statusTensi === 'Hipertensi'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-[#fff5f6] text-[#80000f] border border-[#fce1e4]'
                  }`}
                >
                  {statusTensi} ({tensiSistolik}/{tensiDiastolik})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Gula Darah:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    statusGulaDarah === 'Tinggi (Diabetes)'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-[#fff5f6] text-[#80000f] border border-[#fce1e4]'
                  }`}
                >
                  {statusGulaDarah}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Keluhan Lansia:</label>
            <input
              type="text"
              value={keluhan}
              onChange={(e) => setKeluhan(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
              placeholder="Misal: Pusing kepala, pegal linu di persendian lutut..."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tindakan & Edukasi Kader / Bidan:</label>
            <input
              type="text"
              value={tindakanEdukasi}
              onChange={(e) => setTindakanEdukasi(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#80000f] hover:bg-[#66000c] text-white font-bold shadow-md shadow-[#80000f]/20 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Pemeriksaan Lansia</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
