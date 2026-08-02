import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { LoadingPage } from './ui/LoadingPage';

/**
 * Gates a route on a real, server-confirmed session.
 *
 * While the session is still being checked it renders a placeholder instead
 * of redirecting, otherwise a refresh on a protected page would bounce the
 * user to the login screen before the check had a chance to finish.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingPage label="Verificam sesiunea" />;

  if (!isAuthenticated) {
    // Remember where they were headed so login can send them back.
    return <Navigate to="/autentificare" replace state={{ from: location.pathname }} />;
  }

  return children;
}
