import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper to check if user is artisan
  const isArtisan = user?.role === 'ARTISAN';
  // Helper to check if user is designer (handle both DESIGNER and INTERIOR_DESIGNER)
  const isDesigner = user?.role === 'DESIGNER' || user?.role === 'INTERIOR_DESIGNER';

  // Helper to check if a path is active
  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Artisan navigation items
  const artisanNavItems = [
    { label: 'Dashboard', path: '/artisan/dashboard' },
    { label: 'My Catalogue', path: '/artisan/catalogue' },
    { label: 'Profile', path: '/artisan/profile' },
  ];

  // Designer navigation items
  const designerNavItems = [
    { label: 'Dashboard', path: '/designer/dashboard' },
    { label: 'Discover Artisans', path: '/designer/catalogue' },
    { label: 'My Commissions', path: '/designer/commissions' },
    { label: 'Profile', path: '/designer/profile' },
  ];

  // Get navigation items based on role
  const navItems = isArtisan ? artisanNavItems : isDesigner ? designerNavItems : [];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">CraftersLink</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {isAuthenticated && navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActivePath(item.path)
                    ? 'bg-amber-100 text-amber-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-amber-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {isArtisan ? 'Artisan' : isDesigner ? 'Designer' : user?.role}
                    </p>
                  </div>
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-amber-200"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center border-2 border-amber-200">
                      <span className="text-amber-800 font-semibold text-sm">
                        {user?.first_name?.[0]}
                        {user?.last_name?.[0]}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActivePath(item.path)
                          ? 'bg-amber-100 text-amber-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="pt-4 border-t border-gray-200 mt-2">
                    <div className="px-4 mb-3">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {isArtisan ? 'Artisan' : isDesigner ? 'Designer' : user?.role}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-center text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-center text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;

// Made with Bob
