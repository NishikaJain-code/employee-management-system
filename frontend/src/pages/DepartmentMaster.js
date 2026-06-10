import { useEffect, useState } from "react";
import api from "../utils/api";

function DepartmentMaster() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    getDepartments();
  }, []);

  const getDepartments = async () => {
    try {
      const res = await api.get("/api/departments");
      setDepartments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const addDepartment = async () => {
    try {
      await api.post("/api/departments", { department_name: name });
      alert("Department Added");
      setName("");
      getDepartments();
    } catch (err) {
      console.log(err);
      console.log(err.response);
      alert(
        err.response?.data?.message ||
        err.message ||
        "Error Adding Department"
      );
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Department Master</h2>
      <input
        type="text"
        placeholder="Department Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={addDepartment}>
        Add Department
      </button>
      <hr />
      {departments.map((dept) => (
        <p key={dept.id}>
          {dept.id} - {dept.department_name || dept.name}
        </p>
      ))}
    </div>
  );
}

export default DepartmentMaster;