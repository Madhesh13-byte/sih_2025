const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./database.db');

const tables = [
  'users', 'staff_assignments', 'cc_assignments', 'classes', 
  'subjects', 'admin_notifications', 'admin_settings', 'timetables',
  'attendance', 'certificates', 'student_results', 'grades',
  'student_gpa', 'student_cgpa'
];

async function exportData() {
  for (const table of tables) {
    db.all(`SELECT * FROM ${table}`, (err, rows) => {
      if (!err && rows.length > 0) {
        fs.writeFileSync(`${table}_data.json`, JSON.stringify(rows, null, 2));
        console.log(`Exported ${rows.length} rows from ${table}`);
      }
    });
  }
}

exportData();