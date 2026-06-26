import { motion } from 'framer-motion';

interface VegNonVegBadgeProps {
  isVeg: boolean;
  size?: 'sm' | 'md';
}

export function VegNonVegBadge({ isVeg, size = 'md' }: VegNonVegBadgeProps) {
  const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`${sizeClasses} border-2 rounded-sm flex items-center justify-center ${
        isVeg
          ? 'border-green-600 dark:border-green-500'
          : 'border-red-600 dark:border-red-500'
      }`}
    >
      <div
        className={`${dotSize} rounded-full ${
          isVeg
            ? 'bg-green-600 dark:bg-green-500'
            : 'bg-red-600 dark:bg-red-500'
        }`}
      />
    </motion.div>
  );
}
