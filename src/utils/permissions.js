// utils/permissions.js

/**
 * Permission utilities for role-based access control
 */

// Feature permission keys
export const FEATURES = {
  DISTANCE: 'distance',
  POLYGON: 'polygon',  
  ELEVATION: 'elevation',
  INFRASTRUCTURE: 'infrastructure',
  USER_MANAGEMENT: 'userManagement',
};

// Role definitions
export const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  NORMAL_USER: 'Normal User',
};

// Default permissions by role
export const DEFAULT_PERMISSIONS = {
  [ROLES.ADMIN]: {
    [FEATURES.DISTANCE]: true,
    [FEATURES.POLYGON]: true,
    [FEATURES.ELEVATION]: true,
    [FEATURES.INFRASTRUCTURE]: true,
    [FEATURES.USER_MANAGEMENT]: true,
  },
  [ROLES.MANAGER]: {
    [FEATURES.DISTANCE]: true,
    [FEATURES.POLYGON]: true,
    [FEATURES.ELEVATION]: false,
    [FEATURES.INFRASTRUCTURE]: true,
    [FEATURES.USER_MANAGEMENT]: false,
  },
  [ROLES.NORMAL_USER]: {
    [FEATURES.DISTANCE]: false,
    [FEATURES.POLYGON]: false,
    [FEATURES.ELEVATION]: false,
    [FEATURES.INFRASTRUCTURE]: true,
    [FEATURES.USER_MANAGEMENT]: false,
  },
};

/**
 * Check if a user has permission for a specific feature
 * @param {Object} user - User object with role and permissions
 * @param {string} feature - Feature key to check
 * @returns {boolean} - Whether user has permission
 */
export const hasPermission = (user, feature) => {
  if (!user) return false;
  
  // Admin has all permissions by default
  if (user.isAdmin) return true;
  
  // Check explicit permissions first
  if (user.permissions && typeof user.permissions[feature] !== 'undefined') {
    return user.permissions[feature];
  }
  
  // Fall back to role-based permissions
  const rolePermissions = DEFAULT_PERMISSIONS[user.role];
  return rolePermissions ? rolePermissions[feature] : false;
};

/**
 * Check if user can access a specific region
 * @param {Object} user - User object with regions
 * @param {string} regionId - Region ID to check
 * @returns {boolean} - Whether user can access region
 */
export const canAccessRegion = (user, regionId) => {
  if (!user) return false;
  
  // Admin can access all regions
  if (user.isAdmin) return true;
  
  // Check if user has access to specific region
  return user.regions?.some(region => region.id === regionId) || false;
};

/**
 * Get all regions accessible by user
 * @param {Object} user - User object
 * @param {Array} allRegions - All available regions
 * @returns {Array} - Regions accessible by user
 */
export const getAccessibleRegions = (user, allRegions = []) => {
  if (!user) return [];
  
  // Admin can access all regions
  if (user.isAdmin) return allRegions;
  
  // Return user's assigned regions
  return user.regions || [];
};

/**
 * Check if user can manage other users
 * @param {Object} user - User object
 * @returns {boolean} - Whether user can manage users
 */
export const canManageUsers = (user) => {
  return hasPermission(user, FEATURES.USER_MANAGEMENT);
};

/**
 * Check if user can access admin panel
 * @param {Object} user - User object
 * @returns {boolean} - Whether user can access admin panel
 */
export const canAccessAdminPanel = (user) => {
  return user?.isAdmin || user?.role === ROLES.ADMIN;
};

/**
 * Get disabled features for a user
 * @param {Object} user - User object
 * @returns {Array} - Array of disabled feature keys
 */
export const getDisabledFeatures = (user) => {
  if (!user) return Object.values(FEATURES);
  
  const disabled = [];
  
  Object.values(FEATURES).forEach(feature => {
    if (!hasPermission(user, feature)) {
      disabled.push(feature);
    }
  });
  
  return disabled;
};

/**
 * Get enabled features for a user
 * @param {Object} user - User object
 * @returns {Array} - Array of enabled feature keys
 */
export const getEnabledFeatures = (user) => {
  if (!user) return [];
  
  const enabled = [];
  
  Object.values(FEATURES).forEach(feature => {
    if (hasPermission(user, feature)) {
      enabled.push(feature);
    }
  });
  
  return enabled;
};

/**
 * Create permission object for new user based on role
 * @param {string} role - User role
 * @returns {Object} - Permission object
 */
export const createPermissionsForRole = (role) => {
  return { ...DEFAULT_PERMISSIONS[role] } || {};
};

/**
 * Validate permission structure
 * @param {Object} permissions - Permission object to validate
 * @returns {Object} - Validated and corrected permissions
 */
export const validatePermissions = (permissions = {}) => {
  const validated = {};
  
  Object.values(FEATURES).forEach(feature => {
    validated[feature] = Boolean(permissions[feature]);
  });
  
  return validated;
};

/**
 * Check if user has any GIS feature access
 * @param {Object} user - User object
 * @returns {boolean} - Whether user has any GIS features
 */
export const hasAnyGISFeature = (user) => {
  return hasPermission(user, FEATURES.DISTANCE) ||
         hasPermission(user, FEATURES.POLYGON) ||
         hasPermission(user, FEATURES.ELEVATION) ||
         hasPermission(user, FEATURES.INFRASTRUCTURE);
};

/**
 * Get feature display name
 * @param {string} feature - Feature key
 * @returns {string} - Human readable feature name
 */
export const getFeatureDisplayName = (feature) => {
  const names = {
    [FEATURES.DISTANCE]: 'Distance Measurement',
    [FEATURES.POLYGON]: 'Polygon Drawing',
    [FEATURES.ELEVATION]: 'Elevation Profile',
    [FEATURES.INFRASTRUCTURE]: 'Infrastructure Management',
    [FEATURES.USER_MANAGEMENT]: 'User Management',
  };
  
  return names[feature] || feature;
};

// Export permission constants for easy access
export { FEATURES as PERMISSION_FEATURES, ROLES as USER_ROLES };