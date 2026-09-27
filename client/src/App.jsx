import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Page stubs
import {
  Login, Signup,
  AdminFeed, AdminDSPs, AdminUsers, AdminAnalytics, AdminRevenue, AdminSimulator,
  AdvDashboard, AdvCampaigns, AdvAnalytics, AdvWallet,
  PubDashboard, PubSlots, PubAnalytics, PubEarnings,
  Profile
} from './pages';

import { Shell } from './components/Shell';

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin/feed' : user.role === 'advertiser' ? '/advertiser/dashboard' : '/publisher/dashboard') : '/login'} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/feed" element={<Shell><AdminFeed /></Shell>} />
        <Route path="/admin/dsps" element={<Shell><AdminDSPs /></Shell>} />
        <Route path="/admin/users" element={<Shell><AdminUsers /></Shell>} />
        <Route path="/admin/analytics" element={<Shell><AdminAnalytics /></Shell>} />
        <Route path="/admin/revenue" element={<Shell><AdminRevenue /></Shell>} />
        <Route path="/admin/simulator" element={<Shell><AdminSimulator /></Shell>} />
      </Route>

      {/* Advertiser Routes */}
      <Route element={<ProtectedRoute allowedRoles={['advertiser']} />}>
        <Route path="/advertiser/dashboard" element={<Shell><AdvDashboard /></Shell>} />
        <Route path="/advertiser/campaigns" element={<Shell><AdvCampaigns /></Shell>} />
        <Route path="/advertiser/analytics" element={<Shell><AdvAnalytics /></Shell>} />
        <Route path="/advertiser/wallet" element={<Shell><AdvWallet /></Shell>} />
      </Route>

      {/* Publisher Routes */}
      <Route element={<ProtectedRoute allowedRoles={['publisher']} />}>
        <Route path="/publisher/dashboard" element={<Shell><PubDashboard /></Shell>} />
        <Route path="/publisher/slots" element={<Shell><PubSlots /></Shell>} />
        <Route path="/publisher/analytics" element={<Shell><PubAnalytics /></Shell>} />
        <Route path="/publisher/earnings" element={<Shell><PubEarnings /></Shell>} />
      </Route>

      {/* Shared Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Shell><Profile /></Shell>} />
      </Route>
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
