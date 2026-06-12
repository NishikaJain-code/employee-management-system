import { useEffect, useState } from "react";
import api from "../utils/api";

const card = { background: "var(--bg-card)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: "24px", border: "1px solid var(--border-light)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" };
const inputSt = { padding: "10px 14px", background: "var(--bg-input)", border: "1px solid var(--border-medium)", borderRadius: "14px", fontSize: "13px", boxSizing: "border-box", outline: "none", color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif" };

function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ table_name: "", action: "" });
  const LIMIT = 15;
// eslint-disable-next-line react-hooks/exhaustive-deps
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
    const map = { INSERT: { bg: "rgba(0,255,194,0.1)", c: "var(--accent-cyan)" }, UPDATE: { bg: "rgba(0,184,255,0.1)", c: "var(--accent-blue)" }, DELETE: { bg: "rgba(255,61,113,0.1)", c: "var(--accent-red)" } };
    return map[action] || { bg: "var(--border-light)", c: "var(--text-secondary)" };
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
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Audit Trail</h2>
          <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: "14px" }}>Track every data change — {total} log entries</p>
        </div>
        <div style={{ fontSize: "40px" }}>🔍</div>
      </div>

      <div style={{ ...card, padding: "20px 24px", marginBottom: "24px", display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontWeight: 700, color: "var(--text-secondary)", fontSize: "14px" }}>Filter:</span>
        <select style={{ ...inputSt, cursor: "pointer", appearance: "none" }} value={filter.table_name} onChange={(e) => { setFilter({ ...filter, table_name: e.target.value }); setPage(1); }}>
          <option value="" style={{ background: "var(--bg-card)" }}>All Tables</option>
          {["leave_applications", "asset_assignments", "assets", "employee_profiles", "users"].map(t => <option key={t} value={t} style={{ background: "var(--bg-card)" }}>{tableIcon(t)} {t}</option>)}
        </select>
        <select style={{ ...inputSt, cursor: "pointer", appearance: "none" }} value={filter.action} onChange={(e) => { setFilter({ ...filter, action: e.target.value }); setPage(1); }}>
          <option value="" style={{ background: "var(--bg-card)" }}>All Actions</option>
          <option value="INSERT" style={{ background: "var(--bg-card)" }}>INSERT</option>
          <option value="UPDATE" style={{ background: "var(--bg-card)" }}>UPDATE</option>
          <option value="DELETE" style={{ background: "var(--bg-card)" }}>DELETE</option>
        </select>
        <button onClick={() => { setFilter({ table_name: "", action: "" }); setPage(1); }} style={{ ...inputSt, cursor: "pointer", background: "rgba(255,61,113,0.1)", color: "var(--accent-red)", border: "none", fontWeight: 700, borderRadius: "50px", padding: "10px 20px" }}>✕ Clear</button>
        <span style={{ marginLeft: "auto", fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>Showing {logs.length} of {total}</span>
      </div>

      {loading ? <p style={{ textAlign: "center", color: "var(--accent-purple)", fontWeight: 700 }}>⏳ Loading audit logs...</p> : (
        <div style={{ ...card, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                  {["#", "Table", "Record ID", "Action", "Old Values", "New Values", "Performed By", "Time"].map(h => <th key={h} style={{ padding: "16px", textAlign: "left", color: "var(--text-muted)", fontWeight: 700, whiteSpace: "nowrap", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.5px" }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const aC = actionColor(log.action);
                  return (
                    <tr key={log.id} style={{ borderBottom: "1px solid var(--bg-input)" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{log.id}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{tableIcon(log.table_name)} {log.table_name}</td>
                      <td style={{ padding: "12px 16px", color: "var(--text-secondary)", fontFamily: "monospace" }}>{log.record_id || "—"}</td>
                      <td style={{ padding: "12px 16px" }}><span style={{ background: aC.bg, color: aC.c, border: `1px solid ${aC.c}30`, padding: "4px 12px", borderRadius: "50px", fontWeight: 800, fontSize: "11px", fontFamily: "monospace" }}>{log.action}</span></td>
                      <td style={{ padding: "12px 16px", color: "var(--accent-red)", fontSize: "12px", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace" }}>{formatJSON(log.old_values)}</td>
                      <td style={{ padding: "12px 16px", color: "var(--accent-cyan)", fontSize: "12px", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace" }}>{formatJSON(log.new_values)}</td>
                      <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{log.performed_by_name || "System"} <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>({log.performed_by_role})</span></td>
                      <td style={{ padding: "12px 16px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  );
                })}
                {logs.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No audit logs found.</td></tr>}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ padding: "16px 24px", display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", borderTop: "1px solid var(--border-light)" }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ background: page === 1 ? "var(--bg-hover)" : "rgba(123,97,255,0.1)", color: page === 1 ? "var(--text-muted)" : "var(--accent-purple)", border: page === 1 ? "1px solid var(--border-light)" : "1px solid rgba(123,97,255,0.2)", padding: "8px 16px", borderRadius: "50px", fontWeight: 700, cursor: page === 1 ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" }}>← Prev</button>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600 }}>Page <strong style={{ color: "var(--text-primary)" }}>{page}</strong> of <strong style={{ color: "var(--text-primary)" }}>{totalPages}</strong></span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ background: page === totalPages ? "var(--bg-hover)" : "rgba(123,97,255,0.1)", color: page === totalPages ? "var(--text-muted)" : "var(--accent-purple)", border: page === totalPages ? "1px solid var(--border-light)" : "1px solid rgba(123,97,255,0.2)", padding: "8px 16px", borderRadius: "50px", fontWeight: 700, cursor: page === totalPages ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" }}>Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AuditTrail;
