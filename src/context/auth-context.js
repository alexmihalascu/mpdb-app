import { createContext } from 'react';

/** Shared auth state. Lives in its own module so the provider file only
 *  exports components, which keeps react-refresh able to hot-reload it. */
export const AuthContext = createContext(null);
