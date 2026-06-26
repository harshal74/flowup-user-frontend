import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Phone, MapPin, UtensilsCrossed } from 'lucide-react';
import type { RestaurantSettings } from '../../types';

interface ShopClosedOverlayProps {
  settings: RestaurantSettings;
  isVisible: boolean;
}

export function ShopClosedOverlay({ settings, isVisible }: ShopClosedOverlayProps) {
  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          {/* Blurred Background */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: settings.restaurantLogo ? `url(${settings.restaurantLogo})` : undefined,
            }}
          />
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-950/90 backdrop-blur-xl" />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative max-w-md w-full text-center"
          >
            {/* Illustration */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 15 }}
              className="mb-6"
            >
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full flex items-center justify-center shadow-2xl">
                <UtensilsCrossed className="w-16 h-16 text-primary-600 dark:text-primary-400" />
              </div>
            </motion.div>

            {/* Message */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3"
            >
              Kitchen is Currently Closed
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 dark:text-gray-400 mb-6"
            >
              We are temporarily closed for orders. Please come back later or browse our menu.
            </motion.p>

            {/* Timing Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6"
            >
              <div className="space-y-4">
                {/* Opening Hours */}
                <div className="flex items-center gap-3 justify-center">
                  <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Opening Hours</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {settings.openingTime && settings.closingTime
                        ? `${formatTime(settings.openingTime)} - ${formatTime(settings.closingTime)}`
                        : 'Contact restaurant for timings'}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 dark:border-gray-700" />

                {/* Contact Info */}
                {settings.contactNumber && (
                  <div className="flex items-center gap-3 justify-center">
                    <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <a
                      href={`tel:${settings.contactNumber}`}
                      className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
                    >
                      {settings.contactNumber}
                    </a>
                  </div>
                )}

                {/* Address */}
                {settings.address && (
                  <div className="flex items-start gap-3 justify-center">
                    <MapPin className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 dark:text-gray-300 text-sm text-center">
                      {settings.address}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              {settings.contactNumber && (
                <motion.a
                  whileTap={{ scale: 0.95 }}
                  href={`tel:${settings.contactNumber}`}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl font-semibold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Call Restaurant
                </motion.a>
              )}

              {settings.whatsappNumber && (
                <motion.a
                  whileTap={{ scale: 0.95 }}
                  href={`https://wa.me/${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 rounded-xl font-semibold text-white shadow-lg shadow-green-600/25 transition-colors"
                >
                  <span>WhatsApp</span>
                </motion.a>
              )}
            </motion.div>

            {/* Bottom Note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xs text-gray-400 dark:text-gray-500 mt-6"
            >
              You can still browse our menu while we're closed
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
