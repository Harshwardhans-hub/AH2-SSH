import React from "react";
import { useNavigate } from "react-router-dom";

function Inbox() {
  const navigate = useNavigate();

  return (
    <div className="card">
      <h2>Inbox</h2>
      <p>Connect with your alumni network through chat.</p>
      <button
        onClick={() => navigate("/chat")}
        style={{
          padding: "10px 15px",
          borderRadius: "8px",
          border: "none",
          background: "#28a745",
          color: "white",
          cursor: "pointer",
          marginTop: "10px"
        }}
      >
        Open Chat
      </button>
    </div>
  );
}

export default Inbox;
