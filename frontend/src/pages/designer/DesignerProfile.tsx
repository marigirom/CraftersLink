import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface DesignerProfileData {
  id?: number;
  full_name: string;
  phone_number: string;
  company_name: string;
  location: string;
  specialisation: string;
  bio: string;
  years_of_experience: number;
  profile_image: string;
  portfolio_images: string[];
}

const COUNTY_CHOICES = [
  { value: 'NAIROBI', label: 'Nairobi' },
  { value: 'MOMBASA', label: 'Mombasa' },
  { value: 'KISUMU', label: 'Kisumu' },
  { value: 'NAKURU', label: 'Nakuru' },
  { value: 'KIAMBU', label: 'Kiambu' },
  { value: 'KISII', label: 'Kisii' },
  { value: 'LAMU', label: 'Lamu' },
  { value: 'KAJIADO', label: 'Kajiado' },
  { value: 'MACHAKOS', label: 'Machakos' },
  { value: 'KILIFI', label: 'Kilifi' },
];

const SPECIALISATION_CHOICES = [
  { value: 'RESIDENTIAL', label: 'Residential Design' },
  { value: 'COMMERCIAL', label: 'Commercial Design' },
  { value: 'HOSPITALITY', label: 'Hospitality Design' },
  { value: 'RETAIL', label: 'Retail Design' },
  { value: 'HEALTHCARE', label: 'Healthcare Design' },
  { value: 'MIXED', label: 'Mixed/General' },
];

const DesignerProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DesignerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<DesignerProfileData>({
    full_name: '',
    phone_number: '',
    company_name: '',
    location: '',
    specialisation: 'MIXED',
    bio: '',
    years_of_experience: 0,
    profile_image: '',
    portfolio_images: [],
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrors({});
      const response = await api.get('/auth/designer/profile/');
      
      if (response.data.success && response.data.data) {
        // Profile exists - load it
        setProfile(response.data.data);
        setFormData({
          full_name: response.data.data.full_name || '',
          phone_number: response.data.data.phone_number || '',
          company_name: response.data.data.company_name || '',
          location: response.data.data.location || '',
          specialisation: response.data.data.specialisation || 'MIXED',
          bio: response.data.data.bio || '',
          years_of_experience: response.data.data.years_of_experience || 0,
          profile_image: response.data.data.profile_image || '',
          portfolio_images: response.data.data.portfolio_images || [],
        });
        setIsCreating(false);
      } else {
        // No profile exists - show creation form
        setProfile(null);
        setIsCreating(true);
      }
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      
      if (err.response?.status === 404 || err.response?.data?.data === null) {
        setProfile(null);
        setIsCreating(true);
      } else if (err.response?.status === 401) {
        setErrors({ general: 'Session expired. Please log in again.' });
      } else {
        setErrors({ general: 'Failed to load profile. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name || formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name is required (minimum 2 characters)';
    }
    if (!formData.location) {
      newErrors.location = 'Location/County is required';
    }
    if (!formData.specialisation) {
      newErrors.specialisation = 'Specialisation is required';
    }
    if (formData.bio && formData.bio.length > 300) {
      newErrors.bio = 'Bio must not exceed 300 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setErrors({});
      setSuccess(null);

      let response;
      if (isCreating) {
        // POST - Create new profile
        response = await api.post('/auth/designer/profile/', formData);
      } else {
        // PATCH - Update existing profile
        response = await api.patch('/auth/designer/profile/', formData);
      }

      if (response.data.success) {
        setSuccess(response.data.message || 'Profile saved successfully!');
        setProfile(response.data.data);
        setIsCreating(false);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setTimeout(() => {
          fetchProfile();
        }, 1000);
      }
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.full_name) {
          setErrors({ full_name: errorData.full_name[0] });
        } else if (errorData.message) {
          setErrors({ general: errorData.message });
        } else {
          setErrors({ general: 'Failed to save profile. Please try again.' });
        }
      } else {
        setErrors({ general: 'Failed to save profile. Please try again.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (formData.full_name) {
      return formData.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.username?.slice(0, 2).toUpperCase() || 'D';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header Section */}
        {!isCreating && profile && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {formData.profile_image ? (
                  <img
                    src={formData.profile_image}
                    alt={formData.full_name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-amber-100"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center border-4 border-amber-200">
                    <span className="text-3xl font-bold text-amber-700">{getInitials()}</span>
                  </div>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{formData.full_name}</h2>
                {formData.company_name && (
                  <p className="text-lg text-gray-600 mb-2">{formData.company_name}</p>
                )}
                {formData.location && (
                  <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                    {COUNTY_CHOICES.find(c => c.value === formData.location)?.label || formData.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isCreating ? 'Create Your Designer Profile' : 'Edit Profile'}
          </h1>
          <p className="text-gray-600">
            {isCreating 
              ? 'Complete your profile to start browsing artisan catalogues and commissioning work'
              : 'Keep your profile up to date'}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
              <button onClick={() => setSuccess(null)} className="ml-auto pl-3">
                <svg className="h-5 w-5 text-green-400 hover:text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{errors.general}</p>
              </div>
              <button onClick={() => setErrors({})} className="ml-auto pl-3">
                <svg className="h-5 w-5 text-red-400 hover:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.full_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Jane Doe"
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., +254712345678"
                />
              </div>

              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., Elegant Interiors Ltd"
                />
              </div>
            </div>
          </div>

          {/* Location & Specialisation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Professional Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  County/Location <span className="text-red-500">*</span>
                </label>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select County</option>
                  {COUNTY_CHOICES.map(county => (
                    <option key={county.value} value={county.value}>{county.label}</option>
                  ))}
                </select>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>

              <div>
                <label htmlFor="specialisation" className="block text-sm font-medium text-gray-700 mb-1">
                  Specialisation <span className="text-red-500">*</span>
                </label>
                <select
                  id="specialisation"
                  name="specialisation"
                  value={formData.specialisation}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.specialisation ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {SPECIALISATION_CHOICES.map(spec => (
                    <option key={spec.value} value={spec.value}>{spec.label}</option>
                  ))}
                </select>
                {errors.specialisation && (
                  <p className="mt-1 text-sm text-red-600">{errors.specialisation}</p>
                )}
              </div>

              <div>
                <label htmlFor="years_of_experience" className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="years_of_experience"
                  name="years_of_experience"
                  value={formData.years_of_experience}
                  onChange={handleNumberChange}
                  min="0"
                  max="50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio (Optional)
                <span className="text-gray-500 font-normal ml-2">Max 300 characters</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                maxLength={300}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.bio ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tell artisans about your design style and experience"
              />
              <p className="mt-1 text-sm text-gray-500">{formData.bio.length} / 300 characters</p>
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-amber-600 border border-amber-600 rounded-lg text-white font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : isCreating ? 'Create Profile' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DesignerProfile;

// Made with Bob