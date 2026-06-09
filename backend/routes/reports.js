const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorize } = require("../middleware/auth");

// Helper: Build CSV string from array of objects
function toCSV(data) {
  if (!data || data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((h) => `"${(row[h] !== null && row[h] !== undefined ? row[h] : "").toString().replace(/"/g, '""')}"`)
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

// ─────────────────────────────────────────────
// GET /api/reports/employees — Employee Report
// ─────────────────────────────────────────────
router.get("/employees", verifyToken, authorize(["admin", "hr"]), async (req, res) => {
  try {
    const { department_id, search } = req.query;

    let conditions = [];
    let params = [];
    let idx = 1;

    if (department_id) { conditions.push(`ep.department_id = $${idx++}`); params.push(department_id); }
    if (search)        { conditions.push(`(u.name ILIKE $${idx} OR u.email ILIKE $${idx})`); params.push(`%${search}%`); idx++; }

    const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

    const result = await pool.query(
      `SELECT
         ep.id         AS employee_id,
         u.name        AS full_name,
         u.email,
         u.role,
         ep.phone,
         ep.designation,
         ep.salary,
         d.department_name,
         ep.address,
         ep.created_at AS joined_at
       FROM employee_profiles ep
       INNER JOIN users u        ON ep.user_id      = u.id
       LEFT JOIN  departments d  ON ep.department_id = d.id
       ${where}
       ORDER BY u.name ASC`,
      params
    );

    res.json({ report: result.rows, total: result.rows.length });
  } catch (error) {
    console.error("Employee report error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/reports/leaves — Leave Report
// ─────────────────────────────────────────────
router.get("/leaves", verifyToken, authorize(["admin", "hr", "manager"]), async (req, res) => {
  try {
    const { status, from_date, to_date } = req.query;

    let conditions = [];
    let params = [];
    let idx = 1;

    if (status)    { conditions.push(`la.status = $${idx++}`);                     params.push(status); }
    if (from_date) { conditions.push(`la.from_date >= $${idx++}`);                 params.push(from_date); }
    if (to_date)   { conditions.push(`la.to_date <= $${idx++}`);                   params.push(to_date); }

    const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

    const result = await pool.query(
      `SELECT
         la.id,
         u.name         AS employee_name,
         ep.designation,
         d.department_name,
         lt.leave_name,
         la.from_date,
         la.to_date,
         la.total_days,
         la.reason,
         la.status,
         la.created_at  AS applied_at
       FROM leave_applications la
       INNER JOIN employee_profiles ep ON la.employee_id  = ep.id
       INNER JOIN users u              ON ep.user_id      = u.id
       INNER JOIN leave_types lt       ON la.leave_type_id = lt.id
       LEFT JOIN  departments d        ON ep.department_id = d.id
       ${where}
       ORDER BY la.created_at DESC`,
      params
    );

    res.json({ report: result.rows, total: result.rows.length });
  } catch (error) {
    console.error("Leave report error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/reports/assets — Asset Report
// ─────────────────────────────────────────────
router.get("/assets", verifyToken, authorize(["admin", "hr"]), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         a.id          AS asset_id,
         a.name        AS asset_name,
         a.type,
         a.serial_number,
         a.status      AS asset_status,
         u.name        AS assigned_to,
         d.department_name,
         aa.assigned_date,
         aa.return_date,
         aa.status     AS assignment_status
       FROM assets a
       LEFT JOIN asset_assignments aa ON aa.asset_id = a.id AND aa.status = 'Active'
       LEFT JOIN employee_profiles ep ON aa.employee_id = ep.id
       LEFT JOIN users u              ON ep.user_id = u.id
       LEFT JOIN departments d        ON ep.department_id = d.id
       ORDER BY a.type, a.name`
    );

    res.json({ report: result.rows, total: result.rows.length });
  } catch (error) {
    console.error("Asset report error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/reports/export/csv?type=employees|leaves|assets
// Export any report as CSV download
// ─────────────────────────────────────────────
router.get("/export/csv", verifyToken, authorize(["admin", "hr"]), async (req, res) => {
  try {
    const { type = "employees" } = req.query;
    let data = [];
    let filename = "report";

    if (type === "employees") {
      const result = await pool.query(
        `SELECT u.name, u.email, u.role, ep.phone, ep.designation, ep.salary, d.department_name, ep.address, ep.created_at
         FROM employee_profiles ep
         INNER JOIN users u       ON ep.user_id      = u.id
         LEFT JOIN  departments d ON ep.department_id = d.id
         ORDER BY u.name`
      );
      data = result.rows;
      filename = "employees_report";
    } else if (type === "leaves") {
      const result = await pool.query(
        `SELECT u.name AS employee_name, lt.leave_name, la.from_date, la.to_date,
                la.total_days, la.status, la.reason, la.created_at
         FROM leave_applications la
         INNER JOIN employee_profiles ep ON la.employee_id   = ep.id
         INNER JOIN users u              ON ep.user_id       = u.id
         INNER JOIN leave_types lt       ON la.leave_type_id = lt.id
         ORDER BY la.created_at DESC`
      );
      data = result.rows;
      filename = "leaves_report";
    } else if (type === "assets") {
      const result = await pool.query(
        `SELECT a.name, a.type, a.serial_number, a.status,
                u.name AS assigned_to, aa.assigned_date, aa.return_date
         FROM assets a
         LEFT JOIN asset_assignments aa ON aa.asset_id = a.id AND aa.status = 'Active'
         LEFT JOIN employee_profiles ep ON aa.employee_id = ep.id
         LEFT JOIN users u              ON ep.user_id = u.id
         ORDER BY a.type`
      );
      data = result.rows;
      filename = "assets_report";
    } else {
      return res.status(400).json({ message: "Invalid report type. Use: employees, leaves, assets" });
    }

    const csv = toCSV(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}_${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error("CSV export error:", error);
    res.status(500).json({ message: "Server error exporting CSV.", error: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/reports/summary — Dashboard summary stats
// ─────────────────────────────────────────────
router.get("/summary", verifyToken, async (req, res) => {
  try {
    const isEmployee = req.user.role === "employee";

    if (isEmployee) {
      // Fetch employee profile ID from user ID
      const empRes = await pool.query("SELECT id FROM employee_profiles WHERE user_id = $1", [req.user.id]);
      const employeeId = empRes.rows.length > 0 ? empRes.rows[0].id : null;

      let pendingLeaves = 0;
      let approvedLeaves = 0;
      let rejectedLeaves = 0;
      let assignedAssets = 0;

      if (employeeId) {
        const [leavesRes, assetsRes] = await Promise.all([
          pool.query(`
            SELECT
              COUNT(*) FILTER (WHERE status = 'Pending')  AS pending,
              COUNT(*) FILTER (WHERE status = 'Approved') AS approved,
              COUNT(*) FILTER (WHERE status = 'Rejected') AS rejected
            FROM leave_applications
            WHERE employee_id = $1
          `, [employeeId]),
          pool.query(`
            SELECT COUNT(*) AS count FROM asset_assignments
            WHERE employee_id = $1 AND status = 'Active'
          `, [employeeId])
        ]);

        pendingLeaves = parseInt(leavesRes.rows[0].pending || 0);
        approvedLeaves = parseInt(leavesRes.rows[0].approved || 0);
        rejectedLeaves = parseInt(leavesRes.rows[0].rejected || 0);
        assignedAssets = parseInt(assetsRes.rows[0].count || 0);
      }

      return res.json({
        summary: {
          totalEmployees: 0,
          totalDepartments: 0,
          pendingLeaves,
          approvedLeaves,
          rejectedLeaves,
          availableAssets: 0,
          assignedAssets,
          totalSalaryExpense: 0,
        },
        departmentWiseCount: [],
        leaveTypeUsage: [],
        topAbsentEmployees: [],
      });
    }

    // Admin, HR, Manager view
    const [employees, departments, leaves, assets, salary] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM employee_profiles"),
      pool.query("SELECT COUNT(*) FROM departments"),
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'Pending')  AS pending,
          COUNT(*) FILTER (WHERE status = 'Approved') AS approved,
          COUNT(*) FILTER (WHERE status = 'Rejected') AS rejected
        FROM leave_applications
      `),
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'Available') AS available,
          COUNT(*) FILTER (WHERE status = 'Assigned')  AS assigned
        FROM assets
      `),
      pool.query("SELECT COALESCE(SUM(salary), 0) AS total FROM employee_profiles"),
    ]);

    const deptWise = await pool.query(`
      SELECT d.department_name, COUNT(ep.id) AS total
      FROM departments d
      LEFT JOIN employee_profiles ep ON ep.department_id = d.id
      GROUP BY d.department_name
      ORDER BY total DESC
    `);

    const leaveTypeUsage = await pool.query(`
      SELECT lt.leave_name, COALESCE(SUM(la.total_days), 0) AS total_days, COUNT(la.id) AS applications
      FROM leave_types lt
      LEFT JOIN leave_applications la ON la.leave_type_id = lt.id AND la.status = 'Approved'
      GROUP BY lt.leave_name
    `);

    const topAbsent = await pool.query(`
      SELECT u.name, ep.designation, COALESCE(SUM(la.total_days), 0) AS total_absent_days
      FROM employee_profiles ep
      INNER JOIN users u ON ep.user_id = u.id
      LEFT JOIN leave_applications la ON la.employee_id = ep.id AND la.status = 'Approved'
      GROUP BY u.name, ep.designation
      ORDER BY total_absent_days DESC
      LIMIT 5
    `);

    res.json({
      summary: {
        totalEmployees:   parseInt(employees.rows[0].count),
        totalDepartments: parseInt(departments.rows[0].count),
        pendingLeaves:    parseInt(leaves.rows[0].pending  || 0),
        approvedLeaves:   parseInt(leaves.rows[0].approved || 0),
        rejectedLeaves:   parseInt(leaves.rows[0].rejected || 0),
        availableAssets:  parseInt(assets.rows[0].available || 0),
        assignedAssets:   parseInt(assets.rows[0].assigned  || 0),
        totalSalaryExpense: parseFloat(salary.rows[0].total || 0),
      },
      departmentWiseCount: deptWise.rows,
      leaveTypeUsage: leaveTypeUsage.rows,
      topAbsentEmployees: topAbsent.rows,
    });
  } catch (error) {
    console.error("Summary report error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
