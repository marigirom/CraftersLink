import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Add } from '@carbon/icons-react';
import ProductCard from '../../components/catalogue/ProductCard';

interface Product {
  id: number;
  name: string;
  description: string;
  material: string;
  price_kes: number;
  status: string;
  status_display: string;
  primary_image: string;
  dimensions?: string;
  created_at: string;
}

const ArtisanCatalogue: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [user?.id]);

  const fetchProducts = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get the artisan profile ID from the profile endpoint
      const profileResponse = await api.get('/artisans/profile/me/');
      const artisanProfileId = profileResponse.data.data?.id || profileResponse.data.id;
      
      if (!artisanProfileId) {
        // Don't block - just show soft warning
        setError('profile_not_found');
        setProducts([]);
        setLoading(false);
        return;
      }
      
      // Fetch only the current artisan's products
      const response = await api.get('/artisans/products/', {
        params: {
          artisan: artisanProfileId // Filter by artisan profile ID
        }
      });
      
      const data = response.data.results || response.data.data || response.data || [];
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      if (err.response?.status === 404 || err.response?.data?.data === null) {
        setError('profile_not_found');
        setProducts([]);
      } else {
        setError(err.response?.data?.message || 'Failed to load your products');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/artisans/products/${productId}/`);
      setProducts(products.filter((p) => p.id !== productId));
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      setError(err.response?.data?.message || 'Failed to delete product');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleEdit = (productId: number) => {
    navigate(`/artisan/products/${productId}/edit`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <p className="mt-4 text-gray-600">Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Products
            </h1>
            <p className="text-gray-600">
              Manage your product catalogue • Total: {products.length}
            </p>
          </div>
          <button
            onClick={() => navigate('/artisan/products/new')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 border border-amber-600 rounded-lg text-base font-medium text-white hover:bg-amber-700 hover:border-amber-700 transition-colors duration-200 cursor-pointer shadow-sm"
          >
            <Add size={20} />
            Add New Product
          </button>
        </div>

        {/* Profile Not Found Warning - Soft Banner */}
        {error === 'profile_not_found' && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-amber-800">Profile Incomplete</h3>
                <p className="mt-1 text-sm text-amber-700">
                  Your profile is incomplete. Complete your profile to help designers find you.
                </p>
                <button
                  onClick={() => navigate('/artisan/profile')}
                  className="mt-2 text-sm font-medium text-amber-800 hover:text-amber-900 underline"
                >
                  Complete Profile →
                </button>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto pl-3"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5 text-amber-400 hover:text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && error !== 'profile_not_found' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto pl-3"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5 text-red-400 hover:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="mx-auto w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Add your first product to get started. Showcase your craftsmanship to interior designers across Kenya.
            </p>
            <button
              onClick={() => navigate('/artisan/products/new')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 border border-amber-600 rounded-lg text-base font-medium text-white hover:bg-amber-700 hover:border-amber-700 transition-colors duration-200 cursor-pointer shadow-sm"
            >
              <Add size={20} />
              Add Your First Product
            </button>
          </div>
        ) : (
          /* Products Grid - Responsive: 3 cols desktop, 2 cols tablet, 1 col mobile */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                role="ARTISAN"
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtisanCatalogue;

// Made with Bob