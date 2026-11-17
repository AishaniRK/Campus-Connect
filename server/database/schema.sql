-- ====================================================================
-- Campus Connect - Database Schema (Simplified 2-Role Architecture)
-- Roles: 'student', 'admin'
-- Complaint Statuses: 'Pending', 'Assigned', 'In Progress', 'Resolved'
-- ====================================================================

CREATE DATABASE IF NOT EXISTS campus_connect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campus_connect;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS complaint_history;
DROP TABLE IF EXISTS complaint_reports;
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS issue_categories;
DROP TABLE IF EXISTS saved_opportunities;
DROP TABLE IF EXISTS opportunities;
DROP TABLE IF EXISTS opportunity_categories;
DROP TABLE IF EXISTS student_profiles;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table (Roles: student, admin)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
    phone VARCHAR(30) DEFAULT NULL,
    avatar VARCHAR(255) DEFAULT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Departments Table
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    contact_email VARCHAR(150) DEFAULT NULL,
    contact_phone VARCHAR(30) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Student Profiles Table
CREATE TABLE student_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    branch VARCHAR(20) NOT NULL,
    academic_year INT NOT NULL,
    semester INT DEFAULT 1,
    skills JSON NOT NULL,
    interests JSON NOT NULL,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_branch (branch),
    INDEX idx_student_year (academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Opportunity Categories Table
CREATE TABLE opportunity_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    icon VARCHAR(50) DEFAULT 'Briefcase',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Opportunities Table
CREATE TABLE opportunities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id INT NOT NULL,
    opportunity_type VARCHAR(50) NOT NULL,
    organization_name VARCHAR(150) NOT NULL,
    eligible_branches JSON NOT NULL,
    eligible_academic_years JSON NOT NULL,
    required_skills JSON NOT NULL,
    mode ENUM('Online', 'Offline', 'Hybrid') NOT NULL DEFAULT 'Online',
    location VARCHAR(150) DEFAULT 'Virtual / Remote',
    registration_link VARCHAR(500) NOT NULL,
    application_deadline DATE NOT NULL,
    eligibility_requirements TEXT NOT NULL,
    stipend_or_prize VARCHAR(100) DEFAULT 'Certificate & Perks',
    posted_by INT DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES opportunity_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_opp_category (category_id),
    INDEX idx_opp_deadline (application_deadline),
    INDEX idx_opp_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Saved Opportunities Table
CREATE TABLE saved_opportunities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    opportunity_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_student_saved (student_id, opportunity_id),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Issue Categories Table
CREATE TABLE issue_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(30) NOT NULL UNIQUE,
    keywords JSON NOT NULL,
    description TEXT,
    default_department_id INT DEFAULT NULL,
    default_priority ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (default_department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Complaints (Master Incidents) Table
-- Statuses: 'Pending', 'Assigned', 'In Progress', 'Resolved'
CREATE TABLE complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_number VARCHAR(30) NOT NULL UNIQUE,
    student_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    campus_location VARCHAR(100) NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    category_id INT DEFAULT NULL,
    department_id INT DEFAULT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
    status ENUM('Pending', 'Assigned', 'In Progress', 'Resolved') NOT NULL DEFAULT 'Pending',
    is_duplicate BOOLEAN DEFAULT FALSE,
    parent_complaint_id INT DEFAULT NULL,
    affected_student_count INT DEFAULT 1,
    image_url VARCHAR(255) DEFAULT NULL,
    resolution_notes TEXT DEFAULT NULL,
    resolved_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES issue_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_complaint_id) REFERENCES complaints(id) ON DELETE SET NULL,
    INDEX idx_complaint_status (status),
    INDEX idx_complaint_priority (priority),
    INDEX idx_complaint_department (department_id),
    INDEX idx_complaint_location (campus_location, room_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Complaint Reports (Duplicate Submissions linked to Master Incident)
CREATE TABLE complaint_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    student_id INT NOT NULL,
    reported_title VARCHAR(255) NOT NULL,
    reported_description TEXT NOT NULL,
    image_url VARCHAR(255) DEFAULT NULL,
    similarity_score DECIMAL(5, 2) DEFAULT 0.00,
    status ENUM('Pending Review', 'Confirmed Duplicate', 'Unlinked') DEFAULT 'Confirmed Duplicate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Complaint History Table (Audit Log)
CREATE TABLE complaint_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    changed_by INT NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Notifications Table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('opportunity', 'complaint', 'system') DEFAULT 'system',
    link VARCHAR(255) DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
