import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  Phone,
  Home,
  UtensilsCrossed,
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useRestaurant } from '../context';
import { CallWaiterButton } from '../components/common/CallWaiterButton';
import confetti from 'canvas-confetti';

export function OrderSuccessPage() {
  const navigate = useNavigate();
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const { settings } = useRestaurant();

  const rawEstimatedTime = location.state?.estimatedTime;
  const estimatedTime = rawEstimatedTime ? `${rawEstimatedTime} minutes` : '20-30 minutes';
  const orderType = location.state?.orderType || 'DINE_IN';

  // Table number from the order (passed via navigation state or from localStorage)
  const tableNumber = location.state?.tableNumber
    ?? (() => {
      const saved = localStorage.getItem('tableNumber');
      return saved && !isNaN(Number(saved)) ? Number(saved) : null;
    })();

  const isDineIn = orderType === 'DINE_IN' && tableNumber;

  useEffect(() => {
    // Fire confetti
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleCall = () => {
    if (settings?.contactNumber) {
      window.location.href = `tel:${settings.contactNumber}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-900/10 dark:to-gray-950 flex flex-col items-center justify-center p-6">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
        className="mb-8"
      >
        <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', damping: 10 }}
          >
            <CheckCircle className="w-16 h-16 text-white" />
          </motion.div>
        </div>
      </motion.div>

      {/* Success Message */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white text-center mb-3"
      >
        Order Placed Successfully!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-gray-600 dark:text-gray-400 text-center mb-8"
      >
        Thank you for your order
      </motion.p>

      {/* Order Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6"
      >
        {/* Order Number */}
        <div className="bg-primary-600 text-white text-center py-4">
          <p className="text-sm opacity-80 mb-1">Order Number</p>
          <p className="text-2xl font-bold tracking-wider">
            #{orderNumber}
          </p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          {/* Estimated Time */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Estimated Time
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {estimatedTime}
              </p>
            </div>
          </div>

          {/* Order Type */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Order Type
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {orderType === 'DINE_IN' ? 'Dine In' : 'Delivery'}
              </p>
            </div>
          </div>

          {/* Restaurant Contact */}
          {settings?.contactNumber && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleCall}
              className="w-full flex items-center justify-center gap-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Phone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="font-medium text-gray-900 dark:text-white">
                Call Restaurant
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {settings.contactNumber}
              </span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-md space-y-3"
      >
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/')}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          Back to Menu
        </motion.button>
      </motion.div>

      {/* Footer Note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xs text-gray-400 dark:text-gray-500 mt-8 text-center max-w-sm"
      >
        You will be notified once your order is confirmed. Please wait for your order number to be called.
      </motion.p>

      {/* Call Waiter FAB — only for dine-in orders with a table number */}
      {isDineIn && <CallWaiterButton tableNumber={tableNumber as number} />}
    </div>
  );
}
