import { useEffect, useState } from "react";
import api from "../utils/api";

const card = { background: "rgba(18,25,38,0.5)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" };

function EmployeeList() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try { const res = await api.get("/api/employees"); setEmployees(res.data || []); }
    catch (err) { console.log(err); }
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", paddingBottom: "40px" }}>
      <div style={{ ...card, padding: "28px 32px", marginBottom: "24px", background: "linear-gradient(135deg, rgba(0,255,194,0.1) 0%, rgba(0,184,255,0.08) 100%)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#f1f5f9" }}>Employee Directory</h2>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "14px" }}>{employees.length} total employees</p>
        </div>
        <div style={{ fontSize: "40px" }}>👥</div>
      </div>

      <div style={{ ...card, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["ID", "Name", "Email", "Department", "Designation", "Salary", "Joining Date", "Skills", "Actions"].map(h => (
                <th key={h} style={{ padding: "16px", textAlign: "left", color: "#64748b", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "14px 16px", color: "#64748b", fontWeight: 600 }}>{emp.user_id}</td>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "#f1f5f9" }}>{emp.name}</td>
                <td style={{ padding: "14px 16px", color: "#94a3b8" }}>{emp.email}</td>
                <td style={{ padding: "14px 16px", color: "#94a3b8" }}>{emp.department_name || "—"}</td>
                <td style={{ padding: "14px 16px", color: "#94a3b8" }}>{emp.designation || "—"}</td>
                <td style={{ padding: "14px 16px", color: "#00FFC2", fontWeight: 700 }}>{emp.salary ? `₹${Number(emp.salary).toLocaleString("en-IN")}` : "—"}</td>
                <td style={{ padding: "14px 16px", color: "#94a3b8" }}>{emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : "—"}</td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {emp.skills && emp.skills.length > 0 ? emp.skills.map((s, i) => (
                      <span key={i} style={{ background: "rgba(123,97,255,0.1)", color: "#7B61FF", border: "1px solid rgba(123,97,255,0.2)", padding: "2px 10px", borderRadius: "50px", fontSize: "11px", fontWeight: 700 }}>{s.skill_name}</span>
                    )) : <span style={{ color: "#64748b" }}>—</span>}
                  </div>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <button onClick={() => window.location.href = '/edit-employee'} style={{
                    background: "rgba(0,184,255,0.1)", color: "#00B8FF", border: "1px solid rgba(0,184,255,0.2)",
                    padding: "7px 16px", borderRadius: "50px", cursor: "pointer", fontSize: "12px", fontWeight: 700, fontFamily: "'Outfit', sans-serif", transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#00B8FF"; e.currentTarget.style.color = "#080B13"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,184,255,0.1)"; e.currentTarget.style.color = "#00B8FF"; }}
                  >Edit</button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>No employees found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeeList;