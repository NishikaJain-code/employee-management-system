import { useEffect, useState } from "react";
import api from "../utils/api";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  // Form states for edit
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      // 1. Get the current user details to find employee_profile_id
      const userRes = await api.get("/api/auth/user");
      const profileId = userRes.data.employee_profile_id;

      if (!profileId) {
        setError("No employee profile found for this account.");
        setLoading(false);
        return;
      }

      // 2. Fetch the detailed employee profile
      const empRes = await api.get(`/api/employees/${profileId}`);
      setProfile(empRes.data);
      setPhone(empRes.data.phone || "");
      setAddress(empRes.data.address || "");
      setSelectedSkills((empRes.data.skills || []).map((s) => s.id));

      // 3. Fetch skills master if editing is enabled
      const skillsRes = await api.get("/api/skills");
      setAvailableSkills(skillsRes.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_pic", file);

    try {
      setLoading(true);
      await api.post(`/api/employees/${profile.profile_id}/profile-pic`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      fetchProfile();
      alert("Profile picture updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to upload profile picture.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkillChange = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter((id) => id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        phone,
        address,
        designation: profile.designation,
        salary: profile.salary,
        department_id: profile.department_id,
        skills: selectedSkills,
      };

      await api.put(`/api/employees/${profile.profile_id}`, payload);
      setEditing(false);
      fetchProfile();
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update profile.");
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <div style={{ fontSize: "18px", color: "#6c63ff" }}>⏳ Loading profile details...</div>
    </div>
  );

  if (error) return (
    <div style={{ padding: "40px", color: "#e53e3e", fontSize: "16px" }}>
      ⚠️ {error}
    </div>
  );

  return (
    <div style={{ padding: "32px", fontFamily: "'Segoe UI', sans-serif", background: "#f0f4ff", minHeight: "100vh" }}>
      
      {/* Header card */}
      <div style={{
        background: "linear-gradient(135deg, #6c63ff 0%, #4facfe 100%)",
        borderRadius: "20px",
        padding: "32px 36px",
        marginBottom: "32px",
        color: "#fff",
        boxShadow: "0 8px 32px rgba(108,99,255,0.3)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "20px"
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>👤 Employee Profile</h1>
          <p style={{ margin: "8px 0 0", opacity: 0.85 }}>
            View and manage your professional profile details
          </p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={{
              background: "#fff",
              color: "#6c63ff",
              border: "none",
              borderRadius: "12px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              transition: "transform 0.1s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        
        {/* Left Side: General Profile Card */}
        <div style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "32px",
          flex: "2",
          minWidth: "320px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
        }}>
          {/* Avatar Section */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "32px",
            position: "relative"
          }}>
            <div style={{
              position: "relative",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              overflow: "hidden",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              border: "4px solid #fff",
              background: "linear-gradient(135deg, #6c63ff 0%, #4facfe 100%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}>
              {profile.profile_pic ? (
                <img
                  src={`http://localhost:5000${profile.profile_pic}`}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: "48px", color: "#fff", fontWeight: 700 }}>
                  {profile.name ? profile.name.charAt(0).toUpperCase() : "👤"}
                </span>
              )}
              
              {/* File Upload Overlay */}
              <label style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                textAlign: "center",
                padding: "6px 0",
                fontSize: "11px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "opacity 0.2s"
              }}>
                CHANGE
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicUpload}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>

          {!editing ? (
            <div>
              <h2 style={{ margin: "0 0 24px 0", color: "#2d3748", borderBottom: "2px solid #edf2f7", paddingBottom: "12px" }}>
                Personal Details
              </h2>
              
              <div style={detailRowStyle}>
                <span style={labelStyle}>Full Name</span>
                <span style={valueStyle}>{profile.name}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={labelStyle}>Email Address</span>
                <span style={valueStyle}>{profile.email}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={labelStyle}>Department</span>
                <span style={valueStyle}>{profile.department_name || "Unassigned"}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={labelStyle}>Designation</span>
                <span style={valueStyle}>{profile.designation || "Not Set"}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={labelStyle}>Salary (CTC)</span>
                <span style={valueStyle}>₹{Number(profile.salary || 0).toLocaleString("en-IN")} / annum</span>
              </div>
              <div style={detailRowStyle}>
                <span style={labelStyle}>Phone Number</span>
                <span style={valueStyle}>{profile.phone || "Not Specified"}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={labelStyle}>Current Address</span>
                <span style={valueStyle}>{profile.address || "Not Specified"}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={labelStyle}>Joined Date</span>
                <span style={valueStyle}>{new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave}>
              <h2 style={{ margin: "0 0 24px 0", color: "#2d3748", borderBottom: "2px solid #edf2f7", paddingBottom: "12px" }}>
                Update Profile
              </h2>

              <div style={{ marginBottom: "20px" }}>
                <label style={formLabelStyle}>Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={inputStyle}
                  placeholder="Enter phone number"
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={formLabelStyle}>Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                  placeholder="Enter current address"
                />
              </div>

              {/* Skills Multi-Select */}
              <div style={{ marginBottom: "32px" }}>
                <label style={formLabelStyle}>Your Professional Skills</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                  {availableSkills.map((skill) => {
                    const isSelected = selectedSkills.includes(skill.id);
                    return (
                      <button
                        type="button"
                        key={skill.id}
                        onClick={() => handleSkillChange(skill.id)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          border: isSelected ? "2px solid #6c63ff" : "1.5px solid #cbd5e0",
                          background: isSelected ? "#eef2ff" : "#fff",
                          color: isSelected ? "#6c63ff" : "#4a5568",
                          transition: "all 0.2s"
                        }}
                      >
                        {skill.skill_name} {isSelected && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(135deg, #6c63ff 0%, #4facfe 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "14px 28px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(108,99,255,0.3)"
                  }}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setPhone(profile.phone || "");
                    setAddress(profile.address || "");
                    setSelectedSkills((profile.skills || []).map((s) => s.id));
                  }}
                  style={{
                    background: "#edf2f7",
                    color: "#4a5568",
                    border: "none",
                    borderRadius: "12px",
                    padding: "14px 28px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Side: Skills & Documents Sidebar */}
        <div style={{
          flex: "1",
          minWidth: "280px",
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}>
          
          {/* Skills Badge Card */}
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "28px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
          }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#2d3748", fontSize: "16px" }}>🛠 Skills & Expertise</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill, idx) => {
                  const colors = ["#6c63ff", "#f5576c", "#43e97b", "#4facfe", "#fa709a", "#30cfd0"];
                  const selectedColor = colors[idx % colors.length];
                  return (
                    <span
                      key={skill.id}
                      style={{
                        background: `${selectedColor}15`,
                        color: selectedColor,
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: 700,
                        border: `1.5px solid ${selectedColor}30`
                      }}
                    >
                      {skill.skill_name}
                    </span>
                  );
                })
              ) : (
                <div style={{ color: "#a0aec0", fontSize: "14px" }}>No skills listed yet.</div>
              )}
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "28px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
          }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#2d3748", fontSize: "16px" }}>📁 Uploaded Documents</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {profile.images && profile.images.length > 0 ? (
                profile.images.map((img) => (
                  <a
                    key={img.id}
                    href={`http://localhost:5000${img.image_url}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      background: "#f7f9ff",
                      borderRadius: "10px",
                      textDecoration: "none",
                      color: "#4a5568",
                      fontSize: "13px",
                      fontWeight: 600,
                      border: "1px solid #eef2ff",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#edf2f7"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#f7f9ff"}
                  >
                    <span>📄 File (ID: {img.id})</span>
                    <span style={{ color: "#6c63ff" }}>View File ↗</span>
                  </a>
                ))
              ) : (
                <div style={{ color: "#a0aec0", fontSize: "14px" }}>No verification documents uploaded.</div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// Inline Styles Helper
const detailRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "16px 0",
  borderBottom: "1px solid #edf2f7"
};

const labelStyle = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#718096"
};

const valueStyle = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#2d3748"
};

const formLabelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "13px",
  fontWeight: 700,
  color: "#4a5568"
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  border: "1.5px solid #e2e8f0",
  borderRadius: "12px",
  fontSize: "14px",
  boxSizing: "border-box",
  outline: "none",
  fontFamily: "inherit"
};

export default Profile;