// import { useEffect, useState } from "react";

// /**
//  * Custom hook to load India boundary from GeoJSON
//  * and provide a function to check if a point is inside India
//  */
// export default function useIndiaBoundary(map) {
//   const [indiaPolygons, setIndiaPolygons] = useState([]);

//   // Load India GeoJSON once
//   useEffect(() => {
//     if (!map) return;

//     fetch("/india-boundary.geojson")
//       .then((res) => res.json())
//       .then((data) => {
//         const polygons = [];
//         data.features.forEach((feature) => {
//           const coords = feature.geometry.coordinates; // MultiPolygon
//           coords.forEach((polygonCoords) => {
//             const paths = polygonCoords.map((ring) =>
//               ring.map(([lng, lat]) => ({ lat, lng }))
//             );
//             const poly = new window.google.maps.Polygon({
//               paths,
//               strokeOpacity: 0,
//               fillOpacity: 0,
//               map: null // invisible
//             });
//             polygons.push(poly);
//           });
//         });
//         setIndiaPolygons(polygons);
//       });
//   }, [map]);

//   // Function to check if a point is inside India
//   const isInsideIndia = (latLng) => {
//     if (!indiaPolygons.length) return false;
//     return indiaPolygons.some((poly) =>
//       window.google.maps.geometry.poly.containsLocation(
//         new window.google.maps.LatLng(latLng.lat, latLng.lng),
//         poly
//       )
//     );
//   };

//   return { isInsideIndia };
// }

import { useEffect, useState, useMemo } from "react";

/**
 * Custom hook to:
 * 1. Load India's boundary polygons from GeoJSON
 * 2. Draw the visible boundary on the map
 * 3. Provide a function to check if a given point is inside India
 * 4. Return LatLngBounds for zooming/fitting India
 */
export default function useIndiaBoundary(map, options = {}) {
  const [indiaPolygons, setIndiaPolygons] = useState([]);
  const [indiaBounds, setIndiaBounds] = useState(null);

  // Default styling for India's boundary
  const defaultOptions = {
    strokeColor: "#1976D2", // Blue border
    strokeOpacity: 0.3, // Very subtle stroke
    strokeWeight: 1, // Thin stroke
    fillColor: "#64B5F6", // Light blue fill
    fillOpacity: 0.02, // Almost invisible fill
  };

  // Merge custom options with default options using useMemo to prevent re-renders
  const mergedOptions = useMemo(() => ({ ...defaultOptions, ...options }), [
    options.strokeColor,
    options.strokeOpacity, 
    options.strokeWeight,
    options.fillColor,
    options.fillOpacity
  ]);

  useEffect(() => {
    if (!map || !window.google) {
      console.log('Map or Google Maps not available yet');
      return;
    }
    
    // Check geometry library availability
    if (!window.google.maps.geometry) {
      console.error('Google Maps geometry library not loaded! Make sure to include it in the script.');
      return;
    }

    let createdPolygons = [];
    
    // Helper function to create visible and invisible polygon pairs
    const createPolygonPair = (paths, options, map, polygonArray) => {
      try {
        // **Visible boundary polygon - CRITICAL: Make non-clickable to avoid layer conflicts**
        const visiblePolygon = new window.google.maps.Polygon({
          paths,
          strokeColor: options.strokeColor,
          strokeOpacity: options.strokeOpacity,
          strokeWeight: options.strokeWeight,
          fillColor: options.fillColor,
          fillOpacity: options.fillOpacity,
          clickable: false, // CRITICAL: Prevents interference with map clicks
          zIndex: 1, // Put boundary below other elements
          map, // show boundary on map
        });

        // **Invisible polygon for hit-testing only**
        const invisiblePolygon = new window.google.maps.Polygon({
          paths,
          strokeOpacity: 0,
          fillOpacity: 0,
          map: null, // not rendered
        });

        polygonArray.push({ visiblePolygon, invisiblePolygon });
        console.log(`Created polygon pair with ${paths.length} paths`);
      } catch (error) {
        console.error('Error creating polygon pair:', error);
      }
    };

    fetch("/india.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch India boundary GeoJSON");
        return res.json();
      })
      .then((data) => {
        const bounds = new window.google.maps.LatLngBounds();

        data.features.forEach((feature) => {
          const geometry = feature.geometry;
          const coords = geometry.coordinates;
          
          console.log(`Processing feature: ${feature.properties?.st_nm}, Type: ${geometry.type}`);

          // Handle different geometry types
          if (geometry.type === 'MultiPolygon') {
            // MultiPolygon: coordinates are [polygon1, polygon2, ...]
            coords.forEach((polygonCoords) => {
              const paths = polygonCoords.map((ring) =>
                ring.map(([lng, lat]) => {
                  const point = { lat, lng };
                  bounds.extend(point);
                  return point;
                })
              );

              createPolygonPair(paths, mergedOptions, map, createdPolygons);
            });
          } else if (geometry.type === 'Polygon') {
            // Polygon: coordinates are [outerRing, innerRing1, innerRing2, ...]
            const paths = coords.map((ring) =>
              ring.map(([lng, lat]) => {
                const point = { lat, lng };
                bounds.extend(point);
                return point;
              })
            );

            createPolygonPair(paths, mergedOptions, map, createdPolygons);
          }
        });

        console.log(`Loaded ${createdPolygons.length} polygons for India boundary`);
        setIndiaPolygons(createdPolygons);
        setIndiaBounds(bounds);
      })
      .catch((err) => {
        console.error("Error loading India boundary GeoJSON:", err);
      });

    // Cleanup on unmount or map change
    return () => {
      createdPolygons.forEach(({ visiblePolygon }) =>
        visiblePolygon.setMap(null)
      );
    };
  }, [map, mergedOptions]);

  /**
   * Check if a given point is inside India's boundary
   * @param {{lat: number, lng: number}} latLng
   * @returns {boolean}
   */
  const isInsideIndia = (latLng) => {
    // Check if polygons are loaded
    if (!indiaPolygons.length) {
      console.warn('India polygons not loaded yet');
      return null; // Return null to indicate "not ready" vs "outside boundary"
    }

    // Check if geometry library is available
    if (!window.google?.maps?.geometry?.poly) {
      console.error('Google Maps geometry library not available');
      return null;
    }

    try {
      const point = new window.google.maps.LatLng(latLng.lat, latLng.lng);
      const result = indiaPolygons.some(({ invisiblePolygon }) =>
        window.google.maps.geometry.poly.containsLocation(point, invisiblePolygon)
      );
      
      console.log(`Point ${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)} inside India: ${result}`);
      return result;
    } catch (error) {
      console.error('Error checking if point is inside India:', error);
      return null;
    }
  };

  /**
   * Clear all India boundary polygons from the map
   */
  const clearIndiaBoundary = () => {
    indiaPolygons.forEach(({ visiblePolygon }) => {
      if (visiblePolygon && visiblePolygon.setMap) {
        visiblePolygon.setMap(null);
      }
    });
    console.log('India boundary polygons cleared from map');
  };

  /**
   * Show India boundary polygons on the map
   */
  const showIndiaBoundary = () => {
    indiaPolygons.forEach(({ visiblePolygon }) => {
      if (visiblePolygon && visiblePolygon.setMap) {
        visiblePolygon.setMap(map);
      }
    });
    console.log('India boundary polygons shown on map');
  };

  return { isInsideIndia, indiaBounds, clearIndiaBoundary, showIndiaBoundary };
}
