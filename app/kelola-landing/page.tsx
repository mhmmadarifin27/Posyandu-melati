'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  PanelsTopLeft,
  Calendar,
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  RotateCcw,
  ExternalLink,
  Eye,
  Clock,
  MapPin,
  Sparkles,
  Phone,
  AlertCircle,
  Link2,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import TiltedGridHero from '@/components/ui/tilted-grid-hero';
import {
  LandingStore,
  GalleryPhoto,
  PosyanduScheduleConfig,
  DEFAULT_GALLERY_PHOTOS,
  DEFAULT_SCHEDULE_CONFIG,
} from '@/lib/landing-store';
import { UserRole } from '@/types/posyandu';
import { toast } from '@/components/ui/custom-toast';

interface KelolaLandingPageProps {
  initialTab?: 'galeri' | 'jadwal';
}

export default function KelolaLandingPage({ initialTab = 'galeri' }: KelolaLandingPageProps) {
  const [currentRole, setCurrentRole] = useState<UserRole>('bidan');
  const [activeTab, setActiveTab] = useState<'galeri' | 'jadwal'>(initialTab);

  // State Galeri Foto (Hanya upload dari perangkat)
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Jadwal Posyandu
  const [schedule, setSchedule] = useState<PosyanduScheduleConfig>(DEFAULT_SCHEDULE_CONFIG);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Sync tab with initialTab, query params, or URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'jadwal' || window.location.pathname.includes('/kelola-jadwal')) {
        setActiveTab('jadwal');
      } else if (tab === 'galeri' || window.location.pathname.includes('/kelola-galeri')) {
        setActiveTab('galeri');
      } else if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab]);

  // Load awal dari LandingStore
  useEffect(() => {
    setPhotos(LandingStore.getGalleryImages());
    setSchedule(LandingStore.getSchedule());

    const handleUpdate = () => {
      setPhotos(LandingStore.getGalleryImages());
      setSchedule(LandingStore.getSchedule());
    };

    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('posyandu_active_role');
      if (savedRole === 'kader' || savedRole === 'bidan') {
        setCurrentRole(savedRole as UserRole);
      }
    }

    window.addEventListener('posyandu_landing_updated', handleUpdate);
    return () => {
      window.removeEventListener('posyandu_landing_updated', handleUpdate);
    };
  }, []);

  // Handle Upload File Foto (Konversi ke Base64 agar tersimpan persist)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning('Format Tidak Sesuai', 'Mohon pilih file gambar (JPG, PNG, atau WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  // Submit Tambah Foto (HANYA FOTO dari upload perangkat)
  const handleAddPhoto = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const source = photoPreview;

    if (!source) {
      toast.warning('Foto Belum Dipilih', 'Silakan pilih foto dari perangkat Anda terlebih dahulu.');
      return;
    }

    const updated = LandingStore.addGalleryPhoto(source);
    setPhotos(updated);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    toast.success('Foto Ditambahkan', 'Dokumentasi berhasil diunggah ke Galeri Landing Page.');
    triggerToast('Foto berhasil ditambahkan ke Galeri Landing Page!');
  };

  // Hapus Foto
  const handleDeletePhoto = (id: string) => {
    if (photos.length <= 1) {
      toast.info('Batas Minimal', 'Minimal harus ada 1 foto di galeri landing page.');
      return;
    }

    toast.confirm({
      title: 'Hapus Foto Galeri',
      description: 'Apakah Anda yakin ingin menghapus foto dokumentasi ini dari galeri publik?',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger',
      onConfirm: () => {
        const updated = LandingStore.deleteGalleryPhoto(id);
        setPhotos(updated);
        toast.success('Foto Dihapus', 'Foto berhasil dihapus dari galeri.');
        triggerToast('Foto berhasil dihapus dari Galeri.');
      },
    });
  };

  // Reset Foto Galeri ke Default
  const handleResetPhotos = () => {
    toast.confirm({
      title: 'Reset Galeri Standar',
      description: 'Kembalikan galeri ke 6 foto dokumentasi resmi standar Posyandu Melati?',
      confirmText: 'Reset Standar',
      cancelText: 'Batal',
      type: 'warning',
      onConfirm: () => {
        const reset = LandingStore.resetGalleryPhotos();
        setPhotos(reset);
        toast.success('Galeri Direset', 'Galeri foto berhasil dikembalikan ke standar.');
        triggerToast('Galeri foto berhasil dikembalikan ke standar.');
      },
    });
  };

  // Simpan Perubahan Jadwal
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    LandingStore.saveSchedule(schedule);
    toast.success('Jadwal Posyandu Disimpan', 'Jadwal sesi berhasil diperbarui dan tersinkronisasi.');
    triggerToast('Jadwal Posyandu berhasil diperbarui & terintegrasi ke Landing Page!');
  };

  // Reset Jadwal ke Default
  const handleResetSchedule = () => {
    toast.confirm({
      title: 'Reset Jadwal Standar',
      description: 'Kembalikan konfigurasi jadwal posyandu ke standar setiap tanggal 15?',
      confirmText: 'Reset Jadwal',
      cancelText: 'Batal',
      type: 'warning',
      onConfirm: () => {
        const reset = LandingStore.resetSchedule();
        setSchedule(reset);
        toast.success('Jadwal Direset', 'Jadwal berhasil dikembalikan ke tanggal 15.');
        triggerToast('Jadwal berhasil dikembalikan ke default.');
      },
    });
  };

  const triggerToast = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => {
      setSaveStatus(null);
    }, 3500);
  };

  const bulanOptions = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  // Preset foto cepat posyandu yang bisa langsung ditambahkan kader
  const presetPhotos = [
    { label: 'Penimbangan Balita', src: '/images/dok_timbang_balita.jpg' },
    { label: 'Pemeriksaan Bumil', src: '/images/dok_bumil_checkup.jpg' },
    { label: 'Imunisasi Balita', src: '/images/galeri_imunisasi.jpg' },
    { label: 'Senam Lansia', src: '/images/galeri_lansia.jpg' },
    { label: 'Menu PMT Sehat', src: '/images/galeri_pmt.jpg' },
    { label: 'Suasana Pelayanan', src: '/images/hero_posyandu.jpg' },
  ];

  return (
    <div className="flex min-h-screen bg-[#fafaf9] text-slate-900 font-sans selection:bg-[#fce1e4] selection:text-[#80000f]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          onOpenWeighing={() => {}}
          urgentCount={0}
        />

        <main className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {currentRole === 'bidan' ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-[#fce1e4] shadow-sm text-center max-w-xl mx-auto my-12 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#fff5f6] border border-[#fce1e4] text-[#80000f] flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-8 h-8 text-[#80000f]" />
              </div>
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase bg-[#fce1e4] text-[#80000f] border border-[#f8c8c8]">
                  Wewenang Khusus Kader Posyandu
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Pengelolaan Landing Page Dikhususkan untuk Kader
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                  Pengelolaan galeri foto kegiatan warga dan pengaturan jadwal sesi Posyandu di landing page publik merupakan ranah operasional Kader Posyandu. Tenaga Bidan berfokus pada supervisi medis, SAW MBG, dan pelaporan resmi Puskesmas.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#80000f] hover:bg-[#66000c] text-white text-xs font-bold transition-all shadow-md hover:scale-102"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Dashboard Bidan</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Header Seksi */}
          <div className="bg-white p-6 rounded-3xl border border-[#fce1e4] shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#80000f] uppercase tracking-wider mb-1">
                <PanelsTopLeft className="w-4 h-4" />
                <span>Manajemen Konten Publik</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Kelola Landing Page
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Atur foto galeri dokumentasi dan tentukan jadwal pelaksanaan posyandu yang tampil langsung di halaman utama warga.
              </p>
            </div>
          </div>

          {/* Toast Notifikasi Sukses */}
          {saveStatus && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#fff5f6] border border-[#fce1e4] text-[#80000f] text-xs font-bold shadow-xs animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-[#80000f] shrink-0" />
              <span>{saveStatus}</span>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-[#fce1e4] pb-2">
            <button
              onClick={() => {
                setActiveTab('galeri');
                if (typeof window !== 'undefined' && window.history.pushState) {
                  window.history.pushState(null, '', '/kelola-galeri');
                }
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'galeri'
                  ? 'bg-[#80000f] text-white shadow-md shadow-[#80000f]/20'
                  : 'bg-white text-slate-600 hover:bg-[#fff5f6] border border-[#fce1e4]'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Kelola Galeri Foto ({photos.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('jadwal');
                if (typeof window !== 'undefined' && window.history.pushState) {
                  window.history.pushState(null, '', '/kelola-jadwal');
                }
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'jadwal'
                  ? 'bg-[#80000f] text-white shadow-md shadow-[#80000f]/20'
                  : 'bg-white text-slate-600 hover:bg-[#fff5f6] border border-[#fce1e4]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Pilih Jadwal Posyandu (Tgl {schedule.sessionDate})</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: KELOLA GALERI FOTO (NO DESKRIPSI & NO JUDUL)                      */}
          {/* ========================================================================= */}
          {activeTab === 'galeri' && (
            <div className="space-y-8">
              {/* Box Tambah Foto (HANYA UPLOAD DARI PERANGKAT HP / KOMPUTER - TENGAH / CENTERED) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                <div className="text-center max-w-xl mx-auto space-y-1">
                  <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-[#fff5f6] border border-[#fce1e4] text-[#80000f] text-xs font-bold mb-1">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Dokumentasi Baru</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                    Tambah Foto Galeri Baru
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Unggah foto kegiatan Posyandu langsung dari perangkat (komputer atau HP Anda). Foto akan langsung tampil di animasi silinder 3D galeri publik.
                  </p>
                </div>

                <div className="max-w-2xl mx-auto space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#fce1e4] hover:border-[#80000f] bg-[#fff5f6] hover:bg-[#fff5f6]/80 rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 shadow-2xs hover:shadow-sm"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <div className="w-14 h-14 rounded-2xl bg-[#fce1e4] text-[#80000f] flex items-center justify-center shadow-xs transition-transform hover:scale-105">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">
                        Klik untuk memilih foto dari perangkat Anda
                      </p>
                      <p className="text-xs text-slate-500">
                        Mendukung format gambar JPG, PNG, atau WebP (Foto otomatis disesuaikan ke galeri)
                      </p>
                    </div>
                  </div>

                  {/* Pratinjau Foto yang telah dipilih dari perangkat */}
                  {photoPreview && (
                    <div className="space-y-3 p-5 bg-slate-50 border border-slate-200 rounded-3xl text-center">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                        <span>Pratinjau Foto yang Dipilih:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoPreview(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-[#80000f] hover:underline cursor-pointer"
                        >
                          Hapus / Ganti Foto
                        </button>
                      </div>

                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-w-md mx-auto bg-slate-200">
                        <img
                          src={photoPreview}
                          alt="Pratinjau Foto"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleAddPhoto()}
                      disabled={!photoPreview}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#80000f] hover:bg-[#66000c] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#80000f]/20 transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambahkan Foto ke Galeri Landing Page</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Daftar Foto Aktif di Galeri Landing Page */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-900">
                      Foto Aktif di Galeri ({photos.length} Foto)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Seluruh foto di bawah ini aktif ditampilkan dalam animasi silinder melengkung pada landing page.
                    </p>
                  </div>

                  <button
                    onClick={handleResetPhotos}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors self-start sm:self-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset ke Foto Standar</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {photos.map((item, idx) => (
                    <div
                      key={item.id}
                      className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-2xs hover:shadow-md transition-all flex flex-col"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden relative">
                        <img
                          src={item.src}
                          alt="Foto Galeri"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = '/images/hero_posyandu.jpg';
                          }}
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/70 text-white text-[10px] font-bold">
                          #{idx + 1}
                        </div>
                      </div>

                      <div className="p-2.5 bg-white flex items-center justify-between gap-1 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 font-medium truncate">
                          Aktif di Galeri
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(item.id)}
                          title="Hapus foto dari galeri"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#80000f] hover:bg-[#fff5f6] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Preview Galeri 3D Silinder di Dashboard */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-[#80000f]" />
                      <span>Live Preview Galeri di Landing Page</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tampilan animasi yang dilihat warga di landing page publik (semua foto berputar secara mulus tanpa ada yang hilang).
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#fce1e4] bg-gradient-to-b from-[#fff5f6] to-white overflow-hidden p-2">
                  <TiltedGridHero
                    images={photos}
                    speed={4}
                    tileHeight={28}
                    aspectRatio={16 / 9}
                    gap={6}
                    curve={75}
                    fade={14}
                    className="h-72 w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PILIH JADWAL POSYANDU TERINTEGRASI KE LANDING PAGE                */}
          {/* ========================================================================= */}
          {activeTab === 'jadwal' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Input Jadwal */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[#fce1e4] shadow-xs space-y-6">
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#80000f]" />
                    <span>Konfigurasi Jadwal Pelaksanaan Posyandu</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Ubah tanggal, hari, waktu, dan lokasi posyandu. Perubahan akan langsung tampil pada kalender interaktif dan frame kegiatan di landing page warga.
                  </p>
                </div>

                <form onSubmit={handleSaveSchedule} className="space-y-5">
                  {/* Pilihan Tanggal Cepat (1 - 31) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Pilih Tanggal Sesi Posyandu (1 - 31)
                    </label>
                    <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 text-center">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                        <button
                          key={date}
                          type="button"
                          onClick={() => setSchedule({ ...schedule, sessionDate: date })}
                          className={`h-9 rounded-xl font-bold text-xs transition-all ${
                            schedule.sessionDate === date
                              ? 'bg-[#80000f] text-white shadow-md shadow-[#80000f]/20 ring-2 ring-[#80000f]'
                              : 'bg-[#fff5f6] text-slate-700 hover:bg-[#fce1e4] border border-[#fce1e4]'
                          }`}
                        >
                          {date}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hari, Bulan, Tahun */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Hari
                      </label>
                      <select
                        value={schedule.sessionDayName}
                        onChange={(e) => setSchedule({ ...schedule, sessionDayName: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#fce1e4] text-xs font-semibold focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
                      >
                        {hariOptions.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Bulan
                      </label>
                      <select
                        value={schedule.sessionMonth}
                        onChange={(e) => setSchedule({ ...schedule, sessionMonth: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#fce1e4] text-xs font-semibold focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
                      >
                        {bulanOptions.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Tahun
                      </label>
                      <input
                        type="number"
                        value={schedule.sessionYear}
                        onChange={(e) =>
                          setSchedule({ ...schedule, sessionYear: parseInt(e.target.value) || 2026 })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#fce1e4] text-xs font-semibold focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Waktu Pelaksanaan */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Waktu Pelaksanaan
                    </label>
                    <input
                      type="text"
                      value={schedule.sessionTime}
                      onChange={(e) => setSchedule({ ...schedule, sessionTime: e.target.value })}
                      placeholder="Contoh: 08.00 - 12.00 WIB"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#fce1e4] text-xs focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
                    />
                  </div>

                  {/* Lokasi Balai Pertemuan & Alamat */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Nama Gedung / Balai
                      </label>
                      <input
                        type="text"
                        value={schedule.sessionLocation}
                        onChange={(e) =>
                          setSchedule({ ...schedule, sessionLocation: e.target.value })
                        }
                        placeholder="Contoh: Balai Pertemuan Warga RW 03"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#fce1e4] text-xs focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Alamat Lengkap
                      </label>
                      <input
                        type="text"
                        value={schedule.address}
                        onChange={(e) => setSchedule({ ...schedule, address: e.target.value })}
                        placeholder="Contoh: Jl. Melati Raya No. 12, Kelurahan Sukamaju"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#fce1e4] text-xs focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Sasaran Layanan & WhatsApp Bidan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Sasaran Warga
                      </label>
                      <input
                        type="text"
                        value={schedule.targetSummary}
                        onChange={(e) =>
                          setSchedule({ ...schedule, targetSummary: e.target.value })
                        }
                        placeholder="Contoh: Balita (0-59 bln), Ibu Hamil, Busui, dan Lansia"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#fce1e4] text-xs focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        WhatsApp Pengingat Bidan
                      </label>
                      <input
                        type="text"
                        value={schedule.contactWhatsapp}
                        onChange={(e) =>
                          setSchedule({ ...schedule, contactWhatsapp: e.target.value })
                        }
                        placeholder="6281278901234"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#fce1e4] text-xs focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#80000f] hover:bg-[#66000c] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#80000f]/20 transition-all hover:scale-102 active:scale-98"
                    >
                      Simpan &amp; Terapkan ke Landing Page
                    </button>

                    <button
                      type="button"
                      onClick={handleResetSchedule}
                      className="w-full sm:w-auto px-5 py-3 rounded-full border border-[#fce1e4] hover:bg-[#fff5f6] text-slate-700 font-bold text-xs transition-colors"
                    >
                      Reset Default
                    </button>
                  </div>
                </form>
              </div>

              {/* Preview Interaktif Jadwal */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#fce1e4] shadow-xs space-y-4">
                  <h4 className="font-serif text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#80000f]" />
                    <span>Pratinjau Tampilan Jadwal di Landing Page</span>
                  </h4>

                  {/* Mock Activity Frame */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#fff5f6] to-white border border-[#fce1e4] shadow-2xs space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#80000f]">
                      Pelaksanaan Serentak &bull; Binaan Puskesmas Pembina
                    </p>
                    <h3 className="font-serif text-xl font-bold text-slate-900">
                      {schedule.sessionDayName}, {schedule.sessionDate} {schedule.sessionMonth}{' '}
                      {schedule.sessionYear}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold">
                      <span className="flex items-center gap-1 text-[#80000f]">
                        <Clock className="w-3.5 h-3.5" />
                        {schedule.sessionTime}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {schedule.sessionLocation}
                      </span>
                    </div>

                    <div className="pt-2 text-[11px] text-slate-500 border-t border-[#fce1e4]">
                      Sasaran: <strong>{schedule.targetSummary}</strong>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#fff5f6] border border-[#fce1e4] text-xs text-slate-600 space-y-1.5">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#80000f]" />
                      <span>Integrasi Otomatis Landing Page:</span>
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      1. Angka tanggal <strong>{schedule.sessionDate}</strong> otomatis diberi tanda lingkaran merah dan badge <em>SERENTAK</em> pada kalender publik.
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      2. Teks informasi jadwal dan tombol pengingat WhatsApp di landing page otomatis terhubung dengan nomor <strong>{schedule.contactWhatsapp}</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
