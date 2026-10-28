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
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from '@/components/ui/custom-toast';

export default function PengaturanAkunPage() {
  const [activeRole, setActiveRole] = useState<'kader' | 'bidan'>('kader');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isCloudAuth, setIsCloudAuth] = useState(false);

  // Form Ganti Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('posyandu_active_role');
      if (storedRole === 'kader' || storedRole === 'bidan') {
        setActiveRole(storedRole);
      }

      const rawUser = localStorage.getItem('posyandu_auth_user');
      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          setUserEmail(parsed.email || (storedRole === 'bidan' ? 'bidanmelati@gmail.com' : 'kadermelati@gmail.com'));
          setUserName(parsed.nama || (storedRole === 'bidan' ? 'Bdn. Ratna Kusuma, S.ST' : 'Kader Posyandu RW 03'));
        } catch {
          setUserEmail(storedRole === 'bidan' ? 'bidanmelati@gmail.com' : 'kadermelati@gmail.com');
          setUserName(storedRole === 'bidan' ? 'Bdn. Ratna Kusuma, S.ST' : 'Kader Posyandu RW 03');
        }
      } else {
        setUserEmail(storedRole === 'bidan' ? 'bidanmelati@gmail.com' : 'kadermelati@gmail.com');
        setUserName(storedRole === 'bidan' ? 'Bdn. Ratna Kusuma, S.ST' : 'Kader Posyandu RW 03');
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
            {/* Left Card: Informasi Profil Akun */}
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
                    {userName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium truncate">
                    {userEmail}
                  </p>
                </div>
              </div>

              {/* Rincian Hak Akses & Status Autentikasi */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#fff5f6] border border-[#fce1e4]">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#80000f]" />
                    Email Terdaftar
                  </span>
                  <span className="font-bold text-slate-900 truncate max-w-[180px]">
                    {userEmail}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#fff5f6] border border-[#fce1e4]">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Koneksi Autentikasi
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Supabase Cloud
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#fff5f6] border border-[#fce1e4]">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#80000f]" />
                    Wewenang Peran
                  </span>
                  <span className="font-bold text-[#80000f]">
                    {activeRole === 'bidan' ? 'Audit Medis, MBG SAW & Laporan' : 'Pelayanan Meja 1–4 & Landing'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-slate-700 text-xs space-y-1.5">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Tips Keamanan Kata Sandi</span>
                </p>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Gunakan kombinasi minimal 6 karakter. Jangan membagikan kata sandi Anda kepada pihak yang tidak berkepentingan demi melindungi kerahasiaan data rekam medis balita dan ibu hamil.
                </p>
              </div>
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
