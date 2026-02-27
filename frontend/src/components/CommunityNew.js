import React, { useState, useEffect } from "react";
import api from "../api";
import "./CommunityNew.css";

function CommunityNew() {
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinPassword, setJoinPassword] = useState("");
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState("post");
  const [loading, setLoading] = useState(true);

  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    category: "Tech",
    password: "",
    cover_image: "",
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const canCreateCommunity = user.role === "admin" || user.role === "college";

  console.log("Current user:", user);
  console.log("Can create community:", canCreateCommunity);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await api.get("/communities");
      console.log("Fetched communities:", response.data);
      const communitiesWithMembership = await Promise.all(
        response.data.map(async (community) => {
          const memberCheck = await api.get(`/communities/${community.id}/is-member/${user.id}`);
          return { ...community, isMember: memberCheck.data.isMember };
        })
      );
      setCommunities(communitiesWithMembership);
      console.log("Communities with membership:", communitiesWithMembership);
    } catch (err) {
      console.error("Error fetching communities:", err);
      alert("Error loading communities. Please check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClick = (community) => {
    setSelectedCommunity(community);
    setShowJoinModal(true);
    setJoinPassword("");
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/communities/${selectedCommunity.id}/join`, {
        user_id: user.id,
        password: joinPassword,
      });
      alert("✅ Successfully joined community!");
      setShowJoinModal(false);
      fetchCommunities();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to join community");
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    try {
      await api.post("/communities", {
        ...newCommunity,
        created_by: user.id,
      });
      alert("✅ Community created successfully!");
      setShowCreateModal(false);
      setNewCommunity({ name: "", description: "", category: "Tech", password: "", cover_image: "" });
      fetchCommunities();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create community");
    }
  };

  const handleCommunityClick = async (community) => {
    if (!community.isMember) {
      alert("Please join the community first!");
      return;
    }
    setSelectedCommunity(community);
    await fetchCommunityDetails(community.id);
  };

  const fetchCommunityDetails = async (communityId) => {
    try {
      const [postsRes, membersRes] = await Promise.all([
        api.get(`/communities/${communityId}/posts`),
        api.get(`/communities/${communityId}/members`),
      ]);
      setPosts(postsRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      console.error("Error fetching community details:", err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      await api.post(`/communities/${selectedCommunity.id}/posts`, {
        user_id: user.id,
        content: newPost,
        post_type: postType,
      });
      setNewPost("");
      fetchCommunityDetails(selectedCommunity.id);
    } catch (err) {
      alert("Failed to create post");
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Tech: "💻",
      Placement: "🎯",
      Alumni: "🎓",
      Internship: "💼",
      Department: "🏢",
      General: "📢",
    };
    return icons[category] || "📢";
  };

  if (selectedCommunity && selectedCommunity.isMember) {
    // Community Detail View
    return (
      <div className="community-detail">
        <button className="btn-back" onClick={() => setSelectedCommunity(null)}>
          ← Back to Communities
        </button>

        <div className="community-header-detail">
          <div className="community-cover">
            {selectedCommunity.cover_image ? (
              <img src={selectedCommunity.cover_image} alt={selectedCommunity.name} />
            ) : (
              <div className="cover-placeholder">{getCategoryIcon(selectedCommunity.category)}</div>
            )}
          </div>
          <div className="community-info-detail">
            <h1>{selectedCommunity.name}</h1>
            <p>{selectedCommunity.description}</p>
            <div className="community-meta">
              <span>📊 {selectedCommunity.category}</span>
              <span>👥 {members.length} Members</span>
              <span>👤 Created by: {selectedCommunity.creator_name}</span>
            </div>
          </div>
        </div>

        <div className="community-content-grid">
          {/* Posts Section */}
          <div className="posts-section">
            <div className="create-post-card">
              <h3>Create Post</h3>
              <form onSubmit={handleCreatePost}>
                <select value={postType} onChange={(e) => setPostType(e.target.value)}>
                  <option value="post">Post</option>
                  <option value="announcement">Announcement</option>
                  <option value="document">Document</option>
                  <option value="event">Event</option>
                </select>
                <textarea
                  placeholder="Share something with the community..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  rows="3"
                />
                <button type="submit">Post</button>
              </form>
            </div>

            <div className="posts-list">
              <h3>Community Feed</h3>
              {posts.length === 0 ? (
                <p className="no-posts">No posts yet. Be the first to post!</p>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className={`post-card ${post.post_type}`}>
                    <div className="post-header">
                      <div className="post-author">
                        <div className="author-avatar">{post.author_name.charAt(0)}</div>
                        <div>
                          <h4>{post.author_name}</h4>
                          <span className="post-meta">
                            {post.author_role} • {new Date(post.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {post.post_type !== "post" && (
                        <span className="post-type-badge">{post.post_type}</span>
                      )}
                    </div>
                    <div className="post-content">{post.content}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Members Sidebar */}
          <div className="members-sidebar">
            <h3>Members ({members.length})</h3>
            <div className="members-list">
              {members.map((member) => (
                <div key={member.id} className="member-item">
                  <div className="member-avatar">{member.name.charAt(0)}</div>
                  <div className="member-info">
                    <h4>{member.name}</h4>
                    <span>{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Communities List View
  return (
    <div className="communities-page">
      <div className="communities-header">
        <h2>Available Communities</h2>
        {canCreateCommunity && (
          <button className="btn-create" onClick={() => setShowCreateModal(true)}>
            + Create Community
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: '#666' }}>
          Loading communities...
        </div>
      ) : communities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px' }}>
          <h3>No communities yet</h3>
          <p style={{ color: '#666', marginTop: '1rem' }}>
            {canCreateCommunity ? 'Click "Create Community" to get started!' : 'Check back later for new communities.'}
          </p>
        </div>
      ) : null}

      <div className="communities-grid">
        {communities.map((community) => (
          <div key={community.id} className="community-card">
            <div className="community-icon">{getCategoryIcon(community.category)}</div>
            <h3>{community.name}</h3>
            <p>{community.description}</p>
            <div className="community-stats">
              <span>👥 {community.member_count} Members</span>
              <span>📊 {community.category}</span>
            </div>
            <div className="community-footer">
              <span className="created-by">By: {community.creator_name || "Unknown"}</span>
              {community.isMember ? (
                <button className="btn-view" onClick={() => handleCommunityClick(community)}>
                  View
                </button>
              ) : (
                <button className="btn-join" onClick={() => handleJoinClick(community)}>
                  Join
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Join Community</h3>
            <form onSubmit={handleJoinSubmit}>
              <div className="form-group">
                <label>Community Name</label>
                <input type="text" value={selectedCommunity?.name} readOnly />
              </div>
              <div className="form-group">
                <label>Enter Password *</label>
                <input
                  type="password"
                  placeholder="Community password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-submit">Join</button>
                <button type="button" className="btn-cancel" onClick={() => setShowJoinModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Community</h3>
            <form onSubmit={handleCreateCommunity}>
              <div className="form-group">
                <label>Community Name *</label>
                <input
                  type="text"
                  placeholder="Enter community name"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Describe your community"
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={newCommunity.category}
                  onChange={(e) => setNewCommunity({ ...newCommunity, category: e.target.value })}
                >
                  <option value="Tech">Tech</option>
                  <option value="Placement">Placement</option>
                  <option value="Alumni">Alumni</option>
                  <option value="Internship">Internship</option>
                  <option value="Department">Department</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className="form-group">
                <label>Set Password *</label>
                <input
                  type="password"
                  placeholder="Set community password"
                  value={newCommunity.password}
                  onChange={(e) => setNewCommunity({ ...newCommunity, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Cover Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={newCommunity.cover_image}
                  onChange={(e) => setNewCommunity({ ...newCommunity, cover_image: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-submit">Create</button>
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunityNew;
