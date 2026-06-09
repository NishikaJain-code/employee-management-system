-- ============================================================
-- PHASE 5 SCHEMA — Run this in PostgreSQL
-- Employee Management System — Enterprise Features
-- ============================================================

-- 1. ASSETS TABLE
CREATE TABLE IF NOT EXISTS assets (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(200) NOT NULL,
  type            VARCHAR(100) NOT NULL CHECK (type IN ('Laptop', 'Monitor', 'ID Card', 'Mouse', 'Keyboard', 'Phone', 'Other')),
  serial_number   VARCHAR(150),
  status          VARCHAR(50) DEFAULT 'Available' CHECK (status IN ('Available', 'Assigned', 'Under Maintenance', 'Retired')),
  description     TEXT,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- 2. ASSET ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS asset_assignments (
  id              SERIAL PRIMARY KEY,
  asset_id        INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  employee_id     INTEGER NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  assigned_date   TIMESTAMP DEFAULT NOW(),
  return_date     TIMESTAMP,
  status          VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Returned')),
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- 3. NOTIFICATIONS TABLE (uses JSONB for flexible metadata)
CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message     TEXT NOT NULL,
  type        VARCHAR(100) NOT NULL DEFAULT 'general',
  is_read     BOOLEAN DEFAULT FALSE,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMP DEFAULT NOW()
);

-- 4. AUDIT LOGS TABLE (tracks every data change with JSONB)
CREATE TABLE IF NOT EXISTS audit_logs (
  id             SERIAL PRIMARY KEY,
  table_name     VARCHAR(100) NOT NULL,
  record_id      INTEGER,
  action         VARCHAR(50) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values     JSONB DEFAULT NULL,
  new_values     JSONB DEFAULT NULL,
  performed_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMP DEFAULT NOW()
);

-- 5. DATABASE VIEW — Employee Summary
CREATE OR REPLACE VIEW v_employee_summary AS
  SELECT
    ep.id                   AS employee_id,
    u.name                  AS full_name,
    u.email,
    u.role,
    ep.designation,
    ep.phone,
    ep.salary,
    d.department_name,
    COALESCE(
      (SELECT SUM(la.total_days)
       FROM leave_applications la
       WHERE la.employee_id = ep.id AND la.status = 'Approved'), 0
    ) AS total_leaves_taken,
    (
      SELECT COUNT(*)
      FROM asset_assignments aa
      WHERE aa.employee_id = ep.id AND aa.status = 'Active'
    ) AS active_assets,
    ep.created_at           AS joined_at
  FROM employee_profiles ep
  INNER JOIN users u         ON ep.user_id = u.id
  LEFT JOIN  departments d   ON ep.department_id = d.id;

-- 6. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id   ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read   ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name   ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_emp   ON asset_assignments(employee_id);

-- ============================================================
-- HOW TO RUN:
--   psql -U <username> -d <database_name> -f phase5_schema.sql
-- ============================================================
