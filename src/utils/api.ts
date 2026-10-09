import type { Cabang, Guru, Jadwal, PembayaranSPP, Siswa, TarifSPP, Transaksi, User } from '../types';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'les_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...headers, ...(init?.headers as Record<string, string> || {}) } });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}`);
  return body as T;
}

const d10 = (v: any): string => (v ? String(v).slice(0, 10) : v);
const num = (v: any): number => Number(v);

const mapUser = (u: any): User => ({
  id: u.id, nama: u.nama, email: u.email,
  noPegawai: u.noPegawai ?? u.no_pegawai ?? undefined,
  tanggalLahir: u.tanggalLahir ?? (u.tanggal_lahir ? d10(u.tanggal_lahir) : undefined),
  role: u.role,
  cabangId: u.cabangId ?? u.cabang_id ?? null,
  teacherId: u.teacherId ?? u.teacher_id ?? null,
  isActive: !!((u.isActive ?? u.is_active ?? 1) as any),
  createdAt: u.createdAt ?? u.created_at ?? new Date().toISOString(),
});

const mapCabang = (c: any): Cabang => ({
  id: c.id, nama: c.nama, alamat: c.alamat, status: c.status, createdAt: c.created_at ?? c.createdAt,
});

const mapGuru = (g: any): Guru => ({
  id: g.id, userId: g.user_id ?? g.userId, nama: g.nama, email: g.email,
  noTelp: g.no_telp ?? g.noTelp ?? '', noPegawai: g.no_pegawai ?? g.noPegawai,
  tanggalLahir: g.tanggal_lahir ? d10(g.tanggal_lahir) : g.tanggalLahir,
  alamat: g.alamat, jenjang: g.jenjang,
  jenjangList: g.jenjangList && g.jenjangList.length ? g.jenjangList : [g.jenjang],
  cabangIds: Array.isArray(g.cabangIds) ? g.cabangIds : String(g.cabangIds || '').split(',').filter(Boolean),
  isActive: !!(g.is_active ?? g.isActive ?? 1),
});

const mapSiswa = (s: any): Siswa => ({
  id: s.id, cabangId: s.cabang_id ?? s.cabangId, nama: s.nama,
  tempatLahir: s.tempat_lahir ?? s.tempatLahir ?? '',
  tanggalLahir: d10(s.tanggal_lahir ?? s.tanggalLahir),
  alamat: s.alamat ?? '', namaIbu: s.nama_ibu ?? s.namaIbu ?? '',
  noTelpOrtu: s.no_telp_ortu ?? s.noTelpOrtu ?? '',
  jenjang: s.jenjang, kelas: Number(s.kelas),
  guruId: s.guru_id ?? s.guruId ?? null,
  status: s.status, createdAt: s.created_at ?? s.createdAt ?? new Date().toISOString(),
  deletedAt: s.deleted_at ?? s.deletedAt ?? null,
});

const mapSPP = (s: any): PembayaranSPP => ({
  id: s.id, siswaId: s.siswa_id ?? s.siswaId, cabangId: s.cabang_id ?? s.cabangId,
  bulan: Number(s.bulan), tahun: Number(s.tahun), nominal: num(s.nominal), status: s.status,
  namaPembayar: s.nama_pembayar ?? s.namaPembayar,
  tanggalBayar: s.tanggal_bayar ? d10(s.tanggal_bayar) : s.tanggalBayar,
  noKwitansi: s.no_kwitansi ?? s.noKwitansi,
  kwitansiUrl: s.kwitansi_url ?? s.kwitansiUrl,
  dikirimAt: s.dikirim_at ?? s.dikirimAt ?? null,
  createdAt: s.created_at ?? s.createdAt ?? new Date().toISOString(),
});

const mapTrx = (t: any): Transaksi => ({
  id: t.id, cabangId: t.cabang_id ?? t.cabangId, tipe: t.tipe,
  kategori: t.kategori ?? 'Lainnya', nominal: num(t.nominal),
  keterangan: t.keterangan ?? '', tanggal: d10(t.tanggal),
  referensiId: t.referensi_id ?? t.referensiId ?? null,
  buktiUrl: t.bukti_url ?? t.buktiUrl ?? null,
});

export const api = {
  async login(identifier: string, password: string): Promise<{ token: string; user: User }> {
    const r = await req<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST', body: JSON.stringify({ email: identifier, password }),
    });
    setToken(r.token);
    return { token: r.token, user: mapUser(r.user) };
  },
  logout() { setToken(null); },
  async me(): Promise<User> { return mapUser(await req('/api/auth/me')); },
  usersPublic(): Promise<{ id: string; nama: string; email: string; role: string }[]> {
    return req('/api/users/public');
  },
  async listUsers(): Promise<User[]> {
    return (await req<any[]>('/api/users')).map(mapUser);
  },
  setUserRole(id: string, role: string, cabangId?: string) {
    return req(`/api/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role, cabangId }) });
  },

  cabang: {
    async list(): Promise<Cabang[]> { return (await req<any[]>('/api/cabang')).map(mapCabang); },
    create(nama: string, alamat: string) {
      return req<{ id: string; nama: string; alamat: string; loginEmail: string; defaultPassword: string }>('/api/cabang', {
        method: 'POST', body: JSON.stringify({ nama, alamat }),
      });
    },
    update(id: string, data: Partial<Cabang>) {
      return req(`/api/cabang/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    remove(id: string) { return req(`/api/cabang/${id}`, { method: 'DELETE' }); },
  },

  guru: {
    async list(cabangId?: string): Promise<Guru[]> {
      return (await req<any[]>(`/api/guru${cabangId ? `?cabangId=${cabangId}` : ''}`)).map(mapGuru);
    },
    create(data: { nama: string; noTelp: string; noPegawai?: string; tanggalLahir?: string; alamat?: string; jenjang?: string; jenjangList?: string[]; cabangIds?: string[] }) {
      return req<{ id: string; email: string }>('/api/guru', { method: 'POST', body: JSON.stringify(data) });
    },
    update(id: string, data: any) {
      return req(`/api/guru/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    remove(id: string) { return req(`/api/guru/${id}`, { method: 'DELETE' }); },
  },

  siswa: {
    async list(cabangId?: string): Promise<Siswa[]> {
      return (await req<any[]>(`/api/siswa${cabangId ? `?cabangId=${cabangId}` : ''}`)).map(mapSiswa);
    },
    create(data: any) {
      return req<{ id: string }>('/api/siswa', { method: 'POST', body: JSON.stringify(data) });
    },
    update(id: string, data: any) {
      return req(`/api/siswa/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    autoAssign(cabangId: string) {
      return req<{ assignedCount: number; unassignedCount: number }>('/api/siswa/auto-assign', {
        method: 'POST', body: JSON.stringify({ cabangId }),
      });
    },
    assign(id: string, guruId: string | null) {
      return req(`/api/siswa/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ guruId }) });
    },
    setStatus(id: string, status: string) {
      return req(`/api/siswa/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    },
    remove(id: string) { return req(`/api/siswa/${id}`, { method: 'DELETE' }); },
  },

  spp: {
    async list(params?: { cabangId?: string; bulan?: number; tahun?: number; status?: string }): Promise<PembayaranSPP[]> {
      const qs = new URLSearchParams();
      if (params?.cabangId) qs.set('cabangId', params.cabangId);
      if (params?.bulan) qs.set('bulan', String(params.bulan));
      if (params?.tahun) qs.set('tahun', String(params.tahun));
      if (params?.status) qs.set('status', params.status);
      const q = qs.toString();
      return (await req<any[]>(`/api/spp${q ? `?${q}` : ''}`)).map(mapSPP);
    },
    billing(bulan: number, tahun: number) {
      return req<{ created: number; skipped: number }>('/api/spp/billing', {
        method: 'POST', body: JSON.stringify({ bulan, tahun }),
      });
    },
    pay(id: string, namaPembayar: string, tanggalBayar: string) {
      return req<{ ok: boolean; noKwitansi: string }>(`/api/spp/${id}/pay`, {
        method: 'PATCH', body: JSON.stringify({ namaPembayar, tanggalBayar }),
      });
    },
    markSent(id: string) { return req(`/api/spp/${id}/sent`, { method: 'POST' }); },
  },

  transaksi: {
    async list(cabangId?: string): Promise<Transaksi[]> {
      return (await req<any[]>(`/api/transaksi${cabangId ? `?cabangId=${cabangId}` : ''}`)).map(mapTrx);
    },
    create(data: any) {
      return req<{ id: string }>('/api/transaksi', { method: 'POST', body: JSON.stringify(data) });
    },
  },

  tarif: {
    list(): Promise<TarifSPP[]> { return req('/api/tarif'); },
    update(id: string, nominal: number) {
      return req(`/api/tarif/${id}`, { method: 'PUT', body: JSON.stringify({ nominal }) });
    },
  },

  jadwal: {
    list(params?: { guruId?: string; cabangId?: string }): Promise<Jadwal[]> {
      const qs = new URLSearchParams();
      if (params?.guruId) qs.set('guruId', params.guruId);
      if (params?.cabangId) qs.set('cabangId', params.cabangId);
      const q = qs.toString();
      return req(`/api/jadwal${q ? `?${q}` : ''}`);
    },
    create(data: any) {
      return req<{ id: string }>('/api/jadwal', { method: 'POST', body: JSON.stringify(data) });
    },
    update(id: string, data: any) {
      return req(`/api/jadwal/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    remove(id: string) { return req(`/api/jadwal/${id}`, { method: 'DELETE' }); },
  },

  setting: {
    get(key: string) { return req<{ key: string; value: string }>(`/api/settings/${key}`); },
    set(key: string, value: string) {
      return req(`/api/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) });
    },
  },
};
