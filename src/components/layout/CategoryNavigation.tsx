import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import type { Category } from '../../types';

interface CategoryNavigationProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  onSearchOpen: () => void;
  isSearchOpen: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchClose: () => void;
}

export function CategoryNavigation({
  categories,
  activeCategory,
  onCategoryChange,
  onSearchOpen,
  isSearchOpen,
  searchValue,
  onSearchChange,
  onSearchClose,
}: CategoryNavigationProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const navHeight = 64;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navHeight - 16,
        behavior: 'smooth',
      });
    }
    onCategoryChange(categoryId);
  };

  return (
    <div
      ref={navRef}
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isSticky
          ? 'glass shadow-lg'
          : ''
      }`}
    >
      <div
        ref={containerRef}
        className={`max-w-7xl mx-auto px-4 py-3 ${
          isSticky ? '' : ''
        }`}
      >
        <AnimatePresence mode="wait">
          {isSearchOpen ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search menu..."
                  autoFocus
                  className="w-full bg-gray-100 dark:bg-gray-800 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-gray-900 dark:text-gray-100"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onSearchClose}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="categories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              {/* Search Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onSearchOpen}
                className="flex-shrink-0 p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </motion.button>

              {/* Category Pills */}
              <div className="flex gap-2 overflow-x-auto hide-scrollbar flex-1 pb-1">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onCategoryChange('all')}
                  className={`category-chip ${
                    activeCategory === 'all'
                      ? 'category-chip-active'
                      : 'category-chip-inactive'
                  }`}
                >
                  All
                </motion.button>

                {categories.map((category) => (
                  <motion.button
                    key={category._id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => scrollToCategory(category._id)}
                    className={`category-chip ${
                      activeCategory === category._id
                        ? 'category-chip-active'
                        : 'category-chip-inactive'
                    }`}
                  >
                    {category.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
