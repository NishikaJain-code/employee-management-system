import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const BASEURL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const inputStyle = {
  width: "100%", padding: "14px 18px",
  background: "var(--bg-input)",
  border: "1px solid var(--border-medium)",
  borderRadius: "14px", fontSize: "14px",
  boxSizing: "border-box", outline: "none",
  color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "employee" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) { setErrorMsg("All fields are required."); return; }
    try {
      setLoading(true); setErrorMsg(""); setSuccessMsg("");
      const res = await axios.post(`${BASEURL}/api/auth/signup`, formData);
      setSuccessMsg(res.data.message || "Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to sign up. Email might already be in use.");
    } finally {
      setLoading(false);
    }
  };

  const inputFocus = (e) => { e.target.style.borderColor = "var(--accent-cyan)"; e.target.style.boxShadow = "0 0 0 4px rgba(0,255,194,0.08)"; };
  const inputBlur = (e) => { e.target.style.borderColor = "var(--border-medium)"; e.target.style.boxShadow = "none"; };

  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      minHeight: "100vh", background: "var(--bg-main)",
      fontFamily: "'Outfit', sans-serif", position: "relative", overflow: "hidden"
    }}>
      <div style={{ position: "absolute", top: "-100px", right: "-80px", width: "450px", height: "450px", background: "radial-gradient(circle, rgba(123,97,255,0.1) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: "380px", height: "380px", background: "radial-gradient(circle, rgba(0,255,194,0.07) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{
        background: "var(--bg-card)",
        backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
        borderRadius: "32px", padding: "48px 44px",
        width: "100%", maxWidth: "420px",
        boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
        border: "1px solid var(--border-medium)",
        textAlign: "center", position: "relative", zIndex: 1
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
          <div style={{
            width: "52px", height: "52px",
            background: "linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)",
            borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: "900", fontSize: "18px",
            boxShadow: "0 0 24px rgba(123,97,255,0.35)"
          }}>IS</div>
        </div>

        <h1 style={{ margin: "0 0 8px", fontSize: "30px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>Create Account</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "0 0 32px", fontWeight: 500 }}>
          Join the enterprise portal in seconds
        </p>

        {errorMsg && (
          <div style={{ background: "rgba(255,61,113,0.1)", color: "var(--accent-red)", border: "1px solid rgba(255,61,113,0.2)", borderRadius: "12px", padding: "12px 16px", fontSize: "13px", fontWeight: 600, marginBottom: "24px", textAlign: "left" }}>
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ background: "rgba(0,255,194,0.08)", color: "var(--accent-cyan)", border: "1px solid rgba(0,255,194,0.2)", borderRadius: "12px", padding: "12px 16px", fontSize: "13px", fontWeight: 600, marginBottom: "24px", textAlign: "left" }}>
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
          {[
            { label: "Full Name", name: "name", type: "text", placeholder: "John Doe" },
            { label: "Email Address", name: "email", type: "email", placeholder: "name@company.com" },
            { label: "Password", name: "password", type: "password", placeholder: "••••••••" },
          ].map((field) => (
            <div key={field.name} style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>{field.label}</label>
              <input type={field.type} name={field.name} placeholder={field.placeholder}
                value={formData[field.name]} onChange={handleChange} style={inputStyle}
                onFocus={inputFocus} onBlur={inputBlur}
              />
            </div>
          ))}

          <div style={{ marginBottom: "32px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Role</label>
            <select name="role" value={formData.role} onChange={handleChange} style={{
              ...inputStyle, cursor: "pointer",
              appearance: "none", WebkitAppearance: "none"
            }} onFocus={inputFocus} onBlur={inputBlur}>
              <option value="employee" style={{ background: "var(--bg-card)" }}>Employee</option>
              <option value="manager" style={{ background: "var(--bg-card)" }}>Manager</option>
              <option value="hr" style={{ background: "var(--bg-card)" }}>HR</option>
              <option value="admin" style={{ background: "var(--bg-card)" }}>Admin</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%",
            background: loading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)",
            color: loading ? "var(--text-muted)" : "#fff",
            border: "none", borderRadius: "50px", padding: "16px",
            fontSize: "15px", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 20px rgba(123,97,255,0.3)",
            transition: "transform 0.2s, box-shadow 0.2s", fontFamily: "'Outfit', sans-serif",
          }}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(123,97,255,0.45)"; } }}
          onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(123,97,255,0.3)"; } }}
          >
            {loading ? "Registering..." : "Create Account →"}
          </button>
        </form>

        <div style={{ marginTop: "32px", height: "1px", background: "rgba(255,255,255,0.06)" }} />
        <p style={{ marginTop: "24px", fontSize: "14px", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/" style={{ color: "var(--accent-cyan)", fontWeight: 700, textDecoration: "none" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-blue)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--accent-cyan)"}
          >Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;