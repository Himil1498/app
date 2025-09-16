/**
 * Enhanced ProtectedRoute component with region-based access control
 * Checks authentication and optionally validates region access
 */
// src/components/ProtectedRoute.jsx
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectIsAuthenticated, selectUser } from "../../redux/slices/authSlice";
import { canAccessAdminPanel } from "../../utils/permissions";

export default function ProtectedRoute({ children, requireAdmin = false, allowedRegions = null }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const location = useLocation();

  // Check authentication
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Check admin access if required
  if (requireAdmin && !canAccessAdminPanel(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check region access if specified
  if (allowedRegions && allowedRegions.length > 0) {
    const hasRegionAccess = user.isAdmin || 
      (user.regions && user.regions.some(region => 
        allowedRegions.includes(region.id)
      ));
    
    if (!hasRegionAccess) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
