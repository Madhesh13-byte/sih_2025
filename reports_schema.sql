-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  report_type VARCHAR(100) NOT NULL,
  data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);

-- Sample data
INSERT INTO reports (title, description, report_type, data) VALUES 
('Student Enrollment Report', 'Monthly student enrollment statistics', 'enrollment', '{"total_students": 1250, "new_admissions": 45}'),
('Academic Performance', 'Semester-wise academic performance', 'academic', '{"average_gpa": 7.8, "pass_rate": 92}'),
('Placement Statistics', 'Annual placement report', 'placement', '{"placed_students": 350, "placement_rate": 87}');