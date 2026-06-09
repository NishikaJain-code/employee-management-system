import { useEffect, useState } from "react";
import api from "../utils/api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount]   = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [notifRes, countRes] = await Promise.all([
        api.get("/api/notifications"),
        api.get("/api/notifications/unread-count"),
      ]);
      setNotifications(notifRes.data);
      setUnreadCount(countRes.data.count);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const deleteNotif = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Delete notif error:", err);
    }
  };

  const typeIcon = (type) => {
    const icons = {
      leave_approved: "✅",
      leave_rejected: "❌",
      asset_assigned: "💻",
      general: "🔔",
    };
    return icons[type] || "🔔";
  };

  const typeColor = (type) => {
    const colors = {
      leave_approved: "#f0fff4",
      leave_rejected: "#fff5f5",
      asset_assigned: "#ebf8ff",
      general: "#fefcbf",
    };
    return colors[type] || "#f7fafc";
  };

  return (
    <div style={{ padding: "32px", fontFamily: "'Segoe UI', sans-serif", background: "#f0f4ff", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg,#f6d365,#fda085)",
        borderRadius: "16px",
        padding: "24px 28px",
        color: "#fff",
        marginBottom: "28px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <h2 style={{ margin: 0 }}>🔔 Notifications</h2>
          <p style={{ margin: "6px 0 0", opacity: 0.85 }}>
            {unreadCount > 0 ? `You have ${unreadCount} unread notification(s)` : "All caught up! 🎉"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              background: "rgba(255,255,255,0.25)",
              color: "#fff",
              border: "2px solid rgba(255,255,255,0.5)",
              padding: "8px 18px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            ✔️ Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#fda085" }}>⏳ Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          color: "#aaa",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
          <h3 style={{ margin: "0 0 8px", color: "#555" }}>No Notifications Yet</h3>
          <p style={{ margin: 0, fontSize: "14px" }}>You'll be notified when leaves are approved/rejected or assets are assigned.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                background: n.is_read ? "#fff" : typeColor(n.type),
                borderRadius: "14px",
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                boxShadow: n.is_read ? "0 2px 8px rgba(0,0,0,0.05)" : "0 4px 16px rgba(0,0,0,0.1)",
                borderLeft: n.is_read ? "4px solid #e2e8f0" : "4px solid #fda085",
                transition: "all 0.2s",
              }}
            >
              {/* Icon */}
              <div style={{ fontSize: "28px", minWidth: "36px", textAlign: "center" }}>
                {typeIcon(n.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <p style={{
                  margin: "0 0 4px",
                  fontWeight: n.is_read ? 400 : 600,
                  color: "#2d3748",
                  fontSize: "14px",
                }}>
                  {n.message}
                </p>
                <span style={{ fontSize: "12px", color: "#a0aec0" }}>
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                {!n.is_read && (
                  <button
                    onClick={() => markRead(n.id)}
                    style={{
                      background: "#38a169",
                      color: "#fff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    ✓ Read
                  </button>
                )}
                <button
                  onClick={() => deleteNotif(n.id)}
                  style={{
                    background: "#e53e3e",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
