import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Theme } from '@carbon/react';
import './index.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import ArtisanCatalogue from './pages/ArtisanCatalogue';
import ProductDetail from './pages/ProductDetail';
import CommissionFlow from './pages/CommissionFlow';
import Dashboard from './pages/Dashboard';
import InvoiceView from './pages/InvoiceView';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Layout components
import Header from './components/shared/Header';
import Footer from './components/shared/Footer';

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
                <Route path="/" element={<Home />} />
                <Route path="/catalogue" element={<ArtisanCatalogue />} />
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
                
                {/* Protected routes - require authentication */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
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
