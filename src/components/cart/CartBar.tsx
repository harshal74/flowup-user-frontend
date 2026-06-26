import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, X, ShoppingBag } from 'lucide-react';
import { useCart, useRestaurant } from '../../context';
import { useNavigate } from 'react-router-dom';

interface CartBarProps {
  disabled?: boolean;
}

export function CartBar({ disabled }: CartBarProps) {
  const { items, totalItems, subtotal, updateQuantity, removeItem } = useCart();
  const { settings } = useRestaurant();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const deliveryCharge = settings?.deliveryCharge || 0;
  const minimumOrder = settings?.minimumOrderAmount || 0;

  if (totalItems === 0 || disabled) return null;

  const handleCheckout = () => {
    setIsDrawerOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      {/* Sticky Cart Bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 p-4 safe-bottom pointer-events-none"
      >
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsDrawerOpen(true)}
          className="pointer-events-auto max-w-7xl mx-auto w-full bg-primary-600 text-white rounded-2xl shadow-2xl shadow-primary-600/30 overflow-hidden relative"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-white text-primary-600 text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              </div>
              <span className="font-semibold">View Cart</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary-200 text-sm">₹{subtotal}</span>
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Visual indicator */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary-500/30">
            <motion.div
              className="h-full bg-white/30"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((subtotal / (minimumOrder || 200)) * 100, 100)}%` }}
            />
          </div>
        </motion.button>
      </motion.div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-[55] max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2 bg-white dark:bg-gray-900 z-10">
                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Your Cart
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({totalItems} items)
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.menuItem._id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3"
                    >
                      {/* Image */}
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                          {item.menuItem.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ₹{item.menuItem.discountedPrice || item.menuItem.price}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.menuItem._id, item.quantity - 1)}
                              className="w-7 h-7 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-600"
                            >
                              <Minus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                            </motion.button>
                            <span className="w-6 text-center font-semibold text-gray-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.menuItem._id, item.quantity + 1)}
                              className="w-7 h-7 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-600"
                            >
                              <Plus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                            </motion.button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              ₹{(item.menuItem.discountedPrice || item.menuItem.price) * item.quantity}
                            </span>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeItem(item.menuItem._id)}
                              className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-4 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 safe-bottom">
                {/* Order Summary */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white font-medium">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Delivery Charge</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {deliveryCharge > 0 ? `₹${deliveryCharge}` : 'FREE'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-semibold text-gray-900 dark:text-white">Grand Total</span>
                    <span className="font-bold text-xl text-gray-900 dark:text-white">
                      ₹{subtotal + deliveryCharge}
                    </span>
                  </div>
                </div>

                {/* Minimum Order Warning */}
                {subtotal < minimumOrder && (
                  <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Minimum order amount is ₹{minimumOrder}. Add ₹{minimumOrder - subtotal} more.
                    </p>
                  </div>
                )}

                {/* Checkout Button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  disabled={subtotal < minimumOrder}
                  className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    subtotal >= minimumOrder
                      ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/30'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  Proceed to Checkout
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
