const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorize } = require("../middleware/auth");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "hrms_uploads",
    allowed_formats: ["jpg", "png", "jpeg", "gif"],
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @route   GET /api/employees
// @desc    Get all employee profiles (joins users & departments)
router.get("/", verifyToken, async (req, res) => {
  try {
    // Basic Join 1 + Details
    const query = `
      SELECT 
        ep.id AS profile_id,
        ep.phone,
        ep.address,
        ep.designation,
        ep.salary,
        ep.joining_date,
        ep.profile_pic,
        ep.created_at,
        u.id AS user_id,
        u.name,
        u.email,
        u.role,
        d.id AS department_id,
        d.department_name
      FROM employee_profiles ep
      INNER JOIN users u ON ep.user_id = u.id
      LEFT JOIN departments d ON ep.department_id = d.id
      ORDER BY u.name ASC
    `;
    const employeesResult = await pool.query(query);

    // Fetch skills and images to append to each employee profile
    const profiles = employeesResult.rows;
    for (let emp of profiles) {
      // Get skills
      const skillsQuery = `
        SELECT s.id, s.skill_name 
        FROM employee_skills es
        INNER JOIN skills s ON es.skill_id = s.id
        WHERE es.employee_id = $1
      `;
      const skillsResult = await pool.query(skillsQuery, [emp.profile_id]);
      emp.skills = skillsResult.rows;

      // Get images
      const imagesQuery = `
        SELECT id, image_url 
        FROM employee_images 
        WHERE employee_id = $1
      `;
      const imagesResult = await pool.query(imagesQuery, [emp.profile_id]);
      emp.images = imagesResult.rows;
    }

    res.json(profiles);
  } catch (error) {
    console.error("Get employees error:", error);
    res.status(500).json({ message: "Server error fetching employee profiles.", error: error.message });
  }
});

// @route   GET /api/employees/:id
// @desc    Get a single employee profile by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const profileId = req.params.id;

    const query = `
      SELECT 
        ep.id AS profile_id,
        ep.phone,
        ep.address,
        ep.designation,
        ep.salary,
        ep.joining_date,
        ep.profile_pic,
        ep.created_at,
        u.id AS user_id,
        u.name,
        u.email,
        u.role,
        d.id AS department_id,
        d.department_name
      FROM employee_profiles ep
      INNER JOIN users u ON ep.user_id = u.id
      LEFT JOIN departments d ON ep.department_id = d.id
      WHERE ep.id = $1
    `;
    const profileResult = await pool.query(query, [profileId]);
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: "Employee profile not found." });
    }

    const employee = profileResult.rows[0];

    // Fetch skills
    const skillsQuery = `
      SELECT s.id, s.skill_name 
      FROM employee_skills es
      INNER JOIN skills s ON es.skill_id = s.id
      WHERE es.employee_id = $1
    `;
    const skillsResult = await pool.query(skillsQuery, [profileId]);
    employee.skills = skillsResult.rows;

    // Fetch images
    const imagesQuery = `
      SELECT id, image_url 
      FROM employee_images 
      WHERE employee_id = $1
    `;
    const imagesResult = await pool.query(imagesQuery, [profileId]);
    employee.images = imagesResult.rows;

    res.json(employee);
  } catch (error) {
    console.error("Get employee profile error:", error);
    res.status(500).json({ message: "Server error fetching employee profile.", error: error.message });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee profile (and many-to-many skills relation)
router.put("/:id", verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const profileId = req.params.id;
    const { phone, address, designation, salary, department_id, skills, joining_date } = req.body;

    // Check authorization: User can only update their own profile, unless they are Admin/HR
    const checkQuery = "SELECT user_id FROM employee_profiles WHERE id = $1";
    const checkResult = await client.query(checkQuery, [profileId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Employee profile not found." });
    }

    const ownerUserId = checkResult.rows[0].user_id;
    if (req.user.id !== ownerUserId && !["admin", "hr"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden. You can only update your own profile." });
    }

    // Start Transaction
    await client.query("BEGIN");

    // Update main profile fields
    const updateProfileQuery = `
      UPDATE employee_profiles 
      SET phone = $1, address = $2, designation = $3, salary = $4, department_id = $5, joining_date = $6
      WHERE id = $7
      RETURNING *
    `;
    const profileUpdateResult = await client.query(updateProfileQuery, [
      phone,
      address,
      designation,
      salary || 0.00,
      department_id || null,
      joining_date || null,
      profileId
    ]);

    // Update Skills (Delete old skills and insert new ones)
    if (skills && Array.isArray(skills)) {
      // Delete old skills
      await client.query("DELETE FROM employee_skills WHERE employee_id = $1", [profileId]);
      
      // Insert new skills
      for (let skillId of skills) {
        await client.query(
          "INSERT INTO employee_skills (employee_id, skill_id) VALUES ($1, $2)",
          [profileId, skillId]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Profile updated successfully!", profile: profileUpdateResult.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Update employee profile error:", error);
    res.status(500).json({ message: "Server error updating profile.", error: error.message });
  } finally {
    client.release();
  }
});

// @route   POST /api/employees/:id/upload
// @desc    Upload multiple images for employee (Aadhar, Resume, Profile Photo)
router.post("/:id/upload", verifyToken, (req, res, next) => {
  upload.array("photos", 5)(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Multer upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: `File upload error: ${err.message}` });
    }
    next();
  });
}, async (req, res) => {
  try {
    const profileId = req.params.id;

    // Check if profile exists
    const checkQuery = "SELECT user_id FROM employee_profiles WHERE id = $1";
    const checkResult = await pool.query(checkQuery, [profileId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Employee profile not found." });
    }

    const ownerUserId = checkResult.rows[0].user_id;
    if (req.user.id !== ownerUserId && !["admin", "hr"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden. You can only upload files to your own profile." });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded." });
    }

    const uploadedImages = [];
    for (let file of req.files) {
      const cloudUrl = file.path; // Cloudinary returns the full absolute URL here
      const result = await pool.query(
        "INSERT INTO employee_images (employee_id, image_url) VALUES ($1, $2) RETURNING id, image_url",
        [profileId, cloudUrl]
      );
      uploadedImages.push(result.rows[0]);
    }

    res.status(201).json({
      message: `${req.files.length} file(s) uploaded successfully!`,
      images: uploadedImages
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error uploading files.", error: error.message });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete an employee profile and their user account (Admin/HR only)
router.delete("/:id", verifyToken, authorize(["admin", "hr"]), async (req, res) => {
  try {
    const profileId = req.params.id;

    // Get the user ID before deleting profile so we can delete their auth record too
    const userQuery = "SELECT user_id FROM employee_profiles WHERE id = $1";
    const userResult = await pool.query(userQuery, [profileId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Employee profile not found." });
    }
    
    const userId = userResult.rows[0].user_id;

    // Delete user (will cascade delete the profile, leave balance, etc. based on schema design)
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    res.json({ message: "Employee profile and user account deleted successfully." });
  } catch (error) {
    console.error("Delete employee error:", error);
    res.status(500).json({ message: "Server error deleting employee.", error: error.message });
  }
});

// @route   POST /api/employees/:id/profile-pic
// @desc    Upload profile picture
router.post("/:id/profile-pic", verifyToken, upload.single("profile_pic"), async (req, res) => {
  try {
    const profileId = req.params.id;

    // Check authorization: User can only update their own profile, unless Admin/HR
    const checkQuery = "SELECT user_id FROM employee_profiles WHERE id = $1";
    const checkResult = await pool.query(checkQuery, [profileId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Employee profile not found." });
    }

    const ownerUserId = checkResult.rows[0].user_id;
    if (req.user.id !== ownerUserId && !["admin", "hr"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden. You can only upload a profile pic to your own profile." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const imageUrl = req.file.path; // Cloudinary full URL

    // Update profile_pic column
    await pool.query(
      "UPDATE employee_profiles SET profile_pic = $1 WHERE id = $2",
      [imageUrl, profileId]
    );

    res.json({
      message: "Profile picture uploaded successfully!",
      profile_pic: imageUrl
    });
  } catch (error) {
    console.error("Profile pic upload error:", error);
    res.status(500).json({ message: "Server error uploading profile picture.", error: error.message });
  }
});

module.exports = router;
