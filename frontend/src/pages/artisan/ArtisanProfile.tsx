import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface ArtisanProfileData {
  id?: number;
  bio: string;
  county: string;
  town: string;
  craft_specialty: string;
  years_of_experience: number;
  workshop_address: string;
  business_name: string;
  business_registration: string;
  portfolio_images: string[];
}

interface RecentProduct {
  id: number;
  name: string;
  primary_image: string;
  price_kes: number | null;
  status: string;
  status_display: string;
  craft_category: string;
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

const CRAFT_SPECIALTIES = [
  { value: 'SOAPSTONE', label: 'Kisii Soapstone Carving' },
  { value: 'FURNITURE', label: 'Lamu Furniture' },
  { value: 'BEADWORK', label: 'Maasai Beadwork' },
  { value: 'BASKETS', label: 'Woven Baskets' },
  { value: 'POTTERY', label: 'Pottery & Ceramics' },
  { value: 'TEXTILES', label: 'Traditional Textiles' },
  { value: 'WOODCARVING', label: 'Wood Carving' },
  { value: 'METALWORK', label: 'Metal Crafts' },
  { value: 'JEWELRY', label: 'Handmade Jewelry' },
  { value: 'LEATHER', label: 'Leather Crafts' },
  { value: 'PAINTING', label: 'Traditional Painting' },
];

const formatPrice = (value: number | null | undefined): string => {
  if (value == null) return 'Price on request';
  return `KES ${Number(value).toLocaleString()}`;
};

const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'IN_STOCK':
      return 'bg-green-100 text-green-800';
    case 'COMMISSIONABLE':
      return 'bg-amber-100 text-amber-800';
    case 'SOLD':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

// ── Skeleton for product cards while loading ────────────────────────────────
const ProductSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="w-full h-36 bg-gray-200" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

// ── Mini product card ───────────────────────────────────────────────────────
const MiniProductCard: React.FC<{ product: RecentProduct }> = ({ product }) => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col min-w-0">
    {/* Thumbnail */}
    <div className="relative w-full h-36 bg-gray-100 overflow-hidden flex-shrink-0">
      {product.primary_image ? (
        <img
          src={product.primary_image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      )}
      <span className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full ${getStatusBadgeClass(product.status)}`}>
        {product.status_display}
      </span>
    </div>
    {/* Content */}
    <div className="p-3 flex flex-col flex-grow min-w-0">
      <p className="text-sm font-semibold text-gray-900 truncate mb-1">{product.name}</p>
      <p className="text-xs text-gray-500 truncate mb-2">{product.craft_category}</p>
      <p className="text-sm font-bold text-amber-600 mt-auto">{formatPrice(product.price_kes)}</p>
    </div>
  </div>
);

// ── Main component ──────────────────────────────────────────────────────────
const ArtisanProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ArtisanProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);

  const [formData, setFormData] = useState<ArtisanProfileData>({
    bio: '',
    county: '',
    town: '',
    craft_specialty: '',
    years_of_experience: 0,
    workshop_address: '',
    business_name: '',
    business_registration: '',
    portfolio_images: [],
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrors({});
      const response = await api.get('/artisans/profile/me/');

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setProfile(data);
        setFormData({
          bio: data.bio || '',
          county: data.county || '',
          town: data.town || '',
          craft_specialty: data.craft_specialty || '',
          years_of_experience: data.years_of_experience || 0,
          workshop_address: data.workshop_address || '',
          business_name: data.business_name || '',
          business_registration: data.business_registration || '',
          portfolio_images: data.portfolio_images || [],
        });
        setIsCreating(false);
        // Only fetch recent products when a profile exists
        fetchRecentProducts();
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

  const fetchRecentProducts = async () => {
    try {
      setRecentLoading(true);
      const res = await api.get('/artisans/profile/me/recent-products/');
      const data = res.data?.data ?? [];
      setRecentProducts(Array.isArray(data) ? data : []);
    } catch {
      // Non-critical — silently swallow
      setRecentProducts([]);
    } finally {
      setRecentLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
    if (!formData.bio || formData.bio.length < 50) {
      newErrors.bio = 'Bio must be at least 50 characters long';
    }
    if (!formData.county) newErrors.county = 'County is required';
    if (!formData.town) newErrors.town = 'Town is required';
    if (!formData.craft_specialty) newErrors.craft_specialty = 'Craft specialty is required';
    if (!formData.business_name) newErrors.business_name = 'Business name is required';
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
        ? await api.post('/artisans/profile/me/', formData)
        : await api.patch('/artisans/profile/me/', formData);

      if (response.data.success) {
        setSuccess(response.data.message || 'Profile saved successfully!');
        setProfile(response.data.data);
        setIsCreating(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Refresh after save
        setTimeout(() => fetchProfile(), 800);
      }
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      if (err.response?.data?.bio) {
        setErrors({ bio: err.response.data.bio[0] });
      } else if (err.response?.data?.message) {
        setErrors({ general: err.response.data.message });
      } else {
        setErrors({ general: 'Failed to save profile. Please try again.' });
      }
    } finally {
      setSaving(false);
    }
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
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isCreating ? 'Create Your Artisan Profile' : 'My Profile'}
          </h1>
          <p className="text-gray-600">
            {isCreating
              ? 'Complete your profile to start listing products and receiving commissions'
              : 'Keep your profile up to date to attract more designers'}
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
          {/* Business Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Business Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="business_name"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.business_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Karibu Crafts"
                />
                {errors.business_name && <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>}
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none ${
                    errors.bio ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Tell designers about your craft and experience (minimum 50 characters)"
                />
                <p className="mt-1 text-sm text-gray-500">{formData.bio.length} / 50 characters minimum</p>
                {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio}</p>}
              </div>

              <div>
                <label htmlFor="business_registration" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Registration Number (Optional)
                </label>
                <input
                  type="text"
                  id="business_registration"
                  name="business_registration"
                  value={formData.business_registration}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., BN/12345/2020"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-1">
                  County <span className="text-red-500">*</span>
                </label>
                <select
                  id="county"
                  name="county"
                  value={formData.county}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.county ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select County</option>
                  {COUNTY_CHOICES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                {errors.county && <p className="mt-1 text-sm text-red-600">{errors.county}</p>}
              </div>
              <div>
                <label htmlFor="town" className="block text-sm font-medium text-gray-700 mb-1">
                  Town <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="town"
                  name="town"
                  value={formData.town}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.town ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Westlands"
                />
                {errors.town && <p className="mt-1 text-sm text-red-600">{errors.town}</p>}
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="workshop_address" className="block text-sm font-medium text-gray-700 mb-1">
                Workshop Address (Optional)
              </label>
              <textarea
                id="workshop_address"
                name="workshop_address"
                value={formData.workshop_address}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                placeholder="Full workshop address"
              />
            </div>
          </div>

          {/* Craft Specialty */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Craft Specialty</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="craft_specialty" className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Craft <span className="text-red-500">*</span>
                </label>
                <select
                  id="craft_specialty"
                  name="craft_specialty"
                  value={formData.craft_specialty}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.craft_specialty ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Craft Specialty</option>
                  {CRAFT_SPECIALTIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                {errors.craft_specialty && <p className="mt-1 text-sm text-red-600">{errors.craft_specialty}</p>}
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

        {/* ── Recently Uploaded Products ─────────────────────────────────── */}
        {!isCreating && (
          <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-gray-900">Recently Uploaded Products</h2>
              <Link
                to="/artisan/catalogue"
                className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
              >
                View All →
              </Link>
            </div>

            {recentLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : recentProducts.length === 0 ? (
              <div className="text-center py-10">
                <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm mb-4">You haven't uploaded any products yet.</p>
                <button
                  onClick={() => navigate('/artisan/products/new')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                >
                  Add Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {recentProducts.map(product => (
                  <Link
                    key={product.id}
                    to={`/artisan/catalogue`}
                    className="block min-w-0"
                    title={product.name}
                  >
                    <MiniProductCard product={product} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtisanProfile;

// Made with Bob
