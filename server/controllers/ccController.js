// controllers/ccController.js
class CCController {
  constructor(db) {
    this.db = db;
  }

  async getAll(req, res) {
    try {
      const result = await this.db.query('SELECT * FROM cc_assignments ORDER BY id');
      res.json(result.rows);
    } catch (error) {
      console.error('CC assignments fetch error:', error);
      res.status(500).json({ error: 'Database error: ' + error.message });
    }
  }

  async create(req, res) {
    try {
      const { staffId, staffName, department, year, semester } = req.body;
      
      // Create cc_assignments table if it doesn't exist
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS cc_assignments (
          id SERIAL PRIMARY KEY,
          staff_id VARCHAR(50) NOT NULL,
          staff_name VARCHAR(255) NOT NULL,
          department VARCHAR(100) NOT NULL,
          year INTEGER NOT NULL,
          semester INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      const result = await this.db.query(
        'INSERT INTO cc_assignments (staff_id, staff_name, department, year, semester) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [staffId, staffName, department, year, semester]
      );
      res.json(result.rows[0]);
    } catch (error) {
      console.error('CC assignment creation error:', error);
      res.status(500).json({ error: 'Database error: ' + error.message });
    }
  }

  async deleteById(req, res) {
    try {
      const result = await this.db.query('DELETE FROM cc_assignments WHERE id = $1', [req.params.id]);
      res.json({ message: 'CC assignment deleted successfully' });
    } catch (error) {
      console.error('CC assignment deletion error:', error);
      res.status(500).json({ error: 'Database error: ' + error.message });
    }
  }
}

module.exports = CCController;