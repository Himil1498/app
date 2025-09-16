// redux/slices/regionSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/api";

// ---------------------------
// ASYNC THUNKS
// ---------------------------

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

export const assignUserRegions = createAsyncThunk(
  "region/assignUserRegions",
  async ({ userId, regions }, { rejectWithValue }) => {
    try {
      await apiService.assignRegions(userId, regions);
      return { userId, regions };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ---------------------------
// INITIAL STATE
// ---------------------------

const initialState = {
  // All available regions
  availableRegions: [],
  
  // Current map bounds and center
  currentBounds: null,
  mapCenter: { lat: 20.5937, lng: 78.9629 }, // Default India center
  mapZoom: 5,
  
  // Region-based restrictions
  accessibleRegions: [],
  
  // Loading and error states
  loading: false,
  error: null,
  
  // Auto-zoom settings
  autoZoomEnabled: true,
  hasAutoZoomed: false,
};

// ---------------------------
// REGION SLICE
// ---------------------------

const regionSlice = createSlice({
  name: "region",
  initialState,
  reducers: {
    // Set current map bounds and center
    setMapBounds: (state, action) => {
      const { bounds, center, zoom } = action.payload;
      state.currentBounds = bounds;
      if (center) state.mapCenter = center;
      if (zoom) state.mapZoom = zoom;
    },

    // Set accessible regions for current user
    setAccessibleRegions: (state, action) => {
      state.accessibleRegions = action.payload;
      state.hasAutoZoomed = false; // Reset auto-zoom flag
    },

    // Update map center and zoom
    setMapCenter: (state, action) => {
      const { lat, lng, zoom } = action.payload;
      state.mapCenter = { lat, lng };
      if (zoom) state.mapZoom = zoom;
    },

    // Set auto-zoom completion flag
    setAutoZoomCompleted: (state) => {
      state.hasAutoZoomed = true;
    },

    // Toggle auto-zoom feature
    toggleAutoZoom: (state) => {
      state.autoZoomEnabled = !state.autoZoomEnabled;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset region state
    resetRegionState: (state) => {
      state.accessibleRegions = [];
      state.currentBounds = null;
      state.hasAutoZoomed = false;
      state.mapCenter = { lat: 20.5937, lng: 78.9629 };
      state.mapZoom = 5;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Regions
      .addCase(fetchRegions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegions.fulfilled, (state, action) => {
        state.loading = false;
        state.availableRegions = action.payload;
      })
      .addCase(fetchRegions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Assign User Regions
      .addCase(assignUserRegions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignUserRegions.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(assignUserRegions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ---------------------------
// SELECTORS
// ---------------------------

export const selectRegions = (state) => state.region;
export const selectAvailableRegions = (state) => state.region.availableRegions;
export const selectAccessibleRegions = (state) => state.region.accessibleRegions;
export const selectCurrentBounds = (state) => state.region.currentBounds;
export const selectMapCenter = (state) => state.region.mapCenter;
export const selectMapZoom = (state) => state.region.mapZoom;
export const selectAutoZoomEnabled = (state) => state.region.autoZoomEnabled;
export const selectHasAutoZoomed = (state) => state.region.hasAutoZoomed;
export const selectRegionLoading = (state) => state.region.loading;
export const selectRegionError = (state) => state.region.error;

// Helper selector to check if user can access a specific region
export const selectCanAccessRegion = (state, regionId) => {
  const user = state.auth.user;
  if (!user) return false;
  
  // Admin can access all regions
  if (user.isAdmin) return true;
  
  // Check if user has access to specific region
  return user.regions?.some(region => region.id === regionId) || false;
};

// Helper selector to get bounds for user's regions
export const selectUserRegionBounds = (state) => {
  const user = state.auth.user;
  if (!user || !user.regions?.length) return null;
  
  // If admin or has Bharat access, return null (full map)
  if (user.isAdmin || user.regions.some(r => r.id === 'bharat')) {
    return null;
  }
  
  // Calculate combined bounds for all user regions
  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;
  
  user.regions.forEach(region => {
    if (region.bounds) {
      const [[lat1, lng1], [lat2, lng2]] = region.bounds;
      minLat = Math.min(minLat, lat1, lat2);
      maxLat = Math.max(maxLat, lat1, lat2);
      minLng = Math.min(minLng, lng1, lng2);
      maxLng = Math.max(maxLng, lng1, lng2);
    }
  });
  
  if (minLat === Infinity) return null;
  
  return {
    southwest: { lat: minLat, lng: minLng },
    northeast: { lat: maxLat, lng: maxLng },
    center: {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2
    }
  };
};

// ---------------------------
// ACTIONS
// ---------------------------

export const {
  setMapBounds,
  setAccessibleRegions,
  setMapCenter,
  setAutoZoomCompleted,
  toggleAutoZoom,
  clearError,
  resetRegionState,
} = regionSlice.actions;

// ---------------------------
// REDUCER
// ---------------------------

export default regionSlice.reducer;