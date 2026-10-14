import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface GalleryPhoto {
  id: string;
  src: string;
  alt?: string;
  createdAt?: string;
}

export interface PosyanduScheduleConfig {
  sessionDate: number;
  sessionMonth: string;
  sessionYear: number;
  sessionDayName: string;
  sessionTime: string;
  sessionLocation: string;
  address: string;
  targetSummary: string;
  contactPersonName: string;
  contactWhatsapp: string;
}

export const DEFAULT_GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'galeri-1',
    src: '/images/hero_posyandu.jpg',
    alt: 'Pelayanan Ramah Ibu dan Anak di Posyandu Melati',
    createdAt: '2026-10-01',
  },
  {
    id: 'galeri-2',
    src: '/images/dok_timbang_balita.jpg',
    alt: 'Penimbangan Digital dan Pengukuran Antropometri Balita',
    createdAt: '2026-10-02',
  },
  {
    id: 'galeri-3',
    src: '/images/dok_bumil_checkup.jpg',
    alt: 'Pemeriksaan Kesehatan Antenatal dan Bimbingan KIA',
    createdAt: '2026-10-03',
  },
  {
    id: 'galeri-4',
    src: '/images/galeri_imunisasi.jpg',
    alt: 'Pemberian Vitamin A dan Imunisasi Lengkap Balita',
    createdAt: '2026-10-04',
  },
  {
    id: 'galeri-5',
    src: '/images/galeri_lansia.jpg',
    alt: 'Senam Kebugaran Lansia dan Skrining PTM Bersama',
    createdAt: '2026-10-05',
  },
  {
    id: 'galeri-6',
    src: '/images/galeri_pmt.jpg',
    alt: 'Penyajian Menu Tambahan Gizi Sehat PMT MBG',
    createdAt: '2026-10-06',
  },
];

export const DEFAULT_SCHEDULE_CONFIG: PosyanduScheduleConfig = {
  sessionDate: 15,
  sessionMonth: 'Oktober',
  sessionYear: 2026,
  sessionDayName: 'Kamis',
  sessionTime: '08.00 - 12.00 WIB',
  sessionLocation: 'Balai Pertemuan Warga RW 03',
  address: 'Jl. Melati Raya No. 12, Kelurahan Sukamaju',
  targetSummary: 'Balita (0-59 bln), Ibu Hamil, Busui, dan Lansia',
  contactPersonName: 'Bdn. Siti Rahma, S.Tr.Keb',
  contactWhatsapp: '6281278901234',
};

const GALLERY_STORAGE_KEY = 'posyandu_landing_gallery';
const SCHEDULE_STORAGE_KEY = 'posyandu_landing_schedule';

let hasSyncedWithSupabase = false;

export const LandingStore = {
  async syncFromSupabase(): Promise<void> {
    if (!isSupabaseConfigured || !supabase || typeof window === 'undefined') return;

    try {
      // 1. Ambil data Galeri dari Supabase
      const { data: galleryData, error: galleryError } = await supabase
        .from('landing_galeri')
        .select('*')
        .eq('is_active', true)
        .order('urutan', { ascending: true });

      if (!galleryError && galleryData && galleryData.length > 0) {
        const mappedPhotos: GalleryPhoto[] = galleryData.map((item) => ({
          id: item.id,
          src: item.src,
          alt: item.alt || 'Dokumentasi Posyandu Melati',
          createdAt: item.created_at,
        }));
        localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(mappedPhotos));
      }

      // 2. Ambil data Jadwal dari Supabase
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('landing_jadwal')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!scheduleError && scheduleData) {
        const mappedSchedule: PosyanduScheduleConfig = {
          sessionDate: scheduleData.session_date,
          sessionMonth: scheduleData.session_month,
          sessionYear: scheduleData.session_year,
          sessionDayName: scheduleData.session_day_name,
          sessionTime: scheduleData.session_time,
          sessionLocation: scheduleData.session_location,
          address: scheduleData.address,
          targetSummary: scheduleData.target_summary,
          contactPersonName: scheduleData.contact_person_name,
          contactWhatsapp: scheduleData.contact_whatsapp,
        };
        localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(mappedSchedule));
      }

      window.dispatchEvent(new Event('posyandu_landing_updated'));
    } catch (e) {
      console.warn('Gagal sinkronisasi data landing dari Supabase:', e);
    }
  },

  getGalleryImages(): GalleryPhoto[] {
    if (typeof window === 'undefined') return DEFAULT_GALLERY_PHOTOS;

    // Trigger sinkronisasi otomatis pertama kali di browser
    if (!hasSyncedWithSupabase && isSupabaseConfigured) {
      hasSyncedWithSupabase = true;
      this.syncFromSupabase();
    }

    try {
      const raw = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(DEFAULT_GALLERY_PHOTOS));
        return DEFAULT_GALLERY_PHOTOS;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return DEFAULT_GALLERY_PHOTOS;
    } catch {
      return DEFAULT_GALLERY_PHOTOS;
    }
  },

  addGalleryPhoto(src: string): GalleryPhoto[] {
    const current = this.getGalleryImages();
    const newPhoto: GalleryPhoto = {
      id: `galeri-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      src: src.trim(),
      alt: 'Dokumentasi Posyandu Melati',
      createdAt: new Date().toISOString(),
    };
    const updated = [newPhoto, ...current];
    if (typeof window !== 'undefined') {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('posyandu_landing_updated'));
    }

    // Simpan ke Supabase jika terhubung
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('landing_galeri')
        .insert({
          src: newPhoto.src,
          alt: newPhoto.alt,
          urutan: updated.length,
          is_active: true,
        })
        .then(({ error }) => {
          if (error) console.warn('Gagal menyimpan foto baru ke Supabase:', error.message);
        });
    }

    return updated;
  },

  deleteGalleryPhoto(id: string): GalleryPhoto[] {
    const current = this.getGalleryImages();
    const updated = current.filter((item) => item.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('posyandu_landing_updated'));
    }

    // Hapus dari Supabase jika id adalah UUID Supabase
    if (isSupabaseConfigured && supabase && !id.startsWith('galeri-')) {
      supabase
        .from('landing_galeri')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('Gagal menghapus foto dari Supabase:', error.message);
        });
    }

    return updated;
  },

  resetGalleryPhotos(): GalleryPhoto[] {
    if (typeof window !== 'undefined') {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(DEFAULT_GALLERY_PHOTOS));
      window.dispatchEvent(new Event('posyandu_landing_updated'));
    }
    return DEFAULT_GALLERY_PHOTOS;
  },

  getSchedule(): PosyanduScheduleConfig {
    if (typeof window === 'undefined') return DEFAULT_SCHEDULE_CONFIG;
    try {
      const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(DEFAULT_SCHEDULE_CONFIG));
        return DEFAULT_SCHEDULE_CONFIG;
      }
      return { ...DEFAULT_SCHEDULE_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SCHEDULE_CONFIG;
    }
  },

  saveSchedule(partial: Partial<PosyanduScheduleConfig>): PosyanduScheduleConfig {
    const current = this.getSchedule();
    const updated = { ...current, ...partial };
    if (typeof window !== 'undefined') {
      localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('posyandu_landing_updated'));
    }

    // Simpan ke Supabase jika terhubung
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('landing_jadwal')
        .upsert(
          {
            session_date: updated.sessionDate,
            session_month: updated.sessionMonth,
            session_year: updated.sessionYear,
            session_day_name: updated.sessionDayName,
            session_time: updated.sessionTime,
            session_location: updated.sessionLocation,
            address: updated.address,
            target_summary: updated.targetSummary,
            contact_person_name: updated.contactPersonName,
            contact_whatsapp: updated.contactWhatsapp,
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
        .then(({ error }) => {
          if (error) console.warn('Gagal update jadwal ke Supabase:', error.message);
        });
    }

    return updated;
  },

  resetSchedule(): PosyanduScheduleConfig {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(DEFAULT_SCHEDULE_CONFIG));
      window.dispatchEvent(new Event('posyandu_landing_updated'));
    }
    return DEFAULT_SCHEDULE_CONFIG;
  },
};
