import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Theme } from '@carbon/react';
import './index.css';

// Pages (to be implemented)
import Home from './pages/Home';
import ArtisanCatalogue from './pages/ArtisanCatalogue';
import ProductDetail from './pages/ProductDetail';
import CommissionFlow from './pages/CommissionFlow';
import Dashboard from './pages/Dashboard';
import InvoiceView from './pages/InvoiceView';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Layout components (to be implemented)
import Header from './components/shared/Header';
import Footer from './components/shared/Footer';

function App() {
  return (
    <Theme theme="white">
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/artisans" element={<ArtisanCatalogue />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/commissions/new" element={<CommissionFlow />} />
              <Route path="/commissions/:id" element={<CommissionFlow />} />
              <Route path="/invoices/:id" element={<InvoiceView />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Theme>
  );
}

export default App;

// Made with Bob
