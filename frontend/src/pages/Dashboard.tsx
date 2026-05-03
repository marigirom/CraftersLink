import React, { useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { Commission, Invoice, PaginatedResponse } from '../types';
import { mockDesignerStats, mockArtisanStats } from '../utils/mockData';

// Skeleton Loader Component
const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

const SkeletonListItem: React.FC = () => (
  <div className="p-4 border border-gray-200 rounded-lg animate-pulse">
    <div className="flex items-start justify-between mb-2">
      <div className="h-5 bg-gray-200 rounded w-32"></div>
      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  </div>
);

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Fetch data with refetch capability
  const { data: commissionsData, loading: commissionsLoading, refetch: refetchCommissions } = useApi<PaginatedResponse<Commission>>(
    '/commissions/',
    { immediate: isAuthenticated }
  );
  const { data: invoicesData, loading: invoicesLoading, refetch: refetchInvoices } = useApi<PaginatedResponse<Invoice>>(
    '/invoices/',
    { immediate: isAuthenticated }
  );

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    console.log('Manual refresh triggered');
    refetchCommissions();
    refetchInvoices();
  }, [refetchCommissions, refetchInvoices]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping auto-refresh');
      return;
    }

    console.log('Setting up auto-refresh interval (30 seconds)');
    const interval = setInterval(() => {
      console.log('Auto-refresh triggered');
      refetchCommissions();
      refetchInvoices();
    }, 30000); // 30 seconds

    return () => {
      console.log('Cleaning up auto-refresh interval');
      clearInterval(interval);
    };
  }, [isAuthenticated, refetchCommissions, refetchInvoices]);

  // Safe data extraction with null checks using optional chaining
  const commissions = commissionsData?.results || [];
  const invoices = invoicesData?.results || [];
  const totalCommissions = commissions?.length || 0;
  const inProgressCount = commissions?.filter(c => c?.status === 'in_progress')?.length || 0;
  const completedCount = commissions?.filter(c => c?.status === 'completed')?.length || 0;
  const pendingInvoicesCount = invoices?.filter(i => i?.status === 'sent')?.length || 0;

  // Role-specific stats with dummy data
  const isDesigner = user?.role === 'DESIGNER';
  const isArtisan = user?.role === 'ARTISAN';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.first_name || 'User'}!
            </h1>
            <p className="text-gray-600">
              {isDesigner
                ? 'Manage your commissions and track project progress'
                : 'View your active projects and invoices'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={commissionsLoading || invoicesLoading}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            title="Refresh dashboard data"
          >
            <svg
              className={`w-5 h-5 ${(commissionsLoading || invoicesLoading) ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats Cards - Show skeleton loaders while loading */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {commissionsLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : isDesigner ? (
            // Designer-specific stats
            <>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Commissions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {totalCommissions}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {mockDesignerStats.activeProjects}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Milestones</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {mockDesignerStats.completedMilestones}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spend</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      KES {mockDesignerStats.totalSpend.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Artisan-specific stats
            <>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">New Requests</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {mockArtisanStats.newRequests}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {mockArtisanStats.activeJobs}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      KES {mockArtisanStats.totalEarnings.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Projects</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {mockArtisanStats.completedProjects}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Commissions */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Recent Commissions</h2>
                {isDesigner && (
                  <Link
                    to="/commission/new"
                    className="text-sm font-medium text-amber-600 hover:text-amber-700"
                  >
                    New Commission →
                  </Link>
                )}
              </div>
            </div>

            <div className="p-6">
              {commissionsLoading ? (
                <div className="space-y-4">
                  <SkeletonListItem />
                  <SkeletonListItem />
                  <SkeletonListItem />
                </div>
              ) : totalCommissions > 0 ? (
                <div className="space-y-4">
                  {commissions.slice(0, 5).map((commission) => (
                    <Link
                      key={commission?.id}
                      to={`/commissions/${commission?.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-amber-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{commission?.title || 'Untitled Commission'}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(commission?.status || 'pending')}`}>
                          {commission?.status?.replace('_', ' ') || 'pending'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {commission?.description || 'No description available'}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          {isDesigner
                            ? `Artisan: ${commission?.artisan?.business_name || 'Unknown'}`
                            : `Designer: ${commission?.designer?.first_name || ''} ${commission?.designer?.last_name || 'Unknown'}`}
                        </span>
                        <span className="font-medium text-amber-600">
                          KES {parseFloat(commission?.budget || '0').toLocaleString()}
                        </span>
                      </div>
                      {commission?.milestones && commission.milestones.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>
                              {commission.milestones.filter(m => m?.status === 'completed').length} / {commission.milestones.length} milestones
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-amber-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${(commission.milestones.filter(m => m?.status === 'completed').length / commission.milestones.length) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">No commissions yet</p>
                  {isDesigner && (
                    <Link
                      to="/commission/new"
                      className="mt-4 inline-block px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Create Your First Commission
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Recent Invoices</h2>
            </div>

            <div className="p-6">
              {invoicesLoading ? (
                <div className="space-y-4">
                  <SkeletonListItem />
                  <SkeletonListItem />
                  <SkeletonListItem />
                </div>
              ) : invoices?.length > 0 ? (
                <div className="space-y-4">
                  {invoices.slice(0, 5).map((invoice) => (
                    <Link
                      key={invoice?.id}
                      to={`/invoices/${invoice?.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-amber-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Invoice #{invoice?.invoice_number || 'N/A'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {invoice?.commission?.title || 'No title'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice?.status || 'draft')}`}>
                          {invoice?.status || 'draft'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-3">
                        <span className="text-gray-500">
                          Due: {invoice?.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className="font-bold text-gray-900">
                          KES {parseFloat(invoice?.total_amount || '0').toLocaleString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">No invoices yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// Made with Bob
