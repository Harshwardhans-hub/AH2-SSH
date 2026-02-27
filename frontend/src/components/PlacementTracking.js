import React, { useState, useEffect } from "react";
import api from "../api";
import "./PlacementTracking.css";

function PlacementTracking() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filters, setFilters] = useState({
    department: "",
    status: "",
    cgpaMin: "",
    cgpaMax: "",
    year: ""
  });
  const [editingStudent, setEditingStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, students]);

  const fetchStudents = async () => {
    try {
      const response = await api.get(`/placement/tracking/${user.id}`);
      setStudents(response.data);
      setFilteredStudents(response.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const applyFilters = () => {
    let filtered = [...students];

    if (filters.department) {
      filtered = filtered.filter(s => s.department === filters.department);
    }
    if (filters.status) {
      filtered = filtered.filter(s => s.current_status === filters.status);
    }
    if (filters.cgpaMin) {
      filtered = filtered.filter(s => s.cgpa >= parseFloat(filters.cgpaMin));
    }
    if (filters.cgpaMax) {
      filtered = filtered.filter(s => s.cgpa <= parseFloat(filters.cgpaMax));
    }
    if (filters.year) {
      filtered = filtered.filter(s => s.pass_out_year === parseInt(filters.year));
    }

    setFilteredStudents(filtered);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      await api.post("/placement/student", editingStudent);
      alert("Student placement data updated successfully!");
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      alert("Error updating student data");
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      "Not Applied": "gray",
      "Applied": "blue",
      "Shortlisted": "yellow",
      "Interview": "orange",
      "Placed": "green",
      "Rejected": "red"
    };
    return <span className={`status-badge ${statusColors[status] || "gray"}`}>{status}</span>;
  };

  const departments = [...new Set(students.map(s => s.department).filter(Boolean))];
  const statuses = ["Not Applied", "Applied", "Shortlisted", "Interview", "Placed", "Rejected"];

  return (
    <div className="placement-tracking">
      <div className="tracking-header">
        <h2>Student Placement Tracking</h2>
        <p>Detailed tracking of all students' placement status</p>
      </div>

      <div className="filters-section">
        <select value={filters.department} onChange={(e) => setFilters({...filters, department: e.target.value})}>
          <option value="">All Departments</option>
          {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
        </select>

        <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
          <option value="">All Status</option>
          {statuses.map(status => <option key={status} value={status}>{status}</option>)}
        </select>

        <input
          type="number"
          placeholder="Min CGPA"
          step="0.1"
          value={filters.cgpaMin}
          onChange={(e) => setFilters({...filters, cgpaMin: e.target.value})}
        />

        <input
          type="number"
          placeholder="Max CGPA"
          step="0.1"
          value={filters.cgpaMax}
          onChange={(e) => setFilters({...filters, cgpaMax: e.target.value})}
        />

        <input
          type="number"
          placeholder="Year"
          value={filters.year}
          onChange={(e) => setFilters({...filters, year: e.target.value})}
        />

        <button className="clear-btn" onClick={() => setFilters({department: "", status: "", cgpaMin: "", cgpaMax: "", year: ""})}>
          Clear Filters
        </button>
      </div>

      <div className="table-container">
        <table className="placement-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Department</th>
              <th>CGPA</th>
              <th>Eligibility</th>
              <th>Companies Applied</th>
              <th>Applied To</th>
              <th>Current Status</th>
              <th>Offer Count</th>
              <th>Package (LPA)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="10" style={{textAlign: 'center', padding: '2rem'}}>
                  No students found
                </td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.department || "N/A"}</td>
                  <td>{student.cgpa || "N/A"}</td>
                  <td>
                    <span className={`eligibility-badge ${student.eligibility_status === 'Eligible' ? 'eligible' : 'not-eligible'}`}>
                      {student.eligibility_status || "N/A"}
                    </span>
                  </td>
                  <td>{student.companies_applied || 0}</td>
                  <td>
                    <div className="companies-list" title={student.companies_list || "No applications yet"}>
                      {student.companies_list || "No applications yet"}
                    </div>
                  </td>
                  <td>{getStatusBadge(student.current_status || "Not Applied")}</td>
                  <td>{student.offer_count || 0}</td>
                  <td>₹ {student.package_offered || 0}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(student)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Update Placement Data</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingStudent.cgpa || ""}
                  onChange={(e) => setEditingStudent({...editingStudent, cgpa: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Eligibility Status</label>
                <select
                  value={editingStudent.eligibility_status || ""}
                  onChange={(e) => setEditingStudent({...editingStudent, eligibility_status: e.target.value})}
                >
                  <option value="Eligible">Eligible</option>
                  <option value="Not Eligible">Not Eligible</option>
                </select>
              </div>

              <div className="form-group">
                <label>Companies Applied</label>
                <input
                  type="number"
                  value={editingStudent.companies_applied || 0}
                  onChange={(e) => setEditingStudent({...editingStudent, companies_applied: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Current Status</label>
                <select
                  value={editingStudent.current_status || ""}
                  onChange={(e) => setEditingStudent({...editingStudent, current_status: e.target.value})}
                >
                  {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Offer Count</label>
                <input
                  type="number"
                  value={editingStudent.offer_count || 0}
                  onChange={(e) => setEditingStudent({...editingStudent, offer_count: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Package Offered (LPA)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingStudent.package_offered || ""}
                  onChange={(e) => setEditingStudent({...editingStudent, package_offered: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Is Placed?</label>
                <select
                  value={editingStudent.is_placed ? "true" : "false"}
                  onChange={(e) => setEditingStudent({...editingStudent, is_placed: e.target.value === "true"})}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              <div className="form-group">
                <label>Graduation Year</label>
                <input
                  type="number"
                  value={editingStudent.graduation_year || editingStudent.pass_out_year || ""}
                  onChange={(e) => setEditingStudent({...editingStudent, graduation_year: e.target.value})}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="save-btn" onClick={handleSave}>Save</button>
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlacementTracking;
