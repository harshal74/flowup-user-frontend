import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRestaurant } from '../context';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { HeroSection } from '../components/layout/HeroSection';
import { CategoryNavigation } from '../components/layout/CategoryNavigation';
import { MenuSection } from '../components/menu/MenuSection';
import { MenuCard } from '../components/menu/MenuCard';
import { CartBar } from '../components/cart/CartBar';
import { ShopClosedOverlay } from '../components/layout/ShopClosedOverlay';
import { HeroSkeleton, MenuCardSkeleton, CategorySkeleton } from '../components/common/Skeleton';
import { FilterChips } from '../components/common/FilterChips';
import { SEO } from '../components/seo/SEO';
import { CallWaiterButton } from '../components/common/CallWaiterButton';
import type { MenuItemCategory } from '../types';

type FilterType = 'all' | 'veg' | 'non-veg' | 'recommended';

// Safely extract category ID whether it's a string or populated object
function getCategoryId(categoryId: string | MenuItemCategory): string {
  if (typeof categoryId === 'object' && categoryId !== null) {
    return categoryId._id;
  }
  return categoryId;
}

export function HomePage() {
  const { settings, categories, menuItems, isLoading, error } = useRestaurant();
  const [activeCategory, setActiveCategory] = useState('all');
  const activeCategoryRef = useRef('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  // tableNumber is only set when the customer arrived via QR code scan
  const [tableNumber, setTableNumber] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const table = params.get("table") || params.get("tableNumber");

    if (table && !isNaN(Number(table))) {
      localStorage.setItem("tableNumber", table);
      setTableNumber(Number(table));
    } else {
      // Check if a previous session left a table number
      const saved = localStorage.getItem("tableNumber");
      if (saved && !isNaN(Number(saved))) {
        setTableNumber(Number(saved));
      } else {
        localStorage.removeItem("tableNumber");
        setTableNumber(null);
      }
    }
  }, []);

  const menuRef = useRef<HTMLDivElement>(null);

  // Filter and search logic
  const filteredItems = useMemo(() => {
    // When searching, ignore category and filter chips — search entire menu
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return menuItems.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    let items = menuItems;

    // Filter by category
    if (activeCategory !== 'all') {
      items = items.filter((item) => getCategoryId(item.categoryId) === activeCategory);
    }

    // Filter by type
    if (activeFilter === 'veg') {
      items = items.filter((item) => item.isVeg);
    } else if (activeFilter === 'non-veg') {
      items = items.filter((item) => !item.isVeg);
    } else if (activeFilter === 'recommended') {
      items = items.filter((item) => item.isRecommended);
    }

    return items;
  }, [menuItems, activeCategory, activeFilter, searchQuery]);

  // Group items by category for display
  const groupedItems = useMemo(() => {
    if (activeCategory !== 'all' || searchQuery.trim()) {
      // When a category is selected or search is active, show flat list
      return [{ items: filteredItems }];
    }

    // Group by category
    return categories
      .map((category) => ({
        category,
        items: filteredItems.filter((item) => getCategoryId(item.categoryId) === category._id),
      }))
      .filter((group) => group.items.length > 0);
  }, [categories, filteredItems, activeCategory, searchQuery]);

  const scrollToMenu = useCallback(() => {
    if (menuRef.current) {
      const offset = 80;
      const elementPosition = menuRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  }, []);

  // Intersection observer for active category tracking
  useEffect(() => {
    if (activeCategory !== 'all' || searchQuery.trim()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const categoryId = entry.target.id.replace('category-', '');
            if (categoryId && activeCategoryRef.current === 'all') {
              setActiveCategory(categoryId);
              activeCategoryRef.current = categoryId;
            }
          }
        });
      },
      { rootMargin: '-100px 0px -70% 0px' }
    );

    const sections = document.querySelectorAll('[id^="category-"]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [searchQuery]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <SEO title="Loading..." />
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-end">
          <ThemeToggle />
        </div>
        <HeroSkeleton />
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-3 overflow-x-auto hide-scrollbar py-2">
            {[...Array(5)].map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, j) => (
                  <MenuCardSkeleton key={j} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-6">
        <SEO title="Error" />
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <span className="text-4xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  const isShopClosed = !settings.shopOpen;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* SEO */}
      <SEO settings={settings} />

      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <HeroSection settings={settings} onMenuScroll={scrollToMenu} />

      {/* Category Navigation */}
      <div ref={menuRef}>
        <CategoryNavigation
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={(id) => {
            setActiveCategory(id);
            activeCategoryRef.current = id;
          }}
          isSearchOpen={isSearchOpen}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchOpen={() => setIsSearchOpen(true)}
          onSearchClose={() => {
            setIsSearchOpen(false);
            setSearchQuery('');
          }}
        />
      </div>

      {/* Filter Chips */}
      <div className="max-w-7xl mx-auto px-4 pt-2">
        <FilterChips activeFilter={activeFilter} onChange={setActiveFilter} />
      </div>

      {/* Menu Sections */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8 pb-32">
        <AnimatePresence mode="wait">
          {searchQuery.trim() || activeCategory !== 'all' ? (
            // Show flat list when searching or category selected
            <motion.div
              key="filtered"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {searchQuery.trim()
                    ? `Results for "${searchQuery}"`
                    : categories.find((c) => c._id === activeCategory)?.name || 'Menu'}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredItems.length} items
                </span>
              </div>

              {filteredItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🍽️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    No items found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filters
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map((item) => (
                    <MenuCard key={item._id} item={item} disabled={isShopClosed} />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            // Show grouped by category
            <motion.div
              key="grouped"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {groupedItems.map((group) => (
                'category' in group && group.category ? (
                  <MenuSection
                    key={group.category._id}
                    category={group.category}
                    items={group.items}
                    disabled={isShopClosed}
                  />
                ) : null
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Call Waiter FAB — only visible for QR/table-based dine-in sessions */}
      {tableNumber && <CallWaiterButton tableNumber={tableNumber} />}

      {/* Cart Bar */}
      <CartBar disabled={isShopClosed} />

      {/* Shop Closed Overlay */}
      <ShopClosedOverlay settings={settings} isVisible={isShopClosed} />
    </div>
  );
}
