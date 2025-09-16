// components/common/withRegionAccess.jsx
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Alert, AlertTitle, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { selectUser } from '../../redux/slices/authSlice';
import { 
  selectAutoZoomEnabled, 
  selectHasAutoZoomed,
  setAccessibleRegions,
  setAutoZoomCompleted,
  setMapCenter
} from '../../redux/slices/regionSlice';
import { getMapConfigForUser, isCoordinateAccessible } from '../../utils/mapUtils';
import { hasPermission } from '../../utils/permissions';

/**
 * Higher-Order Component for region-based access control and auto-zoom
 * @param {React.Component} WrappedComponent - Component to wrap
 * @param {Object} options - Configuration options
 */
const withRegionAccess = (WrappedComponent, options = {}) => {
  const {
    requiredFeature = null,
    requiresGISAccess = false,
    enableAutoZoom = true,
    allowGlobalAccess = false, // Allow admin to access without region restrictions
  } = options;

  const WithRegionAccessComponent = (props) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const user = useSelector(selectUser);
    const autoZoomEnabled = useSelector(selectAutoZoomEnabled);
    const hasAutoZoomed = useSelector(selectHasAutoZoomed);

    // Check permissions on mount and user change
    useEffect(() => {
      if (!user) return;

      // Update accessible regions in Redux
      dispatch(setAccessibleRegions(user.regions || []));

      // Auto-zoom to user's regions if enabled and not already done
      if (enableAutoZoom && autoZoomEnabled && !hasAutoZoomed && user.regions) {
        const mapConfig = getMapConfigForUser(user);
        
        if (mapConfig.shouldFitBounds && mapConfig.bounds) {
          // Dispatch action to set map bounds
          dispatch(setMapCenter({
            lat: mapConfig.center.lat,
            lng: mapConfig.center.lng,
            zoom: mapConfig.zoom
          }));
        }
        
        // Mark auto-zoom as completed
        setTimeout(() => {
          dispatch(setAutoZoomCompleted());
        }, 2000); // Wait for map to settle
      }
    }, [user, dispatch, enableAutoZoom, autoZoomEnabled, hasAutoZoomed]);

    // Access validation
    const validateAccess = () => {
      if (!user) return { allowed: false, reason: 'User not authenticated' };

      // Check feature permission
      if (requiredFeature && !hasPermission(user, requiredFeature)) {
        return { 
          allowed: false, 
          reason: `You don't have permission to access ${requiredFeature} feature. Contact your administrator.`,
          featureRestricted: true
        };
      }

      // Check if user has any GIS access for GIS-required components
      if (requiresGISAccess) {
        const hasAnyGISAccess = ['distance', 'polygon', 'elevation', 'infrastructure']
          .some(feature => hasPermission(user, feature));
        
        if (!hasAnyGISAccess) {
          return { 
            allowed: false, 
            reason: 'You don\'t have access to any GIS features. Contact your administrator.',
            featureRestricted: true
          };
        }
      }

      // Check region access
      if (!allowGlobalAccess && !user.isAdmin && (!user.regions || user.regions.length === 0)) {
        return { 
          allowed: false, 
          reason: 'No regions assigned to your account. Contact your administrator.',
          regionRestricted: true
        };
      }

      return { allowed: true, reason: null };
    };

    const accessValidation = validateAccess();

    // Render access denied message if validation fails
    if (!accessValidation.allowed) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
          p={3}
        >
          <Alert 
            severity="warning" 
            sx={{ 
              maxWidth: 500,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <AlertTitle>
              {accessValidation.featureRestricted ? 'Feature Access Restricted' :
               accessValidation.regionRestricted ? 'No Regions Assigned' :
               'Access Denied'}
            </AlertTitle>
            {accessValidation.reason}
            <Box mt={2}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/dashboard')}
                sx={{ mr: 1 }}
              >
                Go to Dashboard
              </Button>
              {user?.isAdmin && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/administration')}
                >
                  Manage Users
                </Button>
              )}
            </Box>
          </Alert>
        </Box>
      );
    }

    // Enhanced props for the wrapped component
    const enhancedProps = {
      ...props,
      user,
      userRegions: user?.regions || [],
      isAdmin: user?.isAdmin || false,
      mapConfig: getMapConfigForUser(user),
      canAccessCoordinate: (coordinates) => isCoordinateAccessible(coordinates, user),
      hasFeaturePermission: (feature) => hasPermission(user, feature),
    };

    return <WrappedComponent {...enhancedProps} />;
  };

  // Set display name for debugging
  WithRegionAccessComponent.displayName = `withRegionAccess(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithRegionAccessComponent;
};

export default withRegionAccess;