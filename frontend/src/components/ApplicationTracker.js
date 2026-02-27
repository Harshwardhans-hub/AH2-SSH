import React, { useState, useEffect } from "react";
import api from "../api";
import "./ApplicationTracker.css";

function ApplicationTracker() {
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [newApp, setNewApp] = useState({
    company_name: "",
    role: "",
    location: "",
    status: "applied",
  });

  const [selectedApp, setSelectedApp] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [searchTerm, filterStatus, applications]);

  const fetchApplications = async () => {
    try {
      const response = await api.get(`/applications/${user.id}`);
      setApplications(response.data);
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredApps(filtered);
  };

  const handleAddApplication = async (e) => {
    e.preventDefault();
    try {
      await api.post("/applications", {
        ...newApp,
        student_id: user.id,
      });
      alert("✅ Application added successfully!");
      setIsAddingNew(false);
      setNewApp({ company_name: "", role: "", location: "", status: "applied" });
      fetchApplications();
    } catch (err) {
      console.error("Error adding application:", err);
      alert("❌ Failed to add application");
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setIsUpdating(true);
    try {
      await api.put(`/applications/${id}`, { status: newStatus });
      alert("✅ Status updated successfully!");
      setSelectedApp({ ...selectedApp, status: newStatus });
      fetchApplications();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("❌ Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      await api.delete(`/applications/${id}`);
      alert("🗑️ Application deleted");
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      console.error("Error deleting application:", err);
      alert("❌ Failed to delete application");
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

  const getStatusIcon = (status) => {
    const icons = {
      applied: "📝",
      shortlisted: "⭐",
      interview: "🎤",
      rejected: "❌",
      selected: "✅",
    };
    return icons[status] || "📄";
  };

  return (
    <div className="application-tracker">
      <div className="tracker-header">
        <h2>Application Tracker</h2>
        <button className="btn-add" onClick={() => setIsAddingNew(!isAddingNew)}>
          {isAddingNew ? "Cancel" : "+ Add Application"}
        </button>
      </div>

      {/* Add New Application Form */}
      {isAddingNew && (
        <div className="add-application-form">
          <h3>Add New Application</h3>
          <form onSubmit={handleAddApplication}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Company Name *"
                value={newApp.company_name}
                onChange={(e) => setNewApp({ ...newApp, company_name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Role/Position *"
                value={newApp.role}
                onChange={(e) => setNewApp({ ...newApp, role: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                placeholder="Location"
                value={newApp.location}
                onChange={(e) => setNewApp({ ...newApp, location: e.target.value })}
              />
              <select
                value={newApp.status}
                onChange={(e) => setNewApp({ ...newApp, status: e.target.value })}
              >
                <option value="applied">Applied</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="rejected">Rejected</option>
                <option value="selected">Selected</option>
              </select>
            </div>
            <button type="submit" className="btn-submit">Add Application</button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="tracker-filters">
        <input
          type="text"
          placeholder="Search by company or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="status-filters">
          <button
            className={filterStatus === "all" ? "active" : ""}
            onClick={() => setFilterStatus("all")}
          >
            All ({applications.length})
          </button>
          <button
            className={filterStatus === "applied" ? "active" : ""}
            onClick={() => setFilterStatus("applied")}
          >
            Applied ({applications.filter(a => a.status === "applied").length})
          </button>
          <button
            className={filterStatus === "shortlisted" ? "active" : ""}
            onClick={() => setFilterStatus("shortlisted")}
          >
            Shortlisted ({applications.filter(a => a.status === "shortlisted").length})
          </button>
          <button
            className={filterStatus === "interview" ? "active" : ""}
            onClick={() => setFilterStatus("interview")}
          >
            Interview ({applications.filter(a => a.status === "interview").length})
          </button>
          <button
            className={filterStatus === "selected" ? "active" : ""}
            onClick={() => setFilterStatus("selected")}
          >
            Selected ({applications.filter(a => a.status === "selected").length})
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="applications-table-container">
        {filteredApps.length === 0 ? (
          <div className="no-applications">
            <p>No applications found. Start tracking your applications!</p>
          </div>
        ) : (
          <table className="applications-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Role</th>
                <th>Location</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className="company-cell">
                      <span className="company-icon">🏢</span>
                      <strong>{app.company_name}</strong>
                    </div>
                  </td>
                  <td>{app.role}</td>
                  <td>{app.location || "N/A"}</td>
                  <td>{new Date(app.applied_date).toLocaleDateString()}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ background: getStatusColor(app.status) }}
                    >
                      {getStatusIcon(app.status)} {app.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => setSelectedApp(app)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary Stats */}
      <div className="tracker-summary">
        <div className="summary-card">
          <h4>Total Applications</h4>
          <p>{applications.length}</p>
        </div>
        <div className="summary-card">
          <h4>Success Rate</h4>
          <p>
            {applications.length > 0
              ? ((applications.filter(a => a.status === "selected").length / applications.length) * 100).toFixed(1)
              : 0}%
          </p>
        </div>
        <div className="summary-card">
          <h4>Pending</h4>
          <p>{applications.filter(a => a.status === "applied" || a.status === "shortlisted").length}</p>
        </div>
        <div className="summary-card">
          <h4>In Progress</h4>
          <p>{applications.filter(a => a.status === "interview").length}</p>
        </div>
      </div>
      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="app-modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="app-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Application Details</h3>
              <button className="close-btn" onClick={() => setSelectedApp(null)}>✕</button>
            </div>
            <div className="modal-content">
              <div className="detail-row">
                <strong>Company:</strong> <span>{selectedApp.company_name}</span>
              </div>
              <div className="detail-row">
                <strong>Role:</strong> <span>{selectedApp.role}</span>
              </div>
              <div className="detail-row">
                <strong>Location:</strong> <span>{selectedApp.location || "N/A"}</span>
              </div>
              <div className="detail-row">
                <strong>Applied On:</strong> <span>{new Date(selectedApp.applied_date).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <strong>Current Status:</strong>
                <span className="status-badge" style={{ background: getStatusColor(selectedApp.status) }}>
                  {getStatusIcon(selectedApp.status)} {selectedApp.status}
                </span>
              </div>

              <div className="update-status-section">
                <h4>Update Status</h4>
                <div className="status-options">
                  {["applied", "shortlisted", "interview", "rejected", "selected"].map(s => (
                    <button
                      key={s}
                      className={`status-opt-btn ${selectedApp.status === s ? 'active' : ''}`}
                      onClick={() => handleUpdateStatus(selectedApp.id, s)}
                      disabled={isUpdating}
                    >
                      {getStatusIcon(s)} {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-delete"
                onClick={() => handleDeleteApplication(selectedApp.id)}
              >
                🗑️ Delete Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicationTracker;
