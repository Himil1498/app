// utils/mapUtils.js

/**
 * Map utilities for region-based functionality and auto-zoom
 */

// Default India center and zoom
export const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };
export const DEFAULT_ZOOM = 5;

// Region zoom levels
export const REGION_ZOOM_LEVELS = {
  'bharat': 5,      // Full India
  'maharashtra': 7,  // State level
  'gujarat': 7,      // State level
  'karnataka': 7,    // State level
  'rajasthan': 6,    // Large state
  'tamilnadu': 7,    // State level
};

/**
 * Calculate bounds for multiple regions
 * @param {Array} regions - Array of region objects with bounds
 * @returns {Object|null} - Combined bounds or null if no valid bounds
 */
export const calculateCombinedBounds = (regions = []) => {
  if (!regions || regions.length === 0) return null;

  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;
  let hasBounds = false;

  regions.forEach(region => {
    if (region.bounds && Array.isArray(region.bounds) && region.bounds.length === 2) {
      const [[lat1, lng1], [lat2, lng2]] = region.bounds;
      
      minLat = Math.min(minLat, lat1, lat2);
      maxLat = Math.max(maxLat, lat1, lat2);
      minLng = Math.min(minLng, lng1, lng2);
      maxLng = Math.max(maxLng, lng1, lng2);
      hasBounds = true;
    }
  });

  if (!hasBounds) return null;

  return {
    southwest: { lat: minLat, lng: minLng },
    northeast: { lat: maxLat, lng: maxLng },
    center: {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2
    }
  };
};

/**
 * Get map center and zoom for user regions
 * @param {Object} user - User object with regions
 * @returns {Object} - Map configuration with center, zoom, and bounds
 */
export const getMapConfigForUser = (user) => {
  if (!user || !user.regions || user.regions.length === 0) {
    return {
      center: INDIA_CENTER,
      zoom: DEFAULT_ZOOM,
      bounds: null,
      shouldFitBounds: false
    };
  }

  // Admin or users with Bharat access get full India view
  if (user.isAdmin || user.regions.some(r => r.id === 'bharat')) {
    return {
      center: INDIA_CENTER,
      zoom: DEFAULT_ZOOM,
      bounds: null,
      shouldFitBounds: false
    };
  }

  // Calculate bounds for user's regions
  const combinedBounds = calculateCombinedBounds(user.regions);
  
  if (combinedBounds) {
    return {
      center: combinedBounds.center,
      zoom: getOptimalZoom(user.regions),
      bounds: combinedBounds,
      shouldFitBounds: true
    };
  }

  // Fallback to India center
  return {
    center: INDIA_CENTER,
    zoom: DEFAULT_ZOOM,
    bounds: null,
    shouldFitBounds: false
  };
};

/**
 * Get optimal zoom level for regions
 * @param {Array} regions - Array of region objects
 * @returns {number} - Optimal zoom level
 */
export const getOptimalZoom = (regions = []) => {
  if (!regions || regions.length === 0) return DEFAULT_ZOOM;

  // If user has access to Bharat, use default zoom
  if (regions.some(r => r.id === 'bharat')) return DEFAULT_ZOOM;

  // For single region, use region-specific zoom
  if (regions.length === 1) {
    const regionZoom = REGION_ZOOM_LEVELS[regions[0].id];
    return regionZoom || 7;
  }

  // For multiple regions, calculate based on coverage area
  const bounds = calculateCombinedBounds(regions);
  if (!bounds) return DEFAULT_ZOOM;

  const latSpan = bounds.northeast.lat - bounds.southwest.lat;
  const lngSpan = bounds.northeast.lng - bounds.southwest.lng;
  const maxSpan = Math.max(latSpan, lngSpan);

  // Determine zoom based on span
  if (maxSpan > 20) return 4;      // Very large area
  if (maxSpan > 15) return 5;      // Large area
  if (maxSpan > 10) return 6;      // Medium-large area
  if (maxSpan > 5) return 7;       // State level
  if (maxSpan > 2) return 8;       // Regional level
  return 9;                        // City level or smaller
};

/**
 * Check if coordinates are within user's accessible regions
 * @param {Object} coordinates - {lat, lng} coordinates
 * @param {Object} user - User object with regions
 * @returns {boolean} - Whether coordinates are accessible
 */
export const isCoordinateAccessible = (coordinates, user) => {
  if (!user || !coordinates) return false;
  
  // Admin can access everywhere
  if (user.isAdmin) return true;
  
  // Users with Bharat access can access everywhere in India
  if (user.regions?.some(r => r.id === 'bharat')) return true;
  
  // Check if coordinates fall within any of user's regions
  return user.regions?.some(region => {
    if (!region.bounds) return false;
    
    const [[lat1, lng1], [lat2, lng2]] = region.bounds;
    const minLat = Math.min(lat1, lat2);
    const maxLat = Math.max(lat1, lat2);
    const minLng = Math.min(lng1, lng2);
    const maxLng = Math.max(lng1, lng2);
    
    return coordinates.lat >= minLat && 
           coordinates.lat <= maxLat && 
           coordinates.lng >= minLng && 
           coordinates.lng <= maxLng;
  }) || false;
};

/**
 * Get region name for coordinates
 * @param {Object} coordinates - {lat, lng} coordinates
 * @param {Array} allRegions - All available regions
 * @returns {string|null} - Region name or null
 */
export const getRegionForCoordinates = (coordinates, allRegions = []) => {
  if (!coordinates || !allRegions.length) return null;
  
  for (const region of allRegions) {
    if (!region.bounds) continue;
    
    const [[lat1, lng1], [lat2, lng2]] = region.bounds;
    const minLat = Math.min(lat1, lat2);
    const maxLat = Math.max(lat1, lat2);
    const minLng = Math.min(lng1, lng2);
    const maxLng = Math.max(lng1, lng2);
    
    if (coordinates.lat >= minLat && 
        coordinates.lat <= maxLat && 
        coordinates.lng >= minLng && 
        coordinates.lng <= maxLng) {
      return region.name;
    }
  }
  
  return null;
};

/**
 * Create Google Maps bounds object from coordinates
 * @param {Object} bounds - Bounds with southwest and northeast
 * @returns {google.maps.LatLngBounds|null} - Google Maps bounds object
 */
export const createGoogleMapsBounds = (bounds) => {
  if (!bounds || !bounds.southwest || !bounds.northeast) return null;
  
  try {
    const sw = new google.maps.LatLng(bounds.southwest.lat, bounds.southwest.lng);
    const ne = new google.maps.LatLng(bounds.northeast.lat, bounds.northeast.lng);
    return new google.maps.LatLngBounds(sw, ne);
  } catch (error) {
    console.warn('Failed to create Google Maps bounds:', error);
    return null;
  }
};

/**
 * Format region names for display
 * @param {Array} regions - Array of region objects
 * @returns {string} - Formatted string of region names
 */
export const formatRegionNames = (regions = []) => {
  if (!regions || regions.length === 0) return 'No regions assigned';
  
  if (regions.some(r => r.id === 'bharat')) return 'All India (Bharat)';
  
  const names = regions.map(region => region.name || region.id || 'Unknown').join(', ');
  return names.length > 50 ? names.substring(0, 47) + '...' : names;
};

/**
 * Get appropriate map type for region
 * @param {Array} regions - User's regions
 * @returns {string} - Google Maps map type
 */
export const getMapTypeForRegions = (regions = []) => {
  // For detailed regional views, use hybrid
  if (regions.length === 1 && regions[0].id !== 'bharat') {
    return 'hybrid';
  }
  
  // For broader views, use terrain
  return 'terrain';
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {Object} coord1 - {lat, lng}
 * @param {Object} coord2 - {lat, lng}
 * @returns {number} - Distance in kilometers
 */
export const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees
 * @returns {number} - Radians
 */
const toRadians = (degrees) => degrees * (Math.PI / 180);