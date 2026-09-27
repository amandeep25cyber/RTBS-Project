import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role if unauthorized
    if (user.role === 'admin') return <Navigate to="/admin/feed" replace />;
    if (user.role === 'advertiser') return <Navigate to="/advertiser/dashboard" replace />;
    if (user.role === 'publisher') return <Navigate to="/publisher/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
