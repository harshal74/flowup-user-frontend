import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellRing, CheckCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

interface Props {
  tableNumber: number;
  customerName?: string;
  orderId?: string;
}

const COOLDOWN_SECONDS = 120;
const STORAGE_KEY = 'flowup_waiter_ts';

export function CallWaiterButton({ tableNumber, customerName, orderId }: Props) {
  const [sending, setSending]     = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [cooldown, setCooldown]   = useState(0);

  // ── Restore cooldown from localStorage on mount ──────────────
  useEffect(() => {
    const ts = localStorage.getItem(STORAGE_KEY);
    if (ts) {
      const elapsed = Math.floor((Date.now() - Number(ts)) / 1000);
      if (elapsed < COOLDOWN_SECONDS) {
        setCooldown(COOLDOWN_SECONDS - elapsed);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // ── Tick cooldown every second ────────────────────────────────
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          localStorage.removeItem(STORAGE_KEY);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [cooldown > 0]); // only (re)start the interval when cooldown transitions from 0→N

  const handleCall = async () => {
    if (sending || cooldown > 0) return;
    setSending(true);

    try {
      await api.post('/waiter-requests', {
        tableNumber,
        customerName: customerName || '',
        orderId: orderId || undefined,
      });

      // ① Save timestamp so cooldown persists across page navigation
      localStorage.setItem(STORAGE_KEY, String(Date.now()));

      // ② Start 2-min cooldown IMMEDIATELY — button is disabled right away
      setCooldown(COOLDOWN_SECONDS);

      // ③ Show "Waiter is on the way" popup for 2.5 s
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2500);

    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 429) {
        // Server says a duplicate request is already active
        // Still disable the button for the remaining window
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
        setCooldown(COOLDOWN_SECONDS);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2500);
      }
      // For other errors we just re-enable the button silently
    } finally {
      setSending(false);
    }
  };

  const isDisabled = sending || cooldown > 0;

  return (
    <>
      {/* ── Floating Action Button ─────────────────────────────── */}
      <motion.button
        onClick={handleCall}
        disabled={isDisabled}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
        whileTap={!isDisabled ? { scale: 0.9 } : {}}
        aria-label="Call Waiter"
        className={`fixed bottom-24 right-4 z-40 flex flex-col items-center justify-center
                    w-16 h-16 rounded-full shadow-2xl
                    transition-colors duration-200 select-none
                    ${isDisabled
                      ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none'
                      : 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 shadow-orange-400/40'
                    }`}
      >
        {sending
          ? <Loader2 className="w-6 h-6 text-white animate-spin" />
          : <BellRing className={`w-6 h-6 ${isDisabled ? 'text-gray-400 dark:text-gray-500' : 'text-white'}`} />
        }

        {/* Cooldown countdown shown inside the button */}
        {cooldown > 0 && !sending && (
          <span className="text-[9px] font-bold leading-none mt-0.5
                           text-gray-500 dark:text-gray-400">
            {cooldown > 60
              ? `${Math.ceil(cooldown / 60)}m`
              : `${cooldown}s`
            }
          </span>
        )}

        {/* "Call Waiter" label when idle */}
        {!isDisabled && (
          <span className="text-[8px] font-semibold text-white/80 leading-none mt-0.5">
            WAITER
          </span>
        )}
      </motion.button>

      {/* ── "Waiter is coming" centered popup ────────────────────── */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            key="waiter-popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center
                       bg-black/30 backdrop-blur-sm pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.75, opacity: 0, y: 24 }}
              animate={{ scale: 1,    opacity: 1, y: 0  }}
              exit={{    scale: 0.75, opacity: 0, y: 24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="mx-6 px-8 py-8 rounded-3xl shadow-2xl
                         bg-white dark:bg-gray-800
                         flex flex-col items-center gap-4 text-center
                         max-w-xs w-full"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30
                           flex items-center justify-center"
              >
                <CheckCircle className="w-11 h-11 text-green-500" />
              </motion.div>

              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  Waiter is on the way!
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  A staff member will assist you at <strong>Table {tableNumber}</strong> shortly.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
