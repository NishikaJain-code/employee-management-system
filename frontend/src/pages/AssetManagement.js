import { useEffect, useState } from "react";
import api from "../utils/api";

const card = { background: "var(--bg-card)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: "24px", border: "1px solid var(--border-light)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" };
const inputSt = { width: "100%", padding: "12px 16px", background: "var(--bg-input)", border: "1px solid var(--border-medium)", borderRadius: "14px", fontSize: "14px", boxSizing: "border-box", outline: "none", color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif", marginBottom: "16px" };
const formLabelStyle = { display: "block", marginBottom: "6px", fontWeight: 700, fontSize: "13px", color: "var(--text-secondary)" };

function AssetManagement() {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tab, setTab] = useState("assets"); // assets | add | assign | history
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ name: "", type: "Laptop", serial_number: "", description: "" });
  const [assignForm, setAssignForm] = useState({ asset_id: "", employee_id: "", notes: "" });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [a, e, h] = await Promise.all([ api.get("/api/assets"), api.get("/api/employees"), api.get("/api/assets/all-assignments") ]);
      setAssets(a.data.assets || []); setEmployees(e.data || []); setAssignments(h.data || []);
    } catch (err) { console.error(err); alert("Error loading data. Ensure you are Admin/HR."); }
    finally { setLoading(false); }
  };

  const createAsset = async () => {
    if (!form.name || !form.type) { alert("Name and type are required."); return; }
    try { await api.post("/api/assets", form); alert("✅ Asset created!"); setForm({ name: "", type: "Laptop", serial_number: "", description: "" }); fetchAll(); }
    catch (err) { alert(err.response?.data?.message || "Error creating asset."); }
  };

  const assignAsset = async () => {
    if (!assignForm.asset_id || !assignForm.employee_id) { alert("Select asset and employee."); return; }
    try { await api.post("/api/assets/assign", assignForm); alert("✅ Asset assigned successfully!"); setAssignForm({ asset_id: "", employee_id: "", notes: "" }); fetchAll(); }
    catch (err) { alert(err.response?.data?.message || "Error assigning asset."); }
  };

  const returnAsset = async (assignmentId) => {
    if (!window.confirm("Mark this asset as returned?")) return;
    try { await api.put(`/api/assets/return/${assignmentId}`); alert("✅ Asset returned!"); fetchAll(); }
    catch (err) { alert(err.response?.data?.message || "Error returning asset."); }
  };

  const typeIcon = (type) => ({ Laptop: "💻", Monitor: "🖥️", "ID Card": "🪪", Mouse: "🖱️", Keyboard: "⌨️", Phone: "📱", Other: "📦" }[type] || "📦");

  const statusBadge = (status) => {
    const styles = { Available: { bg: "rgba(0,255,194,0.1)", c: "var(--accent-cyan)" }, Assigned: { bg: "rgba(0,184,255,0.1)", c: "var(--accent-blue)" }, "Under Maintenance": { bg: "rgba(255,184,0,0.1)", c: "var(--accent-yellow)" }, Retired: { bg: "rgba(255,61,113,0.1)", c: "var(--accent-red)" } };
    const s = styles[status] || { bg: "var(--border-light)", c: "var(--text-secondary)" };
    return { background: s.bg, color: s.c, border: `1px solid ${s.c}30` };
  };

  const tabStyle = (active) => ({ padding: "10px 20px", border: active ? "1px solid rgba(0,255,194,0.3)" : "1px solid var(--border-light)", borderRadius: "50px", cursor: "pointer", fontWeight: 700, fontSize: "14px", background: active ? "rgba(0,255,194,0.1)" : "var(--bg-hover)", color: active ? "var(--accent-cyan)" : "var(--text-secondary)", transition: "all 0.2s", fontFamily: "'Outfit', sans-serif" });

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", paddingBottom: "40px" }}>
      <div style={{ ...card, padding: "28px 32px", marginBottom: "24px", background: "linear-gradient(135deg, rgba(0,184,255,0.1) 0%, rgba(123,97,255,0.08) 100%)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Asset Management System</h2>
          <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: "14px" }}>Manage company hardware and resources</p>
        </div>
        <div style={{ fontSize: "40px" }}>🏢</div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", ...card, padding: "16px", borderRadius: "100px" }}>
        <button style={tabStyle(tab === "assets")} onClick={() => setTab("assets")}>📦 All Assets</button>
        <button style={tabStyle(tab === "add")} onClick={() => setTab("add")}>➕ Add Asset</button>
        <button style={tabStyle(tab === "assign")} onClick={() => setTab("assign")}>🔗 Assign Asset</button>
        <button style={tabStyle(tab === "history")} onClick={() => setTab("history")}>📋 Assignment History</button>
      </div>

      {loading ? <p style={{ textAlign: "center", color: "var(--accent-blue)", fontWeight: 700 }}>⏳ Loading data...</p> : (
        <>
          {/* Asset List */}
          {tab === "assets" && (
            <div style={{ ...card, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, color: "var(--text-primary)", fontSize: "16px", fontWeight: 700 }}>Inventory ({assets.length})</h3>
                <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>Available: <span style={{ color: "var(--accent-cyan)" }}>{assets.filter(a => a.status === "Available").length}</span> | Assigned: <span style={{ color: "var(--accent-blue)" }}>{assets.filter(a => a.status === "Assigned").length}</span></div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                      {["Type", "Name", "Serial No.", "Status", "Assigned To", "Assigned Date"].map(h => <th key={h} style={{ padding: "16px", textAlign: "left", color: "var(--text-muted)", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((a) => (
                      <tr key={a.id} style={{ borderBottom: "1px solid var(--bg-input)" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "12px 16px", fontSize: "20px" }}>{typeIcon(a.type)}</td>
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--text-primary)" }}>{a.name}</td>
                        <td style={{ padding: "12px 16px", color: "var(--text-secondary)", fontFamily: "monospace" }}>{a.serial_number || "—"}</td>
                        <td style={{ padding: "12px 16px" }}><span style={{ ...statusBadge(a.status), padding: "4px 12px", borderRadius: "50px", fontWeight: 700, fontSize: "12px", whiteSpace: "nowrap" }}>{a.status}</span></td>
                        <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{a.assigned_to_name || "—"}</td>
                        <td style={{ padding: "12px 16px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{a.assigned_date ? new Date(a.assigned_date).toLocaleDateString() : "—"}</td>
                      </tr>
                    ))}
                    {assets.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No assets found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add Asset */}
          {tab === "add" && (
            <div style={{ ...card, padding: "32px", maxWidth: "500px" }}>
              <h3 style={{ margin: "0 0 24px", color: "var(--text-primary)", fontSize: "18px", fontWeight: 700, borderBottom: "1px solid var(--border-light)", paddingBottom: "12px" }}>➕ Add New Asset</h3>
              <label style={formLabelStyle}>Asset Name *</label>
              <input style={inputSt} placeholder="e.g. Dell Latitude 5520" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} onFocus={e => e.target.style.borderColor = "var(--accent-blue)"} onBlur={e => e.target.style.borderColor = "var(--border-medium)"} />
              <label style={formLabelStyle}>Type *</label>
              <select style={{ ...inputSt, cursor: "pointer", appearance: "none" }} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} onFocus={e => e.target.style.borderColor = "var(--accent-blue)"} onBlur={e => e.target.style.borderColor = "var(--border-medium)"}>
                {["Laptop", "Monitor", "ID Card", "Mouse", "Keyboard", "Phone", "Other"].map(t => <option key={t} style={{ background: "var(--bg-card)" }}>{t}</option>)}
              </select>
              <label style={formLabelStyle}>Serial Number</label>
              <input style={inputSt} placeholder="e.g. SN-2024-001" value={form.serial_number} onChange={e => setForm({ ...form, serial_number: e.target.value })} onFocus={e => e.target.style.borderColor = "var(--accent-blue)"} onBlur={e => e.target.style.borderColor = "var(--border-medium)"} />
              <label style={formLabelStyle}>Description</label>
              <input style={inputSt} placeholder="Optional notes..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} onFocus={e => e.target.style.borderColor = "var(--accent-blue)"} onBlur={e => e.target.style.borderColor = "var(--border-medium)"} />
              <button onClick={createAsset} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))", color: "var(--text-primary)", border: "none", borderRadius: "50px", fontWeight: 800, fontSize: "15px", cursor: "pointer", marginTop: "8px", boxShadow: "0 4px 16px rgba(0,184,255,0.3)", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>Create Asset</button>
            </div>
          )}

          {/* Assign Asset */}
          {tab === "assign" && (
            <div style={{ ...card, padding: "32px", maxWidth: "500px" }}>
              <h3 style={{ margin: "0 0 24px", color: "var(--text-primary)", fontSize: "18px", fontWeight: 700, borderBottom: "1px solid var(--border-light)", paddingBottom: "12px" }}>🔗 Assign Asset</h3>
              <label style={formLabelStyle}>Select Asset *</label>
              <select style={{ ...inputSt, cursor: "pointer", appearance: "none" }} value={assignForm.asset_id} onChange={e => setAssignForm({ ...assignForm, asset_id: e.target.value })} onFocus={e => e.target.style.borderColor = "var(--accent-cyan)"} onBlur={e => e.target.style.borderColor = "var(--border-medium)"}>
                <option value="" style={{ background: "var(--bg-card)" }}>-- Select Available Asset --</option>
                {assets.filter(a => a.status === "Available").map(a => <option key={a.id} value={a.id} style={{ background: "var(--bg-card)" }}>{typeIcon(a.type)} {a.name} ({a.type})</option>)}
              </select>
              <label style={formLabelStyle}>Select Employee *</label>
              <select style={{ ...inputSt, cursor: "pointer", appearance: "none" }} value={assignForm.employee_id} onChange={e => setAssignForm({ ...assignForm, employee_id: e.target.value })} onFocus={e => e.target.style.borderColor = "var(--accent-cyan)"} onBlur={e => e.target.style.borderColor = "var(--border-medium)"}>
                <option value="" style={{ background: "var(--bg-card)" }}>-- Select Employee --</option>
                {employees.map(e => <option key={e.profile_id} value={e.profile_id} style={{ background: "var(--bg-card)" }}>{e.name} ({e.designation || e.role})</option>)}
              </select>
              <label style={formLabelStyle}>Notes</label>
              <input style={inputSt} placeholder="Optional notes..." value={assignForm.notes} onChange={e => setAssignForm({ ...assignForm, notes: e.target.value })} onFocus={e => e.target.style.borderColor = "var(--accent-cyan)"} onBlur={e => e.target.style.borderColor = "var(--border-medium)"} />
              <button onClick={assignAsset} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))", color: "var(--bg-main)", border: "none", borderRadius: "50px", fontWeight: 800, fontSize: "15px", cursor: "pointer", marginTop: "8px", boxShadow: "0 4px 16px rgba(0,255,194,0.3)", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>Assign Asset</button>
            </div>
          )}

          {/* History */}
          {tab === "history" && (
            <div style={{ ...card, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-light)" }}>
                <h3 style={{ margin: 0, color: "var(--text-primary)", fontSize: "16px", fontWeight: 700 }}>Assignment History ({assignments.length})</h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                      {["Asset", "Type", "Serial No.", "Employee", "Assigned", "Returned", "Status", "Action"].map(h => <th key={h} style={{ padding: "16px", textAlign: "left", color: "var(--text-muted)", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(a => (
                      <tr key={a.assignment_id} style={{ borderBottom: "1px solid var(--bg-input)" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--text-primary)" }}>{a.asset_name}</td>
                        <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{typeIcon(a.type)} {a.type}</td>
                        <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontFamily: "monospace" }}>{a.serial_number || "—"}</td>
                        <td style={{ padding: "12px 16px", color: "var(--text-primary)" }}>{a.employee_name}</td>
                        <td style={{ padding: "12px 16px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{new Date(a.assigned_date).toLocaleDateString()}</td>
                        <td style={{ padding: "12px 16px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{a.return_date ? new Date(a.return_date).toLocaleDateString() : "—"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ background: a.status === "Active" ? "rgba(0,184,255,0.1)" : "rgba(0,255,194,0.1)", color: a.status === "Active" ? "var(--accent-blue)" : "var(--accent-cyan)", border: a.status === "Active" ? "1px solid rgba(0,184,255,0.2)" : "1px solid rgba(0,255,194,0.2)", padding: "4px 12px", borderRadius: "50px", fontWeight: 700, fontSize: "12px" }}>{a.status}</span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {a.status === "Active" && (
                            <button onClick={() => returnAsset(a.assignment_id)} style={{ background: "rgba(255,61,113,0.1)", color: "var(--accent-red)", border: "1px solid rgba(255,61,113,0.2)", padding: "6px 14px", borderRadius: "50px", cursor: "pointer", fontSize: "12px", fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>↩️ Return</button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {assignments.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No assignment history.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AssetManagement;
