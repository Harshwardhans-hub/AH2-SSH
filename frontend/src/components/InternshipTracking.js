import React, { useState, useEffect } from "react";
import api from "../api";
import "./InternshipTracking.css";

function InternshipTracking() {
  const [internships, setInternships] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [students, setStudents] = useState([]);
  const [newInternship, setNewInternship] = useState({
    student_id: "",
    company_name: "",
    stipend: "",
    start_date: "",
    end_date: "",
    has_ppo: false
  });
  const [stats, setStats] = useState({
    total: 0,
    ongoing: 0,
    completed: 0,
    with_ppo: 0,
    converted: 0
  });
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchInternships();
    fetchStudents();
  }, []);

  const fetchInternships = async () => {
    try {
      const response = await api.get(`/internships/${user.id}`);
      setInternships(response.data);
      calculateStats(response.data);
    } catch (err) {
      console.error("Error fetching internships:", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get(`/placement/tracking/${user.id}`);
      setStudents(response.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      ongoing: data.filter(i => i.internship_status === 'Ongoing').length,
      completed: data.filter(i => i.internship_status === 'Completed').length,
      with_ppo: data.filter(i => i.has_ppo).length,
      converted: data.filter(i => i.ppo_converted).length
    });
  };

  const handleAddInternship = async (e) => {
    e.preventDefault();
    try {
      await api.post("/internships", newInternship);
      alert("Internship added successfully!");
      setShowAddModal(false);
      setNewInternship({
        student_id: "",
        company_name: "",
        stipend: "",
        start_date: "",
        end_date: "",
        has_ppo: false
      });
      fetchInternships();
    } catch (err) {
      alert("Error adding internship");
    }
  };

  const handleUpdatePPO = async (internshipId, converted, packageAmount) => {
    try {
      await api.put(`/internships/${internshipId}/ppo`, {
        ppo_converted: converted,
        ppo_package: packageAmount
      });
      alert("PPO status updated!");
      fetchInternships();
    } catch (err) {
      alert("Error updating PPO status");
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      "Ongoing": "blue",
      "Completed": "green",
      "Discontinued": "red"
    };
    return <span className={`internship-status-badge ${colors[status]}`}>{status}</span>;
  };

  const viewInternshipDetails = (internship) => {
    setSelectedInternship(internship);
    setShowDetailsModal(true);
  };

  return (
    <div className="internship-tracking">
      <div className="tracking-header">
        <div>
          <h2>Internship Tracking</h2>
          <p>Track student internships and PPO conversions</p>
        </div>
        <button className="add-internship-btn" onClick={() => setShowAddModal(true)}>
          + Add Internship
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="internship-stats">
        <div className="stat-card blue">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Internships</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-number">{stats.ongoing}</div>
          <div className="stat-label">Ongoing</div>
        </div>
        <div className="stat-card green">
          <div className="stat-number">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-number">{stats.with_ppo}</div>
          <div className="stat-label">With PPO Offer</div>
        </div>
        <div className="stat-card success">
          <div className="stat-number">{stats.converted}</div>
          <div className="stat-label">PPO Converted</div>
        </div>
      </div>

      {/* Internships Table */}
      <div className="internships-table-container">
        <table className="internships-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Department</th>
              <th>Company</th>
              <th>Stipend (₹/month)</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>PPO Offer</th>
              <th>PPO Converted</th>
              <th>PPO Package</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {internships.length === 0 ? (
              <tr>
                <td colSpan="11" style={{textAlign: 'center', padding: '2rem'}}>
                  No internships recorded yet
                </td>
              </tr>
            ) : (
              internships.map(internship => (
                <tr key={internship.id}>
                  <td>{internship.student_name}</td>
                  <td>{internship.department}</td>
                  <td>{internship.company_name}</td>
                  <td>₹ {internship.stipend ? internship.stipend.toLocaleString() : 'N/A'}</td>
                  <td>{new Date(internship.start_date).toLocaleDateString()}</td>
                  <td>{new Date(internship.end_date).toLocaleDateString()}</td>
                  <td>{getStatusBadge(internship.internship_status)}</td>
                  <td>
                    <span className={`ppo-badge ${internship.has_ppo ? 'yes' : 'no'}`}>
                      {internship.has_ppo ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <span className={`ppo-badge ${internship.ppo_converted ? 'yes' : 'no'}`}>
                      {internship.ppo_converted ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    {internship.ppo_package ? `₹ ${internship.ppo_package} LPA` : '-'}
                  </td>
                  <td>
                    <button 
                      className="view-btn"
                      onClick={() => viewInternshipDetails(internship)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Internship Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Internship</h3>
            <form onSubmit={handleAddInternship}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Select Student *</label>
                  <select
                    required
                    value={newInternship.student_id}
                    onChange={(e) => setNewInternship({...newInternship, student_id: e.target.value})}
                  >
                    <option value="">Choose a student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} - {student.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newInternship.company_name}
                    onChange={(e) => setNewInternship({...newInternship, company_name: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Stipend (₹/month) *</label>
                  <input
                    type="number"
                    required
                    value={newInternship.stipend}
                    onChange={(e) => setNewInternship({...newInternship, stipend: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newInternship.start_date}
                    onChange={(e) => setNewInternship({...newInternship, start_date: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    required
                    value={newInternship.end_date}
                    onChange={(e) => setNewInternship({...newInternship, end_date: e.target.value})}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newInternship.has_ppo}
                      onChange={(e) => setNewInternship({...newInternship, has_ppo: e.target.checked})}
                    />
                    <span>Has PPO Offer</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="submit-btn">Add Internship</button>
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Internship Details Modal */}
      {showDetailsModal && selectedInternship && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Internship Details</h3>
            
            <div className="details-section">
              <div className="detail-row">
                <span className="label">Student Name:</span>
                <span className="value">{selectedInternship.student_name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Department:</span>
                <span className="value">{selectedInternship.department}</span>
              </div>
              <div className="detail-row">
                <span className="label">Company:</span>
                <span className="value">{selectedInternship.company_name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Stipend:</span>
                <span className="value">₹ {selectedInternship.stipend?.toLocaleString()}/month</span>
              </div>
              <div className="detail-row">
                <span className="label">Duration:</span>
                <span className="value">
                  {new Date(selectedInternship.start_date).toLocaleDateString()} - {new Date(selectedInternship.end_date).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className="value">{getStatusBadge(selectedInternship.internship_status)}</span>
              </div>
              <div className="detail-row">
                <span className="label">PPO Offer:</span>
                <span className="value">
                  <span className={`ppo-badge ${selectedInternship.has_ppo ? 'yes' : 'no'}`}>
                    {selectedInternship.has_ppo ? 'Yes' : 'No'}
                  </span>
                </span>
              </div>
            </div>

            {selectedInternship.has_ppo && (
              <div className="ppo-section">
                <h4>PPO Information</h4>
                <div className="detail-row">
                  <span className="label">PPO Converted:</span>
                  <span className="value">
                    <span className={`ppo-badge ${selectedInternship.ppo_converted ? 'yes' : 'no'}`}>
                      {selectedInternship.ppo_converted ? 'Yes' : 'No'}
                    </span>
                  </span>
                </div>
                {selectedInternship.ppo_converted && (
                  <div className="detail-row">
                    <span className="label">PPO Package:</span>
                    <span className="value">₹ {selectedInternship.ppo_package} LPA</span>
                  </div>
                )}

                {!selectedInternship.ppo_converted && (
                  <div className="ppo-update-form">
                    <h5>Update PPO Status</h5>
                    <div className="form-group">
                      <label>PPO Package (LPA)</label>
                      <input
                        type="number"
                        step="0.1"
                        id="ppo-package-input"
                        placeholder="Enter package amount"
                      />
                    </div>
                    <button
                      className="convert-btn"
                      onClick={() => {
                        const packageInput = document.getElementById('ppo-package-input');
                        if (packageInput.value) {
                          handleUpdatePPO(selectedInternship.id, true, packageInput.value);
                          setShowDetailsModal(false);
                        } else {
                          alert('Please enter PPO package amount');
                        }
                      }}
                    >
                      Mark as Converted
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InternshipTracking;
