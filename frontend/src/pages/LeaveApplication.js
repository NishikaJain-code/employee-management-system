import { useState, useEffect } from "react";
import api from "../utils/api";

function LeaveApplication() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [fromDate, setFromDate]   = useState("");
  const [toDate, setToDate]       = useState("");
  const [totalDays, setTotalDays] = useState("");
  const [reason, setReason]       = useState("");
  const [balance, setBalance]     = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaveTypes();
    fetchBalance();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await api.get("/api/leaves/types");
      setLeaveTypes(res.data);
    } catch (err) {
      console.error("Fetch leave types error:", err);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await api.get("/api/leaves/balance");
      setBalance(res.data);
    } catch (err) {
      console.error("Fetch balance error:", err);
    }
  };

  // Auto-calculate total days from dates
  const handleDateChange = (from, to) => {
    if (from && to) {
      const diff = Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;
      if (diff > 0) setTotalDays(diff.toString());
      else setTotalDays("");
    }
  };

  const applyLeave = async () => {
    if (!leaveTypeId || !fromDate || !toDate || !totalDays || !reason.trim()) {
      alert("Please fill all fields.");
      return;
    }
    try {
      setSubmitting(true);
      // Fixed: was /api/leave/apply (wrong route)
      // Fixed: removed employee_id from body (backend reads from JWT token)
      const res = await api.post("/api/leaves/apply", {
        leave_type_id: leaveTypeId,
        from_date: fromDate,
        to_date: toDate,
        total_days: parseInt(totalDays),
        reason,
      });
      alert("✅ " + res.data.message);
      // Reset form
      setLeaveTypeId(""); setFromDate(""); setToDate(""); setTotalDays(""); setReason("");
      fetchBalance();
    } catch (err) {
      console.error("Apply leave error:", err);
      alert(err.response?.data?.message || "Error applying for leave.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "32px", fontFamily: "'Segoe UI', sans-serif", background: "#f0f4ff", minHeight: "100vh" }}>

      <div style={{
        background: "linear-gradient(135deg,#43e97b,#38f9d7)",
        borderRadius: "16px",
        padding: "24px 28px",
        color: "#fff",
        marginBottom: "28px"
      }}>
        <h2 style={{ margin: 0 }}>📝 Apply for Leave</h2>
        <p style={{ margin: "6px 0 0", opacity: 0.85 }}>Submit a new leave application</p>
      </div>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>

        {/* Form */}
        <div style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "28px",
          flex: "1",
          minWidth: "300px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}>
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, color: "#444", fontSize: "14px" }}>Leave Type</label>
            <select
              value={leaveTypeId}
              onChange={(e) => setLeaveTypeId(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }}
            >
              <option value="">-- Select Leave Type --</option>
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>{lt.leave_name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "14px", marginBottom: "18px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, color: "#444", fontSize: "14px" }}>From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); handleDateChange(e.target.value, toDate); }}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, color: "#444", fontSize: "14px" }}>To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); handleDateChange(fromDate, e.target.value); }}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, color: "#444", fontSize: "14px" }}>Total Days</label>
            <input
              type="number"
              placeholder="Auto-calculated"
              value={totalDays}
              onChange={(e) => setTotalDays(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, color: "#444", fontSize: "14px" }}>Reason</label>
            <textarea
              placeholder="Provide a detailed reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }}
            />
          </div>

          <button
            onClick={applyLeave}
            disabled={submitting}
            style={{
              width: "100%",
              padding: "12px",
              background: submitting ? "#aaa" : "linear-gradient(135deg,#43e97b,#38f9d7)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "15px",
              cursor: submitting ? "not-allowed" : "pointer"
            }}
          >
            {submitting ? "⏳ Submitting..." : "📤 Submit Application"}
          </button>
        </div>

        {/* Leave Balance */}
        <div style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "28px",
          minWidth: "240px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}>
          <h3 style={{ margin: "0 0 16px", color: "#2d3748", fontSize: "16px" }}>📊 My Leave Balance</h3>
          {balance.map((b, i) => (
            <div key={i} style={{
              padding: "14px 16px",
              marginBottom: "10px",
              background: "#f7fff9",
              borderRadius: "10px",
              borderLeft: "4px solid #43e97b"
            }}>
              <div style={{ fontWeight: 600, color: "#2d3748", fontSize: "14px" }}>{b.leave_name}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "13px" }}>
                <span style={{ color: "#888" }}>Available:</span>
                <span style={{ fontWeight: 700, color: "#38a169" }}>{b.available_days} / {b.max_days}</span>
              </div>
            </div>
          ))}
          {balance.length === 0 && (
            <p style={{ color: "#aaa", fontSize: "13px" }}>No leave balance found. Contact HR.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LeaveApplication;