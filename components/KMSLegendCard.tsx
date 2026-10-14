'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, AlertTriangle, ShieldAlert, CheckCircle2, Info } from 'lucide-react';
import { KMS_STATUS_INFO, StatusKMS } from '@/types/posyandu';

export default function KMSLegendCard() {
  const [isOpen, setIsOpen] = useState(true);

  const statuses: StatusKMS[] = ['N', 'T', '2T', 'BGM', 'O', 'B'];

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#fce1e4] shadow-sm space-y-4">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#fff5f6] text-[#80000f] border border-[#fce1e4] flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5 text-[#80000f]" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
              <span>Panduan Lengkap Status Tren Pertumbuhan KMS (Kemenkes RI)</span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-[#fce1e4] text-[#80000f] border border-[#f8c8c8]">
                Penting
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Arti kode N, T, 2T (Weight Faltering), BGM, O, dan B pada Kartu Menuju Sehat balita
            </p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-[#fff5f6] transition-colors">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs">
          {statuses.map((code) => {
            const info = KMS_STATUS_INFO[code];
            const isDanger = code === '2T' || code === 'BGM';
            const isWarning = code === 'T';

            return (
              <div
                key={code}
                className={`p-4 rounded-2xl border transition-all ${
                  isDanger
                    ? 'bg-[#fff5f6] border-[#fce1e4] shadow-sm'
                    : isWarning
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-xl border ${info.warnaBadge}`}
                  >
                    KODE: {info.kode}
                  </span>
                  {isDanger && (
                    <span className="text-[10px] font-bold text-[#80000f] flex items-center gap-1 bg-[#fce1e4] px-2 py-0.5 rounded-full border border-[#f8c8c8]">
                      <ShieldAlert className="w-3 h-3" /> Wajib MBG
                    </span>
                  )}
                  {code === 'N' && (
                    <span className="text-[10px] font-bold text-[#80000f] flex items-center gap-1 bg-[#fce1e4] px-2 py-0.5 rounded-full border border-[#f8c8c8]">
                      <CheckCircle2 className="w-3 h-3 text-[#80000f]" /> Optimal
                    </span>
                  )}
                </div>

                <div className="font-bold text-slate-900 text-xs mb-1">
                  {info.nama}
                </div>

                <p className="text-slate-600 text-[11px] leading-relaxed mb-2.5">
                  {info.arti}
                </p>

                <div className="pt-2 border-t border-slate-200/60 text-[11px] font-medium text-slate-700">
                  <span className="font-bold text-slate-900">Tindakan Kader: </span>
                  {info.tindakan}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
