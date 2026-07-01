import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

interface RecentCommission {
  id: number;
  title: string;
  artisan_name: string;
  item_title: string | null;
  status: string;
  status_display: string;
  budget_kes: number;
  created_at: string;
}

interface RecentInvoice {
  id: number;
  invoice_number: string;
  commission_title: string;
  artisan_name: string;
  total_kes: number;
  status: string;
  status_display: string;
  created_at: string;
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

const formatKES = (value: number): string => `KES ${Number(value).toLocaleString()}`;

const getCommissionStatusClass = (status: string): string => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'ACCEPTED': return 'bg-blue-100 text-blue-800';
    case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
    case 'COMPLETED': return 'bg-green-100 text-green-800';
    case 'REJECTED':
    case 'CANCELLED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getInvoiceStatusClass = (status: string): string => {
  switch (status) {
    case 'PAID': return 'bg-green-100 text-green-800';
    case 'SENT': return 'bg-blue-100 text-blue-800';
    case 'OVERDUE': return 'bg-red-100 text-red-800';
    case 'DRAFT': return 'bg-gray-100 text-gray-700';
    case 'CANCELLED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const ActivitySkeleton: React.FC = () => (
  <div className="animate-pulse space-y-3">
    {[1, 2, 3].map(i => (
      <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
      </div>
    ))}
  </div>
);

const DesignerProfile: React.FC = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<DesignerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [recentCommissions, setRecentCommissions] = useState<RecentCommission[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'commissions' | 'invoices'>('commissions');

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
        const data = response.data.data;
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          phone_number: data.phone_number || '',
          company_name: data.company_name || '',
          location: data.location || '',
          specialisation: data.specialisation || 'MIXED',
          bio: data.bio || '',
          years_of_experience: data.years_of_experience || 0,
          profile_image: data.profile_image || '',
          portfolio_images: data.portfolio_images || [],
        });
        setIsCreating(false);
        fetchRecentActivity();
      } else {
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

  const fetchRecentActivity = async () => {
    try {
      setActivityLoading(true);
      const res = await api.get('/artisans/designer/recent-activity/');
      const data = res.data?.data ?? {};
      setRecentCommissions(Array.isArray(data.commissions) ? data.commissions : []);
      setRecentInvoices(Array.isArray(data.invoices) ? data.invoices : []);
    } catch {
      setRecentCommissions([]);
      setRecentInvoices([]);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name || formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name is required (minimum 2 characters)';
    }
    if (!formData.location) newErrors.location = 'Location/County is required';
    if (!formData.specialisation) newErrors.specialisation = 'Specialisation is required';
    if (formData.bio && formData.bio.length > 1000) {
      newErrors.bio = 'Bio must not exceed 1000 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      setErrors({});
      setSuccess(null);

      const response = isCreating
        ? await api.post('/auth/designer/profile/', formData)
        : await api.patch('/auth/designer/profile/', formData);

      if (response.data.success) {
        setSuccess(response.data.message || 'Profile saved successfully!');
        setProfile(response.data.data);
        setIsCreating(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => fetchProfile(), 800);
      }
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      if (err.response?.data?.full_name) {
        setErrors({ full_name: err.response.data.full_name[0] });
      } else if (err.response?.data?.message) {
        setErrors({ general: err.response.data.message });
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Profile preview card (edit mode only) ─────────────────────── */}
        {!isCreating && profile && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-6">
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
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-1 truncate">{formData.full_name}</h2>
                {formData.company_name && (
                  <p className="text-lg text-gray-600 mb-2 truncate">{formData.company_name}</p>
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

        {/* ── Page heading ───────────────────────────────────────────────── */}
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

        {/* ── Success banner ─────────────────────────────────────────────── */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <svg className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-green-800 flex-1">{success}</p>
            <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-500">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Error banner ───────────────────────────────────────────────── */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-red-800 flex-1">{errors.general}</p>
            <button onClick={() => setErrors({})} className="text-red-400 hover:text-red-500">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Profile form ───────────────────────────────────────────────── */}
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
                {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>}
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

          {/* Professional Details */}
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
                  {COUNTY_CHOICES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
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
                  {SPECIALISATION_CHOICES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                {errors.specialisation && <p className="mt-1 text-sm text-red-600">{errors.specialisation}</p>}
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
                <span className="text-gray-500 font-normal ml-2">Max 1000 characters</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                maxLength={1000}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none ${
                  errors.bio ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tell artisans about your design style and experience"
              />
              <p className="mt-1 text-sm text-gray-500">{formData.bio.length} / 1000 characters</p>
              {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio}</p>}
            </div>
          </div>

          {/* Submit */}
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

        {/* ── Recent Activity ────────────────────────────────────────────── */}
        {!isCreating && (
          <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-5">Recent Activity</h2>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-5">
              <button
                onClick={() => setActiveTab('commissions')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === 'commissions'
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Commissions / Enquiries
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`ml-4 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === 'invoices'
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Invoices
              </button>
            </div>

            {activityLoading ? (
              <ActivitySkeleton />
            ) : activeTab === 'commissions' ? (
              recentCommissions.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 text-sm mb-2">You haven't sent any enquiries yet.</p>
                  <Link
                    to="/designer/catalogue"
                    className="text-sm font-medium text-amber-600 hover:text-amber-700"
                  >
                    Browse Artisans →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCommissions.map(c => (
                    <div
                      key={c.id}
                      className="flex items-start justify-between gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{c.title}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {c.artisan_name}
                          {c.item_title ? ` · ${c.item_title}` : ''}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatKES(c.budget_kes)} · {new Date(c.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${getCommissionStatusClass(c.status)}`}>
                        {c.status_display}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 text-right">
                    <Link
                      to="/designer/commissions"
                      className="text-sm font-medium text-amber-600 hover:text-amber-700"
                    >
                      View All →
                    </Link>
                  </div>
                </div>
              )
            ) : (
              /* Invoices tab */
              recentInvoices.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 text-sm">No invoices yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Invoices are generated when a commission is completed.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentInvoices.map(inv => (
                    <div
                      key={inv.id}
                      className="flex items-start justify-between gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{inv.invoice_number}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {inv.commission_title} · {inv.artisan_name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatKES(inv.total_kes)} · {new Date(inv.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${getInvoiceStatusClass(inv.status)}`}>
                        {inv.status_display}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 text-right">
                    <Link
                      to="/designer/commissions"
                      className="text-sm font-medium text-amber-600 hover:text-amber-700"
                    >
                      View All →
                    </Link>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignerProfile;

// Made with Bob
