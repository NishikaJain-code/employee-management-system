const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users(name,email,password) VALUES($1,$2,$3)",
      [name, email, hashedPassword]
    );

    res.json({
      message: "Signup successful",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error",
    });
  }
});


const { verifyToken } = require("../middleware/auth");

// @route   POST /api/auth/signup
// @desc    Register a new user, create their profile and initialize leave balance
router.post("/signup", async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields." });
    }

    // Check if user already exists
    const userExist = await client.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Start database transaction
    await client.query("BEGIN");

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default role is 'employee' if not specified
    const userRole = role || "employee";

    // Insert user
    const newUserResult = await client.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, hashedPassword, userRole]
    );
    const newUser = newUserResult.rows[0];

    // Auto-create employee profile for managers, HR, and employees
    if (userRole !== "admin") {
      const defaultDesignation = userRole.toUpperCase() + " Staff";
      const profileResult = await client.query(
        "INSERT INTO employee_profiles (user_id, designation, salary) VALUES ($1, $2, $3) RETURNING id",
        [newUser.id, defaultDesignation, 30000.00]
      );
      const profileId = profileResult.rows[0].id;

      // Initialize leave balance for all existing leave types
      const leaveTypes = await client.query("SELECT id, total_days FROM leave_types");
      for (let lt of leaveTypes.rows) {
        await client.query(
          "INSERT INTO leave_balance (employee_id, leave_type_id, available_days) VALUES ($1, $2, $3)",
          [profileId, lt.id, lt.total_days]
        );
      }
    }

    await client.query("COMMIT");
    res.status(201).json({
      message: "Registration successful!",
      user: newUser
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during registration.", error: error.message });
  } finally {
    client.release();
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
 
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;


    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid email",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET
    );

    res.json({
      token,
      message: "Login successful",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields." });
    }

    // Check for user
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const user = userResult.rows[0];

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Sign JWT Token
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
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login.", error: error.message });
  }
});

// @route   GET /api/auth/user
// @desc    Get current logged in user details
router.get("/user", verifyToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    
    // Check if user has an associated employee profile
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
    console.error("Fetch user error:", error);
    res.status(500).json({ message: "Server error fetching user details.", error: error.message });
  }
});

module.exports = router;

