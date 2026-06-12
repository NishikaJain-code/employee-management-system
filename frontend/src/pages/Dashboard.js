import { useEffect, useState } from "react";
import api from "../utils/api";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";

const COLORS = ['var(--accent-cyan)', 'var(--accent-blue)', 'var(--accent-pink)', 'var(--accent-purple)', 'var(--accent-yellow)', 'var(--accent-red)'];

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

  // === Data computations ===
  const deptCount = {};
  const locationCount = {};
  const deptSalary = {};
  const hiringDataMap = {};

  employees.forEach(emp => {
    const dName = emp.department_name || "Unassigned";
    deptCount[dName] = (deptCount[dName] || 0) + 1;

    const loc = (emp.address || "Unknown").split(",")[0].trim();
    if (loc) locationCount[loc] = (locationCount[loc] || 0) + 1;

    const sal = parseFloat(emp.salary) || 0;
    if (!deptSalary[dName]) deptSalary[dName] = { total: 0, count: 0 };
    deptSalary[dName].total += sal;
    deptSalary[dName].count += 1;

    if (emp.joining_date) {
      const monthYear = new Date(emp.joining_date).toISOString().substring(0, 7);
      hiringDataMap[monthYear] = (hiringDataMap[monthYear] || 0) + 1;
    }
  });

  const deptDistributionData = Object.keys(deptCount).map(k => ({ name: k, value: deptCount[k] }));
  const locationData = Object.keys(locationCount)
    .sort((a, b) => locationCount[b] - locationCount[a])
    .slice(0, 8)
    .map(k => ({ name: k, count: locationCount[k] }));
  const salaryData = Object.keys(deptSalary).map(k => ({
    name: k,
    avgSalary: Math.round(deptSalary[k].total / deptSalary[k].count),
    totalPayroll: deptSalary[k].total
  }));

  const sortedMonths = Object.keys(hiringDataMap).sort();
  let cumulative = 0;
  const hiringTrendData = sortedMonths.map(m => {
    cumulative += hiringDataMap[m];
    return { month: m.substring(5), employees: cumulative };
  });

  const leaveMixData = stats?.leaveTypeUsage?.map(lt => ({
    name: lt.leave_name,
    value: parseInt(lt.total_days) || 0
  })) || [];

  // === Styles ===
  const bentoCard = {
    background: "var(--bg-card)",
    backdropFilter: "blur(40px)",
    WebkitBackdropFilter: "blur(40px)",
    borderRadius: "28px",
    padding: "28px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    border: "1px solid var(--border-light)",
    transition: "border-color 0.3s ease",
    position: "relative",
    overflow: "hidden"
  };

  const tooltipStyle = {
    background: "var(--bg-main)", 
    borderRadius: "16px", 
    border: "1px solid rgba(255,255,255,0.1)", 
    color: "#fff", 
    boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
    fontFamily: "'Outfit', sans-serif",
    fontSize: "13px"
  };

  const axisStyle = { fontSize: 12, fill: "var(--text-secondary)" };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "16px" }}>
      <div style={{ width: "48px", height: "48px", border: "3px solid rgba(0,255,194,0.2)", borderTopColor: "var(--accent-cyan)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <div style={{ color: "var(--text-muted)", fontSize: "15px" }}>Initializing Dashboard...</div>
    </div>
  );

  if (error) return <div style={{ padding: "40px", color: "var(--accent-red)", fontSize: "15px" }}>⚠️ {error}</div>;

  return (
    <div style={{ paddingBottom: "60px" }}>

      {/* ========== BENTO HERO SECTION ========== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "20px", marginBottom: "20px" }}>
        
        {/* Hero Welcome Card — 8 cols */}
        <div style={{ ...bentoCard, gridColumn: "span 8" }}>
          {/* Glow orb */}
          <div style={{
            position: "absolute", top: "-80px", right: "-60px", width: "320px", height: "320px",
            background: "radial-gradient(circle, rgba(0,255,194,0.12) 0%, transparent 70%)",
            borderRadius: "50%", pointerEvents: "none"
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "13px", color: "var(--accent-cyan)", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>
              Enterprise HRMS
            </div>
            <h1 style={{ fontSize: "38px", fontWeight: "800", color: "#fff", margin: "0 0 12px 0", letterSpacing: "-1px", lineHeight: 1.1 }}>
              Hello, <span style={{ background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{user?.name?.split(" ")[0] || "Admin"}</span> 👋
            </h1>
            <p style={{ fontSize: "15px", color: "var(--text-muted)", margin: "0 0 32px 0", lineHeight: "1.7", maxWidth: "480px" }}>
              Your workforce is active and healthy. You have{" "}
              <span style={{ color: "var(--accent-yellow)", fontWeight: "700" }}>{stats?.summary?.pendingLeaves || 0} pending approvals</span>{" "}
              that need your attention today.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button style={{
                background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))", color: "var(--bg-main)",
                border: "none", padding: "13px 28px", borderRadius: "50px", fontSize: "14px",
                fontWeight: "800", cursor: "pointer", boxShadow: "0 4px 20px rgba(0, 255, 194, 0.3)",
                transition: "transform 0.2s, box-shadow 0.2s", letterSpacing: "0.3px"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(0, 255, 194, 0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 255, 194, 0.3)"; }}>
                Review Approvals →
              </button>
              <button style={{
                background: "var(--border-light)", color: "var(--text-secondary)",
                border: "1px solid rgba(255,255,255,0.1)", padding: "13px 28px",
                borderRadius: "50px", fontSize: "14px", fontWeight: "700", cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--border-light)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                View Reports
              </button>
            </div>
          </div>
        </div>

        {/* Quick stats — 4 cols (2x2 mini grid) */}
        <div style={{ gridColumn: "span 4", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          
          {[
            { label: "Total Staff", value: stats?.summary?.totalEmployees || 0, color: "var(--accent-cyan)", sub: "Active employees" },
            { label: "Pending Leaves", value: stats?.summary?.pendingLeaves || 0, color: "var(--accent-yellow)", sub: "Awaiting action" },
            { label: "Assets Tracked", value: stats?.summary?.assignedAssets || 0, color: "var(--accent-blue)", sub: "Allocated items" },
            { label: "Departments", value: deptDistributionData.length, color: "var(--accent-purple)", sub: "Active units" },
          ].map((stat, i) => (
            <div key={i} style={{
              ...bentoCard,
              padding: "20px",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              borderRadius: "24px"
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = stat.color + "40"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-light)"}
            >
              <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                {stat.label}
              </div>
              <div style={{ fontSize: "34px", fontWeight: "800", color: "#fff", lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "12px", color: stat.color, fontWeight: "600" }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========== PAYROLL HERO CARD (Full width) ========== */}
      <div style={{ ...bentoCard, marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "linear-gradient(135deg, rgba(255,0,229,0.06) 0%, rgba(123,97,255,0.06) 100%)",
          borderRadius: "inherit", pointerEvents: "none"
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "12px", color: "var(--accent-pink)", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>Monthly Payroll</div>
          <div style={{ fontSize: "48px", fontWeight: "900", background: "linear-gradient(135deg, var(--accent-pink) 0%, var(--accent-purple) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-2px", lineHeight: 1 }}>
            ₹{Number(stats?.summary?.totalSalaryExpense || 0).toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "8px" }}>Total salary expenditure across all departments</div>
        </div>
        <div style={{ position: "relative", zIndex: 1, background: "rgba(255,0,229,0.08)", border: "1px solid rgba(255,0,229,0.15)", borderRadius: "20px", padding: "16px 24px", textAlign: "center" }}>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#fff" }}>{employees.length}</div>
          <div style={{ fontSize: "12px", color: "var(--accent-pink)", fontWeight: "600", marginTop: "4px" }}>ON PAYROLL</div>
        </div>
      </div>

      {user.role !== "employee" && (
        <>
          {/* ========== ROW: Workforce Growth + Department Pie ========== */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "20px", marginBottom: "20px" }}>

            <div style={{ ...bentoCard, gridColumn: "span 8" }}>
              <h3 style={{ fontSize: "17px", color: "var(--text-primary)", fontWeight: "700", margin: "0 0 24px 0" }}>Workforce Growth Trend</h3>
              <div style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hiringTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-input)" />
                    <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="employees" stroke="var(--accent-blue)" strokeWidth={3} fillOpacity={1} fill="url(#areaGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ ...bentoCard, gridColumn: "span 4" }}>
              <h3 style={{ fontSize: "17px", color: "var(--text-primary)", fontWeight: "700", margin: "0 0 24px 0" }}>Department Mix</h3>
              <div style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deptDistributionData} innerRadius={75} outerRadius={110} paddingAngle={6} dataKey="value" stroke="none" cornerRadius={8}>
                      {deptDistributionData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend iconType="circle" wrapperStyle={{fontSize: "12px", color: "var(--text-secondary)"}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* ========== ROW: Leave Mix + Avg Salary ========== */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            
            <div style={bentoCard}>
              <h3 style={{ fontSize: "17px", color: "var(--text-primary)", fontWeight: "700", margin: "0 0 24px 0" }}>Leave Type Usage</h3>
              <div style={{ height: "280px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={leaveMixData} innerRadius={70} outerRadius={105} paddingAngle={6} dataKey="value" stroke="none" cornerRadius={6}>
                      {leaveMixData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend iconType="circle" wrapperStyle={{fontSize: "12px", color: "var(--text-secondary)"}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={bentoCard}>
              <h3 style={{ fontSize: "17px", color: "var(--text-primary)", fontWeight: "700", margin: "0 0 24px 0" }}>Avg Salary by Department (₹)</h3>
              <div style={{ height: "280px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--bg-input)" />
                    <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={axisStyle} axisLine={false} tickLine={false} width={80} />
                    <Tooltip cursor={{fill: "var(--bg-hover)"}} contentStyle={tooltipStyle} />
                    <Bar dataKey="avgSalary" fill="var(--accent-purple)" radius={[0, 20, 20, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* ========== ROW: Total Payroll by Dept + Location ========== */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

            <div style={bentoCard}>
              <h3 style={{ fontSize: "17px", color: "var(--text-primary)", fontWeight: "700", margin: "0 0 24px 0" }}>Payroll Cost by Department (₹)</h3>
              <div style={{ height: "280px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryData} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-input)" />
                    <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill:"var(--bg-hover)"}} contentStyle={tooltipStyle} />
                    <Bar dataKey="totalPayroll" fill="var(--accent-pink)" radius={[16, 16, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={bentoCard}>
              <h3 style={{ fontSize: "17px", color: "var(--text-primary)", fontWeight: "700", margin: "0 0 24px 0" }}>Geographic Distribution</h3>
              <div style={{ height: "280px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-input)" />
                    <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill:"var(--bg-hover)"}} contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill="var(--accent-yellow)" radius={[16, 16, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}

export default Dashboard;