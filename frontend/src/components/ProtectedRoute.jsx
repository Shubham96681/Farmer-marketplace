import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Debug logging
  console.log("🛡️ ProtectedRoute Check:");
  console.log("🛡️ Token exists:", !!token);
  console.log("🛡️ User data:", user);
  console.log("🛡️ User role:", user.role);
  console.log("🛡️ Allowed roles:", allowedRoles);

  // Check if user is authenticated
  if (!token || !user.role) {
    console.log("🛡️ Redirecting to login - no token or role");
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log("🛡️ Redirecting to unauthorized - role not allowed");
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("🛡️ Access granted to:", user.role);
  return children;
};

export default ProtectedRoute;