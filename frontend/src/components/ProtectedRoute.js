import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role;

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    if (role === 'student') return <Navigate to="/student-dashboard" replace />;
    if (role === 'college') return <Navigate to="/college-dashboard" replace />;
    if (role === 'admin') return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
