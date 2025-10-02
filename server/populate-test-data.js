// populate-test-data.js - Script to populate test data for student results and GPA
const db = require('./config/database');

async function populateTestData() {
  try {
    console.log('Creating student_results table...');
    
    // Create student_results table
    await db.query(`
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

    console.log('Inserting sample student results...');
    
    // Sample results data
    const results = [
      ['STU001', 'CS101', 1, 2024, 85, 90, 88, 'A+'],
      ['STU001', 'MA101', 1, 2024, 78, 82, 80, 'A'],
      ['STU001', 'PH101', 1, 2024, 92, 95, 90, 'O'],
      ['STU001', 'CH101', 1, 2024, 75, 78, 82, 'B+'],
      ['STU001', 'EN101', 1, 2024, 88, 85, 90, 'A+'],
      ['STU001', 'CS201', 2, 2024, 90, 88, 92, 'O'],
      ['STU001', 'MA201', 2, 2024, 82, 85, 88, 'A+'],
      ['STU001', 'DS101', 2, 2024, 95, 92, 90, 'O'],
      ['STU002', 'CS101', 1, 2024, 92, 95, 90, 'O'],
      ['STU002', 'MA101', 1, 2024, 85, 88, 90, 'A+'],
      ['STU002', 'PH101', 1, 2024, 78, 82, 85, 'A'],
      ['STU002', 'CH101', 1, 2024, 88, 90, 85, 'A+'],
      ['STU002', 'EN101', 1, 2024, 92, 88, 95, 'O']
    ];

    for (const result of results) {
      await db.query(`
        INSERT INTO student_results (register_no, subject_code, semester, academic_year, ia1_marks, ia2_marks, ia3_marks, semester_grade) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (register_no, subject_code, semester, academic_year) 
        DO UPDATE SET 
          ia1_marks = $5,
          ia2_marks = $6,
          ia3_marks = $7,
          semester_grade = $8
      `, result);
    }

    console.log('Creating student_gpa table...');
    
    // Create GPA table
    await db.query(`
      CREATE TABLE IF NOT EXISTS student_gpa (
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

    console.log('Calculating GPA...');
    
    // Grade to points mapping
    const gradePoints = {
      'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'P': 4, 'F': 0
    };

    // Get all students with results
    const studentsResult = await db.query(`
      SELECT DISTINCT register_no FROM student_results
    `);

    for (const student of studentsResult.rows) {
      const registerNo = student.register_no;

      // Get all semesters for this student
      const semestersResult = await db.query(`
        SELECT DISTINCT semester FROM student_results 
        WHERE register_no = $1 ORDER BY semester
      `, [registerNo]);

      let cumulativePoints = 0;
      let cumulativeCredits = 0;

      for (const semesterRow of semestersResult.rows) {
        const semester = semesterRow.semester;

        // Get semester results
        const resultsQuery = await db.query(`
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
        await db.query(`
          INSERT INTO student_gpa (register_no, semester, sgpa, cgpa, total_credits)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (register_no, semester)
          DO UPDATE SET sgpa = $3, cgpa = $4, total_credits = $5, calculated_at = CURRENT_TIMESTAMP
        `, [registerNo, semester, parseFloat(sgpa), parseFloat(cgpa), cumulativeCredits]);

        console.log(`GPA calculated for ${registerNo} - Semester ${semester}: SGPA=${sgpa}, CGPA=${cgpa}`);
      }
    }

    console.log('✅ Test data populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating test data:', error);
    process.exit(1);
  }
}

populateTestData();