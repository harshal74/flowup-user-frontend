import { motion } from 'framer-motion';
import type { MenuItem, Category } from '../../types';
import { MenuCard } from './MenuCard';

interface MenuSectionProps {
  category: Category;
  items: MenuItem[];
  disabled?: boolean;
}

export function MenuSection({ category, items, disabled }: MenuSectionProps) {
  if (items.length === 0) return null;

  return (
    <section
      id={`category-${category._id}`}
      className="scroll-mt-28"
    >
      {/* Category Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="py-3 mb-2 border-b border-gray-100 dark:border-gray-800"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {category.name}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {items.length} items
          </span>
        </div>
        {category.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {category.description}
          </p>
        )}
      </motion.div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            <MenuCard item={item} disabled={disabled} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
