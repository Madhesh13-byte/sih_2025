-- Add missing column to staff_assignments table
ALTER TABLE staff_assignments ADD COLUMN IF NOT EXISTS class_id INTEGER;