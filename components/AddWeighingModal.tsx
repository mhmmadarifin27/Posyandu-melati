'use client';

import React, { useState, useEffect } from 'react';
import { X, Scale, Ruler, Check, AlertCircle, Baby } from 'lucide-react';
import { Balita, PemeriksaanBalita, StatusKMS } from '@/types/posyandu';
import { calculateZScoreBBU, getStatusGiziBBU, getKBMGram } from '@/lib/who-growth-data';
import { PosyanduStore } from '@/lib/supabase';
import { toast } from '@/components/ui/custom-toast';

interface AddWeighingModalProps {
  isOpen: boolean;
  onClose: () => void;
  balitaList: Balita[];
  selectedBalitaId?: string;
  onSuccess: () => void;
}

export default function AddWeighingModal({
  isOpen,
  onClose,
  balitaList,
  selectedBalitaId,
  onSuccess,
}: AddWeighingModalProps) {
  const [balitaId, setBalitaId] = useState<string>('');
  const [tanggalPeriksa, setTanggalPeriksa] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [usiaBulan, setUsiaBulan] = useState<number>(6);
  const [beratBadan, setBeratBadan] = useState<number>(7.2);
  const [tinggiBadan, setTinggiBadan] = useState<number>(66.0);
  const [lingkarKepala, setLingkarKepala] = useState<number>(42.0);
  const [caraUkur, setCaraUkur] = useState<'terlentang' | 'berdiri'>('terlentang');
  const [vitaminA, setVitaminA] = useState<boolean>(false);
  const [obatCacing, setObatCacing] = useState<boolean>(false);
  const [imunisasi, setImunisasi] = useState<string>('');
  const [keluhan, setKeluhan] = useState<string>('-');
  const [catatanKader, setCatatanKader] = useState<string>('');

  useEffect(() => {
    if (selectedBalitaId) {
      setBalitaId(selectedBalitaId);
    } else if (balitaList.length > 0 && !balitaId) {
      setBalitaId(balitaList[0].id);
    }
  }, [selectedBalitaId, balitaList]);

  if (!isOpen) return null;

  const currentBalita = balitaList.find((b) => b.id === balitaId) || balitaList[0];

  // Kalkulasi Realtime Z-Score BB/U
  const currentZScore = currentBalita
    ? calculateZScoreBBU(currentBalita.jenisKelamin, usiaBulan, beratBadan)
    : 0;
  const statusGiziBBU = getStatusGiziBBU(currentZScore);

  // Periksa data bulan sebelumnya untuk penentuan status KMS (N vs T vs 2T)
  const history = PosyanduStore.getPemeriksaan()
    .filter((p) => p.balitaId === balitaId)
    .sort((a, b) => new Date(b.tanggalPeriksa).getTime() - new Date(a.tanggalPeriksa).getTime());

  const lastPeriksa = history[0];
  let kenaikanBB = 0;
  let statusKMS: StatusKMS = 'N';
  const kbmKg = getKBMGram(usiaBulan) / 1000;

  if (lastPeriksa) {
    kenaikanBB = Math.round((beratBadan - lastPeriksa.beratBadan) * 100) / 100;
    if (currentZScore < -3) {
      statusKMS = 'BGM';
    } else if (kenaikanBB < kbmKg) {
      // Jika bulan lalu juga T atau 2T, maka sekarang 2T
      if (lastPeriksa.statusKMS === 'T' || lastPeriksa.statusKMS === '2T') {
        statusKMS = '2T';
      } else {
        statusKMS = 'T';
      }
    } else {
      statusKMS = 'N';
    }
  } else {
    kenaikanBB = 0;
    statusKMS = currentZScore < -3 ? 'BGM' : 'N';
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRecord: PemeriksaanBalita = {
      id: `p-${Date.now()}`,
      balitaId,
      tanggalPeriksa,
      usiaBulan,
      beratBadan,
      tinggiBadan,
      lingkarKepala,
      caraUkur,
      zScoreBBU: currentZScore,
      zScoreTBU: -1.0,
      zScoreBBTB: currentZScore > 0 ? 0.2 : -1.2,
      statusBBU: statusGiziBBU,
      statusTBU: 'Normal',
      statusBBTB: statusGiziBBU === 'Gizi Buruk' ? 'Gizi Buruk (Wasting)' : 'Normal',
      statusKMS,
      kenaikanBB,
      kbm: kbmKg,
      vitaminA,
      obatCacing,
      imunisasi,
      keluhan,
      catatanKader,
    };

    PosyanduStore.addPemeriksaan(newRecord);
    toast.success(
      'Penimbangan Berhasil Dicatat',
      `BB: ${beratBadan} kg, TB: ${tinggiBadan} cm untuk ${currentBalita?.nama || 'Balita'} (Status: ${statusKMS})`
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
            <div className="w-10 h-10 rounded-2xl bg-[#80000f] text-white flex items-center justify-center shadow-md shadow-[#80000f]/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Input Penimbangan & Pemeriksaan Balita
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kalkulasi otomatis Z-score antropometri WHO dan deteksi KMS
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
          {/* Pilih Balita */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Balita:</label>
            <select
              value={balitaId}
              onChange={(e) => setBalitaId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
            >
              {balitaList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nama} ({b.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} &bull; Ibu: {b.namaIbu})
                </option>
              ))}
            </select>
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
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Usia Saat Ukur (Bulan):</label>
              <input
                type="number"
                min={0}
                max={60}
                value={usiaBulan}
                onChange={(e) => setUsiaBulan(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Antropometri */}
          <div className="p-4 bg-[#fff5f6] rounded-2xl border border-[#fce1e4] space-y-3">
            <div className="font-bold text-[#80000f] flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-[#80000f]" />
              <span>Hasil Pengukuran Antropometri</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Berat Badan (kg):</label>
                <input
                  type="number"
                  step="0.01"
                  value={beratBadan}
                  onChange={(e) => setBeratBadan(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 text-sm focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tinggi Badan (cm):</label>
                <input
                  type="number"
                  step="0.1"
                  value={tinggiBadan}
                  onChange={(e) => setTinggiBadan(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Lingkar Kepala (cm):</label>
                <input
                  type="number"
                  step="0.1"
                  value={lingkarKepala}
                  onChange={(e) => setLingkarKepala(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
                />
              </div>
            </div>

            {/* Preview Status Otomatis */}
            <div className="pt-2 border-t border-[#fce1e4] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Z-Score BB/U:</span>
                <span className="font-mono font-bold text-[#80000f] text-sm">
                  {currentZScore} SD
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-slate-200">
                  {statusGiziBBU}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Status KMS:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    statusKMS === 'N'
                      ? 'bg-[#fff5f6] text-[#80000f] border border-[#fce1e4]'
                      : statusKMS === '2T' || statusKMS === 'BGM'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {statusKMS} ({statusKMS === 'N' ? 'Naik' : statusKMS === '2T' ? '2T (Garis Kuning)' : statusKMS})
                </span>
              </div>
            </div>
          </div>

          {/* Suplementasi & Imunisasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-semibold text-slate-700">Suplementasi:</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vitaminA}
                    onChange={(e) => setVitaminA(e.target.checked)}
                    className="rounded text-[#80000f] focus:ring-[#80000f] w-4 h-4"
                  />
                  <span>Kapsul Vitamin A</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={obatCacing}
                    onChange={(e) => setObatCacing(e.target.checked)}
                    className="rounded text-[#80000f] focus:ring-[#80000f] w-4 h-4"
                  />
                  <span>Obat Cacing</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Imunisasi yang Diberikan:</label>
              <input
                type="text"
                placeholder="Contoh: DPT-HB-Hib 2, Polio 3"
                value={imunisasi}
                onChange={(e) => setImunisasi(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Keluhan / Catatan Medis:</label>
            <input
              type="text"
              placeholder="Contoh: Nafsu makan menurun pasca batuk pilek"
              value={keluhan}
              onChange={(e) => setKeluhan(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
            />
          </div>

          {/* Footer Form */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#80000f] hover:bg-[#66000c] text-white font-bold shadow-md shadow-[#80000f]/20 transition-transform hover:scale-[1.02]"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Hasil Penimbangan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
