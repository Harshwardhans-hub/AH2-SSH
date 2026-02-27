import React, { useState, useEffect } from "react";
import api from "../api";
import "./StudentInfo.css";
import { FaEnvelope, FaCheckCircle, FaTimesCircle, FaPaperPlane, FaTimes, FaSpinner, FaUsers } from "react-icons/fa";

function StudentInfo() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailType, setEmailType] = useState("selection");
  const [companyName, setCompanyName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [additionalMessage, setAdditionalMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState(null);
  const [singleStudent, setSingleStudent] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.college && student.college.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      const response = await api.get(`/students?college=${user.college}`);
      setStudents(response.data);
      setFilteredStudents(response.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const toggleStudentSelection = (student) => {
    setSelectedStudents(prev => {
      const isSelected = prev.find(s => s.id === student.id);
      if (isSelected) {
        return prev.filter(s => s.id !== student.id);
      }
      return [...prev, student];
    });
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents([...filteredStudents]);
    }
  };

  const openEmailModal = (type, student = null) => {
    setEmailType(type);
    setSingleStudent(student);
    setCompanyName("");
    setRoleName("");
    setAdditionalMessage("");
    setEmailResult(null);
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (!companyName || !roleName) {
      alert("Please fill in Company Name and Role/Position");
      return;
    }

    setSendingEmail(true);
    setEmailResult(null);

    try {
      if (singleStudent) {
        // Send to single student
        const response = await api.post("/send-email", {
          studentEmail: singleStudent.email,
          studentName: singleStudent.name,
          emailType,
          companyName,
          roleName,
          additionalMessage,
        });
        setEmailResult({ success: true, message: response.data.message });
      } else {
        // Send to selected students (bulk)
        const studentsToEmail = selectedStudents.map(s => ({ name: s.name, email: s.email }));
        const response = await api.post("/send-bulk-email", {
          students: studentsToEmail,
          emailType,
          companyName,
          roleName,
          additionalMessage,
        });
        setEmailResult({
          success: true,
          message: response.data.message,
          results: response.data.results,
        });
      }
    } catch (err) {
      setEmailResult({
        success: false,
        message: err.response?.data?.error || "Failed to send email. Check SMTP configuration.",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const closeModal = () => {
    setShowEmailModal(false);
    setSingleStudent(null);
    setEmailResult(null);
    setCompanyName("");
    setRoleName("");
    setAdditionalMessage("");
  };

  return (
    <div className="student-info-container">
      <div className="student-header">
        <div>
          <h2>Student Information</h2>
          <p className="header-subtitle">Manage students and send placement notifications</p>
        </div>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search students by name, email, or college..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="student-stats">
        <div className="stat-box">
          <FaUsers className="stat-icon-inline" />
          <h3>{filteredStudents.length}</h3>
          <p>Total Students</p>
        </div>
        <div className="stat-box selected-stat">
          <FaCheckCircle className="stat-icon-inline" />
          <h3>{selectedStudents.length}</h3>
          <p>Selected for Email</p>
        </div>
      </div>

      {/* Bulk Email Actions */}
      {selectedStudents.length > 0 && (
        <div className="bulk-email-bar">
          <div className="bulk-info">
            <FaEnvelope />
            <span><strong>{selectedStudents.length}</strong> student{selectedStudents.length > 1 ? 's' : ''} selected</span>
          </div>
          <div className="bulk-actions">
            <button
              className="bulk-btn selection-btn"
              onClick={() => openEmailModal("selection")}
            >
              <FaCheckCircle /> Send Selection Email
            </button>
            <button
              className="bulk-btn rejection-btn"
              onClick={() => openEmailModal("rejection")}
            >
              <FaTimesCircle /> Send Rejection Email
            </button>
            <button
              className="bulk-btn clear-btn"
              onClick={() => setSelectedStudents([])}
            >
              <FaTimes /> Clear Selection
            </button>
          </div>
        </div>
      )}

      <div className="student-table-container">
        {filteredStudents.length === 0 ? (
          <p className="no-data">No students found</p>
        ) : (
          <table className="student-table">
            <thead>
              <tr>
                <th>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={toggleSelectAll}
                      className="custom-checkbox"
                    />
                    <span className="checkmark"></span>
                  </label>
                </th>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>College</th>
                <th>Pass Out Year</th>
                <th>Login Count</th>
                <th>Registered On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const isSelected = selectedStudents.find(s => s.id === student.id);
                return (
                  <tr key={student.id} className={isSelected ? "row-selected" : ""}>
                    <td>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={() => toggleStudentSelection(student)}
                          className="custom-checkbox"
                        />
                        <span className="checkmark"></span>
                      </label>
                    </td>
                    <td>{student.id}</td>
                    <td className="student-name-cell">{student.name}</td>
                    <td className="student-email-cell">{student.email}</td>
                    <td>{student.college || "N/A"}</td>
                    <td>{student.pass_out_year || "N/A"}</td>
                    <td>{student.login_count || 0}</td>
                    <td>{new Date(student.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons-cell">
                        <button
                          className="email-action-btn select-email"
                          onClick={() => openEmailModal("selection", student)}
                          title="Send Selection Email"
                        >
                          <FaCheckCircle />
                        </button>
                        <button
                          className="email-action-btn reject-email"
                          onClick={() => openEmailModal("rejection", student)}
                          title="Send Rejection Email"
                        >
                          <FaTimesCircle />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Email Compose Modal */}
      {showEmailModal && (
        <div className="email-modal-overlay" onClick={closeModal}>
          <div className="email-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`email-modal-header ${emailType}`}>
              <div className="modal-header-content">
                {emailType === "selection" ? (
                  <>
                    <FaCheckCircle className="modal-header-icon" />
                    <div>
                      <h3>Send Selection Email</h3>
                      <p>Notify student(s) about their selection</p>
                    </div>
                  </>
                ) : (
                  <>
                    <FaTimesCircle className="modal-header-icon" />
                    <div>
                      <h3>Send Rejection Email</h3>
                      <p>Notify student(s) about the application status</p>
                    </div>
                  </>
                )}
              </div>
              <button className="modal-close-btn" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            <div className="email-modal-body">
              {/* Recipients Preview */}
              <div className="recipients-section">
                <label>Recipients</label>
                <div className="recipients-list">
                  {singleStudent ? (
                    <div className="recipient-chip">
                      <span className="recipient-name">{singleStudent.name}</span>
                      <span className="recipient-email">{singleStudent.email}</span>
                    </div>
                  ) : (
                    selectedStudents.map(s => (
                      <div key={s.id} className="recipient-chip">
                        <span className="recipient-name">{s.name}</span>
                        <span className="recipient-email">{s.email}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Email Type Toggle */}
              <div className="email-type-toggle">
                <button
                  className={`type-btn ${emailType === "selection" ? "active selection" : ""}`}
                  onClick={() => setEmailType("selection")}
                >
                  <FaCheckCircle /> Selection
                </button>
                <button
                  className={`type-btn ${emailType === "rejection" ? "active rejection" : ""}`}
                  onClick={() => setEmailType("rejection")}
                >
                  <FaTimesCircle /> Rejection
                </button>
              </div>

              {/* Form Fields */}
              <div className="email-form">
                <div className="form-group">
                  <label>Company Name <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g., Google, Microsoft, Infosys"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Position / Role <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g., Software Engineer Intern, Data Analyst"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Additional Message <span className="optional">(optional)</span></label>
                  <textarea
                    rows="3"
                    placeholder="Add any additional details or instructions..."
                    value={additionalMessage}
                    onChange={(e) => setAdditionalMessage(e.target.value)}
                  />
                </div>
              </div>

              {/* Email Preview */}
              <div className="email-preview-section">
                <h4>📧 Email Preview</h4>
                <div className={`email-preview-card ${emailType}`}>
                  <div className="preview-subject">
                    <strong>Subject: </strong>
                    {emailType === "selection"
                      ? `🎉 Congratulations! You've been selected for ${roleName || "[Role]"} at ${companyName || "[Company]"}`
                      : `Application Update: ${roleName || "[Role]"} at ${companyName || "[Company]"}`
                    }
                  </div>
                  <div className="preview-body">
                    <p>Dear <strong>{singleStudent?.name || "[Student Name]"}</strong>,</p>
                    <p>
                      {emailType === "selection"
                        ? `We are thrilled to inform you that you have been selected for the position of ${roleName || "[Role]"} at ${companyName || "[Company]"}.`
                        : `After careful consideration, we regret to inform you that your application for the position of ${roleName || "[Role]"} at ${companyName || "[Company]"} has not been successful this time.`
                      }
                    </p>
                    {additionalMessage && <p className="preview-additional">{additionalMessage}</p>}
                    <p className="preview-closing">
                      Best Regards,<br />
                      <strong>Placement Cell</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Result Message */}
              {emailResult && (
                <div className={`email-result ${emailResult.success ? "success" : "error"}`}>
                  {emailResult.success ? <FaCheckCircle /> : <FaTimesCircle />}
                  <span>{emailResult.message}</span>
                  {emailResult.results && emailResult.results.failed?.length > 0 && (
                    <div className="failed-details">
                      <p>Failed to send to:</p>
                      <ul>
                        {emailResult.results.failed.map((f, i) => (
                          <li key={i}>{f.name} ({f.email}) - {f.error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="email-modal-footer">
              <button className="cancel-modal-btn" onClick={closeModal}>
                Cancel
              </button>
              <button
                className={`send-email-btn ${emailType}`}
                onClick={handleSendEmail}
                disabled={sendingEmail || !companyName || !roleName}
              >
                {sendingEmail ? (
                  <>
                    <FaSpinner className="spinning" /> Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane /> Send {emailType === "selection" ? "Selection" : "Rejection"} Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentInfo;
