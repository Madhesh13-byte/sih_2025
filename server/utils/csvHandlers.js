const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const bcrypt = require('bcrypt');

const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to calculate grade points
function calculateGradePoints(grade) {
  const gradeMap = {
    'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'RA': 0, 'SA': 0, 'W': 0
  };
  return gradeMap[grade] || 0;
}

// CSV Import Handlers
const csvHandlers = {
  // Import subjects from CSV
  importSubjects: (db) => [
    (req, res, next) => {
      upload.single('csvFile')(req, res, (err) => {
        if (err) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large (max 5MB)' });
          }
          return res.status(400).json({ error: 'File upload failed' });
        }
        next();
      });
    },
    (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No CSV file uploaded' });
      }

      const subjects = [];
      const errors = [];
      let rowNum = 0;
      
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
          rowNum++;
          if (!data.subject_code || !data.subject_name || !data.department || !data.year || !data.semester) {
            errors.push(`Row ${rowNum}: Missing required fields`);
            return;
          }
          
          subjects.push([
            data.subject_code.trim(),
            data.subject_name.trim(), 
            data.department.trim(),
            data.year.trim(),
            data.semester.trim(),
            parseInt(data.credits) || 3
          ]);
        })
        .on('end', () => {
          if (subjects.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'No valid subjects found' });
          }

          let imported = 0;
          let duplicates = 0;
          
          db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            const stmt = db.prepare('INSERT INTO subjects (subject_code, subject_name, department, year, semester, credits) VALUES (?, ?, ?, ?, ?, ?)');
            
            subjects.forEach(subject => {
              stmt.run(subject, function(err) {
                if (err && err.message.includes('UNIQUE constraint failed')) {
                  duplicates++;
                } else if (!err) {
                  imported++;
                }
              });
            });
            
            stmt.finalize();
            db.run('COMMIT', () => {
              fs.unlinkSync(req.file.path);
              res.json({ message: `${imported} subjects imported, ${duplicates} duplicates skipped` });
            });
          });
        })
        .on('error', () => {
          fs.unlinkSync(req.file.path);
          res.status(500).json({ error: 'CSV processing failed' });
        });
    }
  ],

  // Import students from CSV
  importStudents: (db) => [
    upload.single('csvFile'),
    async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No CSV file uploaded' });
      }

      const students = [];
      
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
          const values = Object.values(data);
          students.push({
            name: values[0] || 'Student',
            email: values[1] || null,
            department: values[2] || 'IT',
            year: values[3] || '25',
            dob: values[4] || '010100'
          });
        })
        .on('end', async () => {
          if (students.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'No valid students found' });
          }

          let imported = 0;
          
          for (const student of students) {
            try {
              const deptCode = student.department.toUpperCase().substring(0, 2);
              const yearCode = student.year.toString().slice(-2);
              
              const count = await new Promise((resolve, reject) => {
                db.get(`SELECT COUNT(*) as count FROM users WHERE register_no LIKE 'STU${deptCode}${yearCode}%'`, (err, row) => {
                  if (err) reject(err);
                  else resolve(row.count + 1);
                });
              });
              
              const register_no = `STU${deptCode}${yearCode}${count.toString().padStart(2, '0')}`;
              const password = student.dob.toString().padStart(6, '0');
              const hashedPassword = await bcrypt.hash(password, 10);
              const joiningYear = 2000 + parseInt(student.year);
              
              await new Promise((resolve, reject) => {
                db.run('INSERT INTO users (register_no, name, email, password, role, department, joining_year, current_semester, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                  [register_no, student.name, student.email, hashedPassword, 'student', student.department, joiningYear, 5, req.user.id],
                  function(err) {
                    if (err) reject(err);
                    else { imported++; resolve(); }
                  }
                );
              });
            } catch (error) {
              console.error('Error importing student:', error);
            }
          }
          
          fs.unlinkSync(req.file.path);
          res.json({ message: `${imported} students imported successfully` });
        })
        .on('error', () => {
          fs.unlinkSync(req.file.path);
          res.status(500).json({ error: 'CSV processing failed' });
        });
    }
  ],

  // Import staff from CSV
  importStaff: (db) => [
    upload.single('csvFile'),
    async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No CSV file uploaded' });
      }

      const staff = [];
      
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
          const values = Object.values(data);
          staff.push({
            name: values[0] || 'Staff',
            email: values[1] || null,
            department: values[2] || 'IT'
          });
        })
        .on('end', async () => {
          if (staff.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'No valid staff found' });
          }

          let imported = 0;
          
          for (const member of staff) {
            try {
              const deptCode = member.department.toUpperCase().substring(0, 3);
              
              const count = await new Promise((resolve, reject) => {
                db.get(`SELECT COUNT(*) as count FROM users WHERE staff_id LIKE 'STF${deptCode}%'`, (err, row) => {
                  if (err) reject(err);
                  else resolve(row.count + 1);
                });
              });
              
              const staff_id = `STF${deptCode}${count.toString().padStart(3, '0')}`;
              const name = member.name.toLowerCase().replace(/\s+/g, '');
              const dept = member.department.toLowerCase();
              const password = `${name}@${dept}`;
              const hashedPassword = await bcrypt.hash(password, 10);
              
              await new Promise((resolve, reject) => {
                db.run('INSERT INTO users (staff_id, name, email, password, role, department, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
                  [staff_id, member.name, member.email, hashedPassword, 'staff', member.department, req.user.id],
                  function(err) {
                    if (err) reject(err);
                    else { imported++; resolve(); }
                  }
                );
              });
            } catch (error) {
              console.error('Error importing staff:', error);
            }
          }
          
          fs.unlinkSync(req.file.path);
          res.json({ message: `${imported} staff imported successfully` });
        })
        .on('error', () => {
          fs.unlinkSync(req.file.path);
          res.status(500).json({ error: 'CSV processing failed' });
        });
    }
  ],

  // Import student results from CSV
  importStudentResults: (db) => [
    upload.single('csvFile'),
    async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No CSV file uploaded' });
      }

      const results = [];
      
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
          const values = Object.values(data);
          results.push({
            register_no: values[0]?.trim(),
            subject_code: values[1]?.trim(),
            semester: parseInt(values[2]) || 0,
            academic_year: values[3]?.trim(),
            ia1_marks: parseInt(values[4]) || null,
            ia2_marks: parseInt(values[5]) || null,
            ia3_marks: parseInt(values[6]) || null,
            semester_grade: values[7]?.trim()
          });
        })
        .on('end', async () => {
          const validResults = results.filter(r => r.register_no && r.subject_code && r.semester_grade);
          
          if (validResults.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'No valid results found' });
          }

          let imported = 0;
          
          for (const result of validResults) {
            try {
              await new Promise((resolve, reject) => {
                db.run(`INSERT OR REPLACE INTO student_results 
                        (register_no, subject_code, semester, academic_year, ia1_marks, ia2_marks, ia3_marks, semester_grade) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                  [result.register_no, result.subject_code, result.semester, result.academic_year, 
                   result.ia1_marks, result.ia2_marks, result.ia3_marks, result.semester_grade],
                  function(err) {
                    if (err) reject(err);
                    else { imported++; resolve(); }
                  }
                );
              });
            } catch (error) {
              console.error('Error importing result:', error);
            }
          }
          
          fs.unlinkSync(req.file.path);
          res.json({ message: `${imported} student results imported successfully` });
        })
        .on('error', () => {
          fs.unlinkSync(req.file.path);
          res.status(500).json({ error: 'CSV processing failed' });
        });
    }
  ]
};

// CSV Template Generators
const csvTemplates = {
  subjects: (req, res) => {
    const csvContent = 'subject_code,subject_name,department,year,semester,credits\n' +
                      'CS101,Programming Fundamentals,CSE,1,1,4\n' +
                      'CS102,Data Structures,CSE,1,2,4\n' +
                      'IT101,Web Development,IT,2,3,3';
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=subjects_template.csv');
    res.send(csvContent);
  },

  students: (req, res) => {
    const csvContent = 'name,email,department,year,dob\n' +
                      'John Doe,john@email.com,CSE,25,150805\n' +
                      'Jane Smith,jane@email.com,IT,25,221204\n' +
                      'Mike Johnson,mike@email.com,AIDS,25,100306';
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students_template.csv');
    res.send(csvContent);
  },

  staff: (req, res) => {
    const csvContent = 'name,email,department\n' +
                      'John Teacher,john@email.com,CSE\n' +
                      'Jane Professor,jane@email.com,IT\n' +
                      'Mike Lecturer,mike@email.com,AIDS';
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=staff_template.csv');
    res.send(csvContent);
  },

  studentResults: (req, res) => {
    const csvContent = 'register_no,subject_code,semester,academic_year,ia1_marks,ia2_marks,ia3_marks,semester_grade\n' +
                      'STUIT2501,CS3551,5,2023,45,42,48,A+\n' +
                      'STUIT2501,CS3552,5,2023,40,38,45,A\n' +
                      'STUIT2502,CS3551,5,2023,48,46,49,O';
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=student_results_template.csv');
    res.send(csvContent);
  }
};

module.exports = { csvHandlers, csvTemplates };