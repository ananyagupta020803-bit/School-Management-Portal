-- School Management Database Schema

-- Create Database
CREATE DATABASE IF NOT EXISTS school_management;
USE school_management;

-- Users Table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    class VARCHAR(50) NOT NULL,
    section VARCHAR(10),
    roll_number INT,
    date_of_birth DATE,
    phone VARCHAR(20),
    address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    teacher_id VARCHAR(50) UNIQUE NOT NULL,
    subject VARCHAR(100) NOT NULL,
    qualification VARCHAR(255),
    phone VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT
);

-- Classes Table
CREATE TABLE IF NOT EXISTS classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    section VARCHAR(10),
    teacher_id INT,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
);

-- Timetable Table
CREATE TABLE IF NOT EXISTS timetable (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(20),
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- Grades Table
CREATE TABLE IF NOT EXISTS grades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    exam_type ENUM('midterm', 'final', 'quiz', 'assignment') NOT NULL,
    marks DECIMAL(5,2) NOT NULL,
    max_marks DECIMAL(5,2) NOT NULL,
    grade VARCHAR(5),
    remarks TEXT,
    exam_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
    marked_by INT NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES teachers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (student_id, date)
);

-- Insert Sample Data

-- Admin User
INSERT INTO users (email, password, name, role) VALUES 
('admin@school.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'Admin User', 'admin');
-- Password: admin123

-- Sample Teachers
INSERT INTO users (email, password, name, role) VALUES 
('teacher1@school.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'John Smith', 'teacher'),
('teacher2@school.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'Sarah Johnson', 'teacher');
-- Password: teacher123

INSERT INTO teachers (user_id, teacher_id, subject, qualification, phone) VALUES 
(2, 'TCH001', 'Mathematics', 'M.Sc Mathematics', '1234567890'),
(3, 'TCH002', 'Science', 'M.Sc Physics', '1234567891');

-- Sample Students
INSERT INTO users (email, password, name, role) VALUES 
('student1@school.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'Alice Williams', 'student'),
('student2@school.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'Bob Brown', 'student');
-- Password: student123

INSERT INTO students (user_id, student_id, class, section, roll_number, date_of_birth, phone) VALUES 
(4, 'STU001', '10', 'A', 1, '2009-05-15', '9876543210'),
(5, 'STU002', '10', 'A', 2, '2009-08-22', '9876543211');

-- Sample Subjects
INSERT INTO subjects (name, code, description) VALUES 
('Mathematics', 'MATH101', 'Basic Mathematics'),
('Science', 'SCI101', 'General Science'),
('English', 'ENG101', 'English Language'),
('History', 'HIS101', 'World History');

-- Sample Classes
INSERT INTO classes (name, section, teacher_id) VALUES 
('10', 'A', 1),
('10', 'B', 2);

-- Sample Timetable
INSERT INTO timetable (class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room_number) VALUES 
(1, 1, 1, 'Monday', '09:00:00', '10:00:00', 'R101'),
(1, 2, 2, 'Monday', '10:00:00', '11:00:00', 'R102'),
(1, 1, 1, 'Tuesday', '09:00:00', '10:00:00', 'R101'),
(1, 2, 2, 'Wednesday', '10:00:00', '11:00:00', 'R102');

-- Sample Grades
INSERT INTO grades (student_id, subject_id, teacher_id, exam_type, marks, max_marks, grade, exam_date) VALUES 
(1, 1, 1, 'midterm', 85, 100, 'A', '2024-01-15'),
(1, 2, 2, 'midterm', 78, 100, 'B+', '2024-01-16'),
(2, 1, 1, 'midterm', 92, 100, 'A+', '2024-01-15'),
(2, 2, 2, 'midterm', 88, 100, 'A', '2024-01-16');

-- Sample Attendance
INSERT INTO attendance (student_id, class_id, date, status, marked_by) VALUES 
(1, 1, '2024-02-10', 'present', 1),
(2, 1, '2024-02-10', 'present', 1),
(1, 1, '2024-02-11', 'present', 1),
(2, 1, '2024-02-11', 'absent', 1);
