import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Server-Side Next.js Route Protection Proxy
 * Memverifikasi otoritas akses dan boundary role di level server HTTP
 * sebelum halaman atau komponen client dirender.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Baca cookie otentikasi role sesi
  const authRole = request.cookies.get('posyandu_auth_role')?.value;

  // 1. Proteksi Seluruh Route /super-admin/ (Supervisi Puskesmas)
  // Hanya akun dengan peran 'super_admin' yang diizinkan lewat
  if (pathname.startsWith('/super-admin')) {
    if (authRole !== 'super_admin') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized_superadmin');
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Proteksi Halaman Operasional Posyandu
  // Memastikan pengguna telah terautentikasi (memiliki sesi login)
  const protectedPosyanduPaths = [
    '/dashboard',
    '/rekomendasi-mbg',
    '/e-kms',
    '/bumil',
    '/lansia',
    '/laporan',
    '/pengaturan-akun',
  ];

  const isProtectedPath = protectedPosyanduPaths.some((p) => pathname.startsWith(p));
  if (isProtectedPath) {
    if (!authRole) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/super-admin/:path*',
    '/dashboard/:path*',
    '/rekomendasi-mbg/:path*',
    '/e-kms/:path*',
    '/bumil/:path*',
    '/lansia/:path*',
    '/laporan/:path*',
    '/pengaturan-akun/:path*',
  ],
};

