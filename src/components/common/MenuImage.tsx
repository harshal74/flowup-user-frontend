import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface Props {
  src?: string;
  alt: string;
  className?: string;
}

/**
 * MenuImage — displays a menu item image with a clean fallback icon
 * when the image fails to load, is missing, or has an invalid URL.
 */
export function MenuImage({ src, alt, className = '' }: Props) {
  const [failed, setFailed] = useState(!src);

  if (failed || !src) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${className}`}>
        <UtensilsCrossed className="w-8 h-8 text-gray-300 dark:text-gray-500" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
