import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { FaUser, FaUsers, FaBuilding, FaHome, FaUserGraduate } from "react-icons/fa";

import Profile from "./Profile";
import AdminHome from "./AdminHome";
import AdminColleges from "./AdminColleges";
import AdminStudents from "./AdminStudents";
import CommunityNew from "./CommunityNew";

function AdminDashboard() {
  return (
    <div className="dashboard">
      {/* Admin Sidebar */}
      <aside className="sidebar admin-sidebar">
        <Link to="/admin-dashboard" className="menu-item">
          <FaHome /> <span>Home</span>
        </Link>
        <Link to="/admin-dashboard/profile" className="menu-item">
          <FaUser /> <span>Profile</span>
        </Link>
        <Link to="/admin-dashboard/community" className="menu-item">
          <FaUsers /> <span>Community</span>
        </Link>
        <Link to="/admin-dashboard/colleges" className="menu-item">
          <FaBuilding /> <span>Colleges Connected</span>
        </Link>
        <Link to="/admin-dashboard/students" className="menu-item">
          <FaUserGraduate /> <span>All Students</span>
        </Link>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/community" element={<CommunityNew />} />
          <Route path="/colleges" element={<AdminColleges />} />
          <Route path="/students" element={<AdminStudents />} />
        </Routes>
      </main>
    </div>
  );
}

export default AdminDashboard;
