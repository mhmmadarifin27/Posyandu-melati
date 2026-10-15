'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Plus,
  Search,
  HeartPulse,
  Scale,
  Calendar,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  Users,
  CalendarCheck,
  ChevronRight,
  Phone,
  MapPin,
  X,
  Droplet,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AddLansiaModal from '@/components/AddLansiaModal';
import { PosyanduStore } from '@/lib/supabase';
import { Lansia, PemeriksaanLansia, UserRole } from '@/types/posyandu';
import { toast } from '@/components/ui/custom-toast';

export default function LansiaPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>('bidan');
  const [viewMode, setViewMode] = useState<'sesi_bulan_ini' | 'master_tersimpan'>('sesi_bulan_ini');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lansiaList, setLansiaList] = useState<Lansia[]>([]);
  const [pemeriksaanList, setPemeriksaanList] = useState<PemeriksaanLansia[]>([]);

  // Modals
  const [isCheckupOpen, setIsCheckupOpen] = useState(false);
  const [activeLansiaId, setActiveLansiaId] = useState('');
  const [isAddLansiaOpen, setIsAddLansiaOpen] = useState(false);
  const [editingLansia, setEditingLansia] = useState<Lansia | null>(null);

  // Form Lansia Baru
  const [nama, setNama] = useState('');
  const [nik, setNik] = useState('');
  const [jk, setJk] = useState<'L' | 'P'>('L');
  const [tglLahir, setTglLahir] = useState('1955-05-10');
  const [usia, setUsia] = useState(69);
  const [namaKeluarga, setNamaKeluarga] = useState('');
  const [alamat, setAlamat] = useState('RT 02 / RW 03');
  const [noHp, setNoHp] = useState('081234567890');

  const loadData = () => {
    setLansiaList(PosyanduStore.getLansia());
    setPemeriksaanList(PosyanduStore.getPemeriksaanLansia());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Deteksi Duplikasi Real-time berdasarkan NIK atau Nama
  const duplicateLansia = lansiaList.find(
    (l) =>
      (nik && l.nik.trim() === nik.trim()) ||
      (nama && l.nama.trim().toLowerCase() === nama.trim().toLowerCase())
  );

  const handleSaveLansia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nik || nik.length !== 16) {
      toast.warning('NIK Tidak Valid', 'NIK Lansia harus 16 digit sesuai e-KTP/Kartu Keluarga.');
      return;
    }
    if (duplicateLansia) {
      toast.error('Data Sudah Terdaftar', `Lansia ${duplicateLansia.nama} sudah tercatat dengan NIK ${duplicateLansia.nik}.`);
      return;
    }

    const newL: Lansia = {
      id: `lan-${Date.now()}`,
      nik,
      nama,
      jenisKelamin: jk,
      tanggalLahir: tglLahir,
      usiaTahun: usia,
      namaKeluarga,
      alamat,
      noHp,
      posyandu: 'Posyandu Melati',
      riwayatPenyakit: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    PosyanduStore.addLansia(newL);
    toast.success(
      'Lansia Berhasil Didaftarkan',
      `Data atas nama ${nama} (NIK: ${nik}, ${usia} tahun) berhasil disimpan ke Posyandu Melati.`
    );
    setIsAddLansiaOpen(false);
    resetFormLansia();
    loadData();
  };

  const handleUpdateLansia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLansia) return;
    if (!editingLansia.nik || editingLansia.nik.length !== 16) {
      toast.warning('NIK Tidak Valid', 'NIK Lansia harus 16 digit.');
      return;
    }

    PosyanduStore.updateLansia(editingLansia);
    toast.success('Data Lansia Diperbarui', `Perubahan data untuk ${editingLansia.nama} berhasil disimpan.`);
    setEditingLansia(null);
    loadData();
  };

  const handleDeleteLansia = (lansia: Lansia) => {
    toast.confirm(
      'Hapus Data Lansia?',
      `Apakah Anda yakin ingin menghapus data sasaran lansia ${lansia.nama} (NIK: ${lansia.nik})? Seluruh riwayat rekam medis skrining juga akan dihapus.`,
      () => {
        PosyanduStore.deleteLansia(lansia.id);
        toast.success('Data Berhasil Dihapus', `Data sasaran lansia ${lansia.nama} telah dihapus.`);
        loadData();
      }
    );
  };

  const resetFormLansia = () => {
    setNama('');
    setNik('');
    setJk('L');
    setTglLahir('1955-05-10');
    setUsia(69);
    setNamaKeluarga('');
    setAlamat('RT 02 / RW 03');
    setNoHp('081234567890');
  };

  // Filter pencarian
  const filteredLansia = lansiaList.filter((l) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return l.nama.toLowerCase().includes(q) || l.nik.includes(q) || l.namaKeluarga.toLowerCase().includes(q);
    }
    return true;
  });

  // Filter pemeriksaan bulan ini vs bulan lain
  const pemeriksaanBulanTerpilih = pemeriksaanList.filter((p) =>
    p.tanggalPeriksa.startsWith(selectedMonth)
  );

  // Lansia yang sudah diskrining bulan ini
  const lansiaDiskriningIds = new Set(pemeriksaanBulanTerpilih.map((p) => p.lansiaId));
  const sudahDiskriningCount = filteredLansia.filter((l) => lansiaDiskriningIds.has(l.id)).length;
  const belumDiskriningCount = filteredLansia.length - sudahDiskriningCount;

  // Kasus Prioritas Bulan Terpilih
  const hipertensiBulanIni = pemeriksaanBulanTerpilih.filter(
    (p) => p.statusTensi === 'Hipertensi'
  ).length;
  const diabetesBulanIni = pemeriksaanBulanTerpilih.filter(
    (p) => p.statusGulaDarah === 'Tinggi (Diabetes)'
  ).length;

  return (
    <div className="flex min-h-screen bg-[#f5f7f9]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header currentRole={currentRole} onRoleChange={setCurrentRole} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
          {/* Header Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#fff5f6] border border-[#fce1e4] text-[#80000f] flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Posyandu Lansia (Posyandu Melati)
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Skrining Penyakit Tidak Menular (Hipertensi, Diabetes, Kolesterol, Asam Urat) & Status IMT Lansia
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsAddLansiaOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-[#fff5f6] text-slate-700 hover:text-[#80000f] font-bold text-xs border border-slate-300 hover:border-[#fce1e4] transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#80000f]" />
                <span>+ Daftar Lansia Baru</span>
              </button>
              <button
                onClick={() => {
                  setActiveLansiaId(lansiaList[0]?.id || '');
                  setIsCheckupOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#80000f] hover:bg-[#66000c] text-white font-bold text-xs shadow-md shadow-[#80000f]/20 transition-transform hover:scale-102"
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>+ Input Skrining Kesehatan</span>
              </button>
            </div>
          </div>

          {/* Dual Mode Switcher: 📋 Sesi Bulan Ini vs 👥 Master Data Tersimpan */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-full w-fit">
              <button
                onClick={() => setViewMode('sesi_bulan_ini')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  viewMode === 'sesi_bulan_ini'
                    ? 'bg-[#80000f] text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>📋 Skrining Sesi Bulan Ini ({sudahDiskriningCount}/{filteredLansia.length})</span>
              </button>
              <button
                onClick={() => setViewMode('master_tersimpan')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  viewMode === 'master_tersimpan'
                    ? 'bg-[#80000f] text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>👥 Master Lansia Tersimpan ({lansiaList.length})</span>
              </button>
            </div>

            {/* Filter Bulan Pelayanan */}
            {viewMode === 'sesi_bulan_ini' && (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700">Bulan Skrining:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-[#80000f] text-xs focus:ring-2 focus:ring-[#80000f]/20 focus:outline-none"
                >
                  <option value="2026-10">Oktober 2026 (Pelayanan Terlaksana)</option>
                  <option value="2026-11">November 2026 (Mendatang / 0 Skrining)</option>
                  <option value="2026-09">September 2026 (Bulan Lalu)</option>
                </select>
              </div>
            )}
          </div>

          {/* Context Banner */}
          {viewMode === 'sesi_bulan_ini' ? (
            <div className="bg-[#fff5f6] border border-[#fce1e4] p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#80000f] text-white flex items-center justify-center font-bold shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-[#80000f] text-sm">
                    Status Pelayanan Lansia: Periode {selectedMonth === '2026-10' ? 'Oktober 2026' : 'November 2026'}
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    Menampilkan daftar lansia yang sudah diskrining tensi/gula darah vs belum hadir pada bulan ini. Jika beralih ke bulan baru yang belum posyandu, data otomatis mulai dari 0 tanpa menghapus riwayat sebelumnya.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                  ✓ {sudahDiskriningCount} Selesai
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                  ⏳ {belumDiskriningCount} Belum
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 border border-slate-200 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    Buku Master Register Lansia RW 03 Sukamaju (Data Tersimpan Permanen)
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    Data pokok kependudukan lansia (NIK 16 digit, jenis kelamin, usia, keluarga pendamping, alamat). Anda dapat mengedit identitas atau menghapus data jika lansia pindah/meninggal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Metrics Lansia Bulan Terpilih */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
              <div className="text-xs font-semibold text-slate-400">Total Lansia Terbina RW 03</div>
              <div className="text-2xl font-black text-slate-900">{filteredLansia.length} Orang</div>
              <p className="text-[11px] text-slate-400">
                {viewMode === 'sesi_bulan_ini' ? `${sudahDiskriningCount} hadir pada sesi ${selectedMonth}` : 'Tercatat di Posyandu Melati'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#fce1e4] bg-[#fff5f6] shadow-xs space-y-1">
              <div className="text-xs font-bold text-[#80000f] flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-[#80000f]" />
                <span>Hipertensi ({selectedMonth})</span>
              </div>
              <div className="text-2xl font-black text-[#80000f]">
                {selectedMonth === '2026-10' ? `${hipertensiBulanIni} Orang` : '0 Orang'}
              </div>
              <p className="text-[11px] text-[#80000f]/80">Tensi &ge; 140/90 mmHg</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-amber-200 bg-amber-50/20 shadow-xs space-y-1">
              <div className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-amber-600" />
                <span>Gula Darah Tinggi ({selectedMonth})</span>
              </div>
              <div className="text-2xl font-black text-amber-800">
                {selectedMonth === '2026-10' ? `${diabetesBulanIni} Orang` : '0 Orang'}
              </div>
              <p className="text-[11px] text-amber-700/80">Kadar GDS &ge; 200 mg/dL</p>
            </div>
          </div>

          {/* TABEL LANSIA (VIEW 1: SESI BULAN INI VS VIEW 2: MASTER TERSIMPAN) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm md:text-base">
                  {viewMode === 'sesi_bulan_ini'
                    ? `Hasil Skrining Kesehatan Lansia (${selectedMonth === '2026-10' ? 'Oktober 2026' : 'November 2026'})`
                    : 'Buku Register Master Lansia (Data Tersimpan)'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {viewMode === 'sesi_bulan_ini'
                    ? 'Hasil pengukuran tensi darah, gula darah sewaktu, dan status gizi sesi bulan ini'
                    : 'Daftar identitas resmi warga sasaran lansia dengan NIK 16 digit'}
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama lansia atau NIK 16 digit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-full border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="p-3">Nama Lansia & NIK</th>
                    <th className="p-3">Usia & JK</th>
                    <th className="p-3">Keluarga Pendamping</th>
                    {viewMode === 'sesi_bulan_ini' ? (
                      <>
                        <th className="p-3 text-center">Tensi Bulan Ini</th>
                        <th className="p-3 text-center">Gula Darah (GDS)</th>
                        <th className="p-3 text-center">Status Gizi (IMT)</th>
                        <th className="p-3">Keluhan / Edukasi</th>
                        <th className="p-3 text-center">Status & Aksi</th>
                      </>
                    ) : (
                      <>
                        <th className="p-3">Alamat Domisili</th>
                        <th className="p-3">No HP / Kontak</th>
                        <th className="p-3">Terdaftar Sejak</th>
                        <th className="p-3 text-center">Aksi / Kontrol</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLansia.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        Tidak ada data lansia ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredLansia.map((l) => {
                      // Rekam pemeriksaan pada bulan terpilih
                      const monthlyRecord = pemeriksaanList.find(
                        (p) => p.lansiaId === l.id && p.tanggalPeriksa.startsWith(selectedMonth)
                      );
                      const isScreenedThisMonth = Boolean(monthlyRecord);

                      return (
                        <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-slate-900 text-sm">{l.nama}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              NIK: {l.nik}
                            </div>
                          </td>

                          <td className="p-3 font-semibold text-slate-800">
                            {l.usiaTahun} Thn &bull; {l.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                          </td>

                          <td className="p-3 text-slate-600">
                            <div className="font-medium text-slate-800">{l.namaKeluarga}</div>
                            <div className="text-[10px] text-slate-400">{l.alamat}</div>
                          </td>

                          {viewMode === 'sesi_bulan_ini' ? (
                            <>
                              <td className="p-3 text-center">
                                {monthlyRecord ? (
                                  <span
                                    className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                      monthlyRecord.statusTensi === 'Hipertensi'
                                        ? 'bg-red-100 text-red-800 font-black border border-red-200'
                                        : 'bg-[#fff5f6] text-[#80000f] border border-[#fce1e4]'
                                    }`}
                                  >
                                    {monthlyRecord.tensiSistolik}/{monthlyRecord.tensiDiastolik} mmHg
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">Belum periksa</span>
                                )}
                              </td>

                              <td className="p-3 text-center font-mono">
                                {monthlyRecord ? (
                                  <span
                                    className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                      monthlyRecord.statusGulaDarah === 'Tinggi (Diabetes)'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {monthlyRecord.gulaDarah} mg/dL
                                  </span>
                                ) : (
                                  '-'
                                )}
                              </td>

                              <td className="p-3 text-center">
                                {monthlyRecord ? (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                                    IMT {monthlyRecord.imt} ({monthlyRecord.statusGizi})
                                  </span>
                                ) : (
                                  '-'
                                )}
                              </td>

                              <td className="p-3 max-w-xs">
                                <div className="text-slate-800 font-medium truncate">
                                  {monthlyRecord?.keluhan || '-'}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {monthlyRecord?.tindakanEdukasi || '-'}
                                </div>
                              </td>

                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {isScreenedThisMonth ? (
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>Sudah</span>
                                    </span>
                                  ) : null}

                                  <button
                                    onClick={() => {
                                      setActiveLansiaId(l.id);
                                      setIsCheckupOpen(true);
                                    }}
                                    className={`px-3 py-1.5 rounded-full font-bold text-[11px] transition-all ${
                                      isScreenedThisMonth
                                        ? 'bg-slate-100 hover:bg-[#80000f] hover:text-white text-slate-700'
                                        : 'bg-[#80000f] hover:bg-[#66000c] text-white shadow-xs'
                                    }`}
                                  >
                                    {isScreenedThisMonth ? 'Periksa Lagi' : '+ Periksa'}
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="p-3 text-slate-700">{l.alamat}</td>
                              <td className="p-3 text-slate-600 font-mono">{l.noHp}</td>
                              <td className="p-3 text-slate-500">{l.createdAt || '2026-01-01'}</td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => setEditingLansia(l)}
                                    title="Edit Data Lansia"
                                    className="p-1.5 rounded-xl text-slate-500 hover:text-[#80000f] hover:bg-[#fff5f6] border border-slate-200 transition-colors"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLansia(l)}
                                    title="Hapus Data Lansia"
                                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
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

      {/* Modal Daftar Lansia Baru */}
      {isAddLansiaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Registrasi Lansia Baru</h3>
              <button
                onClick={() => setIsAddLansiaOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Peringatan Duplikasi Real-time */}
            {duplicateLansia && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold">⚠️ Lansia Sudah Pernah Terdaftar!</div>
                  <div className="text-[11px] text-red-700 mt-0.5">
                    Lansia <strong>{duplicateLansia.nama}</strong> sudah tercatat dengan NIK{' '}
                    <strong>{duplicateLansia.nik}</strong>. Anda tidak perlu mendaftar ulang.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddLansiaOpen(false);
                      setActiveLansiaId(duplicateLansia.id);
                      setIsCheckupOpen(true);
                    }}
                    className="mt-2 px-3 py-1 rounded-xl bg-red-600 text-white font-bold text-[10px]"
                  >
                    Langsung Periksa Kesehatan →
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveLansia} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NIK Lansia (16 Digit KTP) <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="Contoh: 1671041005550001"
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f]"
                />
                <span className="text-[10px] text-slate-400">
                  {nik.length}/16 digit {nik.length === 16 ? '✓ Lengkap' : ''}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Lansia <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama sesuai KTP"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin:</label>
                  <select
                    value={jk}
                    onChange={(e) => setJk(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Usia (Tahun):</label>
                  <input
                    type="number"
                    required
                    value={usia}
                    onChange={(e) => setUsia(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir:</label>
                <input
                  type="date"
                  value={tglLahir}
                  onChange={(e) => setTglLahir(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keluarga Pendamping / Anak:</label>
                <input
                  type="text"
                  required
                  placeholder="Nama anak / keluarga yang bertanggung jawab"
                  value={namaKeluarga}
                  onChange={(e) => setNamaKeluarga(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alamat:</label>
                  <input
                    type="text"
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No HP / WhatsApp:</label>
                  <input
                    type="text"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLansiaOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={Boolean(duplicateLansia)}
                  className="px-5 py-2 rounded-xl bg-[#80000f] hover:bg-[#66000c] disabled:opacity-50 text-white font-bold shadow-md shadow-[#80000f]/20"
                >
                  Simpan Data Lansia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Lansia */}
      {editingLansia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Data Lansia</h3>
              <button
                onClick={() => setEditingLansia(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateLansia} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIK (16 Digit):</label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={editingLansia.nik}
                  onChange={(e) =>
                    setEditingLansia({ ...editingLansia, nik: e.target.value.replace(/\D/g, '') })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono tracking-wider"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Lansia:</label>
                <input
                  type="text"
                  required
                  value={editingLansia.nama}
                  onChange={(e) => setEditingLansia({ ...editingLansia, nama: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin:</label>
                  <select
                    value={editingLansia.jenisKelamin}
                    onChange={(e) =>
                      setEditingLansia({ ...editingLansia, jenisKelamin: e.target.value as any })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Usia (Tahun):</label>
                  <input
                    type="number"
                    required
                    value={editingLansia.usiaTahun}
                    onChange={(e) =>
                      setEditingLansia({ ...editingLansia, usiaTahun: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keluarga Pendamping:</label>
                <input
                  type="text"
                  required
                  value={editingLansia.namaKeluarga}
                  onChange={(e) =>
                    setEditingLansia({ ...editingLansia, namaKeluarga: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alamat:</label>
                  <input
                    type="text"
                    value={editingLansia.alamat}
                    onChange={(e) =>
                      setEditingLansia({ ...editingLansia, alamat: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No HP:</label>
                  <input
                    type="text"
                    value={editingLansia.noHp}
                    onChange={(e) =>
                      setEditingLansia({ ...editingLansia, noHp: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLansia(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#80000f] hover:bg-[#66000c] text-white font-bold shadow-md shadow-[#80000f]/20"
                >
                  Perbarui Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pemeriksaan Lansia */}
      <AddLansiaModal
        isOpen={isCheckupOpen}
        onClose={() => setIsCheckupOpen(false)}
        lansiaList={lansiaList}
        selectedLansiaId={activeLansiaId}
        onSuccess={loadData}
      />
    </div>
  );
}
