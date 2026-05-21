import React, { useState } from 'react';
import { Close, Download } from '@carbon/icons-react';
import api from '../../services/api';

interface Product {
  id: number;
  name: string;
  price_kes: number;
  artisan_id: number;
  artisan_name: string;
}

interface InvoiceModalProps {
  product: Product;
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const total = quantity * product.price_kes;

  // Calculate minimum delivery date (today + 3 days)
  const getMinDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        product: product.id,
        artisan: product.artisan_id,
        quantity: quantity,
        unit_price_kes: product.price_kes,
        total_kes: total,
        delivery_address: deliveryAddress,
        delivery_date: deliveryDate,
        notes: notes,
        invoice_type: 'purchase'
      };

      const response = await api.post('/invoices/', payload);
      
      if (response.status === 201 && response.data.id) {
        setInvoiceId(response.data.id);
      }
    } catch (err: any) {
      console.error('Error generating invoice:', err);
      const errorData = err.response?.data;
      
      if (errorData && typeof errorData === 'object') {
        const errorMessages = Object.entries(errorData)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`)
          .join(', ');
        setError(errorMessages || 'Failed to generate invoice. Please try again.');
      } else {
        setError('Failed to generate invoice. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async () => {
    if (!invoiceId) return;
    
    setIsDownloading(true);
    try {
      const response = await api.get(`/invoices/${invoiceId}/download/`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      // Close modal after successful download
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error downloading invoice:', err);
      setError('Failed to download invoice. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Generate Invoice</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Close size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!invoiceId ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product name:</span>
                    <span className="font-medium text-gray-900">{product.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Artisan:</span>
                    <span className="font-medium text-gray-900">{product.artisan_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unit price:</span>
                    <span className="font-medium text-gray-900">KES {product.price_kes.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Total */}
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-amber-600">KES {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address *
                </label>
                <textarea
                  id="deliveryAddress"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter full delivery address..."
                  required
                />
              </div>

              {/* Delivery Date */}
              <div>
                <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Delivery Date *
                </label>
                <input
                  type="date"
                  id="deliveryDate"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={getMinDeliveryDate()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Minimum 3 days from today</p>
              </div>

              {/* Additional Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Any special instructions or requirements..."
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </span>
                  ) : (
                    'Generate Invoice'
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Success State */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Invoice Generated Successfully!</h3>
              <p className="text-gray-600 mb-6">Your invoice has been created and is ready to download.</p>
              
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Download Invoice
                  </>
                )}
              </button>
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;

// Made with Bob
