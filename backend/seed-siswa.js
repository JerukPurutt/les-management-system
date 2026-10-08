// Impor CSV siswa ke MySQL. Pakai: node seed-siswa.js "<path-csv>" [cabangId]
// Idempoten: lewati bila nama + tanggal_lahir sudah ada di cabang.
require('dotenv').config();
const fs = require('fs');
const mysql = require('mysql2/promise');

const BULAN = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];
const uid = (p) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function splitCsv(line) {
  const out = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === ',' && !inQ) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function jenjangKelas(raw) {
  const s = String(raw || '').toLowerCase().trim();
  if (!s || s.includes('tk') || s.includes('paud') || s.includes('pg') || s.includes('playgroup') || s === '0') {
    return { jenjang: 'TK', kelas: 0 };
  }
  const n = parseInt(s.replace(/[^0-9]/g, ''), 10);
  if (isNaN(n) || n <= 0) return { jenjang: 'TK', kelas: 0 };
  if (n <= 6) return { jenjang: 'SD', kelas: n };
  if (n <= 9) return { jenjang: 'SMP', kelas: n };
  return { jenjang: 'SMA_SMK', kelas: Math.min(n, 12) };
}

function tglIso(raw) {
  const s = String(raw || '').trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (m) {
    const bi = BULAN.indexOf(m[2].toLowerCase());
    if (bi >= 0) return `${m[3]}-${String(bi + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }
  m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return null;
}

function sppRate(jenjang, kelas) {
  if (jenjang === 'TK') return 150000;
  if (jenjang === 'SD') return kelas <= 3 ? 150000 : 175000;
  if (jenjang === 'SMP') return 200000;
  return 225000;
}

(async () => {
  const csvPath = process.argv[2];
  if (!csvPath) { console.error('Pakai: node seed-siswa.js "<path-csv>" [cabangId]'); process.exit(1); }
  const cabangId = process.argv[3] || 'cab-ponokawan';

  const raw = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  const head = splitCsv(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const col = (...names) => head.findIndex((h) => names.includes(h));
  const iNama = col('namasiswa', 'nama'), iKelas = col('kelas'), iTempat = col('tempatlahir'),
    iTgl = col('tanggallahir'), iWa = col('nowaortu', 'nowa'), iAlamat = col('alamatrumah', 'alamat'),
    iIbu = col('namaibu'), iDiskon = col('diskonnominal', 'diskon', 'nominaldiskon');
  if (iNama < 0 || iKelas < 0) { console.error('Kolom Nama/Kelas tidak ketemu:', head); process.exit(1); }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root', password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'les_db',
  });

  await conn.query(`INSERT IGNORE INTO cabang (id,nama,alamat,status) VALUES (?,'Cabang Ponokawan','Krian, Sidoarjo','aktif')`, [cabangId]);

  const now = new Date();
  let inserted = 0, skipped = 0, badDate = 0;
  const stat = {};
  for (const line of lines.slice(1)) {
    const c = splitCsv(line);
    const nama = (c[iNama] || '').trim();
    if (!nama) { skipped++; continue; }
    const { jenjang, kelas } = jenjangKelas(c[iKelas]);
    const iso = tglIso(c[iTgl]);
    if (!iso) { badDate++; console.log('TGL-BAD:', nama, JSON.stringify(c[iTgl])); continue; }
    const dup = await conn.query('SELECT id FROM siswa WHERE cabang_id=? AND nama=? AND tanggal_lahir=? LIMIT 1', [cabangId, nama, iso]);
    if (dup[0].length) { skipped++; continue; }
    const diskon = parseInt(String(c[iDiskon] || '').replace(/[^0-9]/g, ''), 10) || 0;
    const wa = String(c[iWa] || '').replace(/[^0-9]/g, '');
    const id = uid('sis');
    await conn.query(
      `INSERT INTO siswa (id,cabang_id,nama,tempat_lahir,tanggal_lahir,alamat,nama_ibu,no_telp_ortu,jenjang,kelas,status)
       VALUES (?,?,?,?,?,?,?,?,?,?, 'aktif')`,
      [id, cabangId, nama, (c[iTempat] || '').trim(), iso, (c[iAlamat] || '').trim(), (c[iIbu] || '').trim(), wa, jenjang, kelas]
    );
    await conn.query(
      `INSERT INTO transaksi (id,cabang_id,tipe,kategori,nominal,keterangan,tanggal,referensi_id) VALUES (?,?,?,?,?,?,CURDATE(),?)`,
      [uid('trx'), cabangId, 'masuk', 'Pendaftaran', Math.max(0, 100000 - diskon), `Pendaftaran: ${nama}`, id]
    );
    await conn.query(
      `INSERT IGNORE INTO pembayaran_spp (id,siswa_id,cabang_id,bulan,tahun,nominal,status) VALUES (?,?,?,?,?,?,'belum_bayar')`,
      [uid('spp'), id, cabangId, now.getMonth() + 1, now.getFullYear(), sppRate(jenjang, kelas)]
    );
    inserted++;
    stat[jenjang] = (stat[jenjang] || 0) + 1;
  }
  await conn.end();
  console.log(JSON.stringify({ inserted, skipped, badDate, stat }));
})();
