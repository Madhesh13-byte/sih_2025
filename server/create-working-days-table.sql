-- Create working_days table for calendar functionality
CREATE TABLE IF NOT EXISTS working_days (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('working', 'holiday', 'exam', 'break')),
  description TEXT,
  academic_year VARCHAR(20),
  semester INTEGER CHECK (semester >= 1 AND semester <= 8),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_working_days_date ON working_days(date);
CREATE INDEX IF NOT EXISTS idx_working_days_type ON working_days(type);
CREATE INDEX IF NOT EXISTS idx_working_days_academic_year ON working_days(academic_year);