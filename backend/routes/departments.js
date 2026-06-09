const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorize } = require("../middleware/auth");

// @route   GET /api/departments
// @desc    Get all departments
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM departments ORDER BY department_name ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch departments error:", error);
    res.status(500).json({ message: "Server error fetching departments." });
  }
});

// @route   POST /api/departments
// @desc    Create a new department (Admin/HR only)
router.post("/", verifyToken, authorize(["admin", "hr"]), async (req, res) => {
  try {
    const { department_name } = req.body;
    if (!department_name || department_name.trim() === "") {
      return res.status(400).json({ message: "Department name is required." });
    }

    const checkExist = await pool.query("SELECT * FROM departments WHERE department_name = $1", [department_name.trim()]);
    if (checkExist.rows.length > 0) {
      return res.status(400).json({ message: "Department already exists." });
    }

    const result = await pool.query(
      "INSERT INTO departments (department_name) VALUES ($1) RETURNING *",
      [department_name.trim()]
    );
    res.status(201).json({ message: "Department created successfully!", department: result.rows[0] });
  } catch (error) {
    console.error("Create department error:", error);
    res.status(500).json({ message: "Server error creating department." });
  }
});

module.exports = router;
