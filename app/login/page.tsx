'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { ImageSlider } from '@/components/ui/image-slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { supabase, isSupabaseConfigured, PosyanduStore } from '@/lib/supabase';
import { toast } from '@/components/ui/custom-toast';

export default function LoginPage() {
  const router = useRouter();

  // Foto-foto resmi dokumentasi Posyandu Melati
  const posyanduImages = [
    '/images/hero_posyandu.jpg',
    '/images/dok_timbang_balita.jpg',
    '/images/dok_bumil_checkup.jpg',
    '/images/galeri_imunisasi.jpg',
    '/images/galeri_lansia.jpg',
    '/images/galeri_pmt.jpg',
  ];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 16, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 110,
        damping: 14,
      },
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('Mohon masukkan email dan kata sandi dengan benar.');
      setIsLoading(false);
      return;
    }

    // 0. Blokir Akun Kader & Bidan Lama (Sudah dilebur menjadi Admin Posyandu)
    const BLOCKED_LEGACY_EMAILS = [
      'kadermelati@gmail.com',
      'bidanmelati@gmail.com',
      'kader@gmail.com',
      'bidan@gmail.com',
    ];
    if (BLOCKED_LEGACY_EMAILS.includes(cleanEmail)) {
      setErrorMessage(
        'Akun kader dan bidan lama telah dinonaktifkan dalam sistem SaaS. Peran operasional kini telah dilebur menjadi Admin Posyandu. Silakan gunakan akun Admin Posyandu terdaftar (misal: admin.melati@posyandu.id) atau masuk sebagai Super Admin.'
      );
      setIsLoading(false);
      return;
    }

    try {
      // 1. Cek Apakah Email Masih Berstatus Permohonan Pendaftaran (Pending / Ditolak)
      const registrations = PosyanduStore.getRegistrations();
      const pendingReg = registrations.find(
        (r) => r.emailAdmin.toLowerCase() === cleanEmail && r.status === 'pending'
      );
      if (pendingReg) {
        setErrorMessage(
          `Pendaftaran untuk unit ${pendingReg.namaPosyandu} masih dalam status MENUNGGU PERSETUJUAN (ACC) oleh Super Admin Puskesmas Pembina. Anda baru dapat masuk setelah permohonan diverifikasi & disetujui.`
        );
        toast.warning(
          'Akun Belum Di-ACC',
          'Permohonan pendaftaran unit Posyandu Anda sedang dalam proses verifikasi Super Admin.'
        );
        setIsLoading(false);
        return;
      }

      const rejectedReg = registrations.find(
        (r) => r.emailAdmin.toLowerCase() === cleanEmail && r.status === 'rejected'
      );
      if (rejectedReg) {
        setErrorMessage(
          `Permohonan pendaftaran untuk unit ${rejectedReg.namaPosyandu} ditolak oleh Super Admin Puskesmas. Catatan: ${rejectedReg.notes || 'Silakan hubungi Puskesmas Pembina untuk info lebih lanjut.'}`
        );
        toast.error('Pendaftaran Ditolak', 'Permohonan pendaftaran posyandu Anda tidak disetujui.');
        setIsLoading(false);
        return;
      }

      // 2. Cek Akun Terdaftar (SaaS Multi-Tenant Accounts)
      const registeredAccounts = PosyanduStore.getAccounts();
      const matchedAccount = registeredAccounts.find(
        (acc) => acc.email.toLowerCase() === cleanEmail
      );

      if (matchedAccount) {
        if (matchedAccount.status === 'pending') {
          setErrorMessage(
            'Akun Anda masih dalam status Menunggu Persetujuan (ACC) dari Super Admin Puskesmas. Silakan tunggu konfirmasi persetujuan.'
          );
          setIsLoading(false);
          return;
        }

        if (matchedAccount.status === 'rejected') {
          setErrorMessage('Akun ini telah dinonaktifkan / ditolak oleh Super Admin.');
          setIsLoading(false);
          return;
        }

        if (matchedAccount.password && matchedAccount.password !== cleanPassword) {
          setErrorMessage('Kata sandi salah. Silakan periksa kembali kata sandi Anda.');
          setIsLoading(false);
          return;
        }

        const isSuper = matchedAccount.role === 'super_admin';
        const authPayload = {
          id: matchedAccount.id,
          email: matchedAccount.email,
          role: matchedAccount.role,
          nama: matchedAccount.nama,
          posyanduId: matchedAccount.posyanduId,
          posyanduNama: matchedAccount.posyanduNama || matchedAccount.posyandu,
          posyandu: matchedAccount.posyandu || matchedAccount.posyanduNama,
          jabatan: matchedAccount.jabatan,
          loggedAt: new Date().toISOString(),
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('posyandu_auth_user', JSON.stringify(authPayload));
          localStorage.setItem('posyandu_active_role', matchedAccount.role);

          // Set session cookies untuk proteksi Server-Side Middleware
          document.cookie = `posyandu_auth_role=${matchedAccount.role}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `posyandu_auth_email=${encodeURIComponent(matchedAccount.email)}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `posyandu_auth_tenant=${encodeURIComponent(authPayload.posyanduNama || '')}; path=/; max-age=86400; SameSite=Lax`;
        }

        if (isSuper) {
          setSuccessMessage(`Login berhasil sebagai Super Admin (${matchedAccount.nama})! Mengalihkan ke Portal Puskesmas...`);
          setTimeout(() => {
            router.push('/super-admin/dashboard');
          }, 500);
        } else {
          setSuccessMessage(`Login berhasil sebagai Admin ${matchedAccount.posyanduNama || 'Posyandu'} (${matchedAccount.nama})!`);
          setTimeout(() => {
            router.push('/dashboard');
          }, 500);
        }
        return;
      }

      // 2. Coba autentikasi via Supabase Auth jika terkonfigurasi
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (error) {
          console.warn('Supabase Auth error:', error.message);
          setErrorMessage(`Gagal masuk Supabase: ${error.message}`);
          setIsLoading(false);
          return;
        }

        if (data?.user) {
          const metaRole =
            data.user.user_metadata?.role ||
            data.user.app_metadata?.role;

          if (metaRole === 'kader' || metaRole === 'bidan' || BLOCKED_LEGACY_EMAILS.includes(cleanEmail)) {
            await supabase.auth.signOut();
            setErrorMessage(
              'Akun kader dan bidan lama telah dinonaktifkan dalam sistem SaaS. Peran operasional telah dilebur menjadi Admin Posyandu. Silakan gunakan akun Admin Posyandu terdaftar.'
            );
            setIsLoading(false);
            return;
          }

          const isSuper = metaRole === 'super_admin' || cleanEmail.includes('superadmin');
          const userRole = isSuper ? 'super_admin' : 'admin_posyandu';

          const userName =
            data.user.user_metadata?.nama ||
            data.user.user_metadata?.full_name ||
            (isSuper ? 'Super Admin Puskesmas' : 'Admin Posyandu');

          const userPosyandu = data.user.user_metadata?.posyandu || 'Posyandu Melati';

          if (typeof window !== 'undefined') {
            localStorage.setItem(
              'posyandu_auth_user',
              JSON.stringify({
                id: data.user.id,
                email: cleanEmail,
                role: userRole,
                nama: userName,
                posyanduNama: userPosyandu,
                posyandu: userPosyandu,
                loggedAt: new Date().toISOString(),
              })
            );
            localStorage.setItem('posyandu_active_role', userRole);

            // Set session cookies untuk proteksi Server-Side Middleware
            document.cookie = `posyandu_auth_role=${userRole}; path=/; max-age=86400; SameSite=Lax`;
            document.cookie = `posyandu_auth_email=${encodeURIComponent(cleanEmail)}; path=/; max-age=86400; SameSite=Lax`;
            document.cookie = `posyandu_auth_tenant=${encodeURIComponent(userPosyandu)}; path=/; max-age=86400; SameSite=Lax`;
          }

          if (isSuper) {
            setSuccessMessage(`Login berhasil sebagai Super Admin! Mengalihkan ke Portal Puskesmas...`);
            setTimeout(() => {
              router.push('/super-admin/dashboard');
            }, 500);
          } else {
            setSuccessMessage(`Login berhasil sebagai Admin Posyandu! Mengalihkan ke dashboard...`);
            setTimeout(() => {
              router.push('/dashboard');
            }, 500);
          }
          return;
        }
      }

      // 3. Fallback Autentikasi Demo
      const isSuper = cleanEmail.includes('super') || cleanEmail.includes('admin@');
      const userRole = isSuper ? 'super_admin' : 'admin_posyandu';
      const posyanduTarget = cleanEmail.includes('mawar')
        ? 'Posyandu Mawar'
        : cleanEmail.includes('anggrek')
        ? 'Posyandu Anggrek'
        : 'Posyandu Melati';

      const userName = isSuper
        ? 'Dr. Hendra Gunawan, M.Kes'
        : `Admin ${posyanduTarget}`;

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'posyandu_auth_user',
          JSON.stringify({
            email: cleanEmail,
            role: userRole,
            nama: userName,
            posyanduNama: posyanduTarget,
            posyandu: posyanduTarget,
            loggedAt: new Date().toISOString(),
          })
        );
        localStorage.setItem('posyandu_active_role', userRole);

        // Set session cookies untuk proteksi Server-Side Middleware
        document.cookie = `posyandu_auth_role=${userRole}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `posyandu_auth_email=${encodeURIComponent(cleanEmail)}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `posyandu_auth_tenant=${encodeURIComponent(posyanduTarget)}; path=/; max-age=86400; SameSite=Lax`;
      }

      if (isSuper) {
        setSuccessMessage(`Login berhasil sebagai Super Admin! Mengalihkan ke portal Puskesmas...`);
        setTimeout(() => {
          router.push('/super-admin/dashboard');
        }, 500);
      } else {
        setSuccessMessage(`Login berhasil sebagai Admin ${posyanduTarget}! Mengalihkan ke dashboard...`);
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      setErrorMessage('Terjadi kesalahan saat masuk. Silakan periksa kembali email & kata sandi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Tombol Kembali ke Landing Page di Pojok Kiri Atas */}
      <Link
        href="/"
        className="fixed top-5 left-5 z-30 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs hover:text-[#80000f] hover:border-[#80000f]/30 hover:bg-white transition-all group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        <span>Kembali ke Beranda</span>
      </Link>

      <motion.div
        className="w-full max-w-5xl min-h-[640px] lg:h-[720px] grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl bg-white border border-rose-100"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {/* ========================================================================= */}
        {/* BAGIAN KIRI: SLIDER FOTO POSYANDU                                         */}
        {/* ========================================================================= */}
        <div className="hidden lg:block relative w-full h-full overflow-hidden bg-slate-900 select-none">
          {/* Komponen Slider Foto Bersih Tanpa Teks / Badge */}
          <ImageSlider images={posyanduImages} interval={4500} className="w-full h-full" />
        </div>

        {/* ========================================================================= */}
        {/* BAGIAN KANAN: FORM LOGIN                                                  */}
        {/* ========================================================================= */}
        <div className="w-full h-full bg-white flex flex-col items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
          <motion.div
            className="w-full max-w-sm my-auto space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header Form & Logo */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center justify-start">
                <Image
                  src="/images/logo-posyandugo-maroon.png"
                  alt="Logo PosyanduGo"
                  width={200}
                  height={42}
                  priority
                  className="h-7 sm:h-8 w-auto object-contain drop-shadow-2xs"
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Masuk ke Portal
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Portal resmi untuk Super Admin Puskesmas dan Admin Posyandu Terpadu.
                </p>
              </div>
            </motion.div>

            {/* Alert Error / Sukses */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{successMessage}</span>
              </motion.div>
            )}

            {/* Form Input Email & Password */}
            <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4">
              {/* Field Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                  Email / NIK Petugas
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:border-[#80000f] focus-visible:ring-[#80000f]/20 h-10 rounded-xl"
                  />
                </div>
              </div>

              {/* Field Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold text-slate-700">
                    Kata Sandi (Password)
                  </Label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info(
                        'Bantuan Kata Sandi',
                        'Untuk reset kata sandi, silakan hubungi Bidan Pembina di Puskesmas Pembina.'
                      );
                    }}
                    className="text-[11px] font-semibold text-[#80000f] hover:underline"
                  >
                    Lupa sandi?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9 pr-10 text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:border-[#80000f] focus-visible:ring-[#80000f]/20 h-10 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Tombol Submit Masuk */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-[#80000f] hover:bg-[#9c0013] text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-950/20 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses Masuk...</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Masuk ke Portal</span>
                  </span>
                )}
              </Button>
            </motion.form>

            {/* Pendaftaran Posyandu Baru CTA */}
            <motion.div variants={itemVariants} className="pt-1">
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 text-center space-y-2">
                <p className="text-xs text-slate-700 font-medium">
                  Belum memiliki akun unit Posyandu?
                </p>
                <Link
                  href="/daftar"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-white hover:bg-rose-100/60 border border-rose-300 text-rose-700 font-bold text-xs shadow-2xs transition-all hover:scale-101 active:scale-99"
                >
                  <span>Daftarkan Unit Posyandu Anda</span>
                  <ArrowRight className="w-3.5 h-3.5 text-rose-600" />
                </Link>
              </div>
            </motion.div>

            {/* Quick Demo Login Pills for Capstone & Testing */}
            <motion.div variants={itemVariants} className="pt-2 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-500 mb-2 text-center">
                Pilih Akun Demo (Capstone Testing):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('superadmin@posyandu.id');
                    setPassword('admin123');
                    toast.success('Akun Diisi', 'Super Admin Puskesmas: superadmin@posyandu.id');
                  }}
                  className="px-2 py-1.5 rounded-lg border border-[#fce1e4] bg-[#fff0f2] hover:bg-[#ffe3e7] text-[11px] font-semibold text-[#80000f] text-center transition-colors cursor-pointer"
                >
                  👑 Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin.melati@posyandu.id');
                    setPassword('123456');
                    toast.success('Akun Diisi', 'Admin Posyandu Melati: admin.melati@posyandu.id');
                  }}
                  className="px-2 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[11px] font-semibold text-rose-800 text-center transition-colors cursor-pointer"
                >
                  🌸 Admin Melati
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin.mawar@posyandu.id');
                    setPassword('123456');
                    toast.success('Akun Diisi', 'Admin Posyandu Mawar: admin.mawar@posyandu.id');
                  }}
                  className="px-2 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-[11px] font-semibold text-amber-800 text-center transition-colors cursor-pointer"
                >
                  🌹 Admin Mawar
                </button>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div variants={itemVariants} className="text-center pt-1">
              <p className="text-[11px] text-slate-400">
                PosyanduGo — Platform SaaS Manajemen Posyandu Multi-Tenant Terpadu
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
