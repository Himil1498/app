// components/gis/dashboard/components/GISMapContainer.jsx
import { Box, Typography } from '@mui/material';

/**
 * GIS Map Container Component
 * TODO: Implement Google Maps integration from original component
 */
const GISMapContainer = ({
  sx,
  center,
  zoom,
  baseMap,
  showIndiaBoundary,
  activeTool,
  toolsState,
  onMapClick,
  onCoordinatesChange,
  canAccessCoordinate,
  onRestrictedAccess
}) => {
  return (
    <Box
      sx={{
        ...sx,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        mt: '64px', // Account for navbar height
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" color="text.secondary">
          🗺️ Google Maps Integration
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Map Container Placeholder
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Base Map: {baseMap} | Tool: {activeTool}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Center: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
        </Typography>
        {/* TODO: Implement Google Maps with WorkingMeasurementMap functionality */}
      </Box>
    </Box>
  );
};

export default GISMapContainer;