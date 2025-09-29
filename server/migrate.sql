-- PostgreSQL Migration Script

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    register_no VARCHAR(50) UNIQUE,
    staff_id VARCHAR(50) UNIQUE,
    admin_id VARCHAR(50) UNIQUE,
    password TEXT,
    role VARCHAR(20),
    name TEXT,
    email TEXT,
    department TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    class_id INTEGER,
    joining_year INTEGER,
    current_semester INTEGER,
    academic_year TEXT
);

-- Staff assignments table
CREATE TABLE IF NOT EXISTS staff_assignments (
    id SERIAL PRIMARY KEY,
    staff_id TEXT NOT NULL,
    staff_name TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    semester TEXT NOT NULL,
    section TEXT DEFAULT 'A',
    credits INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CC assignments table
CREATE TABLE IF NOT EXISTS cc_assignments (
    id SERIAL PRIMARY KEY,
    staff_id TEXT NOT NULL,
    staff_name TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    semester TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    section TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    semester TEXT NOT NULL,
    credits INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(subject_code, department, year, semester)
);

-- Admin notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    related_id INTEGER,
    read_status INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
    id SERIAL PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Timetables table
CREATE TABLE IF NOT EXISTS timetables (
    id SERIAL PRIMARY KEY,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    semester TEXT NOT NULL,
    section TEXT NOT NULL,
    day_of_week INTEGER NOT NULL,
    period_number INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    staff_id TEXT NOT NULL,
    staff_name TEXT NOT NULL,
    room_number TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(department, year, semester, section, day_of_week, period_number)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    staff_id TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    semester TEXT NOT NULL,
    day_of_week INTEGER NOT NULL,
    period_number INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject_code, date, period_number)
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    certificate_name TEXT NOT NULL,
    certificate_file TEXT,
    status TEXT DEFAULT 'pending',
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INTEGER,
    approved_date TIMESTAMP
);

-- Student results table
CREATE TABLE IF NOT EXISTS student_results (
    id SERIAL PRIMARY KEY,
    register_no TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    semester INTEGER NOT NULL,
    academic_year TEXT NOT NULL,
    ia1_marks INTEGER,
    ia2_marks INTEGER,
    ia3_marks INTEGER,
    semester_grade TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(register_no, subject_code, semester, academic_year)
);

-- Grades table
CREATE TABLE IF NOT EXISTS grades (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    subject_code TEXT NOT NULL,
    subject_name TEXT,
    semester INTEGER NOT NULL,
    ia1_marks INTEGER,
    ia2_marks INTEGER,
    ia3_marks INTEGER,
    semester_grade TEXT,
    academic_year TEXT DEFAULT '2024',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject_code, semester, academic_year)
);

-- Student GPA table
CREATE TABLE IF NOT EXISTS student_gpa (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    academic_year TEXT NOT NULL,
    sgpa REAL NOT NULL,
    total_credits INTEGER DEFAULT 0,
    earned_credits INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, semester, academic_year)
);

-- Student CGPA table
CREATE TABLE IF NOT EXISTS student_cgpa (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL UNIQUE,
    cgpa REAL NOT NULL,
    total_semesters INTEGER DEFAULT 0,
    total_credits INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value) VALUES ('auto_create_classes', 'true') ON CONFLICT (setting_key) DO NOTHING;