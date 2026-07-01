import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from '@carbon/icons-react';
import apiClient from '../../services/apiClient';
import ProductCard from '../../components/catalogue/ProductCard';

interface CatalogueItem {
  id: number;
  name: string;
  description: string;
  category: string;
  material?: string;
  materials_used?: string;
  price_kes: number;
  price_unit: string;
  availability: string;
  status?: string;
  status_display?: string;
  images: string[];
  primary_image?: string;
  artisan: {
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
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

const CRAFT_CATEGORIES = [
  'FURNITURE',
  'METALWORK',
  'TEXTILES',
  'CERAMICS',
  'WOODWORK',
  'UPHOLSTERY',
  'LIGHTING',
  'DECOR',
];

const CatalogueBrowse: React.FC = () => {
  const navigate = useNavigate();
  
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [savedItems, setSavedItems] = useState<number[]>([]);
  
  // Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCounty, setSelectedCounty] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);

  useEffect(() => {
    fetchCatalogueItems();
    fetchSavedItems();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [items, searchQuery, sortBy, selectedCategories, selectedCounty, minPrice, maxPrice]);

  const fetchCatalogueItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/artisans/products/');
      // Backend returns { count, results: [] } structure
      const products = response.data.results || response.data.data || response.data || [];
      setItems(Array.isArray(products) ? products : []);
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      setError(err.response?.data?.message || 'Failed to load catalogue items');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedItems = async () => {
    try {
      const response = await apiClient.get('/saved/');
      if (response.data.success) {
        const savedIds = response.data.data.map((item: any) => item.product.id);
        setSavedItems(savedIds);
      }
    } catch (err) {
      console.error('Failed to fetch saved items:', err);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...items];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.artisan.business_name?.toLowerCase().includes(query) ||
          `${item.artisan.user.first_name} ${item.artisan.user.last_name}`
            .toLowerCase()
            .includes(query)
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((item) =>
        selectedCategories.includes(item.category)
      );
    }

    // Apply county filter
    if (selectedCounty) {
      filtered = filtered.filter(
        (item) => item.artisan.county === selectedCounty
      );
    }

    // Apply price range filter
    filtered = filtered.filter(
      (item) =>
        item.price_kes >= minPrice &&
        item.price_kes <= maxPrice
    );

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'price_low':
        filtered.sort((a, b) => a.price_kes - b.price_kes);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price_kes - a.price_kes);
        break;
      case 'rating':
        filtered.sort(
          (a, b) =>
            (b.artisan.average_rating || 0) - (a.artisan.average_rating || 0)
        );
        break;
    }

    setFilteredItems(filtered);
  };

  const handleViewProfile = (artisanId: number) => {
    navigate(`/designer/artisan/${artisanId}`);
  };

  const handleRequestCommission = (artisanId: number) => {
    navigate(`/designer/commission/new?artisan=${artisanId}`);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedCounty('');
    setMinPrice(0);
    setMaxPrice(1000000);
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <p className="mt-4 text-gray-600">Loading catalogue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Artisans
          </h1>
          <p className="text-gray-600">
            Browse and discover unique handcrafted items from talented Kenyan artisans
          </p>
        </div>

        {/* Notifications */}
        {error && (
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
              <button onClick={() => setError(null)} className="ml-auto pl-3">
                <svg className="h-5 w-5 text-red-400 hover:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <p className="mt-1 text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Toolbar */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, category, or artisan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="w-full lg:w-64">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                showFilters
                  ? 'bg-amber-600 text-white border border-amber-600'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter size={20} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Craft Type
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {CRAFT_CATEGORIES.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {category.charAt(0) + category.slice(1).toLowerCase()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (KES)
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600">Min Price</label>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Max Price</label>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredItems.length} of {items.length} products
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Products Grid or Empty State */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery || selectedCategories.length > 0
                ? 'Try adjusting your search filters to find what you\'re looking for.'
                : 'No products are currently available in the catalogue.'}
            </p>
            {(searchQuery || selectedCategories.length > 0) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center justify-center px-6 py-3 bg-amber-600 border border-amber-600 rounded-lg text-base font-medium text-white hover:bg-amber-700 hover:border-amber-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* Products Grid - Responsive: 3 cols desktop, 2 cols tablet, 1 col mobile */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                role="INTERIOR_DESIGNER"
                onViewProfile={handleViewProfile}
                onRequestCommission={handleRequestCommission}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogueBrowse;

// Made with Bob
