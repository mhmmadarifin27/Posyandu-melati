'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Sidebar as BaseSidebar,
  SidebarHeader,
  SidebarNav,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
  SidebarToggle,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  PanelsTopLeft,
  Sparkles,
  LineChart,
  Baby,
  HeartPulse,
  Activity,
  FileSpreadsheet,
  Calendar,
  Image as ImageIcon,
  LogOut,
  X,
  ChevronRight,
} from 'lucide-react';
import { toast } from '@/components/ui/custom-toast';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('posyandu_sidebar_collapsed') === 'true';
    }
    return false;
  });
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<'bidan' | 'kader'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('posyandu_active_role');
      if (saved === 'kader' || saved === 'bidan') return saved;
      const auth = localStorage.getItem('posyandu_auth_user');
      if (auth) {
        try {
          const parsed = JSON.parse(auth);
          if (parsed.role === 'kader' || parsed.role === 'bidan') return parsed.role;
        } catch {}
      }
    }
    return 'kader';
  });

  // Synchronize collapsed state & active role with localStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('posyandu_sidebar_collapsed');
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }
    const savedRole = localStorage.getItem('posyandu_active_role');
    if (savedRole === 'kader' || savedRole === 'bidan') {
      setActiveRole(savedRole);
    }

    const handleRoleUpdate = () => {
      const updated = localStorage.getItem('posyandu_active_role');
      if (updated === 'kader' || updated === 'bidan') {
        setActiveRole(updated);
      }
    };
    window.addEventListener('storage', handleRoleUpdate);
    return () => window.removeEventListener('storage', handleRoleUpdate);
  }, []);

  // Listen to mobile toggle event from Header
  useEffect(() => {
    const handleToggle = () => setMobileOpen((prev) => !prev);
    const handleClose = () => setMobileOpen(false);

    window.addEventListener('posyandu_toggle_mobile_sidebar', handleToggle);
    window.addEventListener('posyandu_close_mobile_sidebar', handleClose);

    return () => {
      window.removeEventListener('posyandu_toggle_mobile_sidebar', handleToggle);
      window.removeEventListener('posyandu_close_mobile_sidebar', handleClose);
    };
  }, []);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleCollapsedChange = (nextCollapsed: boolean) => {
    setCollapsed(nextCollapsed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('posyandu_sidebar_collapsed', String(nextCollapsed));
    }
  };

  const handleLogout = () => {
    toast.confirm({
      title: 'Konfirmasi Keluar',
      description: 'Apakah Anda yakin ingin keluar dari sistem Posyandu Melati?',
      confirmText: 'Ya, Keluar',
      cancelText: 'Batal',
      type: 'danger',
      onConfirm: () => {
        localStorage.removeItem('posyandu_auth_user');
        toast.success('Berhasil Logout', 'Sesi kerja Anda telah diakhiri.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 400);
      },
    });
  };

  const mainNav = [
    {
      name: 'Dashboard Overview',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      badge: null,
    },
    {
      name: 'Rekomendasi MBG (SAW)',
      href: '/rekomendasi-mbg',
      icon: <Sparkles className="w-4 h-4 shrink-0" />,
      badge: (
        <span className="px-1.5 py-0.5 rounded-full bg-[#fce1e4] text-[#80000f] text-[9.5px] font-black uppercase border border-[#f8c8c8]">
          SAW
        </span>
      ),
    },
    {
      name: 'E-KMS Digital WHO',
      href: '/e-kms',
      icon: <LineChart className="w-4 h-4 shrink-0" />,
      badge: null,
    },
  ];

  const dataNav = [
    {
      name: 'Balita & Timbang Rutin',
      href: '/balita',
      icon: <Baby className="w-4 h-4 shrink-0" />,
    },
    {
      name: 'Ibu Hamil & Menyusui',
      href: '/bumil',
      icon: <HeartPulse className="w-4 h-4 shrink-0" />,
    },
    {
      name: 'Posyandu Lansia',
      href: '/lansia',
      icon: <Activity className="w-4 h-4 shrink-0" />,
    },
    {
      name: 'Laporan Puskesmas',
      href: '/laporan',
      icon: <FileSpreadsheet className="w-4 h-4 shrink-0" />,
    },
  ];

  const landingNav = [
    {
      name: 'Kelola Galeri',
      href: '/kelola-galeri',
      icon: <ImageIcon className="w-4 h-4 shrink-0" />,
    },
    {
      name: 'Kelola Jadwal Posyandu',
      href: '/kelola-jadwal',
      icon: <Calendar className="w-4 h-4 shrink-0" />,
    },
  ];

  // Saring menu sesuai wewenang: Kader fokus operasional (MBG SAW & Laporan Puskesmas khusus Bidan)
  const filteredMainNav = mainNav.filter((item) => {
    if (activeRole === 'kader' && item.href === '/rekomendasi-mbg') return false;
    return true;
  });

  const filteredDataNav = dataNav.filter((item) => {
    if (activeRole === 'kader' && item.href === '/laporan') return false;
    return true;
  });

  const sidebarTokens = {
    '--background': '#ffffff',
    '--foreground': '#0f172a',
    '--muted-foreground': '#80000f',
    '--primitive-text-secondary': '#64748b',
    '--border': '#fce1e4',
    '--primitive-surface-selected': 'transparent',
    '--primitive-surface-hover': '#fff5f6',
    '--primitive-radius-item': '0.75rem',
  } as React.CSSProperties;

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR (Visible on lg: and wider screens)                     */}
      {/* ========================================================================= */}
      <div
        className={`hidden lg:block sticky top-0 h-screen shrink-0 z-40 select-none ${className}`}
        style={sidebarTokens}
      >
        <BaseSidebar
          variant="collapsible"
          collapsed={collapsed}
          onCollapsedChange={handleCollapsedChange}
          width={260}
          collapsedWidth={68}
          className="border-r border-[#fce1e4] bg-white shadow-xs"
        >
          {/* Header Brand (Tinggi h-[72px] presisi menyamai Top Header) */}
          <SidebarHeader className="h-[72px] shrink-0 border-b border-[#fce1e4] px-3.5 bg-white flex items-center">
            {collapsed ? (
              <div className="w-full flex items-center justify-center">
                <SidebarToggle
                  className="w-9 h-9 rounded-xl bg-[#fff0f2] border border-[#fce1e4] text-[#80000f] hover:bg-[#80000f] hover:text-white transition-all shadow-2xs flex items-center justify-center cursor-pointer"
                  title="Perluas Sidebar"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div
                  className="flex items-center gap-2.5 overflow-hidden select-none"
                  title="Posyandu Melati RW 03"
                >
                  <div className="relative w-8 h-8 rounded-xl bg-[#fff0f2] border border-[#fce1e4] flex items-center justify-center p-1 shrink-0 shadow-2xs">
                    <img
                      src="/images/logo-posyandu.png"
                      alt="Logo Posyandu Melati"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="font-serif font-black text-xs tracking-wider text-slate-900 uppercase truncate">
                      POSYANDU <span className="text-[#80000f]">MELATI</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold truncate">
                      RW 03 Sukamaju
                    </span>
                  </div>
                </div>
                <SidebarToggle
                  className="text-[#80000f] hover:bg-[#fff5f6] hover:text-[#80000f] border border-[#fce1e4] rounded-lg transition-colors p-1 cursor-pointer"
                  title="Perkecil Sidebar"
                />
              </div>
            )}
          </SidebarHeader>

          {/* Navigation Links */}
          <SidebarNav className="p-2 space-y-4 overflow-y-auto">
            {/* Section 1: Menu Utama */}
            <SidebarSection label="Menu Pelayanan">
              {filteredMainNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarItem
                    key={item.href}
                    icon={item.icon}
                    href={item.href}
                    badge={!collapsed ? item.badge : null}
                    active={isActive}
                    className={`transition-all text-xs font-semibold rounded-xl ${
                      isActive
                        ? '!bg-[#80000f] !text-white font-bold shadow-md shadow-[#80000f]/25 [&_[data-slot=sidebar-item-icon]]:!text-white'
                        : '!text-slate-600 hover:!bg-[#fff5f6] hover:!text-[#80000f] [&_[data-slot=sidebar-item-icon]]:!text-[#80000f] group-hover/sidebar-item:[&_[data-slot=sidebar-item-icon]]:!text-[#80000f]'
                    }`}
                  >
                    {item.name}
                  </SidebarItem>
                );
              })}
            </SidebarSection>

            {/* Section 2: Data Sasaran & Pelayanan */}
            <SidebarSection label="Data Sasaran Posyandu">
              {filteredDataNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarItem
                    key={item.href}
                    icon={item.icon}
                    href={item.href}
                    active={isActive}
                    className={`transition-all text-xs font-semibold rounded-xl ${
                      isActive
                        ? '!bg-[#80000f] !text-white font-bold shadow-md shadow-[#80000f]/25 [&_[data-slot=sidebar-item-icon]]:!text-white'
                        : '!text-slate-600 hover:!bg-[#fff5f6] hover:!text-[#80000f] [&_[data-slot=sidebar-item-icon]]:!text-[#80000f] group-hover/sidebar-item:[&_[data-slot=sidebar-item-icon]]:!text-[#80000f]'
                    }`}
                  >
                    {item.name}
                  </SidebarItem>
                );
              })}
            </SidebarSection>

            {/* Section 3: Kelola Landing Page (Khusus Kader, disembunyikan untuk Bidan) */}
            {activeRole === 'kader' && (
              <SidebarSection label="Kelola Landing Page">
                {landingNav.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href === '/kelola-galeri' && pathname === '/kelola-landing');
                  return (
                    <SidebarItem
                      key={item.href}
                      icon={item.icon}
                      href={item.href}
                      active={isActive}
                      className={`transition-all text-xs font-semibold rounded-xl ${
                        isActive
                          ? '!bg-[#80000f] !text-white font-bold shadow-md shadow-[#80000f]/25 [&_[data-slot=sidebar-item-icon]]:!text-white'
                          : '!text-slate-600 hover:!bg-[#fff5f6] hover:!text-[#80000f] [&_[data-slot=sidebar-item-icon]]:!text-[#80000f] group-hover/sidebar-item:[&_[data-slot=sidebar-item-icon]]:!text-[#80000f]'
                      }`}
                    >
                      {item.name}
                    </SidebarItem>
                  );
                })}
              </SidebarSection>
            )}
          </SidebarNav>

          {/* Profile & Logout Footer */}
          <SidebarFooter className={`border-t border-[#fce1e4] bg-white ${collapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-3 space-y-2.5'}`}>
            {collapsed ? (
              <div className="flex flex-col items-center gap-2 w-full">
                <div
                  className="h-8 w-8 rounded-xl bg-[#80000f] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm shadow-[#80000f]/25"
                  title={activeRole === 'bidan' ? 'Bdn. Ratna (Bidan Desa)' : 'Kader Posyandu RW 03'}
                >
                  {activeRole === 'bidan' ? '👩‍⚕️' : '🧕'}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-[#80000f] hover:text-white bg-white hover:bg-[#80000f] transition-all border border-[#fce1e4] hover:border-[#80000f] shadow-2xs group cursor-pointer shrink-0"
                  title="Keluar / Logout dari Dashboard"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-full flex items-center justify-between overflow-hidden">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="h-8 w-8 rounded-xl bg-[#80000f] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm shadow-[#80000f]/25">
                      {activeRole === 'bidan' ? '👩‍⚕️' : '🧕'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {activeRole === 'bidan' ? 'Bdn. Ratna (Bidan Desa)' : 'Kader Posyandu RW 03'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium truncate">
                        {activeRole === 'bidan' ? 'Supervisi & Penanggung Jawab' : 'Pelaksana Meja 1–4'}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-[#80000f] hover:text-white bg-white hover:bg-[#80000f] transition-all border border-[#fce1e4] hover:border-[#80000f] shadow-2xs group cursor-pointer"
                  title="Keluar / Logout dari Dashboard"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                  <span>Keluar / Logout</span>
                </button>
              </>
            )}
          </SidebarFooter>
        </BaseSidebar>
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE RESPONSIVE DRAWER SIDEBAR (Toggled via Hamburger in Header)     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Slide-out Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-[280px] max-w-[85vw] h-full bg-white shadow-2xl flex flex-col z-10 border-r border-[#fce1e4]"
            >
              {/* Mobile Header with Close Button */}
              <div className="p-4 border-b border-[#fce1e4] flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#fff0f2] border border-[#fce1e4] flex items-center justify-center p-1.5 shadow-xs">
                    <img
                      src="/images/logo-posyandu.png"
                      alt="Logo Posyandu"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-xs text-slate-900 uppercase">
                      POSYANDU <span className="text-[#80000f]">MELATI</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold">RW 03 Sukamaju</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-[#80000f] hover:bg-[#fff0f2] transition-colors cursor-pointer"
                  aria-label="Tutup menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Navigation */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {/* Section 1 */}
                <div>
                  <p className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Menu Pelayanan
                  </p>
                  <div className="space-y-1 mt-1">
                    {filteredMainNav.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-[#80000f] text-white font-bold shadow-md shadow-[#80000f]/25'
                              : 'text-slate-700 hover:bg-[#fff5f6] hover:text-[#80000f]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={isActive ? 'text-white' : 'text-[#80000f]'}>
                              {item.icon}
                            </span>
                            <span>{item.name}</span>
                          </div>
                          {item.badge}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2 */}
                <div>
                  <p className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Data Sasaran Posyandu
                  </p>
                  <div className="space-y-1 mt-1">
                    {filteredDataNav.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-[#80000f] text-white font-bold shadow-md shadow-[#80000f]/25'
                              : 'text-slate-700 hover:bg-[#fff5f6] hover:text-[#80000f]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={isActive ? 'text-white' : 'text-[#80000f]'}>
                              {item.icon}
                            </span>
                            <span>{item.name}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3 (Khusus Kader, disembunyikan untuk Bidan) */}
                {activeRole === 'kader' && (
                  <div>
                    <p className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Kelola Landing Page
                    </p>
                    <div className="space-y-1 mt-1">
                      {landingNav.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          (item.href === '/kelola-galeri' && pathname === '/kelola-landing');
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${
                              isActive
                                ? 'bg-[#80000f] text-white font-bold shadow-md shadow-[#80000f]/25'
                                : 'text-slate-700 hover:bg-[#fff5f6] hover:text-[#80000f]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={isActive ? 'text-white' : 'text-[#80000f]'}>
                                {item.icon}
                              </span>
                              <span>{item.name}</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Footer */}
              <div className="p-4 border-t border-[#fce1e4] bg-[#fffafb] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#80000f] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {activeRole === 'bidan' ? '👩‍⚕️' : '🧕'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {activeRole === 'bidan' ? 'Bdn. Ratna (Bidan Desa)' : 'Kader Posyandu Melati'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {activeRole === 'bidan' ? 'Supervisi Medis RW 03' : 'Pelaksana Meja 1–4'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-[#80000f] hover:text-white bg-white hover:bg-[#80000f] transition-all border border-[#fce1e4] hover:border-[#80000f] shadow-2xs cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar / Logout</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
