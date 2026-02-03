import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { 
  Home, 
  Crown, 
  CreditCard, 
  Users
} from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
      {/* Navigation Items */}
      <div className="flex items-center justify-around px-4 py-3">
        <button 
          onClick={() => navigate('/')}
          className="flex flex-col items-center py-2 px-3"
        >
          <Home className={`w-5 h-5 mb-1 ${isActive('/') ? 'text-orange-500' : 'text-gray-400'}`} />
          <span className={`text-xs font-medium ${isActive('/') ? 'text-orange-500' : 'text-gray-400'}`}>
            HOME
          </span>
        </button>
        
        <button className="flex flex-col items-center py-2 px-3">
          <Crown className="w-5 h-5 text-gray-400 mb-1" />
          <span className="text-xs text-gray-400">PRIME</span>
        </button>
        
        {/* Fixed space for floating cart button */}
        <div className="w-12"></div>
        
        <button className="flex flex-col items-center py-2 px-3">
          <CreditCard className="w-5 h-5 text-gray-400 mb-1" />
          <span className="text-xs text-gray-400">CARD</span>
        </button>
        
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center py-2 px-3"
        >
          <Users className="w-5 h-5 text-gray-400 mb-1" />
          <span className="text-xs text-gray-400">PROFILE</span>
        </button>
      </div>
    </div>
  );
};