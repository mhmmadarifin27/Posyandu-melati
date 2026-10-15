'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Baby,
  HeartPulse,
  Activity,
  X,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { UserRole, Balita, IbuHamil, Lansia } from '@/types/posyandu';
import { PosyanduStore } from '@/lib/supabase';

interface HeaderProps {
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onOpenWeighing?: () => void;
  urgentCount?: number;
}

export default function Header({
}: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [balitaList, setBalitaList] = useState<Balita[]>([]);
  const [bumilList, setBumilList] = useState<IbuHamil[]>([]);
  const [lansiaList, setLansiaList] = useState<Lansia[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load data for interactive search
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBalitaList(PosyanduStore.getBalita());
      setBumilList(PosyanduStore.getBumil());
      setLansiaList(PosyanduStore.getLansia());
    }
  }, []);

  // Listen to outside click to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const cleanQuery = searchQuery.trim().toLowerCase();

  const filteredBalita = cleanQuery
    ? balitaList.filter(
        (b) =>
          b.nama.toLowerCase().includes(cleanQuery) ||
          b.nik.includes(cleanQuery) ||
          b.namaIbu.toLowerCase().includes(cleanQuery)
      )
    : [];

  const filteredBumil = cleanQuery
    ? bumilList.filter(
        (b) =>
          b.nama.toLowerCase().includes(cleanQuery) ||
          b.nik.includes(cleanQuery) ||
          b.namaSuami.toLowerCase().includes(cleanQuery)
      )
    : [];

  const filteredLansia = cleanQuery
    ? lansiaList.filter(
        (l) =>
          l.nama.toLowerCase().includes(cleanQuery) ||
          l.nik.includes(cleanQuery)
      )
    : [];

  const totalResults =
    filteredBalita.length + filteredBumil.length + filteredLansia.length;

  const handleSelectResult = (href: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    router.push(href);
  };

  return (
    <header className="h-[76px] sm:h-[88px] shrink-0 bg-white/95 border-b border-[#fce1e4] px-4 sm:px-8 flex items-center justify-between lg:justify-end sticky top-0 z-30 backdrop-blur-md">
      {/* Mobile Hamburger Menu Toggle (Visible on screens < lg) */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('posyandu_toggle_mobile_sidebar'))}
          className="p-2 rounded-xl text-[#80000f] hover:bg-[#fff0f2] active:scale-95 transition-all border border-[#fce1e4] cursor-pointer shadow-2xs"
          title="Buka Menu Navigasi"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <img
            src="/images/logo-posyandu.png"
            alt="Logo Posyandu"
            className="w-7 h-7 object-contain"
          />
          <span className="font-serif font-black text-xs text-slate-900 tracking-wider hidden sm:inline-block">
            POSYANDU <span className="text-[#80000f]">MELATI</span>
          </span>
        </div>
      </div>

      {/* Interactive Real-Time Search Bar */}
      <div ref={searchContainerRef} className="relative w-48 sm:w-72 md:w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#80000f] absolute left-3.5 top-3 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Cari sasaran, NIK..."
            className="w-full pl-9 sm:pl-10 pr-10 sm:pr-20 py-2 sm:py-2.5 bg-[#fff5f6]/50 hover:bg-[#fff5f6]/80 focus:bg-white rounded-full border border-[#fce1e4] text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] transition-all shadow-2xs"
          />
          <div className="absolute right-3 top-2 flex items-center gap-1.5">
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
                className="w-5 h-5 rounded-full hover:bg-[#fce1e4] text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#fce1e4] text-[10px] font-mono text-[#80000f] font-bold border border-[#f8c8c8]">
              Ctrl+K
            </span>
          </div>
        </div>

        {/* Live Search Results Dropdown Overlay (Anchored to Right Edge) */}
        {isSearchOpen && cleanQuery.length > 0 && (
          <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-[480px] bg-white border-2 border-[#fce1e4] rounded-3xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[480px] overflow-y-auto">
            <div className="px-3 py-2 flex items-center justify-between border-b border-[#fce1e4] text-[11px] font-bold text-slate-500">
              <span>Hasil Pencarian: &ldquo;{searchQuery}&rdquo;</span>
              <span className="px-2 py-0.5 rounded-full bg-[#fce1e4] text-[#80000f] text-[10px] font-bold">
                {totalResults} Ditemukan
              </span>
            </div>

            {totalResults === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <Search className="w-8 h-8 text-[#fce1e4] mx-auto mb-2" />
                <p className="font-semibold text-slate-600">Tidak ada sasaran yang cocok</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Coba ketik nama balita, ibu hamil, lansia, atau NIK lainnya.
                </p>
              </div>
            ) : (
              <div className="py-2 space-y-3">
                {/* 1. Hasil Balita */}
                {filteredBalita.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-[#80000f] flex items-center gap-1.5">
                      <Baby className="w-3.5 h-3.5" />
                      <span>Balita &amp; Anak ({filteredBalita.length})</span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {filteredBalita.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => handleSelectResult(`/e-kms?balitaId=${b.id}`)}
                          className="w-full text-left p-2.5 rounded-2xl hover:bg-[#fff5f6] flex items-center justify-between transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#fce1e4] text-[#80000f] flex items-center justify-center font-bold text-xs shrink-0">
                              👶
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs group-hover:text-[#80000f] transition-colors">
                                {b.nama}
                              </div>
                              <div className="text-[10.5px] text-slate-500">
                                {b.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} &bull; Ibu: {b.namaIbu} &bull; NIK: {b.nik}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[10.5px] font-bold text-[#80000f]">
                            <span>Buka E-KMS</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Hasil Ibu Hamil */}
                {filteredBumil.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-[#80000f] flex items-center gap-1.5 border-t border-[#fce1e4] pt-2">
                      <HeartPulse className="w-3.5 h-3.5" />
                      <span>Ibu Hamil &amp; Bersalin ({filteredBumil.length})</span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {filteredBumil.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => handleSelectResult('/bumil')}
                          className="w-full text-left p-2.5 rounded-2xl hover:bg-[#fff5f6] flex items-center justify-between transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#fce1e4] text-[#80000f] flex items-center justify-center font-bold text-xs shrink-0">
                              🤰
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs group-hover:text-[#80000f] transition-colors">
                                {b.nama}
                              </div>
                              <div className="text-[10.5px] text-slate-500">
                                Usia Kehamilan: {b.usiaKehamilanMinggu} mgg &bull; Suami: {b.namaSuami} &bull; LiLA: {b.lilaSaatIni} cm
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[10.5px] font-bold text-[#80000f]">
                            <span>Lihat KIA</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Hasil Lansia */}
                {filteredLansia.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-[#80000f] flex items-center gap-1.5 border-t border-[#fce1e4] pt-2">
                      <Activity className="w-3.5 h-3.5" />
                      <span>Posyandu Lansia ({filteredLansia.length})</span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {filteredLansia.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => handleSelectResult('/lansia')}
                          className="w-full text-left p-2.5 rounded-2xl hover:bg-[#fff5f6] flex items-center justify-between transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#fce1e4] text-[#80000f] flex items-center justify-center font-bold text-xs shrink-0">
                              👵
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs group-hover:text-[#80000f] transition-colors">
                                {l.nama}
                              </div>
                              <div className="text-[10.5px] text-slate-500">
                                Usia: {l.usiaTahun} tahun &bull; {l.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} &bull; NIK: {l.nik}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[10.5px] font-bold text-[#80000f]">
                            <span>Buka Lansia</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
