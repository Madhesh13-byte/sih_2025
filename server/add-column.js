const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function addColumn() {
  try {
    await db.query('ALTER TABLE staff_assignments ADD COLUMN IF NOT EXISTS class_id INTEGER');
    console.log('✅ Column class_id added to staff_assignments');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  process.exit(0);
}

addColumn();