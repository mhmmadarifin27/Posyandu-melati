'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPenggunaRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/super-admin/pengguna');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-slate-500 text-xs">
      Mengalihkan ke Kelola Akun Admin...
    </div>
  );
}
