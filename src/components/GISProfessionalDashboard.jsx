import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Card,
  CardContent,
  Badge,
  IconButton,
  Tooltip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  ListItemSecondaryAction,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ButtonGroup,
  Grid,
  AppBar,
  Toolbar,
  InputAdornment,
  Fade,
  Slide,
  Collapse,
  Fab,
  Grow,
} from "@mui/material";
import {
  PanTool,
  CropFree,
  Timeline,
  Straighten,
  Business,
  TrendingUp,
  Place,
  Layers,
  Map as MapIcon,
  Satellite,
  Terrain,
  LayersClear,
  Bookmark,
  Settings,
  Fullscreen,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  MyLocation,
  PlayArrow,
  Stop,
  Crop,
  Clear,
  Save,
  History,
  ExpandMore,
  Visibility,
  Upload,
  Download,
  BugReport,
  Code,
  LocationOn,
  Delete,
  Close,
  Search,
  ChevronLeft,
  ChevronRight,
  Public,
  BorderAll,
  Menu,
  MoreVert,
  Brightness4,
  Brightness7,
  Undo,
  Redo,
} from "@mui/icons-material";
import WorkingMeasurementMap from "./WorkingMeasurementMap";
import MapSearchBox from "./MapSearchBox";
import ProfileMenu from "./2.NavbarPage/2.4 ProfileMenu";

const GISProfessionalDashboard = () => {
  const theme = useTheme();
  const [activeDrawingTool, setActiveDrawingTool] = useState("pan");
  const [activeLayers, setActiveLayers] = useState({
    boundaries: true,
    roads: false,
    buildings: false,
    terrain: false,
    infrastructure: true,
  });
  const [selectedBaseMap, setSelectedBaseMap] = useState("satellite");
  const [bookmarks, setBookmarks] = useState([
    { id: 1, name: "Delhi Metro Area", coords: { lat: 28.6139, lng: 77.209 } },
    { id: 2, name: "Mumbai Central", coords: { lat: 19.076, lng: 72.8777 } },
    { id: 3, name: "Bangalore IT Hub", coords: { lat: 12.9716, lng: 77.5946 } },
  ]);

  // Enhanced UI state
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showIndiaBoundary, setShowIndiaBoundary] = useState(false);
  const [compactMode, setCompactMode] = useState(true);

  // Compact sidebar width for more map space
  const leftDrawerWidth = 250; // Reduced from 280

  // State for actual WorkingMeasurementMap functionality
  /* The above code is using React hooks to manage state in a functional component. Here is a breakdown
of what each useState hook is doing: */
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPolygonDrawing, setIsPolygonDrawing] = useState(false);
  const [showElevation, setShowElevation] = useState(false);
  const [elevationMarkers, setElevationMarkers] = useState([]);
  const [showElevationChart, setShowElevationChart] = useState(false);
  const [elevationData, setElevationData] = useState([]);
  const [showInfrastructure, setShowInfrastructure] = useState(false);
  const [points, setPoints] = useState([]);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [loaded, setLoaded] = useState(true);

  // Additional states for functionality
  /* The above code snippet is using React's `useState` hook to manage state in a functional component.
 It initializes multiple state variables with their initial values: */
  const [totalDistance, setTotalDistance] = useState(0);
  const [polygonArea, setPolygonArea] = useState(0);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [polygonSaveDialogOpen, setPolygonSaveDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [measurementName, setMeasurementName] = useState("");
  const [polygonName, setPolygonName] = useState("");
  const [savedPolygons, setSavedPolygons] = useState([]);
  const [savedDataTab, setSavedDataTab] = useState("distance");
  const [polygonDialogOpen, setPolygonDialogOpen] = useState(false);
  const [polygonHistoryDialogOpen, setPolygonHistoryDialogOpen] =
    useState(false);

  // Live coordinates state
  const [liveCoordinates, setLiveCoordinates] = useState({
    lat: 20.5937,
    lng: 78.9629,
  });
  const [mapZoom, setMapZoom] = useState(6);
  const [mouseCoordinates, setMouseCoordinates] = useState(null);
  const [hoverCoordinates, setHoverCoordinates] = useState(null);

  // Units and export state
  const [selectedUnit, setSelectedUnit] = useState("metric");

  // Debug logs state
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebugLogs, setShowDebugLogs] = useState(false);

  // Unified saved data dialog state
  const [allSavedDataDialogOpen, setAllSavedDataDialogOpen] = useState(false);
  const [savedDataFilter, setSavedDataFilter] = useState("all"); // 'all', 'distance', 'polygon', 'elevation'
  const [savedMeasurements, setSavedMeasurements] = useState([]);
  const [savedElevationData, setSavedElevationData] = useState([]);

  // Delete confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Map controls visibility state
  const [showMapControls, setShowMapControls] = useState(true);
  const [showCoordinatesBox, setShowCoordinatesBox] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Enhanced elevation state
  const [elevationAddingMode, setElevationAddingMode] = useState(false);
  const [elevationSaveDialogOpen, setElevationSaveDialogOpen] = useState(false);
  const [elevationName, setElevationName] = useState("");
  const [elevationChartWidth, setElevationChartWidth] = useState(false); // false = normal, true = 80%
  const [elevationStats, setElevationStats] = useState({
    maxElevation: 0,
    minElevation: 0,
    totalElevationGain: 0,
    totalElevationLoss: 0,
    avgElevation: 0,
    highPoint: null,
    lowPoint: null,
    distance: 0,
  });

  // Undo/Redo state management
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [actionHistory, setActionHistory] = useState([]);

  // User and authentication state
  const [user] = useState({ username: "Admin" });
  const [loginTime] = useState(new Date().toISOString());

  // Street view toggle state
  const [streetViewActive, setStreetViewActive] = useState(false);

  // 2. Add useEffect to load polygons from localStorage (reload when polygonSaveDialogOpen closes):
  useEffect(() => {
    const polygons = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("polygon_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          polygons.push({ key, ...data });
        } catch {}
      }
    }
    setSavedPolygons(
      polygons
        .sort(
          (a, b) =>
            new Date(b.date || b.timestamp || 0) -
            new Date(a.date || a.timestamp || 0)
        )
        .reverse()
    );
  }, [polygonDialogOpen]);

  // Save current state to history
  const saveToHistory = (action, data) => {
    const newState = {
      points: [...points],
      polygonPoints: [...polygonPoints],
      bookmarks: [...bookmarks],
      action,
      timestamp: Date.now(),
      data,
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Limit history to 50 items
    if (newHistory.length > 50) {
      setHistory(newHistory.slice(-50));
      setHistoryIndex(49);
    }
  };

  // Undo/Redo functions removed as per requirements

  // Bookmark editing state
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [bookmarkEditDialogOpen, setBookmarkEditDialogOpen] = useState(false);
  const [editedBookmarkName, setEditedBookmarkName] = useState("");
  const [bookmarkDeleteDialogOpen, setBookmarkDeleteDialogOpen] =
    useState(false);
  const [bookmarkToDelete, setBookmarkToDelete] = useState(null);

  // Ref to access child component functions
  const workingMapRef = useRef(null);

  const baseMaps = [
    {
      id: "satellite",
      name: "SATELLITE",
      description: "HIGH RESOLUTION SATELLITE IMAGERY",
      icon: "🛰️",
    },
    {
      id: "street",
      name: "STREET MAP",
      description: "DETAILED STREET AND ROAD NETWORK",
      icon: "🗺️",
    },
    {
      id: "terrain",
      name: "TERRAIN",
      description: "TOPOGRAPHIC AND ELEVATION DATA",
      icon: "🏔️",
    },
  ];

  const handleLayerToggle = (layerName) => {
    const newValue = !activeLayers[layerName];
    setActiveLayers((prev) => ({
      ...prev,
      [layerName]: newValue,
    }));

    // Pass layer changes to WorkingMeasurementMap
    if (workingMapRef.current && workingMapRef.current.toggleLayer) {
      workingMapRef.current.toggleLayer(layerName, newValue);
    }

    console.log(`🌍 Layer ${layerName} toggled to: ${newValue}`);
  };

  const activeLayersCount = Object.values(activeLayers).filter(Boolean).length;

  // Real functionality handlers
  const handleStartDrawing = () => {
    if (workingMapRef.current && workingMapRef.current.startDrawing) {
      saveToHistory("Start Distance Drawing", { isDrawing: true });
      setIsDrawing(true);
      setIsPolygonDrawing(false);
      workingMapRef.current.startDrawing();
      addLog("📏 Started distance measurement");
    }
  };

  const handleStopDrawing = () => {
    if (workingMapRef.current && workingMapRef.current.stopDrawing) {
      setIsDrawing(false);
      workingMapRef.current.stopDrawing();
    }
  };

  const handleStartPolygonDrawing = () => {
    console.log("📐 Dashboard handleStartPolygonDrawing called");
    if (workingMapRef.current && workingMapRef.current.startPolygonDrawing) {
      console.log("✅ Starting polygon drawing...");
      setIsPolygonDrawing(true);
      setIsDrawing(false);
      workingMapRef.current.startPolygonDrawing();
    } else {
      console.error("❌ workingMapRef or startPolygonDrawing not available");
    }
  };

  const handleStopPolygonDrawing = () => {
    console.log("⏹️ Dashboard handleStopPolygonDrawing called");
    if (workingMapRef.current && workingMapRef.current.stopPolygonDrawing) {
      console.log("✅ Stopping polygon drawing...");
      setIsPolygonDrawing(false);
      workingMapRef.current.stopPolygonDrawing();
    } else {
      console.error("❌ workingMapRef or stopPolygonDrawing not available");
    }
  };

  const handleClearAll = () => {
    if (workingMapRef.current && workingMapRef.current.clearAll) {
      saveToHistory("Clear All Data", { cleared: true });
      workingMapRef.current.clearAll();
      setPoints([]);
      setPolygonPoints([]);
      setElevationMarkers([]);
      setElevationData([]);
      setIsDrawing(false);
      setIsPolygonDrawing(false);
      setShowElevation(false);
      setShowElevationChart(false);
      setTotalDistance(0);
      setPolygonArea(0);
      addLog("✂️ Cleared all measurements, polygons and elevation data");
    }
  };

  // Load all saved data function
  const loadAllSavedData = () => {
    // Load saved measurements
    const measurements = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("measurement_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          measurements.push({ key, type: "distance", ...data });
        } catch (e) {
          console.warn(`Failed to parse measurement: ${key}`);
        }
      }
    }
    setSavedMeasurements(
      measurements.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    );

    // Load saved elevation data
    const elevations = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("elevation_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          elevations.push({ key, type: "elevation", ...data });
        } catch (e) {
          console.warn(`Failed to parse elevation data: ${key}`);
        }
      }
    }
    setSavedElevationData(
      elevations.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    );

    // Load saved polygons
    const polygons = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("polygon_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          polygons.push({ key, ...data });
        } catch (e) {
          console.warn(`Failed to parse polygon: ${key}`);
        }
      }
    }
    setSavedPolygons(
      polygons.sort((a, b) => new Date(b.date || b.timestamp || 0) - new Date(a.date || a.timestamp || 0)).reverse()
    );

    addLog("📊 Loaded all saved data for unified view");
  };

  // Enhanced elevation functionality
  const handleElevationAddMode = () => {
    setElevationAddingMode(!elevationAddingMode);
    if (!elevationAddingMode) {
      addLog(
        "🏔️ Elevation marker adding mode enabled - Click on map to add points"
      );
    } else {
      addLog("🏔️ Elevation marker adding mode disabled");
    }
  };

  const addElevationMarker = (lat, lng) => {
    if (elevationMarkers.length >= 2) {
      addLog(
        "⚠️ Maximum 2 elevation markers allowed. Clear existing markers first."
      );
      return;
    }

    const newMarker = {
      id: Date.now(),
      lat,
      lng,
      elevation: Math.round(Math.random() * 1000 + 100), // Mock elevation - replace with real API
      label: elevationMarkers.length === 0 ? "Start" : "End",
    };

    const updatedMarkers = [...elevationMarkers, newMarker];
    setElevationMarkers(updatedMarkers);

    if (updatedMarkers.length === 2) {
      generateElevationProfileEnhanced(updatedMarkers);
      setElevationAddingMode(false);
    }

    addLog(
      `🏔️ Added elevation marker ${newMarker.label}: ${lat.toFixed(
        6
      )}, ${lng.toFixed(6)}`
    );
  };

  const generateElevationProfileEnhanced = (markers) => {
    if (markers.length !== 2) return;

    const distance = calculateDistance(markers[0], markers[1]);
    const elevationPoints = [];
    const steps = 50;

    let maxElevation = 0;
    let minElevation = 999999;
    let totalElevation = 0;
    let highPoint = null;
    let lowPoint = null;

    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const lat = markers[0].lat + (markers[1].lat - markers[0].lat) * ratio;
      const lng = markers[0].lng + (markers[1].lng - markers[0].lng) * ratio;

      // Mock elevation calculation (replace with real API)
      const elevation = Math.round(
        markers[0].elevation +
          (markers[1].elevation - markers[0].elevation) * ratio +
          Math.sin(ratio * Math.PI * 3) * 150 +
          Math.random() * 50 -
          25
      );

      const pointDistance = ratio * distance;

      if (elevation > maxElevation) {
        maxElevation = elevation;
        highPoint = { lat, lng, elevation, distance: pointDistance };
      }

      if (elevation < minElevation) {
        minElevation = elevation;
        lowPoint = { lat, lng, elevation, distance: pointDistance };
      }

      totalElevation += elevation;

      elevationPoints.push({
        lat,
        lng,
        elevation,
        distance: pointDistance,
        index: i,
      });
    }

    const avgElevation = Math.round(totalElevation / elevationPoints.length);
    const elevationGain = Math.max(
      0,
      markers[1].elevation - markers[0].elevation
    );
    const elevationLoss = Math.max(
      0,
      markers[0].elevation - markers[1].elevation
    );

    setElevationData(elevationPoints);
    setElevationStats({
      maxElevation,
      minElevation,
      totalElevationGain: elevationGain,
      totalElevationLoss: elevationLoss,
      avgElevation,
      highPoint,
      lowPoint,
      distance,
    });

    setShowElevationChart(true);
    addLog(
      `📈 Generated elevation profile: ${distance.toFixed(
        0
      )}m distance, ${maxElevation}m max, ${minElevation}m min`
    );
  };

  const clearElevationData = () => {
    setElevationMarkers([]);
    setElevationData([]);
    setShowElevationChart(false);
    setElevationAddingMode(false);
    setElevationStats({
      maxElevation: 0,
      minElevation: 0,
      totalElevationGain: 0,
      totalElevationLoss: 0,
      avgElevation: 0,
      highPoint: null,
      lowPoint: null,
      distance: 0,
    });
    addLog("🏔️ Cleared elevation data");
  };

  const saveElevationProfile = () => {
    if (elevationMarkers.length < 2 || elevationData.length === 0) {
      addLog("⚠️ No elevation profile to save");
      return;
    }

    const elevationProfile = {
      name: elevationName || `Elevation Profile ${Date.now()}`,
      markers: elevationMarkers,
      data: elevationData,
      stats: elevationStats,
      date: new Date().toISOString(),
      timestamp: Date.now(),
    };

    const key = `elevation_${elevationProfile.timestamp}`;
    localStorage.setItem(key, JSON.stringify(elevationProfile));

    setElevationSaveDialogOpen(false);
    setElevationName("");
    addLog(`🏔️ Saved elevation profile: ${elevationProfile.name}`);
  };

  const handleShowElevation = () => {
    const newValue = !showElevation;
    console.log(
      `🏔️ Dashboard handleShowElevation called: ${showElevation} -> ${newValue}`
    );

    if (newValue) {
      // Starting elevation mode - clear previous markers and enable marker placement
      setElevationMarkers([]);
      setShowElevationChart(false);
      setElevationData([]);
      addLog("🏔️ Elevation mode activated - Click two points on the map");
      saveToHistory("Start Elevation Mode", { showElevation: true });
    } else {
      // Stopping elevation mode
      setElevationMarkers([]);
      setShowElevationChart(false);
      setElevationData([]);
      addLog("🔴 Elevation mode deactivated");
    }

    setShowElevation(newValue);
    if (workingMapRef.current && workingMapRef.current.setShowElevation) {
      console.log("✅ Calling workingMapRef setShowElevation");
      workingMapRef.current.setShowElevation(newValue);
    } else {
      console.error("❌ workingMapRef or setShowElevation not available");
    }
  };

  // Handle elevation marker placement
  const handleElevationMarkerAdd = (marker) => {
    const newMarkers = [...elevationMarkers, marker];
    setElevationMarkers(newMarkers);

    addLog(`📍 Elevation marker ${newMarkers.length} placed`);

    // When we have 2 markers, generate elevation profile
    if (newMarkers.length === 2) {
      generateElevationProfile(newMarkers);
    }
  };

  // Generate elevation profile between two points
  const generateElevationProfile = async (markers) => {
    try {
      // Mock elevation data generation (replace with real elevation API)
      const elevationPoints = [];
      const steps = 50;

      for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        const lat = markers[0].lat + (markers[1].lat - markers[0].lat) * ratio;
        const lng = markers[0].lng + (markers[1].lng - markers[0].lng) * ratio;

        // Mock elevation calculation (replace with real API call)
        const elevation =
          Math.random() * 1000 + 100 + Math.sin(ratio * Math.PI * 4) * 200;
        const distance = ratio * calculateDistance(markers[0], markers[1]);

        elevationPoints.push({
          lat,
          lng,
          elevation: Math.round(elevation),
          distance: Math.round(distance),
          index: i,
        });
      }

      setElevationData(elevationPoints);
      setShowElevationChart(true);
      addLog(
        `📈 Generated elevation profile with ${elevationPoints.length} data points`
      );
    } catch (error) {
      console.error("Error generating elevation profile:", error);
      addLog("❌ Failed to generate elevation profile");
    }
  };

  // Calculate distance between two points (Haversine formula)
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

    return R * c; // Distance in meters
  };

  /**
   * The function `handleShowInfrastructure` toggles the visibility of infrastructure on a map and
   * updates the state accordingly.
   */
  const handleShowInfrastructure = () => {
    const newValue = !showInfrastructure;
    setShowInfrastructure(newValue);
    if (workingMapRef.current && workingMapRef.current.setShowInfrastructure) {
      workingMapRef.current.setShowInfrastructure(newValue);
    }
  };

  /**
   * The `handleHistory` function logs messages and interacts with `workingMapRef` to load saved
   * measurements and open a history dialog if available.
   */

  const handleHistory = () => {
    console.log("📂 History button clicked");
    if (workingMapRef.current) {
      console.log("✅ WorkingMapRef is available");

      // Load the saved measurements first
      if (workingMapRef.current.loadSavedMeasurements) {
        console.log("🔄 Calling loadSavedMeasurements");
        workingMapRef.current.loadSavedMeasurements();
      }

      // Open the history dialog
      if (workingMapRef.current.setHistoryDialogOpen) {
        console.log("📋 Opening history dialog");
        workingMapRef.current.setHistoryDialogOpen(true);
      }
    } else {
      console.error("❌ WorkingMapRef not available");
    }
  };

  /**
   * The function `handleSaveDistance` sets the state to open a save dialog.
   */
  const handleSaveDistance = () => {
    setSaveDialogOpen(true);
  };

  /**
   * The function `handleSavePolygon` logs a message and sets a state to open a polygon save dialog.
   */
  const handleSavePolygon = () => {
    console.log("💾 Opening polygon save dialog...");
    setPolygonSaveDialogOpen(true);
  };

  /**
   * The function `confirmSaveDistance` saves a measurement on a map and closes a dialog box.
   */
  const confirmSaveDistance = () => {
    if (workingMapRef.current && workingMapRef.current.saveMeasurement) {
      workingMapRef.current.saveMeasurement(
        measurementName || `Measurement ${Date.now()}`
      );
    }
    setSaveDialogOpen(false);
    setMeasurementName("");
  };

  const confirmSavePolygon = () => {
    console.log("✅ Confirming polygon save with name:", polygonName);
    if (workingMapRef.current && workingMapRef.current.savePolygonData) {
      workingMapRef.current.savePolygonData(
        polygonName || `Polygon ${Date.now()}`
      );
      console.log("✅ Polygon save function called");
    } else {
      console.error("❌ workingMapRef or savePolygonData not available");
    }
    setPolygonSaveDialogOpen(false);
    setPolygonName("");
  };

  // Map control handlers
  const handleZoomIn = () => {
    if (workingMapRef.current?.zoomIn) {
      workingMapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (workingMapRef.current?.zoomOut) {
      workingMapRef.current.zoomOut();
    }
  };

  // My Location marker ref
  const myLocationMarkerRef = useRef(null);

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (workingMapRef.current?.map) {
            // Remove existing location marker if any
            if (myLocationMarkerRef.current) {
              myLocationMarkerRef.current.setMap(null);
            }

            // Create new location marker
            const locationMarker = new window.google.maps.Marker({
              position: { lat: latitude, lng: longitude },
              map: workingMapRef.current.map,
              title: `My Location: ${latitude.toFixed(6)}, ${longitude.toFixed(
                6
              )}`,
              icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                scaledSize: new window.google.maps.Size(40, 40),
              },
              animation: window.google.maps.Animation.DROP,
            });

            myLocationMarkerRef.current = locationMarker;

            // Center and zoom to location
            workingMapRef.current.map.setCenter({
              lat: latitude,
              lng: longitude,
            });
            workingMapRef.current.map.setZoom(16);

            // Update hover coordinates to show current location
            setHoverCoordinates({ lat: latitude, lng: longitude });

            addLog(
              `📍 My location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            );
          }
        },
        (error) => {
          console.warn("Location not available:", error);
          addLog(`⚠️ Location access denied or unavailable`);
        }
      );
    } else {
      addLog(`⚠️ Geolocation not supported by this browser`);
    }
  };

  const handleCenterIndia = () => {
    if (workingMapRef.current?.centerOnIndia) {
      workingMapRef.current.centerOnIndia();
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setShowMapControls(false);
      setShowCoordinatesBox(false);
      addLog("🔳 Fullscreen mode activated");
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
        setShowMapControls(true);
        setShowCoordinatesBox(true);
        addLog("🔲 Fullscreen mode deactivated");
      }
    }
  };

  const handleIndiaBoundaryToggle = () => {
    const newValue = !showIndiaBoundary;
    setShowIndiaBoundary(newValue);
    if (workingMapRef.current?.showIndiaBoundary) {
      workingMapRef.current.showIndiaBoundary(newValue);
    }
    console.log(`🇮🇳 India boundary ${newValue ? "enabled" : "disabled"}`);
  };

  const handleCenterOnIndia = () => {
    if (workingMapRef.current?.centerOnIndia) {
      workingMapRef.current.centerOnIndia();
    }
    console.log("🗺️ Centered map on India");
  };

  // Unit conversion functions
  const formatDistance = (meters) => {
    if (selectedUnit === "imperial") {
      const miles = meters * 0.000621371;
      return miles >= 1
        ? `${miles.toFixed(2)} mi`
        : `${(meters * 3.28084).toFixed(0)} ft`;
    } else {
      return meters >= 1000
        ? `${(meters / 1000).toFixed(2)} km`
        : `${meters.toFixed(0)} m`;
    }
  };

  const formatArea = (squareMeters) => {
    if (selectedUnit === "imperial") {
      const squareMiles = squareMeters * 0.000000386102;
      return squareMiles >= 1
        ? `${squareMiles.toFixed(2)} mi²`
        : `${(squareMeters * 10.7639).toFixed(0)} ft²`;
    } else {
      return squareMeters >= 1000000
        ? `${(squareMeters / 1000000).toFixed(2)} km²`
        : `${squareMeters.toFixed(0)} m²`;
    }
  };

  // Calculate dynamic scale based on zoom level
  const getMapScale = (zoom) => {
    // Approximate scale calculation based on zoom level
    const earthCircumference = 40075000; // Earth's circumference in meters
    const pixelsAtZoom = 256 * Math.pow(2, zoom);
    const metersPerPixel = earthCircumference / pixelsAtZoom;
    const scaleDistance = metersPerPixel * 100; // 100 pixels scale

    if (selectedUnit === "imperial") {
      const feet = scaleDistance * 3.28084;
      const miles = scaleDistance * 0.000621371;
      return miles >= 1 ? `${miles.toFixed(2)} mi` : `${feet.toFixed(0)} ft`;
    } else {
      return scaleDistance >= 1000
        ? `${(scaleDistance / 1000).toFixed(2)} km`
        : `${scaleDistance.toFixed(0)} m`;
    }
  };

  const handleStreetView = () => {
    try {
      if (workingMapRef.current?.toggleStreetView) {
        const newStreetViewState = !streetViewActive;
        workingMapRef.current.toggleStreetView(newStreetViewState);
        setStreetViewActive(newStreetViewState);
        addLog(
          `🛣️ Street View ${newStreetViewState ? "activated" : "deactivated"}`
        );
      } else {
        addLog("⚠️ Street View not available - map not loaded");
      }
    } catch (error) {
      console.error("Street view error:", error);
      addLog("❌ Street View error: " + error.message);
    }
  };

  // Bookmark handlers
  const handleEditBookmark = (bookmark) => {
    setEditingBookmark(bookmark);
    setEditedBookmarkName(bookmark.name);
    setBookmarkEditDialogOpen(true);
  };

  const handleSaveBookmarkEdit = () => {
    if (editingBookmark && editedBookmarkName.trim()) {
      setBookmarks((prev) =>
        prev.map((b) =>
          b.id === editingBookmark.id
            ? { ...b, name: editedBookmarkName.trim() }
            : b
        )
      );
      setBookmarkEditDialogOpen(false);
      setEditingBookmark(null);
      setEditedBookmarkName("");
      console.log(`🌎 Bookmark renamed to: ${editedBookmarkName}`);
    }
  };

  const handleDeleteBookmark = (bookmark) => {
    setBookmarkToDelete(bookmark);
    setBookmarkDeleteDialogOpen(true);
  };

  const confirmDeleteBookmark = () => {
    if (bookmarkToDelete) {
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkToDelete.id));
      setBookmarkDeleteDialogOpen(false);
      setBookmarkToDelete(null);
      console.log(`🗑️ Bookmark deleted: ${bookmarkToDelete.name}`);
    }
  };

  // Add log function for debugging and user feedback
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);

    setDebugLogs((prev) => {
      const newLogs = [...prev.slice(-49), logEntry]; // Keep last 50 logs
      return newLogs;
    });
  };

  // Logout handler
  const handleLogout = () => {
    console.log("User logged out");
    // Add logout logic here
    window.location.href = "/";
  };

  // Map controls toggle handlers
  const toggleMapControlsForSidebar = (sectionType, isActive) => {
    if (isActive) {
      setShowMapControls(false);
      addLog(`🎛️ Map controls hidden for ${sectionType}`);
    } else {
      setShowMapControls(true);
      addLog(`🎛️ Map controls shown`);
    }
  };

  // Handle map mouse move for live coordinates
  const handleMapMouseMove = (coords) => {
    setHoverCoordinates(coords);
  };

  // Elevation functionality
  const handleStartElevationMode = () => {
    setElevationAddingMode(true);
    setElevationMarkers([]);
    setShowElevation(true);
    addLog(`🏔️ Elevation marker adding mode started`);
  };

  const handleStopElevationMode = () => {
    setElevationAddingMode(false);
    addLog(`🏔️ Elevation marker adding mode stopped`);
  };

  const toggleElevationChartWidth = () => {
    setElevationChartWidth(!elevationChartWidth);
    addLog(
      `📈 Elevation chart ${
        !elevationChartWidth ? "expanded to 80%" : "restored to normal width"
      }`
    );
  };

  // View saved data functionality
  const handleViewSavedData = (item) => {
    try {
      if (item.type === "distance") {
        // Load distance measurement onto the map
        if (item.points && workingMapRef.current?.loadMeasurement) {
          workingMapRef.current.loadMeasurement(item.points);
          setPoints(item.points);
          setTotalDistance(item.totalDistance || 0);
          addLog(`📏 Loaded distance measurement: ${item.name}`);
        }
      } else if (item.type === "polygon") {
        // Load polygon onto the map
        if (item.points && workingMapRef.current?.loadPolygon) {
          workingMapRef.current.loadPolygon(item.points);
          setPolygonPoints(item.points);
          setPolygonArea(item.area || 0);
          addLog(`🔷 Loaded polygon: ${item.name}`);
        }
      } else if (item.type === "elevation") {
        // Load elevation profile
        if (item.markers) {
          setElevationMarkers(item.markers);
          setElevationData(item.data || []);
          setElevationStats(item.stats || {});
          setShowElevationChart(true);
          addLog(`🏔️ Loaded elevation profile: ${item.name}`);
        }
      }
      // Close the dialog after loading
      setAllSavedDataDialogOpen(false);
    } catch (error) {
      console.error("Error loading saved data:", error);
      addLog(`❌ Error loading ${item.name}: ${error.message}`);
    }
  };

  // Delete confirmation handler
  const handleDeleteConfirmation = (item) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete handler
  const handleConfirmDelete = () => {
    if (itemToDelete) {
      try {
        localStorage.removeItem(itemToDelete.key);
        loadAllSavedData();
        addLog(`🗑️ Deleted ${itemToDelete.type}: ${itemToDelete.name}`);
      } catch (error) {
        console.error("Error deleting item:", error);
        addLog(`❌ Error deleting ${itemToDelete.name}: ${error.message}`);
      }
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  // Keyboard shortcuts removed as per requirements

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: darkMode ? "#121212" : "#f8f9fa",
        transition: "background-color 0.3s ease",
      }}
    >
      {/* Enhanced Navbar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: darkMode ? "#1a1a1a" : "primary.main",
          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
        }}
      >
        <Toolbar sx={{ minHeight: "64px !important" }}>
          <IconButton
            color="inherit"
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            edge="start"
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>

          <MapIcon sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h6" component="div" sx={{ mr: 2 }}>
            GIS Professional
          </Typography>
          <Chip
            label="Pro"
            size="small"
            color="secondary"
            sx={{ mr: 3, fontWeight: "bold" }}
          />

          {/* Enhanced Search Bar with MapSearch Integration */}
          <Box sx={{ position: "relative", width: 350, mr: "auto" }}>
            <MapSearchBox
              map={workingMapRef.current?.map}
              onPlaceSelect={(place) => {
                console.log("Place selected:", place);
                addLog(`🗺️ Searched location: ${place.displayName}`);
              }}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              darkMode={darkMode}
            />
          </Box>

          {/* ProfileMenu */}
          <ProfileMenu
            user={user}
            loginTime={loginTime}
            handleLogout={handleLogout}
          />

          <Tooltip title="Toggle Theme">
            <IconButton
              color="inherit"
              onClick={() => setDarkMode(!darkMode)}
              sx={{ mr: 1 }}
            >
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", flex: 1, pt: "64px" }}>
        {/* Enhanced Left Sidebar */}
        <Slide
          direction="right"
          in={leftSidebarOpen}
          mountOnEnter
          unmountOnExit
        >
          <Drawer
            variant="persistent"
            anchor="left"
            open={leftSidebarOpen}
            sx={{
              width: leftDrawerWidth,
              flexShrink: 0,
              zIndex: 1200,
              "& .MuiDrawer-paper": {
                width: leftDrawerWidth,
                boxSizing: "border-box",
                bgcolor: darkMode ? "#1e1e1e" : "#ffffff",
                color: darkMode ? "#ffffff" : "inherit",
                borderRight: `1px solid ${darkMode ? "#404040" : "#e3f2fd"}`,
                boxShadow: darkMode
                  ? "2px 0 12px rgba(0,0,0,0.5)"
                  : "2px 0 12px rgba(0,0,0,0.1)",
                top: "64px",
                height: "calc(100vh - 64px)",
                zIndex: 1200,
              },
            }}
          >
            {/* Compact Header */}
            <Box
              sx={{
                p: 1,
                background: `linear-gradient(135deg, ${
                  darkMode ? "rgb(63,81,181)" : "#1976D2"
                } 0%, ${darkMode ? "rgb(48,63,159)" : "#1565C0"} 100%)`,
                color: "white",
                textAlign: "center",
                borderBottom: `1px solid ${darkMode ? "grey.700" : "#e3f2fd"}`,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", fontSize: "0.9rem" }}
              >
                📍 Professional Tools
              </Typography>
              <Chip
                label={`${activeLayersCount} Active`}
                size="small"
                sx={{
                  mt: 0.25,
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: "0.6rem",
                  height: "18px",
                }}
              />
            </Box>

            <Box sx={{ p: 1, overflow: "auto", height: "calc(100vh - 140px)" }}>
              {/* Compact Stats Bar */}
              <Paper
                sx={{
                  p: 0.5,
                  mb: 0.5,
                  bgcolor: darkMode
                    ? "rgba(66, 165, 245, 0.1)"
                    : alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 2,
                  border: darkMode ? "1px solid #333" : "none",
                }}
              >
                <Grid container spacing={0.5}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          color: "#1976D2",
                        }}
                      >
                        {activeLayersCount}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: "0.6rem" }}>
                        Layers
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          color: "#1976D2",
                        }}
                      >
                        {points.length}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: "0.6rem" }}>
                        Points
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          color: "#1976D2",
                        }}
                      >
                        {polygonPoints.length}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: "0.6rem" }}>
                        Polygon
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* 🛠️ PROFESSIONAL TOOLS */}
              <Accordion
                defaultExpanded
                sx={{
                  mb: 0.25,
                  boxShadow: "none",
                  border: darkMode ? "1px solid #333" : "1px solid #e3f2fd",
                  bgcolor: darkMode ? "#2a2a2a" : "inherit",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    minHeight: 28,
                    py: 0.25,
                    "& .MuiAccordionSummary-content": { margin: "2px 0" },
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: "bold",
                      color: "#1976D2",
                      fontSize: "0.85rem",
                    }}
                  >
                    🛐️ Professional Tools
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0.5, pt: 0 }}>
                  <Grid container spacing={0.5}>
                    {/* Row 1: Distance & Polygon - EXACT SAME WIDTH */}
                    <Grid item xs={6}>
                      <Button
                        variant={isDrawing ? "contained" : "outlined"}
                        fullWidth
                        size="small"
                        startIcon={isDrawing ? <Stop /> : <PlayArrow />}
                        onClick={() => {
                          if (isDrawing) {
                            handleStopDrawing();
                            toggleMapControlsForSidebar("Distance", false);
                          } else {
                            handleStartDrawing();
                            toggleMapControlsForSidebar("Distance", true);
                          }
                        }}
                        disabled={!loaded}
                        sx={{
                          fontWeight: "bold",
                          textTransform: "none",
                          fontSize: "0.7rem",
                          py: 1,
                          px: 0.5,
                          minHeight: 38,
                          maxHeight: 38,
                          width: "100%", // EXACT SAME WIDTH
                          borderRadius: 2,
                          background: isDrawing
                            ? "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)"
                            : "transparent",
                          color: isDrawing ? "white" : "#2196F3",
                          borderColor: isDrawing ? "#4CAF50" : "#2196F3",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
                          },
                        }}
                      >
                        {isDrawing ? "Stop" : "Distance"}
                      </Button>
                    </Grid>

                    <Grid item xs={6}>
                      <Button
                        variant={isPolygonDrawing ? "contained" : "outlined"}
                        fullWidth
                        size="small"
                        startIcon={isPolygonDrawing ? <Stop /> : <Crop />}
                        onClick={() => {
                          if (isPolygonDrawing) {
                            handleStopPolygonDrawing();
                            toggleMapControlsForSidebar("Polygon", false);
                          } else {
                            handleStartPolygonDrawing();
                            toggleMapControlsForSidebar("Polygon", true);
                          }
                        }}
                        disabled={!loaded}
                        sx={{
                          fontWeight: "bold",
                          textTransform: "none",
                          fontSize: "0.7rem",
                          py: 1,
                          px: 0.5,
                          minHeight: 38,
                          maxHeight: 38,
                          width: "100%", // EXACT SAME WIDTH
                          borderRadius: 2,
                          background: isPolygonDrawing
                            ? "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)"
                            : "transparent",
                          color: isPolygonDrawing ? "white" : "#9C27B0",
                          borderColor: "#9C27B0",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 12px rgba(156, 39, 176, 0.3)",
                          },
                        }}
                      >
                        {isPolygonDrawing ? "Stop" : "Polygon"}
                      </Button>
                    </Grid>

                    {/* Row 2: Elevation & Infrastructure - EXACT SAME WIDTH */}
                    <Grid item xs={6}>
                      <Button
                        variant={
                          elevationAddingMode || showElevation
                            ? "contained"
                            : "outlined"
                        }
                        fullWidth
                        size="small"
                        startIcon={
                          elevationAddingMode ? <Stop /> : <TrendingUp />
                        }
                        onClick={() => {
                          if (elevationAddingMode) {
                            handleStopElevationMode();
                            handleShowElevation(); // Turn off elevation mode
                            toggleMapControlsForSidebar("Elevation", false);
                          } else {
                            handleStartElevationMode(); // This will automatically call handleShowElevation
                            toggleMapControlsForSidebar("Elevation", true);
                          }
                        }}
                        disabled={!loaded}
                        sx={{
                          fontWeight: "bold",
                          textTransform: "none",
                          fontSize: "0.7rem",
                          py: 1,
                          px: 0.5,
                          minHeight: 38,
                          maxHeight: 38,
                          width: "100%", // EXACT SAME WIDTH
                          borderRadius: 2,
                          background:
                            elevationAddingMode || showElevation
                              ? "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)"
                              : "transparent",
                          color:
                            elevationAddingMode || showElevation
                              ? "white"
                              : "#FF9800",
                          borderColor: "#FF9800",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
                          },
                        }}
                      >
                        {elevationAddingMode ? "Stop Adding" : "Elevation"}
                      </Button>
                    </Grid>

                    <Grid item xs={6}>
                      <Button
                        variant={showInfrastructure ? "contained" : "outlined"}
                        fullWidth
                        size="small"
                        startIcon={showInfrastructure ? <Stop /> : <Business />}
                        onClick={() => {
                          handleShowInfrastructure();
                          toggleMapControlsForSidebar(
                            "Infrastructure",
                            !showInfrastructure
                          );
                        }}
                        disabled={!loaded}
                        sx={{
                          fontWeight: "bold",
                          textTransform: "none",
                          fontSize: "0.7rem",
                          py: 1,
                          px: 0.5,
                          minHeight: 38,
                          maxHeight: 38,
                          width: "100%", // EXACT SAME WIDTH
                          borderRadius: 2,
                          background: showInfrastructure
                            ? "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)"
                            : "transparent",
                          color: showInfrastructure ? "white" : "#2196F3",
                          borderColor: "#2196F3",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
                          },
                        }}
                      >
                        {showInfrastructure ? "Stop" : "Infrastructure"}
                      </Button>
                    </Grid>

                    {/* Row 3: Elevation Chart Toggle - Full Width (only show when elevation chart is active) */}
                    {showElevationChart && (
                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          fullWidth
                          size="small"
                          startIcon={<Fullscreen />}
                          onClick={toggleElevationChartWidth}
                          sx={{
                            fontWeight: "bold",
                            textTransform: "none",
                            fontSize: "0.65rem",
                            py: 0.8,
                            px: 0.5,
                            minHeight: 32,
                            width: "100%",
                            borderRadius: 2,
                            borderColor: "#FF9800",
                            color: elevationChartWidth ? "#FF9800" : "#666",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: "rgba(255, 152, 0, 0.08)",
                            },
                          }}
                        >
                          📈{" "}
                          {elevationChartWidth
                            ? "Normal Width"
                            : "Expand Chart"}
                        </Button>
                      </Grid>
                    )}

                    {/* Row 4: Clear All - Full Width */}
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        startIcon={<Clear />}
                        onClick={handleClearAll}
                        disabled={
                          !loaded ||
                          (points.length === 0 &&
                            polygonPoints.length === 0 &&
                            elevationMarkers.length === 0)
                        }
                        sx={{
                          fontWeight: "bold",
                          textTransform: "none",
                          fontSize: "0.7rem",
                          py: 1,
                          px: 0.5,
                          minHeight: 38,
                          maxHeight: 38,
                          width: "100%", // FULL WIDTH
                          borderRadius: 2,
                          borderColor: "#FF5722",
                          color: "#FF5722",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "rgba(255, 87, 34, 0.08)",
                            transform: "translateY(-1px)",
                          },
                          "&:disabled": {
                            opacity: 0.5,
                          },
                        }}
                      >
                        🧧 Clear All Data
                      </Button>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* 🎯 DATA MANAGER */}
              <Accordion
                defaultExpanded
                sx={{
                  mb: 0.25,
                  boxShadow: "none",
                  border: darkMode ? "1px solid #333" : "1px solid #e3f2fd",
                  bgcolor: darkMode ? "#2a2a2a" : "inherit",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    minHeight: 32,
                    py: 0.5,
                    "& .MuiAccordionSummary-content": { margin: "4px 0" },
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: "bold",
                      color: "#1976D2",
                      fontSize: "0.9rem",
                    }}
                  >
                    🎯 Data Manager
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0.5, pt: 0 }}>
                  <Stack spacing={0.75}>
                    {/* Save Actions Grid */}
                    <Box
                      sx={{
                        p: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color: "primary.main",
                          mb: 1,
                          fontSize: "0.7rem",
                        }}
                      >
                        💾 Quick Save
                      </Typography>
                      <Grid container spacing={0.5}>
                        <Grid item xs={4}>
                          <Button
                            variant={
                              points.length >= 2 ? "contained" : "outlined"
                            }
                            fullWidth
                            size="small"
                            startIcon={<Save />}
                            onClick={handleSaveDistance}
                            disabled={!loaded || points.length < 2}
                            sx={{
                              fontSize: "0.6rem",
                              py: 0.8,
                              minHeight: 32,
                              bgcolor:
                                points.length >= 2 ? "#4CAF50" : "transparent",
                              borderColor: "#4CAF50",
                              color: points.length >= 2 ? "white" : "#4CAF50",
                              "&:hover": {
                                bgcolor:
                                  points.length >= 2
                                    ? "#2E7D32"
                                    : "rgba(76, 175, 80, 0.08)",
                              },
                              "&:disabled": { opacity: 0.3 },
                            }}
                          >
                            Distance
                          </Button>
                        </Grid>
                        <Grid item xs={4}>
                          <Button
                            variant={
                              polygonPoints.length >= 3
                                ? "contained"
                                : "outlined"
                            }
                            fullWidth
                            size="small"
                            startIcon={<Save />}
                            onClick={handleSavePolygon}
                            disabled={!loaded || polygonPoints.length < 3}
                            sx={{
                              fontSize: "0.6rem",
                              py: 0.8,
                              minHeight: 32,
                              bgcolor:
                                polygonPoints.length >= 3
                                  ? "#9C27B0"
                                  : "transparent",
                              borderColor: "#9C27B0",
                              color:
                                polygonPoints.length >= 3 ? "white" : "#9C27B0",
                              "&:hover": {
                                bgcolor:
                                  polygonPoints.length >= 3
                                    ? "#7B1FA2"
                                    : "rgba(156, 39, 176, 0.08)",
                              },
                              "&:disabled": { opacity: 0.3 },
                            }}
                          >
                            Polygon
                          </Button>
                        </Grid>
                        <Grid item xs={4}>
                          <Button
                            variant={
                              elevationMarkers.length >= 2
                                ? "contained"
                                : "outlined"
                            }
                            fullWidth
                            size="small"
                            startIcon={<Save />}
                            onClick={() => setElevationSaveDialogOpen(true)}
                            disabled={!loaded || elevationMarkers.length < 2}
                            sx={{
                              fontSize: "0.6rem",
                              py: 0.8,
                              minHeight: 32,
                              bgcolor:
                                elevationMarkers.length >= 2
                                  ? "#FF9800"
                                  : "transparent",
                              borderColor: "#FF9800",
                              color:
                                elevationMarkers.length >= 2
                                  ? "white"
                                  : "#FF9800",
                              "&:hover": {
                                bgcolor:
                                  elevationMarkers.length >= 2
                                    ? "#F57C00"
                                    : "rgba(255, 152, 0, 0.08)",
                              },
                              "&:disabled": { opacity: 0.3 },
                            }}
                          >
                            Elevation
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* 📋 SAVED DATA LIBRARY */}
              <Accordion
                sx={{
                  mb: 0.25,
                  boxShadow: "none",
                  border: darkMode ? "1px solid #333" : "1px solid #e3f2fd",
                  bgcolor: darkMode ? "#2a2a2a" : "inherit",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    minHeight: 32,
                    py: 0.5,
                    "& .MuiAccordionSummary-content": { margin: "4px 0" },
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: "bold",
                      color: "#1976D2",
                      fontSize: "0.9rem",
                    }}
                  >
                    📋 Saved Data Library
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0.5, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => {
                      loadAllSavedData();
                      setAllSavedDataDialogOpen(true);
                    }}
                    sx={{
                      textTransform: "none",
                      fontSize: "0.75rem",
                      py: 1,
                      background:
                        "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)",
                      },
                    }}
                  >
                    📄 View All Saved Data
                  </Button>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: "center",
                      color: "text.secondary",
                      mt: 1,
                      fontSize: "0.65rem",
                    }}
                  >
                    Manage distance, polygon & elevation data
                  </Typography>
                </AccordionDetails>
              </Accordion>

              {/* 🗺️ BASE MAPS - Compact Version */}
              <Accordion
                defaultExpanded
                sx={{
                  mb: 0.25,
                  boxShadow: "none",
                  border: darkMode ? "1px solid #333" : "1px solid #e3f2fd",
                  bgcolor: darkMode ? "#2a2a2a" : "inherit",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    minHeight: 28,
                    py: 0.25,
                    "& .MuiAccordionSummary-content": { margin: "2px 0" },
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: "bold",
                      color: "#1976D2",
                      fontSize: "0.85rem",
                    }}
                  >
                    🗺️ Base Maps
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0.5, pt: 0 }}>
                  <ToggleButtonGroup
                    value={selectedBaseMap}
                    exclusive
                    onChange={(e, newMap) => {
                      if (newMap) setSelectedBaseMap(newMap);
                    }}
                    orientation="vertical"
                    fullWidth
                    size="small"
                  >
                    {baseMaps.map((map) => (
                      <ToggleButton
                        key={map.id}
                        value={map.id}
                        sx={{
                          justifyContent: "flex-start",
                          textAlign: "left",
                          py: 0.5,
                          minHeight: 32,
                          border: "1px solid #e0e0e0 !important",
                          "&.Mui-selected": {
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            borderColor: `${theme.palette.primary.main} !important`,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <Typography sx={{ mr: 1, fontSize: "1rem" }}>
                            {map.icon}
                          </Typography>
                          <Box sx={{ textAlign: "left" }}>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              textTransform="none"
                              sx={{ fontSize: "0.75rem" }}
                            >
                              {map.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              textTransform="none"
                              sx={{ fontSize: "0.6rem" }}
                            >
                              {map.description}
                            </Typography>
                          </Box>
                        </Box>
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </AccordionDetails>
              </Accordion>

              {/* 🐛 DEBUG CONTROLS - Toggle Button */}
              <Box sx={{ mb: 1 }}>
                <Button
                  variant={showDebugLogs ? "contained" : "outlined"}
                  fullWidth
                  size="small"
                  startIcon={showDebugLogs ? <Visibility /> : <Code />}
                  onClick={() => {
                    setShowDebugLogs(!showDebugLogs);
                    addLog(
                      `🐛 Debug logs ${!showDebugLogs ? "enabled" : "disabled"}`
                    );
                  }}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.7rem",
                    py: 1,
                    borderRadius: 2,
                    borderColor: showDebugLogs ? "#4CAF50" : "#6c757d",
                    color: showDebugLogs ? "white" : "#6c757d",
                    backgroundColor: showDebugLogs ? "#4CAF50" : "transparent",
                    "&:hover": {
                      backgroundColor: showDebugLogs
                        ? "#388E3C"
                        : "rgba(108, 117, 125, 0.1)",
                      borderColor: showDebugLogs ? "#388E3C" : "#495057",
                    },
                  }}
                >
                  {showDebugLogs ? "🐛 Hide Debug Logs" : "🐛 Show Debug Logs"}
                </Button>
              </Box>

              {/* 📖 BOOKMARKS */}
              <Accordion
                defaultExpanded
                sx={{
                  mb: 0.25,
                  boxShadow: "none",
                  border: darkMode ? "1px solid #333" : "1px solid #e3f2fd",
                  bgcolor: darkMode ? "#2a2a2a" : "inherit",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    minHeight: 32,
                    py: 0.5,
                    "& .MuiAccordionSummary-content": { margin: "4px 0" },
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: "bold",
                      color: "#1976D2",
                      fontSize: "0.9rem",
                    }}
                  >
                    🔖 Quick Bookmarks ({bookmarks.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0.5, pt: 0 }}>
                  <Stack spacing={1}>
                    {/* Add Current Location Button */}
                    <Button
                      variant="outlined"
                      fullWidth
                      size="small"
                      startIcon={<Place />}
                      onClick={() => {
                        // Add current center point as bookmark using live coordinates
                        const newBookmark = {
                          id: Date.now(),
                          name: `Location ${bookmarks.length + 1}`,
                          coords: {
                            lat: liveCoordinates.lat,
                            lng: liveCoordinates.lng,
                          },
                          timestamp: new Date().toLocaleString(),
                          zoom: mapZoom,
                        };
                        setBookmarks((prev) => [...prev, newBookmark]);
                        console.log(
                          `🔖 Bookmark saved at: ${liveCoordinates.lat.toFixed(
                            6
                          )}, ${liveCoordinates.lng.toFixed(6)}`
                        );
                      }}
                      sx={{
                        textTransform: "none",
                        fontSize: "0.7rem",
                        py: 0.8,
                        borderColor: "#4CAF50",
                        color: "#4CAF50",
                        "&:hover": {
                          backgroundColor: "rgba(76, 175, 80, 0.08)",
                          borderColor: "#2E7D32",
                        },
                      }}
                    >
                      Add Current View
                    </Button>

                    {bookmarks.length === 0 ? (
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: alpha(theme.palette.info.main, 0.05),
                          borderRadius: 2,
                          textAlign: "center",
                        }}
                      >
                        <Bookmark
                          sx={{ fontSize: 32, color: "info.main", mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          No bookmarks yet. Click "Add Current View" to save
                          locations.
                        </Typography>
                      </Paper>
                    ) : (
                      <Stack spacing={0.5}>
                        {bookmarks.map((bookmark) => (
                          <Paper
                            key={bookmark.id}
                            variant="outlined"
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  0.05
                                ),
                                borderColor: "primary.main",
                                transform: "translateY(-1px)",
                                boxShadow: "0 2px 8px rgba(33, 150, 243, 0.2)",
                              },
                            }}
                            onClick={() => {
                              console.log(
                                `🎯 Navigating to bookmark: ${bookmark.name}`
                              );
                              console.log(
                                `🗺 Coordinates: ${bookmark.coords.lat}, ${bookmark.coords.lng}`
                              );
                              // Navigate to the exact bookmark location
                              if (workingMapRef.current?.map) {
                                workingMapRef.current.map.panTo(
                                  bookmark.coords
                                );
                                workingMapRef.current.map.setZoom(
                                  bookmark.zoom || 12
                                );
                                console.log(
                                  `✅ Map navigated to bookmark location`
                                );
                              } else {
                                console.error(
                                  "❌ WorkingMapRef not available for navigation"
                                );
                              }
                            }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <Bookmark color="primary" sx={{ fontSize: 16 }} />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="body2"
                                  fontWeight="medium"
                                  noWrap
                                >
                                  {bookmark.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: "0.65rem" }}
                                >
                                  {bookmark.coords.lat.toFixed(4)}°,{" "}
                                  {bookmark.coords.lng.toFixed(4)}°
                                </Typography>
                              </Box>
                              <Stack direction="row" spacing={0.5}>
                                <Tooltip title="Edit bookmark">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditBookmark(bookmark);
                                    }}
                                    sx={{
                                      color: "primary.main",
                                      opacity: 0.7,
                                      "&:hover": { opacity: 1 },
                                    }}
                                  >
                                    <Settings sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete bookmark">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteBookmark(bookmark);
                                    }}
                                    sx={{
                                      color: "error.main",
                                      opacity: 0.7,
                                      "&:hover": { opacity: 1 },
                                    }}
                                  >
                                    <Clear sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Drawer>
        </Slide>

        {/* Main Map Area - Fixed Size, Unshrinkable */}
        <Box
          component="main"
          sx={{
            position: "fixed",
            top: 64, // Height of navbar
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            zIndex: 1,
            overflow: "hidden",
          }}
        >
          {/* Enhanced Map with Integrated Search */}
          <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
            <WorkingMeasurementMap
              ref={workingMapRef}
              hideControls={true}
              hideHeader={true}
              isDrawing={isDrawing}
              isPolygonDrawing={isPolygonDrawing}
              showElevation={showElevation}
              showInfrastructure={showInfrastructure}
              selectedBaseMap={selectedBaseMap}
              onDrawingChange={setIsDrawing}
              onPolygonDrawingChange={setIsPolygonDrawing}
              onPointsChange={setPoints}
              onPolygonPointsChange={setPolygonPoints}
              onTotalDistanceChange={setTotalDistance}
              onPolygonAreaChange={setPolygonArea}
              onCoordinatesChange={setLiveCoordinates}
              onZoomChange={setMapZoom}
              onLogsChange={setDebugLogs}
              onMouseCoordinatesChange={setMouseCoordinates}
              onHoverCoordinatesChange={handleMapMouseMove}
              showDebugLogs={showDebugLogs}
              streetViewActive={streetViewActive}
              elevationAddingMode={elevationAddingMode}
              elevationMarkers={elevationMarkers}
              onElevationMarkersChange={setElevationMarkers}
              onElevationMarkerAdd={handleElevationMarkerAdd}
              showElevationChart={showElevationChart}
              onShowElevationChartChange={setShowElevationChart}
              elevationChartWidth={elevationChartWidth}
              onElevationDataChange={setElevationData}
              onElevationStatsChange={setElevationStats}
            />
          </Box>

          {/* Enhanced Map Controls - Always Available with Toggle */}
          {showMapControls && (
            <Fade in={showMapControls}>
              <Paper
                sx={{
                  position: "absolute",
                  top: 16,
                  right: leftSidebarOpen ? 16 : 16,
                  transform: leftSidebarOpen
                    ? "translateX(-10px)"
                    : "translateX(0)",
                  transition: "transform 0.3s ease",
                  borderRadius: 2,
                  overflow: "hidden",
                  bgcolor: darkMode
                    ? "rgba(0, 0, 0, 0.85)"
                    : "rgba(255, 255, 255, 0.95)",
                  color: darkMode ? "#fff" : "inherit",
                  backdropFilter: "blur(10px)",
                  zIndex: 1200,
                  border: darkMode ? "1px solid #333" : "none",
                }}
              >
                <Stack spacing={0}>
                  {/* Toggle Controls Button */}
                  <Tooltip title="Toggle Controls" placement="left">
                    <IconButton
                      size="small"
                      onClick={() => setShowMapControls(!showMapControls)}
                      sx={{
                        color: darkMode ? "#fff" : "inherit",
                        "&:hover": {
                          bgcolor: darkMode
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <Settings />
                    </IconButton>
                  </Tooltip>
                  <Divider />
                  <Tooltip title="Toggle Fullscreen" placement="left">
                    <IconButton
                      size="small"
                      onClick={handleFullscreen}
                      sx={{
                        color: darkMode ? "#fff" : "inherit",
                        "&:hover": {
                          bgcolor: darkMode
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <Fullscreen />
                    </IconButton>
                  </Tooltip>
                  <Divider />
                  <Tooltip title="Zoom In" placement="left">
                    <IconButton
                      size="small"
                      onClick={handleZoomIn}
                      sx={{
                        color: darkMode ? "#fff" : "inherit",
                        "&:hover": {
                          bgcolor: darkMode
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <ZoomIn />
                    </IconButton>
                  </Tooltip>
                  <Divider />
                  <Tooltip title="Zoom Out" placement="left">
                    <IconButton
                      size="small"
                      onClick={handleZoomOut}
                      sx={{
                        color: darkMode ? "#fff" : "inherit",
                        "&:hover": {
                          bgcolor: darkMode
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <ZoomOut />
                    </IconButton>
                  </Tooltip>
                  <Divider />
                  <Tooltip title="My Location" placement="left">
                    <IconButton
                      size="small"
                      onClick={handleMyLocation}
                      sx={{
                        color: darkMode ? "#fff" : "inherit",
                        "&:hover": {
                          bgcolor: darkMode
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <MyLocation />
                    </IconButton>
                  </Tooltip>
                  <Divider />
                  <Tooltip title="Center on India" placement="left">
                    <IconButton
                      size="small"
                      onClick={handleCenterIndia}
                      sx={{
                        color: darkMode ? "#fff" : "inherit",
                        "&:hover": {
                          bgcolor: darkMode
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <CenterFocusStrong />
                    </IconButton>
                  </Tooltip>
                  <Divider />
                  <Tooltip title="Street View" placement="left">
                    <IconButton
                      size="small"
                      onClick={handleStreetView}
                      sx={{
                        color: darkMode ? "#fff" : "inherit",
                        "&:hover": {
                          bgcolor: darkMode
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <Satellite />
                    </IconButton>
                  </Tooltip>
                  <Divider />
                  <Tooltip title="Toggle Coordinates" placement="left">
                    <IconButton
                      size="small"
                      onClick={() => setShowCoordinatesBox(!showCoordinatesBox)}
                      sx={{
                        color: darkMode ? "#fff" : "inherit",
                        "&:hover": {
                          bgcolor: darkMode
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <LocationOn />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Paper>
            </Fade>
          )}

          {/* Minimized Controls Toggle */}
          {!showMapControls && (
            <Fab
              size="small"
              onClick={() => setShowMapControls(true)}
              sx={{
                position: "absolute",
                top: 16,
                right: leftSidebarOpen ? 16 : 16,
                transform: leftSidebarOpen
                  ? "translateX(-10px)"
                  : "translateX(0)",
                transition: "transform 0.3s ease",
                bgcolor: darkMode
                  ? "rgba(0, 0, 0, 0.85)"
                  : "rgba(255, 255, 255, 0.95)",
                color: darkMode ? "#fff" : "inherit",
                zIndex: 1200,
                "&:hover": {
                  bgcolor: darkMode
                    ? "rgba(0, 0, 0, 0.95)"
                    : "rgba(255, 255, 255, 1)",
                },
              }}
            >
              <Menu />
            </Fab>
          )}

          {/* Enhanced Distance & Area Panel - Bottom Center - Hidden during drawing */}
          {(totalDistance > 0 || polygonArea > 0) &&
            !isDrawing &&
            !isPolygonDrawing && (
              <Paper
                sx={{
                  position: "absolute",
                  bottom: 80,
                  left: "50%",
                  transform: "translateX(-50%)",
                  p: 2,
                  bgcolor: darkMode
                    ? "rgba(0, 0, 0, 0.9)"
                    : "rgba(255, 255, 255, 0.98)",
                  color: darkMode ? "#fff" : "inherit",
                  backdropFilter: "blur(20px)",
                  zIndex: 1000,
                  border: `2px solid ${
                    totalDistance > 0
                      ? "rgba(76, 175, 80, 0.8)"
                      : "rgba(156, 39, 176, 0.8)"
                  }`,
                  borderRadius: 3,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                  minWidth: 280,
                }}
              >
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    justifyContent="center"
                  >
                    <Straighten sx={{ fontSize: 20, color: "success.main" }} />
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "success.main" }}
                    >
                      Live Measurements
                    </Typography>
                  </Stack>

                  {totalDistance > 0 && (
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 1,
                        bgcolor: darkMode
                          ? "rgba(25, 118, 210, 0.1)"
                          : "rgba(25, 118, 210, 0.05)",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.8rem",
                          color: "primary.main",
                          fontWeight: "bold",
                        }}
                      >
                        DISTANCE
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: "bold",
                          color: "primary.main",
                          fontFamily: "monospace",
                        }}
                      >
                        {formatDistance(totalDistance)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "0.7rem", opacity: 0.7 }}
                      >
                        {points.length} measurement points
                      </Typography>
                    </Box>
                  )}

                  {polygonArea > 0 && (
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 1,
                        bgcolor: darkMode
                          ? "rgba(156, 39, 176, 0.1)"
                          : "rgba(156, 39, 176, 0.05)",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.8rem",
                          color: "secondary.main",
                          fontWeight: "bold",
                        }}
                      >
                        AREA
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: "bold",
                          color: "secondary.main",
                          fontFamily: "monospace",
                        }}
                      >
                        {formatArea(polygonArea)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "0.7rem", opacity: 0.7 }}
                      >
                        {polygonPoints.length} polygon vertices
                      </Typography>
                    </Box>
                  )}

                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Chip
                      label={`Unit: ${
                        selectedUnit === "metric" ? "Metric" : "Imperial"
                      }`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: "0.7rem", height: 24 }}
                    />
                    <Chip
                      label="Real-time"
                      size="small"
                      color="success"
                      sx={{ fontSize: "0.7rem", height: 24 }}
                    />
                  </Stack>
                </Stack>
              </Paper>
            )}

          {/* Scale Bar - Bottom Left */}
          <Paper
            sx={{
              position: "absolute",
              bottom: 16,
              left: 16,
              p: 1,
              bgcolor: darkMode
                ? "rgba(0, 0, 0, 0.85)"
                : "rgba(255, 255, 255, 0.95)",
              color: darkMode ? "#fff" : "inherit",
              zIndex: 1000,
              borderRadius: 2,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
              {getMapScale(mapZoom)}
            </Typography>
          </Paper>

          {/* Enhanced Live Coordinates and Zoom Display - Bottom Right */}
          {showCoordinatesBox && (
            <Fade in={showCoordinatesBox}>
              <Paper
                sx={{
                  position: "absolute",
                  bottom: 16,
                  right: leftSidebarOpen ? 16 : 16,
                  transform: leftSidebarOpen
                    ? "translateX(-10px)"
                    : "translateX(0)",
                  transition: "transform 0.3s ease",
                  p: 1.5,
                  bgcolor: darkMode
                    ? "rgba(0, 0, 0, 0.85)"
                    : "rgba(255, 255, 255, 0.95)",
                  color: darkMode ? "#fff" : "inherit",
                  zIndex: 1000,
                  borderRadius: 2,
                  minWidth: 220,
                  backdropFilter: "blur(10px)",
                  border: darkMode ? "1px solid #333" : "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: "bold", display: "block" }}
                  >
                    📍 Map Center
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setShowCoordinatesBox(false)}
                    sx={{
                      color: darkMode ? "#fff" : "inherit",
                      opacity: 0.7,
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    <Close sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    display: "block",
                  }}
                >
                  Lat: {liveCoordinates.lat.toFixed(6)}°
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    display: "block",
                  }}
                >
                  Lng: {liveCoordinates.lng.toFixed(6)}°
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.75rem",
                    display: "block",
                    mt: 0.5,
                  }}
                >
                  🔍 Zoom: {mapZoom}
                </Typography>
                {hoverCoordinates && (
                  <Box
                    sx={{
                      mt: 1,
                      pt: 1,
                      borderTop: `1px solid ${darkMode ? "#333" : "#e0e0e0"}`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: "bold",
                        display: "block",
                        color: "primary.main",
                      }}
                    >
                      📁 Mouse Position
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.75rem",
                        color: "primary.main",
                        display: "block",
                      }}
                    >
                      Lat: {hoverCoordinates.lat.toFixed(6)}°
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.75rem",
                        color: "primary.main",
                        display: "block",
                      }}
                    >
                      Lng: {hoverCoordinates.lng.toFixed(6)}°
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Fade>
          )}

          {/* Debug Logs Overlay - Bottom Left Corner with minimum 5 lines */}
          {showDebugLogs && (
            <Fade in={showDebugLogs}>
              <Paper
                sx={{
                  position: "absolute",
                  bottom: 80,
                  left: leftSidebarOpen ? `${leftDrawerWidth + 32}px` : 16,
                  transform: leftSidebarOpen
                    ? "translateX(0)"
                    : "translateX(0)",
                  transition: "left 0.3s ease",
                  maxWidth: 480,
                  minHeight: 140, // Minimum height for 5 lines
                  maxHeight: 200,
                  p: 1.5,
                  bgcolor: darkMode
                    ? "rgba(15, 23, 42, 0.95)"
                    : "rgba(255, 255, 255, 0.95)",
                  color: darkMode ? "#e2e8f0" : "#334155",
                  zIndex: 1000,
                  borderRadius: 3,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                    borderBottom: darkMode
                      ? "1px solid #334155"
                      : "1px solid #e2e8f0",
                    pb: 0.75,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: darkMode ? "#10b981" : "#059669",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                      letterSpacing: "0.5px",
                    }}
                  >
                    🐛 DEBUG LOGS ({debugLogs.length})
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setShowDebugLogs(false)}
                    sx={{
                      color: darkMode ? "#ef4444" : "#dc2626",
                      p: 0.25,
                      "&:hover": {
                        backgroundColor: darkMode
                          ? "rgba(239, 68, 68, 0.1)"
                          : "rgba(220, 38, 38, 0.1)",
                      },
                    }}
                  >
                    <Close sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
                <Box
                  sx={{
                    height: 110, // Fixed height for exactly 5 lines + some padding
                    overflow: "auto",
                    fontSize: "0.7rem",
                    lineHeight: 1.4,
                    "&::-webkit-scrollbar": {
                      width: 6,
                    },
                    "&::-webkit-scrollbar-track": {
                      background: darkMode
                        ? "rgba(51, 65, 85, 0.3)"
                        : "rgba(226, 232, 240, 0.5)",
                      borderRadius: 3,
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: darkMode ? "#64748b" : "#94a3b8",
                      borderRadius: 3,
                      "&:hover": {
                        background: darkMode ? "#475569" : "#64748b",
                      },
                    },
                  }}
                >
                  {debugLogs.length === 0 ? (
                    <Typography
                      variant="caption"
                      sx={{ color: "#666", fontStyle: "italic" }}
                    >
                      📝 No debug logs yet...
                    </Typography>
                  ) : (
                    debugLogs.slice(-5).map(
                      (
                        log,
                        index // Show only last 5 logs
                      ) => (
                        <Typography
                          key={`debug-log-${
                            debugLogs.length - 5 + index
                          }-${index}`}
                          variant="caption"
                          sx={{
                            display: "block",
                            color: log.includes("❌")
                              ? darkMode
                                ? "#ef4444"
                                : "#dc2626"
                              : log.includes("⚠️")
                              ? darkMode
                                ? "#f59e0b"
                                : "#d97706"
                              : log.includes("✅")
                              ? darkMode
                                ? "#10b981"
                                : "#059669"
                              : log.includes("📏") ||
                                log.includes("📐") ||
                                log.includes("🏔️")
                              ? darkMode
                                ? "#3b82f6"
                                : "#2563eb"
                              : darkMode
                              ? "#8b5cf6"
                              : "#7c3aed",
                            fontSize: "0.75rem",
                            fontFamily:
                              "'JetBrains Mono', 'Fira Code', monospace",
                            lineHeight: 1.5,
                            mb: 0.5,
                            fontWeight: "500",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {log}
                        </Typography>
                      )
                    )
                  )}
                </Box>
              </Paper>
            </Fade>
          )}

          {/* Full-width Elevation Chart Overlay */}
          {showElevationChart && (
            <Paper
              sx={{
                position: "absolute",
                bottom: 0,
                left: elevationChartWidth ? "20%" : 0,
                right: 0,
                width: elevationChartWidth ? "80%" : "100%",
                height: 350,
                bgcolor: darkMode
                  ? "rgba(0, 0, 0, 0.95)"
                  : "rgba(255, 255, 255, 0.98)",
                color: darkMode ? "#fff" : "inherit",
                zIndex: 1500,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                boxShadow: "0 -8px 32px rgba(0,0,0,0.3)",
                backdropFilter: "blur(20px)",
                transition: "all 0.3s ease",
              }}
            >
              <Box sx={{ p: 2, height: "100%" }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 2 }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <TrendingUp sx={{ fontSize: 24, color: "primary.main" }} />
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      Elevation Profile
                    </Typography>
                    <Chip
                      label={`${elevationData.length} Points`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={`Distance: ${formatDistance(
                        elevationStats.distance || 0
                      )}`}
                      size="small"
                      sx={{
                        bgcolor: darkMode
                          ? "rgba(25, 118, 210, 0.2)"
                          : "rgba(25, 118, 210, 0.1)",
                      }}
                    />
                    <Chip
                      label={`High: ${elevationStats.maxElevation}m`}
                      size="small"
                      color="success"
                      sx={{
                        bgcolor: darkMode
                          ? "rgba(76, 175, 80, 0.2)"
                          : "rgba(76, 175, 80, 0.1)",
                      }}
                    />
                    <Chip
                      label={`Low: ${elevationStats.minElevation}m`}
                      size="small"
                      color="info"
                      sx={{
                        bgcolor: darkMode
                          ? "rgba(33, 150, 243, 0.2)"
                          : "rgba(33, 150, 243, 0.1)",
                      }}
                    />
                    <Tooltip title="Toggle Chart Width">
                      <IconButton
                        size="small"
                        onClick={() =>
                          setElevationChartWidth(!elevationChartWidth)
                        }
                        sx={{ color: "primary.main" }}
                      >
                        {elevationChartWidth ? (
                          <ChevronLeft />
                        ) : (
                          <ChevronRight />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Save Elevation Profile">
                      <IconButton
                        size="small"
                        onClick={() => setElevationSaveDialogOpen(true)}
                        sx={{ color: "success.main" }}
                      >
                        <Save />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={clearElevationData}
                      sx={{ color: "text.secondary" }}
                    >
                      <Close />
                    </IconButton>
                  </Stack>
                </Stack>

                {/* Simple ASCII-style elevation chart */}
                <Box
                  sx={{
                    height: 200,
                    bgcolor: darkMode ? "#1a1a1a" : "#f5f5f5",
                    borderRadius: 2,
                    p: 2,
                    border: darkMode ? "1px solid #333" : "1px solid #ddd",
                    display: "flex",
                    alignItems: "end",
                    justifyContent: "space-between",
                  }}
                >
                  {elevationData.map((point, index) => {
                    const maxElevation = Math.max(
                      ...elevationData.map((d) => d.elevation)
                    );
                    const minElevation = Math.min(
                      ...elevationData.map((d) => d.elevation)
                    );
                    const heightPercentage =
                      ((point.elevation - minElevation) /
                        (maxElevation - minElevation)) *
                      100;

                    return (
                      <Box
                        key={index}
                        sx={{
                          width: `calc(100% / ${elevationData.length})`,
                          height: `${Math.max(heightPercentage, 5)}%`,
                          bgcolor: `hsl(${
                            120 - heightPercentage * 0.8
                          }, 70%, 50%)`,
                          mx: 0.1,
                          borderRadius: "2px 2px 0 0",
                          position: "relative",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            transform: "scaleX(2)",
                            zIndex: 10,
                            bgcolor: "primary.main",
                          },
                        }}
                        title={`Distance: ${formatDistance(
                          point.distance
                        )}, Elevation: ${point.elevation}m`}
                      />
                    );
                  })}
                </Box>

                {/* Enhanced elevation statistics */}
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: darkMode
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.05)",
                    borderRadius: 2,
                  }}
                >
                  <Grid container spacing={2}>
                    {/* High Point */}
                    {elevationStats.highPoint && (
                      <Grid item xs={6}>
                        <Paper
                          sx={{
                            p: 1.5,
                            bgcolor: "rgba(76, 175, 80, 0.1)",
                            borderRadius: 2,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: "bold", color: "success.main" }}
                          >
                            🔺 HIGHEST POINT
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold" }}
                          >
                            {elevationStats.highPoint.elevation}m
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            At{" "}
                            {formatDistance(elevationStats.highPoint.distance)}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              fontFamily: "monospace",
                              fontSize: "0.65rem",
                            }}
                          >
                            {elevationStats.highPoint.lat.toFixed(4)},{" "}
                            {elevationStats.highPoint.lng.toFixed(4)}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}

                    {/* Low Point */}
                    {elevationStats.lowPoint && (
                      <Grid item xs={6}>
                        <Paper
                          sx={{
                            p: 1.5,
                            bgcolor: "rgba(33, 150, 243, 0.1)",
                            borderRadius: 2,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: "bold", color: "info.main" }}
                          >
                            🔻 LOWEST POINT
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold" }}
                          >
                            {elevationStats.lowPoint.elevation}m
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            At{" "}
                            {formatDistance(elevationStats.lowPoint.distance)}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              fontFamily: "monospace",
                              fontSize: "0.65rem",
                            }}
                          >
                            {elevationStats.lowPoint.lat.toFixed(4)},{" "}
                            {elevationStats.lowPoint.lng.toFixed(4)}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}

                    {/* Summary Stats */}
                    <Grid item xs={12}>
                      <Stack
                        direction="row"
                        spacing={2}
                        justifyContent="center"
                      >
                        <Chip
                          label={`Avg: ${elevationStats.avgElevation}m`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`Range: ${
                            elevationStats.maxElevation -
                            elevationStats.minElevation
                          }m`}
                          size="small"
                          variant="outlined"
                        />
                        {elevationStats.totalElevationGain > 0 && (
                          <Chip
                            label={`↗ Gain: ${elevationStats.totalElevationGain}m`}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        )}
                        {elevationStats.totalElevationLoss > 0 && (
                          <Chip
                            label={`↘ Loss: ${elevationStats.totalElevationLoss}m`}
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Save Distance Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
            color: "white",
            fontWeight: "bold",
          }}
        >
          💾 Save Distance Measurement
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            fullWidth
            label="Measurement Name"
            variant="outlined"
            value={measurementName}
            onChange={(e) => setMeasurementName(e.target.value)}
            placeholder={`Distance Measurement ${Date.now()}`}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setSaveDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmSaveDistance}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              background: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
              },
            }}
          >
            Save Measurement
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Polygon Dialog */}
      <Dialog
        open={polygonSaveDialogOpen}
        onClose={() => setPolygonSaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
            color: "white",
            fontWeight: "bold",
          }}
        >
          💾 Save Polygon Area
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            fullWidth
            label="Polygon Name"
            variant="outlined"
            value={polygonName}
            onChange={(e) => setPolygonName(e.target.value)}
            placeholder={`Polygon Area ${Date.now()}`}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setPolygonSaveDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmSavePolygon}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              background: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #7B1FA2 0%, #4A148C 100%)",
              },
            }}
          >
            Save Polygon
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bookmark Edit Dialog */}
      <Dialog
        open={bookmarkEditDialogOpen}
        onClose={() => setBookmarkEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
            color: "white",
            fontWeight: "bold",
          }}
        >
          🔖 Edit Bookmark
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            fullWidth
            label="Bookmark Name"
            variant="outlined"
            value={editedBookmarkName}
            onChange={(e) => setEditedBookmarkName(e.target.value)}
            placeholder="Enter bookmark name"
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setBookmarkEditDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveBookmarkEdit}
            variant="contained"
            disabled={!editedBookmarkName.trim()}
            sx={{
              borderRadius: 2,
              px: 3,
              background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)",
              },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bookmark Delete Confirmation Dialog */}
      <Dialog
        open={bookmarkDeleteDialogOpen}
        onClose={() => setBookmarkDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
            color: "white",
            fontWeight: "bold",
          }}
        >
          🗑️ Delete Bookmark
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this bookmark?
          </Typography>
          {bookmarkToDelete && (
            <Paper
              sx={{ p: 2, bgcolor: "rgba(244, 67, 54, 0.1)", borderRadius: 2 }}
            >
              <Typography
                variant="h6"
                color="primary"
                sx={{ fontWeight: "bold" }}
              >
                {bookmarkToDelete.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {bookmarkToDelete.coords.lat.toFixed(6)}°,{" "}
                {bookmarkToDelete.coords.lng.toFixed(6)}°
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Created: {bookmarkToDelete.timestamp}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setBookmarkDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteBookmark}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)",
              },
            }}
          >
            Delete Bookmark
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unified Saved Data Dialog */}
      <Dialog
        open={allSavedDataDialogOpen}
        onClose={() => setAllSavedDataDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
            color: "white",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Visibility sx={{ mr: 1 }} />
            📊 View All Saved Data
          </Box>
          <Chip
            label={`${
              savedMeasurements.length +
              savedPolygons.length +
              savedElevationData.length
            } Items`}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontSize: "0.7rem",
            }}
          />
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 2 }}>
            {/* Filter Tabs */}
            <ToggleButtonGroup
              value={savedDataFilter}
              exclusive
              onChange={(e, newFilter) => {
                if (newFilter) setSavedDataFilter(newFilter);
              }}
              size="small"
              fullWidth
              sx={{ mb: 2 }}
            >
              <ToggleButton value="all" sx={{ px: 2, py: 1 }}>
                📊 All Data (
                {savedMeasurements.length +
                  savedPolygons.length +
                  savedElevationData.length}
                )
              </ToggleButton>
              <ToggleButton value="distance" sx={{ px: 2, py: 1 }}>
                📏 Distance ({savedMeasurements.length})
              </ToggleButton>
              <ToggleButton value="polygon" sx={{ px: 2, py: 1 }}>
                🔷 Polygon ({savedPolygons.length})
              </ToggleButton>
              <ToggleButton value="elevation" sx={{ px: 2, py: 1 }}>
                🏔️ Elevation ({savedElevationData.length})
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Data Display */}
            <Box sx={{ maxHeight: 400, overflow: "auto" }}>
              {/* Distance Measurements */}
              {(savedDataFilter === "all" ||
                savedDataFilter === "distance") && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 1, color: "primary.main" }}
                  >
                    📏 Distance Measurements
                  </Typography>
                  {savedMeasurements.length === 0 ? (
                    <Paper sx={{ p: 2, bgcolor: "rgba(0,0,0,0.05)" }}>
                      <Typography color="text.secondary">
                        No distance measurements saved
                      </Typography>
                    </Paper>
                  ) : (
                    savedMeasurements.map((measurement, index) => (
                      <Paper
                        key={measurement.key}
                        variant="outlined"
                        sx={{ p: 2, mb: 1 }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {measurement.name || `Distance ${index + 1}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Distance: {measurement.distance || "N/A"} |
                              Points: {measurement.points?.length || 0}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Saved: {measurement.date || "Unknown"}
                            </Typography>
                          </Box>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleViewSavedData({
                                  ...measurement,
                                  type: "distance",
                                })
                              }
                              color="primary"
                              title="Load measurement onto map"
                            >
                              <Visibility />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleDeleteConfirmation({
                                  ...measurement,
                                  type: "distance",
                                })
                              }
                              color="error"
                              title="Delete measurement"
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                      </Paper>
                    ))
                  )}
                </Box>
              )}

              {/* Polygon Data */}
              {(savedDataFilter === "all" || savedDataFilter === "polygon") && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 1, color: "secondary.main" }}
                  >
                    🔷 Polygon Areas
                  </Typography>
                  {savedPolygons.length === 0 ? (
                    <Paper sx={{ p: 2, bgcolor: "rgba(0,0,0,0.05)" }}>
                      <Typography color="text.secondary">
                        No polygon areas saved
                      </Typography>
                    </Paper>
                  ) : (
                    savedPolygons.map((polygon, index) => (
                      <Paper
                        key={polygon.key}
                        variant="outlined"
                        sx={{ p: 2, mb: 1 }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {polygon.name || `Polygon ${index + 1}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Area: {polygon.area || "N/A"} | Points:{" "}
                              {polygon.points?.length || 0}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Saved: {polygon.date || "Unknown"}
                            </Typography>
                          </Box>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleViewSavedData({
                                  ...polygon,
                                  type: "polygon",
                                })
                              }
                              color="primary"
                              title="Load polygon onto map"
                            >
                              <Visibility />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleDeleteConfirmation({
                                  ...polygon,
                                  type: "polygon",
                                })
                              }
                              color="error"
                              title="Delete polygon"
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                      </Paper>
                    ))
                  )}
                </Box>
              )}

              {/* Elevation Data */}
              {(savedDataFilter === "all" ||
                savedDataFilter === "elevation") && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 1, color: "warning.main" }}
                  >
                    🏔️ Elevation Profiles
                  </Typography>
                  {savedElevationData.length === 0 ? (
                    <Paper sx={{ p: 2, bgcolor: "rgba(0,0,0,0.05)" }}>
                      <Typography color="text.secondary">
                        No elevation profiles saved
                      </Typography>
                    </Paper>
                  ) : (
                    savedElevationData.map((elevation, index) => (
                      <Paper
                        key={elevation.key}
                        variant="outlined"
                        sx={{ p: 2, mb: 1 }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {elevation.name || `Elevation ${index + 1}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Max: {elevation.maxElevation || "N/A"}m | Min:{" "}
                              {elevation.minElevation || "N/A"}m
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Saved: {elevation.date || "Unknown"}
                            </Typography>
                          </Box>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleViewSavedData({
                                  ...elevation,
                                  type: "elevation",
                                })
                              }
                              title="Load elevation profile"
                              color="primary"
                            >
                              <Visibility />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleDeleteConfirmation({
                                  ...elevation,
                                  type: "elevation",
                                })
                              }
                              color="error"
                              title="Delete elevation profile"
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                      </Paper>
                    ))
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setAllSavedDataDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Close
          </Button>
          <Button
            onClick={() => {
              loadAllSavedData();
              addLog("🔄 Refreshed saved data");
            }}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)",
              },
            }}
          >
            Refresh Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* Elevation Save Dialog */}
      <Dialog
        open={elevationSaveDialogOpen}
        onClose={() => setElevationSaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
            color: "white",
            fontWeight: "bold",
          }}
        >
          🏔️ Save Elevation Profile
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            fullWidth
            label="Elevation Profile Name"
            variant="outlined"
            value={elevationName}
            onChange={(e) => setElevationName(e.target.value)}
            placeholder={`Elevation Profile ${Date.now()}`}
            sx={{ mb: 2 }}
          />
          {elevationStats.distance > 0 && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "rgba(255, 152, 0, 0.1)",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                Profile Summary:
              </Typography>
              <Typography variant="body2">
                Distance: {formatDistance(elevationStats.distance)}
              </Typography>
              <Typography variant="body2">
                Elevation Range: {elevationStats.minElevation}m -{" "}
                {elevationStats.maxElevation}m
              </Typography>
              <Typography variant="body2">
                Average Elevation: {elevationStats.avgElevation}m
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setElevationSaveDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={saveElevationProfile}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #F57C00 0%, #E65100 100%)",
              },
            }}
          >
            Save Profile
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
            color: "white",
            fontWeight: "bold",
          }}
        >
          🗑️ Confirm Deletion
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this {itemToDelete?.type}?
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", color: "text.primary" }}
          >
            {itemToDelete?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 2,
              px: 3,
              background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #d32f2f 0%, #c62828 100%)",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GISProfessionalDashboard;
