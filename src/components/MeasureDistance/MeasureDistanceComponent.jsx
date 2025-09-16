import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  IconButton,
  Alert,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Straighten,
  PlayArrow,
  Stop,
  Clear,
  Info,
  Timeline,
  MyLocation,
  Save,
  Refresh,
} from '@mui/icons-material';
import useGoogleMapsWithMeasurement from '../../hooks/useGoogleMapsWithMeasurement';
import { formatDistance } from '../../utils/measurementUtils';

/**
 * Dedicated component for distance measurement functionality
 */
const MeasureDistanceComponent = ({ 
  onNotification,
  center = { lat: 20.5937, lng: 78.9629 },
  zoom = 5 
}) => {
  const theme = useTheme();
  const [measurements, setMeasurements] = useState([]);
  const [segmentDistances, setSegmentDistances] = useState([]);

  // Use enhanced map hook
  const {
    map,
    loaded,
    error,
    isScriptLoaded,
    mapRef,
    initializeMap,
    measurementActive,
    measurementPoints,
    totalDistance,
    formattedDistance,
    startMeasurement,
    stopMeasurement,
    clearMeasurements,
    toggleMeasurement,
  } = useGoogleMapsWithMeasurement({
    center,
    zoom,
    onMapLoad: (mapInstance) => {
      console.log('✅ Map loaded in MeasureDistance component');
      onNotification?.('Map loaded successfully', 'success');
    },
    onMeasurementStart: () => {
      console.log('📏 Measurement started');
      onNotification?.('Click on map to start measuring', 'info');
      setSegmentDistances([]);
    },
    onMeasurementComplete: (distance, points) => {
      console.log('✅ Measurement completed:', { distance, points });
      onNotification?.(`Measurement complete: ${formatDistance(distance)}`, 'success');
      
      // Save measurement
      const newMeasurement = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        totalDistance: distance,
        formattedDistance: formatDistance(distance),
        points,
        segmentCount: points.length - 1
      };
      
      setMeasurements(prev => [newMeasurement, ...prev].slice(0, 10)); // Keep last 10
    },
    onPointAdded: (data) => {
      console.log('📍 Point added:', data);
      
      if (data.pointCount > 1) {
        // Calculate segment distance for the latest segment
        const segmentDistance = data.totalDistance - (segmentDistances.reduce((sum, seg) => sum + seg.distance, 0));
        
        setSegmentDistances(prev => [
          ...prev,
          {
            id: data.pointCount - 1,
            from: data.pointCount - 1,
            to: data.pointCount,
            distance: segmentDistance,
            formattedDistance: formatDistance(segmentDistance),
            totalDistance: data.totalDistance,
            formattedTotalDistance: data.formattedDistance
          }
        ]);
      }
      
      onNotification?.(`Point ${data.pointCount} added`, 'info');
    },
    onError: (errorMsg) => {
      console.error('❌ Measurement error:', errorMsg);
      onNotification?.(errorMsg, 'error');
    }
  });

  // Initialize map when container is ready
  useEffect(() => {
    if (isScriptLoaded && mapRef.current && !map) {
      console.log('🔄 Initializing map in measurement component...');
      initializeMap(mapRef.current);
    }
  }, [isScriptLoaded, mapRef, map, initializeMap]);

  // Handle measurement controls
  const handleStartMeasurement = () => {
    const success = startMeasurement();
    if (!success) {
      onNotification?.('Failed to start measurement. Please try again.', 'error');
    }
  };

  const handleStopMeasurement = () => {
    stopMeasurement();
    onNotification?.('Measurement stopped', 'info');
  };

  const handleClearMeasurements = () => {
    clearMeasurements();
    setSegmentDistances([]);
    onNotification?.('Measurements cleared', 'info');
  };

  const handleToggleMeasurement = () => {
    toggleMeasurement();
  };

  // Handle saving measurement
  const handleSaveMeasurement = () => {
    if (measurementPoints.length < 2) {
      onNotification?.('Need at least 2 points to save measurement', 'warning');
      return;
    }

    // This could be extended to save to localStorage or backend
    const measurementData = {
      points: measurementPoints,
      totalDistance,
      formattedDistance,
      segments: segmentDistances,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem(`measurement_${Date.now()}`, JSON.stringify(measurementData));
    onNotification?.('Measurement saved successfully', 'success');
  };

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Map Error</Typography>
          <Typography>{error}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Controls Panel */}
      <Card sx={{ m: 1, mb: 0 }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Straighten color="primary" />
              <Typography variant="h6">Distance Measurement</Typography>
              {measurementActive && (
                <Chip 
                  label="ACTIVE" 
                  color="success" 
                  size="small"
                  icon={<Timeline />}
                />
              )}
            </Box>
          }
          action={
            <Tooltip title="Measurement instructions">
              <IconButton size="small">
                <Info />
              </IconButton>
            </Tooltip>
          }
        />
        <CardContent sx={{ pt: 0 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button
              variant={measurementActive ? "outlined" : "contained"}
              color={measurementActive ? "error" : "primary"}
              startIcon={measurementActive ? <Stop /> : <PlayArrow />}
              onClick={handleToggleMeasurement}
              disabled={!loaded}
            >
              {measurementActive ? 'Stop' : 'Start'} Measurement
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={handleClearMeasurements}
              disabled={!loaded || measurementPoints.length === 0}
            >
              Clear
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Save />}
              onClick={handleSaveMeasurement}
              disabled={!loaded || measurementPoints.length < 2}
            >
              Save
            </Button>
          </Stack>

          {/* Current Measurement Display */}
          {measurementPoints.length > 0 && (
            <Box sx={{ 
              p: 2, 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: 1,
              mb: 2
            }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Points
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {measurementPoints.length}
                  </Typography>
                </Box>
                
                <Divider orientation="vertical" flexItem />
                
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Distance
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    {formattedDistance}
                  </Typography>
                </Box>
                
                {segmentDistances.length > 0 && (
                  <>
                    <Divider orientation="vertical" flexItem />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Segments
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {segmentDistances.length}
                      </Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </Box>
          )}

          {/* Instructions */}
          {!measurementActive && measurementPoints.length === 0 && (
            <Alert severity="info">
              Click "Start Measurement" and then click on the map to add measurement points. 
              Double-click to finish measuring.
            </Alert>
          )}

          {measurementActive && (
            <Alert severity="success">
              Click on the map to add measurement points. Double-click to finish.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Map Container */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <Box
          ref={mapRef}
          sx={{
            width: '100%',
            height: '100%',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
          }}
        />
        
        {!loaded && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.8)',
              zIndex: 1000,
            }}
          >
            <Typography>Loading map...</Typography>
          </Box>
        )}
      </Box>

      {/* Measurement Results */}
      {segmentDistances.length > 0 && (
        <Card sx={{ m: 1, mt: 0, maxHeight: '300px' }}>
          <CardHeader
            title="Measurement Segments"
            titleTypographyProps={{ variant: 'h6', fontSize: '1rem' }}
            action={
              <Tooltip title="Refresh segments">
                <IconButton size="small">
                  <Refresh />
                </IconButton>
              </Tooltip>
            }
          />
          <CardContent sx={{ pt: 0, maxHeight: '200px', overflow: 'auto' }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Segment</TableCell>
                    <TableCell align="right">Distance</TableCell>
                    <TableCell align="right">Cumulative</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {segmentDistances.map((segment, index) => (
                    <TableRow key={segment.id}>
                      <TableCell>
                        <Typography variant="body2">
                          Point {segment.from} → {segment.to}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {segment.formattedDistance}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="primary.main">
                          {segment.formattedTotalDistance}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default MeasureDistanceComponent;
