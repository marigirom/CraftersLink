import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, TrashCan, View, User, Location } from '@carbon/icons-react';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description?: string;
    material?: string;
    materials_used?: string;
    price_kes: number;
    status?: string;
    status_display?: string;
    availability?: string;
    primary_image?: string;
    images?: string[];
    dimensions?: string;
    artisan?: {
      id: number;
      user: {
        first_name: string;
        last_name: string;
      };
      business_name?: string;
      county?: string;
      county_display?: string;
      average_rating?: number;
    };
  };
  role: 'ARTISAN' | 'INTERIOR_DESIGNER';
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onViewProfile?: (artisanId: number) => void;
  onRequestCommission?: (artisanId: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  role,
  onEdit,
  onDelete,
  onViewProfile,
  onRequestCommission,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (role === 'INTERIOR_DESIGNER') {
      navigate(`/designer/products/${product.id}`);
    }
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'IN_STOCK':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'COMMISSIONABLE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'SOLD':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'BUSY':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CUSTOM_ORDER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getArtisanInitials = () => {
    if (!product.artisan) return 'A';
    const firstName = product.artisan.user.first_name || '';
    const lastName = product.artisan.user.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'A';
  };

  const getArtisanName = () => {
    if (!product.artisan) return 'Unknown Artisan';
    return (
      product.artisan.business_name ||
      `${product.artisan.user.first_name} ${product.artisan.user.last_name}`
    );
  };

  const imageUrl = product.primary_image || (product.images && product.images[0]) || '';
  const material = product.material || product.materials_used || '';
  const statusDisplay = product.status_display || product.availability || product.status || '';

  return (
    <div
      onClick={role === 'INTERIOR_DESIGNER' ? handleCardClick : undefined}
      className={`bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden flex flex-col h-full ${
        role === 'INTERIOR_DESIGNER'
          ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200'
          : 'hover:shadow-lg transition-shadow duration-300'
      }`}
    >
      {/* Product Image - Fixed aspect ratio */}
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-sm">No Image</span>
          </div>
        )}
        
        {/* Availability Badge - Top Right */}
        {statusDisplay && (
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClasses(
                product.status || product.availability || ''
              )}`}
            >
              {statusDisplay}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Artisan Info - Designer View Only */}
        {role === 'INTERIOR_DESIGNER' && product.artisan && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-semibold">
              {getArtisanInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getArtisanName()}
              </p>
              {product.artisan.county && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Location size={12} />
                  <span>{product.artisan.county_display || product.artisan.county}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Material Label */}
        {material && (
          <div className="mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
              {material}
            </span>
          </div>
        )}

        {/* Description - Optional */}
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Dimensions - Optional */}
        {product.dimensions && (
          <p className="text-xs text-gray-500 mb-3">
            <span className="font-medium">Dimensions:</span> {product.dimensions}
          </p>
        )}

        {/* Price - Prominent */}
        <div className="mt-auto mb-4">
          <p className="text-2xl font-bold text-amber-600">
            {product.price_kes != null
              ? `KES ${Number(product.price_kes).toLocaleString()}`
              : 'Price on request'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          {role === 'ARTISAN' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit && onEdit(product.id);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 cursor-pointer"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete && onDelete(product.id);
                }}
                className="inline-flex items-center justify-center px-3 py-2.5 bg-white border border-red-300 rounded-lg text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors duration-200 cursor-pointer"
                title="Delete"
              >
                <TrashCan size={16} />
              </button>
            </>
          )}

          {role === 'INTERIOR_DESIGNER' && product.artisan && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile && onViewProfile(product.artisan!.id);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 cursor-pointer"
              >
                <User size={16} />
                View Profile
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestCommission && onRequestCommission(product.artisan!.id);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 border border-amber-600 rounded-lg text-sm font-medium text-white hover:bg-amber-700 hover:border-amber-700 transition-colors duration-200 cursor-pointer"
              >
                Request Commission
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

// Made with Bob