const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
require('dotenv').config();

// SQLite connection
const sqliteDb = new sqlite3.Database('./database.db');

// PostgreSQL connection
const pgDb = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const tables = [
  'users', 'staff_assignments', 'cc_assignments', 'classes', 
  'subjects', 'admin_notifications', 'admin_settings', 'timetables',
  'attendance', 'certificates', 'student_results', 'grades',
  'student_gpa', 'student_cgpa'
];

async function migrateData() {
  console.log('🚀 Starting data migration...');
  
  for (const table of tables) {
    try {
      // Get data from SQLite
      const rows = await new Promise((resolve, reject) => {
        sqliteDb.all(`SELECT * FROM ${table}`, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      if (rows.length === 0) {
        console.log(`⚪ ${table}: No data to migrate`);
        continue;
      }

      // Clear existing data in PostgreSQL
      await pgDb.query(`DELETE FROM ${table}`);

      // Insert data into PostgreSQL
      for (const row of rows) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        
        const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
        await pgDb.query(query, values);
      }

      console.log(`✅ ${table}: Migrated ${rows.length} rows`);
    } catch (error) {
      console.error(`❌ ${table}: Migration failed -`, error.message);
    }
  }

  console.log('🎉 Migration completed!');
  process.exit(0);
}

migrateData().catch(console.error);