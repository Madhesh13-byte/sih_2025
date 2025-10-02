// check-db-structure.js - Check existing database structure
const db = require('./config/database');

async function checkDatabase() {
  try {
    console.log('Checking database structure...\n');
    
    // Check if student_results table exists
    try {
      const resultsCheck = await db.query("SELECT COUNT(*) FROM student_results LIMIT 1");
      console.log('✅ student_results table exists with', resultsCheck.rows[0].count, 'records');
      
      // Show sample data
      const sampleResults = await db.query("SELECT * FROM student_results LIMIT 3");
      console.log('Sample student_results data:');
      console.table(sampleResults.rows);
    } catch (error) {
      console.log('❌ student_results table does not exist');
    }
    
    // Check if student_cgpa table exists
    try {
      const cgpaCheck = await db.query("SELECT COUNT(*) FROM student_cgpa LIMIT 1");
      console.log('\n✅ student_cgpa table exists with', cgpaCheck.rows[0].count, 'records');
      
      // Show sample data
      const sampleCgpa = await db.query("SELECT * FROM student_cgpa LIMIT 3");
      console.log('Sample student_cgpa data:');
      console.table(sampleCgpa.rows);
    } catch (error) {
      console.log('\n❌ student_cgpa table does not exist');
    }
    
    // Check if student_gpa table exists
    try {
      const gpaCheck = await db.query("SELECT COUNT(*) FROM student_gpa LIMIT 1");
      console.log('\n✅ student_gpa table exists with', gpaCheck.rows[0].count, 'records');
      
      // Show sample data
      const sampleGpa = await db.query("SELECT * FROM student_gpa LIMIT 3");
      console.log('Sample student_gpa data:');
      console.table(sampleGpa.rows);
    } catch (error) {
      console.log('\n❌ student_gpa table does not exist');
    }
    
    // Check what register numbers exist
    try {
      const registerNos = await db.query("SELECT DISTINCT register_no FROM users WHERE role = 'student' LIMIT 5");
      console.log('\nSample student register numbers:');
      registerNos.rows.forEach(row => console.log('-', row.register_no));
    } catch (error) {
      console.log('\n❌ Could not fetch student register numbers');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database check error:', error);
    process.exit(1);
  }
}

checkDatabase();