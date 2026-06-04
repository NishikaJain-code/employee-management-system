import { useState } from "react";
import axios from "axios";

function UploadFiles() {

  const [files, setFiles] = useState([]);

  const handleChange = (e) => {
    setFiles(e.target.files);
  };

  const uploadFiles = async () => {

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {

      const res = await axios.post(
        "http://localhost:5000/api/employee/employees/upload",
        formData
      );

      alert(res.data.message);

    } catch (err) {

      console.log(err);
      alert("Upload Failed");

    }

  };

  return (
    <div style={{ padding: "20px" }}>

      <h2>Upload Documents</h2>

      <input
        type="file"
        multiple
        onChange={handleChange}
      />

      <br /><br />

      <button onClick={uploadFiles}>
        Upload Files
      </button>

    </div>
  );
}

export default UploadFiles;