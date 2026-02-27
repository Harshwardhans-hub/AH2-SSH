import React, { useState, useEffect } from "react";
import api from "../api";
import "./CompanyDrives.css";
import { FaCheckCircle, FaTimesCircle, FaEnvelope, FaSpinner, FaPaperPlane } from "react-icons/fa";

function CompanyDrives() {
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [newDrive, setNewDrive] = useState({
    company_name: "",
    job_role: "",
    package_offered: "",
    drive_date: "",
    drive_mode: "Online",
    eligibility_criteria: "",
    min_cgpa: "",
    eligible_departments: ""
  });
  const [sendingEmailFor, setSendingEmailFor] = useState(null);
  const [emailSendResult, setEmailSendResult] = useState({});
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const response = await api.get(`/company-drives/${user.id}`);
      setDrives(response.data);
    } catch (err) {
      console.error("Error fetching drives:", err);
    }
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    try {
      await api.post("/company-drives", {
        ...newDrive,
        college_id: user.id
      });
      alert("Company drive created successfully!");
      setShowCreateModal(false);
      setNewDrive({
        company_name: "",
        job_role: "",
        package_offered: "",
        drive_date: "",
        drive_mode: "Online",
        eligibility_criteria: "",
        min_cgpa: "",
        eligible_departments: ""
      });
      fetchDrives();
    } catch (err) {
      alert("Error creating drive");
    }
  };

  const handleViewEligibleStudents = async (drive) => {
    try {
      setSelectedDrive(drive);
      setEmailSendResult({});

      const minCgpa = parseFloat(drive.eligibility_criteria?.match(/CGPA:\s*([\d.]+)/)?.[1] || 0);
      const depts = drive.eligibility_criteria?.match(/Departments:\s*([^,]+(?:,\s*[^,]+)*)/)?.[1]?.split(',').map(d => d.trim()) || [];

      const response = await api.get(`/placement/tracking/${user.id}`);

      const eligible = response.data.filter(student => {
        const cgpaEligible = !minCgpa || (student.cgpa && student.cgpa >= minCgpa);
        const deptEligible = depts.length === 0 || depts.includes(student.department);
        const statusEligible = student.eligibility_status === 'Eligible';
        return cgpaEligible && deptEligible && statusEligible;
      });

      setEligibleStudents(eligible);
      setShowStudentsModal(true);
    } catch (err) {
      console.error("Error fetching eligible students:", err);
      alert("Error loading eligible students");
    }
  };

  const handleUpdateDriveStatus = async (driveId, newStatus) => {
    try {
      const drive = drives.find(d => d.id === driveId);
      await api.put(`/company-drives/${driveId}`, {
        drive_status: newStatus,
        students_applied: drive.students_applied,
        students_shortlisted: drive.students_shortlisted,
        students_selected: drive.students_selected
      });
      alert("Drive status updated!");
      fetchDrives();
    } catch (err) {
      alert("Error updating drive status");
    }
  };

  const handleSendDriveEmail = async (student, type) => {
    const key = `${student.id}-${type}`;
    setSendingEmailFor(key);
    try {
      const profileRes = await api.get(`/students?college=${user.college}`);
      const profileStudent = profileRes.data.find(s => s.id === student.id);
      const email = profileStudent?.email;

      if (!email) {
        setEmailSendResult(prev => ({ ...prev, [key]: { success: false, message: "Email not found" } }));
        setSendingEmailFor(null);
        return;
      }

      await api.post("/send-email", {
        studentEmail: email,
        studentName: student.name,
        emailType: type,
        companyName: selectedDrive.company_name,
        roleName: selectedDrive.job_role,
        additionalMessage: `Package Offered: ₹${selectedDrive.package_offered} LPA | Drive Date: ${new Date(selectedDrive.drive_date).toLocaleDateString()}`,
      });
      setEmailSendResult(prev => ({ ...prev, [key]: { success: true, message: "Email sent!" } }));
    } catch (err) {
      setEmailSendResult(prev => ({
        ...prev,
        [key]: { success: false, message: err.response?.data?.error || "Failed to send" }
      }));
    } finally {
      setSendingEmailFor(null);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      "Upcoming": "blue",
      "Ongoing": "orange",
      "Completed": "green"
    };
    return <span className={`drive-status-badge ${colors[status]}`}>{status}</span>;
  };

  return (
    <div className="company-drives">
      <div className="drives-header">
        <div>
          <h2>Company Drives Management</h2>
          <p>Manage recruitment drives and track eligible students</p>
        </div>
        <button className="create-drive-btn" onClick={() => setShowCreateModal(true)}>
          + Add New Drive
        </button>
      </div>

      <div className="drives-grid">
        {drives.length === 0 ? (
          <div className="no-drives">
            <h3>No company drives scheduled</h3>
            <p>Click "Add New Drive" to schedule a recruitment drive</p>
          </div>
        ) : (
          drives.map(drive => (
            <div key={drive.id} className="drive-card">
              <div className="drive-header-card">
                <h3>{drive.company_name}</h3>
                {getStatusBadge(drive.drive_status)}
              </div>

              <div className="drive-details">
                <div className="detail-row">
                  <span className="label">Job Role:</span>
                  <span className="value">{drive.job_role}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Package:</span>
                  <span className="value">₹ {drive.package_offered} LPA</span>
                </div>
                <div className="detail-row">
                  <span className="label">Drive Date:</span>
                  <span className="value">{new Date(drive.drive_date).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Mode:</span>
                  <span className="value">{drive.drive_mode}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Eligibility:</span>
                  <span className="value">{drive.eligibility_criteria || "Not specified"}</span>
                </div>
              </div>

              <div className="drive-stats">
                <div className="stat-item">
                  <span className="stat-number">{drive.students_applied || 0}</span>
                  <span className="stat-label">Applied</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{drive.students_shortlisted || 0}</span>
                  <span className="stat-label">Shortlisted</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{drive.students_selected || 0}</span>
                  <span className="stat-label">Selected</span>
                </div>
              </div>

              <div className="drive-actions">
                <button
                  className="view-students-btn"
                  onClick={() => handleViewEligibleStudents(drive)}
                >
                  View Eligible Students
                </button>

                <select
                  value={drive.drive_status}
                  onChange={(e) => handleUpdateDriveStatus(drive.id, e.target.value)}
                  className="status-select"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Drive Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h3>Schedule New Company Drive</h3>
            <form onSubmit={handleCreateDrive}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Company Name *</label>
                  <input type="text" required value={newDrive.company_name}
                    onChange={(e) => setNewDrive({ ...newDrive, company_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Job Role *</label>
                  <input type="text" required value={newDrive.job_role}
                    onChange={(e) => setNewDrive({ ...newDrive, job_role: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Package Offered (LPA) *</label>
                  <input type="number" step="0.1" required value={newDrive.package_offered}
                    onChange={(e) => setNewDrive({ ...newDrive, package_offered: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Drive Date *</label>
                  <input type="date" required value={newDrive.drive_date}
                    onChange={(e) => setNewDrive({ ...newDrive, drive_date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Drive Mode *</label>
                  <select value={newDrive.drive_mode}
                    onChange={(e) => setNewDrive({ ...newDrive, drive_mode: e.target.value })}>
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Minimum CGPA</label>
                  <input type="number" step="0.1" placeholder="e.g., 7.0" value={newDrive.min_cgpa}
                    onChange={(e) => setNewDrive({ ...newDrive, min_cgpa: e.target.value })} />
                </div>
                <div className="form-group full-width">
                  <label>Eligible Departments (comma-separated)</label>
                  <input type="text" placeholder="e.g., Computer Science, IT, Electronics" value={newDrive.eligible_departments}
                    onChange={(e) => setNewDrive({ ...newDrive, eligible_departments: e.target.value })} />
                </div>
                <div className="form-group full-width">
                  <label>Eligibility Criteria</label>
                  <textarea rows="3" placeholder="Enter detailed eligibility criteria..." value={newDrive.eligibility_criteria}
                    onChange={(e) => {
                      const criteria = [];
                      if (newDrive.min_cgpa) criteria.push(`CGPA: ${newDrive.min_cgpa}`);
                      if (newDrive.eligible_departments) criteria.push(`Departments: ${newDrive.eligible_departments}`);
                      criteria.push(e.target.value);
                      setNewDrive({ ...newDrive, eligibility_criteria: criteria.filter(c => c).join(', ') });
                    }} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-btn">Create Drive</button>
                <button type="button" className="cancel-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Eligible Students Modal */}
      {showStudentsModal && (
        <div className="modal-overlay" onClick={() => setShowStudentsModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h3>Eligible Students for {selectedDrive?.company_name}</h3>
            <p className="modal-subtitle">
              Job Role: {selectedDrive?.job_role} | Package: ₹ {selectedDrive?.package_offered} LPA
            </p>

            <div className="email-info-banner">
              <FaEnvelope />
              <span>Use the action buttons to send <strong>Selection</strong> or <strong>Rejection</strong> emails to students for this drive.</span>
            </div>

            <div className="students-table-container">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Department</th>
                    <th>CGPA</th>
                    <th>Current Status</th>
                    <th>Companies Applied</th>
                    <th>Offers</th>
                    <th>Email Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibleStudents.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        No eligible students found for this drive
                      </td>
                    </tr>
                  ) : (
                    eligibleStudents.map(student => {
                      const selKey = `${student.id}-selection`;
                      const rejKey = `${student.id}-rejection`;
                      return (
                        <tr key={student.id}>
                          <td><strong>{student.name}</strong></td>
                          <td>{student.department}</td>
                          <td>{student.cgpa || "N/A"}</td>
                          <td>
                            <span className={`status-badge ${student.is_placed ? 'green' : 'blue'}`}>
                              {student.current_status || "Available"}
                            </span>
                          </td>
                          <td>{student.companies_applied || 0}</td>
                          <td>{student.offer_count || 0}</td>
                          <td>
                            <div className="drive-email-actions">
                              <button
                                className="drive-email-btn selection"
                                onClick={() => handleSendDriveEmail(student, "selection")}
                                disabled={sendingEmailFor === selKey}
                                title="Send Selection Email"
                              >
                                {sendingEmailFor === selKey ? <FaSpinner className="spinning" /> : <FaCheckCircle />}
                              </button>
                              <button
                                className="drive-email-btn rejection"
                                onClick={() => handleSendDriveEmail(student, "rejection")}
                                disabled={sendingEmailFor === rejKey}
                                title="Send Rejection Email"
                              >
                                {sendingEmailFor === rejKey ? <FaSpinner className="spinning" /> : <FaTimesCircle />}
                              </button>
                              {(emailSendResult[selKey] || emailSendResult[rejKey]) && (
                                <span className={`email-result-inline ${(emailSendResult[selKey]?.success || emailSendResult[rejKey]?.success) ? 'success' : 'error'
                                  }`}>
                                  {emailSendResult[selKey]?.message || emailSendResult[rejKey]?.message}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <p className="eligible-count">
                Total Eligible Students: <strong>{eligibleStudents.length}</strong>
              </p>
              <button className="close-btn" onClick={() => setShowStudentsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyDrives;
