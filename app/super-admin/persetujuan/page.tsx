'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ClipboardCheck,
  Building2,
  Search,
  MapPin,
  Phone,
  User,
  Mail,
  Clock,
  MessageSquare,
  Check,
  X,
  ExternalLink,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import { PosyanduStore } from '@/lib/supabase';
import { PosyanduRegistrationRequest } from '@/types/posyandu';
import { toast } from '@/components/ui/custom-toast';

export default function SuperAdminPersetujuanPage() {
  const [registrations, setRegistrations] = useState<PosyanduRegistrationRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = () => {
    setRegistrations(PosyanduStore.getRegistrations());
  };

  const handleSyncCloud = async (showNotification = false) => {
    setIsSyncing(true);
    try {
      await PosyanduStore.syncFromSupabase();
      loadData();
      if (showNotification) {
        toast.success(
          'Sinkronisasi Berhasil',
          'Data pendaftaran dari Supabase Cloud telah diperbarui.'
        );
      }
    } catch (e) {
      console.warn('Sync cloud error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
    handleSyncCloud(false);
    window.addEventListener('posyandu_registrations_updated', loadData);
    window.addEventListener('posyandu_tenants_updated', loadData);
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('posyandu_registrations_updated', loadData);
      window.removeEventListener('posyandu_tenants_updated', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, []);

  const pendingCount = registrations.filter((r) => r.status === 'pending').length;
  const approvedCount = registrations.filter((r) => r.status === 'approved').length;
  const rejectedCount = registrations.filter((r) => r.status === 'rejected').length;

  const handleApprove = (req: PosyanduRegistrationRequest) => {
    toast.confirm({
      title: 'Setujui Pendaftaran Posyandu?',
      description: `Menyetujui pendaftaran ${req.namaPosyandu} akan langsung membuatkan unit tenant aktif dan akun login Admin Posyandu (${req.emailAdmin}).`,
      confirmText: 'Ya, Setujui & Aktifkan',
      cancelText: 'Batal',
      type: 'info',
      onConfirm: () => {
        const result = PosyanduStore.approveRegistration(req.id);
        if (result) {
          toast.success(
            'Posyandu Berhasil Diaktifkan!',
            `Unit ${req.namaPosyandu} dan akun admin telah aktif. Silakan kirim detail akun ke WhatsApp Ketua Posyandu.`
          );
          loadData();
        }
      },
    });
  };

  const handleReject = (req: PosyanduRegistrationRequest) => {
    toast.confirm({
      title: 'Tolak Pendaftaran?',
      description: `Apakah Anda yakin ingin menolak permohonan pendaftaran ${req.namaPosyandu}?`,
      confirmText: 'Ya, Tolak',
      cancelText: 'Batal',
      type: 'danger',
      onConfirm: () => {
        PosyanduStore.rejectRegistration(req.id);
        toast.info('Pendaftaran Ditolak', `Permohonan ${req.namaPosyandu} telah ditandai ditolak.`);
        loadData();
      },
    });
  };

  const handleSendWhatsAppConfirmation = (req: PosyanduRegistrationRequest) => {
    let cleanPhone = req.noWhatsapp.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('62')) {
      cleanPhone = '62' + cleanPhone;
    }

    const portalUrl =
      typeof window !== 'undefined' ? `${window.location.origin}/login` : 'http://localhost:3000/login';

    const message = `Halo Ibu/Bapak ${req.namaKetua},

Kabar baik! Permohonan pendaftaran *${req.namaPosyandu}* telah diverifikasi dan *DISETUJUI (ACC)* oleh Super Admin Puskesmas di platform PosyanduGo.

Berikut adalah detail akun login Admin Posyandu Anda:
• Portal Login: ${portalUrl}
• Email Login: *${req.emailAdmin}*
• Kata Sandi: *${req.passwordAdmin}*
• Wilayah: RW ${req.rw}, Kel. ${req.kelurahan}, ${req.kotaKab}

Silakan login menggunakan kredensial di atas untuk mulai mencatat antropometri balita (e-KMS WHO), ibu hamil, lansia, dan kalkulasi rekomendasi menu MBG (SAW).

Terima kasih.
Salam hangat,
_Super Admin Puskesmas Pembina_`;

    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    toast.success('Membuka WhatsApp', `Menghubungkan ke ${req.noWhatsapp}...`);
  };

  const filteredRegistrations = registrations.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) {
      return false;
    }
    const query = searchQuery.toLowerCase();
    return (
      r.namaPosyandu.toLowerCase().includes(query) ||
      r.namaKetua.toLowerCase().includes(query) ||
      r.emailAdmin.toLowerCase().includes(query) ||
      r.noWhatsapp.includes(query) ||
      r.kelurahan.toLowerCase().includes(query) ||
      r.rw.includes(query)
    );
  });

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#fce1e4] selection:text-[#80000f]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {/* Breadcrumb & Lokasi Navigasi */}
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/super-admin/dashboard' },
              { label: 'Master Unit Posyandu', href: '/super-admin/posyandu' },
              { label: 'Persetujuan & ACC' },
            ]}
            backHref="/super-admin/posyandu"
            backLabel="Kembali ke Master Unit"
          />

          {/* Header Card */}
          <div
            className="p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#f8c8c8]"
            style={{
              background: 'linear-gradient(135deg, #4a0009 0%, #80000f 50%, #66000c 100%)',
              backgroundColor: '#80000f',
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30">
                  Verifikasi Pendaftaran
                </span>
                {pendingCount > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white border border-rose-400 animate-pulse">
                    {pendingCount} Menunggu ACC
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                    Semua Terverifikasi
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/90 border border-white/20">
                  Total {registrations.length} Pendaftar
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-serif">
                Persetujuan &amp; ACC Posyandu Baru
              </h1>
              <p className="text-xs sm:text-sm text-red-100 max-w-2xl leading-relaxed">
                Verifikasi permohonan pendaftaran mandiri dari calon pengurus unit Posyandu di landing page publik. Setujui untuk mengaktifkan akun dan kirim kredensial langsung ke WhatsApp.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleSyncCloud(true)}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all hover:scale-102 active:scale-98 shrink-0 cursor-pointer disabled:opacity-50"
                title="Tarik data pendaftaran terbaru dari Supabase Cloud"
              >
                <RotateCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkron...' : 'Sinkron Cloud'}</span>
              </button>
              <Link
                href="/super-admin/posyandu"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-[#fff5f6] text-[#80000f] font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all hover:scale-102 active:scale-98 shrink-0"
              >
                <Building2 className="w-4 h-4 text-[#80000f]" />
                <span>Lihat Master Unit Posyandu</span>
              </Link>
            </div>
          </div>

          {/* Quick Filter Status Tabs & Search Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-[#80000f] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({registrations.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <span>Menunggu ACC ({pendingCount})</span>
                {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('approved')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  statusFilter === 'approved'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Disetujui ({approvedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('rejected')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  statusFilter === 'rejected'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
                }`}
              >
                Ditolak ({rejectedCount})
              </button>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama posyandu, ketua, WA, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#80000f] focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Registration Queue Cards */}
          {filteredRegistrations.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#fff0f2] text-[#80000f] flex items-center justify-center mx-auto font-bold text-2xl">
                📬
              </div>
              <h3 className="font-serif font-black text-lg text-slate-900">
                Tidak Ada Antrean Pendaftaran
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {statusFilter === 'pending'
                  ? 'Semua pendaftaran telah diverifikasi. Ketika calon pengurus posyandu baru mendaftar dari formulir publik, permohonan akan masuk ke sini.'
                  : 'Tidak ada data pendaftaran yang sesuai dengan filter pencarian Anda.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredRegistrations.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between hover:border-[#f8c8c8] transition-colors"
                >
                  <div className="space-y-3">
                    {/* Status Badge & Timestamp */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          req.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}
                      >
                        {req.status === 'pending'
                          ? '⏳ Menunggu ACC Super Admin'
                          : req.status === 'approved'
                          ? '✅ Disetujui & Aktif'
                          : '❌ Ditolak'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {req.createdAt}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif font-black text-xl text-slate-900">
                        {req.namaPosyandu}
                      </h3>
                      <p className="text-xs text-[#80000f] font-bold mt-0.5">
                        Puskesmas Pembina: {req.puskesmas || 'UPTD Puskesmas Pembina'}
                      </p>
                    </div>

                    {/* Rincian Wilayah & Akun */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 text-xs text-slate-700">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#80000f] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">{req.alamat}</span>
                          <div className="text-[11px] text-slate-500">
                            RW {req.rw} {req.rt ? `/ RT ${req.rt}` : ''} • Kel. {req.kelurahan} • Kec.{' '}
                            {req.kecamatan} • {req.kotaKab}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#80000f] shrink-0" />
                          <span>
                            Ketua: <strong>{req.namaKetua}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-mono font-bold text-slate-900">{req.noWhatsapp}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>
                            Email Akun: <strong className="text-blue-700 font-mono">{req.emailAdmin}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Aksi Verifikasi & WhatsApp */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                    {req.status === 'pending' ? (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          type="button"
                          onClick={() => handleReject(req)}
                          className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Tolak
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(req)}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-[#80000f] hover:bg-[#66000c] text-white text-xs font-bold transition-all shadow-sm hover:scale-101 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>Setujui &amp; Aktifkan Akun</span>
                        </button>
                      </div>
                    ) : req.status === 'approved' ? (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          type="button"
                          onClick={() => handleSendWhatsAppConfirmation(req)}
                          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm hover:scale-101 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4 fill-white" />
                          <span>Kirim Konfirmasi Akun ke WhatsApp</span>
                          <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full text-xs text-red-600 font-medium">
                        <span className="italic">Pengajuan pendaftaran ini telah ditolak.</span>
                        <button
                          type="button"
                          onClick={() => handleApprove(req)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-bold cursor-pointer"
                        >
                          Pulihkan &amp; Setujui
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

