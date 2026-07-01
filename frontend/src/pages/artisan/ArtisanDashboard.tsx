import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface DashboardStats {
  totalProducts: number;
  newRequests: number;
  activeJobs: number;
  completedJobs: number;
}

interface Commission {
  id: number;
  designer_name: string;
  status: string;
  status_display?: string;
  created_at: string;
  custom_brief?: string;
  budget_kes?: string | number;
  budget?: string | number;
  title?: string;
  project?: { id: number; name: string } | null;
  item_title?: string | null;
}

const ArtisanDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    newRequests: 0,
    activeJobs: 0,
    completedJobs: 0,
  });
  const [recentCommissions, setRecentCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user || !user.id) {
      setError('User information not available. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch artisan's profile to get artisan_id
      const profileRes = await api.get('/artisans/profile/me/');
      const artisanId = profileRes.data.data?.id;

      if (!artisanId) {
        setError('profile_not_found');
        setLoading(false);
        return;
      }

      // Fetch artisan's products
      const productsRes = await api.get(`/artisans/products/?artisan=${artisanId}`);
      const products = productsRes.data.results || productsRes.data || [];

      // Fetch commissions for this artisan — uses role-based filtering, no artisan param needed
      const commissionsRes = await api.get('/commissions/');
      const commissions: Commission[] =
        commissionsRes.data.results || commissionsRes.data || [];
      setRecentCommissions(commissions.slice(0, 5));

      // Stats — backend uses uppercase status
      const newRequests = commissions.filter((c) => c.status === 'PENDING').length;
      const activeJobs = commissions.filter(
        (c) => c.status === 'IN_PROGRESS' || c.status === 'ACCEPTED'
      ).length;
      const completedJobs = commissions.filter((c) => c.status === 'COMPLETED').length;

      setStats({
        totalProducts: products.length || 0,
        newRequests,
        activeJobs,
        completedJobs,
      });
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        setTimeout(() => (window.location.href = '/login'), 2000);
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view this dashboard.');
      } else if (err.response?.status === 404) {
        setError('Dashboard data not found. Please complete your profile setup.');
      } else {
        setError(
          err.response?.data?.message || err.message || 'Failed to load dashboard data'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED':
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatBudget = (c: Commission): string => {
    const raw = c.budget_kes ?? c.budget;
    if (raw == null) return '—';
    return `KES ${parseFloat(String(raw)).toLocaleString()}`;
  };

  const statusLabel = (c: Commission): string => {
    if (c.status_display) return c.status_display;
    return c.status.replace(/_/g, ' ');
  };

  // Use the correct action endpoint (POST /commissions/{id}/action/)
  const handleAcceptCommission = async (commissionId: number) => {
    try {
      setActionError(null);
      // Artisan must provide agreed_delivery_date — use today + 30 days as default
      const agreedDate = new Date();
      agreedDate.setDate(agreedDate.getDate() + 30);
      const agreedDateStr = agreedDate.toISOString().split('T')[0];

      await api.post(`/commissions/${commissionId}/action/`, {
        action: 'accept',
        agreed_delivery_date: agreedDateStr,
      });
      await fetchDashboardData();
    } catch (err: any) {
      setActionError(
        err.response?.data?.message || 'Failed to accept commission.'
      );
    }
  };

  const handleDeclineCommission = async (commissionId: number) => {
    try {
      setActionError(null);
      await api.post(`/commissions/${commissionId}/action/`, {
        action: 'reject',
      });
      await fetchDashboardData();
    } catch (err: any) {
      setActionError(
        err.response?.data?.message || 'Failed to decline commission.'
      );
    }
  };

  // Guard: Wait for user data to be available
  if (!user || !user.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Special handling for profile not found
  if (error === 'profile_not_found') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-8 rounded-lg shadow-md">
            <div className="flex items-start mb-6">
              <svg
                className="w-8 h-8 text-amber-500 mr-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h2 className="text-xl font-bold text-amber-900 mb-2">
                  Complete Your Profile
                </h2>
                <p className="text-amber-800 mb-4">
                  Welcome to CraftersLink! To access your dashboard and start listing
                  products, you need to complete your artisan profile first.
                </p>
                <Link
                  to="/artisan/profile"
                  className="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium shadow-sm"
                >
                  Create Your Profile Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.first_name || user?.username || 'Artisan'}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your craft business today.
          </p>
        </div>

        {/* Action error */}
        {actionError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
            <p className="text-sm text-red-700">{actionError}</p>
            <button
              onClick={() => setActionError(null)}
              className="text-red-400 hover:text-red-600 ml-3"
            >
              ✕
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">New Requests</p>
                <p className="text-3xl font-bold text-gray-900">{stats.newRequests}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeJobs}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Completed Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedJobs}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Commission Requests */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Commission Requests
            </h2>
          </div>

          <div className="p-6">
            {recentCommissions.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-600 mb-2">No commission requests yet</p>
                <p className="text-sm text-gray-500">New requests will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCommissions.map((commission) => (
                  <div
                    key={commission.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-amber-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-0.5">
                          {commission.title || commission.designer_name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">
                          From: <span className="font-medium">{commission.designer_name}</span>
                          {commission.item_title && (
                            <span className="text-gray-500">
                              {' '}· Item:{' '}
                              <span className="italic">{commission.item_title}</span>
                            </span>
                          )}
                        </p>
                        {/* Project context */}
                        {commission.project && (
                          <p className="text-xs text-amber-700 mb-1">
                            For project:{' '}
                            <span className="font-semibold">{commission.project.name}</span>
                          </p>
                        )}
                        {commission.custom_brief && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {commission.custom_brief}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-500">
                            {new Date(commission.created_at).toLocaleDateString()}
                          </span>
                          <span className="font-medium text-amber-600">
                            {formatBudget(commission)}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ml-3 ${getStatusColor(
                          commission.status
                        )}`}
                      >
                        {statusLabel(commission)}
                      </span>
                    </div>

                    {commission.status === 'PENDING' && (
                      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleAcceptCommission(commission.id)}
                          className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineCommission(commission.id)}
                          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/artisan/products/new"
              className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all group"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-amber-200 transition-colors">
                <svg
                  className="w-6 h-6 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Add New Product</h3>
                <p className="text-sm text-gray-600">Showcase your latest work</p>
              </div>
            </Link>

            <Link
              to="/artisan/profile"
              className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">View My Profile</h3>
                <p className="text-sm text-gray-600">Update your information</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisanDashboard;

// Made with Bob
