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
    
    // Employee
    ...(user?.role === "employee" ? [
      { name: "Apply Leave", path: "/apply-leave", icon: <FileCheck size={18} /> }
    ] : []),

    // Manager / HR / Admin
    ...(isManager || isAdminOrHr ? [
      { name: "Manager Approvals", path: "/leave-approval", icon: <ShieldCheck size={18} /> }
    ] : []),

    // Admin / HR
    ...(isAdminOrHr ? [
      { name: "HR Approvals", path: "/hr-approval", icon: <ShieldCheck size={18} /> },
      { name: "Employees", path: "/employees", icon: <Users size={18} /> },
      { name: "Departments", path: "/departments", icon: <Briefcase size={18} /> },
      { name: "Skills", path: "/skills", icon: <Database size={18} /> },
      { name: "Audit Trail", path: "/audit", icon: <ClipboardList size={18} /> },
    ] : []),

    { name: "Assets", path: "/assets", icon: <Box size={18} /> },

    // Reports
    ...(isAdminOrHr || isManager ? [
      { name: "Reports", path: "/reports", icon: <BarChart3 size={18} /> }
    ] : []),
  ];

  return (
    <aside style={{
      width: "280px",
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
      fontFamily: "'Outfit', sans-serif"
    }}>
      <div style={{ padding: "32px 24px", display: "flex", alignItems: "center", gap: "16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ 
          width: "40px", height: "40px", 
          background: "linear-gradient(135deg, #00FFC2 0%, #00B8FF 100%)", 
          borderRadius: "12px", 
          display: "flex", alignItems: "center", justifyContent: "center", 
          color: "#080B13", fontWeight: "800", fontSize: "16px",
          boxShadow: "0 4px 15px rgba(0, 255, 194, 0.3)"
        }}>
          IS
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: "800", fontSize: "18px", letterSpacing: "0.5px" }}>i-SOFTZONE</div>
          <div style={{ fontSize: "12px", color: "#00FFC2", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase" }}>Enterprise HRMS</div>
        </div>
      </div>

      <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto" }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 18px",
                textDecoration: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: isActive ? "700" : "500",
                color: isActive ? "#fff" : "#64748b",
                background: isActive ? "rgba(0, 255, 194, 0.1)" : "transparent",
                borderLeft: isActive ? "4px solid #00FFC2" : "4px solid transparent",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: isActive ? "inset 2px 0 10px rgba(0, 255, 194, 0.05)" : "none"
              }}
              onMouseEnter={(e) => { 
                if (!isActive) { 
                  e.currentTarget.style.color = "#e2e8f0"; 
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)"; 
                  e.currentTarget.style.transform = "translateX(4px)";
                } 
              }}
              onMouseLeave={(e) => { 
                if (!isActive) { 
                  e.currentTarget.style.color = "#64748b"; 
                  e.currentTarget.style.background = "transparent"; 
                  e.currentTarget.style.transform = "translateX(0px)";
                } 
              }}
            >
              <span style={{ 
                color: isActive ? "#00FFC2" : "inherit",
                transition: "transform 0.3s ease",
                transform: isActive ? "scale(1.1)" : "scale(1)"
              }}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </div>
      
      <div style={{ marginTop: "auto", padding: "24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ 
          display: "flex", alignItems: "center", gap: "12px", padding: "16px", 
          background: "rgba(0, 255, 194, 0.05)", borderRadius: "14px",
          border: "1px solid rgba(0, 255, 194, 0.1)"
        }}>
           <ShieldCheck size={20} color="#00FFC2"/>
           <div>
             <div style={{ fontSize: "13px", fontWeight: "700", color: "#f8fafc" }}>SECURE CLOUD</div>
             <div style={{ fontSize: "11px", color: "#00B8FF", textTransform: "uppercase", marginTop: "2px", fontWeight: "600", letterSpacing: "0.5px" }}>
               {user?.role} Access
             </div>
           </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
