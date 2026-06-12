import { useEffect, useState } from "react";
import api from "../utils/api";

const card = { background: "var(--bg-card)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: "24px", border: "1px solid var(--border-light)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" };

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [notifRes, countRes] = await Promise.all([ api.get("/api/notifications"), api.get("/api/notifications/unread-count") ]);
      setNotifications(notifRes.data); setUnreadCount(countRes.data.count);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try {
      await api.put("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const deleteNotif = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) { console.error(err); }
  };

  const typeIcon = (type) => ({ leave_approved: "✅", leave_rejected: "❌", asset_assigned: "💻", general: "🔔" }[type] || "🔔");

  const typeColor = (type, isRead) => {
    if (isRead) return { bg: "var(--bg-hover)", border: "var(--border-light)" };
    const colors = { leave_approved: { bg: "rgba(0,255,194,0.1)", border: "rgba(0,255,194,0.3)" }, leave_rejected: { bg: "rgba(255,61,113,0.1)", border: "rgba(255,61,113,0.3)" }, asset_assigned: { bg: "rgba(0,184,255,0.1)", border: "rgba(0,184,255,0.3)" }, general: { bg: "rgba(255,184,0,0.1)", border: "rgba(255,184,0,0.3)" } };
    return colors[type] || { bg: "var(--border-light)", border: "rgba(255,255,255,0.1)" };
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", paddingBottom: "40px" }}>
      <div style={{ ...card, padding: "28px 32px", marginBottom: "24px", background: "linear-gradient(135deg, rgba(255,184,0,0.1) 0%, rgba(255,61,113,0.08) 100%)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Notifications</h2>
          <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: "14px" }}>
            {unreadCount > 0 ? <><span style={{ color: "var(--accent-yellow)", fontWeight: 700 }}>{unreadCount}</span> unread notification(s)</> : "All caught up! 🎉"}
          </p>
        </div>
        <div style={{ fontSize: "40px" }}>🔔</div>
      </div>

      {unreadCount > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
          <button onClick={markAllRead} style={{ background: "rgba(0,255,194,0.1)", color: "var(--accent-cyan)", border: "1px solid rgba(0,255,194,0.2)", padding: "8px 20px", borderRadius: "50px", cursor: "pointer", fontWeight: 700, fontSize: "13px", fontFamily: "'Outfit', sans-serif", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--accent-cyan)"; e.currentTarget.style.color = "var(--bg-main)"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,255,194,0.1)"; e.currentTarget.style.color = "var(--accent-cyan)"; }}>✔️ Mark All Read</button>
        </div>
      )}

      {loading ? <p style={{ textAlign: "center", color: "var(--accent-yellow)", fontWeight: 700 }}>⏳ Loading notifications...</p> : notifications.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "60px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>📭</div>
          <h3 style={{ margin: "0 0 8px", color: "var(--text-primary)", fontSize: "18px" }}>No Notifications Yet</h3>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>You'll be notified when leaves are processed or assets are assigned.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {notifications.map((n) => {
            const colors = typeColor(n.type, n.is_read);
            return (
              <div key={n.id} style={{ ...card, background: colors.bg, borderRadius: "16px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "20px", borderLeft: `4px solid ${colors.border}`, transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"}>
                <div style={{ fontSize: "28px", minWidth: "36px", textAlign: "center" }}>{typeIcon(n.type)}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 6px", fontWeight: n.is_read ? 600 : 800, color: n.is_read ? "var(--text-secondary)" : "var(--text-primary)", fontSize: "15px" }}>{n.message}</p>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>{new Date(n.created_at).toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  {!n.is_read && (
                    <button onClick={() => markRead(n.id)} style={{ background: "rgba(0,255,194,0.1)", color: "var(--accent-cyan)", border: "1px solid rgba(0,255,194,0.2)", padding: "8px 16px", borderRadius: "50px", cursor: "pointer", fontSize: "12px", fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>✓ Read</button>
                  )}
                  <button onClick={() => deleteNotif(n.id)} style={{ background: "rgba(255,61,113,0.1)", color: "var(--accent-red)", border: "1px solid rgba(255,61,113,0.2)", padding: "8px 16px", borderRadius: "50px", cursor: "pointer", fontSize: "12px", fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>🗑️ Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;
