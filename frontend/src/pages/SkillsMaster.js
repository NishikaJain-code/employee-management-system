import { useEffect, useState } from "react";
import api from "../utils/api";

function SkillsMaster() {

  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    getSkills();
  }, []);

  const getSkills = async () => {

    try {

      const res = await api.get("/api/skills");

      setSkills(res.data);

    } catch (err) {

      console.log(err);

    }

  };

  const addSkill = async () => {

    try {

      await api.post("/api/skills", { skill_name: name });

      alert("Skill Added");

      setName("");

      getSkills();

    } catch (err) {

      console.log(err);
      console.log(err.response);
      alert(
        err.response?.data?.message ||
        err.message ||
        "Error Adding Skill"
      );

    }

  };

  return (
    <div style={{ padding: "20px" }}>

      <h2>Skills Master</h2>

      <input
        type="text"
        placeholder="Skill Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={addSkill}>
        Add Skill
      </button>

      <hr />

      {skills.map((skill) => (

        <p key={skill.id}>
          {skill.id} - {skill.skill_name || skill.name}
        </p>

      ))}

    </div>
  );
}

export default SkillsMaster;
