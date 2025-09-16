// components/gis/dashboard/components/GISNavbar.jsx
import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Settings,
  Map as MapIcon,
  Satellite,
  Terrain,
  PanTool,
  Timeline,
  Straighten,
  Business,
  TrendingUp,
  ViewSidebar,
  Public
} from '@mui/icons-material';
import { selectUser } from '../../../../redux/slices/authSlice';
import { hasPermission, FEATURES } from '../../../../utils/permissions';

/**
 * GIS Navigation Bar Component
 * Handles tool selection, map controls, and user interface
 */
const GISNavbar = ({
  activeTool,
  onToolSelect,
  leftSidebarOpen,
  onToggleLeftSidebar,
  rightPanelOpen,
  onToggleRightPanel,
  selectedBaseMap,
  onBaseMapChange,
  showIndiaBoundary,
  onToggleIndiaBoundary,
}) => {
  const user = useSelector(selectUser);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [baseMapMenuOpen, setBaseMapMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Available tools with permissions
  const tools = [
    {
      id: 'pan',
      icon: <PanTool />,
      label: 'Pan',
      permission: null, // Always available
      tooltip: 'Pan and navigate the map'
    },
    {
      id: 'distance',
      icon: <Straighten />,
      label: 'Distance',
      permission: FEATURES.DISTANCE,
      tooltip: 'Measure distances on the map'
    },
    {
      id: 'polygon',
      icon: <Timeline />,
      label: 'Polygon',
      permission: FEATURES.POLYGON,
      tooltip: 'Draw and measure polygon areas'
    },
    {
      id: 'elevation',
      icon: <TrendingUp />,
      label: 'Elevation',
      permission: FEATURES.ELEVATION,
      tooltip: 'Get elevation profiles'
    },
    {
      id: 'infrastructure',
      icon: <Business />,
      label: 'Infrastructure',
      permission: FEATURES.INFRASTRUCTURE,
      tooltip: 'Manage infrastructure data'
    }
  ];

  const availableTools = tools.filter(tool => 
    !tool.permission || hasPermission(user, tool.permission)
  );

  const baseMapOptions = [
    { id: 'satellite', icon: <Satellite />, label: 'Satellite' },
    { id: 'terrain', icon: <Terrain />, label: 'Terrain' },
    { id: 'roadmap', icon: <MapIcon />, label: 'Roadmap' }
  ];

  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget);
    setSettingsMenuOpen(true);
  };

  const handleBaseMapClick = (event) => {
    setAnchorEl(event.currentTarget);
    setBaseMapMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setSettingsMenuOpen(false);
    setBaseMapMenuOpen(false);
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: 1,
        borderBottom: '1px solid',
        borderBottomColor: 'divider'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
        {/* Left Section - Menu and Tools */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={onToggleLeftSidebar}
            color="primary"
            size="small"
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" fontWeight="bold" sx={{ mr: 2 }}>
            GIS Professional
          </Typography>

          {/* Tool Selection */}
          <ToggleButtonGroup
            value={activeTool}
            exclusive
            onChange={(e, newTool) => newTool && onToolSelect(newTool)}
            size="small"
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            {availableTools.map((tool) => (
              <ToggleButton
                key={tool.id}
                value={tool.id}
                sx={{ px: 2 }}
                disabled={tool.permission && !hasPermission(user, tool.permission)}
              >
                <Tooltip title={tool.tooltip}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {tool.icon}
                    <Typography variant="caption" sx={{ display: { xs: 'none', lg: 'block' } }}>
                      {tool.label}
                    </Typography>
                  </Box>
                </Tooltip>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Right Section - Controls and Settings */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* User Access Level Indicator */}
          <Chip
            size="small"
            label={user?.isAdmin ? 'Admin' : `${user?.regions?.length || 0} Regions`}
            color={user?.isAdmin ? 'success' : 'primary'}
            variant="outlined"
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          />

          {/* Base Map Selector */}
          <IconButton
            onClick={handleBaseMapClick}
            color="primary"
            size="small"
          >
            {baseMapOptions.find(option => option.id === selectedBaseMap)?.icon || <Satellite />}
          </IconButton>

          {/* India Boundary Toggle */}
          <Tooltip title="Toggle India boundary">
            <IconButton
              onClick={onToggleIndiaBoundary}
              color={showIndiaBoundary ? 'primary' : 'default'}
              size="small"
            >
              <Public />
            </IconButton>
          </Tooltip>

          {/* Right Panel Toggle */}
          <IconButton
            onClick={onToggleRightPanel}
            color={rightPanelOpen ? 'primary' : 'default'}
            size="small"
          >
            <ViewSidebar />
          </IconButton>

          {/* Settings */}
          <IconButton
            onClick={handleSettingsClick}
            color="primary"
            size="small"
          >
            <Settings />
          </IconButton>
        </Box>

        {/* Base Map Menu */}
        <Menu
          anchorEl={anchorEl}
          open={baseMapMenuOpen}
          onClose={handleCloseMenu}
          PaperProps={{
            sx: { minWidth: 150 }
          }}
        >
          {baseMapOptions.map((option) => (
            <MenuItem
              key={option.id}
              selected={selectedBaseMap === option.id}
              onClick={() => {
                onBaseMapChange(option.id);
                handleCloseMenu();
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {option.icon}
                {option.label}
              </Box>
            </MenuItem>
          ))}
        </Menu>

        {/* Settings Menu */}
        <Menu
          anchorEl={anchorEl}
          open={settingsMenuOpen}
          onClose={handleCloseMenu}
          PaperProps={{
            sx: { minWidth: 200 }
          }}
        >
          <MenuItem>
            <FormControlLabel
              control={
                <Switch
                  checked={showIndiaBoundary}
                  onChange={(e) => onToggleIndiaBoundary()}
                  size="small"
                />
              }
              label="Show India Boundary"
            />
          </MenuItem>
          <Divider />
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary">
              User: {user?.username || 'Unknown'}
            </Typography>
          </MenuItem>
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary">
              Role: {user?.role || 'Unknown'}
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default GISNavbar;