import { useEffect, useState } from "react";
import api from "../utils/api";

function AuditTrail() {
  const [logs, setLogs]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState({ table_name: "", action: "" });

  const LIMIT = 15;

  useEffect(() => {
    fetchLogs();
  }, [page, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (filter.table_name) params.append("table_name", filter.table_name);
      if (filter.action)     params.append("action",     filter.action);

      const res = await api.get(`/api/audit?${params.toString()}`);
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch audit logs error:", err);
      alert("Error loading audit logs. Ensure you are logged in as Admin/HR.");
    } finally {
      setLoading(false);
    }
  };

  const actionColor = (action) => {
    const map = {
      INSERT: { background: "#f0fff4", color: "#38a169" },
      UPDATE: { background: "#ebf8ff", color: "#3182ce" },
      DELETE: { background: "#fff5f5", color: "#e53e3e" },
    };
    return map[action] || { background: "#f7fafc", color: "#718096" };
  };

  const tableIcon = (tableName) => {
    const icons = {
      leave_applications: "📋",
      employee_profiles: "👤",
      asset_assignments: "💻",
      assets: "📦",
      users: "🔐",
    };
    return icons[tableName] || "🗄️";
  };

  const formatJSON = (val) => {
    if (!val) return "—";
    try {
      const obj = typeof val === "string" ? JSON.parse(val) : val;
      return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(" | ");
    } catch {
      return String(val);
    }
  };

  const inputStyle = {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "13px",
    background: "#fff",
  };

  return (
    <div style={{ padding: "32px", fontFamily: "'Segoe UI', sans-serif", background: "#f0f4ff", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg,#a18cd1,#fbc2eb)",
        borderRadius: "16px",
        padding: "24px 28px",
        color: "#fff",
        marginBottom: "28px",
      }}>
        <h2 style={{ margin: 0 }}>🔍 Audit Trail</h2>
        <p style={{ margin: "6px 0 0", opacity: 0.85 }}>
          Track every data change across the system — {total} total log entries
        </p>
      </div>

      {/* Filters */}
      <div style={{
        background: "#fff",
        borderRadius: "14px",
        padding: "18px 20px",
        marginBottom: "20px",
        display: "flex",
        gap: "14px",
        alignItems: "center",
        flexWrap: "wrap",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
      }}>
        <span style={{ fontWeight: 600, color: "#555", fontSize: "14px" }}>🔎 Filter:</span>

        <select
          style={inputStyle}
          value={filter.table_name}
          onChange={(e) => { setFilter({ ...filter, table_name: e.target.value }); setPage(1); }}
        >
          <option value="">All Tables</option>
          {["leave_applications", "asset_assignments", "assets", "employee_profiles", "users"].map(t => (
            <option key={t} value={t}>{tableIcon(t)} {t}</option>
          ))}
        </select>

        <select
          style={inputStyle}
          value={filter.action}
          onChange={(e) => { setFilter({ ...filter, action: e.target.value }); setPage(1); }}
        >
          <option value="">All Actions</option>
          <option value="INSERT">INSERT</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>

        <button
          onClick={() => { setFilter({ table_name: "", action: "" }); setPage(1); }}
          style={{ ...inputStyle, cursor: "pointer", background: "#f0f4ff", color: "#6c63ff", fontWeight: 600, border: "1px solid #c3bfff" }}
        >
          ✕ Clear
        </button>

        <span style={{ marginLeft: "auto", fontSize: "13px", color: "#888" }}>
          Showing {logs.length} of {total} entries
        </span>
      </div>

      {/* Logs Table */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#a18cd1" }}>⏳ Loading audit logs...</p>
      ) : (
        <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f5f0ff" }}>
                {["#", "Table", "Record ID", "Action", "Old Values", "New Values", "Performed By", "Date & Time"].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: "#555", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #eee", background: i % 2 === 0 ? "#fff" : "#fefefe" }}>
                  <td style={{ padding: "10px 14px", color: "#bbb", fontSize: "12px" }}>{log.id}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: "#2d3748" }}>
                    {tableIcon(log.table_name)} {log.table_name}
                  </td>
                  <td style={{ padding: "10px 14px", color: "#888", fontFamily: "monospace" }}>
                    {log.record_id || "—"}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{
                      ...actionColor(log.action),
                      padding: "3px 10px",
                      borderRadius: "20px",
                      fontWeight: 700,
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", color: "#e53e3e", fontSize: "12px", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {formatJSON(log.old_values)}
                  </td>
                  <td style={{ padding: "10px 14px", color: "#38a169", fontSize: "12px", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {formatJSON(log.new_values)}
                  </td>
                  <td style={{ padding: "10px 14px", color: "#555" }}>
                    {log.performed_by_name || "System"}
                    {log.performed_by_role && (
                      <span style={{ fontSize: "11px", color: "#aaa", marginLeft: "4px" }}>({log.performed_by_role})</span>
                    )}
                  </td>
                  <td style={{ padding: "10px 14px", color: "#888", whiteSpace: "nowrap" }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>
                    📭 No audit logs found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", borderTop: "1px solid #eee" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: "6px 16px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  background: page === 1 ? "#f7fafc" : "#6c63ff",
                  color: page === 1 ? "#aaa" : "#fff",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  fontWeight: 600,
                }}
              >
                ← Prev
              </button>
              <span style={{ fontSize: "13px", color: "#555" }}>
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: "6px 16px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  background: page === totalPages ? "#f7fafc" : "#6c63ff",
                  color: page === totalPages ? "#aaa" : "#fff",
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                  fontWeight: 600,
                }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AuditTrail;
