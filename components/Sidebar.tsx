'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  KeyRound,
  LogOut,
  X,
  ChevronRight,
  ChevronUp,
  Building2,
  Users,
  ShieldCheck,
  ClipboardCheck,
} from 'lucide-react';
import { toast } from '@/components/ui/custom-toast';
import { PosyanduStore } from '@/lib/supabase';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const isSuperPath = Boolean(pathname?.startsWith('/super-admin'));

  // SSR-safe deterministic initial states to prevent any React hydration mismatch
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(isSuperPath);
  const [tenantName, setTenantName] = useState<string>(isSuperPath ? 'Puskesmas Pembina' : 'Posyandu Melati');

  // Profile & Popover State
  const [profileName, setProfileName] = useState<string>(
    isSuperPath ? 'Dr. Hendra Gunawan, M.Kes' : 'Admin Posyandu'
  );
  const [profileJabatan, setProfileJabatan] = useState<string>(
    isSuperPath ? 'SaaS Super Admin • Puskesmas Pembina' : 'Admin Pengelola Posyandu'
  );
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const desktopFooterRef = useRef<HTMLDivElement>(null);

  // Synchronize user profile & tenant data strictly in useEffect (after hydration)
  useEffect(() => {
    setMounted(true);

    const savedCollapsed = localStorage.getItem('posyandu_sidebar_collapsed');
    if (savedCollapsed !== null) {
      setCollapsed(savedCollapsed === 'true');
    }

    const syncProfile = () => {
      let authUser: any = null;
      try {
        authUser = JSON.parse(localStorage.getItem('posyandu_auth_user') || '{}');
      } catch {}

      const isPathSuper = Boolean(pathname?.startsWith('/super-admin'));
      const isUserSuper = authUser?.role === 'super_admin';
      const isSuper = isPathSuper || isUserSuper;
      setIsSuperAdmin(isSuper);

      // Sinkronisasi cookie otentikasi jika belum tersimpan di browser
      if (typeof document !== 'undefined' && authUser?.role) {
        if (!document.cookie.includes('posyandu_auth_role=')) {
          document.cookie = `posyandu_auth_role=${authUser.role}; path=/; max-age=86400; SameSite=Lax`;
          if (authUser.email) {
            document.cookie = `posyandu_auth_email=${encodeURIComponent(authUser.email)}; path=/; max-age=86400; SameSite=Lax`;
          }
        }
      }

      const posyanduVal =
        authUser?.posyanduNama ||
        authUser?.posyandu ||
        (isSuper ? 'Puskesmas Pembina' : 'Posyandu Melati');
      setTenantName(posyanduVal);

      const nameVal =
        authUser?.nama || (isSuper ? 'Dr. Hendra Gunawan, M.Kes' : 'Admin Posyandu');
      const jabatanVal =
        authUser?.jabatan ||
        (isSuper ? 'SaaS Super Admin • Puskesmas Pembina' : `Admin Pengelola ${posyanduVal}`);
      setProfileName(nameVal);
      setProfileJabatan(jabatanVal);
    };

    syncProfile();

    const handleClickOutside = (e: MouseEvent) => {
      if (
        desktopFooterRef.current &&
        !desktopFooterRef.current.contains(e.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('posyandu_profile_updated', syncProfile);
    window.addEventListener('storage', syncProfile);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('posyandu_profile_updated', syncProfile);
      window.removeEventListener('storage', syncProfile);
    };
  }, [pathname]);

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
      description: 'Apakah Anda yakin ingin keluar dari sistem Posyandu?',
      confirmText: 'Ya, Keluar',
      cancelText: 'Batal',
      type: 'danger',
      onConfirm: () => {
        localStorage.removeItem('posyandu_auth_user');
        localStorage.removeItem('posyandu_active_role');
        // Bersihkan session cookie Next.js middleware
        document.cookie = 'posyandu_auth_role=; path=/; max-age=0';
        document.cookie = 'posyandu_auth_email=; path=/; max-age=0';
        document.cookie = 'posyandu_auth_tenant=; path=/; max-age=0';

        toast.success('Berhasil Logout', 'Sesi kerja Anda telah diakhiri.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 400);
      },
    });
  };

  const [pendingCount, setPendingCount] = useState<number>(0);
  const [activeTenantCount, setActiveTenantCount] = useState<number>(0);

  useEffect(() => {
    const updateStats = () => {
      try {
        const regs = PosyanduStore.getRegistrations();
        const pending = regs.filter((r) => r.status === 'pending').length;
        setPendingCount(pending);
        const tenants = PosyanduStore.getPosyanduList();
        setActiveTenantCount(tenants.length);
      } catch {}
    };

    updateStats();
    window.addEventListener('storage', updateStats);
    window.addEventListener('posyandu_registrations_updated', updateStats);
    window.addEventListener('posyandu_tenants_updated', updateStats);
    window.addEventListener('posyandu_list_updated', updateStats);

    return () => {
      window.removeEventListener('storage', updateStats);
      window.removeEventListener('posyandu_registrations_updated', updateStats);
      window.removeEventListener('posyandu_tenants_updated', updateStats);
      window.removeEventListener('posyandu_list_updated', updateStats);
    };
  }, []);

  const isItemActive = (href: string) => {
    return pathname === href;
  };

  const superAdminNav = [
    {
      name: 'Dashboard Supervisi',
      href: '/super-admin/dashboard',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      badge: null,
    },
    {
      name: 'Master Unit Posyandu',
      href: '/super-admin/posyandu',
      icon: <Building2 className="w-4 h-4 shrink-0" />,
      badge:
        pendingCount > 0 ? (
          <span className="px-1.5 py-0.5 rounded-full bg-[#80000f] text-white text-[9.5px] font-black uppercase shadow-xs animate-pulse">
            {pendingCount} ACC Baru
          </span>
        ) : (
          <span className="px-1.5 py-0.5 rounded-full bg-[#fff0f2] text-[#80000f] text-[9.5px] font-black uppercase border border-[#fce1e4]">
            {activeTenantCount} Unit
          </span>
        ),
    },
    {
      name: 'Audit Rekapitulasi Wilayah',
      href: '/super-admin/rekapitulasi',
      icon: <LineChart className="w-4 h-4 shrink-0" />,
      badge: (
        <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9.5px] font-black uppercase border border-emerald-200">
          Semua
        </span>
      ),
    },
    {
      name: 'Kelola Landing Page',
      href: '/super-admin/kelola-landing',
      icon: <PanelsTopLeft className="w-4 h-4 shrink-0" />,
      badge: null,
    },
  ];

  const adminPosyanduMainNav = [
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

  const adminPosyanduDataNav = [
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
      name: 'Laporan Posyandu',
      href: '/laporan',
      icon: <FileSpreadsheet className="w-4 h-4 shrink-0" />,
    },
  ];

  const accountNav = [
    {
      name: 'Pengaturan Akun',
      href: '/pengaturan-akun',
      icon: <KeyRound className="w-4 h-4 shrink-0" />,
    },
  ];

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
          {/* Header Brand */}
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
                  title={isSuperAdmin ? 'Puskesmas Pembina (Super Admin)' : tenantName}
                >
                  <div
                    className="relative w-8 h-8 rounded-xl bg-[#fff0f2] border-[#fce1e4] border flex items-center justify-center p-1 shrink-0 shadow-2xs"
                  >
                    {isSuperAdmin ? (
                      <span className="text-sm">👑</span>
                    ) : (
                      <img
                        src="/images/logo-posyandugo-maroon.png"
                        alt="Logo Posyandu"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="font-serif font-black text-xs tracking-wider text-slate-900 uppercase truncate">
                      {isSuperAdmin ? (
                        <>
                          PUSKESMAS <span className="text-[#80000f]">PEMBINA</span>
                        </>
                      ) : (
                        <span>{tenantName.toUpperCase()}</span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold truncate">
                      {isSuperAdmin ? '👑 SaaS Super Admin' : 'Admin Posyandu Terpadu'}
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
            {isSuperAdmin ? (
              <SidebarSection label="Portal Super Admin">
                {superAdminNav.map((item) => {
                  const isActive = isItemActive(item.href);
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
                          : '!text-slate-600 hover:!bg-[#fff5f6] hover:!text-[#80000f] [&_[data-slot=sidebar-item-icon]]:!text-[#80000f]'
                      }`}
                    >
                      {item.name}
                    </SidebarItem>
                  );
                })}
              </SidebarSection>
            ) : (
              <>
                {/* Section 1: Menu Utama Posyandu */}
                <SidebarSection label="Menu Pelayanan">
                  {adminPosyanduMainNav.map((item) => {
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
                            : '!text-slate-600 hover:!bg-[#fff5f6] hover:!text-[#80000f] [&_[data-slot=sidebar-item-icon]]:!text-[#80000f]'
                        }`}
                      >
                        {item.name}
                      </SidebarItem>
                    );
                  })}
                </SidebarSection>

                {/* Section 2: Data Sasaran & Pelayanan Posyandu */}
                <SidebarSection label="Data Sasaran Posyandu">
                  {adminPosyanduDataNav.map((item) => {
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
                            : '!text-slate-600 hover:!bg-[#fff5f6] hover:!text-[#80000f] [&_[data-slot=sidebar-item-icon]]:!text-[#80000f]'
                        }`}
                      >
                        {item.name}
                      </SidebarItem>
                    );
                  })}
                </SidebarSection>
              </>
            )}

            {/* Section Pengaturan Akun */}
            <SidebarSection label="Pengaturan Akun">
              {accountNav.map((item) => {
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
                        : '!text-slate-600 hover:!bg-[#fff5f6] hover:!text-[#80000f] [&_[data-slot=sidebar-item-icon]]:!text-[#80000f]'
                    }`}
                  >
                    {item.name}
                  </SidebarItem>
                );
              })}
            </SidebarSection>
          </SidebarNav>

          {/* Profile & Logout Footer */}
          <SidebarFooter ref={desktopFooterRef} className="border-t border-[#fce1e4] bg-white p-2 relative">
            {collapsed ? (
              <div className="flex flex-col items-center gap-2 w-full relative">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="h-9 w-9 rounded-xl bg-[#80000f] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                  title="Klik untuk membuka menu akun & logout"
                >
                  {isSuperAdmin ? '👑' : '🏥'}
                </button>

                {/* Flyout Popover untuk Collapsed Sidebar */}
                {showProfileMenu && (
                  <div className="absolute left-[calc(100%+12px)] bottom-0 w-52 bg-white rounded-2xl border border-[#fce1e4] shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 space-y-1">
                    <div className="px-2.5 py-1.5 border-b border-[#fce1e4]/70 mb-1">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#80000f]">
                        {isSuperAdmin ? 'Super Admin Puskesmas' : 'Admin Posyandu'}
                      </p>
                      <p className="text-xs font-bold text-slate-900 truncate">{profileName}</p>
                      <p className="text-[10px] text-slate-500 truncate">{profileJabatan}</p>
                    </div>

                    <Link
                      href="/pengaturan-akun"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 w-full px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#fff5f6] hover:text-[#80000f] transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#80000f]" />
                      <span>Pengaturan Akun</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2 w-full px-2.5 py-2 rounded-xl text-xs font-bold text-[#80000f] hover:bg-[#80000f] hover:text-white transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar / Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-full">
                {/* Popover Menu saat Profil Diklik */}
                {showProfileMenu && (
                  <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl border border-[#fce1e4] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                    <div className="px-3 py-2 border-b border-[#fce1e4]/70 mb-1">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#80000f]">
                        {isSuperAdmin ? '👑 Super Admin Puskesmas' : '🏥 Admin Posyandu'}
                      </p>
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {profileName}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {profileJabatan}
                      </p>
                    </div>

                    <Link
                      href="/pengaturan-akun"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#fff5f6] hover:text-[#80000f] transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#80000f]" />
                      <span>Pengaturan Akun</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-bold text-[#80000f] hover:bg-[#80000f] hover:text-white transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar / Logout</span>
                    </button>
                  </div>
                )}

                {/* Tombol Profil Interaktif yang Dapat Diklik */}
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#fff5f6] transition-colors cursor-pointer text-left group"
                  title="Klik untuk membuka menu profil & logout"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div
                      className="h-8 w-8 rounded-xl bg-[#80000f] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm"
                    >
                      {isSuperAdmin ? '👑' : '🏥'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 truncate group-hover:text-[#80000f] transition-colors">
                        {profileName}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium truncate">
                        {profileJabatan}
                      </p>
                    </div>
                  </div>
                  <ChevronUp
                    className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#80000f] transition-transform ${
                      showProfileMenu ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
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
                  <div
                    className="w-9 h-9 rounded-xl bg-[#fff0f2] border-[#fce1e4] border flex items-center justify-center p-1.5 shadow-xs"
                  >
                    {isSuperAdmin ? (
                      <span className="text-sm">👑</span>
                    ) : (
                      <img
                        src="/images/logo-posyandugo-maroon.png"
                        alt="Logo Posyandu"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-xs text-slate-900 uppercase">
                      {isSuperAdmin ? (
                        <>
                          PUSKESMAS <span className="text-[#80000f]">PEMBINA</span>
                        </>
                      ) : (
                        tenantName.toUpperCase()
                      )}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      {isSuperAdmin ? '👑 SaaS Super Admin' : 'Admin Posyandu Terpadu'}
                    </p>
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
                {isSuperAdmin ? (
                  <div>
                    <p className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#80000f]">
                      Portal Super Admin
                    </p>
                    <div className="space-y-1 mt-1">
                      {superAdminNav.map((item) => {
                        const isActive = isItemActive(item.href);
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
                ) : (
                  <>
                    {/* Section 1 */}
                    <div>
                      <p className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Menu Pelayanan
                      </p>
                      <div className="space-y-1 mt-1">
                        {adminPosyanduMainNav.map((item) => {
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
                        {adminPosyanduDataNav.map((item) => {
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
                  </>
                )}

                {/* Section Pengaturan Akun */}
                <div>
                  <p className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Pengaturan Akun
                  </p>
                  <div className="space-y-1 mt-1">
                    {accountNav.map((item) => {
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
              </div>

              {/* Mobile Footer */}
              <div className="p-4 border-t border-[#fce1e4] bg-[#fffafb] space-y-3">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl bg-[#80000f] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs"
                    >
                      {isSuperAdmin ? '👑' : '🏥'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{profileName}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{profileJabatan}</p>
                    </div>
                  </div>
                  <ChevronUp
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      showProfileMenu ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showProfileMenu && (
                  <div className="space-y-1.5 pt-1 animate-in fade-in">
                    <Link
                      href="/pengaturan-akun"
                      onClick={() => setMobileOpen(false)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-[#fce1e4] shadow-2xs"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#80000f]" />
                      <span>Pengaturan Akun</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-[#80000f] hover:text-white bg-white hover:bg-[#80000f] transition-all border border-[#fce1e4] hover:border-[#80000f] shadow-2xs cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar / Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
