// components/gis/dashboard/GISDashboard.jsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, useTheme } from '@mui/material';
import { selectUser } from '../../../redux/slices/authSlice';
import { hasPermission, FEATURES } from '../../../utils/permissions';
import GISToolWrapper from '../../common/GISToolWrapper';
import GISNavbar from './components/GISNavbar';
import GISSidebar from './components/GISSidebar';
import GISMapContainer from './components/GISMapContainer';
import GISToolsPanel from './components/GISToolsPanel';

/**
 * Modern GIS Dashboard Component
 * Replaces the massive 3,662-line GISProfessionalDashboard.jsx
 * Built with proper separation of concerns and access control
 */
const GISDashboard = () => {
  const theme = useTheme();
  const user = useSelector(selectUser);
  
  // Main application state
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [activeTool, setActiveTool] = useState('pan');
  const [selectedBaseMap, setSelectedBaseMap] = useState('satellite');
  const [showIndiaBoundary, setShowIndiaBoundary] = useState(false);
  const [loading, setLoading] = useState(true);

  // Map state
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [mapZoom, setMapZoom] = useState(6);
  const [currentCoordinates, setCurrentCoordinates] = useState(null);

  // Tools state
  const [toolsState, setToolsState] = useState({
    distance: {
      points: [],
      totalDistance: 0,
      isDrawing: false,
      savedMeasurements: []
    },
    polygon: {
      points: [],
      area: 0,
      isDrawing: false,
      savedPolygons: []
    },
    elevation: {
      markers: [],
      data: [],
      showChart: false,
      savedProfiles: []
    },
    infrastructure: {
      visible: true,
      markers: [],
      selectedType: 'all'
    }
  });

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      try {
        // Load any saved data, initialize maps, etc.
        // This would replace the massive useEffect in the original component
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      } catch (error) {
        console.error('Failed to initialize GIS Dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Check if user has access to GIS features
  const hasGISAccess = hasPermission(user, FEATURES.INFRASTRUCTURE) ||
                      hasPermission(user, FEATURES.DISTANCE) ||
                      hasPermission(user, FEATURES.POLYGON) ||
                      hasPermission(user, FEATURES.ELEVATION);

  // Handle tool selection
  const handleToolSelect = (tool) => {
    // Reset previous tool state
    setToolsState(prev => ({
      ...prev,
      distance: { ...prev.distance, isDrawing: false },
      polygon: { ...prev.polygon, isDrawing: false }
    }));
    
    setActiveTool(tool);
    
    // Tool-specific initialization
    switch (tool) {
      case 'distance':
        if (hasPermission(user, FEATURES.DISTANCE)) {
          setToolsState(prev => ({
            ...prev,
            distance: { ...prev.distance, isDrawing: true }
          }));
        }
        break;
      case 'polygon':
        if (hasPermission(user, FEATURES.POLYGON)) {
          setToolsState(prev => ({
            ...prev,
            polygon: { ...prev.polygon, isDrawing: true }
          }));
        }
        break;
      default:
        break;
    }
  };

  // Handle map interactions
  const handleMapClick = (coordinates) => {
    setCurrentCoordinates(coordinates);
    
    // Handle tool-specific map clicks
    switch (activeTool) {
      case 'distance':
        if (toolsState.distance.isDrawing && hasPermission(user, FEATURES.DISTANCE)) {
          setToolsState(prev => ({
            ...prev,
            distance: {
              ...prev.distance,
              points: [...prev.distance.points, coordinates]
            }
          }));
        }
        break;
      case 'polygon':
        if (toolsState.polygon.isDrawing && hasPermission(user, FEATURES.POLYGON)) {
          setToolsState(prev => ({
            ...prev,
            polygon: {
              ...prev.polygon,
              points: [...prev.polygon.points, coordinates]
            }
          }));
        }
        break;
      default:
        break;
    }
  };

  // Layout constants
  const sidebarWidth = leftSidebarOpen ? 280 : 0;
  const toolsPanelWidth = rightPanelOpen ? 320 : 0;

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          bgcolor: 'background.default'
        }}
      >
        Loading GIS Dashboard...
      </Box>
    );
  }

  return (
    <GISToolWrapper
      requiredFeature={null}
      toolName="GIS Professional Dashboard"
      showAccessInfo={false}
    >
      {({ canAccessCoordinate, onRestrictedAccess }) => (
        <Box
          sx={{
            display: 'flex',
            height: '100vh',
            bgcolor: 'background.default',
            overflow: 'hidden'
          }}
        >
          {/* Top Navigation */}
          <GISNavbar
            activeTool={activeTool}
            onToolSelect={handleToolSelect}
            leftSidebarOpen={leftSidebarOpen}
            onToggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
            rightPanelOpen={rightPanelOpen}
            onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
            selectedBaseMap={selectedBaseMap}
            onBaseMapChange={setSelectedBaseMap}
            showIndiaBoundary={showIndiaBoundary}
            onToggleIndiaBoundary={() => setShowIndiaBoundary(!showIndiaBoundary)}
          />

          {/* Left Sidebar - Tools */}
          <GISSidebar
            open={leftSidebarOpen}
            width={sidebarWidth}
            activeTool={activeTool}
            onToolSelect={handleToolSelect}
            toolsState={toolsState}
            onToolsStateChange={setToolsState}
          />

          {/* Main Map Container */}
          <GISMapContainer
            sx={{
              flex: 1,
              ml: `${sidebarWidth}px`,
              mr: `${toolsPanelWidth}px`,
              transition: theme.transitions.create(['margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }}
            center={mapCenter}
            zoom={mapZoom}
            baseMap={selectedBaseMap}
            showIndiaBoundary={showIndiaBoundary}
            activeTool={activeTool}
            toolsState={toolsState}
            onMapClick={handleMapClick}
            onCoordinatesChange={setCurrentCoordinates}
            canAccessCoordinate={canAccessCoordinate}
            onRestrictedAccess={onRestrictedAccess}
          />

          {/* Right Tools Panel */}
          <GISToolsPanel
            open={rightPanelOpen}
            width={toolsPanelWidth}
            activeTool={activeTool}
            toolsState={toolsState}
            onToolsStateChange={setToolsState}
            currentCoordinates={currentCoordinates}
          />
        </Box>
      )}
    </GISToolWrapper>
  );
};

export default GISDashboard;