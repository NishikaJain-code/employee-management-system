import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../utils/api";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  let userObj = {};
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      userObj = JSON.parse(storedUser);
    }
  } catch(e) {}
  const user = userObj;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetchUnreadCount();
      // Poll notifications count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/api/notifications/unread-count");
      setUnreadCount(res.data.count || 0);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!token || location.pathname === "/" || location.pathname === "/signup") return null;

  const isAdminOrHr = user.role === "admin" || user.role === "hr";
  const isManager = user.role === "manager";

  return (
    <nav style={{
      background: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid rgba(108, 99, 255, 0.1)",
      padding: "16px 32px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      boxShadow: "0 4px 30px rgba(0, 0, 0, 0.03)",
      fontFamily: "'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "22px" }}>🚀</span>
        <span style={{
          fontWeight: 800,
          fontSize: "20px",
          background: "linear-gradient(135deg, #6c63ff 0%, #4facfe 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "0.5px"
        }}>
          Enterprise HRMS
        </span>
      </div>

      {/* Nav Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
        <Link to="/profile" style={linkStyle}>Profile</Link>
        <Link to="/upload" style={linkStyle}>Documents</Link>

        {/* Employee specific */}
        {user.role === "employee" && (
          <Link to="/apply-leave" style={linkStyle}>Apply Leave</Link>
        )}

        {/* Manager/HR/Admin specific leave approvals */}
        {(isManager || isAdminOrHr) && (
          <Link to="/leave-approval" style={linkStyle}>Manager Approvals</Link>
        )}

        {isAdminOrHr && (
          <>
            <Link to="/hr-approval" style={linkStyle}>HR Approvals</Link>
            <Link to="/employees" style={linkStyle}>Employees</Link>
            <Link to="/departments" style={linkStyle}>Departments</Link>
            <Link to="/skills" style={linkStyle}>Skills</Link>
            <Link to="/audit" style={linkStyle}>Audit Trail</Link>
          </>
        )}

        {/* Assets (Admin/HR manage, employees view) */}
        <Link to="/assets" style={linkStyle}>Assets</Link>

        {/* Reports (Admin/HR/Manager) */}
        {(isAdminOrHr || isManager) && (
          <Link to="/reports" style={linkStyle}>Reports</Link>
        )}

        {/* Notifications Bell */}
        <Link to="/notifications" style={{ ...linkStyle, position: "relative", display: "flex", alignItems: "center" }}>
          🔔
          {unreadCount > 0 && (
            <span style={{
              position: "absolute",
              top: "-8px",
              right: "-10px",
              background: "#ff4d4f",
              color: "#fff",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "10px",
              fontWeight: "bold",
              boxShadow: "0 2px 8px rgba(255, 77, 79, 0.4)"
            }}>
              {unreadCount}
            </span>
          )}
        </Link>
      </div>

      {/* User Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 600, fontSize: "14px", color: "#333" }}>{user.name}</div>
          <div style={{
            fontSize: "11px",
            color: "#6c63ff",
            background: "#eef2ff",
            padding: "2px 8px",
            borderRadius: "12px",
            display: "inline-block",
            marginTop: "2px",
            textTransform: "uppercase",
            fontWeight: "bold"
          }}>
            {user.role}
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            padding: "10px 18px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(255, 77, 79, 0.2)",
            transition: "transform 0.1s, opacity 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

const linkStyle = {
  textDecoration: "none",
  color: "#4a5568",
  fontSize: "14px",
  fontWeight: 600,
  transition: "color 0.2s",
  cursor: "pointer",
};

// Add interactive hover styling dynamically
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll("nav a");
  links.forEach(l => {
    l.addEventListener("mouseenter", () => l.style.color = "#6c63ff");
    l.addEventListener("mouseleave", () => l.style.color = "#4a5568");
  });
});

export default Navbar;
