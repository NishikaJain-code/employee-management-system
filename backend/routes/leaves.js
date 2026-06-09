const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorize } = require("../middleware/auth");

// Helper to get employee profile ID from user ID
async function getProfileId(userId) {
  const result = await pool.query("SELECT id FROM employee_profiles WHERE user_id = $1", [userId]);
  if (result.rows.length === 0) {
    throw new Error("No employee profile found for this user.");
  }
  return result.rows[0].id;
}

// @route   POST /api/leaves/apply
// @desc    Apply for a leave
router.post("/apply", verifyToken, async (req, res) => {
  try {
    const { leave_type_id, from_date, to_date, total_days, reason } = req.body;
    
    if (!leave_type_id || !from_date || !to_date || !total_days) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    const employeeId = await getProfileId(req.user.id);

    // Verify leave balance exists and is sufficient
    const balanceResult = await pool.query(
      "SELECT available_days FROM leave_balance WHERE employee_id = $1 AND leave_type_id = $2",
      [employeeId, leave_type_id]
    );

    if (balanceResult.rows.length === 0) {
      return res.status(400).json({ message: "No leave balance initialized for this leave type." });
    }

    const availableDays = balanceResult.rows[0].available_days;
    if (availableDays < total_days) {
      return res.status(400).json({ 
        message: `Insufficient leave balance. Requested: ${total_days} days, Available: ${availableDays} days.` 
      });
    }

    // Insert leave application
    const result = await pool.query(
      `INSERT INTO leave_applications (employee_id, leave_type_id, from_date, to_date, total_days, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
       RETURNING *`,
      [employeeId, leave_type_id, from_date, to_date, total_days, reason]
    );

    res.status(201).json({ message: "Leave application submitted successfully!", application: result.rows[0] });
  } catch (error) {
    console.error("Apply leave error:", error);
    res.status(500).json({ message: "Server error applying for leave.", error: error.message });
  }
});

// @route   GET /api/leaves/history
// @desc    Get leave applications history for the logged-in employee
router.get("/history", verifyToken, async (req, res) => {
  try {
    const employeeId = await getProfileId(req.user.id);
    const result = await pool.query(
      `SELECT la.*, lt.leave_name 
       FROM leave_applications la
       INNER JOIN leave_types lt ON la.leave_type_id = lt.id
       WHERE la.employee_id = $1
       ORDER BY la.created_at DESC`,
      [employeeId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Get leave history error:", error);
    res.status(500).json({ message: "Server error fetching leave history.", error: error.message });
  }
});

// @route   GET /api/leaves/balance
// @desc    Get leave balances for the logged-in employee
router.get("/balance", verifyToken, async (req, res) => {
  try {
    const employeeId = await getProfileId(req.user.id);
    const result = await pool.query(
      `SELECT lb.*, lt.leave_name, lt.total_days AS max_days
       FROM leave_balance lb
       INNER JOIN leave_types lt ON lb.leave_type_id = lt.id
       WHERE lb.employee_id = $1`,
      [employeeId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Get leave balance error:", error);
    res.status(500).json({ message: "Server error fetching leave balance.", error: error.message });
  }
});

// @route   GET /api/leaves/pending
// @desc    Get all pending leaves (for Managers/HR/Admin review)
router.get("/pending", verifyToken, authorize(["admin", "hr", "manager"]), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT la.*, lt.leave_name, u.name AS employee_name, ep.designation
       FROM leave_applications la
       INNER JOIN leave_types lt ON la.leave_type_id = lt.id
       INNER JOIN employee_profiles ep ON la.employee_id = ep.id
       INNER JOIN users u ON ep.user_id = u.id
       WHERE la.status = 'Pending'
       ORDER BY la.created_at ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch pending leaves error:", error);
    res.status(500).json({ message: "Server error fetching pending leaves." });
  }
});

// @route   GET /api/leaves/all
// @desc    Get all leaves (for reports / history)
router.get("/all", verifyToken, authorize(["admin", "hr", "manager"]), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT la.*, lt.leave_name, u.name AS employee_name, ep.designation
       FROM leave_applications la
       INNER JOIN leave_types lt ON la.leave_type_id = lt.id
       INNER JOIN employee_profiles ep ON la.employee_id = ep.id
       INNER JOIN users u ON ep.user_id = u.id
       ORDER BY la.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch all leaves error:", error);
    res.status(500).json({ message: "Server error fetching all leaves." });
  }
});

// @route   POST /api/leaves/approve/:id
// @desc    Approve leave (Transaction Management: updates status, deducts balance, inserts log)
router.post("/approve/:id", verifyToken, authorize(["admin", "hr", "manager"]), async (req, res) => {
  const client = await pool.connect();
  try {
    const leaveId = req.params.id;
    const { remarks } = req.body;

    // Start Transaction
    await client.query("BEGIN");

    // Fetch leave application details
    const leaveResult = await client.query(
      "SELECT * FROM leave_applications WHERE id = $1 FOR UPDATE",
      [leaveId]
    );

    if (leaveResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Leave application not found." });
    }

    const leave = leaveResult.rows[0];

    if (leave.status !== "Pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: `Leave has already been ${leave.status.toLowerCase()}.` });
    }

    // Check balance again in transaction
    const balanceResult = await client.query(
      "SELECT available_days FROM leave_balance WHERE employee_id = $1 AND leave_type_id = $2 FOR UPDATE",
      [leave.employee_id, leave.leave_type_id]
    );

    if (balanceResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Employee has no leave balance initialized." });
    }

    const availableDays = balanceResult.rows[0].available_days;
    if (availableDays < leave.total_days) {
      await client.query("ROLLBACK");
      return res.status(400).json({ 
        message: `Cannot approve. Employee has insufficient balance (${availableDays} days remaining, requested ${leave.total_days}).` 
      });
    }

    // 1. Update Leave Status
    await client.query(
      "UPDATE leave_applications SET status = 'Approved' WHERE id = $1",
      [leaveId]
    );

    // 2. Update Leave Balance
    await client.query(
      "UPDATE leave_balance SET available_days = available_days - $1 WHERE employee_id = $2 AND leave_type_id = $3",
      [leave.total_days, leave.employee_id, leave.leave_type_id]
    );

    // 3. Insert Approval History (Audit Trail)
    await client.query(
      `INSERT INTO approval_history (leave_id, approved_by, action, remarks)
       VALUES ($1, $2, 'Approved', $3)`,
      [leaveId, req.user.id, remarks || "Approved by manager"]
    );

    // Commit Transaction
    await client.query("COMMIT");
    res.json({ message: "Leave approved successfully and balance updated!" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Approve leave error:", error);
    res.status(500).json({ message: "Server error approving leave.", error: error.message });
  } finally {
    client.release();
  }
});

// @route   POST /api/leaves/reject/:id
// @desc    Reject leave (Updates status, inserts log - no balance deduction)
router.post("/reject/:id", verifyToken, authorize(["admin", "hr", "manager"]), async (req, res) => {
  const client = await pool.connect();
  try {
    const leaveId = req.params.id;
    const { remarks } = req.body;

    // Start Transaction
    await client.query("BEGIN");

    // Fetch leave application details
    const leaveResult = await client.query(
      "SELECT * FROM leave_applications WHERE id = $1 FOR UPDATE",
      [leaveId]
    );

    if (leaveResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Leave application not found." });
    }

    const leave = leaveResult.rows[0];

    if (leave.status !== "Pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: `Leave has already been ${leave.status.toLowerCase()}.` });
    }

    // 1. Update Leave Status to 'Rejected'
    await client.query(
      "UPDATE leave_applications SET status = 'Rejected' WHERE id = $1",
      [leaveId]
    );

    // 2. Insert Approval History (Audit Trail)
    await client.query(
      `INSERT INTO approval_history (leave_id, approved_by, action, remarks)
       VALUES ($1, $2, 'Rejected', $3)`,
      [leaveId, req.user.id, remarks || "Rejected by manager"]
    );

    // Commit Transaction
    await client.query("COMMIT");
    res.json({ message: "Leave rejected successfully." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Reject leave error:", error);
    res.status(500).json({ message: "Server error rejecting leave.", error: error.message });
  } finally {
    client.release();
  }
});

// @route   GET /api/leaves/types
// @desc    Get list of all leave types
router.get("/types", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM leave_types ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch leave types error:", error);
    res.status(500).json({ message: "Server error fetching leave types." });
  }
});

// @route   GET /api/leaves/reports
// @desc    Get comprehensive dashboard reports & analytics
router.get("/reports", verifyToken, authorize(["admin", "hr", "manager"]), async (req, res) => {
  try {
    // 1. Overall stats
    const empCount = await pool.query("SELECT COUNT(*) FROM employee_profiles");
    const deptCount = await pool.query("SELECT COUNT(*) FROM departments");
    const skillCount = await pool.query("SELECT COUNT(*) FROM skills");
    const imageCount = await pool.query("SELECT COUNT(*) FROM employee_images");
    
    const leaveStats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'Pending') AS pending_leaves,
        COUNT(*) FILTER (WHERE status = 'Approved') AS approved_leaves,
        COUNT(*) FILTER (WHERE status = 'Rejected') AS rejected_leaves
      FROM leave_applications
    `);

    const salaryStats = await pool.query("SELECT SUM(salary) AS total_salary FROM employee_profiles");

    // 2. Department-wise count
    const deptWiseCount = await pool.query(`
      SELECT d.department_name, COUNT(ep.id) AS total_employees
      FROM departments d
      LEFT JOIN employee_profiles ep ON ep.department_id = d.id
      GROUP BY d.department_name
      ORDER BY total_employees DESC
    `);

    // 3. Employee-wise approved leaves count (Most Absent Employee)
    const employeeAbsence = await pool.query(`
      SELECT u.name, ep.designation, COALESCE(SUM(la.total_days), 0) AS total_absent_days
      FROM employee_profiles ep
      INNER JOIN users u ON ep.user_id = u.id
      LEFT JOIN leave_applications la ON la.employee_id = ep.id AND la.status = 'Approved'
      GROUP BY u.name, ep.designation
      ORDER BY total_absent_days DESC
      LIMIT 5
    `);

    // 4. Leave Type Balance usage
    const leaveTypeStats = await pool.query(`
      SELECT lt.leave_name, COUNT(la.id) AS total_applications, COALESCE(SUM(la.total_days), 0) AS total_days_taken
      FROM leave_types lt
      LEFT JOIN leave_applications la ON la.leave_type_id = lt.id AND la.status = 'Approved'
      GROUP BY lt.leave_name
    `);

    res.json({
      summary: {
        totalEmployees: parseInt(empCount.rows[0].count),
        totalDepartments: parseInt(deptCount.rows[0].count),
        totalSkills: parseInt(skillCount.rows[0].count),
        totalImages: parseInt(imageCount.rows[0].count),
        pendingLeaves: parseInt(leaveStats.rows[0].pending_leaves || 0),
        approvedLeaves: parseInt(leaveStats.rows[0].approved_leaves || 0),
        rejectedLeaves: parseInt(leaveStats.rows[0].rejected_leaves || 0),
        totalSalaryExpense: parseFloat(salaryStats.rows[0].total_salary || 0)
      },
      departmentWiseCount: deptWiseCount.rows,
      employeeAbsence: employeeAbsence.rows,
      leaveTypeUsage: leaveTypeStats.rows
    });
  } catch (error) {
    console.error("Generate reports error:", error);
    res.status(500).json({ message: "Server error generating analytics report.", error: error.message });
  }
});

module.exports = router;
