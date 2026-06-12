import { useEffect, useState } from "react";
import axios from "axios";

const card = { background: "var(--bg-card)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: "24px", border: "1px solid var(--border-light)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" };
const labelSt = { display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" };
const inputSt = { width: "100%", padding: "12px 16px", background: "var(--bg-input)", border: "1px solid var(--border-medium)", borderRadius: "14px", fontSize: "14px", boxSizing: "border-box", outline: "none", color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif", transition: "border-color 0.2s, box-shadow 0.2s" };
const inF = (e) => { e.target.style.borderColor = "var(--accent-cyan)"; e.target.style.boxShadow = "0 0 0 4px rgba(0,255,194,0.08)"; };
const inB = (e) => { e.target.style.borderColor = "var(--border-medium)"; e.target.style.boxShadow = "none"; };

function CreateEmployee() {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", department_id: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try { const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/employee/departments`); setDepartments(res.data); }
    catch (err) { console.log(err); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/employee/employees`, formData);
      alert(res.data.message || "Employee created successfully");
      setFormData({ name: "", email: "", department_id: "" });
    } catch (err) {
      console.log(err); alert("Error adding employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", paddingBottom: "40px" }}>
      <div style={{ ...card, padding: "28px 32px", marginBottom: "24px", background: "linear-gradient(135deg, rgba(0,255,194,0.1) 0%, rgba(0,184,255,0.08) 100%)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Create Employee</h2>
          <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: "14px" }}>Add a new member to the organisation</p>
        </div>
        <div style={{ fontSize: "40px" }}>👤</div>
      </div>

      <div style={{ ...card, padding: "32px", maxWidth: "600px" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={labelSt}>Employee Name</label>
            <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} style={inputSt} onFocus={inF} onBlur={inB} required />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={labelSt}>Email Address</label>
            <input type="email" name="email" placeholder="john@company.com" value={formData.email} onChange={handleChange} style={inputSt} onFocus={inF} onBlur={inB} required />
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={labelSt}>Department</label>
            <select name="department_id" value={formData.department_id} onChange={handleChange} style={{ ...inputSt, cursor: "pointer", appearance: "none" }} onFocus={inF} onBlur={inB} required>
              <option value="" style={{ background: "var(--bg-card)" }}>Select Department</option>
              {departments.map((dept) => <option key={dept.id} value={dept.id} style={{ background: "var(--bg-card)" }}>{dept.department_name}</option>)}
            </select>
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", background: loading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-blue) 100%)",
            color: loading ? "var(--text-muted)" : "var(--bg-main)", border: "none", borderRadius: "50px", padding: "16px",
            fontSize: "15px", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 20px rgba(0,255,194,0.3)", transition: "transform 0.2s, box-shadow 0.2s"
          }}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,255,194,0.45)"; } }}
          onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,255,194,0.3)"; } }}
          >
            {loading ? "Adding..." : "Add Employee"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEmployee;