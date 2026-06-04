import { useEffect, useState } from "react";
import axios from "axios";

function DepartmentMaster() {

  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    getDepartments();
  }, []);

  const getDepartments = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/employee/departments"
      );

      setDepartments(res.data);

    } catch (err) {

      console.log(err);

    }

  };

  const addDepartment = async () => {

    try {

      await axios.post(
        "http://localhost:5000/api/employee/departments",
        { name }
      );

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