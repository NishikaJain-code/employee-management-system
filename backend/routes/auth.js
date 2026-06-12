const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middleware/auth");

// REGISTER
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please enter all fields."
      });
    }

    const userExist = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userExist.rows.length > 0) {
      return res.status(400).json({
        message: "Email already registered."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRole = role || "employee";

    const newUser = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [name, email, hashedPassword, userRole]
    );

    res.status(201).json({
      message: "Registration successful!",
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error during registration."
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter all fields."
      });
    }

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
console.log("User Found:", userResult.rows);
    if (userResult.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid email or password."
      });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );
console.log("Entered Password:", password);
console.log("Stored Hash:", user.password);
console.log("Match Result:", isMatch);
    let isPlaintextMatch = false;
    if (!isMatch && password === user.password) {
      isPlaintextMatch = true;
      console.log("Matched via plaintext fallback");
    }

    if (!isMatch && !isPlaintextMatch) {
      return res.status(400).json({
        message: "Invalid email or password."
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error during login."
    });
  }
});
// CURRENT USER
router.get("/user", verifyToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    const profileResult = await pool.query(
      "SELECT id FROM employee_profiles WHERE user_id = $1",
      [req.user.id]
    );

    const user = userResult.rows[0];

    if (profileResult.rows.length > 0) {
      user.employee_profile_id = profileResult.rows[0].id;
    }

    res.json(user);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error fetching user details."
    });
  }
});

module.exports = router;