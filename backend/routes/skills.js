const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorize } = require("../middleware/auth");

// @route   GET /api/skills
// @desc    Get all skills
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM skills ORDER BY skill_name ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch skills error:", error);
    res.status(500).json({ message: "Server error fetching skills." });
  }
});

// @route   POST /api/skills
// @desc    Create a new skill (Admin/HR only)
router.post("/", verifyToken, authorize(["admin", "hr"]), async (req, res) => {
  try {
    const { skill_name } = req.body;
    if (!skill_name || skill_name.trim() === "") {
      return res.status(400).json({ message: "Skill name is required." });
    }

    const checkExist = await pool.query("SELECT * FROM skills WHERE skill_name = $1", [skill_name.trim()]);
    if (checkExist.rows.length > 0) {
      return res.status(400).json({ message: "Skill already exists." });
    }

    const result = await pool.query(
      "INSERT INTO skills (skill_name) VALUES ($1) RETURNING *",
      [skill_name.trim()]
    );
    res.status(201).json({ message: "Skill created successfully!", skill: result.rows[0] });
  } catch (error) {
    console.error("Create skill error:", error);
    res.status(500).json({ message: "Server error creating skill." });
  }
});

module.exports = router;
