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
  Phone,
  Building2,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { PosyanduStore, supabase, isSupabaseConfigured, ensureUuid } from '@/lib/supabase';
import { toast } from '@/components/ui/custom-toast';
import { UserRole } from '@/types/posyandu';

export default function PengaturanAkunPage() {
  const [activeRole, setActiveRole] = useState<UserRole>('admin_posyandu');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [posyanduNama, setPosyanduNama] = useState('Posyandu Melati');
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

  // Muat data profil akun dari sesi aktif / pendaftaran terbaru
  const loadAccountData = () => {
    if (typeof window === 'undefined') return;

    // 1. Ambil data dari sesi pengguna aktif (posyandu_auth_user)
    const activeUser = PosyanduStore.getActiveUser();

    // 2. Ambil data cadangan dari pendaftaran terbaru atau akun terdaftar
    const registrations = PosyanduStore.getRegistrations();
    const latestReg = registrations.length > 0 ? registrations[0] : null;
    const accounts = PosyanduStore.getAccounts();

    // Tentukan email aktif
    const currentEmail =
      activeUser?.email ||
      latestReg?.emailAdmin ||
      accounts[0]?.email ||
      'admin@posyandu.id';

    const matchedAccount = accounts.find(
      (a) => a.email.toLowerCase() === currentEmail.toLowerCase()
    );

    // Tentukan nama posyandu
    const currentPosyandu =
      activeUser?.posyanduNama ||
      activeUser?.posyandu ||
      matchedAccount?.posyanduNama ||
      matchedAccount?.posyandu ||
      latestReg?.namaPosyandu ||
      'Posyandu Melati';

    // Tentukan nama pengguna
    const currentNama =
      activeUser?.nama ||
      matchedAccount?.nama ||
      (latestReg ? `Admin ${latestReg.namaPosyandu} (${latestReg.namaKetua})` : 'Admin Posyandu');

    // Tentukan nomor HP / WhatsApp
    const currentNoHp =
      activeUser?.noHp ||
      matchedAccount?.noHp ||
      latestReg?.noWhatsapp ||
      '';

    // Tentukan peran & jabatan
    const currentRole = activeUser?.role || matchedAccount?.role || 'admin_posyandu';
    const currentJabatan =
      activeUser?.jabatan ||
      matchedAccount?.jabatan ||
      `Ketua & Admin ${currentPosyandu}`;

    setUserId(activeUser?.id || matchedAccount?.id || `usr-${Date.now()}`);
    setUserEmail(currentEmail);
    setNama(currentNama);
    setNoHp(currentNoHp);
    setJabatan(currentJabatan);
    setPosyanduNama(currentPosyandu);
    setActiveRole(currentRole);
  };

  useEffect(() => {
    loadAccountData();

    // Periksa status autentikasi Cloud Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setIsCloudAuth(true);
          if (data.user.email) setUserEmail(data.user.email);
          const metaNama = data.user.user_metadata?.nama;
          const metaNoHp = data.user.user_metadata?.no_hp;
          const metaPosyandu = data.user.user_metadata?.posyandu;
          if (metaNama && !nama) setNama(metaNama);
          if (metaNoHp && !noHp) setNoHp(metaNoHp);
          if (metaPosyandu && !posyanduNama) setPosyanduNama(metaPosyandu);
        }
      });
    }

    const handleAuthChange = () => loadAccountData();
    window.addEventListener('posyandu_auth_changed', handleAuthChange);
    window.addEventListener('posyandu_accounts_updated', handleAuthChange);
    return () => {
      window.removeEventListener('posyandu_auth_changed', handleAuthChange);
      window.removeEventListener('posyandu_accounts_updated', handleAuthChange);
    };
  }, []);

  // Simpan Perubahan Profil (Nama, No HP, Jabatan)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !noHp.trim() || !jabatan.trim()) {
      toast.warning('Data Belum Lengkap', 'Mohon lengkapi nama, nomor WhatsApp, dan jabatan Anda.');
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
          id: userId,
          email: userEmail,
          role: activeRole,
          nama: nama.trim(),
          noHp: noHp.trim(),
          jabatan: jabatan.trim(),
          posyandu: posyanduNama,
          posyanduNama: posyanduNama,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('posyandu_auth_user', JSON.stringify(updatedUser));

        // 2. Perbarui juga akun di PosyanduStore
        const accounts = PosyanduStore.getAccounts();
        const matched = accounts.find((a) => a.email.toLowerCase() === userEmail.toLowerCase());
        if (matched) {
          PosyanduStore.updateAccount({
            ...matched,
            nama: nama.trim(),
            noHp: noHp.trim(),
            jabatan: jabatan.trim(),
          });
        }

        // 3. Sinkronisasi ke Cloud Database Supabase jika terhubung
        if (isSupabaseConfigured && supabase && userId) {
          try {
            await supabase.from('profiles').upsert({
              id: ensureUuid(userId),
              nama: nama.trim(),
              email: userEmail.toLowerCase(),
              role: activeRole,
              posyandu: posyanduNama,
              no_hp: noHp.trim(),
            });
          } catch (cloudErr) {
            console.warn('Supabase profile cloud sync warning:', cloudErr);
          }
        }

        // Siarkan event pembaruan
        window.dispatchEvent(new Event('posyandu_profile_updated'));
        window.dispatchEvent(new Event('posyandu_accounts_updated'));
      }

      toast.success(
        'Profil Berhasil Diperbarui!',
        'Nama, nomor kontak, dan jabatan Anda telah tersimpan.'
      );
    } catch (err: any) {
      console.error('Save profile error:', err);
      toast.error('Gagal Menyimpan Profil', err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Simpan Perubahan Kata Sandi
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
      // 1. Perbarui di Supabase Auth jika sesi Cloud aktif
      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });
          if (error) {
            console.warn('Supabase update password warning:', error.message);
          }
        } catch (e) {
          console.warn('Supabase auth update exception:', e);
        }
      }

      // 2. Perbarui kata sandi di akun PosyanduStore
      const accounts = PosyanduStore.getAccounts();
      const matched = accounts.find((a) => a.email.toLowerCase() === userEmail.toLowerCase());
      if (matched) {
        PosyanduStore.updateAccount({
          ...matched,
          password: newPassword,
        });
      }

      toast.success(
        'Kata Sandi Berhasil Diperbarui!',
        'Kata sandi akun Anda telah diperbarui. Gunakan kata sandi baru ini saat masuk berikutnya.'
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
              Kelola informasi profil penanggung jawab dan perbarui kata sandi login untuk keamanan unit {posyanduNama}.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Card: Form Edit Profil & Kontak Petugas */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#fce1e4] shadow-xs space-y-6">
              <div className="flex items-center gap-3.5 pb-5 border-b border-[#fce1e4]">
                <div className="w-14 h-14 rounded-2xl bg-[#fff0f2] border border-[#fce1e4] text-3xl flex items-center justify-center shrink-0 shadow-2xs">
                  {activeRole === 'super_admin' ? '🏛️' : '🧕'}
                </div>
                <div className="overflow-hidden">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#fff0f2] text-[#80000f] border border-[#fce1e4] mb-1">
                    <ShieldCheck className="w-3 h-3" />
                    {activeRole === 'super_admin' ? 'Super Admin Puskesmas' : `Admin ${posyanduNama}`}
                  </span>
                  <h3 className="font-serif text-base font-bold text-slate-900 truncate">
                    {nama || 'Admin Posyandu'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium truncate">
                    {userEmail}
                  </p>
                </div>
              </div>

              {/* Formulir Pengeditan Profil */}
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nama Lengkap / Penanggung Jawab
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Contoh: Ny. Anisa Rahmawati"
                      required
                      className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-[#fce1e4] text-xs font-medium focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none transition-colors"
                    />
                    <User className="w-4 h-4 text-[#80000f] absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Unit Posyandu */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Unit Posyandu Terdaftar
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={posyanduNama}
                      disabled
                      className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-600 cursor-not-allowed"
                    />
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Nomor WhatsApp */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nomor WhatsApp / Kontak Aktif
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={noHp}
                      onChange={(e) => setNoHp(e.target.value)}
                      placeholder="Contoh: 081367895678"
                      required
                      className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-[#fce1e4] text-xs font-medium focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none transition-colors"
                    />
                    <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Jabatan */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Jabatan / Wilayah Tugas
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={jabatan}
                      onChange={(e) => setJabatan(e.target.value)}
                      placeholder="Contoh: Ketua & Admin Posyandu"
                      required
                      className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-[#fce1e4] text-xs font-medium focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] focus:outline-none transition-colors"
                    />
                    <Sparkles className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Email Login */}
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
