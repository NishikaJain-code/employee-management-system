import { useEffect, useState } from "react";
import api from "../utils/api";

const card = { background: "rgba(18,25,38,0.5)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" };
const inputSt = { padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", fontSize: "13px", boxSizing: "border-box", outline: "none", color: "#f1f5f9", fontFamily: "'Outfit', sans-serif" };

function Reports() {
  const [tab, setTab] = useState("employees");
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => { fetchReport(); }, [tab]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status) params.append("status", status);
      if (fromDate) params.append("from_date", fromDate);
      if (toDate) params.append("to_date", toDate);

      const res = await api.get(`/api/reports/${tab}?${params.toString()}`);
      setData(res.data.report || []); setTotal(res.data.total || 0);
    } catch (err) { console.error(err); alert("Error loading report. Ensure you are Admin/HR."); setData([]); }
    finally { setLoading(false); }
  };

  const exportCSV = async () => {
    try {
      const res = await api.get(`/api/reports/export/csv?type=${tab}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a"); link.href = url; link.setAttribute("download", `${tab}_report_${Date.now()}.csv`);
      document.body.appendChild(link); link.click(); link.remove();
    } catch (err) { console.error(err); alert("Error exporting CSV."); }
  };

  const tabStyle = (active) => ({ padding: "10px 20px", border: active ? "1px solid rgba(255,0,229,0.3)" : "1px solid rgba(255,255,255,0.05)", borderRadius: "50px", cursor: "pointer", fontWeight: 700, fontSize: "14px", background: active ? "rgba(255,0,229,0.1)" : "rgba(255,255,255,0.02)", color: active ? "#FF00E5" : "#94a3b8", transition: "all 0.2s", fontFamily: "'Outfit', sans-serif" });

  const columns = {
    employees: ["full_name", "email", "role", "designation", "department_name", "phone", "salary", "joined_at"],
    leaves: ["employee_name", "leave_name", "from_date", "to_date", "total_days", "status", "department_name", "applied_at"],
    assets: ["asset_name", "type", "serial_number", "asset_status", "assigned_to", "department_name", "assigned_date"],
  };

  const formatCell = (key, val) => {
    if (val === null || val === undefined) return "—";
    if (key.includes("date") || key.includes("at")) { try { return new Date(val).toLocaleDateString(); } catch { return val; } }
    if (key === "salary") return `₹${Number(val).toLocaleString("en-IN")}`;
    if (key === "status" || key === "asset_status") {
      const colors = { Approved: { bg: "rgba(0,255,194,0.1)", c: "#00FFC2" }, Rejected: { bg: "rgba(255,61,113,0.1)", c: "#FF3D71" }, Pending: { bg: "rgba(255,184,0,0.1)", c: "#FFB800" }, Available: { bg: "rgba(0,255,194,0.1)", c: "#00FFC2" }, Assigned: { bg: "rgba(0,184,255,0.1)", c: "#00B8FF" } };
      const c = colors[val] || { bg: "rgba(255,255,255,0.05)", c: "#94a3b8" };
      return <span style={{ background: c.bg, color: c.c, border: `1px solid ${c.c}30`, padding: "4px 12px", borderRadius: "50px", fontWeight: 700, fontSize: "12px", whiteSpace: "nowrap" }}>{val}</span>;
    }
    return String(val);
  };

  const formatHeader = (key) => key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", paddingBottom: "40px" }}>
      <div style={{ ...card, padding: "28px 32px", marginBottom: "24px", background: "linear-gradient(135deg, rgba(255,0,229,0.1) 0%, rgba(123,97,255,0.08) 100%)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#f1f5f9" }}>Reporting Module</h2>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "14px" }}>Generate and export enterprise reports</p>
        </div>
        <button onClick={exportCSV} style={{ background: "rgba(255,0,229,0.1)", color: "#FF00E5", border: "1px solid rgba(255,0,229,0.2)", padding: "12px 24px", borderRadius: "50px", cursor: "pointer", fontWeight: 700, fontSize: "13px", fontFamily: "'Outfit', sans-serif", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#FF00E5"; e.currentTarget.style.color = "#fff"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,0,229,0.1)"; e.currentTarget.style.color = "#FF00E5"; }}>⬇️ Export CSV</button>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", ...card, padding: "16px", borderRadius: "100px" }}>
        <button style={tabStyle(tab === "employees")} onClick={() => { setTab("employees"); setData([]); }}>👥 Employees</button>
        <button style={tabStyle(tab === "leaves")} onClick={() => { setTab("leaves"); setData([]); }}>📋 Leaves</button>
        <button style={tabStyle(tab === "assets")} onClick={() => { setTab("assets"); setData([]); }}>💻 Assets</button>
      </div>

      <div style={{ ...card, padding: "20px 24px", marginBottom: "24px", display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
        {tab === "employees" && <input placeholder="🔍 Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputSt, flex: 1, minWidth: "200px" }} />}
        {tab === "leaves" && (
          <>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ ...inputSt, cursor: "pointer", appearance: "none" }}>
              <option value="" style={{ background: "#121926" }}>All Status</option>
              <option value="Pending" style={{ background: "#121926" }}>Pending</option>
              <option value="Approved" style={{ background: "#121926" }}>Approved</option>
              <option value="Rejected" style={{ background: "#121926" }}>Rejected</option>
            </select>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ ...inputSt, colorScheme: "dark" }} />
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ ...inputSt, colorScheme: "dark" }} />
          </>
        )}
        <button onClick={fetchReport} style={{ padding: "10px 24px", borderRadius: "50px", border: "none", background: "linear-gradient(135deg, #FF00E5, #7B61FF)", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: "14px", fontFamily: "'Outfit', sans-serif" }}>🔄 Apply</button>
        <span style={{ marginLeft: "auto", fontSize: "13px", color: "#64748b", fontWeight: 600 }}>{total} record(s) found</span>
      </div>

      {loading ? <p style={{ textAlign: "center", color: "#FF00E5", fontWeight: 700 }}>⏳ Generating report...</p> : (
        <div style={{ ...card, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "700px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <th style={{ padding: "16px", textAlign: "left", color: "#64748b", fontWeight: 700 }}>#</th>
                  {(columns[tab] || []).map((col) => <th key={col} style={{ padding: "16px", textAlign: "left", color: "#64748b", fontWeight: 700, whiteSpace: "nowrap", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.5px" }}>{formatHeader(col)}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px 16px", color: "#64748b" }}>{i + 1}</td>
                    {(columns[tab] || []).map((col) => <td key={col} style={{ padding: "12px 16px", color: "#f1f5f9", fontWeight: 600 }}>{formatCell(col, row[col])}</td>)}
                  </tr>
                ))}
                {data.length === 0 && <tr><td colSpan={(columns[tab] || []).length + 1} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No data found. Try adjusting filters.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
