import React, { useState, useEffect } from "react";
import api from "../api";
import "./StudentHome.css";
import { FaBriefcase, FaLaptop, FaFileAlt, FaCheckCircle, FaCalendar, FaTrophy } from "react-icons/fa";

function StudentHome() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalInternships: 0,
    applicationsSubmitted: 0,
    shortlisted: 0,
    upcomingInterviews: 0,
    offers: 0,
    profileCompletion: 0,
    resumeUploaded: false,
  });
  const [applications, setApplications] = useState([]);
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsRes = await api.get(`/student/dashboard-stats/${user.id}`);
      setStats(statsRes.data);

      // Fetch recent applications
      const appsRes = await api.get(`/applications/${user.id}`);
      setApplications(appsRes.data.slice(0, 5));

      // Fetch upcoming events
      const eventsRes = await api.get("/placement-events");
      setEvents(eventsRes.data.slice(0, 4));

      // Fetch notifications
      const notifsRes = await api.get(`/notifications/${user.id}`);
      setNotifications(notifsRes.data.slice(0, 5));
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: "#007bff",
      shortlisted: "#ffc107",
      interview: "#ff9800",
      rejected: "#dc3545",
      selected: "#28a745",
    };
    return colors[status] || "#6c757d";
  };

  return (
    <div className="student-home">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>Welcome, {user.name}! 👋</h1>
          <p className="tagline">Track your placement journey here.</p>
          
          <div className="profile-status">
            <div className="status-item">
              <span className="status-label">Profile Completion</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${stats.profileCompletion}%` }}
                ></div>
              </div>
              <span className="status-value">{stats.profileCompletion}%</span>
            </div>
            
            <div className="status-badges">
              <div className={`badge ${stats.resumeUploaded ? 'success' : 'warning'}`}>
                <FaFileAlt />
                <span>Resume: {stats.resumeUploaded ? 'Uploaded' : 'Not Uploaded'}</span>
              </div>
              <div className="badge info">
                <FaCheckCircle />
                <span>CAF Status: Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="dashboard-stats">
        <div className="stat-card" onClick={() => window.location.href = '/student-dashboard/jobs'}>
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <FaBriefcase />
          </div>
          <div className="stat-content">
            <h3>{stats.totalJobs}</h3>
            <p>Total Jobs Available</p>
          </div>
        </div>

        <div className="stat-card" onClick={() => window.location.href = '/student-dashboard/jobs'}>
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <FaLaptop />
          </div>
          <div className="stat-content">
            <h3>{stats.totalInternships}</h3>
            <p>Total Internships</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <FaFileAlt />
          </div>
          <div className="stat-content">
            <h3>{stats.applicationsSubmitted}</h3>
            <p>Applications Submitted</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.shortlisted}</h3>
            <p>Shortlisted</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <FaCalendar />
          </div>
          <div className="stat-content">
            <h3>{stats.upcomingInterviews}</h3>
            <p>Upcoming Interviews</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }}>
            <FaTrophy />
          </div>
          <div className="stat-content">
            <h3>{stats.offers}</h3>
            <p>Placement Offers</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="home-content-grid">
        {/* Application Tracker */}
        <div className="content-card">
          <h3>Recent Applications</h3>
          {applications.length === 0 ? (
            <p className="no-data">No applications yet. Start applying to jobs!</p>
          ) : (
            <div className="applications-list">
              {applications.map((app) => (
                <div key={app.id} className="application-item">
                  <div className="app-info">
                    <h4>{app.company_name}</h4>
                    <p>{app.role}</p>
                    <span className="app-date">{new Date(app.applied_date).toLocaleDateString()}</span>
                  </div>
                  <span 
                    className="status-badge" 
                    style={{ background: getStatusColor(app.status) }}
                  >
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="content-card">
          <h3>Upcoming Events</h3>
          {events.length === 0 ? (
            <p className="no-data">No upcoming events</p>
          ) : (
            <div className="events-list">
              {events.map((event) => (
                <div key={event.id} className="event-item">
                  <div className="event-date">
                    <span className="day">{new Date(event.event_date).getDate()}</span>
                    <span className="month">{new Date(event.event_date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div className="event-info">
                    <h4>{event.title}</h4>
                    <p>{event.event_type}</p>
                    <span className="event-location">{event.location || 'Online'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="content-card notifications-card">
          <h3>Recent Notifications</h3>
          {notifications.length === 0 ? (
            <p className="no-data">No new notifications</p>
          ) : (
            <div className="notifications-list">
              {notifications.map((notif) => (
                <div key={notif.id} className={`notification-item ${notif.is_read ? 'read' : 'unread'}`}>
                  <div className="notif-content">
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    <span className="notif-time">{new Date(notif.created_at).toLocaleString()}</span>
                  </div>
                  {!notif.is_read && <span className="unread-dot"></span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentHome;
