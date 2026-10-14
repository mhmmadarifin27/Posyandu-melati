// Standar Pertumbuhan Anak WHO / Permenkes No. 2 Tahun 2020
// Indikator Berat Badan menurut Umur (BB/U) Balita 0 - 36 Bulan (Laki-laki & Perempuan)

export interface WHOSDPoint {
  age: number; // bulan
  sd3neg: number; // -3 SD (Gizi Buruk / BGM)
  sd2neg: number; // -2 SD (Gizi Kurang)
  sd1neg: number; // -1 SD
  median: number; // 0 SD (Gizi Baik)
  sd1pos: number; // +1 SD
  sd2pos: number; // +2 SD (Risiko Lebih)
  sd3pos: number; // +3 SD (Gizi Lebih)
}

// Data WHO BB/U Laki-laki (0 - 36 bulan)
export const WHO_BBU_BOYS: WHOSDPoint[] = [
  { age: 0, sd3neg: 2.1, sd2neg: 2.5, sd1neg: 2.9, median: 3.3, sd1pos: 3.9, sd2pos: 4.4, sd3pos: 5.0 },
  { age: 2, sd3neg: 4.3, sd2neg: 4.9, sd1neg: 5.6, median: 6.3, sd1pos: 7.1, sd2pos: 8.0, sd3pos: 8.9 },
  { age: 4, sd3neg: 5.3, sd2neg: 5.9, sd1neg: 6.7, median: 7.5, sd1pos: 8.4, sd2pos: 9.3, sd3pos: 10.2 },
  { age: 6, sd3neg: 5.9, sd2neg: 6.7, sd1neg: 7.5, median: 8.3, sd1pos: 9.3, sd2pos: 10.2, sd3pos: 11.2 },
  { age: 8, sd3neg: 6.4, sd2neg: 7.2, sd1neg: 8.1, median: 9.0, sd1pos: 10.0, sd2pos: 11.0, sd3pos: 12.0 },
  { age: 10, sd3neg: 6.9, sd2neg: 7.7, sd1neg: 8.6, median: 9.5, sd1pos: 10.6, sd2pos: 11.6, sd3pos: 12.7 },
  { age: 12, sd3neg: 7.3, sd2neg: 8.1, sd1neg: 9.0, median: 10.0, sd1pos: 11.1, sd2pos: 12.2, sd3pos: 13.3 },
  { age: 14, sd3neg: 7.6, sd2neg: 8.5, sd1neg: 9.4, median: 10.4, sd1pos: 11.6, sd2pos: 12.7, sd3pos: 13.9 },
  { age: 16, sd3neg: 8.0, sd2neg: 8.8, sd1neg: 9.8, median: 10.8, sd1pos: 12.0, sd2pos: 13.2, sd3pos: 14.4 },
  { age: 18, sd3neg: 8.3, sd2neg: 9.2, sd1neg: 10.2, median: 11.2, sd1pos: 12.4, sd2pos: 13.7, sd3pos: 15.0 },
  { age: 20, sd3neg: 8.6, sd2neg: 9.5, sd1neg: 10.5, median: 11.6, sd1pos: 12.9, sd2pos: 14.1, sd3pos: 15.5 },
  { age: 22, sd3neg: 8.9, sd2neg: 9.8, sd1neg: 10.9, median: 12.0, sd1pos: 13.3, sd2pos: 14.6, sd3pos: 16.0 },
  { age: 24, sd3neg: 9.2, sd2neg: 10.1, sd1neg: 11.2, median: 12.4, sd1pos: 13.7, sd2pos: 15.1, sd3pos: 16.5 },
  { age: 28, sd3neg: 9.7, sd2neg: 10.7, sd1neg: 11.8, median: 13.1, sd1pos: 14.5, sd2pos: 16.0, sd3pos: 17.5 },
  { age: 32, sd3neg: 10.2, sd2neg: 11.2, sd1neg: 12.4, median: 13.8, sd1pos: 15.3, sd2pos: 16.8, sd3pos: 18.5 },
  { age: 36, sd3neg: 10.7, sd2neg: 11.8, sd1neg: 13.0, median: 14.4, sd1pos: 16.0, sd2pos: 17.7, sd3pos: 19.5 },
];

// Data WHO BB/U Perempuan (0 - 36 bulan)
export const WHO_BBU_GIRLS: WHOSDPoint[] = [
  { age: 0, sd3neg: 2.0, sd2neg: 2.4, sd1neg: 2.8, median: 3.2, sd1pos: 3.7, sd2pos: 4.2, sd3pos: 4.8 },
  { age: 2, sd3neg: 3.9, sd2neg: 4.5, sd1neg: 5.1, median: 5.8, sd1pos: 6.6, sd2pos: 7.5, sd3pos: 8.4 },
  { age: 4, sd3neg: 4.8, sd2neg: 5.4, sd1neg: 6.1, median: 7.0, sd1pos: 7.9, sd2pos: 8.8, sd3pos: 9.8 },
  { age: 6, sd3neg: 5.5, sd2neg: 6.2, sd1neg: 7.0, median: 7.8, sd1pos: 8.8, sd2pos: 9.8, sd3pos: 10.8 },
  { age: 8, sd3neg: 6.0, sd2neg: 6.7, sd1neg: 7.6, median: 8.5, sd1pos: 9.5, sd2pos: 10.6, sd3pos: 11.7 },
  { age: 10, sd3neg: 6.4, sd2neg: 7.2, sd1neg: 8.1, median: 9.0, sd1pos: 10.1, sd2pos: 11.3, sd3pos: 12.4 },
  { age: 12, sd3neg: 6.8, sd2neg: 7.6, sd1neg: 8.5, median: 9.5, sd1pos: 10.7, sd2pos: 11.9, sd3pos: 13.1 },
  { age: 14, sd3neg: 7.1, sd2neg: 8.0, sd1neg: 8.9, median: 10.0, sd1pos: 11.2, sd2pos: 12.4, sd3pos: 13.7 },
  { age: 16, sd3neg: 7.5, sd2neg: 8.3, sd1neg: 9.3, median: 10.4, sd1pos: 11.7, sd2pos: 13.0, sd3pos: 14.3 },
  { age: 18, sd3neg: 7.8, sd2neg: 8.7, sd1neg: 9.7, median: 10.8, sd1pos: 12.1, sd2pos: 13.5, sd3pos: 14.9 },
  { age: 20, sd3neg: 8.1, sd2neg: 9.0, sd1neg: 10.1, median: 11.2, sd1pos: 12.6, sd2pos: 14.0, sd3pos: 15.5 },
  { age: 22, sd3neg: 8.4, sd2neg: 9.4, sd1neg: 10.4, median: 11.6, sd1pos: 13.1, sd2pos: 14.5, sd3pos: 16.0 },
  { age: 24, sd3neg: 8.7, sd2neg: 9.7, sd1neg: 10.8, median: 12.0, sd1pos: 13.5, sd2pos: 15.0, sd3pos: 16.6 },
  { age: 28, sd3neg: 9.2, sd2neg: 10.2, sd1neg: 11.4, median: 12.7, sd1pos: 14.3, sd2pos: 15.9, sd3pos: 17.6 },
  { age: 32, sd3neg: 9.7, sd2neg: 10.8, sd1neg: 12.0, median: 13.4, sd1pos: 15.1, sd2pos: 16.8, sd3pos: 18.6 },
  { age: 36, sd3neg: 10.2, sd2neg: 11.3, sd1neg: 12.6, median: 14.1, sd1pos: 15.8, sd2pos: 17.6, sd3pos: 19.6 },
];

// Menghitung Z-Score BB/U Berdasarkan Standar WHO
export function calculateZScoreBBU(gender: 'L' | 'P', ageMonths: number, weightKg: number): number {
  const table = gender === 'L' ? WHO_BBU_BOYS : WHO_BBU_GIRLS;
  
  // Cari titik terdekat berdasarkan usia
  let closest = table[0];
  let minDiff = Math.abs(table[0].age - ageMonths);
  for (const point of table) {
    const diff = Math.abs(point.age - ageMonths);
    if (diff < minDiff) {
      minDiff = diff;
      closest = point;
    }
  }

  const median = closest.median;
  let zScore = 0;
  if (weightKg >= median) {
    const sd = closest.sd1pos - median;
    zScore = (weightKg - median) / sd;
  } else {
    const sd = median - closest.sd1neg;
    zScore = (weightKg - median) / sd;
  }

  return Math.round(zScore * 100) / 100;
}

// Menentukan Kategori Status Gizi BB/U
export function getStatusGiziBBU(zScore: number): 'Gizi Buruk' | 'Gizi Kurang' | 'Gizi Baik' | 'Risiko Lebih' {
  if (zScore < -3) return 'Gizi Buruk';
  if (zScore < -2) return 'Gizi Kurang';
  if (zScore <= 2) return 'Gizi Baik';
  return 'Risiko Lebih';
}

// Standar Kenaikan Berat Minimal (KBM) Kemenkes RI (gram per bulan)
export const KBM_KEMENKES = [
  { bulan: 1, kbmGram: 800 },
  { bulan: 2, kbmGram: 900 },
  { bulan: 3, kbmGram: 800 },
  { bulan: 4, kbmGram: 600 },
  { bulan: 5, kbmGram: 500 },
  { bulan: 6, kbmGram: 400 },
  { bulan: 7, kbmGram: 300 },
  { bulan: 8, kbmGram: 300 },
  { bulan: 9, kbmGram: 300 },
  { bulan: 10, kbmGram: 200 },
  { bulan: 11, kbmGram: 200 },
  { bulan: 12, kbmGram: 200 },
];

export function getKBMGram(bulan: number): number {
  if (bulan <= 0) return 800;
  if (bulan >= 12) return 200;
  const found = KBM_KEMENKES.find((k) => k.bulan === bulan);
  return found ? found.kbmGram : 200;
}
