import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Grid,
  Column,
  Tile,
  Button,
  Loading,
  Tag,
  Search,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@carbon/react';
import {
  Search as SearchIcon,
  FavoriteFilled,
  Folder,
  ShoppingCart,
  Notification,
  Star,
} from '@carbon/icons-react';

interface Artisan {
  id: number;
  user: {
    full_name: string;
    location: string;
  };
  skills: string[];
  specialisation: string;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
}

interface CatalogueItem {
  id: number;
  title: string;
  category: string;
  price: number;
  artisan: {
    id: number;
    user: {
      full_name: string;
    };
  };
  images: string[];
}

interface SavedItem {
  id: number;
  catalogue_item: CatalogueItem;
  saved_at: string;
}

interface NotificationItem {
  id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const DesignerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [featuredArtisans, setFeaturedArtisans] = useState<Artisan[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [recentItems, setRecentItems] = useState<CatalogueItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch featured artisans (top-rated or verified)
      const artisansRes = await api.get('/artisans/?limit=6');
      const artisans = artisansRes.data.results || artisansRes.data || [];
      setFeaturedArtisans(artisans);

      // Fetch saved items
      const savedRes = await api.get('/saved/?limit=6');
      const saved = savedRes.data.results || savedRes.data || [];
      setSavedItems(saved);

      // Fetch recent catalogue items
      const catalogueRes = await api.get('/catalogue/?limit=6');
      const items = catalogueRes.data.results || catalogueRes.data || [];
      setRecentItems(items);

      // Fetch notifications
      const notificationsRes = await api.get('/notifications/?limit=5');
      const notifs = notificationsRes.data.results || notificationsRes.data || [];
      setNotifications(notifs);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/dashboard/designer/catalogue?q=${encodeURIComponent(searchQuery)}`;
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
    return colors[category] || 'gray';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading description="Loading dashboard..." withOverlay={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Tile className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
          <Button
            kind="tertiary"
            size="sm"
            onClick={fetchDashboardData}
            className="mt-2"
          >
            Retry
          </Button>
        </Tile>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.full_name || 'Designer'}!
        </h1>
        <p className="text-gray-600">
          Discover talented artisans and bring your design vision to life.
        </p>
      </div>

      {/* Search Section */}
      <Tile className="mb-8 p-6">
        <h2 className="text-xl font-semibold mb-4">Find the Perfect Artisan</h2>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Search
              placeholder="Search for artisans, skills, or items..."
              labelText="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              size="lg"
            />
          </div>
          <Button
            kind="primary"
            size="lg"
            renderIcon={SearchIcon}
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>

        {/* Quick Category Links */}
        <div className="flex flex-wrap gap-2">
          <Link to="/dashboard/designer/catalogue?category=furniture">
            <Tag type="blue" size="md" className="cursor-pointer">
              Furniture
            </Tag>
          </Link>
          <Link to="/dashboard/designer/catalogue?category=metalwork">
            <Tag type="gray" size="md" className="cursor-pointer">
              Metalwork
            </Tag>
          </Link>
          <Link to="/dashboard/designer/catalogue?category=textiles">
            <Tag type="purple" size="md" className="cursor-pointer">
              Textiles
            </Tag>
          </Link>
          <Link to="/dashboard/designer/catalogue?category=ceramics">
            <Tag type="orange" size="md" className="cursor-pointer">
              Ceramics
            </Tag>
          </Link>
          <Link to="/dashboard/designer/catalogue?category=woodwork">
            <Tag type="brown" size="md" className="cursor-pointer">
              Woodwork
            </Tag>
          </Link>
        </div>
      </Tile>

      <Grid>
        {/* Main Content */}
        <Column lg={12} md={8} sm={4}>
          {/* Featured Artisans */}
          <Tile className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Featured Artisans</h2>
              <Link to="/dashboard/designer/catalogue">
                <Button kind="tertiary" size="sm">
                  Browse All
                </Button>
              </Link>
            </div>

            {featuredArtisans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No artisans available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredArtisans.map((artisan) => (
                  <Link
                    key={artisan.id}
                    to={`/dashboard/designer/catalogue/${artisan.id}`}
                    className="block"
                  >
                    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow h-full">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {artisan.user.full_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {artisan.user.location}
                          </p>
                        </div>
                        {artisan.is_verified && (
                          <Tag type="green" size="sm">
                            Verified
                          </Tag>
                        )}
                      </div>

                      <p className="text-sm font-medium text-blue-600 mb-2">
                        {artisan.specialisation}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {artisan.skills.slice(0, 3).map((skill, idx) => (
                          <Tag key={idx} type="outline" size="sm">
                            {skill}
                          </Tag>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <Star size={16} className="text-yellow-500" />
                        <span className="text-sm font-medium">
                          {artisan.rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({artisan.total_reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Tile>

          {/* Tabs for Recent Items and Saved */}
          <Tile className="p-6">
            <Tabs>
              <TabList aria-label="Dashboard tabs">
                <Tab>Recent Items</Tab>
                <Tab>
                  Saved Items ({savedItems.length})
                </Tab>
              </TabList>
              <TabPanels>
                {/* Recent Items Tab */}
                <TabPanel>
                  {recentItems.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No items available yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      {recentItems.map((item) => (
                        <Link
                          key={item.id}
                          to={`/dashboard/designer/catalogue/${item.artisan.id}/${item.id}`}
                          className="block"
                        >
                          <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                            {item.images && item.images.length > 0 ? (
                              <img
                                src={item.images[0]}
                                alt={item.title}
                                className="w-full h-48 object-cover"
                              />
                            ) : (
                              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                <p className="text-gray-500">No image</p>
                              </div>
                            )}
                            <div className="p-4">
                              <h3 className="font-semibold mb-2 truncate">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                by {item.artisan.user.full_name}
                              </p>
                              <div className="flex items-center justify-between">
                                <p className="text-lg font-bold text-blue-600">
                                  KES {item.price.toLocaleString()}
                                </p>
                                <Tag
                                  type={getCategoryColor(item.category)}
                                  size="sm"
                                >
                                  {item.category}
                                </Tag>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabPanel>

                {/* Saved Items Tab */}
                <TabPanel>
                  {savedItems.length === 0 ? (
                    <div className="text-center py-12">
                      <FavoriteFilled size={48} className="text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        You haven't saved any items yet.
                      </p>
                      <Link to="/dashboard/designer/catalogue">
                        <Button kind="primary">
                          Browse Catalogue
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      {savedItems.map((saved) => (
                        <Link
                          key={saved.id}
                          to={`/dashboard/designer/catalogue/${saved.catalogue_item.artisan.id}/${saved.catalogue_item.id}`}
                          className="block"
                        >
                          <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                            {saved.catalogue_item.images && saved.catalogue_item.images.length > 0 ? (
                              <img
                                src={saved.catalogue_item.images[0]}
                                alt={saved.catalogue_item.title}
                                className="w-full h-48 object-cover"
                              />
                            ) : (
                              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                <p className="text-gray-500">No image</p>
                              </div>
                            )}
                            <div className="p-4">
                              <h3 className="font-semibold mb-2 truncate">
                                {saved.catalogue_item.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                by {saved.catalogue_item.artisan.user.full_name}
                              </p>
                              <div className="flex items-center justify-between">
                                <p className="text-lg font-bold text-blue-600">
                                  KES {saved.catalogue_item.price.toLocaleString()}
                                </p>
                                <Tag
                                  type={getCategoryColor(saved.catalogue_item.category)}
                                  size="sm"
                                >
                                  {saved.catalogue_item.category}
                                </Tag>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  {savedItems.length > 0 && (
                    <div className="mt-4">
                      <Link to="/dashboard/designer/saved">
                        <Button kind="tertiary" size="sm">
                          View All Saved Items
                        </Button>
                      </Link>
                    </div>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Tile>
        </Column>

        {/* Sidebar - Notifications */}
        <Column lg={4} md={4} sm={4}>
          <Tile className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Notifications</h2>
              <Link to="/dashboard/designer/notifications">
                <Button kind="tertiary" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Notification size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">No new notifications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      notification.is_read
                        ? 'bg-gray-50 border-gray-300'
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Tile>

          {/* Quick Actions */}
          <Tile className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/dashboard/designer/catalogue" className="block">
                <Button kind="ghost" className="w-full justify-start">
                  <SearchIcon size={20} className="mr-2" />
                  Browse Catalogue
                </Button>
              </Link>
              <Link to="/dashboard/designer/saved" className="block">
                <Button kind="ghost" className="w-full justify-start">
                  <FavoriteFilled size={20} className="mr-2" />
                  Saved Items
                </Button>
              </Link>
              <Link to="/dashboard/designer/projects" className="block">
                <Button kind="ghost" className="w-full justify-start">
                  <Folder size={20} className="mr-2" />
                  My Projects
                </Button>
              </Link>
              <Link to="/dashboard/designer/enquiries" className="block">
                <Button kind="ghost" className="w-full justify-start">
                  <ShoppingCart size={20} className="mr-2" />
                  My Enquiries
                </Button>
              </Link>
            </div>
          </Tile>
        </Column>
      </Grid>
    </div>
  );
};

export default DesignerDashboard;

// Made with Bob
