import { motion } from 'framer-motion';
import { UtensilsCrossed, QrCode } from 'lucide-react';

/**
 * FlowUp Customer Root / Entry Page
 *
 * Shown at the customer app root (e.g. https://app.flowup.co.in) when there
 * is NO restaurant context (no slug, no ?restaurant= id).
 *
 * FlowUp does not currently expose a public restaurant directory/search, so
 * this is an intentional entry page that guides the visitor to access a
 * restaurant via its QR code or direct link — it does NOT pretend a
 * marketplace exists and does NOT auto-load a random restaurant.
 */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md w-full"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto bg-primary-100 dark:bg-primary-900/30 rounded-3xl flex items-center justify-center">
            <UtensilsCrossed className="w-12 h-12 text-primary-600 dark:text-primary-400" />
          </div>
        </motion.div>

        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          FlowUp
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Order food quickly from your table or online — no app install needed.
        </p>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-left space-y-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                Scan a table QR code
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                Scan the QR code on your table to open that restaurant's menu.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                Use a restaurant link
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                Open the direct link a restaurant shared with you to start ordering.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-600 mt-8">
          Powered by FlowUp
        </p>
      </motion.div>
    </div>
  );
}
