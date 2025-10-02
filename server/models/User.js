// models/User.js
class User {
  constructor(db) {
    this.db = db;
  }

  async findByRegisterNo(register_no) {
    const result = await this.db.query('SELECT * FROM users WHERE register_no = $1 AND role = $2', [register_no, 'student']);
    return result.rows[0];
  }

  async findByStaffId(staff_id) {
    const result = await this.db.query('SELECT * FROM users WHERE staff_id = $1 AND role = $2', [staff_id, 'staff']);
    return result.rows[0];
  }

  async findByAdminId(admin_id) {
    const result = await this.db.query('SELECT * FROM users WHERE admin_id = $1 AND role = $2', [admin_id, 'admin']);
    return result.rows[0];
  }

  async getAllAccounts() {
    try {
      // First check if users table exists
      const tableCheck = await this.db.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')");
      console.log('Users table exists:', tableCheck.rows[0].exists);
      
      if (!tableCheck.rows[0].exists) {
        console.log('Creating users table...');
        await this.db.query(`
          CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255),
            register_no VARCHAR(50),
            staff_id VARCHAR(50),
            admin_id VARCHAR(50),
            password VARCHAR(255),
            role VARCHAR(50),
            department VARCHAR(100),
            joining_year INTEGER,
            current_semester INTEGER,
            created_by INTEGER
          )
        `);
      }
      
      const result = await this.db.query('SELECT id, name, role, register_no, staff_id, admin_id, department, email FROM users ORDER BY role, register_no, staff_id, admin_id, name');
      console.log('Query result:', result.rows);
      return result.rows;
    } catch (error) {
      console.error('getAllAccounts error:', error);
      throw error;
    }
  }

  async createStudent(data) {
    const { name, email, register_no, password, department } = data;
    const result = await this.db.query(
      'INSERT INTO users (name, email, register_no, password, role, department) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, email, register_no, password, 'student', department]
    );
    return result.rows[0];
  }

  async createStaff(data) {
    const { name, email, staff_id, password, department } = data;
    const result = await this.db.query(
      'INSERT INTO users (name, email, staff_id, password, role, department) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, email, staff_id, password, 'staff', department]
    );
    return result.rows[0];
  }

  async deleteById(id) {
    const result = await this.db.query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  async updatePassword(id, hashedPassword) {
    const result = await this.db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
    return result.rowCount > 0;
  }
}

module.exports = User;