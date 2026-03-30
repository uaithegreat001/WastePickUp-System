// Geocoding service using OpenStreetMap Nominatim API

const CACHE_KEY = "geocoding_cache";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

// Get cached coordinates
const getCachedCoordinates = (location) => {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    const cached = cache[location];
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      return cached.coords;
    }

    if (cached) {
      delete cache[location];
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
  } catch (error) {
    console.error("Error reading geocoding cache:", error);
  }
  return null;
};

// Cache coordinates
const cacheCoordinates = (location, coords) => {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    cache[location] = {
      coords,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Error caching geocoding result:", error);
  }
};

// Geocode a location to coordinates
export const geocodeLocation = async (location) => {
  if (!location || typeof location !== "string") {
    throw new Error("Invalid location provided");
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
          "User-Agent": "WastePickupSystem/1.0",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      throw new Error("Location not found");
    }

    const coords = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

    // Cache the result
    cacheCoordinates(location, coords);

    return coords;
  } catch (error) {
    console.error("Geocoding error:", error);
    throw error;
  }
};

// Reverse geocode coordinates to an address
export const reverseGeocode = async (lat, lng) => {
  if (lat === undefined || lng === undefined) {
    throw new Error("Invalid coordinates provided");
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "WastePickupSystem/1.0",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract readable address parts
    const addr = data.address;
    const houseNumber = addr.house_number || "";
    const road = addr.road || addr.suburb || addr.neighbourhood || "";
    const city = addr.city || addr.town || addr.village || addr.county || "";
    const state = addr.state || "";

    // Construct a cleaner address for the input field
    // We prioritize house number, road, and city
    const cleanerAddress = [houseNumber, road, city].filter(Boolean).join(", ");

    return {
      displayAddress: data.display_name,
      lga: addr.county || addr.suburb || addr.city_district || "",
      address: cleanerAddress || road || data.display_name,
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
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
