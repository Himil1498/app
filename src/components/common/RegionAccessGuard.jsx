// components/common/RegionAccessGuard.jsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, 
  Alert, 
  AlertTitle, 
  Button, 
  Snackbar,
  IconButton,
  Typography,
  Paper
} from '@mui/material';
import { Close, LocationOff, Warning } from '@mui/icons-material';
import { selectUser } from '../../redux/slices/authSlice';
import { isCoordinateAccessible, getRegionForCoordinates } from '../../utils/mapUtils';
import { canAccessRegion } from '../../utils/permissions';

/**
 * Region Access Guard Component
 * Monitors map interactions and prevents access to restricted regions
 */
const RegionAccessGuard = ({ 
  children, 
  onRestrictedAccess,
  restrictedCoordinates = null,
  showWarnings = true 
}) => {
  const user = useSelector(selectUser);
  const [warningOpen, setWarningOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [blockedRegion, setBlockedRegion] = useState('');

  // Check if user can access specific coordinates
  const checkCoordinateAccess = (coordinates) => {
    if (!user || !coordinates) return false;
    return isCoordinateAccessible(coordinates, user);
  };

  // Handle restricted access attempt
  const handleRestrictedAccess = (coordinates, regionName = 'Unknown') => {
    const message = `❌ You do not have access to ${regionName}. Contact your administrator for access.`;
    setWarningMessage(message);
    setBlockedRegion(regionName);
    setWarningOpen(true);
    
    if (onRestrictedAccess) {
      onRestrictedAccess(coordinates, regionName);
    }
  };

  // Monitor for restricted coordinate access
  useEffect(() => {
    if (restrictedCoordinates && !checkCoordinateAccess(restrictedCoordinates)) {
      const regionName = getRegionForCoordinates(restrictedCoordinates) || 'this region';
      handleRestrictedAccess(restrictedCoordinates, regionName);
    }
  }, [restrictedCoordinates, user]);

  // Close warning
  const handleCloseWarning = () => {
    setWarningOpen(false);
  };

  // Get user's accessible regions display
  const getUserRegionsDisplay = () => {
    if (!user) return 'No access';
    if (user.isAdmin) return 'All regions (Admin)';
    if (!user.regions || user.regions.length === 0) return 'No regions assigned';
    
    const regionNames = user.regions.map(r => r.name || r.id).join(', ');
    return regionNames.length > 50 ? regionNames.substring(0, 47) + '...' : regionNames;
  };

  // Enhanced props for children components
  const enhancedProps = {
    user,
    canAccessCoordinate: checkCoordinateAccess,
    onRestrictedAccess: handleRestrictedAccess,
    userRegions: user?.regions || [],
    isAdmin: user?.isAdmin || false,
    accessibleRegions: getUserRegionsDisplay(),
  };

  return (
    <>
      {/* Render children with enhanced props */}
      {typeof children === 'function' ? children(enhancedProps) : children}

      {/* Region Access Warning Snackbar */}
      {showWarnings && (
        <Snackbar
          open={warningOpen}
          onClose={handleCloseWarning}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ top: { xs: 90, sm: 100 } }}
        >
          <Alert
            severity="error"
            variant="filled"
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleCloseWarning}
              >
                <Close fontSize="small" />
              </IconButton>
            }
            icon={<LocationOff />}
            sx={{ 
              minWidth: 350,
              '& .MuiAlert-message': {
                fontSize: '0.9rem',
                fontWeight: 500
              }
            }}
          >
            <AlertTitle sx={{ fontWeight: 600, mb: 1 }}>
              Region Access Restricted
            </AlertTitle>
            {warningMessage}
            <Box sx={{ mt: 1, fontSize: '0.8rem', opacity: 0.9 }}>
              Your access: {getUserRegionsDisplay()}
            </Box>
          </Alert>
        </Snackbar>
      )}

      {/* Persistent Access Info Panel (for debugging/development) */}
      {process.env.NODE_ENV === 'development' && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            p: 2,
            maxWidth: 300,
            bgcolor: 'background.paper',
            boxShadow: 3,
            zIndex: 1000,
            opacity: 0.8,
            '&:hover': { opacity: 1 }
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
            Region Access Debug
          </Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>
            User: {user?.username || 'None'}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>
            Role: {user?.role || 'None'}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>
            Access: {getUserRegionsDisplay()}
          </Typography>
        </Paper>
      )}
    </>
  );
};

export default RegionAccessGuard;