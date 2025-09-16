'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface Location {
  id: number;
  name: string;
  description: string;
  location: string;
  coordinates: { lat: number; lng: number };
  activities: string[];
  amenities: string[];
  rating: number;
  price: number;
  images: string[];
  availability: boolean;
  weather?: WeatherData;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');

  useEffect(() => {
    fetchLocations();
  }, [searchTerm, activityFilter, stateFilter]);

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('q', searchTerm);
      if (activityFilter) queryParams.append('activity', activityFilter);
      if (stateFilter) queryParams.append('state', stateFilter);

      const response = await fetch(`http://localhost:3001/api/search/locations?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLocations(data.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityClick = (activity: string) => {
    setActivityFilter(prev => (prev === activity ? '' : activity));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-green-600">🏕️ OutdoorSpot</Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/locations" className="text-green-600 font-medium">Locations</a>
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

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Amazing Locations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our curated collection of camping spots, hiking trails, and outdoor destinations. 
            Find your next adventure with detailed information, reviews, and photos.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <select 
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Activities</option>
              <option value="Camping">Camping</option>
              <option value="Hiking">Hiking</option>
              <option value="Mountain Biking">Mountain Biking</option>
              <option value="Kayaking">Kayaking</option>
              <option value="Photography">Photography</option>
              <option value="Rock Climbing">Rock Climbing</option>
              <option value="Wildlife Viewing">Wildlife Viewing</option>
              <option value="Fishing">Fishing</option>
              <option value="Boating">Boating</option>
              <option value="Swimming">Swimming</option>
              <option value="Fossil Hunting">Fossil Hunting</option>
              <option value="Scuba Diving">Scuba Diving</option>
            </select>
            <select 
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All States</option>
              <option value="California">California</option>
              <option value="Colorado">Colorado</option>
              <option value="Montana">Montana</option>
              <option value="Arizona">Arizona</option>
              <option value="Utah">Utah</option>
              <option value="Wyoming">Wyoming</option>
              <option value="Maine">Maine</option>
            </select>
            <button 
              onClick={fetchLocations}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              Search
            </button>
          </div>
        </div>

        {/* Activity Filter Tags */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {['Camping', 'Hiking', 'Mountain Biking', 'Kayaking', 'Photography', 'Rock Climbing', 'Wildlife Viewing', 'Fishing', 'Boating', 'Swimming', 'Fossil Hunting'].map((activity) => (
            <button
              key={activity}
              onClick={() => handleActivityClick(activity)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activityFilter === activity
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-300'
              }`}
            >
              {activity}
            </button>
          ))}
        </div>

        {/* Locations Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Error loading locations</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations.map((location) => (
              <div key={location.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
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
                  <p className="text-gray-600 mb-4">
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
        )}

        {!loading && !error && locations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No locations found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}