import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: ('ARTISAN' | 'INTERIOR_DESIGNER')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  allowedRoles,
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // LEVEL 1: Authentication Check
  // If route requires NO auth (login/register) but user IS authenticated
  if (!requireAuth && isAuthenticated && user) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'ARTISAN') {
      return <Navigate to="/artisan/dashboard" replace />;
    } else if (user.role === 'INTERIOR_DESIGNER') {
      return <Navigate to="/designer/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // If route requires auth but user is NOT authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // LEVEL 2: Role-Based Access Control
  if (allowedRoles && user) {
    const hasAccess = allowedRoles.includes(user.role);
    
    if (!hasAccess) {
      // Redirect to correct dashboard based on user's actual role
      if (user.role === 'ARTISAN') {
        return <Navigate to="/artisan/dashboard" replace />;
      } else if (user.role === 'INTERIOR_DESIGNER') {
        return <Navigate to="/designer/dashboard" replace />;
      }
      // Fallback
      return <Navigate to="/dashboard" replace />;
    }
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;

// Made with Bob