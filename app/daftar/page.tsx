'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Lock,
  User,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Clock,
} from 'lucide-react';
import { PosyanduStore, supabase, isSupabaseConfigured, ensureUuid } from '@/lib/supabase';
import { PosyanduRegistrationRequest, PosyanduTenant, UserProfile } from '@/types/posyandu';
import { toast } from '@/components/ui/custom-toast';
import { compressImageFile } from '@/lib/utils';

export default function DaftarPosyanduPage() {
  // Wizard Step: 1 (Profil & Wilayah), 2 (Akun & Kredensial), 3 (Sukses)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State - Langkah 1: Profil Posyandu & Wilayah
  const [namaPosyandu, setNamaPosyandu] = useState('');
  const [puskesmas, setPuskesmas] = useState('');
  const [rw, setRw] = useState('');
  const [kelurahan, setKelurahan] = useState('Sukamaju');
  const [kotaKab, setKotaKab] = useState('Kota Palembang');

  // Opsi Tambahan (Opsional / Collapsible)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [alamatKustom, setAlamatKustom] = useState('');
  const [logoBase64, setLogoBase64] = useState<string>('');
  const [logoFileName, setLogoFileName] = useState('');

  // Form State - Langkah 2: Akun Admin & Kredensial
  const [namaKetua, setNamaKetua] = useState('');
  const [noWhatsapp, setNoWhatsapp] = useState('');
  const [emailAdmin, setEmailAdmin] = useState('');
  const [passwordAdmin, setPasswordAdmin] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Logo Upload to Base64 Data URL (Opsional)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning('Format Salah', 'Harap pilih file gambar (PNG, JPG, atau WEBP).');
      return;
    }

    try {
      // Kompres logo ke 300x300 px agar ringan (< 30 KB) dan aman di LocalStorage
      const compressedDataUrl = await compressImageFile(file, 300, 300, 0.85);
      setLogoBase64(compressedDataUrl);
      setLogoFileName(file.name);
      toast.success('Logo Dimuat', `Logo ${file.name} siap digunakan untuk KOP Surat.`);
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setLogoBase64(result);
        setLogoFileName(file.name);
        toast.success('Logo Dimuat', `Logo ${file.name} siap digunakan untuk KOP Surat.`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validasi & Navigasi Langkah 1 -> Langkah 2
  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPosyandu.trim()) {
      toast.warning('Lengkapi Data', 'Nama Posyandu wajib diisi.');
      return;
    }
    if (!puskesmas.trim()) {
      toast.warning('Lengkapi Data', 'Nama Puskesmas Pembina wajib diisi.');
      return;
    }
    if (!rw.trim()) {
      toast.warning('Lengkapi Data', 'Nomor Rukun Warga (RW) wajib diisi.');
      return;
    }
    if (!kelurahan.trim()) {
      toast.warning('Lengkapi Data', 'Kelurahan / Desa wajib diisi.');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Final Langkah 2 (Pendaftaran Akun)
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaKetua.trim()) {
      toast.warning('Data Belum Lengkap', 'Nama Ketua / Penanggung Jawab wajib diisi.');
      return;
    }
    if (!noWhatsapp.trim()) {
      toast.warning('Data Belum Lengkap', 'Nomor WhatsApp aktif wajib diisi.');
      return;
    }
    if (!emailAdmin.trim()) {
      toast.warning('Data Belum Lengkap', 'Email akun admin posyandu wajib diisi.');
      return;
    }
    if (passwordAdmin.length < 6) {
      toast.warning('Kata Sandi Lemah', 'Kata sandi minimal 6 karakter.');
      return;
    }
    if (passwordAdmin !== confirmPassword) {
      toast.warning('Kata Sandi Tidak Cocok', 'Konfirmasi kata sandi tidak sama.');
      return;
    }

    setIsSubmitting(true);

    const cleanEmail = emailAdmin.trim().toLowerCase();
    const cleanPassword = passwordAdmin.trim();
    const cleanNamaPosyandu = namaPosyandu.trim();
    const cleanNamaKetua = namaKetua.trim();
    const cleanNoWhatsapp = noWhatsapp.trim();
    const cleanRw = rw.trim().replace(/^rw\s*/i, '');
    const cleanAlamat = alamatKustom.trim() || `Balai Pertemuan RW ${cleanRw}, Kel. ${kelurahan.trim()}`;

    let supabaseUserId: string | null = null;

    // 1. Daftarkan Akun ke Supabase Auth
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              nama: `Admin ${cleanNamaPosyandu} (${cleanNamaKetua})`,
              role: 'admin_posyandu',
              posyandu: cleanNamaPosyandu,
              no_hp: cleanNoWhatsapp,
            },
          },
        });

        if (authError) {
          console.warn('Supabase auth.signUp warning:', authError.message);
          if (authError.message.toLowerCase().includes('already registered')) {
            toast.warning(
              'Email Sudah Terdaftar',
              'Email ini sudah terdaftar di Supabase Auth. Akun disinkronkan untuk login.'
            );
          }
        } else {
          supabaseUserId = authData?.user?.id || null;
        }
      } catch (authErr: any) {
        console.warn('Gagal menghubungi Supabase Auth:', authErr?.message || authErr);
      }
    }

    // 2. Buat Tenant Posyandu Baru dengan ID UUID Valid
    const newTenantUuid = ensureUuid();
    const newTenant: PosyanduTenant = {
      id: newTenantUuid,
      kode: `POS-${String(PosyanduStore.getPosyanduList().length + 1).padStart(2, '0')}`,
      nama: cleanNamaPosyandu,
      logo: logoBase64 || '/images/logo-posyandu.png',
      pemerintahDaerah: 'Pemerintah Daerah',
      dinasKesehatan: 'Dinas Kesehatan',
      puskesmas: puskesmas.trim(),
      provinsi: 'Sumatera Selatan',
      kotaKab: kotaKab.trim() || 'Kota Palembang',
      kecamatan: 'Kecamatan Sako',
      kelurahan: kelurahan.trim(),
      rw: cleanRw,
      rt: '01',
      alamat: cleanAlamat,
      kodePos: '30164',
      namaKetua: cleanNamaKetua,
      namaBidan: 'Bdn. Siti Rahma, S.Tr.Keb',
      noHp: cleanNoWhatsapp,
      email: cleanEmail,
      createdAt: new Date().toISOString().split('T')[0],
    };

    // 3. Buat Akun Admin Posyandu Terpadu
    const userUuid = supabaseUserId || ensureUuid();
    const newAccount: UserProfile & { password?: string } = {
      id: userUuid,
      nama: `Admin ${cleanNamaPosyandu} (${cleanNamaKetua})`,
      email: cleanEmail,
      password: cleanPassword,
      role: 'admin_posyandu',
      posyanduId: newTenantUuid,
      posyanduNama: newTenant.nama,
      posyandu: newTenant.nama,
      noHp: cleanNoWhatsapp,
      jabatan: `Ketua & Admin ${newTenant.nama}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    // 4. Catat Log Pendaftaran
    const newRegistration: PosyanduRegistrationRequest = {
      id: `reg-${Date.now()}`,
      namaPosyandu: cleanNamaPosyandu,
      strataPosyandu: 'Mandiri',
      logoUrl: logoBase64 || undefined,
      puskesmas: puskesmas.trim(),
      provinsi: 'Sumatera Selatan',
      kotaKab: kotaKab.trim() || 'Kota Palembang',
      kecamatan: 'Kecamatan Sako',
      kelurahan: kelurahan.trim(),
      rw: cleanRw,
      rt: '01',
      alamat: cleanAlamat,
      kodePos: '30164',
      namaKetua: cleanNamaKetua,
      noWhatsapp: cleanNoWhatsapp,
      emailAdmin: cleanEmail,
      passwordAdmin: cleanPassword,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      notes: 'Pendaftaran mandiri baru via formulir ringkas PosyanduGo. Menunggu verifikasi & ACC Super Admin.',
    };

    try {
      PosyanduStore.addRegistration(newRegistration);
    } catch (e) {
      console.warn('addRegistration error:', e);
    }

    setIsSubmitting(false);
    setCurrentStep(3);
    toast.success(
      'Pendaftaran Berhasil Diajukan!',
      'Permohonan Anda sedang dalam proses verifikasi & persetujuan Super Admin Puskesmas.'
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 font-sans selection:bg-rose-200 selection:text-rose-900 pb-20">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer group"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
              <span>Kembali</span>
            </Link>

            <Link href="/" className="flex items-center gap-3 group cursor-pointer" title="Beranda PosyanduGo">
              <img
                src="/images/logo-posyandugo-maroon.png"
                alt="Logo PosyanduGo"
                className="h-6 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Beranda
            </Link>
            <span className="hidden sm:inline text-slate-300">&bull;</span>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-2xs cursor-pointer"
            >
              <span>Login</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* Tombol Back Navigasi Breadcrumb */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#80000f] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda Utama</span>
          </Link>
        </div>

        {/* Header Title (Tampil saat Step 1 & 2) */}
        {currentStep !== 3 && (
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#80000f] text-[11px] font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3 h-3 text-[#80000f]" />
              <span>Pendaftaran Cepat PosyanduGo</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Daftarkan Unit Posyandu Anda
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5 max-w-lg mx-auto">
              Hanya 2 langkah singkat untuk menghubungkan posyandu Anda ke platform e-KMS dan SPK Menu MBG standar WHO.
            </p>

            {/* Stepper Progress Bar (2 Langkah Cepat) */}
            <div className="grid grid-cols-2 gap-3 mt-6 max-w-md mx-auto">
              {/* Step 1 Bar */}
              <div
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  currentStep === 1
                    ? 'bg-white border-[#80000f] shadow-sm ring-2 ring-[#80000f]/15'
                    : 'bg-rose-50/70 border-rose-300 text-rose-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep === 1 ? 'bg-[#80000f] text-white' : 'bg-[#80000f] text-white'
                    }`}
                  >
                    {currentStep > 1 ? <Check className="w-3 h-3" /> : '1'}
                  </span>
                  <span className="text-xs font-bold">1. Unit &amp; Wilayah</span>
                </div>
              </div>

              {/* Step 2 Bar */}
              <div
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  currentStep === 2
                    ? 'bg-white border-[#80000f] shadow-sm ring-2 ring-[#80000f]/15'
                    : 'bg-white/60 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep === 2 ? 'bg-[#80000f] text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    2
                  </span>
                  <span className="text-xs font-bold">2. Akun &amp; Login</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* LANGKAH 1: PROFIL POSYANDU & WILAYAH                            */}
        {/* ============================================================== */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-5 mb-5 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#80000f] flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Identitas Posyandu &amp; Wilayah Kerja
                </h2>
                <p className="text-xs text-slate-500">
                  Data ini digunakan untuk identitas unit dan format KOP surat laporan resmi.
                </p>
              </div>
            </div>

            <form onSubmit={handleNextStep1} className="space-y-4">
              {/* Nama Posyandu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Unit Posyandu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Posyandu Melati / Posyandu Mawar Indah"
                    value={namaPosyandu}
                    onChange={(e) => setNamaPosyandu(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] text-sm font-medium transition-all"
                  />
                </div>
              </div>

              {/* Puskesmas Pembina */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  UPTD Puskesmas Pembina <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: UPTD Puskesmas Pembina / Puskesmas Sako"
                    value={puskesmas}
                    onChange={(e) => setPuskesmas(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] text-sm font-medium transition-all"
                  />
                </div>
              </div>

              {/* Grid Wilayah: RW, Kelurahan, Kota */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Rukun Warga (RW) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Rukun Warga (RW) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 03"
                    value={rw}
                    onChange={(e) => setRw(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] text-sm font-medium transition-all"
                  />
                </div>

                {/* Kelurahan / Desa */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kelurahan / Desa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sukamaju"
                    value={kelurahan}
                    onChange={(e) => setKelurahan(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] text-sm font-medium transition-all"
                  />
                </div>

                {/* Kota / Kabupaten */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kota / Kabupaten <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kota Palembang"
                    value={kotaKab}
                    onChange={(e) => setKotaKab(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] text-sm font-medium transition-all"
                  />
                </div>
              </div>

              {/* Opsi Tambahan (Collapsible) - Logo Kustom & Alamat Spesifik */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#80000f] transition-colors cursor-pointer"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span>Opsi Tambahan: Logo Kustom &amp; Alamat Posko (Opsional)</span>
                </button>

                {showAdvanced && (
                  <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 transition-all">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Alamat Spesifik Posko / Balai Pertemuan
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Jl. Melati No. 12, Balai Warga RW 03"
                        value={alamatKustom}
                        onChange={(e) => setAlamatKustom(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f]"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Bila dikosongkan, sistem otomatis membuatkan alamat berdasarkan RW &amp; Kelurahan.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Logo Kustom Posyandu (PNG / JPG, Maks 2 MB)
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1.5 transition-colors">
                          <Upload className="w-3.5 h-3.5 text-slate-500" />
                          <span>{logoFileName ? 'Ganti Logo' : 'Pilih Berkas Logo'}</span>
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                        {logoFileName ? (
                          <span className="text-xs text-emerald-700 font-semibold truncate max-w-xs">
                            ✓ {logoFileName}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            (Opsional, default menggunakan lambang resmi Posyandu)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#80000f] hover:bg-[#9c0013] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-rose-950/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-101 active:scale-99"
                >
                  <span>Lanjut ke Akun Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* LANGKAH 2: AKUN ADMIN & KREDENSIAL LOGIN                        */}
        {/* ============================================================== */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-5 mb-5 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#80000f] flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Akun Admin Posyandu &amp; Kredensial Login
                </h2>
                <p className="text-xs text-slate-500">
                  Akun ini digunakan untuk login dan mengelola seluruh layanan posyandu Anda.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitRegistration} className="space-y-4">
              {/* Nama Ketua / Penanggung Jawab */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Ketua / Penanggung Jawab Posyandu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ny. Anisa Rahmawati"
                    value={namaKetua}
                    onChange={(e) => setNamaKetua(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] text-sm font-medium transition-all"
                  />
                </div>
              </div>

              {/* Nomor WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081367895678"
                    value={noWhatsapp}
                    onChange={(e) => setNoWhatsapp(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] text-sm font-medium transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Digunakan untuk nomor kontak resmi pada KOP surat laporan posyandu.
                </p>
              </div>

              {/* Email Admin */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Akun Admin <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="Contoh: admin.melati@posyandu.id"
                    value={emailAdmin}
                    onChange={(e) => setEmailAdmin(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] text-sm font-medium transition-all"
                  />
                </div>
              </div>

              {/* Kata Sandi & Konfirmasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Kata Sandi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kata Sandi (Min. 6 Karakter) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Masukkan kata sandi"
                      value={passwordAdmin}
                      onChange={(e) => setPasswordAdmin(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] text-sm font-medium transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Konfirmasi Kata Sandi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ulangi Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Ulangi kata sandi"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] text-sm font-medium transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Rangkuman Singkat */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1 mt-3">
                <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                  <FileCheck2 className="w-4 h-4 text-[#80000f]" />
                  <span>Rangkuman Pendaftaran</span>
                </div>
                <p>&bull; Unit Posyandu: <strong className="text-slate-900">{namaPosyandu}</strong> (RW {rw}, Kel. {kelurahan})</p>
                <p>&bull; Puskesmas Pembina: <strong className="text-slate-900">{puskesmas}</strong></p>
                <p>&bull; Kontak WhatsApp: <strong className="text-slate-900">{noWhatsapp || '-'}</strong></p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Wilayah</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-3 rounded-xl bg-[#80000f] hover:bg-[#9c0013] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-rose-950/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-101 active:scale-99 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memproses Pendaftaran...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Daftarkan Posyandu Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* LANGKAH 3: LAYAR SUKSES — MENUNGGU VERIFIKASI & ACC SUPER ADMIN */}
        {/* ============================================================== */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Clock className="w-9 h-9 sm:w-11 sm:h-11" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 mb-3">
              <span>⏳ Menunggu Verifikasi &amp; Persetujuan (ACC)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pendaftaran Berhasil Diajukan!
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-2.5 max-w-lg mx-auto">
              Terima kasih! Permohonan pendaftaran unit <strong className="text-slate-900">{namaPosyandu}</strong> telah tercatat ke sistem <strong>PosyanduGo</strong>. Akun Anda saat ini dalam antrean verifikasi oleh <strong>Super Admin Puskesmas Pembina</strong>.
            </p>

            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-left text-xs sm:text-sm text-slate-800 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>Rincian Pengajuan Akun:</span>
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                <li>Unit Posyandu: <strong className="text-slate-900">{namaPosyandu}</strong></li>
                <li>Email Admin: <strong className="text-slate-900">{emailAdmin}</strong></li>
                <li>Nama Ketua: <span className="text-slate-900 font-semibold">{namaKetua}</span></li>
                <li>No. WhatsApp: <span className="font-mono text-slate-900">{noWhatsapp}</span></li>
                <li>Status: <span className="inline-flex items-center gap-1 font-bold text-amber-800 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-xs">Menunggu Persetujuan (Pending)</span></li>
              </ul>
              <div className="pt-2 text-[11px] text-slate-500 leading-relaxed border-t border-amber-200/60">
                ℹ️ Anda akan menerima konfirmasi via WhatsApp atau email setelah Super Admin memverifikasi dan menyetujui (ACC) akun Anda. Setelah disetujui, Anda dapat langsung login.
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#80000f] hover:bg-[#66000c] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#80000f]/20 transition-all hover:scale-101"
              >
                Menuju Halaman Login &rarr;
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
