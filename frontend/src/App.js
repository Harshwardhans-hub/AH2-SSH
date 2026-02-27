import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";

import Login from "./components/Login";
import StudentDashboard from "./components/StudentDashboard";
import CollegeDashboard from "./components/CollegeDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { BackgroundProvider } from "./context/BackgroundContext";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (token && user.role) {
      setIsLoggedIn(true);
      setUserRole(user.role);
    }
  }, []);

  const handleLogin = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setIsLoggedIn(true);
    setUserRole(user.role);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserRole(null);
    window.location.href = "/";
  };

  // Role-based redirect after login
  const getDashboardPath = () => {
    if (userRole === "student") return "/student-dashboard";
    if (userRole === "college") return "/college-dashboard";
    if (userRole === "admin") return "/admin-dashboard";
    return "/";
  };

  return (
    <BackgroundProvider>
      <Router>
        <div className="App">
          <header className="header">
            <h1>Hack-2-Hire</h1>
            {isLoggedIn && (
              <div className="header-right">
                <span className="user-role-badge">{userRole}</span>
                <button className="logout-btn" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </header>

          <Routes>
          {/* Login Route */}
          <Route
            path="/"
            element={
              !isLoggedIn ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to={getDashboardPath()} replace />
              )
            }
          />

          {/* Student Dashboard Routes */}
          <Route
            path="/student-dashboard/*"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* College Dashboard Routes */}
          <Route
            path="/college-dashboard/*"
            element={
              <ProtectedRoute allowedRoles={["college"]}>
                <CollegeDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard Routes */}
          <Route
            path="/admin-dashboard/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to appropriate dashboard */}
          <Route
            path="*"
            element={<Navigate to={isLoggedIn ? getDashboardPath() : "/"} replace />}
          />
        </Routes>
      </div>
    </Router>
    </BackgroundProvider>
  );
}

export default App;
