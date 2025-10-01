const multer = require('multer');
const csv = require('csv-parser');
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Bulk import subjects from CSV
app.post('/api/subjects/import', authenticateToken, requireAdmin, (req, res, next) => {
  console.log('Received import request');
  upload.single('csvFile')(req, res, (err) => {
    if (err) {
      console.error('File upload error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          error: 'File is too large',
          details: 'Maximum file size is 5MB'
        });
      }
      return res.status(400).json({ 
        error: 'File upload failed',
        details: err.message
      });
    }
    next();
  });
}, (req, res) => {
  console.log('Processing uploaded file');
    if (!req.file) {
      console.error('No file received in request');
      return res.status(400).json({ 
        error: 'No CSV file uploaded',
        details: 'Please select a valid CSV file'
      });
    }
    
    // Continue with CSV processing
    console.log('File received:', req.file.originalname, 'Size:', req.file.size);
    
    // Rest of the existing import code...  const subjects = [];
  const errors = [];
  let rowNum = 0;
  
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      rowNum++;
      console.log('Processing row:', rowNum, 'Data:', data);
      
      // Validate required fields
      if (!data.subject_code) errors.push(`Row ${rowNum}: Missing subject code`);
      if (!data.subject_name) errors.push(`Row ${rowNum}: Missing subject name`);
      if (!data.department) errors.push(`Row ${rowNum}: Missing department`);
      if (!data.year) errors.push(`Row ${rowNum}: Missing year`);
      if (!data.semester) errors.push(`Row ${rowNum}: Missing semester`);
      
      if (data.subject_code && data.subject_name && data.department && data.year && data.semester) {
        const subject = [
          data.subject_code.trim(),
          data.subject_name.trim(), 
          data.department.trim(),
          data.year.trim(),
          data.semester.trim(),
          parseInt(data.credits) || 3
        ];
        subjects.push(subject);
        console.log('Added subject:', subject);
      }
    })
    .on('end', () => {
      if (subjects.length === 0) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          error: 'No valid subjects found',
          details: errors
        });
      }

      let imported = 0;
      let duplicates = 0;
      
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        const stmt = db.prepare('INSERT INTO subjects (subject_code, subject_name, department, year, semester, credits) VALUES (?, ?, ?, ?, ?, ?)');
        
        subjects.forEach(subject => {
          stmt.run(subject, function(err) {
            if (err) {
              if (err.message.includes('UNIQUE constraint failed')) {
                duplicates++;
                console.log('Duplicate subject:', subject[0]);
              } else {
                errors.push(`Error importing ${subject[0]}: ${err.message}`);
                console.error('Import error for subject:', subject[0], err);
              }
            } else {
              imported++;
              console.log('Successfully imported subject:', subject[0]);
            }
          });
        });
        
        stmt.finalize();
        
        db.run('COMMIT', (err) => {
          fs.unlinkSync(req.file.path);
          
          if (err) {
            console.error('Transaction error:', err);
            return res.status(500).json({ 
              error: 'Import failed',
              details: errors
            });
          }
          
          // Get actual count from database
          db.get('SELECT COUNT(*) as total FROM subjects', (err, result) => {
            const response = {
              message: `${imported} new subjects added, ${duplicates} duplicates skipped, ${result.total} total in database`,
              imported,
              duplicates,
              total: result.total
            };
            
            if (errors.length > 0) {
              response.errors = errors;
            }
            
            console.log('Import completed:', response);
            res.json(response);
          });
        });
      });
    })
    .on('error', (err) => {
      console.error('CSV processing error:', err);
      fs.unlinkSync(req.file.path);
      res.status(500).json({ 
        error: 'CSV processing failed',
        details: err.message
      });
    });
});

// Get CSV templates
app.get('/api/subjects/template', authenticateToken, requireAdmin, (req, res) => {
  const csvContent = 'subject_code,subject_name,department,year,semester,credits\n' +
                    'CS101,Programming Fundamentals,Computer Science,1,1,4\n' +
                    'CS102,Data Structures,Computer Science,1,2,4\n' +
                    'CS103,Database Systems,Computer Science,2,1,3\n' +
                    'CS104L,Programming Lab,Computer Science,1,1,2';
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=subjects_template.csv');
  res.send(csvContent);
});

app.get('/api/students/template', authenticateToken, requireAdmin, (req, res) => {
  const csvContent = 'name,email,department,year,dob\n' +
                    'John Doe,john@email.com,CSE,25,150805\n' +
                    'Jane Smith,jane@email.com,IT,25,221204\n' +
                    'Mike Johnson,mike@email.com,AIDS,25,100306';
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=students_template.csv');
  res.send(csvContent);
});

app.get('/api/staff/template', authenticateToken, requireAdmin, (req, res) => {
  const csvContent = 'name,email,department\n' +
                    'John Teacher,john@email.com,CSE\n' +
                    'Jane Professor,jane@email.com,IT\n' +
                    'Mike Lecturer,mike@email.com,AIDS';
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=staff_template.csv');
  res.send(csvContent);
});

// Bulk import students from CSV
app.post('/api/students/import', authenticateToken, requireAdmin, upload.single('csvFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  const students = [];
  
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      console.log('Raw CSV data:', JSON.stringify(data));
      console.log('Available keys:', Object.keys(data));
      const values = Object.values(data);
      const student = {
        name: values[0] || 'Student',
        email: values[1] || null,
        department: values[2] || 'IT',
        year: values[3] || '25',
        dob: values[4] || '010100'
      };
      console.log('Parsed student:', student);
      students.push(student);
    })
    .on('end', async () => {
      console.log('Total students parsed:', students.length);
      if (students.length === 0) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'No valid students found' });
      }

      let imported = 0;
      const errors = [];
      
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        
        console.log('Processing student:', student);
        
        try {
          // Get next student number
          const deptCode = student.department.toUpperCase().substring(0, 2);
          const yearCode = student.year.toString().slice(-2);
          
          const response = await new Promise((resolve, reject) => {
            db.get(`SELECT COUNT(*) as count FROM users WHERE register_no LIKE 'STU${deptCode}${yearCode}%'`, (err, row) => {
              if (err) reject(err);
              else resolve(row.count + 1);
            });
          });
          
          const numStr = (response).toString().padStart(2, '0');
          const register_no = `STU${deptCode}${yearCode}${numStr}`;
          const password = student.dob.toString().padStart(6, '0');
          console.log('Generated password for', student.name, ':', password);
          const hashedPassword = await bcrypt.hash(password, 10);
          const joiningYear = 2000 + parseInt(student.year);
          
          // Check auto-creation setting
          const autoCreateEnabled = await new Promise((resolve, reject) => {
            db.get('SELECT setting_value FROM admin_settings WHERE setting_key = ?', 
              ['auto_create_classes'], (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.setting_value === 'true' : true);
              });
          });
          
          // Auto-assign to class
          let classResult = null;
          if (autoCreateEnabled) {
            // For semester 5, students should be in 3rd year (III)
            const yearRoman = 'III';
            
            classResult = await new Promise((resolve, reject) => {
              db.get('SELECT id FROM classes WHERE department = ? AND year = ? AND section = ?',
                [student.department, yearRoman, 'A'], (err, classRow) => {
                  if (err) reject(err);
                  else resolve(classRow ? classRow.id : null);
                }
              );
            });
            
            // Create class if it doesn't exist
            if (!classResult) {
              classResult = await new Promise((resolve, reject) => {
                db.run('INSERT INTO classes (department, year, section) VALUES (?, ?, ?)',
                  [student.department, yearRoman, 'A'], function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                  }
                );
              });
            }
          }
          
          await new Promise((resolve, reject) => {
            console.log('Creating user:', { register_no, name: student.name, password, hashedPassword: hashedPassword.substring(0, 10) + '...' });
            db.run('INSERT INTO users (register_no, name, email, password, role, department, joining_year, class_id, current_semester, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [register_no, student.name, student.email, hashedPassword, 'student', student.department, joiningYear, classResult, 5, req.user.id],
              function(err) {
                if (err) reject(err);
                else { imported++; resolve(); }
              }
            );
          });
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }
      
      fs.unlinkSync(req.file.path);
      console.log('Final result:', { imported, errors: errors.length, totalStudents: students.length });
      res.json({
        message: `${imported} students imported, ${errors.length} errors`,
        imported,
        errors: errors.slice(0, 5)
      });
    })
    .on('error', () => {
      fs.unlinkSync(req.file.path);
      res.status(500).json({ error: 'CSV processing failed' });
    });
});

// Bulk import staff from CSV
app.post('/api/staff/import', authenticateToken, requireAdmin, upload.single('csvFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  const staff = [];
  
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      console.log('CSV row data:', data);
      const values = Object.values(data);
      const staffMember = {
        name: values[0] || 'Staff',
        email: values[1] || null,
        department: values[2] || 'IT'
      };
      console.log('Parsed staff:', staffMember);
      staff.push(staffMember);
    })
    .on('end', async () => {
      if (staff.length === 0) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'No valid staff found' });
      }

      let imported = 0;
      const errors = [];
      
      for (let i = 0; i < staff.length; i++) {
        const member = staff[i];
        
        try {
          // Get next staff number
          const deptCode = member.department.toUpperCase().substring(0, 3);
          
          const response = await new Promise((resolve, reject) => {
            db.get(`SELECT COUNT(*) as count FROM users WHERE staff_id LIKE 'STF${deptCode}%'`, (err, row) => {
              if (err) reject(err);
              else resolve(row.count + 1);
            });
          });
          
          const numStr = response.toString().padStart(3, '0');
          const staff_id = `STF${deptCode}${numStr}`;
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
          errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }
      
      fs.unlinkSync(req.file.path);
      res.json({
        message: `${imported} staff imported, ${errors.length} errors`,
        imported,
        errors: errors.slice(0, 5)
      });
    })
    .on('error', () => {
      fs.unlinkSync(req.file.path);
      res.status(500).json({ error: 'CSV processing failed' });
    });
});

// Get all subjects for admin
app.get('/api/admin/subjects', authenticateToken, requireAdmin, (req, res) => {
  db.all('SELECT * FROM subjects ORDER BY department, year, semester, subject_code', (err, subjects) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch subjects' });
    res.json(subjects);
  });
});

// Move students to correct class based on semester
app.put('/api/admin/fix-student-classes', authenticateToken, requireAdmin, (req, res) => {
  // Move semester 5 students to III year class
  db.run(`UPDATE users SET class_id = (
    SELECT c.id FROM classes c WHERE c.department = users.department AND c.year = 'III' AND c.section = 'A'
  ) WHERE role = 'student' AND current_semester = 5`, function(err) {
    if (err) return res.status(500).json({ error: 'Failed to update student classes' });
    res.json({ message: `${this.changes} students moved to correct classes` });
  });
});

// Student results endpoints
app.post('/api/student-results/import', authenticateToken, requireAdmin, (req, res, next) => {
  upload.single('csvFile')(req, res, (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(400).json({ error: 'File upload failed', details: err.message });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  const results = [];
  const errors = [];
  let rowNum = 0;
  
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      rowNum++;
      const values = Object.values(data);
      const result = {
        register_no: values[0]?.trim(),
        subject_code: values[1]?.trim(),
        semester: parseInt(values[2]) || 0,
        academic_year: values[3]?.trim(),
        ia1_marks: parseInt(values[4]) || null,
        ia2_marks: parseInt(values[5]) || null,
        ia3_marks: parseInt(values[6]) || null,
        semester_grade: values[7]?.trim()
      };
      
      if (!result.register_no || !result.subject_code || !result.semester_grade) {
        errors.push(`Row ${rowNum}: Missing required fields`);
      } else {
        results.push(result);
      }
    })
    .on('end', async () => {
      if (results.length === 0) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'No valid results found', details: errors });
      }

      let imported = 0;
      let duplicates = 0;
      
      for (const result of results) {
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
          errors.push(`Error importing ${result.register_no}: ${error.message}`);
        }
      }
      
      fs.unlinkSync(req.file.path);
      
      res.json({
        message: `${imported} student results imported successfully`,
        imported,
        errors: errors.slice(0, 5)
      });
    })
    .on('error', () => {
      fs.unlinkSync(req.file.path);
      res.status(500).json({ error: 'CSV processing failed' });
    });
});

// Get student results template
app.get('/api/student-results/template', authenticateToken, requireAdmin, (req, res) => {
  const csvContent = 'register_no,subject_code,semester,academic_year,ia1_marks,ia2_marks,ia3_marks,semester_grade\n' +
                    'STUIT2501,CS3551,5,2023,45,42,48,A+\n' +
                    'STUIT2501,CS3552,5,2023,40,38,45,A\n' +
                    'STUIT2502,CS3551,5,2023,48,46,49,O';
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=student_results_template.csv');
  res.send(csvContent);
});

// Get student results by register number
app.get('/api/student-results/:register_no', authenticateToken, (req, res) => {
  const { register_no } = req.params;
  const { semester, academic_year } = req.query;
  
  console.log('Fetching student results for:', register_no, 'semester:', semester, 'academic_year:', academic_year);
  
  // Get student department first
  db.get('SELECT department FROM users WHERE register_no = ?', [register_no], (err, student) => {
    if (err) {
      console.error('Error getting student department:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const studentDept = student?.department || 'IT';
    
    let query = `SELECT DISTINCT sr.subject_code, sr.semester, sr.academic_year, sr.ia1_marks, sr.ia2_marks, sr.ia3_marks, sr.semester_grade, s.subject_name, s.credits 
                 FROM student_results sr 
                 LEFT JOIN subjects s ON (sr.subject_code = s.subject_code AND CAST(sr.semester AS TEXT) = s.semester AND s.department = ?) 
                 WHERE sr.register_no = ?`;
    let queryParams = [studentDept, register_no];
  let params = [register_no];
  
    if (semester) {
      query += ` AND sr.semester = ?`;
      queryParams.push(semester);
    }
    
    if (academic_year) {
      query += ` AND sr.academic_year = ?`;
      queryParams.push(academic_year);
    }
    
    query += ` ORDER BY sr.semester, sr.subject_code`;
    
    console.log('Query:', query, 'Params:', queryParams);
    
    db.all(query, queryParams, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      console.log('Found results:', results.length);
      
      // Add calculated grade points
      const resultsWithGradePoints = results.map(result => ({
        ...result,
        grade_points: calculateGradePoints(result.semester_grade)
      }));
      
      res.json(resultsWithGradePoints);
    });
  });
});

// Quick delete endpoints (use with caution)
app.delete('/api/clear-results-now', (req, res) => {
  db.run('DELETE FROM student_results', function(err1) {
    const resultsDeleted = this.changes;
    db.run('DELETE FROM student_gpa', function(err2) {
      const sgpaDeleted = this.changes;
      db.run('DELETE FROM student_cgpa', function(err3) {
        const cgpaDeleted = this.changes;
        res.json({ 
          message: `Cleared ${resultsDeleted} student results, ${sgpaDeleted} SGPA records, and ${cgpaDeleted} CGPA records`,
          student_results_deleted: resultsDeleted,
          student_gpa_deleted: sgpaDeleted,
          student_cgpa_deleted: cgpaDeleted
        });
      });
    });
  });
});

// Get student GPA from stored tables
app.get('/api/student/gpa', authenticateToken, (req, res) => {
  const studentId = req.user.id;
  const { semester, academic_year } = req.query;
  
  // Get SGPA records
  let sgpaQuery = 'SELECT * FROM student_gpa WHERE student_id = ?';
  let sgpaParams = [studentId];
  
  if (semester) {
    sgpaQuery += ' AND semester = ?';
    sgpaParams.push(semester);
  }
  if (academic_year) {
    sgpaQuery += ' AND academic_year = ?';
    sgpaParams.push(academic_year);
  }
  
  sgpaQuery += ' ORDER BY academic_year DESC, semester DESC';
  
  db.all(sgpaQuery, sgpaParams, (err, gpaRecords) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    // Get CGPA from separate table
    db.get('SELECT * FROM student_cgpa WHERE student_id = ?', [studentId], (err, cgpaRecord) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      
      const latestSGPA = gpaRecords[0];
      
      res.json({
        records: gpaRecords,
        current: {
          sgpa: latestSGPA ? latestSGPA.sgpa : 0,
          cgpa: cgpaRecord ? cgpaRecord.cgpa : 0,
          semester: latestSGPA ? latestSGPA.semester : null,
          academic_year: latestSGPA ? latestSGPA.academic_year : null,
          total_semesters: cgpaRecord ? cgpaRecord.total_semesters : 0
        }
      });
    });
  });
});

// Calculate GPA from student_results table
function calculateGPAFromResults(registerNo, semester, academicYear, callback) {
  db.get('SELECT id FROM users WHERE register_no = ?', [registerNo], (err, student) => {
    if (err || !student) return callback(err || new Error('Student not found'));
    
    // Get results for specific semester and academic year only
    db.all('SELECT * FROM student_results WHERE register_no = ? AND semester = ? AND academic_year = ? AND semester_grade IS NOT NULL',
      [registerNo, semester, academicYear], (err, results) => {
        if (err) return callback(err);
        
        let totalCredits = 0;
        let totalGradePoints = 0;
        
        console.log(`Found ${results.length} results for ${registerNo} semester ${semester} year ${academicYear}`);
        
        results.forEach(result => {
          const credits = 3;
          const gradePoints = calculateGradePoints(result.semester_grade);
          totalCredits += credits;
          totalGradePoints += (gradePoints * credits);
          console.log(`${result.subject_code}: ${result.semester_grade} = ${gradePoints} points`);
        });
        
        const sgpa = totalCredits > 0 ? parseFloat((totalGradePoints / totalCredits).toFixed(2)) : 0;
        console.log(`Total: ${totalGradePoints}/${totalCredits} = SGPA: ${sgpa}`);
        
        // Store SGPA in student_gpa table
        db.run(`INSERT OR REPLACE INTO student_gpa 
                (student_id, semester, academic_year, sgpa, total_credits, earned_credits) 
                VALUES (?, ?, ?, ?, ?, ?)`,
          [student.id, semester, academicYear, sgpa, totalCredits, totalCredits],
          (err) => {
            if (err) return callback(err);
            updateStudentCGPA(student.id, callback);
          }
        );
      }
    );
  });
}

// Student calculate own GPA
app.post('/api/student/calculate-gpa', authenticateToken, (req, res) => {
  const studentId = req.user.id;
  
  db.get('SELECT register_no FROM users WHERE id = ?', [studentId], (err, student) => {
    if (err || !student) return res.status(500).json({ error: 'Student not found' });
    
    db.all('SELECT DISTINCT semester, academic_year FROM student_results WHERE register_no = ? AND semester_grade IS NOT NULL',
      [student.register_no], (err, resultSemesters) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        let completed = 0;
        const total = resultSemesters.length;
        
        if (total === 0) {
          return res.json({ message: 'No semester results found' });
        }
        
        resultSemesters.forEach(sem => {
          calculateGPAFromResults(student.register_no, sem.semester, sem.academic_year, (err) => {
            completed++;
            if (completed === total) {
              res.json({ message: `GPA calculated for ${total} semesters from results` });
            }
          });
        });
      }
    );
  });
});

// Admin trigger GPA calculation
app.post('/api/admin/calculate-gpa', authenticateToken, requireAdmin, (req, res) => {
  const { student_id, semester, academic_year } = req.body;
  
  calculateAndStoreGPA(student_id, semester, academic_year, (err) => {
    if (err) return res.status(500).json({ error: 'GPA calculation failed' });
    res.json({ message: 'GPA calculated and stored successfully' });
  });
});

// Calculate GPA for all students from student_results
app.post('/api/admin/calculate-all-gpa', authenticateToken, requireAdmin, (req, res) => {
  db.all('SELECT DISTINCT register_no FROM student_results', (err, students) => {
    console.log(`Found ${students?.length || 0} students with results`);
    if (students && students.length > 0) {
      console.log(`First student: ${students[0].register_no}`);
    }
    if (err) return res.status(500).json({ error: 'Database error' });
    
    let processed = 0;
    const total = students.length;
    
    if (total === 0) {
      return res.json({ message: 'No student results found' });
    }
    
    students.forEach(student => {
      console.log(`Processing student: ${student.register_no}`);
      
      db.get('SELECT id FROM users WHERE register_no = ?', [student.register_no], (err, user) => {
        if (err || !user) {
          console.log(`User not found for ${student.register_no}`);
          processed++;
          if (processed === total) {
            res.json({ message: `GPA calculated for ${total} students` });
          }
          return;
        }
        
        db.all('SELECT DISTINCT semester, academic_year FROM student_results WHERE register_no = ?',
          [student.register_no], (err, semesters) => {
            if (err) {
              processed++;
              if (processed === total) {
                res.json({ message: `GPA calculated for ${total} students` });
              }
              return;
            }
            
            console.log(`Found ${semesters.length} semesters for ${student.register_no}:`, semesters);
            
            let semProcessed = 0;
            semesters.forEach(sem => {
              console.log(`Calculating for semester ${sem.semester}, year ${sem.academic_year}`);
              calculateGPAFromResults(student.register_no, sem.semester, sem.academic_year, () => {
                semProcessed++;
                if (semProcessed === semesters.length) {
                  processed++;
                  if (processed === total) {
                    res.json({ message: `GPA calculated for ${total} students` });
                  }
                }
              });
            });
          }
        );
      });
    });
  });
});

// Clear all student results and GPA tables
app.delete('/api/debug/clear-all-results', authenticateToken, requireAdmin, (req, res) => {
  db.run('DELETE FROM student_results', function(err1) {
    if (err1) return res.status(500).json({ error: 'Failed to clear student_results' });
    const resultsDeleted = this.changes;
    
    db.run('DELETE FROM student_gpa', function(err2) {
      if (err2) return res.status(500).json({ error: 'Failed to clear student_gpa' });
      const sgpaDeleted = this.changes;
      
      db.run('DELETE FROM student_cgpa', function(err3) {
        if (err3) return res.status(500).json({ error: 'Failed to clear student_cgpa' });
        const cgpaDeleted = this.changes;
        
        res.json({ 
          message: `${resultsDeleted} student results, ${sgpaDeleted} SGPA records, and ${cgpaDeleted} CGPA records deleted successfully`,
          student_results_deleted: resultsDeleted,
          student_gpa_deleted: sgpaDeleted,
          student_cgpa_deleted: cgpaDeleted
        });
      });
    });
  });
});