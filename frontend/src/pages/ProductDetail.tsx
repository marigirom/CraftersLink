import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { Product } from '../types';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const { data: product, loading, error } = useApi<Product>(`/products/${id}/`);
  const [selectedImage, setSelectedImage] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Product not found</h3>
          <p className="mt-1 text-sm text-gray-500">{error || 'The product you are looking for does not exist.'}</p>
          <div className="mt-6">
            <Link
              to="/catalogue"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
            >
              Back to Catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleCommissionRequest = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'DESIGNER') {
      alert('Only designers can request commissions');
      return;
    }
    
    navigate(`/commission/new?artisan=${product.artisan.id}&product=${product.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link to="/catalogue" className="text-gray-500 hover:text-gray-700">Catalogue</Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Image Gallery */}
            <div>
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImage]?.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl text-gray-400">📦</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-amber-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Artisan Info */}
              <Link
                to={`/artisan/${product.artisan.id}`}
                className="inline-flex items-center space-x-2 mb-6 text-amber-600 hover:text-amber-700"
              >
                <span className="text-sm font-medium">By {product.artisan.business_name}</span>
                {product.artisan.verified && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </Link>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  KES {parseFloat(product.price).toLocaleString()}
                </span>
              </div>

              {/* Category & Stock */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="inline-block bg-amber-100 text-amber-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {product.category}
                </span>
                {product.stock_quantity > 0 ? (
                  <span className="text-sm text-green-600 font-medium">
                    In Stock ({product.stock_quantity} available)
                  </span>
                ) : (
                  <span className="text-sm text-red-600 font-medium">
                    Out of Stock
                  </span>
                )}
                {product.customizable && (
                  <span className="text-sm text-blue-600 font-medium">
                    ✨ Customizable
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Specifications */}
              <div className="mb-6 space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">Specifications</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Materials</span>
                    <p className="text-sm font-medium text-gray-900">{product.materials_used}</p>
                  </div>
                  
                  {product.dimensions && (
                    <div>
                      <span className="text-sm text-gray-500">Dimensions</span>
                      <p className="text-sm font-medium text-gray-900">{product.dimensions}</p>
                    </div>
                  )}
                  
                  {product.weight && (
                    <div>
                      <span className="text-sm text-gray-500">Weight</span>
                      <p className="text-sm font-medium text-gray-900">{product.weight}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCommissionRequest}
                  className="w-full py-3 px-6 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Request Custom Commission
                </button>
                
                <Link
                  to={`/artisan/${product.artisan.id}`}
                  className="block w-full py-3 px-6 border-2 border-amber-600 text-amber-600 font-semibold rounded-lg hover:bg-amber-50 transition-colors text-center"
                >
                  View Artisan Profile
                </Link>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Listed on {new Date(product.created_at).toLocaleDateString()}</span>
                  <span>Updated {new Date(product.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            More from {product.artisan.business_name}
          </h2>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">
              Explore more products from this talented artisan
            </p>
            <Link
              to={`/artisan/${product.artisan.id}`}
              className="inline-block mt-4 px-6 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

// Made with Bob
