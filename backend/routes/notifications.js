const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken } = require("../middleware/auth");

// ─────────────────────────────────────────────
// PUT /api/notifications/read-all — Mark all as read
// (must be BEFORE /:id/read to avoid route conflict)
// ─────────────────────────────────────────────
router.put("/read-all", verifyToken, async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read = true WHERE user_id = $1",
      [req.user.id]
    );
    res.json({ message: "All notifications marked as read." });
  } catch (error) {
    console.error("Read all notifications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/notifications/unread-count
// ─────────────────────────────────────────────
router.get("/unread-count", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false",
      [req.user.id]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error("Unread count error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/notifications — Get my notifications
// ─────────────────────────────────────────────
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────
// PUT /api/notifications/:id/read — Mark one as read
// ─────────────────────────────────────────────
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    res.json({ message: "Notification marked as read." });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/notifications/:id — Delete a notification
// ─────────────────────────────────────────────
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM notifications WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    res.json({ message: "Notification deleted." });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
