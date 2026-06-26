import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = '', variant = 'text', width, height }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-xl',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

export function MenuCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700/50">
      <Skeleton variant="rectangular" className="w-full h-40" />
      <div className="p-3 space-y-2">
        <Skeleton variant="text" className="w-3/4 h-5" />
        <Skeleton variant="text" className="w-full h-3" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton variant="text" className="w-20 h-4" />
          <Skeleton variant="circular" className="w-10 h-10" />
        </div>
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <Skeleton variant="rounded" className="h-10 w-24 rounded-full" />
  );
}

export function HeroSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton variant="circular" className="w-20 h-20 mx-auto" />
      <Skeleton variant="text" className="w-48 h-8 mx-auto" />
      <Skeleton variant="text" className="w-64 h-4 mx-auto" />
      <div className="flex gap-3 justify-center pt-2">
        <Skeleton variant="rounded" className="w-32 h-12 rounded-xl" />
        <Skeleton variant="rounded" className="w-32 h-12 rounded-xl" />
      </div>
    </div>
  );
}
