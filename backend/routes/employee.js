const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const multer = require("multer");



// ================= MULTER =================

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },

});

const upload = multer({
  storage: storage,
});



// ================= DEPARTMENTS =================

// GET Departments
router.get("/departments", async (req, res) => {

  try {

    const departments = await pool.query(
      "SELECT * FROM departments ORDER BY id"
    );

    res.json(departments.rows);

  } catch (err) {

    console.log(err);

  }

});



// POST Department
router.post("/departments", async (req, res) => {

  try {

    const { name } = req.body;

    await pool.query(
      "INSERT INTO departments(department_name) VALUES($1)",
      [name]
    );

    res.json({
      message: "Department Added",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

});



// ================= SKILLS =================

// GET Skills
router.get("/skills", async (req, res) => {

  try {

    const skills = await pool.query(
      "SELECT * FROM skills ORDER BY id"
    );

    res.json(skills.rows);

  } catch (err) {

    console.log(err);

  }

});



// POST Skill
router.post("/skills", async (req, res) => {

  try {

    const { name } = req.body;

    await pool.query(
      "INSERT INTO skills(skill_name) VALUES($1)",
      [name]
    );

    res.json({
      message: "Skill Added",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

});



// ================= EMPLOYEES =================

// CREATE Employee
router.post("/employees", async (req, res) => {

  try {

    const { name, email, department_id } = req.body;

    console.log(req.body);

    await pool.query(
      `
      INSERT INTO employees(name,email,department_id)
      VALUES($1,$2,$3)
      `,
      [name, email, department_id]
    );

    res.json({
      message: "Employee Added",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Backend Error",
      error: err.message,
    });

  }

});



// GET ALL Employees
router.get("/employees", async (req, res) => {

  try {

    const employees = await pool.query(`
      SELECT
      e.id,
      e.name,
      e.email,
      d.department_name AS department
      FROM employees e
      LEFT JOIN departments d
      ON e.department_id = d.id
      ORDER BY e.id
    `);

    res.json(employees.rows);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });

  }

});



// GET Employee By ID
router.get("/employees/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const employee = await pool.query(
      `
      SELECT employees.*, departments.name AS department
      FROM employees
      LEFT JOIN departments
      ON employees.department_id = departments.id
      WHERE employees.id=$1
      `,
      [id]
    );

    res.json(employee.rows[0]);

  } catch (err) {

    console.log(err);

  }

});



// UPDATE Employee
router.put("/employees/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const { name, email, department_id } = req.body;

    await pool.query(
      `
      UPDATE employees
      SET name=$1,email=$2,department_id=$3
      WHERE id=$4
      `,
      [name, email, department_id, id]
    );

    res.json({
      message: "Employee Updated",
    });

  } catch (err) {

    console.log(err);

  }

});



// DELETE Employee
router.delete("/employees/:id", async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query(
      "DELETE FROM employees WHERE id=$1",
      [id]
    );

    res.json({
      message: "Employee Deleted",
    });

  } catch (err) {

    console.log(err);

  }

});



// ================= FILE UPLOAD =================

router.post(
  "/employees/upload",
  upload.array("files", 5),

  async (req, res) => {

    try {

      res.json({
        message: "Files Uploaded Successfully",
        files: req.files,
      });

    } catch (err) {

      console.log(err);

    }

  }
);



// ================= DASHBOARD =================

router.get("/dashboard", async (req, res) => {

  try {

    const employees = await pool.query(
      "SELECT COUNT(*) FROM employees"
    );

    const departments = await pool.query(
      "SELECT COUNT(*) FROM departments"
    );

    const skills = await pool.query(
      "SELECT COUNT(*) FROM skills"
    );

    const images = {
  rows: [
    {
      count: 0
    }
  ]
};

    res.json({
      totalEmployees: employees.rows[0].count,
      totalDepartments: departments.rows[0].count,
      totalSkills: skills.rows[0].count,
      totalImages: images.rows[0].count,
    });

  } catch (err) {

    console.log(err);

  }

});


module.exports = router;