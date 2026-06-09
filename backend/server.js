require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const departmentRoutes = require("./routes/departments");
const skillRoutes = require("./routes/skills");
const employeeRoutes = require("./routes/employees");
const leaveRoutes = require("./routes/leaves");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Debug route imports
console.log("authRoutes:", typeof authRoutes);
console.log("departmentRoutes:", typeof departmentRoutes);
console.log("skillRoutes:", typeof skillRoutes);
console.log("employeeRoutes:", typeof employeeRoutes);
console.log("leaveRoutes:", typeof leaveRoutes);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({
    message: "Employee Management & Leave Approval System API is running.",
    status: "healthy"
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    message: "Internal Server Error"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
});