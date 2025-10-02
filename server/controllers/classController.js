// controllers/classController.js
class ClassController {
  constructor(db) {
    this.db = db;
  }

  async getAll(req, res) {
    try {
      const result = await this.db.query('SELECT * FROM classes ORDER BY id');
      res.json(result.rows);
    } catch (error) {
      console.error('Classes fetch error:', error);
      res.status(500).json({ error: 'Database error: ' + error.message });
    }
  }

  async create(req, res) {
    try {
      const { department, year, semester, section } = req.body;
      const result = await this.db.query(
        'INSERT INTO classes (department, year, semester, section) VALUES ($1, $2, $3, $4) RETURNING *',
        [department, year, semester, section]
      );
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Database error: ' + error.message });
    }
  }

  async deleteById(req, res) {
    try {
      const result = await this.db.query('DELETE FROM classes WHERE id = $1', [req.params.id]);
      res.json({ message: 'Class deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Database error: ' + error.message });
    }
  }
}

module.exports = ClassController;