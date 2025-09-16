// components/common/GISToolWrapper.jsx
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Alert,
  Stack,
  Chip
} from '@mui/material';
import { 
  Lock, 
  LocationOff, 
  Warning,
  AdminPanelSettings,
  ContactSupport,
  Info
} from '@mui/icons-material';
import { selectUser } from '../../redux/slices/authSlice';
import { hasPermission, FEATURES } from '../../utils/permissions';
import { isCoordinateAccessible } from '../../utils/mapUtils';
import RegionAccessGuard from './RegionAccessGuard';

/**
 * GIS Tool Wrapper Component
 * Wraps GIS tools with region and feature-based access control
 */
const GISToolWrapper = ({ 
  children, 
  requiredFeature = null,
  toolName = 'GIS Tool',
  onAccessDenied,
  disableTools = true,
  showAccessInfo = true
}) => {
  const user = useSelector(selectUser);
  const [restrictedAccess, setRestrictedAccess] = useState(null);

  // Check if user has required feature permission
  const hasFeatureAccess = requiredFeature ? hasPermission(user, requiredFeature) : true;

  // Handle region access restriction
  const handleRestrictedAccess = (coordinates, regionName) => {
    setRestrictedAccess({ coordinates, regionName });
    
    if (onAccessDenied) {
      onAccessDenied('region', { coordinates, regionName });
    }
  };

  // Get feature display name
  const getFeatureDisplayName = (feature) => {
    const names = {
      [FEATURES.DISTANCE]: 'Distance Measurement',
      [FEATURES.POLYGON]: 'Polygon Drawing',
      [FEATURES.ELEVATION]: 'Elevation Profile',
      [FEATURES.INFRASTRUCTURE]: 'Infrastructure Management',
    };
    return names[feature] || feature;
  };

  // If user doesn't have feature access, show permission denied
  if (!hasFeatureAccess) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          p: 4,
          textAlign: 'center'
        }}
      >
        <Paper
          sx={{
            p: 4,
            maxWidth: 500,
            bgcolor: 'error.light',
            color: 'error.contrastText'
          }}
        >
          <Stack spacing={3} alignItems="center">
            <Lock sx={{ fontSize: 64, opacity: 0.7 }} />
            
            <Typography variant="h6" fontWeight={600}>
              Feature Access Restricted
            </Typography>
            
            <Typography variant="body1">
              You don't have permission to access{' '}
              <strong>{requiredFeature ? getFeatureDisplayName(requiredFeature) : toolName}</strong>.
            </Typography>
            
            <Alert severity="info" variant="outlined" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}>
              <Typography variant="body2">
                <strong>Your role:</strong> {user?.role || 'Unknown'}
                <br />
                <strong>Current access:</strong> {user?.regions?.map(r => r.name).join(', ') || 'No regions assigned'}
              </Typography>
            </Alert>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="info"
                startIcon={<ContactSupport />}
                onClick={() => window.location.href = '/dashboard'}
              >
                Contact Administrator
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.href = '/dashboard'}
                sx={{ color: 'inherit', borderColor: 'currentColor' }}
              >
                Back to Dashboard
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // User has feature access, wrap with region access guard
  return (
    <RegionAccessGuard
      onRestrictedAccess={handleRestrictedAccess}
      showWarnings={true}
    >
      {(guardProps) => (
        <Box sx={{ position: 'relative', height: '100%' }}>
          {/* Access Info Panel */}
          {showAccessInfo && (
            <Paper
              sx={{
                position: 'absolute',
                top: 10,
                left: 10,
                p: 1.5,
                zIndex: 1000,
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(4px)',
                boxShadow: 2,
                borderRadius: 2,
                minWidth: 200
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                Access Level
              </Typography>
              
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                {user?.isAdmin ? (
                  <Chip
                    icon={<AdminPanelSettings />}
                    label="Admin (Full Access)"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                ) : (
                  <Chip
                    icon={<Info />}
                    label={`${user?.regions?.length || 0} Region${user?.regions?.length !== 1 ? 's' : ''}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Stack>
              
              {!user?.isAdmin && user?.regions && user.regions.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {user.regions.map(r => r.name).join(', ')}
                </Typography>
              )}
            </Paper>
          )}

          {/* Tool Controls Overlay for Restricted Tools */}
          {disableTools && restrictedAccess && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                zIndex: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}
            >
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'error.main',
                  color: 'error.contrastText',
                  pointerEvents: 'all'
                }}
              >
                <LocationOff sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  Region Access Blocked
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Tools disabled for {restrictedAccess.regionName}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2, color: 'inherit', borderColor: 'currentColor' }}
                  onClick={() => setRestrictedAccess(null)}
                >
                  Acknowledge
                </Button>
              </Paper>
            </Box>
          )}

          {/* Render the actual GIS tool */}
          {typeof children === 'function' 
            ? children({ 
                ...guardProps, 
                toolDisabled: !!restrictedAccess && disableTools,
                restrictedAccess
              })
            : children
          }
        </Box>
      )}
    </RegionAccessGuard>
  );
};

export default GISToolWrapper;