import { useState, useEffect, useRef, useCallback } from 'react';
import { MeasurementManager } from '../utils/measurementUtils';

/**
 * Enhanced Google Maps hook with measurement capabilities
 * @param {Object} options Configuration options
 * @returns {Object} Map state and measurement functions
 */
export default function useGoogleMapsWithMeasurement(options = {}) {
  const {
    center = { lat: 20.5937, lng: 78.9629 }, // Center of India
    zoom = 5,
    onMapLoad = null,
    onMeasurementStart = null,
    onMeasurementComplete = null,
    onPointAdded = null,
    onError = null,
  } = options;

  // Map state
  const [map, setMap] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Measurement state
  const [measurementActive, setMeasurementActive] = useState(false);
  const [measurementPoints, setMeasurementPoints] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [formattedDistance, setFormattedDistance] = useState('0 m');

  // Refs
  const mapRef = useRef(null);
  const measurementManagerRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  // Get API key from environment
  const getApiKey = useCallback(() => {
    return import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
  }, []);

  // Load Google Maps script
  const loadGoogleMapsScript = useCallback(() => {
    if (scriptLoadedRef.current || window.google?.maps) {
      setIsScriptLoaded(true);
      return Promise.resolve();
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      const errorMsg = 'Google Maps API key not found in environment variables';
      setError(errorMsg);
      console.error('❌', errorMsg);
      return Promise.reject(errorMsg);
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,drawing&v=weekly`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('✅ Google Maps script loaded successfully');
        scriptLoadedRef.current = true;
        setIsScriptLoaded(true);
        resolve();
      };

      script.onerror = (err) => {
        const errorMsg = 'Failed to load Google Maps script';
        console.error('❌', errorMsg, err);
        setError(errorMsg);
        reject(err);
      };

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        if (window.google?.maps) {
          scriptLoadedRef.current = true;
          setIsScriptLoaded(true);
          resolve();
        } else {
          existingScript.onload = script.onload;
          existingScript.onerror = script.onerror;
        }
        return;
      }

      document.head.appendChild(script);
    });
  }, [getApiKey]);

  // Initialize Google Maps
  const initializeMap = useCallback((container) => {
    if (!container || !window.google?.maps) {
      console.warn('⚠️ Container or Google Maps API not available for map initialization');
      return null;
    }

    try {
      console.log('🗺️ Initializing Google Map...');
      
      const mapInstance = new window.google.maps.Map(container, {
        center,
        zoom,
        mapTypeId: window.google.maps.MapTypeId.HYBRID,
        gestureHandling: 'greedy',
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      console.log('✅ Google Map initialized successfully');
      
      // Initialize measurement manager
      measurementManagerRef.current = new MeasurementManager(mapInstance, {
        onPointAdded: (data) => {
          setMeasurementPoints(prev => [...prev, data.point]);
          setTotalDistance(data.totalDistance);
          setFormattedDistance(data.formattedDistance);
          onPointAdded && onPointAdded(data);
        },
        onMeasurementComplete: (distance, points) => {
          console.log('📏 Measurement complete:', { distance, points });
          onMeasurementComplete && onMeasurementComplete(distance, points);
        },
        onError: (errorMsg) => {
          console.error('❌ Measurement error:', errorMsg);
          setError(errorMsg);
          onError && onError(errorMsg);
        }
      });

      setMap(mapInstance);
      setLoaded(true);
      setError(null);
      
      onMapLoad && onMapLoad(mapInstance);
      
      return mapInstance;
    } catch (err) {
      const errorMsg = 'Failed to initialize Google Map';
      console.error('❌', errorMsg, err);
      setError(errorMsg);
      return null;
    }
  }, [center, zoom, onMapLoad, onMeasurementComplete, onPointAdded, onError]);

  // Start measurement
  const startMeasurement = useCallback(() => {
    if (!measurementManagerRef.current) {
      console.warn('⚠️ Measurement manager not available');
      return false;
    }

    console.log('🎯 Starting distance measurement...');
    const success = measurementManagerRef.current.startMeasurement();
    
    if (success) {
      setMeasurementActive(true);
      setMeasurementPoints([]);
      setTotalDistance(0);
      setFormattedDistance('0 m');
      onMeasurementStart && onMeasurementStart();
    }
    
    return success;
  }, [onMeasurementStart]);

  // Stop measurement
  const stopMeasurement = useCallback(() => {
    if (!measurementManagerRef.current) {
      console.warn('⚠️ Measurement manager not available');
      return;
    }

    console.log('⏹️ Stopping distance measurement...');
    measurementManagerRef.current.stopMeasurement();
    setMeasurementActive(false);
  }, []);

  // Clear measurements
  const clearMeasurements = useCallback(() => {
    if (!measurementManagerRef.current) {
      console.warn('⚠️ Measurement manager not available');
      return;
    }

    console.log('🧹 Clearing measurements...');
    measurementManagerRef.current.clearMeasurements();
    setMeasurementPoints([]);
    setTotalDistance(0);
    setFormattedDistance('0 m');
  }, []);

  // Toggle measurement
  const toggleMeasurement = useCallback(() => {
    if (measurementActive) {
      stopMeasurement();
    } else {
      startMeasurement();
    }
  }, [measurementActive, startMeasurement, stopMeasurement]);

  // Load script on mount
  useEffect(() => {
    loadGoogleMapsScript().catch(console.error);
  }, [loadGoogleMapsScript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (measurementManagerRef.current) {
        measurementManagerRef.current.destroy();
      }
    };
  }, []);

  return {
    // Map state
    map,
    loaded,
    error,
    isScriptLoaded,
    
    // Map methods
    mapRef,
    initializeMap,
    
    // Measurement state
    measurementActive,
    measurementPoints,
    totalDistance,
    formattedDistance,
    
    // Measurement methods
    startMeasurement,
    stopMeasurement,
    clearMeasurements,
    toggleMeasurement,
    
    // Measurement manager
    measurementManager: measurementManagerRef.current,
    
    // Utility
    loadGoogleMapsScript
  };
}
