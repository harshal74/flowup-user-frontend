import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  MessageSquare,
  Loader2,
  CheckCircle,
  Navigation,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart, useRestaurant } from '../context';
import { orderService } from '../services';
import type { OrderType } from '../types';
import toast from 'react-hot-toast';

const CUSTOMER_STORAGE_KEY = 'flowup_customer';

interface SavedCustomer {
  name: string;
  mobile: string;
  address: string;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { settings } = useRestaurant();

  const [orderType, setOrderType] = useState<OrderType>('DELIVERY');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [tableNumber, setTableNumber] =
  useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Load saved customer details from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (saved) {
        const customer = JSON.parse(saved) as SavedCustomer;
        if (customer.name) setName(customer.name);
        if (customer.mobile) setMobile(customer.mobile);
        if (customer.address) setAddress(customer.address);
      }
    } catch {
      // ignore
    }
  }, []);


useEffect(() => {
  const savedTable =
    localStorage.getItem(
      "tableNumber"
    );

  if (
    savedTable &&
    !isNaN(
      Number(savedTable)
    )
  ) {
    setTableNumber(
      Number(savedTable)
    );

    setOrderType(
      "DINE_IN"
    );
  }
}, []);

const isQrTableOrder =
  tableNumber !== null;

const isTableOrder = !!tableNumber;

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/');
    }
  }, [items.length, navigate]);

  if (items.length === 0) {
    return null;
  }

  const deliveryCharge = orderType === 'DELIVERY' ? (settings?.deliveryCharge || 0) : 0;
  const totalAmount = subtotal + deliveryCharge;

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      const locationStr = `\nLat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
      setAddress((prev) => prev + (prev ? locationStr : locationStr));
      toast.success('Location added successfully');
    } catch {
      toast.error('Failed to get location. Please enable location access.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();

  // Prevent double click orders
  if (isLoading) return;

  // Restaurant closed check
  if (!settings?.shopOpen) {
    toast.error("Restaurant is currently closed");
    return;
  }

  // Minimum order validation
  if (
    orderType === "DELIVERY" &&
    subtotal <
      (settings?.minimumOrderAmount || 0)
  ) {
    toast.error(
      `Minimum order amount is ₹${settings.minimumOrderAmount}`
    );
    return;
  }

  // Name validation
  if (!name.trim()) {
    toast.error("Please enter your name");
    return;
  }

  // Mobile validation
  if (
    !mobile.trim() ||
    !/^\d{10}$/.test(
      mobile.replace(/\D/g, "")
    )
  ) {
    toast.error(
      "Please enter a valid 10-digit mobile number"
    );
    return;
  }

  // Delivery address validation
  if (
    orderType === "DELIVERY" &&
    !address.trim()
  ) {
    toast.error(
      "Please enter your delivery address"
    );
    return;
  }

  // Dine in validation
  if (
    orderType === "DINE_IN" &&
    !tableNumber
  ) {
    toast.error(
      "Please enter table number"
    );
    return;
  }

  setIsLoading(true);

  try {
    const orderItems = items.map(
      (item) => ({
        menuId:
          item.menuItem._id,
        quantity:
          item.quantity,
      })
    );

    const orderPayload = {
      orderType,

      tableNumber:
        orderType ===
          "DINE_IN" &&
        tableNumber
          ? Number(
              tableNumber
            )
          : undefined,

      customer: {
        name:
          name.trim(),

        mobile:
          mobile.trim(),

        address:
          orderType ===
          "DELIVERY"
            ? address.trim()
            : undefined,
      },

      items: orderItems,

      note:
        notes.trim() ||
        undefined,
    };

    const response =
      await orderService.placeOrder(
        orderPayload
      );

    // Save customer details
    localStorage.setItem(
      CUSTOMER_STORAGE_KEY,
      JSON.stringify({
        name:
          name.trim(),

        mobile:
          mobile.trim(),

        address:
          address.trim(),
      })
    );

    clearCart();

    toast.success(
      "Order placed successfully!"
    );

localStorage.removeItem(
  "tableNumber"
);

    navigate(
      `/order-success/${response.orderNumber}`,
      {
        state: {
          estimatedTime:
            response.estimatedTime,

          orderType,
        },
      }
    );
  } catch (error: any) {
    console.error(
      "Order error:",
      error
    );

    toast.error(
      error?.response?.data
        ?.message ||
        "Failed to place order. Please try again."
    );
  } finally {
    setIsLoading(false);
  }
};

  const isTableFromUrl =
  tableNumber !== null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Checkout</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-32">
        {/* Order Type Selection */}
        {!isTableFromUrl && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm"
          >
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
              Order Type
            </h2>
           {!isTableOrder ? (
  <div className="grid grid-cols-2 gap-3">
    <motion.button
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={() => setOrderType("DINE_IN")}
      className={`p-4 rounded-xl border-2 transition-all ${
        orderType === "DINE_IN"
          ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      <div className="text-center">
        <div
          className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
            orderType === "DINE_IN"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
          }`}
        >
          <User className="w-6 h-6" />
        </div>

        <p
          className={`font-semibold ${
            orderType === "DINE_IN"
              ? "text-primary-600 dark:text-primary-400"
              : "text-gray-900 dark:text-white"
          }`}
        >
          Dine In
        </p>
      </div>
    </motion.button>

    <motion.button
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={() => setOrderType("DELIVERY")}
      className={`p-4 rounded-xl border-2 transition-all ${
        orderType === "DELIVERY"
          ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      <div className="text-center">
        <div
          className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
            orderType === "DELIVERY"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
          }`}
        >
          <MapPin className="w-6 h-6" />
        </div>

        <p
          className={`font-semibold ${
            orderType === "DELIVERY"
              ? "text-primary-600 dark:text-primary-400"
              : "text-gray-900 dark:text-white"
          }`}
        >
          Delivery
        </p>
      </div>
    </motion.button>
  </div>
) : (
  <div className="p-4 rounded-xl border-2 border-primary-600 bg-primary-50 dark:bg-primary-900/20">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center">
        <User className="w-6 h-6" />
      </div>

      <div>
        <p className="font-bold text-primary-600 dark:text-primary-400">
          Dine In Order
        </p>

        <p className="text-sm text-gray-600 dark:text-gray-300">
          Table {tableNumber} detected from QR Code
        </p>
      </div>
    </div>
  </div>
)}
          </motion.section>
        )}

        {/* Order Summary */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
            Order Summary
          </h2>
          <div className="space-y-3">
            {items.map((item, index) => (
              <motion.div
                key={item.menuItem._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                <img
                  src={item.menuItem.image}
                  alt={item.menuItem.name}
                  className="w-14 h-14 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                    {item.menuItem.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    x{item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  ₹{(item.menuItem.discountedPrice || item.menuItem.price) * item.quantity}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Customer Details Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm space-y-4"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2">
            Customer Details
          </h2>

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Mobile */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={mobile}
                onChange={(e) =>
  setMobile(
    e.target.value
      .replace(/\D/g, "")
      .slice(0, 10)
  )
}
                placeholder="10-digit mobile number"
                className="input-field pl-10"
                maxLength={10}
              />
            </div>
          </div>

          {/* Table Number (Dine In) */}
          <AnimatePresence>
            {orderType === "DINE_IN" && (
  <div>
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
      Table Number
    </label>

    <input
      type="number"
      value={tableNumber || ""}
      disabled={isQrTableOrder}
      onChange={(e) =>
        setTableNumber(
          Number(e.target.value)
        )
      }
      className={`input-field ${
        isQrTableOrder
          ? "bg-gray-100 cursor-not-allowed"
          : ""
      }`}
      placeholder="Enter table number"
    />

    {isQrTableOrder && (
      <p className="mt-1 text-xs text-green-600">
        Table detected from QR Code
      </p>
    )}
  </div>
)}
          </AnimatePresence>

          {/* Address (Delivery) */}
          <AnimatePresence>
            {orderType === 'DELIVERY' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full delivery address..."
                  rows={3}
                  className="input-field resize-none"
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="mt-2 flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 font-medium"
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Getting location...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      Add my location
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Order Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Order Notes (Optional)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions..."
                rows={2}
                className="input-field pl-10 resize-none"
              />
            </div>
          </div>
        </motion.form>

        {/* Bill Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
            Bill Details
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Item Total</span>
              <span>₹{subtotal}</span>
            </div>
            {orderType === 'DELIVERY' && (
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery Charge</span>
                <span>{deliveryCharge > 0 ? `₹${deliveryCharge}` : 'FREE'}</span>
              </div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold text-gray-900 dark:text-white">
              <span>To Pay</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sticky Place Order Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 safe-bottom">
        <div className="max-w-2xl mx-auto">
          <motion.button
  whileTap={{ scale: 0.98 }}
  onClick={() => handleSubmit()}
  disabled={
    isLoading ||
    !settings?.shopOpen
  }
  className={`w-full flex items-center justify-center gap-2 ${
    !settings?.shopOpen
      ? "bg-gray-400 cursor-not-allowed text-white py-4 rounded-xl"
      : "btn-primary"
  }`}
>
  {isLoading ? (
    <>
      <Loader2 className="w-5 h-5 animate-spin" />
      Placing Order...
    </>
  ) : !settings?.shopOpen ? (
    <>
      <CheckCircle className="w-5 h-5" />
      Restaurant Closed
    </>
  ) : (
    <>
      <CheckCircle className="w-5 h-5" />
      Place Order − ₹{totalAmount}
    </>
  )}
</motion.button>
        </div>
      </div>
    </div>
  );
}
