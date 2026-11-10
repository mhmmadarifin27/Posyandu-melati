'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPersetujuanRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/super-admin/persetujuan');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-slate-500 text-xs">
      Mengalihkan ke Persetujuan &amp; ACC Super Admin...
    </div>
  );
}
