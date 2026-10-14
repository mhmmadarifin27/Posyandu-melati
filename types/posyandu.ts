export type UserRole = 'petugas' | 'bidan' | 'kader' | 'warga';

export type Gender = 'L' | 'P';

export type StatusGiziBBU = 'Gizi Buruk' | 'Gizi Kurang' | 'Gizi Baik' | 'Risiko Lebih';
export type StatusGiziTBU = 'Sangat Pendek' | 'Pendek' | 'Normal' | 'Tinggi';
export type StatusGiziBBTB = 'Gizi Buruk (Wasting)' | 'Gizi Kurang' | 'Normal' | 'Beresiko Obesitas';

// Status Tren KMS Sesuai Standar Kemenkes RI:
// N   : Naik adekuat (Kenaikan BB sama atau melebihi KBM)
// T   : Tidak naik (Kenaikan BB di bawah KBM atau BB tetap/turun)
// 2T  : Dua kali berturut-turut tidak naik (Weight Faltering) -> Wajib MBG Tambahan & Rujukan
// BGM : Bawah Garis Merah (Z-Score BB/U < -3 SD) -> Sangat Darurat Gizi Buruk
// O   : Bulan lalu tidak datang / absen penimbangan
// B   : Baru pertama kali ditimbang
export type StatusKMS = 'N' | 'T' | '2T' | 'BGM' | 'O' | 'B';

export interface KMSStatusDetail {
  kode: StatusKMS;
  nama: string;
  arti: string;
  warnaBadge: string;
  warnaTeks: string;
  tindakan: string;
}

export const KMS_STATUS_INFO: Record<StatusKMS, KMSStatusDetail> = {
  N: {
    kode: 'N',
    nama: 'Naik Adekuat',
    arti: 'Berat badan naik mengikuti garis pertumbuhan dan kenaikan BB sama atau di atas KBM (Kenaikan Berat Minimal).',
    warnaBadge: 'bg-[#fff5f6] border-[#fce1e4] text-[#80000f]',
    warnaTeks: 'text-[#80000f]',
    tindakan: 'Pertumbuhan optimal. Lanjutkan ASI/MPASI gizi seimbang.',
  },
  T: {
    kode: 'T',
    nama: 'Tidak Naik',
    arti: 'Berat badan naik tetapi tidak mencapai KBM, atau berat badan tetap/turun dibanding bulan lalu.',
    warnaBadge: 'bg-amber-100 border-amber-300 text-amber-800',
    warnaTeks: 'text-amber-700',
    tindakan: 'Waspada. Evaluasi nafsu makan, sanitasi, dan asupan protein.',
  },
  '2T': {
    kode: '2T',
    nama: 'Dua Kali Tidak Naik (Weight Faltering)',
    arti: 'Berat badan 2 bulan berturut-turut TIDAK NAIK. Ini adalah tanda awal gagal tumbuh menuju stunting.',
    warnaBadge: 'bg-red-100 border-red-300 text-red-800',
    warnaTeks: 'text-red-700',
    tindakan: 'DARURAT STUNTING! Wajib intervensi porsi Menu MBG Pemulihan & periksa dokter/puskesmas.',
  },
  BGM: {
    kode: 'BGM',
    nama: 'Bawah Garis Merah (Gizi Buruk)',
    arti: 'Titik berat badan balita berada di bawah garis merah kurva KMS (Z-score BB/U < -3 SD).',
    warnaBadge: 'bg-red-200 border-red-400 text-red-900',
    warnaTeks: 'text-red-800',
    tindakan: 'PRIORITAS UTAMA INTERVENSI! Balita mengalami gizi buruk, wajib PMT/MBG intensif dan rujukan segera.',
  },
  O: {
    kode: 'O',
    nama: 'Absen Bulan Lalu',
    arti: 'Balita tidak hadir pada penimbangan bulan sebelumnya, sehingga tren kenaikan bulan ini belum dapat dihitung.',
    warnaBadge: 'bg-slate-100 border-slate-300 text-slate-700',
    warnaTeks: 'text-slate-600',
    tindakan: 'Edukasi orang tua agar rutin hadir ke Posyandu setiap bulan.',
  },
  B: {
    kode: 'B',
    nama: 'Baru Pertama Kali',
    arti: 'Balita baru pertama kali didaftarkan dan ditimbang di Posyandu Melati.',
    warnaBadge: 'bg-blue-100 border-blue-300 text-blue-800',
    warnaTeks: 'text-blue-700',
    tindakan: 'Beri buku KIA/KMS baru, jadwalkan imunisasi dan pantau bulan depan.',
  },
};

export interface Balita {
  id: string;
  nik: string;
  nama: string;
  jenisKelamin: Gender;
  tanggalLahir: string;
  namaIbu: string;
  namaAyah: string;
  alamat: string;
  rt: string;
  rw: string;
  posyandu: string; // Selalu 'Posyandu Melati'
  noHp: string;
  desilEkonomi: number; // 1 (sangat miskin) - 5 (mampu)
  statusBansos: boolean;
  createdAt: string;
}

export interface PemeriksaanBalita {
  id: string;
  balitaId: string;
  tanggalPeriksa: string;
  usiaBulan: number;
  beratBadan: number; // kg
  tinggiBadan: number; // cm
  lingkarKepala: number; // cm
  caraUkur: 'terlentang' | 'berdiri';
  zScoreBBU: number;
  zScoreTBU: number;
  zScoreBBTB: number;
  statusBBU: StatusGiziBBU;
  statusTBU: StatusGiziTBU;
  statusBBTB: StatusGiziBBTB;
  statusKMS: StatusKMS;
  kenaikanBB: number; // kg dibanding bulan lalu
  kbm: number; // Kenaikan Berat Minimal (Kemenkes)
  vitaminA: boolean;
  obatCacing: boolean;
  imunisasi: string;
  keluhan: string;
  catatanKader: string;
}

export interface IbuHamil {
  id: string;
  nik: string;
  nama: string;
  tanggalLahir: string;
  namaSuami: string;
  alamat: string;
  posyandu: string;
  noHp: string;
  hpht: string; // Hari Pertama Haid Terakhir
  hpl: string; // Hari Perkiraan Lahir
  usiaKehamilanMinggu: number;
  gravida: number; // Hamil ke-
  partus: number; // Melahirkan
  abortus: number; // Keguguran
  lilaAwal: number; // cm
  lilaSaatIni: number; // cm
  hb: number; // g/dL
  statusKEK: boolean; // LiLA < 23.5 cm
  statusAnemia: boolean; // Hb < 11 g/dL
  desilEkonomi: number;
  bukuKIA: boolean;
  konsumsiTTD: number; // Jumlah tablet tambah darah
}

// -------------------------------------------------------------
// DATA MODEL IBU MENYUSUI (BUSUI)
// -------------------------------------------------------------
export interface IbuMenyusui {
  id: string;
  nik: string;
  nama: string;
  tanggalLahir: string;
  namaSuami: string;
  alamat: string;
  posyandu: string; // Posyandu Melati
  noHp: string;
  namaBayi: string;
  usiaBayiBulan: number;
  statusAsiEksklusif: boolean; // Usia 0-6 bln wajib ASI Eksklusif
  lila: number; // cm
  statusKEK: boolean; // LiLA < 23.5 cm
  vitaminANifas: boolean; // 2 kapsul vitamin A merah nifas
  konsumsiTTD: number; // Tablet tambah darah pasca salin
  keluhan: string;
  desilEkonomi: number;
  createdAt: string;
}

// -------------------------------------------------------------
// DATA MODEL POSYANDU LANSIA (Lanjut Usia)
// -------------------------------------------------------------
export interface Lansia {
  id: string;
  nik: string;
  nama: string;
  jenisKelamin: Gender;
  tanggalLahir: string;
  usiaTahun: number;
  namaKeluarga: string;
  alamat: string;
  noHp: string;
  posyandu: string; // Posyandu Melati
  golonganDarah?: string;
  riwayatPenyakit: string[];
  createdAt: string;
}

export interface PemeriksaanLansia {
  id: string;
  lansiaId: string;
  tanggalPeriksa: string;
  beratBadan: number; // kg
  tinggiBadan: number; // cm
  imt: number; // Indeks Massa Tubuh (BB / (TB/100)^2)
  statusGizi: 'Kurus' | 'Normal' | 'Kelebihan Berat' | 'Obesitas';
  tensiSistolik: number; // mmHg
  tensiDiastolik: number; // mmHg
  statusTensi: 'Hipotensi' | 'Normal' | 'Pre-Hipertensi' | 'Hipertensi';
  gulaDarah: number; // mg/dL (GDS)
  statusGulaDarah: 'Normal' | 'Pre-Diabetes' | 'Tinggi (Diabetes)';
  kolesterol?: number; // mg/dL
  asamUrat?: number; // mg/dL
  keluhan: string;
  tindakanEdukasi: string;
  petugas: string;
}

export interface MenuMBG {
  id: string;
  namaMenu: string;
  kategori: 'Balita Gizi Kurang' | 'Balita Stunting' | 'Bumil KEK' | 'Busui Gizi Tambahan' | 'Lansia Gizi Khusus' | 'Gizi Seimbang Umum';
  targetSasaran: 'Balita' | 'Bumil' | 'Busui' | 'Lansia' | 'Semua';
  deskripsi: string;
  komposisi: string[];
  kalori: number; // kkal
  protein: number; // gram
  zatBesi: number; // mg
  anjuranPemberian: string;
}

export interface RekomendasiResult {
  sasaranId: string;
  nama: string;
  jenisSasaran: 'Balita' | 'Bumil' | 'Busui' | 'Lansia';
  usia: string;
  posyandu: string;
  skorPreferensi: number; // Nilai Vi SAW
  rank: number;
  prioritas: 'Sangat Mendesak' | 'Prioritas Tinggi' | 'Prioritas Sedang' | 'Pemantauan Rutin';
  alasanKlinis: string[];
  indikatorKunci: {
    zScoreBBU?: number;
    statusKMS?: StatusKMS;
    lila?: number;
    hb?: number;
    tensi?: string;
    gulaDarah?: number;
    desilEkonomi: number;
  };
  rekomendasiMenu: MenuMBG;
  terpilihMBG: boolean;
}

export interface SAWStepDetail {
  kriteria: { kode: string; nama: string; bobot: number; jenis: 'benefit' | 'cost' }[];
  alternatif: string[];
  matriksKeputusan: number[][]; // X
  matriksNormalisasi: number[][]; // R
  matriksTerbobot: number[][]; // W * R
  skorAkhir: { id: string; nama: string; skor: number; rank: number }[];
}
