import { useEffect, useState } from "react";
import axios from "axios";

function SkillsMaster() {

  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    getSkills();
  }, []);

  const getSkills = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/employee/skills"
      );

      setSkills(res.data);

    } catch (err) {

      console.log(err);

    }

  };

  const addSkill = async () => {

    try {

      await axios.post(
        "http://localhost:5000/api/employee/skills",
        { name }
      );

      alert("Skill Added");

      setName("");

      getSkills();

    } catch (err) {

      console.log(err);

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
          {skill.id} - {skill.name}
        </p>

      ))}

    </div>
  );
}

export default SkillsMaster;
