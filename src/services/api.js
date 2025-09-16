// services/api.js
import { store } from '../redux/store';

const isDevelopment = import.meta.env.VITE_USE_MOCK === "true" || import.meta.env.VITE_USE_MOCK === undefined;
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Enhanced API Service for GIS Professional Dashboard
 * Supports both development (localStorage) and production (backend API) modes
 */
class ApiService {
  constructor() {
    this.baseURL = BASE_URL;
    this.isDevelopment = isDevelopment;
  }

  // Helper method for API requests
  async makeRequest(endpoint, options = {}) {
    if (this.isDevelopment) {
      // Development mode - handle with localStorage
      return this.handleLocalStorageRequest(endpoint, options);
    }

    // Production mode - make actual API calls
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const state = store.getState();
    const token = state.auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Development mode localStorage handler
  async handleLocalStorageRequest(endpoint, options) {
    const { method = 'GET', body } = options;
    
    switch (endpoint) {
      case '/auth/login':
        return this.handleLogin(JSON.parse(body));
      case '/auth/logout':
        return this.handleLogout();
      case '/auth/session':
        return this.handleSessionRestore();
      case '/users':
        return this.handleGetUsers();
      case '/users/create':
        return this.handleCreateUser(JSON.parse(body));
      case '/regions':
        return this.handleGetRegions();
      case '/regions/assign':
        return this.handleAssignRegions(JSON.parse(body));
      default:
        throw new Error(`Endpoint ${endpoint} not implemented in development mode`);
    }
  }

  // Authentication API calls
  async login(credentials) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
    });
  }

  async restoreSession() {
    return this.makeRequest('/auth/session', {
      method: 'GET',
    });
  }

  // User management API calls
  async getUsers() {
    return this.makeRequest('/users', {
      method: 'GET',
    });
  }

  async createUser(userData) {
    return this.makeRequest('/users/create', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId, userData) {
    return this.makeRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId) {
    return this.makeRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Region management API calls
  async getRegions() {
    return this.makeRequest('/regions', {
      method: 'GET',
    });
  }

  async assignRegions(userId, regions) {
    return this.makeRequest('/regions/assign', {
      method: 'POST',
      body: JSON.stringify({ userId, regions }),
    });
  }

  // GIS Features API calls
  async getDistanceMeasurements(userId) {
    return this.makeRequest(`/gis/distance/${userId}`, {
      method: 'GET',
    });
  }

  async saveDistanceMeasurement(data) {
    return this.makeRequest('/gis/distance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPolygonData(userId) {
    return this.makeRequest(`/gis/polygon/${userId}`, {
      method: 'GET',
    });
  }

  async savePolygonData(data) {
    return this.makeRequest('/gis/polygon', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getElevationData(coordinates) {
    return this.makeRequest('/gis/elevation', {
      method: 'POST',
      body: JSON.stringify({ coordinates }),
    });
  }

  async getInfrastructureData(region) {
    return this.makeRequest(`/gis/infrastructure/${region}`, {
      method: 'GET',
    });
  }

  async saveInfrastructureData(data) {
    return this.makeRequest('/gis/infrastructure', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Development mode localStorage handlers
  handleLogin(credentials) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          let users = JSON.parse(localStorage.getItem("users")) || [];
          
          const fallbackUsers = [
            {
              id: 'admin-001',
              username: "admin",
              password: "admin123",
              role: "Admin",
              active: true,
              regions: [{ id: 'bharat', name: 'Bharat', bounds: null }],
              permissions: {
                distance: true,
                polygon: true,
                elevation: true,
                infrastructure: true,
                userManagement: true
              }
            },
            {
              id: 'manager-001',
              username: "manager1",
              password: "manager123",
              role: "Manager",
              active: true,
              regions: [
                { id: 'maharashtra', name: 'Maharashtra', bounds: [[15.6, 72.6], [22.0, 80.9]] },
                { id: 'karnataka', name: 'Karnataka', bounds: [[11.5, 74.0], [18.5, 78.5]] }
              ],
              permissions: {
                distance: true,
                polygon: true,
                elevation: false,
                infrastructure: true,
                userManagement: false
              }
            },
            {
              id: 'user-001',
              username: "user1",
              password: "user123",
              role: "Normal User",
              active: true,
              regions: [
                { id: 'gujarat', name: 'Gujarat', bounds: [[20.1, 68.2], [24.7, 74.5]] }
              ],
              permissions: {
                distance: false,
                polygon: false,
                elevation: false,
                infrastructure: true,
                userManagement: false
              }
            }
          ];

          users = [...fallbackUsers, ...users];

          const foundUser = users.find(
            (u) => u.username === credentials.username && u.password === credentials.password
          );

          if (!foundUser) {
            reject(new Error("❌ Invalid credentials"));
            return;
          }
          
          if (!foundUser.active) {
            reject(new Error("❌ User is deactivated. Contact admin."));
            return;
          }

          const userObj = {
            id: foundUser.id,
            username: foundUser.username,
            role: foundUser.role,
            isAdmin: foundUser.role?.toLowerCase() === "admin",
            regions: foundUser.regions || [],
            permissions: foundUser.permissions || {}
          };

          const token = `fake-jwt-token-${Date.now()}`;
          const loginTime = new Date().toISOString();

          localStorage.setItem("currentUser", JSON.stringify(userObj));
          localStorage.setItem("token", token);
          localStorage.setItem("loginTime", loginTime);

          resolve({ user: userObj, token, loginTime });
        } catch (err) {
          reject(err);
        }
      }, 500); // Simulate network delay
    });
  }

  handleLogout() {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("token");
        localStorage.removeItem("loginTime");
        resolve({ success: true });
      }, 200);
    });
  }

  handleSessionRestore() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("currentUser");
        const loginTime = localStorage.getItem("loginTime");

        if (!token || !user || !loginTime) {
          reject(new Error("No session found"));
          return;
        }

        resolve({ 
          user: JSON.parse(user), 
          token, 
          loginTime 
        });
      }, 200);
    });
  }

  handleGetUsers() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        resolve({ users });
      }, 300);
    });
  }

  handleCreateUser(userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          let users = JSON.parse(localStorage.getItem("users")) || [];
          
          if (users.find((u) => u.username === userData.username)) {
            reject(new Error("❌ Username already exists"));
            return;
          }

          const newUser = {
            id: `user-${Date.now()}`,
            ...userData,
            active: true,
            createdAt: new Date().toISOString()
          };
          
          users.push(newUser);
          localStorage.setItem("users", JSON.stringify(users));
          resolve({ user: newUser });
        } catch (err) {
          reject(err);
        }
      }, 500);
    });
  }

  handleGetRegions() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const regions = [
          { id: 'bharat', name: 'Bharat', bounds: null },
          { id: 'maharashtra', name: 'Maharashtra', bounds: [[15.6, 72.6], [22.0, 80.9]] },
          { id: 'karnataka', name: 'Karnataka', bounds: [[11.5, 74.0], [18.5, 78.5]] },
          { id: 'gujarat', name: 'Gujarat', bounds: [[20.1, 68.2], [24.7, 74.5]] },
          { id: 'rajasthan', name: 'Rajasthan', bounds: [[23.0, 69.5], [30.1, 78.3]] },
          { id: 'tamilnadu', name: 'Tamil Nadu', bounds: [[8.0, 76.2], [13.5, 80.3]] }
        ];
        resolve({ regions });
      }, 300);
    });
  }

  handleAssignRegions({ userId, regions }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          let users = JSON.parse(localStorage.getItem("users")) || [];
          const userIndex = users.findIndex(u => u.id === userId);
          
          if (userIndex === -1) {
            reject(new Error("User not found"));
            return;
          }

          users[userIndex].regions = regions;
          localStorage.setItem("users", JSON.stringify(users));
          resolve({ success: true });
        } catch (err) {
          reject(err);
        }
      }, 500);
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;