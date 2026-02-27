import React, { useState } from "react";
import "./Documents.css";

const Documents = () => {
  const [files, setFiles] = useState({
    tenth: null,
    twelfth: null,
    aadhar: null,
    resume: null,
    others: null,
  });

  const handleFileChange = (e, key) => {
    setFiles({ ...files, [key]: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can send files to backend here using FormData
    console.log("Uploaded files:", files);
    alert("Documents submitted!");
  };

  return (
    <div className="documents-container">
      <h2 className="documents-heading">Upload Your Documents</h2>

      <form className="documents-form" onSubmit={handleSubmit}>
        <div className="upload-field">
          <label>10th Marksheet:</label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, "tenth")}
          />
        </div>

        <div className="upload-field">
          <label>12th Marksheet:</label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, "twelfth")}
          />
        </div>

        <div className="upload-field">
          <label>Aadhaar Card:</label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, "aadhar")}
          />
        </div>

        <div className="upload-field">
          <label>Resume:</label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, "resume")}
          />
        </div>
        <div className="upload-field">
          <label>Bank Passbook:</label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, "passbook")}
          />
        </div>
        <div className="upload-field">
          <label>Other Documents:</label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, "others")}
          />
        </div>

        <button type="submit" className="submit-btn">
          Upload Documents
        </button>
      </form>
    </div>
  );
};

export default Documents;
