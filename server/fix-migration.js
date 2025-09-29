const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
require('dotenv').config();

const sqliteDb = new sqlite3.Database('./database.db');
const pgDb = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function fixStaffAssignments() {
  try {
    const rows = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM staff_assignments', (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    await pgDb.query('DELETE FROM staff_assignments');

    for (const row of rows) {
      const columns = Object.keys(row);
      const values = Object.values(row);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      
      const query = `INSERT INTO staff_assignments (${columns.join(', ')}) VALUES (${placeholders})`;
      await pgDb.query(query, values);
    }

    console.log(`✅ staff_assignments: Fixed - Migrated ${rows.length} rows`);
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
  
  process.exit(0);
}

fixStaffAssignments();