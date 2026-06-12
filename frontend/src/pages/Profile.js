import { useEffect, useState } from "react";
import api from "../utils/api";

const card = { background: "var(--bg-card)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: "24px", border: "1px solid var(--border-light)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" };
const formLabelStyle = { display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" };
const inputStyle = { width: "100%", padding: "14px 16px", background: "var(--bg-input)", border: "1px solid var(--border-medium)", borderRadius: "14px", fontSize: "14px", boxSizing: "border-box", outline: "none", color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif" };
const detailRowStyle = { display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid var(--border-light)" };
const labelStyle = { fontSize: "14px", fontWeight: 700, color: "var(--text-secondary)" };
const valueStyle = { fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" };

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true); setError("");
      const userRes = await api.get("/api/auth/user");
      const profileId = userRes.data.employee_profile_id;
      if (!profileId) { setError("No employee profile found for this account."); setLoading(false); return; }

      const empRes = await api.get(`/api/employees/${profileId}`);
      setProfile(empRes.data);
      setPhone(empRes.data.phone || ""); setAddress(empRes.data.address || "");
      setSelectedSkills((empRes.data.skills || []).map((s) => s.id));

      const skillsRes = await api.get("/api/skills");
      setAvailableSkills(skillsRes.data || []);
    } catch (err) { console.error(err); setError("Failed to load profile details."); }
    finally { setLoading(false); }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const formData = new FormData(); formData.append("profile_pic", file);
    try {
      setLoading(true);
      await api.post(`/api/employees/${profile.profile_id}/profile-pic`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      fetchProfile(); alert("Profile picture updated!");
    } catch (err) { alert(err.response?.data?.message || "Upload failed."); }
    finally { setLoading(false); }
  };

  const handleSkillChange = (skillId) => {
    if (selectedSkills.includes(skillId)) setSelectedSkills(selectedSkills.filter((id) => id !== skillId));
    else setSelectedSkills([...selectedSkills, skillId]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/employees/${profile.profile_id}`, { phone, address, designation: profile.designation, salary: profile.salary, department_id: profile.department_id, skills: selectedSkills });
      setEditing(false); fetchProfile(); alert("Profile updated!");
    } catch (err) { alert(err.response?.data?.message || "Failed to update profile."); }
  };

  if (loading) return <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "60px" }}>Loading profile...</div>;
  if (error) return <div style={{ padding: "40px", color: "var(--accent-red)" }}>⚠️ {error}</div>;

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", paddingBottom: "40px" }}>
      <div style={{ ...card, padding: "28px 32px", marginBottom: "24px", background: "linear-gradient(135deg, rgba(123,97,255,0.12) 0%, rgba(0,184,255,0.08) 100%)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Employee Profile</h2>
          <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: "14px" }}>View and manage your professional details</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} style={{
            background: "rgba(0,184,255,0.1)", color: "var(--accent-blue)", border: "1px solid rgba(0,184,255,0.2)",
            padding: "12px 24px", borderRadius: "50px", fontWeight: 700, cursor: "pointer", fontSize: "13px",
            fontFamily: "'Outfit', sans-serif", transition: "all 0.2s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-blue)"; e.currentTarget.style.color = "var(--bg-main)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,184,255,0.1)"; e.currentTarget.style.color = "var(--accent-blue)"; }}
          >✏️ Edit Profile</button>
        )}
      </div>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        {/* Main Details */}
        <div style={{ ...card, padding: "32px", flex: "2", minWidth: "320px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
            <div style={{ position: "relative", width: "120px", height: "120px", borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(0,255,194,0.3)", background: "linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 0 30px rgba(0,255,194,0.2)" }}>
              {profile.profile_pic ? (
                <img src={profile.profile_pic.startsWith("http") ? profile.profile_pic : `http://localhost:5000${profile.profile_pic}`} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "48px", color: "var(--text-primary)", fontWeight: 800 }}>{profile.name ? profile.name.charAt(0).toUpperCase() : "👤"}</span>
              )}
              <label style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.7)", color: "var(--accent-cyan)", textAlign: "center", padding: "6px 0", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}>
                CHANGE <input type="file" accept="image/*" onChange={handleProfilePicUpload} style={{ display: "none" }} />
              </label>
            </div>
          </div>

          {!editing ? (
            <div>
              <h3 style={{ margin: "0 0 20px", color: "var(--text-primary)", fontSize: "18px", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px" }}>Personal Details</h3>
              <div style={detailRowStyle}><span style={labelStyle}>Full Name</span><span style={valueStyle}>{profile.name}</span></div>
              <div style={detailRowStyle}><span style={labelStyle}>Email</span><span style={valueStyle}>{profile.email}</span></div>
              <div style={detailRowStyle}><span style={labelStyle}>Department</span><span style={valueStyle}>{profile.department_name || "Unassigned"}</span></div>
              <div style={detailRowStyle}><span style={labelStyle}>Designation</span><span style={valueStyle}>{profile.designation || "Not Set"}</span></div>
              <div style={detailRowStyle}><span style={labelStyle}>Salary</span><span style={valueStyle}>₹{Number(profile.salary || 0).toLocaleString("en-IN")}</span></div>
              <div style={detailRowStyle}><span style={labelStyle}>Phone</span><span style={valueStyle}>{profile.phone || "—"}</span></div>
              <div style={detailRowStyle}><span style={labelStyle}>Address</span><span style={valueStyle}>{profile.address || "—"}</span></div>
            </div>
          ) : (
            <form onSubmit={handleSave}>
              <h3 style={{ margin: "0 0 20px", color: "var(--text-primary)", fontSize: "18px", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px" }}>Update Details</h3>
              <div style={{ marginBottom: "20px" }}>
                <label style={formLabelStyle}>Phone Number</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = "var(--accent-cyan)"} onBlur={e => e.target.style.borderColor = "var(--border-medium)"} />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={formLabelStyle}>Address</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} onFocus={e => e.target.style.borderColor = "var(--accent-cyan)"} onBlur={e => e.target.style.borderColor = "var(--border-medium)"} />
              </div>
              <div style={{ marginBottom: "32px" }}>
                <label style={formLabelStyle}>Skills</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                  {availableSkills.map((skill) => {
                    const isSelected = selectedSkills.includes(skill.id);
                    return (
                      <button type="button" key={skill.id} onClick={() => handleSkillChange(skill.id)} style={{
                        padding: "8px 16px", borderRadius: "50px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                        border: isSelected ? "1px solid rgba(0,255,194,0.4)" : "1px solid rgba(255,255,255,0.1)",
                        background: isSelected ? "rgba(0,255,194,0.1)" : "var(--bg-hover)",
                        color: isSelected ? "var(--accent-cyan)" : "var(--text-secondary)"
                      }}>
                        {skill.skill_name} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button type="submit" style={{ background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))", color: "var(--bg-main)", border: "none", borderRadius: "50px", padding: "12px 28px", fontSize: "14px", fontWeight: 800, cursor: "pointer" }}>Save Changes</button>
                <button type="button" onClick={() => setEditing(false)} style={{ background: "var(--border-light)", color: "var(--text-primary)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50px", padding: "12px 28px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              </div>
            </form>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ flex: "1", minWidth: "280px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ ...card, padding: "28px" }}>
            <h3 style={{ margin: "0 0 16px", color: "var(--text-primary)", fontSize: "16px" }}>🛠 Skills & Expertise</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {profile.skills && profile.skills.length > 0 ? profile.skills.map((skill, idx) => {
                const colors = ["var(--accent-cyan)", "var(--accent-blue)", "var(--accent-pink)", "var(--accent-purple)", "var(--accent-yellow)", "var(--accent-red)"];
                const color = colors[idx % colors.length];
                return <span key={skill.id} style={{ background: `${color}15`, color, border: `1px solid ${color}30`, padding: "6px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: 700 }}>{skill.skill_name}</span>;
              }) : <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>No skills listed.</div>}
            </div>
          </div>
          <div style={{ ...card, padding: "28px" }}>
            <h3 style={{ margin: "0 0 16px", color: "var(--text-primary)", fontSize: "16px" }}>📁 Uploaded Documents</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {profile.images && profile.images.length > 0 ? profile.images.map((img) => (
                <a key={img.id} href={img.image_url.startsWith("http") ? img.image_url : `http://localhost:5000${img.image_url}`} target="_blank" rel="noreferrer" style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "var(--bg-hover)", borderRadius: "12px", textDecoration: "none", color: "var(--text-primary)", fontSize: "13px", fontWeight: 600, border: "1px solid var(--border-light)"
                }}>
                  <span>📄 File #{img.id}</span>
                  <span style={{ color: "var(--accent-blue)" }}>View ↗</span>
                </a>
              )) : <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>No documents uploaded.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;