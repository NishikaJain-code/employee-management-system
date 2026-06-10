import { useEffect, useState } from "react";
import api from "../utils/api";

function EmployeeList() {

  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/api/employees");
      setEmployees(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Employee List</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Salary</th>
            <th>Joining Date</th>
            <th>Skills</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.user_id}</td>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.department_name}</td>
              <td>{emp.designation || "-"}</td>
              <td>{emp.salary ? `$${emp.salary}` : "-"}</td>
              <td>{emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : "-"}</td>
              <td>{emp.skills ? emp.skills.map(s => s.skill_name).join(", ") : "-"}</td>
              <td>
                <button onClick={() => window.location.href = '/edit-employee'}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default EmployeeList;