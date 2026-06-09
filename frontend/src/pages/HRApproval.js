import { useEffect, useState } from "react";
import api from "../utils/api";

// Fixed: was incorrectly named LeaveApproval — now correctly named HRApproval
function HRApproval() {
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
      alert("Error fetching leaves. Ensure you are logged in as HR or Admin.");
    } finally {
      setLoading(false);
    }
  };

  const approveLeave = async (id) => {
    const remarks = window.prompt("Enter final HR approval remarks:", "Approved by HR");
    try {
      // Fixed: was PUT /api/leave/hr-approve/:id (non-existent route)
      // Now correctly uses POST /api/leaves/approve/:id
      await api.post(`/api/leaves/approve/${id}`, { remarks });
      alert("✅ HR Final Approval granted!");
      fetchLeaves();
    } catch (err) {
      console.error("HR approve error:", err);
      alert(err.response?.data?.message || "Error approving leave.");
    }
  };

  const rejectLeave = async (id) => {
    const remarks = window.prompt("Enter rejection reason:", "HR policy violation.");
    try {
      // Fixed: was PUT /api/leave/reject/:id, now POST /api/leaves/reject/:id
      await api.post(`/api/leaves/reject/${id}`, { remarks });
      alert("❌ Leave rejected by HR.");
      fetchLeaves();
    } catch (err) {
      console.error("HR reject error:", err);
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
        background: "linear-gradient(135deg,#f093fb,#f5576c)",
        borderRadius: "16px",
        padding: "24px 28px",
        color: "#fff",
        marginBottom: "28px"
      }}>
        <h2 style={{ margin: 0 }}>🏅 HR Final Approval</h2>
        <p style={{ margin: "6px 0 0", opacity: 0.85 }}>Final leave approvals and policy enforcement</p>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#f5576c" }}>⏳ Loading...</p>
      ) : (
        <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#fff0f3" }}>
                {["ID", "Employee", "Designation", "Leave Type", "From", "To", "Days", "Status", "Action"].map((h) => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", color: "#555", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px 16px", color: "#999" }}>#{leave.id}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#2d3748" }}>{leave.employee_name}</td>
                  <td style={{ padding: "12px 16px", color: "#888" }}>{leave.designation}</td>
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
                <tr><td colSpan={9} style={{ textAlign: "center", padding: "24px", color: "#aaa" }}>No leave applications found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HRApproval;