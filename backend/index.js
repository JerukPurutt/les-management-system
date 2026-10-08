require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const { randomUUID } = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const { spec, swaggerUi } = require('./swagger');
app.get('/api/docs.json', (req, res) => res.json(spec));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'les_db',
  waitForConnections: true,
  connectionLimit: 10,
});
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-ganti-di-prod';
const uid = (p) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ponytail: fallback tarif hardcode, DB tarif opsional; query tarif dulu, fallback kalau kosong
async function sppRate(conn, jenjang, kelas) {
  try {
    const [rows] = await conn.query(
      'SELECT nominal FROM tarif_spp WHERE jenjang=? AND kelas_min<=? AND kelas_max>=? LIMIT 1',
      [jenjang, kelas, kelas]
    );
    if (rows[0]) return Number(rows[0].nominal);
  } catch {}
  if (jenjang === 'TK') return 150000;
  if (jenjang === 'SD') return kelas <= 3 ? 150000 : 175000;
  if (jenjang === 'SMP') return 200000;
  return 225000;
}

// "SD / SMP / SMA" atau ["SD","SMP"] -> ["SD","SMP","SMA_SMK"] unik
function parseJenjangList(raw) {
  const parts = Array.isArray(raw) ? raw : String(raw || '').split('/');
  const out = [];
  for (const part of parts) {
    const s = String(part).toLowerCase().trim();
    if (s.includes('tk')) out.push('TK');
    else if (s.includes('smp')) out.push('SMP');
    else if (s.includes('sma') || s.includes('smk')) out.push('SMA_SMK');
    else if (s.includes('sd')) out.push('SD');
  }
  return [...new Set(out)];
}

async function guruJenjang(conn, guruId, fallback) {
  const [rows] = await conn.query('SELECT jenjang FROM guru_jenjang WHERE guru_id=?', [guruId]);
  if (rows.length) return rows.map((r) => r.jenjang);
  return fallback ? [fallback] : [];
}

function sign(user) {
  return jwt.sign(
    { id: user.id, role: user.role, cabangId: user.cabang_id || null },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}
async function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token hilang' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token tidak valid' });
  }
}
const allow = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Akses ditolak' });

const q = async (sql, params = []) => (await pool.query(sql, params))[0];

// ---------- health ----------
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'up' });
  } catch (e) {
    res.status(500).json({ ok: false, db: 'down', error: e.message });
  }
});

// ---------- auth ----------
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email + password wajib' });
  const rows = await q('SELECT * FROM users WHERE email=? LIMIT 1', [email.toLowerCase()]);
  const user = rows[0];
  if (!user || !user.is_active) return res.status(401).json({ error: 'Kredensial salah' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Kredensial salah' });
  const { password_hash, ...safe } = user;
  res.json({ token: sign(user), user: safe });
});

app.get('/api/auth/me', auth, async (req, res) => {
  const rows = await q('SELECT id,nama,email,role,cabang_id,teacher_id,is_active,created_at FROM users WHERE id=?', [req.user.id]);
  if (!rows[0]) return res.status(404).json({ error: 'User hilang' });
  res.json(rows[0]);
});

// ---------- cabang (tulis: pusat saja) ----------
app.get('/api/cabang', auth, async (req, res) => {
  res.json(await q('SELECT * FROM cabang ORDER BY created_at DESC'));
});
app.post('/api/cabang', auth, allow('pusat'), async (req, res) => {
  const { nama, alamat } = req.body || {};
  if (!nama || !alamat) return res.status(400).json({ error: 'nama + alamat wajib' });
  const id = uid('cab');
  await q('INSERT INTO cabang (id,nama,alamat,status) VALUES (?,?,?,?)', [id, nama, alamat, 'aktif']);
  // auto akun pimpinan cabang (password default cabang123, hash)
  const hash = await bcrypt.hash('cabang123', 10);
  const email = `cabang.${nama.toLowerCase().replace(/[^a-z0-9]/g, '')}@lespintar.id`;
  await q(
    'INSERT INTO users (id,nama,email,password_hash,role,cabang_id,is_active) VALUES (?,?,?,?,?,?,1)',
    [uid('usr'), `Pimpinan ${nama}`, email, hash, 'cabang', id]
  );
  res.status(201).json({ id, nama, alamat, loginEmail: email, defaultPassword: 'cabang123' });
});
app.put('/api/cabang/:id', auth, allow('pusat'), async (req, res) => {
  const { nama, alamat, status } = req.body || {};
  await q('UPDATE cabang SET nama=COALESCE(?,nama), alamat=COALESCE(?,alamat), status=COALESCE(?,status) WHERE id=?',
    [nama || null, alamat || null, status || null, req.params.id]);
  res.json({ ok: true });
});
app.delete('/api/cabang/:id', auth, allow('pusat'), async (req, res) => {
  await q('DELETE FROM cabang WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// ---------- guru ----------
app.get('/api/guru', auth, async (req, res) => {
  const { cabangId } = req.query;
  let rows;
  if (cabangId) {
    rows = await q(
      `SELECT g.*, GROUP_CONCAT(gc.cabang_id) AS cabangIds FROM guru g
       LEFT JOIN guru_cabang gc ON gc.guru_id=g.id
       WHERE gc.cabang_id=? GROUP BY g.id`, [cabangId]);
  } else {
    rows = await q('SELECT * FROM guru ORDER BY nama');
  }
  if (rows.length) {
    const [jj] = await pool.query('SELECT guru_id, jenjang FROM guru_jenjang WHERE guru_id IN (?)', [rows.map((r) => r.id)]);
    const map = {};
    for (const r of jj) (map[r.guru_id] = map[r.guru_id] || []).push(r.jenjang);
    for (const r of rows) r.jenjangList = map[r.id] || [r.jenjang];
  }
  res.json(rows);
});
app.post('/api/guru', auth, allow('pusat', 'cabang'), async (req, res) => {
  const { nama, noTelp, noPegawai, tanggalLahir, alamat, jenjang, jenjangList, cabangIds } = req.body || {};
  const list = parseJenjangList(jenjangList || jenjang);
  if (!nama || !noTelp || !list.length) return res.status(400).json({ error: 'nama + noTelp + jenjang wajib' });
  const gid = uid('guru');
  const email = `${(noPegawai || nama).toLowerCase().replace(/[^a-z0-9]/g, '')}@lespintar.id`;
  const hash = await bcrypt.hash(tanggalLahir || '1995-01-01', 10);
  const userId = uid('usr');
  await q(
    'INSERT INTO users (id,nama,email,password_hash,role,teacher_id,is_active) VALUES (?,?,?,?,\'guru\',?,1)',
    [userId, nama, email, hash, gid]
  );
  await q(
    'INSERT INTO guru (id,user_id,nama,email,no_telp,no_pegawai,tanggal_lahir,alamat,jenjang) VALUES (?,?,?,?,?,?,?,?,?)',
    [gid, userId, nama, email, noTelp, noPegawai || null, tanggalLahir || null, alamat || null, list[0]]
  );
  for (const j of list) await q('INSERT IGNORE INTO guru_jenjang (guru_id,jenjang) VALUES (?,?)', [gid, j]);
  const targets = (cabangIds && cabangIds.length ? cabangIds : [req.user.cabangId]).filter(Boolean);
  for (const c of targets) await q('INSERT IGNORE INTO guru_cabang (guru_id,cabang_id) VALUES (?,?)', [gid, c]);
  res.status(201).json({ id: gid, email, jenjangList: list });
});
app.put('/api/guru/:id', auth, allow('pusat', 'cabang'), async (req, res) => {
  const { nama, noTelp, tanggalLahir, alamat, jenjang, jenjangList } = req.body || {};
  const list = (jenjangList || jenjang) ? parseJenjangList(jenjangList || jenjang) : null;
  await q('UPDATE guru SET nama=COALESCE(?,nama), no_telp=COALESCE(?,no_telp), tanggal_lahir=COALESCE(?,tanggal_lahir), alamat=COALESCE(?,alamat), jenjang=COALESCE(?,jenjang) WHERE id=?',
    [nama || null, noTelp || null, tanggalLahir || null, alamat || null, list ? list[0] : null, req.params.id]);
  if (list) {
    await q('DELETE FROM guru_jenjang WHERE guru_id=?', [req.params.id]);
    for (const j of list) await q('INSERT IGNORE INTO guru_jenjang (guru_id,jenjang) VALUES (?,?)', [req.params.id, j]);
  }
  res.json({ ok: true });
});
app.delete('/api/guru/:id', auth, allow('pusat', 'cabang'), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE siswa SET guru_id=NULL WHERE guru_id=?', [req.params.id]);
    await conn.query('DELETE FROM jadwal WHERE guru_id=?', [req.params.id]);
    await conn.query('DELETE FROM guru WHERE id=?', [req.params.id]);
    await conn.query('DELETE FROM users WHERE teacher_id=?', [req.params.id]);
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// ---------- siswa ----------
app.get('/api/siswa', auth, async (req, res) => {
  const { cabangId, status } = req.query;
  let sql = 'SELECT * FROM siswa WHERE deleted_at IS NULL';
  const p = [];
  if (cabangId) { sql += ' AND cabang_id=?'; p.push(cabangId); }
  if (status) { sql += ' AND status=?'; p.push(status); }
  sql += ' ORDER BY created_at DESC';
  res.json(await q(sql, p));
});
app.post('/api/siswa', auth, allow('pusat', 'cabang'), async (req, res) => {
  const s = req.body || {};
  if (!s.nama || !s.tanggalLahir || !s.jenjang || s.kelas === undefined)
    return res.status(400).json({ error: 'nama + tanggalLahir + jenjang + kelas wajib' });
  const cabangId = s.cabangId || req.user.cabangId;
  if (!cabangId) return res.status(400).json({ error: 'cabangId wajib' });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const id = uid('sis');
    await conn.query(
      `INSERT INTO siswa (id,cabang_id,nama,tempat_lahir,tanggal_lahir,alamat,nama_ibu,no_telp_ortu,jenjang,kelas,status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [id, cabangId, s.nama, s.tempatLahir || '', s.tanggalLahir, s.alamat || '', s.namaIbu || '', s.noTelpOrtu || '', s.jenjang, s.kelas, 'aktif']
    );
    // catat pendaftaran + tagihan bulan berjalan (samakan App.tsx)
    const daftar = 100000 - Number(s.diskon || 0);
    await conn.query(
      `INSERT INTO transaksi (id,cabang_id,tipe,kategori,nominal,keterangan,tanggal,referensi_id) VALUES (?,?,?,?,?,?,CURDATE(),?)`,
      [uid('trx'), cabangId, 'masuk', 'Pendaftaran', Math.max(0, daftar), `Pendaftaran: ${s.nama}`, id]
    );
    const now = new Date();
    const nominal = await sppRate(conn, s.jenjang, s.kelas);
    await conn.query(
      `INSERT IGNORE INTO pembayaran_spp (id,siswa_id,cabang_id,bulan,tahun,nominal,status) VALUES (?,?,?,?,?,?,'belum_bayar')`,
      [uid('spp'), id, cabangId, now.getMonth() + 1, now.getFullYear(), nominal]
    );
    await conn.commit();
    res.status(201).json({ id });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});
// assign guru: validasi jenjang + kuota 6, lock anti race
app.patch('/api/siswa/:id/assign', auth, allow('pusat', 'cabang'), async (req, res) => {
  const { guruId } = req.body || {};
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[siswa]] = await conn.query('SELECT * FROM siswa WHERE id=? FOR UPDATE', [req.params.id]);
    if (!siswa) { await conn.rollback(); return res.status(404).json({ error: 'Siswa tidak ada' }); }
    if (guruId) {
      const [[guru]] = await conn.query('SELECT * FROM guru WHERE id=? FOR UPDATE', [guruId]);
      if (!guru) { await conn.rollback(); return res.status(404).json({ error: 'Guru tidak ada' }); }
      const mengajar = await guruJenjang(conn, guruId, guru.jenjang);
      if (!mengajar.includes(siswa.jenjang)) { await conn.rollback(); return res.status(400).json({ error: `Guru ${guru.nama} (${mengajar.join('/')}) tidak cocok untuk siswa ${siswa.jenjang}` }); }
      const [[{ n }]] = await conn.query(
        `SELECT COUNT(*) n FROM siswa WHERE guru_id=? AND id!=? AND status!='keluar' AND deleted_at IS NULL FOR UPDATE`, [guruId, siswa.id]);
      if (siswa.guru_id !== guruId && Number(n) >= 6) { await conn.rollback(); return res.status(409).json({ error: `Guru ${guru.nama} penuh 6/6` }); }
    }
    await conn.query('UPDATE siswa SET guru_id=? WHERE id=?', [guruId || null, siswa.id]);
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});
app.patch('/api/siswa/:id/status', auth, allow('pusat', 'cabang'), async (req, res) => {
  const { status } = req.body || {};
  if (!['aktif', 'cuti', 'keluar'].includes(status)) return res.status(400).json({ error: 'status invalid' });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    if (status === 'keluar') {
      await conn.query('UPDATE siswa SET status=?, guru_id=NULL WHERE id=?', [status, req.params.id]);
    } else {
      await conn.query('UPDATE siswa SET status=? WHERE id=?', [status, req.params.id]);
    }
    // keluar → lepas jadwal (samakan App.tsx). Note: kolom siswa_id di jadwal nullable di MVP ini.
    if (status === 'keluar') await conn.query('DELETE FROM jadwal WHERE siswa_id=?', [req.params.id]).catch(() => {});
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});
app.delete('/api/siswa/:id', auth, allow('pusat', 'cabang'), async (req, res) => {
  await q('UPDATE siswa SET deleted_at=NOW() WHERE id=?', [req.params.id]); // soft delete, transaksi utuh
  res.json({ ok: true });
});

// ---------- SPP ----------
// GET list, POST billing cron idempoten, PATCH pay
app.get('/api/spp', auth, async (req, res) => {
  const { cabangId, bulan, tahun, status } = req.query;
  let sql = 'SELECT * FROM pembayaran_spp WHERE 1=1';
  const p = [];
  if (cabangId) { sql += ' AND cabang_id=?'; p.push(cabangId); }
  if (bulan) { sql += ' AND bulan=?'; p.push(bulan); }
  if (tahun) { sql += ' AND tahun=?'; p.push(tahun); }
  if (status) { sql += ' AND status=?'; p.push(status); }
  sql += ' ORDER BY tahun DESC, bulan DESC';
  res.json(await q(sql, p));
});
app.post('/api/spp/billing', auth, allow('pusat', 'cabang'), async (req, res) => {
  const { bulan, tahun } = req.body || {};
  if (!bulan || !tahun) return res.status(400).json({ error: 'bulan + tahun wajib' });
  const students = await q(`SELECT * FROM siswa WHERE status='aktif' AND deleted_at IS NULL`);
  let created = 0, skipped = 0;
  const conn = await pool.getConnection();
  for (const s of students) {
    const nominal = await sppRate(conn, s.jenjang, s.kelas);
    const r = await conn.query(
      `INSERT IGNORE INTO pembayaran_spp (id,siswa_id,cabang_id,bulan,tahun,nominal,status) VALUES (?,?,?,?,?,?,'belum_bayar')`,
      [randomUUID(), s.id, s.cabang_id, bulan, tahun, nominal]
    );
    if (r[0].affectedRows === 0) skipped++; else created++;
  }
  conn.release();
  res.json({ created, skipped });
});
app.patch('/api/spp/:id/pay', auth, allow('pusat', 'cabang'), async (req, res) => {
  const { namaPembayar, tanggalBayar } = req.body || {};
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[spp]] = await conn.query('SELECT * FROM pembayaran_spp WHERE id=? FOR UPDATE', [req.params.id]);
    if (!spp) { await conn.rollback(); return res.status(404).json({ error: 'Tagihan tidak ada' }); }
    const noKwitansi = `KW/${spp.cabang_id}/${spp.tahun}/${String(spp.bulan).padStart(2, '0')}/${Date.now().toString().slice(-4)}`;
    await conn.query(
      `UPDATE pembayaran_spp SET status='lunas', nama_pembayar=?, tanggal_bayar=?, no_kwitansi=? WHERE id=?`,
      [namaPembayar || 'Ortu', tanggalBayar || new Date().toISOString().slice(0, 10), noKwitansi, spp.id]
    );
    await conn.query(
      `INSERT INTO transaksi (id,cabang_id,tipe,kategori,nominal,keterangan,tanggal,referensi_id) VALUES (?,?,?,?,?,?,?,?)`,
      [uid('trx'), spp.cabang_id, 'masuk', 'SPP', spp.nominal, `SPP ${spp.bulan}/${spp.tahun}`, tanggalBayar || new Date().toISOString().slice(0, 10), spp.id]
    );
    await conn.commit();
    res.json({ ok: true, noKwitansi });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});
app.post('/api/spp/:id/sent', auth, async (req, res) => {
  await q('UPDATE pembayaran_spp SET dikirim_at=NOW() WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

// ---------- transaksi ----------
app.get('/api/transaksi', auth, async (req, res) => {
  const { cabangId } = req.query;
  let sql = 'SELECT * FROM transaksi WHERE 1=1';
  const p = [];
  if (cabangId) { sql += ' AND cabang_id=?'; p.push(cabangId); }
  sql += ' ORDER BY tanggal DESC';
  res.json(await q(sql, p));
});
app.post('/api/transaksi', auth, allow('pusat', 'cabang'), async (req, res) => {
  const { cabangId, tipe, kategori, nominal, keterangan, tanggal } = req.body || {};
  if (!cabangId || !tipe || !nominal) return res.status(400).json({ error: 'cabangId + tipe + nominal wajib' });
  const id = uid('trx');
  await q('INSERT INTO transaksi (id,cabang_id,tipe,kategori,nominal,keterangan,tanggal) VALUES (?,?,?,?,?,?,?)',
    [id, cabangId, tipe, kategori || 'Lainnya', nominal, keterangan || '', tanggal || new Date().toISOString().slice(0, 10)]);
  res.status(201).json({ id });
});

app.use((req, res) => res.status(404).json({ error: 'Rute tidak ada' }));

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => console.log(`les-api jalan di :${PORT}`));
