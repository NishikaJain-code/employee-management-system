/**
 * seed.js — Run this once to populate your PostgreSQL database with sample data.
 * Usage:  node seed.js   (from the backend/ folder)
 *
 * It will:
 *  1. Drop & recreate all tables (clean start)
 *  2. Insert sample departments, skills, leave types
 *  3. Hash the password "123456" with bcrypt and insert 10 test users
 *  4. Create employee profiles, skills, leave balances, applications & history
 */

require("dotenv").config();
const pool = require("./config/db");
const bcrypt = require("bcrypt");

async function seed() {
  const client = await pool.connect();

  try {
    console.log("🌱  Starting EMS database seed...\n");

    // ─── DROP TABLES ──────────────────────────────────────────────────────────
    console.log("🗑   Dropping existing tables...");
    await client.query(`
      DROP TABLE IF EXISTS approval_history  CASCADE;
      DROP TABLE IF EXISTS leave_applications CASCADE;
      DROP TABLE IF EXISTS leave_balance      CASCADE;
      DROP TABLE IF EXISTS leave_types        CASCADE;
      DROP TABLE IF EXISTS employee_skills    CASCADE;
      DROP TABLE IF EXISTS skills             CASCADE;
      DROP TABLE IF EXISTS employee_images    CASCADE;
      DROP TABLE IF EXISTS employee_profiles  CASCADE;
      DROP TABLE IF EXISTS departments        CASCADE;
      DROP TABLE IF EXISTS users              CASCADE;
    `);

    // ─── CREATE TABLES ────────────────────────────────────────────────────────
    console.log("🏗   Creating tables...");
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'employee'
      );

      CREATE TABLE departments (
        id SERIAL PRIMARY KEY,
        department_name VARCHAR(100) UNIQUE NOT NULL
      );

      CREATE TABLE employee_profiles (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        department_id INT REFERENCES departments(id) ON DELETE SET NULL,
        phone VARCHAR(20),
        address TEXT,
        designation VARCHAR(100),
        salary NUMERIC(10,2),
        joining_date DATE,
        profile_pic TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE employee_images (
        id SERIAL PRIMARY KEY,
        employee_id INT REFERENCES employee_profiles(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL
      );

      CREATE TABLE skills (
        id SERIAL PRIMARY KEY,
        skill_name VARCHAR(100) UNIQUE NOT NULL
      );

      CREATE TABLE employee_skills (
        id SERIAL PRIMARY KEY,
        employee_id INT REFERENCES employee_profiles(id) ON DELETE CASCADE,
        skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
        UNIQUE(employee_id, skill_id)
      );

      CREATE TABLE leave_types (
        id SERIAL PRIMARY KEY,
        leave_name VARCHAR(100) UNIQUE NOT NULL,
        total_days INT NOT NULL
      );

      CREATE TABLE leave_balance (
        id SERIAL PRIMARY KEY,
        employee_id INT REFERENCES employee_profiles(id) ON DELETE CASCADE,
        leave_type_id INT REFERENCES leave_types(id) ON DELETE CASCADE,
        available_days INT NOT NULL,
        UNIQUE(employee_id, leave_type_id)
      );

      CREATE TABLE leave_applications (
        id SERIAL PRIMARY KEY,
        employee_id INT REFERENCES employee_profiles(id) ON DELETE CASCADE,
        leave_type_id INT REFERENCES leave_types(id) ON DELETE CASCADE,
        from_date DATE NOT NULL,
        to_date DATE NOT NULL,
        total_days INT NOT NULL,
        reason TEXT,
        status VARCHAR(30) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE approval_history (
        id SERIAL PRIMARY KEY,
        leave_id INT REFERENCES leave_applications(id) ON DELETE CASCADE,
        approved_by INT REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(50) NOT NULL,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ─── DEPARTMENTS ─────────────────────────────────────────────────────────
    console.log("🏢  Seeding departments...");
    await client.query(`
      INSERT INTO departments (department_name) VALUES
        ('Software Development'), ('Quality Assurance'), ('Human Resources'),
        ('Finance'), ('Digital Marketing'), ('Sales'),
        ('Operations'), ('Technical Support');
    `);

    // ─── HASH PASSWORD ───────────────────────────────────────────────────────
    console.log("🔐  Hashing password '123456'...");
    const hash = await bcrypt.hash("123456", 10);
    console.log("    Hash generated:", hash);

    // ─── USERS ───────────────────────────────────────────────────────────────
    console.log("👤  Seeding users...");
    const usersData = [
      { name: "Pranay Gupta",   email: "pranay@isoftzone.com", role: "admin" },
      { name: "Rahul Sharma",   email: "rahul@isoftzone.com",  role: "manager" },
      { name: "Priya Verma",    email: "priya@isoftzone.com",  role: "hr" },
      { name: "Amit Patel",     email: "amit@isoftzone.com",   role: "employee" },
      { name: "Neha Jain",      email: "neha@isoftzone.com",   role: "employee" },
      { name: "Rohit Singh",    email: "rohit@isoftzone.com",  role: "employee" },
      { name: "Anjali Gupta",   email: "anjali@isoftzone.com", role: "employee" },
      { name: "Vikas Mehta",    email: "vikas@isoftzone.com",  role: "employee" },
      { name: "Pooja Shah",     email: "pooja@isoftzone.com",  role: "employee" },
      { name: "Sandeep Kumar",  email: "sandeep@isoftzone.com",role: "employee" }
    ];
    const userIds = [];
    for (const u of usersData) {
      const res = await client.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id",
        [u.name, u.email, hash, u.role]
      );
      userIds.push(res.rows[0].id);
    }

    // ─── EMPLOYEE PROFILES ───────────────────────────────────────────────────
    console.log("📋  Seeding employee profiles...");
    const profileData = [
      { idx: 0, dept: 1, phone: "9876543210", address: "Indore", designation: "Director",          salary: 150000, joining_date: "2023-01-15" },
      { idx: 1, dept: 1, phone: "9876543211", address: "Indore", designation: "Project Manager",   salary: 85000, joining_date: "2023-03-10" },
      { idx: 2, dept: 3, phone: "9876543212", address: "Indore", designation: "HR Manager",        salary: 70000, joining_date: "2024-05-22" },
      { idx: 3, dept: 1, phone: "9876543213", address: "Indore", designation: "React Developer",   salary: 45000, joining_date: "2024-08-11" },
      { idx: 4, dept: 1, phone: "9876543214", address: "Indore", designation: "Node Developer",    salary: 50000, joining_date: "2025-02-01" },
      { idx: 5, dept: 2, phone: "9876543215", address: "Indore", designation: "QA Engineer",       salary: 40000, joining_date: "2025-06-18" },
      { idx: 6, dept: 5, phone: "9876543216", address: "Indore", designation: "Marketing Executive",salary: 35000, joining_date: "2025-09-09" },
      { idx: 7, dept: 6, phone: "9876543217", address: "Indore", designation: "Sales Executive",   salary: 38000, joining_date: "2025-11-20" },
      { idx: 8, dept: 8, phone: "9876543218", address: "Indore", designation: "Support Engineer",  salary: 32000, joining_date: "2026-02-14" },
      { idx: 9, dept: 4, phone: "9876543219", address: "Indore", designation: "Accountant",        salary: 42000, joining_date: "2026-04-25" }
    ];

    // Get actual dept IDs from inserted rows
    const deptRes = await client.query("SELECT id FROM departments ORDER BY id ASC");
    const deptIds = deptRes.rows.map(r => r.id);

    const profileIds = [];
    for (const p of profileData) {
      const res = await client.query(
        "INSERT INTO employee_profiles (user_id, department_id, phone, address, designation, salary, joining_date) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id",
        [userIds[p.idx], deptIds[p.dept - 1], p.phone, p.address, p.designation, p.salary, p.joining_date]
      );
      profileIds.push(res.rows[0].id);
    }

    // ─── SKILLS ──────────────────────────────────────────────────────────────
    console.log("🛠   Seeding skills...");
    const skillNames = ["React", "NodeJS", "PostgreSQL", "JavaScript", "HTML", "CSS", "MongoDB", "Python", "Testing", "Salesforce"];
    const skillIds = [];
    for (const s of skillNames) {
      const res = await client.query("INSERT INTO skills (skill_name) VALUES ($1) RETURNING id", [s]);
      skillIds.push(res.rows[0].id);
    }

    // ─── EMPLOYEE SKILLS ─────────────────────────────────────────────────────
    console.log("🔗  Linking employee skills...");
    const empSkillLinks = [
      [profileIds[3], skillIds[0]], [profileIds[3], skillIds[3]], [profileIds[3], skillIds[4]],
      [profileIds[4], skillIds[1]], [profileIds[4], skillIds[2]], [profileIds[4], skillIds[3]],
      [profileIds[5], skillIds[8]],
      [profileIds[6], skillIds[3]],
      [profileIds[7], skillIds[9]],
      [profileIds[8], skillIds[1]], [profileIds[8], skillIds[2]],
      [profileIds[9], skillIds[7]]
    ];
    for (const [empId, skillId] of empSkillLinks) {
      await client.query(
        "INSERT INTO employee_skills (employee_id, skill_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
        [empId, skillId]
      );
    }

    // ─── LEAVE TYPES ─────────────────────────────────────────────────────────
    console.log("📅  Seeding leave types...");
    const leaveTypes = [
      { name: "Casual Leave", days: 12 },
      { name: "Sick Leave",   days: 10 },
      { name: "Earned Leave", days: 15 },
      { name: "Maternity Leave", days: 90 }
    ];
    const ltIds = [];
    for (const lt of leaveTypes) {
      const res = await client.query(
        "INSERT INTO leave_types (leave_name, total_days) VALUES ($1,$2) RETURNING id",
        [lt.name, lt.days]
      );
      ltIds.push(res.rows[0].id);
    }

    // ─── LEAVE BALANCES ──────────────────────────────────────────────────────
    console.log("⚖️   Seeding leave balances...");
    const balances = [
      [profileIds[3], ltIds[0], 10], [profileIds[3], ltIds[1], 8],
      [profileIds[4], ltIds[0], 12], [profileIds[4], ltIds[1], 10],
      [profileIds[5], ltIds[0], 8],  [profileIds[5], ltIds[1], 6],
      [profileIds[6], ltIds[0], 10], [profileIds[6], ltIds[1], 7],
      [profileIds[7], ltIds[0], 12], [profileIds[7], ltIds[1], 10]
    ];
    for (const [empId, ltId, days] of balances) {
      await client.query(
        "INSERT INTO leave_balance (employee_id, leave_type_id, available_days) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING",
        [empId, ltId, days]
      );
    }

    // ─── LEAVE APPLICATIONS ──────────────────────────────────────────────────
    console.log("📝  Seeding leave applications...");
    const apps = [
      [profileIds[3], ltIds[0], "2026-06-01", "2026-06-03", 3, "Family Function", "Approved"],
      [profileIds[4], ltIds[1], "2026-06-10", "2026-06-11", 2, "Fever",           "Pending"],
      [profileIds[5], ltIds[0], "2026-05-20", "2026-05-21", 2, "Personal Work",   "Approved"],
      [profileIds[6], ltIds[0], "2026-06-15", "2026-06-17", 3, "Travel",          "Pending"],
      [profileIds[7], ltIds[1], "2026-06-18", "2026-06-20", 3, "Medical",         "Rejected"]
    ];
    const appIds = [];
    for (const [empId, ltId, from, to, days, reason, status] of apps) {
      const res = await client.query(
        "INSERT INTO leave_applications (employee_id, leave_type_id, from_date, to_date, total_days, reason, status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id",
        [empId, ltId, from, to, days, reason, status]
      );
      appIds.push(res.rows[0].id);
    }

    // ─── APPROVAL HISTORY ────────────────────────────────────────────────────
    console.log("✅  Seeding approval history...");
    const history = [
      [appIds[0], userIds[1], "Approved", "Manager Approved"],
      [appIds[0], userIds[2], "Approved", "HR Approved"],
      [appIds[2], userIds[1], "Approved", "Manager Approved"],
      [appIds[2], userIds[2], "Approved", "HR Approved"],
      [appIds[4], userIds[1], "Rejected", "Insufficient Reason"]
    ];
    for (const [leaveId, approver, action, remarks] of history) {
      await client.query(
        "INSERT INTO approval_history (leave_id, approved_by, action, remarks) VALUES ($1,$2,$3,$4)",
        [leaveId, approver, action, remarks]
      );
    }

    console.log("\n✨  Seed completed successfully!");
    console.log("─────────────────────────────────────────");
    console.log("  Test accounts (all use password: 123456)");
    console.log("  Admin   → pranay@isoftzone.com");
    console.log("  Manager → rahul@isoftzone.com");
    console.log("  HR      → priya@isoftzone.com");
    console.log("  Employee→ amit@isoftzone.com");
    console.log("─────────────────────────────────────────\n");

  } catch (err) {
    console.error("❌  Seed failed:", err.message);
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
