import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'mpdb-theme';

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    // Private browsing can throw on access; fall back to the system setting.
    return null;
  }
}

function systemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/**
 * Colour scheme, defaulting to the operating system and remembering an
 * explicit choice. Setting `data-theme` on <html> lets the manual choice win
 * over the `prefers-color-scheme` media query in tokens.css.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => readStoredTheme() ?? systemTheme());
  const [isExplicit, setIsExplicit] = useState(() => readStoredTheme() !== null);

  useEffect(() => {
    if (isExplicit) {
      document.documentElement.dataset.theme = theme;
    } else {
      delete document.documentElement.dataset.theme;
    }
  }, [theme, isExplicit]);

  useEffect(() => {
    if (isExplicit) return undefined;
    const query = window.matchMedia?.('(prefers-color-scheme: light)');
    if (!query) return undefined;

    const onChange = () => setTheme(systemTheme());
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [isExplicit]);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Persisting is a nicety, not a requirement.
      }
      return next;
    });
    setIsExplicit(true);
  }, []);

  return { theme, toggle };
}
