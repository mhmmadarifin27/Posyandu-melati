import {
  Balita,
  PemeriksaanBalita,
  IbuHamil,
  IbuMenyusui,
  Lansia,
  PemeriksaanLansia,
  MenuMBG,
  PosyanduTenant,
  PosyanduRegistrationRequest,
  UserProfile,
} from '@/types/posyandu';

export const INITIAL_POSYANDU: PosyanduTenant[] = [];

export const INITIAL_ACCOUNTS: (UserProfile & { password?: string })[] = [
  {
    id: 'usr-superadmin',
    nama: 'Dr. Hendra Gunawan, M.Kes',
    email: 'superadmin@posyandu.id',
    password: 'admin123',
    role: 'super_admin',
    jabatan: 'Koordinator Kesehatan Puskesmas Sukamaju',
    noHp: '081122334455',
    createdAt: '2024-01-01',
  },
];

export const INITIAL_BALITA: Balita[] = [];

export const INITIAL_PEMERIKSAAN: PemeriksaanBalita[] = [];

export const INITIAL_BUMIL: IbuHamil[] = [];

export const INITIAL_BUSUI: IbuMenyusui[] = [];

export const INITIAL_LANSIA: Lansia[] = [];

export const INITIAL_PEMERIKSAAN_LANSIA: PemeriksaanLansia[] = [];

export const INITIAL_MENU_MBG: MenuMBG[] = [
  {
    id: 'menu-1',
    namaMenu: 'Bubur Singgang Telur Puyuh & Hati Ayam Fortifikasi',
    kategori: 'Balita Gizi Kurang',
    targetSasaran: 'Balita',
    deskripsi: 'Formula pemulihan padat kalori dengan protein hewani ganda (telur puyuh + hati ayam) untuk mengejar ketertinggalan BB (Weight Faltering).',
    komposisi: ['Beras organik fortifikasi', 'Hati ayam cincang (30g)', 'Telur puyuh (2 butir)', 'Minyak kelapa', 'Bayam cincang'],
    kalori: 245,
    protein: 9.8,
    zatBesi: 4.2,
    anjuranPemberian: '1 porsi di sela waktu makan utama (pukul 10.00 atau 15.30).',
  },
  {
    id: 'menu-2',
    namaMenu: 'Nasi Tim Semur Ikan Kembung & Tahu Daun Kelor',
    kategori: 'Balita Stunting',
    targetSasaran: 'Balita',
    deskripsi: 'Kaya asam lemak omega-3, zinc, dan kalsium alami dari ikan kembung dan daun kelor untuk stimulasi pertumbuhan tulang balita pendek.',
    komposisi: ['Beras merah campur', 'Fillet ikan kembung segar (40g)', 'Tahu sutra kukus', 'Daun kelor muda', 'Wortel parut halus'],
    kalori: 220,
    protein: 10.5,
    zatBesi: 3.1,
    anjuranPemberian: '1 kali sehari sebagai makanan kaya mikronutrien.',
  },
  {
    id: 'menu-3',
    namaMenu: 'Paket Padat Energi Bumil: Semur Daging Sapi & Sup Rolade Hati',
    kategori: 'Bumil KEK',
    targetSasaran: 'Bumil',
    deskripsi: 'Menu intervensi bumil KEK (LiLA < 23.5 cm) padat protein hewani dan folat tinggi untuk mencegah BBLR.',
    komposisi: ['Nasi pulen hangat', 'Daging sapi cincang (60g)', 'Kacang merah rendam (35g)', 'Hati ayam rempah', 'Sayur bayam bening'],
    kalori: 520,
    protein: 24.5,
    zatBesi: 8.6,
    anjuranPemberian: 'Porsi tambahan dikonsumsi setiap hari bersama tablet tambah darah (TTD).',
  },
  {
    id: 'menu-4',
    namaMenu: 'Sup Bening Daun Katuk Jagung Manis & Ikan Gabus Panggang Rempah',
    kategori: 'Busui Gizi Tambahan',
    targetSasaran: 'Busui',
    deskripsi: 'Formula laktogenik alami untuk merangsang hormon prolaktin & oksitosin pelancar ASI, diperkaya protein albumin ikan gabus untuk daya tahan ibu menyusui.',
    komposisi: ['Daun katuk segar petik', 'Fillet ikan gabus bakar rempah (60g)', 'Jagung manis pipil', 'Tahu sutra kukus', 'Bawang putih & jahe'],
    kalori: 360,
    protein: 22.0,
    zatBesi: 6.5,
    anjuranPemberian: 'Konsumsi selagi hangat 1 mangkuk setiap kali makan untuk memaksimalkan produksi ASI.',
  },
  {
    id: 'menu-5',
    namaMenu: 'Sup Ikan Gabus Sayur Labu Siam & Tahu Kukus (Khusus Lansia)',
    kategori: 'Lansia Gizi Khusus',
    targetSasaran: 'Lansia',
    deskripsi: 'Tinggi albumin dan kalsium alami, rendah garam dan bebas kolesterol jahat, mudah dicerna untuk sendi lansia.',
    komposisi: ['Fillet ikan gabus kukus rempah (50g)', 'Labu siam iris lembut', 'Tahu sutra', 'Kuah kaldu jahe bawang putih'],
    kalori: 280,
    protein: 18.2,
    zatBesi: 3.5,
    anjuranPemberian: 'Sajikan hangat saat makan siang atau sore.',
  },
];

export const INITIAL_REGISTRATIONS: PosyanduRegistrationRequest[] = [];
