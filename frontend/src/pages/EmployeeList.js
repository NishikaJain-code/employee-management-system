import { useEffect, useState } from "react";
import axios from "axios";

function EmployeeList() {

  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/employee/employees"
      );

      setEmployees(res.data);

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
            
          </tr>
        </thead>

        <tbody>

          {employees.map((emp) => (

            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.department}</td>
              
            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default EmployeeList;