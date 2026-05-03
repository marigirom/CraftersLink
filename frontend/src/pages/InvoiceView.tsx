import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { Invoice } from '../types';

const InvoiceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: invoice, loading, error } = useApi<Invoice>(`/invoices/${id}/`);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Invoice not found</h3>
          <p className="mt-1 text-sm text-gray-500">{error || 'The invoice you are looking for does not exist.'}</p>
          <div className="mt-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleDownloadPDF = () => {
    if (invoice.pdf_file) {
      window.open(invoice.pdf_file, '_blank');
    } else {
      alert('PDF not available yet');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Actions */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
            >
              Download PDF
            </button>
          </div>
        </div>

        {/* Invoice */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {/* Invoice Header */}
          <div className="flex items-start justify-between mb-8 pb-8 border-b-2 border-gray-200">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
              <p className="text-lg text-gray-600">#{invoice.invoice_number}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(invoice.status)}`}>
                {invoice.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* From */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">From</h3>
              <div className="text-gray-900">
                <p className="font-semibold text-lg">{invoice.commission.artisan.business_name}</p>
                <p className="text-sm mt-1">{invoice.commission.artisan.user.email}</p>
                {invoice.commission.artisan.user.phone_number && (
                  <p className="text-sm">{invoice.commission.artisan.user.phone_number}</p>
                )}
                <p className="text-sm">{invoice.commission.artisan.location}</p>
              </div>
            </div>

            {/* To */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">To</h3>
              <div className="text-gray-900">
                <p className="font-semibold text-lg">
                  {invoice.commission.designer.first_name} {invoice.commission.designer.last_name}
                </p>
                <p className="text-sm mt-1">{invoice.commission.designer.email}</p>
                {invoice.commission.designer.phone_number && (
                  <p className="text-sm">{invoice.commission.designer.phone_number}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Issue Date</p>
              <p className="text-gray-900">{new Date(invoice.issue_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Due Date</p>
              <p className="text-gray-900">{new Date(invoice.due_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Commission</p>
              <Link
                to={`/commissions/${invoice.commission.id}`}
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                {invoice.commission.title}
              </Link>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 text-sm font-semibold text-gray-500 uppercase">Description</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-500 uppercase">Qty</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-500 uppercase">Unit Price</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.line_items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-4 text-gray-900">{item.description}</td>
                    <td className="py-4 text-right text-gray-900">{item.quantity}</td>
                    <td className="py-4 text-right text-gray-900">
                      KES {parseFloat(item.unit_price).toLocaleString()}
                    </td>
                    <td className="py-4 text-right text-gray-900 font-medium">
                      KES {parseFloat(item.total).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-1/2">
              <div className="flex justify-between py-2 text-gray-600">
                <span>Subtotal</span>
                <span>KES {parseFloat(invoice.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 text-gray-600">
                <span>Tax (16%)</span>
                <span>KES {parseFloat(invoice.tax_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-gray-200 text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>KES {parseFloat(invoice.total_amount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notes</h3>
              <p className="text-gray-700 text-sm">{invoice.notes}</p>
            </div>
          )}

          {/* Payment Status */}
          {invoice.status === 'sent' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Payment Pending</h4>
                  <p className="text-sm text-blue-700">
                    This invoice is awaiting payment. Please process payment by {new Date(invoice.due_date).toLocaleDateString()}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {invoice.status === 'paid' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 print:hidden">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-green-900 mb-1">Payment Received</h4>
                  <p className="text-sm text-green-700">
                    This invoice has been paid in full. Thank you for your business!
                  </p>
                </div>
              </div>
            </div>
          )}

          {invoice.status === 'overdue' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 print:hidden">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-red-900 mb-1">Payment Overdue</h4>
                  <p className="text-sm text-red-700">
                    This invoice is past due. Please make payment as soon as possible.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>Thank you for your business!</p>
            <p className="mt-2">For questions about this invoice, please contact {invoice.commission.artisan.user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;

// Made with Bob
