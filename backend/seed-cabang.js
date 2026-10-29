const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'les_db',
  });

  const hash = await bcrypt.hash('cabang123', 10);

  const accounts = [
    {
      id: 'usr-cab-jaksel',
      nama: 'Pimpinan Cabang Jakarta Selatan',
      email: 'cabang.jaksel@lespintar.id',
      cabangId: 'cab-1',
    },
    {
      id: 'usr-cab-ponokawan',
      nama: 'Pimpinan Cabang Ponokawan',
      email: 'cabang.ponokawan@lespintar.id',
      cabangId: 'cab-ponokawan',
    },
  ];

  for (const acc of accounts) {
    await conn.query(
      `INSERT INTO users (id, nama, email, password_hash, role, cabang_id, is_active)
       VALUES (?, ?, ?, ?, 'cabang', ?, 1)
       ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), role='cabang', cabang_id=VALUES(cabang_id), nama=VALUES(nama)`,
      [acc.id, acc.nama, acc.email, hash, acc.cabangId]
    );
    console.log(`Akun ${acc.nama} (${acc.email}) siap.`);
  }

  const [rows] = await conn.query("SELECT id, nama, email, role, cabang_id FROM users WHERE role='cabang'");
  console.log('Semua user cabang di database:', rows);

  await conn.end();
}

main().catch((err) => {
  console.error('Error saat seed cabang:', err);
  process.exit(1);
});
