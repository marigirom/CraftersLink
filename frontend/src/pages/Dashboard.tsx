import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { Commission, Invoice, PaginatedResponse } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  const { data: commissionsData, loading: commissionsLoading } = useApi<PaginatedResponse<Commission>>(
    '/commissions/'
  );
  const { data: invoicesData, loading: invoicesLoading } = useApi<PaginatedResponse<Invoice>>(
    '/invoices/'
  );

  const commissions = commissionsData?.results || [];
  const invoices = invoicesData?.results || [];

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-600">
            {user?.role === 'DESIGNER'
              ? 'Manage your commissions and track project progress'
              : 'View your active projects and invoices'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Commissions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {commissions.length}
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
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {commissions.filter(c => c.status === 'in_progress').length}
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
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {commissions.filter(c => c.status === 'completed').length}
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
                <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {invoices.filter(i => i.status === 'sent').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Commissions */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Recent Commissions</h2>
                {user?.role === 'DESIGNER' && (
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
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                </div>
              ) : commissions.length > 0 ? (
                <div className="space-y-4">
                  {commissions.slice(0, 5).map((commission) => (
                    <Link
                      key={commission.id}
                      to={`/commissions/${commission.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-amber-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{commission.title}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(commission.status)}`}>
                          {commission.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {commission.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          {user?.role === 'DESIGNER'
                            ? `Artisan: ${commission.artisan.business_name}`
                            : `Designer: ${commission.designer.first_name} ${commission.designer.last_name}`}
                        </span>
                        <span className="font-medium text-amber-600">
                          KES {parseFloat(commission.budget).toLocaleString()}
                        </span>
                      </div>
                      {commission.milestones && commission.milestones.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>
                              {commission.milestones.filter(m => m.status === 'completed').length} / {commission.milestones.length} milestones
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-amber-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${(commission.milestones.filter(m => m.status === 'completed').length / commission.milestones.length) * 100}%`
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
                  {user?.role === 'DESIGNER' && (
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
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                </div>
              ) : invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.slice(0, 5).map((invoice) => (
                    <Link
                      key={invoice.id}
                      to={`/invoices/${invoice.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-amber-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Invoice #{invoice.invoice_number}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {invoice.commission.title}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-3">
                        <span className="text-gray-500">
                          Due: {new Date(invoice.due_date).toLocaleDateString()}
                        </span>
                        <span className="font-bold text-gray-900">
                          KES {parseFloat(invoice.total_amount).toLocaleString()}
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
