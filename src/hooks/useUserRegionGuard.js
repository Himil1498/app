import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Normalize display names to match GeoJSON st_nm values
const normalizeStateName = (value) => {
  if (!value) return null;
  const direct = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman & Nicobar",
    "Chandigarh",
    "Dadra & Nagar Haveli and Daman & Diu",
    "Delhi",
    "Jammu & Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];
  if (direct.includes(value)) return value;

  const map = {
    Bharat: "Bharat",
    AndamanAndNicobarIslands: "Andaman & Nicobar",
    DadraAndNagarHaveliAndDamanAndDiu:
      "Dadra & Nagar Haveli and Daman & Diu",
    JammuAndKashmir: "Jammu & Kashmir",
    Tamilnadu: "Tamil Nadu",
    WestBengal: "West Bengal",
  };
  if (map[value]) return map[value];

  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();
};

// Merge all India polygons for All-India user
const mergeAllIndiaPolygons = (features) => {
  const paths = [];
  features.forEach((f) => {
    if (!f.geometry) return;
    const geom = f.geometry;
    if (geom.type === "Polygon") {
      geom.coordinates.forEach((ring) =>
        paths.push(ring.map((c) => ({ lat: c[1], lng: c[0] })))
      );
    }
    if (geom.type === "MultiPolygon") {
      geom.coordinates.forEach((poly) =>
        poly.forEach((ring) =>
          paths.push(ring.map((c) => ({ lat: c[1], lng: c[0] })))
        )
      );
    }
  });
  return paths;
};

/**
 * useUserRegionGuard
 * - Reads current user's regions from localStorage
 * - Draws allowed region polygons on the map
 * - Provides isAllowed() and fitToAllowed() helpers
 */
export default function useUserRegionGuard(map, userId) {
  const [ready, setReady] = useState(false); // user data ready
  const [polygonsReady, setPolygonsReady] = useState(false); // polygons drawn
  const polygonsRef = useRef([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAllIndia, setIsAllIndia] = useState(false);
  const [allowedNames, setAllowedNames] = useState([]);

  // Load user -> regions
  useEffect(() => {
    try {
      const current = JSON.parse(localStorage.getItem("currentUser"));
      const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
      let userRecord = current;
      if (userId && current?.username !== userId) {
        userRecord = allUsers.find((u) => u.username === userId);
      }

      if (!userRecord) {
        setAllowedNames([]);
        setIsAdmin(false);
        setIsAllIndia(false);
        setReady(true);
        return;
      }

      const admin = userRecord.role?.toLowerCase() === "admin" || userRecord.isAdmin;
      setIsAdmin(Boolean(admin));

      const regions = Array.isArray(userRecord.regions) ? userRecord.regions : [];
      const allIndia = regions.includes("Bharat") && !admin;
      setIsAllIndia(Boolean(allIndia));

      if (admin || allIndia) {
        setAllowedNames([]);
      } else {
        setAllowedNames(regions.map(normalizeStateName).filter(Boolean));
      }
    } catch (e) {
      setAllowedNames([]);
      setIsAdmin(false);
      setIsAllIndia(false);
    } finally {
      setReady(true);
    }
  }, [userId]);

  const drawPolygon = useCallback(
    (paths, fillOpacity) => {
      const poly = new window.google.maps.Polygon({
        paths,
        strokeColor: "#1e88e5",
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: "#90caf9",
        fillOpacity,
        map,
        zIndex: 2,
      });
      polygonsRef.current.push(poly);
    },
    [map]
  );

  useEffect(() => {
    if (!map || !ready) return;
    let cancelled = false;

    (async () => {
      try {
        setPolygonsReady(false);
        const res = await fetch("/india.json");
        const data = await res.json();

        // Clear old polygons
        polygonsRef.current.forEach((p) => p.setMap(null));
        polygonsRef.current = [];

        if (isAdmin) {
          data.features.forEach((f) => {
            if (!f.geometry) return;
            const geom = f.geometry;
            const pathsArray =
              geom.type === "Polygon"
                ? geom.coordinates.map((ring) =>
                    ring.map((c) => ({ lat: c[1], lng: c[0] }))
                  )
                : geom.type === "MultiPolygon"
                ? geom.coordinates.flatMap((poly) =>
                    poly.map((ring) => ring.map((c) => ({ lat: c[1], lng: c[0] })))
                  )
                : [];
            pathsArray.forEach((paths) => drawPolygon(paths, 0.15));
          });
        } else if (isAllIndia) {
          const merged = mergeAllIndiaPolygons(data.features);
          merged.forEach((paths) => drawPolygon(paths, 0.05));
        } else if (allowedNames.length) {
          const filtered = data.features.filter((f) =>
            allowedNames.includes(f.properties?.st_nm)
          );
          filtered.forEach((f) => {
            if (!f.geometry) return;
            const geom = f.geometry;
            const pathsArray =
              geom.type === "Polygon"
                ? geom.coordinates.map((ring) =>
                    ring.map((c) => ({ lat: c[1], lng: c[0] }))
                  )
                : geom.type === "MultiPolygon"
                ? geom.coordinates.flatMap((poly) =>
                    poly.map((ring) => ring.map((c) => ({ lat: c[1], lng: c[0] })))
                  )
                : [];
            pathsArray.forEach((paths) => drawPolygon(paths, 0.15));
          });
        }
        setPolygonsReady(true);
      } catch (e) {
        // silent
      }
    })();

    return () => {
      if (cancelled) return;
      polygonsRef.current.forEach((p) => p.setMap(null));
      polygonsRef.current = [];
    };
  }, [map, ready, isAdmin, isAllIndia, allowedNames, drawPolygon]);

  const fitToAllowed = useCallback(() => {
    if (!map || !window.google?.maps) return;
    const bounds = new window.google.maps.LatLngBounds();
    if (!polygonsRef.current.length) {
      bounds.extend({ lat: 6.75, lng: 68.11 });
      bounds.extend({ lat: 35.67, lng: 97.4 });
    } else {
      polygonsRef.current.forEach((poly) =>
        poly
          .getPath()
          .getArray()
          .forEach((latLng) => bounds.extend(latLng))
      );
    }
    map.fitBounds(bounds);
    const listener = window.google.maps.event.addListenerOnce(
      map,
      "bounds_changed",
      () => {
        if (map.getZoom() > 7) map.setZoom(7);
      }
    );
    setTimeout(() => window.google.maps.event.removeListener(listener), 1000);
  }, [map]);

  const isAllowed = useCallback(
    (latLng) => {
      if (!map || !window.google?.maps) return false;
      if (isAdmin || isAllIndia) return true;
      // Until polygons are ready, do not block user interactions
      if (!polygonsReady) return true;
      if (!polygonsRef.current.length) return true;
      try {
        // If geometry library is not present, don't block
        if (!window.google.maps.geometry?.poly) return true;
        const point = new window.google.maps.LatLng(latLng.lat, latLng.lng);
        return polygonsRef.current.some((poly) =>
          window.google.maps.geometry.poly.containsLocation(point, poly)
        );
      } catch {
        return false;
      }
    },
    [map, isAdmin, isAllIndia, polygonsReady]
  );

  return { ready, isAllowed, fitToAllowed };
}


