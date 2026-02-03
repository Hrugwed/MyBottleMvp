import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  Star,
  ArrowRight,
  Crown
} from 'lucide-react';

interface Venue {
  _id: string;
  name: string;
  address?: string;
  isActive: boolean;
}

export const HomePage = () => {
  const { customer } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch venues from API
    const fetchVenues = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/venues');
        const data = await response.json();
        if (data.success) {
          setVenues(data.data);
        }
      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  const handleVenueClick = (venueId: string) => {
    navigate(`/venue/${venueId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 text-white rounded-b-3xl">
        <div className="px-4 pt-12 pb-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <div>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold">Your Location</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
                <span className="text-sm text-purple-200">Pune</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-yellow-500 text-black hover:bg-yellow-400">
                <Crown className="w-3 h-3 mr-1" />
                Be Prime
              </Badge>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-purple-600 text-white text-sm">
                  {customer?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search venues, locations or drinks"
              className="pl-10 py-3 bg-white text-gray-900 border-0 rounded-xl"
            />
          </div>

          {/* Hero Section */}
          <div className="relative rounded-2xl overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2 leading-tight">
                    Experience nightlife
                    <br />
                    at its finest
                  </h2>
                </div>
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/30 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className="bg-purple-700/50 border-0 text-white">
              <CardContent className="p-4">
                <div className="text-sm font-medium mb-1">Club</div>
                <div className="text-xs text-purple-200 mb-3">30% Off</div>
                <div className="w-8 h-8 bg-white/20 rounded-full mb-2"></div>
                <ArrowRight className="w-4 h-4" />
              </CardContent>
            </Card>
            
            <Card className="bg-purple-700/50 border-0 text-white">
              <CardContent className="p-4">
                <div className="text-sm font-medium mb-1">Bar</div>
                <div className="text-xs text-purple-200 mb-3">Dining</div>
                <div className="w-8 h-8 bg-white/20 rounded-full mb-2"></div>
                <ArrowRight className="w-4 h-4" />
              </CardContent>
            </Card>
            
            <Card className="bg-purple-700/50 border-0 text-white">
              <CardContent className="p-4">
                <div className="text-sm font-medium mb-1">Lounge</div>
                <div className="text-xs text-purple-200 mb-3">Premium</div>
                <div className="w-8 h-8 bg-white/20 rounded-full mb-2"></div>
                <ArrowRight className="w-4 h-4" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Personalized Section */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {customer?.name}, What's Your Pick?
          </h3>
          
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            <Card className="min-w-[140px] border border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <div className="w-8 h-8 bg-orange-200 rounded-full"></div>
                </div>
                <div className="font-medium text-sm mb-1">Book a Table</div>
                <div className="text-xs text-gray-500">Upto 50% Off</div>
              </CardContent>
            </Card>

            <Card className="min-w-[140px] border border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <div className="w-8 h-8 bg-yellow-200 rounded-full"></div>
                </div>
                <div className="font-medium text-sm mb-1">VIP Dining</div>
                <div className="text-xs text-gray-500">Premium</div>
              </CardContent>
            </Card>

            <Card className="min-w-[140px] border border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <div className="w-8 h-8 bg-red-200 rounded-full"></div>
                </div>
                <div className="font-medium text-sm mb-1">Walk-In</div>
                <div className="text-xs text-gray-500">Upto 40% Off</div>
              </CardContent>
            </Card>

            <Card className="min-w-[140px] border border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <div className="w-8 h-8 bg-green-200 rounded-full"></div>
                </div>
                <div className="font-medium text-sm mb-1">Quick Drinks</div>
                <div className="text-xs text-gray-500">Fast Service</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Promotional Banner */}
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm mb-1">Up to</div>
                <div className="text-2xl font-bold mb-1">₹1500 OFF</div>
                <div className="text-sm mb-3">every month. For life.</div>
                <Button size="sm" className="bg-white text-orange-500 hover:bg-gray-100">
                  Know More
                </Button>
              </div>
              <div className="w-20 h-20 bg-white/20 rounded-full"></div>
            </div>
          </div>
        </Card>

        {/* Venues Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recommended For You</h3>
            <Button variant="ghost" size="sm" className="text-orange-500">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {loading ? (
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="min-w-[280px] h-[280px] bg-gray-200 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {venues.map((venue, index) => (
                <div 
                  key={venue._id} 
                  className="min-w-[280px] h-[280px] relative rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  onClick={() => handleVenueClick(venue._id)}
                >
                  {/* Background Image using Picsum API */}
                  <img 
                    src={`https://picsum.photos/400/400?random=${venue._id}`}
                    alt={venue.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Dark Gradient Overlay for Text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <div className="flex space-x-2">
                      <div className="bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                        Venue Offer
                      </div>
                      <div className="bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                        25% Off
                      </div>
                    </div>
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      <span className="text-xs font-medium">4.2</span>
                    </div>
                  </div>

                  {/* Bottom Content */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h4 className="font-bold text-xl mb-2 truncate">{venue.name}</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white/90 truncate flex-1">
                        {venue.address || 'Viman Nagar, Pune'}
                      </p>
                      <div className="flex items-center ml-3 bg-white/20 rounded-full px-3 py-1">
                        <MapPin className="w-3 h-3 mr-1 text-orange-400" />
                        <span className="text-xs font-medium">2.5 km</span>
                      </div>
                    </div>
                  </div>

                  {/* Plus Icon */}
                  <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl font-bold">+</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};