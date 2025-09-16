/**
 * India States Boundary Utilities
 * Handles loading and processing of India state boundary data from GeoJSON
 */

let statesData = null;
let statesPolygons = null;

/**
 * Load India states boundary data from public/india.json
 */
export const loadIndiaStatesData = async () => {
  if (statesData) {
    return statesData;
  }

  try {
    const response = await fetch('/india.json');
    if (!response.ok) {
      throw new Error(`Failed to load states data: ${response.statusText}`);
    }
    
    statesData = await response.json();
    console.log('✅ India states boundary data loaded successfully');
    return statesData;
  } catch (error) {
    console.error('❌ Error loading India states data:', error);
    throw error;
  }
};

/**
 * Get all available state names from the loaded data
 */
export const getAvailableStates = async () => {
  const data = await loadIndiaStatesData();
  return data.features.map(feature => feature.properties.st_nm).sort();
};

/**
 * Get state boundary data by state name
 */
export const getStateBoundary = async (stateName) => {
  const data = await loadIndiaStatesData();
  const normalizedSearch = normalizeStateName(stateName);
  const feature = data.features.find(f => 
    normalizeStateName(f.properties.st_nm) === normalizedSearch
  );
  
  if (!feature) {
    throw new Error(`State not found: ${stateName}`);
  }
  
  return feature;
};

/**
 * Convert GeoJSON coordinates to Google Maps polygon paths
 * Handles both Polygon and MultiPolygon geometries
 */
export const convertGeoJSONToGoogleMaps = (geometry) => {
  const paths = [];
  
  if (geometry.type === 'Polygon') {
    // Single polygon - take the outer ring (first array)
    const outerRing = geometry.coordinates[0];
    paths.push(outerRing.map(coord => ({
      lat: coord[1], // GeoJSON is [lng, lat], Google Maps is {lat, lng}
      lng: coord[0]
    })));
  } else if (geometry.type === 'MultiPolygon') {
    // Multiple polygons - process each one
    geometry.coordinates.forEach(polygon => {
      const outerRing = polygon[0]; // Take outer ring of each polygon
      paths.push(outerRing.map(coord => ({
        lat: coord[1],
        lng: coord[0]
      })));
    });
  }
  
  return paths;
};

/**
 * Create Google Maps polygon objects for a state
 */
export const createStatePolygons = async (stateName, map, options = {}) => {
  try {
    const stateFeature = await getStateBoundary(stateName);
    const paths = convertGeoJSONToGoogleMaps(stateFeature.geometry);
    
    const defaultOptions = {
      strokeColor: '#1976D2',
      strokeOpacity: 0.9,
      strokeWeight: 2,
      fillColor: '#1976D2',
      fillOpacity: 0.08,
      zIndex: 10,
      map: map,
    };
    
    const polygonOptions = { ...defaultOptions, ...options };
    
    // Create polygon objects for each path
    const polygons = paths.map(path => 
      new window.google.maps.Polygon({
        ...polygonOptions,
        paths: path
      })
    );
    
    return {
      polygons,
      paths,
      bounds: calculateStateBounds(paths),
      stateName: stateFeature.properties.st_nm
    };
  } catch (error) {
    console.error(`❌ Error creating polygons for ${stateName}:`, error);
    throw error;
  }
};

/**
 * Calculate bounding box for state paths
 */
export const calculateStateBounds = (paths) => {
  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;
  
  paths.forEach(path => {
    path.forEach(point => {
      minLat = Math.min(minLat, point.lat);
      maxLat = Math.max(maxLat, point.lat);
      minLng = Math.min(minLng, point.lng);
      maxLng = Math.max(maxLng, point.lng);
    });
  });
  
  return {
    north: maxLat,
    south: minLat,
    east: maxLng,
    west: minLng
  };
};

/**
 * Check if a point is inside any of the state polygons
 */
export const isPointInState = async (lat, lng, stateName) => {
  try {
    const stateFeature = await getStateBoundary(stateName);
    const paths = convertGeoJSONToGoogleMaps(stateFeature.geometry);
    
    // Use Google Maps geometry library if available
    if (window.google?.maps?.geometry?.poly) {
      const point = new window.google.maps.LatLng(lat, lng);
      
      for (const path of paths) {
        const polygon = new window.google.maps.Polygon({ paths: path });
        if (window.google.maps.geometry.poly.containsLocation(point, polygon)) {
          return true;
        }
      }
      return false;
    } else {
      // Fallback to ray casting algorithm
      return paths.some(path => pointInPolygon({ lat, lng }, path));
    }
  } catch (error) {
    console.error(`❌ Error checking point in state ${stateName}:`, error);
    return false;
  }
};

/**
 * Ray casting algorithm for point-in-polygon test (fallback)
 */
const pointInPolygon = (point, polygon) => {
  const { lat, lng } = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    
    if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
};

/**
 * Get region data for user assignment (normalized format)
 */
export const getRegionDataForAssignment = async (stateNames) => {
  const regions = [];
  
  for (const stateName of stateNames) {
    try {
      const stateFeature = await getStateBoundary(stateName);
      const paths = convertGeoJSONToGoogleMaps(stateFeature.geometry);
      const bounds = calculateStateBounds(paths);
      
      regions.push({
        id: stateName.toLowerCase().replace(/\s+/g, '-'),
        name: stateFeature.properties.st_nm,
        polygonPaths: paths.length === 1 ? paths[0] : paths, // Flatten if single polygon
        bounds: [
          [bounds.south, bounds.west],
          [bounds.north, bounds.east]
        ],
        type: stateFeature.geometry.type
      });
    } catch (error) {
      console.warn(`⚠️ Could not load region data for ${stateName}:`, error);
    }
  }
  
  return regions;
};

/**
 * Create visual overlays for assigned regions on the map
 */
export const createRegionOverlays = async (regions, map, options = {}) => {
  const overlays = [];
  
  const defaultOptions = {
    strokeColor: '#1976D2',
    strokeOpacity: 0.9,
    strokeWeight: 2,
    fillColor: '#1976D2',
    fillOpacity: 0.08,
    zIndex: 10,
  };
  
  const overlayOptions = { ...defaultOptions, ...options };
  
  for (const region of regions) {
    try {
      if (region.id === 'bharat') {
        // Skip full India access - no overlay needed
        continue;
      }
      
      if (Array.isArray(region.polygonPaths) && region.polygonPaths.length > 0) {
        // Handle polygon paths
        if (Array.isArray(region.polygonPaths[0])) {
          // Multiple polygons (MultiPolygon)
          region.polygonPaths.forEach(path => {
            const polygon = new window.google.maps.Polygon({
              ...overlayOptions,
              paths: path,
              map: map,
            });
            overlays.push(polygon);
          });
        } else {
          // Single polygon
          const polygon = new window.google.maps.Polygon({
            ...overlayOptions,
            paths: region.polygonPaths,
            map: map,
          });
          overlays.push(polygon);
        }
      } else if (Array.isArray(region.bounds) && region.bounds.length === 2) {
        // Handle rectangular bounds
        const [[lat1, lng1], [lat2, lng2]] = region.bounds;
        const rectangle = new window.google.maps.Rectangle({
          ...overlayOptions,
          bounds: {
            north: Math.max(lat1, lat2),
            south: Math.min(lat1, lat2),
            east: Math.max(lng1, lng2),
            west: Math.min(lng1, lng2),
          },
          map: map,
        });
        overlays.push(rectangle);
      }
    } catch (error) {
      console.error(`❌ Error creating overlay for region ${region.name}:`, error);
    }
  }
  
  return overlays;
};

/**
 * Check if a coordinate is accessible based on user's assigned regions
 */
export const isCoordinateAccessible = async (lat, lng, userRegions) => {
  if (!Array.isArray(userRegions) || userRegions.length === 0) {
    return false;
  }
  
  for (const region of userRegions) {
    try {
      // Full India access
      if (region.id === 'bharat') {
        return true;
      }
      
      // Check polygon paths
      if (Array.isArray(region.polygonPaths) && region.polygonPaths.length > 0) {
        // Always use fallback ray casting for reliability
        if (Array.isArray(region.polygonPaths[0])) {
          // Multiple polygons
          for (const path of region.polygonPaths) {
            if (pointInPolygon({ lat, lng }, path)) {
              return true;
            }
          }
        } else {
          // Single polygon
          if (pointInPolygon({ lat, lng }, region.polygonPaths)) {
            return true;
          }
        }
      }
      
      // Check rectangular bounds
      if (Array.isArray(region.bounds) && region.bounds.length === 2) {
        const [[lat1, lng1], [lat2, lng2]] = region.bounds;
        const minLat = Math.min(lat1, lat2);
        const maxLat = Math.max(lat1, lat2);
        const minLng = Math.min(lng1, lng2);
        const maxLng = Math.max(lng1, lng2);
        
        if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
          return true;
        }
      }
    } catch (error) {
      console.warn(`⚠️ Error checking access for region ${region.name}:`, error);
    }
  }
  
  return false;
};

/**
 * Normalize state names for consistent matching
 */
export const normalizeStateName = (stateName) => {
  return stateName
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/&/g, 'and')
    .trim();
};

/**
 * Find state by various name formats
 */
export const findStateByName = async (searchName) => {
  const data = await loadIndiaStatesData();
  const normalized = normalizeStateName(searchName);
  
  return data.features.find(feature => {
    const stateName = normalizeStateName(feature.properties.st_nm);
    return stateName === normalized || 
           stateName.includes(normalized) || 
           normalized.includes(stateName);
  });
};

export default {
  loadIndiaStatesData,
  getAvailableStates,
  getStateBoundary,
  convertGeoJSONToGoogleMaps,
  createStatePolygons,
  calculateStateBounds,
  isPointInState,
  getRegionDataForAssignment,
  createRegionOverlays,
  isCoordinateAccessible,
  normalizeStateName,
  findStateByName
};