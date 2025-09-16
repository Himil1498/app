// components/gis/dashboard/components/GISSidebar.jsx
import { Drawer, Box, Typography } from '@mui/material';

/**
 * GIS Sidebar Component - Tools and Navigation
 * TODO: Implement full sidebar functionality from original component
 */
const GISSidebar = ({ open, width, activeTool, onToolSelect, toolsState, onToolsStateChange }) => {
  return (
    <Drawer
      variant="persistent"
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
        <Typography variant="h6">Tools Sidebar</Typography>
        <Typography variant="body2" color="text.secondary">
          Active Tool: {activeTool}
        </Typography>
        {/* TODO: Implement sidebar content */}
      </Box>
    </Drawer>
  );
};

export default GISSidebar;