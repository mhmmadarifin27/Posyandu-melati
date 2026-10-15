import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/custom-toast';

export const metadata: Metadata = {
  title: 'SIP-MBG | Sistem Informasi Posyandu & Rekomendasi MBG Cerdas',
  description:
    'Sistem Informasi Posyandu Digital terintegrasi Rekomendasi Cerdas Prioritas Menu Tambahan MBG menggunakan metode SAW & TOPSIS',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
