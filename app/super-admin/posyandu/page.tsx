'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Phone,
  User,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Users,
  Baby,
  HeartPulse,
  Activity,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  ShieldCheck,
  Mail,
  Clock,
  MessageSquare,
  Check,
  X,
  ExternalLink,
  Sparkles,
  Send,
  ClipboardCheck,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import { PosyanduStore } from '@/lib/supabase';
import { PosyanduTenant, PosyanduRegistrationRequest } from '@/types/posyandu';
import { toast } from '@/components/ui/custom-toast';
import { compressImageFile } from '@/lib/utils';

export default function SuperAdminPosyanduPage() {
  const [tenants, setTenants] = useState<PosyanduTenant[]>([]);
  const [registrations, setRegistrations] = useState<PosyanduRegistrationRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<PosyanduTenant | null>(null);

  // Form states - Mendukung Skalabilitas Nasional / Bebas Se-Indonesia
  const [formKode, setFormKode] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formLogo, setFormLogo] = useState('');
  const [formPemda, setFormPemda] = useState('Pemerintah Kota Palembang');
  const [formDinkes, setFormDinkes] = useState('Dinas Kesehatan Kota Palembang');
  const [formPuskesmas, setFormPuskesmas] = useState('UPTD Puskesmas Pembina');
  const [formProvinsi, setFormProvinsi] = useState('Sumatera Selatan');
  const [formKotaKab, setFormKotaKab] = useState('Kota Palembang');
  const [formKecamatan, setFormKecamatan] = useState('Kecamatan Sako');
  const [formKelurahan, setFormKelurahan] = useState('Sukamaju');
  const [formRw, setFormRw] = useState('');
  const [formRt, setFormRt] = useState('01');
  const [formAlamat, setFormAlamat] = useState('');
  const [formKodePos, setFormKodePos] = useState('30164');
  const [formKetua, setFormKetua] = useState('');
  const [formBidan, setFormBidan] = useState('Bdn. Siti Rahma, S.Tr.Keb');
  const [formNoHp, setFormNoHp] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [tenantStats, setTenantStats] = useState<Record<string, { balita: number; bumil: number; lansia: number }>>({});

  const loadData = () => {
    const tenantList = PosyanduStore.getPosyanduList();
    setTenants(tenantList);
    setRegistrations(PosyanduStore.getRegistrations());

    const stats: Record<string, { balita: number; bumil: number; lansia: number }> = {};
    tenantList.forEach((t) => {
      stats[t.nama] = {
        balita: PosyanduStore.getBalita(t.nama).length,
        bumil: PosyanduStore.getBumil(t.nama).length,
        lansia: PosyanduStore.getLansia(t.nama).length,
      };
    });
    setTenantStats(stats);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'registrations') {
        window.location.replace('/super-admin/persetujuan');
      }
    }
  }, []);

  useEffect(() => {
    loadData();
    PosyanduStore.syncFromSupabase().then(() => loadData());
    window.addEventListener('posyandu_tenants_updated', loadData);
    window.addEventListener('posyandu_registrations_updated', loadData);
    return () => {
      window.removeEventListener('posyandu_tenants_updated', loadData);
      window.removeEventListener('posyandu_registrations_updated', loadData);
    };
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedDataUrl = await compressImageFile(file, 300, 300, 0.85);
        setFormLogo(compressedDataUrl);
        toast.success('Logo Dipilih', 'Logo berhasil dimuat.');
      } catch (err) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setFormLogo(event.target.result as string);
            toast.success('Logo Dipilih', 'Logo berhasil dimuat.');
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleOpenAdd = () => {
    setEditingTenant(null);
    setFormKode(`POS-${String(tenants.length + 1).padStart(2, '0')}`);
    setFormNama('');
    setFormLogo('/images/logo-posyandu.png');
    setFormPemda('Pemerintah Kota Palembang');
    setFormDinkes('Dinas Kesehatan Kota Palembang');
    setFormPuskesmas('UPTD Puskesmas Pembina');
    setFormProvinsi('Sumatera Selatan');
    setFormKotaKab('Kota Palembang');
    setFormKecamatan('Kecamatan Sako');
    setFormKelurahan('Sukamaju');
    setFormRw('');
    setFormRt('01');
    setFormAlamat('');
    setFormKodePos('30164');
    setFormKetua('');
    setFormBidan('Bdn. Siti Rahma, S.Tr.Keb');
    setFormNoHp('');
    setFormEmail('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: PosyanduTenant) => {
    setEditingTenant(t);
    setFormKode(t.kode);
    setFormNama(t.nama);
    setFormLogo(t.logo || '/images/logo-posyandu.png');
    setFormPemda(t.pemerintahDaerah || 'Pemerintah Daerah');
    setFormDinkes(t.dinasKesehatan || 'Dinas Kesehatan');
    setFormPuskesmas(t.puskesmas || 'Puskesmas Pembina');
    setFormProvinsi(t.provinsi || 'Sumatera Selatan');
    setFormKotaKab(t.kotaKab || 'Kota Palembang');
    setFormKecamatan(t.kecamatan || 'Kecamatan Sako');
    setFormKelurahan(t.kelurahan);
    setFormRw(t.rw);
    setFormRt(t.rt || '01');
    setFormAlamat(t.alamat);
    setFormKodePos(t.kodePos || '30164');
    setFormKetua(t.namaKetua);
    setFormBidan(t.namaBidan || 'Bdn. Siti Rahma, S.Tr.Keb');
    setFormNoHp(t.noHp);
    setFormEmail(t.email || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formRw.trim()) {
      toast.warning('Validasi Gagal', 'Mohon lengkapi Nama Posyandu dan nomor RW.');
      return;
    }

    if (editingTenant) {
      PosyanduStore.updatePosyandu({
        ...editingTenant,
        kode: formKode,
        nama: formNama,
        logo: formLogo || '/images/logo-posyandu.png',
        pemerintahDaerah: formPemda,
        dinasKesehatan: formDinkes,
        puskesmas: formPuskesmas,
        provinsi: formProvinsi,
        kotaKab: formKotaKab,
        kecamatan: formKecamatan,
        kelurahan: formKelurahan,
        rw: formRw,
        rt: formRt,
        alamat: formAlamat,
        kodePos: formKodePos,
        namaKetua: formKetua,
        namaBidan: formBidan,
        noHp: formNoHp,
        email: formEmail,
      });
      toast.success('Posyandu Diperbarui', `Data unit ${formNama} berhasil disimpan.`);
    } else {
      const newTenant: PosyanduTenant = {
        id: `pos-${Date.now()}`,
        kode: formKode,
        nama: formNama,
        logo: formLogo || '/images/logo-posyandu.png',
        pemerintahDaerah: formPemda,
        dinasKesehatan: formDinkes,
        puskesmas: formPuskesmas,
        provinsi: formProvinsi,
        kotaKab: formKotaKab,
        kecamatan: formKecamatan,
        kelurahan: formKelurahan,
        rw: formRw,
        rt: formRt,
        alamat: formAlamat,
        kodePos: formKodePos,
        namaKetua: formKetua,
        namaBidan: formBidan,
        noHp: formNoHp,
        email: formEmail,
        createdAt: new Date().toISOString().split('T')[0],
      };
      PosyanduStore.addPosyandu(newTenant);
      toast.success('Posyandu Terdaftar', `Unit ${formNama} berhasil ditambahkan ke platform SaaS.`);
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = (id: string, nama: string) => {
    toast.confirm({
      title: 'Hapus Unit Posyandu?',
      description: `Apakah Anda yakin ingin menghapus ${nama} dari daftar tenant SaaS? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger',
      onConfirm: () => {
        PosyanduStore.deletePosyandu(id);
        toast.success('Terhapus', `Unit ${nama} telah dihapus.`);
        loadData();
      },
    });
  };

  const pendingRegistrationsCount = registrations.filter((r) => r.status === 'pending').length;

  const filteredTenants = tenants.filter(
    (t) =>
      t.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.kelurahan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.kotaKab && t.kotaKab.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.puskesmas && t.puskesmas.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.rw.includes(searchQuery) ||
      t.namaKetua.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              { label: 'Master Unit Posyandu' },
            ]}
            backHref="/super-admin/dashboard"
            backLabel="Kembali ke Dashboard"
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
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30">
                  SaaS Multi-Tenant Management
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {tenants.length} Unit Posyandu Aktif
                </span>
                {pendingRegistrationsCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white border border-rose-400 animate-pulse">
                    {pendingRegistrationsCount} Menunggu Verifikasi
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-serif">
                Manajemen Unit Posyandu &amp; Pendaftaran
              </h1>
              <p className="text-xs sm:text-sm text-red-100 max-w-2xl leading-relaxed">
                Kelola jaringan tenant Posyandu dan verifikasi permohonan pendaftaran mandiri dari landing page publik dengan konfirmasi langsung ke WhatsApp pengurus.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap shrink-0">
              <Link
                href="/super-admin/persetujuan"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white hover:bg-[#fff5f6] text-[#80000f] font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all hover:scale-102 active:scale-98 shrink-0 cursor-pointer"
              >
                <ClipboardCheck className="w-4 h-4 text-[#80000f]" />
                <span>Persetujuan &amp; ACC Posyandu</span>
                {pendingRegistrationsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#80000f] text-white text-[10px] font-black animate-pulse">
                    {pendingRegistrationsCount} Baru
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs uppercase tracking-wider border border-white/40 shadow-sm transition-all hover:scale-102 active:scale-98 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Daftarkan Unit Manual</span>
              </button>
            </div>
          </div>

          {/* Subheader Status Unit */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
            <div className="px-4 py-2 rounded-2xl bg-[#fff0f2] text-[#80000f] border border-[#fce1e4] text-xs font-bold flex items-center gap-2 shadow-2xs">
              <Building2 className="w-4 h-4 text-[#80000f]" />
              <span>Daftar Unit Posyandu Aktif ({tenants.length} Unit)</span>
            </div>
          </div>

          {/* Search Bar & Action Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama posyandu, RW, kelurahan, kota, puskesmas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#80000f] focus:bg-white transition-colors"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Menampilkan {filteredTenants.length} dari {tenants.length} unit posyandu aktif
            </div>
          </div>

          {/* Grid Unit Posyandu */}
          {filteredTenants.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#fff0f2] text-[#80000f] flex items-center justify-center mx-auto font-bold text-xl">
                🏥
              </div>
              <h3 className="font-serif font-black text-lg text-slate-900">
                Unit Posyandu Tidak Ditemukan
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? `Tidak ada unit posyandu yang cocok dengan pencarian "${searchQuery}".`
                  : 'Belum ada unit posyandu yang terdaftar.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTenants.map((tenant) => {
                const stats = tenantStats[tenant.nama] || { balita: 0, bumil: 0, lansia: 0 };
                const balitaCount = stats.balita;
                const bumilCount = stats.bumil;
                const lansiaCount = stats.lansia;

                return (
                  <div
                    key={tenant.id}
                    className="bg-white rounded-3xl border-2 border-slate-200/80 hover:border-[#f8c8c8] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      {/* Header Card dengan Logo Kustom */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-13 h-13 rounded-2xl bg-[#fff0f2] border border-[#fce1e4] p-1.5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden shadow-2xs">
                            {tenant.logo ? (
                              <img
                                src={tenant.logo}
                                alt={tenant.nama}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-2xl">🏥</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold bg-slate-100 text-slate-600 uppercase border border-slate-200">
                                {tenant.kode}
                              </span>
                              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Aktif
                              </span>
                            </div>
                            <h3 className="font-serif font-black text-base text-slate-900 mt-0.5">
                              {tenant.nama}
                            </h3>
                            <p className="text-[11px] text-[#80000f] font-bold">
                              RW {tenant.rw} {tenant.kelurahan ? `• Kel. ${tenant.kelurahan}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(tenant)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#80000f] transition-colors cursor-pointer"
                            title="Edit Posyandu"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tenant.id, tenant.nama)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Hapus Posyandu"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Alamat, Puskesmas, Kontak */}
                      <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <div className="flex items-start gap-2">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="text-[11px] font-bold text-slate-800 line-clamp-1">
                            {tenant.puskesmas || 'Puskesmas Pembina'}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="text-[11px] line-clamp-2 leading-relaxed">
                            {tenant.alamat} {tenant.kotaKab ? `• ${tenant.kotaKab}` : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-[11px] font-semibold">Ketua: {tenant.namaKetua}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-[11px] font-mono">{tenant.noHp}</span>
                        </div>
                      </div>

                      {/* Statistik Sasaran Warga Terdaftar */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
                            <Baby className="w-3 h-3 text-[#80000f]" /> Balita
                          </div>
                          <div className="text-sm font-black text-slate-900 mt-0.5">{balitaCount}</div>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
                            <HeartPulse className="w-3 h-3 text-pink-600" /> Bumil
                          </div>
                          <div className="text-sm font-black text-slate-900 mt-0.5">{bumilCount}</div>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
                            <Activity className="w-3 h-3 text-emerald-600" /> Lansia
                          </div>
                          <div className="text-sm font-black text-slate-900 mt-0.5">{lansiaCount}</div>
                        </div>
                      </div>
                    </div>

                    {/* Tombol Kelola Akun Admin Unit Ini */}
                    <div className="pt-4 mt-2">
                      <Link
                        href={`/super-admin/pengguna?posyandu=${encodeURIComponent(tenant.nama)}`}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#fff0f2] hover:bg-[#80000f] text-[#80000f] hover:text-white font-bold text-xs transition-all border border-[#fce1e4] hover:border-[#80000f] cursor-pointer group/btn"
                      >
                        <Users className="w-4 h-4" />
                        <span>Kelola Akun Admin</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Modal Form Tambah / Edit Posyandu Manual */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#fff0f2] text-[#80000f] flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingTenant ? 'Edit Unit Posyandu' : 'Daftarkan Posyandu Manual'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Masukkan detail profil, logo kustom, dan wilayah operasional unit posyandu.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Upload Logo Posyandu */}
              <div className="p-4 rounded-2xl bg-[#fff5f6] border border-[#fce1e4] flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#fce1e4] p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {formLogo ? (
                    <img src={formLogo} alt="Logo Posyandu" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-[#80000f]" />
                  )}
                </div>
                <div className="space-y-1.5 flex-1">
                  <label className="font-bold text-slate-800 block">Logo Posyandu Kustom</label>
                  <p className="text-[11px] text-slate-500">
                    Unggah logo resmi posyandu Anda (PNG/JPG, maks 2 MB) untuk ditampilkan di kartu &amp; kop surat.
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 rounded-lg bg-white border border-[#fce1e4] hover:bg-[#fff0f2] text-[#80000f] font-bold text-[11px] cursor-pointer inline-flex items-center gap-1.5 shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Pilih File Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {formLogo && formLogo !== '/images/logo-posyandu.png' && (
                      <button
                        type="button"
                        onClick={() => setFormLogo('/images/logo-posyandu.png')}
                        className="text-[11px] text-slate-500 hover:underline cursor-pointer"
                      >
                        Reset ke Standar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Identitas Utama */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kode Posyandu</label>
                  <input
                    type="text"
                    required
                    value={formKode}
                    onChange={(e) => setFormKode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-[#80000f]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama Posyandu</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Posyandu Kasih Ibu"
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none focus:border-[#80000f]"
                  />
                </div>
              </div>

              {/* Instansi Pembina & Wilayah Kerja */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Puskesmas Pembina</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: UPTD Puskesmas Pembina"
                    value={formPuskesmas}
                    onChange={(e) => setFormPuskesmas(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Dinas Kesehatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Dinas Kesehatan Kota Palembang"
                    value={formDinkes}
                    onChange={(e) => setFormDinkes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Pemerintah Daerah (Kota/Kab)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pemerintah Kota Palembang"
                    value={formPemda}
                    onChange={(e) => setFormPemda(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Provinsi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Sumatera Selatan"
                    value={formProvinsi}
                    onChange={(e) => setFormProvinsi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f]"
                  />
                </div>
              </div>

              {/* Rincian Wilayah Kelurahan / Kecamatan / RW */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kota / Kabupaten</label>
                  <input
                    type="text"
                    placeholder="Kota Palembang"
                    value={formKotaKab}
                    onChange={(e) => setFormKotaKab(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kecamatan</label>
                  <input
                    type="text"
                    placeholder="Sako"
                    value={formKecamatan}
                    onChange={(e) => setFormKecamatan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kelurahan / Desa</label>
                  <input
                    type="text"
                    required
                    value={formKelurahan}
                    onChange={(e) => setFormKelurahan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">RW / RT</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      required
                      placeholder="RW 03"
                      value={formRw}
                      onChange={(e) => setFormRw(e.target.value)}
                      className="w-1/2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f] text-center font-bold"
                    />
                    <input
                      type="text"
                      placeholder="RT 12"
                      value={formRt}
                      onChange={(e) => setFormRt(e.target.value)}
                      className="w-1/2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f] text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Alamat Lengkap & Kode Pos */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3 space-y-1">
                  <label className="font-bold text-slate-700">Alamat Balai Posyandu</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Balai Pertemuan RW 03, Jl. Melati Raya No. 12"
                    value={formAlamat}
                    onChange={(e) => setFormAlamat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kode Pos</label>
                  <input
                    type="text"
                    placeholder="30164"
                    value={formKodePos}
                    onChange={(e) => setFormKodePos(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-[#80000f] text-center"
                  />
                </div>
              </div>

              {/* Pejabat Penanggung Jawab & Kontak */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama Ketua Posyandu</label>
                  <input
                    type="text"
                    required
                    placeholder="Ny. Anisa Rahmawati"
                    value={formKetua}
                    onChange={(e) => setFormKetua(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Bidan Pembina Wilayah</label>
                  <input
                    type="text"
                    placeholder="Bdn. Siti Rahma, S.Tr.Keb"
                    value={formBidan}
                    onChange={(e) => setFormBidan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">No. WhatsApp / Telepon</label>
                  <input
                    type="text"
                    required
                    placeholder="0812xxxx"
                    value={formNoHp}
                    onChange={(e) => setFormNoHp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-[#80000f]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Resmi Posyandu (Opsional)</label>
                  <input
                    type="email"
                    placeholder="posyandu@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#80000f] hover:bg-[#66000c] text-white font-bold transition-all shadow-md hover:scale-102 cursor-pointer"
                >
                  {editingTenant ? 'Simpan Perubahan' : 'Daftarkan Posyandu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

