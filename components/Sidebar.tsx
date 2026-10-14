'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Synchronize collapsed state with localStorage for persistent preference
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('posyandu_sidebar_collapsed');
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }
  }, []);

  const handleCollapsedChange = (nextCollapsed: boolean) => {
    setCollapsed(nextCollapsed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('posyandu_sidebar_collapsed', String(nextCollapsed));
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      if (window.confirm('Apakah Anda yakin ingin keluar / logout dari sistem Posyandu Melati?')) {
        window.location.href = '/';
      }
    }
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

  return (
    <div
      className={`sticky top-0 h-screen shrink-0 z-40 select-none ${className}`}
      style={
        {
          // Maroon 80000f theme tokens
          '--background': '#ffffff',
          '--foreground': '#0f172a',
          '--muted-foreground': '#80000f',
          '--primitive-text-secondary': '#64748b',
          '--border': '#fce1e4',
          '--primitive-surface-selected': 'transparent',
          '--primitive-surface-hover': '#fff5f6',
          '--primitive-radius-item': '0.75rem',
        } as React.CSSProperties
      }
    >
      <BaseSidebar
        variant="collapsible"
        collapsed={collapsed}
        onCollapsedChange={handleCollapsedChange}
        width={260}
        collapsedWidth={68}
        aria-label="Posyandu Melati Navigation"
        className="h-full bg-white text-slate-800 border-r border-[#fce1e4] shadow-sm flex flex-col justify-between"
      >
        {/* ========================================================================= */}
        {/* HEADER BRAND & COLLAPSE TOGGLE (Spaced nicely from top)                   */}
        {/* ========================================================================= */}
        <SidebarHeader className="h-[88px] shrink-0 border-b border-[#fce1e4] pt-6 pb-3 px-4 flex items-center justify-between bg-white">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 overflow-hidden group cursor-pointer"
            title="Posyandu Melati Dashboard"
          >
            <img
              src="/images/logo-posyandu.png"
              alt="Logo Posyandu Melati"
              className="h-10 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
            />
            {!collapsed && (
              <div className="overflow-hidden">
                <h2 className="font-serif font-bold text-sm text-slate-900 tracking-wide leading-none">
                  POSYANDU <span className="text-[#80000f]">MELATI</span>
                </h2>
                <p className="text-[9.5px] font-sans uppercase tracking-widest text-[#80000f] font-bold mt-1 truncate">
                  RW 03 Sukamaju
                </p>
              </div>
            )}
          </Link>
          <SidebarToggle className="ml-auto text-slate-400 hover:text-[#80000f] hover:bg-[#fff5f6] rounded-lg p-1.5 transition-colors" />
        </SidebarHeader>

        {/* ========================================================================= */}
        {/* NAVIGATION LIST (Scrolls independently within sidebar if height is short) */}
        {/* ========================================================================= */}
        <SidebarNav className="flex-1 py-1">
          {/* Section 1: Menu Utama */}
          <SidebarSection label="Menu Utama">
            {mainNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarItem
                  key={item.href}
                  icon={item.icon}
                  href={item.href}
                  active={isActive}
                  badge={item.badge}
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

          {/* Section 2: Data Sasaran & Layanan */}
          <SidebarSection label="Data Sasaran & Layanan">
            {dataNav.map((item) => {
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

          {/* Section 3: Kelola Landing Page (Grup Terpisah di Bawah Laporan Puskesmas) */}
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
        </SidebarNav>

        {/* ========================================================================= */}
        {/* PROFILE & LOGOUT FOOTER                                                   */}
        {/* ========================================================================= */}
        <SidebarFooter className="border-t border-[#fce1e4] bg-[#fffafb] p-3 space-y-2.5">
          <div className="w-full flex items-center justify-between overflow-hidden">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-xl bg-[#80000f] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm shadow-[#80000f]/25">
                🩺
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-900 truncate">Bidan &amp; Kader</p>
                  <p className="text-[10px] text-slate-500 font-medium truncate">Posyandu Melati RW 03</p>
                </div>
              )}
            </div>
          </div>

          {/* Tombol Logout Resmi */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-[#80000f] hover:text-white bg-white hover:bg-[#80000f] transition-all border border-[#fce1e4] hover:border-[#80000f] shadow-2xs group cursor-pointer"
            title="Keluar / Logout dari Dashboard"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:-translate-x-0.5" />
            {!collapsed && <span>Keluar / Logout</span>}
          </button>
        </SidebarFooter>
      </BaseSidebar>
    </div>
  );
}
