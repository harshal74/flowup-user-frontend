import { useEffect, useState } from 'react';
import api from '../services/api';
import { setRestaurantId, setRestaurantSlug } from '../utils/restaurantId';

interface Props {
  slug: string;
}

/**
 * Resolves a restaurant slug to a restaurantId via the backend settings API.
 * Once resolved, stores the restaurantId and reloads to initialize the full app.
 */
export function SlugResolver({ slug }: Props) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Use the settings endpoint with restaurantSlug — the resolver middleware
        // will look up the slug and return settings with the restaurantId.
        const res = await api.get('/settings', { params: { restaurantSlug: slug } });
        const restaurantId = res.data?.data?.restaurantId;

        if (restaurantId) {
          setRestaurantId(restaurantId);
          setRestaurantSlug(slug);
          // Reload to let App.tsx pick up the stored restaurantId
          window.location.reload();
        } else {
          setError('Restaurant not found.');
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Restaurant not found.';
        setError(msg);
      }
    })();
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <span className="text-4xl">🍽️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Restaurant Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Loading state while resolving
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <div className="w-10 h-10 mx-auto border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading restaurant…</p>
      </div>
    </div>
  );
}
