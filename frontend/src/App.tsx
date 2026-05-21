import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Theme } from '@carbon/react';
import './index.css';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CommissionFlow from './pages/CommissionFlow';
import InvoiceView from './pages/InvoiceView';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Designer-specific pages
import DesignerDashboard from './pages/designer/DesignerDashboard';
import DesignerProfile from './pages/designer/DesignerProfile';
import CatalogueBrowse from './pages/designer/CatalogueBrowse';
import ArtisanDetailPage from './pages/designer/ArtisanDetailPage';
import ItemDetailPage from './pages/designer/ItemDetailPage';
import ProductDetailPage from './pages/designer/ProductDetailPage';

// Artisan-specific pages
import ArtisanDashboard from './pages/artisan/ArtisanDashboard';
import ArtisanCatalogue from './pages/artisan/ArtisanCatalogue';
import ArtisanProfile from './pages/artisan/ArtisanProfile';
import ProductCreateForm from './pages/artisan/ProductCreateForm';

// Layout components
import Header from './components/shared/Header';
import Footer from './components/shared/Footer';

// Redirect component for authenticated users on home page
const HomeWithRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (isAuthenticated && user) {
    if (user.role === 'ARTISAN') {
      return <Navigate to="/artisan/dashboard" replace />;
    } else if (user.role === 'INTERIOR_DESIGNER' || user.role === 'DESIGNER') {
      return <Navigate to="/designer/dashboard" replace />;
    }
  }
  
  return <Home />;
};

// Redirect component for /dashboard route
const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (user?.role === 'ARTISAN') {
    return <Navigate to="/artisan/dashboard" replace />;
  } else if (user?.role === 'INTERIOR_DESIGNER' || user?.role === 'DESIGNER') {
    return <Navigate to="/designer/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <Theme theme="white">
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomeWithRedirect />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                
                {/* Auth routes - redirect if already logged in */}
                <Route
                  path="/login"
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <Login />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <Register />
                    </ProtectedRoute>
                  }
                />
                
                {/* Generic dashboard - redirects based on role */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardRedirect />
                    </ProtectedRoute>
                  }
                />
                
                {/* Artisan-specific routes */}
                <Route
                  path="/artisan/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ARTISAN']}>
                      <ArtisanDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/artisan/catalogue"
                  element={
                    <ProtectedRoute allowedRoles={['ARTISAN']}>
                      <ArtisanCatalogue />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/artisan/products/new"
                  element={
                    <ProtectedRoute allowedRoles={['ARTISAN']}>
                      <ProductCreateForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/artisan/profile"
                  element={
                    <ProtectedRoute allowedRoles={['ARTISAN']}>
                      <ArtisanProfile />
                    </ProtectedRoute>
                  }
                />
                
                {/* Designer-specific routes */}
                <Route
                  path="/designer/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['INTERIOR_DESIGNER', 'DESIGNER']}>
                      <DesignerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/designer/catalogue"
                  element={
                    <ProtectedRoute allowedRoles={['INTERIOR_DESIGNER', 'DESIGNER']}>
                      <CatalogueBrowse />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/designer/products/:productId"
                  element={
                    <ProtectedRoute allowedRoles={['INTERIOR_DESIGNER', 'DESIGNER']}>
                      <ProductDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/designer/catalogue/:artisanId/:itemId"
                  element={
                    <ProtectedRoute allowedRoles={['INTERIOR_DESIGNER', 'DESIGNER']}>
                      <ItemDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/designer/catalogue/:artisanId"
                  element={
                    <ProtectedRoute allowedRoles={['INTERIOR_DESIGNER', 'DESIGNER']}>
                      <ArtisanDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/designer/commissions"
                  element={
                    <ProtectedRoute allowedRoles={['INTERIOR_DESIGNER', 'DESIGNER']}>
                      <CommissionFlow />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/designer/commission/new"
                  element={
                    <ProtectedRoute allowedRoles={['INTERIOR_DESIGNER', 'DESIGNER']}>
                      <CommissionFlow />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/designer/profile"
                  element={
                    <ProtectedRoute allowedRoles={['INTERIOR_DESIGNER', 'DESIGNER']}>
                      <DesignerProfile />
                    </ProtectedRoute>
                  }
                />
                
                {/* Shared protected routes */}
                <Route
                  path="/commission/new"
                  element={
                    <ProtectedRoute>
                      <CommissionFlow />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/commissions/:id"
                  element={
                    <ProtectedRoute>
                      <CommissionFlow />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/invoices/:id"
                  element={
                    <ProtectedRoute>
                      <InvoiceView />
                    </ProtectedRoute>
                  }
                />
                
                {/* Legacy route redirects for backward compatibility */}
                <Route path="/dashboard/artisan" element={<Navigate to="/artisan/dashboard" replace />} />
                <Route path="/dashboard/artisan/*" element={<Navigate to="/artisan/dashboard" replace />} />
                <Route path="/dashboard/designer" element={<Navigate to="/designer/dashboard" replace />} />
                <Route path="/dashboard/designer/*" element={<Navigate to="/designer/dashboard" replace />} />
                <Route path="/catalogue" element={<Navigate to="/designer/catalogue" replace />} />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </Theme>
  );
}

export default App;

// Made with Bob
