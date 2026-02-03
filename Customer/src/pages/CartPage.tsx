import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Heart,
  Minus,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface CartItem {
  _id: string;
  name: string;
  brand: string;
  price: number;
  volume: string;
  quantity: number;
  venueId: string;
  venueName: string;
}

export const CartPage = () => {
  const navigate = useNavigate();
  const { customer } = useAuth();
  const { items: cartItems, totalItems, totalPrice, updateQuantity, removeFromCart, refreshCart, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    // Refresh cart when component mounts
    refreshCart().then(() => setLoading(false));
  }, [refreshCart]);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  const handlePayment = async (paymentMethod: 'full' | 'emi') => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setProcessingPayment(true);
    
    try {
      const token = localStorage.getItem('customerToken');
      const response = await fetch('http://localhost:5000/api/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentMethod })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Payment successful! ${data.data.bottlesOwned} bottles added to your collection`);
        
        // Clear cart context
        await clearCart();
        
        // Navigate to home or my bottles page
        navigate('/', { replace: true });
      } else {
        toast.error(data.message || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please check your connection and try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Calculate savings (assuming 20% markup for MRP)
  const originalPrice = Math.floor(totalPrice * 1.2);
  const savings = originalPrice - totalPrice;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-2 mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Cart</h1>
        </div>
        <Button variant="ghost" size="sm" className="p-2">
          <Heart className="w-5 h-5" />
        </Button>
      </div>

      {/* Savings Banner */}
      {savings > 0 && (
        <div className="bg-green-50 border border-green-200 mx-4 mt-4 p-3 rounded-lg">
          <div className="flex items-center">
            <span className="text-green-600 font-medium text-sm">
              Yay! You saved ₹{savings} on this order
            </span>
          </div>
        </div>
      )}

      {/* Cart Items */}
      <div className="px-4 py-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🛒</span>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-4">Add some bottles to get started</p>
            <Button onClick={() => navigate('/')}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item._id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-start space-x-3">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img 
                      src={`https://picsum.photos/100/100?random=${item._id}`}
                      alt={`${item.brand} ${item.name}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm leading-tight">
                      {item.brand} {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      1 pack ({item.volume})
                    </p>
                    
                    {/* Venue Info */}
                    <p className="text-xs text-gray-400 mt-1">
                      From {item.venueName}
                    </p>

                    {/* Price and Controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-200 rounded">
                          <button
                            onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-50 text-red-500"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-1 text-sm font-medium text-red-500">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-50 text-green-500"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400 line-through">
                          MRP ₹{Math.floor(item.price * item.quantity * 1.2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Payment Section */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-600">To Pay</div>
              <div className="text-2xl font-bold text-gray-900">₹{totalPrice.toLocaleString()}</div>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handlePayment('full')}
                disabled={processingPayment}
              >
                {processingPayment ? 'Processing...' : 'Pay in Full'}
              </Button>
              <Button 
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={() => handlePayment('emi')}
                disabled={processingPayment}
              >
                {processingPayment ? 'Processing...' : (
                  <>
                    Pay with EMI
                    <div className="text-xs">₹{Math.floor(totalPrice / 12)}/month*</div>
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Bottom Navigation Indicator */}
          <div className="flex justify-center">
            <div className="w-32 h-1 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};