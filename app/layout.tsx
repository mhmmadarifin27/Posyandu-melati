import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/custom-toast';

export const metadata: Metadata = {
  title: 'PosyanduGo | Platform SaaS Manajemen Posyandu Multi-Tenant Terpadu',
  description:
    'Platform SaaS Posyandu modern terintegrasi e-KMS WHO, SPK Rekomendasi Menu MBG (metode SAW), dan rekapitulasi laporan Puskesmas se-Indonesia.',
  icons: {
    icon: '/images/logo-posyandugo-maroon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col bg-[#faf6f6] text-slate-900 antialiased">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
