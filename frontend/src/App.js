import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";

// Existing pages
import LandingPage     from "./pages/LandingPage";
import Login           from "./pages/Login";
import Signup          from "./pages/Signup";
import Dashboard       from "./pages/Dashboard";
import EmployeeList    from "./pages/EmployeeList";
import CreateEmployee  from "./pages/CreateEmployee";
import EditEmployee    from "./pages/EditEmployee";
import DepartmentMaster from "./pages/DepartmentMaster";
import SkillsMaster    from "./pages/SkillsMaster";
import Profile         from "./pages/Profile";
import UploadFiles     from "./pages/UploadFiles";
import LeaveApplication from "./pages/LeaveApplication";
import LeaveApproval   from "./pages/LeaveApproval";
import HRApproval      from "./pages/HRApproval";
import AssetManagement from "./pages/AssetManagement";
import Notifications   from "./pages/Notifications";
import AuditTrail      from "./pages/AuditTrail";
import Reports         from "./pages/Reports";
import Layout          from "./components/Layout";

// Theme Context
export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

// Protected Route Wrapper
function ProtectedLayout() {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <BrowserRouter>
        <Routes>
          {/* ── Public ── */}
          <Route path="/"       element={<LandingPage />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ── Authenticated App Layout ── */}
          <Route element={<ProtectedLayout />}>
            {/* ── Core ── */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile"   element={<Profile />} />
            <Route path="/upload"    element={<UploadFiles />} />

            {/* ── Employee Management ── */}
            <Route path="/employees"        element={<EmployeeList />} />
            <Route path="/create-employee"  element={<CreateEmployee />} />
            <Route path="/edit-employee/:id" element={<EditEmployee />} />
            <Route path="/edit-employee"    element={<EditEmployee />} />

            {/* ── Masters ── */}
            <Route path="/departments" element={<DepartmentMaster />} />
            <Route path="/skills"      element={<SkillsMaster />} />

            {/* ── Leave Management ── */}
            <Route path="/apply-leave"    element={<LeaveApplication />} />
            <Route path="/leave-approval" element={<LeaveApproval />} />
            <Route path="/hr-approval"    element={<HRApproval />} />

            {/* ── Enterprise Features ── */}
            <Route path="/assets"        element={<AssetManagement />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/audit"         element={<AuditTrail />} />
            <Route path="/reports"       element={<Reports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}

export default App;