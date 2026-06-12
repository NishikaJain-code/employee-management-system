import React, { useEffect, useState, useContext } from "react";
import { Search, Bell, LogOut, Sun, Moon } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { ThemeContext } from "../App";

function Topbar({ user }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/api/notifications/unread-count");
      setUnreadCount(res.data.count || 0);
    } catch (err) {}
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header style={{
      height: "72px",
      background: "rgba(5, 7, 10, 0.8)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderBottom: "1px solid var(--border-light)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px",
      position: "sticky",
      top: 0,
      zIndex: 900,
      fontFamily: "'Outfit', sans-serif",
    }}>
      
      {/* Search */}
      <div style={{ position: "relative", width: "380px" }}>
        <Search size={16} color="#4a5568" style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        <input 
          type="text" 
          placeholder="Search anything..." 
          style={{
            width: "100%",
            padding: "11px 18px 11px 46px",
            background: "var(--bg-input)",
            border: "1px solid var(--border-medium)",
            borderRadius: "50px",
            outline: "none",
            fontSize: "14px",
            color: "var(--text-primary)",
            transition: "all 0.3s ease",
            boxSizing: "border-box",
            fontFamily: "'Outfit', sans-serif"
          }}
          onFocus={(e) => { 
            e.currentTarget.style.background = "var(--border-medium)"; 
            e.currentTarget.style.borderColor = "var(--accent-cyan)"; 
            e.currentTarget.style.boxShadow = "0 0 0 4px rgba(0, 255, 194, 0.08)"; 
          }}
          onBlur={(e) => { 
            e.currentTarget.style.background = "var(--bg-input)"; 
            e.currentTarget.style.borderColor = "var(--border-medium)"; 
            e.currentTarget.style.boxShadow = "none"; 
          }}
        />
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

        {/* Notification Bell */}
        <div 
          style={{ 
            position: "relative", cursor: "pointer", 
            width: "42px", height: "42px",
            background: "var(--bg-input)",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--border-medium)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg-input)"}
        >
          <Bell size={18} color="var(--text-muted)" />
          {unreadCount > 0 && (
            <span style={{
              position: "absolute", top: "1px", right: "1px",
              background: "var(--accent-pink)",
              color: "var(--text-primary)", width: "16px", height: "16px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "9px", fontWeight: "800",
              boxShadow: "0 0 8px rgba(255, 0, 229, 0.6)"
            }}>
              {unreadCount}
            </span>
          )}
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          style={{
            background: "var(--bg-input)",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: "50%",
            width: "42px", height: "42px",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-primary)",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--border-medium)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg-input)"}
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Divider */}
        <div style={{ width: "1px", height: "32px", background: "var(--border-medium)" }} />

        {/* User Info + Avatar */}
        <Link to="/profile" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", lineHeight: 1.2 }}>
              {user?.name || "User"}
            </div>
            <div style={{ fontSize: "12px", color: "var(--accent-cyan)", textTransform: "capitalize", fontWeight: "600" }}>
              {user?.role}
            </div>
          </div>
          <div style={{ 
            width: "42px", height: "42px", 
            background: "linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)", 
            borderRadius: "50%", 
            display: "flex", alignItems: "center", justifyContent: "center", 
            color: "var(--text-primary)", fontWeight: "800", fontSize: "15px",
            boxShadow: "0 0 16px rgba(123, 97, 255, 0.35)",
            flexShrink: 0
          }}>
            {user?.name?.substring(0, 2).toUpperCase() || "U"}
          </div>
        </Link>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          style={{
            background: "rgba(255, 61, 113, 0.08)",
            border: "1px solid rgba(255, 61, 113, 0.2)",
            borderRadius: "50%",
            width: "42px", height: "42px",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--accent-red)",
            transition: "all 0.25s ease"
          }}
          onMouseEnter={(e) => { 
            e.currentTarget.style.background = "var(--accent-red)"; 
            e.currentTarget.style.color = "#fff"; 
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 61, 113, 0.4)"; 
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.background = "rgba(255, 61, 113, 0.08)"; 
            e.currentTarget.style.color = "var(--accent-red)"; 
            e.currentTarget.style.boxShadow = "none"; 
          }}
          title="Logout"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}

export default Topbar;
