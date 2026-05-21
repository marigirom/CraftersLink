import React, { useState } from 'react';
import { Close } from '@carbon/icons-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  description: string;
  material: string;
  price_kes: number;
  artisan_id: number;
  artisan_name: string;
}

interface CommissionModalProps {
  product: Product;
  onClose: () => void;
}

const CommissionModal: React.FC<CommissionModalProps> = ({ product, onClose }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    itemDescription: product.description,
    preferredMaterials: product.material,
    dimensions: '',
    finishPreference: '',
    budget: product.price_kes.toString(),
    deliveryDate: '',
    additionalNotes: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate minimum delivery date (today + 7 days)
  const getMinDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemDescription || formData.itemDescription.trim().length < 100) {
      newErrors.itemDescription = 'Description must be at least 100 characters';
    }

    if (!formData.preferredMaterials || formData.preferredMaterials.trim().length < 3) {
      newErrors.preferredMaterials = 'Please specify preferred materials';
    }

    const budgetNum = parseFloat(formData.budget);
    if (!formData.budget || isNaN(budgetNum) || budgetNum < product.price_kes) {
      newErrors.budget = `Budget must be at least KES ${product.price_kes.toLocaleString()}`;
    }

    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'Delivery date is required';
    } else {
      const selectedDate = new Date(formData.deliveryDate);
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 7);
      minDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < minDate) {
        newErrors.deliveryDate = 'Delivery date must be at least 7 days from today';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload = {
        artisan: product.artisan_id,
        reference_product: product.id,
        title: `Custom ${product.name}`,
        custom_brief: formData.itemDescription.trim(),
        budget_kes: parseFloat(formData.budget),
        requested_delivery_date: formData.deliveryDate,
        notes: [
          formData.preferredMaterials && `Materials: ${formData.preferredMaterials}`,
          formData.dimensions && `Dimensions: ${formData.dimensions}`,
          formData.finishPreference && `Finish: ${formData.finishPreference}`,
          formData.additionalNotes && `Notes: ${formData.additionalNotes}`
        ].filter(Boolean).join('\n\n'),
        attachment_urls: []
      };

      const response = await api.post('/commissions/', payload);
      
      if (response.status === 201) {
        // Close modal and navigate to dashboard with success message
        onClose();
        navigate('/designer/dashboard', {
          state: { 
            message: `Commission request sent successfully! ${product.artisan_name} will review your request and respond shortly.`
          }
        });
      }
    } catch (err: any) {
      console.error('Error creating commission:', err);
      const errorData = err.response?.data;
      
      if (errorData && typeof errorData === 'object') {
        const fieldErrors: Record<string, string> = {};
        Object.keys(errorData).forEach(key => {
          if (Array.isArray(errorData[key])) {
            fieldErrors[key] = errorData[key][0];
          } else {
            fieldErrors[key] = String(errorData[key]);
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: 'Failed to send commission request. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Request a Custom Commission</h2>
            <p className="text-sm text-gray-600 mt-1">from {product.artisan_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Close size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reference Product */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Based on: {product.name}</h3>
              <p className="text-sm text-gray-600">Starting from: <span className="font-semibold text-amber-600">KES {product.price_kes.toLocaleString()}</span></p>
            </div>

            {/* Item Description */}
            <div>
              <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Item Description *
                <span className="text-gray-500 font-normal ml-2">(minimum 100 characters)</span>
              </label>
              <textarea
                id="itemDescription"
                name="itemDescription"
                value={formData.itemDescription}
                onChange={handleChange}
                rows={6}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.itemDescription ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe exactly what you want. Include style, purpose, and any special requirements."
                required
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  {formData.itemDescription.length} / 100 characters
                </p>
                {errors.itemDescription && (
                  <p className="text-xs text-red-600">{errors.itemDescription}</p>
                )}
              </div>
            </div>

            {/* Preferred Materials */}
            <div>
              <label htmlFor="preferredMaterials" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Materials *
              </label>
              <input
                type="text"
                id="preferredMaterials"
                name="preferredMaterials"
                value={formData.preferredMaterials}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.preferredMaterials ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Mahogany wood, brass fittings"
                required
              />
              {errors.preferredMaterials && (
                <p className="mt-1 text-xs text-red-600">{errors.preferredMaterials}</p>
              )}
            </div>

            {/* Dimensions and Finish - Two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions (Optional)
                </label>
                <input
                  type="text"
                  id="dimensions"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., 60cm × 40cm × 30cm"
                />
              </div>

              <div>
                <label htmlFor="finishPreference" className="block text-sm font-medium text-gray-700 mb-2">
                  Finish / Colour (Optional)
                </label>
                <input
                  type="text"
                  id="finishPreference"
                  name="finishPreference"
                  value={formData.finishPreference}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., Natural wood, dark walnut stain"
                />
              </div>
            </div>

            {/* Budget and Delivery Date - Two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (KES) *
                </label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  min={product.price_kes}
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.budget ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Your budget for this piece"
                  required
                />
                {errors.budget && (
                  <p className="mt-1 text-xs text-red-600">{errors.budget}</p>
                )}
              </div>

              <div>
                <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Required Delivery Date *
                </label>
                <input
                  type="date"
                  id="deliveryDate"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  min={getMinDeliveryDate()}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.deliveryDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.deliveryDate ? (
                  <p className="mt-1 text-xs text-red-600">{errors.deliveryDate}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">Minimum 7 days from today</p>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Any other details, special requests, or clarifications..."
              />
            </div>

            {/* General Error Message */}
            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{errors.general}</p>
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
                    Sending Request...
                  </span>
                ) : (
                  'Send Commission Request'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommissionModal;

// Made with Bob
