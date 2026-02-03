import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Calendar,
  CreditCard,
  Package
} from 'lucide-react';

interface CustomerBottle {
  _id: string;
  bottleId: {
    _id: string;
    name: string;
    brand: string;
    price: number;
    volume: string;
  };
  venueId: {
    _id: string;
    name: string;
    address: string;
  };
  orderId: {
    _id: string;
    paymentMethod: 'full' | 'emi';
    emiDetails?: {
      monthlyAmount: number;
      totalMonths: number;
      remainingMonths: number;
    };
    createdAt: string;
  };
  selectedVolume: string;
  purchasePrice: number;
  paymentMethod: 'full' | 'emi';
  purchaseDate: string;
  status: 'owned' | 'consumed';
}

interface BottlesByDate {
  [date: string]: CustomerBottle[];
}

export const MyBottlesPage = () => {
  const navigate = useNavigate();
  const [bottles, setBottles] = useState<CustomerBottle[]>([]);
  const [bottlesByDate, setBottlesByDate] = useState<BottlesByDate>({});
  const [loading, setLoading] = useState(true);
  const [totalBottles, setTotalBottles] = useState(0);

  useEffect(() => {
    fetchMyBottles();
  }, []);

  const fetchMyBottles = async () => {
    try {
      const token = localStorage.getItem('customerToken');
      const response = await fetch('http://localhost:5000/api/payment/my-bottles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBottles(data.data.bottles);
          setBottlesByDate(data.data.bottlesByDate);
          setTotalBottles(data.data.pagination.totalBottles);
        }
      }
    } catch (error) {
      console.error('Error fetching bottles:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bottles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
          <h1 className="text-lg font-semibold">My Bottles</h1>
        </div>
        <div className="text-sm text-gray-500">
          {totalBottles} bottles owned
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {bottles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <Package className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bottles yet</h3>
            <p className="text-gray-500 mb-4">Purchase some bottles to see them here</p>
            <Button onClick={() => navigate('/')}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(bottlesByDate).map(([dateKey, dayBottles]) => (
              <div key={dateKey}>
                {/* Date Header */}
                <div className="flex items-center mb-3">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <h2 className="text-sm font-medium text-gray-600">
                    {formatDate(dateKey)} ({dayBottles.length} bottles)
                  </h2>
                </div>

                {/* Bottles for this date */}
                <div className="space-y-3">
                  {dayBottles.map((bottle) => (
                    <div key={bottle._id} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-start space-x-3">
                        {/* Bottle Image */}
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <img 
                            src={`https://picsum.photos/100/100?random=${bottle.bottleId._id}`}
                            alt={`${bottle.bottleId.brand} ${bottle.bottleId.name}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>

                        {/* Bottle Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm leading-tight">
                            {bottle.bottleId.brand} {bottle.bottleId.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {bottle.selectedVolume}
                          </p>
                          
                          {/* Venue Info */}
                          <p className="text-xs text-gray-400 mt-1">
                            From {bottle.venueId.name}
                          </p>

                          {/* Purchase Details */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-2">
                              {/* Payment Method Badge */}
                              <div className={`flex items-center px-2 py-1 rounded-full text-xs ${
                                bottle.paymentMethod === 'emi' 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                <CreditCard className="w-3 h-3 mr-1" />
                                {bottle.paymentMethod === 'emi' ? 'EMI' : 'Full Payment'}
                              </div>

                              {/* Status Badge */}
                              <div className={`px-2 py-1 rounded-full text-xs ${
                                bottle.status === 'owned' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {bottle.status === 'owned' ? 'Owned' : 'Consumed'}
                              </div>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <div className="text-sm font-bold text-gray-900">
                                ₹{bottle.purchasePrice.toLocaleString()}
                              </div>
                              {bottle.paymentMethod === 'emi' && bottle.orderId.emiDetails && (
                                <div className="text-xs text-red-600">
                                  ₹{bottle.orderId.emiDetails.monthlyAmount}/month
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};