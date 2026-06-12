import { useEffect, useState } from "react";
import api from "../utils/api";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

  const COLORS = ['#00FFC2', '#00B8FF', '#FF00E5', '#7B61FF', '#FFB800', '#FF3D71'];

  // Data mapping...

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const resStats = await api.get("/api/reports/summary");
      setStats(resStats.data.data || resStats.data);

      if (user.role !== "employee") {
        const resEmp = await api.get("/api/employees");
        setEmployees(resEmp.data || []);
      }
    } catch (err) {
      setError("Failed to load dashboard. Please ensure you are logged in.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Computations for graphs
  // 1. Department Distribution
  const deptCount = {};
  // 2. Location Breakdown
  const locationCount = {};
  // 3. Average & Total Salary by Dept
  const deptSalary = {};
  // 4. Hiring Growth Trend (Cumulative)
  const hiringDataMap = {};

  employees.forEach(emp => {
    // Dept count
    const dName = emp.department_name || "Unassigned";
    deptCount[dName] = (deptCount[dName] || 0) + 1;

    // Location
    const loc = emp.address || "Unknown";
    locationCount[loc] = (locationCount[loc] || 0) + 1;

    // Salary
    const sal = parseFloat(emp.salary) || 0;
    if (!deptSalary[dName]) deptSalary[dName] = { total: 0, count: 0 };
    deptSalary[dName].total += sal;
    deptSalary[dName].count += 1;

    // Hiring trend
    if (emp.joining_date) {
      const monthYear = new Date(emp.joining_date).toISOString().substring(0, 7); // YYYY-MM
      hiringDataMap[monthYear] = (hiringDataMap[monthYear] || 0) + 1;
    }
  });

  const deptDistributionData = Object.keys(deptCount).map(k => ({ name: k, value: deptCount[k] }));
  const locationData = Object.keys(locationCount).map(k => ({ name: k, count: locationCount[k] }));
  const salaryData = Object.keys(deptSalary).map(k => ({
    name: k,
    avgSalary: Math.round(deptSalary[k].total / deptSalary[k].count),
    totalPayroll: deptSalary[k].total
  }));

  // Sort and accumulate hiring data
  const sortedMonths = Object.keys(hiringDataMap).sort();
  let cumulative = 0;
  const hiringTrendData = sortedMonths.map(m => {
    cumulative += hiringDataMap[m];
    return { month: m, employees: cumulative };
  });

  // Leave Mix
  const leaveMixData = stats?.leaveTypeUsage?.map(lt => ({
    name: lt.leave_name,
    value: parseInt(lt.total_days) || 0
  })) || [];

  const statCardStyle = {
    background: "#080B13",
    borderRadius: "20px",
    padding: "24px",
    flex: "1",
    minWidth: "200px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  };

  const graphCardStyle = {
    background: "#080B13",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    marginBottom: "24px",
    transition: "all 0.3s ease"
  };

  if (loading) return <div style={{ padding: "40px", color: "#4a5568" }}>Loading dashboard analytics...</div>;
  if (error) return <div style={{ padding: "40px", color: "#e53e3e" }}>{error}</div>;

  return (
    <div style={{ paddingBottom: "40px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#f8fafc", marginBottom: "32px", letterSpacing: "-0.5px" }}>
        System Overview
      </h1>

      {/* Top Stat Cards */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "32px" }}>
        <div style={statCardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.borderColor = "#00FFC2"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)"; }}>
          <div style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Employees</div>
          <div style={{ fontSize: "36px", fontWeight: "800", color: "#f8fafc", marginTop: "8px" }}>
            {stats?.summary?.totalEmployees || 0}
          </div>
          <div style={{ fontSize: "13px", color: "#00FFC2", marginTop: "8px", fontWeight: "600" }}>Active workforce</div>
        </div>
        
        <div style={statCardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.borderColor = "#FFB800"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)"; }}>
          <div style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Pending Leaves</div>
          <div style={{ fontSize: "36px", fontWeight: "800", color: "#f8fafc", marginTop: "8px" }}>
            {stats?.summary?.pendingLeaves || 0}
          </div>
          <div style={{ fontSize: "13px", color: "#FFB800", marginTop: "8px", fontWeight: "600" }}>Needs action</div>
        </div>

        <div style={statCardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.borderColor = "#00B8FF"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)"; }}>
          <div style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Allocated Assets</div>
          <div style={{ fontSize: "36px", fontWeight: "800", color: "#f8fafc", marginTop: "8px" }}>
            {stats?.summary?.assignedAssets || 0}
          </div>
          <div style={{ fontSize: "13px", color: "#00B8FF", marginTop: "8px", fontWeight: "600" }}>Total tracked items</div>
        </div>

        <div style={statCardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.borderColor = "#FF00E5"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)"; }}>
          <div style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Monthly Salary</div>
          <div style={{ fontSize: "36px", fontWeight: "800", color: "#f8fafc", marginTop: "8px", background: "linear-gradient(135deg, #FF00E5 0%, #7B61FF 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ₹{Number(stats?.summary?.totalSalaryExpense || 0).toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "13px", color: "#FF00E5", marginTop: "8px", fontWeight: "600" }}>Current baseline</div>
        </div>
      </div>

      {user.role !== "employee" && (
        <>
          {/* Row 1: Dept Strength & Leave Mix */}
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <div style={{ ...graphCardStyle, flex: 2, minWidth: "400px" }}>
              <h3 style={{ fontSize: "15px", color: "#cbd5e1", marginBottom: "20px" }}>Department Strength</h3>
              <div style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{fontSize: 12, fill: "#94a3b8"}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12, fill: "#94a3b8"}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: "rgba(255,255,255,0.02)"}} contentStyle={{background: "#080B13", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.5)"}} />
                    <Bar dataKey="value" fill="#00FFC2" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ ...graphCardStyle, flex: 1, minWidth: "300px" }}>
              <h3 style={{ fontSize: "15px", color: "#cbd5e1", marginBottom: "20px" }}>Leave Mix</h3>
              <div style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={leaveMixData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                      {leaveMixData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{background: "#080B13", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.5)"}} />
                    <Legend iconType="circle" wrapperStyle={{fontSize: "12px", color: "#cbd5e1"}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 2: Hiring Trend */}
          <div style={graphCardStyle}>
            <h3 style={{ fontSize: "15px", color: "#cbd5e1", marginBottom: "20px" }}>Hiring Growth Trend</h3>
            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hiringTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{fontSize: 12, fill: "#94a3b8"}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 12, fill: "#94a3b8"}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{background: "#080B13", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.5)"}} />
                  <Line type="monotone" dataKey="employees" stroke="#00B8FF" strokeWidth={3} dot={{r: 4, fill: "#00B8FF", strokeWidth: 2, stroke: "#080B13"}} activeDot={{r: 6, fill: "#fff"}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 3: Salary & Payroll Analysis */}
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <div style={{ ...graphCardStyle, flex: 1, minWidth: "400px" }}>
              <h3 style={{ fontSize: "15px", color: "#cbd5e1", marginBottom: "20px" }}>Average Salary By Department (₹)</h3>
              <div style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{fontSize: 12, fill: "#94a3b8"}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12, fill: "#94a3b8"}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: "rgba(255,255,255,0.02)"}} contentStyle={{background: "#080B13", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.5)"}} />
                    <Bar dataKey="avgSalary" fill="#FF00E5" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ ...graphCardStyle, flex: 1, minWidth: "400px" }}>
              <h3 style={{ fontSize: "15px", color: "#cbd5e1", marginBottom: "20px" }}>Payroll Cost Analysis By Department (₹)</h3>
              <div style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{fontSize: 12, fill: "#94a3b8"}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12, fill: "#94a3b8"}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: "rgba(255,255,255,0.02)"}} contentStyle={{background: "#080B13", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.5)"}} />
                    <Bar dataKey="totalPayroll" fill="#7B61FF" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 4: Location Breakdown */}
          <div style={graphCardStyle}>
            <h3 style={{ fontSize: "15px", color: "#cbd5e1", marginBottom: "20px" }}>Location Breakdown (Top Cities)</h3>
            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{fontSize: 12, fill: "#94a3b8"}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 12, fill: "#94a3b8"}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: "rgba(255,255,255,0.02)"}} contentStyle={{background: "#080B13", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.5)"}} />
                  <Bar dataKey="count" fill="#FFB800" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

export default Dashboard;