import { createClient } from '@supabase/supabase-js';
import {
  Balita,
  PemeriksaanBalita,
  IbuHamil,
  IbuMenyusui,
  Lansia,
  PemeriksaanLansia,
  MenuMBG,
} from '@/types/posyandu';
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
  SYNC_INITIALIZED: 'posyandu_melati_supabase_synced_v1',
};

// Helper: Memastikan ID berformat UUID yang valid untuk PostgreSQL Supabase
function ensureUuid(id?: string): string {
  if (!id) return crypto.randomUUID();
  // Validasi regex UUID v4
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;
  // Jika string lama seperti b-1 atau b-179..., generate UUID konsisten atau random
  return crypto.randomUUID();
}

// ----------------------------------------------------------------------
// CONVERTERS: JavaScript camelCase <-> Supabase PostgreSQL snake_case
// ----------------------------------------------------------------------

function balitaToDb(b: Balita) {
  return {
    id: ensureUuid(b.id),
    nik: b.nik,
    nama: b.nama,
    jenis_kelamin: b.jenisKelamin,
    tanggal_lahir: b.tanggalLahir,
    nama_ibu: b.namaIbu,
    nama_ayah: b.namaAyah || '-',
    alamat: b.alamat || 'RT 01 / RW 03',
    rt: b.rt || '01',
    rw: b.rw || '03',
    posyandu: b.posyandu || 'Posyandu Melati',
    no_hp: b.noHp || '-',
    desil_ekonomi: b.desilEkonomi || 2,
    status_bansos: Boolean(b.statusBansos),
  };
}

function dbToBalita(r: any): Balita {
  return {
    id: r.id,
    nik: r.nik,
    nama: r.nama,
    jenisKelamin: r.jenis_kelamin,
    tanggalLahir: r.tanggal_lahir,
    namaIbu: r.nama_ibu,
    namaAyah: r.nama_ayah || '-',
    alamat: r.alamat || 'RT 01 / RW 03',
    rt: r.rt || '01',
    rw: r.rw || '03',
    posyandu: r.posyandu || 'Posyandu Melati',
    noHp: r.no_hp || '-',
    desilEkonomi: r.desil_ekonomi || 2,
    statusBansos: Boolean(r.status_bansos),
    createdAt: r.created_at ? r.created_at.split('T')[0] : '2026-01-01',
  };
}

function bumilToDb(b: IbuHamil) {
  return {
    id: ensureUuid(b.id),
    nik: b.nik,
    nama: b.nama,
    tanggal_lahir: b.tanggalLahir || '1996-01-01',
    nama_suami: b.namaSuami || '-',
    alamat: b.alamat || 'RT 01 / RW 03',
    posyandu: b.posyandu || 'Posyandu Melati',
    no_hp: b.noHp || '-',
    hpht: b.hpht || '2024-04-01',
    hpl: b.hpl || '2025-01-08',
    usia_kehamilan_minggu: b.usiaKehamilanMinggu || 0,
    gravida: b.gravida || 1,
    partus: b.partus || 0,
    abortus: b.abortus || 0,
    lila_awal: b.lilaAwal || 23.5,
    lila_saat_ini: b.lilaSaatIni || 23.5,
    hb: b.hb || 11.5,
    status_kek: Boolean(b.statusKEK),
    status_anemia: Boolean(b.statusAnemia),
    desil_ekonomi: b.desilEkonomi || 2,
    buku_kia: Boolean(b.bukuKIA),
    konsumsi_ttd: b.konsumsiTTD || 30,
  };
}

function dbToBumil(r: any): IbuHamil {
  return {
    id: r.id,
    nik: r.nik,
    nama: r.nama,
    tanggalLahir: r.tanggal_lahir,
    namaSuami: r.nama_suami,
    alamat: r.alamat,
    posyandu: r.posyandu,
    noHp: r.no_hp,
    hpht: r.hpht,
    hpl: r.hpl,
    usiaKehamilanMinggu: r.usia_kehamilan_minggu,
    gravida: r.gravida,
    partus: r.partus,
    abortus: r.abortus,
    lilaAwal: Number(r.lila_awal),
    lilaSaatIni: Number(r.lila_saat_ini),
    hb: Number(r.hb),
    statusKEK: Boolean(r.status_kek),
    statusAnemia: Boolean(r.status_anemia),
    desilEkonomi: r.desil_ekonomi,
    bukuKIA: Boolean(r.buku_kia),
    konsumsiTTD: r.konsumsi_ttd,
  };
}

function busuiToDb(b: IbuMenyusui) {
  return {
    id: ensureUuid(b.id),
    nik: b.nik,
    nama: b.nama,
    tanggal_lahir: b.tanggalLahir || '1997-01-01',
    nama_suami: b.namaSuami || '-',
    alamat: b.alamat || 'RT 02 / RW 03',
    posyandu: b.posyandu || 'Posyandu Melati',
    no_hp: b.noHp || '-',
    nama_bayi: b.namaBayi || '-',
    usia_bayi_bulan: b.usiaBayiBulan || 0,
    status_asi_eksklusif: Boolean(b.statusAsiEksklusif),
    lila: b.lila || 23.5,
    status_kek: Boolean(b.statusKEK),
    vitamin_a_nifas: Boolean(b.vitaminANifas),
    konsumsi_ttd: b.konsumsiTTD || 30,
    keluhan: b.keluhan || '-',
    desil_ekonomi: b.desilEkonomi || 2,
  };
}

function dbToBusui(r: any): IbuMenyusui {
  return {
    id: r.id,
    nik: r.nik,
    nama: r.nama,
    tanggalLahir: r.tanggal_lahir,
    namaSuami: r.nama_suami,
    alamat: r.alamat,
    posyandu: r.posyandu,
    noHp: r.no_hp,
    namaBayi: r.nama_bayi,
    usiaBayiBulan: r.usia_bayi_bulan,
    statusAsiEksklusif: Boolean(r.status_asi_eksklusif),
    lila: Number(r.lila),
    statusKEK: Boolean(r.status_kek),
    vitaminANifas: Boolean(r.vitamin_a_nifas),
    konsumsiTTD: r.konsumsi_ttd,
    keluhan: r.keluhan,
    desilEkonomi: r.desil_ekonomi,
    createdAt: r.created_at ? r.created_at.split('T')[0] : '2026-01-01',
  };
}

function lansiaToDb(l: Lansia) {
  return {
    id: ensureUuid(l.id),
    nik: l.nik,
    nama: l.nama,
    jenis_kelamin: l.jenisKelamin,
    tanggal_lahir: l.tanggalLahir || '1955-01-01',
    usia_tahun: l.usiaTahun || 60,
    nama_keluarga: l.namaKeluarga || '-',
    alamat: l.alamat || 'RT 02 / RW 03',
    no_hp: l.noHp || '-',
    posyandu: l.posyandu || 'Posyandu Melati',
    riwayat_penyakit: l.riwayatPenyakit || [],
  };
}

function dbToLansia(r: any): Lansia {
  return {
    id: r.id,
    nik: r.nik,
    nama: r.nama,
    jenisKelamin: r.jenis_kelamin,
    tanggalLahir: r.tanggal_lahir,
    usiaTahun: r.usia_tahun,
    namaKeluarga: r.nama_keluarga,
    alamat: r.alamat,
    noHp: r.no_hp,
    posyandu: r.posyandu,
    riwayatPenyakit: r.riwayat_penyakit || [],
    createdAt: r.created_at ? r.created_at.split('T')[0] : '2026-01-01',
  };
}

// ----------------------------------------------------------------------
// POSYANDU STORE: HYBRID LOCALSTORAGE CACHE + REAL-TIME SUPABASE CLOUD
// ----------------------------------------------------------------------

export class PosyanduStore {
  /**
   * Mengambil data terbaru dari Cloud Supabase dan menyinkronkannya ke LocalStorage.
   * Dipanggil otomatis saat aplikasi berjalan di browser.
   */
  static async syncFromSupabase(): Promise<void> {
    if (!supabase || typeof window === 'undefined') return;

    try {
      // 1. Sync Balita
      const { data: dbBalita, error: errBalita } = await supabase.from('balita').select('*');
      if (!errBalita && dbBalita && dbBalita.length > 0) {
        const mapped = dbBalita.map(dbToBalita);
        this.saveBalita(mapped);
      }

      // 2. Sync Pemeriksaan Balita
      const { data: dbPem, error: errPem } = await supabase.from('pemeriksaan_balita').select('*');
      if (!errPem && dbPem && dbPem.length > 0) {
        const mappedPem: PemeriksaanBalita[] = dbPem.map((r: any) => ({
          id: r.id,
          balitaId: r.balita_id,
          tanggalPeriksa: r.tanggal_periksa,
          usiaBulan: r.usia_bulan,
          beratBadan: Number(r.berat_badan),
          tinggiBadan: Number(r.tinggi_badan),
          lingkarKepala: Number(r.lingkar_kepala || 0),
          caraUkur: r.cara_ukur || 'terlentang',
          zScoreBBU: Number(r.z_score_bbu || 0),
          zScoreTBU: Number(r.z_score_tbu || 0),
          zScoreBBTB: Number(r.z_score_bbtb || 0),
          statusBBU: r.status_bbu,
          statusTBU: r.status_tbu,
          statusBBTB: r.status_bbtb,
          statusKMS: r.status_kms,
          kenaikanBB: Number(r.kenaikan_bb || 0),
          kbm: Number(r.kbm || 0),
          vitaminA: Boolean(r.vitamin_a),
          obatCacing: Boolean(r.obat_cacing),
          imunisasi: r.imunisasi || '-',
          keluhan: r.keluhan || '-',
          catatanKader: r.catatan_kader || '-',
        }));
        this.savePemeriksaan(mappedPem);
      }

      // 3. Sync Bumil
      const { data: dbBumil, error: errBumil } = await supabase.from('ibu_hamil').select('*');
      if (!errBumil && dbBumil && dbBumil.length > 0) {
        const mapped = dbBumil.map(dbToBumil);
        this.saveBumil(mapped);
      }

      // 4. Sync Busui
      const { data: dbBusui, error: errBusui } = await supabase.from('ibu_menyusui').select('*');
      if (!errBusui && dbBusui && dbBusui.length > 0) {
        const mapped = dbBusui.map(dbToBusui);
        this.saveBusui(mapped);
      }

      // 5. Sync Lansia
      const { data: dbLansia, error: errLansia } = await supabase.from('lansia').select('*');
      if (!errLansia && dbLansia && dbLansia.length > 0) {
        const mapped = dbLansia.map(dbToLansia);
        this.saveLansia(mapped);
      }

      localStorage.setItem(STORAGE_KEYS.SYNC_INITIALIZED, 'true');
    } catch (e) {
      console.warn('Sync from Supabase warning (fallback to local cache):', e);
    }
  }

  // --- BALITA ---
  static getBalita(): Balita[] {
    if (typeof window === 'undefined') return INITIAL_BALITA;
    const stored = localStorage.getItem(STORAGE_KEYS.BALITA);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.BALITA, JSON.stringify(INITIAL_BALITA));
      this.syncFromSupabase();
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

    // Asynchronous background sync to Supabase Cloud
    if (supabase) {
      const payload = balitaToDb(item);
      supabase
        .from('balita')
        .insert(payload)
        .then(({ error }) => {
          if (error) console.warn('Supabase addBalita error:', error.message);
        })
        .catch(console.warn);
    }
  }

  static updateBalita(updated: Balita): void {
    const list = this.getBalita().map((b) => (b.id === updated.id ? updated : b));
    this.saveBalita(list);

    // Asynchronous background sync to Supabase Cloud
    if (supabase) {
      const payload = balitaToDb(updated);
      supabase
        .from('balita')
        .update(payload)
        .eq('nik', updated.nik)
        .then(({ error }) => {
          if (error) console.warn('Supabase updateBalita error:', error.message);
        })
        .catch(console.warn);
    }
  }

  static deleteBalita(id: string): void {
    const target = this.getBalita().find((b) => b.id === id);
    const list = this.getBalita().filter((b) => b.id !== id);
    this.saveBalita(list);

    // Asynchronous background sync to Supabase Cloud
    if (supabase && target) {
      supabase
        .from('balita')
        .delete()
        .eq('nik', target.nik)
        .then(({ error }) => {
          if (error) console.warn('Supabase deleteBalita error:', error.message);
        })
        .catch(console.warn);
    }
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

    // Asynchronous background sync to Supabase Cloud
    if (supabase) {
      // Dapatkan balita terkait
      const targetBalita = this.getBalita().find((b) => b.id === item.balitaId);
      if (targetBalita) {
        supabase
          .from('balita')
          .select('id')
          .eq('nik', targetBalita.nik)
          .single()
          .then(({ data: balitaRow }) => {
            if (balitaRow?.id) {
              supabase
                .from('pemeriksaan_balita')
                .insert({
                  balita_id: balitaRow.id,
                  tanggal_periksa: item.tanggalPeriksa,
                  usia_bulan: item.usiaBulan,
                  berat_badan: item.beratBadan,
                  tinggi_badan: item.tinggiBadan,
                  lingkar_kepala: item.lingkarKepala,
                  cara_ukur: item.caraUkur,
                  z_score_bbu: item.zScoreBBU,
                  z_score_tbu: item.zScoreTBU,
                  z_score_bbtb: item.zScoreBBTB,
                  status_bbu: item.statusBBU,
                  status_tbu: item.statusTBU,
                  status_bbtb: item.statusBBTB,
                  status_kms: item.statusKMS,
                  kenaikan_bb: item.kenaikanBB,
                  kbm: item.kbm,
                  vitamin_a: item.vitaminA,
                  obat_cacing: item.obatCacing,
                  imunisasi: item.imunisasi,
                  keluhan: item.keluhan,
                  catatan_kader: item.catatanKader,
                })
                .then(({ error }) => {
                  if (error) console.warn('Supabase addPemeriksaan error:', error.message);
                });
            }
          })
          .catch(console.warn);
      }
    }
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

    if (supabase) {
      const payload = bumilToDb(item);
      supabase
        .from('ibu_hamil')
        .insert(payload)
        .then(({ error }) => {
          if (error) console.warn('Supabase addBumil error:', error.message);
        })
        .catch(console.warn);
    }
  }

  static updateBumil(updated: IbuHamil): void {
    const list = this.getBumil().map((b) => (b.id === updated.id ? updated : b));
    this.saveBumil(list);

    if (supabase) {
      const payload = bumilToDb(updated);
      supabase
        .from('ibu_hamil')
        .update(payload)
        .eq('nik', updated.nik)
        .then(({ error }) => {
          if (error) console.warn('Supabase updateBumil error:', error.message);
        })
        .catch(console.warn);
    }
  }

  static deleteBumil(id: string): void {
    const target = this.getBumil().find((b) => b.id === id);
    const list = this.getBumil().filter((b) => b.id !== id);
    this.saveBumil(list);

    if (supabase && target) {
      supabase
        .from('ibu_hamil')
        .delete()
        .eq('nik', target.nik)
        .then(({ error }) => {
          if (error) console.warn('Supabase deleteBumil error:', error.message);
        })
        .catch(console.warn);
    }
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

    if (supabase) {
      const payload = busuiToDb(item);
      supabase
        .from('ibu_menyusui')
        .insert(payload)
        .then(({ error }) => {
          if (error) console.warn('Supabase addBusui error:', error.message);
        })
        .catch(console.warn);
    }
  }

  static updateBusui(updated: IbuMenyusui): void {
    const list = this.getBusui().map((b) => (b.id === updated.id ? updated : b));
    this.saveBusui(list);

    if (supabase) {
      const payload = busuiToDb(updated);
      supabase
        .from('ibu_menyusui')
        .update(payload)
        .eq('nik', updated.nik)
        .then(({ error }) => {
          if (error) console.warn('Supabase updateBusui error:', error.message);
        })
        .catch(console.warn);
    }
  }

  static deleteBusui(id: string): void {
    const target = this.getBusui().find((b) => b.id === id);
    const list = this.getBusui().filter((b) => b.id !== id);
    this.saveBusui(list);

    if (supabase && target) {
      supabase
        .from('ibu_menyusui')
        .delete()
        .eq('nik', target.nik)
        .then(({ error }) => {
          if (error) console.warn('Supabase deleteBusui error:', error.message);
        })
        .catch(console.warn);
    }
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

    if (supabase) {
      const payload = lansiaToDb(item);
      supabase
        .from('lansia')
        .insert(payload)
        .then(({ error }) => {
          if (error) console.warn('Supabase addLansia error:', error.message);
        })
        .catch(console.warn);
    }
  }

  static updateLansia(updated: Lansia): void {
    const list = this.getLansia().map((l) => (l.id === updated.id ? updated : l));
    this.saveLansia(list);

    if (supabase) {
      const payload = lansiaToDb(updated);
      supabase
        .from('lansia')
        .update(payload)
        .eq('nik', updated.nik)
        .then(({ error }) => {
          if (error) console.warn('Supabase updateLansia error:', error.message);
        })
        .catch(console.warn);
    }
  }

  static deleteLansia(id: string): void {
    const target = this.getLansia().find((l) => l.id === id);
    const list = this.getLansia().filter((l) => l.id !== id);
    this.saveLansia(list);

    if (supabase && target) {
      supabase
        .from('lansia')
        .delete()
        .eq('nik', target.nik)
        .then(({ error }) => {
          if (error) console.warn('Supabase deleteLansia error:', error.message);
        })
        .catch(console.warn);
    }
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

    if (supabase) {
      const targetLansia = this.getLansia().find((l) => l.id === item.lansiaId);
      if (targetLansia) {
        supabase
          .from('lansia')
          .select('id')
          .eq('nik', targetLansia.nik)
          .single()
          .then(({ data: lansiaRow }) => {
            if (lansiaRow?.id) {
              supabase
                .from('pemeriksaan_lansia')
                .insert({
                  lansia_id: lansiaRow.id,
                  tanggal_periksa: item.tanggalPeriksa,
                  berat_badan: item.beratBadan,
                  tinggi_badan: item.tinggiBadan,
                  imt: item.imt,
                  status_gizi: item.statusGizi,
                  tensi_sistolik: item.tensiSistolik,
                  tensi_diastolik: item.tensiDiastolik,
                  status_tensi: item.statusTensi,
                  gula_darah: item.gulaDarah,
                  status_gula_darah: item.statusGulaDarah,
                  kolesterol: item.kolesterol,
                  asam_urat: item.asamUrat,
                  keluhan: item.keluhan,
                  tindakan_edukasi: item.tindakanEdukasi,
                  petugas: item.petugas,
                })
                .then(({ error }) => {
                  if (error) console.warn('Supabase addPemeriksaanLansia error:', error.message);
                });
            }
          })
          .catch(console.warn);
      }
    }
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
