import { useEffect, useRef, useState, createContext, useContext } from 'react';

// Global map context
const GlobalMapContext = createContext();

// Provider component to wrap the app
export const GlobalMapProvider = ({ children }) => {
  const [globalMapInstance, setGlobalMapInstance] = useState(null);
  const [isGlobalMapLoaded, setIsGlobalMapLoaded] = useState(false);
  const [globalMapError, setGlobalMapError] = useState(null);
  const globalMapRef = useRef(null);

  const value = {
    globalMapInstance,
    setGlobalMapInstance,
    isGlobalMapLoaded,
    setIsGlobalMapLoaded,
    globalMapError,
    setGlobalMapError,
    globalMapRef,
  };

  return (
    <GlobalMapContext.Provider value={value}>
      {children}
    </GlobalMapContext.Provider>
  );
};

// Hook to use global map context
export const useGlobalMapContext = () => {
  const context = useContext(GlobalMapContext);
  if (!context) {
    throw new Error('useGlobalMapContext must be used within a GlobalMapProvider');
  }
  return context;
};

// Global map promise to ensure single instance
let googleMapsPromise = null;

// Main hook for global map management
export default function useGlobalMap({
  apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY,
  libraries = ['drawing', 'geometry', 'places'],
  mapOptions = {}
}) {
  const {
    globalMapInstance,
    setGlobalMapInstance,
    isGlobalMapLoaded,
    setIsGlobalMapLoaded,
    globalMapError,
    setGlobalMapError,
    globalMapRef,
  } = useGlobalMapContext();

  const [localMapRef, setLocalMapRef] = useState(null);

  // Load Google Maps API
  const loadGoogleMapsAPI = () => {
    if (!googleMapsPromise) {
      googleMapsPromise = new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
          return resolve(window.google);
        }

        // Check if script already exists
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          console.log('🔄 Google Maps script exists, waiting for load...');
          const checkGoogle = () => {
            if (window.google && window.google.maps) {
              resolve(window.google);
            } else {
              setTimeout(checkGoogle, 100);
            }
          };
          checkGoogle();
          return;
        }

        console.log('📦 Loading Google Maps API globally...');
        const script = document.createElement('script');
        script.id = 'google-maps-global-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}&v=weekly`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          console.log('✅ Global Google Maps API loaded successfully');
          if (window.google && window.google.maps) {
            resolve(window.google);
          } else {
            reject(new Error('Google Maps API loaded but google object not available'));
          }
        };

        script.onerror = () => {
          console.error('❌ Failed to load Global Google Maps API');
          document.head.removeChild(script);
          reject(new Error('Failed to load Google Maps API'));
        };

        document.head.appendChild(script);
      });
    }

    return googleMapsPromise;
  };

  // Initialize global map
  const initializeGlobalMap = async (containerRef) => {
    if (!containerRef || !containerRef.current) {
      console.error('❌ Map container ref not provided');
      return null;
    }

    if (globalMapInstance) {
      console.log('🔄 Using existing global map instance');
      // Move existing map to new container if needed
      try {
        if (containerRef.current !== globalMapInstance.getDiv()) {
          console.log('🔄 Moving map to new container');
          // Clear the new container first
          containerRef.current.innerHTML = '';
          // Move the map
          containerRef.current.appendChild(globalMapInstance.getDiv());
        }
      } catch (error) {
        console.warn('⚠️ Could not move existing map:', error);
      }
      return globalMapInstance;
    }

    try {
      console.log('🚀 Initializing global map...');
      const google = await loadGoogleMapsAPI();

      const indiaBounds = {
        north: 37.1,
        south: 6.7,
        west: 68.1,
        east: 97.4
      };

      const mapInstance = new google.maps.Map(containerRef.current, {
        center: { lat: 22.5, lng: 78.9 },
        zoom: 5,
        mapTypeId: 'hybrid',
        restriction: {
          latLngBounds: indiaBounds,
          strictBounds: true
        },
        ...mapOptions
      });

      // Add India boundary (invisible)
      new google.maps.Rectangle({
        bounds: indiaBounds,
        map: mapInstance,
        strokeOpacity: 0,
        fillOpacity: 0
      });

      // Listen for map ready event
      google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
        console.log('✅ Global map is ready');
        setIsGlobalMapLoaded(true);

        // Add global click listener for debugging
        google.maps.event.addListener(mapInstance, 'click', (e) => {
          console.log('🗺️ GLOBAL MAP CLICK:', e.latLng.lat(), e.latLng.lng());
        });
      });

      // Listen for map errors
      google.maps.event.addListener(mapInstance, 'error', (e) => {
        console.error('Global map error:', e);
        setGlobalMapError(`Map rendering error: ${e.error}`);
      });

      setGlobalMapInstance(mapInstance);
      globalMapRef.current = mapInstance;
      
      return mapInstance;

    } catch (error) {
      console.error('❌ Error initializing global map:', error);
      setGlobalMapError(`Failed to initialize map: ${error.message}`);
      return null;
    }
  };

  // Create a map container for components
  const createMapContainer = (containerId = 'global-map-container') => {
    const mapContainer = useRef(null);
    
    useEffect(() => {
      if (mapContainer.current && !localMapRef) {
        console.log('🔄 Setting up map container for:', containerId);
        setLocalMapRef(mapContainer.current);
        initializeGlobalMap(mapContainer).catch(error => {
          console.error('❌ Failed to initialize global map:', error);
          setGlobalMapError(`Map initialization failed: ${error.message}`);
        });
      }
    }, []);

    return mapContainer;
  };

  // Get existing global map instance
  const getGlobalMap = () => {
    return globalMapInstance;
  };

  // Clean up global map
  const cleanupGlobalMap = () => {
    if (globalMapInstance && window.google) {
      window.google.maps.event.clearInstanceListeners(globalMapInstance);
    }
    setGlobalMapInstance(null);
    setIsGlobalMapLoaded(false);
    setGlobalMapError(null);
  };

  return {
    // Map instance and state
    map: globalMapInstance,
    isLoaded: isGlobalMapLoaded,
    loaded: isGlobalMapLoaded, // Keep both for compatibility
    error: globalMapError,
    mapRef: globalMapRef,
    
    // Methods
    initializeGlobalMap,
    createMapContainer,
    getGlobalMap,
    cleanupGlobalMap,
    loadGoogleMapsAPI,
  };
}

// Simple hook for components that just want to use the existing global map
export function useSimpleGlobalMap() {
  const context = useGlobalMapContext();
  const [mapContainer] = useState(() => useRef(null));
  
  useEffect(() => {
    if (mapContainer.current && !context.globalMapInstance) {
      // Initialize map directly in the container
      const initializeMap = async () => {
        try {
          console.log('🚀 Simple map initialization...');
          
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
          if (!apiKey) {
            throw new Error('Google Maps API key not found');
          }

          // Load Google Maps API if not already loaded
          if (!window.google) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing,geometry,places&v=weekly`;
            script.async = true;
            script.defer = true;
            
            await new Promise((resolve, reject) => {
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
            });
          }

          // Create map instance
          const indiaBounds = {
            north: 37.1,
            south: 6.7,
            west: 68.1,
            east: 97.4
          };

          const mapInstance = new window.google.maps.Map(mapContainer.current, {
            center: { lat: 22.5, lng: 78.9 },
            zoom: 5,
            mapTypeId: 'hybrid',
            restriction: {
              latLngBounds: indiaBounds,
              strictBounds: true
            }
          });

          // Set up context
          context.setGlobalMapInstance(mapInstance);
          context.globalMapRef.current = mapInstance;
          context.setIsGlobalMapLoaded(true);
          
          console.log('✅ Simple map initialized successfully');
          
        } catch (error) {
          console.error('❌ Simple map initialization failed:', error);
          context.setGlobalMapError(`Failed to initialize map: ${error.message}`);
        }
      };
      
      const timer = setTimeout(initializeMap, 100);
      return () => clearTimeout(timer);
    }
  }, [context]);
  
  return {
    mapRef: mapContainer,
    map: context.globalMapInstance,
    isLoaded: context.isGlobalMapLoaded,
    error: context.globalMapError
  };
}
