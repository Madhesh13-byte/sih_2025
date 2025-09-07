// Quick setup script for attendance system
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// Sample data setup
const setupData = async () => {
  console.log('Setting up attendance system...');
  
  // 1. Create a class if not exists
  db.run(`INSERT OR IGNORE INTO classes (department, year, section) VALUES (?, ?, ?)`,
    ['CSE', 'III', 'A'], function(err) {
      if (err) console.error('Error creating class:', err);
      else console.log('✅ Class CSE III A created/exists');
    });
  
  // 2. Create staff assignment
  db.run(`INSERT OR IGNORE INTO staff_assignments 
          (staff_id, staff_name, subject_code, subject_name, department, year, semester, class_id) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['STF001', 'Jane Staff', 'CS301', 'Data Structures', 'CSE', 'III', '5', 1], 
    function(err) {
      if (err) console.error('Error creating staff assignment:', err);
      else console.log('✅ Staff assignment created');
    });
  
  // 3. Create timetable entry for Monday Period 1
  db.run(`INSERT OR IGNORE INTO timetables 
          (department, year, semester, day_of_week, period_number, start_time, end_time, 
           subject_code, subject_name, staff_id, staff_name, room_number) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['CSE', 'III', '5', 0, 1, '09:15', '10:05', 'CS301', 'Data Structures', 'STF001', 'Jane Staff', 'Room 101'],
    function(err) {
      if (err) console.error('Error creating timetable:', err);
      else console.log('✅ Timetable entry created for Monday Period 1');
    });
  
  // 4. Update students to assign them to the class
  db.run(`UPDATE users SET class_id = 1, department = 'CSE', joining_year = 2022 
          WHERE role = 'student' AND class_id IS NULL`,
    function(err) {
      if (err) console.error('Error updating students:', err);
      else console.log(`✅ ${this.changes} students assigned to class`);
    });
  
  console.log('\n🎉 Setup complete! Now:');
  console.log('1. Login as staff (STF001 / password123)');
  console.log('2. Go to Current Period section');
  console.log('3. You should see students for attendance marking');
  
  db.close();
};

setupData();