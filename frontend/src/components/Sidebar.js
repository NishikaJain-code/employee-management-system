import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Users, UserCircle, Upload, 
  FileCheck, ShieldCheck, Database, Briefcase, 
  ClipboardList, Activity, Box, BarChart3, Bell
} from "lucide-react";

function Sidebar({ user }) {
  const location = useLocation();
  const isAdminOrHr = user?.role === "admin" || user?.role === "hr";
  const isManager = user?.role === "manager";

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Profile", path: "/profile", icon: <UserCircle size={18} /> },
    { name: "Documents", path: "/upload", icon: <Upload size={18} /> },
    
    ...(user?.role === "employee" ? [
      { name: "Apply Leave", path: "/apply-leave", icon: <FileCheck size={18} /> }
    ] : []),

    ...(isManager || isAdminOrHr ? [
      { name: "Manager Approvals", path: "/leave-approval", icon: <ShieldCheck size={18} /> }
    ] : []),

    ...(isAdminOrHr ? [
      { name: "HR Approvals", path: "/hr-approval", icon: <ShieldCheck size={18} /> },
      { name: "Employees", path: "/employees", icon: <Users size={18} /> },
      { name: "Departments", path: "/departments", icon: <Briefcase size={18} /> },
      { name: "Skills", path: "/skills", icon: <Database size={18} /> },
      { name: "Audit Trail", path: "/audit", icon: <ClipboardList size={18} /> },
    ] : []),

    { name: "Assets", path: "/assets", icon: <Box size={18} /> },

    ...(isAdminOrHr || isManager ? [
      { name: "Reports", path: "/reports", icon: <BarChart3 size={18} /> }
    ] : []),
  ];

  // Group nav items visually
  const sections = [
    { label: "Main", items: navItems.slice(0, 3) },
    { label: "Workflow", items: navItems.slice(3, navItems.length - 2) },
    { label: "Data", items: navItems.slice(navItems.length - 2) },
  ].filter(s => s.items.length > 0);

  return (
    <aside style={{
      width: "260px",
      background: "#080B13",
      borderRight: "1px solid rgba(255, 255, 255, 0.05)",
      color: "#94a3b8",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 1000,
      fontFamily: "'Outfit', sans-serif",
      overflowY: "auto"
    }}>
      {/* Logo */}
      <div style={{ padding: "28px 20px 24px", display: "flex", alignItems: "center", gap: "14px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
        <div style={{ 
          width: "38px", height: "38px", 
          background: "linear-gradient(135deg, #00FFC2 0%, #00B8FF 100%)", 
          borderRadius: "12px", 
          display: "flex", alignItems: "center", justifyContent: "center", 
          color: "#080B13", fontWeight: "900", fontSize: "14px",
          boxShadow: "0 0 20px rgba(0, 255, 194, 0.25)",
          flexShrink: 0
        }}>
          IS
        </div>
        <div>
          <div style={{ color: "#f1f5f9", fontWeight: "800", fontSize: "17px", letterSpacing: "0.3px", lineHeight: 1.1 }}>i-SOFTZONE</div>
          <div style={{ fontSize: "11px", color: "#00FFC2", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: "3px" }}>Enterprise HRMS</div>
        </div>
      </div>

      {/* Nav Sections */}
      <div style={{ padding: "20px 12px", display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "11px 16px",
                textDecoration: "none",
                borderRadius: "50px",   // PILL SHAPE — not rectangle
                fontSize: "14px",
                fontWeight: isActive ? "700" : "500",
                color: isActive ? "#080B13" : "#64748b",
                background: isActive 
                  ? "linear-gradient(135deg, #00FFC2 0%, #00B8FF 100%)"
                  : "transparent",
                boxShadow: isActive ? "0 4px 16px rgba(0, 255, 194, 0.25)" : "none",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => { 
                if (!isActive) { 
                  e.currentTarget.style.color = "#e2e8f0"; 
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)"; 
                } 
              }}
              onMouseLeave={(e) => { 
                if (!isActive) { 
                  e.currentTarget.style.color = "#64748b"; 
                  e.currentTarget.style.background = "transparent"; 
                } 
              }}
            >
              <span style={{ 
                flexShrink: 0,
                color: isActive ? "#080B13" : "#64748b",
              }}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </div>
      
      {/* Footer Badge */}
      <div style={{ padding: "16px 12px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
        <div style={{ 
          display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", 
          background: "rgba(0, 255, 194, 0.04)", 
          borderRadius: "20px",
          border: "1px solid rgba(0, 255, 194, 0.08)"
        }}>
          <div style={{
            width: "32px", height: "32px",
            background: "linear-gradient(135deg, #7B61FF 0%, #00B8FF 100%)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: "800", fontSize: "13px",
            flexShrink: 0,
            boxShadow: "0 0 12px rgba(123, 97, 255, 0.3)"
          }}>
            {user?.name?.substring(0, 2).toUpperCase() || "U"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name || "User"}
            </div>
            <div style={{ fontSize: "11px", color: "#00FFC2", fontWeight: "600", textTransform: "capitalize" }}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
