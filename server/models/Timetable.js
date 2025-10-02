// models/Timetable.js - Timetable model with conflict prevention
class TimetableModel {
  constructor(db) {
    this.db = db;
  }

  async initializeTables() {
    // Time slots table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS time_slots (
        id SERIAL PRIMARY KEY,
        slot_name VARCHAR(20) NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        slot_order INTEGER NOT NULL
      )
    `);

    // Timetable entries table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS timetable_entries (
        id SERIAL PRIMARY KEY,
        staff_id VARCHAR(20) REFERENCES users(staff_id),
        subject_code VARCHAR(20) NOT NULL,
        batch_id INTEGER REFERENCES classes(id),
        day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 6),
        time_slot_id INTEGER REFERENCES time_slots(id),
        room_number VARCHAR(20),
        academic_year INTEGER NOT NULL,
        semester INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(staff_id, day_of_week, time_slot_id, academic_year, semester),
        UNIQUE(batch_id, day_of_week, time_slot_id, academic_year, semester),
        UNIQUE(room_number, day_of_week, time_slot_id, academic_year, semester)
      )
    `);

    // Insert default time slots
    const timeSlots = [
      ['Period 1', '09:00', '09:50', 1],
      ['Period 2', '09:50', '10:40', 2],
      ['Period 3', '11:00', '11:50', 3],
      ['Period 4', '11:50', '12:40', 4],
      ['Period 5', '13:30', '14:20', 5],
      ['Period 6', '14:20', '15:10', 6],
      ['Period 7', '15:10', '16:00', 7],
      ['Period 8', '16:00', '16:50', 8]
    ];

    for (const slot of timeSlots) {
      await this.db.query(`
        INSERT INTO time_slots (slot_name, start_time, end_time, slot_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
      `, slot);
    }
  }

  async checkConflicts(staffId, batchId, dayOfWeek, timeSlotId, roomNumber, academicYear, semester, excludeId = null) {
    const conflicts = [];

    // Teacher conflict
    const teacherConflict = await this.db.query(`
      SELECT te.*, s.subject_name, c.class_name
      FROM timetable_entries te
      LEFT JOIN subjects s ON te.subject_code = s.subject_code
      LEFT JOIN classes c ON te.batch_id = c.id
      WHERE te.staff_id = $1 AND te.day_of_week = $2 AND te.time_slot_id = $3 
      AND te.academic_year = $4 AND te.semester = $5
      ${excludeId ? 'AND te.id != $6' : ''}
    `, excludeId ? [staffId, dayOfWeek, timeSlotId, academicYear, semester, excludeId] : 
                   [staffId, dayOfWeek, timeSlotId, academicYear, semester]);

    if (teacherConflict.rows.length > 0) {
      conflicts.push({
        type: 'teacher',
        message: `Teacher already assigned to ${teacherConflict.rows[0].subject_name} for ${teacherConflict.rows[0].class_name}`
      });
    }

    // Batch conflict
    const batchConflict = await this.db.query(`
      SELECT te.*, s.subject_name, u.name as teacher_name
      FROM timetable_entries te
      LEFT JOIN subjects s ON te.subject_code = s.subject_code
      LEFT JOIN users u ON te.staff_id = u.staff_id
      WHERE te.batch_id = $1 AND te.day_of_week = $2 AND te.time_slot_id = $3 
      AND te.academic_year = $4 AND te.semester = $5
      ${excludeId ? 'AND te.id != $6' : ''}
    `, excludeId ? [batchId, dayOfWeek, timeSlotId, academicYear, semester, excludeId] : 
                   [batchId, dayOfWeek, timeSlotId, academicYear, semester]);

    if (batchConflict.rows.length > 0) {
      conflicts.push({
        type: 'batch',
        message: `Batch already has ${batchConflict.rows[0].subject_name} with ${batchConflict.rows[0].teacher_name}`
      });
    }

    // Room conflict
    if (roomNumber) {
      const roomConflict = await this.db.query(`
        SELECT te.*, s.subject_name, u.name as teacher_name, c.class_name
        FROM timetable_entries te
        LEFT JOIN subjects s ON te.subject_code = s.subject_code
        LEFT JOIN users u ON te.staff_id = u.staff_id
        LEFT JOIN classes c ON te.batch_id = c.id
        WHERE te.room_number = $1 AND te.day_of_week = $2 AND te.time_slot_id = $3 
        AND te.academic_year = $4 AND te.semester = $5
        ${excludeId ? 'AND te.id != $6' : ''}
      `, excludeId ? [roomNumber, dayOfWeek, timeSlotId, academicYear, semester, excludeId] : 
                     [roomNumber, dayOfWeek, timeSlotId, academicYear, semester]);

      if (roomConflict.rows.length > 0) {
        conflicts.push({
          type: 'room',
          message: `Room ${roomNumber} already occupied by ${roomConflict.rows[0].teacher_name} for ${roomConflict.rows[0].subject_name}`
        });
      }
    }

    return conflicts;
  }

  async createTimetableEntry(data) {
    const { staffId, subjectCode, batchId, dayOfWeek, timeSlotId, roomNumber, academicYear, semester } = data;
    
    const conflicts = await this.checkConflicts(staffId, batchId, dayOfWeek, timeSlotId, roomNumber, academicYear, semester);
    
    if (conflicts.length > 0) {
      throw new Error(`Conflicts found: ${conflicts.map(c => c.message).join(', ')}`);
    }

    const result = await this.db.query(`
      INSERT INTO timetable_entries (staff_id, subject_code, batch_id, day_of_week, time_slot_id, room_number, academic_year, semester)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [staffId, subjectCode, batchId, dayOfWeek, timeSlotId, roomNumber, academicYear, semester]);

    return result.rows[0];
  }

  async getTeacherTimetable(staffId, academicYear, semester) {
    const result = await this.db.query(`
      SELECT te.*, ts.slot_name, ts.start_time, ts.end_time, ts.slot_order,
             s.subject_name, c.class_name, c.department, c.year, c.section
      FROM timetable_entries te
      JOIN time_slots ts ON te.time_slot_id = ts.id
      LEFT JOIN subjects s ON te.subject_code = s.subject_code
      LEFT JOIN classes c ON te.batch_id = c.id
      WHERE te.staff_id = $1 AND te.academic_year = $2 AND te.semester = $3
      ORDER BY te.day_of_week, ts.slot_order
    `, [staffId, academicYear, semester]);

    return result.rows;
  }

  async getBatchTimetable(batchId, academicYear, semester) {
    const result = await this.db.query(`
      SELECT te.*, ts.slot_name, ts.start_time, ts.end_time, ts.slot_order,
             s.subject_name, u.name as teacher_name
      FROM timetable_entries te
      JOIN time_slots ts ON te.time_slot_id = ts.id
      LEFT JOIN subjects s ON te.subject_code = s.subject_code
      LEFT JOIN users u ON te.staff_id = u.staff_id
      WHERE te.batch_id = $1 AND te.academic_year = $2 AND te.semester = $3
      ORDER BY te.day_of_week, ts.slot_order
    `, [batchId, academicYear, semester]);

    return result.rows;
  }

  async getTeacherWorkload(staffId, academicYear, semester) {
    const result = await this.db.query(`
      SELECT 
        COUNT(*) as total_periods,
        COUNT(DISTINCT te.subject_code) as subjects_count,
        COUNT(DISTINCT te.batch_id) as batches_count,
        array_agg(DISTINCT s.subject_name) as subjects,
        array_agg(DISTINCT c.class_name) as batches
      FROM timetable_entries te
      LEFT JOIN subjects s ON te.subject_code = s.subject_code
      LEFT JOIN classes c ON te.batch_id = c.id
      WHERE te.staff_id = $1 AND te.academic_year = $2 AND te.semester = $3
    `, [staffId, academicYear, semester]);

    return result.rows[0];
  }
}

module.exports = TimetableModel;