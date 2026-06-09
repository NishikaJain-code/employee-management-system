import { useState, useEffect } from "react";
import api from "../utils/api";

function UploadFiles() {
  const [files, setFiles] = useState([]);
  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfileId();
  }, []);

  const fetchProfileId = async () => {
    try {
      const res = await api.get("/api/auth/user");
      setProfileId(res.data.employee_profile_id);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch user details. Please log in again.");
    }
  };

  const handleChange = (e) => {
    setFiles(e.target.files);
  };

  const uploadFiles = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      setError("Please select at least one file to upload.");
      return;
    }
    if (!profileId) {
      setError("No active employee profile associated with this account.");
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("photos", files[i]); // Matches upload.array("photos", 5)
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");
      
      const res = await api.post(
        `/api/employees/${profileId}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(res.data.message || "Files uploaded successfully!");
      setFiles([]);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "File upload failed. Ensure files are images (.jpg, .png, etc.) under 5MB.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "32px", fontFamily: "'Segoe UI', sans-serif", background: "#f0f4ff", minHeight: "100vh" }}>
      
      {/* Header card */}
      <div style={{
        background: "linear-gradient(135deg, #6c63ff 0%, #4facfe 100%)",
        borderRadius: "20px",
        padding: "32px 36px",
        marginBottom: "32px",
        color: "#fff",
        boxShadow: "0 8px 32px rgba(108,99,255,0.3)"
      }}>
        <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>📁 Verification Documents</h1>
        <p style={{ margin: "8px 0 0", opacity: 0.85 }}>
          Upload identification cards, certificates, or professional documents securely
        </p>
      </div>

      <div style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "40px",
        maxWidth: "600px",
        margin: "0 auto",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "56px", marginBottom: "20px" }}>☁️</div>
        <h2 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#2d3748" }}>Upload Files</h2>
        <p style={{ color: "#718096", fontSize: "14px", margin: "0 0 32px 0" }}>
          Images only (.jpg, .jpeg, .png, .gif) — Max 5MB per file
        </p>

        {error && (
          <div style={{
            background: "#fff5f5",
            color: "#e53e3e",
            border: "1px solid #fed7d7",
            borderRadius: "12px",
            padding: "14px",
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "24px",
            textAlign: "left"
          }}>
            ⚠️ {error}
          </div>
        )}

        {message && (
          <div style={{
            background: "#f0fff4",
            color: "#38a169",
            border: "1px solid #c6f6d5",
            borderRadius: "12px",
            padding: "14px",
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "24px",
            textAlign: "left"
          }}>
            ✅ {message}
          </div>
        )}

        <form onSubmit={uploadFiles}>
          <div style={{
            border: "2px dashed #cbd5e0",
            borderRadius: "16px",
            padding: "32px",
            background: "#f7f9ff",
            cursor: "pointer",
            marginBottom: "28px",
            position: "relative",
            transition: "border-color 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = "#6c63ff"}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = "#cbd5e0"}
          >
            <input
              type="file"
              multiple
              onChange={handleChange}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                cursor: "pointer"
              }}
            />
            <p style={{ margin: 0, fontWeight: 600, color: "#4a5568", fontSize: "15px" }}>
              Click to browse files or drag them here
            </p>
            {files.length > 0 && (
              <div style={{ marginTop: "16px", color: "#6c63ff", fontWeight: 700, fontSize: "14px" }}>
                📎 {files.length} file(s) selected
              </div>
            )}
          </div>

          {files.length > 0 && (
            <div style={{
              textAlign: "left",
              background: "#f7f9ff",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "28px",
              border: "1px solid #edf2f7"
            }}>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#718096", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Files to Upload:
              </h4>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", color: "#2d3748" }}>
                {Array.from(files).map((file, idx) => (
                  <li key={idx} style={{ marginBottom: "6px" }}>
                    {file.name} <span style={{ color: "#718096", fontSize: "12px" }}>({Math.round(file.size / 1024)} KB)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "#a0aec0" : "linear-gradient(135deg, #6c63ff 0%, #4facfe 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "16px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 15px rgba(108, 99, 255, 0.3)",
              transition: "transform 0.1s"
            }}
          >
            {loading ? "Uploading files..." : "Upload Securely"}
          </button>
        </form>
      </div>

    </div>
  );
}

export default UploadFiles;