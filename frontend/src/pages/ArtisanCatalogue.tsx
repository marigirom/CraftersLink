import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { ArtisanProfile, PaginatedResponse } from '../types';

const ArtisanCatalogue: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  
  const { data, loading, error } = useApi<PaginatedResponse<ArtisanProfile>>('/artisans/', { immediate: true });

  const specializations = ['Woodworking', 'Metalwork', 'Textiles', 'Ceramics', 'Glasswork', 'Leatherwork'];
  const locations = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];

  const filteredArtisans = data?.results?.filter((artisan) => {
    const matchesSearch = artisan.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artisan.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = !selectedSpecialization || artisan.specialization === selectedSpecialization;
    const matchesLocation = !selectedLocation || artisan.location === selectedLocation;
    
    return matchesSearch && matchesSpecialization && matchesLocation;
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Artisan Catalogue</h1>
          <p className="text-lg text-gray-600">
            Discover talented artisans and their exceptional craftsmanship
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">Error loading artisans: {error}</p>
          </div>
        )}

        {/* Artisan Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtisans && filteredArtisans.length > 0 ? (
                filteredArtisans.map((artisan) => (
                  <Link
                    key={artisan.id}
                    to={`/artisan/${artisan.id}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
                  >
                    {/* Profile Image */}
                    <div className="relative h-48 bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden">
                      {artisan.user.profile_picture ? (
                        <img
                          src={artisan.user.profile_picture}
                          alt={artisan.business_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl font-bold text-amber-600">
                            {artisan.business_name[0]}
                          </span>
                        </div>
                      )}
                      {artisan.verified && (
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
                        {artisan.business_name}
                      </h3>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {artisan.location}
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {artisan.bio}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                          {artisan.specialization}
                        </span>
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                          <span className="ml-1 text-sm font-semibold text-gray-700">
                            {artisan.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{artisan.years_of_experience} years exp.</span>
                        <span>{artisan.total_commissions} projects</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No artisans found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>

            {/* Results Count */}
            {filteredArtisans && filteredArtisans.length > 0 && (
              <div className="mt-8 text-center text-gray-600">
                Showing {filteredArtisans.length} of {data?.count || 0} artisans
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ArtisanCatalogue;

// Made with Bob
