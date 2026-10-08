// Impor 12 guru Ponokawan + auto-assign siswa (load-balance, kuota 6).
// Pakai: node seed-guru.js [cabangId] [--assign-only]
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const GURU = [
  ['Bu Divani', '0815-6252-6895', 'TK / SD'],
  ['Bu Nida', '0818-3033-3456', 'SD / SMP / SMA'],
  ['Bu Annisa', '0812-3232-1610', 'SD'],
  ['Bu Ruli', '0815-6579-4137', 'TK'],
  ['Bu Salina', '0818-4329-6121', 'SD'],
  ['Bu Vita', '0815-5309-8862', 'SD'],
  ['Bu Sofy', '0818-9254-1929', 'SD'],
  ['Bu Yessi', '0821-3002-2764', 'SD'],
  ['Bu Ria', '0818-3882-7935', 'SD / SMP'],
  ['Bu Dina', '0822-5667-1888', 'SMP / SMA'],
  ['Bu Erika', '0815-8181-9620', 'SMP / SMA'],
  ['Bu Sasa', '0816-4649-5050', 'SD / SMA'],
];

const uid = (p) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// "SD / SMP / SMA" -> ["SD","SMP","SMA_SMK"]
function parseJenjang(raw) {
  const out = [];
  for (const part of String(raw).split('/')) {
    const s = part.toLowerCase().trim();
    if (s.includes('tk')) out.push('TK');
    else if (s.includes('smp')) out.push('SMP');
    else if (s.includes('sma') || s.includes('smk')) out.push('SMA_SMK');
    else if (s.includes('sd')) out.push('SD');
  }
  return [...new Set(out)];
}

(async () => {
  const cabangId = (process.argv[2] && !process.argv[2].startsWith('-')) ? process.argv[2] : 'cab-ponokawan';
  const assignOnly = process.argv.includes('--assign-only');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root', password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'les_db',
  });

  if (!assignOnly) {
    let n = 0;
    for (const [nama, wa, jenjangRaw] of GURU) {
      const list = parseJenjang(jenjangRaw);
      const dup = await conn.query('SELECT id FROM guru WHERE nama=? LIMIT 1', [nama]);
      let gid;
      if (dup[0].length) {
        gid = dup[0][0].id;
      } else {
        gid = uid('guru');
        n++;
        const nip = `NIP-${3100 + n}`;
        const email = `${nip.toLowerCase().replace(/[^a-z0-9]/g, '')}@lespintar.id`;
        const userId = uid('usr');
        const hash = await bcrypt.hash('1995-05-15', 10);
        await conn.query(
          `INSERT INTO users (id,nama,email,password_hash,role,teacher_id,is_active) VALUES (?,?,?,?,'guru',?,1)`,
          [userId, nama, email, hash, gid]
        );
        await conn.query(
          `INSERT INTO guru (id,user_id,nama,email,no_telp,no_pegawai,tanggal_lahir,jenjang) VALUES (?,?,?,?,?,?,?,?)`,
          [gid, userId, nama, email, wa.replace(/[^0-9]/g, ''), nip, '1995-05-15', list[0]]
        );
        await conn.query('INSERT IGNORE INTO guru_cabang (guru_id,cabang_id) VALUES (?,?)', [gid, cabangId]);
      }
      for (const j of list) await conn.query('INSERT IGNORE INTO guru_jenjang (guru_id,jenjang) VALUES (?,?)', [gid, j]);
    }
    console.log('guru-imported:', n);
  }

  // --- auto-assign: per jenjang, guru tersortir paling longgar dulu, kuota 6 total ---
  const [gurus] = await conn.query(
    `SELECT g.id, g.nama FROM guru g JOIN guru_cabang gc ON gc.guru_id=g.id
     WHERE gc.cabang_id=? AND g.is_active=1`, [cabangId]);
  const [gj] = await conn.query('SELECT guru_id, jenjang FROM guru_jenjang');
  const canTeach = {};
  for (const r of gj) (canTeach[r.guru_id] = canTeach[r.guru_id] || []).push(r.jenjang);
  const [cnt] = await conn.query(
    `SELECT guru_id, COUNT(*) n FROM siswa WHERE guru_id IS NOT NULL AND status!='keluar' AND deleted_at IS NULL GROUP BY guru_id`);
  const slots = {};
  for (const g of gurus) slots[g.id] = 0;
  for (const r of cnt) if (slots[r.guru_id] !== undefined) slots[r.guru_id] = Number(r.n);

  const [students] = await conn.query(
    `SELECT id, nama, jenjang FROM siswa WHERE cabang_id=? AND status='aktif' AND deleted_at IS NULL AND guru_id IS NULL ORDER BY id`, [cabangId]);

  let assigned = 0;
  const unassigned = [];
  // langka dulu: SMA & SMP tak punya guru khusus, SD/TK punya -> Layani yang terjepit dulu
  for (const jenjang of ['SMA_SMK', 'SMP', 'TK', 'SD']) {
    for (const s of students.filter((x) => x.jenjang === jenjang)) {
      const cand = gurus
        .filter((g) => (canTeach[g.id] || []).includes(jenjang) && slots[g.id] < 6)
        .sort((a, b) => slots[a.id] - slots[b.id])[0];
      if (!cand) { unassigned.push(`${s.nama} (${jenjang})`); continue; }
      await conn.query('UPDATE siswa SET guru_id=? WHERE id=?', [cand.id, s.id]);
      slots[cand.id]++;
      assigned++;
    }
  }
  const load = {};
  for (const g of gurus) load[g.nama] = slots[g.id];
  await conn.end();
  console.log(JSON.stringify({ assigned, unassigned, load }));
})();
