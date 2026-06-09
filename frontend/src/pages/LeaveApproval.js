import { useEffect, useState } from "react";
import api from "../utils/api";

function LeaveApproval() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      // Fixed: was /api/leave/all (wrong), now /api/leaves/all (correct)
      const res = await api.get("/api/leaves/all");
      setLeaves(res.data);
    } catch (err) {
      console.error("Fetch leaves error:", err);
      alert("Error fetching leaves. Are you logged in with the right role?");
    } finally {
      setLoading(false);
    }
  };

  const approveLeave = async (id) => {
    const remarks = window.prompt("Enter approval remarks (optional):", "Approved by manager");
    try {
      // Fixed: was PUT /api/leave/approve/:id, now POST /api/leaves/approve/:id
      await api.post(`/api/leaves/approve/${id}`, { remarks });
      alert("✅ Leave Approved successfully!");
      fetchLeaves();
    } catch (err) {
      console.error("Approve leave error:", err);
      alert(err.response?.data?.message || "Error approving leave.");
    }
  };

  const rejectLeave = async (id) => {
    const remarks = window.prompt("Enter rejection reason:", "Does not meet leave policy.");
    try {
      // Fixed: was PUT /api/leave/reject/:id, now POST /api/leaves/reject/:id
      await api.post(`/api/leaves/reject/${id}`, { remarks });
      alert("❌ Leave Rejected.");
      fetchLeaves();
    } catch (err) {
      console.error("Reject leave error:", err);
      alert(err.response?.data?.message || "Error rejecting leave.");
    }
  };

  const statusColor = (status) => {
    if (status === "Approved") return { background: "#f0fff4", color: "#38a169" };
    if (status === "Rejected") return { background: "#fff5f5", color: "#e53e3e" };
    return { background: "#fffbea", color: "#d69e2e" };
  };

  return (
    <div style={{ padding: "32px", fontFamily: "'Segoe UI', sans-serif", background: "#f0f4ff", minHeight: "100vh" }}>
      <div style={{
        background: "linear-gradient(135deg,#667eea,#764ba2)",
        borderRadius: "16px",
        padding: "24px 28px",
        color: "#fff",
        marginBottom: "28px"
      }}>
        <h2 style={{ margin: 0 }}>📋 Manager Leave Approval</h2>
        <p style={{ margin: "6px 0 0", opacity: 0.85 }}>Review and action pending leave applications</p>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#6c63ff" }}>⏳ Loading...</p>
      ) : (
        <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#f0f4ff" }}>
                {["ID", "Employee", "Leave Type", "From", "To", "Days", "Status", "Action"].map((h) => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", color: "#555", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px 16px", color: "#999" }}>#{leave.id}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#2d3748" }}>{leave.employee_name}</td>
                  <td style={{ padding: "12px 16px", color: "#555" }}>{leave.leave_name}</td>
                  <td style={{ padding: "12px 16px", color: "#555" }}>{new Date(leave.from_date).toLocaleDateString()}</td>
                  <td style={{ padding: "12px 16px", color: "#555" }}>{new Date(leave.to_date).toLocaleDateString()}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>{leave.total_days}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ ...statusColor(leave.status), padding: "4px 12px", borderRadius: "20px", fontWeight: 600, fontSize: "12px" }}>
                      {leave.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {leave.status === "Pending" && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => approveLeave(leave.id)} style={{
                          background: "#38a169", color: "#fff", border: "none",
                          padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px"
                        }}>✅ Approve</button>
                        <button onClick={() => rejectLeave(leave.id)} style={{
                          background: "#e53e3e", color: "#fff", border: "none",
                          padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px"
                        }}>❌ Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "24px", color: "#aaa" }}>No leave applications found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LeaveApproval;