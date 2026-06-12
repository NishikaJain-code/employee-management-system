import { useEffect, useState } from "react";
import api from "../utils/api";

const card = { background: "rgba(18,25,38,0.5)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" };
const inputSt = { width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", fontSize: "14px", boxSizing: "border-box", outline: "none", color: "#f1f5f9", fontFamily: "'Outfit', sans-serif", transition: "border-color 0.2s, box-shadow 0.2s" };
const inF = (e) => { e.target.style.borderColor = "#00FFC2"; e.target.style.boxShadow = "0 0 0 4px rgba(0,255,194,0.08)"; };
const inB = (e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; };

function DepartmentMaster() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => { getDepartments(); }, []);

  const getDepartments = async () => {
    try { const res = await api.get("/api/departments"); setDepartments(res.data); }
    catch (err) { console.log(err); }
  };

  const addDepartment = async () => {
    if (!name.trim()) { alert("Please enter a department name."); return; }
    try {
      await api.post("/api/departments", { department_name: name });
      alert("Department Added");
      setName(""); getDepartments();
    } catch (err) { alert(err.response?.data?.message || err.message || "Error Adding Department"); }
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", paddingBottom: "40px" }}>
      <div style={{ ...card, padding: "28px 32px", marginBottom: "24px", background: "linear-gradient(135deg, rgba(255,184,0,0.1) 0%, rgba(255,61,113,0.08) 100%)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#f1f5f9" }}>Department Master</h2>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "14px" }}>Manage your organisation's departments</p>
        </div>
        <div style={{ fontSize: "40px" }}>🏢</div>
      </div>

      {/* Add form */}
      <div style={{ ...card, padding: "28px", marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 20px", color: "#f1f5f9", fontSize: "16px", fontWeight: 700 }}>Add New Department</h3>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <input type="text" placeholder="Department Name" value={name} onChange={(e) => setName(e.target.value)}
            style={{ ...inputSt, flex: 1 }} onFocus={inF} onBlur={inB}
            onKeyDown={(e) => e.key === "Enter" && addDepartment()}
          />
          <button onClick={addDepartment} style={{
            background: "linear-gradient(135deg, #00FFC2, #00B8FF)", color: "#080B13",
            border: "none", padding: "12px 28px", borderRadius: "50px", fontWeight: 800, fontSize: "14px",
            cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: "0 4px 16px rgba(0,255,194,0.25)",
            whiteSpace: "nowrap", transition: "transform 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.04)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >+ Add</button>
        </div>
      </div>

      {/* List */}
      <div style={{ ...card, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 style={{ margin: 0, color: "#f1f5f9", fontSize: "16px", fontWeight: 700 }}>All Departments ({departments.length})</h3>
        </div>
        <div style={{ padding: "8px 0" }}>
          {departments.map((dept) => (
            <div key={dept.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "36px", height: "36px", background: "rgba(255,184,0,0.1)", border: "1px solid rgba(255,184,0,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFB800", fontWeight: 800, fontSize: "14px" }}>
                  {(dept.department_name || dept.name || "?").charAt(0).toUpperCase()}
                </div>
                <span style={{ fontWeight: 700, color: "#f1f5f9", fontSize: "15px" }}>{dept.department_name || dept.name}</span>
              </div>
              <span style={{ color: "#64748b", fontSize: "13px", fontWeight: 600 }}>ID #{dept.id}</span>
            </div>
          ))}
          {departments.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>No departments found. Add one above.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DepartmentMaster;