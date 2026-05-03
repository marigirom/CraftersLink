import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Don't show loading spinner, just wait
  if (loading) {
    return null;
  }

  // Redirect to login if auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Redirect to appropriate page if user is authenticated but trying to access auth pages
  if (!requireAuth && isAuthenticated) {
    // Redirect based on user role
    if (user?.role === 'ARTISAN') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/catalogue" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

// Made with Bob