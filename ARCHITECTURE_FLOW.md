# GIS Application - Architecture Flow & Redux Implementation

## Application Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 USER ACCESS                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              LOGIN COMPONENT                                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   LeftImage     │    │   LoginBox      │    │  Form Validation │            │
│  │   Component     │    │   Component     │    │   & Submission   │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              REDUX STORE                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                         AUTH SLICE                                         │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │ │
│  │  │  login()        │  │  logout()       │  │ restoreSession()│            │ │
│  │  │  async thunk    │  │  async thunk    │  │  async thunk    │            │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘            │ │
│  │                                                                             │ │
│  │  State: { user, token, isAuthenticated, loading, error }                   │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌───────────���─────────────────────────────────────────────────────────────────┐ │
│  │                        REGION SLICE                                        │ │
│  │  State: { regions, selectedRegion, bounds, loading }                       │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                         USER SLICE                                         │ │
│  │  State: { users, selectedUser, loading, error }                            │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            API SERVICE LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                      DEVELOPMENT MODE                                      │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │ │
│  │  │  localStorage   │  │  Mock API       │  │  Fallback Users │            │ │
│  │  │  Operations     │  │  Responses      │  │  & Data         │            │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘            │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                      PRODUCTION MODE                                       │ │
│  │  ┌───���─────────────┐  ┌─────────────────┐  ┌─────────────────┐            │ │
│  │  │  HTTP Requests  │  │  JWT Tokens     │  │  Backend API    │            │ │
│  │  │  with Auth      │  │  & Headers      │  │  Integration    │            │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘            │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           ROUTE PROTECTION                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                      PROTECTED ROUTE                                       │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │ │
│  │  │ Authentication  │  │  Role Check     │  │ Region Access   │            │ │
│  │  │ Status Check    │  │ (Admin/Manager) │  │ Validation      │            │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘            │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└──────────────���──────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              LAYOUT SYSTEM                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                           LAYOUT                                           │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │ │
│  │  │    Navbar       │  │  MobileDrawer   │  │  ProfileMenu    │            │ │
│  │  │  ┌───────────┐  │  │                 │  │                 │            │ │
│  │  │  │   Logo    │  │  │                 │  │                 │            │ │
│  │  │  │ NavLinks  │  │  │                 │  │                 │            │ │
│  │  │  └───────────┘  │  │                 │  │                 │            │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘            │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           ROLE-BASED ROUTING                                   │
│                                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                │
│  │     ADMIN       │  │    MANAGER      │  │   NORMAL USER   │                │
│  │                 │  │                 │  │                 │                │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │                │
│  │ │Administration│ │  │ │  Network    │ │  │ │  Dashboard  │ │                │
│  │ │  Dashboard  │ │  │ │ Dashboard   │ │  │ │   (Basic)   │ │                │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │                │
│  │                 │  ��                 │  │                 │                │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │                │
│  │ │ User Mgmt   │ │  │ │ GIS Tools   │ │  │ │ Limited GIS │ │                │
│  │ │ Full Access │ │  │ │ Regional    │ │  │ │   Tools     │ │                │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │                │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────��───────────────────────┐
│                            GIS INTEGRATION                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                    GIS PROFESSIONAL DASHBOARD                              │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │ │
│  │  │  Google Maps    │  │  Measurement    │  │  Data Layers    │            │ │
│  │  │  Integration    │  │     Tools       │  │  & Overlays     │            │ │
│  │  │                 │  │                 │  │                 │            │ │
│  │  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │            │ │
│  │  │ │   Markers   │ │  │ │  Distance   │ │  │ │   GeoJSON   │ │            │ │
│  │  │ │ Clustering  │ │  │ │ Measurement │ │  │ │   Layers    │ │            │ │
│  │  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │            │ │
│  │  │                 │  │                 │  │                 │            │ │
│  │  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │            │ │
│  │  │ │  Drawing    │ │  │ │    Area     │ │  │ │Infrastructure│ │            │ │
│  │  │ │   Tools     │ │  │ │Calculation  │ │  │ │    Data     │ │            │ │
│  │  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │            │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘            │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Redux Implementation Details

### 1. Store Configuration

```javascript
// redux/store.js
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    auth: authReducer,      // Authentication state
    region: regionReducer,  // Region management
    user: userReducer,      // User management
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
```

### 2. Auth Slice Flow

```
User Login Request
        │
        ▼
┌─────────────────┐
│  login() thunk  │ ──────► API Service ──────► localStorage/Backend
└─────────────────┘                                      │
        │                                                │
        ▼                                                ▼
┌─────────────────┐                              ┌─────────────────┐
│ Pending State   │                              │ Success/Error   │
│ loading: true   │                              │   Response      │
└─────────────────┘                              └─────────────────┘
        │                                                │
        ▼                                                ▼
┌─────────────────┐                              ┌─────────────────┐
│ UI Loading      │                              │ State Update    │
│ Indicator       │                              │ user, token,    │
└─────────────────┘                              │ isAuthenticated │
                                                 └─────────────────┘
                                                         │
                                                         ▼
                                                 ┌─────────────────┐
                                                 │ Route Redirect  │
                                                 │ to Dashboard    │
                                                 └─────────────────┘
```

### 3. Authentication State Management

```javascript
// Initial State
const initialState = {
  user: null,                    // User object with role, permissions
  token: null,                   // JWT token or session token
  loginTime: null,               // Login timestamp
  isAuthenticated: false,        // Authentication status
  loading: false,                // Loading state for async operations
  error: null,                   // Error messages
  message: null,                 // Success messages
};

// State Updates
login.fulfilled: {
  user: action.payload.user,
  token: action.payload.token,
  loginTime: action.payload.loginTime,
  isAuthenticated: true,
  loading: false,
  message: "Login successful!"
}

logout.fulfilled: {
  user: null,
  token: null,
  loginTime: null,
  isAuthenticated: false,
  loading: false,
  message: "Logged out successfully"
}
```

### 4. Component Integration with Redux

```javascript
// Component using Redux state
import { useSelector, useDispatch } from 'react-redux';
import { login, selectAuth } from '../redux/slices/authSlice';

function LoginBox() {
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector(selectAuth);

  const handleLogin = async (credentials) => {
    const result = await dispatch(login(credentials));
    if (login.fulfilled.match(result)) {
      // Handle successful login
      navigate('/dashboard');
    }
  };

  return (
    // JSX with loading states and error handling
  );
}
```

## Package Dependencies Breakdown

### Core React Ecosystem
```json
{
  "react": "^18.3.1",           // Core React library
  "react-dom": "^18.3.1",       // React DOM rendering
  "react-router-dom": "^7.9.1"  // Client-side routing
}
```

### State Management
```json
{
  "@reduxjs/toolkit": "^2.9.0", // Modern Redux with utilities
  "react-redux": "^9.2.0"       // React bindings for Redux
}
```

### UI Component Libraries
```json
{
  "@chakra-ui/react": "^3.25.0",    // Chakra UI components
  "@mui/material": "^7.3.2",        // Material-UI components
  "@mui/icons-material": "^7.3.2",  // Material-UI icons
  "framer-motion": "^12.23.12",     // Animation library
  "lucide-react": "^0.542.0",       // Lucide icons
  "react-icons": "^5.5.0"           // Popular icon library
}
```

### GIS and Mapping
```json
{
  "@react-google-maps/api": "^2.20.7",      // Google Maps React wrapper
  "@googlemaps/markerclusterer": "^2.6.2"   // Marker clustering
}
```

### Data Visualization
```json
{
  "chart.js": "^4.5.0",              // Chart.js library
  "react-chartjs-2": "^5.3.0",       // React wrapper for Chart.js
  "apexcharts": "^5.3.4",            // ApexCharts library
  "react-apexcharts": "^1.7.0",      // React wrapper for ApexCharts
  "recharts": "^3.1.2"               // React charting library
}
```

### File Processing
```json
{
  "@tmcw/togeojson": "^7.1.2",  // KML/GPX to GeoJSON conversion
  "papaparse": "^5.5.3",        // CSV parsing
  "xlsx": "^0.18.5",            // Excel file processing
  "jszip": "^3.10.1",           // ZIP file handling
  "file-saver": "^2.0.5"        // File download utility
}
```

### Development Tools
```json
{
  "vite": "^7.1.2",              // Build tool and dev server
  "eslint": "^9.35.0",           // Code linting
  "tailwindcss": "^4.1.12",      // Utility-first CSS framework
  "autoprefixer": "^10.4.21"     // CSS vendor prefixing
}
```

## Authentication Flow Details

### 1. Login Process
```
User Input (username/password)
        │
        ▼
Form Validation
        │
        ▼
Redux Action Dispatch: login(credentials)
        │
        ▼
API Service Call
        │
        ├─── Development Mode ────► localStorage lookup
        │                           │
        │                           ▼
        │                    Validate credentials
        │                           │
        │                           ▼
        │                    Return user object + token
        │
        └─── Production Mode ─────► HTTP POST to /auth/login
                                    │
                                    ▼
                             Backend validation
                                    │
                                    ▼
                             JWT token generation
                                    │
                                    ▼
                             Return user + token
```

### 2. Session Management
```javascript
// Session Storage (Development)
localStorage.setItem("currentUser", JSON.stringify(userObj));
localStorage.setItem("token", token);
localStorage.setItem("loginTime", loginTime);

// Session Restoration
const restoreSession = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("currentUser");
  const loginTime = localStorage.getItem("loginTime");
  
  if (token && user && loginTime) {
    return { user: JSON.parse(user), token, loginTime };
  }
  throw new Error("No session found");
};
```

### 3. Route Protection
```javascript
// ProtectedRoute Component
function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, user } = useSelector(selectAuth);
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (requireAdmin && !user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}
```

### 4. Permission System
```javascript
// Permission Checking
const checkPermission = (user, permission) => {
  return user?.permissions?.[permission] || false;
};

// Usage in Components
const canMeasureDistance = checkPermission(user, 'distance');
const canManageUsers = checkPermission(user, 'userManagement');
```

This architecture provides a robust, scalable foundation for the GIS application with clear separation of concerns, proper state management, and comprehensive authentication and authorization systems.