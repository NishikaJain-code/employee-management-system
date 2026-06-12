import React, { useEffect, useState } from "react";
import { Search, Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function Topbar({ user }) {
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header style={{
      height: "76px",
      background: "rgba(11, 15, 25, 0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px",
      position: "sticky",
      top: 0,
      zIndex: 999,
      fontFamily: "'Outfit', sans-serif"
    }}>
      <div style={{ position: "relative", width: "420px" }}>
        <Search size={18} color="#94a3b8" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
        <input 
          type="text" 
          placeholder="Search employees, leaves, assets..." 
          style={{
            width: "100%",
            padding: "12px 16px 12px 46px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "14px",
            outline: "none",
            fontSize: "14px",
            color: "#f8fafc",
            fontWeight: "400",
            transition: "all 0.3s ease"
          }}
          onFocus={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"; e.currentTarget.style.borderColor = "#00FFC2"; e.currentTarget.style.boxShadow = "0 0 10px rgba(0, 255, 194, 0.2)"; }}
          onBlur={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"; e.currentTarget.style.boxShadow = "none"; }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <div style={{ position: "relative", cursor: "pointer" }}>
          <Bell size={20} color="#4a5568" />
          {unreadCount > 0 && (
            <span style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "#e53e3e",
              color: "#fff",
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "9px",
              fontWeight: "bold"
            }}>
              {unreadCount}
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", background: "#ed8936", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold" }}>
            {user?.name?.substring(0, 2).toUpperCase() || "U"}
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#2d3748" }}>{user?.name}</div>
            <div style={{ fontSize: "12px", color: "#718096", textTransform: "capitalize" }}>{user?.role}</div>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: "#718096"
          }}
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}

export default Topbar;
