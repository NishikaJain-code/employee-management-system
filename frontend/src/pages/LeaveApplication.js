import { useState, useEffect } from "react";
import api from "../utils/api";

const D = { background: "var(--bg-main)", fontFamily: "'Outfit', sans-serif", padding: "8px 0", minHeight: "100vh" };
const card = { background: "var(--bg-card)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: "24px", border: "1px solid var(--border-light)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" };
const labelSt = { display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" };
const inputSt = { width: "100%", padding: "12px 16px", background: "var(--bg-input)", border: "1px solid var(--border-medium)", borderRadius: "14px", fontSize: "14px", boxSizing: "border-box", outline: "none", color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif", transition: "border-color 0.2s, box-shadow 0.2s" };
const inF = (e) => { e.target.style.borderColor = "var(--accent-cyan)"; e.target.style.boxShadow = "0 0 0 4px rgba(0,255,194,0.08)"; };
const inB = (e) => { e.target.style.borderColor = "var(--border-medium)"; e.target.style.boxShadow = "none"; };

function LeaveApplication() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [totalDays, setTotalDays] = useState("");
  const [reason, setReason] = useState("");
  const [balance, setBalance] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchLeaveTypes(); fetchBalance(); }, []);

  const fetchLeaveTypes = async () => {
    try { const res = await api.get("/api/leaves/types"); setLeaveTypes(res.data); } catch (err) { console.error(err); }
  };
  const fetchBalance = async () => {
    try { const res = await api.get("/api/leaves/balance"); setBalance(res.data); } catch (err) { console.error(err); }
  };
  const handleDateChange = (from, to) => {
    if (from && to) { const diff = Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1; setTotalDays(diff > 0 ? diff.toString() : ""); }
  };
  const applyLeave = async () => {
    if (!leaveTypeId || !fromDate || !toDate || !totalDays || !reason.trim()) { alert("Please fill all fields."); return; }
    try {
      setSubmitting(true);
      const res = await api.post("/api/leaves/apply", { leave_type_id: leaveTypeId, from_date: fromDate, to_date: toDate, total_days: parseInt(totalDays), reason });
      alert("✅ " + res.data.message);
      setLeaveTypeId(""); setFromDate(""); setToDate(""); setTotalDays(""); setReason("");
      fetchBalance();
    } catch (err) { alert(err.response?.data?.message || "Error applying for leave."); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={D}>
      {/* Header */}
      <div style={{ ...card, padding: "28px 32px", marginBottom: "24px", background: "linear-gradient(135deg, rgba(0,255,194,0.1) 0%, rgba(0,184,255,0.1) 100%)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Apply for Leave</h2>
          <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: "14px" }}>Submit a new leave application</p>
        </div>
        <div style={{ fontSize: "40px" }}>📝</div>
      </div>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        {/* Form */}
        <div style={{ ...card, padding: "28px", flex: "1", minWidth: "300px" }}>
          <div style={{ marginBottom: "18px" }}>
            <label style={labelSt}>Leave Type</label>
            <select value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)} style={{ ...inputSt, cursor: "pointer" }} onFocus={inF} onBlur={inB}>
              <option value="" style={{ background: "var(--bg-card)" }}>-- Select Leave Type --</option>
              {leaveTypes.map((lt) => <option key={lt.id} value={lt.id} style={{ background: "var(--bg-card)" }}>{lt.leave_name}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", gap: "14px", marginBottom: "18px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelSt}>From Date</label>
              <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); handleDateChange(e.target.value, toDate); }} style={{ ...inputSt, colorScheme: "dark" }} onFocus={inF} onBlur={inB} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelSt}>To Date</label>
              <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); handleDateChange(fromDate, e.target.value); }} style={{ ...inputSt, colorScheme: "dark" }} onFocus={inF} onBlur={inB} />
            </div>
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={labelSt}>Total Days</label>
            <input type="number" placeholder="Auto-calculated" value={totalDays} onChange={(e) => setTotalDays(e.target.value)} style={inputSt} onFocus={inF} onBlur={inB} />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={labelSt}>Reason</label>
            <textarea placeholder="Provide a detailed reason..." value={reason} onChange={(e) => setReason(e.target.value)} rows={4}
              style={{ ...inputSt, borderRadius: "14px", resize: "vertical" }} onFocus={inF} onBlur={inB} />
          </div>

          <button onClick={applyLeave} disabled={submitting} style={{
            width: "100%", padding: "14px",
            background: submitting ? "var(--border-light)" : "linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))",
            color: submitting ? "var(--text-muted)" : "var(--bg-main)",
            border: "none", borderRadius: "50px", fontWeight: 800, fontSize: "15px",
            cursor: submitting ? "not-allowed" : "pointer",
            boxShadow: submitting ? "none" : "0 4px 20px rgba(0,255,194,0.3)",
            fontFamily: "'Outfit', sans-serif", transition: "transform 0.2s"
          }}
          onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.transform = "scale(1.02)"; }}
          onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.transform = "scale(1)"; }}
          >
            {submitting ? "⏳ Submitting..." : "📤 Submit Application"}
          </button>
        </div>

        {/* Balance */}
        <div style={{ ...card, padding: "28px", minWidth: "240px" }}>
          <h3 style={{ margin: "0 0 20px", color: "var(--text-primary)", fontSize: "16px", fontWeight: 700 }}>📊 My Leave Balance</h3>
          {balance.map((b, i) => (
            <div key={i} style={{ padding: "14px 16px", marginBottom: "10px", background: "rgba(0,255,194,0.05)", borderRadius: "16px", border: "1px solid rgba(0,255,194,0.1)" }}>
              <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "14px" }}>{b.leave_name}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "13px" }}>
                <span style={{ color: "var(--text-muted)" }}>Available:</span>
                <span style={{ fontWeight: 800, color: "var(--accent-cyan)" }}>{b.available_days} / {b.max_days}</span>
              </div>
            </div>
          ))}
          {balance.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No leave balance found. Contact HR.</p>}
        </div>
      </div>
    </div>
  );
}

export default LeaveApplication;