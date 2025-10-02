// models/Subject.js
class Subject {
  constructor(db) {
    this.db = db;
  }

  async getAll() {
    const tableCheck = await this.db.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subjects')");
    if (!tableCheck.rows[0].exists) return [];
    
    const result = await this.db.query('SELECT * FROM subjects ORDER BY subject_name');
    return result.rows;
  }

  async create(data) {
    const { subject_code, subject_name, department, year, semester, credits } = data;
    
    await this.ensureTableExists();
    
    const result = await this.db.query(
      'INSERT INTO subjects (subject_code, subject_name, department, year, semester, credits) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [subject_code, subject_name, department, year, semester, credits || 3]
    );
    return result.rows[0];
  }

  async deleteAll() {
    const tableCheck = await this.db.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subjects')");
    if (!tableCheck.rows[0].exists) return 0;
    
    const result = await this.db.query('DELETE FROM subjects');
    return result.rowCount;
  }

  async deleteById(id) {
    const result = await this.db.query('DELETE FROM subjects WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  async bulkCreate(subjects) {
    await this.ensureTableExists();
    
    let imported = 0;
    for (const subject of subjects) {
      try {
        if (!subject.subject_code || !subject.subject_name) continue;
        
        await this.db.query('INSERT INTO subjects (subject_code, subject_name, department, year, semester, credits) VALUES ($1, $2, $3, $4, $5, $6)',
          [subject.subject_code, subject.subject_name, subject.department, parseInt(subject.year), parseInt(subject.semester), parseInt(subject.credits)]
        );
        imported++;
      } catch (error) {
        console.error('Error importing subject:', error);
      }
    }
    return imported;
  }

  async ensureTableExists() {
    const tableCheck = await this.db.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subjects')");
    
    if (!tableCheck.rows[0].exists) {
      await this.db.query(`
        CREATE TABLE subjects (
          id SERIAL PRIMARY KEY,
          subject_code VARCHAR(20) NOT NULL,
          subject_name VARCHAR(255) NOT NULL,
          department VARCHAR(50) NOT NULL,
          year INTEGER NOT NULL,
          semester INTEGER NOT NULL,
          credits INTEGER DEFAULT 3
        )
      `);
    }
  }
}

module.exports = Subject;