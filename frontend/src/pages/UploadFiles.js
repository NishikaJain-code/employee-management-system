import { useState, useEffect } from "react";
import api from "../utils/api";

const card = { background: "var(--bg-card)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: "24px", border: "1px solid var(--border-light)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" };

function UploadFiles() {
  const [files, setFiles] = useState([]);
  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { fetchProfileId(); }, []);

  const fetchProfileId = async () => {
    try { const res = await api.get("/api/auth/user"); setProfileId(res.data.employee_profile_id); }
    catch (err) { console.error(err); setError("Failed to fetch user details. Please log in again."); }
  };

  const handleChange = (e) => setFiles(e.target.files);

  const uploadFiles = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) { setError("Please select at least one file to upload."); return; }
    if (!profileId) { setError("No active employee profile associated with this account."); return; }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append("photos", files[i]);

    try {
      setLoading(true); setError(""); setMessage("");
      const res = await api.post(`/api/employees/${profileId}/upload`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage(res.data.message || "Files uploaded successfully!"); setFiles([]);
    } catch (err) { setError(err.response?.data?.message || "File upload failed. Ensure files are images under 5MB."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", paddingBottom: "40px" }}>
      <div style={{ ...card, padding: "28px 32px", marginBottom: "24px", background: "linear-gradient(135deg, rgba(123,97,255,0.12) 0%, rgba(0,184,255,0.08) 100%)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Verification Documents</h2>
          <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: "14px" }}>Upload identification cards and certificates</p>
        </div>
        <div style={{ fontSize: "40px" }}>📁</div>
      </div>

      <div style={{ ...card, padding: "40px", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: "56px", marginBottom: "20px" }}>☁️</div>
        <h2 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "var(--text-primary)", fontWeight: 800 }}>Upload Files</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "0 0 32px 0" }}>Images only (.jpg, .jpeg, .png, .gif) — Max 5MB</p>

        {error && <div style={{ background: "rgba(255,61,113,0.1)", color: "var(--accent-red)", border: "1px solid rgba(255,61,113,0.2)", borderRadius: "12px", padding: "14px", fontSize: "14px", fontWeight: 600, marginBottom: "24px", textAlign: "left" }}>⚠️ {error}</div>}
        {message && <div style={{ background: "rgba(0,255,194,0.1)", color: "var(--accent-cyan)", border: "1px solid rgba(0,255,194,0.2)", borderRadius: "12px", padding: "14px", fontSize: "14px", fontWeight: 600, marginBottom: "24px", textAlign: "left" }}>✅ {message}</div>}

        <form onSubmit={uploadFiles}>
          <div style={{
            border: "2px dashed rgba(255,255,255,0.1)", borderRadius: "16px", padding: "32px", background: "var(--bg-hover)",
            cursor: "pointer", marginBottom: "28px", position: "relative", transition: "border-color 0.2s, background 0.2s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-purple)"; e.currentTarget.style.background = "rgba(123,97,255,0.05)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "var(--bg-hover)"; }}
          >
            <input type="file" multiple onChange={handleChange} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />
            <p style={{ margin: 0, fontWeight: 700, color: "var(--text-secondary)", fontSize: "15px" }}>Click to browse files or drag them here</p>
            {files.length > 0 && <div style={{ marginTop: "16px", color: "var(--accent-blue)", fontWeight: 800, fontSize: "14px" }}>📎 {files.length} file(s) selected</div>}
          </div>

          {files.length > 0 && (
            <div style={{ textAlign: "left", background: "var(--bg-hover)", borderRadius: "12px", padding: "16px 20px", marginBottom: "28px", border: "1px solid var(--border-light)" }}>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Files to Upload:</h4>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", color: "var(--text-primary)" }}>
                {Array.from(files).map((file, idx) => (
                  <li key={idx} style={{ marginBottom: "6px", fontWeight: 600 }}>{file.name} <span style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: 400 }}>({Math.round(file.size / 1024)} KB)</span></li>
                ))}
              </ul>
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", background: loading ? "var(--border-light)" : "linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)",
            color: loading ? "var(--text-muted)" : "#fff", border: "none", borderRadius: "50px", padding: "16px", fontSize: "15px", fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 15px rgba(123,97,255,0.3)", transition: "transform 0.2s"
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = "scale(1.02)"; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.transform = "scale(1)"; }}
          >{loading ? "Uploading files..." : "Upload Securely"}</button>
        </form>
      </div>
    </div>
  );
}

export default UploadFiles;