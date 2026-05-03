import React from 'react';
import ArtisanSearch from '../components/designer/ArtisanSearch';

const ArtisanCatalogue: React.FC = () => {

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

        {/* Artisan Search Component */}
        <ArtisanSearch showAsGrid={true} />
      </div>
    </div>
  );
};

export default ArtisanCatalogue;

// Made with Bob
