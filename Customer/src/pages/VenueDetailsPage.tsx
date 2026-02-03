import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Star,
  ShoppingCart,
  Filter
} from 'lucide-react';

interface Venue {
  _id: string;
  name: string;
  address?: string;
}

interface Bottle {
  _id: string;
  name: string;
  brand: string;
  price: number;
  volume: string;
  amount: number;
  isAvailable: boolean;
}

interface VenueDetailsResponse {
  success: boolean;
  data: Bottle[];
  venue: Venue;
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export const VenueDetailsPage = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    if (venueId) {
      fetchVenueBottles();
    }
  }, [venueId]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Trigger search when debounced term changes
  useEffect(() => {
    if (venueId) {
      handleSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, venueId]);

  const fetchVenueBottles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/venues/${venueId}/bottles`);
      const data: VenueDetailsResponse = await response.json();
      
      if (data.success) {
        setBottles(data.data);
        setVenue(data.venue);
      }
    } catch (error) {
      console.error('Error fetching venue bottles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (search: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/venues/${venueId}/bottles?search=${search}`);
      const data: VenueDetailsResponse = await response.json();
      
      if (data.success) {
        setBottles(data.data);
      }
    } catch (error) {
      console.error('Error searching bottles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleProductClick = (bottleId: string) => {
    navigate(`/venue/${venueId}/product/${bottleId}`);
  };

  if (loading && !venue) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading venue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="text-white rounded-b-3xl relative overflow-hidden">
        {/* Background Image */}
        <img 
          src={`https://picsum.photos/600/400?random=${venueId}`}
          alt={venue?.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Content */}
        <div className="relative z-10 px-4 pt-12 pb-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{venue?.address || 'Location'}</span>
            </div>
          </div>

          {/* Venue Info */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{venue?.name}</h1>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-500 text-white">
                <Star className="w-3 h-3 mr-1" />
                4.2
              </Badge>
              <span className="text-sm text-purple-200">
                {bottles.length} bottles available
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search bottles, brands..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 py-3 bg-white text-gray-900 border-0 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Bottles Grid */}
      <div className="px-4 py-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Available Bottles</h2>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : bottles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ShoppingCart className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bottles found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try a different search term' : 'This venue has no bottles available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {bottles.map((bottle) => (
              <div 
                key={bottle._id} 
                className="relative bg-gray-50 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => handleProductClick(bottle._id)}
              >
                {/* Heart Icon */}
                <button 
                  className="absolute top-2 right-2 z-10 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add to favorites logic here
                    console.log('Added to favorites:', bottle);
                  }}
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 000-6.364 4.5 4.5 0 00-6.364 0L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                <div className="p-2">
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-50 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden">
                    <img 
                      src={`https://picsum.photos/400/400?random=${bottle._id}`}
                      alt={`${bottle.brand} ${bottle.name}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Discount Badge */}
                    {Math.random() > 0.7 && (
                      <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded text-[10px] font-medium">
                        {Math.floor(Math.random() * 30 + 10)}% OFF
                      </div>
                    )}
                    
                    {/* ADD Button - Overlapping bottom-right corner of image */}
                    <Button 
                      size="sm" 
                      disabled={!bottle.isAvailable}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart({
                          _id: bottle._id,
                          name: bottle.name,
                          brand: bottle.brand,
                          price: bottle.price,
                          volume: bottle.volume,
                          venueId: venue?._id || '',
                          venueName: venue?.name || ''
                        });
                      }}
                      className="absolute bottom-1 right-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs font-medium rounded-md border border-green-600 h-6 shadow-sm"
                    >
                      ADD
                    </Button>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-0.5">
                    {/* Volume and Type */}
                    <div className="flex items-center space-x-1 text-[10px]">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-sm flex items-center justify-center">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                        <span className="text-gray-600">{bottle.volume}</span>
                      </div>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-xs font-medium text-gray-900 leading-tight line-clamp-2 mb-1">
                      {bottle.brand} {bottle.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center space-x-1 mb-1">
                      <div className="flex items-center">
                        {[1, 2, 3, 4].map((star) => (
                          <svg key={star} className="w-2.5 h-2.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <svg className="w-2.5 h-2.5 text-gray-300 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <span className="text-[10px] text-gray-500">(4.2)</span>
                    </div>

                    {/* Delivery Time */}
                    <div className="flex items-center space-x-1 text-[10px] text-gray-500 mb-1">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>8 MINS</span>
                    </div>

                    {/* Price */}
                    <div>
                      <div className="text-xs font-bold text-gray-900">
                        ₹{bottle.price.toLocaleString()}
                      </div>
                      {Math.random() > 0.5 && (
                        <div className="text-[10px] text-gray-400 line-through">
                          MRP ₹{Math.floor(bottle.price * 1.2)}
                        </div>
                      )}
                    </div>

                    {/* Stock Info */}
                    <div className="text-[10px] text-gray-500">
                      {bottle.amount > 10 ? (
                        <span>In stock</span>
                      ) : bottle.amount > 0 ? (
                        <span className="text-orange-500">Only {bottle.amount} left</span>
                      ) : (
                        <span className="text-red-500">Out of stock</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};