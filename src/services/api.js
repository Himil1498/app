// services/api.js
import { store } from '../redux/store';
import { getRegionDataForAssignment, getAvailableStates, normalizeStateName } from '../utils/indiaStatesUtils';

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

  // Enhanced region definitions with India states data
  async getStaticRegions() {
    try {
      // Get all available states from the India boundary data
      const availableStates = await getAvailableStates();
      
      const regions = [
        {
          id: 'bharat',
          name: 'Bharat (Full India)',
          bounds: [[6.4, 68.1], [37.6, 97.4]], // Full India bounds
        }
      ];
      
      // Add all available states as regions
      for (const stateName of availableStates) {
        const normalizedId = stateName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
        regions.push({
          id: normalizedId,
          name: stateName,
          isState: true, // Mark as actual state data
        });
      }
      
      return regions;
    } catch (error) {
      console.warn('⚠️ Could not load India states data, using fallback regions');
      // Fallback to static regions if states data fails to load
      return [
        { id: 'bharat', name: 'Bharat', bounds: null },
        { id: 'maharashtra', name: 'Maharashtra', bounds: [[15.6, 72.6], [22.0, 80.9]] },
        { id: 'karnataka', name: 'Karnataka', bounds: [[11.5, 74.0], [18.5, 78.5]] },
        { id: 'gujarat', name: 'Gujarat', bounds: [[20.1, 68.2], [24.7, 74.5]] },
        { id: 'rajasthan', name: 'Rajasthan', bounds: [[23.0, 69.5], [30.1, 78.3]] },
        { id: 'tamilnadu', name: 'Tamil Nadu', bounds: [[8.0, 76.2], [13.5, 80.3]] }
      ];
    }
  }

  // Enhanced normalize regions input with India states data
  async normalizeRegionsInput(regions) {
    if (!regions) return [];
    
    const staticRegions = await this.getStaticRegions();
    const normalizedRegions = [];
    
    const regionArray = Array.isArray(regions) ? regions : [regions];
    
    for (const region of regionArray) {
      if (typeof region === 'string') {
      // Convert string to region object
      const staticRegion = staticRegions.find(r => 
      r.name.toLowerCase() === region.toLowerCase() ||
      r.id.toLowerCase() === region.toLowerCase() ||
      normalizeStateName(r.name) === normalizeStateName(region)
      );
      
      if (staticRegion && staticRegion.isState) {
      // Load actual state boundary data
      try {
      const stateRegions = await getRegionDataForAssignment([staticRegion.name]);
      if (stateRegions.length > 0) {
      normalizedRegions.push(stateRegions[0]);
      continue;
      }
      } catch (error) {
      console.warn(`⚠️ Could not load state data for ${staticRegion.name}, using fallback`);
      }
      }
      
      if (staticRegion) {
      normalizedRegions.push(staticRegion);
      } else {
      // Create basic region object for unknown regions
      normalizedRegions.push({
      id: region.toLowerCase().replace(/\s+/g, '-'),
      name: region,
      bounds: [[20, 70], [30, 80]], // Default bounds for India region
      });
      }
      } else if (region && typeof region === 'object') {
      // Already an object, ensure it has required properties
      let regionObj = {
      id: region.id || region.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
      name: region.name || region.id || 'Unknown Region',
      bounds: region.bounds || [[20, 70], [30, 80]],
      polygonPaths: region.polygonPaths,
      };
      
      // If no polygonPaths but has name that matches a state, load them
      if (!regionObj.polygonPaths && regionObj.name) {
      const staticRegion = staticRegions.find(r => 
      normalizeStateName(r.name) === normalizeStateName(regionObj.name)
      );
      if (staticRegion && staticRegion.isState) {
      try {
      const stateRegions = await getRegionDataForAssignment([staticRegion.name]);
      if (stateRegions.length > 0) {
      regionObj = { ...regionObj, ...stateRegions[0] };
      }
      } catch (error) {
      console.warn(`⚠️ Could not load polygon data for ${regionObj.name}`);
      }
      }
      }
      
      normalizedRegions.push(regionObj);
      }
    }
    
    // Deduplicate by id
    const seen = new Set();
    return normalizedRegions.filter(r => {
      if (r.id && seen.has(r.id)) {
        return false;
      }
      if (r.id) {
        seen.add(r.id);
      }
      return true;
    });
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
    return new Promise(async (resolve, reject) => {
      setTimeout(async () => {
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
                elevation: true,
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
                distance: true,
                polygon: true,
                elevation: true,
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

          // Normalize regions for found user to full region objects (now async)
          const normalizedRegions = await this.normalizeRegionsInput(foundUser.regions || []);

          const userObj = {
            id: foundUser.id,
            username: foundUser.username,
            role: foundUser.role,
            isAdmin: foundUser.role?.toLowerCase() === "admin",
            regions: normalizedRegions,
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
    return new Promise(async (resolve, reject) => {
      setTimeout(async () => {
        try {
          let users = JSON.parse(localStorage.getItem("users")) || [];
          
          if (users.find((u) => u.username === userData.username)) {
            reject(new Error("❌ Username already exists"));
            return;
          }

          // Normalize regions to full objects for storage (now async)
          const normalizedRegions = await this.normalizeRegionsInput(userData.regions || []);

          const newUser = {
            id: `user-${Date.now()}`,
            ...userData,
            regions: normalizedRegions,
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
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const regions = await this.getStaticRegions();
        resolve({ regions });
      }, 300);
    });
  }

  handleAssignRegions({ userId, regions }) {
    return new Promise(async (resolve, reject) => {
      setTimeout(async () => {
        try {
          let users = JSON.parse(localStorage.getItem("users")) || [];
          const userIndex = users.findIndex(u => u.id === userId);
          
          if (userIndex === -1) {
            reject(new Error("User not found"));
            return;
          }

          // Normalize assigned regions (now async)
          const normalized = await this.normalizeRegionsInput(regions || []);
          users[userIndex].regions = normalized;
          localStorage.setItem("users", JSON.stringify(users));
          resolve({ success: true, regions: normalized });
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