import { useEffect, useState } from "react";
import api from "../utils/api";

function Reports() {
  const [tab, setTab]         = useState("employees");
  const [data, setData]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate]   = useState("");

  useEffect(() => {
    fetchReport();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search)   params.append("search",    search);
      if (status)   params.append("status",    status);
      if (fromDate) params.append("from_date", fromDate);
      if (toDate)   params.append("to_date",   toDate);

      const res = await api.get(`/api/reports/${tab}?${params.toString()}`);
      setData(res.data.report || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Fetch report error:", err);
      alert("Error loading report. Ensure you are logged in as Admin/HR.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const res = await api.get(`/api/reports/export/csv?type=${tab}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${tab}_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("CSV export error:", err);
      alert("Error exporting CSV.");
    }
  };

  const tabStyle = (active) => ({
    padding: "10px 22px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
    background: active ? "linear-gradient(135deg,#f093fb,#f5576c)" : "#fff",
    color: active ? "#fff" : "#555",
    boxShadow: active ? "0 4px 12px rgba(245,87,108,0.3)" : "none",
    transition: "all 0.2s",
  });

  // Column definitions per report type
  const columns = {
    employees: ["full_name", "email", "role", "designation", "department_name", "phone", "salary", "joined_at"],
    leaves:    ["employee_name", "leave_name", "from_date", "to_date", "total_days", "status", "department_name", "applied_at"],
    assets:    ["asset_name", "type", "serial_number", "asset_status", "assigned_to", "department_name", "assigned_date"],
  };

  const formatCell = (key, val) => {
    if (val === null || val === undefined) return "—";
    if (key.includes("date") || key.includes("at")) {
      try { return new Date(val).toLocaleDateString(); } catch { return val; }
    }
    if (key === "salary") return `₹${Number(val).toLocaleString("en-IN")}`;
    if (key === "status") {
      const colors = { Approved: "#38a169", Rejected: "#e53e3e", Pending: "#d69e2e", Available: "#38a169", Assigned: "#3182ce" };
      return (
        <span style={{
          background: colors[val] ? colors[val] + "22" : "#f7fafc",
          color: colors[val] || "#718096",
          padding: "2px 10px", borderRadius: "20px", fontWeight: 600, fontSize: "12px"
        }}>{val}</span>
      );
    }
    return String(val);
  };

  const formatHeader = (key) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div style={{ padding: "32px", fontFamily: "'Segoe UI', sans-serif", background: "#f0f4ff", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg,#f093fb,#f5576c)",
        borderRadius: "16px",
        padding: "24px 28px",
        color: "#fff",
        marginBottom: "28px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <h2 style={{ margin: 0 }}>📊 Reporting Module</h2>
          <p style={{ margin: "6px 0 0", opacity: 0.85 }}>Generate and export enterprise reports</p>
        </div>
        <button
          onClick={exportCSV}
          style={{
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            border: "2px solid rgba(255,255,255,0.5)",
            padding: "10px 20px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "14px",
          }}
        >
          ⬇️ Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button style={tabStyle(tab === "employees")} onClick={() => { setTab("employees"); setData([]); }}>👥 Employees</button>
        <button style={tabStyle(tab === "leaves")}    onClick={() => { setTab("leaves");    setData([]); }}>📋 Leaves</button>
        <button style={tabStyle(tab === "assets")}    onClick={() => { setTab("assets");    setData([]); }}>💻 Assets</button>
      </div>

      {/* Filters */}
      <div style={{
        background: "#fff",
        borderRadius: "14px",
        padding: "16px 20px",
        marginBottom: "20px",
        display: "flex",
        gap: "12px",
        alignItems: "center",
        flexWrap: "wrap",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
      }}>
        {tab === "employees" && (
          <input
            placeholder="🔍 Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", flex: 1, minWidth: "200px" }}
          />
        )}

        {tab === "leaves" && (
          <>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px" }}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px" }} />
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px" }} />
          </>
        )}

        <button
          onClick={fetchReport}
          style={{
            padding: "8px 18px", borderRadius: "8px", border: "none",
            background: "linear-gradient(135deg,#f093fb,#f5576c)",
            color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "13px"
          }}
        >
          🔄 Apply
        </button>

        <span style={{ marginLeft: "auto", fontSize: "13px", color: "#888" }}>
          {total} record(s) found
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#f5576c" }}>⏳ Generating report...</p>
      ) : (
        <div style={{
          background: "#fff",
          borderRadius: "16px",
          overflow: "auto",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          maxHeight: "65vh",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "700px" }}>
            <thead style={{ position: "sticky", top: 0 }}>
              <tr style={{ background: "#fff0f3" }}>
                <th style={{ padding: "12px 14px", textAlign: "left", color: "#555", fontWeight: 600 }}>#</th>
                {(columns[tab] || []).map((col) => (
                  <th key={col} style={{ padding: "12px 14px", textAlign: "left", color: "#555", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {formatHeader(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee", background: i % 2 === 0 ? "#fff" : "#fefefe" }}>
                  <td style={{ padding: "10px 14px", color: "#bbb", fontSize: "12px" }}>{i + 1}</td>
                  {(columns[tab] || []).map((col) => (
                    <td key={col} style={{ padding: "10px 14px", color: "#2d3748" }}>
                      {formatCell(col, row[col])}
                    </td>
                  ))}
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={(columns[tab] || []).length + 1} style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>
                    📭 No data found. Try adjusting filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Reports;
