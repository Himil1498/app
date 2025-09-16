# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a React-based Geographic Information System (GIS) application focused on providing measurement tools, infrastructure management, and map-based analysis capabilities. The application is built with Vite, React 18, and integrates heavily with Google Maps APIs for geospatial functionality.

## Essential Development Commands

### Development Server
```powershell
# Start development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Testing & Debugging
```powershell
# Access the simple map test component (for debugging map issues)
# After starting dev server, navigate to: http://localhost:5173/simpleMapTest

# Access the professional GIS dashboard
# Navigate to: http://localhost:5173/gisProfessionalDashboard

# Access the working measurement map
# Navigate to: http://localhost:5173/workingMap
```

### Environment Setup
```powershell
# Ensure .env file exists with required Google Maps API key
# Create .env file with:
VITE_GOOGLE_MAPS_KEY=AIzaSyAT5j5Zy8q4XSHLi1arcpkce8CNvbljbUQ
VITE_USE_MOCK=true

# For production, set VITE_USE_MOCK=false
```

## Application Architecture

### High-Level Structure

The application follows a role-based access pattern with the following main sections:
- **Authentication Layer**: Redux-based auth with localStorage persistence
- **Dashboard**: Role-based summary views and user activity tracking
- **Network Tools**: GIS measurement and analysis tools
- **Administration**: User management and system administration
- **Professional GIS Interface**: Advanced measurement and mapping capabilities

### Core Routing Structure

```
/ -> Login Page
/dashboard -> Main dashboard (protected)
/network -> Network tools and map access (protected)
/administration -> User management (protected)
/gisProfessionalDashboard -> Advanced GIS interface (protected)
/workingMap -> Working measurement map (protected)
/simpleMapTest -> Development/debugging map (protected)
```

### Component Architecture

#### 1. Authentication System
- **Location**: `src/redux/authSlice.js`
- **Features**: 
  - Mock authentication with fallback admin credentials
  - Role-based permissions (Admin, Manager, Normal User)
  - Region-based access control
  - Session persistence via localStorage

#### 2. Map Components Hierarchy
- **GISProfessionalDashboard.jsx**: Main professional interface with sidebar controls
- **WorkingMeasurementMap.jsx**: Core map component with measurement capabilities
- **AllTools.jsx**: Tool container with tabbed interface
- **MapNavigation.jsx**: Navigation between different map interfaces

#### 3. Custom Hooks Architecture
- **useIndiaBoundary.js**: India boundary checking and polygon management
- **useGoogleMapsWithMeasurement.js**: Google Maps integration with measurement tools
- **useGlobalMap.jsx**: Global map instance management with context
- **useMeasurement.js**: Distance and area measurement utilities
- **useRegionAccess.js**: Region-based access control

#### 4. Utility Functions
- **measurementUtils.js**: Haversine distance calculations and formatting
- **regionUtils.js**: Indian state/territory name normalization and mapping
- **auth.js**: Authentication helper functions
- **performance.js**: Performance monitoring utilities

### Key Technical Features

#### 1. Google Maps Integration
- **API Requirements**: Maps JavaScript API, Geometry Library, Places API
- **Measurement Capabilities**: 
  - Distance measurement with Haversine formula
  - Polygon area calculation with Shoelace formula
  - Real-time elevation profiles
  - Infrastructure overlay management

#### 2. Infrastructure Management
- **File Import Support**: KML, KMZ, CSV, XLSX with dynamic library loading
- **Marker Clustering**: Performance optimization for large datasets
- **Data Persistence**: localStorage with optional database integration
- **Boundary Validation**: India-specific geographical constraints

#### 3. Advanced Measurement Tools
- **Multi-segment Distance**: Click-based path measurement with segment analysis
- **Polygon Drawing**: Area calculation with perimeter measurement
- **Elevation Profiling**: Terrain analysis along measurement paths
- **Unit Conversion**: Metric/Imperial unit support

#### 4. State Management
- **Redux Toolkit**: Centralized auth state management
- **Local State**: Component-specific state for map interactions
- **Context API**: Global map instance sharing
- **localStorage**: Persistent user preferences and saved measurements

## Development Guidelines

### Working with Maps

#### Adding New Map Features
1. **For simple features**: Extend `WorkingMeasurementMap.jsx`
2. **For complex tools**: Create new components in `src/components/`
3. **For measurement utilities**: Add to `src/utils/measurementUtils.js`
4. **For map hooks**: Add to `src/hooks/` directory

#### Google Maps API Integration
```javascript
// Standard map initialization pattern
const { mapRef, map, loaded, error } = useGoogleMapWithIndia({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  libraries: ['drawing', 'geometry', 'places']
});

// Always check if map is loaded before operations
if (loaded && map) {
  // Perform map operations
}
```

#### Measurement Implementation Pattern
```javascript
// Use existing measurement hooks
const {
  points,
  totalDistance,
  isDrawing,
  startDrawing,
  stopDrawing,
  addPoint,
  clearPoints
} = useMeasurement(map);
```

### Authentication & Authorization

#### Role-Based Access
```javascript
// Check user permissions
const { user } = useSelector(state => state.auth);
const canAccess = user?.isAdmin || user?.regions?.includes(targetRegion);
```

#### Default Credentials (Development)
- **Admin**: username: "admin", password: "admin123"
- **Manager**: username: "manager1", password: "manager123"
- **User**: username: "user1", password: "user123"

### Working with Infrastructure Data

#### Adding Location Data
```javascript
// Manual location addition
const newLocation = {
  id: Date.now(),
  type: 'pop', // or 'sub'
  coordinates: { lat: 28.6139, lng: 77.2090 },
  address: 'Manual entry required',
  // ... other properties
};
```

#### File Import Support
- **KML/KMZ**: Automatic parsing with JSZip library
- **CSV**: Header detection with coordinate validation
- **XLSX**: SheetJS library integration
- **Template Downloads**: Built-in sample file generation

## Common Development Patterns

### Error Handling
```javascript
// Standard error handling pattern
try {
  const result = await performOperation();
  addLog(`✅ Operation successful: ${result}`);
  addNotification('Success message', 'success');
} catch (error) {
  console.error('❌ Operation failed:', error);
  addLog(`❌ Error: ${error.message}`);
  addNotification('Error message', 'error');
}
```

### Component State Management
```javascript
// Prefer controlled components with external state
const Component = ({ 
  isActive, 
  onActiveChange, 
  data, 
  onDataChange 
}) => {
  // Internal state only for UI-specific concerns
  const [loading, setLoading] = useState(false);
  
  // External state for data that needs to be shared
  const handleChange = (newData) => {
    onDataChange(newData);
  };
};
```

### Map Layer Management
```javascript
// Standard layer toggle pattern
const handleLayerToggle = (layerName) => {
  const newValue = !activeLayers[layerName];
  setActiveLayers(prev => ({
    ...prev,
    [layerName]: newValue
  }));
  
  // Apply to map
  if (layer && layer.setMap) {
    layer.setMap(newValue ? map : null);
  }
};
```

## Debugging Common Issues

### Map Loading Problems
1. **Check API Key**: Verify `VITE_GOOGLE_MAPS_KEY` in `.env`
2. **Console Errors**: Look for Google Maps API errors in browser console
3. **Test Component**: Use `/simpleMapTest` route for basic map functionality
4. **Network Issues**: Check if googleapis.com is accessible

### Measurement Issues
1. **Click Events**: Verify map click listeners are attached
2. **Polyline Visibility**: Check strokeWeight and strokeOpacity settings
3. **Coordinate Validation**: Ensure coordinates are within valid ranges
4. **Library Loading**: Verify geometry library is loaded

### Authentication Issues
1. **Clear Storage**: `localStorage.clear()` to reset authentication state
2. **Check Credentials**: Use default admin credentials for testing
3. **Session State**: Verify Redux state in browser dev tools

## Performance Considerations

### Map Optimization
- Use marker clustering for >100 markers
- Implement layer visibility controls to reduce DOM elements
- Lazy load external libraries (JSZip, SheetJS, MarkerClusterer)
- Clean up event listeners on component unmount

### Memory Management
```javascript
// Proper cleanup pattern
useEffect(() => {
  return () => {
    // Clean up map listeners
    if (map && window.google) {
      window.google.maps.event.clearInstanceListeners(map);
    }
    
    // Clean up custom objects
    markers.forEach(marker => marker.setMap(null));
    if (polyline) polyline.setMap(null);
  };
}, []);
```

### Bundle Size Optimization
- External libraries loaded via CDN when possible
- Dynamic imports for large features
- Tree shaking enabled in Vite configuration

## Testing Recommendations

### Map Functionality Testing
1. Test in `/simpleMapTest` for basic functionality
2. Verify measurement accuracy with known distances
3. Test file import with sample data files
4. Check performance with large datasets (>1000 markers)

### Cross-Browser Testing
- Chrome/Chromium (primary)
- Firefox
- Safari (check map rendering)
- Edge

### Mobile Responsiveness
- Test sidebar collapse/expand functionality
- Verify touch interactions on maps
- Check responsive layout breakpoints

## API Dependencies

### Google Maps Platform APIs
- **Maps JavaScript API**: Core map functionality
- **Places API**: Location search and geocoding
- **Geometry Library**: Distance and area calculations

### External Libraries (CDN)
- **MarkerClusterer**: `@googlemaps/markerclusterer`
- **JSZip**: KMZ file processing
- **SheetJS**: XLSX file processing
- **PapaParse**: CSV parsing (included in bundle)

## Deployment Notes

### Environment Variables
```
# Production .env file
VITE_GOOGLE_MAPS_KEY=your_production_api_key
VITE_USE_MOCK=false
VITE_API_BASE=https://your-api-domain.com
```

### Build Optimization
- Bundle size typically ~460kB gzipped
- Most external libraries loaded from CDN
- Tree shaking enabled for unused code elimination

### Security Considerations
- API keys should be restricted by domain in Google Cloud Console
- No sensitive data stored in localStorage
- HTTPS required for geolocation features

This documentation provides the foundation for productive development in this GIS application codebase.
