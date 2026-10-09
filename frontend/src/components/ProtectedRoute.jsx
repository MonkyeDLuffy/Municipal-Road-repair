import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, allowedRoles = ['worker'] }) {
  const { user, loading, isAuthenticated, authType } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent" />
          <p className="text-surface-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginPath = authType === 'citizen' ? '/citizen/login' : authType === 'supervisor' ? '/supervisor/login' : authType === 'admin' ? '/admin/login' : '/worker/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    const loginPath = authType === 'citizen' ? '/citizen/login' : authType === 'supervisor' ? '/supervisor/login' : authType === 'admin' ? '/admin/login' : '/worker/login';
    return <Navigate to={loginPath} replace />;
  }

  return children;
}

export function CitizenProtectedRoute({ children }) {
  return <ProtectedRoute allowedRoles={['citizen']}>{children}</ProtectedRoute>;
}

export function WorkerProtectedRoute({ children }) {
  return <ProtectedRoute allowedRoles={['worker']}>{children}</ProtectedRoute>;
}

export function SupervisorProtectedRoute({ children }) {
  return <ProtectedRoute allowedRoles={['supervisor']}>{children}</ProtectedRoute>;
}

export function AdminProtectedRoute({ children }) {
  return <ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>;
}