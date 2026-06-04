import { useEffect, useState } from "react";
import axios from "axios";

function LeaveApproval() {

  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/leave/all"
      );

      setLeaves(res.data);

    } catch (err) {

      console.log(err);

    }

  };

  const approveLeave = async (id) => {

  try {

    await axios.put(
      `http://localhost:5000/api/leave/hr-approve/${id}`
    );

    alert("HR Approved");

    fetchLeaves();

  } catch (err) {

    console.log(err);

  }

};

  const rejectLeave = async (id) => {

    try {

      await axios.put(
        `http://localhost:5000/api/leave/reject/${id}`
      );

      alert("Leave Rejected");

      fetchLeaves();

    } catch (err) {

      console.log(err);

      alert("Error Rejecting Leave");

    }

  };

  return (

    <div style={{ padding: "20px" }}>

      <h2>HR Final Approval</h2>

      <table border="1" cellPadding="10">

        <thead>

          <tr>

            <th>ID</th>
            <th>Employee</th>
            <th>Leave Type</th>
            <th>Total Days</th>
            <th>Status</th>
            <th>Approve</th>
            <th>Reject</th>

          </tr>

        </thead>

        <tbody>

          {leaves.map((leave) => (

            <tr key={leave.id}>

              <td>{leave.id}</td>

              <td>{leave.employee_name}</td>

              <td>{leave.leave_name}</td>

              <td>{leave.total_days}</td>

              <td>{leave.status}</td>

              <td>

                <button
                  onClick={() => approveLeave(leave.id)}
                >
                  Approve
                </button>

              </td>

              <td>

                <button
                  onClick={() => rejectLeave(leave.id)}
                >
                  Reject
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}

export default LeaveApproval;