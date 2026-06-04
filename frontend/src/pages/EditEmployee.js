import { useState } from "react";
import axios from "axios";

function EditEmployee() {

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const updateEmployee = async () => {

    try {

      await axios.put(
        `http://localhost:5000/api/employee/employees/${id}`,
        {
          name,
          email,
          department_id: departmentId,
        }
      );

      alert("Employee Updated");

    } catch (err) {

      console.log(err);

      alert("Error Updating Employee");

    }

  };

  return (
    <div style={{ padding: "20px" }}>

      <h2>Edit Employee</h2>

      <input
        type="number"
        placeholder="Employee ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Employee Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="number"
        placeholder="Department ID"
        value={departmentId}
        onChange={(e) => setDepartmentId(e.target.value)}
      />

      <br /><br />

      <button onClick={updateEmployee}>
        Update Employee
      </button>

    </div>
  );
}

export default EditEmployee;