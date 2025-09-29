// Database helper functions for PostgreSQL

class DBHelper {
  constructor(pool) {
    this.pool = pool;
  }

  // Execute query with parameters
  async query(text, params = []) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // Get single row
  async get(text, params = []) {
    const result = await this.query(text, params);
    return result.rows[0];
  }

  // Get all rows
  async all(text, params = []) {
    const result = await this.query(text, params);
    return result.rows;
  }

  // Run insert/update/delete
  async run(text, params = []) {
    const result = await this.query(text, params);
    return {
      lastID: result.rows[0]?.id,
      changes: result.rowCount
    };
  }

  // Begin transaction
  async begin() {
    return this.query('BEGIN');
  }

  // Commit transaction
  async commit() {
    return this.query('COMMIT');
  }

  // Rollback transaction
  async rollback() {
    return this.query('ROLLBACK');
  }
}

module.exports = DBHelper;