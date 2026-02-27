import React from "react";
import { useNavigate } from "react-router-dom";

function JobsInternships() {
  const navigate = useNavigate();

  return (
    <div className="card">
      <h2>Jobs & Internships</h2>
      <p>Find the latest opportunities for jobs and internships.</p>
      <button
        onClick={() => navigate("/jobs")}
        style={{
          padding: "10px 15px",
          borderRadius: "8px",
          border: "none",
          background: "#0073e6",
          color: "white",
          cursor: "pointer",
          marginTop: "10px"
        }}
      >
        View Opportunities
      </button>
    </div>
  );
}

export default JobsInternships;
