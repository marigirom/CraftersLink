import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { ArtisanProfile, PaginatedResponse } from '../../types';
import { mockArtisanProfiles } from '../../utils/mockData';

interface ArtisanSearchProps {
  onSelectArtisan?: (artisan: ArtisanProfile) => void;
  showAsGrid?: boolean;
}

const ArtisanSearch: React.FC<ArtisanSearchProps> = ({ 
  onSelectArtisan, 
  showAsGrid = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [filteredArtisans, setFilteredArtisans] = useState<ArtisanProfile[]>([]);
  
  // Fetch artisans from API
  const { data, loading, error } = useApi<PaginatedResponse<ArtisanProfile>>(
    '/artisans/',
    { immediate: true }
  );

  const specializations = ['Woodworking', 'Metalwork', 'Textiles', 'Ceramics', 'Glasswork', 'Leatherwork'];
  const locations = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];

  // Use API data if available, otherwise use mock data
  const artisansSource = data?.results && data.results.length > 0 
    ? data.results 
    : mockArtisanProfiles;

  useEffect(() => {
    // Filter artisans based on search criteria
    const filtered = artisansSource.filter((artisan) => {
      const matchesSearch = !searchTerm || 
        artisan?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artisan?.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artisan?.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecialization = !selectedSpecialization || 
        artisan?.specialization === selectedSpecialization;
      
      const matchesLocation = !selectedLocation || 
        artisan?.location === selectedLocation;
      
      return matchesSearch && matchesSpecialization && matchesLocation;
    });

    setFilteredArtisans(filtered);
  }, [searchTerm, selectedSpecialization, selectedLocation, artisansSource]);

  const handleArtisanClick = (artisan: ArtisanProfile) => {
    if (onSelectArtisan) {
      onSelectArtisan(artisan);
    }
  };

  return (
    <div className="w-full">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Artisans
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, specialty..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <svg 
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Specialization Filter */}
          <div>
            <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
              Specialization
            </label>
            <select
              id="specialization"
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <select
              id="location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          {loading ? (
            <span>Loading artisans...</span>
          ) : (
            <span>
              Showing {filteredArtisans?.length || 0} artisan{filteredArtisans?.length !== 1 ? 's' : ''}
              {!data?.results?.length && ' (using sample data)'}
            </span>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <p className="mt-4 text-gray-600">Loading artisans...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            Unable to load artisans from server. Showing sample data instead.
          </p>
        </div>
      )}

      {/* Artisan Grid/List */}
      {!loading && (
        <>
          {filteredArtisans && filteredArtisans.length > 0 ? (
            <div className={showAsGrid ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredArtisans.map((artisan) => (
                <div
                  key={artisan?.id}
                  onClick={() => handleArtisanClick(artisan)}
                  className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group ${onSelectArtisan ? 'cursor-pointer' : ''}`}
                >
                  {/* Profile Image */}
                  <div className="relative h-48 bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden">
                    {artisan?.user?.profile_image ? (
                      <img
                        src={artisan.user.profile_image}
                        alt={artisan?.business_name || 'Artisan'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl font-bold text-amber-600">
                          {artisan?.business_name?.[0] || 'A'}
                        </span>
                      </div>
                    )}
                    {artisan?.verified && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                      {artisan?.business_name || 'Unknown Artisan'}
                    </h3>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {artisan?.location || 'Location not specified'}
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {artisan?.bio || 'No description available'}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                        {artisan?.specialization || 'General'}
                      </span>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                        <span className="ml-1 text-sm font-semibold text-gray-700">
                          {artisan?.rating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{artisan?.years_of_experience || 0} years exp.</span>
                      <span>{artisan?.total_commissions || 0} projects</span>
                    </div>

                    {!onSelectArtisan && (
                      <Link
                        to={`/artisan/${artisan?.id}`}
                        className="mt-4 block w-full text-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        View Profile
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No artisans found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ArtisanSearch;

// Made with Bob