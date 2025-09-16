// components/gis/dashboard/components/GISToolsPanel.jsx
import { Drawer, Box, Typography } from '@mui/material';

/**
 * GIS Tools Panel Component - Right side panel for tool controls
 * TODO: Implement tool-specific controls from original component
 */
const GISToolsPanel = ({
  open,
  width,
  activeTool,
  toolsState,
  onToolsStateChange,
  currentCoordinates
}) => {
  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={open}
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          top: '64px', // Account for navbar height
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Tools Panel</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Active Tool: {activeTool}
        </Typography>
        
        {currentCoordinates && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              Coordinates: {currentCoordinates.lat.toFixed(6)}, {currentCoordinates.lng.toFixed(6)}
            </Typography>
          </Box>
        )}
        
        {/* Distance Tool Controls */}
        {activeTool === 'distance' && (
          <Box>
            <Typography variant="subtitle2">Distance Measurement</Typography>
            <Typography variant="body2" color="text.secondary">
              Points: {toolsState.distance.points.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total: {toolsState.distance.totalDistance.toFixed(2)} km
            </Typography>
          </Box>
        )}

        {/* Polygon Tool Controls */}
        {activeTool === 'polygon' && (
          <Box>
            <Typography variant="subtitle2">Polygon Drawing</Typography>
            <Typography variant="body2" color="text.secondary">
              Points: {toolsState.polygon.points.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Area: {toolsState.polygon.area.toFixed(2)} km²
            </Typography>
          </Box>
        )}

        {/* TODO: Implement full tool controls from original component */}
      </Box>
    </Drawer>
  );
};

export default GISToolsPanel;