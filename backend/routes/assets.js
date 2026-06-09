const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorize } = require("../middleware/auth");

// ─────────────────────────────────────────────
// GET /api/assets — List all assets (Admin/HR)
// ─────────────────────────────────────────────
router.get("/", verifyToken, authorize(["admin", "hr"]), async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let conditions = [];
    let params = [];
    let idx = 1;

    if (type)   { conditions.push(`a.type = $${idx++}`);   params.push(type); }
    if (status) { conditions.push(`a.status = $${idx++}`); params.push(status); }

    const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

    const result = await pool.query(
      `SELECT
         a.*,
         u.name  AS assigned_to_name,
         aa.id   AS assignment_id,
         aa.assigned_date
       FROM assets a
       LEFT JOIN asset_assignments aa ON aa.asset_id = a.id AND aa.status = 'Active'
       LEFT JOIN employee_profiles ep ON aa.employee_id = ep.id
       LEFT JOIN users u ON ep.user_id = u.id
       ${where}
       ORDER BY a.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM assets a ${where}`,
      params
    );

    res.json({
      assets: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    });
  } catch (error) {
    console.error("Get assets error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/assets — Create a new asset
// ─────────────────────────────────────────────
router.post("/", verifyToken, authorize(["admin", "hr"]), async (req, res) => {
  try {
    const { name, type, serial_number, description } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: "Asset name and type are required." });
    }

    const result = await pool.query(
      `INSERT INTO assets (name, type, serial_number, description, status)
       VALUES ($1, $2, $3, $4, 'Available')
       RETURNING *`,
      [name, type, serial_number || null, description || null]
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (table_name, record_id, action, new_values, performed_by)
       VALUES ($1, $2, 'INSERT', $3, $4)`,
      ["assets", result.rows[0].id, JSON.stringify(result.rows[0]), req.user.id]
    ).catch((e) => console.warn("Audit log failed:", e.message));

    res.status(201).json({ message: "Asset created successfully!", asset: result.rows[0] });
  } catch (error) {
    console.error("Create asset error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/assets/all-assignments — All assignments (Admin/HR)
// ─────────────────────────────────────────────
router.get("/all-assignments", verifyToken, authorize(["admin", "hr"]), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         aa.id   AS assignment_id,
         a.name  AS asset_name,
         a.type,
         a.serial_number,
         u.name  AS employee_name,
         aa.assigned_date,
         aa.return_date,
         aa.status,
         aa.notes
       FROM asset_assignments aa
       INNER JOIN assets a          ON aa.asset_id   = a.id
       INNER JOIN employee_profiles ep ON aa.employee_id = ep.id
       INNER JOIN users u           ON ep.user_id    = u.id
       ORDER BY aa.assigned_date DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Get all assignments error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/assets/my — Current user's assigned assets
// ─────────────────────────────────────────────
router.get("/my", verifyToken, async (req, res) => {
  try {
    const empResult = await pool.query(
      "SELECT id FROM employee_profiles WHERE user_id = $1",
      [req.user.id]
    );
    if (empResult.rows.length === 0) return res.json([]);

    const result = await pool.query(
      `SELECT
         a.name, a.type, a.serial_number, a.description,
         aa.id AS assignment_id, aa.assigned_date, aa.status
       FROM asset_assignments aa
       INNER JOIN assets a ON aa.asset_id = a.id
       WHERE aa.employee_id = $1 AND aa.status = 'Active'
       ORDER BY aa.assigned_date DESC`,
      [empResult.rows[0].id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Get my assets error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/assets/assign — Assign asset to an employee
// ─────────────────────────────────────────────
router.post("/assign", verifyToken, authorize(["admin", "hr"]), async (req, res) => {
  const client = await pool.connect();
  try {
    const { asset_id, employee_id, notes } = req.body;

    if (!asset_id || !employee_id) {
      return res.status(400).json({ message: "asset_id and employee_id are required." });
    }

    await client.query("BEGIN");

    // Lock and check asset
    const assetResult = await client.query(
      "SELECT * FROM assets WHERE id = $1 FOR UPDATE",
      [asset_id]
    );
    if (assetResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Asset not found." });
    }
    if (assetResult.rows[0].status !== "Available") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: `Asset is currently ${assetResult.rows[0].status}.` });
    }

    // Create assignment record
    const assignResult = await client.query(
      `INSERT INTO asset_assignments (asset_id, employee_id, assigned_date, status, notes)
       VALUES ($1, $2, NOW(), 'Active', $3) RETURNING *`,
      [asset_id, employee_id, notes || null]
    );

    // Mark asset as Assigned
    await client.query(
      "UPDATE assets SET status = 'Assigned', updated_at = NOW() WHERE id = $1",
      [asset_id]
    );

    await client.query("COMMIT");

    // Notification (best-effort, outside transaction)
    try {
      const empResult = await pool.query(
        "SELECT user_id FROM employee_profiles WHERE id = $1",
        [employee_id]
      );
      if (empResult.rows.length > 0) {
        await pool.query(
          `INSERT INTO notifications (user_id, message, type, metadata)
           VALUES ($1, $2, 'asset_assigned', $3)`,
          [
            empResult.rows[0].user_id,
            `A "${assetResult.rows[0].name}" (${assetResult.rows[0].type}) has been assigned to you.`,
            JSON.stringify({ asset_id, assignment_id: assignResult.rows[0].id }),
          ]
        );
      }
    } catch (notifErr) {
      console.warn("Notification insert failed:", notifErr.message);
    }

    // Audit log (best-effort)
    pool.query(
      `INSERT INTO audit_logs (table_name, record_id, action, new_values, performed_by)
       VALUES ('asset_assignments', $1, 'INSERT', $2, $3)`,
      [assignResult.rows[0].id, JSON.stringify({ asset_id, employee_id }), req.user.id]
    ).catch((e) => console.warn("Audit log failed:", e.message));

    res.json({ message: "Asset assigned successfully!", assignment: assignResult.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Assign asset error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    client.release();
  }
});

// ─────────────────────────────────────────────
// PUT /api/assets/return/:assignmentId — Return an asset
// ─────────────────────────────────────────────
router.put("/return/:id", verifyToken, authorize(["admin", "hr"]), async (req, res) => {
  const client = await pool.connect();
  try {
    const assignmentId = req.params.id;

    await client.query("BEGIN");

    const assignResult = await client.query(
      "SELECT * FROM asset_assignments WHERE id = $1 FOR UPDATE",
      [assignmentId]
    );
    if (assignResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Assignment not found." });
    }
    if (assignResult.rows[0].status !== "Active") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "This assignment is already closed." });
    }

    const oldValues = { status: "Active" };

    // Mark assignment as Returned
    await client.query(
      `UPDATE asset_assignments
       SET status = 'Returned', return_date = NOW()
       WHERE id = $1`,
      [assignmentId]
    );

    // Mark asset as Available
    await client.query(
      "UPDATE assets SET status = 'Available', updated_at = NOW() WHERE id = $1",
      [assignResult.rows[0].asset_id]
    );

    await client.query("COMMIT");

    // Audit log (best-effort)
    pool.query(
      `INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, performed_by)
       VALUES ('asset_assignments', $1, 'UPDATE', $2, $3, $4)`,
      [
        assignmentId,
        JSON.stringify(oldValues),
        JSON.stringify({ status: "Returned", return_date: new Date() }),
        req.user.id,
      ]
    ).catch((e) => console.warn("Audit log failed:", e.message));

    res.json({ message: "Asset returned successfully!" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Return asset error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    client.release();
  }
});

// ─────────────────────────────────────────────
// DELETE /api/assets/:id — Delete an asset (Admin only)
// ─────────────────────────────────────────────
router.delete("/:id", verifyToken, authorize(["admin"]), async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM assets WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Asset not found." });
    }
    res.json({ message: "Asset deleted successfully." });
  } catch (error) {
    console.error("Delete asset error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
