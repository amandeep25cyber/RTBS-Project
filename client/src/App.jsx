import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminFeed from './pages/AdminFeed';
import AdminDSPs from './pages/AdminDSPs';
import AdminUsers from './pages/AdminUsers';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminSimulator from './pages/AdminSimulator';
import AdvDashboard from './pages/AdvDashboard';
import AdvCampaigns from './pages/AdvCampaigns';
import AdvAnalytics from './pages/AdvAnalytics';
import PubDashboard from './pages/PubDashboard';
import PubSlots from './pages/PubSlots';
import PubAnalytics from './pages/PubAnalytics';
import Profile from './pages/Profile';

function AppRoutes() {
  const { currentUser, role } = useAuth();

  return (
    <Routes>
      <Route path="/" element={
        currentUser 
          ? <Navigate to={role === 'admin' ? '/admin/feed' : role === 'advertiser' ? '/advertiser/dashboard' : '/publisher/dashboard'} /> 
          : <Navigate to="/login" />
      } />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/feed" element={<AdminFeed />} />
        <Route path="/admin/dsps" element={<AdminDSPs />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/simulator" element={<AdminSimulator />} />
      </Route>

      {/* Advertiser Routes */}
      <Route element={<ProtectedRoute allowedRoles={['advertiser']} />}>
        <Route path="/advertiser/dashboard" element={<AdvDashboard />} />
        <Route path="/advertiser/campaigns" element={<AdvCampaigns />} />
        <Route path="/advertiser/analytics" element={<AdvAnalytics />} />
      </Route>

      {/* Publisher Routes */}
      <Route element={<ProtectedRoute allowedRoles={['publisher']} />}>
        <Route path="/publisher/dashboard" element={<PubDashboard />} />
        <Route path="/publisher/slots" element={<PubSlots />} />
        <Route path="/publisher/analytics" element={<PubAnalytics />} />
      </Route>

      {/* Shared Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'advertiser', 'publisher']} />}>
        <Route path="/profile" element={<Profile />} />
      </Route>
      
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
