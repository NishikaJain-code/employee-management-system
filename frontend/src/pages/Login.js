import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #6c63ff 0%, #4facfe 100%)",
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    }}>
      <div style={{
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(16px)",
        borderRadius: "24px",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚀</div>
        <h1 style={{
          margin: "0 0 8px 0",
          fontSize: "28px",
          fontWeight: 800,
          background: "linear-gradient(135deg, #6c63ff 0%, #4facfe 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Welcome Back
        </h1>
        <p style={{ color: "#718096", fontSize: "14px", margin: "0 0 32px 0", fontWeight: 500 }}>
          Log in to manage your workspace and leaves
        </p>

        {errorMsg && (
          <div style={{
            background: "#fff5f5",
            color: "#e53e3e",
            border: "1px solid #fed7d7",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "24px",
            textAlign: "left"
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#4a5568"
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "1.5px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#6c63ff";
                e.target.style.boxShadow = "0 0 0 3px rgba(108, 99, 255, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#4a5568"
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "1.5px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#6c63ff";
                e.target.style.boxShadow = "0 0 0 3px rgba(108, 99, 255, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "#a0aec0" : "linear-gradient(135deg, #6c63ff 0%, #4facfe 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "16px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 15px rgba(108, 99, 255, 0.3)",
              transition: "transform 0.1s, opacity 0.2s",
            }}
            onMouseEnter={(e) => { if(!loading) e.currentTarget.style.opacity = 0.95; }}
            onMouseLeave={(e) => { if(!loading) e.currentTarget.style.opacity = 1; }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ marginTop: "32px", fontSize: "14px", color: "#718096" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{
            color: "#6c63ff",
            fontWeight: 700,
            textDecoration: "none",
            transition: "color 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#4facfe"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#6c63ff"}
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;