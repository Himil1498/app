# Redux Implementation Guide - GIS Application

## Table of Contents
1. [Redux Architecture Overview](#redux-architecture-overview)
2. [Store Configuration](#store-configuration)
3. [Auth Slice Implementation](#auth-slice-implementation)
4. [Region Slice Implementation](#region-slice-implementation)
5. [User Slice Implementation](#user-slice-implementation)
6. [Async Thunks](#async-thunks)
7. [Selectors](#selectors)
8. [Component Integration](#component-integration)
9. [Best Practices](#best-practices)
10. [Testing Redux](#testing-redux)

## Redux Architecture Overview

The application uses **Redux Toolkit** for state management, which provides:
- Simplified store setup
- Immutable updates with Immer
- Built-in async handling with createAsyncThunk
- Integrated DevTools support

### State Structure
```javascript
{
  auth: {
    user: Object | null,
    token: string | null,
    loginTime: string | null,
    isAuthenticated: boolean,
    loading: boolean,
    error: string | null,
    message: string | null
  },
  region: {
    regions: Array,
    selectedRegion: Object | null,
    bounds: Array | null,
    loading: boolean,
    error: string | null
  },
  user: {
    users: Array,
    selectedUser: Object | null,
    loading: boolean,
    error: string | null,
    totalUsers: number,
    filters: Object
  }
}
```

## Store Configuration

### Basic Store Setup
```javascript
// redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import regionReducer from "./slices/regionSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    region: regionReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['persist/PERSIST'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Export types for TypeScript (if using TypeScript)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Provider Setup
```javascript
// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './redux/store';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
```

## Auth Slice Implementation

### Complete Auth Slice
```javascript
// redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/api";

// ---------------------------
// ASYNC THUNKS
// ---------------------------

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiService.login(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await apiService.logout();
      return { success: true };
    } catch (error) {
      // Even if API call fails, we should clear local session
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
      localStorage.removeItem("loginTime");
      return { success: true };
    }
  }
);

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.restoreSession();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await apiService.updateUser(auth.user.id, profileData);
      return response.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ---------------------------
// INITIAL STATE
// ---------------------------

const getInitialState = () => {
  // Clear any stored session data on app start to force fresh login
  localStorage.removeItem("currentUser");
  localStorage.removeItem("token");
  localStorage.removeItem("loginTime");
  
  return {
    user: null,
    token: null,
    loginTime: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    message: null,
    sessionExpiry: null,
  };
};

const initialState = getInitialState();

// ---------------------------
// AUTH SLICE
// ---------------------------

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Clear error and success messages
    clearMessages: (state) => {
      state.error = null;
      state.message = null;
    },

    // Update user profile (for admin updates)
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("currentUser", JSON.stringify(state.user));
      }
    },

    // Manual logout (without API call)
    logoutLocal: (state) => {
      state.user = null;
      state.token = null;
      state.loginTime = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.message = null;
      state.sessionExpiry = null;

      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
      localStorage.removeItem("loginTime");
    },

    // Set session expiry warning
    setSessionExpiry: (state, action) => {
      state.sessionExpiry = action.payload;
    },

    // Clear session expiry
    clearSessionExpiry: (state) => {
      state.sessionExpiry = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loginTime = action.payload.loginTime;
        state.isAuthenticated = true;
        state.message = "Login successful!";
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })

      // Logout cases
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.loginTime = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.message = "Logged out successfully";
        state.sessionExpiry = null;
      })
      .addCase(logout.rejected, (state) => {
        // Force logout even if API fails
        state.user = null;
        state.token = null;
        state.loginTime = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.message = "Logged out successfully";
        state.sessionExpiry = null;
      })

      // Restore Session cases
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loginTime = action.payload.loginTime;
        state.isAuthenticated = true;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.loginTime = null;
        state.isAuthenticated = false;
      })

      // Update Profile cases
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.message = "Profile updated successfully";
        localStorage.setItem("currentUser", JSON.stringify(action.payload));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ---------------------------
// SELECTORS
// ---------------------------

export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectIsAdmin = (state) => state.auth.user?.isAdmin || false;
export const selectUserRegions = (state) => state.auth.user?.regions || [];
export const selectUserPermissions = (state) => state.auth.user?.permissions || {};
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthMessage = (state) => state.auth.message;
export const selectSessionExpiry = (state) => state.auth.sessionExpiry;

// Computed selectors
export const selectCanManageUsers = (state) => 
  state.auth.user?.permissions?.userManagement || false;

export const selectCanAccessGISTools = (state) => 
  state.auth.user?.permissions?.distance || 
  state.auth.user?.permissions?.polygon || false;

export const selectUserRegionIds = (state) => 
  state.auth.user?.regions?.map(region => region.id) || [];

// ---------------------------
// ACTIONS
// ---------------------------

export const { 
  clearMessages, 
  updateUserProfile, 
  logoutLocal,
  setSessionExpiry,
  clearSessionExpiry
} = authSlice.actions;

// ---------------------------
// REDUCER
// ---------------------------

export default authSlice.reducer;
```

## Region Slice Implementation

```javascript
// redux/slices/regionSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/api";

// Async thunks
export const fetchRegions = createAsyncThunk(
  "region/fetchRegions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getRegions();
      return response.regions;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const assignRegionsToUser = createAsyncThunk(
  "region/assignRegionsToUser",
  async ({ userId, regions }, { rejectWithValue }) => {
    try {
      await apiService.assignRegions(userId, regions);
      return { userId, regions };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  regions: [],
  selectedRegion: null,
  bounds: null,
  loading: false,
  error: null,
  assignmentLoading: false,
};

const regionSlice = createSlice({
  name: "region",
  initialState,
  reducers: {
    setSelectedRegion: (state, action) => {
      state.selectedRegion = action.payload;
      state.bounds = action.payload?.bounds || null;
    },
    clearSelectedRegion: (state) => {
      state.selectedRegion = null;
      state.bounds = null;
    },
    setBounds: (state, action) => {
      state.bounds = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch regions
      .addCase(fetchRegions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegions.fulfilled, (state, action) => {
        state.loading = false;
        state.regions = action.payload;
      })
      .addCase(fetchRegions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Assign regions
      .addCase(assignRegionsToUser.pending, (state) => {
        state.assignmentLoading = true;
        state.error = null;
      })
      .addCase(assignRegionsToUser.fulfilled, (state) => {
        state.assignmentLoading = false;
      })
      .addCase(assignRegionsToUser.rejected, (state, action) => {
        state.assignmentLoading = false;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectRegions = (state) => state.region.regions;
export const selectSelectedRegion = (state) => state.region.selectedRegion;
export const selectRegionBounds = (state) => state.region.bounds;
export const selectRegionLoading = (state) => state.region.loading;
export const selectRegionError = (state) => state.region.error;
export const selectAssignmentLoading = (state) => state.region.assignmentLoading;

// Actions
export const { 
  setSelectedRegion, 
  clearSelectedRegion, 
  setBounds, 
  clearError 
} = regionSlice.actions;

export default regionSlice.reducer;
```

## User Slice Implementation

```javascript
// redux/slices/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/api";

// Async thunks
export const fetchUsers = createAsyncThunk(
  "user/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getUsers();
      return response.users;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createUser = createAsyncThunk(
  "user/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiService.createUser(userData);
      return response.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateUser(userId, userData);
      return response.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      await apiService.deleteUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  totalUsers: 0,
  filters: {
    role: '',
    status: '',
    search: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        role: '',
        status: '',
        search: '',
      };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.totalUsers = action.payload.length;
        state.pagination.total = action.payload.length;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
        state.totalUsers += 1;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        state.totalUsers -= 1;
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectUsers = (state) => state.user.users;
export const selectSelectedUser = (state) => state.user.selectedUser;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
export const selectTotalUsers = (state) => state.user.totalUsers;
export const selectUserFilters = (state) => state.user.filters;
export const selectUserPagination = (state) => state.user.pagination;

// Computed selectors
export const selectFilteredUsers = (state) => {
  const { users, filters } = state.user;
  return users.filter(user => {
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || 
      (filters.status === 'active' ? user.active : !user.active);
    const matchesSearch = !filters.search || 
      user.username.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.role.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesRole && matchesStatus && matchesSearch;
  });
};

export const selectPaginatedUsers = (state) => {
  const filteredUsers = selectFilteredUsers(state);
  const { page, limit } = state.user.pagination;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return filteredUsers.slice(startIndex, endIndex);
};

// Actions
export const { 
  setSelectedUser, 
  clearSelectedUser, 
  setFilters, 
  clearFilters,
  setPagination,
  clearError 
} = userSlice.actions;

export default userSlice.reducer;
```

## Component Integration

### Using Redux in Components

```javascript
// Example: LoginBox component
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  login, 
  clearMessages, 
  selectAuth,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated 
} from '../redux/slices/authSlice';

function LoginBox() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { message } = useSelector(selectAuth);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  // Local state
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  // Handle authentication success
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear messages on unmount
  useEffect(() => {
    return () => {
      dispatch(clearMessages());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      return;
    }

    const result = await dispatch(login(credentials));
    
    if (login.fulfilled.match(result)) {
      // Login successful - navigation handled by useEffect
      console.log('Login successful');
    } else {
      // Login failed - error is already in Redux state
      console.log('Login failed:', result.payload);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="username"
        value={credentials.username}
        onChange={handleInputChange}
        placeholder="Username"
        disabled={loading}
      />
      
      <input
        type="password"
        name="password"
        value={credentials.password}
        onChange={handleInputChange}
        placeholder="Password"
        disabled={loading}
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
    </form>
  );
}

export default LoginBox;
```

### Custom Hooks for Redux

```javascript
// hooks/useAuth.js
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectAuth,
  selectIsAuthenticated,
  selectUser,
  selectUserRole,
  selectIsAdmin,
  selectUserPermissions,
  login,
  logout,
  clearMessages
} from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);
  const isAdmin = useSelector(selectIsAdmin);
  const permissions = useSelector(selectUserPermissions);

  const loginUser = (credentials) => dispatch(login(credentials));
  const logoutUser = () => dispatch(logout());
  const clearAuthMessages = () => dispatch(clearMessages());

  const hasPermission = (permission) => {
    return permissions[permission] || false;
  };

  const canAccessRoute = (requiredRole) => {
    if (!isAuthenticated) return false;
    if (requiredRole === 'admin') return isAdmin;
    return true;
  };

  return {
    // State
    auth,
    isAuthenticated,
    user,
    userRole,
    isAdmin,
    permissions,
    
    // Actions
    loginUser,
    logoutUser,
    clearAuthMessages,
    
    // Utilities
    hasPermission,
    canAccessRoute,
  };
};
```

## Best Practices

### 1. Action Naming Convention
```javascript
// Use consistent naming patterns
const actionTypes = {
  // Sync actions: verb + noun
  'SET_USER',
  'CLEAR_ERROR',
  'UPDATE_FILTERS',
  
  // Async actions: noun + verb + status
  'user/fetchUsers/pending',
  'user/fetchUsers/fulfilled',
  'user/fetchUsers/rejected',
};
```

### 2. Selector Organization
```javascript
// Basic selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;

// Computed selectors
export const selectIsAdmin = (state) => state.auth.user?.isAdmin || false;
export const selectCanManageUsers = (state) => 
  state.auth.user?.permissions?.userManagement || false;

// Memoized selectors (use reselect for complex computations)
import { createSelector } from '@reduxjs/toolkit';

export const selectFilteredUsers = createSelector(
  [selectUsers, selectUserFilters],
  (users, filters) => {
    return users.filter(user => {
      // Complex filtering logic
    });
  }
);
```

### 3. Error Handling
```javascript
// Consistent error handling in thunks
export const fetchData = createAsyncThunk(
  'data/fetchData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiService.getData(params);
      return response;
    } catch (error) {
      // Return a serializable error
      return rejectWithValue({
        message: error.message,
        status: error.status,
        timestamp: Date.now(),
      });
    }
  }
);
```

### 4. Loading States
```javascript
// Handle loading states consistently
const slice = createSlice({
  name: 'example',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
```

## Testing Redux

### Testing Reducers
```javascript
// __tests__/authSlice.test.js
import authReducer, { login, logout } from '../redux/slices/authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  it('should handle login.pending', () => {
    const action = { type: login.pending.type };
    const state = authReducer(initialState, action);
    
    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
  });

  it('should handle login.fulfilled', () => {
    const user = { id: 1, username: 'test' };
    const action = { 
      type: login.fulfilled.type, 
      payload: { user, token: 'token123' } 
    };
    const state = authReducer(initialState, action);
    
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
  });
});
```

### Testing Async Thunks
```javascript
// __tests__/authThunks.test.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { login } from '../redux/slices/authSlice';
import apiService from '../services/api';

// Mock API service
jest.mock('../services/api');

describe('auth thunks', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { auth: authReducer },
    });
  });

  it('should handle successful login', async () => {
    const mockUser = { id: 1, username: 'test' };
    apiService.login.mockResolvedValue({ 
      user: mockUser, 
      token: 'token123' 
    });

    await store.dispatch(login({ username: 'test', password: 'pass' }));
    
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
  });
});
```

This comprehensive Redux implementation guide provides everything needed to understand and work with the state management system in the GIS application.