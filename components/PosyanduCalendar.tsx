'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  Bell,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { LandingStore, PosyanduScheduleConfig } from '@/lib/landing-store';

interface MonthData {
  name: string;
  year: number;
  daysInMonth: number;
  startDayOffset: number; // 0 = Senin, 6 = Minggu
  sessionDate: number;
  sessionDayName: string;
}

export default function PosyanduCalendar() {
  const [scheduleConfig, setScheduleConfig] = useState<PosyanduScheduleConfig>(() =>
    LandingStore.getSchedule()
  );

  useEffect(() => {
    const handleUpdate = () => {
      const latest = LandingStore.getSchedule();
      setScheduleConfig(latest);
      setSelectedDay(latest.sessionDate);
    };
    window.addEventListener('posyandu_landing_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('posyandu_landing_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const months: MonthData[] = [
    {
      name: scheduleConfig.sessionMonth || 'Oktober',
      year: scheduleConfig.sessionYear || 2026,
      daysInMonth: 31,
      startDayOffset: 3, // 1 Okt 2026 = Kamis
      sessionDate: scheduleConfig.sessionDate || 15,
      sessionDayName: scheduleConfig.sessionDayName || 'Kamis',
    },
    {
      name: 'November',
      year: 2026,
      daysInMonth: 30,
      startDayOffset: 6, // 1 Nov 2026 = Minggu
      sessionDate: scheduleConfig.sessionDate || 15,
      sessionDayName: 'Minggu',
    },
    {
      name: 'Desember',
      year: 2026,
      daysInMonth: 31,
      startDayOffset: 1, // 1 Des 2026 = Selasa
      sessionDate: scheduleConfig.sessionDate || 15,
      sessionDayName: 'Selasa',
    },
  ];

  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState(scheduleConfig.sessionDate || 15);

  const currentMonth = months[currentMonthIndex];
  const daysOfWeek = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  const totalDays = currentMonth.daysInMonth;
  const blanks = Array.from({ length: currentMonth.startDayOffset }, (_, i) => i);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => (prev === 0 ? months.length - 1 : prev - 1));
    setSelectedDay(15);
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => (prev === months.length - 1 ? 0 : prev + 1));
    setSelectedDay(15);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================================================================= */}
        {/* LEFT COLUMN: INTERACTIVE MONTHLY CALENDAR                         */}
        {/* ================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-rose-200/90 shadow-lg shadow-rose-100/50">
            {/* Calendar Navigation Header */}
            <div className="flex items-center justify-between pb-5 border-b border-rose-100">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-rose-600">
                  Kalender Posyandu
                </p>
                <h3 className="font-serif text-2xl font-bold text-slate-900 mt-1">
                  {currentMonth.name} {currentMonth.year}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevMonth}
                  className="w-9 h-9 rounded-full border border-rose-200 bg-rose-50/50 hover:bg-rose-100 flex items-center justify-center text-slate-700 transition-colors"
                  aria-label="Bulan Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="w-9 h-9 rounded-full border border-rose-200 bg-rose-50/50 hover:bg-rose-100 flex items-center justify-center text-slate-700 transition-colors"
                  aria-label="Bulan Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Same Date Rule Highlight Callout */}
            <div className="my-4 p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50/70 border border-rose-200/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900">
                  Tanggal {currentMonth.sessionDate} {currentMonth.name} ({currentMonth.sessionDayName})
                </p>
                <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                  Jadwal <strong>serentak pada tanggal yang sama</strong> untuk Balita, Ibu Hamil, Ibu Menyusui, dan Lansia di Balai RW 03.
                </p>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] uppercase tracking-wider text-slate-400 mb-2">
              {daysOfWeek.map((day, i) => (
                <div key={i} className={`py-1.5 ${i === 6 ? 'text-rose-500 font-bold' : ''}`}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-xs">
              {blanks.map((_, i) => (
                <div key={`blank-${i}`} className="h-10 sm:h-11" />
              ))}

              {days.map((day) => {
                const isSessionDay = day === currentMonth.sessionDate;
                const isSelected = day === selectedDay;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`h-10 sm:h-11 rounded-2xl flex flex-col items-center justify-center relative transition-all text-xs font-semibold ${
                      isSessionDay
                        ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-300 ring-2 ring-rose-300 ring-offset-2 hover:bg-rose-600'
                        : isSelected
                        ? 'bg-slate-900 text-white font-bold shadow-xs'
                        : 'hover:bg-rose-50 text-slate-700 bg-slate-50/60 border border-slate-100'
                    }`}
                  >
                    <span>{day}</span>
                    {isSessionDay && (
                      <span className="text-[8px] font-black uppercase tracking-tighter leading-none mt-0.5 px-1 py-0.2 rounded bg-white/30 text-white">
                        SERENTAK
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend & Shortcut */}
            <div className="mt-5 pt-4 border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-200" />
                <span className="text-slate-600 font-medium text-[11px]">
                  Hari Posyandu Serentak (Tgl 15)
                </span>
              </div>
              {selectedDay !== currentMonth.sessionDate && (
                <button
                  onClick={() => setSelectedDay(currentMonth.sessionDate)}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline"
                >
                  &rarr; Buka Tanggal {currentMonth.sessionDate}
                </button>
              )}
            </div>
          </div>

          {/* Quick Location & Requirement Info Card */}
          <div className="bg-[#fffdfd] rounded-3xl p-5 border border-rose-200 space-y-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900">Lokasi Pelaksanaan Serentak</p>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  {scheduleConfig.sessionLocation}, {scheduleConfig.address}.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-rose-100">
              <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900">Kelengkapan Wajib Warga</p>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  &bull; <strong>Balita &amp; Bumil:</strong> Wajib membawa Buku KIA (pink).<br />
                  &bull; <strong>Lansia:</strong> Wajib membawa Kartu Kontrol KMS Lansia.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: ACTIVITY FRAME (RINGKAS & TEPAT SASARAN)            */}
        {/* ================================================================= */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-rose-200/90 shadow-xl shadow-rose-100/60 relative overflow-hidden">
            {/* Top Pink Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500" />

            {/* Frame Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-rose-100">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
                  Pelaksanaan Serentak &bull; Binaan Puskesmas Pembina
                </p>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                  {currentMonth.sessionDayName}, {currentMonth.sessionDate} {currentMonth.name} {currentMonth.year}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold mt-1">
                  <span className="flex items-center gap-1 text-rose-600">
                    <Clock className="w-3.5 h-3.5" />
                    {scheduleConfig.sessionTime}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {scheduleConfig.sessionLocation}
                  </span>
                </div>
              </div>

              {/* Direct WhatsApp Reminder Button */}
              <a
                href={`https://wa.me/${scheduleConfig.contactWhatsapp || '6281278901234'}?text=Halo%20Bidan%20Siti%20Rahma,%20saya%20warga%20RW%2003%20ingin%20mengingatkan%20jadwal%20Posyandu%20Serentak%20pada%20${currentMonth.sessionDayName},%20${currentMonth.sessionDate}%20${currentMonth.name}%20${currentMonth.year}%20di%20${encodeURIComponent(scheduleConfig.sessionLocation)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-200 transition-all shrink-0 hover:scale-102 active:scale-98"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Ingatkan via WA</span>
              </a>
            </div>

            {/* Single Concise Unified Activity Box */}
            <div className="mt-6 p-6 rounded-3xl bg-gradient-to-br from-rose-50/50 via-pink-50/20 to-white border border-rose-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                  Sesi Pelayanan Terpadu
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Seluruh Sasaran dalam 1 Kunjungan
                </span>
              </div>

              <div>
                <h4 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                  Pemeriksaan Kesehatan, Timbang Balita, Bumil, Busui &amp; Lansia
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Pelayanan kesehatan komprehensif bagi seluruh keluarga di lingkungan RW 03 yang meliputi:
                </p>
              </div>

              {/* Clean bullet summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-white border border-rose-100 shadow-2xs">
                  <p className="text-xs font-bold text-slate-900">👶 Balita (0 - 59 Bulan)</p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Penimbangan BB/TB digital, kurva KMS WHO, imunisasi lengkap, dan distribusi menu tambahan PMT MBG.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-rose-100 shadow-2xs">
                  <p className="text-xs font-bold text-slate-900">🤰 Ibu Hamil &amp; 🤱 Busui</p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Pemeriksaan antenatal, skrining LiLA (KEK), pembagian tablet Fe (TTD), dan bimbingan menyusui ASI eksklusif.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-rose-100 shadow-2xs sm:col-span-2">
                  <p className="text-xs font-bold text-slate-900">👵 Posyandu Lansia (60+ Tahun)</p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Senam kebugaran lansia bersama, tensi darah, skrining PTM (cek gula darah sewaktu &amp; asam urat), serta konsultasi kesehatan.
                  </p>
                </div>
              </div>

              {/* Footer info within the card */}
              <div className="pt-3 border-t border-rose-100/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 font-medium">
                <span>
                  Penanggung Jawab: <strong>Bdn. Siti Rahma, S.Tr.Keb &amp; Tim Kader</strong>
                </span>
                <span className="text-rose-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  100% Bebas Biaya (Gratis)
                </span>
              </div>
            </div>

            {/* Frame Bottom Links */}
            <div className="mt-6 pt-5 border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <span>Bawa Buku KIA atau Kartu KMS Lansia saat berkunjung.</span>
              <a
                href="#kontak"
                className="font-bold text-rose-600 hover:text-rose-700 underline"
              >
                Pertanyaan seputar sesi? Hubungi Bidan Desa &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
