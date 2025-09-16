/**
 * Utility functions for distance and area measurements on Google Maps
 */

/**
 * Calculate distance between two points using Haversine formula
 * @param {Object} point1 - {lat, lng}
 * @param {Object} point2 - {lat, lng}
 * @returns {number} Distance in meters
 */
export function calculateDistance(point1, point2) {
  const R = 6371000; // Earth's radius in meters
  const lat1Rad = (point1.lat * Math.PI) / 180;
  const lat2Rad = (point2.lat * Math.PI) / 180;
  const deltaLatRad = ((point2.lat - point1.lat) * Math.PI) / 180;
  const deltaLngRad = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLngRad / 2) *
      Math.sin(deltaLngRad / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate total distance for a path of points
 * @param {Array} points - Array of {lat, lng} objects
 * @returns {number} Total distance in meters
 */
export function calculatePathDistance(points) {
  if (points.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 1; i < points.length; i++) {
    totalDistance += calculateDistance(points[i - 1], points[i]);
  }
  return totalDistance;
}

/**
 * Calculate area of a polygon using the shoelace formula
 * @param {Array} points - Array of {lat, lng} objects forming a closed polygon
 * @returns {number} Area in square meters
 */
export function calculatePolygonArea(points) {
  if (points.length < 3) return 0;

  // Convert to Cartesian coordinates for more accurate area calculation
  const R = 6371000; // Earth's radius in meters
  
  // Close the polygon if not already closed
  const closedPoints = [...points];
  if (points[0].lat !== points[points.length - 1].lat || 
      points[0].lng !== points[points.length - 1].lng) {
    closedPoints.push(points[0]);
  }

  let area = 0;
  for (let i = 0; i < closedPoints.length - 1; i++) {
    const lat1 = (closedPoints[i].lat * Math.PI) / 180;
    const lng1 = (closedPoints[i].lng * Math.PI) / 180;
    const lat2 = (closedPoints[i + 1].lat * Math.PI) / 180;
    const lng2 = (closedPoints[i + 1].lng * Math.PI) / 180;

    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs(area * R * R / 2);
  return area;
}

/**
 * Format distance with appropriate units
 * @param {number} distanceInMeters - Distance in meters
 * @param {string} unit - 'metric' or 'imperial'
 * @returns {string} Formatted distance string
 */
export function formatDistance(distanceInMeters, unit = 'metric') {
  if (unit === 'imperial') {
    const feet = distanceInMeters * 3.28084;
    const miles = feet / 5280;
    
    if (miles >= 1) {
      return `${miles.toFixed(2)} mi`;
    } else if (feet >= 100) {
      return `${feet.toFixed(0)} ft`;
    } else {
      return `${feet.toFixed(1)} ft`;
    }
  } else {
    // Metric
    if (distanceInMeters >= 1000) {
      const km = distanceInMeters / 1000;
      return `${km.toFixed(2)} km`;
    } else if (distanceInMeters >= 1) {
      return `${distanceInMeters.toFixed(1)} m`;
    } else {
      const cm = distanceInMeters * 100;
      return `${cm.toFixed(0)} cm`;
    }
  }
}

/**
 * Format area with appropriate units
 * @param {number} areaInSquareMeters - Area in square meters
 * @param {string} unit - 'metric' or 'imperial'
 * @returns {string} Formatted area string
 */
export function formatArea(areaInSquareMeters, unit = 'metric') {
  if (unit === 'imperial') {
    const squareFeet = areaInSquareMeters * 10.7639;
    const acres = squareFeet / 43560;
    const squareMiles = acres / 640;
    
    if (squareMiles >= 1) {
      return `${squareMiles.toFixed(2)} sq mi`;
    } else if (acres >= 1) {
      return `${acres.toFixed(2)} acres`;
    } else {
      return `${squareFeet.toFixed(0)} sq ft`;
    }
  } else {
    // Metric
    if (areaInSquareMeters >= 1000000) {
      const squareKm = areaInSquareMeters / 1000000;
      return `${squareKm.toFixed(2)} km²`;
    } else if (areaInSquareMeters >= 10000) {
      const hectares = areaInSquareMeters / 10000;
      return `${hectares.toFixed(2)} ha`;
    } else {
      return `${areaInSquareMeters.toFixed(1)} m²`;
    }
  }
}

/**
 * Create a bearing string between two points
 * @param {Object} point1 - Starting point {lat, lng}
 * @param {Object} point2 - End point {lat, lng}
 * @returns {string} Bearing string (e.g., "N 45° E")
 */
export function calculateBearing(point1, point2) {
  const lat1 = (point1.lat * Math.PI) / 180;
  const lat2 = (point2.lat * Math.PI) / 180;
  const deltaLng = ((point2.lng - point1.lng) * Math.PI) / 180;

  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

  let bearing = Math.atan2(y, x);
  bearing = (bearing * 180) / Math.PI;
  bearing = (bearing + 360) % 360;

  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(bearing / 22.5) % 16;
  
  return `${directions[index]} ${Math.round(bearing)}°`;
}

/**
 * Generate intermediate points along a path for smooth polyline rendering
 * @param {Object} start - Start point {lat, lng}
 * @param {Object} end - End point {lat, lng}
 * @param {number} segments - Number of segments to create
 * @returns {Array} Array of intermediate points
 */
export function interpolatePath(start, end, segments = 10) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const ratio = i / segments;
    const lat = start.lat + (end.lat - start.lat) * ratio;
    const lng = start.lng + (end.lng - start.lng) * ratio;
    points.push({ lat, lng });
  }
  return points;
}

/**
 * Check if a point is within a certain distance of a line segment
 * @param {Object} point - Point to check {lat, lng}
 * @param {Object} lineStart - Start of line segment {lat, lng}
 * @param {Object} lineEnd - End of line segment {lat, lng}
 * @param {number} threshold - Distance threshold in meters
 * @returns {boolean} True if point is within threshold distance
 */
export function isPointNearLine(point, lineStart, lineEnd, threshold = 10) {
  const distanceToStart = calculateDistance(point, lineStart);
  const distanceToEnd = calculateDistance(point, lineEnd);
  const lineLength = calculateDistance(lineStart, lineEnd);
  
  // Use triangle inequality to approximate distance to line
  const approximateDistance = Math.abs((distanceToStart + distanceToEnd) - lineLength) / 2;
  
  return approximateDistance <= threshold;
}

/**
 * Check if coordinates are within India boundaries
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} True if within India boundaries
 */
export function isInIndia(lat, lng) {
  return lat >= 6.7 && lat <= 37.1 && lng >= 68.1 && lng <= 97.4;
}

/**
 * Create a measurement marker on the map
 * @param {Object} map - Google Maps instance
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {boolean} isStart - Whether this is the start marker
 * @param {Array} markersArray - Array of existing markers for counting
 * @returns {Object|null} Google Maps Marker instance or null
 */
export function createMeasurementMarker(map, lat, lng, isStart = false, markersArray = []) {
  if (!map || !window.google) {
    console.error('❌ Map or Google Maps not available');
    return null;
  }

  try {
    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map: map,
      title: isStart ? 'Start Point' : `Point ${markersArray.length + 1}`,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: isStart ? 10 : 7,
        fillColor: isStart ? '#4CAF50' : '#FF5722',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
      },
      zIndex: 1000,
    });

    console.log(`📍 Measurement marker created at: ${lat}, ${lng}`);
    return marker;
  } catch (error) {
    console.error('❌ Error creating measurement marker:', error);
    return null;
  }
}

/**
 * Create a measurement polyline connecting points
 * @param {Object} map - Google Maps instance
 * @param {Array} pointsArray - Array of {lat, lng} objects
 * @param {Object} existingPolyline - Existing polyline to replace
 * @returns {Object|null} Google Maps Polyline instance or null
 */
export function createMeasurementPolyline(map, pointsArray, existingPolyline = null) {
  if (!map || !window.google || pointsArray.length < 2) return null;

  try {
    // Remove existing polyline
    if (existingPolyline) {
      existingPolyline.setMap(null);
    }

    // Create new polyline
    const polyline = new window.google.maps.Polyline({
      path: pointsArray,
      geodesic: true,
      strokeColor: '#FF5722',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map: map,
    });

    console.log(`📏 Measurement polyline created with ${pointsArray.length} points`);
    return polyline;
  } catch (error) {
    console.error('❌ Error creating measurement polyline:', error);
    return null;
  }
}

/**
 * Clear all measurement objects from the map
 * @param {Array} markers - Array of marker objects to clear
 * @param {Object} polyline - Polyline object to clear
 * @returns {Object} Object with cleared arrays
 */
export function clearMeasurementObjects(markers = [], polyline = null) {
  console.log('🧹 Clearing measurement objects...');
  
  // Clear markers
  markers.forEach(marker => {
    if (marker && marker.setMap) {
      marker.setMap(null);
    }
  });

  // Clear polyline
  if (polyline && polyline.setMap) {
    polyline.setMap(null);
  }

  console.log('✅ Measurement objects cleared');
  return { markers: [], polyline: null };
}

/**
 * Measurement manager class for handling measurement state
 * Provides a complete interface for distance measurement functionality
 */
export class MeasurementManager {
  constructor(map, options = {}) {
    this.map = map;
    this.markers = [];
    this.polyline = null;
    this.points = [];
    this.totalDistance = 0;
    this.isActive = false;
    this.listener = null;
    this.onPointAdded = options.onPointAdded || (() => {});
    this.onMeasurementComplete = options.onMeasurementComplete || (() => {});
    this.onError = options.onError || (() => {});
  }

  /**
   * Start measurement mode
   * @returns {boolean} Success status
   */
  startMeasurement() {
    if (!this.map || !window.google) {
      this.onError('Map or Google Maps API not available');
      return false;
    }

    console.log('🎯 Starting measurement...');
    this.clearMeasurements();
    this.isActive = true;

    // Remove existing listener
    if (this.listener) {
      window.google.maps.event.removeListener(this.listener);
    }

    // Add click listener
    this.listener = window.google.maps.event.addListener(
      this.map,
      'click',
      (event) => this.handleMapClick(event)
    );

    // Change cursor
    this.map.setOptions({ draggableCursor: 'crosshair' });

    console.log('✅ Measurement started');
    return true;
  }

  /**
   * Stop measurement mode
   */
  stopMeasurement() {
    console.log('⏹️ Stopping measurement...');
    
    this.isActive = false;

    // Remove click listener
    if (this.listener && window.google) {
      window.google.maps.event.removeListener(this.listener);
      this.listener = null;
    }

    // Reset cursor
    if (this.map) {
      this.map.setOptions({ draggableCursor: null });
    }

    if (this.points.length > 0) {
      this.onMeasurementComplete(this.totalDistance, this.points);
    }

    console.log('✅ Measurement stopped');
  }

  /**
   * Handle map click during measurement
   * @param {Object} event - Google Maps click event
   */
  handleMapClick(event) {
    if (!this.isActive || !event.latLng) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    console.log(`📍 Measurement click at: ${lat}, ${lng}`);

    // Check India boundaries
    if (!isInIndia(lat, lng)) {
      this.onError('⚠️ Point must be within India boundaries');
      return;
    }

    // Add point
    const newPoint = { lat, lng };
    this.points.push(newPoint);

    // Add marker
    const isFirstPoint = this.points.length === 1;
    const marker = createMeasurementMarker(this.map, lat, lng, isFirstPoint, this.markers);
    if (marker) {
      this.markers.push(marker);
    }

    // Update polyline
    if (this.points.length >= 2) {
      this.polyline = createMeasurementPolyline(this.map, this.points, this.polyline);
    }

    // Calculate distance
    this.totalDistance = calculatePathDistance(this.points);

    // Notify listeners
    this.onPointAdded({
      point: newPoint,
      pointCount: this.points.length,
      totalDistance: this.totalDistance,
      formattedDistance: formatDistance(this.totalDistance)
    });

    console.log(`✅ Point added. Total: ${this.points.length}, Distance: ${formatDistance(this.totalDistance)}`);
  }

  /**
   * Clear all measurements
   */
  clearMeasurements() {
    const cleared = clearMeasurementObjects(this.markers, this.polyline);
    this.markers = cleared.markers;
    this.polyline = cleared.polyline;
    this.points = [];
    this.totalDistance = 0;
  }

  /**
   * Get current measurement state
   * @returns {Object} Current measurement state
   */
  getMeasurementState() {
    return {
      isActive: this.isActive,
      points: [...this.points],
      totalDistance: this.totalDistance,
      formattedDistance: formatDistance(this.totalDistance),
      pointCount: this.points.length
    };
  }

  /**
   * Clean up and destroy the measurement manager
   */
  destroy() {
    this.stopMeasurement();
    this.clearMeasurements();
  }
}
