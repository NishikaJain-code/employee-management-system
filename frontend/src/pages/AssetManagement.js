import { useEffect, useState } from "react";
import api from "../utils/api";

function AssetManagement() {
  const [assets, setAssets]           = useState([]);
  const [employees, setEmployees]     = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tab, setTab]                 = useState("assets"); // assets | assign | history
  const [loading, setLoading]         = useState(true);

  // New asset form
  const [form, setForm] = useState({ name: "", type: "Laptop", serial_number: "", description: "" });
  // Assign form
  const [assignForm, setAssignForm] = useState({ asset_id: "", employee_id: "", notes: "" });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [a, e, h] = await Promise.all([
        api.get("/api/assets"),
        api.get("/api/employees"),
        api.get("/api/assets/all-assignments"),
      ]);
      setAssets(a.data.assets || []);
      setEmployees(e.data || []);
      setAssignments(h.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Error loading data. Ensure you are logged in as Admin/HR.");
    } finally {
      setLoading(false);
    }
  };

  const createAsset = async () => {
    if (!form.name || !form.type) { alert("Name and type are required."); return; }
    try {
      await api.post("/api/assets", form);
      alert("✅ Asset created!");
      setForm({ name: "", type: "Laptop", serial_number: "", description: "" });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating asset.");
    }
  };

  const assignAsset = async () => {
    if (!assignForm.asset_id || !assignForm.employee_id) { alert("Select asset and employee."); return; }
    try {
      await api.post("/api/assets/assign", assignForm);
      alert("✅ Asset assigned successfully!");
      setAssignForm({ asset_id: "", employee_id: "", notes: "" });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Error assigning asset.");
    }
  };

  const returnAsset = async (assignmentId) => {
    if (!window.confirm("Mark this asset as returned?")) return;
    try {
      await api.put(`/api/assets/return/${assignmentId}`);
      alert("✅ Asset returned!");
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Error returning asset.");
    }
  };

  const typeIcon = (type) => {
    const icons = { Laptop: "💻", Monitor: "🖥️", "ID Card": "🪪", Mouse: "🖱️", Keyboard: "⌨️", Phone: "📱", Other: "📦" };
    return icons[type] || "📦";
  };

  const statusBadge = (status) => {
    const styles = {
      Available: { background: "#f0fff4", color: "#38a169" },
      Assigned:  { background: "#ebf8ff", color: "#3182ce" },
      "Under Maintenance": { background: "#fffbea", color: "#d69e2e" },
      Retired:   { background: "#fff5f5", color: "#e53e3e" },
    };
    return styles[status] || { background: "#f7fafc", color: "#718096" };
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box",
    marginBottom: "14px",
  };

  const tabStyle = (active) => ({
    padding: "10px 20px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
    background: active ? "linear-gradient(135deg,#6c63ff,#4facfe)" : "#fff",
    color: active ? "#fff" : "#555",
    boxShadow: active ? "0 4px 12px rgba(108,99,255,0.3)" : "none",
    transition: "all 0.2s",
  });

  return (
    <div style={{ padding: "32px", fontFamily: "'Segoe UI', sans-serif", background: "#f0f4ff", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg,#30cfd0,#667eea)",
        borderRadius: "16px",
        padding: "24px 28px",
        color: "#fff",
        marginBottom: "28px",
      }}>
        <h2 style={{ margin: 0 }}>🏗️ Asset Management System</h2>
        <p style={{ margin: "6px 0 0", opacity: 0.85 }}>Manage laptops, monitors, ID cards and more</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <button style={tabStyle(tab === "assets")} onClick={() => setTab("assets")}>📦 Assets</button>
        <button style={tabStyle(tab === "add")}    onClick={() => setTab("add")}>➕ Add Asset</button>
        <button style={tabStyle(tab === "assign")} onClick={() => setTab("assign")}>🔗 Assign Asset</button>
        <button style={tabStyle(tab === "history")}onClick={() => setTab("history")}>📋 Assignment History</button>
      </div>

      {loading && <p style={{ textAlign: "center", color: "#6c63ff" }}>⏳ Loading...</p>}

      {/* Asset List Tab */}
      {!loading && tab === "assets" && (
        <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, color: "#2d3748" }}>All Assets ({assets.length})</h3>
            <div style={{ fontSize: "13px", color: "#888" }}>
              Available: <strong style={{ color: "#38a169" }}>{assets.filter(a => a.status === "Available").length}</strong>
              &nbsp;| Assigned: <strong style={{ color: "#3182ce" }}>{assets.filter(a => a.status === "Assigned").length}</strong>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#f0f4ff" }}>
                {["Type", "Name", "Serial No.", "Status", "Assigned To", "Assigned Date"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#555", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px 16px", fontSize: "20px" }}>{typeIcon(a.type)}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#2d3748" }}>{a.name}</td>
                  <td style={{ padding: "12px 16px", color: "#888", fontFamily: "monospace" }}>{a.serial_number || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ ...statusBadge(a.status), padding: "4px 12px", borderRadius: "20px", fontWeight: 600, fontSize: "12px" }}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#555" }}>{a.assigned_to_name || "—"}</td>
                  <td style={{ padding: "12px 16px", color: "#888" }}>
                    {a.assigned_date ? new Date(a.assigned_date).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "#aaa" }}>No assets found. Add one first.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Asset Tab */}
      {!loading && tab === "add" && (
        <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", maxWidth: "500px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <h3 style={{ margin: "0 0 20px", color: "#2d3748" }}>➕ Add New Asset</h3>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px", color: "#555" }}>Asset Name *</label>
          <input style={inputStyle} placeholder="e.g. Dell Latitude 5520" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />

          <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px", color: "#555" }}>Type *</label>
          <select style={inputStyle} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            {["Laptop", "Monitor", "ID Card", "Mouse", "Keyboard", "Phone", "Other"].map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>

          <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px", color: "#555" }}>Serial Number</label>
          <input style={inputStyle} placeholder="e.g. SN-2024-001" value={form.serial_number} onChange={e => setForm({ ...form, serial_number: e.target.value })} />

          <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px", color: "#555" }}>Description</label>
          <input style={inputStyle} placeholder="Optional notes..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

          <button onClick={createAsset} style={{
            width: "100%", padding: "12px", background: "linear-gradient(135deg,#30cfd0,#667eea)",
            color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "15px", cursor: "pointer"
          }}>
            ✅ Create Asset
          </button>
        </div>
      )}

      {/* Assign Asset Tab */}
      {!loading && tab === "assign" && (
        <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", maxWidth: "500px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <h3 style={{ margin: "0 0 20px", color: "#2d3748" }}>🔗 Assign Asset to Employee</h3>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px", color: "#555" }}>Select Asset *</label>
          <select style={inputStyle} value={assignForm.asset_id} onChange={e => setAssignForm({ ...assignForm, asset_id: e.target.value })}>
            <option value="">-- Select Available Asset --</option>
            {assets.filter(a => a.status === "Available").map(a => (
              <option key={a.id} value={a.id}>{typeIcon(a.type)} {a.name} ({a.type})</option>
            ))}
          </select>

          <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px", color: "#555" }}>Select Employee *</label>
          <select style={inputStyle} value={assignForm.employee_id} onChange={e => setAssignForm({ ...assignForm, employee_id: e.target.value })}>
            <option value="">-- Select Employee --</option>
            {employees.map(e => (
              <option key={e.profile_id} value={e.profile_id}>{e.name} ({e.designation || e.role})</option>
            ))}
          </select>

          <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px", color: "#555" }}>Notes</label>
          <input style={inputStyle} placeholder="Optional notes..." value={assignForm.notes} onChange={e => setAssignForm({ ...assignForm, notes: e.target.value })} />

          <button onClick={assignAsset} style={{
            width: "100%", padding: "12px", background: "linear-gradient(135deg,#667eea,#6c63ff)",
            color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "15px", cursor: "pointer"
          }}>
            🔗 Assign Asset
          </button>
        </div>
      )}

      {/* Assignment History Tab */}
      {!loading && tab === "history" && (
        <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #eee" }}>
            <h3 style={{ margin: 0, color: "#2d3748" }}>📋 Assignment History ({assignments.length})</h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#f0f4ff" }}>
                {["Asset", "Type", "Serial No.", "Employee", "Assigned", "Returned", "Status", "Action"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#555", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a.assignment_id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#2d3748" }}>{a.asset_name}</td>
                  <td style={{ padding: "12px 16px" }}>{typeIcon(a.type)} {a.type}</td>
                  <td style={{ padding: "12px 16px", color: "#888", fontFamily: "monospace" }}>{a.serial_number || "—"}</td>
                  <td style={{ padding: "12px 16px", color: "#555" }}>{a.employee_name}</td>
                  <td style={{ padding: "12px 16px", color: "#888" }}>{new Date(a.assigned_date).toLocaleDateString()}</td>
                  <td style={{ padding: "12px 16px", color: "#888" }}>{a.return_date ? new Date(a.return_date).toLocaleDateString() : "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      background: a.status === "Active" ? "#ebf8ff" : "#f0fff4",
                      color: a.status === "Active" ? "#3182ce" : "#38a169",
                      padding: "4px 12px", borderRadius: "20px", fontWeight: 600, fontSize: "12px"
                    }}>{a.status}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {a.status === "Active" && (
                      <button onClick={() => returnAsset(a.assignment_id)} style={{
                        background: "#e53e3e", color: "#fff", border: "none",
                        padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px"
                      }}>↩️ Return</button>
                    )}
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "24px", color: "#aaa" }}>No assignment history.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AssetManagement;
