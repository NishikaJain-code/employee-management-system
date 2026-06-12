import { useEffect, useState } from "react";
import api from "../utils/api";

const card = { background: "rgba(18,25,38,0.5)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" };
const inputSt = { padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", fontSize: "13px", boxSizing: "border-box", outline: "none", color: "#f1f5f9", fontFamily: "'Outfit', sans-serif" };

function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ table_name: "", action: "" });
  const LIMIT = 15;

  useEffect(() => { fetchLogs(); }, [page, filter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (filter.table_name) params.append("table_name", filter.table_name);
      if (filter.action) params.append("action", filter.action);

      const res = await api.get(`/api/audit?${params.toString()}`);
      setLogs(res.data.logs || []); setTotal(res.data.total || 0); setTotalPages(res.data.totalPages || 1);
    } catch (err) { console.error(err); alert("Error loading audit logs. Ensure you are Admin/HR."); }
    finally { setLoading(false); }
  };

  const actionColor = (action) => {
    const map = { INSERT: { bg: "rgba(0,255,194,0.1)", c: "#00FFC2" }, UPDATE: { bg: "rgba(0,184,255,0.1)", c: "#00B8FF" }, DELETE: { bg: "rgba(255,61,113,0.1)", c: "#FF3D71" } };
    return map[action] || { bg: "rgba(255,255,255,0.05)", c: "#94a3b8" };
  };

  const tableIcon = (t) => ({ leave_applications: "📋", employee_profiles: "👤", asset_assignments: "💻", assets: "📦", users: "🔐" }[t] || "🗄️");
  const formatJSON = (val) => {
    if (!val) return "—";
    try { const obj = typeof val === "string" ? JSON.parse(val) : val; return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(" | "); }
    catch { return String(val); }
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", paddingBottom: "40px" }}>
      <div style={{ ...card, padding: "28px 32px", marginBottom: "24px", background: "linear-gradient(135deg, rgba(255,0,229,0.1) 0%, rgba(123,97,255,0.08) 100%)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#f1f5f9" }}>Audit Trail</h2>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "14px" }}>Track every data change — {total} log entries</p>
        </div>
        <div style={{ fontSize: "40px" }}>🔍</div>
      </div>

      <div style={{ ...card, padding: "20px 24px", marginBottom: "24px", display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontWeight: 700, color: "#94a3b8", fontSize: "14px" }}>Filter:</span>
        <select style={{ ...inputSt, cursor: "pointer", appearance: "none" }} value={filter.table_name} onChange={(e) => { setFilter({ ...filter, table_name: e.target.value }); setPage(1); }}>
          <option value="" style={{ background: "#121926" }}>All Tables</option>
          {["leave_applications", "asset_assignments", "assets", "employee_profiles", "users"].map(t => <option key={t} value={t} style={{ background: "#121926" }}>{tableIcon(t)} {t}</option>)}
        </select>
        <select style={{ ...inputSt, cursor: "pointer", appearance: "none" }} value={filter.action} onChange={(e) => { setFilter({ ...filter, action: e.target.value }); setPage(1); }}>
          <option value="" style={{ background: "#121926" }}>All Actions</option>
          <option value="INSERT" style={{ background: "#121926" }}>INSERT</option>
          <option value="UPDATE" style={{ background: "#121926" }}>UPDATE</option>
          <option value="DELETE" style={{ background: "#121926" }}>DELETE</option>
        </select>
        <button onClick={() => { setFilter({ table_name: "", action: "" }); setPage(1); }} style={{ ...inputSt, cursor: "pointer", background: "rgba(255,61,113,0.1)", color: "#FF3D71", border: "none", fontWeight: 700, borderRadius: "50px", padding: "10px 20px" }}>✕ Clear</button>
        <span style={{ marginLeft: "auto", fontSize: "13px", color: "#64748b", fontWeight: 600 }}>Showing {logs.length} of {total}</span>
      </div>

      {loading ? <p style={{ textAlign: "center", color: "#7B61FF", fontWeight: 700 }}>⏳ Loading audit logs...</p> : (
        <div style={{ ...card, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["#", "Table", "Record ID", "Action", "Old Values", "New Values", "Performed By", "Time"].map(h => <th key={h} style={{ padding: "16px", textAlign: "left", color: "#64748b", fontWeight: 700, whiteSpace: "nowrap", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.5px" }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const aC = actionColor(log.action);
                  return (
                    <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "12px 16px", color: "#64748b" }}>{log.id}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: "#f1f5f9", whiteSpace: "nowrap" }}>{tableIcon(log.table_name)} {log.table_name}</td>
                      <td style={{ padding: "12px 16px", color: "#94a3b8", fontFamily: "monospace" }}>{log.record_id || "—"}</td>
                      <td style={{ padding: "12px 16px" }}><span style={{ background: aC.bg, color: aC.c, border: `1px solid ${aC.c}30`, padding: "4px 12px", borderRadius: "50px", fontWeight: 800, fontSize: "11px", fontFamily: "monospace" }}>{log.action}</span></td>
                      <td style={{ padding: "12px 16px", color: "#FF3D71", fontSize: "12px", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace" }}>{formatJSON(log.old_values)}</td>
                      <td style={{ padding: "12px 16px", color: "#00FFC2", fontSize: "12px", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace" }}>{formatJSON(log.new_values)}</td>
                      <td style={{ padding: "12px 16px", color: "#94a3b8" }}>{log.performed_by_name || "System"} <span style={{ fontSize: "11px", color: "#64748b" }}>({log.performed_by_role})</span></td>
                      <td style={{ padding: "12px 16px", color: "#64748b", whiteSpace: "nowrap" }}>{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  );
                })}
                {logs.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No audit logs found.</td></tr>}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ padding: "16px 24px", display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ background: page === 1 ? "rgba(255,255,255,0.02)" : "rgba(123,97,255,0.1)", color: page === 1 ? "#64748b" : "#7B61FF", border: page === 1 ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(123,97,255,0.2)", padding: "8px 16px", borderRadius: "50px", fontWeight: 700, cursor: page === 1 ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" }}>← Prev</button>
              <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 600 }}>Page <strong style={{ color: "#f1f5f9" }}>{page}</strong> of <strong style={{ color: "#f1f5f9" }}>{totalPages}</strong></span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ background: page === totalPages ? "rgba(255,255,255,0.02)" : "rgba(123,97,255,0.1)", color: page === totalPages ? "#64748b" : "#7B61FF", border: page === totalPages ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(123,97,255,0.2)", padding: "8px 16px", borderRadius: "50px", fontWeight: 700, cursor: page === totalPages ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" }}>Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AuditTrail;
