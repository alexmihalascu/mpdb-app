import { useEffect, useRef } from 'react';

/**
 * Reveals an element the first time it scrolls into view.
 *
 * Returns a ref to attach to any element carrying the `.reveal` class. The
 * observer disconnects after firing so nothing keeps running once the page
 * has settled, and reduced-motion users skip the animation entirely.
 */
export function useReveal({ threshold = 0.15, rootMargin = '0px 0px -8% 0px' } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      node.classList.add('is-visible');
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.disconnect();
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}
