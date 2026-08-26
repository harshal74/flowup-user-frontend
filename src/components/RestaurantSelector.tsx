import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UtensilsCrossed, RefreshCw, X } from 'lucide-react';
import api from '../services/api';

interface Restaurant {
  name: string;
  slug: string;
  logo: string | null;
}

interface Props {
  /** Compact mode — used when embedded inside the error state of SlugResolver */
  compact?: boolean;
}

export function RestaurantSelector({ compact = false }: Props) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [search,      setSearch]      = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRestaurants = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (q.trim()) params.search = q.trim();
      const res = await api.get('/restaurants/public', { params });
      setRestaurants(res.data.data || []);
    } catch {
      setError('Unable to load restaurants. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchRestaurants('');
  }, [fetchRestaurants]);

  // Debounced search
  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchRestaurants(value), 350);
  };

  const handleSelect = (slug: string) => {
    // Navigate to the root-level slug URL; the existing SlugResolver handles it.
    window.location.href = `/${slug}`;
  };

  return (
    <div className={compact ? 'w-full' : 'w-full max-w-md mx-auto'}>
      {!compact && (
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
          Select a Restaurant
        </h2>
      )}

      {/* Search input */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search restaurants…"
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
                     placeholder:text-gray-400 focus:outline-none focus:ring-2
                     focus:ring-orange-500/40 focus:border-orange-400 transition-colors"
          aria-label="Search restaurants"
        />
        {search && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
                       dark:hover:text-gray-200 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* List */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700
                      bg-white dark:bg-gray-900 overflow-hidden"
           style={{ maxHeight: compact ? '260px' : '320px', overflowY: 'auto' }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading restaurants…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 px-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
            <button
              onClick={() => fetchRestaurants(search)}
              className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 px-4 text-center">
            <UtensilsCrossed className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No restaurants found</p>
            {search && (
              <p className="text-xs text-gray-400 dark:text-gray-500">Try a different search.</p>
            )}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            <ul role="listbox" aria-label="Restaurant list">
              {restaurants.map((r, i) => (
                <motion.li
                  key={r.slug}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  role="option"
                  aria-selected={false}
                >
                  <button
                    onClick={() => handleSelect(r.slug)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left
                               hover:bg-orange-50 dark:hover:bg-orange-900/10
                               focus:bg-orange-50 dark:focus:bg-orange-900/10
                               focus:outline-none transition-colors
                               border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    {/* Logo or placeholder */}
                    <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden
                                    bg-orange-100 dark:bg-orange-900/30
                                    flex items-center justify-center">
                      {r.logo ? (
                        <img
                          src={r.logo}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                      )}
                    </div>

                    {/* Name + slug */}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {r.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                        {r.slug}
                      </p>
                    </div>
                  </button>
                </motion.li>
              ))}
            </ul>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
