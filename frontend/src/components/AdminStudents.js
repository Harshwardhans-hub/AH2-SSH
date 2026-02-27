import React, { useState, useEffect } from "react";
import api from "../api";
import "./AdminStudents.css";

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);

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
      const response = await api.get("/students");
      setStudents(response.data);
      setFilteredStudents(response.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  return (
    <div className="admin-students-container">
      <div className="students-header">
        <h2>All Students</h2>
        <input
          type="text"
          placeholder="Search students by name, email, or college..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="students-stats">
        <div className="stat-box">
          <h3>{filteredStudents.length}</h3>
          <p>Total Students</p>
        </div>
      </div>

      <div className="students-table-container">
        {filteredStudents.length === 0 ? (
          <p className="no-data">No students found</p>
        ) : (
          <table className="students-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>College</th>
                <th>Pass Out Year</th>
                <th>Registered On</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.college || "N/A"}</td>
                  <td>{student.pass_out_year || "N/A"}</td>
                  <td>{new Date(student.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminStudents;
