import { useState, useEffect, useRef } from "react";
import {
  Box,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Stack,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export default function ProfileMenu({ user, loginTime, handleLogout }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [elapsed, setElapsed] = useState("00:00:00");
  const intervalRef = useRef(null);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Calculate elapsed time
  const computeElapsed = () => {
    if (!loginTime) return;
    const start = new Date(loginTime);
    const now = new Date();
    const diff = Math.floor((now - start) / 1000);
    const hrs = String(Math.floor(diff / 3600)).padStart(2, "0");
    const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
    const secs = String(diff % 60).padStart(2, "0");
    setElapsed(`${hrs}:${mins}:${secs}`);
  };

  useEffect(() => {
    if (!user) return;

    computeElapsed(); // initialize immediately
    intervalRef.current = setInterval(computeElapsed, 1000);

    const handleVisibilityChange = () => {
      clearInterval(intervalRef.current);
      if (!document.hidden)
        intervalRef.current = setInterval(computeElapsed, 1000);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, loginTime]);

  const formattedDate = loginTime
    ? new Date(loginTime).toLocaleDateString("en-GB")
    : "";

  return (
    <Box display="flex" alignItems="center" gap={2} ml="auto">
      <Box textAlign="right">
        <Typography variant="body2" fontWeight="bold">
          {user?.username || "User"}
        </Typography>
        <Typography variant="caption">
          Login since {formattedDate} {elapsed}
        </Typography>
      </Box>
      <Avatar
        sx={{ bgcolor: "white", color: "#0078D7", cursor: "pointer" }}
        onClick={handleMenuOpen}
      >
        {user?.username?.[0]?.toUpperCase() || "U"}
      </Avatar>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 280,
            maxWidth: 350,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Profile Info */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              {user?.username?.[0]?.toUpperCase() || "U"}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight="600">
                {user?.username || "User"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role || "Unknown Role"}
              </Typography>
            </Box>
          </Box>
          
          {/* Login Time Info */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Login: {formattedDate} • {elapsed}
          </Typography>
          
          {/* Assigned Regions */}
          {user?.regions && user.regions.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <LocationOnIcon fontSize="small" />
                Assigned Regions:
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ maxHeight: 80, overflowY: 'auto' }}>
                {user.regions.map((region, index) => (
                  <Chip
                    key={region.id || index}
                    label={region.name || region}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.75rem',
                      height: 24,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Box>
        
        <Divider />
        
        {/* Profile Actions */}
        <MenuItem
          sx={{
            py: 1.5,
            borderRadius: 0,
            '&:hover': {
              backgroundColor: 'action.hover',
            }
          }}
          disabled
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" color="action" />
          </ListItemIcon>
          <ListItemText 
            primary="Profile Settings" 
            secondary="Coming soon"
            secondaryTypographyProps={{ fontSize: '0.75rem' }}
          />
        </MenuItem>
        
        <Divider />
        
        {/* Logout */}
        <MenuItem
          onClick={() => {
            handleMenuClose();
            handleLogout();
          }}
          sx={{
            py: 1.5,
            color: "error.main",
            fontWeight: "600",
            borderRadius: 0,
            "&:hover": { 
              backgroundColor: "error.light", 
              color: "white",
              '& .MuiListItemIcon-root': {
                color: 'white'
              }
            },
          }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
    </Box>
  );
}
