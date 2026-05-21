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
  ProgressBar,
  Tag,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';
import {
  Add,
  View,
  Edit,
  ShoppingCart,
  Notification,
  User,
  ChartLine,
} from '@carbon/icons-react';

interface DashboardStats {
  totalItems: number;
  viewsThisMonth: number;
  activeOrders: number;
  profileCompleteness: number;
}

interface CatalogueItem {
  id: number;
  title: string;
  category: string;
  price: number;
  availability: string;
  created_at: string;
}

interface Commission {
  id: number;
  designer_name: string;
  status: string;
  created_at: string;
  message: string;
}

interface NotificationItem {
  id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const ArtisanDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [catalogueItems, setCatalogueItems] = useState<CatalogueItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<Commission[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch catalogue items (artisan's own)
      const catalogueRes = await api.get('/catalogue/my/');
      const items = catalogueRes.data.results || catalogueRes.data || [];
      setCatalogueItems(items.slice(0, 6)); // Latest 6 items

      // Fetch commissions
      const commissionsRes = await api.get('/commissions/?limit=5');
      const commissions = commissionsRes.data.results || commissionsRes.data || [];
      setRecentOrders(commissions);

      // Fetch notifications
      const notificationsRes = await api.get('/notifications/?limit=3');
      const notifs = notificationsRes.data.results || notificationsRes.data || [];
      setNotifications(notifs);

      // Calculate stats
      const totalItems = items.length;
      const activeOrders = commissions.filter(
        (c: Commission) => c.status === 'pending' || c.status === 'in_progress'
      ).length;

      // Calculate profile completeness
      const completeness = calculateProfileCompleteness();

      setStats({
        totalItems,
        viewsThisMonth: 0, // TODO: Implement view tracking
        activeOrders,
        profileCompleteness: completeness,
      });
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompleteness = (): number => {
    if (!user) return 0;
    
    let completed = 0;
    const total = 6;

    if (user.full_name) completed++;
    if (user.email) completed++;
    if (user.phone) completed++;
    if (user.location) completed++;
    if (user.bio) completed++;
    // Check if artisan has at least one catalogue item
    if (catalogueItems.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'blue';
      case 'in_progress':
        return 'cyan';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'green';
      case 'busy':
        return 'orange';
      case 'custom_order':
        return 'blue';
      default:
        return 'gray';
    }
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
          Welcome back, {user?.full_name || 'Artisan'}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your craft business today.
        </p>
      </div>

      {/* Stats Cards */}
      <Grid className="mb-8">
        <Column lg={4} md={4} sm={4}>
          <Tile className="p-6 h-full">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Items</p>
                <p className="text-3xl font-bold">{stats?.totalItems || 0}</p>
              </div>
              <View size={32} className="text-blue-600" />
            </div>
          </Tile>
        </Column>

        <Column lg={4} md={4} sm={4}>
          <Tile className="p-6 h-full">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Orders</p>
                <p className="text-3xl font-bold">{stats?.activeOrders || 0}</p>
              </div>
              <ShoppingCart size={32} className="text-green-600" />
            </div>
          </Tile>
        </Column>

        <Column lg={4} md={4} sm={4}>
          <Tile className="p-6 h-full">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Views This Month</p>
                <p className="text-3xl font-bold">{stats?.viewsThisMonth || 0}</p>
              </div>
              <ChartLine size={32} className="text-purple-600" />
            </div>
          </Tile>
        </Column>
      </Grid>

      {/* Profile Completion */}
      {stats && stats.profileCompleteness < 100 && (
        <Tile className="mb-8 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Complete Your Profile</h3>
              <p className="text-sm text-gray-600">
                {stats.profileCompleteness}% complete - Add more details to attract designers
              </p>
            </div>
            <User size={32} className="text-gray-400" />
          </div>
          <ProgressBar
            value={stats.profileCompleteness}
            max={100}
            label="Profile Completion"
            className="mb-4"
          />
          <Link to="/dashboard/artisan/profile">
            <Button kind="tertiary" size="sm">
              Complete Profile
            </Button>
          </Link>
        </Tile>
      )}

      <Grid>
        {/* My Catalogue Section */}
        <Column lg={8} md={8} sm={4}>
          <Tile className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">My Catalogue</h2>
              <Link to="/dashboard/artisan/catalogue/new">
                <Button
                  kind="primary"
                  size="sm"
                  renderIcon={Add}
                >
                  Add New Item
                </Button>
              </Link>
            </div>

            {catalogueItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">
                  You haven't added any items to your catalogue yet.
                </p>
                <Link to="/dashboard/artisan/catalogue/new">
                  <Button kind="primary" renderIcon={Add}>
                    Add Your First Item
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {catalogueItems.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold mb-2 truncate">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 capitalize">
                        {item.category}
                      </p>
                      <p className="text-lg font-bold text-blue-600 mb-2">
                        KES {item.price.toLocaleString()}
                      </p>
                      <Tag
                        type={getAvailabilityColor(item.availability)}
                        size="sm"
                        className="mb-3"
                      >
                        {item.availability.replace('_', ' ')}
                      </Tag>
                      <div className="flex gap-2">
                        <Link
                          to={`/dashboard/artisan/catalogue/${item.id}`}
                          className="flex-1"
                        >
                          <Button kind="ghost" size="sm" className="w-full">
                            <Edit size={16} className="mr-1" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/dashboard/artisan/catalogue">
                  <Button kind="tertiary" size="sm">
                    View All Items ({stats?.totalItems || 0})
                  </Button>
                </Link>
              </>
            )}
          </Tile>

          {/* Recent Orders */}
          <Tile className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semib">Recent Orders</h2>
              <Link to="/dashboard/artisan/orders">
                <Button kind="tertiary" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No orders yet.</p>
              </div>
            ) : (
              <DataTable
                rows={recentOrders.map((order) => ({
                  id: order.id.toString(),
                  designer: order.designer_name,
                  status: order.status,
                  date: new Date(order.created_at).toLocaleDateString(),
                  message: order.message.substring(0, 50) + '...',
                }))}
                headers={[
                  { key: 'designer', header: 'Designer' },
                  { key: 'status', header: 'Status' },
                  { key: 'date', header: 'Date' },
                  { key: 'message', header: 'Message' },
                ]}
              >
                {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                  <TableContainer>
                    <Table {...getTableProps()}>
                      <TableHead>
                        <TableRow>
                          {headers.map((header) => (
                            <TableHeader {...getHeaderProps({ header })}>
                              {header.header}
                            </TableHeader>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow {...getRowProps({ row })}>
                            {row.cells.map((cell) => (
                              <TableCell key={cell.id}>
                                {cell.info.header === 'status' ? (
                                  <Tag
                                    type={getStatusColor(cell.value)}
                                    size="sm"
                                  >
                                    {cell.value.replace('_', ' ')}
                                  </Tag>
                                ) : (
                                  cell.value
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </DataTable>
            )}
          </Tile>
        </Column>

        {/* Notifications Sidebar */}
        <Column lg={4} md={4} sm={4}>
          <Tile className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Notifications</h2>
              <Link to="/dashboard/artisan/notifications">
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
        </Column>
      </Grid>
    </div>
  );
};

export default ArtisanDashboard;

// Made with Bob
