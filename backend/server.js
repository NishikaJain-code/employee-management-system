require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

// ── Route Imports ──────────────────────────────────────────
const authRoutes         = require("./routes/auth");
const departmentRoutes   = require("./routes/departments");
const skillRoutes        = require("./routes/skills");
const employeeRoutes     = require("./routes/employees");
const leaveRoutes        = require("./routes/leaves");
const assetRoutes        = require("./routes/assets");
const notificationRoutes = require("./routes/notifications");
const auditRoutes        = require("./routes/audit");
const reportRoutes       = require("./routes/reports");

const app = express();

// ── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── API Routes ─────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/departments",   departmentRoutes);
app.use("/api/skills",        skillRoutes);
app.use("/api/employees",     employeeRoutes);
app.use("/api/leaves",        leaveRoutes);
app.use("/api/assets",        assetRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit",         auditRoutes);
app.use("/api/reports",       reportRoutes);

// ── Health Check ───────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Employee Management & Leave Approval System API is running.",
    status: "healthy",
    version: "2.0 — Phase 5 Enterprise Edition",
    endpoints: [
      "/api/auth",
      "/api/employees",
      "/api/departments",
      "/api/skills",
      "/api/leaves",
      "/api/assets",
      "/api/notifications",
      "/api/audit",
      "/api/reports",
    ],
  });
});

// ── Global Error Handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log(`✅ All Phase 5 routes loaded\n`);
});