import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../App";
import { Sun, Moon, ArrowRight, Shield, Zap, Users } from "lucide-react";

function LandingPage() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "var(--bg-main)", 
      color: "var(--text-primary)", 
      fontFamily: "'Outfit', sans-serif",
      display: "flex",
      flexDirection: "column",
      transition: "background 0.3s ease, color 0.3s ease"
    }}>
      
      {/* Navbar */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "24px 48px",
        borderBottom: "1px solid var(--border-light)",
        backdropFilter: "blur(10px)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ 
            width: "40px", height: "40px", 
            background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))",
            borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: "900", fontSize: "18px"
          }}>IS</div>
          <span style={{ fontSize: "20px", fontWeight: "800", letterSpacing: "-0.5px" }}>HRMS<span style={{ color: "var(--accent-cyan)" }}>Pro</span></span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <button onClick={toggleTheme} style={{
            background: "transparent", border: "none", cursor: "pointer", 
            color: "var(--text-secondary)", display: "flex", alignItems: "center"
          }}>
            {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <Link to="/login" style={{ textDecoration: "none", color: "var(--text-primary)", fontWeight: "600", fontSize: "15px" }}>Log In</Link>
          <Link to="/signup" style={{
            background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))",
            color: "#fff", padding: "10px 24px", borderRadius: "50px", textDecoration: "none",
            fontWeight: "700", fontSize: "15px", boxShadow: "0 4px 14px rgba(0, 184, 255, 0.4)"
          }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 20px" }}>
        
        {/* Glow Orb Background (Only visible in dark mode, subtle in light) */}
        <div style={{
          position: "absolute", top: "20%", left: "50%", transform: "translate(-50%, -50%)",
          width: "600px", height: "600px", borderRadius: "50%",
          background: theme === "dark" ? "radial-gradient(circle, rgba(0, 184, 255, 0.15) 0%, transparent 70%)" : "radial-gradient(circle, rgba(0, 184, 255, 0.05) 0%, transparent 70%)",
          zIndex: 0, pointerEvents: "none"
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "800px" }}>
          <h1 style={{ fontSize: "64px", fontWeight: "900", lineHeight: "1.1", marginBottom: "24px", letterSpacing: "-1px" }}>
            The Future of <span style={{ color: "var(--accent-cyan)" }}>Enterprise</span> HR Management
          </h1>
          <p style={{ fontSize: "20px", color: "var(--text-secondary)", marginBottom: "48px", maxWidth: "600px", margin: "0 auto 48px auto", lineHeight: "1.6" }}>
            Streamline your workforce, manage assets, and track leave approvals in a beautifully designed, state-of-the-art platform.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px" }}>
            <Link to="/signup" style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: "var(--text-primary)", color: "var(--bg-main)",
              padding: "16px 32px", borderRadius: "50px", textDecoration: "none",
              fontWeight: "800", fontSize: "16px", transition: "transform 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <Link to="/login" style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: "var(--bg-input)", color: "var(--text-primary)",
              border: "1px solid var(--border-medium)",
              padding: "16px 32px", borderRadius: "50px", textDecoration: "none",
              fontWeight: "700", fontSize: "16px", transition: "background 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--border-medium)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--bg-input)"}
            >
              Log into Workspace
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div style={{ display: "flex", gap: "24px", marginTop: "80px", position: "relative", zIndex: 1, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { icon: <Users color="var(--accent-purple)" size={32} />, title: "Employee Directory", desc: "Manage profiles, skills, and organizational charts easily." },
            { icon: <Shield color="var(--accent-cyan)" size={32} />, title: "Secure Data", desc: "Enterprise-grade security with advanced role-based access." },
            { icon: <Zap color="var(--accent-yellow)" size={32} />, title: "Real-time Audits", desc: "Track every single action with a detailed audit trail system." }
          ].map((feature, idx) => (
            <div key={idx} style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-medium)",
              padding: "32px", borderRadius: "24px", width: "280px", textAlign: "left",
              boxShadow: "var(--shadow-lg)", transition: "transform 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ background: "var(--bg-input)", width: "64px", height: "64px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                {feature.icon}
              </div>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "20px", fontWeight: "700" }}>{feature.title}</h3>
              <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: "1.5", fontSize: "15px" }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}

export default LandingPage;
