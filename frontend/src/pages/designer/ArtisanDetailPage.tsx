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
} from '@carbon/react';
import { Star, Location, CheckmarkFilled, ArrowLeft } from '@carbon/icons-react';

interface Artisan {
  id: number;
  user: {
    full_name: string;
    profile_image?: string;
  };
  business_name: string;
  bio: string;
  county_display: string;
  town: string;
  craft_specialty_display: string;
  years_of_experience: number;
  average_rating: number;
  total_commissions: number;
  portfolio_images: string[];
  business_registration?: string;
}

interface Product {
  id: number;
  name: string;
  craft_category: string;
  price_kes: number;
  primary_image: string;
  status_display: string;
  status: string;
}

const ArtisanDetailPage: React.FC = () => {
  const { artisanId } = useParams<{ artisanId: string }>();
  const navigate = useNavigate();
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (artisanId) {
      fetchArtisanDetails();
    }
  }, [artisanId]);

  const fetchArtisanDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching artisan details for ID:', artisanId);

      // Use the new catalogue endpoint that returns artisan + products in one call
      const response = await api.get(`/artisans/catalogue/${artisanId}/`);
      console.log('Catalogue response:', response.data);
      
      const data = response.data.data || response.data;
      
      // Extract artisan data
      setArtisan(data);
      
      // Extract products from the response
      const productsData = data.products || [];
      console.log('Products found:', productsData.length);
      setProducts(productsData);
      
    } catch (err: any) {
      console.error('Failed to fetch artisan details:', err);
      console.error('Error response:', err.response);
      
      if (err.response?.status === 404) {
        setError('Artisan not found');
      } else {
        setError(err.response?.data?.message || 'Failed to load artisan details');
      }
    } finally {
      setLoading(false);
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
        <Loading description="Loading artisan details..." withOverlay={false} />
      </div>
    );
  }

  if (error || !artisan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Tile className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error || 'Artisan not found'}</p>
          <div className="mt-4 flex gap-2">
            <Button kind="tertiary" size="sm" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button kind="tertiary" size="sm" onClick={fetchArtisanDetails}>
              Retry
            </Button>
          </div>
        </Tile>
      </div>
    );
  }

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
        <BreadcrumbItem isCurrentPage>{artisan.business_name}</BreadcrumbItem>
      </Breadcrumb>

      {/* Back Button */}
      <Button
        kind="ghost"
        size="sm"
        renderIcon={ArrowLeft}
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        Back to Catalogue
      </Button>

      <Grid>
        {/* Artisan Profile Header */}
        <Column lg={16} md={8} sm={4}>
          <Tile className="p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="w-48 h-48 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
                  {artisan.user.profile_image || (artisan.portfolio_images && artisan.portfolio_images.length > 0) ? (
                    <img
                      src={artisan.user.profile_image || artisan.portfolio_images[0]}
                      alt={artisan.business_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl font-bold text-blue-600">
                        {artisan.business_name[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{artisan.business_name}</h1>
                    <p className="text-lg text-gray-600 mb-2">{artisan.user.full_name}</p>
                  </div>
                  {artisan.business_registration && (
                    <Tag type="green" size="md" renderIcon={CheckmarkFilled}>
                      Verified
                    </Tag>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star size={20} className="text-yellow-500" />
                    <span className="text-lg font-semibold">
                      {artisan.average_rating.toFixed(1)}
                    </span>
                    <span className="text-gray-600">rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Location size={20} className="text-gray-600" />
                    <span className="text-gray-600">
                      {artisan.town}, {artisan.county_display}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Tag type="blue" size="md">
                    {artisan.craft_specialty_display}
                  </Tag>
                  <Tag type="outline" size="md">
                    {artisan.years_of_experience} years experience
                  </Tag>
                  <Tag type="outline" size="md">
                    {artisan.total_commissions} completed projects
                  </Tag>
                </div>

                <p className="text-gray-700 leading-relaxed">{artisan.bio}</p>

                <div className="mt-6 flex gap-3">
                  <Button kind="primary" size="lg">
                    Send Enquiry
                  </Button>
                  <Button kind="secondary" size="lg">
                    Start Commission
                  </Button>
                </div>
              </div>
            </div>
          </Tile>
        </Column>

        {/* Portfolio Images */}
        {artisan.portfolio_images && artisan.portfolio_images.length > 0 && (
          <Column lg={16} md={8} sm={4}>
            <Tile className="p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {artisan.portfolio_images.map((image, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`Portfolio ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </Tile>
          </Column>
        )}

        {/* Catalogue Items */}
        <Column lg={16} md={8} sm={4}>
          <Tile className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Catalogue Items</h2>
              <span className="text-gray-600">{products.length} items</span>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No catalogue items available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/dashboard/designer/catalogue/${artisanId}/${product.id}`}
                    className="block"
                  >
                    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <img
                        src={product.primary_image}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 truncate">{product.name}</h3>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-lg font-bold text-blue-600">
                            KES {product.price_kes.toLocaleString()}
                          </p>
                          <Tag type={getCategoryColor(product.craft_category)} size="sm">
                            {product.craft_category}
                          </Tag>
                        </div>
                        <Tag
                          type={product.status === 'IN_STOCK' ? 'green' : 'blue'}
                          size="sm"
                        >
                          {product.status_display}
                        </Tag>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Tile>
        </Column>
      </Grid>
    </div>
  );
};

export default ArtisanDetailPage;

// Made with Bob