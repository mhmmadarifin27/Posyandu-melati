import { createClient } from '@supabase/supabase-js';
import {
  Balita,
  PemeriksaanBalita,
  IbuHamil,
  IbuMenyusui,
  Lansia,
  PemeriksaanLansia,
  MenuMBG,
  PosyanduTenant,
  PosyanduKopConfig,
  PosyanduRegistrationRequest,
  UserProfile,
  UserRole,
} from '@/types/posyandu';
import {
  INITIAL_BALITA,
  INITIAL_PEMERIKSAAN,
  INITIAL_BUMIL,
  INITIAL_BUSUI,
  INITIAL_LANSIA,
  INITIAL_PEMERIKSAAN_LANSIA,
  INITIAL_MENU_MBG,
  INITIAL_POSYANDU,
  INITIAL_ACCOUNTS,
  INITIAL_REGISTRATIONS,
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
  BALITA: 'posyandu_melati_balita_v4',
  PEMERIKSAAN: 'posyandu_melati_pemeriksaan_v4',
  BUMIL: 'posyandu_melati_bumil_v4',
  BUSUI: 'posyandu_melati_busui_v4',
  LANSIA: 'posyandu_melati_lansia_v4',
  PEMERIKSAAN_LANSIA: 'posyandu_melati_pem_lansia_v4',
  MENU_MBG: 'posyandu_melati_menu_mbg_v4',
  POSYANDU: 'posyandu_saas_tenants_v2',
  ACCOUNTS: 'posyandu_saas_accounts_v2',
  REGISTRATIONS: 'posyandu_saas_registrations_v2',
  ACTIVE_FILTER_POSYANDU: 'posyandu_active_filter_posyandu',
  SYNC_INITIALIZED: 'posyandu_melati_supabase_synced_v1',
};

// Helper: Memastikan ID berformat UUID yang valid untuk PostgreSQL Supabase
export function ensureUuid(id?: string): string {
  if (id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) return id;
  }

  // Safe UUID v4 generator without crashing in non-secure or older contexts
  try {
    if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    if (typeof globalThis !== 'undefined' && (globalThis as any).crypto && typeof (globalThis as any).crypto.randomUUID === 'function') {
      return (globalThis as any).crypto.randomUUID();
    }
  } catch {}

  // RFC4122 v4 compliant fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
      if (!errBalita && dbBalita) {
        const mapped = dbBalita.map(dbToBalita);
        this.saveBalita(mapped);
      }

      // 2. Sync Pemeriksaan Balita
      const { data: dbPem, error: errPem } = await supabase.from('pemeriksaan_balita').select('*');
      if (!errPem && dbPem) {
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
      if (!errBumil && dbBumil) {
        const mapped = dbBumil.map(dbToBumil);
        this.saveBumil(mapped);
      }

      // 4. Sync Busui
      const { data: dbBusui, error: errBusui } = await supabase.from('ibu_menyusui').select('*');
      if (!errBusui && dbBusui) {
        const mapped = dbBusui.map(dbToBusui);
        this.saveBusui(mapped);
      }

      // 5. Sync Lansia
      const { data: dbLansia, error: errLansia } = await supabase.from('lansia').select('*');
      if (!errLansia && dbLansia) {
        const mapped = dbLansia.map(dbToLansia);
        this.saveLansia(mapped);
      }

      // 6. Sync Posyandu Tenants
      const { data: dbPosyandu, error: errPosyandu } = await supabase.from('posyandu').select('*');
      if (!errPosyandu && dbPosyandu) {
        const mappedPosyandu: PosyanduTenant[] = dbPosyandu.map((r: any) => ({
          id: r.id,
          kode: r.kode || `POS-${r.id.substring(0, 4)}`,
          nama: r.nama,
          logo: r.logo || '/images/logo-posyandu.png',
          pemerintahDaerah: r.pemerintah_daerah || 'Pemerintah Daerah',
          dinasKesehatan: r.dinas_kesehatan || 'Dinas Kesehatan',
          puskesmas: r.puskesmas || 'UPTD Puskesmas Pembina',
          provinsi: r.provinsi || 'Sumatera Selatan',
          kotaKab: r.kota_kab || 'Kota Palembang',
          kecamatan: r.kecamatan || 'Kecamatan Sako',
          kelurahan: r.kelurahan || 'Sukamaju',
          rw: r.rw || '01',
          rt: r.rt || '01',
          alamat: r.alamat || '-',
          kodePos: r.kode_pos || '30164',
          namaKetua: r.nama_ketua || '-',
          namaBidan: r.nama_bidan || 'Bdn. Siti Rahma, S.Tr.Keb',
          noHp: r.no_hp || '-',
          email: r.email || undefined,
          createdAt: r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        }));

        this.savePosyanduList(mappedPosyandu);
      }

      // 7. Sync Profiles to Accounts & Detect Cloud Registrations across Devices
      const { data: dbProfiles, error: errProfiles } = await supabase.from('profiles').select('*');
      if (!errProfiles && dbProfiles && dbProfiles.length > 0) {
        const existingAccounts = this.getAccounts();
        let updatedAccounts = [...existingAccounts];
        const existingRegistrations = this.getRegistrations();
        let updatedRegistrations = [...existingRegistrations];
        let regChanged = false;

        dbProfiles.forEach((p: any) => {
          const emailLower = p.email ? p.email.toLowerCase() : '';
          if (!emailLower) return;

          // Cek apakah akun ini adalah admin_posyandu yang belum memiliki unit aktif / belum di-ACC (posyandu_id kosong / null)
          const isPendingTenant =
            p.role === 'admin_posyandu' &&
            (!p.posyandu_id || p.posyandu_id === null || p.posyandu_id === '');

          if (isPendingTenant) {
            const hasReg = updatedRegistrations.some(
              (r) => r.emailAdmin.toLowerCase() === emailLower
            );
            if (!hasReg) {
              updatedRegistrations.unshift({
                id: `reg-${p.id}`,
                namaPosyandu: p.posyandu || 'Posyandu Unit Baru',
                strataPosyandu: 'Mandiri',
                puskesmas: 'UPTD Puskesmas Pembina',
                provinsi: 'Sumatera Selatan',
                kotaKab: 'Kota Palembang',
                kecamatan: 'Kecamatan Sako',
                kelurahan: 'Sukamaju',
                rw: '01',
                rt: '01',
                alamat: `Balai Posyandu ${p.posyandu || ''}`,
                kodePos: '30164',
                namaKetua: p.nama
                  ? p.nama.replace(/^Admin\s+/i, '').replace(/\s*\(.*\)$/, '')
                  : 'Pengurus Posyandu',
                noWhatsapp: p.no_hp || '-',
                emailAdmin: emailLower,
                passwordAdmin: '123456',
                status: 'pending',
                createdAt: p.created_at
                  ? p.created_at.split('T')[0]
                  : new Date().toISOString().split('T')[0],
                notes:
                  'Pendaftaran online mandiri dari perangkat lain (Tersinkronisasi otomatis dari Supabase Cloud).',
              });
              regChanged = true;
            }
          }

          // Sinkronisasi ke daftar akun
          const accIndex = updatedAccounts.findIndex(
            (a) => a.email.toLowerCase() === emailLower
          );
          if (accIndex < 0) {
            updatedAccounts.push({
              id: p.id,
              nama: p.nama,
              email: emailLower,
              role: p.role,
              posyanduId: p.posyandu_id,
              posyanduNama: p.posyandu,
              posyandu: p.posyandu,
              noHp: p.no_hp || '-',
              status: isPendingTenant ? 'pending' : 'approved',
              jabatan: `${p.role === 'super_admin' ? 'Super Admin' : 'Admin'} ${p.posyandu || ''}`,
              createdAt: p.created_at
                ? p.created_at.split('T')[0]
                : new Date().toISOString().split('T')[0],
            });
          } else {
            if (isPendingTenant && !updatedAccounts[accIndex].status) {
              updatedAccounts[accIndex].status = 'pending';
            }
          }
        });

        this.saveAccounts(updatedAccounts);
        if (regChanged) {
          this.saveRegistrations(updatedRegistrations);
        }
      }

      localStorage.setItem(STORAGE_KEYS.SYNC_INITIALIZED, 'true');
    } catch (e) {
      console.warn('Sync from Supabase warning (fallback to local cache):', e);
    }
  }

  // --- AUTH & TENANT CONTEXT ---
  static getActiveUser(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('posyandu_auth_user');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  }

  static getActiveRole(): UserRole {
    const user = this.getActiveUser();
    return user?.role || 'admin_posyandu';
  }

  static resolveActivePosyanduFilter(explicitFilter?: string): string | null {
    if (typeof window === 'undefined') return null;

    const user = this.getActiveUser();
    // Security Guard: Jika role adalah admin posyandu / kader, kunci WAJIB ke posyandu miliknya.
    // Menolak pemalsuan parameter URL (Anti-IDOR / Horizontal Privilege Escalation)
    if (user && (user.role === 'admin_posyandu' || user.role === 'kader' || user.role === 'bidan')) {
      return user.posyanduNama || user.posyandu || 'Posyandu Melati';
    }

    // Hanya Super Admin atau pengguna tanpa login yang berhak menggunakan explicitFilter
    if (explicitFilter) {
      return explicitFilter === 'all' ? null : explicitFilter;
    }

    if (user && user.role === 'super_admin') {
      const savedFilter = localStorage.getItem(STORAGE_KEYS.ACTIVE_FILTER_POSYANDU);
      if (savedFilter && savedFilter !== 'all') {
        return savedFilter;
      }
      return null;
    }

    return null;
  }

  static matchesPosyandu(targetName?: string, filterName?: string): boolean {
    if (!targetName || !filterName) return false;
    if (filterName === 'all') return true;
    const cleanT = targetName.trim().toLowerCase();
    const cleanF = filterName.trim().toLowerCase();
    if (cleanT === cleanF) return true;
    const normT = cleanT.replace(/^(posyandu|pos)\s+/i, '').trim();
    const normF = cleanF.replace(/^(posyandu|pos)\s+/i, '').trim();
    return normT === normF || cleanT.includes(normF) || cleanF.includes(normT);
  }

  static setActivePosyanduFilter(posyanduNameOrAll: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_FILTER_POSYANDU, posyanduNameOrAll);
    window.dispatchEvent(new Event('posyandu_filter_changed'));
  }

  // --- MASTER POSYANDU (TENANTS) ---
  static findTenant(query?: string): PosyanduTenant | undefined {
    if (!query) return undefined;
    const list = this.getPosyanduList();
    const clean = query.trim().toLowerCase();
    const cleanNoPrefix = clean.replace(/^(posyandu|pos)\s+/i, '').trim();

    // 1. Exact ID
    let found = list.find((t) => t.id === query || t.id.toLowerCase() === clean);
    if (found) return found;

    // 2. Exact Nama (case-insensitive)
    found = list.find((t) => t.nama.trim().toLowerCase() === clean);
    if (found) return found;

    // 3. Nama without "Posyandu" prefix
    found = list.find((t) => {
      const tNorm = t.nama.trim().toLowerCase().replace(/^(posyandu|pos)\s+/i, '').trim();
      return tNorm === cleanNoPrefix || tNorm === clean || t.nama.trim().toLowerCase() === cleanNoPrefix;
    });
    if (found) return found;

    // 4. Match by Kode
    found = list.find((t) => t.kode.trim().toLowerCase() === clean);
    if (found) return found;

    // 5. Partial match
    found = list.find((t) => t.nama.toLowerCase().includes(cleanNoPrefix) || clean.includes(t.nama.toLowerCase()));
    if (found) return found;

    return undefined;
  }

  static getPosyanduList(): PosyanduTenant[] {
    if (typeof window === 'undefined') return INITIAL_POSYANDU;
    const stored = localStorage.getItem(STORAGE_KEYS.POSYANDU);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.POSYANDU, JSON.stringify(INITIAL_POSYANDU));
      return INITIAL_POSYANDU;
    }
    try {
      const parsed: PosyanduTenant[] = JSON.parse(stored);
      // Sanitasi: Pastikan Posyandu Melati selalu memiliki logo resmi bawaan jika tercemar base64 dari tenant lain
      let hasChange = false;
      parsed.forEach((t) => {
        if ((t.id === 'pos-melati' || t.nama.toLowerCase() === 'posyandu melati') && t.logo && t.logo.startsWith('data:image')) {
          t.logo = '/images/logo-posyandu.png';
          hasChange = true;
        }
      });
      if (hasChange) {
        localStorage.setItem(STORAGE_KEYS.POSYANDU, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return INITIAL_POSYANDU;
    }
  }

  static savePosyanduList(list: PosyanduTenant[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.POSYANDU, JSON.stringify(list));
      window.dispatchEvent(new Event('posyandu_tenants_updated'));
    } catch (e) {
      console.warn('localStorage savePosyanduList warning:', e);
    }
  }

  static addPosyandu(item: PosyanduTenant): void {
    const list = this.getPosyanduList();
    if (!list.some((p) => p.id === item.id || p.nama.toLowerCase() === item.nama.toLowerCase())) {
      list.push(item);
      this.savePosyanduList(list);
    }

    if (supabase) {
      try {
        supabase
          .from('posyandu')
          .upsert(
            {
              id: ensureUuid(item.id),
              kode: item.kode,
              nama: item.nama,
              logo: item.logo || '/images/logo-posyandu.png',
              pemerintah_daerah: item.pemerintahDaerah || 'Pemerintah Daerah',
              dinas_kesehatan: item.dinasKesehatan || 'Dinas Kesehatan',
              puskesmas: item.puskesmas || 'UPTD Puskesmas Pembina',
              provinsi: item.provinsi || 'Sumatera Selatan',
              kota_kab: item.kotaKab || 'Kota Palembang',
              kecamatan: item.kecamatan || 'Kecamatan Sako',
              kelurahan: item.kelurahan || 'Sukamaju',
              rw: item.rw || '01',
              rt: item.rt || '01',
              alamat: item.alamat || '-',
              kode_pos: item.kodePos || '30164',
              nama_ketua: item.namaKetua || '-',
              nama_bidan: item.namaBidan || 'Bdn. Siti Rahma, S.Tr.Keb',
              no_hp: item.noHp || '-',
              email: item.email || null,
            },
            { onConflict: 'nama' }
          )
          .then(({ error }) => {
            if (error) console.warn('Supabase addPosyandu error:', error.message);
          }, console.warn);
      } catch (err) {
        console.warn('Supabase addPosyandu error:', err);
      }
    }
  }

  static updatePosyandu(updated: PosyanduTenant): void {
    const list = this.getPosyanduList().map((p) => (p.id === updated.id ? updated : p));
    this.savePosyanduList(list);

    if (supabase) {
      supabase
        .from('posyandu')
        .update({
          kode: updated.kode,
          nama: updated.nama,
          logo: updated.logo || '/images/logo-posyandu.png',
          pemerintah_daerah: updated.pemerintahDaerah,
          dinas_kesehatan: updated.dinasKesehatan,
          puskesmas: updated.puskesmas,
          provinsi: updated.provinsi,
          kota_kab: updated.kotaKab,
          kecamatan: updated.kecamatan,
          kelurahan: updated.kelurahan,
          rw: updated.rw,
          rt: updated.rt,
          alamat: updated.alamat,
          kode_pos: updated.kodePos,
          nama_ketua: updated.namaKetua,
          nama_bidan: updated.namaBidan,
          no_hp: updated.noHp,
          email: updated.email || null,
        })
        .eq('nama', updated.nama)
        .then(({ error }) => {
          if (error) console.warn('Supabase updatePosyandu error:', error.message);
        }, console.warn);
    }
  }

  static deletePosyandu(id: string): void {
    const target = this.getPosyanduList().find((p) => p.id === id);
    const list = this.getPosyanduList().filter((p) => p.id !== id);
    this.savePosyanduList(list);

    if (supabase && target) {
      supabase
        .from('posyandu')
        .delete()
        .eq('nama', target.nama)
        .then(({ error }) => {
          if (error) console.warn('Supabase deletePosyandu error:', error.message);
        }, console.warn);
    }
  }

  // --- KOP SURAT DINAMIS (CUSTOM KOP PER TENANT) ---
  static getKopConfig(tenantNameOrId?: string): PosyanduKopConfig {
    const list = this.getPosyanduList();
    const fallbackTenant: PosyanduTenant = {
      id: 'default',
      kode: 'POS-00',
      nama: 'Posyandu Pembina',
      logo: '/images/logo-posyandu.png',
      pemerintahDaerah: 'Pemerintah Kota Palembang',
      dinasKesehatan: 'Dinas Kesehatan Kota Palembang',
      puskesmas: 'UPTD Puskesmas Pembina',
      provinsi: 'Sumatera Selatan',
      kotaKab: 'Kota Palembang',
      kecamatan: 'Kecamatan Sako',
      kelurahan: 'Sukamaju',
      rw: '01',
      rt: '01',
      alamat: 'Puskesmas Pembina',
      kodePos: '30164',
      namaKetua: 'Kepala Puskesmas',
      namaBidan: 'Bdn. Siti Rahma, S.Tr.Keb',
      noHp: '081122334455',
      createdAt: '2024-01-01',
    };

    const matched: PosyanduTenant =
      this.findTenant(tenantNameOrId) ||
      (tenantNameOrId && tenantNameOrId.toLowerCase().includes('melati')
        ? list.find((t) => t.id === 'pos-melati' || t.nama.toLowerCase().includes('melati'))
        : undefined) ||
      list[0] ||
      INITIAL_POSYANDU[0] ||
      fallbackTenant;

    const isMelati = matched.id === 'pos-melati' || matched.nama.toLowerCase() === 'posyandu melati';
    const storageKey = `posyandu_kop_config_${matched.id}`;

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);
        if (stored) {
          const parsed: PosyanduKopConfig = JSON.parse(stored);
          // Sanitasi proteksi khusus Posyandu Melati:
          // Jika key pos-melati tercemar data gambar base64 milik tenant lain, otomatis bersihkan kembali ke logo bawaan
          if (isMelati && parsed.logoPosyandu && parsed.logoPosyandu.startsWith('data:image')) {
            parsed.logoPosyandu = '/images/logo-posyandu.png';
            try {
              localStorage.setItem(storageKey, JSON.stringify(parsed));
            } catch {}
          }
          return parsed;
        }
      } catch {}
    }

    // Default dinamis berdasarkan data profil PosyanduTenant
    const defaultLogo = isMelati
      ? '/images/logo-posyandu.png'
      : (matched.logo || '/images/logo-posyandu.png');

    return {
      pemerintahDaerah: (matched.pemerintahDaerah || 'Pemerintah Daerah').toUpperCase(),
      dinasKesehatan: (matched.dinasKesehatan || 'Dinas Kesehatan').toUpperCase(),
      puskesmas: (matched.puskesmas || 'UPTD Puskesmas Pembina').toUpperCase(),
      namaPosyandu: `${matched.nama.toUpperCase()} RW ${matched.rw}`,
      alamat: `${matched.alamat}, Kel. ${matched.kelurahan}, Kec. ${matched.kecamatan || 'Sako'}, ${matched.kotaKab || 'Kota Palembang'}, ${matched.provinsi || 'Sumatera Selatan'} ${matched.kodePos || '30164'}`,
      kontak: `Posko Pelayanan: ${matched.noHp}${matched.email ? ` • Email: ${matched.email}` : ''}`,
      logoPosyandu: defaultLogo,
      namaKetua: matched.namaKetua,
      namaBidan: matched.namaBidan || 'Bdn. Siti Rahma, S.Tr.Keb',
      nipBidan: '19870415 201001 2 008',
    };
  }

  static saveKopConfig(tenantIdOrName: string, config: PosyanduKopConfig): void {
    if (typeof window === 'undefined') return;
    const tenant = this.findTenant(tenantIdOrName);
    const targetId = tenant ? tenant.id : tenantIdOrName;
    const storageKey = `posyandu_kop_config_${targetId}`;

    try {
      localStorage.setItem(storageKey, JSON.stringify(config));
    } catch (e) {
      console.warn('LocalStorage quota terlampaui saat menyimpan KOP Surat. Menyimpan di sessionStorage...', e);
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(config));
      } catch {}
    }

    // Perbarui logo di tenant list HANYA untuk tenant yang bersangkutan (dan jangan ubah jika Melati tidak sengaja tertarget)
    if (config.logoPosyandu && tenant) {
      const tenants = this.getPosyanduList();
      const updated = tenants.map((t) => (t.id === tenant.id ? { ...t, logo: config.logoPosyandu } : t));
      this.savePosyanduList(updated);
    }

    window.dispatchEvent(new Event('posyandu_kop_updated'));
  }

  // --- ACCOUNTS (SUPER ADMIN & ADMIN POSYANDU) ---
  static getAccounts(): (UserProfile & { password?: string })[] {
    if (typeof window === 'undefined') return INITIAL_ACCOUNTS;
    const stored = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
      return INITIAL_ACCOUNTS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_ACCOUNTS;
    }
  }

  static saveAccounts(list: (UserProfile & { password?: string })[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(list));
      window.dispatchEvent(new Event('posyandu_accounts_updated'));
    } catch (e) {
      console.warn('localStorage saveAccounts warning:', e);
    }
  }

  static addAccount(item: UserProfile & { password?: string }): void {
    const list = this.getAccounts();
    const existingIndex = list.findIndex((a) => a.email.toLowerCase() === item.email.toLowerCase());
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...item };
    } else {
      list.push(item);
    }
    this.saveAccounts(list);

    // Sinkronisasi profil ke Supabase
    if (supabase && item.id) {
      const validProfileId = ensureUuid(item.id);
      supabase
        .from('profiles')
        .upsert({
          id: validProfileId,
          nama: item.nama,
          email: item.email.toLowerCase(),
          role: item.role,
          posyandu: item.posyanduNama || item.posyandu,
          posyandu_id: ensureUuid(item.posyanduId),
          no_hp: item.noHp,
        })
        .then(({ error: pErr }) => {
          if (pErr) console.warn('Supabase profile upsert warning:', pErr.message);
        }, console.warn);
    }
  }

  static updateAccount(updated: UserProfile & { password?: string }): void {
    const list = this.getAccounts().map((a) => (a.id === updated.id ? updated : a));
    this.saveAccounts(list);
  }

  static deleteAccount(id: string): void {
    const target = this.getAccounts().find((a) => a.id === id);
    const list = this.getAccounts().filter((a) => a.id !== id);
    this.saveAccounts(list);

    if (supabase) {
      const query = target?.email
        ? supabase.from('profiles').delete().eq('email', target.email.toLowerCase())
        : supabase.from('profiles').delete().eq('id', ensureUuid(id));

      query.then(({ error }) => {
        if (error) console.warn('Supabase profile delete warning:', error.message);
      });
    }
  }

  // --- REGISTRASI MANDIRI POSYANDU (SELF-REGISTRATION & APPROVAL) ---
  static getRegistrations(): PosyanduRegistrationRequest[] {
    if (typeof window === 'undefined') return INITIAL_REGISTRATIONS;
    const stored = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(INITIAL_REGISTRATIONS));
      return INITIAL_REGISTRATIONS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_REGISTRATIONS;
    }
  }

  static saveRegistrations(list: PosyanduRegistrationRequest[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(list));
      window.dispatchEvent(new Event('posyandu_registrations_updated'));
    } catch (e) {
      console.warn('localStorage saveRegistrations warning:', e);
    }
  }

  static addRegistration(req: PosyanduRegistrationRequest): void {
    const list = this.getRegistrations();
    list.unshift(req);
    this.saveRegistrations(list);
  }

  static approveRegistration(id: string): { tenant: PosyanduTenant; account: UserProfile & { password?: string } } | null {
    const list = this.getRegistrations();
    const target = list.find((r) => r.id === id);
    if (!target) return null;

    target.status = 'approved';
    target.approvedAt = new Date().toISOString();
    this.saveRegistrations(list);

    // 1. Buat Tenant Posyandu Baru (Resmi Aktif)
    const newTenant: PosyanduTenant = {
      id: `pos-${Date.now()}`,
      kode: `POS-${String(this.getPosyanduList().length + 1).padStart(2, '0')}`,
      nama: target.namaPosyandu,
      logo: target.logoUrl || '/images/logo-posyandu.png',
      pemerintahDaerah: 'Pemerintah Daerah',
      dinasKesehatan: 'Dinas Kesehatan',
      puskesmas: target.puskesmas || 'UPTD Puskesmas Pembina',
      provinsi: target.provinsi || 'Sumatera Selatan',
      kotaKab: target.kotaKab,
      kecamatan: target.kecamatan,
      kelurahan: target.kelurahan,
      rw: target.rw,
      rt: target.rt || '01',
      alamat: target.alamat,
      kodePos: target.kodePos || '30164',
      namaKetua: target.namaKetua,
      namaBidan: 'Bdn. Siti Rahma, S.Tr.Keb',
      noHp: target.noWhatsapp,
      email: target.emailAdmin,
      status: 'approved',
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.addPosyandu(newTenant);

    // 2. Buat Akun Admin Posyandu Terpadu (Resmi Aktif)
    const newAccount: UserProfile & { password?: string } = {
      id: `usr-${Date.now()}`,
      nama: `Admin ${target.namaPosyandu} (${target.namaKetua})`,
      email: target.emailAdmin.toLowerCase(),
      password: target.passwordAdmin || '123456',
      role: 'admin_posyandu',
      posyanduId: newTenant.id,
      posyanduNama: newTenant.nama,
      posyandu: newTenant.nama,
      noHp: target.noWhatsapp,
      jabatan: `Ketua & Admin ${newTenant.nama}`,
      status: 'approved',
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.addAccount(newAccount);

    // 3. Sinkronisasi ke Supabase Profiles & Auth jika terkonfigurasi
    if (isSupabaseConfigured && supabase) {
      try {
        const validTenantUuid = ensureUuid(newTenant.id);
        supabase
          .from('profiles')
          .update({
            posyandu_id: validTenantUuid,
            posyandu: newTenant.nama,
            role: 'admin_posyandu',
          })
          .eq('email', target.emailAdmin.toLowerCase())
          .then(({ error: pErr }) => {
            if (pErr) console.warn('Supabase profile update on approve warning:', pErr.message);
          });

        supabase.auth.signUp({
          email: target.emailAdmin.toLowerCase(),
          password: target.passwordAdmin || '123456',
          options: {
            data: {
              nama: newAccount.nama,
              role: 'admin_posyandu',
              posyandu: newTenant.nama,
              posyandu_id: validTenantUuid,
              no_hp: target.noWhatsapp,
            },
          },
        });
      } catch (e) {
        console.warn('Supabase cloud signup sync warning:', e);
      }
    }

    return { tenant: newTenant, account: newAccount };
  }

  static rejectRegistration(id: string, notes?: string): void {
    const list = this.getRegistrations();
    const updated = list.map((r) =>
      r.id === id
        ? {
            ...r,
            status: 'rejected' as const,
            rejectedAt: new Date().toISOString(),
            notes: notes || r.notes || 'Pendaftaran ditolak oleh Super Admin Puskesmas.',
          }
        : r
    );
    this.saveRegistrations(updated);
  }

  // --- BALITA ---
  static getBalita(posyanduFilter?: string): Balita[] {
    let all: Balita[] = INITIAL_BALITA;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.BALITA);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.BALITA, JSON.stringify(INITIAL_BALITA));
        this.syncFromSupabase();
      } else {
        try {
          all = JSON.parse(stored);
        } catch {
          all = INITIAL_BALITA;
        }
      }
    }

    const targetPosyandu = this.resolveActivePosyanduFilter(posyanduFilter);
    if (targetPosyandu && targetPosyandu !== 'all') {
      return all.filter((b) => this.matchesPosyandu(b.posyandu || 'Posyandu Melati', targetPosyandu));
    }
    return all;
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
        }, console.warn);
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
        }, console.warn);
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
        }, console.warn);
    }
  }

  // --- PEMERIKSAAN BALITA ---
  static getPemeriksaan(posyanduFilter?: string): PemeriksaanBalita[] {
    let all: PemeriksaanBalita[] = INITIAL_PEMERIKSAAN;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.PEMERIKSAAN);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.PEMERIKSAAN, JSON.stringify(INITIAL_PEMERIKSAAN));
      } else {
        try {
          const parsed: PemeriksaanBalita[] = JSON.parse(stored);
          all = parsed.map((p) => {
            if (p.tanggalPeriksa && p.tanggalPeriksa.startsWith('2024-09')) {
              return { ...p, tanggalPeriksa: p.tanggalPeriksa.replace('2024-09', '2026-10') };
            }
            return p;
          });
        } catch {
          all = INITIAL_PEMERIKSAAN;
        }
      }
    }

    const targetPosyandu = this.resolveActivePosyanduFilter(posyanduFilter);
    if (targetPosyandu && targetPosyandu !== 'all') {
      const allowedBalitaIds = new Set(this.getBalita(targetPosyandu).map((b) => b.id));
      return all.filter((p) => allowedBalitaIds.has(p.balitaId));
    }
    return all;
  }

  static savePemeriksaan(list: PemeriksaanBalita[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PEMERIKSAAN, JSON.stringify(list));
  }

  static addPemeriksaan(item: PemeriksaanBalita): void {
    const list = this.getPemeriksaan();
    // Unique Constraint Guard: Jika pemeriksaan untuk balita pada tanggal ini sudah ada, perbarui data daripada membuat duplikat
    const existingIndex = list.findIndex(
      (p) => p.balitaId === item.balitaId && p.tanggalPeriksa === item.tanggalPeriksa
    );
    if (existingIndex >= 0) {
      list[existingIndex] = { ...item, id: list[existingIndex].id };
    } else {
      list.unshift(item);
    }
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
          }, console.warn);
      }
    }
  }

  // --- IBU HAMIL ---
  static getBumil(posyanduFilter?: string): IbuHamil[] {
    let all: IbuHamil[] = INITIAL_BUMIL;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.BUMIL);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.BUMIL, JSON.stringify(INITIAL_BUMIL));
      } else {
        try {
          all = JSON.parse(stored);
        } catch {
          all = INITIAL_BUMIL;
        }
      }
    }

    const targetPosyandu = this.resolveActivePosyanduFilter(posyanduFilter);
    if (targetPosyandu && targetPosyandu !== 'all') {
      return all.filter((b) => this.matchesPosyandu(b.posyandu || 'Posyandu Melati', targetPosyandu));
    }
    return all;
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
        }, console.warn);
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
        }, console.warn);
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
        }, console.warn);
    }
  }

  // --- IBU MENYUSUI (BUSUI) ---
  static getBusui(posyanduFilter?: string): IbuMenyusui[] {
    let all: IbuMenyusui[] = INITIAL_BUSUI;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.BUSUI);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.BUSUI, JSON.stringify(INITIAL_BUSUI));
      } else {
        try {
          all = JSON.parse(stored);
        } catch {
          all = INITIAL_BUSUI;
        }
      }
    }

    const targetPosyandu = this.resolveActivePosyanduFilter(posyanduFilter);
    if (targetPosyandu && targetPosyandu !== 'all') {
      return all.filter((b) => this.matchesPosyandu(b.posyandu || 'Posyandu Melati', targetPosyandu));
    }
    return all;
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
        }, console.warn);
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
        }, console.warn);
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
        }, console.warn);
    }
  }

  // --- LANSIA ---
  static getLansia(posyanduFilter?: string): Lansia[] {
    let all: Lansia[] = INITIAL_LANSIA;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.LANSIA);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.LANSIA, JSON.stringify(INITIAL_LANSIA));
      } else {
        try {
          all = JSON.parse(stored);
        } catch {
          all = INITIAL_LANSIA;
        }
      }
    }

    const targetPosyandu = this.resolveActivePosyanduFilter(posyanduFilter);
    if (targetPosyandu && targetPosyandu !== 'all') {
      return all.filter((l) => this.matchesPosyandu(l.posyandu || 'Posyandu Melati', targetPosyandu));
    }
    return all;
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
        }, console.warn);
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
        }, console.warn);
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
        }, console.warn);
    }
  }

  // --- PEMERIKSAAN LANSIA ---
  static getPemeriksaanLansia(posyanduFilter?: string): PemeriksaanLansia[] {
    let all: PemeriksaanLansia[] = INITIAL_PEMERIKSAAN_LANSIA;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.PEMERIKSAAN_LANSIA);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.PEMERIKSAAN_LANSIA, JSON.stringify(INITIAL_PEMERIKSAAN_LANSIA));
      } else {
        try {
          const parsed: PemeriksaanLansia[] = JSON.parse(stored);
          all = parsed.map((p) => {
            if (p.tanggalPeriksa && p.tanggalPeriksa.startsWith('2024-09')) {
              return { ...p, tanggalPeriksa: p.tanggalPeriksa.replace('2024-09', '2026-10') };
            }
            return p;
          });
        } catch {
          all = INITIAL_PEMERIKSAAN_LANSIA;
        }
      }
    }

    const targetPosyandu = this.resolveActivePosyanduFilter(posyanduFilter);
    if (targetPosyandu && targetPosyandu !== 'all') {
      const allowedLansiaIds = new Set(this.getLansia(targetPosyandu).map((l) => l.id));
      return all.filter((p) => allowedLansiaIds.has(p.lansiaId));
    }
    return all;
  }

  static savePemeriksaanLansia(list: PemeriksaanLansia[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PEMERIKSAAN_LANSIA, JSON.stringify(list));
  }

  static addPemeriksaanLansia(item: PemeriksaanLansia): void {
    const list = this.getPemeriksaanLansia();
    // Unique Constraint Guard: Jika pemeriksaan lansia pada tanggal ini sudah ada, perbarui data
    const existingIndex = list.findIndex(
      (p) => p.lansiaId === item.lansiaId && p.tanggalPeriksa === item.tanggalPeriksa
    );
    if (existingIndex >= 0) {
      list[existingIndex] = { ...item, id: list[existingIndex].id };
    } else {
      list.unshift(item);
    }
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
          }, console.warn);
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
