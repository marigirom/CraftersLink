import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CommissionFlow: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    artisan_id: searchParams.get('artisan') || '',
    title: '',
    description: '',
    budget: '',
    deadline: '',
    requirements: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const artisanParam = searchParams.get('artisan');
    if (artisanParam) {
      setFormData(prev => ({ ...prev, artisan_id: artisanParam }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.artisan_id) {
      newErrors.artisan_id = 'Artisan selection is required';
    }
    if (!formData.title || formData.title.trim().length < 5) {
      newErrors.title = 'Title is required (minimum 5 characters)';
    }
    if (!formData.description || formData.description.trim().length < 100) {
      newErrors.description = 'Description is required (minimum 100 characters)';
    }
    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Valid budget is required';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    }
    // Validate deadline is in future
    const deadlineDate = new Date(formData.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deadlineDate <= today) {
      newErrors.deadline = 'Deadline must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      const payload = {
        artisan: parseInt(formData.artisan_id), // ArtisanProfile ID
        title: formData.title.trim(),
        custom_brief: formData.description.trim() + (formData.requirements ? '\n\nRequirements:\n' + formData.requirements : ''),
        budget_kes: parseFloat(formData.budget),
        requested_delivery_date: formData.deadline,
        notes: formData.requirements || '',
        attachment_urls: []
      };

      console.log('Creating commission:', payload);
      
      const response = await api.post('/commissions/', payload);
      
      if (response.data.success) {
        // Navigate to designer dashboard after successful creation
        navigate('/designer/dashboard', {
          state: { message: 'Commission request sent successfully!' }
        });
      }
    } catch (error: any) {
      console.error('Error creating commission:', error);
      console.error('Error response:', error.response?.data);
      
      const errorData = error.response?.data;
      if (errorData) {
        if (typeof errorData === 'object' && !errorData.message) {
          // Field-specific errors
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
          setErrors({ general: errorData.message || 'Failed to create commission. Please try again.' });
        }
      } else {
        setErrors({ general: 'Failed to create commission. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {id ? 'Edit Commission' : 'Create New Commission'}
          </h1>
          <p className="text-gray-600">
            Provide details about your custom project
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Custom Wooden Dining Table"
                required
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Project Description *
                <span className="text-gray-500 font-normal ml-2">(minimum 100 characters)</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe your project in detail... Include materials, style preferences, and any specific requirements."
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.description.length} / 100 characters
              </p>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Budget and Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.budget ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="50000"
                  required
                />
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                )}
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline *
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.deadline ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.deadline && (
                  <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.requirements ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Any additional notes, special requests, or clarifications..."
              />
              {errors.requirements && (
                <p className="mt-1 text-sm text-red-600">{errors.requirements}</p>
              )}
            </div>

            {/* Reference Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Images (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-amber-500 transition-colors">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg font-semibold text-white transition-colors ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {isLoading ? 'Creating...' : id ? 'Update Commission' : 'Create Commission'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommissionFlow;

// Made with Bob
