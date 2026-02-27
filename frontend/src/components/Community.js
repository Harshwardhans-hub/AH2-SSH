import React, { useState, useEffect } from "react";
import api from "../api"; // Axios instance pointing to http://127.0.0.1:8000
import "./Community.css";

function Community() {
  const [communities, setCommunities] = useState([]);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form states
  const [joinData, setJoinData] = useState({
    community_name: "",
    username: "",
    email: "",
    linkedin_url: "",
  });

  const [createData, setCreateData] = useState({
    name: "",
    description: "",
  });

  // Fetch communities from backend
  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const res = await api.get("/communities");
      setCommunities(res.data);
    } catch (err) {
      console.error("Error fetching communities:", err);
    }
  };

  // Handle Join Community
  const handleJoinSubmit = (e) => {
    e.preventDefault();
    alert(`✅ You joined ${joinData.community_name} successfully!`);
    setShowJoinForm(false);
    setJoinData({ community_name: "", username: "", email: "", linkedin_url: "" });
  };

  // Handle Create Community
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/communities", createData);
      alert("✅ Community created successfully!");
      setShowCreateForm(false);
      setCreateData({ name: "", description: "" });
      fetchCommunities();
    } catch (err) {
      console.error("Error creating community:", err);
      alert("❌ Failed to create community");
    }
  };

  return (
    <div className="community-container">
      <h2 className="community-heading">🌐 Our Alumni Communities</h2>

      <div className="community-actions">
        <button className="join-btn" onClick={() => { setShowJoinForm(true); setShowCreateForm(false); }}>
          Join Community
        </button>
        <button className="create-btn" onClick={() => { setShowCreateForm(true); setShowJoinForm(false); }}>
          Create Community
        </button>
      </div>

      {/* Join Form Overlay */}
      {showJoinForm && (
        <div className="form-overlay">
          <div className="form-container">
            <h3>Join a Community</h3>
            <form onSubmit={handleJoinSubmit}>
              <input
                type="text"
                placeholder="Community Name"
                value={joinData.community_name}
                onChange={(e) => setJoinData({ ...joinData, community_name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Your Name"
                value={joinData.username}
                onChange={(e) => setJoinData({ ...joinData, username: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                value={joinData.email}
                onChange={(e) => setJoinData({ ...joinData, email: e.target.value })}
                required
              />
              <input
                type="url"
                placeholder="LinkedIn URL"
                value={joinData.linkedin_url}
                onChange={(e) => setJoinData({ ...joinData, linkedin_url: e.target.value })}
              />
              <div className="form-buttons">
                <button type="submit">Join</button>
                <button type="button" onClick={() => setShowJoinForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Form Overlay */}
      {showCreateForm && (
        <div className="form-overlay">
          <div className="form-container">
            <h3>Create a Community</h3>
            <form onSubmit={handleCreateSubmit}>
              <input
                type="text"
                placeholder="Community Name"
                value={createData.name}
                onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={createData.description}
                onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                required
              ></textarea>
              <div className="form-buttons">
                <button type="submit">Create</button>
                <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Communities Grid */}
      <h3 className="example-heading">Existing Communities</h3>
      <div className="communities-grid">
        {communities.length > 0 ? (
          communities.map((c) => (
            <div key={c.id} className="community-card">
              <h4>{c.name}</h4>
              <p>{c.description}</p>
            </div>
          ))
        ) : (
          <p>No communities found.</p>
        )}
      </div>
    </div>
  );
}

export default Community;
