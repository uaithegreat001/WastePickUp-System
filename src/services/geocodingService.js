// Geocoding service using OpenStreetMap Nominatim API

const CACHE_KEY = 'geocoding_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; 

// Get cached coordinates
const getCachedCoordinates = (location) => {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    const cached = cache[location];
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      return cached.coords;
    }
    
    if (cached) {
      delete cache[location];
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
  } catch (error) {
    console.error('Error reading geocoding cache:', error);
  }
  return null;
};

// Cache coordinates
const cacheCoordinates = (location, coords) => {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    cache[location] = {
      coords,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error caching geocoding result:', error);
  }
};

// Geocode a location to coordinates
export const geocodeLocation = async (location) => {
  if (!location || typeof location !== 'string') {
    throw new Error('Invalid location provided');
  }

  // Check cache first
  const cached = getCachedCoordinates(location);
  if (cached) {
    return cached;
  }

  try {
    // Use Nominatim API (OpenStreetMap)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
      {
        headers: {
          'User-Agent': 'WastePickupSystem/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      throw new Error('Location not found');
    }

    const coords = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };

    // Cache the result
    cacheCoordinates(location, coords);

    return coords;
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

// Batch geocode multiple locations
export const geocodeLocations = async (locations) => {
  const results = {};
  const promises = locations.map(async (location) => {
    try {
      const coords = await geocodeLocation(location);
      results[location] = coords;
    } catch (error) {
      console.error(`Failed to geocode ${location}:`, error);
      // use default coordinates for Kano if geocoding fails
      results[location] = { lat: 12.0022, lng: 8.5919 };
    }
  });

  await Promise.all(promises);
  return results;
};