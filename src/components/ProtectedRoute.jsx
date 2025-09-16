/**
 * The `ProtectedRoute` component checks if a user is authenticated and redirects to the home page if
 * not.
 * @returns If the `user` or `token` is not available in the Redux state, the `ProtectedRoute`
 * component will return a `<Navigate>` component that redirects the user to the home page ("/").
 * Otherwise, it will return the `children` prop, which represents the content that should be rendered
 * within the protected route.
 */
// src/components/ProtectedRoute.jsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { user, token } = useSelector((state) => state.auth);

  if (!user || !token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
