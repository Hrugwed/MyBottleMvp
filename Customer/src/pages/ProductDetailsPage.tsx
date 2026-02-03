import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Heart, 
  Search, 
  Share,
  Star,
  Clock,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface Bottle {
  _id: string;
  name: string;
  brand: string;
  price: number;
  volume: string;
  amount: number;
  isAvailable: boolean;
  venue: {
    _id: string;
    name: string;
    address?: string;
  };
}

interface ProductDetailsResponse {
  success: boolean;
  data: Bottle;
}

interface SimilarProductsResponse {
  success: boolean;
  data: Bottle[];
}

export const ProductDetailsPage = () => {
  const { venueId, bottleId } = useParams<{ venueId: string; bottleId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [bottle, setBottle] = useState<Bottle | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Bottle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    if (venueId && bottleId) {
      fetchProductDetails();
      fetchSimilarProducts();
    }
  }, [venueId, bottleId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/venues/${venueId}/bottles/${bottleId}`);
      const data: ProductDetailsResponse = await response.json();
      
      if (data.success) {
        setBottle(data.data);
        setSelectedSize(data.data.volume);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarProducts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/venues/${venueId}/bottles?limit=6`);
      const data: SimilarProductsResponse = await response.json();
      
      if (data.success) {
        // Filter out current product and get random similar products
        const filtered = data.data.filter(p => p._id !== bottleId).slice(0, 3);
        setSimilarProducts(filtered);
      }
    } catch (error) {
      console.error('Error fetching similar products:', error);
    }
  };

  const handleAddToCart = () => {
    if (bottle) {
      addToCart({
        _id: bottle._id,
        name: bottle.name,
        brand: bottle.brand,
        price: bottle.price,
        volume: selectedSize || bottle.volume,
        venueId: bottle.venue._id,
        venueName: bottle.venue.name
      });
    }
  };

  if (loading || !bottle) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Full Screen Product Image with Floating Header */}
      <div className="relative h-96 bg-gray-50 overflow-hidden">
        <img 
          src={`https://picsum.photos/400/600?random=${bottle._id}`}
          alt={`${bottle.brand} ${bottle.name}`}
          className="w-full h-full object-cover"
        />
        
        {/* Floating Header Buttons */}
        <div className="absolute top-0 left-0 right-0 px-4 py-3 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/venue/${venueId}`)}
            className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white/90"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </Button>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white/90">
              <Heart className="w-5 h-5 text-gray-900" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white/90">
              <Search className="w-5 h-5 text-gray-900" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white/90">
              <Share className="w-5 h-5 text-gray-900" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 py-6">

        {/* Delivery Time & Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3 text-green-600" />
            <span className="text-xs font-medium text-green-600">8 MINS</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-3 h-3 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="text-xs text-gray-500">(51,093)</span>
          </div>
        </div>

        {/* Product Title */}
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {bottle.brand} {bottle.name}
        </h1>
        
        {/* Vegetarian Badge */}
        <div className="flex items-center mb-4">
          <div className="w-4 h-4 border-2 border-green-500 rounded-sm flex items-center justify-center mr-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>

        {/* Size Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Select</h3>
          <div className="grid grid-cols-3 gap-3">
            {/* Current Size */}
            <div 
              className={`border-2 rounded-lg p-3 cursor-pointer ${
                selectedSize === bottle.volume ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
              onClick={() => setSelectedSize(bottle.volume)}
            >
              <div className="text-sm font-medium">{bottle.volume}</div>
              <div className="text-xs text-gray-500">MRP ₹{bottle.price}</div>
            </div>

            {/* Alternative Sizes with Discounts */}
            <div className="border-2 border-gray-200 rounded-lg p-3 cursor-pointer relative">
              <div className="absolute -top-1 left-2 bg-blue-500 text-white text-xs px-1 rounded">
                15% OFF
              </div>
              <div className="text-sm font-medium">6 x {bottle.volume}</div>
              <div className="text-xs text-gray-900 font-medium">₹{Math.floor(bottle.price * 5.1)}</div>
              <div className="text-xs text-gray-400 line-through">MRP ₹{bottle.price * 6}</div>
            </div>

            <div className="border-2 border-gray-200 rounded-lg p-3 cursor-pointer relative">
              <div className="absolute -top-1 left-2 bg-blue-500 text-white text-xs px-1 rounded">
                7% OFF
              </div>
              <div className="text-sm font-medium">4 x {bottle.volume}</div>
              <div className="text-xs text-gray-900 font-medium">₹{Math.floor(bottle.price * 3.7)}</div>
              <div className="text-xs text-gray-400 line-through">MRP ₹{bottle.price * 4}</div>
            </div>
          </div>
        </div>

        {/* View Product Details */}
        <Button variant="ghost" className="w-full justify-between p-0 h-auto mb-6">
          <span className="text-green-600 font-medium">View product details</span>
          <ChevronDown className="w-4 h-4 text-green-600" />
        </Button>

        {/* Brand Section */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{bottle.brand.charAt(0)}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{bottle.brand}</div>
                  <div className="text-sm text-gray-500">Explore all products</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        {/* Similar Products */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Similar products</h3>
          <div className="grid grid-cols-3 gap-3">
            {similarProducts.map((product) => (
              <div 
                key={product._id} 
                className="relative bg-gray-50 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => navigate(`/venue/${venueId}/product/${product._id}`)}
              >
                <button className="absolute top-2 right-2 z-10 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Heart className="w-4 h-4 text-gray-400" />
                </button>

                <div className="p-2">
                  <div className="aspect-square bg-white rounded-lg mb-2 flex items-center justify-center relative overflow-hidden">
                    <img 
                      src={`https://picsum.photos/400/400?random=${product._id}`}
                      alt={`${product.brand} ${product.name}`}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5">
                      Chilled
                    </Badge>
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-xs font-medium text-gray-900 leading-tight line-clamp-2">
                      {product.brand} {product.name}
                    </h4>
                    <div className="text-xs font-bold text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {product.volume}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-gray-900">
              {bottle.volume}
            </div>
            <div className="text-lg font-bold text-gray-900">
              ₹{bottle.price.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              Inclusive of all taxes
            </div>
          </div>
          <Button 
            onClick={handleAddToCart}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium"
          >
            Add to cart
          </Button>
        </div>
      </div>
    </div>
  );
};