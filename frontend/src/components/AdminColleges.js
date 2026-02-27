import React, { useState, useEffect } from "react";
import api from "../api";
import "./AdminColleges.css";

function AdminColleges() {
  const [colleges, setColleges] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredColleges, setFilteredColleges] = useState([]);

  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = colleges.filter(college =>
        college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (college.college && college.college.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (college.department && college.department.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredColleges(filtered);
    } else {
      setFilteredColleges(colleges);
    }
  }, [searchTerm, colleges]);

  const fetchColleges = async () => {
    try {
      const response = await api.get("/colleges");
      setColleges(response.data);
      setFilteredColleges(response.data);
    } catch (err) {
      console.error("Error fetching colleges:", err);
    }
  };

  return (
    <div className="admin-colleges-container">
      <div className="colleges-header">
        <h2>Colleges Connected</h2>
        <input
          type="text"
          placeholder="Search colleges by name, institution, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="colleges-stats">
        <div className="stat-box">
          <h3>{filteredColleges.length}</h3>
          <p>Total Colleges</p>
        </div>
      </div>

      <div className="colleges-grid">
        {filteredColleges.length === 0 ? (
          <p className="no-data">No colleges found</p>
        ) : (
          filteredColleges.map((college) => (
            <div key={college.id} className="college-card">
              <div className="college-header">
                <div className="college-icon">🏫</div>
                <div className="college-info">
                  <h3>{college.name}</h3>
                  <p className="college-institution">{college.college || "N/A"}</p>
                </div>
              </div>
              <div className="college-details">
                <p><strong>Department:</strong> {college.department || "N/A"}</p>
                <p><strong>Email:</strong> {college.email}</p>
                <p><strong>Phone:</strong> {college.phone || "N/A"}</p>
                <p><strong>Joined:</strong> {new Date(college.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminColleges;
