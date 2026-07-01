import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Grid,
  Column,
  Tile,
  Button,
  Loading,
  Tag,
  Breadcrumb,
  BreadcrumbItem,
  Modal,
  TextArea,
} from '@carbon/react';
import {
  Star,
  Location,
  CheckmarkFilled,
  ArrowLeft,
  FavoriteFilled,
  Favorite,
  Email,
} from '@carbon/icons-react';

interface Product {
  id: number;
  name: string;
  description: string;
  material: string;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  weight_kg?: number;
  dimensions: string;
  price_kes: number | null;
  status: string;
  status_display: string;
  primary_image: string;
  additional_images: string[];
  craft_category: string;
  tags: string[];
  views_count: number;
  artisan: {
    id: number;
    user_name: string;
  };
  artisan_name: string;
}

interface ArtisanMini {
  id: number;
  user: {
    full_name: string;
    profile_image?: string;
  };
  business_name: string;
  county_display: string;
  town: string;
  average_rating: number | null;
  total_commissions: number;
}

/** Format a KES price value. Returns "Price on request" when null/undefined. */
const formatPrice = (value: number | null | undefined): string => {
  if (value == null) return 'Price on request';
  return `KES ${Number(value).toLocaleString()}`;
};

/** Format a numeric rating. Returns "N/A" when null/undefined. */
const formatRating = (value: number | null | undefined): string => {
  if (value == null) return 'N/A';
  return Number(value).toFixed(1);
};

const ItemDetailPage: React.FC = () => {
  const { artisanId, itemId } = useParams<{ artisanId: string; itemId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [artisan, setArtisan] = useState<ArtisanMini | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [sendingEnquiry, setSendingEnquiry] = useState(false);

  useEffect(() => {
    if (itemId && artisanId) {
      fetchItemDetails();
    }
  }, [itemId, artisanId]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching item details - Artisan ID:', artisanId, 'Item ID:', itemId);

      // Use the new catalogue item detail endpoint
      const response = await api.get(`/artisans/catalogue/${artisanId}/${itemId}/`);
      console.log('Item detail response:', response.data);
      
      const data = response.data.data || response.data;
      
      // Extract product data
      setProduct(data);
      setSelectedImage(data.primary_image);
      
      // Extract artisan data from embedded profile
      if (data.artisan_profile) {
        setArtisan(data.artisan_profile);
      } else {
        // Fallback: fetch artisan separately if not embedded
        console.log('Artisan profile not embedded, fetching separately');
        const artisanRes = await api.get(`/artisans/${artisanId}/`);
        const artisanData = artisanRes.data.data || artisanRes.data;
        setArtisan(artisanData);
      }

      // Check if item is saved
      checkIfSaved();
    } catch (err: any) {
      console.error('Failed to fetch item details:', err);
      console.error('Error response:', err.response);
      
      if (err.response?.status === 404) {
        setError('Item not found or does not belong to this artisan');
      } else {
        setError(err.response?.data?.message || 'Failed to load item details');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const res = await api.get('/saved/');
      const savedItems = res.data.results || res.data || [];
      const saved = savedItems.some((item: any) => item.catalogue_item?.id === parseInt(itemId!));
      setIsSaved(saved);
    } catch (err) {
      console.error('Failed to check saved status:', err);
    }
  };

  const handleSaveItem = async () => {
    try {
      if (isSaved) {
        // Remove from saved
        await api.delete(`/saved/${itemId}/`);
        setIsSaved(false);
      } else {
        // Add to saved
        await api.post('/saved/', { catalogue_item_id: itemId });
        setIsSaved(true);
      }
    } catch (err: any) {
      console.error('Failed to save/unsave item:', err);
      alert(err.response?.data?.message || 'Failed to save item');
    }
  };

  const handleSendEnquiry = async () => {
    if (!enquiryMessage.trim()) {
      alert('Please enter your enquiry message');
      return;
    }

    try {
      setSendingEnquiry(true);
      await api.post('/enquiries/', {
        artisan_id: artisanId,
        product_id: itemId,
        message: enquiryMessage,
      });
      setShowEnquiryModal(false);
      setEnquiryMessage('');
      alert('Enquiry sent successfully!');
    } catch (err: any) {
      console.error('Failed to send enquiry:', err);
      alert(err.response?.data?.message || 'Failed to send enquiry');
    } finally {
      setSendingEnquiry(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      furniture: 'blue',
      metalwork: 'gray',
      textiles: 'purple',
      ceramics: 'orange',
      woodwork: 'brown',
    };
    return colors[category.toLowerCase()] || 'gray';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading description="Loading item details..." withOverlay={false} />
      </div>
    );
  }

  if (error || !product || !artisan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Tile className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error || 'Item not found'}</p>
          <div className="mt-4 flex gap-2">
            <Button kind="tertiary" size="sm" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button kind="tertiary" size="sm" onClick={fetchItemDetails}>
              Retry
            </Button>
          </div>
        </Tile>
      </div>
    );
  }

  const allImages = [product.primary_image, ...product.additional_images];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <Link to="/dashboard/designer">Dashboard</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link to="/dashboard/designer/catalogue">Catalogue</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link to={`/dashboard/designer/catalogue/${artisanId}`}>
            {artisan.business_name}
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>{product.name}</BreadcrumbItem>
      </Breadcrumb>

      {/* Back Button */}
      <Button
        kind="ghost"
        size="sm"
        renderIcon={ArrowLeft}
        onClick={() => navigate(`/dashboard/designer/catalogue/${artisanId}`)}
        className="mb-4"
      >
        Back to {artisan.business_name}'s Catalogue
      </Button>

      <Grid>
        {/* Product Images */}
        <Column lg={8} md={4} sm={4}>
          <Tile className="p-6">
            {/* Main Image */}
            <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-96 object-contain"
              />
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {allImages.map((image, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(image)}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                      selectedImage === image ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </Tile>
        </Column>

        {/* Product Details */}
        <Column lg={8} md={4} sm={4}>
          <Tile className="p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <Tag type={getCategoryColor(product.craft_category)} size="md">
                    {product.craft_category}
                  </Tag>
                  <Tag
                    type={product.status === 'IN_STOCK' ? 'green' : 'blue'}
                    size="md"
                  >
                    {product.status_display}
                  </Tag>
                </div>
              </div>
              <Button
                kind="ghost"
                size="lg"
                renderIcon={isSaved ? FavoriteFilled : Favorite}
                iconDescription={isSaved ? 'Unsave' : 'Save'}
                hasIconOnly
                onClick={handleSaveItem}
              />
            </div>

            <div className="mb-6">
              <p className="text-4xl font-bold text-blue-600 mb-2">
                {formatPrice(product.price_kes)}
              </p>
              <p className="text-gray-600">{product.views_count} views</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed overflow-y-auto max-h-48">{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Material</h4>
                <p className="text-gray-600">{product.material}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Dimensions</h4>
                <p className="text-gray-600">{product.dimensions}</p>
              </div>
              {product.weight_kg && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Weight</h4>
                  <p className="text-gray-600">{product.weight_kg} kg</p>
                </div>
              )}
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, idx) => (
                    <Tag key={idx} type="outline" size="sm">
                      {tag}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                kind="primary"
                size="lg"
                renderIcon={Email}
                onClick={() => setShowEnquiryModal(true)}
              >
                Send Enquiry
              </Button>
              <Button kind="secondary" size="lg">
                Start Commission
              </Button>
            </div>
          </Tile>

          {/* Artisan Mini Profile */}
          <Tile className="p-6">
            <h3 className="text-lg font-semibold mb-4">About the Artisan</h3>
            <Link
              to={`/dashboard/designer/catalogue/${artisanId}`}
              className="flex items-center gap-4 hover:bg-gray-50 p-3 rounded-lg transition-colors"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex-shrink-0">
                {artisan.user.profile_image ? (
                  <img
                    src={artisan.user.profile_image}
                    alt={artisan.business_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {artisan.business_name[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{artisan.business_name}</h4>
                <p className="text-sm text-gray-600 mb-1">
                  {artisan.town}, {artisan.county_display}
                </p>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-500" />
                    <span>{formatRating(artisan.average_rating)}</span>
                  </div>
                  <span className="text-gray-500">
                    {artisan.total_commissions} projects
                  </span>
                </div>
              </div>
            </Link>
          </Tile>
        </Column>
      </Grid>

      {/* Enquiry Modal */}
      <Modal
        open={showEnquiryModal}
        onRequestClose={() => setShowEnquiryModal(false)}
        modalHeading="Send Enquiry"
        primaryButtonText="Send"
        secondaryButtonText="Cancel"
        onRequestSubmit={handleSendEnquiry}
        primaryButtonDisabled={sendingEnquiry || !enquiryMessage.trim()}
      >
        <p className="mb-4">
          Send an enquiry to {artisan.business_name} about {product.name}
        </p>
        <TextArea
          labelText="Your message"
          placeholder="I'm interested in this item..."
          value={enquiryMessage}
          onChange={(e) => setEnquiryMessage(e.target.value)}
          rows={6}
        />
      </Modal>
    </div>
  );
};

export default ItemDetailPage;

// Made with Bob