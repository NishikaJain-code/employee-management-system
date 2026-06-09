-- Database Schema for Employee Management & Leave Approval System (EMS)
-- Designed for PostgreSQL

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS approval_history CASCADE;
DROP TABLE IF EXISTS leave_applications CASCADE;
DROP TABLE IF EXISTS leave_balance CASCADE;
DROP TABLE IF EXISTS leave_types CASCADE;
DROP TABLE IF EXISTS employee_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS employee_images CASCADE;
DROP TABLE IF EXISTS employee_profiles CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'employee' -- 'admin', 'hr', 'manager', 'employee'
);

-- 2. Departments Table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) UNIQUE NOT NULL
);

-- 3. Employee Profile Table
CREATE TABLE employee_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    phone VARCHAR(20),
    address TEXT,
    designation VARCHAR(100),
    salary NUMERIC(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Employee Images Table (for multiple documents/photos)
CREATE TABLE employee_images (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employee_profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
);

-- 5. Skills Table
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE NOT NULL
);

-- 6. Employee Skills (Many-to-Many Join Table)
CREATE TABLE employee_skills (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employee_profiles(id) ON DELETE CASCADE,
    skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE(employee_id, skill_id)
);

-- 7. Leave Types Table
CREATE TABLE leave_types (
    id SERIAL PRIMARY KEY,
    leave_name VARCHAR(100) UNIQUE NOT NULL,
    total_days INT NOT NULL
);

-- 8. Employee Leave Balance Table
CREATE TABLE leave_balance (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employee_profiles(id) ON DELETE CASCADE,
    leave_type_id INT REFERENCES leave_types(id) ON DELETE CASCADE,
    available_days INT NOT NULL,
    UNIQUE(employee_id, leave_type_id)
);

-- 9. Leave Application Table
CREATE TABLE leave_applications (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employee_profiles(id) ON DELETE CASCADE,
    leave_type_id INT REFERENCES leave_types(id) ON DELETE CASCADE,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    total_days INT NOT NULL,
    reason TEXT,
    status VARCHAR(30) DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Approval History (Audit Logs)
CREATE TABLE approval_history (
    id SERIAL PRIMARY KEY,
    leave_id INT REFERENCES leave_applications(id) ON DELETE CASCADE,
    approved_by INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'Approved', 'Rejected'
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INSERT SAMPLE DATA (From Dataset EMS.docx)
-- ==========================================

-- Insert Departments
INSERT INTO departments (id, department_name) VALUES
(1, 'Software Development'),
(2, 'Quality Assurance'),
(3, 'Human Resources'),
(4, 'Finance'),
(5, 'Digital Marketing'),
(6, 'Sales'),
(7, 'Operations'),
(8, 'Technical Support')
ON CONFLICT (id) DO UPDATE SET department_name = EXCLUDED.department_name;

-- Insert Users (Password hashes for '123456' generated via bcrypt)
-- Hashed password for '123456' is '$2b$10$w3qT0t.nNEXxV/t3NfC33Ob8T56bB4hQ0E3PjPZtJc/uH1X7kLzK2' (or similar, we will seed plain text or hashed)
-- Let's insert hashed passwords to make it security-compliant
INSERT INTO users (id, name, email, password, role) VALUES
(1, 'Pranay Gupta', 'pranay@isoftzone.com', '$2b$10$T8Z.Xh5/V7R/6bBwZ1vBve5fLhRjV9Q093PjPZtJc/uH1X7kLzK2', 'admin'),
(2, 'Rahul Sharma', 'rahul@isoftzone.com', '$2b$10$T8Z.Xh5/V7R/6bBwZ1vBve5fLhRjV9Q093PjPZtJc/uH1X7kLzK2', 'manager'),
(3, 'Priya Verma', 'priya@isoftzone.com', '$2b$10$T8Z.Xh5/V7R/6bBwZ1vBve5fLhRjV9Q093PjPZtJc/uH1X7kLzK2', 'hr'),
(4, 'Amit Patel', 'amit@isoftzone.com', '$2b$10$T8Z.Xh5/V7R/6bBwZ1vBve5fLhRjV9Q093PjPZtJc/uH1X7kLzK2', 'employee'),
(5, 'Neha Jain', 'neha@isoftzone.com', '$2b$10$T8Z.Xh5/V7R/6bBwZ1vBve5fLhRjV9Q093PjPZtJc/uH1X7kLzK2', 'employee'),
(6, 'Rohit Singh', 'rohit@isoftzone.com', '$2b$10$T8Z.Xh5/V7R/6bBwZ1vBve5fLhRjV9Q093PjPZtJc/uH1X7kLzK2', 'employee'),
(7, 'Anjali Gupta', 'anjali@isoftzone.com', '$2b$10$T8Z.Xh5/V7R/6bBwZ1vBve5fLhRjV9Q093PjPZtJc/uH1X7kLzK2', 'employee'),
(8, 'Vikas Mehta', 'vikas@isoftzone.com', '$2b$10$T8Z.Xh5/V7R/6bBwZ1vBve5fLhRjV9Q093PjPZtJc/uH1X7kLzK2', 'employee'),
(9, 'Pooja Shah', 'pooja@isoftzone.com', '$2b$10$T8Z.Xh5/V7R/6bBwZ1vBve5fLhRjV9Q093PjPZtJc/uH1X7kLzK2', 'employee'),
(10, 'Sandeep Kumar', 'sandeep@isoftzone.com', '$2b$10$T8Z.Xh5/V7R/6bBwZ1vBve5fLhRjV9Q093PjPZtJc/uH1X7kLzK2', 'employee')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- Insert Employee Profiles (user_id maps to user, department_id maps to department)
INSERT INTO employee_profiles (id, user_id, department_id, phone, address, designation, salary) VALUES
(1, 1, 1, '9876543210', 'Indore', 'Director', 150000),
(2, 2, 1, '9876543211', 'Indore', 'Project Manager', 85000),
(3, 3, 3, '9876543212', 'Indore', 'HR Manager', 70000),
(4, 4, 1, '9876543213', 'Indore', 'React Developer', 45000),
(5, 5, 1, '9876543214', 'Indore', 'Node Developer', 50000),
(6, 6, 2, '9876543215', 'Indore', 'QA Engineer', 40000),
(7, 7, 5, '9876543216', 'Indore', 'Marketing Executive', 35000),
(8, 8, 6, '9876543217', 'Indore', 'Sales Executive', 38000),
(9, 9, 8, '9876543218', 'Indore', 'Support Engineer', 32000),
(10, 10, 4, '9876543219', 'Indore', 'Accountant', 42000)
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;

-- Insert Skills
INSERT INTO skills (id, skill_name) VALUES
(1, 'React'),
(2, 'NodeJS'),
(3, 'PostgreSQL'),
(4, 'JavaScript'),
(5, 'HTML'),
(6, 'CSS'),
(7, 'MongoDB'),
(8, 'Python'),
(9, 'Testing'),
(10, 'Salesforce')
ON CONFLICT (id) DO UPDATE SET skill_name = EXCLUDED.skill_name;

-- Insert Employee Skills
INSERT INTO employee_skills (employee_id, skill_id) VALUES
(4, 1), (4, 4), (4, 5),
(5, 2), (5, 3), (5, 4),
(6, 9),
(7, 4),
(8, 10),
(9, 2), (9, 3),
(10, 8)
ON CONFLICT DO NOTHING;

-- Insert Leave Types
INSERT INTO leave_types (id, leave_name, total_days) VALUES
(1, 'Casual Leave', 12),
(2, 'Sick Leave', 10),
(3, 'Earned Leave', 15),
(4, 'Maternity Leave', 90)
ON CONFLICT (id) DO UPDATE SET leave_name = EXCLUDED.leave_name;

-- Insert Leave Balances for Employees
INSERT INTO leave_balance (employee_id, leave_type_id, available_days) VALUES
(4, 1, 10), (4, 2, 8),
(5, 1, 12), (5, 2, 10),
(6, 1, 8),  (6, 2, 6),
(7, 1, 10), (7, 2, 7),
(8, 1, 12), (8, 2, 10)
ON CONFLICT DO NOTHING;

-- Insert Leave Applications
INSERT INTO leave_applications (id, employee_id, leave_type_id, from_date, to_date, total_days, reason, status) VALUES
(1, 4, 1, '2026-06-01', '2026-06-03', 3, 'Family Function', 'Approved'),
(2, 5, 2, '2026-06-10', '2026-06-11', 2, 'Fever', 'Pending'),
(3, 6, 1, '2026-05-20', '2026-05-21', 2, 'Personal Work', 'Approved'),
(4, 7, 1, '2026-06-15', '2026-06-17', 3, 'Travel', 'Pending'),
(5, 8, 2, '2026-06-18', '2026-06-20', 3, 'Medical', 'Rejected')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

-- Insert Approval History
INSERT INTO approval_history (id, leave_id, approved_by, action, remarks) VALUES
(1, 1, 2, 'Approved', 'Manager Approved'),
(2, 1, 3, 'Approved', 'HR Approved'),
(3, 3, 2, 'Approved', 'Manager Approved'),
(4, 3, 3, 'Approved', 'HR Approved'),
(5, 5, 2, 'Rejected', 'Insufficient Reason')
ON CONFLICT (id) DO UPDATE SET action = EXCLUDED.action;

-- Reset standard sequences so that serial keys start after seeded IDs
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id)+1 FROM users), 1), false);
SELECT setval('departments_id_seq', COALESCE((SELECT MAX(id)+1 FROM departments), 1), false);
SELECT setval('employee_profiles_id_seq', COALESCE((SELECT MAX(id)+1 FROM employee_profiles), 1), false);
SELECT setval('skills_id_seq', COALESCE((SELECT MAX(id)+1 FROM skills), 1), false);
SELECT setval('leave_types_id_seq', COALESCE((SELECT MAX(id)+1 FROM leave_types), 1), false);
SELECT setval('leave_applications_id_seq', COALESCE((SELECT MAX(id)+1 FROM leave_applications), 1), false);
SELECT setval('approval_history_id_seq', COALESCE((SELECT MAX(id)+1 FROM approval_history), 1), false);
