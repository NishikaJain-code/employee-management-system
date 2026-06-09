const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorize } = require("../middleware/auth");

// ─────────────────────────────────────────────
// GET /api/audit — View paginated audit logs (Admin/HR only)
// ─────────────────────────────────────────────
router.get("/", verifyToken, authorize(["admin", "hr"]), async (req, res) => {
  try {
    const { page = 1, limit = 20, table_name, action } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let conditions = [];
    let params = [];
    let idx = 1;

    if (table_name) { conditions.push(`al.table_name = $${idx++}`); params.push(table_name); }
    if (action)     { conditions.push(`al.action = $${idx++}`);     params.push(action); }

    const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

    const result = await pool.query(
      `SELECT
         al.*,
         u.name AS performed_by_name,
         u.role AS performed_by_role
       FROM audit_logs al
       LEFT JOIN users u ON al.performed_by = u.id
       ${where}
       ORDER BY al.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM audit_logs al ${where}`,
      params
    );

    res.json({
      logs: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
