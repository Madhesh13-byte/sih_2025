// controllers/studentResultsController.js
const csv = require('csv-parser');
const fs = require('fs');

class StudentResultsController {
  constructor(db) {
    this.db = db;
  }

  async importResults(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No CSV file uploaded' });
      }

      const results = [];
      
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
          const values = Object.values(data);
          results.push({
            register_no: values[0] || '',
            subject_code: values[1] || '',
            semester: values[2] || '',
            academic_year: values[3] || '',
            ia1_marks: values[4] || null,
            ia2_marks: values[5] || null,
            ia3_marks: values[6] || null,
            semester_grade: values[7] || ''
          });
        })
        .on('end', async () => {
          if (results.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'No valid results found' });
          }

          // Create student_results table if it doesn't exist
          await this.db.query(`
            CREATE TABLE IF NOT EXISTS student_results (
              id SERIAL PRIMARY KEY,
              register_no VARCHAR(50) NOT NULL,
              subject_code VARCHAR(20) NOT NULL,
              semester INTEGER NOT NULL,
              academic_year INTEGER NOT NULL,
              ia1_marks INTEGER,
              ia2_marks INTEGER,
              ia3_marks INTEGER,
              semester_grade VARCHAR(5),
              UNIQUE(register_no, subject_code, semester, academic_year)
            )
          `);

          let imported = 0;
          
          for (const result of results) {
            try {
              if (!result.register_no || !result.subject_code || !result.semester) {
                continue;
              }
              
              await this.db.query(`
                INSERT INTO student_results (register_no, subject_code, semester, academic_year, ia1_marks, ia2_marks, ia3_marks, semester_grade) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (register_no, subject_code, semester, academic_year) 
                DO UPDATE SET 
                  ia1_marks = $5,
                  ia2_marks = $6,
                  ia3_marks = $7,
                  semester_grade = $8
              `, [
                result.register_no,
                result.subject_code,
                parseInt(result.semester),
                parseInt(result.academic_year),
                result.ia1_marks ? parseInt(result.ia1_marks) : null,
                result.ia2_marks ? parseInt(result.ia2_marks) : null,
                result.ia3_marks ? parseInt(result.ia3_marks) : null,
                result.semester_grade
              ]);
              imported++;
            } catch (error) {
              console.error('Error importing result:', error);
            }
          }
          
          fs.unlinkSync(req.file.path);
          res.json({ message: `${imported} results imported successfully` });
        })
        .on('error', (error) => {
          fs.unlinkSync(req.file.path);
          res.status(500).json({ error: 'CSV processing failed' });
        });
    } catch (error) {
      console.error('Import error:', error);
      res.status(500).json({ error: 'Import failed: ' + error.message });
    }
  }

  getTemplate(req, res) {
    const csvContent = 'register_no,subject_code,semester,academic_year,ia1_marks,ia2_marks,ia3_marks,semester_grade\n' +
                      'STUIT2501,CS101,1,2024,85,90,88,A+\n' +
                      'STUIT2501,MA101,1,2024,78,82,80,A\n' +
                      'STUIT2502,CS101,1,2024,92,95,90,O';
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=student_results_template.csv');
    res.send(csvContent);
  }

  async calculateAllGPA(req, res) {
    try {
      // Drop old tables and create correct structure
      await this.db.query('DROP TABLE IF EXISTS student_cgpa');
      await this.db.query('DROP TABLE IF EXISTS student_gpa');
      await this.db.query(`
        CREATE TABLE student_gpa (
          id SERIAL PRIMARY KEY,
          register_no VARCHAR(50) NOT NULL,
          semester INTEGER NOT NULL,
          sgpa DECIMAL(3,2),
          cgpa DECIMAL(3,2),
          total_credits INTEGER DEFAULT 0,
          calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(register_no, semester)
        )
      `);

      // Grade to points mapping
      const gradePoints = {
        'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0
      };

      // Get all students with results
      const studentsResult = await this.db.query(`
        SELECT DISTINCT register_no FROM student_results
      `);

      let processedStudents = 0;

      for (const student of studentsResult.rows) {
        const registerNo = student.register_no;

        // Get all semesters for this student
        const semestersResult = await this.db.query(`
          SELECT DISTINCT semester FROM student_results 
          WHERE register_no = $1 ORDER BY semester
        `, [registerNo]);

        let cumulativePoints = 0;
        let cumulativeCredits = 0;

        for (const semesterRow of semestersResult.rows) {
          const semester = semesterRow.semester;

          // Get semester results
          const resultsQuery = await this.db.query(`
            SELECT semester_grade FROM student_results 
            WHERE register_no = $1 AND semester = $2 AND semester_grade IS NOT NULL
          `, [registerNo, semester]);

          let semesterPoints = 0;
          let semesterCredits = 0;

          // Calculate SGPA
          for (const result of resultsQuery.rows) {
            const points = gradePoints[result.semester_grade] || 0;
            const credits = 3; // Assuming 3 credits per subject
            
            semesterPoints += points * credits;
            semesterCredits += credits;
            cumulativePoints += points * credits;
            cumulativeCredits += credits;
          }

          const sgpa = semesterCredits > 0 ? (semesterPoints / semesterCredits).toFixed(2) : 0;
          const cgpa = cumulativeCredits > 0 ? (cumulativePoints / cumulativeCredits).toFixed(2) : 0;

          // Insert/Update GPA record
          await this.db.query(`
            INSERT INTO student_gpa (register_no, semester, sgpa, cgpa, total_credits)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (register_no, semester)
            DO UPDATE SET sgpa = $3, cgpa = $4, total_credits = $5, calculated_at = CURRENT_TIMESTAMP
          `, [registerNo, semester, parseFloat(sgpa), parseFloat(cgpa), cumulativeCredits]);
        }

        processedStudents++;
      }

      res.json({ message: `GPA calculated and stored for ${processedStudents} students` });
    } catch (error) {
      console.error('GPA calculation error:', error);
      res.status(500).json({ error: 'GPA calculation failed: ' + error.message });
    }
  }

  async getStudentResults(req, res) {
    try {
      const registerNo = req.params.registerNo;
      const semester = req.query.semester;
      
      let query = `
        SELECT sr.*, s.subject_name 
        FROM student_results sr
        LEFT JOIN subjects s ON sr.subject_code = s.subject_code
        WHERE sr.register_no = $1
      `;
      const params = [registerNo];
      
      if (semester) {
        query += ' AND sr.semester = $2';
        params.push(parseInt(semester));
      }
      
      query += ' ORDER BY sr.semester, sr.subject_code';
      
      const result = await this.db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching student results:', error);
      res.status(500).json({ error: 'Failed to fetch student results' });
    }
  }
}

module.exports = StudentResultsController;