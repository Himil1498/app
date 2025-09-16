import { useState, useCallback, useRef, useEffect } from 'react';
import {
  calculateDistance,
  calculatePathDistance,
  calculatePolygonArea,
  formatDistance,
  formatArea,
  calculateBearing
} from '../utils/measurementUtils';

/**
 * Custom hook for managing distance and area measurements on Google Maps
 * @param {Object} map - Google Maps instance
 * @param {Object} options - Configuration options
 * @returns {Object} Measurement state and methods
 */
export default function useMeasurement(map, options = {}) {
  const {
    units = 'metric', // 'metric' or 'imperial'
    enableArea = true,
    enableDistance = true,
    strokeColor = '#FF0000',
    strokeOpacity = 0.8,
    strokeWeight = 3,
    fillColor = '#FF0000',
    fillOpacity = 0.15,
    onMeasurementChange = null
  } = options;

  // State
  const [isActive, setIsActive] = useState(false);
  const [measurementType, setMeasurementType] = useState('distance'); // 'distance', 'area'
  const [points, setPoints] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [area, setArea] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);

  // Refs
  const polylineRef = useRef(null);
  const polygonRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const clickListenerRef = useRef(null);
  const dblClickListenerRef = useRef(null);

  /**
   * Clear all measurements and visual elements
   */
  const clearMeasurements = useCallback(() => {
    // Clear polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // Clear polygon
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }

    // Clear markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Clear info window
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    // Reset state
    setPoints([]);
    setTotalDistance(0);
    setArea(0);
    setIsDrawing(false);
  }, []);

  /**
   * Create a marker at the specified position
   */
  const createMarker = useCallback((position, label, isStart = false) => {
    if (!map || !window.google) {
      console.log('Cannot create marker: map or google not available');
      return null;
    }

    const marker = new window.google.maps.Marker({
      position,
      map,
      title: label,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: isStart ? 8 : 6,
        fillColor: isStart ? '#00FF00' : strokeColor,
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2
      },
      zIndex: 1000
    });

    markersRef.current.push(marker);
    return marker;
  }, [map, strokeColor]);

  /**
   * Update polyline visualization
   */
  const updatePolyline = useCallback((pathPoints) => {
    if (!map || !window.google || pathPoints.length < 2) return;

    // Remove existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // Create new polyline
    polylineRef.current = new window.google.maps.Polyline({
      path: pathPoints,
      geodesic: true,
      strokeColor,
      strokeOpacity,
      strokeWeight,
      map
    });
    console.log('Polyline created with', pathPoints.length, 'points');
  }, [map, strokeColor, strokeOpacity, strokeWeight]);

  /**
   * Update polygon visualization
   */
  const updatePolygon = useCallback((pathPoints) => {
    if (!map || !window.google || pathPoints.length < 3) return;

    // Remove existing polygon
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }

    // Create new polygon
    polygonRef.current = new window.google.maps.Polygon({
      paths: pathPoints,
      geodesic: true,
      strokeColor,
      strokeOpacity,
      strokeWeight,
      fillColor,
      fillOpacity,
      map
    });
  }, [map, strokeColor, strokeOpacity, strokeWeight, fillColor, fillOpacity]);

  /**
   * Show info window with measurement results
   */
  const showInfoWindow = useCallback((position, content) => {
    if (!map || !window.google) return;

    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow();
    }

    infoWindowRef.current.setContent(content);
    infoWindowRef.current.setPosition(position);
    infoWindowRef.current.open(map);
  }, [map]);

  /**
   * Handle map click during measurement
   */
  const handleMapClick = useCallback((event) => {
    console.log('Map clicked, isActive:', isActive, 'event:', event);
    if (!isActive || !event.latLng) {
      console.log('Measurement not active or no latLng');
      return;
    }

    const clickedPoint = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    console.log('Adding point:', clickedPoint);

    setPoints(prevPoints => {
      const newPoints = [...prevPoints, clickedPoint];
      
      // Update measurements
      if (measurementType === 'distance') {
        const distance = calculatePathDistance(newPoints);
        setTotalDistance(distance);
        
        // Create markers
        if (newPoints.length === 1) {
          createMarker(clickedPoint, 'Start', true);
        } else {
          createMarker(clickedPoint, `Point ${newPoints.length}`);
          updatePolyline(newPoints);
        }

        // Show measurement info
        if (newPoints.length >= 2) {
          const lastSegmentDistance = calculateDistance(
            newPoints[newPoints.length - 2],
            newPoints[newPoints.length - 1]
          );
          
          const bearing = calculateBearing(
            newPoints[newPoints.length - 2],
            clickedPoint
          );

          const content = `
            <div style="min-width: 200px;">
              <strong>Distance Measurement</strong><br/>
              <div style="margin-top: 8px;">
                <div>Segment: ${formatDistance(lastSegmentDistance, units)}</div>
                <div>Total: ${formatDistance(distance, units)}</div>
                <div>Bearing: ${bearing}</div>
              </div>
              <div style="margin-top: 8px; font-size: 12px; color: #666;">
                Click to continue, double-click to finish
              </div>
            </div>
          `;
          
          showInfoWindow(clickedPoint, content);
        }
      } else if (measurementType === 'area' && enableArea) {
        // Create markers
        createMarker(clickedPoint, `Point ${newPoints.length}`);
        
        if (newPoints.length >= 2) {
          updatePolyline(newPoints);
        }
        
        if (newPoints.length >= 3) {
          updatePolygon(newPoints);
          const calculatedArea = calculatePolygonArea(newPoints);
          setArea(calculatedArea);

          const content = `
            <div style="min-width: 200px;">
              <strong>Area Measurement</strong><br/>
              <div style="margin-top: 8px;">
                <div>Area: ${formatArea(calculatedArea, units)}</div>
                <div>Perimeter: ${formatDistance(calculatePathDistance([...newPoints, newPoints[0]]), units)}</div>
                <div>Points: ${newPoints.length}</div>
              </div>
              <div style="margin-top: 8px; font-size: 12px; color: #666;">
                Click to continue, double-click to finish
              </div>
            </div>
          `;
          
          showInfoWindow(clickedPoint, content);
        }
      }

      // Call callback if provided
      if (onMeasurementChange) {
        onMeasurementChange({
          type: measurementType,
          points: newPoints,
          distance: measurementType === 'distance' ? calculatePathDistance(newPoints) : 0,
          area: measurementType === 'area' ? calculatePolygonArea(newPoints) : 0,
          formattedDistance: formatDistance(calculatePathDistance(newPoints), units),
          formattedArea: formatArea(calculatePolygonArea(newPoints), units)
        });
      }

      return newPoints;
    });
  }, [isActive, measurementType, units, enableArea, onMeasurementChange, createMarker, updatePolyline, updatePolygon, showInfoWindow]);

  /**
   * Handle double-click to finish measurement
   */
  const handleDoubleClick = useCallback((event) => {
    console.log('Double-click detected, isActive:', isActive);
    if (!isActive) return;
    
    // Prevent the last click from being processed
    if (event && event.stop) {
      event.stop();
    }
    
    // Finish the measurement
    setIsDrawing(false);
    
    // Show final results
    if (points.length > 0) {
      const lastPoint = points[points.length - 1];
      let content = '';
      
      if (measurementType === 'distance') {
        const distance = calculatePathDistance(points);
        content = `
          <div style="min-width: 200px;">
            <strong>Final Distance</strong><br/>
            <div style="margin-top: 8px;">
              <div style="font-size: 16px; color: #2196F3; font-weight: bold;">
                ${formatDistance(distance, units)}
              </div>
              <div style="margin-top: 4px;">
                Segments: ${points.length - 1}
              </div>
            </div>
          </div>
        `;
      } else if (measurementType === 'area') {
        const calculatedArea = calculatePolygonArea(points);
        content = `
          <div style="min-width: 200px;">
            <strong>Final Area</strong><br/>
            <div style="margin-top: 8px;">
              <div style="font-size: 16px; color: #4CAF50; font-weight: bold;">
                ${formatArea(calculatedArea, units)}
              </div>
              <div style="margin-top: 4px;">
                Perimeter: ${formatDistance(calculatePathDistance([...points, points[0]]), units)}
              </div>
            </div>
          </div>
        `;
      }
      
      showInfoWindow(lastPoint, content);
    }
  }, [isActive, measurementType, points, showInfoWindow, units]);

  /**
   * Start measurement mode
   */
  const startMeasurement = useCallback((type = 'distance') => {
    console.log('Starting measurement:', type, 'map:', map, 'window.google:', window.google);
    if (!map) {
      console.log('No map available for measurement');
      return;
    }
    if (!window.google || !window.google.maps) {
      console.log('Google Maps API not available');
      return;
    }
    console.log('Map and Google API are ready, proceeding with measurement setup');

    clearMeasurements();
    setMeasurementType(type);
    setIsActive(true);
    setIsDrawing(true);

    // Remove existing listeners
    if (clickListenerRef.current && window.google) {
      window.google.maps.event.removeListener(clickListenerRef.current);
    }
    if (dblClickListenerRef.current && window.google) {
      window.google.maps.event.removeListener(dblClickListenerRef.current);
    }
    
    // Add click listener
    clickListenerRef.current = map.addListener('click', handleMapClick);
    console.log('Click listener added:', clickListenerRef.current);
    
    // Add double-click listener
    dblClickListenerRef.current = map.addListener('dblclick', handleDoubleClick);
    console.log('Double-click listener added:', dblClickListenerRef.current);

    // Change cursor
    map.setOptions({ draggableCursor: 'crosshair' });
    console.log('Measurement mode activated');
  }, [map, clearMeasurements, handleMapClick, handleDoubleClick]);

  /**
   * Stop measurement mode
   */
  const stopMeasurement = useCallback(() => {
    console.log('Stopping measurement');
    setIsActive(false);
    setIsDrawing(false);

    // Remove click listener
    if (clickListenerRef.current && window.google) {
      window.google.maps.event.removeListener(clickListenerRef.current);
      clickListenerRef.current = null;
    }
    
    // Remove double-click listener
    if (dblClickListenerRef.current && window.google) {
      window.google.maps.event.removeListener(dblClickListenerRef.current);
      dblClickListenerRef.current = null;
    }

    // Reset cursor
    if (map) {
      map.setOptions({ draggableCursor: null });
    }
  }, [map]);

  /**
   * Toggle measurement mode
   */
  const toggleMeasurement = useCallback((type = 'distance') => {
    if (isActive) {
      stopMeasurement();
    } else {
      startMeasurement(type);
    }
  }, [isActive, startMeasurement, stopMeasurement]);

  /**
   * Get current measurement results
   */
  const getMeasurementResults = useCallback(() => {
    return {
      type: measurementType,
      points,
      distance: totalDistance,
      area,
      formattedDistance: formatDistance(totalDistance, units),
      formattedArea: formatArea(area, units),
      isActive,
      isDrawing,
      pointCount: points.length
    };
  }, [measurementType, points, totalDistance, area, units, isActive, isDrawing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMeasurements();
      stopMeasurement();
    };
  }, [clearMeasurements, stopMeasurement]);

  return {
    // State
    isActive,
    isDrawing,
    measurementType,
    points,
    totalDistance,
    area,

    // Methods
    startMeasurement,
    stopMeasurement,
    toggleMeasurement,
    clearMeasurements,
    getMeasurementResults,

    // Formatted values
    formattedDistance: formatDistance(totalDistance, units),
    formattedArea: formatArea(area, units)
  };
}
