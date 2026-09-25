import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { currentUser, role } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="flex h-screen items-center justify-center bg-base-darker text-status-red p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Not Authorized</h2>
          <p className="mt-2 text-slate-400">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
