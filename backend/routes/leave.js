const express = require("express");
const router = express.Router();
const pool = require("../config/db");


// Apply Leave

router.post("/apply", async (req, res) => {

  try {

    const {
      employee_id,
      leave_type_id,
      from_date,
      to_date,
      total_days,
      reason
    } = req.body;

    await pool.query(
      `
      INSERT INTO leave_applications
      (
        employee_id,
        leave_type_id,
        from_date,
        to_date,
        total_days,
        reason,
        status
      )
      VALUES($1,$2,$3,$4,$5,$6,'Pending')
      `,
      [
        employee_id,
        leave_type_id,
        from_date,
        to_date,
        total_days,
        reason
      ]
    );

    res.json({
      message: "Leave Applied Successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Backend Error"
    });

  }

});

// Get All Leave Applications

router.get("/all", async (req, res) => {

  try {

    const leaves = await pool.query(`
      SELECT
      leave_applications.*,
      users.name AS employee_name,
      leave_types.leave_name
      FROM leave_applications
      JOIN users
      ON leave_applications.employee_id = users.id
      JOIN leave_types
      ON leave_applications.leave_type_id = leave_types.id
      ORDER BY leave_applications.id DESC
    `);

    res.json(leaves.rows);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Backend Error"
    });

  }

});

// Manager Approve Leave



 router.put("/approve/:id", async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query(
      `
      UPDATE leave_applications
      SET status='Manager Approved'
      WHERE id=$1
      `,
      [id]
    );

    await pool.query(
      `
      INSERT INTO approval_history
      (
        leave_id,
        approved_by,
        action,
        remarks
      )
      VALUES($1,$2,$3,$4)
      `,
      [
        id,
        1,
        'Approved',
        'Manager Approved Leave'
      ]
    );

    res.json({
      message: "Leave Approved"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Backend Error"
    });

  }

});

// Manager Reject Leave

router.put("/reject/:id", async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query(
      `
      UPDATE leave_applications
      SET status='Rejected'
      WHERE id=$1
      `,
      [id]
    );

    await pool.query(
      `
      INSERT INTO approval_history
      (
        leave_id,
        approved_by,
        action,
        remarks
      )
      VALUES($1,$2,$3,$4)
      `,
      [
        id,
        1,
        'Rejected',
        'Manager Rejected Leave'
      ]
    );

    res.json({
      message: "Leave Rejected"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Backend Error"
    });

  }

});

// HR Final Approval

router.put("/hr-approve/:id", async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query(
      `
      UPDATE leave_applications
      SET status='HR Approved'
      WHERE id=$1
      `,
      [id]
    );

    await pool.query(
      `
      INSERT INTO approval_history
      (
        leave_id,
        approved_by,
        action,
        remarks
      )
      VALUES($1,$2,$3,$4)
      `,
      [
        id,
        1,
        'HR Approved',
        'Final HR Approval'
      ]
    );

    res.json({
      message: "HR Approved Successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Backend Error"
    });

  }

});
module.exports = router;