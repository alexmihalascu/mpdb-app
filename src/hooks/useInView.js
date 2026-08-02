import { useEffect, useRef, useState } from 'react';

/** Reports the first time an element enters the viewport, then stops observing. */
export function useInView({ threshold = 0.35 } = {}) {
  const ref = useRef(null);
  // Without IntersectionObserver (older browsers, jsdom) everything is
  // treated as visible from the start rather than staying hidden forever.
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}
