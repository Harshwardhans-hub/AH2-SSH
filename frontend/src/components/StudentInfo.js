import React, { useState, useEffect } from "react";
import api from "../api";
import "./StudentInfo.css";

function StudentInfo() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  return (
    <div className="student-info-container">
      <div className="student-header">
        <h2>Student Information</h2>
        <input
          type="text"
          placeholder="Search students by name, email, or college..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="student-stats">
        <div className="stat-box">
          <h3>{filteredStudents.length}</h3>
          <p>Total Students</p>
        </div>
      </div>

      <div className="student-table-container">
        {filteredStudents.length === 0 ? (
          <p className="no-data">No students found</p>
        ) : (
          <table className="student-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>College</th>
                <th>Pass Out Year</th>
                <th>Login Count</th>
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
                  <td>{student.login_count || 0}</td>
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

export default StudentInfo;
