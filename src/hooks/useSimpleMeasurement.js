import { useState, useCallback, useRef } from 'react';
import {
  calculatePathDistance,
  formatDistance,
} from '../utils/measurementUtils';

/**
 * Simplified measurement hook for distance measurement only
 * @param {Object} map - Google Maps instance
 * @returns {Object} Measurement state and methods
 */
export default function useSimpleMeasurement(map) {
  const [isActive, setIsActive] = useState(false);
  const [points, setPoints] = useState([]);
  const [distance, setDistance] = useState(0);
  
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const clickListenerRef = useRef(null);

  const clearAll = useCallback(() => {
    console.log('Clearing measurements...');
    
    // Clear markers
    markersRef.current.forEach(marker => {
      if (marker) marker.setMap(null);
    });
    markersRef.current = [];
    
    // Clear polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    
    // Reset state
    setPoints([]);
    setDistance(0);
  }, []);

  const addMarker = useCallback((position, isStart = false) => {
    if (!map || !window.google) return null;
    
    const marker = new window.google.maps.Marker({
      position,
      map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: isStart ? 8 : 6,
        fillColor: isStart ? '#00FF00' : '#FF5722',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2
      }
    });
    
    markersRef.current.push(marker);
    return marker;
  }, [map]);

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
      strokeColor: '#FF5722',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      map
    });
    
    console.log('Polyline updated with', pathPoints.length, 'points');
  }, [map]);

  const handleMapClick = useCallback((event) => {
    console.log('Map click detected, isActive:', isActive);
    
    if (!isActive || !event.latLng) {
      console.log('Not active or no latLng');
      return;
    }
    
    const newPoint = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    
    console.log('Adding point:', newPoint);
    
    setPoints(prevPoints => {
      const updatedPoints = [...prevPoints, newPoint];
      console.log('Updated points:', updatedPoints);
      
      // Add marker
      if (updatedPoints.length === 1) {
        addMarker(newPoint, true);
      } else {
        addMarker(newPoint, false);
        updatePolyline(updatedPoints);
      }
      
      // Calculate distance
      const newDistance = calculatePathDistance(updatedPoints);
      setDistance(newDistance);
      console.log('New distance:', formatDistance(newDistance));
      
      return updatedPoints;
    });
  }, [isActive, addMarker, updatePolyline]);

  const startMeasurement = useCallback(() => {
    console.log('Starting simple measurement, map:', map);
    
    if (!map || !window.google) {
      console.error('Map or Google Maps API not available');
      return;
    }
    
    clearAll();
    setIsActive(true);
    
    // Add click listener
    clickListenerRef.current = map.addListener('click', handleMapClick);
    console.log('Click listener added:', clickListenerRef.current);
    
    // Change cursor
    map.setOptions({ draggableCursor: 'crosshair' });
  }, [map, clearAll, handleMapClick]);

  const stopMeasurement = useCallback(() => {
    console.log('Stopping measurement');
    setIsActive(false);
    
    // Remove click listener
    if (clickListenerRef.current && window.google) {
      window.google.maps.event.removeListener(clickListenerRef.current);
      clickListenerRef.current = null;
    }
    
    // Reset cursor
    if (map) {
      map.setOptions({ draggableCursor: null });
    }
  }, [map]);

  return {
    isActive,
    points,
    distance,
    formattedDistance: formatDistance(distance),
    pointCount: points.length,
    startMeasurement,
    stopMeasurement,
    clearAll
  };
}
