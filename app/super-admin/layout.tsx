'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const authUserStr = localStorage.getItem('posyandu_auth_user');
      if (!authUserStr) {
        setIsAuthorized(false);
        router.replace('/login');
        return;
      }

      const authUser = JSON.parse(authUserStr);
      if (authUser?.role === 'super_admin') {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        router.replace('/dashboard');
      }
    } catch {
      setIsAuthorized(false);
      router.replace('/login');
    }
  }, [router]);

  // Loading state saat verifikasi sesi Super Admin
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] text-slate-800">
        <div className="flex flex-col items-center gap-3 p-8 rounded-3xl bg-white border border-[#fce1e4] shadow-xl text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#fff0f2] flex items-center justify-center border border-[#f8c8c8] text-2xl shadow-xs animate-pulse">
            👑
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-black text-slate-900 text-base">
              Verifikasi Otoritas Super Admin
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Memeriksa hak akses supervisi wilayah Puskesmas...
            </p>
          </div>
          <Loader2 className="w-5 h-5 text-[#80000f] animate-spin mt-2" />
        </div>
      </div>
    );
  }

  // Jika tidak memiliki akses Super Admin
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] text-slate-800 p-4">
        <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white border border-rose-200 shadow-xl text-center max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-200 text-rose-600 shadow-xs">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-serif font-black text-slate-900 text-lg">
              Akses Terbatas (Super Admin Only)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Halaman ini dikhususkan untuk supervisi multi-tenant Super Admin Puskesmas Pembina. Mengalihkan Anda ke portal operasional Posyandu...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

