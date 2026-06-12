import { useEffect, useState } from "react";
import api from "../utils/api";

const card = { background: "var(--bg-card)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: "24px", border: "1px solid var(--border-light)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" };

const statusBadge = (status) => {
  if (status === "Approved") return { background: "rgba(0,255,194,0.1)", color: "var(--accent-cyan)", border: "1px solid rgba(0,255,194,0.2)" };
  if (status === "Rejected") return { background: "rgba(255,61,113,0.1)", color: "var(--accent-red)", border: "1px solid rgba(255,61,113,0.2)" };
  return { background: "rgba(255,184,0,0.1)", color: "var(--accent-yellow)", border: "1px solid rgba(255,184,0,0.2)" };
};

function HRApproval() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/leaves/all");
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching leaves. Ensure you are logged in as HR or Admin.");
    } finally { setLoading(false); }
  };

  const approveLeave = async (id) => {
    const remarks = window.prompt("Enter final HR approval remarks:", "Approved by HR");
    try { await api.post(`/api/leaves/approve/${id}`, { remarks }); alert("✅ HR Final Approval granted!"); fetchLeaves(); }
    catch (err) { alert(err.response?.data?.message || "Error approving leave."); }
  };

  const rejectLeave = async (id) => {
    const remarks = window.prompt("Enter rejection reason:", "HR policy violation.");
    try { await api.post(`/api/leaves/reject/${id}`, { remarks }); alert("❌ Leave rejected by HR."); fetchLeaves(); }
    catch (err) { alert(err.response?.data?.message || "Error rejecting leave."); }
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", paddingBottom: "40px" }}>
      <div style={{ ...card, padding: "28px 32px", marginBottom: "24px", background: "linear-gradient(135deg, rgba(255,0,229,0.1) 0%, rgba(123,97,255,0.1) 100%)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>HR Final Approval</h2>
          <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: "14px" }}>Final leave approvals and policy enforcement</p>
        </div>
        <div style={{ fontSize: "40px" }}>🏅</div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "60px" }}>Loading...</div>
      ) : (
        <div style={{ ...card, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                {["ID", "Employee", "Designation", "Leave Type", "From", "To", "Days", "Status", "Action"].map((h) => (
                  <th key={h} style={{ padding: "16px", textAlign: "left", color: "var(--text-muted)", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id} style={{ borderBottom: "1px solid var(--bg-input)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 16px", color: "var(--text-muted)", fontWeight: 600 }}>#{leave.id}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--text-primary)" }}>{leave.employee_name}</td>
                  <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>{leave.designation}</td>
                  <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>{leave.leave_name}</td>
                  <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>{new Date(leave.from_date).toLocaleDateString()}</td>
                  <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>{new Date(leave.to_date).toLocaleDateString()}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--text-primary)" }}>{leave.total_days}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ ...statusBadge(leave.status), padding: "5px 14px", borderRadius: "50px", fontWeight: 700, fontSize: "12px" }}>
                      {leave.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {leave.status === "Pending" && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => approveLeave(leave.id)} style={{
                          background: "rgba(0,255,194,0.1)", color: "var(--accent-cyan)", border: "1px solid rgba(0,255,194,0.2)",
                          padding: "7px 16px", borderRadius: "50px", cursor: "pointer", fontSize: "12px", fontWeight: 700, fontFamily: "'Outfit', sans-serif", transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-cyan)"; e.currentTarget.style.color = "var(--bg-main)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,255,194,0.1)"; e.currentTarget.style.color = "var(--accent-cyan)"; }}
                        >✓ Approve</button>
                        <button onClick={() => rejectLeave(leave.id)} style={{
                          background: "rgba(255,61,113,0.1)", color: "var(--accent-red)", border: "1px solid rgba(255,61,113,0.2)",
                          padding: "7px 16px", borderRadius: "50px", cursor: "pointer", fontSize: "12px", fontWeight: 700, fontFamily: "'Outfit', sans-serif", transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-red)"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,61,113,0.1)"; e.currentTarget.style.color = "var(--accent-red)"; }}
                        >✗ Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>No leave applications found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HRApproval;