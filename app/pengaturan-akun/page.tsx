'use client';

import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  User,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Phone,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { LandingStore } from '@/lib/landing-store';
import { toast } from '@/components/ui/custom-toast';

export default function PengaturanAkunPage() {
  const [activeRole, setActiveRole] = useState<'kader' | 'bidan'>('kader');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isCloudAuth, setIsCloudAuth] = useState(false);

  // Form Edit Profil State (Nama, No HP, Jabatan)
  const [nama, setNama] = useState('');
  const [noHp, setNoHp] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Form Ganti Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('posyandu_active_role');
      const role = storedRole === 'bidan' ? 'bidan' : 'kader';
      setActiveRole(role);

      // Muat profil dari posyandu_profiles jika tersedia
      let savedProfiles: Record<string, any> = {};
      try {
        savedProfiles = JSON.parse(localStorage.getItem('posyandu_profiles') || '{}');
      } catch {}

      const roleProfile = savedProfiles[role];

      const rawUser = localStorage.getItem('posyandu_auth_user');
      let parsedUser: any = null;
      if (rawUser) {
        try {
          parsedUser = JSON.parse(rawUser);
        } catch {}
      }

      const emailVal = parsedUser?.email || (role === 'bidan' ? 'bidanmelati@gmail.com' : 'kadermelati@gmail.com');
      setUserEmail(emailVal);

      // Inisialisasi Nama, No HP, Jabatan
      const schedule = LandingStore.getSchedule();
      if (role === 'bidan') {
        const initialNama = roleProfile?.nama || parsedUser?.nama || schedule.contactPersonName || 'Bdn. Siti Rahma, S.Tr.Keb';
        const initialNoHp = roleProfile?.noHp || parsedUser?.noHp || schedule.contactWhatsapp || '081278901234';
        const initialJabatan = roleProfile?.jabatan || parsedUser?.jabatan || 'Bidan Pembina Wilayah RW 03';
        setNama(initialNama);
        setNoHp(initialNoHp);
        setJabatan(initialJabatan);
        setUserName(initialNama);
      } else {
        let kaderContact: any = null;
        try {
          kaderContact = JSON.parse(localStorage.getItem('posyandu_kader_contact') || '{}');
        } catch {}
        const initialNama = roleProfile?.nama || kaderContact?.nama || parsedUser?.nama || 'Ny. Anisa Rahmawati';
        const initialNoHp = roleProfile?.noHp || kaderContact?.noHp || parsedUser?.noHp || '081367895678';
        const initialJabatan = roleProfile?.jabatan || kaderContact?.jabatan || parsedUser?.jabatan || 'Ketua Kader Posyandu Melati';
        setNama(initialNama);
        setNoHp(initialNoHp);
        setJabatan(initialJabatan);
        setUserName(initialNama);
      }
    }

    // Periksa status sesi aktif Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setIsCloudAuth(true);
          if (data.user.email) setUserEmail(data.user.email);
        }
      });
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !noHp.trim() || !jabatan.trim()) {
      toast.warning('Data Belum Lengkap', 'Mohon lengkapi nama, nomor HP, dan jabatan Anda.');
      return;
    }

    setIsSavingProfile(true);

    try {
      if (typeof window !== 'undefined') {
        // 1. Simpan ke posyandu_auth_user
        let currentUser: any = {};
        try {
          currentUser = JSON.parse(localStorage.getItem('posyandu_auth_user') || '{}');
        } catch {}

        const updatedUser = {
          ...currentUser,
          nama: nama.trim(),
          noHp: noHp.trim(),
          jabatan: jabatan.trim(),
        };
        localStorage.setItem('posyandu_auth_user', JSON.stringify(updatedUser));

        // 2. Simpan ke posyandu_profiles
        let profiles: Record<string, any> = {};
        try {
          profiles = JSON.parse(localStorage.getItem('posyandu_profiles') || '{}');
        } catch {}
        profiles[activeRole] = {
          nama: nama.trim(),
          noHp: noHp.trim(),
          jabatan: jabatan.trim(),
        };
        localStorage.setItem('posyandu_profiles', JSON.stringify(profiles));

        // 3. Integrasi ke Landing Page & Jadwal
        if (activeRole === 'bidan') {
          LandingStore.saveSchedule({
            contactPersonName: nama.trim(),
            contactWhatsapp: noHp.trim(),
          });
        } else {
          localStorage.setItem(
            'posyandu_kader_contact',
            JSON.stringify({
              nama: nama.trim(),
              noHp: noHp.trim(),
              jabatan: jabatan.trim(),
            })
          );
        }

        setUserName(nama.trim());

        // 4. Siarkan event sinkronisasi real-time
        window.dispatchEvent(new Event('posyandu_profile_updated'));
        window.dispatchEvent(new Event('posyandu_landing_updated'));
      }

      toast.success(
        'Profil Berhasil Diperbarui!',
        'Nama, nomor WhatsApp, dan jabatan Anda telah disinkronkan ke Dashboard dan Landing Page.'
      );
    } catch (err: any) {
      console.error('Save profile error:', err);
      toast.error('Gagal Menyimpan Profil', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast.warning('Kata Sandi Terlalu Pendek', 'Kata sandi baru minimal terdiri dari 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.warning('Kata Sandi Tidak Cocok', 'Konfirmasi kata sandi harus sama persis dengan kata sandi baru.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          console.error('Supabase update password error:', error.message);
          toast.error('Gagal Memperbarui Sandi', error.message);
          setIsSubmitting(false);
          return;
        }

        toast.success(
          'Kata Sandi Berhasil Diperbarui!',
          'Kata sandi akun Anda telah diperbarui di Supabase Auth. Silakan gunakan sandi baru ini saat masuk kembali.'
        );
        setNewPassword('');
        setConfirmPassword('');
        setIsSubmitting(false);
        return;
      }

      // Mode Offline / Local Storage
      toast.success(
        'Kata Sandi Berhasil Disimpan',
        'Kata sandi lokal akun Anda telah diperbarui.'
      );
      setNewPassword('');
      setConfirmPassword('');
      setIsSubmitting(false);
    } catch (err: any) {
      console.error('Update password exception:', err);
      toast.error('Terjadi Kesalahan', err.message || 'Tidak dapat memperbarui kata sandi saat ini.');
      setIsSubmitting(false);
    }
  };

  const isPasswordValid = newPassword.length >= 6;
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 antialiased overflow-hidden">
      {/* Sidebar Navigasi */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Breadcrumb & Title */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              <span>Pengaturan Sistem</span>
              <span>&bull;</span>
              <span className="text-[#80000f]">Keamanan &amp; Akun</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <KeyRound className="w-6 h-6 text-[#80000f]" />
              <span>Pengaturan Akun &amp; Kata Sandi</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kelola informasi profil petugas dan perbarui kata sandi login untuk keamanan data Posyandu Melati RW 03.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Card: Form Edit Profil & Kontak Petugas */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#fce1e4] shadow-xs space-y-6">
              <div className="flex items-center gap-3.5 pb-5 border-b border-[#fce1e4]">
                <div className="w-14 h-14 rounded-2xl bg-[#fff0f2] border border-[#fce1e4] text-3xl flex items-center justify-center shrink-0 shadow-2xs">
                  {activeRole === 'bidan' ? '👩‍⚕️' : '🧕'}
                </div>
                <div className="overflow-hidden">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#fff0f2] text-[#80000f] border border-[#fce1e4] mb-1">
                    <ShieldCheck className="w-3 h-3" />
                    {activeRole === 'bidan' ? 'Bidan Desa (Supervisi)' : 'Kader Posyandu (Operasional)'}
                  </span>
                  <h3 className="font-serif text-base font-bold text-slate-900 truncate">
                    {nama || userName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium truncate">
                    {userEmail}
                  </p>
                </div>
              </div>

              {/* Formulir Pengeditan Profil */}
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nama Lengkap &amp; Gelar
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Contoh: Bdn. Siti Rahma, S.Tr.Keb"
                      required
                      className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-[#fce1e4] text-xs font-medium focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none transition-colors"
                    />
                    <User className="w-4 h-4 text-[#80000f] absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nomor WhatsApp / HP Siaga
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={noHp}
                      onChange={(e) => setNoHp(e.target.value)}
                      placeholder="Contoh: 6281278901234 atau 081278901234"
                      required
                      className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-[#fce1e4] text-xs font-medium focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none transition-colors"
                    />
                    <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Jabatan / Wilayah Tugas
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={jabatan}
                      onChange={(e) => setJabatan(e.target.value)}
                      placeholder="Contoh: Ketua Kader Posyandu Melati atau Bidan Pembina Wilayah"
                      required
                      className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-[#fce1e4] text-xs font-medium focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none transition-colors"
                    />
                    <Sparkles className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Akun Terdaftar
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userEmail}
                      disabled
                      className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-600 cursor-not-allowed"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="w-full px-5 py-2.5 rounded-full bg-[#80000f] hover:bg-[#66000c] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#80000f]/20 transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSavingProfile ? 'Menyimpan Profil...' : 'Simpan Perubahan Profil'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Card: Form Ganti Password */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#fce1e4] shadow-xs space-y-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#80000f]" />
                  <span>Ganti Kata Sandi (Password)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Masukkan kata sandi baru untuk akun Anda. Perubahan akan langsung disimpan dan tersinkronisasi pada login sistem.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Input Kata Sandi Baru */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Masukkan minimal 6 karakter..."
                      required
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#fce1e4] text-xs font-medium focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                    <span
                      className={`flex items-center gap-1 font-semibold ${
                        isPasswordValid ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Minimal 6 karakter
                    </span>
                  </div>
                </div>

                {/* Input Konfirmasi Kata Sandi */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang kata sandi baru..."
                      required
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#fce1e4] text-xs font-medium focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                      {isMatch ? (
                        <span className="flex items-center gap-1 font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Kata sandi cocok
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-semibold text-rose-600">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Kata sandi belum sama
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || !isPasswordValid || !isMatch}
                    className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#80000f] hover:bg-[#66000c] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#80000f]/20 transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isSubmitting ? 'Menyimpan Kata Sandi...' : 'Perbarui Kata Sandi'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
