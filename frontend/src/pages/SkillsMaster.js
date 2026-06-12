import { useEffect, useState } from "react";
import api from "../utils/api";

const card = { background: "var(--bg-card)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: "24px", border: "1px solid var(--border-light)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" };
const inputSt = { width: "100%", padding: "12px 16px", background: "var(--bg-input)", border: "1px solid var(--border-medium)", borderRadius: "14px", fontSize: "14px", boxSizing: "border-box", outline: "none", color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif", transition: "border-color 0.2s, box-shadow 0.2s" };
const inF = (e) => { e.target.style.borderColor = "var(--accent-purple)"; e.target.style.boxShadow = "0 0 0 4px rgba(123,97,255,0.08)"; };
const inB = (e) => { e.target.style.borderColor = "var(--border-medium)"; e.target.style.boxShadow = "none"; };

const SKILL_COLORS = ["var(--accent-cyan)", "var(--accent-blue)", "var(--accent-pink)", "var(--accent-purple)", "var(--accent-yellow)", "var(--accent-red)"];

function SkillsMaster() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => { getSkills(); }, []);

  const getSkills = async () => {
    try { const res = await api.get("/api/skills"); setSkills(res.data); }
    catch (err) { console.log(err); }
  };

  const addSkill = async () => {
    if (!name.trim()) { alert("Please enter a skill name."); return; }
    try {
      await api.post("/api/skills", { skill_name: name });
      alert("Skill Added");
      setName(""); getSkills();
    } catch (err) { alert(err.response?.data?.message || err.message || "Error Adding Skill"); }
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", paddingBottom: "40px" }}>
      <div style={{ ...card, padding: "28px 32px", marginBottom: "24px", background: "linear-gradient(135deg, rgba(123,97,255,0.12) 0%, rgba(0,184,255,0.08) 100%)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>Skills Master</h2>
          <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: "14px" }}>Manage your organisation's skill catalogue</p>
        </div>
        <div style={{ fontSize: "40px" }}>🛠</div>
      </div>

      {/* Add form */}
      <div style={{ ...card, padding: "28px", marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 20px", color: "var(--text-primary)", fontSize: "16px", fontWeight: 700 }}>Add New Skill</h3>
        <div style={{ display: "flex", gap: "12px" }}>
          <input type="text" placeholder="Skill Name (e.g. React, Node.js)" value={name} onChange={(e) => setName(e.target.value)}
            style={{ ...inputSt, flex: 1 }} onFocus={inF} onBlur={inB}
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
          />
          <button onClick={addSkill} style={{
            background: "linear-gradient(135deg, var(--accent-purple), var(--accent-blue))", color: "#fff",
            border: "none", padding: "12px 28px", borderRadius: "50px", fontWeight: 800, fontSize: "14px",
            cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: "0 4px 16px rgba(123,97,255,0.25)",
            whiteSpace: "nowrap", transition: "transform 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.04)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >+ Add Skill</button>
        </div>
      </div>

      {/* Skills as tags */}
      <div style={{ ...card, padding: "28px" }}>
        <h3 style={{ margin: "0 0 20px", color: "var(--text-primary)", fontSize: "16px", fontWeight: 700 }}>
          All Skills <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>({skills.length})</span>
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {skills.map((skill, i) => {
            const color = SKILL_COLORS[i % SKILL_COLORS.length];
            return (
              <div key={skill.id} style={{
                background: `${color}12`, border: `1px solid ${color}30`,
                color: color, padding: "10px 20px", borderRadius: "50px",
                fontSize: "14px", fontWeight: 700, transition: "transform 0.2s, box-shadow 0.2s", cursor: "default"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = `0 4px 16px ${color}30`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {skill.skill_name || skill.name}
              </div>
            );
          })}
          {skills.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>No skills added yet.</div>}
        </div>
      </div>
    </div>
  );
}

export default SkillsMaster;
