import { useCallback, useEffect, useMemo, useState } from 'react';

import { api } from '../lib/api';
import { AuthContext } from './auth-context';

/**
 * Holds the current session.
 *
 * On mount it asks the server who the caller is rather than trusting anything
 * stored in the browser. The old app kept an `isLoggedIn` flag hardcoded to
 * `false` and redirected to the booking page even when login failed.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready

  useEffect(() => {
    const controller = new AbortController();

    api
      .me(controller.signal)
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => {
        if (!controller.signal.aborted) setStatus('ready');
      });

    return () => controller.abort();
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await api.login(username, password);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (username, password) => {
    const data = await api.register(username, password);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      // Clear locally even if the request failed, so the UI can never be left
      // showing a signed-in state the server does not agree with.
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading: status === 'loading',
      login,
      register,
      logout,
    }),
    [user, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
