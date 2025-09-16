import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  Stack,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Chip,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemSecondaryAction,
  FormControlLabel,
  Checkbox,
  Grid,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  PlayArrow,
  Stop,
  Clear,
  Save,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  Close,
  Map as MapIcon,
  Timeline,
  History,
  Delete,
  Visibility,
  Straighten,
  Crop,
  SquareFoot,
  Business,
  Router,
  LocationOn,
  CheckBox,
  CheckBoxOutlineBlank,
  Apartment,
  Store,
  CloudUpload,
  SignalCellularAlt,
  Router as TowerIcon,
  CellTower,
  Satellite,
  CloudDownload,
  CalendarToday,
  CheckCircle,
  Cancel,
  Settings,
  TrendingUp,
  BugReport,
  Code,
  ExpandMore,
  Download,
} from "@mui/icons-material";
import useIndiaBoundary from "../hooks/useIndiaBoundary";
import AddLocationForm from "./common/AddLocationForm";

// Add CSS keyframes for animations
const animationKeyframes = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

// Inject styles into document head
if (
  typeof document !== "undefined" &&
  !document.querySelector("#elevation-animation-styles")
) {
  const styleElement = document.createElement("style");
  styleElement.id = "elevation-animation-styles";
  styleElement.textContent = animationKeyframes;
  document.head.appendChild(styleElement);
}

/**
 * Working Measurement Map - Using exact patterns from SimpleMapTest
 * @param {Object} props - Component props
 * @param {boolean} props.hideControls - Hide the control panel
 * @param {boolean} props.hideHeader - Hide the header section
 * @param {boolean} props.isDrawing - External drawing state
 * @param {boolean} props.isPolygonDrawing - External polygon drawing state
 * @param {boolean} props.showElevation - External elevation state
 * @param {boolean} props.showInfrastructure - External infrastructure state
 * @param {Function} props.onDrawingChange - Callback for drawing state changes
 * @param {Function} props.onPolygonDrawingChange - Callback for polygon drawing state changes
 * @param {Function} props.onPointsChange - Callback for points changes
 * @param {Function} props.onPolygonPointsChange - Callback for polygon points changes
 */
const WorkingMeasurementMap = React.forwardRef(
  (
    {
      hideControls = false,
      hideHeader = false,
      isDrawing: externalIsDrawing,
      isPolygonDrawing: externalIsPolygonDrawing,
      showElevation: externalShowElevation,
      showInfrastructure: externalShowInfrastructure,
      selectedBaseMap = "satellite",
      onDrawingChange,
      onPolygonDrawingChange,
      onPointsChange,
      onPolygonPointsChange,
      onTotalDistanceChange,
      onPolygonAreaChange,
      onCoordinatesChange,
      onZoomChange,
      onLogsChange,
      onMouseCoordinatesChange,
      showDebugLogs = false,
    } = {},
    ref
  ) => {
    const theme = useTheme();

    // Basic state from SimpleMapTest
    const [map, setMap] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [internalPoints, setInternalPoints] = useState([]);
    const [internalIsDrawing, setInternalIsDrawing] = useState(false);
    const [polyline, setPolyline] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [logs, setLogs] = useState([]);

    // Use external states when provided, otherwise use internal states
    const points = internalPoints; // Always use internal points for actual data
    const isDrawing =
      externalIsDrawing !== undefined ? externalIsDrawing : internalIsDrawing;
    const setPoints = setInternalPoints; // Always use internal setter
    const setIsDrawing = onDrawingChange || setInternalIsDrawing;

    // Enhanced features
    const [totalDistance, setTotalDistance] = useState(0);
    const [segmentDistances, setSegmentDistances] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [measurementName, setMeasurementName] = useState("");
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [savedMeasurements, setSavedMeasurements] = useState([]);
    const [showInstructions, setShowInstructions] = useState(true);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [measurementToDelete, setMeasurementToDelete] = useState(null);

    // Polygon save dialog states
    const [polygonSaveDialogOpen, setPolygonSaveDialogOpen] = useState(false);
    const [polygonName, setPolygonName] = useState("");
    const [polygonHistoryDialogOpen, setPolygonHistoryDialogOpen] =
      useState(false);
    const [savedPolygons, setSavedPolygons] = useState([]);
    const [polygonDeleteConfirmOpen, setPolygonDeleteConfirmOpen] =
      useState(false);
    const [polygonToDelete, setPolygonToDelete] = useState(null);
    const [distanceLabels, setDistanceLabels] = useState([]);
    const [streetViewOpen, setStreetViewOpen] = useState(false);
    const [streetViewPosition, setStreetViewPosition] = useState(null);

    // Polygon drawing state
    const [drawingMode, setDrawingMode] = useState("distance"); // 'distance' or 'polygon'
    const [internalPolygonPoints, setInternalPolygonPoints] = useState([]);
    const [polygon, setPolygon] = useState(null);
    const [polygonMarkers, setPolygonMarkers] = useState([]);
    const [polygonArea, setPolygonArea] = useState(0);
    const [polygonPerimeter, setPolygonPerimeter] = useState(0);
    const [internalIsPolygonDrawing, setInternalIsPolygonDrawing] =
      useState(false);
    const [areaLabel, setAreaLabel] = useState(null);

    // Use external polygon states when provided
    const polygonPoints = internalPolygonPoints; // Always use internal points for actual data
    const isPolygonDrawing =
      externalIsPolygonDrawing !== undefined
        ? externalIsPolygonDrawing
        : internalIsPolygonDrawing;
    const setPolygonPoints = setInternalPolygonPoints; // Always use internal setter
    const setIsPolygonDrawing =
      onPolygonDrawingChange || setInternalIsPolygonDrawing;

    // Loaded polygon metadata and editing state
    const [loadedPolygonKey, setLoadedPolygonKey] = useState(null);
    const [loadedPolygonName, setLoadedPolygonName] = useState("");
    const [canEditLoadedPolygon, setCanEditLoadedPolygon] = useState(false);
    const [isEditingPolygon, setIsEditingPolygon] = useState(false);
    const polygonPathListenersRef = useRef([]);

    // Infrastructure state - use external when provided
    const [internalShowInfrastructure, setInternalShowInfrastructure] =
      useState(false);
    const showInfrastructure =
      externalShowInfrastructure !== undefined
        ? externalShowInfrastructure
        : internalShowInfrastructure;
    const setShowInfrastructure =
      externalShowInfrastructure !== undefined
        ? () => {}
        : setInternalShowInfrastructure;
    const [showPopLayer, setShowPopLayer] = useState(() => {
      const v = localStorage.getItem("infra_toggle_pop");
      return v ? JSON.parse(v) : false;
    });
    const [showSubPopLayer, setShowSubPopLayer] = useState(() => {
      const v = localStorage.getItem("infra_toggle_subpop");
      return v ? JSON.parse(v) : false;
    });
    const [popKmlLayer, setPopKmlLayer] = useState(null);
    const [subPopKmlLayer, setSubPopKmlLayer] = useState(null);
    const [importedMarkers, setImportedMarkers] = useState([]);
    const [showImportedLayer, setShowImportedLayer] = useState(() => {
      const v = localStorage.getItem("infra_toggle_imported");
      return v ? JSON.parse(v) : false;
    });
    const [enableBoundaryCheck, setEnableBoundaryCheck] = useState(() => {
      const v = localStorage.getItem("enable_boundary_check");
      return v ? JSON.parse(v) : false; // Default disabled for easier testing
    });
    const [useDatabase, setUseDatabase] = useState(() => {
      const v = localStorage.getItem("use_database_storage");
      return v ? JSON.parse(v) : false; // Default to localStorage
    });
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [manualCoords, setManualCoords] = useState({ lat: "", lng: "" });
    const [editingLocation, setEditingLocation] = useState(null);
    const [deleteConfirmLocation, setDeleteConfirmLocation] = useState(null);
    const [showManageLocations, setShowManageLocations] = useState(false);
    // Geocoding state removed

    // Marker clusterers
    const popClusterRef = useRef(null);
    const subClusterRef = useRef(null);
    const importedClusterRef = useRef(null);
    const clustererLoadedRef = useRef(false);

    // Add POP/Sub-POP states
    const [isAddingLocation, setIsAddingLocation] = useState(false); // 'pop', 'sub', or false
    const [addLocationForm, setAddLocationForm] = useState({
      open: false,
      type: "", // 'pop' or 'sub'
      position: null, // {lat, lng}
      data: {},
    });
    const [manualLocations, setManualLocations] = useState(() => {
      const saved = localStorage.getItem("manual_infrastructure_locations");
      return saved ? JSON.parse(saved) : { pop: [], sub: [] };
    });

    const mapRef = useRef(null);
    const clickListenerRef = useRef(null);

    // Elevation state - use external when provided
    const [internalShowElevation, setInternalShowElevation] = useState(false);
    const showElevation =
      externalShowElevation !== undefined
        ? externalShowElevation
        : internalShowElevation;
    const [elevationData, setElevationData] = useState([]);
    const [elevationChart, setElevationChart] = useState(null);
    const [elevationMarkers, setElevationMarkers] = useState([]);
    const [elevationStats, setElevationStats] = useState({
      maxElevation: 0,
      minElevation: 0,
      totalElevationGain: 0,
      totalElevationLoss: 0,
      avgElevation: 0,
    });

    // Elevation-specific drawing state
    const [isElevationMode, setIsElevationMode] = useState(false);
    const [elevationPoints, setElevationPoints] = useState([]);
    const [elevationPointMarkers, setElevationPointMarkers] = useState([]);
    const [elevationPolyline, setElevationPolyline] = useState(null);
    const [showElevationProfile, setShowElevationProfile] = useState(false);
    const [elevationDistance, setElevationDistance] = useState(0);
    const [pointElevations, setPointElevations] = useState({
      point1: null,
      point2: null,
    });
    const [exportingData, setExportingData] = useState(null); // Track which export is in progress

    const elevationChartRef = useRef(null);
    const elevationServiceRef = useRef(null);

    // Database API functions
    const saveToDatabase = async (data) => {
      try {
        const response = await fetch("/api/infrastructure", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add authentication headers if needed
            // 'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const result = await response.json();
          addLog(`✅ Saved to database with ID: ${result.id}`);
          return result;
        } else {
          throw new Error(`Database save failed: ${response.statusText}`);
        }
      } catch (error) {
        addLog(`❌ Database save error: ${error.message}`);
        throw error;
      }
    };

    const loadFromDatabase = async () => {
      try {
        // For testing, try mock data first, then real API
        let response;
        try {
          response = await fetch("/api-mock.json");
          if (response.ok) {
            const mockData = await response.json();
            addLog(
              `✅ Loaded ${mockData.infrastructure_data.length} items from mock database`
            );
            return mockData.infrastructure_data;
          }
        } catch (mockError) {
          // If mock fails, try real API
          response = await fetch("/api/infrastructure");
          if (response.ok) {
            const data = await response.json();
            addLog(`✅ Loaded ${data.length} items from database`);
            return data;
          } else {
            throw new Error(`Database load failed: ${response.statusText}`);
          }
        }
      } catch (error) {
        addLog(`❌ Database load error: ${error.message}`);
        throw error;
      }
    };

    const updateInDatabase = async (id, data) => {
      try {
        const response = await fetch(`/api/infrastructure/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            // Add authentication headers if needed
            // 'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const result = await response.json();
          addLog(`✅ Updated in database with ID: ${result.id}`);
          return result;
        } else {
          throw new Error(`Database update failed: ${response.statusText}`);
        }
      } catch (error) {
        addLog(`❌ Database update error: ${error.message}`);
        throw error;
      }
    };

    // Geocoding functionality removed - users will enter addresses manually

    // Helper function to serialize location objects without circular references
    const safeSerialize = (obj) => {
      const { marker, infoWindow, ...safeObj } = obj;
      return safeObj;
    };

    // Use India boundary hook
    const {
      isInsideIndia,
      indiaBounds,
      clearIndiaBoundary,
      showIndiaBoundary,
    } = useIndiaBoundary(map, {
      strokeColor: "#FF5722",
      strokeOpacity: 0.4,
      strokeWeight: 2,
      fillColor: "#FF5722",
      fillOpacity: 0.05,
    });

    // Hide instructions after 5 seconds
    useEffect(() => {
      const timer = setTimeout(() => {
        setShowInstructions(false);
      }, 5000);

      return () => clearTimeout(timer);
    }, []);

    // Add initial log on mount
    useEffect(() => {
      addLog("🚀 WorkingMeasurementMap component initialized");
      addLog("🗺️ Map system ready for measurements");
    }, []);

    const addLog = (message) => {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = `[${timestamp}] ${message}`;
      console.log(logEntry);

      setLogs((prev) => {
        const newLogs = [...prev.slice(-49), logEntry]; // Keep last 50 logs
        // Pass logs to parent component if callback provided
        if (onLogsChange) {
          onLogsChange(newLogs);
        }
        return newLogs;
      });
    };

    const addNotification = (message, severity = "info") => {
      const id = Date.now();
      const notification = { id, message, severity };
      setNotifications((prev) => [...prev, notification]);

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 4000);
    };

    // Distance calculation (Haversine formula)
    const calculateDistance = (point1, point2) => {
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
    };

    // Format distance
    const formatDistance = (distanceInMeters) => {
      if (distanceInMeters >= 1000) {
        const km = distanceInMeters / 1000;
        return `${km.toFixed(2)} km`;
      } else {
        return `${distanceInMeters.toFixed(1)} m`;
      }
    };

    // Calculate polygon area using Shoelace formula
    const calculatePolygonArea = (points) => {
      if (points.length < 3) return 0;

      let area = 0;
      const n = points.length;

      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += points[i].lat * points[j].lng;
        area -= points[j].lat * points[i].lng;
      }

      area = Math.abs(area) / 2;

      // Convert to square meters (approximate)
      const metersPerDegree = 111319.9; // meters per degree at equator
      return area * metersPerDegree * metersPerDegree;
    };

    // Format area
    const formatArea = (areaInSquareMeters) => {
      if (areaInSquareMeters >= 1000000) {
        const km2 = areaInSquareMeters / 1000000;
        return `${km2.toFixed(2)} km²`;
      } else if (areaInSquareMeters >= 10000) {
        const hectares = areaInSquareMeters / 10000;
        return `${hectares.toFixed(2)} ha`;
      } else {
        return `${areaInSquareMeters.toFixed(1)} m²`;
      }
    };

    // Calculate polygon perimeter
    const calculatePolygonPerimeter = (points) => {
      if (points.length < 2) return 0;

      let perimeter = 0;

      // Calculate distance for each edge
      for (let i = 0; i < points.length; i++) {
        const currentPoint = points[i];
        const nextPoint = points[(i + 1) % points.length]; // Wrap around to first point
        perimeter += calculateDistance(currentPoint, nextPoint);
      }

      return perimeter;
    };

    // Create distance label as a custom overlay
    const createDistanceLabel = (point1, point2, distance, map) => {
      const midPoint = {
        lat: (point1.lat + point2.lat) / 2,
        lng: (point1.lng + point2.lng) / 2,
      };

      // Create a custom marker with distance text
      const label = new window.google.maps.Marker({
        position: midPoint,
        map: map,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="20" viewBox="0 0 80 20">
            <rect width="80" height="20" rx="10" fill="white" stroke="#FF5722" stroke-width="1" fill-opacity="0.9"/>
            <text x="40" y="14" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#FF5722">
              ${formatDistance(distance)}
            </text>
          </svg>
        `)}`,
          anchor: new window.google.maps.Point(40, 10),
          scaledSize: new window.google.maps.Size(80, 20),
        },
        zIndex: 50, // Above polylines but below markers
      });

      return label;
    };

    // Handle base map changes
    useEffect(() => {
      if (map && window.google && window.google.maps) {
        const getMapTypeId = (baseMapType) => {
          switch (baseMapType) {
            case "street":
              return window.google.maps.MapTypeId.ROADMAP;
            case "terrain":
              return window.google.maps.MapTypeId.TERRAIN;
            case "satellite":
            default:
              return window.google.maps.MapTypeId.HYBRID;
          }
        };

        map.setMapTypeId(getMapTypeId(selectedBaseMap));
        addLog(`🗺️ Base map changed to: ${selectedBaseMap}`);
        addNotification(`Switched to ${selectedBaseMap} view`, "info");
      }
    }, [selectedBaseMap, map]);

    // EXACT SAME LOADING PATTERN AS SIMPLEMAPTEST
    useEffect(() => {
      const loadMap = async () => {
        try {
          addLog("🔄 Starting to load Google Maps...");

          // Check if already loaded
          if (window.google && window.google.maps) {
            addLog("✅ Google Maps already loaded");
            initializeMap();
            return;
          }

          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
          if (!apiKey) {
            addLog("❌ No API key found");
            return;
          }

          addLog(`🔑 Using API key: ${apiKey.substring(0, 10)}...`);

          const script = document.createElement("script");
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places&callback=initWorkingMap`;
          script.async = true;
          script.defer = true;

          // Create global callback
          window.initWorkingMap = () => {
            addLog("✅ Google Maps loaded via callback");
            initializeMap();
          };

          script.onerror = () => {
            addLog("❌ Failed to load Google Maps script");
          };

          document.head.appendChild(script);
        } catch (error) {
          addLog(`❌ Error loading map: ${error.message}`);
        }
      };

      loadMap();
    }, []);

    // EXACT SAME INITIALIZATION AS SIMPLEMAPTEST
    const initializeMap = () => {
      if (!mapRef.current || !window.google) {
        addLog("❌ Map container or Google not available");
        return;
      }

      try {
        addLog("🗺️ Initializing map...");

        // Map base map type based on selectedBaseMap prop
        const getMapTypeId = (baseMapType) => {
          switch (baseMapType) {
            case "street":
              return window.google.maps.MapTypeId.ROADMAP;
            case "terrain":
              return window.google.maps.MapTypeId.TERRAIN;
            case "satellite":
            default:
              return window.google.maps.MapTypeId.HYBRID;
          }
        };

        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: { lat: 20.5937, lng: 78.9629 },
          zoom: 6,
          mapTypeId: getMapTypeId(selectedBaseMap),
          restriction: {
            latLngBounds: {
              north: 37.6,
              south: 6.4,
              west: 68.1,
              east: 97.4,
            },
            strictBounds: false,
          },
          // Hide default controls for cleaner interface
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          zoomControl: false,
          scaleControl: false,
          rotateControl: false,
          panControl: false,
        });

        setMap(mapInstance);
        setLoaded(true);
        addLog("✅ Map initialized successfully");
        addNotification("Map loaded successfully!", "success");

        // Add listeners for live coordinates tracking
        if (onCoordinatesChange || onZoomChange) {
          // Track map center changes
          mapInstance.addListener("center_changed", () => {
            const center = mapInstance.getCenter();
            const zoom = mapInstance.getZoom();
            if (onCoordinatesChange && center) {
              onCoordinatesChange({ lat: center.lat(), lng: center.lng() });
            }
            if (onZoomChange && zoom) {
              onZoomChange(zoom);
            }
          });

          // Track zoom changes
          mapInstance.addListener("zoom_changed", () => {
            const zoom = mapInstance.getZoom();
            if (onZoomChange && zoom) {
              onZoomChange(zoom);
            }
          });

          // Initial coordinates and zoom
          const initialCenter = mapInstance.getCenter();
          const initialZoom = mapInstance.getZoom();
          if (onCoordinatesChange && initialCenter) {
            onCoordinatesChange({
              lat: initialCenter.lat(),
              lng: initialCenter.lng(),
            });
          }
          if (onZoomChange && initialZoom) {
            onZoomChange(initialZoom);
          }
        }

        // Add mouse move listener for hover coordinates
        if (onMouseCoordinatesChange) {
          mapInstance.addListener("mousemove", (event) => {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            onMouseCoordinatesChange({ lat, lng });
          });

          // Clear mouse coordinates when mouse leaves map
          mapInstance.addListener("mouseout", () => {
            onMouseCoordinatesChange(null);
          });
        }

        // Add resize listener to handle Street View after window resize
        window.addEventListener("resize", () => {
          if (mapInstance) {
            setTimeout(() => {
              window.google.maps.event.trigger(mapInstance, "resize");
              addLog("🔄 Map resized - triggering refresh");
            }, 100);
          }
        });
      } catch (error) {
        addLog(`❌ Map initialization error: ${error.message}`);
        addNotification("Failed to load map", "error");
      }
    };
    // Enhanced drawing logic that works in both map and Street View
    const startDrawing = () => {
      if (!map || !window.google) {
        addLog("❌ Map not ready");
        addNotification("Map not ready", "error");
        return;
      }

      addLog("🎯 Starting drawing mode...");

      // If in Street View, inform user they can still draw
      if (streetViewOpen) {
        addLog("🌆 Drawing mode active in Street View");
        addNotification(
          "Drawing mode active! Click on Street View to add points.",
          "info"
        );
      } else {
        addLog("🗺️ Drawing mode active on map");
      }

      setIsDrawing(true);
      setPoints([]);
      setTotalDistance(0);
      setSegmentDistances([]);

      // Clear existing polyline and markers
      if (polyline) {
        polyline.setMap(null);
        setPolyline(null);
      }

      markers.forEach((marker) => marker.setMap(null));
      setMarkers([]);

      // Add click listener with India boundary check
      addLog("👂 Adding map click listener...");
      clickListenerRef.current = map.addListener("click", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        addLog(
          `📍 DRAWING CLICK EVENT - Clicked at: ${lat.toFixed(
            4
          )}, ${lng.toFixed(4)}`
        );

        // Skip processing if in add location mode (handled by persistent listener)
        if (isAddingLocation) {
          addLog("🚫 Skipping drawing click - in add location mode");
          return;
        }

        // Handle elevation mode point selection
        if (isElevationMode) {
          addLog(
            `📈 ELEVATION MODE CLICK - Point at: ${lat.toFixed(
              4
            )}, ${lng.toFixed(4)}`
          );

          // Check if point is inside India boundary
          const insideIndia = isInsideIndia({ lat, lng });
          if (insideIndia === false) {
            addLog("❌ Elevation point outside India boundary");

            // Add temporary visual indicator for elevation points
            const tempMarker = new window.google.maps.Marker({
              position: { lat, lng },
              map: map,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 14,
                fillColor: "#FF5722",
                fillOpacity: 0.8,
                strokeColor: "#FFFFFF",
                strokeWeight: 3,
              },
              animation: window.google.maps.Animation.BOUNCE,
              zIndex: 1900,
            });

            const infoWindow = new window.google.maps.InfoWindow({
              content: `
              <div style="text-align: center; padding: 6px;">
                <div style="color: #FF5722; font-weight: bold;">📈 Elevation Point</div>
                <div style="color: #d32f2f; margin-top: 2px;">Outside India boundary</div>
                <div style="font-size: 11px; color: #666; margin-top: 4px;">Please select points within India</div>
              </div>
            `,
              position: { lat, lng },
            });

            infoWindow.open(map);

            setTimeout(() => {
              tempMarker.setMap(null);
              infoWindow.close();
            }, 3500);

            addNotification(
              "Elevation points must be within India's boundary",
              "warning"
            );
            return;
          }

          // Add elevation point (maximum 2 points)
          setElevationPoints((prevPoints) => {
            if (prevPoints.length >= 2) {
              // Clear existing points and start fresh
              clearElevationPointMarkers();
              // Clear existing polyline
              if (elevationPolyline) {
                elevationPolyline.setMap(null);
                setElevationPolyline(null);
              }
              const newPoints = [{ lat, lng }];
              addElevationPointMarker({ lat, lng }, 1);
              addLog(
                "📈 Elevation points cleared, starting with new first point"
              );
              addNotification(
                "Starting new elevation profile with first point",
                "info"
              );
              return newPoints;
            } else {
              const pointNumber = prevPoints.length + 1;
              const newPoints = [...prevPoints, { lat, lng }];
              addElevationPointMarker({ lat, lng }, pointNumber);

              if (pointNumber === 1) {
                addLog("📈 First elevation point selected");
                addNotification(
                  "First elevation point selected. Click second point.",
                  "info"
                );
              } else {
                addLog("📈 Second elevation point selected");
                const distance = calculateDistance(newPoints[0], newPoints[1]);
                setElevationDistance(distance);
                // Draw polyline connecting the two points
                createElevationPolyline(newPoints);
                addNotification(
                  `Two elevation points selected (${formatDistance(
                    distance
                  )} apart). Click "Get Elevation Data" to view profile.`,
                  "success"
                );
              }

              return newPoints;
            }
          });
          return; // Exit early for elevation mode
        }

        // Check if point is inside India (with fallback to allow clicks if boundary not loaded)
        addLog(
          `🔍 Checking India boundary for: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
        );

        const insideIndia = isInsideIndia({ lat, lng });
        addLog(`🔍 Inside India result: ${insideIndia}`);

        // insInsideIndia returns: true (inside), false (outside), null (not ready/error)
        if (insideIndia === false) {
          addLog("❌ Point outside India boundary");

          // Add temporary visual indicator at invalid point
          const tempMarker = new window.google.maps.Marker({
            position: { lat, lng },
            map: map,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: "#FF1744",
              fillOpacity: 0.7,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
            },
            animation: window.google.maps.Animation.DROP,
            zIndex: 1800,
          });

          // Show brief info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
            <div style="text-align: center; padding: 4px;">
              <div style="color: #d32f2f; font-weight: bold;">❌ Outside India</div>
              <div style="font-size: 11px; color: #666;">Please click within boundaries</div>
            </div>
          `,
            position: { lat, lng },
          });

          infoWindow.open(map);

          // Remove after 3 seconds
          setTimeout(() => {
            tempMarker.setMap(null);
            infoWindow.close();
          }, 3000);

          addNotification(
            "Please click within India's boundary for measurements",
            "warning"
          );
          return;
        } else if (insideIndia === null) {
          addLog("⚠️ India boundary not ready - allowing click");
          addNotification(
            "India boundary data loading... Point added provisionally",
            "info"
          );
          // Continue with click - boundary not ready yet
        } else {
          addLog("✅ Point inside India boundary");
        }

        setPoints((prevPoints) => {
          const newPoints = [...prevPoints, { lat, lng }];
          addLog(`📊 Total points: ${newPoints.length}`);

          // Create marker with better visibility (based on working ElevationTab pattern)
          const marker = new window.google.maps.Marker({
            position: { lat, lng },
            map: map,
            title: `Point ${newPoints.length}`,
            label: {
              text: String.fromCharCode(64 + newPoints.length), // A, B, C...
              color: "white",
              fontSize: "14px",
              fontWeight: "bold",
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 12, // Larger for better visibility
              fillColor: "#FF5722", // Bright orange for all points
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 3,
            },
            animation: window.google.maps.Animation.DROP, // Add animation for visibility
            zIndex: 1500,
          });

          // Add to markers state immediately
          setMarkers((prevMarkers) => {
            const newMarkers = [...prevMarkers, marker];
            addLog(
              `✅ Added marker ${newPoints.length} to state. Total markers: ${newMarkers.length}`
            );
            return newMarkers;
          });

          // Notify user that point was added
          const pointLabel = String.fromCharCode(64 + newPoints.length);
          addNotification(`Point ${pointLabel} added successfully!`, "success");

          // Create/update polyline if we have 2+ points - EXACT SAME AS SIMPLEMAPTEST
          if (newPoints.length >= 2) {
            addLog("🔗 Creating polyline...");

            try {
              // Remove old polyline
              if (polyline) {
                polyline.setMap(null);
              }

              const newPolyline = new window.google.maps.Polyline({
                path: newPoints,
                geodesic: false,
                strokeColor: "#FF5722",
                strokeOpacity: 0.6, // More transparent for subtle display
                strokeWeight: 3, // Thinner line
                zIndex: 100, // Higher than boundary (zIndex: 1)
                map: map,
              });

              setPolyline(newPolyline);
              addLog("✅ Polyline created successfully!");

              // Calculate distances
              const segmentDistance = calculateDistance(
                newPoints[newPoints.length - 2],
                newPoints[newPoints.length - 1]
              );

              // Create distance label for the new segment
              const distanceLabel = createDistanceLabel(
                newPoints[newPoints.length - 2],
                newPoints[newPoints.length - 1],
                segmentDistance,
                map
              );

              setDistanceLabels((prev) => [...prev, distanceLabel]);

              let total = 0;
              for (let i = 1; i < newPoints.length; i++) {
                total += calculateDistance(newPoints[i - 1], newPoints[i]);
              }

              setTotalDistance(total);

              // Update segments
              setSegmentDistances((prev) => [
                ...prev,
                {
                  id: newPoints.length - 1,
                  from: newPoints.length - 1,
                  to: newPoints.length,
                  distance: segmentDistance,
                  formattedDistance: formatDistance(segmentDistance),
                  totalDistance: total,
                  formattedTotalDistance: formatDistance(total),
                },
              ]);
            } catch (error) {
              addLog(`❌ Polyline creation failed: ${error.message}`);
            }
          }

          return newPoints;
        });
      });

      map.setOptions({ draggableCursor: "crosshair" });
    };

    // Start polygon drawing
    const startPolygonDrawing = () => {
      if (!map || !window.google) {
        addLog("❌ Map not ready");
        addNotification("Map not ready", "error");
        return;
      }

      addLog("🗺️ Starting polygon drawing mode...");

      if (streetViewOpen) {
        addLog("🌆 Polygon drawing active in Street View");
        addNotification(
          "Polygon drawing active! Click to add polygon points.",
          "info"
        );
      } else {
        addLog("🗺️ Polygon drawing active on map");
      }

      setIsPolygonDrawing(true);
      setDrawingMode("polygon");
      setPolygonPoints([]);
      setPolygonArea(0);
      setPolygonPerimeter(0);

      // Clear existing polygon elements
      if (polygon) {
        polygon.setMap(null);
        setPolygon(null);
      }

      if (areaLabel) {
        areaLabel.setMap(null);
        setAreaLabel(null);
      }

      polygonMarkers.forEach((marker) => marker.setMap(null));
      setPolygonMarkers([]);

      // Add click listener for polygon
      addLog("👂 Adding polygon click listener...");
      clickListenerRef.current = map.addListener("click", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        addLog(
          `📍 POLYGON CLICK - Clicked at: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
        );

        // Check if point is inside India
        const insideIndia = isInsideIndia({ lat, lng });
        addLog(`🔍 Inside India result: ${insideIndia}`);

        if (insideIndia === false) {
          addLog("❌ Point outside India boundary");
          addNotification("Please click within India's boundary", "warning");
          return;
        } else if (insideIndia === null) {
          addLog("⚠️ India boundary not ready - allowing click");
          addNotification("India boundary data loading...", "info");
        } else {
          addLog("✅ Point inside India boundary");
        }

        setPolygonPoints((prevPoints) => {
          const newPoints = [...prevPoints, { lat, lng }];
          addLog(`📊 Total polygon points: ${newPoints.length}`);

          // Create marker for polygon point
          const marker = new window.google.maps.Marker({
            position: { lat, lng },
            map: map,
            title: `Polygon Point ${newPoints.length}`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#4CAF50", // Green for polygon points
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
            },
            zIndex: 1000,
          });

          setPolygonMarkers((prevMarkers) => [...prevMarkers, marker]);

          // Create/update polygon if we have 3+ points
          if (newPoints.length >= 3) {
            addLog("🔶 Creating/updating polygon...");

            try {
              // Remove old polygon
              if (polygon) {
                polygon.setMap(null);
              }

              const newPolygon = new window.google.maps.Polygon({
                paths: newPoints,
                strokeColor: "#4CAF50",
                strokeOpacity: 0.6,
                strokeWeight: 3,
                fillColor: "#4CAF50",
                fillOpacity: 0.15,
                zIndex: 50,
                map: map,
              });

              setPolygon(newPolygon);
              addLog("✅ Polygon created successfully!");

              // Calculate and display area and perimeter
              const area = calculatePolygonArea(newPoints);
              const perimeter = calculatePolygonPerimeter(newPoints);
              setPolygonArea(area);
              setPolygonPerimeter(perimeter);

              // Create area label at polygon center
              const centerLat =
                newPoints.reduce((sum, p) => sum + p.lat, 0) / newPoints.length;
              const centerLng =
                newPoints.reduce((sum, p) => sum + p.lng, 0) / newPoints.length;

              if (areaLabel) {
                areaLabel.setMap(null);
              }

              const newAreaLabel = new window.google.maps.Marker({
                position: { lat: centerLat, lng: centerLng },
                map: map,
                icon: {
                  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="160" height="50" viewBox="0 0 160 50">
                    <rect width="160" height="50" rx="25" fill="white" stroke="#4CAF50" stroke-width="2" fill-opacity="0.9"/>
                    <text x="80" y="18" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#4CAF50">
                      Area: ${formatArea(area)}
                    </text>
                    <text x="80" y="34" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#4CAF50">
                      Perimeter: ${formatDistance(perimeter)}
                    </text>
                  </svg>
                `)}`,
                  anchor: new window.google.maps.Point(80, 25),
                  scaledSize: new window.google.maps.Size(160, 50),
                },
                zIndex: 75,
              });

              setAreaLabel(newAreaLabel);
            } catch (error) {
              addLog(`❌ Polygon creation failed: ${error.message}`);
            }
          }

          return newPoints;
        });
      });

      map.setOptions({ draggableCursor: "crosshair" });
    };

    // Stop polygon drawing
    const stopPolygonDrawing = () => {
      addLog("⏹️ Stopping polygon drawing mode...");
      addNotification("Polygon drawing stopped", "info");
      setIsPolygonDrawing(false);

      if (clickListenerRef.current) {
        window.google.maps.event.removeListener(clickListenerRef.current);
        clickListenerRef.current = null;
      }

      if (map) {
        map.setOptions({ draggableCursor: null });
      }
    };

    // Polygon data management
    const clearPolygonData = () => {
      addLog("🗑️ === CLEARING POLYGON DATA ===");
      addLog(
        `📉 Before clear - Points: ${polygonPoints.length}, Area: ${polygonArea}, Perimeter: ${polygonPerimeter}`
      );
      addNotification("Clearing polygon data...", "info");

      // Remove path listeners if any
      if (
        polygonPathListenersRef.current &&
        polygonPathListenersRef.current.length > 0
      ) {
        polygonPathListenersRef.current.forEach((l) => {
          try {
            window.google.maps.event.removeListener(l);
          } catch (e) {}
        });
        polygonPathListenersRef.current = [];
        addLog("✅ Polygon path listeners removed");
      }

      // Disable editing if enabled
      if (polygon && typeof polygon.setEditable === "function") {
        polygon.setEditable(false);
        addLog("✅ Polygon editing disabled");
      }

      // Remove polygon from map
      if (polygon) {
        polygon.setMap(null);
        setPolygon(null);
        addLog("✅ Polygon removed from map");
      }

      // Remove area label from map
      if (areaLabel) {
        areaLabel.setMap(null);
        setAreaLabel(null);
        addLog("✅ Area label removed from map");
      }

      // Remove polygon markers from map
      polygonMarkers.forEach((marker, index) => {
        marker.setMap(null);
        addLog(`✅ Polygon marker ${index + 1} removed`);
      });
      setPolygonMarkers([]);

      // Clear polygon state data
      setPolygonPoints([]);
      setPolygonArea(0);
      setPolygonPerimeter(0);
      addLog("✅ Polygon state data cleared");

      // Reset loaded/edit states
      setLoadedPolygonKey(null);
      setLoadedPolygonName("");
      setCanEditLoadedPolygon(false);
      setIsEditingPolygon(false);
      addLog("✅ Polygon edit states reset");

      // Add a small delay to ensure all state updates are processed
      setTimeout(() => {
        addLog("✅ === POLYGON DATA CLEAR COMPLETED ===");
        addLog(
          `📉 After clear - Points: ${polygonPoints.length}, Area: ${polygonArea}, Perimeter: ${polygonPerimeter}`
        );
      }, 10);

      addNotification("Polygon data cleared successfully!", "success");
    };

    const openPolygonSaveDialog = () => {
      if (polygonPoints.length < 3) {
        addNotification("Need at least 3 points to save polygon", "warning");
        return;
      }
      setPolygonName("");
      setPolygonSaveDialogOpen(true);
    };

    const savePolygonData = () => {
      if (!polygonName.trim()) {
        addNotification("Please enter a name for the polygon", "warning");
        return;
      }

      const polygonData = {
        name: polygonName.trim(),
        points: polygonPoints,
        area: polygonArea,
        perimeter: polygonPerimeter,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString(),
      };

      try {
        const key = `polygon_${Date.now()}`;
        localStorage.setItem(key, JSON.stringify(polygonData));
        addLog(`💾 Polygon data saved to localStorage as ${key}`);
        addNotification("Polygon saved!", "success");
        setPolygonSaveDialogOpen(false);
        setPolygonName("");
      } catch (error) {
        addLog(`❌ Failed to save polygon data: ${error.message}`);
        addNotification("Failed to save polygon", "error");
      }
    };

    const loadSavedPolygons = () => {
      const polygons = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("polygon_")) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            polygons.push({ key, ...data });
          } catch (error) {
            console.error("Error parsing saved polygon:", error);
          }
        }
      }
      setSavedPolygons(
        polygons.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      );
    };

    const deletePolygon = () => {
      if (polygonToDelete) {
        // Check if the deleted polygon is the one currently loaded on the map
        const isDeletingLoaded =
          loadedPolygonKey && polygonToDelete.key === loadedPolygonKey;

        // Remove from storage
        localStorage.removeItem(polygonToDelete.key);

        // Refresh list in dialog
        loadSavedPolygons();

        // If it was loaded, clear it from the map immediately
        if (isDeletingLoaded) {
          clearPolygonData();
          addNotification(
            `Deleted and cleared from map: ${polygonToDelete.name}`,
            "success"
          );
        } else {
          addNotification(
            `Deleted polygon: ${polygonToDelete.name}`,
            "success"
          );
        }

        // Close confirmation and reset selection
        setPolygonDeleteConfirmOpen(false);
        setPolygonToDelete(null);
      }
    };

    const cancelDeletePolygon = () => {
      setPolygonDeleteConfirmOpen(false);
      setPolygonToDelete(null);
    };

    const showDeletePolygonConfirmation = (polygon) => {
      setPolygonToDelete(polygon);
      setPolygonDeleteConfirmOpen(true);
    };

    const loadPolygonData = (polygonData) => {
      try {
        if (!polygonData) return;

        addLog(`📂 Loading saved polygon data: ${polygonData.name}...`);
        clearPolygonData();

        setPolygonPoints(polygonData.points);
        setPolygonArea(polygonData.area || 0);
        setPolygonPerimeter(polygonData.perimeter || 0);

        // Track loaded polygon metadata and edit permission (not editing yet)
        setLoadedPolygonKey(polygonData.key);
        setLoadedPolygonName(polygonData.name || "");
        setCanEditLoadedPolygon(true);
        setIsEditingPolygon(false);

        const newMarkers = [];
        polygonData.points.forEach((point, index) => {
          const marker = new window.google.maps.Marker({
            position: point,
            map: map,
            title: `Polygon Point ${index + 1}`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#4CAF50",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
            },
            zIndex: 1000,
          });
          newMarkers.push(marker);
        });

        setPolygonMarkers(newMarkers);

        if (polygonData.points.length >= 3) {
          const newPolygon = new window.google.maps.Polygon({
            paths: polygonData.points,
            strokeColor: "#4CAF50",
            strokeOpacity: 0.6,
            strokeWeight: 3,
            fillColor: "#4CAF50",
            fillOpacity: 0.15,
            zIndex: 50,
            map: map,
          });
          setPolygon(newPolygon);
          // Ensure editing is disabled initially
          if (typeof newPolygon.setEditable === "function") {
            newPolygon.setEditable(false);
          }

          const centerLat =
            polygonData.points.reduce((sum, p) => sum + p.lat, 0) /
            polygonData.points.length;
          const centerLng =
            polygonData.points.reduce((sum, p) => sum + p.lng, 0) /
            polygonData.points.length;

          const newAreaLabel = new window.google.maps.Marker({
            position: { lat: centerLat, lng: centerLng },
            map: map,
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"50\" viewBox=\"0 0 160 50\">\n                <rect width=\"160\" height=\"50\" rx=\"25\" fill=\"white\" stroke=\"#4CAF50\" stroke-width=\"2\" fill-opacity=\"0.9\"/>\n                <text x=\"80\" y=\"18\" text-anchor=\"middle\" font-family=\"Arial, sans-serif\" font-size=\"12\" font-weight=\"bold\" fill=\"#4CAF50\">\n                  Area: ${formatArea(
                polygonData.area
              )}\n                </text>\n                <text x=\"80\" y=\"34\" text-anchor=\"middle\" font-family=\"Arial, sans-serif\" font-size=\"11\" fill=\"#4CAF50\">\n                  Perimeter: ${formatDistance(
                polygonData.perimeter ||
                  calculatePolygonPerimeter(polygonData.points)
              )}\n                </text>\n              </svg>\n            `)}`,
              anchor: new window.google.maps.Point(80, 25),
              scaledSize: new window.google.maps.Size(160, 50),
            },
            zIndex: 75,
          });
          setAreaLabel(newAreaLabel);
        }

        addLog("✅ Polygon data loaded successfully");
        addNotification("Polygon loaded!", "success");

        if (polygonData.points.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          polygonData.points.forEach((point) => bounds.extend(point));
          map.fitBounds(bounds);
        }
      } catch (error) {
        addLog(`❌ Failed to load polygon data: ${error.message}`);
        addNotification("Failed to load polygon", "error");
      }
    };
    // Enable editing of a loaded polygon (after user opts in)
    const enableEditLoadedPolygon = () => {
      if (!polygon || !loadedPolygonKey) {
        addNotification("Load a polygon first to edit", "warning");
        return;
      }

      // Remove any existing path listeners
      if (
        polygonPathListenersRef.current &&
        polygonPathListenersRef.current.length > 0
      ) {
        polygonPathListenersRef.current.forEach((l) => {
          try {
            window.google.maps.event.removeListener(l);
          } catch (e) {}
        });
        polygonPathListenersRef.current = [];
      }

      // Hide vertex markers while editing (Google draws its own handles)
      polygonMarkers.forEach((m) => m.setMap(null));
      setPolygonMarkers([]);

      if (typeof polygon.setEditable === "function") {
        polygon.setEditable(true);
      }
      setIsEditingPolygon(true);

      const path = polygon.getPath();
      const updateFromPath = () => {
        const arr = path
          .getArray()
          .map((ll) => ({ lat: ll.lat(), lng: ll.lng() }));
        setPolygonPoints(arr);
        const area = calculatePolygonArea(arr);
        const perim = calculatePolygonPerimeter(arr);
        setPolygonArea(area);
        setPolygonPerimeter(perim);
        // Update center label
        const centerLat = arr.reduce((s, p) => s + p.lat, 0) / arr.length;
        const centerLng = arr.reduce((s, p) => s + p.lng, 0) / arr.length;
        if (areaLabel) areaLabel.setMap(null);
        const newAreaLabel = new window.google.maps.Marker({
          position: { lat: centerLat, lng: centerLng },
          map: map,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="160" height="50" viewBox="0 0 160 50">
              <rect width="160" height="50" rx="25" fill="white" stroke="#4CAF50" stroke-width="2" fill-opacity="0.9"/>
              <text x="80" y="18" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#4CAF50">
                Area: ${formatArea(area)}
              </text>
              <text x="80" y="34" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#4CAF50">
                Perimeter: ${formatDistance(perim)}
              </text>
            </svg>
          `)}`,
            anchor: new window.google.maps.Point(80, 25),
            scaledSize: new window.google.maps.Size(160, 50),
          },
          zIndex: 75,
        });
        setAreaLabel(newAreaLabel);
      };

      // Attach listeners for path changes
      const l1 = window.google.maps.event.addListener(
        path,
        "set_at",
        updateFromPath
      );
      const l2 = window.google.maps.event.addListener(
        path,
        "insert_at",
        updateFromPath
      );
      const l3 = window.google.maps.event.addListener(
        path,
        "remove_at",
        updateFromPath
      );
      polygonPathListenersRef.current = [l1, l2, l3];
    };

    // Save edited polygon back to localStorage (overwrite existing key)
    const saveEditedPolygon = () => {
      if (!loadedPolygonKey) {
        addNotification("No loaded polygon to update", "warning");
        return;
      }
      const data = {
        name: loadedPolygonName || `Polygon ${Date.now()}`,
        points: polygonPoints,
        area: polygonArea,
        perimeter: polygonPerimeter,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString(),
      };
      try {
        localStorage.setItem(loadedPolygonKey, JSON.stringify(data));
        addNotification("Polygon updated successfully!", "success");
        setIsEditingPolygon(false);
        setCanEditLoadedPolygon(true);
        // Turn off editing and listeners
        if (polygon && typeof polygon.setEditable === "function")
          polygon.setEditable(false);
        if (
          polygonPathListenersRef.current &&
          polygonPathListenersRef.current.length > 0
        ) {
          polygonPathListenersRef.current.forEach((l) => {
            try {
              window.google.maps.event.removeListener(l);
            } catch (e) {}
          });
          polygonPathListenersRef.current = [];
        }
      } catch (e) {
        addNotification("Failed to update polygon", "error");
      }
    };

    // Cancel edits and reload original from storage
    const cancelEditLoadedPolygon = () => {
      if (!loadedPolygonKey) {
        setIsEditingPolygon(false);
        return;
      }
      try {
        const raw = localStorage.getItem(loadedPolygonKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          loadPolygonData({ key: loadedPolygonKey, ...parsed });
        }
        // Disable editing state
        setIsEditingPolygon(false);
        if (polygon && typeof polygon.setEditable === "function")
          polygon.setEditable(false);
        if (
          polygonPathListenersRef.current &&
          polygonPathListenersRef.current.length > 0
        ) {
          polygonPathListenersRef.current.forEach((l) => {
            try {
              window.google.maps.event.removeListener(l);
            } catch (e) {}
          });
          polygonPathListenersRef.current = [];
        }
      } catch (e) {
        addNotification("Failed to cancel edits", "error");
      }
    };

    const stopDrawing = () => {
      addLog("⏹️ Stopping drawing mode...");
      addNotification("Measurement stopped", "info");
      setIsDrawing(false);

      if (clickListenerRef.current) {
        window.google.maps.event.removeListener(clickListenerRef.current);
        clickListenerRef.current = null;
      }

      if (map) {
        map.setOptions({ draggableCursor: null });
      }
    };

    const clearAll = () => {
      addLog("🧹 === STARTING COMPLETE CLEAR OPERATION ===");
      addLog(
        `📊 Current state - Markers: ${markers.length}, Labels: ${distanceLabels.length}, Points: ${points.length}`
      );
      addNotification("Clearing all measurements...", "info");

      try {
        // Force stop drawing mode if active
        if (isDrawing) {
          addLog("⏹️ Force stopping drawing mode...");

          if (clickListenerRef.current) {
            try {
              window.google.maps.event.removeListener(clickListenerRef.current);
              addLog("✅ Click listener removed");
            } catch (error) {
              console.error("Error removing click listener:", error);
            }
            clickListenerRef.current = null;
          }

          if (map) {
            try {
              map.setOptions({ draggableCursor: null });
              addLog("✅ Cursor reset");
            } catch (error) {
              console.error("Error resetting cursor:", error);
            }
          }

          setIsDrawing(false);
        }

        // Clear polyline with enhanced error handling
        if (polyline) {
          addLog("🗑️ Removing polyline...");
          try {
            if (polyline.setMap && typeof polyline.setMap === "function") {
              polyline.setMap(null);
              addLog("✅ Polyline removed successfully");
            } else {
              addLog("⚠️ Polyline setMap method not available");
            }
          } catch (error) {
            addLog(`❌ Error removing polyline: ${error.message}`);
          }
        }
        setPolyline(null);

        // Force clear any remaining polylines on map (aggressive clearing)
        try {
          // This is a more aggressive approach to ensure all polylines are removed
          if (map && map.data) {
            map.data.setMap(null);
            addLog("✅ Data layer cleared");
          }

          // Trigger map refresh to ensure all elements are properly cleared
          if (map) {
            window.google.maps.event.trigger(map, "resize");
            addLog("✅ Map refresh triggered");
          }
        } catch (error) {
          addLog(`⚠️ Error during aggressive clearing: ${error.message}`);
        }

        // Clear all markers with enhanced error handling
        const markerCount = markers.length;
        addLog(`🗑️ Removing ${markerCount} markers...`);

        markers.forEach((marker, index) => {
          try {
            if (
              marker &&
              marker.setMap &&
              typeof marker.setMap === "function"
            ) {
              marker.setMap(null);
              addLog(`✅ Marker ${index + 1}/${markerCount} removed`);
            } else {
              addLog(`⚠️ Marker ${index + 1} invalid or no setMap method`);
            }
          } catch (error) {
            addLog(`❌ Error removing marker ${index + 1}: ${error.message}`);
          }
        });

        // Clear all distance labels with enhanced error handling
        const labelCount = distanceLabels.length;
        addLog(`🗑️ Removing ${labelCount} distance labels...`);

        distanceLabels.forEach((label, index) => {
          try {
            if (label && label.setMap && typeof label.setMap === "function") {
              label.setMap(null);
              addLog(`✅ Distance label ${index + 1}/${labelCount} removed`);
            } else {
              addLog(
                `⚠️ Distance label ${index + 1} invalid or no setMap method`
              );
            }
          } catch (error) {
            addLog(
              `❌ Error removing distance label ${index + 1}: ${error.message}`
            );
          }
        });

        // Clear all state variables
        setMarkers([]);
        setDistanceLabels([]);
        setPoints([]);
        setTotalDistance(0);
        setSegmentDistances([]);

        // Also clear polygon data to ensure complete clearing
        if (polygon) {
          try {
            polygon.setMap(null);
            addLog("✅ Polygon removed during clear all");
          } catch (error) {
            addLog(
              `❌ Error removing polygon during clear all: ${error.message}`
            );
          }
        }
        setPolygon(null);

        if (areaLabel) {
          try {
            areaLabel.setMap(null);
            addLog("✅ Area label removed during clear all");
          } catch (error) {
            addLog(
              `❌ Error removing area label during clear all: ${error.message}`
            );
          }
        }
        setAreaLabel(null);

        polygonMarkers.forEach((marker, index) => {
          try {
            if (
              marker &&
              marker.setMap &&
              typeof marker.setMap === "function"
            ) {
              marker.setMap(null);
              addLog(`✅ Polygon marker ${index + 1} removed during clear all`);
            }
          } catch (error) {
            addLog(
              `❌ Error removing polygon marker ${index + 1}: ${error.message}`
            );
          }
        });
        setPolygonMarkers([]);
        setPolygonPoints([]);
        setPolygonArea(0);
        setPolygonPerimeter(0);

        // Reset loaded polygon states
        setLoadedPolygonKey(null);
        setLoadedPolygonName("");
        setCanEditLoadedPolygon(false);
        setIsEditingPolygon(false);

        // Clear India boundary from map
        if (clearIndiaBoundary) {
          try {
            clearIndiaBoundary();
            addLog("✅ India boundary cleared from map");
          } catch (error) {
            addLog(`❌ Error clearing India boundary: ${error.message}`);
          }
        }

        // Clear KML infrastructure layers
        try {
          if (popKmlLayer && popKmlLayer.markers) {
            popKmlLayer.markers.forEach((marker) => marker.setMap(null));
            addLog(`✅ Cleared ${popKmlLayer.markers.length} POP markers`);
          }
          if (subPopKmlLayer && subPopKmlLayer.markers) {
            subPopKmlLayer.markers.forEach((marker) => marker.setMap(null));
            addLog(
              `✅ Cleared ${subPopKmlLayer.markers.length} Sub-POP markers`
            );
          }
          setShowPopLayer(false);
          setShowSubPopLayer(false);
        } catch (error) {
          addLog(`❌ Error clearing KML layers: ${error.message}`);
        }

        // Close Street View if open
        try {
          const streetView = map?.getStreetView?.();
          if (streetView && streetView.getVisible && streetView.getVisible()) {
            streetView.setVisible(false);
            setStreetViewOpen(false);
            addLog("🌆 Street View closed during clear all");
          }
        } catch (e) {
          addLog("⚠️ Could not close Street View during clear all");
        }

        // Clear elevation data
        try {
          clearElevationData();
          addLog("🏔️ Elevation data cleared during clear all");
        } catch (e) {
          addLog("⚠️ Could not clear elevation data during clear all");
        }

        // Final aggressive clearing - remove any remaining overlays
        try {
          if (map) {
            // Clear any InfoWindows that might be open
            if (window.google?.maps?.InfoWindow) {
              // Note: We can't easily track all InfoWindows, but they'll close when elements are removed
            }

            // Force a complete map refresh
            setTimeout(() => {
              if (map) {
                window.google.maps.event.trigger(map, "resize");
                addLog("🔄 Final map refresh completed");
              }
            }, 100);
          }
        } catch (error) {
          addLog(`⚠️ Error during final clearing: ${error.message}`);
        }

        addLog(
          "✅ All state (including polygons and boundary) cleared successfully"
        );
        addLog("✅ Clear all operation completed!");
        addNotification(
          "All measurements, polygons, and boundary cleared successfully!",
          "success"
        );
      } catch (error) {
        addLog(`❌ Critical error during clear all: ${error.message}`);
        addNotification("Error clearing measurements", "error");

        // Force reset state even if errors occurred
        setIsDrawing(false);
        setPolyline(null);
        setMarkers([]);
        setDistanceLabels([]);
        setPoints([]);
        setTotalDistance(0);
        setSegmentDistances([]);

        // Also force reset polygon states
        setPolygon(null);
        setAreaLabel(null);
        setPolygonMarkers([]);
        setPolygonPoints([]);
        setPolygonArea(0);
        setPolygonPerimeter(0);
        setLoadedPolygonKey(null);
        setLoadedPolygonName("");
        setCanEditLoadedPolygon(false);
        setIsEditingPolygon(false);

        clickListenerRef.current = null;
      }
    };

    // Map controls
    const zoomIn = () => {
      if (map) {
        map.setZoom(map.getZoom() + 1);
      }
    };

    const zoomOut = () => {
      if (map) {
        map.setZoom(map.getZoom() - 1);
      }
    };

    const centerOnIndia = () => {
      if (map && indiaBounds) {
        map.fitBounds(indiaBounds);
      } else if (map) {
        map.setCenter({ lat: 20.5937, lng: 78.9629 });
        map.setZoom(6);
      }
    };

    // Load MarkerClusterer library from CDN
    useEffect(() => {
      if (!map || clustererLoadedRef.current) return;
      const script = document.createElement("script");
      script.src =
        "https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js";
      script.async = true;
      script.onload = () => {
        clustererLoadedRef.current = true;
        addLog("✅ MarkerClusterer library loaded");
        // Initialize clusterers if markers already exist
        tryInitClusterers();
      };
      script.onerror = () =>
        addLog("❌ Failed to load MarkerClusterer library");
      document.body.appendChild(script);
    }, [map]);

    const tryInitClusterers = () => {
      try {
        const MarkerClusterer = window.markerClusterer?.MarkerClusterer;
        if (!MarkerClusterer || !map) {
          addLog("⚠️ MarkerClusterer not available or map not ready");
          return;
        }

        // Initialize POP clusterer if not exists
        if (!popClusterRef.current) {
          popClusterRef.current = new MarkerClusterer({
            map: showPopLayer ? map : null,
            markers: popKmlLayer?.markers || [],
            gridSize: 60,
            maxZoom: 15,
          });
          addLog("✅ POP clusterer initialized");
        }

        // Initialize Sub-POP clusterer if not exists
        if (!subClusterRef.current) {
          subClusterRef.current = new MarkerClusterer({
            map: showSubPopLayer ? map : null,
            markers: subPopKmlLayer?.markers || [],
            gridSize: 60,
            maxZoom: 15,
          });
          addLog("✅ Sub-POP clusterer initialized");
        }

        // Initialize imported clusterer if not exists
        if (!importedClusterRef.current) {
          importedClusterRef.current = new MarkerClusterer({
            map: showImportedLayer ? map : null,
            markers: importedMarkers || [],
            gridSize: 60,
            maxZoom: 15,
          });
          addLog("✅ Imported clusterer initialized");
        }

        addLog("✅ All clusterers initialized successfully");
      } catch (e) {
        addLog(`⚠️ Could not initialize clusterers: ${e.message}`);
      }
    };

    // KML Layer Management - Create markers directly from KML content
    const loadKmlLayer = async (url, layerType) => {
      if (!map || !window.google) {
        addLog(`❌ Cannot load ${layerType} KML: Map or Google Maps not ready`);
        return null;
      }

      try {
        // First try to fetch and parse the KML file
        const fullUrl = `${window.location.origin}${url}`;
        addLog(`🔄 Loading ${layerType} KML from: ${fullUrl}`);

        const response = await fetch(fullUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const kmlText = await response.text();
        addLog(
          `✅ ${layerType} KML file fetched, ${kmlText.length} characters`
        );

        // Parse KML and create markers
        const markers = parseKmlAndCreateMarkers(kmlText, layerType);

        if (markers.length > 0) {
          addLog(`✅ Created ${markers.length} ${layerType} markers from KML`);
          addNotification(
            `${layerType} locations loaded (${markers.length} items)`,
            "success"
          );
          // Add to clusterer if available
          if (
            clustererLoadedRef.current &&
            window.markerClusterer?.MarkerClusterer
          ) {
            if (layerType === "POP") {
              if (!popClusterRef.current) tryInitClusterers();
              popClusterRef.current?.addMarkers(markers);
            } else {
              if (!subClusterRef.current) tryInitClusterers();
              subClusterRef.current?.addMarkers(markers);
            }
          }
          return { markers, type: layerType };
        } else {
          throw new Error("No valid locations found in KML");
        }
      } catch (error) {
        addLog(`❌ Error loading ${layerType} KML: ${error.message}`);

        // Fallback: Create dummy markers for testing
        addLog(`🔄 Creating dummy ${layerType} markers for testing...`);
        const dummyMarkers = createDummyMarkers(layerType);

        return { markers: dummyMarkers, type: layerType };
      }
    };

    // Parse KML content and create markers
    const parseKmlAndCreateMarkers = (kmlText, layerType) => {
      const markers = [];
      const isPopLayer = layerType === "POP";
      const color = isPopLayer ? "#FF6B35" : "#4CAF50";

      try {
        // Create a DOM parser to parse KML XML
        const parser = new DOMParser();
        const kmlDoc = parser.parseFromString(kmlText, "text/xml");

        // Find all Placemark elements
        const placemarks = kmlDoc.getElementsByTagName("Placemark");
        addLog(`🔍 Found ${placemarks.length} placemarks in ${layerType} KML`);

        for (let i = 0; i < placemarks.length; i++) {
          const placemark = placemarks[i];

          // Get name
          const nameElement = placemark.getElementsByTagName("name")[0];
          const name = nameElement
            ? nameElement.textContent
            : `${layerType} Location ${i + 1}`;

          // Get description
          const descElement = placemark.getElementsByTagName("description")[0];
          const description = descElement ? descElement.textContent : "";

          // Get coordinates
          const coordsElement =
            placemark.getElementsByTagName("coordinates")[0];
          if (coordsElement) {
            const coordsText = coordsElement.textContent.trim();
            const coords = coordsText.split(",");

            if (coords.length >= 2) {
              const lng = parseFloat(coords[0]);
              const lat = parseFloat(coords[1]);

              if (!isNaN(lat) && !isNaN(lng)) {
                // Create marker
                const marker = new window.google.maps.Marker({
                  position: { lat, lng },
                  map: map,
                  title: name,
                  icon: {
                    url: createTowerIconVariant(isPopLayer ? "pop" : "sub"),
                    scaledSize: new window.google.maps.Size(40, 40),
                    anchor: new window.google.maps.Point(20, 35),
                  },
                });

                // Extract extended data for POP/Sub-POP and add detailed info window
                const extended = extractKMLExtendedData(placemark);
                const infoWindow = new window.google.maps.InfoWindow({
                  content: createKMLInfoWindow(
                    name,
                    description,
                    lat,
                    lng,
                    layerType,
                    extended
                  ),
                });

                marker.addListener("click", () => {
                  infoWindow.open(map, marker);
                });

                markers.push(marker);
                addLog(
                  `✅ Created ${layerType} marker: ${name} at ${lat.toFixed(
                    4
                  )}, ${lng.toFixed(4)}`
                );
              }
            }
          }
        }
      } catch (error) {
        addLog(`❌ Error parsing ${layerType} KML XML: ${error.message}`);
      }

      return markers;
    };

    // Create dummy markers for testing when KML files fail
    const createDummyMarkers = (layerType) => {
      const isPopLayer = layerType === "POP";
      const color = isPopLayer ? "#FF6B35" : "#4CAF50";
      const locations = isPopLayer
        ? [
            { lat: 28.6139, lng: 77.209, name: "Delhi POP" },
            { lat: 19.076, lng: 72.8777, name: "Mumbai POP" },
            { lat: 12.9716, lng: 77.5946, name: "Bangalore POP" },
          ]
        : [
            { lat: 28.5355, lng: 77.391, name: "Noida Sub-POP" },
            { lat: 19.1136, lng: 72.8697, name: "Andheri Sub-POP" },
            { lat: 13.0358, lng: 77.597, name: "Whitefield Sub-POP" },
          ];

      const markers = [];

      locations.forEach((location, index) => {
        const marker = new window.google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: map,
          title: location.name,
          icon: {
            url: createTowerIconVariant(isPopLayer ? "pop" : "sub"),
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 35),
          },
        });

        // Add info window with detailed styling
        const infoWindow = new window.google.maps.InfoWindow({
          content: createKMLInfoWindow(
            location.name,
            `Test ${layerType} location`,
            location.lat,
            location.lng,
            layerType
          ),
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        markers.push(marker);
      });

      addLog(`✅ Created ${locations.length} dummy ${layerType} markers`);
      addNotification(`${layerType} test locations created`, "info");

      return markers;
    };

    // Import file functionality
    const handleFileImport = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const fileName = file.name.toLowerCase();
      addLog(`📁 Importing file: ${file.name} (${file.size} bytes)`);

      if (fileName.endsWith(".kml")) {
        importKMLFile(file);
      } else if (fileName.endsWith(".kmz")) {
        importKMZFile(file);
      } else if (fileName.endsWith(".csv")) {
        importCSVFile(file);
      } else if (fileName.endsWith(".xlsx")) {
        importXLSXFile(file);
      } else {
        addLog("❌ Unsupported file format");
        addNotification("Please select KML, KMZ, CSV, or XLSX file", "error");
      }

      // Reset input
      event.target.value = "";
    };

    const importKMLFile = (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const kmlText = e.target.result;
        const markers = parseKmlAndCreateImportedMarkers(kmlText, "Imported");
        addImportedMarkers(markers);
      };
      reader.readAsText(file);
    };

    const importKMZFile = async (file) => {
      try {
        // Load JSZip from CDN if not present
        if (!window.JSZip) {
          await new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src =
              "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";
            s.onload = resolve;
            s.onerror = reject;
            document.body.appendChild(s);
          });
          addLog("✅ JSZip loaded");
        }
        const buffer = await file.arrayBuffer();
        const zip = await window.JSZip.loadAsync(buffer);
        // Try to find a KML file inside (commonly doc.kml)
        const kmlFileEntry = Object.keys(zip.files).find((name) =>
          name.toLowerCase().endsWith(".kml")
        );
        if (!kmlFileEntry) throw new Error("No KML file found inside KMZ");
        const kmlText = await zip.files[kmlFileEntry].async("text");
        const markers = parseKmlAndCreateImportedMarkers(
          kmlText,
          "Imported (KMZ)"
        );
        addImportedMarkers(markers);
      } catch (e) {
        addLog(`❌ KMZ import failed: ${e.message}`);
        addNotification(`KMZ import failed: ${e.message}`, "error");
      }
    };
    const importCSVFile = (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target.result;
        const markers = parseCSVAndCreateMarkers(csvText);
        addImportedMarkers(markers);
      };
      reader.readAsText(file);
    };

    const importXLSXFile = async (file) => {
      try {
        // Load SheetJS from CDN if not present
        if (!window.XLSX) {
          await new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src =
              "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
            s.onload = resolve;
            s.onerror = reject;
            document.body.appendChild(s);
          });
          addLog("✅ XLSX library loaded");
        }
        const buffer = await file.arrayBuffer();
        const wb = window.XLSX.read(new Uint8Array(buffer), { type: "array" });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rows = window.XLSX.utils.sheet_to_json(ws, { defval: "" });
        const markers = [];
        rows.forEach((row) => {
          // Detect lat/lng columns by name
          const keys = Object.keys(row).reduce((acc, k) => {
            acc[k.toLowerCase()] = row[k];
            return acc;
          }, {});
          const lat = parseFloat(keys.latitude ?? keys.lat);
          const lng = parseFloat(keys.longitude ?? keys.lng ?? keys.lon);
          if (!isNaN(lat) && !isNaN(lng)) {
            const marker = createDetailedMarker(lat, lng, keys, "XLSX Import");
            markers.push(marker);
          }
        });
        addImportedMarkers(markers);
      } catch (e) {
        addLog(`❌ XLSX import failed: ${e.message}`);
        addNotification(`XLSX import failed: ${e.message}`, "error");
      }
    };

    const parseCSVAndCreateMarkers = (csvText) => {
      const markers = [];
      const lines = csvText.split("\n");
      if (lines.length < 2) return markers;

      // Parse header
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      addLog(`📋 CSV headers: ${headers.join(", ")}`);

      // Find required columns
      const latIndex = headers.findIndex((h) => h.includes("lat"));
      const lngIndex = headers.findIndex(
        (h) => h.includes("lng") || h.includes("lon")
      );

      if (latIndex === -1 || lngIndex === -1) {
        addLog("❌ CSV must have latitude and longitude columns");
        addNotification("CSV must have lat/lng columns", "error");
        return markers;
      }

      // Parse data rows
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values.length < headers.length) continue;

        const lat = parseFloat(values[latIndex]);
        const lng = parseFloat(values[lngIndex]);

        if (!isNaN(lat) && !isNaN(lng)) {
          // Create data object with all fields
          const data = {};
          headers.forEach((header, index) => {
            data[header] = values[index] || "";
          });

          const marker = createDetailedMarker(lat, lng, data, "CSV Import");
          markers.push(marker);
        }
      }

      return markers;
    };

    const parseKmlAndCreateImportedMarkers = (kmlText, type) => {
      const markers = [];

      try {
        const parser = new DOMParser();
        const kmlDoc = parser.parseFromString(kmlText, "text/xml");
        const placemarks = kmlDoc.getElementsByTagName("Placemark");

        for (let i = 0; i < placemarks.length; i++) {
          const placemark = placemarks[i];
          const coordsElement =
            placemark.getElementsByTagName("coordinates")[0];

          if (coordsElement) {
            const coordsText = coordsElement.textContent.trim();
            const coords = coordsText.split(",");

            if (coords.length >= 2) {
              const lng = parseFloat(coords[0]);
              const lat = parseFloat(coords[1]);

              if (!isNaN(lat) && !isNaN(lng)) {
                // Extract extended data
                const data = extractKMLExtendedData(placemark);
                const marker = createDetailedMarker(lat, lng, data, type);
                markers.push(marker);
              }
            }
          }
        }
      } catch (error) {
        addLog(`❌ Error parsing imported KML: ${error.message}`);
      }

      return markers;
    };

    const extractKMLExtendedData = (placemark) => {
      const data = {};

      // Get basic name and description
      const nameElement = placemark.getElementsByTagName("name")[0];
      const descElement = placemark.getElementsByTagName("description")[0];

      data.name = nameElement ? nameElement.textContent : "";
      data.description = descElement ? descElement.textContent : "";

      // Get ExtendedData
      const extendedDataElements =
        placemark.getElementsByTagName("ExtendedData")[0];
      if (extendedDataElements) {
        const dataElements = extendedDataElements.getElementsByTagName("Data");
        for (let i = 0; i < dataElements.length; i++) {
          const dataElement = dataElements[i];
          const name = dataElement.getAttribute("name");
          const valueElement = dataElement.getElementsByTagName("value")[0];
          if (name && valueElement) {
            data[name.toLowerCase()] = valueElement.textContent;
          }
        }
      }

      return data;
    };

    const createDetailedMarker = (lat, lng, data, type) => {
      // Determine icon variant: pop, sub, imported
      let variant = "imported";
      const nameLower = (data.name || "").toLowerCase();
      if (data.type === "POP" || nameLower.includes("pop")) variant = "pop";
      if (data.type === "Sub-POP" || nameLower.includes("sub")) variant = "sub";

      const iconConfig = {
        url: createTowerIconVariant(variant),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 35),
      };

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: data.name || "Imported Location",
        icon: iconConfig,
      });

      // Create detailed info window
      const infoContent = createDetailedInfoWindow(data, type, lat, lng);
      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      return marker;
    };

    const createTowerIconVariant = (variant) => {
      // Variants: 'pop' (blue), 'sub' (teal), 'imported' (purple)
      const palette = {
        pop: { base: "#1E88E5", dark: "#1565C0" },
        sub: { base: "#26A69A", dark: "#00897B" },
        imported: { base: "#9C27B0", dark: "#673AB7" },
      };
      const { base: color, dark } = palette[variant] || palette.imported;
      const strokeWidth = 3;

      return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.5)"/>
          </filter>
        </defs>
        
        <!-- White background circle for visibility -->
        <circle cx="20" cy="20" r="18" fill="white" stroke="${dark}" stroke-width="2" filter="url(#shadow)"/>
        
        <!-- Tower base -->
        <rect x="18" y="25" width="4" height="10" fill="${color}" stroke="white" stroke-width="1"/>
        
        <!-- Tower sections -->
        <rect x="16" y="20" width="8" height="5" fill="${color}" stroke="white" stroke-width="1"/>
        <rect x="14" y="15" width="12" height="5" fill="${color}" stroke="white" stroke-width="1"/>
        
        <!-- Antenna -->
        <line x1="20" y1="15" x2="20" y2="8" stroke="${color}" stroke-width="${strokeWidth}"/>
        <circle cx="20" cy="8" r="2" fill="${color}"/>
        
        <!-- Signal waves -->
        <path d="M 10 20 Q 20 10 30 20" stroke="${color}" stroke-width="2" fill="none" opacity="0.8"/>
        <path d="M 8 22 Q 20 8 32 22" stroke="${color}" stroke-width="2" fill="none" opacity="0.6"/>
        
        <!-- Center indicator -->
        <circle cx="20" cy="35" r="3" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="20" y="38" text-anchor="middle" fill="white" font-size="8" font-weight="bold">T</text>
      </svg>
    `)}`;
    };

    const createDetailedInfoWindow = (data, type, lat, lng) => {
      const fields = [
        { key: "id", label: "ID" },
        { key: "uniqueid", label: "Unique ID" },
        { key: "networkid", label: "Network ID" },
        { key: "ref-code", label: "Reference Code" },
        { key: "refcode", label: "Reference Code" },
        { key: "name", label: "Name" },
        { key: "status", label: "Status" },
        { key: "createdon", label: "Created On" },
        { key: "updatedon", label: "Updated On" },
        { key: "address", label: "Address" },
        { key: "contactname", label: "Contact Name" },
        { key: "contactno", label: "Contact Number" },
        { key: "is-rented", label: "Is Rented" },
        { key: "isrented", label: "Is Rented" },
        { key: "agreement-start-date", label: "Agreement Start Date" },
        { key: "agreementstartdate", label: "Agreement Start Date" },
        { key: "agreement-end-date", label: "Agreement End Date" },
        { key: "agreementenddate", label: "Agreement End Date" },
        { key: "nature of business", label: "Nature of Business" },
        { key: "natureofbusiness", label: "Nature of Business" },
        { key: "naturebusiness", label: "Nature of Business" },
        { key: "structuretype", label: "Structure Type" },
        { key: "structure-type", label: "Structure Type" },
        { key: "ups", label: "UPS Availability" },
        { key: "upsavaibility", label: "UPS Availability" },
        { key: "backup", label: "Backup Availability" },
        { key: "back avaibility", label: "Backup Availability" },
        { key: "backavaibility", label: "Backup Availability" },
        { key: "description", label: "Description" },
        { key: "type", label: "Type" },
        { key: "latitude", label: "Latitude" },
        { key: "longitude", label: "Longitude" },
      ];

      let content = `
      <div style="max-width: 400px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.4;">
        <div style="background: linear-gradient(135deg, #9C27B0, #673AB7); color: white; padding: 15px; margin: -8px -8px 15px -8px; border-radius: 8px 8px 0 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
          <h3 style="margin: 0; font-size: 18px; font-weight: 600;">${
            data.name || "Infrastructure Location"
          }</h3>
          <div style="margin-top: 8px; opacity: 0.9; font-size: 13px;">
            <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px; margin-right: 8px;">${type}</span>
            <span>${lat.toFixed(6)}, ${lng.toFixed(6)}</span>
          </div>
        </div>
        <div style="
          max-height: 350px; 
          overflow-y: hidden;
          padding-right: 0px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        ">
          <div style="
            overflow-y: auto;
            max-height: 350px;
            padding-right: 15px;
            margin-right: -15px;
          ">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
    `;

      // Add all available fields, checking multiple possible key variations
      const addedFields = new Set();

      fields.forEach((field) => {
        if (addedFields.has(field.label)) return; // Avoid duplicates

        let value = data[field.key];

        // Try multiple key variations
        if (!value || value.toString().trim() === "") {
          value =
            data[field.key.replace("-", "")] ||
            data[field.key.replace(" ", "")] ||
            data[field.key.toLowerCase()] ||
            data[field.key.replace(/[^a-zA-Z0-9]/g, "")];
        }

        if (
          value &&
          value.toString().trim() &&
          value.toString().trim() !== ""
        ) {
          addedFields.add(field.label);

          // Add status styling
          let displayValue = value.toString();
          if (field.key === "status" || field.label.includes("Status")) {
            const statusColor =
              displayValue.toLowerCase() === "active"
                ? "#4CAF50"
                : displayValue.toLowerCase() === "maintenance"
                ? "#FF9800"
                : "#666";
            displayValue = `<span style="color: ${statusColor}; font-weight: 600;">${displayValue}</span>`;
          }

          // Add rental status styling
          if (field.label.includes("Rented")) {
            const rentColor =
              displayValue.toLowerCase() === "yes" ? "#4CAF50" : "#F44336";
            displayValue = `<span style="color: ${rentColor}; font-weight: 600;">${displayValue}</span>`;
          }

          content += `
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555; vertical-align: top; min-width: 120px;">${field.label}:</td>
            <td style="padding: 8px 0; color: #333; word-break: break-word; line-height: 1.3;">${displayValue}</td>
          </tr>
        `;
        }
      });

      // Add coordinates if not already added
      if (!addedFields.has("Latitude")) {
        content += `
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Coordinates:</td>
          <td style="padding: 8px 0; color: #333; font-family: monospace;">${lat.toFixed(
            6
          )}, ${lng.toFixed(6)}</td>
        </tr>
      `;
      }

      content += `
          </table>
          </div>
        </div>
        <div style="text-align: center; padding: 10px; color: #999; font-size: 11px; border-top: 1px solid #f0f0f0; margin-top: 10px;">
          Imported Infrastructure Data
        </div>
      </div>
    `;

      return content;
    };

    // Create comprehensive info window for manually added locations
    const createManualLocationInfoWindow = (location, layerType) => {
      const isPopType = layerType.toUpperCase() === "POP";
      const headerColor = isPopType ? "#FF6B35" : "#4CAF50";
      const headerColorDark = isPopType ? "#E55A2B" : "#45A049";

      // Format values for display
      const formatValue = (value, field = "") => {
        if (value === null || value === undefined || value === "") return "N/A";

        // Format dates
        if (
          field.includes("date") ||
          field.includes("created") ||
          field.includes("updated")
        ) {
          try {
            return new Date(value).toLocaleDateString();
          } catch (e) {
            return value.toString();
          }
        }

        // Format boolean values
        if (typeof value === "boolean") {
          return value ? "Yes" : "No";
        }

        // Format rent amount
        if (field.includes("rent") && typeof value === "number" && value > 0) {
          return `₹${value.toLocaleString()}`;
        }

        return value.toString();
      };

      const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
          case "active":
            return "#4CAF50";
          case "maintenance":
            return "#FF9800";
          case "rfs":
            return "#2196F3";
          case "inactive":
            return "#F44336";
          default:
            return "#666";
        }
      };

      return `
      <div style="
        max-width: 450px; 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        line-height: 1.4;
        overflow: hidden;
      ">
        <div style="
          background: linear-gradient(135deg, ${headerColor}, ${headerColorDark}); 
          color: white; 
          padding: 15px; 
          margin: -8px -8px 15px -8px; 
          border-radius: 8px 8px 0 0; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        ">
          <h3 style="margin: 0; font-size: 18px; font-weight: 600;">
            ${location.name || `${layerType.toUpperCase()} Location`}
          </h3>
          <div style="margin-top: 8px; opacity: 0.9; font-size: 13px;">
            <span style="
              background: rgba(255,255,255,0.2); 
              padding: 2px 8px; 
              border-radius: 12px; 
              margin-right: 8px;
            ">${layerType.toUpperCase()}</span>
            <span>ID: ${location.id || "N/A"}</span>
          </div>
        </div>
        
        <div style="
          max-height: 400px; 
          overflow-y: hidden;
          padding-right: 0px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        ">
          <div style="
            overflow-y: auto;
            max-height: 400px;
            padding-right: 15px;
            margin-right: -15px;
          ">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <!-- Basic Information -->
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555; min-width: 140px;">ID:</td>
                <td style="padding: 8px 0; color: #333;">${formatValue(
                  location.id
                )}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Network ID:</td>
                <td style="padding: 8px 0; color: #333; word-break: break-word;">${formatValue(
                  location.network_id
                )}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Unique ID:</td>
                <td style="padding: 8px 0; color: #333; word-break: break-word;">${formatValue(
                  location.unique_id
                )}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Ref Code:</td>
                <td style="padding: 8px 0; color: #333;">${formatValue(
                  location.ref_code
                )}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Name:</td>
                <td style="padding: 8px 0; color: #333; word-break: break-word;">${formatValue(
                  location.name
                )}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Status:</td>
                <td style="padding: 8px 0;">
                  <span style="
                    color: ${getStatusColor(location.status)}; 
                    font-weight: 600;
                    background: ${getStatusColor(location.status)}20;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                  ">${formatValue(location.status)}</span>
                </td>
              </tr>
              
              <!-- Timestamps -->
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Created On:</td>
                <td style="padding: 8px 0; color: #333;">${formatValue(
                  location.created_on,
                  "created"
                )}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Updated On:</td>
                <td style="padding: 8px 0; color: #333;">${formatValue(
                  location.updated_on,
                  "updated"
                )}</td>
              </tr>
              
              <!-- Contact Information -->
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Address:</td>
                <td style="padding: 8px 0; color: #333; word-break: break-word; line-height: 1.3;">${formatValue(
                  location.address
                )}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Contact Name:</td>
                <td style="padding: 8px 0; color: #333;">${formatValue(
                  location.contact_name
                )}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Contact No:</td>
                <td style="padding: 8px 0; color: #333;">${formatValue(
                  location.contact_no
                )}</td>
              </tr>
              
              <!-- Business Information -->
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Is Rented:</td>
                <td style="padding: 8px 0;">
                  <span style="
                    color: ${location.is_rented ? "#4CAF50" : "#F44336"}; 
                    font-weight: 600;
                  ">${formatValue(location.is_rented)}</span>
                </td>
              </tr>
              ${
                location.is_rented
                  ? `
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Rent Amount:</td>
                <td style="padding: 8px 0; color: #333;">${formatValue(
                  location.rent_amount,
                  "rent"
                )}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Agreement Start:</td>
                <td style="padding: 8px 0; color: #333;">${formatValue(
                  location.agreement_start_date,
                  "date"
                )}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Agreement End:</td>
                <td style="padding: 8px 0; color: #333;">${formatValue(
                  location.agreement_end_date,
                  "date"
                )}</td>
              </tr>
              `
                  : ""
              }
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Nature of Business:</td>
                <td style="padding: 8px 0; color: #333; word-break: break-word;">${formatValue(
                  location.nature_of_business
                )}</td>
              </tr>
              
              <!-- Technical Information -->
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Structure Type:</td>
                <td style="padding: 8px 0; color: #333;">${formatValue(
                  location.structure_type
                )}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">UPS Availability:</td>
                <td style="padding: 8px 0;">
                  <span style="
                    color: ${
                      location.ups_availability ? "#4CAF50" : "#F44336"
                    }; 
                    font-weight: 600;
                  ">${formatValue(location.ups_availability)}</span>
                </td>
              </tr>
              ${
                location.ups_availability
                  ? `
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Backup Capacity:</td>
                <td style="padding: 8px 0; color: #333;">${formatValue(
                  location.backup_capacity
                )} KVA</td>
              </tr>
              `
                  : ""
              }
              
              <!-- Coordinates -->
              <tr>
                <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Coordinates:</td>
                <td style="padding: 8px 0; color: #333; font-family: monospace;">
                  ${location.position?.lat?.toFixed(6) || "N/A"}, ${
        location.position?.lng?.toFixed(6) || "N/A"
      }
                </td>
              </tr>
            </table>
          </div>
        </div>
        
        <div style="
          text-align: center; 
          padding: 10px; 
          color: #999; 
          font-size: 11px; 
          border-top: 1px solid #f0f0f0; 
          margin-top: 10px;
          background: #fafafa;
        ">
          ${layerType.toUpperCase()} Infrastructure Location
        </div>
      </div>
    `;
    };

    // Create detailed info window for KML markers (POP and Sub-POP)
    const createKMLInfoWindow = (
      name,
      description,
      lat,
      lng,
      layerType,
      data = null
    ) => {
      const isPopType = layerType === "POP";
      const headerColor = isPopType ? "#FF6B35" : "#4CAF50";
      const headerColorDark = isPopType ? "#E55A2B" : "#45A049";

      return `
      <div style="max-width: 400px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.4;">
        <div style="background: linear-gradient(135deg, ${headerColor}, ${headerColorDark}); color: white; padding: 15px; margin: -8px -8px 15px -8px; border-radius: 8px 8px 0 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
          <h3 style="margin: 0; font-size: 18px; font-weight: 600;">${
            name || `${layerType} Location`
          }</h3>
          <div style="margin-top: 8px; opacity: 0.9; font-size: 13px;">
            <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px; margin-right: 8px;">${layerType}</span>
            <span>${lat.toFixed(6)}, ${lng.toFixed(6)}</span>
          </div>
        </div>
        <div style="
          max-height: 350px; 
          overflow-y: hidden;
          padding-right: 0px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        ">
          <div style="
            overflow-y: auto;
            max-height: 350px;
            padding-right: 15px;
            margin-right: -15px;
          ">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555; min-width: 120px;">Location Name:</td>
              <td style="padding: 8px 0; color: #333; word-break: break-word; line-height: 1.3;">${
                name || "N/A"
              }</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Type:</td>
              <td style="padding: 8px 0; color: #333;"><span style="color: ${headerColor}; font-weight: 600;">${layerType} Location</span></td>
            </tr>
            ${
              description && description.trim()
                ? `
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555; vertical-align: top;">Description:</td>
              <td style="padding: 8px 0; color: #333; word-break: break-word; line-height: 1.3;">${description}</td>
            </tr>`
                : ""
            }
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Status:</td>
              <td style="padding: 8px 0; color: #333;"><span style="color: #4CAF50; font-weight: 600;">Active</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Network Type:</td>
              <td style="padding: 8px 0; color: #333;">${
                isPopType
                  ? "Primary Operations Point"
                  : "Secondary Operations Point"
              }</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Infrastructure:</td>
              <td style="padding: 8px 0; color: #333;">${
                isPopType
                  ? "Main Tower, Full Equipment"
                  : "Sub Tower, Limited Equipment"
              }</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Coverage Area:</td>
              <td style="padding: 8px 0; color: #333;">${
                isPopType ? "Metropolitan/Regional" : "Local/Neighborhood"
              }</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 8px 12px 8px 0; font-weight: 600; color: #555;">Coordinates:</td>
              <td style="padding: 8px 0; color: #333; font-family: monospace;">${lat.toFixed(
                6
              )}, ${lng.toFixed(6)}</td>
            </tr>
            </table>
          </div>
        </div>
        <div style="text-align: center; padding: 10px; color: #999; font-size: 11px; border-top: 1px solid #f0f0f0; margin-top: 10px;">
          ${layerType} Infrastructure Data
        </div>
      </div>
    `;
    };

    // Generate default form data based on type and position
    const generateDefaultFormData = (type, lat, lng) => {
      const timestamp = new Date().toISOString();
      const randomId = Math.floor(Math.random() * 10000);
      const uniqueCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      return {
        id: randomId,
        name: "",
        unique_id: type === "pop" ? `POP.${uniqueCode}` : `SUB.${uniqueCode}`,
        network_id:
          type === "pop"
            ? `BHARAT-POP.${uniqueCode}`
            : `BHARAT-SUB.${uniqueCode}`,
        ref_code: "",
        status: "Active",
        created_on: timestamp,
        updated_on: timestamp,
        address: "",
        contact_name: "",
        contact_no: "",
        is_rented: false,
        rent_amount: 0,
        agreement_start_date: "",
        agreement_end_date: "",
        nature_of_business:
          type === "pop" ? "Primary Operations" : "Secondary Operations",
        structure_type: "",
        ups_availability: false,
        backup_capacity: "",
        latitude: lat,
        longitude: lng,
      };
    };
    // Handle form submission
    const handleFormSubmit = async (formData) => {
      try {
        const { type, position, data } = formData;

        // Address must be entered manually by user

        // Create marker with tower icon
        const marker = new window.google.maps.Marker({
          position: position,
          map: map,
          title: data.name || `${type.toUpperCase()} Location`,
          icon: {
            url: createTowerIconVariant(type),
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 35),
          },
        });

        // Create info window with detailed data
        const infoWindow = new window.google.maps.InfoWindow({
          content: createManualLocationInfoWindow(data, type),
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        // Store in localStorage and state (without circular references)
        setManualLocations((prev) => {
          let updated;

          if (editingLocation) {
            // Update existing location (don't store marker in state)
            updated = {
              ...prev,
              [type]: prev[type].map((item) =>
                item.id === editingLocation.id
                  ? { ...data, position, id: editingLocation.id }
                  : item
              ),
            };
            // Update the marker reference separately
            const existingLocation = prev[type].find(
              (item) => item.id === editingLocation.id
            );
            if (existingLocation) {
              existingLocation.marker = marker;
              existingLocation.infoWindow = infoWindow;
            }
            addLog(`✏️ Updated existing ${type.toUpperCase()} location`);
          } else {
            // Add new location (don't store marker in state)
            const newLocation = { ...data, position };
            updated = {
              ...prev,
              [type]: [...prev[type], newLocation],
            };
            // Store marker reference separately
            newLocation.marker = marker;
            newLocation.infoWindow = infoWindow;
            addLog(`➕ Added new ${type.toUpperCase()} location`);
          }

          // Save to localStorage (exclude marker objects to avoid circular references)
          localStorage.setItem(
            "manual_infrastructure_locations",
            JSON.stringify({
              pop: updated.pop.map(safeSerialize),
              sub: updated.sub.map(safeSerialize),
            })
          );
          return updated;
        });

        // Auto-enable the layer
        if (type === "pop" && !showPopLayer) {
          setShowPopLayer(true);
          localStorage.setItem("infra_toggle_pop", "true");
        } else if (type === "sub" && !showSubPopLayer) {
          setShowSubPopLayer(true);
          localStorage.setItem("infra_toggle_subpop", "true");
        }

        const actionText = editingLocation ? "Updated" : "Added";
        addLog(`✅ ${actionText} ${type.toUpperCase()} location: ${data.name}`);

        // Save to database if enabled
        if (useDatabase) {
          try {
            const dbData = {
              ...data,
              type: type.toUpperCase(),
              coordinates: `${position.lng},${position.lat},0.0`,
              updated_at: new Date().toISOString(),
            };

            if (editingLocation && editingLocation.database_id) {
              // Update existing record
              dbData.id = editingLocation.database_id;
              await updateInDatabase(editingLocation.database_id, dbData);
              addNotification(
                `${type.toUpperCase()} location updated in database!`,
                "success"
              );
            } else {
              // Create new record
              dbData.created_at = new Date().toISOString();
              const dbResult = await saveToDatabase(dbData);
              addNotification(
                `${type.toUpperCase()} location saved to database!`,
                "success"
              );
              // Save database ID to localStorage for reference
              data.database_id = dbResult.id;
            }
          } catch (error) {
            addLog(
              `⚠️ Database ${
                editingLocation ? "update" : "save"
              } failed, saving locally only`
            );
            addNotification("Saved locally only (database error)", "warning");
          }
        } else {
          addNotification(
            `${type.toUpperCase()} location ${actionText.toLowerCase()} locally!`,
            "success"
          );
        }

        // Clear editing state
        setEditingLocation(null);
      } catch (error) {
        addLog(`❌ Error adding location: ${error.message}`);
        addNotification(`Error adding location: ${error.message}`, "error");
      }
    };

    // Handle manual coordinate entry
    const handleManualCoordAdd = async (type) => {
      try {
        const lat = parseFloat(manualCoords.lat);
        const lng = parseFloat(manualCoords.lng);

        if (isNaN(lat) || isNaN(lng)) {
          addNotification("Please enter valid coordinates", "error");
          return;
        }

        // Validate coordinate ranges
        if (lat < -90 || lat > 90) {
          addNotification("Latitude must be between -90 and 90", "error");
          return;
        }
        if (lng < -180 || lng > 180) {
          addNotification("Longitude must be between -180 and 180", "error");
          return;
        }

        addLog(
          `🎯 Manual coordinate entry: ${type.toUpperCase()} at ${lat}, ${lng}`
        );

        // Check boundary restrictions
        if (enableBoundaryCheck) {
          let isValidLocation = true;
          let checkMethod = "none";

          const locationCheck = isInsideIndia
            ? isInsideIndia({ lat, lng })
            : null;

          if (isInsideIndia && locationCheck !== null) {
            isValidLocation = locationCheck;
            checkMethod = "polygon";
          } else {
            isValidLocation =
              lat >= 6.4 && lat <= 37.6 && lng >= 68.1 && lng <= 97.4;
            checkMethod = "basic";
          }

          if (!isValidLocation) {
            addLog(
              `❌ Manual coordinates outside India boundary (${checkMethod} check)`
            );
            addNotification(
              "Coordinates must be within India's boundaries",
              "error"
            );
            return;
          }
        }

        // Open form with manual coordinates
        const position = { lat, lng };
        setAddLocationForm({
          open: true,
          type: type,
          position: position,
          data: generateDefaultFormData(type, lat, lng),
        });

        // Clear manual entry fields
        setManualCoords({ lat: "", lng: "" });

        addNotification(
          `Form opened for ${type.toUpperCase()} at manual coordinates`,
          "success"
        );
      } catch (error) {
        addLog(`❌ Error processing manual coordinates: ${error.message}`);
        addNotification("Error processing coordinates", "error");
      }
    };

    // Edit manual location
    const editManualLocation = (location, type) => {
      addLog(
        `✏️ Starting edit for ${type.toUpperCase()} location: ${location.name}`
      );

      setEditingLocation({ ...location, type });
      setAddLocationForm({
        open: true,
        type: type,
        position: location.position,
        data: location,
      });
    };

    // Delete manual location
    const deleteManualLocation = (location, type) => {
      try {
        // Remove from map immediately
        if (location.marker) {
          location.marker.setMap(null);
          addLog(
            `🗺️ Removed marker from map for ${type.toUpperCase()}: ${
              location.name
            }`
          );
        }

        // Remove from clusterer if exists
        const clustererRef = type === "pop" ? popClusterRef : subClusterRef;
        if (clustererRef.current && location.marker) {
          try {
            clustererRef.current.removeMarker(location.marker);
            addLog(`🔗 Removed marker from ${type.toUpperCase()} clusterer`);
          } catch (clusterError) {
            addLog(`⚠️ Error removing from clusterer: ${clusterError.message}`);
          }
        }

        // Close any open info windows for this location
        if (location.infoWindow) {
          location.infoWindow.close();
          addLog(
            `💬 Closed info window for ${type.toUpperCase()}: ${location.name}`
          );
        }

        // Remove from state
        setManualLocations((prev) => {
          const updated = {
            ...prev,
            [type]: prev[type].filter((item) => item.id !== location.id),
          };

          // Update localStorage (exclude marker objects to avoid circular references)
          localStorage.setItem(
            "manual_infrastructure_locations",
            JSON.stringify({
              pop: updated.pop.map(safeSerialize),
              sub: updated.sub.map(safeSerialize),
            })
          );

          // Refresh the clusterer with remaining markers after state update
          setTimeout(() => {
            refreshClustererAfterDelete(type, updated[type]);
          }, 100);

          return updated;
        });

        // If database is enabled, try to delete from database
        if (useDatabase && location.database_id) {
          deleteFromDatabase(location.database_id).catch((error) => {
            addLog(`⚠️ Failed to delete from database: ${error.message}`);
          });
        }

        addLog(
          `✅ Successfully deleted ${type.toUpperCase()} location: ${
            location.name
          }`
        );
        addNotification(
          `🗑️ ${type.toUpperCase()} location "${
            location.name
          }" deleted successfully!`,
          "success"
        );
      } catch (error) {
        addLog(`❌ Error deleting location: ${error.message}`);
        addNotification("Error deleting location", "error");
      }
    };

    // Refresh clusterer after location deletion
    const refreshClustererAfterDelete = (type, remainingLocations) => {
      const clustererRef = type === "pop" ? popClusterRef : subClusterRef;

      if (!clustererRef.current || !window.markerClusterer?.MarkerClusterer) {
        addLog(`⚠️ Clusterer not available for ${type.toUpperCase()} refresh`);
        return;
      }

      try {
        // Clear existing clusterer
        clustererRef.current.clearMarkers();
        addLog(`🧹 Cleared ${type.toUpperCase()} clusterer`);

        // Rebuild clusterer with remaining markers
        const validMarkers = remainingLocations
          .filter((location) => location.marker && location.marker.getMap())
          .map((location) => location.marker);

        if (validMarkers.length > 0) {
          clustererRef.current.addMarkers(validMarkers);
          addLog(
            `🔗 Refreshed ${type.toUpperCase()} clusterer with ${
              validMarkers.length
            } markers`
          );
        } else {
          addLog(`📍 No markers to cluster for ${type.toUpperCase()}`);
        }

        // Refresh clusterer display
        clustererRef.current.repaint();
        addLog(`🎨 Repainted ${type.toUpperCase()} clusterer`);
      } catch (error) {
        addLog(
          `❌ Error refreshing ${type.toUpperCase()} clusterer: ${
            error.message
          }`
        );
      }
    };

    // Database delete function
    const deleteFromDatabase = async (id) => {
      try {
        const response = await fetch(`/api/infrastructure/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Database delete failed: ${response.statusText}`);
        }

        addLog(`✅ Deleted from database ID: ${id}`);
      } catch (error) {
        addLog(`❌ Database delete error: ${error.message}`);
        throw error;
      }
    };

    // Load manual locations from database or localStorage
    const loadManualLocationsFromDatabase = async () => {
      if (!useDatabase) return;

      try {
        const dbData = await loadFromDatabase();
        const processedData = { pop: [], sub: [] };

        dbData.forEach((item) => {
          const type = item.type?.toLowerCase();
          if (type === "pop" || type === "sub") {
            // Parse coordinates if they're in string format
            let position = item.position;
            if (typeof item.coordinates === "string") {
              const [lng, lat] = item.coordinates.split(",").map(parseFloat);
              position = { lat, lng };
            } else if (item.latitude && item.longitude) {
              position = { lat: item.latitude, lng: item.longitude };
            }

            if (position) {
              processedData[type].push({
                ...item,
                position,
                database_id: item.id,
              });
            }
          }
        });

        setManualLocations(processedData);
        addLog(
          `✅ Loaded ${processedData.pop.length} POP and ${processedData.sub.length} Sub-POP locations from database`
        );
      } catch (error) {
        addLog(
          `⚠️ Failed to load from database, using localStorage: ${error.message}`
        );
        addNotification("Database load failed, using local storage", "warning");
      }
    };

    // Center map on location and show info window
    const showLocationOnMap = (location, type) => {
      if (!map || !location.position) {
        addNotification("Cannot show location on map", "error");
        return;
      }

      // Center map on location
      map.setCenter(location.position);
      map.setZoom(16); // Zoom in to show details

      // Find or create the marker
      let targetMarker = location.marker;

      // If marker doesn't exist, create it
      if (!targetMarker) {
        targetMarker = new window.google.maps.Marker({
          position: location.position,
          map: map,
          title: location.name || `${type.toUpperCase()} Location`,
          icon: {
            url: createTowerIconVariant(type),
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 35),
          },
        });
        location.marker = targetMarker;
        addLog(
          `🔧 Created missing marker for ${type.toUpperCase()} location: ${
            location.name
          }`
        );
      }

      // Ensure marker is visible on the map (in case it was hidden due to layer toggle)
      if (targetMarker.getMap() !== map) {
        targetMarker.setMap(map);
        addLog(
          `👁️ Made marker visible for ${type.toUpperCase()} location: ${
            location.name
          }`
        );
      }

      // Create new info window with latest data
      const infoWindow =
        location.infoWindow ||
        new window.google.maps.InfoWindow({
          content: createManualLocationInfoWindow(location, type),
        });

      // Update info window content in case data changed
      infoWindow.setContent(createManualLocationInfoWindow(location, type));

      // Close any open info windows first
      if (window.currentInfoWindow && window.currentInfoWindow !== infoWindow) {
        window.currentInfoWindow.close();
      }

      // Open info window
      infoWindow.open(map, targetMarker);
      window.currentInfoWindow = infoWindow;

      // Store the info window reference
      location.infoWindow = infoWindow;

      // Animate marker
      targetMarker.setAnimation(window.google.maps.Animation.BOUNCE);
      setTimeout(() => {
        targetMarker.setAnimation(null);
      }, 2000);

      addLog(
        `📍 Showed ${type.toUpperCase()} location on map: ${location.name}`
      );
      addNotification(`Centered on ${location.name}`, "success");
    };

    // Load manual locations from localStorage on map load
    const loadManualLocations = () => {
      if (!map) return;

      ["pop", "sub"].forEach((type) => {
        manualLocations[type].forEach((location) => {
          // Skip if marker already exists (avoid duplicates)
          if (location.marker) {
            return;
          }

          // Always create the marker, but only show it if the layer is visible
          const marker = new window.google.maps.Marker({
            position: location.position,
            map: null, // Start hidden, will be shown if layer is visible
            title: location.name || `${type.toUpperCase()} Location`,
            icon: {
              url: createTowerIconVariant(type),
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 35),
            },
          });

          // Show marker if corresponding layer is visible
          if (
            (type === "pop" && showPopLayer) ||
            (type === "sub" && showSubPopLayer)
          ) {
            marker.setMap(map);
          }

          const infoWindow = new window.google.maps.InfoWindow({
            content: createManualLocationInfoWindow(location, type),
          });

          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });

          // Attach marker and infoWindow to the location object (not in React state)
          location.marker = marker;
          location.infoWindow = infoWindow;
        });
      });
    };

    // Load manual locations when map is ready
    useEffect(() => {
      if (map && loaded) {
        if (useDatabase) {
          loadManualLocationsFromDatabase().then(() => {
            loadManualLocations();
          });
        } else {
          loadManualLocations();
        }
      }
    }, [map, loaded, useDatabase]);

    // Update manual location marker visibility when layer toggles change
    useEffect(() => {
      if (manualLocations && map) {
        // Update POP markers visibility
        manualLocations.pop?.forEach((location) => {
          if (location.marker) {
            location.marker.setMap(showPopLayer ? map : null);
          }
        });

        // Update Sub-POP markers visibility
        manualLocations.sub?.forEach((location) => {
          if (location.marker) {
            location.marker.setMap(showSubPopLayer ? map : null);
          }
        });
      }
    }, [showPopLayer, showSubPopLayer, manualLocations, map]);

    // Handle persistent click listener that can access current state
    const persistentClickListenerRef = useRef(null);

    useEffect(() => {
      if (!map) return;

      // Remove existing persistent listener
      if (persistentClickListenerRef.current) {
        window.google.maps.event.removeListener(
          persistentClickListenerRef.current
        );
      }

      // Add new persistent listener with current state access
      persistentClickListenerRef.current = map.addListener("click", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        addLog(
          `📍 PERSISTENT CLICK (Updated) - Clicked at: ${lat.toFixed(
            4
          )}, ${lng.toFixed(4)}`
        );
        addLog(`📍 Current isAddingLocation state: ${isAddingLocation}`);

        // Handle adding location mode (highest priority)
        if (isAddingLocation) {
          addLog(
            `🔍 Checking boundary for location: ${lat.toFixed(
              4
            )}, ${lng.toFixed(4)}`
          );
          addLog(`🔍 isInsideIndia function available: ${!!isInsideIndia}`);
          addLog(`🔍 indiaBounds available: ${!!indiaBounds}`);

          // Check if the clicked location is inside India's boundary (if enabled)
          if (enableBoundaryCheck) {
            let isValidLocation = true;
            let checkMethod = "none";

            // Try precise polygon-based check first
            const locationCheck = isInsideIndia
              ? isInsideIndia({ lat, lng })
              : null;
            addLog(`🔍 Polygon boundary check result: ${locationCheck}`);

            if (isInsideIndia && locationCheck !== null) {
              // Use polygon-based result
              isValidLocation = locationCheck;
              checkMethod = "polygon";
            } else {
              // Fallback to basic lat/lng range check for India
              isValidLocation =
                lat >= 6.4 && lat <= 37.6 && lng >= 68.1 && lng <= 97.4;
              checkMethod = "basic";
              addLog(
                `🗺 Using fallback basic boundary check: ${isValidLocation}`
              );
            }

            if (!isValidLocation) {
              addLog(
                `❌ Location outside India boundary (${checkMethod} check): ${lat.toFixed(
                  4
                )}, ${lng.toFixed(4)}`
              );

              // Add temporary visual marker at the invalid location
              const tempMarker = new window.google.maps.Marker({
                position: { lat, lng },
                map: map,
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 15,
                  fillColor: "#FF1744",
                  fillOpacity: 0.8,
                  strokeColor: "#FFFFFF",
                  strokeWeight: 3,
                },
                animation: window.google.maps.Animation.BOUNCE,
                zIndex: 2000,
              });

              // Show info window with detailed message
              const infoWindow = new window.google.maps.InfoWindow({
                content: `
                <div style="padding: 8px; text-align: center;">
                  <div style="color: #d32f2f; font-weight: bold; margin-bottom: 4px;">⚠️ Outside India Boundary</div>
                  <div style="font-size: 12px; color: #666;">Location: ${lat.toFixed(
                    6
                  )}, ${lng.toFixed(6)}</div>
                  <div style="font-size: 12px; color: #666; margin-top: 4px;">Please click within India's borders</div>
                </div>
              `,
                position: { lat, lng },
              });

              infoWindow.open(map);

              // Remove marker and info window after 4 seconds
              setTimeout(() => {
                tempMarker.setMap(null);
                infoWindow.close();
              }, 4000);

              addNotification(
                `Location outside India boundary (${lat.toFixed(
                  3
                )}°, ${lng.toFixed(3)}°)`,
                "error"
              );
              setIsAddingLocation(false);
              map.setOptions({ cursor: "default" });
              return;
            } else {
              addLog(
                `✅ Location confirmed inside India (${checkMethod} check): ${lat.toFixed(
                  4
                )}, ${lng.toFixed(4)}`
              );
            }
          } else {
            addLog(
              `🚫 Boundary check disabled - allowing location: ${lat.toFixed(
                4
              )}, ${lng.toFixed(4)}`
            );
          }

          addLog(
            `🏗️ Adding ${isAddingLocation.toUpperCase()} location at: ${lat.toFixed(
              4
            )}, ${lng.toFixed(4)}`
          );
          setAddLocationForm({
            open: true,
            type: isAddingLocation,
            position: { lat, lng },
            data: generateDefaultFormData(isAddingLocation, lat, lng),
          });
          setIsAddingLocation(false);
          map.setOptions({ cursor: "default" });
          addNotification(
            `Form opened for ${isAddingLocation.toUpperCase()} location`,
            "success"
          );
          return;
        }

        // If not in add mode and not drawing mode, just log the click
        if (!isDrawing && !isPolygonDrawing) {
          addLog(
            `📍 Regular map click at: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
          );
        }
      });

      return () => {
        if (persistentClickListenerRef.current) {
          window.google.maps.event.removeListener(
            persistentClickListenerRef.current
          );
        }
      };
    }, [map, isAddingLocation, isDrawing, isPolygonDrawing]);

    // Auto-update elevation data when points change and elevation is enabled
    useEffect(() => {
      if (showElevation && points.length >= 2 && map && window.google) {
        const timeoutId = setTimeout(() => {
          getElevationForPath().catch((error) => {
            addLog(`⚠️ Auto elevation update failed: ${error.message}`);
          });
        }, 500); // Small delay to avoid too many API calls during rapid clicking

        return () => clearTimeout(timeoutId);
      } else if (!showElevation || points.length < 2) {
        // Clear elevation data if elevation is disabled or not enough points
        if (elevationData.length > 0) {
          clearElevationData();
        }
      }
    }, [showElevation, points, map]);

    const addImportedMarkers = (markers) => {
      if (markers.length === 0) {
        addLog("❌ No valid markers found in imported file");
        addNotification("No valid data found in file", "warning");
        return;
      }

      setImportedMarkers((prev) => {
        const updated = [...prev, ...markers];
        // Add to clusterer
        if (
          clustererLoadedRef.current &&
          window.markerClusterer?.MarkerClusterer
        ) {
          if (!importedClusterRef.current) {
            importedClusterRef.current =
              new window.markerClusterer.MarkerClusterer({
                map: showImportedLayer ? map : null,
                markers: updated,
              });
          } else {
            importedClusterRef.current.addMarkers(markers);
          }
        }
        return updated;
      });

      // Auto-check imported layer when data is imported
      if (!showImportedLayer) {
        setShowImportedLayer(true);
        localStorage.setItem("infra_toggle_imported", "true");
        addLog("✅ Auto-enabled imported layer");
      }

      addLog(`✅ Added ${markers.length} imported markers`);
      addNotification(
        `Successfully imported ${markers.length} locations`,
        "success"
      );
    };
    const toggleImportedLayer = (show) => {
      try {
        // Handle individual imported markers
        if (importedMarkers && importedMarkers.length > 0) {
          importedMarkers.forEach((marker) => {
            if (marker && marker.setMap) {
              marker.setMap(show ? map : null);
            }
          });
          addLog(
            `${show ? "Showing" : "Hiding"} ${
              importedMarkers.length
            } imported markers`
          );
        }

        // Update clusterer
        try {
          const MarkerClusterer = window.markerClusterer?.MarkerClusterer;
          if (MarkerClusterer) {
            if (!importedClusterRef.current && importedMarkers.length > 0) {
              importedClusterRef.current = new MarkerClusterer({
                map: show ? map : null,
                markers: importedMarkers,
                gridSize: 60,
                maxZoom: 15,
              });
              addLog(
                `✅ Imported clusterer created and ${show ? "shown" : "hidden"}`
              );
            } else if (importedClusterRef.current) {
              importedClusterRef.current.setMap(show ? map : null);
              addLog(`✅ Imported clusterer ${show ? "shown" : "hidden"}`);
            }
          }
        } catch (e) {
          addLog(`⚠️ Error updating imported clusterer: ${e.message}`);
        }

        setShowImportedLayer(show);
        localStorage.setItem("infra_toggle_imported", JSON.stringify(show));
        addLog(`✅ Imported layer toggle completed: ${show}`);
      } catch (error) {
        addLog(`❌ Error toggling imported layer: ${error.message}`);
        addNotification(
          `Error toggling imported layer: ${error.message}`,
          "error"
        );
      }
    };

    // Download sample templates
    const downloadCsvTemplate = () => {
      try {
        // Generate CSV template content
        const csvContent = `Name,Latitude,Longitude,Type,Status,Address,Contact Name,Contact Number,Ref Code,Nature of Business,Structure Type,Is Rented,Rent Amount,Agreement Start Date,Agreement End Date,UPS Availability,Backup Capacity
Delhi Central POP,28.6139,77.2090,POP,Active,"Connaught Place, New Delhi, India",Rajesh Kumar,9876543210,REF001,Primary Operations,Tower,No,0,,,Yes,50
Mumbai Main POP,19.0760,72.8777,POP,Active,"Nariman Point, Mumbai, Maharashtra, India",Priya Sharma,9123456789,REF002,Primary Operations,Building,Yes,50000,2024-01-01,2024-12-31,Yes,100
Bangalore Tech POP,12.9716,77.5946,POP,RFS,"MG Road, Bangalore, Karnataka, India",Suresh Reddy,9987654321,REF003,Primary Operations,Rooftop,No,0,,,No,0
Noida Sub-POP,28.5355,77.3910,Sub-POP,Active,"Sector 18, Noida, Uttar Pradesh, India",Ankita Gupta,9555123456,REF004,Secondary Operations,Tower,Yes,25000,2024-06-01,2025-05-31,Yes,25
Andheri Sub-POP,19.1136,72.8697,Sub-POP,RFS,"Andheri West, Mumbai, Maharashtra, India",Vikram Shah,9888777666,REF005,Secondary Operations,Building,No,0,,,Yes,30
Whitefield Sub-POP,13.0358,77.5970,Sub-POP,Active,"Whitefield, Bangalore, Karnataka, India",Meera Iyer,9777888999,REF006,Secondary Operations,Rooftop,Yes,18000,2024-03-15,2025-03-14,No,0`;

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "infrastructure_template.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        addLog("✅ CSV template generated and downloaded");
        addNotification("CSV template downloaded successfully", "success");
      } catch (e) {
        addLog(`❌ Error generating CSV template: ${e.message}`);
        addNotification("Could not generate CSV template", "error");
      }
    };

    const downloadXlsxTemplate = async () => {
      try {
        // Load SheetJS library if not already loaded
        if (!window.XLSX) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src =
              "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
          addLog("✅ XLSX library loaded for template generation");
        }

        // Create sample data for XLSX template
        const sampleData = [
          {
            Name: "Delhi Central POP",
            Latitude: 28.6139,
            Longitude: 77.209,
            Type: "POP",
            Status: "Active",
            Address: "Connaught Place, New Delhi, India",
            "Contact Name": "Rajesh Kumar",
            "Contact Number": "9876543210",
            "Ref Code": "REF001",
            "Nature of Business": "Primary Operations",
            "Structure Type": "Tower",
            "Is Rented": "No",
            "Rent Amount": 0,
            "Agreement Start Date": "",
            "Agreement End Date": "",
            "UPS Availability": "Yes",
            "Backup Capacity": 50,
          },
          {
            Name: "Mumbai Main POP",
            Latitude: 19.076,
            Longitude: 72.8777,
            Type: "POP",
            Status: "Active",
            Address: "Nariman Point, Mumbai, Maharashtra, India",
            "Contact Name": "Priya Sharma",
            "Contact Number": "9123456789",
            "Ref Code": "REF002",
            "Nature of Business": "Primary Operations",
            "Structure Type": "Building",
            "Is Rented": "Yes",
            "Rent Amount": 50000,
            "Agreement Start Date": "2024-01-01",
            "Agreement End Date": "2024-12-31",
            "UPS Availability": "Yes",
            "Backup Capacity": 100,
          },
          {
            Name: "Bangalore Tech POP",
            Latitude: 12.9716,
            Longitude: 77.5946,
            Type: "POP",
            Status: "RFS",
            Address: "MG Road, Bangalore, Karnataka, India",
            "Contact Name": "Suresh Reddy",
            "Contact Number": "9987654321",
            "Ref Code": "REF003",
            "Nature of Business": "Primary Operations",
            "Structure Type": "Rooftop",
            "Is Rented": "No",
            "Rent Amount": 0,
            "Agreement Start Date": "",
            "Agreement End Date": "",
            "UPS Availability": "No",
            "Backup Capacity": 0,
          },
          {
            Name: "Noida Sub-POP",
            Latitude: 28.5355,
            Longitude: 77.391,
            Type: "Sub-POP",
            Status: "Active",
            Address: "Sector 18, Noida, Uttar Pradesh, India",
            "Contact Name": "Ankita Gupta",
            "Contact Number": "9555123456",
            "Ref Code": "REF004",
            "Nature of Business": "Secondary Operations",
            "Structure Type": "Tower",
            "Is Rented": "Yes",
            "Rent Amount": 25000,
            "Agreement Start Date": "2024-06-01",
            "Agreement End Date": "2025-05-31",
            "UPS Availability": "Yes",
            "Backup Capacity": 25,
          },
          {
            Name: "Andheri Sub-POP",
            Latitude: 19.1136,
            Longitude: 72.8697,
            Type: "Sub-POP",
            Status: "RFS",
            Address: "Andheri West, Mumbai, Maharashtra, India",
            "Contact Name": "Vikram Shah",
            "Contact Number": "9888777666",
            "Ref Code": "REF005",
            "Nature of Business": "Secondary Operations",
            "Structure Type": "Building",
            "Is Rented": "No",
            "Rent Amount": 0,
            "Agreement Start Date": "",
            "Agreement End Date": "",
            "UPS Availability": "Yes",
            "Backup Capacity": 30,
          },
          {
            Name: "Whitefield Sub-POP",
            Latitude: 13.0358,
            Longitude: 77.597,
            Type: "Sub-POP",
            Status: "Active",
            Address: "Whitefield, Bangalore, Karnataka, India",
            "Contact Name": "Meera Iyer",
            "Contact Number": "9777888999",
            "Ref Code": "REF006",
            "Nature of Business": "Secondary Operations",
            "Structure Type": "Rooftop",
            "Is Rented": "Yes",
            "Rent Amount": 18000,
            "Agreement Start Date": "2024-03-15",
            "Agreement End Date": "2025-03-14",
            "UPS Availability": "No",
            "Backup Capacity": 0,
          },
        ];

        // Create workbook and worksheet
        const wb = window.XLSX.utils.book_new();
        const ws = window.XLSX.utils.json_to_sheet(sampleData);

        // Add the worksheet to workbook
        window.XLSX.utils.book_append_sheet(wb, ws, "Infrastructure Data");

        // Generate and download the file
        window.XLSX.writeFile(wb, "infrastructure_template.xlsx");

        addLog("✅ XLSX template generated and downloaded");
        addNotification("XLSX template downloaded successfully", "success");
      } catch (e) {
        addLog(`❌ Error generating XLSX template: ${e.message}`);
        addNotification("Could not generate XLSX template", "error");
      }
    };

    // Export functions for manual POP/Sub-POP data
    const exportManualDataCSV = () => {
      try {
        const allLocations = [
          ...manualLocations.pop.map((loc) => ({
            ...safeSerialize(loc),
            type: "POP",
          })),
          ...manualLocations.sub.map((loc) => ({
            ...safeSerialize(loc),
            type: "Sub-POP",
          })),
        ];

        if (allLocations.length === 0) {
          addNotification("No manual locations to export", "warning");
          return;
        }

        // Create CSV header
        const headers = [
          "Name",
          "Latitude",
          "Longitude",
          "Type",
          "Status",
          "Address",
          "Contact Name",
          "Contact Number",
          "Ref Code",
          "Nature of Business",
          "Structure Type",
          "Is Rented",
          "Rent Amount",
          "Agreement Start Date",
          "Agreement End Date",
          "UPS Availability",
          "Backup Capacity",
          "Created On",
          "Updated On",
        ];

        // Convert data to CSV format
        const csvRows = [headers.join(",")];

        allLocations.forEach((location) => {
          const row = [
            `"${location.name || ""}"`,
            location.position?.lat || location.latitude || "",
            location.position?.lng || location.longitude || "",
            location.type || "",
            location.status || "",
            `"${location.address || ""}"`,
            `"${location.contact_name || ""}"`,
            location.contact_no || "",
            location.ref_code || "",
            `"${location.nature_of_business || ""}"`,
            location.structure_type || "",
            location.is_rented ? "Yes" : "No",
            location.rent_amount || 0,
            location.agreement_start_date || "",
            location.agreement_end_date || "",
            location.ups_availability ? "Yes" : "No",
            location.backup_capacity || 0,
            location.created_on || "",
            location.updated_on || "",
          ];
          csvRows.push(row.join(","));
        });

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `manual_infrastructure_export_${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        addLog(`✅ Exported ${allLocations.length} manual locations to CSV`);
        addNotification(
          `Successfully exported ${allLocations.length} locations to CSV`,
          "success"
        );
      } catch (e) {
        addLog(`❌ Error exporting CSV: ${e.message}`);
        addNotification("Could not export CSV", "error");
      }
    };

    const exportManualDataXLSX = async () => {
      try {
        const allLocations = [
          ...manualLocations.pop.map((loc) => ({
            ...safeSerialize(loc),
            type: "POP",
          })),
          ...manualLocations.sub.map((loc) => ({
            ...safeSerialize(loc),
            type: "Sub-POP",
          })),
        ];

        if (allLocations.length === 0) {
          addNotification("No manual locations to export", "warning");
          return;
        }

        // Load SheetJS library if not already loaded
        if (!window.XLSX) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src =
              "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
          addLog("✅ XLSX library loaded for export");
        }

        // Transform data for XLSX
        const exportData = allLocations.map((location) => ({
          Name: location.name || "",
          Latitude: location.position?.lat || location.latitude || "",
          Longitude: location.position?.lng || location.longitude || "",
          Type: location.type || "",
          Status: location.status || "",
          Address: location.address || "",
          "Contact Name": location.contact_name || "",
          "Contact Number": location.contact_no || "",
          "Ref Code": location.ref_code || "",
          "Nature of Business": location.nature_of_business || "",
          "Structure Type": location.structure_type || "",
          "Is Rented": location.is_rented ? "Yes" : "No",
          "Rent Amount": location.rent_amount || 0,
          "Agreement Start Date": location.agreement_start_date || "",
          "Agreement End Date": location.agreement_end_date || "",
          "UPS Availability": location.ups_availability ? "Yes" : "No",
          "Backup Capacity": location.backup_capacity || 0,
          "Created On": location.created_on || "",
          "Updated On": location.updated_on || "",
        }));

        // Create workbook and worksheet
        const wb = window.XLSX.utils.book_new();
        const ws = window.XLSX.utils.json_to_sheet(exportData);

        // Add the worksheet to workbook
        window.XLSX.utils.book_append_sheet(wb, ws, "Manual Locations");

        // Generate and download the file
        const fileName = `manual_infrastructure_export_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        window.XLSX.writeFile(wb, fileName);

        addLog(`✅ Exported ${allLocations.length} manual locations to XLSX`);
        addNotification(
          `Successfully exported ${allLocations.length} locations to XLSX`,
          "success"
        );
      } catch (e) {
        addLog(`❌ Error exporting XLSX: ${e.message}`);
        addNotification("Could not export XLSX", "error");
      }
    };

    const exportManualDataKML = () => {
      try {
        const allLocations = [
          ...manualLocations.pop.map((loc) => ({
            ...safeSerialize(loc),
            type: "POP",
          })),
          ...manualLocations.sub.map((loc) => ({
            ...safeSerialize(loc),
            type: "Sub-POP",
          })),
        ];

        if (allLocations.length === 0) {
          addNotification("No manual locations to export", "warning");
          return;
        }

        // Create KML content
        let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Manual Infrastructure Locations</name>
    <description>Exported POP and Sub-POP locations</description>
    
    <Style id="popStyle">
      <IconStyle>
        <color>ff3568ff</color>
        <scale>1.2</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png</href>
        </Icon>
      </IconStyle>
    </Style>
    
    <Style id="subPopStyle">
      <IconStyle>
        <color>ff50af4c</color>
        <scale>1.0</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/grn-pushpin.png</href>
        </Icon>
      </IconStyle>
    </Style>
`;

        allLocations.forEach((location, index) => {
          const lat = location.position?.lat || location.latitude || 0;
          const lng = location.position?.lng || location.longitude || 0;
          const name =
            location.name || `${location.type} Location ${index + 1}`;
          const description = `
          <![CDATA[
            <b>Type:</b> ${location.type}<br/>
            <b>Status:</b> ${location.status || "N/A"}<br/>
            <b>Address:</b> ${location.address || "N/A"}<br/>
            <b>Contact:</b> ${location.contact_name || "N/A"} (${
            location.contact_no || "N/A"
          })<br/>
            <b>Structure:</b> ${location.structure_type || "N/A"}<br/>
            <b>UPS:</b> ${
              location.ups_availability ? "Available" : "Not Available"
            }<br/>
            <b>Coordinates:</b> ${lat.toFixed(6)}, ${lng.toFixed(6)}
          ]]>
        `;

          kmlContent += `    <Placemark>
      <name>${name}</name>
      <description>${description}</description>
      <styleUrl>#${
        location.type === "POP" ? "popStyle" : "subPopStyle"
      }</styleUrl>
      <Point>
        <coordinates>${lng},${lat},0</coordinates>
      </Point>
    </Placemark>
`;
        });

        kmlContent += `  </Document>
</kml>`;

        const blob = new Blob([kmlContent], {
          type: "application/vnd.google-earth.kml+xml",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `manual_infrastructure_export_${
          new Date().toISOString().split("T")[0]
        }.kml`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        addLog(`✅ Exported ${allLocations.length} manual locations to KML`);
        addNotification(
          `Successfully exported ${allLocations.length} locations to KML`,
          "success"
        );
      } catch (e) {
        addLog(`❌ Error exporting KML: ${e.message}`);
        addNotification("Could not export KML", "error");
      }
    };

    const exportManualDataKMZ = async () => {
      try {
        const allLocations = [
          ...manualLocations.pop.map((loc) => ({
            ...safeSerialize(loc),
            type: "POP",
          })),
          ...manualLocations.sub.map((loc) => ({
            ...safeSerialize(loc),
            type: "Sub-POP",
          })),
        ];

        if (allLocations.length === 0) {
          addNotification("No manual locations to export", "warning");
          return;
        }

        // Load JSZip library if not already loaded
        if (!window.JSZip) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src =
              "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
          addLog("✅ JSZip library loaded for KMZ export");
        }

        // Create KML content (same as KML export)
        let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Manual Infrastructure Locations</name>
    <description>Exported POP and Sub-POP locations</description>
    
    <Style id="popStyle">
      <IconStyle>
        <color>ff3568ff</color>
        <scale>1.2</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png</href>
        </Icon>
      </IconStyle>
    </Style>
    
    <Style id="subPopStyle">
      <IconStyle>
        <color>ff50af4c</color>
        <scale>1.0</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/grn-pushpin.png</href>
        </Icon>
      </IconStyle>
    </Style>
`;

        allLocations.forEach((location, index) => {
          const lat = location.position?.lat || location.latitude || 0;
          const lng = location.position?.lng || location.longitude || 0;
          const name =
            location.name || `${location.type} Location ${index + 1}`;
          const description = `
          <![CDATA[
            <b>Type:</b> ${location.type}<br/>
            <b>Status:</b> ${location.status || "N/A"}<br/>
            <b>Address:</b> ${location.address || "N/A"}<br/>
            <b>Contact:</b> ${location.contact_name || "N/A"} (${
            location.contact_no || "N/A"
          })<br/>
            <b>Structure:</b> ${location.structure_type || "N/A"}<br/>
            <b>UPS:</b> ${
              location.ups_availability ? "Available" : "Not Available"
            }<br/>
            <b>Coordinates:</b> ${lat.toFixed(6)}, ${lng.toFixed(6)}
          ]]>
        `;

          kmlContent += `    <Placemark>
      <name>${name}</name>
      <description>${description}</description>
      <styleUrl>#${
        location.type === "POP" ? "popStyle" : "subPopStyle"
      }</styleUrl>
      <Point>
        <coordinates>${lng},${lat},0</coordinates>
      </Point>
    </Placemark>
`;
        });

        kmlContent += `  </Document>
</kml>`;

        // Create KMZ (zip file containing KML)
        const zip = new window.JSZip();
        zip.file("doc.kml", kmlContent);

        const kmzBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(kmzBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `manual_infrastructure_export_${
          new Date().toISOString().split("T")[0]
        }.kmz`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        addLog(`✅ Exported ${allLocations.length} manual locations to KMZ`);
        addNotification(
          `Successfully exported ${allLocations.length} locations to KMZ`,
          "success"
        );
      } catch (e) {
        addLog(`❌ Error exporting KMZ: ${e.message}`);
        addNotification("Could not export KMZ", "error");
      }
    };

    // Elevation functions
    const initializeElevationService = () => {
      if (!elevationServiceRef.current && window.google && window.google.maps) {
        elevationServiceRef.current = new window.google.maps.ElevationService();
        addLog("✅ Elevation service initialized");
      }
    };

    const fetchElevationData = async (pathPoints) => {
      if (!pathPoints || pathPoints.length < 2) {
        addNotification(
          "Need at least 2 points to get elevation data",
          "warning"
        );
        return;
      }

      try {
        addLog(`🏔️ Fetching elevation data for ${pathPoints.length} points...`);

        // Initialize elevation service if needed
        initializeElevationService();

        if (!elevationServiceRef.current) {
          throw new Error("Elevation service not available");
        }

        return new Promise((resolve, reject) => {
          elevationServiceRef.current.getElevationAlongPath(
            {
              path: pathPoints,
              samples: Math.min(256, Math.max(10, pathPoints.length * 2)), // Reasonable number of samples
            },
            (results, status) => {
              if (status === "OK" && results) {
                addLog(
                  `✅ Retrieved elevation data for ${results.length} points`
                );
                resolve(results);
              } else {
                addLog(`❌ Elevation API error: ${status}`);
                reject(new Error(`Elevation API error: ${status}`));
              }
            }
          );
        });
      } catch (error) {
        addLog(`❌ Error fetching elevation data: ${error.message}`);
        addNotification(
          `Error fetching elevation data: ${error.message}`,
          "error"
        );
        throw error;
      }
    };

    const processElevationData = (elevationResults, pathPoints) => {
      if (!elevationResults || elevationResults.length === 0) return [];

      const processedData = [];
      let cumulativeDistance = 0;

      elevationResults.forEach((result, index) => {
        const elevation = result.elevation;

        // Calculate distance from start
        if (index > 0) {
          const prevResult = elevationResults[index - 1];
          const segmentDistance =
            window.google.maps.geometry.spherical.computeDistanceBetween(
              new window.google.maps.LatLng(
                prevResult.location.lat(),
                prevResult.location.lng()
              ),
              new window.google.maps.LatLng(
                result.location.lat(),
                result.location.lng()
              )
            );
          cumulativeDistance += segmentDistance;
        }

        processedData.push({
          lat: result.location.lat(),
          lng: result.location.lng(),
          elevation: elevation,
          distance: cumulativeDistance,
          formattedDistance: formatDistance(cumulativeDistance),
          formattedElevation: `${Math.round(elevation)}m`,
        });
      });

      return processedData;
    };

    const calculateElevationStats = (elevationData) => {
      if (!elevationData || elevationData.length === 0) {
        return {
          maxElevation: 0,
          minElevation: 0,
          totalElevationGain: 0,
          totalElevationLoss: 0,
          avgElevation: 0,
        };
      }

      const elevations = elevationData.map((d) => d.elevation);
      const maxElevation = Math.max(...elevations);
      const minElevation = Math.min(...elevations);
      const avgElevation =
        elevations.reduce((a, b) => a + b, 0) / elevations.length;

      let totalElevationGain = 0;
      let totalElevationLoss = 0;

      for (let i = 1; i < elevationData.length; i++) {
        const diff =
          elevationData[i].elevation - elevationData[i - 1].elevation;
        if (diff > 0) {
          totalElevationGain += diff;
        } else {
          totalElevationLoss += Math.abs(diff);
        }
      }

      return {
        maxElevation: Math.round(maxElevation),
        minElevation: Math.round(minElevation),
        totalElevationGain: Math.round(totalElevationGain),
        totalElevationLoss: Math.round(totalElevationLoss),
        avgElevation: Math.round(avgElevation),
      };
    };

    const createElevationChart = (elevationData) => {
      const canvas = elevationChartRef.current;
      if (!canvas || !window.Chart) {
        addLog("❌ Chart canvas or Chart.js not available");
        return;
      }

      // Destroy existing chart
      if (elevationChart) {
        elevationChart.destroy();
      }

      // Find indices of highest and lowest points for annotations
      const elevations = elevationData.map((d) => d.elevation);
      const maxElevation = Math.max(...elevations);
      const minElevation = Math.min(...elevations);
      const maxIndex = elevations.findIndex((e) => e === maxElevation);
      const minIndex = elevations.findIndex((e) => e === minElevation);

      // Create point colors array with highlights for max/min points
      const pointColors = elevationData.map((_, index) => {
        if (index === maxIndex) return "#FF5722"; // Orange for highest
        if (index === minIndex) return "#4CAF50"; // Green for lowest
        return "#2196F3"; // Default blue
      });

      // Create point radius array with larger points for max/min
      const pointRadii = elevationData.map((_, index) => {
        if (index === maxIndex || index === minIndex) return 6; // Larger for highest/lowest
        return 2; // Default size
      });

      const ctx = canvas.getContext("2d");
      const chart = new window.Chart(ctx, {
        type: "line",
        data: {
          labels: elevationData.map((d) => d.formattedDistance),
          datasets: [
            {
              label: "Elevation (m)",
              data: elevationData.map((d) => d.elevation),
              borderColor: "#2196F3",
              backgroundColor: "rgba(33, 150, 243, 0.1)",
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: pointRadii,
              pointHoverRadius: 8,
              pointBackgroundColor: pointColors,
              pointBorderColor: "#FFFFFF",
              pointBorderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Elevation Profile",
              font: { size: 16, weight: "bold" },
              color: "#333",
            },
            legend: {
              display: true,
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const index = context.dataIndex;
                  const point = elevationData[index];
                  let label = `Elevation: ${point.formattedElevation}`;

                  // Add special labels for highest and lowest points
                  if (index === maxIndex) {
                    label += " 🏔️ (Highest Point)";
                  } else if (index === minIndex) {
                    label += " 🌊 (Lowest Point)";
                  }

                  return label;
                },
                afterLabel: function (context) {
                  const index = context.dataIndex;
                  const point = elevationData[index];
                  return `Distance: ${point.formattedDistance}`;
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Distance",
                font: { size: 14, weight: "bold" },
              },
              grid: {
                color: "rgba(0,0,0,0.1)",
              },
            },
            y: {
              title: {
                display: true,
                text: "Elevation (m)",
                font: { size: 14, weight: "bold" },
              },
              grid: {
                color: "rgba(0,0,0,0.1)",
              },
            },
          },
          interaction: {
            intersect: false,
            mode: "index",
          },
          onHover: (event, elements) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              const point = elevationData[index];
              // Could highlight corresponding point on map here
            }
          },
        },
      });

      setElevationChart(chart);
      addLog(
        "✅ Elevation chart created with highlighted highest and lowest points"
      );
    };

    const createElevationMarkers = (elevationData, stats) => {
      // Clear existing elevation markers
      elevationMarkers.forEach((marker) => marker.setMap(null));
      const newMarkers = [];

      if (elevationData.length === 0) {
        setElevationMarkers([]);
        return;
      }

      // Find highest and lowest points
      const maxPoint = elevationData.find(
        (d) => d.elevation === stats.maxElevation
      );
      const minPoint = elevationData.find(
        (d) => d.elevation === stats.minElevation
      );

      // Create marker for highest point
      if (maxPoint) {
        const highMarker = new window.google.maps.Marker({
          position: { lat: maxPoint.lat, lng: maxPoint.lng },
          map: map,
          title: `Highest Point: ${maxPoint.formattedElevation}`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: "#FF5722",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 3,
          },
          zIndex: 1000,
        });

        const highInfoWindow = new window.google.maps.InfoWindow({
          content: `
          <div style="padding: 8px; font-family: Arial, sans-serif;">
            <h4 style="margin: 0 0 8px 0; color: #FF5722;">🏔️ Highest Point</h4>
            <p style="margin: 4px 0;"><strong>Elevation:</strong> ${
              maxPoint.formattedElevation
            }</p>
            <p style="margin: 4px 0;"><strong>Distance:</strong> ${
              maxPoint.formattedDistance
            }</p>
            <p style="margin: 4px 0;"><strong>Coordinates:</strong> ${maxPoint.lat.toFixed(
              6
            )}, ${maxPoint.lng.toFixed(6)}</p>
          </div>
        `,
        });

        highMarker.addListener("click", () => {
          highInfoWindow.open(map, highMarker);
        });

        newMarkers.push(highMarker);
      }

      // Create marker for lowest point (if different from highest)
      if (minPoint && minPoint !== maxPoint) {
        const lowMarker = new window.google.maps.Marker({
          position: { lat: minPoint.lat, lng: minPoint.lng },
          map: map,
          title: `Lowest Point: ${minPoint.formattedElevation}`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: "#4CAF50",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 3,
          },
          zIndex: 1000,
        });

        const lowInfoWindow = new window.google.maps.InfoWindow({
          content: `
          <div style="padding: 8px; font-family: Arial, sans-serif;">
            <h4 style="margin: 0 0 8px 0; color: #4CAF50;">🌊 Lowest Point</h4>
            <p style="margin: 4px 0;"><strong>Elevation:</strong> ${
              minPoint.formattedElevation
            }</p>
            <p style="margin: 4px 0;"><strong>Distance:</strong> ${
              minPoint.formattedDistance
            }</p>
            <p style="margin: 4px 0;"><strong>Coordinates:</strong> ${minPoint.lat.toFixed(
              6
            )}, ${minPoint.lng.toFixed(6)}</p>
          </div>
        `,
        });

        lowMarker.addListener("click", () => {
          lowInfoWindow.open(map, lowMarker);
        });

        newMarkers.push(lowMarker);
      }

      setElevationMarkers(newMarkers);
      addLog(`✅ Created ${newMarkers.length} elevation markers`);
    };

    const getElevationForPath = async () => {
      if (!showElevation || points.length < 2) {
        return;
      }

      try {
        addLog("🏔️ Getting elevation profile for current path...");

        const elevationResults = await fetchElevationData(points);
        const processedData = processElevationData(elevationResults, points);
        const stats = calculateElevationStats(processedData);

        setElevationData(processedData);
        setElevationStats(stats);

        // Create chart and markers
        if (processedData.length > 0) {
          createElevationChart(processedData);
          createElevationMarkers(processedData, stats);
          addNotification(
            `Elevation profile updated with ${processedData.length} points`,
            "success"
          );
        }
      } catch (error) {
        addLog(`❌ Error getting elevation profile: ${error.message}`);
        addNotification("Failed to get elevation data", "error");
      }
    };

    const clearElevationData = () => {
      // Clear chart
      if (elevationChart) {
        elevationChart.destroy();
        setElevationChart(null);
      }

      // Clear markers
      elevationMarkers.forEach((marker) => marker.setMap(null));
      setElevationMarkers([]);

      // Clear elevation polyline
      if (elevationPolyline) {
        elevationPolyline.setMap(null);
        setElevationPolyline(null);
      }

      // Clear data
      setElevationData([]);
      setElevationStats({
        maxElevation: 0,
        minElevation: 0,
        totalElevationGain: 0,
        totalElevationLoss: 0,
        avgElevation: 0,
      });

      addLog("🧹 Cleared elevation data and polyline");
    };

    // Elevation point management functions
    const clearElevationPoints = () => {
      // Clear point markers
      clearElevationPointMarkers();

      // Clear elevation polyline
      if (elevationPolyline) {
        elevationPolyline.setMap(null);
        setElevationPolyline(null);
      }

      // Clear points and distance
      setElevationPoints([]);
      setElevationDistance(0);
      setPointElevations({ point1: null, point2: null });

      addLog("🧹 Cleared elevation points and polyline");
    };

    const clearElevationPointMarkers = () => {
      elevationPointMarkers.forEach((marker) => marker.setMap(null));
      setElevationPointMarkers([]);
    };

    const addElevationPointMarker = (position, pointNumber) => {
      if (!map) return;

      const marker = new window.google.maps.Marker({
        position: position,
        map: map,
        title: `Elevation Point ${pointNumber}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: pointNumber === 1 ? "#4CAF50" : "#FF5722",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 3,
        },
        label: {
          text: pointNumber.toString(),
          color: "#FFFFFF",
          fontWeight: "bold",
          fontSize: "12px",
        },
        zIndex: 1500,
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
        <div style="padding: 8px; font-family: Arial, sans-serif;">
          <h4 style="margin: 0 0 8px 0; color: ${
            pointNumber === 1 ? "#4CAF50" : "#FF5722"
          };">📍 Elevation Point ${pointNumber}</h4>
          <p style="margin: 4px 0;"><strong>Coordinates:</strong> ${position.lat.toFixed(
            6
          )}, ${position.lng.toFixed(6)}</p>
          <p style="margin: 4px 0; color: #666;">Click "Get Elevation Data" to see elevation profile</p>
        </div>
      `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      setElevationPointMarkers((prev) => [...prev, marker]);
      addLog(
        `📍 Added elevation point ${pointNumber} marker at ${position.lat.toFixed(
          4
        )}, ${position.lng.toFixed(4)}`
      );
    };

    const createElevationPolyline = (points) => {
      if (!map || !points || points.length !== 2) {
        return;
      }

      // Remove existing elevation polyline
      if (elevationPolyline) {
        elevationPolyline.setMap(null);
      }

      // Create new polyline with distinct styling for elevation path
      const newPolyline = new window.google.maps.Polyline({
        path: points,
        geodesic: true, // Use geodesic for accurate elevation paths
        strokeColor: "#9C27B0", // Purple color to distinguish from measurement polylines
        strokeOpacity: 0.8,
        strokeWeight: 4,
        zIndex: 200, // Higher z-index to appear above other polylines
        map: map,
      });

      setElevationPolyline(newPolyline);
      addLog(
        `✅ Created elevation polyline connecting ${points.length} points`
      );
    };

    // Get elevation data for two selected points
    const getElevationForTwoPoints = async () => {
      if (elevationPoints.length !== 2) {
        addNotification(
          "Please select exactly 2 points on the map first",
          "warning"
        );
        return;
      }

      try {
        addLog("🏔️ Getting elevation data for selected points...");
        setShowElevationProfile(true);

        const elevationResults = await fetchElevationData(elevationPoints);
        const processedData = processElevationData(
          elevationResults,
          elevationPoints
        );
        const stats = calculateElevationStats(processedData);

        setElevationData(processedData);
        setElevationStats(stats);

        // Store individual point elevations
        if (processedData.length >= 2) {
          setPointElevations({
            point1: {
              elevation: processedData[0].elevation,
              formatted: processedData[0].formattedElevation,
              coords: elevationPoints[0],
            },
            point2: {
              elevation: processedData[1].elevation,
              formatted: processedData[1].formattedElevation,
              coords: elevationPoints[1],
            },
          });
        }

        // Create chart and markers
        if (processedData.length > 0) {
          createElevationChart(processedData);
          createElevationMarkers(processedData, stats);
          addNotification(`Elevation data loaded successfully!`, "success");
        }
      } catch (error) {
        addLog(`❌ Error getting elevation data: ${error.message}`);
        addNotification("Failed to get elevation data", "error");
      }
    };

    const togglePopLayer = async (show) => {
      try {
        if (show && !popKmlLayer) {
          addLog("🔄 Loading POP layer...");
          const layerData = await loadKmlLayer("/pop_location.kml", "POP");
          setPopKmlLayer(layerData);
        }

        // Handle KML markers
        if (popKmlLayer && popKmlLayer.markers) {
          popKmlLayer.markers.forEach((marker) => {
            marker.setMap(show ? map : null);
          });
          addLog(
            `${show ? "Showing" : "Hiding"} ${
              popKmlLayer.markers.length
            } POP KML markers`
          );
        }

        // Handle manual POP location markers
        if (manualLocations && manualLocations.pop) {
          manualLocations.pop.forEach((location) => {
            if (location.marker) {
              location.marker.setMap(show ? map : null);
            }
          });
          addLog(
            `${show ? "Showing" : "Hiding"} ${
              manualLocations.pop.length
            } manual POP markers`
          );
        }

        // Update clusterer visibility
        if (popClusterRef.current) {
          try {
            popClusterRef.current.setMap(show ? map : null);
            addLog(`✅ POP clusterer ${show ? "shown" : "hidden"}`);
          } catch (e) {
            addLog(`⚠️ Error updating POP clusterer: ${e.message}`);
          }
        }

        setShowPopLayer(show);
        localStorage.setItem("infra_toggle_pop", JSON.stringify(show));
        addLog(`✅ POP layer toggle completed: ${show}`);
      } catch (error) {
        addLog(`❌ Error toggling POP layer: ${error.message}`);
        addNotification(`Error toggling POP layer: ${error.message}`, "error");
      }
    };

    const toggleSubPopLayer = async (show) => {
      try {
        if (show && !subPopKmlLayer) {
          addLog("🔄 Loading Sub-POP layer...");
          const layerData = await loadKmlLayer(
            "/sub_pop_location.kml",
            "Sub-POP"
          );
          setSubPopKmlLayer(layerData);
        }

        // Handle KML markers
        if (subPopKmlLayer && subPopKmlLayer.markers) {
          subPopKmlLayer.markers.forEach((marker) => {
            marker.setMap(show ? map : null);
          });
          addLog(
            `${show ? "Showing" : "Hiding"} ${
              subPopKmlLayer.markers.length
            } Sub-POP KML markers`
          );
        }

        // Handle manual Sub-POP location markers
        if (manualLocations && manualLocations.sub) {
          manualLocations.sub.forEach((location) => {
            if (location.marker) {
              location.marker.setMap(show ? map : null);
            }
          });
          addLog(
            `${show ? "Showing" : "Hiding"} ${
              manualLocations.sub.length
            } manual Sub-POP markers`
          );
        }

        // Update clusterer visibility
        if (subClusterRef.current) {
          try {
            subClusterRef.current.setMap(show ? map : null);
            addLog(`✅ Sub-POP clusterer ${show ? "shown" : "hidden"}`);
          } catch (e) {
            addLog(`⚠️ Error updating Sub-POP clusterer: ${e.message}`);
          }
        }

        setShowSubPopLayer(show);
        localStorage.setItem("infra_toggle_subpop", JSON.stringify(show));
        addLog(`✅ Sub-POP layer toggle completed: ${show}`);
      } catch (error) {
        addLog(`❌ Error toggling Sub-POP layer: ${error.message}`);
        addNotification(
          `Error toggling Sub-POP layer: ${error.message}`,
          "error"
        );
      }
    };

    // Load KML layers by default when map is ready
    useEffect(() => {
      if (map && loaded) {
        addLog("🔄 Map ready, preparing to load KML layers...");
        setTimeout(() => {
          addLog("🔄 Loading default KML layers...");
          togglePopLayer(showPopLayer);
          toggleSubPopLayer(showSubPopLayer);
        }, 2000); // Increased delay to ensure map is fully ready
      }
    }, [map, loaded]);
    // Street View toggle with comprehensive error handling and name preservation
    const toggleStreetView = () => {
      addLog("🔍 Starting Street View toggle...");

      if (!map) {
        addLog("❌ Map not ready for Street View");
        addNotification("Map not ready for Street View", "error");
        return;
      }

      if (!window.google || !window.google.maps) {
        addLog("❌ Google Maps not loaded");
        addNotification("Google Maps not loaded", "error");
        return;
      }

      try {
        addLog("🔍 Getting Street View panorama...");

        if (streetViewOpen) {
          // Close Street View - Simple approach
          addLog("🔄 Closing Street View...");
          const streetView = map.getStreetView();
          if (streetView) {
            streetView.setVisible(false);
            setStreetViewOpen(false);
            setStreetViewPosition(null);
            addLog("✅ Street View closed successfully");
            addNotification("Street View closed", "info");
          }
        } else {
          // Open Street View - Enhanced approach with measurement preservation
          addLog("🔄 Opening Street View...");

          // Determine target position
          let targetPosition;
          if (points.length > 0) {
            targetPosition = points[0];
            addLog(
              `🎯 Using first measurement point: ${targetPosition.lat.toFixed(
                4
              )}, ${targetPosition.lng.toFixed(4)}`
            );
          } else {
            const center = map.getCenter();
            targetPosition = { lat: center.lat(), lng: center.lng() };
            addLog(
              `🎯 Using map center: ${targetPosition.lat.toFixed(
                4
              )}, ${targetPosition.lng.toFixed(4)}`
            );
          }

          // Try to open Street View
          const streetView = map.getStreetView();
          if (!streetView) {
            throw new Error("Street View panorama not available");
          }

          // Set position and POV
          streetView.setPosition(
            new window.google.maps.LatLng(
              targetPosition.lat,
              targetPosition.lng
            )
          );
          streetView.setPov({ heading: 0, pitch: 0 });

          // Add visibility listener BEFORE making visible
          const visibilityListener = streetView.addListener(
            "visible_changed",
            () => {
              const isVisible = streetView.getVisible();
              setStreetViewOpen(isVisible);
              addLog(`🌆 Street View visibility: ${isVisible}`);

              // Refresh measurement labels when street view opens/closes
              if (isVisible) {
                refreshMeasurementLabelsForStreetView();
              }
            }
          );

          // Add position change listener to maintain measurement names
          const positionListener = streetView.addListener(
            "position_changed",
            () => {
              const newPosition = streetView.getPosition();
              if (newPosition) {
                setStreetViewPosition({
                  lat: newPosition.lat(),
                  lng: newPosition.lng(),
                });
                refreshMeasurementLabelsForStreetView();
              }
            }
          );

          // Make Street View visible
          streetView.setVisible(true);
          setStreetViewOpen(true);
          setStreetViewPosition(targetPosition);

          addLog(
            "✅ Street View opened successfully with measurement name preservation"
          );
          addNotification(
            "Street View opened! Measurement names preserved. Use ESC key or Street View controls to close.",
            "success"
          );
        }
      } catch (error) {
        addLog(`❌ Street View error: ${error.message}`);
        addNotification(`Street View error: ${error.message}`, "error");
        console.error("Street View error:", error);

        // Reset state on error
        setStreetViewOpen(false);
      }
    };

    // Function to refresh measurement labels specifically for Street View
    const refreshMeasurementLabelsForStreetView = () => {
      if (!streetViewOpen) return;

      addLog("🔄 Refreshing measurement labels for Street View");

      // Ensure saved measurement names remain visible in Street View
      savedMeasurements.forEach((measurement, index) => {
        if (measurement.points && measurement.points.length > 0) {
          // Update marker titles with measurement names
          measurement.points.forEach((point, pointIndex) => {
            if (point.marker && point.marker.setTitle) {
              const title =
                pointIndex === 0
                  ? `${measurement.name} - Start Point`
                  : `${measurement.name} - Point ${pointIndex + 1}`;
              point.marker.setTitle(title);
              addLog(`🏷️ Updated marker title: ${title}`);
            }
          });
        }
      });

      // Refresh distance labels to ensure visibility
      distanceLabels.forEach((label, index) => {
        if (label && label.setMap) {
          label.setMap(map);
          addLog(`✅ Distance label ${index + 1} refreshed for Street View`);
        }
      });

      addLog("✅ Street View measurement labels refresh completed");
    };

    // Refresh measurements to ensure visibility in all modes
    const refreshMeasurements = () => {
      if (!map || !window.google) return;

      // Only refresh if we actually have active measurements/polygons
      const hasDistanceData =
        markers.length > 0 || distanceLabels.length > 0 || polyline;
      const hasPolygonData = polygon || polygonMarkers.length > 0 || areaLabel;

      if (!hasDistanceData && !hasPolygonData) {
        addLog("🔄 No active measurements to refresh - skipping");
        return;
      }

      try {
        addLog(
          `🔄 Refreshing ${markers.length} markers and ${distanceLabels.length} labels`
        );

        // Ensure all markers are visible (only if we have markers)
        if (markers.length > 0) {
          markers.forEach((marker, index) => {
            if (
              marker &&
              marker.setMap &&
              typeof marker.setMap === "function"
            ) {
              marker.setMap(map);
              addLog(`✅ Marker ${index + 1} refreshed`);
            }
          });
        }

        // Ensure all distance labels are visible (only if we have labels)
        if (distanceLabels.length > 0) {
          distanceLabels.forEach((label, index) => {
            if (label && label.setMap && typeof label.setMap === "function") {
              label.setMap(map);
              addLog(`✅ Distance label ${index + 1} refreshed`);
            }
          });
        }

        // Ensure polyline is visible (only if we have a polyline)
        if (
          polyline &&
          polyline.setMap &&
          typeof polyline.setMap === "function"
        ) {
          polyline.setMap(map);
          addLog("✅ Polyline refreshed");
        }

        // Ensure polygon and related markers/labels are visible (only if we have polygon data)
        if (polygon && polygon.setMap && typeof polygon.setMap === "function") {
          polygon.setMap(map);
          addLog("✅ Polygon refreshed");
        }
        if (polygonMarkers.length > 0) {
          polygonMarkers.forEach((m, i) => {
            if (m && m.setMap && typeof m.setMap === "function") {
              m.setMap(map);
              addLog(`✅ Polygon marker ${i + 1} refreshed`);
            }
          });
        }
        if (
          areaLabel &&
          areaLabel.setMap &&
          typeof areaLabel.setMap === "function"
        ) {
          areaLabel.setMap(map);
          addLog("✅ Area label refreshed");
        }

        addLog("✅ Measurement refresh completed");
      } catch (error) {
        addLog(`❌ Error refreshing measurements: ${error.message}`);
      }
    };

    // Expose methods through ref
    React.useImperativeHandle(
      ref,
      () => ({
        // Map reference
        map,

        // Drawing controls
        startDrawing: () => {
          addLog("🎯 Dashboard calling startDrawing()");
          return startDrawing();
        },
        stopDrawing: () => {
          addLog("⏹️ Dashboard calling stopDrawing()");
          return stopDrawing();
        },
        startPolygonDrawing: () => {
          addLog("📐 Dashboard calling startPolygonDrawing()");
          return startPolygonDrawing();
        },
        stopPolygonDrawing: () => {
          addLog("⏹️ Dashboard calling stopPolygonDrawing()");
          return stopPolygonDrawing();
        },
        clearAll: () => {
          addLog("🧹 Dashboard calling clearAll()");
          return clearAll();
        },

        // Map controls
        zoomIn,
        zoomOut,
        centerOnIndia,
        toggleStreetView,

        // Layer controls
        setShowElevation: (show) => {
          // Always update the appropriate state based on external control
          if (externalShowElevation === undefined) {
            setInternalShowElevation(show);
          }
          // For external control, the parent will handle the state update
          addLog(`📈 Elevation toggled: ${show}`);
        },
        setShowInfrastructure: (show) => {
          // Always update the appropriate state based on external control
          if (externalShowInfrastructure === undefined) {
            setInternalShowInfrastructure(show);
          }
          // For external control, the parent will handle the state update
          addLog(`🏢 Infrastructure toggled: ${show}`);
        },

        // Layer management
        toggleLayer: (layerName, isActive) => {
          addLog(`🌍 Layer toggle: ${layerName} = ${isActive}`);

          if (!map || !window.google) {
            addLog("❌ Map not ready for layer toggle");
            return;
          }

          switch (layerName) {
            case "boundaries":
              // Toggle administrative boundaries overlay
              if (isActive) {
                addLog("✅ Enabling boundaries layer");
                addNotification("Administrative boundaries enabled", "info");
              } else {
                addLog("❌ Disabling boundaries layer");
                addNotification("Administrative boundaries disabled", "info");
              }
              break;

            case "roads":
              // Toggle roads visibility by changing map style
              if (isActive) {
                addLog("✅ Enabling roads layer");
                addNotification("Roads layer enabled", "info");
              } else {
                addLog("❌ Disabling roads layer");
                addNotification("Roads layer disabled", "info");
              }
              break;

            case "buildings":
              // Toggle buildings 3D view
              if (isActive) {
                addLog("✅ Enabling buildings layer");
                map.setTilt(45); // Enable 3D buildings view
                addNotification("3D Buildings enabled", "info");
              } else {
                addLog("❌ Disabling buildings layer");
                map.setTilt(0); // Disable 3D buildings view
                addNotification("3D Buildings disabled", "info");
              }
              break;

            case "terrain":
              // Toggle terrain visibility
              if (isActive) {
                addLog("✅ Enabling terrain layer");
                // Enable terrain visualization
                addNotification("Terrain layer enabled", "info");
              } else {
                addLog("❌ Disabling terrain layer");
                addNotification("Terrain layer disabled", "info");
              }
              break;

            case "infrastructure":
              // Toggle infrastructure POI visibility
              if (isActive) {
                addLog("✅ Enabling infrastructure layer");
                // Enable infrastructure points of interest
                addNotification("Infrastructure POIs enabled", "info");
              } else {
                addLog("❌ Disabling infrastructure layer");
                addNotification("Infrastructure POIs disabled", "info");
              }
              break;

            default:
              addLog(`⚠️ Unknown layer: ${layerName}`);
              break;
          }
        },

        // Add Street View label refresh function to exposed methods
        refreshMeasurementLabelsForStreetView,
        // Save functions
        saveMeasurement: (name) => {
          if (totalDistance > 0 && points.length >= 2) {
            const measurement = {
              name: name || `Measurement ${Date.now()}`,
              distance: totalDistance,
              points: [...points],
              segmentDistances: [...segmentDistances],
              date: new Date().toLocaleString(),
            };
            localStorage.setItem(
              `distance_measurement_${Date.now()}`,
              JSON.stringify(measurement)
            );
            addLog(`💾 Distance measurement saved: ${name}`);
            addNotification(
              "Distance measurement saved successfully!",
              "success"
            );
          }
        },

        savePolygonData: (name) => {
          if (polygonArea > 0 && polygonPoints.length >= 3) {
            const polygonData = {
              name: name || `Polygon ${Date.now()}`,
              area: polygonArea,
              perimeter: polygonPerimeter,
              points: [...polygonPoints],
              date: new Date().toLocaleString(),
            };
            localStorage.setItem(
              `polygon_${Date.now()}`,
              JSON.stringify(polygonData)
            );
            addLog(`💾 Polygon saved: ${name}`);
            addNotification("Polygon saved successfully!", "success");
          }
        },

        // History functions
        loadSavedMeasurements,
        setHistoryDialogOpen: (open) => setHistoryDialogOpen(open),

        // State getters
        getPoints: () => points,
        getPolygonPoints: () => polygonPoints,
        getTotalDistance: () => totalDistance,
        getPolygonArea: () => polygonArea,
      }),
      [
        map,
        points,
        polygonPoints,
        totalDistance,
        polygonArea,
        segmentDistances,
        polygonPerimeter,
      ]
    );

    // Update parent state when internal states change
    React.useEffect(() => {
      // Use setTimeout to avoid setState during render
      const timer = setTimeout(() => {
        if (onTotalDistanceChange) {
          onTotalDistanceChange(totalDistance);
        }
      }, 0);
      return () => clearTimeout(timer);
    }, [totalDistance, onTotalDistanceChange]);

    React.useEffect(() => {
      // Use setTimeout to avoid setState during render
      const timer = setTimeout(() => {
        if (onPolygonAreaChange) {
          onPolygonAreaChange(polygonArea);
        }
      }, 0);
      return () => clearTimeout(timer);
    }, [polygonArea, onPolygonAreaChange]);

    React.useEffect(() => {
      // Use setTimeout to avoid setState during render
      const timer = setTimeout(() => {
        if (onPointsChange) {
          onPointsChange(internalPoints);
        }
      }, 0);
      return () => clearTimeout(timer);
    }, [internalPoints, onPointsChange]);

    React.useEffect(() => {
      // Use setTimeout to avoid setState during render
      const timer = setTimeout(() => {
        if (onPolygonPointsChange) {
          onPolygonPointsChange(internalPolygonPoints);
        }
      }, 0);
      return () => clearTimeout(timer);
    }, [internalPolygonPoints, onPolygonPointsChange]);

    // Handle elevation state changes from external controls
    React.useEffect(() => {
      if (externalShowElevation !== undefined) {
        addLog(`🏩 External elevation state changed: ${externalShowElevation}`);
        if (externalShowElevation && points.length >= 2) {
          // Auto-trigger elevation analysis when enabled with existing points
          setTimeout(() => {
            getElevationForPath().catch((error) => {
              addLog(`⚠️ Auto elevation update failed: ${error.message}`);
            });
          }, 100);
        } else if (!externalShowElevation) {
          // Clear elevation data when disabled
          clearElevationData();
        }
      }
    }, [externalShowElevation, points.length]);

    // Handle infrastructure state changes from external controls
    React.useEffect(() => {
      if (externalShowInfrastructure !== undefined) {
        addLog(
          `🏢 External infrastructure state changed: ${externalShowInfrastructure}`
        );
        // Infrastructure layers are managed by the existing toggle functions
        // The state change will trigger the conditional rendering of infrastructure panels
      }
    }, [externalShowInfrastructure]);

    // Load saved measurements
    const loadSavedMeasurements = () => {
      addLog("🗺 Loading saved measurements from localStorage...");
      const measurements = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("distance_measurement_")) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            // Add formatted distance if not present
            if (!data.formattedDistance && data.distance) {
              data.formattedDistance = `${(data.distance / 1000).toFixed(
                2
              )} km`;
            }
            measurements.push({ key, ...data });
            addLog(`✅ Loaded measurement: ${data.name}`);
          } catch (error) {
            addLog(`❌ Error parsing saved measurement: ${error.message}`);
            console.error("Error parsing saved measurement:", error);
          }
        }
      }
      addLog(`📋 Found ${measurements.length} saved measurements`);
      setSavedMeasurements(
        measurements.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
    };

    // Show delete confirmation
    const showDeleteConfirmation = (measurement) => {
      setMeasurementToDelete(measurement);
      setDeleteConfirmOpen(true);
    };

    // Delete saved measurement after confirmation
    const deleteMeasurement = () => {
      if (measurementToDelete) {
        localStorage.removeItem(measurementToDelete.key);
        loadSavedMeasurements();
        addNotification(
          `Deleted measurement: ${measurementToDelete.name}`,
          "success"
        );
        setDeleteConfirmOpen(false);
        setMeasurementToDelete(null);
      }
    };

    // Cancel delete
    const cancelDelete = () => {
      setDeleteConfirmOpen(false);
      setMeasurementToDelete(null);
    };

    // Load measurement data with proper state management
    const loadMeasurement = (measurement) => {
      addLog(`📥 Loading measurement: ${measurement.name}`);

      // First clear everything properly
      clearAll();

      // Wait for clear to complete, then load new measurement
      setTimeout(() => {
        addLog("🔄 Setting up loaded measurement...");

        // Set basic data
        setPoints(measurement.points);
        setTotalDistance(measurement.totalDistance);
        setSegmentDistances(measurement.segments || []);

        // Recreate all visual elements
        if (map && measurement.points.length > 0) {
          const newMarkers = [];
          const newDistanceLabels = [];

          addLog(`🎯 Creating ${measurement.points.length} markers...`);

          // Create markers
          measurement.points.forEach((point, index) => {
            try {
              const marker = new window.google.maps.Marker({
                position: point,
                map: map,
                title: `Point ${index + 1}`,
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10, // Larger for Street View visibility
                  fillColor: "#FF5722", // Bright orange
                  fillOpacity: 1, // Full opacity
                  strokeColor: "#FFFFFF",
                  strokeWeight: 3, // Thicker stroke
                },
                zIndex: 1000,
              });
              newMarkers.push(marker);
              addLog(`✅ Created marker ${index + 1}`);
            } catch (error) {
              addLog(`❌ Error creating marker ${index + 1}: ${error.message}`);
            }
          });

          // Update markers state
          setMarkers(newMarkers);
          addLog(`✅ Set ${newMarkers.length} markers in state`);

          // Create polyline and distance labels if we have multiple points
          if (measurement.points.length >= 2) {
            try {
              // Create polyline
              const newPolyline = new window.google.maps.Polyline({
                path: measurement.points,
                geodesic: false,
                strokeColor: "#FF5722",
                strokeOpacity: 0.6,
                strokeWeight: 3,
                zIndex: 100,
                map: map,
              });
              setPolyline(newPolyline);
              addLog("✅ Created polyline");

              // Create distance labels
              addLog(
                `📌 Creating ${
                  measurement.points.length - 1
                } distance labels...`
              );
              for (let i = 1; i < measurement.points.length; i++) {
                try {
                  const segmentDistance = calculateDistance(
                    measurement.points[i - 1],
                    measurement.points[i]
                  );
                  const label = createDistanceLabel(
                    measurement.points[i - 1],
                    measurement.points[i],
                    segmentDistance,
                    map
                  );
                  newDistanceLabels.push(label);
                  addLog(`✅ Created distance label ${i}`);
                } catch (error) {
                  addLog(
                    `❌ Error creating distance label ${i}: ${error.message}`
                  );
                }
              }

              // Update distance labels state
              setDistanceLabels(newDistanceLabels);
              addLog(
                `✅ Set ${newDistanceLabels.length} distance labels in state`
              );
            } catch (error) {
              addLog(`❌ Error creating polyline/labels: ${error.message}`);
            }
          }

          // Fit bounds to measurement
          try {
            const bounds = new window.google.maps.LatLngBounds();
            measurement.points.forEach((point) => bounds.extend(point));
            map.fitBounds(bounds);
            addLog("✅ Fitted bounds to measurement");
          } catch (error) {
            addLog(`❌ Error fitting bounds: ${error.message}`);
          }
        }

        setHistoryDialogOpen(false);
        addLog(`✅ Measurement loaded successfully: ${measurement.name}`);
        addNotification(`Loaded: ${measurement.name}`, "success");
      }, 100); // Small delay to ensure clearAll completes
    };

    const saveMeasurement = () => {
      if (points.length < 2) {
        addNotification("Need at least 2 points to save", "warning");
        return;
      }

      const measurementData = {
        name: measurementName || `Measurement ${Date.now()}`,
        points,
        totalDistance,
        formattedDistance: formatDistance(totalDistance),
        segments: segmentDistances,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString(),
      };

      localStorage.setItem(
        `measurement_${Date.now()}`,
        JSON.stringify(measurementData)
      );
      setSaveDialogOpen(false);
      setMeasurementName("");
      addNotification("Measurement saved successfully!", "success");
    };
    return (
      <Box
        sx={{
          height: hideHeader && hideControls ? "100vh" : "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", // Prevent main container scrollbars
        }}
      >
        {/* Header - conditionally rendered */}
        {!hideHeader && (
          <Paper elevation={2} sx={{ p: 2, mb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <MapIcon color="primary" />
              <Typography variant="h5" fontWeight="bold">
                Working Distance Measurement Tool
              </Typography>
              {(isDrawing || isPolygonDrawing) && (
                <Chip
                  label={isDrawing ? "MEASURING DISTANCE" : "DRAWING POLYGON"}
                  color="success"
                  icon={isDrawing ? <Timeline /> : <Crop />}
                  sx={{ fontWeight: "bold" }}
                />
              )}
              <Box sx={{ flexGrow: 1 }} />
              {points.length > 0 && (
                <Chip
                  label={`${points.length} points - ${formatDistance(
                    totalDistance
                  )}`}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Stack>
          </Paper>
        )}

        {/* Controls - conditionally rendered */}
        {!hideControls && (
          <Paper elevation={2} sx={{ p: 2, mb: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              {/* Modern Add Points Button */}
              <Button
                variant={isDrawing ? "contained" : "outlined"}
                size="large"
                onClick={() => {
                  if (isDrawing) {
                    stopDrawing();
                  } else {
                    setDrawingMode("distance");
                    stopPolygonDrawing();
                    startDrawing();
                  }
                }}
                startIcon={isDrawing ? <Stop /> : <PlayArrow />}
                disabled={!loaded}
                sx={{
                  minWidth: 140,
                  fontWeight: "bold",
                  textTransform: "none",
                  borderRadius: 3,
                  py: 1.5,
                  px: 3,
                  background: isDrawing
                    ? "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)"
                    : "transparent",
                  color: isDrawing ? "white" : "#2196F3",
                  borderColor: isDrawing ? "#4CAF50" : "#2196F3",
                  borderWidth: 2,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    background: isDrawing
                      ? "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)"
                      : "rgba(33, 150, 243, 0.08)",
                    borderColor: isDrawing ? "#2E7D32" : "#1976D2",
                    transform: "translateY(-2px)",
                    boxShadow: isDrawing
                      ? "0 4px 12px rgba(76, 175, 80, 0.3)"
                      : "0 4px 12px rgba(33, 150, 243, 0.3)",
                    borderWidth: 2,
                  },
                }}
              >
                {isDrawing ? "🛑 Stop Distance" : "📏 Measure Distance"}
              </Button>

              {/* Distance measurement controls - only show when we have points */}
              {points.length > 0 && (
                <Chip
                  label={`${points.length} points - ${formatDistance(
                    totalDistance
                  )}`}
                  color="primary"
                  variant="filled"
                  sx={{ fontWeight: "bold" }}
                />
              )}

              {/* Modern Polygon Drawing Button */}
              <Button
                variant={isPolygonDrawing ? "contained" : "outlined"}
                size="large"
                onClick={() => {
                  if (isPolygonDrawing) {
                    stopPolygonDrawing();
                  } else {
                    stopDrawing();
                    startPolygonDrawing();
                  }
                }}
                startIcon={isPolygonDrawing ? <Stop /> : <Crop />}
                disabled={!loaded}
                sx={{
                  minWidth: 140,
                  fontWeight: "bold",
                  textTransform: "none",
                  borderRadius: 3,
                  py: 1.5,
                  px: 3,
                  background: isPolygonDrawing
                    ? "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)"
                    : "transparent",
                  color: isPolygonDrawing ? "white" : "#9C27B0",
                  borderColor: isPolygonDrawing ? "#9C27B0" : "#9C27B0",
                  borderWidth: 2,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    background: isPolygonDrawing
                      ? "linear-gradient(135deg, #7B1FA2 0%, #4A148C 100%)"
                      : "rgba(156, 39, 176, 0.08)",
                    borderColor: isPolygonDrawing ? "#7B1FA2" : "#7B1FA2",
                    transform: "translateY(-2px)",
                    boxShadow: isPolygonDrawing
                      ? "0 4px 12px rgba(156, 39, 176, 0.3)"
                      : "0 4px 12px rgba(156, 39, 176, 0.3)",
                    borderWidth: 2,
                  },
                }}
              >
                {isPolygonDrawing ? "🛑 Stop Polygon" : "📐 Draw Polygon"}
              </Button>

              {/* Show polygon area when available */}
              {polygonPoints.length >= 3 && (
                <Chip
                  label={`Area: ${formatArea(polygonArea)}`}
                  color="success"
                  variant="filled"
                  sx={{ fontWeight: "bold" }}
                />
              )}

              {/* Modern Clear All Button */}
              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  addLog("📉 === CLEAR ALL BUTTON CLICKED ===");
                  addLog(
                    `📉 Before clear - Markers: ${markers.length}, Labels: ${distanceLabels.length}, Points: ${points.length}, Drawing: ${isDrawing}`
                  );
                  clearAll();
                }}
                disabled={
                  !loaded || (points.length === 0 && polygonPoints.length === 0)
                }
                startIcon={<Clear />}
                sx={{
                  fontWeight: "bold",
                  textTransform: "none",
                  borderRadius: 3,
                  py: 1.5,
                  px: 3,
                  borderColor: "#FF5722",
                  color: "#FF5722",
                  borderWidth: 2,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 87, 34, 0.08)",
                    borderColor: "#D84315",
                    color: "#D84315",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(255, 87, 34, 0.3)",
                    borderWidth: 2,
                  },
                }}
              >
                🧹 Clear All
              </Button>

              {/* Modern Save Distance Button */}
              {points.length >= 2 && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => setSaveDialogOpen(true)}
                  disabled={!loaded}
                  startIcon={<Save />}
                  sx={{
                    fontWeight: "bold",
                    textTransform: "none",
                    borderRadius: 3,
                    py: 1.5,
                    px: 3,
                    borderColor: "#4CAF50",
                    color: "#4CAF50",
                    borderWidth: 2,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      backgroundColor: "rgba(76, 175, 80, 0.08)",
                      borderColor: "#2E7D32",
                      color: "#2E7D32",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                      borderWidth: 2,
                    },
                  }}
                >
                  💾 Save Distance
                </Button>
              )}

              {/* Modern Save Polygon Button */}
              {polygonPoints.length >= 3 && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={openPolygonSaveDialog}
                  disabled={!loaded}
                  startIcon={<Save />}
                  sx={{
                    fontWeight: "bold",
                    textTransform: "none",
                    borderRadius: 3,
                    py: 1.5,
                    px: 3,
                    borderColor: "#9C27B0",
                    color: "#9C27B0",
                    borderWidth: 2,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      backgroundColor: "rgba(156, 39, 176, 0.08)",
                      borderColor: "#7B1FA2",
                      color: "#7B1FA2",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(156, 39, 176, 0.3)",
                      borderWidth: 2,
                    },
                  }}
                >
                  💾 Save Polygon
                </Button>
              )}

              <Box sx={{ flexGrow: 1 }} />

              {/* History and settings */}
              <Button
                variant="outlined"
                onClick={() => {
                  loadSavedMeasurements();
                  setHistoryDialogOpen(true);
                }}
                disabled={!loaded}
                startIcon={<History />}
                size="small"
              >
                History
              </Button>

              <Button
                variant={showElevation ? "contained" : "outlined"}
                onClick={() => {
                  setShowElevation(!showElevation);
                  if (!showElevation) {
                    // When opening elevation sidebar, enter elevation mode
                    setIsElevationMode(true);
                    clearElevationPoints();
                    addLog(
                      "📈 Elevation mode activated - Click 2 points on map"
                    );
                    addNotification(
                      "Elevation mode: Click 2 points on the map to create elevation profile",
                      "info"
                    );
                  } else {
                    // When closing elevation sidebar, exit elevation mode
                    setIsElevationMode(false);
                    clearElevationPoints();
                    clearElevationData();
                    addLog("📈 Elevation mode deactivated");
                  }
                }}
                disabled={!loaded}
                startIcon={<TrendingUp />}
                sx={{
                  background: showElevation
                    ? "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)"
                    : "transparent",
                  color: showElevation ? "white" : "#FF9800",
                  borderColor: "#FF9800",
                  "&:hover": {
                    background: showElevation
                      ? "linear-gradient(135deg, #F57C00 0%, #E65100 100%)"
                      : "rgba(255, 152, 0, 0.08)",
                    borderColor: "#F57C00",
                  },
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                }}
              >
                {showElevation ? "Hide Elevation" : "Elevation"}
              </Button>

              <Button
                variant={showInfrastructure ? "contained" : "outlined"}
                onClick={() => setShowInfrastructure(!showInfrastructure)}
                disabled={!loaded}
                startIcon={<Business />}
                sx={{
                  background: showInfrastructure
                    ? "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)"
                    : "transparent",
                  color: showInfrastructure ? "white" : "#2196F3",
                  borderColor: "#2196F3",
                  "&:hover": {
                    background: showInfrastructure
                      ? "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)"
                      : "rgba(33, 150, 243, 0.08)",
                    borderColor: "#1976D2",
                  },
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                }}
              >
                {showInfrastructure ? "Hide Infrastructure" : "Infrastructure"}
              </Button>
            </Stack>

            {/* Second row - Utility buttons */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 1 }}
            >
              {/* Modern Show Boundary Button */}
              <Button
                variant="outlined"
                onClick={() => {
                  if (showIndiaBoundary) {
                    showIndiaBoundary();
                    addLog("🇮🇳 India boundary shown on map");
                    addNotification("India boundary displayed", "info");
                  }
                }}
                disabled={!loaded}
                startIcon={<MapIcon />}
                size="medium"
                sx={{
                  fontWeight: "bold",
                  textTransform: "none",
                  borderRadius: 2.5,
                  py: 1,
                  px: 2.5,
                  borderColor: "#795548",
                  color: "#795548",
                  borderWidth: 2,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    backgroundColor: "rgba(121, 85, 72, 0.08)",
                    borderColor: "#5D4037",
                    color: "#5D4037",
                    transform: "translateY(-1px)",
                    boxShadow: "0 3px 8px rgba(121, 85, 72, 0.25)",
                    borderWidth: 2,
                  },
                }}
              >
                🗺️ Show Boundary
              </Button>

              {/* Modern Load Polygons Button */}
              <Button
                variant="outlined"
                onClick={() => {
                  loadSavedPolygons();
                  setPolygonHistoryDialogOpen(true);
                }}
                disabled={!loaded}
                startIcon={<History />}
                size="medium"
                sx={{
                  fontWeight: "bold",
                  textTransform: "none",
                  borderRadius: 2.5,
                  py: 1,
                  px: 2.5,
                  borderColor: "#607D8B",
                  color: "#607D8B",
                  borderWidth: 2,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    backgroundColor: "rgba(96, 125, 139, 0.08)",
                    borderColor: "#455A64",
                    color: "#455A64",
                    transform: "translateY(-1px)",
                    boxShadow: "0 3px 8px rgba(96, 125, 139, 0.25)",
                    borderWidth: 2,
                  },
                }}
              >
                📁 Load Polygons
              </Button>

              <Box sx={{ flexGrow: 1 }} />

              {/* Zoom controls */}
              <Tooltip title="Zoom In">
                <IconButton onClick={zoomIn} disabled={!loaded} size="small">
                  <ZoomIn />
                </IconButton>
              </Tooltip>

              <Tooltip title="Zoom Out">
                <IconButton onClick={zoomOut} disabled={!loaded} size="small">
                  <ZoomOut />
                </IconButton>
              </Tooltip>

              <Tooltip title="Center on India">
                <IconButton
                  onClick={centerOnIndia}
                  disabled={!loaded}
                  size="small"
                >
                  <CenterFocusStrong />
                </IconButton>
              </Tooltip>

              <Tooltip
                title={
                  streetViewOpen ? "Close Street View" : "Open Street View"
                }
              >
                <IconButton
                  onClick={toggleStreetView}
                  disabled={!loaded}
                  color={streetViewOpen ? "primary" : "default"}
                  size="small"
                >
                  <Visibility />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>
        )}

        {/* Map and Results Layout */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            gap: 1,
            overflow: "hidden",
            minHeight: 0, // Important for flex containers with overflow
          }}
        >
          {/* Map Container */}
          <Box sx={{ flex: 1, position: "relative" }}>
            <Paper elevation={2} sx={{ height: "100%", position: "relative" }}>
              <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

              {!loaded && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h6">Loading Google Maps...</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Please wait while we initialize the map
                  </Typography>
                </Box>
              )}

              {/* Instructions - Auto-hide after 5 seconds */}
              {!isDrawing &&
                points.length === 0 &&
                loaded &&
                showInstructions && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      right: 16,
                      zIndex: 1000,
                    }}
                  >
                    <Alert
                      severity="info"
                      onClose={() => setShowInstructions(false)}
                    >
                      Click "Start Measurement" and then click on the map to add
                      measurement points.
                    </Alert>
                  </Box>
                )}

              {/* Debug Info */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  zIndex: 1000,
                }}
              >
                <Chip
                  label={`Boundary loaded: ${
                    indiaBounds ? "Yes" : "Loading..."
                  }`}
                  color={indiaBounds ? "success" : "warning"}
                  size="small"
                />
              </Box>
            </Paper>
          </Box>

          {/* Modern Results Panel - Distance */}
          {segmentDistances.length > 0 && drawingMode === "distance" && (
            <Paper
              elevation={3}
              sx={{
                width: 420,
                borderRadius: 3,
                background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)",
                border: "1px solid rgba(33, 150, 243, 0.1)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 2.5,
                  background:
                    "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Timeline sx={{ mr: 1.5, fontSize: 24 }} />
                <Typography variant="h6" fontWeight="bold">
                  📏 Distance Measurement Results
                </Typography>
              </Box>

              <Box sx={{ p: 3 }}>
                <Box sx={{ maxHeight: 280, overflow: "auto", mb: 3 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{ fontWeight: "bold", color: "#1976D2" }}
                          >
                            Segment
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: "bold", color: "#1976D2" }}
                          >
                            Distance
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: "bold", color: "#1976D2" }}
                          >
                            Total
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {segmentDistances.map((segment) => (
                          <TableRow
                            key={segment.id}
                            sx={{
                              "&:hover": {
                                backgroundColor: "rgba(33, 150, 243, 0.04)",
                              },
                            }}
                          >
                            <TableCell sx={{ fontWeight: "medium" }}>
                              📍 Point {segment.from} → {segment.to}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: "medium", color: "#424242" }}
                            >
                              {segment.formattedDistance}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                color: "primary.main",
                                fontWeight: "bold",
                                fontSize: "0.95rem",
                              }}
                            >
                              {segment.formattedTotalDistance}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                <Card
                  elevation={0}
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)",
                    border: "2px solid rgba(33, 150, 243, 0.2)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography
                      variant="h6"
                      sx={{ color: "#1976D2", fontWeight: "bold", mb: 1 }}
                    >
                      📐 Total Distance: {formatDistance(totalDistance)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📊 {points.length} measurement points •{" "}
                      {segmentDistances.length} segments
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Paper>
          )}

          {/* Modern Results Panel - Polygon */}
          {polygonPoints.length >= 3 && drawingMode === "polygon" && (
            <Paper
              elevation={3}
              sx={{
                width: 420,
                borderRadius: 3,
                background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)",
                border: "1px solid rgba(156, 39, 176, 0.1)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 2.5,
                  background:
                    "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <SquareFoot sx={{ mr: 1.5, fontSize: 24 }} />
                <Typography variant="h6" fontWeight="bold">
                  📐 Polygon Area Results
                </Typography>
              </Box>

              <Box sx={{ p: 3 }}>
                {/* Edit controls for loaded polygon */}
                {canEditLoadedPolygon && (
                  <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    {!isEditingPolygon ? (
                      <Button
                        variant="outlined"
                        onClick={enableEditLoadedPolygon}
                        sx={{
                          fontWeight: "bold",
                          textTransform: "none",
                          borderRadius: 2,
                          py: 1,
                          px: 2.5,
                          borderColor: "#4CAF50",
                          color: "#4CAF50",
                          "&:hover": {
                            backgroundColor: "rgba(76, 175, 80, 0.08)",
                            borderColor: "#2E7D32",
                          },
                        }}
                      >
                        ✏️ Enable Edit
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="contained"
                          onClick={saveEditedPolygon}
                          sx={{
                            fontWeight: "bold",
                            textTransform: "none",
                            borderRadius: 2,
                            py: 1,
                            px: 2.5,
                            background:
                              "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
                            },
                          }}
                        >
                          💾 Save Updates
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={cancelEditLoadedPolygon}
                          sx={{
                            fontWeight: "bold",
                            textTransform: "none",
                            borderRadius: 2,
                            py: 1,
                            px: 2.5,
                            borderColor: "#757575",
                            color: "#757575",
                            "&:hover": {
                              backgroundColor: "rgba(117, 117, 117, 0.08)",
                            },
                          }}
                        >
                          ❌ Cancel Edit
                        </Button>
                      </>
                    )}
                  </Stack>
                )}

                <Card
                  elevation={0}
                  sx={{ mb: 3, border: "1px solid #E0E0E0", borderRadius: 2 }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                      sx={{ color: "#7B1FA2" }}
                    >
                      📍 Polygon Points ({polygonPoints.length})
                    </Typography>
                    <Box sx={{ maxHeight: 180, overflow: "auto" }}>
                      {polygonPoints.map((point, index) => (
                        <Typography
                          key={index}
                          variant="body2"
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.85rem",
                            mb: 0.5,
                            p: 0.8,
                            borderRadius: 1,
                            bgcolor:
                              index % 2 === 0
                                ? "rgba(156, 39, 176, 0.02)"
                                : "transparent",
                            "&:hover": {
                              bgcolor: "rgba(156, 39, 176, 0.05)",
                            },
                          }}
                        >
                          Point {index + 1}: {point.lat.toFixed(6)},{" "}
                          {point.lng.toFixed(6)}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>

                <Card
                  elevation={0}
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(156, 39, 176, 0.05) 100%)",
                    border: "2px solid rgba(156, 39, 176, 0.2)",
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ color: "#7B1FA2", fontWeight: "bold", mb: 1.5 }}
                    >
                      📊 Area: {formatArea(polygonArea)}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ color: "#7B1FA2", fontWeight: "bold", mb: 1.5 }}
                    >
                      📏 Perimeter: {formatDistance(polygonPerimeter)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      🔢 Total vertices: {polygonPoints.length} points
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Paper>
          )}
          {/* Modern Elevation Sidebar */}
          {showElevation && (
            <Paper
              elevation={3}
              sx={{
                width: 450,
                maxHeight: "calc(100vh - 200px)",
                overflow: "hidden",
                borderRadius: 3,
                background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)",
                border: "1px solid rgba(255, 152, 0, 0.1)",
              }}
            >
              <Box
                sx={{
                  p: 3,
                  background:
                    "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TrendingUp sx={{ mr: 2, fontSize: 28 }} />
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      Elevation Profile
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Analyze terrain elevation between two points
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  p: 3,
                  overflow: "auto",
                  maxHeight: "calc(100vh - 320px)",
                }}
              >
                {/* Modern Workflow Progress */}
                <Card
                  elevation={0}
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    background: isElevationMode
                      ? "linear-gradient(135deg, #E8F5E8 0%, #C8E6C8 100%)"
                      : "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)",
                    border: `2px solid ${
                      isElevationMode ? "#4CAF50" : "#FF9800"
                    }`,
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: isElevationMode ? "scale(1.02)" : "scale(1)",
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: isElevationMode
                            ? "linear-gradient(135deg, #4CAF50, #2E7D32)"
                            : "linear-gradient(135deg, #FF9800, #F57C00)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 2,
                          boxShadow: 3,
                        }}
                      >
                        {isElevationMode ? (
                          <Typography sx={{ fontSize: "1.5rem" }}>
                            🎯
                          </Typography>
                        ) : (
                          <Typography sx={{ fontSize: "1.5rem" }}>
                            📍
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          sx={{
                            color: isElevationMode ? "#2E7D32" : "#E65100",
                            mb: 0.5,
                          }}
                        >
                          {isElevationMode
                            ? "Ready to Select Points!"
                            : "Elevation Analysis"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {isElevationMode
                            ? "Click anywhere on the map to place elevation points"
                            : "Follow these steps to analyze elevation"}
                        </Typography>
                      </Box>
                    </Box>

                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          position: "relative",
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background:
                              elevationPoints.length >= 1
                                ? "linear-gradient(135deg, #4CAF50, #2E7D32)"
                                : "linear-gradient(135deg, #E0E0E0, #BDBDBD)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: "bold",
                            boxShadow: elevationPoints.length >= 1 ? 3 : 1,
                            transition: "all 0.3s ease",
                            border: "3px solid white",
                          }}
                        >
                          {elevationPoints.length >= 1 ? "✓" : "1"}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              color:
                                elevationPoints.length >= 1
                                  ? "#2E7D32"
                                  : "#666",
                              fontWeight:
                                elevationPoints.length >= 1 ? "bold" : "normal",
                              mb: 0.5,
                            }}
                          >
                            Select First Point
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Click anywhere on the map to place your first
                            elevation marker
                          </Typography>
                        </Box>
                        {elevationPoints.length >= 1 && (
                          <Chip
                            size="small"
                            label="Complete"
                            color="success"
                            variant="outlined"
                            sx={{
                              fontWeight: "bold",
                              animation: "fadeIn 0.5s ease-in",
                            }}
                          />
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          position: "relative",
                        }}
                      >
                        {elevationPoints.length >= 1 && (
                          <Box
                            sx={{
                              position: "absolute",
                              left: 15,
                              top: -16,
                              width: 2,
                              height: 16,
                              background:
                                elevationPoints.length >= 2
                                  ? "linear-gradient(to bottom, #4CAF50, #2E7D32)"
                                  : "linear-gradient(to bottom, #E0E0E0, #BDBDBD)",
                              borderRadius: 1,
                            }}
                          />
                        )}
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background:
                              elevationPoints.length >= 2
                                ? "linear-gradient(135deg, #4CAF50, #2E7D32)"
                                : "linear-gradient(135deg, #E0E0E0, #BDBDBD)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: "bold",
                            boxShadow: elevationPoints.length >= 2 ? 3 : 1,
                            transition: "all 0.3s ease",
                            border: "3px solid white",
                          }}
                        >
                          {elevationPoints.length >= 2 ? "✓" : "2"}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              color:
                                elevationPoints.length >= 2
                                  ? "#2E7D32"
                                  : "#666",
                              fontWeight:
                                elevationPoints.length >= 2 ? "bold" : "normal",
                              mb: 0.5,
                            }}
                          >
                            Select Second Point
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Place your second marker to create the elevation
                            profile path
                          </Typography>
                        </Box>
                        {elevationPoints.length >= 2 && (
                          <Chip
                            size="small"
                            label="Complete"
                            color="success"
                            variant="outlined"
                            sx={{
                              fontWeight: "bold",
                              animation: "fadeIn 0.5s ease-in",
                            }}
                          />
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          position: "relative",
                        }}
                      >
                        {elevationPoints.length >= 2 && (
                          <Box
                            sx={{
                              position: "absolute",
                              left: 15,
                              top: -16,
                              width: 2,
                              height: 16,
                              background:
                                elevationData.length > 0
                                  ? "linear-gradient(to bottom, #4CAF50, #2E7D32)"
                                  : "linear-gradient(to bottom, #E0E0E0, #BDBDBD)",
                              borderRadius: 1,
                            }}
                          />
                        )}
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background:
                              elevationData.length > 0
                                ? "linear-gradient(135deg, #4CAF50, #2E7D32)"
                                : "linear-gradient(135deg, #E0E0E0, #BDBDBD)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: "bold",
                            boxShadow: elevationData.length > 0 ? 3 : 1,
                            transition: "all 0.3s ease",
                            border: "3px solid white",
                          }}
                        >
                          {elevationData.length > 0 ? "✓" : "3"}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              color:
                                elevationData.length > 0 ? "#2E7D32" : "#666",
                              fontWeight:
                                elevationData.length > 0 ? "bold" : "normal",
                              mb: 0.5,
                            }}
                          >
                            Analyze Elevation
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Generate detailed elevation profile and statistics
                          </Typography>
                        </Box>
                        {elevationData.length > 0 && (
                          <Chip
                            size="small"
                            label="Complete"
                            color="success"
                            variant="outlined"
                            sx={{
                              fontWeight: "bold",
                              animation: "fadeIn 0.5s ease-in",
                            }}
                          />
                        )}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Modern Selected Points Display */}
                {elevationPoints.length > 0 && (
                  <Card
                    elevation={2}
                    sx={{
                      mb: 3,
                      borderRadius: 2,
                      background:
                        "linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)",
                      border: "1px solid rgba(255, 152, 0, 0.2)",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, #FF9800, #F57C00)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 2,
                            boxShadow: 2,
                          }}
                        >
                          <Typography sx={{ fontSize: "1.2rem" }}>
                            📌
                          </Typography>
                        </Box>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          sx={{ color: "#E65100" }}
                        >
                          Selected Points ({elevationPoints.length}/2)
                        </Typography>
                      </Box>

                      <Stack spacing={2}>
                        {elevationPoints.map((point, index) => (
                          <Card
                            key={index}
                            elevation={1}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: `2px solid ${
                                index === 0 ? "#4CAF50" : "#FF5722"
                              }`,
                              background: `linear-gradient(135deg, ${
                                index === 0 ? "#E8F5E8" : "#FFEBEE"
                              } 0%, ${
                                index === 0 ? "#F1F8E9" : "#FFCDD2"
                              } 100%)`,
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: 3,
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  background: `linear-gradient(135deg, ${
                                    index === 0 ? "#4CAF50" : "#FF5722"
                                  }, ${index === 0 ? "#2E7D32" : "#D32F2F"})`,
                                  color: "white",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "16px",
                                  fontWeight: "bold",
                                  boxShadow: 2,
                                }}
                              >
                                {index + 1}
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="body1"
                                  fontWeight="bold"
                                  sx={{
                                    color: index === 0 ? "#2E7D32" : "#D32F2F",
                                    mb: 0.5,
                                  }}
                                >
                                  Point {index + 1}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontFamily: "monospace",
                                    color: "#666",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                                </Typography>
                              </Box>
                              {pointElevations[`point${index + 1}`] ? (
                                <Chip
                                  label={
                                    pointElevations[`point${index + 1}`]
                                      .formatted
                                  }
                                  color={index === 0 ? "success" : "error"}
                                  variant="filled"
                                  sx={{
                                    fontWeight: "bold",
                                    fontSize: "0.8rem",
                                    animation: "fadeIn 0.5s ease-in",
                                  }}
                                />
                              ) : (
                                <Chip
                                  label="Pending"
                                  variant="outlined"
                                  size="small"
                                  sx={{
                                    color: "#999",
                                    borderColor: "#E0E0E0",
                                  }}
                                />
                              )}
                            </Box>
                          </Card>
                        ))}

                        {elevationPoints.length === 2 && (
                          <Box
                            sx={{
                              mt: 1,
                              pt: 1,
                              borderTop: "1px solid #E0E0E0",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold", mb: 1 }}
                            >
                              📏 Distance: {formatDistance(elevationDistance)}
                            </Typography>
                            {pointElevations.point1 &&
                              pointElevations.point2 && (
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color:
                                        pointElevations.point1.elevation >
                                        pointElevations.point2.elevation
                                          ? "#2E7D32"
                                          : "#C62828",
                                      fontWeight: "bold",
                                      mb: 0.5,
                                    }}
                                  >
                                    📍 Higher Point: Point{" "}
                                    {pointElevations.point1.elevation >
                                    pointElevations.point2.elevation
                                      ? "1"
                                      : "2"}{" "}
                                    (
                                    {Math.max(
                                      pointElevations.point1.elevation,
                                      pointElevations.point2.elevation
                                    ).toFixed(0)}
                                    m)
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color:
                                        pointElevations.point1.elevation <
                                        pointElevations.point2.elevation
                                          ? "#2E7D32"
                                          : "#C62828",
                                      fontWeight: "bold",
                                      mb: 0.5,
                                    }}
                                  >
                                    📍 Lower Point: Point{" "}
                                    {pointElevations.point1.elevation <
                                    pointElevations.point2.elevation
                                      ? "1"
                                      : "2"}{" "}
                                    (
                                    {Math.min(
                                      pointElevations.point1.elevation,
                                      pointElevations.point2.elevation
                                    ).toFixed(0)}
                                    m)
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "#FF9800",
                                      fontWeight: "bold",
                                      bgcolor: "#FFF3E0",
                                      px: 1,
                                      py: 0.5,
                                      borderRadius: 1,
                                      textAlign: "center",
                                    }}
                                  >
                                    ⚡ Elevation Difference:{" "}
                                    {Math.abs(
                                      pointElevations.point2.elevation -
                                        pointElevations.point1.elevation
                                    ).toFixed(0)}
                                    m
                                  </Typography>
                                  {Math.abs(
                                    pointElevations.point2.elevation -
                                      pointElevations.point1.elevation
                                  ) > 0 && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        display: "block",
                                        textAlign: "center",
                                        color: "#666",
                                        mt: 0.5,
                                        fontStyle: "italic",
                                      }}
                                    >
                                      Gradient:{" "}
                                      {(
                                        (Math.abs(
                                          pointElevations.point2.elevation -
                                            pointElevations.point1.elevation
                                        ) /
                                          elevationDistance) *
                                        100
                                      ).toFixed(2)}
                                      %
                                    </Typography>
                                  )}
                                </Box>
                              )}
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {/* Modern Action Buttons */}
                <Stack spacing={2} sx={{ mb: 3 }}>
                  {/* Get Elevation Data Button */}
                  {elevationPoints.length === 2 &&
                    elevationData.length === 0 && (
                      <Button
                        variant="contained"
                        size="large"
                        onClick={getElevationForTwoPoints}
                        startIcon={<TrendingUp />}
                        sx={{
                          background:
                            "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
                          color: "white",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
                            transform: "translateY(-3px)",
                            boxShadow: "0 8px 25px rgba(245, 124, 0, 0.4)",
                          },
                          textTransform: "none",
                          py: 2,
                          fontWeight: "bold",
                          fontSize: "1.1rem",
                          borderRadius: 3,
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          boxShadow: "0 4px 15px rgba(245, 124, 0, 0.3)",
                          animation: "pulse 2s ease-in-out infinite",
                        }}
                      >
                        🏔️ Analyze Elevation Profile
                      </Button>
                    )}

                  {/* Clear Points Button */}
                  {elevationPoints.length > 0 && (
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={clearElevationPoints}
                      startIcon={<Clear />}
                      sx={{
                        borderColor: "#FF9800",
                        color: "#FF9800",
                        "&:hover": {
                          borderColor: "#F57C00",
                          backgroundColor: "rgba(255, 152, 0, 0.08)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(255, 152, 0, 0.2)",
                        },
                        textTransform: "none",
                        py: 1.5,
                        fontWeight: "bold",
                        borderRadius: 3,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        borderWidth: 2,
                      }}
                    >
                      🧹 Clear All Points
                    </Button>
                  )}

                  {/* Clear All Elevation Data Button - NEW */}
                  {(elevationData.length > 0 || elevationPoints.length > 0) && (
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => {
                        // Clear all elevation data, points, markers, and polylines
                        clearElevationPoints();
                        clearElevationData();
                        addNotification(
                          "🗑️ All elevation data and markers cleared from map",
                          "info"
                        );
                      }}
                      startIcon={<Delete />}
                      sx={{
                        borderColor: "#d32f2f",
                        color: "#d32f2f",
                        "&:hover": {
                          borderColor: "#b71c1c",
                          backgroundColor: "rgba(211, 47, 47, 0.08)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(211, 47, 47, 0.2)",
                        },
                        textTransform: "none",
                        py: 1.5,
                        fontWeight: "bold",
                        borderRadius: 3,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        borderWidth: 2,
                      }}
                    >
                      🗑️ Clear All Elevation Data
                    </Button>
                  )}
                </Stack>
                {/* Modern Elevation Results */}
                {elevationData.length > 0 && (
                  <>
                    <Card
                      elevation={3}
                      sx={{
                        mb: 3,
                        borderRadius: 3,
                        background:
                          "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)",
                        border: "2px solid #FF9800",
                        overflow: "hidden",
                      }}
                    >
                      <CardContent sx={{ p: 0 }}>
                        <Box
                          sx={{
                            p: 2,
                            background:
                              "linear-gradient(135deg, #FF9800, #F57C00)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background: "rgba(255, 255, 255, 0.2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mr: 2,
                            }}
                          >
                            <Typography sx={{ fontSize: "1.2rem" }}>
                              📈
                            </Typography>
                          </Box>
                          <Typography variant="h6" fontWeight="bold">
                            Elevation Analysis Results
                          </Typography>
                        </Box>

                        <Box sx={{ p: 3 }}>
                          <Grid container spacing={3}>
                            <Grid item xs={6}>
                              <Box
                                sx={{
                                  textAlign: "center",
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: "rgba(76, 175, 80, 0.1)",
                                }}
                              >
                                <Typography
                                  variant="h4"
                                  sx={{
                                    color: "#4CAF50",
                                    fontWeight: "bold",
                                    mb: 1,
                                  }}
                                >
                                  {elevationStats.maxElevation}m
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  fontWeight="bold"
                                >
                                  🏔️ Highest Point
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box
                                sx={{
                                  textAlign: "center",
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: "rgba(33, 150, 243, 0.1)",
                                }}
                              >
                                <Typography
                                  variant="h4"
                                  sx={{
                                    color: "#2196F3",
                                    fontWeight: "bold",
                                    mb: 1,
                                  }}
                                >
                                  {elevationStats.minElevation}m
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  fontWeight="bold"
                                >
                                  🌊 Lowest Point
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={4}>
                              <Box
                                sx={{
                                  textAlign: "center",
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: "rgba(255, 152, 0, 0.1)",
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: "#FF9800",
                                    fontWeight: "bold",
                                    mb: 1,
                                  }}
                                >
                                  {elevationStats.avgElevation}m
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  fontWeight="bold"
                                >
                                  ⚖️ Average
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={4}>
                              <Box
                                sx={{
                                  textAlign: "center",
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: "rgba(76, 175, 80, 0.1)",
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: "#4CAF50",
                                    fontWeight: "bold",
                                    mb: 1,
                                  }}
                                >
                                  +{elevationStats.totalElevationGain}m
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  fontWeight="bold"
                                >
                                  ⬆️ Gain
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={4}>
                              <Box
                                sx={{
                                  textAlign: "center",
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: "rgba(244, 67, 54, 0.1)",
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: "#F44336",
                                    fontWeight: "bold",
                                    mb: 1,
                                  }}
                                >
                                  -{elevationStats.totalElevationLoss}m
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  fontWeight="bold"
                                >
                                  ⬇️ Loss
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Modern Elevation Chart */}
                    <Card
                      elevation={3}
                      sx={{
                        mb: 3,
                        borderRadius: 3,
                        background:
                          "linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)",
                        border: "1px solid rgba(0, 0, 0, 0.08)",
                        overflow: "hidden",
                      }}
                    >
                      <CardContent sx={{ p: 0 }}>
                        <Box
                          sx={{
                            p: 2,
                            background:
                              "linear-gradient(135deg, #2196F3, #1976D2)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: "rgba(255, 255, 255, 0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mr: 2,
                              }}
                            >
                              <Typography sx={{ fontSize: "1.1rem" }}>
                                📊
                              </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="bold">
                              Interactive Elevation Profile
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ p: 3 }}>
                          <Box
                            sx={{
                              height: 320,
                              position: "relative",
                              borderRadius: 2,
                              border: "2px solid #E3F2FD",
                              background:
                                "linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 100%)",
                              overflow: "hidden",
                              boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
                            }}
                          >
                            <canvas
                              ref={elevationChartRef}
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "6px",
                              }}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              textAlign: "center",
                              color: "#666",
                              mt: 2,
                              fontStyle: "italic",
                            }}
                          >
                            📍 Hover over the chart to see detailed elevation
                            data at specific points
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </>
                )}
              </Box>
            </Paper>
          )}

          {/* Infrastructure Panel */}
          {showInfrastructure && (
            <Paper
              elevation={2}
              sx={{
                width: 380,
                height: "100%",
                maxHeight: "calc(100vh - 200px)",
                display: "flex",
                flexDirection: "column",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              {/* Fixed Header */}
              <Box sx={{ p: 3, pb: 2, flexShrink: 0 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "#2196F3", fontWeight: "bold" }}
                >
                  <Business sx={{ mr: 1, verticalAlign: "middle" }} />
                  Infrastructure
                </Typography>
              </Box>

              {/* Scrollable Content */}
              <Box
                sx={{
                  flex: 1,
                  overflow: "auto",
                  px: 3,
                  pb: 3,
                  "&::-webkit-scrollbar": { width: 6 },
                  "&::-webkit-scrollbar-track": {
                    background: "#f1f1f1",
                    borderRadius: 3,
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#c1c1c1",
                    borderRadius: 3,
                  },
                  "&::-webkit-scrollbar-thumb:hover": { background: "#a8a8a8" },
                }}
              >
                {/* KML Layer Controls */}
                <Paper
                  elevation={1}
                  sx={{ p: 2, mb: 3, bgcolor: "#f8f9fa", borderRadius: 2 }}
                >
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ color: "#666", fontWeight: "bold" }}
                  >
                    Data Layers
                  </Typography>

                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={showPopLayer}
                          onChange={(e) => togglePopLayer(e.target.checked)}
                          icon={<CheckBoxOutlineBlank />}
                          checkedIcon={<CheckBox />}
                          sx={{ color: "#FF6B35" }}
                        />
                      }
                      label={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <CellTower
                            sx={{ mr: 1, color: "#FF6B35", fontSize: 20 }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            POP Locations
                          </Typography>
                        </Box>
                      }
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={showSubPopLayer}
                          onChange={(e) => toggleSubPopLayer(e.target.checked)}
                          icon={<CheckBoxOutlineBlank />}
                          checkedIcon={<CheckBox />}
                          sx={{ color: "#4CAF50" }}
                        />
                      }
                      label={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Satellite
                            sx={{ mr: 1, color: "#4CAF50", fontSize: 20 }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Sub-POP Locations
                          </Typography>
                        </Box>
                      }
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={showImportedLayer}
                          onChange={(e) =>
                            toggleImportedLayer(e.target.checked)
                          }
                          icon={<CheckBoxOutlineBlank />}
                          checkedIcon={<CheckBox />}
                          sx={{ color: "#9C27B0" }}
                        />
                      }
                      label={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <CloudDownload
                            sx={{ mr: 1, color: "#9C27B0", fontSize: 20 }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Imported Locations ({importedMarkers.length})
                          </Typography>
                        </Box>
                      }
                    />
                  </Stack>
                </Paper>

                {/* Infrastructure Data Summary */}
                <Paper
                  elevation={1}
                  sx={{ p: 2, mb: 2, bgcolor: "#f9f9f9", borderRadius: 2 }}
                >
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ color: "#666", fontWeight: "bold" }}
                  >
                    📊 Data Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h6" color="#FF6B35">
                          {manualLocations?.pop?.length || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          POP Locations
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h6" color="#4CAF50">
                          {manualLocations?.sub?.length || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Sub-POP Locations
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h6" color="#9C27B0">
                          {importedMarkers?.length || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Imported
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#999",
                      display: "block",
                      textAlign: "center",
                      mt: 1,
                    }}
                  >
                    Source:{" "}
                    {useDatabase
                      ? "Database + LocalStorage"
                      : "LocalStorage Only"}
                  </Typography>
                </Paper>

                {/* Geocoding functionality removed - manual address entry only */}

                {/* Import File Section */}
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ color: "#666", fontWeight: "bold" }}
                >
                  Import Data
                </Typography>

                <input
                  accept=".kml,.kmz,.csv,.xlsx"
                  style={{ display: "none" }}
                  id="file-import"
                  type="file"
                  onChange={handleFileImport}
                />
                <label htmlFor="file-import">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUpload />}
                    sx={{
                      background:
                        "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
                      color: "white",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #7B1FA2 0%, #6A1B9A 100%)",
                      },
                      width: "100%",
                      mb: 2,
                      textTransform: "none",
                      py: 1.5,
                    }}
                  >
                    Import KML/KMZ/CSV/XLSX
                  </Button>
                </label>

                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={downloadCsvTemplate}
                    sx={{ textTransform: "none", borderRadius: 2 }}
                  >
                    Download CSV Template
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={downloadXlsxTemplate}
                    sx={{ textTransform: "none", borderRadius: 2 }}
                  >
                    Download XLSX Template
                  </Button>
                </Stack>

                {/* Export Data Section */}
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ color: "#666", fontWeight: "bold", mt: 2 }}
                >
                  Export Manual Data
                </Typography>

                <Typography
                  variant="caption"
                  sx={{ color: "#777", display: "block", mb: 1 }}
                >
                  Export manually added POP and Sub-POP locations
                </Typography>

                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        if (exportingData) return;
                        setExportingData("CSV");
                        exportManualDataCSV();
                        setTimeout(() => setExportingData(null), 2000);
                      }}
                      disabled={exportingData !== null}
                      startIcon={
                        exportingData === "CSV" ? (
                          <Settings className="spin" />
                        ) : (
                          <CloudDownload />
                        )
                      }
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        borderColor: "#4CAF50",
                        color: exportingData === "CSV" ? "#999" : "#4CAF50",
                        "&:hover": {
                          borderColor: "#45A049",
                          backgroundColor: "rgba(76, 175, 80, 0.04)",
                        },
                        "&:disabled": {
                          borderColor: "#ddd",
                          color: "#999",
                        },
                        "& .spin": {
                          animation: "spin 1s linear infinite",
                        },
                      }}
                    >
                      {exportingData === "CSV" ? "Exporting..." : "CSV"}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        if (exportingData) return;
                        setExportingData("XLSX");
                        exportManualDataXLSX();
                        setTimeout(() => setExportingData(null), 3000);
                      }}
                      disabled={exportingData !== null}
                      startIcon={
                        exportingData === "XLSX" ? (
                          <Settings className="spin" />
                        ) : (
                          <CloudDownload />
                        )
                      }
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        borderColor: "#4CAF50",
                        color: exportingData === "XLSX" ? "#999" : "#4CAF50",
                        "&:hover": {
                          borderColor: "#45A049",
                          backgroundColor: "rgba(76, 175, 80, 0.04)",
                        },
                        "&:disabled": {
                          borderColor: "#ddd",
                          color: "#999",
                        },
                        "& .spin": {
                          animation: "spin 1s linear infinite",
                        },
                      }}
                    >
                      {exportingData === "XLSX" ? "Exporting..." : "XLSX"}
                    </Button>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        if (exportingData) return;
                        setExportingData("KML");
                        exportManualDataKML();
                        setTimeout(() => setExportingData(null), 2000);
                      }}
                      disabled={exportingData !== null}
                      startIcon={
                        exportingData === "KML" ? (
                          <Settings className="spin" />
                        ) : (
                          <CloudDownload />
                        )
                      }
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        borderColor: "#2196F3",
                        color: exportingData === "KML" ? "#999" : "#2196F3",
                        "&:hover": {
                          borderColor: "#1976D2",
                          backgroundColor: "rgba(33, 150, 243, 0.04)",
                        },
                        "&:disabled": {
                          borderColor: "#ddd",
                          color: "#999",
                        },
                        "& .spin": {
                          animation: "spin 1s linear infinite",
                        },
                      }}
                    >
                      {exportingData === "KML" ? "Exporting..." : "KML"}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        if (exportingData) return;
                        setExportingData("KMZ");
                        exportManualDataKMZ();
                        setTimeout(() => setExportingData(null), 3000);
                      }}
                      disabled={exportingData !== null}
                      startIcon={
                        exportingData === "KMZ" ? (
                          <Settings className="spin" />
                        ) : (
                          <CloudDownload />
                        )
                      }
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        borderColor: "#2196F3",
                        color: exportingData === "KMZ" ? "#999" : "#2196F3",
                        "&:hover": {
                          borderColor: "#1976D2",
                          backgroundColor: "rgba(33, 150, 243, 0.04)",
                        },
                        "&:disabled": {
                          borderColor: "#ddd",
                          color: "#999",
                        },
                        "& .spin": {
                          animation: "spin 1s linear infinite",
                        },
                      }}
                    >
                      {exportingData === "KMZ" ? "Exporting..." : "KMZ"}
                    </Button>
                  </Stack>
                </Stack>

                {/* Quick Add Buttons */}
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ color: "#666", fontWeight: "bold" }}
                >
                  Add New Locations
                </Typography>

                {/* Data Source Toggle */}
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: useDatabase ? "#e8f5e8" : "#f8f9fa",
                    borderRadius: 2,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={useDatabase}
                        onChange={(e) => {
                          const enabled = e.target.checked;
                          setUseDatabase(enabled);
                          localStorage.setItem(
                            "use_database_storage",
                            JSON.stringify(enabled)
                          );
                          addLog(
                            `💾 Data storage switched to ${
                              enabled ? "database" : "localStorage"
                            }`
                          );
                          addNotification(
                            `Now using ${
                              enabled ? "database" : "local storage"
                            } for data`,
                            "info"
                          );
                        }}
                        color="success"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          💾 Database Storage
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {useDatabase
                            ? "Saving to database and localStorage"
                            : "Using localStorage only (offline mode)"}
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>

                {/* Boundary Check Toggle */}
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: enableBoundaryCheck ? "#f8f9fa" : "#fff3e0",
                    borderRadius: 2,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={enableBoundaryCheck}
                        onChange={(e) => {
                          const enabled = e.target.checked;
                          setEnableBoundaryCheck(enabled);
                          localStorage.setItem(
                            "enable_boundary_check",
                            JSON.stringify(enabled)
                          );
                          addLog(
                            `📍 Boundary checking ${
                              enabled ? "enabled" : "disabled"
                            }`
                          );
                        }}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          🗺 India Boundary Restriction
                        </Typography>
                        <Typography
                          variant="caption"
                          color={
                            enableBoundaryCheck
                              ? "text.secondary"
                              : "warning.main"
                          }
                          sx={{
                            fontWeight: enableBoundaryCheck ? "normal" : "bold",
                          }}
                        >
                          {enableBoundaryCheck
                            ? `Boundary restriction active ${
                                indiaBounds
                                  ? "(Polygon data loaded)"
                                  : "(Basic range check)"
                              }`
                            : "⚠️ Boundary checking disabled - locations can be placed anywhere!"}
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>

                {/* Manual Coordinate Entry */}
                <Paper
                  elevation={1}
                  sx={{ p: 2, mb: 2, bgcolor: "#f0f8ff", borderRadius: 2 }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showManualEntry}
                        onChange={(e) => setShowManualEntry(e.target.checked)}
                        color="info"
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        🎯 Manual Coordinate Entry
                      </Typography>
                    }
                  />

                  {showManualEntry && (
                    <Box sx={{ mt: 2 }}>
                      {!enableBoundaryCheck && (
                        <Alert
                          severity="warning"
                          sx={{ mb: 2, fontSize: "0.75rem" }}
                          icon={<LocationOn />}
                        >
                          Boundary restriction is disabled. Coordinates outside
                          India will be accepted.
                        </Alert>
                      )}
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Latitude"
                            value={manualCoords.lat}
                            onChange={(e) =>
                              setManualCoords((prev) => ({
                                ...prev,
                                lat: e.target.value,
                              }))
                            }
                            placeholder="e.g., 28.6139"
                            variant="outlined"
                            type="number"
                            inputProps={{ step: "any" }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Longitude"
                            value={manualCoords.lng}
                            onChange={(e) =>
                              setManualCoords((prev) => ({
                                ...prev,
                                lng: e.target.value,
                              }))
                            }
                            placeholder="e.g., 77.2090"
                            variant="outlined"
                            type="number"
                            inputProps={{ step: "any" }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Button
                            fullWidth
                            variant="outlined"
                            size="small"
                            startIcon={<CellTower />}
                            onClick={() => handleManualCoordAdd("pop")}
                            disabled={!manualCoords.lat || !manualCoords.lng}
                            sx={{ borderColor: "#FF6B35", color: "#FF6B35" }}
                          >
                            Add POP Here
                          </Button>
                        </Grid>
                        <Grid item xs={6}>
                          <Button
                            fullWidth
                            variant="outlined"
                            size="small"
                            startIcon={<Satellite />}
                            onClick={() => handleManualCoordAdd("sub")}
                            disabled={!manualCoords.lat || !manualCoords.lng}
                            sx={{ borderColor: "#4CAF50", color: "#4CAF50" }}
                          >
                            Add Sub-POP Here
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Paper>

                {/* Manage Locations Section */}
                <Paper
                  elevation={1}
                  sx={{ p: 2, mb: 2, bgcolor: "#fff8e1", borderRadius: 2 }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showManageLocations}
                        onChange={(e) =>
                          setShowManageLocations(e.target.checked)
                        }
                        color="warning"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          🛠️ Manage Existing Locations
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Click location names to view on map
                        </Typography>
                      </Box>
                    }
                  />

                  {showManageLocations && (
                    <Box sx={{ mt: 2, maxHeight: 300, overflow: "auto" }}>
                      {/* POP Locations */}
                      {manualLocations.pop.length > 0 && (
                        <>
                          <Typography
                            variant="subtitle2"
                            sx={{ color: "#FF6B35", fontWeight: "bold", mb: 1 }}
                          >
                            POP Locations ({manualLocations.pop.length})
                          </Typography>
                          {manualLocations.pop.map((location, index) => (
                            <Card
                              key={location.id || index}
                              variant="outlined"
                              sx={{ mb: 1, p: 1 }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Box
                                  sx={{
                                    cursor: "pointer",
                                    "&:hover": {
                                      bgcolor: "rgba(255, 107, 53, 0.1)",
                                    },
                                    borderRadius: 1,
                                    p: 0.5,
                                    flex: 1,
                                  }}
                                  onClick={() =>
                                    showLocationOnMap(location, "pop")
                                  }
                                >
                                  <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    sx={{ color: "#FF6B35" }}
                                  >
                                    📍{" "}
                                    {location.name ||
                                      `POP Location ${index + 1}`}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {location.position?.lat?.toFixed(4)},{" "}
                                    {location.position?.lng?.toFixed(4)} • Click
                                    to view
                                  </Typography>
                                </Box>
                                <Box>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      editManualLocation(location, "pop")
                                    }
                                    sx={{ color: "#1976D2" }}
                                  >
                                    <Tooltip title="Edit Location">
                                      <Settings fontSize="small" />
                                    </Tooltip>
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      setDeleteConfirmLocation({
                                        ...location,
                                        type: "pop",
                                      })
                                    }
                                    sx={{ color: "#d32f2f" }}
                                  >
                                    <Tooltip title="Delete Location">
                                      <Delete fontSize="small" />
                                    </Tooltip>
                                  </IconButton>
                                </Box>
                              </Box>
                            </Card>
                          ))}
                        </>
                      )}

                      {/* Sub-POP Locations */}
                      {manualLocations.sub.length > 0 && (
                        <>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: "#4CAF50",
                              fontWeight: "bold",
                              mb: 1,
                              mt: 2,
                            }}
                          >
                            Sub-POP Locations ({manualLocations.sub.length})
                          </Typography>
                          {manualLocations.sub.map((location, index) => (
                            <Card
                              key={location.id || index}
                              variant="outlined"
                              sx={{ mb: 1, p: 1 }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Box
                                  sx={{
                                    cursor: "pointer",
                                    "&:hover": {
                                      bgcolor: "rgba(76, 175, 80, 0.1)",
                                    },
                                    borderRadius: 1,
                                    p: 0.5,
                                    flex: 1,
                                  }}
                                  onClick={() =>
                                    showLocationOnMap(location, "sub")
                                  }
                                >
                                  <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    sx={{ color: "#4CAF50" }}
                                  >
                                    📍{" "}
                                    {location.name ||
                                      `Sub-POP Location ${index + 1}`}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {location.position?.lat?.toFixed(4)},{" "}
                                    {location.position?.lng?.toFixed(4)} • Click
                                    to view
                                  </Typography>
                                </Box>
                                <Box>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      editManualLocation(location, "sub")
                                    }
                                    sx={{ color: "#1976D2" }}
                                  >
                                    <Tooltip title="Edit Location">
                                      <Settings fontSize="small" />
                                    </Tooltip>
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      setDeleteConfirmLocation({
                                        ...location,
                                        type: "sub",
                                      })
                                    }
                                    sx={{ color: "#d32f2f" }}
                                  >
                                    <Tooltip title="Delete Location">
                                      <Delete fontSize="small" />
                                    </Tooltip>
                                  </IconButton>
                                </Box>
                              </Box>
                            </Card>
                          ))}
                        </>
                      )}

                      {manualLocations.pop.length === 0 &&
                        manualLocations.sub.length === 0 && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            textAlign="center"
                            sx={{ py: 2 }}
                          >
                            No manually added locations found.
                          </Typography>
                        )}
                    </Box>
                  )}
                </Paper>

                <Stack spacing={2} sx={{ mt: 1 }}>
                  <Button
                    variant={
                      isAddingLocation === "pop" ? "contained" : "outlined"
                    }
                    startIcon={
                      <Apartment
                        sx={{
                          color:
                            isAddingLocation === "pop" ? "white" : "#FF6B35",
                        }}
                      />
                    }
                    size="large"
                    onClick={() => {
                      if (isAddingLocation === "pop") {
                        addLog("🚑 Cancelling POP add mode");
                        setIsAddingLocation(false);
                        map?.setOptions({ cursor: "default" });
                        addNotification(
                          "Cancelled adding POP location",
                          "info"
                        );
                      } else {
                        addLog("🏗️ Activating POP add mode");
                        setIsAddingLocation("pop");
                        map?.setOptions({ cursor: "crosshair" });
                        // Auto-show India boundary when adding locations
                        if (indiaBounds && !map.overlayMapTypes.getAt(0)) {
                          showIndiaBoundary();
                        }
                        addNotification(
                          "🎯 Click within India's boundaries to add POP location. Red area shows valid region.",
                          "info"
                        );
                      }
                    }}
                    sx={{
                      fontWeight: "bold",
                      textTransform: "none",
                      borderRadius: 3,
                      py: 1.8,
                      px: 3,
                      justifyContent: "flex-start",
                      ...(isAddingLocation === "pop"
                        ? {
                            background:
                              "linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)",
                            color: "white",
                            boxShadow: "0 6px 20px rgba(255, 107, 53, 0.4)",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #E55A2B 0%, #D84315 100%)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 8px 25px rgba(255, 107, 53, 0.5)",
                            },
                          }
                        : {
                            borderColor: "#FF6B35",
                            color: "#FF6B35",
                            borderWidth: 2,
                            "&:hover": {
                              backgroundColor: "rgba(255, 107, 53, 0.08)",
                              borderColor: "#E55A2B",
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(255, 107, 53, 0.3)",
                              borderWidth: 2,
                            },
                          }),
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    {isAddingLocation === "pop"
                      ? "🚑 Cancel Adding POP"
                      : "🏗️ Add POP Location"}
                  </Button>

                  <Button
                    variant={
                      isAddingLocation === "sub" ? "contained" : "outlined"
                    }
                    startIcon={
                      <Store
                        sx={{
                          color:
                            isAddingLocation === "sub" ? "white" : "#4CAF50",
                        }}
                      />
                    }
                    size="large"
                    onClick={() => {
                      if (isAddingLocation === "sub") {
                        addLog("🚑 Cancelling Sub-POP add mode");
                        setIsAddingLocation(false);
                        map?.setOptions({ cursor: "default" });
                        addNotification(
                          "Cancelled adding Sub-POP location",
                          "info"
                        );
                      } else {
                        addLog("🏗️ Activating Sub-POP add mode");
                        setIsAddingLocation("sub");
                        map?.setOptions({ cursor: "crosshair" });
                        // Auto-show India boundary when adding locations
                        if (indiaBounds && !map.overlayMapTypes.getAt(0)) {
                          showIndiaBoundary();
                        }
                        addNotification(
                          "🎯 Click within India's boundaries to add Sub-POP location. Red area shows valid region.",
                          "info"
                        );
                      }
                    }}
                    sx={{
                      fontWeight: "bold",
                      textTransform: "none",
                      borderRadius: 3,
                      py: 1.8,
                      px: 3,
                      justifyContent: "flex-start",
                      ...(isAddingLocation === "sub"
                        ? {
                            background:
                              "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
                            color: "white",
                            boxShadow: "0 6px 20px rgba(76, 175, 80, 0.4)",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 8px 25px rgba(76, 175, 80, 0.5)",
                            },
                          }
                        : {
                            borderColor: "#4CAF50",
                            color: "#4CAF50",
                            borderWidth: 2,
                            "&:hover": {
                              backgroundColor: "rgba(76, 175, 80, 0.08)",
                              borderColor: "#2E7D32",
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                              borderWidth: 2,
                            },
                          }),
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    {isAddingLocation === "sub"
                      ? "🚑 Cancel Adding Sub-POP"
                      : "🏬 Add Sub-POP Location"}
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<Clear />}
                    size="large"
                    onClick={() => {
                      // Clear POP layer
                      if (popKmlLayer && popKmlLayer.markers) {
                        popKmlLayer.markers.forEach((marker) =>
                          marker.setMap(null)
                        );
                      }
                      // Clear Sub-POP layer
                      if (subPopKmlLayer && subPopKmlLayer.markers) {
                        subPopKmlLayer.markers.forEach((marker) =>
                          marker.setMap(null)
                        );
                      }
                      // Clear imported markers
                      importedMarkers.forEach((marker) => marker.setMap(null));
                      setImportedMarkers([]);

                      // Clear clusterers
                      if (popClusterRef.current) {
                        popClusterRef.current.clearMarkers();
                        popClusterRef.current.setMap(null);
                        popClusterRef.current = null;
                      }
                      if (subClusterRef.current) {
                        subClusterRef.current.clearMarkers();
                        subClusterRef.current.setMap(null);
                        subClusterRef.current = null;
                      }
                      if (importedClusterRef.current) {
                        importedClusterRef.current.clearMarkers();
                        importedClusterRef.current.setMap(null);
                        importedClusterRef.current = null;
                      }

                      // Reset all checkboxes and localStorage
                      setShowPopLayer(false);
                      setShowSubPopLayer(false);
                      setShowImportedLayer(false);
                      localStorage.setItem("infra_toggle_pop", "false");
                      localStorage.setItem("infra_toggle_subpop", "false");
                      localStorage.setItem("infra_toggle_imported", "false");

                      addNotification(
                        "All infrastructure layers cleared",
                        "success"
                      );
                    }}
                    sx={{
                      fontWeight: "bold",
                      textTransform: "none",
                      borderRadius: 3,
                      py: 1.8,
                      px: 3,
                      justifyContent: "flex-start",
                      borderColor: "#F44336",
                      color: "#F44336",
                      borderWidth: 2,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        backgroundColor: "rgba(244, 67, 54, 0.08)",
                        borderColor: "#D32F2F",
                        color: "#D32F2F",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(244, 67, 54, 0.3)",
                        borderWidth: 2,
                      },
                    }}
                  >
                    🗑️ Clear All Layers
                  </Button>
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2, fontStyle: "italic" }}
                >
                  🟠 POP • 🟢 Sub-POP locations loaded from KML files
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>

        {/* Modern Debug Panel - Only show if hideControls is false */}
        {!hideControls && (
          <Accordion
            sx={{
              mt: 1,
              boxShadow: "none",
              border: "1px solid #e3f2fd",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                minHeight: 40,
                "& .MuiAccordionSummary-content": { margin: "8px 0" },
                bgcolor: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                borderRadius: "4px 4px 0 0",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <BugReport sx={{ color: "#6c757d", fontSize: 20 }} />
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: "bold", color: "#6c757d" }}
                >
                  Debug Console ({logs.length} entries)
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Box
                sx={{
                  maxHeight: 200,
                  overflow: "auto",
                  bgcolor: "#1e1e1e",
                  color: "#d4d4d4",
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: "0.75rem",
                  "&::-webkit-scrollbar": { width: 8 },
                  "&::-webkit-scrollbar-track": { background: "#2d2d2d" },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#555",
                    borderRadius: 4,
                  },
                  "&::-webkit-scrollbar-thumb:hover": { background: "#777" },
                }}
              >
                {logs.length === 0 ? (
                  <Box sx={{ p: 2, textAlign: "center", color: "#888" }}>
                    <Code sx={{ fontSize: 16, mb: 1 }} />
                    <Typography variant="body2">No debug logs yet</Typography>
                  </Box>
                ) : (
                  logs.map((log, index) => {
                    const isError = log.includes("❌") || log.includes("Error");
                    const isWarning =
                      log.includes("⚠️") || log.includes("Warning");
                    const isSuccess =
                      log.includes("✅") || log.includes("Success");

                    return (
                      <Box
                        key={index}
                        sx={{
                          p: "4px 12px",
                          borderBottom: "1px solid #333",
                          color: isError
                            ? "#ff6b6b"
                            : isWarning
                            ? "#ffd93d"
                            : isSuccess
                            ? "#6bcf7f"
                            : "#d4d4d4",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                          fontFamily: "inherit",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "inherit",
                            fontSize: "0.75rem",
                            lineHeight: 1.2,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {log}
                        </Typography>
                      </Box>
                    );
                  })
                )}
              </Box>
              {logs.length > 0 && (
                <Box
                  sx={{
                    p: 1,
                    bgcolor: "#f8f9fa",
                    borderTop: "1px solid #dee2e6",
                  }}
                >
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      onClick={() => setLogs([])}
                      startIcon={<Clear />}
                      sx={{
                        textTransform: "none",
                        color: "#6c757d",
                        "&:hover": { bgcolor: "rgba(108, 117, 125, 0.1)" },
                      }}
                    >
                      Clear Logs
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        const logText = logs.join("\n");
                        navigator.clipboard.writeText(logText);
                        addNotification(
                          "Debug logs copied to clipboard",
                          "success"
                        );
                      }}
                      startIcon={<Download />}
                      sx={{
                        textTransform: "none",
                        color: "#6c757d",
                        "&:hover": { bgcolor: "rgba(108, 117, 125, 0.1)" },
                      }}
                    >
                      Copy Logs
                    </Button>
                  </Stack>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        )}

        {/* Save Dialog */}
        <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
          <DialogTitle>Save Measurement</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Measurement Name"
              fullWidth
              variant="outlined"
              value={measurementName}
              onChange={(e) => setMeasurementName(e.target.value)}
              placeholder={`Measurement ${Date.now()}`}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
            <Button
              onClick={() => setSaveDialogOpen(false)}
              variant="outlined"
              sx={{
                fontWeight: "bold",
                textTransform: "none",
                borderRadius: 2.5,
                py: 1.5,
                px: 3,
                borderColor: "#757575",
                color: "#757575",
                "&:hover": {
                  backgroundColor: "rgba(117, 117, 117, 0.08)",
                  borderColor: "#616161",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={saveMeasurement}
              variant="contained"
              sx={{
                fontWeight: "bold",
                textTransform: "none",
                borderRadius: 2.5,
                py: 1.5,
                px: 3,
                background: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 16px rgba(76, 175, 80, 0.3)",
                },
              }}
            >
              💾 Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* History Dialog - Distance */}
        <Dialog
          open={historyDialogOpen}
          onClose={() => setHistoryDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={2}>
              <History />
              <Typography variant="h6">Saved Measurements</Typography>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton onClick={() => setHistoryDialogOpen(false)}>
                <Close />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            {savedMeasurements.length === 0 ? (
              <Alert severity="info">No saved measurements found.</Alert>
            ) : (
              <List>
                {savedMeasurements.map((measurement, index) => (
                  <React.Fragment key={measurement.key}>
                    <ListItem>
                      <ListItemText
                        primary={measurement.name}
                        secondary={
                          <Stack spacing={0.5}>
                            <Typography variant="body2" color="text.secondary">
                              {measurement.date}
                            </Typography>
                            <Typography variant="body2" color="primary.main">
                              Distance: {measurement.formattedDistance} •
                              Points: {measurement.points?.length || 0}
                            </Typography>
                          </Stack>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => loadMeasurement(measurement)}
                            sx={{
                              fontWeight: "bold",
                              textTransform: "none",
                              borderRadius: 2,
                              py: 0.8,
                              px: 2,
                              borderColor: "#2196F3",
                              color: "#2196F3",
                              "&:hover": {
                                backgroundColor: "rgba(33, 150, 243, 0.08)",
                                borderColor: "#1976D2",
                                transform: "translateY(-1px)",
                                boxShadow: "0 2px 8px rgba(33, 150, 243, 0.25)",
                              },
                            }}
                          >
                            📄 Load
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => showDeleteConfirmation(measurement)}
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < savedMeasurements.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button
              onClick={() => setHistoryDialogOpen(false)}
              variant="outlined"
              sx={{
                fontWeight: "bold",
                textTransform: "none",
                borderRadius: 2.5,
                py: 1.5,
                px: 3,
                borderColor: "#757575",
                color: "#757575",
                "&:hover": {
                  backgroundColor: "rgba(117, 117, 117, 0.08)",
                  borderColor: "#616161",
                },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={cancelDelete}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Delete color="error" />
              <Typography variant="h6">Delete Measurement</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone!
            </Alert>
            <Typography variant="body1">
              Are you sure you want to delete the measurement:
            </Typography>
            <Typography variant="h6" color="primary.main" sx={{ mt: 1, mb: 1 }}>
              "{measurementToDelete?.name}"
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Distance: {measurementToDelete?.formattedDistance} • Points:{" "}
              {measurementToDelete?.points?.length || 0} • Created:{" "}
              {measurementToDelete?.date}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
            <Button
              onClick={cancelDelete}
              variant="outlined"
              sx={{
                fontWeight: "bold",
                textTransform: "none",
                borderRadius: 2.5,
                py: 1.5,
                px: 3,
                borderColor: "#757575",
                color: "#757575",
                "&:hover": {
                  backgroundColor: "rgba(117, 117, 117, 0.08)",
                  borderColor: "#616161",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={deleteMeasurement}
              variant="contained"
              startIcon={<Delete />}
              sx={{
                fontWeight: "bold",
                textTransform: "none",
                borderRadius: 2.5,
                py: 1.5,
                px: 3,
                background: "linear-gradient(135deg, #F44336 0%, #D32F2F 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 16px rgba(244, 67, 54, 0.3)",
                },
              }}
            >
              🗑️ Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Polygon Save Dialog */}
        <Dialog
          open={polygonSaveDialogOpen}
          onClose={() => setPolygonSaveDialogOpen(false)}
        >
          <DialogTitle>Save Polygon</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Polygon Name"
              fullWidth
              variant="outlined"
              value={polygonName}
              onChange={(e) => setPolygonName(e.target.value)}
              placeholder={`Polygon ${Date.now()}`}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
            <Button
              onClick={() => setPolygonSaveDialogOpen(false)}
              variant="outlined"
              sx={{
                fontWeight: "bold",
                textTransform: "none",
                borderRadius: 2.5,
                py: 1.5,
                px: 3,
                borderColor: "#757575",
                color: "#757575",
                "&:hover": {
                  backgroundColor: "rgba(117, 117, 117, 0.08)",
                  borderColor: "#616161",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={savePolygonData}
              variant="contained"
              sx={{
                fontWeight: "bold",
                textTransform: "none",
                borderRadius: 2.5,
                py: 1.5,
                px: 3,
                background: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #7B1FA2 0%, #4A148C 100%)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 16px rgba(156, 39, 176, 0.3)",
                },
              }}
            >
              💾 Save Polygon
            </Button>
          </DialogActions>
        </Dialog>

        {/* Polygon History Dialog */}
        <Dialog
          open={polygonHistoryDialogOpen}
          onClose={() => setPolygonHistoryDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={2}>
              <History />
              <Typography variant="h6">Saved Polygons</Typography>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton onClick={() => setPolygonHistoryDialogOpen(false)}>
                <Close />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            {savedPolygons.length === 0 ? (
              <Alert severity="info">No saved polygons found.</Alert>
            ) : (
              <List>
                {savedPolygons.map((polygon, index) => (
                  <React.Fragment key={polygon.key}>
                    <ListItem>
                      <ListItemText
                        primary={polygon.name}
                        secondary={
                          <Box component="div">
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              component="div"
                            >
                              {polygon.date}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="primary.main"
                              component="div"
                            >
                              Area: {formatArea(polygon.area)} • Perimeter:{" "}
                              {formatDistance(polygon.perimeter)} • Points:{" "}
                              {polygon.points?.length || 0}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="View polygon (zoom to fit)">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                // View polygon with zoom to fit bounds
                                if (
                                  !map ||
                                  !polygon.points ||
                                  polygon.points.length === 0
                                ) {
                                  addNotification(
                                    "Invalid polygon data",
                                    "error"
                                  );
                                  return;
                                }

                                addLog(`🎯 Viewing polygon: ${polygon.name}`);

                                // Create bounds from polygon points
                                const bounds =
                                  new window.google.maps.LatLngBounds();
                                polygon.points.forEach((point) => {
                                  bounds.extend(
                                    new window.google.maps.LatLng(
                                      point.lat,
                                      point.lng
                                    )
                                  );
                                });

                                // Fit map to polygon bounds with padding
                                map.fitBounds(bounds, {
                                  top: 50,
                                  bottom: 50,
                                  left: 50,
                                  right: 50,
                                });

                                // Load the polygon visually
                                loadPolygonData(polygon);
                                setPolygonHistoryDialogOpen(false);

                                addNotification(
                                  `Viewing polygon: ${polygon.name}`,
                                  "success"
                                );
                              }}
                            >
                              <CenterFocusStrong />
                            </IconButton>
                          </Tooltip>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              loadPolygonData(polygon);
                              setPolygonHistoryDialogOpen(false);
                            }}
                          >
                            Load
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              showDeletePolygonConfirmation(polygon)
                            }
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < savedPolygons.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPolygonHistoryDialogOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Polygon Delete Confirmation Dialog */}
        <Dialog
          open={polygonDeleteConfirmOpen}
          onClose={cancelDeletePolygon}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Delete color="error" />
              <Typography variant="h6">Delete Polygon</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone!
            </Alert>
            <Typography variant="body1">
              Are you sure you want to delete the polygon:
            </Typography>
            <Typography variant="h6" color="primary.main" sx={{ mt: 1, mb: 1 }}>
              "{polygonToDelete?.name}"
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Area: {polygonToDelete ? formatArea(polygonToDelete.area) : ""} •
              Perimeter:{" "}
              {polygonToDelete ? formatDistance(polygonToDelete.perimeter) : ""}{" "}
              • Points: {polygonToDelete?.points?.length || 0} • Created:{" "}
              {polygonToDelete?.date}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDeletePolygon} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={deletePolygon}
              variant="contained"
              color="error"
              startIcon={<Delete />}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modern Add Location Form */}
        <AddLocationForm
          open={addLocationForm.open}
          onClose={() => {
            setAddLocationForm({ ...addLocationForm, open: false });
            setEditingLocation(null); // Clear editing state when closing
          }}
          type={addLocationForm.type}
          position={addLocationForm.position}
          onSubmit={handleFormSubmit}
          initialData={addLocationForm.data}
          isEditing={!!editingLocation}
          isInsideIndia={isInsideIndia}
        />

        {/* Delete Location Confirmation Dialog */}
        <Dialog
          open={!!deleteConfirmLocation}
          onClose={() => setDeleteConfirmLocation(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Delete color="error" />
              <Typography variant="h6">
                Delete {deleteConfirmLocation?.type?.toUpperCase()} Location
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone!
            </Alert>
            <Typography variant="body1">
              Are you sure you want to delete this{" "}
              {deleteConfirmLocation?.type?.toUpperCase()} location:
            </Typography>
            <Typography variant="h6" color="primary.main" sx={{ mt: 1, mb: 1 }}>
              "{deleteConfirmLocation?.name || "Unnamed Location"}"
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Coordinates: {deleteConfirmLocation?.position?.lat?.toFixed(4)},{" "}
              {deleteConfirmLocation?.position?.lng?.toFixed(4)}
              <br />
              Address:{" "}
              {deleteConfirmLocation?.address || "No address specified"}
              <br />
              {deleteConfirmLocation?.database_id &&
                `Database ID: ${deleteConfirmLocation.database_id}`}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteConfirmLocation(null)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const locationName =
                  deleteConfirmLocation.name || "Unnamed Location";
                const locationType = deleteConfirmLocation.type?.toUpperCase();
                addLog(
                  `🗑️ User confirmed deletion of ${locationType}: ${locationName}`
                );
                deleteManualLocation(
                  deleteConfirmLocation,
                  deleteConfirmLocation.type
                );
                setDeleteConfirmLocation(null);
                // Give user feedback about the deletion process
                addNotification(
                  `🔄 Processing deletion of ${locationType} location...`,
                  "info"
                );
              }}
              variant="contained"
              color="error"
              startIcon={<Delete />}
              sx={{
                "&:hover": {
                  bgcolor: "#c62828",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 8px rgba(198, 40, 40, 0.3)",
                },
                transition: "all 0.2s ease",
              }}
            >
              🗑️ Delete Location
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notifications */}
        {notifications.map((notification) => (
          <Snackbar
            key={notification.id}
            open={true}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            sx={{ mb: 2 }}
          >
            <Alert
              severity={notification.severity}
              onClose={() =>
                setNotifications((prev) =>
                  prev.filter((n) => n.id !== notification.id)
                )
              }
            >
              {notification.message}
            </Alert>
          </Snackbar>
        ))}
      </Box>
    );
  }
);

WorkingMeasurementMap.displayName = "WorkingMeasurementMap";
export default WorkingMeasurementMap;