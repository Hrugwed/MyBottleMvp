import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PublicRoute } from '@/components/PublicRoute';
import { HomePage } from '@/pages/HomePage';
import { AuthPage } from '@/pages/AuthPage';
import { VenueDetailsPage } from '@/pages/VenueDetailsPage';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <AuthProvider>
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
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/venue/:venueId" 
              element={
                <ProtectedRoute>
                  <VenueDetailsPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
