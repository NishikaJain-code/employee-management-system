import { BrowserRouter, Routes, Route } from "react-router-dom";

// Existing pages
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

// Phase 5 — Enterprise Feature Pages
import AssetManagement from "./pages/AssetManagement";
import Notifications   from "./pages/Notifications";
import AuditTrail      from "./pages/AuditTrail";
import Reports         from "./pages/Reports";
import Navbar          from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>

        {/* ── Authentication ── */}
        <Route path="/"       element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ── Core ── */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile"   element={<Profile />} />
        <Route path="/upload"    element={<UploadFiles />} />

        {/* ── Employee Management ── */}
        <Route path="/employees"        element={<EmployeeList />} />
        <Route path="/create-employee"  element={<CreateEmployee />} />
        <Route path="/edit-employee"    element={<EditEmployee />} />

        {/* ── Masters ── */}
        <Route path="/departments" element={<DepartmentMaster />} />
        <Route path="/skills"      element={<SkillsMaster />} />

        {/* ── Leave Management ── */}
        <Route path="/apply-leave"    element={<LeaveApplication />} />
        <Route path="/leave-approval" element={<LeaveApproval />} />
        <Route path="/hr-approval"    element={<HRApproval />} />

        {/* ── Phase 5: Enterprise Features ── */}
        <Route path="/assets"        element={<AssetManagement />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/audit"         element={<AuditTrail />} />
        <Route path="/reports"       element={<Reports />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;