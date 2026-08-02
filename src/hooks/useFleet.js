import { useEffect, useState } from 'react';

import { api } from '../lib/api';

/**
 * Loads the fleet from the API.
 *
 * Specs and prices are server-owned, so both the catalogue page and the
 * booking form read from here rather than from a hardcoded list duplicated in
 * two components.
 */
export function useFleet() {
  const [cars, setCars] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    api
      .cars(controller.signal)
      .then((data) => setCars(data.cars))
      .catch((cause) => {
        if (cause.name !== 'AbortError') setError(cause.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { cars, error, isLoading };
}
