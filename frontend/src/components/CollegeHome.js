import React, { useState, useEffect } from "react";
import api from "../api";
import "./CollegeHome.css";
import { FaUsers, FaUserGraduate, FaCheckCircle, FaTimesCircle, FaTrophy, FaPercentage } from "react-icons/fa";

function CollegeHome() {
  const [stats, setStats] = useState({
    total_students: 0,
    eligible_students: 0,
    students_placed: 0,
    students_unplaced: 0,
    multiple_offers: 0,
    placement_percentage: 0,
    avg_package: 0,
    highest_package: 0
  });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/placement/overview/${user.id}`);
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching overview:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading placement overview...</div>;
  }

  return (
    <div className="college-home">
      <div className="welcome-section">
        <h1>Welcome to Placement Dashboard</h1>
        <p>Track and manage student placements efficiently</p>
      </div>

      <div className="placement-overview">
        <h2>Placement Overview</h2>
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>Total Students</h3>
              <p className="stat-number">{stats.total_students || 0}</p>
              <span className="stat-label">Final Year</span>
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-icon">
              <FaUserGraduate />
            </div>
            <div className="stat-content">
              <h3>Eligible Students</h3>
              <p className="stat-number">{stats.eligible_students || 0}</p>
              <span className="stat-label">For Placement</span>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">
              <FaCheckCircle />
            </div>
            <div className="stat-content">
              <h3>Students Placed</h3>
              <p className="stat-number">{stats.students_placed || 0}</p>
              <span className="stat-label">Successfully Placed</span>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">
              <FaTimesCircle />
            </div>
            <div className="stat-content">
              <h3>Students Unplaced</h3>
              <p className="stat-number">{stats.students_unplaced || 0}</p>
              <span className="stat-label">Awaiting Placement</span>
            </div>
          </div>

          <div className="stat-card purple">
            <div className="stat-icon">
              <FaTrophy />
            </div>
            <div className="stat-content">
              <h3>Multiple Offers</h3>
              <p className="stat-number">{stats.multiple_offers || 0}</p>
              <span className="stat-label">Students with 2+ offers</span>
            </div>
          </div>

          <div className="stat-card primary">
            <div className="stat-icon">
              <FaPercentage />
            </div>
            <div className="stat-content">
              <h3>Placement Rate</h3>
              <p className="stat-number">{stats.placement_percentage || 0}%</p>
              <span className="stat-label">Overall Success Rate</span>
            </div>
          </div>
        </div>
      </div>

      <div className="package-stats">
        <div className="package-card">
          <h3>Average Package</h3>
          <p className="package-amount">₹ {stats.avg_package || 0} LPA</p>
        </div>
        <div className="package-card highlight">
          <h3>Highest Package</h3>
          <p className="package-amount">₹ {stats.highest_package || 0} LPA</p>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn" onClick={() => window.location.href = '/college-dashboard/placement-tracking'}>
            View Placement Tracking
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/college-dashboard/company-drives'}>
            Manage Company Drives
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/college-dashboard/offer-verification'}>
            Verify Offer Letters
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/college-dashboard/internships'}>
            Track Internships
          </button>
        </div>
      </div>
    </div>
  );
}

export default CollegeHome;
