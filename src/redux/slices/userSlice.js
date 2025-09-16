// redux/slices/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/api";

// ---------------------------
// ASYNC THUNKS
// ---------------------------

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
      return { userId, userData: response.user };
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

// ---------------------------
// INITIAL STATE
// ---------------------------

const initialState = {
  // User list
  users: [],
  filteredUsers: [],
  
  // Current user being edited/viewed
  selectedUser: null,
  
  // Search and filter
  searchQuery: "",
  roleFilter: "All",
  statusFilter: "All",
  
  // Pagination
  currentPage: 1,
  usersPerPage: 10,
  totalUsers: 0,
  
  // UI state
  viewMode: "table", // "table" or "card"
  
  // Loading and error states
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
  message: null,
};

// ---------------------------
// USER SLICE
// ---------------------------

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Search and filter
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset to first page
      userSlice.caseReducers.applyFilters(state);
    },

    setRoleFilter: (state, action) => {
      state.roleFilter = action.payload;
      state.currentPage = 1;
      userSlice.caseReducers.applyFilters(state);
    },

    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
      state.currentPage = 1;
      userSlice.caseReducers.applyFilters(state);
    },

    applyFilters: (state) => {
      let filtered = [...state.users];

      // Apply search query
      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(user =>
          user.username.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query) ||
          (user.regions && user.regions.some(region => 
            region.name.toLowerCase().includes(query)
          ))
        );
      }

      // Apply role filter
      if (state.roleFilter !== "All") {
        filtered = filtered.filter(user => user.role === state.roleFilter);
      }

      // Apply status filter
      if (state.statusFilter !== "All") {
        const isActive = state.statusFilter === "Active";
        filtered = filtered.filter(user => user.active === isActive);
      }

      state.filteredUsers = filtered;
      state.totalUsers = filtered.length;
    },

    // Pagination
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },

    setUsersPerPage: (state, action) => {
      state.usersPerPage = action.payload;
      state.currentPage = 1;
    },

    // UI state
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },

    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },

    // Clear messages
    clearMessages: (state) => {
      state.error = null;
      state.message = null;
    },

    // Reset user state
    resetUserState: (state) => {
      state.selectedUser = null;
      state.searchQuery = "";
      state.roleFilter = "All";
      state.statusFilter = "All";
      state.currentPage = 1;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        userSlice.caseReducers.applyFilters(state);
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create User
      .addCase(createUser.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.creating = false;
        state.users.push(action.payload);
        state.message = "User created successfully";
        userSlice.caseReducers.applyFilters(state);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.updating = false;
        const { userId, userData } = action.payload;
        const index = state.users.findIndex(user => user.id === userId);
        if (index !== -1) {
          state.users[index] = userData;
        }
        state.message = "User updated successfully";
        userSlice.caseReducers.applyFilters(state);
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deleting = false;
        const userId = action.payload;
        state.users = state.users.filter(user => user.id !== userId);
        state.message = "User deleted successfully";
        userSlice.caseReducers.applyFilters(state);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

// ---------------------------
// SELECTORS
// ---------------------------

export const selectUsers = (state) => state.user;
export const selectUsersList = (state) => state.user.users;
export const selectFilteredUsers = (state) => state.user.filteredUsers;
export const selectSelectedUser = (state) => state.user.selectedUser;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserCreating = (state) => state.user.creating;
export const selectUserUpdating = (state) => state.user.updating;
export const selectUserDeleting = (state) => state.user.deleting;
export const selectUserError = (state) => state.user.error;
export const selectUserMessage = (state) => state.user.message;

// Pagination selectors
export const selectCurrentPage = (state) => state.user.currentPage;
export const selectUsersPerPage = (state) => state.user.usersPerPage;
export const selectTotalUsers = (state) => state.user.totalUsers;
export const selectTotalPages = (state) => 
  Math.ceil(state.user.totalUsers / state.user.usersPerPage);

// Get paginated users
export const selectPaginatedUsers = (state) => {
  const { filteredUsers, currentPage, usersPerPage } = state.user;
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  return filteredUsers.slice(startIndex, endIndex);
};

// Filter selectors
export const selectSearchQuery = (state) => state.user.searchQuery;
export const selectRoleFilter = (state) => state.user.roleFilter;
export const selectStatusFilter = (state) => state.user.statusFilter;
export const selectViewMode = (state) => state.user.viewMode;

// Helper selector for unique roles
export const selectAvailableRoles = (state) => {
  const roles = new Set(state.user.users.map(user => user.role));
  return Array.from(roles).sort();
};

// ---------------------------
// ACTIONS
// ---------------------------

export const {
  setSearchQuery,
  setRoleFilter,
  setStatusFilter,
  applyFilters,
  setCurrentPage,
  setUsersPerPage,
  setViewMode,
  setSelectedUser,
  clearMessages,
  resetUserState,
} = userSlice.actions;

// ---------------------------
// REDUCER
// ---------------------------

export default userSlice.reducer;