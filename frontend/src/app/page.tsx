'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface SearchResult {
  id: number;
  name: string;
  description: string;
  location: string;
  activities: string[];
  rating: number;
  price: number;
  images: string[];
  weather?: WeatherData;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [featuredWeather, setFeaturedWeather] = useState<{[key: string]: WeatherData}>({});

  // Fetch weather for featured locations on component mount
  useEffect(() => {
    const fetchFeaturedWeather = async () => {
      const featuredLocations = ['Yosemite National Park', 'Glacier National Park', 'Grand Canyon National Park'];
      
      for (const location of featuredLocations) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/search/locations?q=${encodeURIComponent(location)}&limit=1`);
          const data = await response.json();
          if (data.success && data.data.length > 0 && data.data[0].weather) {
            setFeaturedWeather(prev => ({
              ...prev,
              [location]: data.data[0].weather
            }));
          }
        } catch (error) {
          console.error(`Error fetching weather for ${location}:`, error);
        }
      }
    };

    fetchFeaturedWeather();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim() && !locationQuery.trim()) {
      alert('Please enter a search term or location');
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (locationQuery.trim()) params.append('state', locationQuery.trim());
      params.append('limit', '6');

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/search/locations?${params}`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data);
      } else {
        console.error('Search failed:', data.message);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleActivityFilter = async (activity: string) => {
    setIsSearching(true);
    setShowResults(true);

    try {
      const params = new URLSearchParams();
      params.append('activity', activity);
      params.append('limit', '6');
      console.log("DEBUG backend url:", process.env.NEXT_PUBLIC_BACKEND_URL);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/search/locations?${params}`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data);
      } else {
        console.error('Search failed:', data.message);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-green-600">🏕️ OutdoorSpot</Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/locations" className="text-gray-700 hover:text-green-600">Locations</a>
              <a href="#" className="text-gray-700 hover:text-green-600">Activities</a>
              <a href="#" className="text-gray-700 hover:text-green-600">Events</a>
              <a href="#" className="text-gray-700 hover:text-green-600">About</a>
            </nav>
            <div className="flex items-center space-x-4">
              <a href="/auth/login" className="text-gray-700 hover:text-green-600">Login</a>
              <a href="/auth/register" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Find Your Next
            <span className="text-green-600"> Adventure</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover amazing camping spots, hiking trails, and outdoor activities. 
            Plan your perfect outdoor adventure with our comprehensive platform.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search locations, activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="City, State"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full sm:w-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
          
          {/* Activity Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => handleActivityFilter('Camping')}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <span>🏕️</span>
              <span>Camping</span>
            </button>
            <button
              onClick={() => handleActivityFilter('Hiking')}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <span>🥾</span>
              <span>Hiking</span>
            </button>
            <button
              onClick={() => handleActivityFilter('Mountain Biking')}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <span>🚵</span>
              <span>Mountain Biking</span>
            </button>
            <button
              onClick={() => handleActivityFilter('Kayaking')}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <span>🛶</span>
              <span>Kayaking</span>
            </button>
            <button
              onClick={() => handleActivityFilter('Photography')}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <span>📸</span>
              <span>Photography</span>
            </button>
          </div>
        </div>
      </section>

      {/* Search Results */}
      {showResults && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {isSearching ? 'Searching...' : `Search Results (${searchResults.length} found)`}
            </h2>
            
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {searchResults.map((location) => (
                  <div key={location.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
                    <div className="h-48 relative overflow-hidden">
                      {location.images && location.images.length > 0 ? (
                        <img 
                          src={location.images[0]} 
                          alt={location.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to gradient background if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center"><span class="text-white text-6xl">🏕️</span></div>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                          <span className="text-white text-6xl">🏕️</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {location.name}
                      </h3>
                      <p className="text-gray-600 mb-4 text-sm">
                        {location.description}
                      </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                      <span className="ml-2 text-sm text-gray-600">({location.rating})</span>
                    </div>
                    <span className="text-green-600 font-medium">${location.price}/night</span>
                  </div>
                  
                  {/* Weather Information */}
                  {location.weather && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{location.weather.icon}</span>
                          <div>
                            <div className="font-medium text-blue-900">
                              {location.weather.temperature}°F {location.weather.condition}
                            </div>
                            <div className="text-sm text-blue-700">
                              {location.weather.description}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-blue-600">
                          <div>💧 {location.weather.humidity}% humidity</div>
                          <div>💨 {location.weather.windSpeed} mph wind</div>
                        </div>
                      </div>
                    </div>
                  )}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {location.activities.slice(0, 3).map((activity, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            {activity}
                          </span>
                        ))}
                      </div>
                      <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : !isSearching ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters</p>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {/* Featured Locations - Only show when no search results */}
      {!showResults && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Featured Locations
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Featured locations with real images */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop"
                    alt="Yosemite National Park"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center"><span class="text-white text-6xl">🏕️</span></div>';
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Yosemite National Park
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Iconic granite cliffs, waterfalls, and ancient sequoias await you in this world-renowned park.
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                      <span className="ml-2 text-sm text-gray-600">(4.9)</span>
                    </div>
                    <span className="text-green-600 font-medium">$35/night</span>
                  </div>
                  
                  {/* Weather for Yosemite */}
                  {featuredWeather['Yosemite National Park'] && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{featuredWeather['Yosemite National Park'].icon}</span>
                          <div>
                            <div className="font-medium text-blue-900">
                              {featuredWeather['Yosemite National Park'].temperature}°F {featuredWeather['Yosemite National Park'].condition}
                            </div>
                            <div className="text-sm text-blue-700">
                              {featuredWeather['Yosemite National Park'].description}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-blue-600">
                          <div>💧 {featuredWeather['Yosemite National Park'].humidity}% humidity</div>
                          <div>💨 {featuredWeather['Yosemite National Park'].windSpeed} mph wind</div>
                        </div>
                      </div>
                    </div>
                  )}
                  <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                    View Details
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
                    alt="Glacier National Park"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center"><span class="text-white text-6xl">🏕️</span></div>';
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Glacier National Park
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Pristine wilderness with over 700 miles of trails and stunning alpine scenery.
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                      <span className="ml-2 text-sm text-gray-600">(4.8)</span>
                    </div>
                    <span className="text-green-600 font-medium">$30/night</span>
                  </div>
                  
                  {/* Weather for Glacier */}
                  {featuredWeather['Glacier National Park'] && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{featuredWeather['Glacier National Park'].icon}</span>
                          <div>
                            <div className="font-medium text-blue-900">
                              {featuredWeather['Glacier National Park'].temperature}°F {featuredWeather['Glacier National Park'].condition}
                            </div>
                            <div className="text-sm text-blue-700">
                              {featuredWeather['Glacier National Park'].description}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-blue-600">
                          <div>💧 {featuredWeather['Glacier National Park'].humidity}% humidity</div>
                          <div>💨 {featuredWeather['Glacier National Park'].windSpeed} mph wind</div>
                        </div>
                      </div>
                    </div>
                  )}
                  <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                    View Details
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800&h=600&fit=crop"
                    alt="Grand Canyon National Park"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center"><span class="text-white text-6xl">🏕️</span></div>';
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Grand Canyon National Park
                  </h3>
                  <p className="text-gray-600 mb-4">
                    One of the world's most spectacular natural wonders with incredible hiking opportunities.
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                      <span className="ml-2 text-sm text-gray-600">(4.9)</span>
                    </div>
                    <span className="text-green-600 font-medium">$25/night</span>
                  </div>
                  
                  {/* Weather for Grand Canyon */}
                  {featuredWeather['Grand Canyon National Park'] && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{featuredWeather['Grand Canyon National Park'].icon}</span>
                          <div>
                            <div className="font-medium text-blue-900">
                              {featuredWeather['Grand Canyon National Park'].temperature}°F {featuredWeather['Grand Canyon National Park'].condition}
                            </div>
                            <div className="text-sm text-blue-700">
                              {featuredWeather['Grand Canyon National Park'].description}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-blue-600">
                          <div>💧 {featuredWeather['Grand Canyon National Park'].humidity}% humidity</div>
                          <div>💨 {featuredWeather['Grand Canyon National Park'].windSpeed} mph wind</div>
                        </div>
                      </div>
                    </div>
                  )}
                  <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Why Choose OutdoorSpot?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Curated Locations
              </h3>
              <p className="text-gray-600">
                Hand-picked camping spots and outdoor destinations with verified information and reviews.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Smart Search
              </h3>
              <p className="text-gray-600">
                Find the perfect spot with our advanced filtering by activities, location, and preferences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Trusted Reviews
              </h3>
              <p className="text-gray-600">
                Real experiences from fellow adventurers to help you plan your perfect outdoor getaway.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-green-400 mb-4">🏕️ OutdoorSpot</div>
              <p className="text-gray-400">
                Your gateway to amazing outdoor adventures and unforgettable camping experiences.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Explore</h4>
              <ul className="space-y-2">
                <li><a href="/locations" className="text-gray-400 hover:text-white">Locations</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Activities</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Events</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Reviews</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Account</h4>
              <ul className="space-y-2">
                <li><a href="/auth/login" className="text-gray-400 hover:text-white">Sign In</a></li>
                <li><a href="/auth/register" className="text-gray-400 hover:text-white">Sign Up</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">My Trips</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Favorites</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Safety Tips</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Community</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 OutdoorSpot. All rights reserved. | Made with ❤️ for outdoor enthusiasts.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}