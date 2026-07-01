import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Location, User, CheckmarkFilled } from '@carbon/icons-react';
import api from '../../services/api';
import InvoiceModal from '../../components/modals/InvoiceModal';
import CommissionModal from '../../components/modals/CommissionModal';

interface Product {
  id: number;
  name: string;
  description: string;
  material: string;
  dimensions: string;
  price_kes: number | null;
  availability_status: string;
  status_display: string;
  primary_image: string;
  additional_images: string[];
  artisan_id: number;
  artisan_name: string;
  artisan_location: string;
  artisan_specialisation: string;
  artisan_bio: string;
  craft_category: string;
  created_at: string;
}

/** Format a KES price value. Returns "Price on request" when the value is null/undefined. */
const formatPrice = (value: number | null | undefined): string => {
  if (value == null) return 'Price on request';
  return `KES ${Number(value).toLocaleString()}`;
};

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!productId) return;
    
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await api.get(`/artisans/products/${productId}/`);
        // The backend wraps its response as { success, data: {...} }
        const productData = response.data?.data ?? response.data;
        setProduct(productData);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        if (err.response?.status === 404) {
          setError('Product not found.');
        } else {
          setError(err.response?.data?.message || 'Failed to load product details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const getArtisanInitials = () => {
    if (!product?.artisan_name) return 'A';
    const names = product.artisan_name.split(' ');
    return names.map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const handleViewArtisanProfile = () => {
    if (product) {
      navigate(`/designer/artisan/${product.artisan_id}`);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  // ── Error / not-found state ───────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <ArrowLeft size={20} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render — product is guaranteed non-null beyond this point ─────────────
  const isInStock = product.availability_status === 'IN_STOCK';
  const isCommissionable = product.availability_status === 'COMMISSIONABLE';
  const formattedPrice = formatPrice(product.price_kes);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Discover Artisans</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Image */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="relative w-full h-96 bg-gray-100">
                {product.primary_image ? (
                  <img
                    src={product.primary_image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="text-6xl mb-2">🎨</div>
                      <p className="text-sm">No Image Available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              {/* Availability Badge */}
              <div className="mb-6">
                {isInStock && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                    <CheckmarkFilled size={16} />
                    In Stock — Available for Purchase
                  </span>
                )}
                {isCommissionable && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
                    ✦ Commissionable — Request a Custom Piece
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">About this piece</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line overflow-y-auto max-h-64">{product.description}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Materials</p>
                  <p className="text-gray-900 font-medium">{product.material || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Dimensions</p>
                  <p className="text-gray-900 font-medium">{product.dimensions || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Price</p>
                  <p className="text-2xl font-bold text-amber-600">{formattedPrice}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <p className="text-gray-900 font-medium">{product.craft_category || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Listed by</p>
                  <p className="text-gray-900 font-medium">{product.artisan_name || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="text-gray-900 font-medium">{product.artisan_location || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Artisan & Action Cards */}
          <div className="space-y-6">
            {/* Artisan Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold flex-shrink-0">
                  {getArtisanInitials()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{product.artisan_name}</h3>
                  {product.artisan_location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <Location size={16} />
                      <span>{product.artisan_location}</span>
                    </div>
                  )}
                  {product.artisan_specialisation && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      {product.artisan_specialisation}
                    </span>
                  )}
                </div>
              </div>
              
              {product.artisan_bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.artisan_bio}</p>
              )}
              
              <button
                onClick={handleViewArtisanProfile}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                <User size={16} />
                View Full Profile
              </button>
            </div>

            {/* Action Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              {isInStock && (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Purchase This Item</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This item is ready. Generate an invoice to proceed with your order.
                  </p>
                  <div className="mb-4 p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="text-3xl font-bold text-amber-600">{formattedPrice}</p>
                  </div>
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="w-full px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
                  >
                    Generate Invoice
                  </button>
                </>
              )}
              
              {isCommissionable && (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Commission a Custom Piece</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This item can be custom-made to your specifications.
                  </p>
                  <div className="mb-4 p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Starting from</p>
                    <p className="text-3xl font-bold text-amber-600">{formattedPrice}</p>
                  </div>
                  <button
                    onClick={() => setShowCommissionModal(true)}
                    className="w-full px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
                  >
                    Request Commission
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showInvoiceModal && product && (
        <InvoiceModal
          product={{
            id: product.id,
            name: product.name,
            price_kes: product.price_kes ?? 0,
            artisan_id: product.artisan_id,
            artisan_name: product.artisan_name,
          }}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
      
      {successMsg && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg text-sm font-medium max-w-md text-center">
          {successMsg}
          <button onClick={() => setSuccessMsg('')} className="ml-4 text-green-200 hover:text-white">✕</button>
        </div>
      )}
      {showCommissionModal && product && (
        <CommissionModal
          product={{
            id: product.id,
            name: product.name,
            description: product.description,
            material: product.material,
            price_kes: product.price_kes ?? 0,
            artisan_id: product.artisan_id,
            artisan_name: product.artisan_name,
          }}
          onClose={() => setShowCommissionModal(false)}
          onSuccess={(msg) => {
            setShowCommissionModal(false);
            setSuccessMsg(msg);
            setTimeout(() => setSuccessMsg(''), 6000);
          }}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;

// Made with Bob
