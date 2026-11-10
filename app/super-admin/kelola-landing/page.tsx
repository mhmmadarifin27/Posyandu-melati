'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  PanelsTopLeft,
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  RotateCcw,
  ExternalLink,
  Eye,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import TiltedGridHero from '@/components/ui/tilted-grid-hero';
import {
  LandingStore,
  GalleryPhoto,
  DEFAULT_GALLERY_PHOTOS,
} from '@/lib/landing-store';
import { UserRole } from '@/types/posyandu';
import { toast } from '@/components/ui/custom-toast';

export default function SuperAdminKelolaLandingPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>('bidan');

  // State Galeri Foto (Hanya upload dari perangkat)
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Load awal dari LandingStore
  useEffect(() => {
    setPhotos(LandingStore.getGalleryImages());

    const handleUpdate = () => {
      setPhotos(LandingStore.getGalleryImages());
    };

    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('posyandu_active_role');
      if (savedRole) {
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

  const triggerToast = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => {
      setSaveStatus(null);
    }, 3500);
  };

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
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#fce1e4] selection:text-[#80000f]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          onOpenWeighing={() => {}}
          urgentCount={0}
        />

        <main className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {/* Breadcrumb & Lokasi Navigasi */}
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/super-admin/dashboard' },
              { label: 'Kelola Landing Page' },
            ]}
            backHref="/super-admin/dashboard"
            backLabel="Kembali ke Dashboard"
          />
          {currentRole !== 'super_admin' ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-[#f8c8c8] shadow-sm text-center max-w-xl mx-auto my-12 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#fff0f2] border border-[#fce1e4] text-[#80000f] flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-8 h-8 text-[#80000f]" />
              </div>
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase bg-[#fff0f2] text-[#80000f] border border-[#fce1e4]">
                  Wewenang Khusus Super Admin
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Pengelolaan Landing Page Dikhususkan untuk Super Admin
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                  Sesuai tata kelola platform SaaS, pengelolaan publikasi landing page, galeri dokumentasi, dan media promosi dikelola terpusat oleh Super Admin Puskesmas. Admin Posyandu difokuskan pada pelayanan operasional warga.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#80000f] hover:bg-[#66000c] text-white text-xs font-bold transition-all shadow-md hover:scale-102"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Dashboard</span>
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
                Kelola Galeri Foto Landing Page
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Unggah dan kelola foto dokumentasi kegiatan Posyandu yang tampil di animasi silinder 3D landing page warga.
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

          {/* Galeri Header Bar */}
          <div className="flex items-center justify-between border-b border-[#fce1e4] pb-2">
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#80000f] text-white shadow-md shadow-[#80000f]/20">
              <ImageIcon className="w-4 h-4" />
              <span>Kelola Galeri Foto ({photos.length} Foto Aktif)</span>
            </div>
          </div>

          {/* KELOLA GALERI FOTO */}
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
          </>
        )}
      </main>
    </div>
  </div>
);
}

