'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
} from 'recharts';
import { WHO_BBU_BOYS, WHO_BBU_GIRLS } from '@/lib/who-growth-data';
import { PemeriksaanBalita, Gender } from '@/types/posyandu';

interface KMSChartProps {
  gender: Gender;
  childName: string;
  historyPemeriksaan: PemeriksaanBalita[];
}

export default function KMSChart({
  gender,
  childName,
  historyPemeriksaan,
}: KMSChartProps) {
  const whoTable = gender === 'L' ? WHO_BBU_BOYS : WHO_BBU_GIRLS;

  // Gabungkan kurva WHO dengan titik riwayat anak
  const chartData = whoTable.map((point) => {
    // Cari pemeriksaan anak di usia ini jika ada
    const match = historyPemeriksaan.find((p) => p.usiaBulan === point.age);

    return {
      age: point.age,
      sd3pos: point.sd3pos,
      sd2pos: point.sd2pos,
      median: point.median,
      sd2neg: point.sd2neg,
      sd3neg: point.sd3neg,
      beratAnak: match ? match.beratBadan : null,
      statusKMS: match ? match.statusKMS : null,
      zScore: match ? match.zScoreBBU : null,
      tglPeriksa: match ? match.tanggalPeriksa : null,
    };
  });

  return (
    <div className="w-full bg-white rounded-3xl p-6 border border-[#fce1e4] shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#fce1e4] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base md:text-lg">
              Kurva Pertumbuhan E-KMS (Standar WHO)
            </h3>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                gender === 'L'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-[#fff5f6] text-[#80000f] border border-[#fce1e4]'
              }`}
            >
              {gender === 'L' ? 'Laki-laki (KMS Digital)' : 'Perempuan (KMS Digital)'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Plotting Berat Badan menurut Umur (BB/U) untuk {childName}
          </p>
        </div>

        {/* Legend status gizi */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#80000f]"></span>
            <span>Median (Gizi Baik WHO)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>-2 SD (Gizi Kurang)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-700"></span>
            <span>-3 SD (BGM / Gizi Buruk)</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-[#80000f]">
            <span className="w-3 h-3 rounded-full bg-[#80000f] border-2 border-white shadow-xs"></span>
            <span>Pertumbuhan Anak</span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-80 md:h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ffe4e6" />
            <XAxis
              dataKey="age"
              label={{
                value: 'Umur Balita (Bulan)',
                position: 'insideBottom',
                offset: -12,
                fontSize: 12,
                fill: '#64748b',
              }}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              domain={[1, 20]}
              label={{
                value: 'Berat Badan (kg)',
                angle: -90,
                position: 'insideLeft',
                offset: 15,
                fontSize: 12,
                fill: '#64748b',
              }}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-xs border border-[#80000f] max-w-xs backdrop-blur">
                      <div className="font-bold text-[#fce1e4] border-b border-slate-700 pb-1 mb-1.5">
                        Usia: {data.age} Bulan
                      </div>
                      <div className="space-y-1">
                        {data.beratAnak !== null ? (
                          <>
                            <div className="font-semibold text-white text-sm">
                              BB Anak: {data.beratAnak} kg
                            </div>
                            <div className="text-slate-300">
                              Z-Score: <strong>{data.zScore} SD</strong>
                            </div>
                            <div className="text-slate-300">
                              Status KMS:{' '}
                              <span
                                className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                  data.statusKMS === 'N'
                                    ? 'bg-[#80000f]/50 text-[#fce1e4]'
                                    : data.statusKMS === '2T' || data.statusKMS === 'BGM'
                                    ? 'bg-red-600/40 text-red-300'
                                    : 'bg-amber-500/30 text-amber-300'
                                }`}
                              >
                                {data.statusKMS}
                              </span>
                            </div>
                            {data.tglPeriksa && (
                              <div className="text-[10px] text-slate-400 mt-1">
                                Tanggal: {data.tglPeriksa}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-slate-400 italic">Belum ada penimbangan pada usia ini</div>
                        )}
                        <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 grid grid-cols-2 gap-x-2">
                          <div>+2 SD: {data.sd2pos} kg</div>
                          <div>Median: {data.median} kg</div>
                          <div>-2 SD: {data.sd2neg} kg</div>
                          <div>-3 SD (BGM): {data.sd3neg} kg</div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Garis-garis Kurva Standar WHO */}
            <Line
              type="monotone"
              dataKey="sd2pos"
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
              name="+2 SD"
            />
            <Line
              type="monotone"
              dataKey="median"
              stroke="#80000f"
              strokeWidth={2.5}
              dot={false}
              name="Median (Gizi Baik WHO)"
            />
            <Line
              type="monotone"
              dataKey="sd2neg"
              stroke="#fb923c"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
              name="-2 SD (Gizi Kurang)"
            />
            <Line
              type="monotone"
              dataKey="sd3neg"
              stroke="#be123c"
              strokeWidth={2}
              dot={false}
              name="-3 SD (Bawah Garis Merah)"
            />

            {/* Titik Pertumbuhan Real Anak Balita (Garis Maroon dengan Titik Maroon) */}
            <Line
              type="monotone"
              dataKey="beratAnak"
              stroke="#80000f"
              strokeWidth={3.5}
              dot={{
                r: 6,
                fill: '#80000f',
                stroke: '#ffffff',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 8,
                fill: '#66000c',
                stroke: '#fce1e4',
                strokeWidth: 3,
              }}
              connectNulls={true}
              name="Pertumbuhan Balita"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Info Petunjuk Membaca KMS */}
      <div className="mt-4 p-3.5 bg-[#fff5f6] rounded-2xl border border-[#fce1e4] text-xs text-[#80000f] flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#66000c]">Keterangan KMS:</span>
          <span className="text-[#80000f]">
            <strong>N</strong> = Naik adekuat, <strong>T</strong> = Tidak naik (dibawah KBM),{' '}
            <strong>2T</strong> = 2x berturut-turut tidak naik (Weight Faltering - Wajib MBG),{' '}
            <strong>BGM</strong> = Bawah Garis Merah (Gizi Buruk).
          </span>
        </div>
      </div>
    </div>
  );
}
