import { useEffect, useState } from "react";
import api from "../utils/api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/reports/summary");
      setStats(res.data.data || res.data);
    } catch (err) {
      setError("Failed to load dashboard. Please ensure you are logged in.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const cardStyle = (bg) => ({
    background: bg,
    borderRadius: "16px",
    padding: "24px 28px",
    color: "#fff",
    minWidth: "160px",
    flex: "1",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    transition: "transform 0.2s",
    cursor: "default",
  });

  const maxBarVal =
    stats && stats.departmentWiseCount.length > 0
      ? Math.max(...stats.departmentWiseCount.map((d) => parseInt(d.total) || 0)) || 1
      : 1;

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <div style={{ fontSize: "18px", color: "#6c63ff" }}>⏳ Loading dashboard...</div>
    </div>
  );

  if (error) return (
    <div style={{ padding: "40px", color: "#e53e3e", fontSize: "16px" }}>
      ⚠️ {error}
    </div>
  );

  return (
    <div style={{ padding: "32px", fontFamily: "'Segoe UI', sans-serif", background: "#f0f4ff", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #6c63ff 0%, #4facfe 100%)",
        borderRadius: "20px",
        padding: "32px 36px",
        marginBottom: "32px",
        color: "#fff",
        boxShadow: "0 8px 32px rgba(108,99,255,0.3)"
      }}>
        <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>📊 Enterprise Dashboard</h1>
        <p style={{ margin: "8px 0 0", opacity: 0.85 }}>Welcome back, <strong>{user.name || "User"}</strong> — {user.role}</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "32px" }}>
            {user.role !== "employee" && (
              <div style={cardStyle("linear-gradient(135deg,#667eea,#764ba2)")}>
                <div style={{ fontSize: "13px", opacity: 0.85, marginBottom: "8px" }}>👥 Total Employees</div>
                <div style={{ fontSize: "36px", fontWeight: 800 }}>{stats.summary.totalEmployees}</div>
              </div>
            )}
            {user.role !== "employee" && (
              <div style={cardStyle("linear-gradient(135deg,#f093fb,#f5576c)")}>
                <div style={{ fontSize: "13px", opacity: 0.85, marginBottom: "8px" }}>🏢 Departments</div>
                <div style={{ fontSize: "36px", fontWeight: 800 }}>{stats.summary.totalDepartments}</div>
              </div>
            )}
            <div style={cardStyle("linear-gradient(135deg,#4facfe,#00f2fe)")}>
              <div style={{ fontSize: "13px", opacity: 0.85, marginBottom: "8px" }}>⏳ Pending Leaves</div>
              <div style={{ fontSize: "36px", fontWeight: 800 }}>{stats.summary.pendingLeaves}</div>
            </div>
            <div style={cardStyle("linear-gradient(135deg,#43e97b,#38f9d7)")}>
              <div style={{ fontSize: "13px", opacity: 0.85, marginBottom: "8px" }}>✅ Approved Leaves</div>
              <div style={{ fontSize: "36px", fontWeight: 800 }}>{stats.summary.approvedLeaves}</div>
            </div>
            <div style={cardStyle("linear-gradient(135deg,#fa709a,#fee140)")}>
              <div style={{ fontSize: "13px", opacity: 0.85, marginBottom: "8px" }}>💻 Assets Assigned</div>
              <div style={{ fontSize: "36px", fontWeight: 800 }}>{stats.summary.assignedAssets}</div>
            </div>
            {user.role !== "employee" && (
              <div style={cardStyle("linear-gradient(135deg,#30cfd0,#667eea)")}>
                <div style={{ fontSize: "13px", opacity: 0.85, marginBottom: "8px" }}>💰 Total Salary</div>
                <div style={{ fontSize: "28px", fontWeight: 800 }}>
                  ₹{Number(stats.summary.totalSalaryExpense).toLocaleString("en-IN")}
                </div>
              </div>
            )}
          </div>

          {/* Charts Row (Admin/HR/Manager only) */}
          {user.role !== "employee" && (
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "32px" }}>

              {/* Department Bar Chart */}
              <div style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "28px",
                flex: "1",
                minWidth: "300px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
              }}>
                <h3 style={{ margin: "0 0 20px", color: "#2d3748", fontSize: "16px" }}>
                  🏢 Department-wise Employees
                </h3>
                {stats.departmentWiseCount.map((dept, i) => {
                  const barColors = ["#6c63ff","#f5576c","#4facfe","#43e97b","#fa709a","#30cfd0"];
                  const pct = Math.round(((parseInt(dept.total) || 0) / maxBarVal) * 100);
                  return (
                    <div key={i} style={{ marginBottom: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px", color: "#555" }}>
                        <span>{dept.department_name}</span>
                        <strong>{dept.total}</strong>
                      </div>
                      <div style={{ background: "#eef2ff", borderRadius: "8px", height: "10px" }}>
                        <div style={{
                          width: `${pct}%`,
                          background: barColors[i % barColors.length],
                          borderRadius: "8px",
                          height: "100%",
                          transition: "width 0.8s ease"
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Leave Type Usage */}
              <div style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "28px",
                flex: "1",
                minWidth: "280px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
              }}>
                <h3 style={{ margin: "0 0 20px", color: "#2d3748", fontSize: "16px" }}>
                  📋 Leave Type Usage (Approved Days)
                </h3>
                {stats.leaveTypeUsage.map((lt, i) => {
                  const colors = ["#6c63ff","#f5576c","#43e97b","#4facfe","#fa709a"];
                  return (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      marginBottom: "8px",
                      background: "#f7f9ff",
                      borderRadius: "10px",
                      borderLeft: `4px solid ${colors[i % colors.length]}`
                    }}>
                      <span style={{ fontSize: "14px", color: "#444" }}>{lt.leave_name}</span>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, color: colors[i % colors.length] }}>{lt.total_days} days</div>
                        <div style={{ fontSize: "11px", color: "#999" }}>{lt.applications} applications</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Absent Employees (Admin/HR/Manager only) */}
          {user.role !== "employee" && (
            <div style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "28px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
            }}>
              <h3 style={{ margin: "0 0 20px", color: "#2d3748", fontSize: "16px" }}>🏆 Top 5 Absent Employees</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#f0f4ff" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", color: "#555", fontWeight: 600 }}>Rank</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", color: "#555", fontWeight: 600 }}>Name</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", color: "#555", fontWeight: 600 }}>Designation</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", color: "#555", fontWeight: 600 }}>Total Days Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topAbsentEmployees.map((emp, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "12px 16px", color: i === 0 ? "#f5576c" : "#888" }}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#2d3748" }}>{emp.name}</td>
                      <td style={{ padding: "12px 16px", color: "#666" }}>{emp.designation}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          background: "#fff0f3",
                          color: "#f5576c",
                          fontWeight: 700,
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "13px"
                        }}>
                          {emp.total_absent_days} days
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stats.topAbsentEmployees.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "20px", color: "#aaa" }}>
                        No leave data yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Employee Welcome Area */}
          {user.role === "employee" && (
            <div style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "40px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              color: "#2d3748"
            }}>
              <span style={{ fontSize: "48px" }}>👋</span>
              <h2 style={{ margin: "16px 0 8px", fontSize: "20px", fontWeight: 700 }}>Welcome to your Employee Dashboard</h2>
              <p style={{ margin: 0, fontSize: "14px", color: "#718096", lineHeight: "1.6" }}>
                Use the navigation menu above to request time off via <strong>Apply Leave</strong>,<br />
                check your active company hardware and gear under <strong>Assets</strong>,<br />
                or upload verification files/documents in the <strong>Documents</strong> area.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;