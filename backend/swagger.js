// OpenAPI 3.0 spec untuk les-api. Objek polos, tanpa parser JSDoc.
const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Les Management API',
    version: '1.0.0',
    description: 'API manajemen les multi-cabang. Login dulu via /auth/login, klik Authorize, tempel token.',
  },
  servers: [{ url: 'http://localhost:3001', description: 'Lokal' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Cabang: { type: 'object', properties: { id: { type: 'string' }, nama: { type: 'string' }, alamat: { type: 'string' }, status: { type: 'string', enum: ['aktif', 'nonaktif'] } } },
      Guru: { type: 'object', properties: { id: { type: 'string' }, nama: { type: 'string' }, no_telp: { type: 'string' }, jenjang: { type: 'string', enum: ['TK', 'SD', 'SMP', 'SMA_SMK'] } } },
      Siswa: { type: 'object', properties: { id: { type: 'string' }, nama: { type: 'string' }, jenjang: { type: 'string' }, kelas: { type: 'integer' }, status: { type: 'string' } } },
      SPP: { type: 'object', properties: { id: { type: 'string' }, bulan: { type: 'integer' }, tahun: { type: 'integer' }, nominal: { type: 'number' }, status: { type: 'string' } } },
      Transaksi: { type: 'object', properties: { id: { type: 'string' }, tipe: { type: 'string', enum: ['masuk', 'keluar'] }, kategori: { type: 'string' }, nominal: { type: 'number' } } },
      Error: { type: 'object', properties: { error: { type: 'string' } } },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/health': {
      get: { tags: ['Util'], security: [], summary: 'Cek API + DB', responses: { 200: { description: 'OK' } } },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'], security: [], summary: 'Login, dapat JWT',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', example: 'admin@lespintar.id' }, password: { type: 'string', example: 'admin123' } } } } } },
        responses: { 200: { description: 'Token + user' }, 401: { description: 'Kredensial salah', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
      },
    },
    '/api/auth/me': {
      get: { tags: ['Auth'], summary: 'Profil sendiri', responses: { 200: { description: 'OK' }, 401: { description: 'Token invalid' } } },
    },
    '/api/cabang': {
      get: { tags: ['Cabang'], summary: 'Daftar cabang', responses: { 200: { description: 'OK' } } },
      post: {
        tags: ['Cabang'], summary: 'Tambah cabang (pusat). Auto akun pimpinan.',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['nama', 'alamat'], properties: { nama: { type: 'string', example: 'Cabang Bandung' }, alamat: { type: 'string', example: 'Jl. Asia No. 5' } } } } } },
        responses: { 201: { description: 'Dibuat + info login' }, 403: { description: 'Khusus pusat' } },
      },
    },
    '/api/cabang/{id}': {
      put: {
        tags: ['Cabang'], summary: 'Edit cabang (pusat)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { nama: { type: 'string' }, alamat: { type: 'string' }, status: { type: 'string', enum: ['aktif', 'nonaktif'] } } } } } },
        responses: { 200: { description: 'OK' } },
      },
      delete: {
        tags: ['Cabang'], summary: 'Hapus cabang (pusat)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/guru': {
      get: {
        tags: ['Guru'], summary: 'Daftar guru',
        parameters: [{ name: 'cabangId', in: 'query', schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
      post: {
        tags: ['Guru'], summary: 'Tambah guru (pusat/cabang)',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['nama', 'noTelp', 'jenjang'], properties: { nama: { type: 'string' }, noTelp: { type: 'string' }, noPegawai: { type: 'string' }, tanggalLahir: { type: 'string', format: 'date' }, alamat: { type: 'string' }, jenjang: { type: 'string', enum: ['TK', 'SD', 'SMP', 'SMA_SMK'] }, cabangIds: { type: 'array', items: { type: 'string' } } } } } } },
        responses: { 201: { description: 'Dibuat' } },
      },
    },
    '/api/guru/{id}': {
      put: {
        tags: ['Guru'], summary: 'Edit guru',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Guru' } } } },
        responses: { 200: { description: 'OK' } },
      },
      delete: {
        tags: ['Guru'], summary: 'Hapus guru, siswa diasuh dilepas',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/siswa': {
      get: {
        tags: ['Siswa'], summary: 'Daftar siswa',
        parameters: [
          { name: 'cabangId', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['aktif', 'cuti', 'keluar'] } },
        ],
        responses: { 200: { description: 'OK' } },
      },
      post: {
        tags: ['Siswa'], summary: 'Daftar siswa + auto transaksi & tagihan',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['nama', 'tanggalLahir', 'jenjang', 'kelas'], properties: { nama: { type: 'string' }, tanggalLahir: { type: 'string', format: 'date' }, jenjang: { type: 'string', enum: ['TK', 'SD', 'SMP', 'SMA_SMK'] }, kelas: { type: 'integer', example: 4 }, cabangId: { type: 'string' }, diskon: { type: 'number' }, noTelpOrtu: { type: 'string' }, namaIbu: { type: 'string' }, alamat: { type: 'string' } } } } } },
        responses: { 201: { description: 'Dibuat' } },
      },
    },
    '/api/siswa/{id}/assign': {
      patch: {
        tags: ['Siswa'], summary: 'Tugaskan guru (cek jenjang + kuota 6)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { guruId: { type: 'string', nullable: true, description: 'null = lepas guru' } } } } } },
        responses: { 200: { description: 'OK' }, 400: { description: 'Jenjang tak cocok' }, 409: { description: 'Guru penuh 6/6' } },
      },
    },
    '/api/siswa/{id}/status': {
      patch: {
        tags: ['Siswa'], summary: 'Ubah status (keluar = lepas guru)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['aktif', 'cuti', 'keluar'] } } } } } },
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/siswa/{id}': {
      put: {
        tags: ['Siswa'], summary: 'Edit data siswa',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { nama: { type: 'string' }, kelas: { type: 'integer' }, jenjang: { type: 'string' }, alamat: { type: 'string' } } } } } },
        responses: { 200: { description: 'OK' } },
      },
      delete: {
        tags: ['Siswa'], summary: 'Soft delete (riwayat keuangan utuh)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/spp': {
      get: {
        tags: ['SPP'], summary: 'Daftar tagihan',
        parameters: [
          { name: 'cabangId', in: 'query', schema: { type: 'string' } },
          { name: 'bulan', in: 'query', schema: { type: 'integer' } },
          { name: 'tahun', in: 'query', schema: { type: 'integer' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['belum_bayar', 'lunas'] } },
        ],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/spp/billing': {
      post: {
        tags: ['SPP'], summary: 'Generate tagihan bulanan (idempoten)',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['bulan', 'tahun'], properties: { bulan: { type: 'integer', example: 11 }, tahun: { type: 'integer', example: 2026 } } } } } },
        responses: { 200: { description: '{created, skipped}' } },
      },
    },
    '/api/spp/{id}/pay': {
      patch: {
        tags: ['SPP'], summary: 'Bayar: lunas + kwitansi + transaksi',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { namaPembayar: { type: 'string' }, tanggalBayar: { type: 'string', format: 'date' } } } } } },
        responses: { 200: { description: '{ok, noKwitansi}' } },
      },
    },
    '/api/spp/{id}/sent': {
      post: {
        tags: ['SPP'], summary: 'Tandai kwitansi terkirim WA',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/transaksi': {
      get: {
        tags: ['Transaksi'], summary: 'Riwayat kas',
        parameters: [{ name: 'cabangId', in: 'query', schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
      post: {
        tags: ['Transaksi'], summary: 'Catat kas manual',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['cabangId', 'tipe', 'nominal'], properties: { cabangId: { type: 'string' }, tipe: { type: 'string', enum: ['masuk', 'keluar'] }, kategori: { type: 'string' }, nominal: { type: 'number' }, keterangan: { type: 'string' }, tanggal: { type: 'string', format: 'date' } } } } } },
        responses: { 201: { description: 'Dibuat' } },
      },
    },
    '/api/users/public': {
      get: { tags: ['Auth'], security: [], summary: 'Akun aktif (untuk pilihan login)', responses: { 200: { description: 'OK' } } },
    },
    '/api/users': {
      get: { tags: ['Users'], summary: 'Semua user (pusat)', responses: { 200: { description: 'OK' } } },
    },
    '/api/users/{id}/role': {
      patch: {
        tags: ['Users'], summary: 'Ubah peran (pusat)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['role'], properties: { role: { type: 'string', enum: ['pusat', 'cabang', 'guru'] }, cabangId: { type: 'string' } } } } } },
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/tarif': {
      get: { tags: ['Tarif'], summary: 'Daftar tarif SPP', responses: { 200: { description: 'OK' } } },
    },
    '/api/tarif/{id}': {
      put: {
        tags: ['Tarif'], summary: 'Ubah nominal (pusat)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['nominal'], properties: { nominal: { type: 'number' } } } } } },
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/jadwal': {
      get: {
        tags: ['Jadwal'], summary: 'Daftar jadwal',
        parameters: [
          { name: 'guruId', in: 'query', schema: { type: 'string' } },
          { name: 'cabangId', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'OK' } },
      },
      post: {
        tags: ['Jadwal'], summary: 'Tambah jadwal',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['guruId', 'cabangId', 'hari', 'jamMulai', 'jamSelesai'], properties: { guruId: { type: 'string' }, siswaId: { type: 'string' }, cabangId: { type: 'string' }, hari: { type: 'string' }, jamMulai: { type: 'string' }, jamSelesai: { type: 'string' } } } } } },
        responses: { 201: { description: 'Dibuat' } },
      },
    },
    '/api/jadwal/{id}': {
      put: {
        tags: ['Jadwal'], summary: 'Edit jadwal',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { hari: { type: 'string' }, jamMulai: { type: 'string' }, jamSelesai: { type: 'string' } } } } } },
        responses: { 200: { description: 'OK' } },
      },
      delete: {
        tags: ['Jadwal'], summary: 'Hapus jadwal',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/siswa/auto-assign': {
      post: {
        tags: ['Siswa'], summary: 'Auto-assign load-balance kuota 6',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['cabangId'], properties: { cabangId: { type: 'string' } } } } } },
        responses: { 200: { description: '{assignedCount, unassignedCount}' } },
      },
    },
    '/api/settings/{key}': {
      get: {
        tags: ['Util'], summary: 'Baca setting',
        parameters: [{ name: 'key', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
      put: {
        tags: ['Util'], summary: 'Tulis setting (pusat)',
        parameters: [{ name: 'key', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['value'], properties: { value: { type: 'string' } } } } } },
        responses: { 200: { description: 'OK' } },
      },
    },
  },
};

const swaggerUi = require('swagger-ui-express');

module.exports = { spec, swaggerUi };
