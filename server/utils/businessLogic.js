const { calculateStudentYear, getYearRoman } = require('./academicUtils');

// Class capacity management
const CLASS_CAPACITY = {
  'default': 60,
  'lab': 30
};

const checkClassCapacity = async (db, classId) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM users WHERE class_id = ? AND role = ?', 
      [classId, 'student'], (err, result) => {
        if (err) reject(err);
        else resolve(result.count < CLASS_CAPACITY.default);
      });
  });
};

// Staff conflict detection
const checkStaffConflict = async (db, staffId, semester, timeSlot = null) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM staff_assignments WHERE staff_id = ? AND semester = ?',
      [staffId, semester], (err, assignments) => {
        if (err) reject(err);
        else resolve(assignments.length < 6); // Max 6 subjects per staff
      });
  });
};

// Auto-assign student to appropriate class with enhanced validation
const autoAssignStudentClass = async (db, studentData, options = {}) => {
  const { department, joining_year } = studentData;
  const { autoCreateEnabled = true, adminId = null } = options;
  
  // Validate department and year
  if (!department || !joining_year) {
    throw new Error('Department and joining year are required');
  }
  
  const currentYear = calculateStudentYear(joining_year);
  if (currentYear > 4 || currentYear < 1) {
    throw new Error(`Invalid academic year: ${currentYear}. Students must be in years 1-4.`);
  }
  
  const yearRoman = getYearRoman(currentYear);
  
  return new Promise((resolve, reject) => {
    // Find existing classes for this department/year
    db.all('SELECT id, section FROM classes WHERE department = ? AND year = ? ORDER BY section',
      [department, yearRoman], async (err, existingClasses) => {
        if (err) return reject(err);
        
        try {
          // Try to assign to existing class with capacity
          for (const cls of existingClasses) {
            const hasCapacity = await checkClassCapacity(db, cls.id);
            if (hasCapacity) {
              return resolve({ classId: cls.id, created: false });
            }
          }
          
          // No existing class with capacity found
          if (!autoCreateEnabled) {
            throw new Error(`No available capacity in existing ${department} ${yearRoman} classes. Auto-creation is disabled.`);
          }
          
          // Determine next section
          const nextSection = existingClasses.length === 0 ? 'A' : 
            String.fromCharCode(65 + existingClasses.length); // A, B, C...
          
          if (nextSection > 'Z') {
            throw new Error(`Maximum sections exceeded for ${department} ${yearRoman}`);
          }
          
          // Create new class with rollback capability
          db.run('INSERT INTO classes (department, year, section) VALUES (?, ?, ?)',
            [department, yearRoman, nextSection], function(createErr) {
              if (createErr) {
                return reject(new Error(`Failed to create class: ${createErr.message}`));
              }
              
              const newClassId = this.lastID;
              
              // Log admin notification
              if (adminId) {
                logAdminNotification(db, adminId, 
                  `Auto-created class: ${department} ${yearRoman} ${nextSection}`,
                  'CLASS_AUTO_CREATED', newClassId);
              }
              
              resolve({ classId: newClassId, created: true, section: nextSection });
            });
        } catch (error) {
          reject(error);
        }
      });
  });
};

// Log admin notifications
const logAdminNotification = (db, adminId, message, type, relatedId = null) => {
  db.run(`INSERT INTO admin_notifications (admin_id, message, type, related_id, created_at) 
           VALUES (?, ?, ?, ?, datetime('now'))`,
    [adminId, message, type, relatedId], (err) => {
      if (err) console.error('Failed to log admin notification:', err);
    });
};

// Validate staff assignment
const validateStaffAssignment = async (db, assignmentData) => {
  const { staff_id, semester } = assignmentData;
  
  // Check if staff exists
  const staffExists = await new Promise((resolve, reject) => {
    db.get('SELECT id FROM users WHERE staff_id = ? AND role = ?', 
      [staff_id, 'staff'], (err, staff) => {
        if (err) reject(err);
        else resolve(!!staff);
      });
  });
  
  if (!staffExists) {
    throw new Error('Staff member not found');
  }
  
  // Check for conflicts
  const hasConflict = await checkStaffConflict(db, staff_id, semester);
  if (!hasConflict) {
    throw new Error('Staff member already has maximum assignments for this semester');
  }
  
  return true;
};

// Semester promotion logic
const promoteStudents = async (db) => {
  const { getCurrentAcademicYear, calculateStudentYear, getYearRoman } = require('./academicUtils');
  
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM users WHERE role = ? AND joining_year IS NOT NULL', 
      ['student'], async (err, students) => {
        if (err) return reject(err);
        
        const updates = [];
        
        for (const student of students) {
          const newYear = calculateStudentYear(student.joining_year);
          const newYearRoman = getYearRoman(newYear);
          
          if (newYear <= 4) {
            // Find appropriate class for new year
            try {
              const newClassId = await autoAssignStudentClass(db, {
                department: student.department,
                joining_year: student.joining_year
              });
              
              updates.push({
                id: student.id,
                class_id: newClassId
              });
            } catch (error) {
              console.error(`Failed to promote student ${student.register_no}:`, error);
            }
          }
        }
        
        // Execute updates
        const promises = updates.map(update => 
          new Promise((resolve, reject) => {
            db.run('UPDATE users SET class_id = ? WHERE id = ?',
              [update.class_id, update.id], (err) => {
                if (err) reject(err);
                else resolve();
              });
          })
        );
        
        Promise.all(promises)
          .then(() => resolve(updates.length))
          .catch(reject);
      });
  });
};

// Rollback class creation if student assignment fails
const rollbackClassCreation = async (db, classId) => {
  return new Promise((resolve, reject) => {
    // Check if class has any students
    db.get('SELECT COUNT(*) as count FROM users WHERE class_id = ? AND role = ?',
      [classId, 'student'], (err, result) => {
        if (err) return reject(err);
        
        if (result.count === 0) {
          // Safe to delete empty class
          db.run('DELETE FROM classes WHERE id = ?', [classId], (deleteErr) => {
            if (deleteErr) reject(deleteErr);
            else resolve(true);
          });
        } else {
          resolve(false); // Class has students, don't delete
        }
      });
  });
};

module.exports = {
  checkClassCapacity,
  checkStaffConflict,
  autoAssignStudentClass,
  validateStaffAssignment,
  promoteStudents,
  rollbackClassCreation,
  logAdminNotification,
  CLASS_CAPACITY
};