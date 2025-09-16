interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

// Mock weather data for different locations
// In a real app, you'd use a weather API like OpenWeatherMap
const mockWeatherData: Record<string, WeatherData> = {
  'Yosemite National Park': {
    temperature: 72,
    condition: 'Sunny',
    description: 'Clear skies with perfect visibility',
    humidity: 45,
    windSpeed: 8,
    icon: '☀️'
  },
  'Glacier National Park': {
    temperature: 58,
    condition: 'Partly Cloudy',
    description: 'Cool mountain air with scattered clouds',
    humidity: 62,
    windSpeed: 12,
    icon: '⛅'
  },
  'Grand Canyon National Park': {
    temperature: 85,
    condition: 'Hot',
    description: 'Very hot and dry conditions',
    humidity: 25,
    windSpeed: 6,
    icon: '🌡️'
  },
  'Rocky Mountain National Park': {
    temperature: 65,
    condition: 'Cloudy',
    description: 'Mountain weather with changing conditions',
    humidity: 55,
    windSpeed: 15,
    icon: '☁️'
  },
  'Lake Tahoe': {
    temperature: 68,
    condition: 'Clear',
    description: 'Perfect lake conditions',
    humidity: 48,
    windSpeed: 5,
    icon: '🌤️'
  },
  'Zion National Park': {
    temperature: 78,
    condition: 'Sunny',
    description: 'Warm and sunny desert conditions',
    humidity: 35,
    windSpeed: 7,
    icon: '☀️'
  },
  'Yellowstone National Park': {
    temperature: 52,
    condition: 'Rainy',
    description: 'Cool with light rain showers',
    humidity: 78,
    windSpeed: 10,
    icon: '🌧️'
  },
  'Acadia National Park': {
    temperature: 61,
    condition: 'Foggy',
    description: 'Coastal fog with cool temperatures',
    humidity: 85,
    windSpeed: 18,
    icon: '🌫️'
  },
  'Dinosaur Valley State Park': {
    temperature: 88,
    condition: 'Hot',
    description: 'Very hot Texas summer weather',
    humidity: 42,
    windSpeed: 9,
    icon: '🌡️'
  },
  'Cedar Hill State Park': {
    temperature: 91,
    condition: 'Hot',
    description: 'Hot and humid Texas weather',
    humidity: 65,
    windSpeed: 8,
    icon: '🌡️'
  },
  'Lake Mineral Wells State Park': {
    temperature: 86,
    condition: 'Sunny',
    description: 'Warm and sunny with good climbing conditions',
    humidity: 48,
    windSpeed: 11,
    icon: '☀️'
  },
  'Cleburne State Park': {
    temperature: 89,
    condition: 'Hot',
    description: 'Hot Texas weather, perfect for swimming',
    humidity: 58,
    windSpeed: 7,
    icon: '🌡️'
  },
  'Fort Worth Nature Center': {
    temperature: 92,
    condition: 'Hot',
    description: 'Urban heat with good wildlife viewing',
    humidity: 60,
    windSpeed: 6,
    icon: '🌡️'
  },
  'Eagle Mountain Lake': {
    temperature: 87,
    condition: 'Sunny',
    description: 'Perfect lake weather for water activities',
    humidity: 52,
    windSpeed: 10,
    icon: '☀️'
  },
  'Possum Kingdom State Park': {
    temperature: 84,
    condition: 'Clear',
    description: 'Ideal conditions for water sports and climbing',
    humidity: 45,
    windSpeed: 8,
    icon: '🌤️'
  }
};

export const getWeatherForLocation = async (locationName: string): Promise<WeatherData | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Return mock weather data for the location
  return mockWeatherData[locationName] || {
    temperature: 75,
    condition: 'Unknown',
    description: 'Weather data not available',
    humidity: 50,
    windSpeed: 8,
    icon: '❓'
  };
};

export const getWeatherForCoordinates = async (_lat: number, _lng: number): Promise<WeatherData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 150));
  
  // Mock weather based on coordinates
  // In a real app, you'd use coordinates to fetch from a weather API
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'];
  const icons = ['☀️', '⛅', '☁️', '🌧️'];
  const randomIndex = Math.floor(Math.random() * 4);
  
  return {
    temperature: Math.floor(Math.random() * 30) + 60, // 60-90°F
    condition: conditions[randomIndex] || 'Unknown',
    description: 'Current weather conditions',
    humidity: Math.floor(Math.random() * 40) + 30, // 30-70%
    windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 mph
    icon: icons[randomIndex] || '❓'
  };
};
