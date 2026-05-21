import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Tag } from '@carbon/react';
import { View, Save, Edit, TrashCan, User } from '@carbon/icons-react';

interface CatalogueCardProps {
  item: {
    id: number;
    name: string;
    description: string;
    category: string;
    price_kes: number;
    price_unit: string;
    availability: string;
    images: string[];
    artisan?: {
      id: number;
      user: {
        first_name: string;
        last_name: string;
      };
      business_name?: string;
      county?: string;
      average_rating?: number;
    };
  };
  userRole: 'ARTISAN' | 'DESIGNER';
  onSave?: (itemId: number) => void;
  onEdit?: (itemId: number) => void;
  onDelete?: (itemId: number) => void;
  isSaved?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  FURNITURE: 'blue',
  METALWORK: 'gray',
  TEXTILES: 'purple',
  CERAMICS: 'teal',
  WOODWORK: 'green',
  UPHOLSTERY: 'magenta',
  LIGHTING: 'cyan',
  DECOR: 'warm-gray',
  OTHER: 'cool-gray',
};

const AVAILABILITY_COLORS: Record<string, string> = {
  AVAILABLE: 'green',
  BUSY: 'red',
  CUSTOM_ORDER: 'blue',
};

const CatalogueCard: React.FC<CatalogueCardProps> = ({
  item,
  userRole,
  onSave,
  onEdit,
  onDelete,
  isSaved = false,
}) => {
  const navigate = useNavigate();

  const formatPrice = (price: number, unit: string) => {
    const unitLabels: Record<string, string> = {
      ITEM: 'per item',
      SQM: 'per sqm',
      METER: 'per meter',
      SET: 'per set',
      PAIR: 'per pair',
    };
    return `KES ${price.toLocaleString()} ${unitLabels[unit] || ''}`;
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0) + category.slice(1).toLowerCase().replace('_', ' ');
  };

  const getAvailabilityLabel = (availability: string) => {
    const labels: Record<string, string> = {
      AVAILABLE: 'Available',
      BUSY: 'Busy',
      CUSTOM_ORDER: 'Custom Order',
    };
    return labels[availability] || availability;
  };

  const handleView = () => {
    if (userRole === 'DESIGNER' && item.artisan) {
      navigate(`/dashboard/designer/catalogue/${item.artisan.id}/${item.id}`);
    } else if (userRole === 'ARTISAN') {
      navigate(`/dashboard/artisan/catalogue/${item.id}`);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) {
      onSave(item.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(item.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm('Are you sure you want to delete this item?')) {
      onDelete(item.id);
    }
  };

  const handleContactArtisan = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.artisan) {
      navigate(`/dashboard/designer/catalogue/${item.artisan.id}`);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={handleView}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0]}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        
        {/* Availability Badge */}
        <div className="absolute top-2 right-2">
          <Tag
            type={AVAILABILITY_COLORS[item.availability] as any}
            size="sm"
          >
            {getAvailabilityLabel(item.availability)}
          </Tag>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category Tag */}
        <div className="mb-2">
          <Tag
            type={CATEGORY_COLORS[item.category] as any}
            size="sm"
          >
            {getCategoryLabel(item.category)}
          </Tag>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {item.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Price */}
        <div className="mb-3">
          <p className="text-xl font-bold text-blue-600">
            {formatPrice(item.price_kes, item.price_unit)}
          </p>
        </div>

        {/* Artisan Info (for Designer view) */}
        {userRole === 'DESIGNER' && item.artisan && (
          <div className="mb-3 pb-3 border-b border-gray-200">
            <div className="flex items-center text-sm text-gray-600">
              <User size={16} className="mr-1" />
              <span className="font-medium">
                {item.artisan.business_name ||
                  `${item.artisan.user.first_name} ${item.artisan.user.last_name}`}
              </span>
            </div>
            {item.artisan.county && (
              <p className="text-xs text-gray-500 mt-1">{item.artisan.county}</p>
            )}
            {item.artisan.average_rating && (
              <p className="text-xs text-gray-500 mt-1">
                ⭐ {item.artisan.average_rating.toFixed(1)} rating
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {userRole === 'DESIGNER' && (
            <>
              <Button
                kind="primary"
                size="sm"
                renderIcon={View}
                onClick={handleView}
                className="flex-1"
              >
                View Details
              </Button>
              {onSave && (
                <Button
                  kind={isSaved ? 'secondary' : 'tertiary'}
                  size="sm"
                  renderIcon={Save}
                  onClick={handleSave}
                  hasIconOnly
                  iconDescription={isSaved ? 'Saved' : 'Save Item'}
                />
              )}
              {item.artisan && (
                <Button
                  kind="ghost"
                  size="sm"
                  renderIcon={User}
                  onClick={handleContactArtisan}
                  hasIconOnly
                  iconDescription="View Artisan"
                />
              )}
            </>
          )}

          {userRole === 'ARTISAN' && (
            <>
              <Button
                kind="primary"
                size="sm"
                renderIcon={View}
                onClick={handleView}
                className="flex-1"
              >
                View
              </Button>
              {onEdit && (
                <Button
                  kind="secondary"
                  size="sm"
                  renderIcon={Edit}
                  onClick={handleEdit}
                  hasIconOnly
                  iconDescription="Edit"
                />
              )}
              {onDelete && (
                <Button
                  kind="danger--ghost"
                  size="sm"
                  renderIcon={TrashCan}
                  onClick={handleDelete}
                  hasIconOnly
                  iconDescription="Delete"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogueCard;

// Made with Bob
