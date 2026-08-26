import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';
import api from '../services/api';
import { setRestaurantId, setRestaurantSlug } from '../utils/restaurantId';
import { RestaurantSelector } from './RestaurantSelector';

interface Props {
  slug: string;
}

/**
 * Resolves a restaurant slug to a restaurantId via the backend settings API.
 *
 * Success path:
 *   Stores restaurantId + slug in sessionStorage → reloads.
 *
 * Error path (slug not found / network error):
 *   Shows "Restaurant not found" + searchable RestaurantSelector so the user
 *   can navigate to another restaurant without going back to the homepage.
 *
 * The slug-resolution logic is unchanged from the original implementation.
 */
export function SlugResolver({ slug }: Props) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Use the existing settings endpoint — resolver middleware looks up the slug.
        const res = await api.get('/settings', { params: { restaurantSlug: slug } });
        if (cancelled) return;
        const restaurantId = res.data?.data?.restaurantId;

        if (restaurantId) {
          setRestaurantId(restaurantId);
          setRestaurantSlug(slug);
          window.location.reload();
        } else {
          setError('Restaurant not found.');
        }
      } catch (err: any) {
        if (cancelled) return;
        const status = err?.response?.status;
        // 404 → not found; everything else → generic message
        setError(
          status === 404 || status === 400
            ? 'Restaurant not found.'
            : 'Unable to reach the server. Please try again.'
        );
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  // ── Loading state ────────────────────────────────────────────────
  if (!error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto border-4 border-orange-500 border-t-transparent
                          rounded-full animate-spin" />
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading restaurant…</p>
        </div>
      </div>
    );
  }

  // ── Error state — show selector fallback ─────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Not-found banner */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-16 h-16 mb-4 bg-red-100 dark:bg-red-900/30 rounded-2xl
                          flex items-center justify-center">
            <UtensilsCrossed className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Restaurant not found
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Check the link, or choose another restaurant below.
          </p>
        </div>

        {/* Searchable selector */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl
                        border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase
                        tracking-wider mb-3">
            Select a Restaurant
          </p>
          <RestaurantSelector compact />
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-600 mt-6 text-center">
          Powered by FlowUp
        </p>
      </motion.div>
    </div>
  );
}
