import { motion } from 'framer-motion';
import { Leaf, Flame, Star, Check } from 'lucide-react';

type FilterType = 'all' | 'veg' | 'non-veg' | 'recommended';

interface FilterChipsProps {
  activeFilter: FilterType;
  onChange: (filter: FilterType) => void;
}

const filters: { id: FilterType; label: string; icon: typeof Leaf }[] = [
  { id: 'all', label: 'All', icon: Star },
  { id: 'veg', label: 'Veg', icon: Leaf },
  { id: 'non-veg', label: 'Non-Veg', icon: Flame },
  { id: 'recommended', label: 'Recommended', icon: Star },
];

export function FilterChips({ activeFilter, onChange }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.id;

        return (
          <motion.button
            key={filter.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(filter.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              isActive
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {filter.id === 'veg' ? (
              <span className="w-4 h-4 border-2 border-current rounded-sm flex items-center justify-center">
                {isActive && <Check className="w-2.5 h-2.5" />}
              </span>
            ) : filter.id === 'non-veg' ? (
              <span className="w-4 h-4 border-2 border-current rounded-sm flex items-center justify-center">
                {isActive && <Check className="w-2.5 h-2.5" />}
              </span>
            ) : (
              <Icon className="w-4 h-4" />
            )}
            <span>{filter.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
