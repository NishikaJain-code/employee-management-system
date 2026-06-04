import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import EmployeeList from "./pages/EmployeeList";
import CreateEmployee from "./pages/CreateEmployee";
import EditEmployee from "./pages/EditEmployee";
import DepartmentMaster from "./pages/DepartmentMaster";
import SkillsMaster from "./pages/SkillsMaster";
import Profile from "./pages/Profile";
import UploadFiles from "./pages/UploadFiles";
import LeaveApplication from "./pages/LeaveApplication";
import LeaveApproval from "./pages/LeaveApproval";
import HRApproval from "./pages/HRApproval";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/employees" element={<EmployeeList />} />

        <Route path="/create-employee" element={<CreateEmployee />} />

        <Route path="/edit-employee" element={<EditEmployee />} />

        <Route path="/departments" element={<DepartmentMaster />} />

        <Route path="/skills" element={<SkillsMaster />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/upload" element={<UploadFiles />} />
        <Route
  path="/leave-approval"
  element={<LeaveApproval />}
/>
        <Route
  path="/apply-leave"
  element={<LeaveApplication />}
/>
<Route
  path="/hr-approval"
  element={<HRApproval />}
/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;