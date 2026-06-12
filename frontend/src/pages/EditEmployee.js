import { useState, useEffect } from "react";
import api from "../utils/api";

const card = { background: "var(--bg-card)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: "24px", border: "1px solid var(--border-light)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" };
const labelSt = { display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" };
const inputSt = { width: "100%", padding: "12px 16px", background: "var(--bg-input)", border: "1px solid var(--border-medium)", borderRadius: "14px", fontSize: "14px", boxSizing: "border-box", outline: "none", color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif", transition: "border-color 0.2s, box-shadow 0.2s" };
const inF = (e) => { e.target.style.borderColor = "var(--accent-blue)"; e.target.style.boxShadow = "0 0 0 4px rgba(0,184,255,0.08)"; };
const inB = (e) => { e.target.style.borderColor = "var(--border-medium)"; e.target.style.boxShadow = "none"; };

function EditEmployee() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [designation, setDesignation] = useState("");
  const [salary, setSalary] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("employee");

  useEffect(() => {
    try { const user = JSON.parse(localStorage.getItem("user") || "{}"); if (user?.role) setCurrentUserRole(user.role); }
    catch (e) {}
  }, []);

  const fetchEmployee = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/api/employees/${id}`);
      const emp = res.data;
      if (emp) {
        setName(emp.name || ""); setEmail(emp.email || ""); setDepartmentId(emp.department_id || "");
        setDesignation(emp.designation || ""); setSalary(emp.salary || "");
        if (emp.joining_date || emp.created_at) setJoiningDate(new Date(emp.joining_date || emp.created_at).toISOString().split('T')[0]);
      }
    } catch (err) { console.log(err); alert("Employee not found"); }
  };

  const updateEmployee = async () => {
    try {
      const payload = { name, email, department_id: departmentId ? parseInt(departmentId) : null, designation, salary: salary ? parseFloat(salary) : null, joining_date: joiningDate || null };
      await api.put(`/api/employees/${id}`, payload);
      alert("Employee Updated Successfully");
    } catch (err) { console.log(err); alert("Error Updating Employee"); }
  };

  const isEmployee = currentUserRole === "employee";

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", paddingBottom: "40px" }}>
      <div style={{ ...card, padding: "28px 32px", marginBottom: "24px", background: "linear-gradient(135deg, rgba(0,184,255,0.1) 0%, rgba(123,97,255,0.08) 100%)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Edit Employee</h2>
          <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: "14px" }}>Update employee records and details</p>
        </div>
        <div style={{ fontSize: "40px" }}>✏️</div>
      </div>

      <div style={{ ...card, padding: "32px", maxWidth: "600px" }}>
        
        <div style={{ display: "flex", gap: "10px", marginBottom: "32px", background: "var(--bg-hover)", padding: "16px", borderRadius: "16px", border: "1px solid var(--border-light)" }}>
          <div style={{ flex: 1 }}>
            <label style={labelSt}>Employee ID to Edit</label>
            <input type="number" placeholder="e.g. 12" value={id} onChange={(e) => setId(e.target.value)} style={inputSt} onFocus={inF} onBlur={inB} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button onClick={fetchEmployee} style={{
              background: "rgba(0,184,255,0.1)", color: "var(--accent-blue)", border: "1px solid rgba(0,184,255,0.2)",
              padding: "13px 20px", borderRadius: "14px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-blue)"; e.currentTarget.style.color = "var(--bg-main)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,184,255,0.1)"; e.currentTarget.style.color = "var(--accent-blue)"; }}
            >Fetch Details</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label style={labelSt}>Employee Name</label>
            <input type="text" placeholder="Employee Name" value={name} onChange={(e) => setName(e.target.value)} disabled={isEmployee} style={{ ...inputSt, opacity: isEmployee ? 0.5 : 1 }} onFocus={inF} onBlur={inB} />
          </div>
          <div>
            <label style={labelSt}>Email Address</label>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isEmployee} style={{ ...inputSt, opacity: isEmployee ? 0.5 : 1 }} onFocus={inF} onBlur={inB} />
          </div>
          <div>
            <label style={labelSt}>Department ID</label>
            <input type="number" placeholder="Department ID" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} disabled={isEmployee} style={{ ...inputSt, opacity: isEmployee ? 0.5 : 1 }} onFocus={inF} onBlur={inB} />
          </div>
          <div>
            <label style={labelSt}>Designation</label>
            <input type="text" placeholder="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} disabled={isEmployee} style={{ ...inputSt, opacity: isEmployee ? 0.5 : 1 }} onFocus={inF} onBlur={inB} />
          </div>
          <div>
            <label style={labelSt}>Salary (₹)</label>
            <input type="number" placeholder="Salary" value={salary} onChange={(e) => setSalary(e.target.value)} disabled={isEmployee} style={{ ...inputSt, opacity: isEmployee ? 0.5 : 1 }} onFocus={inF} onBlur={inB} />
          </div>
          <div>
            <label style={labelSt}>Joining Date</label>
            <input type="date" placeholder="Joining Date" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} disabled={isEmployee} style={{ ...inputSt, opacity: isEmployee ? 0.5 : 1, colorScheme: "dark" }} onFocus={inF} onBlur={inB} />
          </div>
        </div>

        <button onClick={updateEmployee} disabled={isEmployee} style={{
          width: "100%", background: isEmployee ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%)",
          color: isEmployee ? "var(--text-muted)" : "#fff", border: "none", borderRadius: "50px", padding: "16px",
          fontSize: "15px", fontWeight: 800, cursor: isEmployee ? "not-allowed" : "pointer",
          boxShadow: isEmployee ? "none" : "0 4px 20px rgba(0,184,255,0.3)", marginTop: "12px", transition: "transform 0.2s"
        }}
        onMouseEnter={(e) => { if (!isEmployee) e.currentTarget.style.transform = "scale(1.02)"; }}
        onMouseLeave={(e) => { if (!isEmployee) e.currentTarget.style.transform = "scale(1)"; }}
        >
          {isEmployee ? "Not Authorized" : "Update Employee"}
        </button>
      </div>
    </div>
  );
}

export default EditEmployee;