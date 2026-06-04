import { useEffect, useState } from "react";
import axios from "axios";

function CreateEmployee() {

  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department_id: "",
  });

  useEffect(() => {

    fetchDepartments();

  }, []);

  const fetchDepartments = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/employee/departments"
      );

      setDepartments(res.data);

    } catch (err) {

      console.log(err);

    }
  };

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {
console.log(formData);
      const res = await axios.post(
        "http://localhost:5000/api/employee/employees",
        formData
      );

      alert(res.data.message);

      setFormData({
        name: "",
        email: "",
        department_id: "",
      });

    } catch (err) {

      console.log(err);

      alert("Error adding employee");

    }
  };

  return (
    <div style={{ padding: "40px" }}>

      <h1>Create Employee</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          value={formData.name}
          onChange={handleChange}
        />

        <br />
        <br />

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
        />

        <br />
        <br />

        <select
          name="department_id"
          value={formData.department_id}
          onChange={handleChange}
        >

          <option value="">
            Select Department
          </option>

          {departments.map((dept) => (

            <option
              key={dept.id}
              value={dept.id}
            >
              {dept.department_name}
            </option>

          ))}

        </select>

        <br />
        <br />

        <button type="submit">
          Add Employee
        </button>

      </form>

    </div>
  );
}

export default CreateEmployee;