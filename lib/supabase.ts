import { createClient } from '@supabase/supabase-js';
import { Balita, PemeriksaanBalita, IbuHamil, IbuMenyusui, Lansia, PemeriksaanLansia, MenuMBG } from '@/types/posyandu';
import {
  INITIAL_BALITA,
  INITIAL_PEMERIKSAAN,
  INITIAL_BUMIL,
  INITIAL_BUSUI,
  INITIAL_LANSIA,
  INITIAL_PEMERIKSAAN_LANSIA,
  INITIAL_MENU_MBG,
} from './mock-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const STORAGE_KEYS = {
  BALITA: 'posyandu_melati_balita_v3',
  PEMERIKSAAN: 'posyandu_melati_pemeriksaan_v3',
  BUMIL: 'posyandu_melati_bumil_v3',
  BUSUI: 'posyandu_melati_busui_v3',
  LANSIA: 'posyandu_melati_lansia_v3',
  PEMERIKSAAN_LANSIA: 'posyandu_melati_pem_lansia_v3',
  MENU_MBG: 'posyandu_melati_menu_mbg_v3',
};

export class PosyanduStore {
  // --- BALITA ---
  static getBalita(): Balita[] {
    if (typeof window === 'undefined') return INITIAL_BALITA;
    const stored = localStorage.getItem(STORAGE_KEYS.BALITA);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.BALITA, JSON.stringify(INITIAL_BALITA));
      return INITIAL_BALITA;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_BALITA;
    }
  }

  static saveBalita(list: Balita[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.BALITA, JSON.stringify(list));
  }

  static addBalita(item: Balita): void {
    const list = this.getBalita();
    list.unshift(item);
    this.saveBalita(list);
  }

  static updateBalita(updated: Balita): void {
    const list = this.getBalita().map((b) => (b.id === updated.id ? updated : b));
    this.saveBalita(list);
  }

  static deleteBalita(id: string): void {
    const list = this.getBalita().filter((b) => b.id !== id);
    this.saveBalita(list);
  }

  // --- PEMERIKSAAN BALITA ---
  static getPemeriksaan(): PemeriksaanBalita[] {
    if (typeof window === 'undefined') return INITIAL_PEMERIKSAAN;
    const stored = localStorage.getItem(STORAGE_KEYS.PEMERIKSAAN);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.PEMERIKSAAN, JSON.stringify(INITIAL_PEMERIKSAAN));
      return INITIAL_PEMERIKSAAN;
    }
    try {
      const parsed: PemeriksaanBalita[] = JSON.parse(stored);
      return parsed.map((p) => {
        if (p.tanggalPeriksa && p.tanggalPeriksa.startsWith('2024-09')) {
          return { ...p, tanggalPeriksa: p.tanggalPeriksa.replace('2024-09', '2026-10') };
        }
        return p;
      });
    } catch {
      return INITIAL_PEMERIKSAAN;
    }
  }

  static savePemeriksaan(list: PemeriksaanBalita[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PEMERIKSAAN, JSON.stringify(list));
  }

  static addPemeriksaan(item: PemeriksaanBalita): void {
    const list = this.getPemeriksaan();
    list.unshift(item);
    this.savePemeriksaan(list);
  }

  // --- IBU HAMIL ---
  static getBumil(): IbuHamil[] {
    if (typeof window === 'undefined') return INITIAL_BUMIL;
    const stored = localStorage.getItem(STORAGE_KEYS.BUMIL);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.BUMIL, JSON.stringify(INITIAL_BUMIL));
      return INITIAL_BUMIL;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_BUMIL;
    }
  }

  static saveBumil(list: IbuHamil[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.BUMIL, JSON.stringify(list));
  }

  static addBumil(item: IbuHamil): void {
    const list = this.getBumil();
    list.unshift(item);
    this.saveBumil(list);
  }

  static updateBumil(updated: IbuHamil): void {
    const list = this.getBumil().map((b) => (b.id === updated.id ? updated : b));
    this.saveBumil(list);
  }

  static deleteBumil(id: string): void {
    const list = this.getBumil().filter((b) => b.id !== id);
    this.saveBumil(list);
  }

  // --- IBU MENYUSUI (BUSUI) ---
  static getBusui(): IbuMenyusui[] {
    if (typeof window === 'undefined') return INITIAL_BUSUI;
    const stored = localStorage.getItem(STORAGE_KEYS.BUSUI);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.BUSUI, JSON.stringify(INITIAL_BUSUI));
      return INITIAL_BUSUI;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_BUSUI;
    }
  }

  static saveBusui(list: IbuMenyusui[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.BUSUI, JSON.stringify(list));
  }

  static addBusui(item: IbuMenyusui): void {
    const list = this.getBusui();
    list.unshift(item);
    this.saveBusui(list);
  }

  static updateBusui(updated: IbuMenyusui): void {
    const list = this.getBusui().map((b) => (b.id === updated.id ? updated : b));
    this.saveBusui(list);
  }

  static deleteBusui(id: string): void {
    const list = this.getBusui().filter((b) => b.id !== id);
    this.saveBusui(list);
  }

  // --- LANSIA ---
  static getLansia(): Lansia[] {
    if (typeof window === 'undefined') return INITIAL_LANSIA;
    const stored = localStorage.getItem(STORAGE_KEYS.LANSIA);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.LANSIA, JSON.stringify(INITIAL_LANSIA));
      return INITIAL_LANSIA;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_LANSIA;
    }
  }

  static saveLansia(list: Lansia[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.LANSIA, JSON.stringify(list));
  }

  static addLansia(item: Lansia): void {
    const list = this.getLansia();
    list.unshift(item);
    this.saveLansia(list);
  }

  static updateLansia(updated: Lansia): void {
    const list = this.getLansia().map((l) => (l.id === updated.id ? updated : l));
    this.saveLansia(list);
  }

  static deleteLansia(id: string): void {
    const list = this.getLansia().filter((l) => l.id !== id);
    this.saveLansia(list);
  }

  // --- PEMERIKSAAN LANSIA ---
  static getPemeriksaanLansia(): PemeriksaanLansia[] {
    if (typeof window === 'undefined') return INITIAL_PEMERIKSAAN_LANSIA;
    const stored = localStorage.getItem(STORAGE_KEYS.PEMERIKSAAN_LANSIA);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.PEMERIKSAAN_LANSIA, JSON.stringify(INITIAL_PEMERIKSAAN_LANSIA));
      return INITIAL_PEMERIKSAAN_LANSIA;
    }
    try {
      const parsed: PemeriksaanLansia[] = JSON.parse(stored);
      return parsed.map((p) => {
        if (p.tanggalPeriksa && p.tanggalPeriksa.startsWith('2024-09')) {
          return { ...p, tanggalPeriksa: p.tanggalPeriksa.replace('2024-09', '2026-10') };
        }
        return p;
      });
    } catch {
      return INITIAL_PEMERIKSAAN_LANSIA;
    }
  }

  static savePemeriksaanLansia(list: PemeriksaanLansia[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PEMERIKSAAN_LANSIA, JSON.stringify(list));
  }

  static addPemeriksaanLansia(item: PemeriksaanLansia): void {
    const list = this.getPemeriksaanLansia();
    list.unshift(item);
    this.savePemeriksaanLansia(list);
  }

  // --- MENU MBG ---
  static getMenuMBG(): MenuMBG[] {
    if (typeof window === 'undefined') return INITIAL_MENU_MBG;
    const stored = localStorage.getItem(STORAGE_KEYS.MENU_MBG);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.MENU_MBG, JSON.stringify(INITIAL_MENU_MBG));
      return INITIAL_MENU_MBG;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_MENU_MBG;
    }
  }
}
