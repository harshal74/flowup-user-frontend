import { motion } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';
import { RestaurantSelector } from '../components/RestaurantSelector';

/**
 * FlowUp Customer Root / Entry Page
 *
 * Shown at https://app.flowup.co.in when there is no restaurant context
 * (no slug in the URL, no ?restaurant= param).
 *
 * Provides a searchable restaurant selector so customers can find and open
 * any FlowUp restaurant without needing a QR code.
 */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Brand header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="mb-5"
          >
            <div className="w-20 h-20 mx-auto bg-orange-100 dark:bg-orange-900/30
                            rounded-3xl flex items-center justify-center">
              <UtensilsCrossed className="w-10 h-10 text-orange-500" />
            </div>
          </motion.div>

          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
            FlowUp
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Order food from your favourite restaurant
          </p>
        </div>

        {/* Restaurant selector */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl
                        border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <RestaurantSelector />
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-600 mt-6 text-center">
          Powered by FlowUp
        </p>
      </motion.div>
    </div>
  );
}
