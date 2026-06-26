import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star, ChevronDown, ChevronUp } from 'lucide-react';
import type { MenuItem } from '../../types';
import { VegNonVegBadge } from '../common/VegNonVegBadge';
import { useCart } from '../../context';

interface MenuCardProps {
  item: MenuItem;
  disabled?: boolean;
}

export function MenuCard({ item, disabled = false }: MenuCardProps) {
  const { addItem, items } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const cartItem = items.find((i) => i.menuItem._id === item._id);
  const quantity = cartItem?.quantity || 0;

  const price = item.discountedPrice || item.price;
  const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;

  const handleAddClick = () => {
    if (disabled) return;
    addItem(item);
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="menu-card group cursor-pointer"
        onClick={() => !disabled && setIsModalOpen(true)}
      >
        {/* Image Container */}
        <div className="relative h-40 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
          )}
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${!item.isAvailable || disabled ? 'grayscale' : ''}`}
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            <VegNonVegBadge isVeg={item.isVeg} />
            {item.isRecommended && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-full"
              >
                <Star className="w-3 h-3 fill-current" />
                Recommended
              </motion.span>
            )}
          </div>

          {/* Unavailable Badge */}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 font-medium px-3 py-1.5 rounded-full text-sm">
                Unavailable
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
            {item.name}
          </h3>

          {item.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
              {item.description}
            </p>
          )}

          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-gray-900 dark:text-white">₹{price}</span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{item.price}
                </span>
              )}
            </div>

            {/* Add Button or Quantity Badge */}
            {item.isAvailable && !disabled ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddClick();
                }}
                className={`${quantity > 0 ? 'w-auto px-3' : 'w-10'} h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg shadow-primary-600/30 flex items-center justify-center gap-1 transition-all duration-200`}
              >
                {quantity > 0 ? (
                  <>
                    <span className="text-sm font-medium">{quantity}</span>
                    <Plus className="w-4 h-4" />
                  </>
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </motion.button>
            ) : null}
          </div>
        </div>
      </motion.article>

      {/* Modal/Item Detail Drawer */}
      <ItemDetailModal
        item={item}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        disabled={disabled}
      />
    </>
  );
}

interface ItemDetailModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  disabled?: boolean;
}

function ItemDetailModal({ item, isOpen, onClose, disabled }: ItemDetailModalProps) {
  const { addItem, removeItem, updateQuantity, items } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const cartItem = items.find((i) => i.menuItem._id === item._id);
  const quantity = cartItem?.quantity || 0;

  const price = item.discountedPrice || item.price;
  const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-[70] max-h-[85vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 pt-3 pb-2 px-4 flex justify-center z-10">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
            </div>

            {/* Image */}
            <div className="relative h-64 bg-gray-100 dark:bg-gray-800">
              {!imageLoaded && (
                <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
              )}
              <img
                src={item.image}
                alt={item.name}
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                } ${!item.isAvailable || disabled ? 'grayscale' : ''}`}
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <VegNonVegBadge isVeg={item.isVeg} size="md" />
                {item.isRecommended && (
                  <span className="flex items-center gap-1 bg-amber-500 text-white text-sm font-medium px-3 py-1.5 rounded-full">
                    <Star className="w-4 h-4 fill-current" />
                    Recommended
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {item.name}
                </h2>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{price}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        ₹{item.price}
                      </span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {Math.round(((item.price - (item.discountedPrice || item.price)) / item.price) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                {item.description && (
                  <div>
                    <p
                      className={`text-gray-600 dark:text-gray-400 ${
                        showFullDescription ? '' : 'line-clamp-3'
                      }`}
                    >
                      {item.description}
                    </p>
                    {item.description.length > 100 && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="flex items-center gap-1 text-primary-600 dark:text-primary-400 text-sm font-medium mt-1"
                      >
                        {showFullDescription ? (
                          <>
                            Show less <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            Show more <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Unavailable Message */}
              {!item.isAvailable && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <p className="text-red-600 dark:text-red-400 font-medium">
                    This item is currently unavailable
                  </p>
                </div>
              )}

              {/* Add to Cart Section */}
              {item.isAvailable && !disabled && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between gap-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item._id, quantity - 1)}
                        disabled={quantity === 0}
                        className={`quantity-btn ${
                          quantity === 0
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <span className="text-lg font-medium text-gray-600 dark:text-gray-300">−</span>
                      </motion.button>

                      <span className="w-8 text-center text-lg font-semibold text-gray-900 dark:text-white">
                        {quantity}
                      </span>

                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => addItem(item)}
                        className="quantity-btn hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <span className="text-lg font-medium text-gray-600 dark:text-gray-300">+</span>
                      </motion.button>
                    </div>

                    {/* Add Button */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (quantity === 0) {
                          addItem(item);
                        }
                        onClose();
                      }}
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      {quantity > 0 ? (
                        <>
                          Added − ₹{price * quantity}
                        </>
                      ) : (
                        <>
                          Add to Cart − ₹{price}
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Remove Button */}
              {quantity > 0 && item.isAvailable && !disabled && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    removeItem(item._id);
                  }}
                  className="w-full py-3 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  Remove from Cart
                </motion.button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
