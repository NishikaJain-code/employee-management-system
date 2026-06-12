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

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) { setErrorMsg("Please fill in all fields."); return; }
    try {
      setLoading(true); setErrorMsg("");
      const res = await axios.post(`${BASEURL}/api/auth/login`, formData);
      const token = res.data.data?.token || res.data.token;
      const user = res.data.data?.user || res.data.user;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      minHeight: "100vh", background: "var(--bg-main)",
      fontFamily: "'Outfit', sans-serif", position: "relative", overflow: "hidden"
    }}>
      {/* Background glow orbs */}
      <div style={{ position: "absolute", top: "-150px", left: "-100px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(0,255,194,0.1) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-100px", right: "-100px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(0,184,255,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{
        background: "var(--bg-card)",
        backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
        borderRadius: "32px", padding: "48px 44px",
        width: "100%", maxWidth: "420px",
        boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
        border: "1px solid var(--border-medium)",
        textAlign: "center", position: "relative", zIndex: 1
      }}>
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
          <div style={{
            width: "52px", height: "52px",
            background: "linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-blue) 100%)",
            borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--bg-main)", fontWeight: "900", fontSize: "18px",
            boxShadow: "0 0 24px rgba(0,255,194,0.35)"
          }}>IS</div>
        </div>

        <h1 style={{ margin: "0 0 8px", fontSize: "30px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>Welcome Back</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "0 0 32px", fontWeight: 500 }}>
          Log in to your HRMS workspace
        </p>

        {errorMsg && (
          <div style={{
            background: "rgba(255,61,113,0.1)", color: "var(--accent-red)",
            border: "1px solid rgba(255,61,113,0.2)", borderRadius: "12px",
            padding: "12px 16px", fontSize: "13px", fontWeight: 600,
            marginBottom: "24px", textAlign: "left"
          }}>⚠️ {errorMsg}</div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Email Address</label>
            <input type="email" name="email" placeholder="name@company.com"
              value={formData.email} onChange={handleChange} style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent-cyan)"; e.target.style.boxShadow = "0 0 0 4px rgba(0,255,194,0.08)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border-medium)"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div style={{ marginBottom: "32px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Password</label>
            <input type="password" name="password" placeholder="••••••••"
              value={formData.password} onChange={handleChange} style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent-cyan)"; e.target.style.boxShadow = "0 0 0 4px rgba(0,255,194,0.08)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border-medium)"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <button type="submit" disabled={loading} style={{
            width: "100%",
            background: loading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-blue) 100%)",
            color: loading ? "var(--text-muted)" : "var(--bg-main)",
            border: "none", borderRadius: "50px", padding: "16px",
            fontSize: "15px", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 20px rgba(0,255,194,0.3)",
            transition: "transform 0.2s, box-shadow 0.2s", fontFamily: "'Outfit', sans-serif",
            letterSpacing: "0.3px"
          }}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,255,194,0.45)"; } }}
          onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,255,194,0.3)"; } }}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <div style={{ marginTop: "32px", height: "1px", background: "rgba(255,255,255,0.06)" }} />
        <p style={{ marginTop: "24px", fontSize: "14px", color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "var(--accent-cyan)", fontWeight: 700, textDecoration: "none" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-blue)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--accent-cyan)"}
          >Create account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;