import { useState } from "react";
import axios from "axios";

function LeaveApplication() {

  const [employeeId, setEmployeeId] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [totalDays, setTotalDays] = useState("");
  const [reason, setReason] = useState("");

  const applyLeave = async () => {

    try {

      const res = await axios.post(
        "http://localhost:5000/api/leave/apply",
        {
          employee_id: employeeId,
          leave_type_id: leaveTypeId,
          from_date: fromDate,
          to_date: toDate,
          total_days: totalDays,
          reason: reason
        }
      );

      alert(res.data.message);

    } catch (err) {

      console.log(err);

      alert("Error Applying Leave");

    }

  };

  return (
    <div style={{ padding: "20px" }}>

      <h2>Apply Leave</h2>

      <input
        type="number"
        placeholder="Employee ID"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
      />

      <br /><br />

      <input
        type="number"
        placeholder="Leave Type ID"
        value={leaveTypeId}
        onChange={(e) => setLeaveTypeId(e.target.value)}
      />

      <br /><br />

      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
      />

      <br /><br />

      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
      />

      <br /><br />

      <input
        type="number"
        placeholder="Total Days"
        value={totalDays}
        onChange={(e) => setTotalDays(e.target.value)}
      />

      <br /><br />

      <textarea
        placeholder="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <br /><br />

      <button onClick={applyLeave}>
        Apply Leave
      </button>

    </div>
  );
}

export default LeaveApplication;