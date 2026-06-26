import { motion } from 'framer-motion';
import { Phone, MessageCircle, Star, Clock, MapPin } from 'lucide-react';
import type { RestaurantSettings } from '../../types';

interface HeroSectionProps {
  settings: RestaurantSettings;
  onMenuScroll: () => void;
}

export function HeroSection({ settings, onMenuScroll }: HeroSectionProps) {
  const handleCall = () => {
    window.location.href = `tel:${settings.contactNumber}`;
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${settings.whatsappNumber}`, '_blank');
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Logo */}
          {settings.restaurantLogo && (
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              src={settings.restaurantLogo}
              alt={settings.restaurantName}
              className="w-24 h-24 mx-auto mb-4 rounded-2xl shadow-lg object-cover"
            />
          )}

          {/* Restaurant Name */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2"
          >
            {settings.restaurantName}
          </motion.h1>

          {/* Description */}
          {settings.restaurantDescription && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-sm sm:text-base mb-4"
            >
              {settings.restaurantDescription}
            </motion.p>
          )}

          {/* Rating and Status Row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="flex items-center justify-center gap-4 flex-wrap mb-4"
          >
            {/* Rating */}
            {settings.rating && (
              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                  {settings.rating}
                </span>
                {settings.totalReviews && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({settings.totalReviews} reviews)
                  </span>
                )}
              </div>
            )}

            {/* Open/Closed Status */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm ${
                settings.shopOpen
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  settings.shopOpen
                    ? 'bg-green-500 animate-pulse'
                    : 'bg-red-500'
                }`}
              />
              <span className="font-medium text-sm">
                {settings.shopOpen ? 'Open Now' : 'Closed'}
              </span>
            </div>

            {/* Timing */}
            {settings.openingTime && settings.closingTime && (
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {formatTime(settings.openingTime)} - {formatTime(settings.closingTime)}
                </span>
              </div>
            )}
          </motion.div>

          {/* Address */}
          {settings.address && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 text-sm mb-6"
            >
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{settings.address}</span>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onMenuScroll}
              className="btn-primary px-8"
            >
              View Menu
            </motion.button>

            {settings.contactNumber && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCall}
                className="btn-secondary flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </motion.button>
            )}

            {settings.whatsappNumber && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleWhatsApp}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-green-600/25"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
