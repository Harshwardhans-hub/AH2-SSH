import React, { useState, useEffect } from "react";
import api from "../api";
import "./AdminHome.css";

function AdminHome() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalColleges: 0,
    totalCommunities: 0,
    totalCAFForms: 0,
    totalCompanies: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/stats");
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  return (
    <div className="admin-home-container">
      <h2>Admin Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">🎓</div>
          <div className="stat-content">
            <h3>{stats.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">🏫</div>
          <div className="stat-content">
            <h3>{stats.totalColleges}</h3>
            <p>Colleges Connected</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">👨‍👩‍👧‍👦</div>
          <div className="stat-content">
            <h3>{stats.totalCommunities}</h3>
            <p>Communities</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>{stats.totalCAFForms}</h3>
            <p>CAF Forms</p>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>{stats.totalCompanies}</h3>
            <p>Companies</p>
          </div>
        </div>
      </div>

      <div className="admin-sections">
        <div className="admin-section">
          <h3>System Overview</h3>
          <div className="overview-content">
            <p>Welcome to the Hack-2-Hire Admin Dashboard. Here you can manage the entire platform.</p>
            <ul>
              <li>Monitor user registrations and activity</li>
              <li>Manage colleges and their information</li>
              <li>Oversee student enrollments</li>
              <li>Track community engagement</li>
              <li>Review CAF forms and company partnerships</li>
            </ul>
          </div>
        </div>

        <div className="admin-section">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button className="action-btn">View All Students</button>
            <button className="action-btn">View All Colleges</button>
            <button className="action-btn">Manage Communities</button>
            <button className="action-btn">View Reports</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;
