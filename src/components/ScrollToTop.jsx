import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Resets scroll position on navigation, the way a full page load would. */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }, [pathname]);

  return null;
}
