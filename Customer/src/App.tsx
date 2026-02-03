import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PublicRoute } from '@/components/PublicRoute';
import { HomePage } from '@/pages/HomePage';
import { AuthPage } from '@/pages/AuthPage';
import { VenueDetailsPage } from '@/pages/VenueDetailsPage';
import { ProductDetailsPage } from '@/pages/ProductDetailsPage';
import { FloatingCartButton } from '@/components/FloatingCartButton';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route 
                path="/auth" 
                element={
                  <PublicRoute>
                    <AuthPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Navigate to="/auth" replace />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <HomePage />
                    <FloatingCartButton />
                    <BottomNavigation />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/venue/:venueId" 
                element={
                  <ProtectedRoute>
                    <VenueDetailsPage />
                    <FloatingCartButton />
                    <BottomNavigation />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/venue/:venueId/product/:bottleId" 
                element={
                  <ProtectedRoute>
                    <ProductDetailsPage />
                    <FloatingCartButton />
                    <BottomNavigation />
                  </ProtectedRoute>
                } 
              />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
