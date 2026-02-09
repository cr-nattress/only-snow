import { useState, useEffect } from 'react';

/**
 * Returns `isTimedOut: true` after `ms` milliseconds while `loading` is true.
 * Resets when `loading` becomes false.
 */
export function useLoadingTimeout(loading: boolean, ms = 10_000) {
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsTimedOut(false);
      return;
    }

    const timer = setTimeout(() => setIsTimedOut(true), ms);
    return () => clearTimeout(timer);
  }, [loading, ms]);

  return { isTimedOut };
}
