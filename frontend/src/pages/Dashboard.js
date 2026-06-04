import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {

  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalSkills: 0,
    totalImages: 0,
  });

  useEffect(() => {

    fetchDashboard();

  }, []);

  const fetchDashboard = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/employee/dashboard"
      );

      setStats(res.data);

    } catch (err) {

      console.log(err);

    }
  };

  return (
    <div style={{ padding: "40px" }}>

      <h1>Dashboard</h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "30px",
        }}
      >

        <div
          style={{
            border: "1px solid black",
            padding: "20px",
            width: "200px",
          }}
        >
          <h3>Total Employees</h3>
          <h2>{stats.totalEmployees}</h2>
        </div>

        <div
          style={{
            border: "1px solid black",
            padding: "20px",
            width: "200px",
          }}
        >
          <h3>Total Departments</h3>
          <h2>{stats.totalDepartments}</h2>
        </div>

        <div
          style={{
            border: "1px solid black",
            padding: "20px",
            width: "200px",
          }}
        >
          <h3>Total Skills</h3>
          <h2>{stats.totalSkills}</h2>
        </div>

        <div
          style={{
            border: "1px solid black",
            padding: "20px",
            width: "200px",
          }}
        >
          <h3>Total Images</h3>
          <h2>{stats.totalImages}</h2>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;