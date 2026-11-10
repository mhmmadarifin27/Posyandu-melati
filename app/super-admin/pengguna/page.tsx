'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  KeyRound,
  ShieldCheck,
  Building2,
  Trash2,
  Edit,
  Mail,
  Phone,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import { PosyanduStore, supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserProfile, PosyanduTenant } from '@/types/posyandu';
import { toast } from '@/components/ui/custom-toast';

export default function SuperAdminPenggunaPage() {
  const [accounts, setAccounts] = useState<(UserProfile & { password?: string })[]>([]);
  const [tenants, setTenants] = useState<PosyanduTenant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<(UserProfile & { password?: string }) | null>(null);

  // Form states
  const [formNama, setFormNama] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'super_admin' | 'admin_posyandu'>('admin_posyandu');
  const [formPosyanduId, setFormPosyanduId] = useState('');
  const [formNoHp, setFormNoHp] = useState('');
  const [formJabatan, setFormJabatan] = useState('');

  const loadData = () => {
    setAccounts(PosyanduStore.getAccounts());
    setTenants(PosyanduStore.getPosyanduList());
  };

  useEffect(() => {
    loadData();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const posyanduParam = params.get('posyandu') || params.get('search');
      if (posyanduParam) {
        setSearchQuery(posyanduParam);
      }
    }
    window.addEventListener('posyandu_accounts_updated', loadData);
    window.addEventListener('posyandu_tenants_updated', loadData);
    return () => {
      window.removeEventListener('posyandu_accounts_updated', loadData);
      window.removeEventListener('posyandu_tenants_updated', loadData);
    };
  }, []);

  const handleOpenEdit = (acc: UserProfile & { password?: string }) => {
    setEditingAccount(acc);
    setFormNama(acc.nama);
    setFormEmail(acc.email);
    setFormPassword(acc.password || '123456');
    setFormRole(acc.role === 'super_admin' ? 'super_admin' : 'admin_posyandu');
    setFormPosyanduId(acc.posyanduId || '');
    setFormNoHp(acc.noHp || '');
    setFormJabatan(acc.jabatan || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formEmail.trim() || !formPassword.trim()) {
      toast.warning('Validasi Gagal', 'Mohon lengkapi Nama, Email, dan Kata Sandi.');
      return;
    }

    const selectedTenant = tenants.find((t) => t.id === formPosyanduId);
    const tenantName = formRole === 'super_admin' ? undefined : (selectedTenant?.nama || 'Posyandu Melati');

    if (editingAccount) {
      PosyanduStore.updateAccount({
        ...editingAccount,
        nama: formNama,
        email: formEmail.toLowerCase(),
        password: formPassword,
        role: formRole,
        posyanduId: formRole === 'super_admin' ? undefined : formPosyanduId,
        posyanduNama: tenantName,
        posyandu: tenantName,
        noHp: formNoHp,
        jabatan: formJabatan,
      });
      toast.success('Akun Diperbarui', `Kredensial akun ${formNama} berhasil diperbarui.`);
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = (id: string, nama: string) => {
    toast.confirm({
      title: 'Hapus Akun Pengguna?',
      description: `Apakah Anda yakin ingin menghapus akun ${nama}? Pengguna ini tidak akan dapat login lagi.`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger',
      onConfirm: () => {
        PosyanduStore.deleteAccount(id);
        toast.success('Terhapus', `Akun ${nama} telah dihapus.`);
        loadData();
      },
    });
  };

  const filteredAccounts = accounts.filter(
    (a) =>
      a.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.posyanduNama && a.posyanduNama.toLowerCase().includes(searchQuery.toLowerCase()))
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
              { label: 'Master Unit Posyandu', href: '/super-admin/posyandu' },
              { label: 'Kelola Akun Admin' },
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
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30">
                  User &amp; Access Control
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                  {accounts.length} Akun Terdaftar
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight">
                Kelola Akun Admin Posyandu
              </h1>
              <p className="text-xs sm:text-sm text-red-100 max-w-2xl leading-relaxed">
                Super Admin dapat mengelola kredensial login akun admin di tiap unit Posyandu (1 unit Posyandu = 1 akun admin). Kredensial awal diterbitkan otomatis saat permohonan pendaftaran posyandu disetujui.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <Link
                href="/super-admin/posyandu"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-[#80000f] hover:bg-[#fff5f6] font-bold text-xs uppercase tracking-wider shadow-md transition-all hover:scale-102 active:scale-98 shrink-0 cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-[#80000f]" />
                <span>Master Unit Posyandu</span>
              </Link>
            </div>
          </div>

          {/* Search Bar & Active Filter Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama petugas, email, atau posyandu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#80000f]/20 focus:border-[#80000f] transition-all"
                />
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold shrink-0 transition-colors cursor-pointer"
                >
                  ✕ Reset Filter
                </button>
              )}
            </div>
            <div className="text-xs text-slate-500 font-semibold text-right">
              {searchQuery ? (
                <span className="text-[#80000f] font-bold">
                  Menampilkan {filteredAccounts.length} akun untuk &quot;{searchQuery}&quot;
                </span>
              ) : (
                <span>Total {filteredAccounts.length} Akun</span>
              )}
            </div>
          </div>

          {/* Table of Accounts */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase font-black text-[10px] tracking-wider">
                  <tr>
                    <th className="py-4 px-5">Nama Petugas</th>
                    <th className="py-4 px-4">Role Akses</th>
                    <th className="py-4 px-4">Asal Posyandu (Tenant)</th>
                    <th className="py-4 px-4">Kredensial Login</th>
                    <th className="py-4 px-4">Kontak &amp; Jabatan</th>
                    <th className="py-4 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredAccounts.map((acc) => {
                    const isSuper = acc.role === 'super_admin';
                    return (
                      <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 bg-[#fff0f2] text-[#80000f]"
                            >
                              {isSuper ? '👑' : '🧕'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{acc.nama}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{acc.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                              isSuper
                                ? 'bg-[#80000f] text-white border-[#80000f]'
                                : 'bg-[#fff0f2] text-[#80000f] border-[#fce1e4]'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            {isSuper ? 'Super Admin' : 'Admin Posyandu'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {isSuper ? (
                            <span className="text-slate-400 italic font-semibold">Puskesmas Pembina (Semua)</span>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                              <Building2 className="w-3.5 h-3.5 text-[#80000f]" />
                              <span>{acc.posyanduNama || acc.posyandu || 'Posyandu Melati'}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="text-[11px] font-mono font-semibold text-slate-600 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" /> {acc.email}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-400" /> Pass: {acc.password || '••••••'}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-xs font-semibold text-slate-800">{acc.jabatan || '-'}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{acc.noHp || '-'}</div>
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(acc)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#80000f] transition-colors cursor-pointer"
                              title="Edit Akun"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {!isSuper && (
                              <button
                                onClick={() => handleDelete(acc.id, acc.nama)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Hapus Akun"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Form Tambah / Edit Akun */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 sm:p-7 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#fff0f2] text-[#80000f] flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Edit Kredensial Akun Admin
                  </h3>
                  <p className="text-xs text-slate-500">
                    Perbarui informasi profil, kontak WhatsApp, atau reset kata sandi login admin posyandu.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Lengkap Petugas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ny. Siti Rahmawati"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white focus:outline-none focus:border-[#80000f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Login</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@posyandu.id"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-[#80000f]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kata Sandi (Password)</label>
                  <input
                    type="text"
                    required
                    placeholder="Minimal 6 karakter"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-[#80000f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tingkat Hak Akses</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white focus:outline-none focus:border-[#80000f]"
                  >
                    <option value="admin_posyandu">Admin Posyandu (Unit)</option>
                    <option value="super_admin">Super Admin (Puskesmas)</option>
                  </select>
                </div>

                {formRole === 'admin_posyandu' ? (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Asal Posyandu</label>
                    <select
                      value={formPosyanduId}
                      onChange={(e) => setFormPosyanduId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white focus:outline-none focus:border-[#80000f]"
                    >
                      {tenants.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nama} (RW {t.rw})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Wilayah</label>
                    <div className="px-3 py-2 bg-slate-100 rounded-xl text-slate-500 font-semibold italic">
                      Seluruh Kecamatan
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Jabatan Petugas</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ketua Kader RW 03"
                    value={formJabatan}
                    onChange={(e) => setFormJabatan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#80000f]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    placeholder="0812xxxx"
                    value={formNoHp}
                    onChange={(e) => setFormNoHp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-[#80000f]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#80000f] hover:bg-[#66000c] text-white font-bold transition-all shadow-md shadow-[#80000f]/20 cursor-pointer"
                >
                  Simpan Perubahan Kredensial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


