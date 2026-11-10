'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KelolaLandingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/super-admin/kelola-landing');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-slate-500 text-xs">
      Mengalihkan ke Kelola Landing Page Super Admin...
    </div>
  );
}
