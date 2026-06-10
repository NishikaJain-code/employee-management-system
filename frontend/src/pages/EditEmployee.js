import { useState, useEffect } from "react";
import api from "../utils/api";

function EditEmployee() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [designation, setDesignation] = useState("");
  const [salary, setSalary] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  
  const [currentUserRole, setCurrentUserRole] = useState("employee");

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user && user.role) {
        setCurrentUserRole(user.role);
      }
    } catch (e) {}
  }, []);

  const fetchEmployee = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/api/employees/${id}`);
      const emp = res.data;
      if (emp) {
        setName(emp.name || "");
        setEmail(emp.email || "");
        setDepartmentId(emp.department_id || "");
        setDesignation(emp.designation || "");
        setSalary(emp.salary || "");
        if (emp.joining_date || emp.created_at) {
          setJoiningDate(new Date(emp.joining_date || emp.created_at).toISOString().split('T')[0]);
        }
      }
    } catch (err) {
      console.log("Error fetching employee:", err);
      alert("Employee not found");
    }
  };

  const updateEmployee = async () => {
    try {
      const payload = {
        name,
        email,
        department_id: departmentId ? parseInt(departmentId) : null,
        designation,
        salary: salary ? parseFloat(salary) : null,
        joining_date: joiningDate || null
      };

      await api.put(`/api/employees/${id}`, payload);

      alert("Employee Updated Successfully");
    } catch (err) {
      console.log(err);
      alert("Error Updating Employee");
    }
  };

  const isEmployee = currentUserRole === "employee";

  return (
    <div style={{ padding: "20px" }}>
      <h2>Edit Employee</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="number"
          placeholder="Employee ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <button onClick={fetchEmployee}>Fetch Details</button>
      </div>

      <input
        type="text"
        placeholder="Employee Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isEmployee}
      />
      <br /><br />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isEmployee}
      />
      <br /><br />

      <input
        type="number"
        placeholder="Department ID"
        value={departmentId}
        onChange={(e) => setDepartmentId(e.target.value)}
        disabled={isEmployee}
      />
      <br /><br />

      <input
        type="text"
        placeholder="Designation"
        value={designation}
        onChange={(e) => setDesignation(e.target.value)}
        disabled={isEmployee}
      />
      <br /><br />

      <input
        type="number"
        placeholder="Salary"
        value={salary}
        onChange={(e) => setSalary(e.target.value)}
        disabled={isEmployee}
      />
      <br /><br />

      <input
        type="date"
        placeholder="Joining Date"
        value={joiningDate}
        onChange={(e) => setJoiningDate(e.target.value)}
        disabled={isEmployee}
      />
      <br /><br />

      <button onClick={updateEmployee} disabled={isEmployee}>
        Update Employee
      </button>
    </div>
  );
}

export default EditEmployee;