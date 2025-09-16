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

      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
      localStorage.removeItem("loginTime");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
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
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Logout
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
      })
      .addCase(logout.rejected, (state) => {
        // Force logout even if API fails
        state.user = null;
        state.token = null;
        state.loginTime = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.message = "Logged out successfully";
      })

      // Restore Session
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

// ---------------------------
// ACTIONS
// ---------------------------

export const { clearMessages, updateUserProfile, logoutLocal } = authSlice.actions;

// ---------------------------
// REDUCER
// ---------------------------

export default authSlice.reducer;