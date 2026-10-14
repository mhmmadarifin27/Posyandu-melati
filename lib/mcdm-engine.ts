import { SAWStepDetail } from '@/types/posyandu';

export interface SAWCriterion {
  kode: string;
  nama: string;
  bobot: number; // 0.0 - 1.0 (total sum = 1.0)
  jenis: 'benefit' | 'cost';
  deskripsi: string;
}

export interface CandidateItem {
  id: string;
  nama: string;
  subjek: 'Balita' | 'Bumil' | 'Busui' | 'Lansia';
  posyandu: string; // 'Posyandu Melati'
  usia: string;
  kriteriaValues: Record<string, number>;
  alasanKlinis: string[];
  rawDetail: Record<string, any>;
}

// 5 Kriteria Standar Posyandu untuk Seleksi Menu Tambahan MBG (SAW)
export const KRITERIA_MBG: SAWCriterion[] = [
  {
    kode: 'C1',
    nama: 'Tingkat Defisit Status Gizi (Z-Score / LiLA Bumil-Busui / IMT Lansia)',
    bobot: 0.30,
    jenis: 'benefit',
    deskripsi: 'Semakin parah defisit gizi (Z-score < -2 SD / LiLA < 23.5 cm), semakin tinggi prioritas',
  },
  {
    kode: 'C2',
    nama: 'Tren Penurunan Pertumbuhan / Weight Faltering / ASI Eksklusif',
    bobot: 0.25,
    jenis: 'benefit',
    deskripsi: 'Weight Faltering (100), BGM (95), Gangguan ASI (85), Normal N (20)',
  },
  {
    kode: 'C3',
    nama: 'Komplikasi Fisik & Anemia (Wasting / Anemia Bumil / Tensi Lansia)',
    bobot: 0.20,
    jenis: 'benefit',
    deskripsi: 'Status sangat kurus, anemia, atau hipertensi/gula darah tinggi lansia',
  },
  {
    kode: 'C4',
    nama: 'Kondisi Ekonomi Keluarga (Desil DTKS)',
    bobot: 0.15,
    jenis: 'benefit',
    deskripsi: 'Prioritas keluarga prasejahtera: Desil 1 (100), Desil 2 (80), Desil 3 (60), Desil 4/5 (30)',
  },
  {
    kode: 'C5',
    nama: 'Riwayat Penyakit & Keluhan Fisik',
    bobot: 0.10,
    jenis: 'benefit',
    deskripsi: 'Keluhan batuk kronis, diare, lemas pasca nifas, atau nyeri sendi',
  },
];

function round(num: number, decimals: number = 4): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

export function calculateSAW(
  candidates: CandidateItem[],
  criteria: SAWCriterion[] = KRITERIA_MBG
): {
  ranked: { id: string; nama: string; skor: number; rank: number }[];
  steps: SAWStepDetail;
} {
  const m = candidates.length;
  const n = criteria.length;

  if (m === 0) {
    return {
      ranked: [],
      steps: {
        kriteria: criteria,
        alternatif: [],
        matriksKeputusan: [],
        matriksNormalisasi: [],
        matriksTerbobot: [],
        skorAkhir: [],
      },
    };
  }

  // 1. Matriks Keputusan X (m x n)
  const X: number[][] = [];
  for (let i = 0; i < m; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      const code = criteria[j].kode;
      row.push(candidates[i].kriteriaValues[code] ?? 0);
    }
    X.push(row);
  }

  // Cari Nilai Maksimal dan Minimal tiap kolom kriteria
  const colMax: number[] = new Array(n).fill(-Infinity);
  const colMin: number[] = new Array(n).fill(Infinity);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < m; i++) {
      if (X[i][j] > colMax[j]) colMax[j] = X[i][j];
      if (X[i][j] < colMin[j]) colMin[j] = X[i][j];
    }
  }

  // 2. Matriks Normalisasi R
  const R: number[][] = [];
  const W_R: number[][] = [];
  for (let i = 0; i < m; i++) {
    const rowR: number[] = [];
    const rowWR: number[] = [];
    for (let j = 0; j < n; j++) {
      let normVal = 0;
      if (criteria[j].jenis === 'benefit') {
        normVal = colMax[j] > 0 ? X[i][j] / colMax[j] : 0;
      } else {
        normVal = X[i][j] > 0 ? colMin[j] / X[i][j] : 1;
      }
      normVal = round(normVal, 4);
      rowR.push(normVal);
      rowWR.push(round(normVal * criteria[j].bobot, 4));
    }
    R.push(rowR);
    W_R.push(rowWR);
  }

  // 3. Nilai Preferensi Vi = Σ (w_j * r_ij)
  const scores: { id: string; nama: string; skor: number; rank: number }[] = [];
  for (let i = 0; i < m; i++) {
    let vi = 0;
    for (let j = 0; j < n; j++) {
      vi += R[i][j] * criteria[j].bobot;
    }
    scores.push({
      id: candidates[i].id,
      nama: candidates[i].nama,
      skor: round(vi, 4),
      rank: 0,
    });
  }

  scores.sort((a, b) => b.skor - a.skor);
  scores.forEach((item, index) => {
    item.rank = index + 1;
  });

  const steps: SAWStepDetail = {
    kriteria: criteria,
    alternatif: candidates.map((c) => c.nama),
    matriksKeputusan: X,
    matriksNormalisasi: R,
    matriksTerbobot: W_R,
    skorAkhir: scores,
  };

  return { ranked: scores, steps };
}
