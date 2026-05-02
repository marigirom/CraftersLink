import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-50 to-amber-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Connect with Skilled{' '}
                <span className="text-amber-600">Artisans</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8">
                CraftersLink bridges the gap between talented artisans and designers, 
                enabling seamless collaboration on custom projects. From concept to creation, 
                we empower craftsmanship.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/catalogue"
                      className="px-8 py-3 text-center bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-lg"
                    >
                      Browse Artisans
                    </Link>
                    {user?.role === 'designer' && (
                      <Link
                        to="/commission/new"
                        className="px-8 py-3 text-center bg-white text-amber-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors border-2 border-amber-600"
                      >
                        Start a Commission
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="px-8 py-3 text-center bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-lg"
                    >
                      Get Started
                    </Link>
                    <Link
                      to="/catalogue"
                      className="px-8 py-3 text-center bg-white text-amber-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors border-2 border-amber-600"
                    >
                      Explore Catalogue
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl transform rotate-3"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl p-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-amber-50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-amber-600 mb-2">500+</div>
                      <div className="text-sm text-gray-600">Skilled Artisans</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-amber-600 mb-2">1000+</div>
                      <div className="text-sm text-gray-600">Projects Completed</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-amber-600 mb-2">98%</div>
                      <div className="text-sm text-gray-600">Satisfaction Rate</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-amber-600 mb-2">24/7</div>
                      <div className="text-sm text-gray-600">Support Available</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose CraftersLink?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide everything you need to collaborate effectively on custom projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Discover Talent
              </h3>
              <p className="text-gray-600">
                Browse through hundreds of verified artisans with diverse specializations 
                and find the perfect match for your project.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Milestone Tracking
              </h3>
              <p className="text-gray-600">
                Track project progress with clear milestones, ensuring transparency 
                and timely delivery of your custom pieces.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Secure Payments
              </h3>
              <p className="text-gray-600">
                Automated invoicing and secure payment processing ensure smooth 
                financial transactions for all parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Browse & Select
              </h3>
              <p className="text-gray-600">
                Explore our catalogue of talented artisans and their portfolios. 
                Find the perfect craftsperson for your project.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Submit Commission
              </h3>
              <p className="text-gray-600">
                Describe your project requirements, set your budget, and submit 
                a commission request to your chosen artisan.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Track & Receive
              </h3>
              <p className="text-gray-600">
                Monitor progress through milestones, make secure payments, 
                and receive your custom-crafted masterpiece.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-amber-600 to-amber-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl mb-8 text-amber-100">
            Join thousands of designers and artisans creating amazing custom pieces together
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-block px-8 py-3 bg-white text-amber-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Sign Up Now
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

// Made with Bob
