import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, X, CheckCircle, Loader2, Send } from 'lucide-react';
import api from '../../services/api';
import { getRestaurantId } from '../../utils/restaurantId';

const MOBILE_RE = /^[+]?[\d\s\-()+]{7,20}$/;
const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
  customerName: string;
  mobile:       string;
  email:        string;
  address:      string;
  message:      string;
}

type Errors = Partial<Record<keyof FormState, string>>;

export function DeliveryEnquiryButton() {
  const [open,      setOpen]      = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending,   setSending]   = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    customerName: '',
    mobile:       '',
    email:        '',
    address:      '',
    message:      '',
  });
  const [errors, setErrors] = useState<Errors>({});

  const set = (field: keyof FormState, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    if (sendError) setSendError(null);
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.customerName.trim())         e.customerName = 'Name is required.';
    else if (form.customerName.trim().length > 100) e.customerName = 'Name is too long (max 100 chars).';

    if (!form.mobile.trim())               e.mobile = 'Mobile number is required.';
    else if (!MOBILE_RE.test(form.mobile.trim())) e.mobile = 'Please enter a valid mobile number.';

    if (!form.address.trim())              e.address = 'Delivery address is required.';
    else if (form.address.trim().length > 500)    e.address = 'Address is too long (max 500 chars).';

    if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) e.email = 'Please enter a valid email.';
    if (form.message.length > 1000)        e.message = 'Message is too long (max 1000 chars).';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSending(true);
    setSendError(null);

    try {
      await api.post('/delivery-enquiries', {
        restaurantId: getRestaurantId(),
        customerName: form.customerName.trim(),
        mobile:       form.mobile.trim(),
        email:        form.email.trim(),
        address:      form.address.trim(),
        message:      form.message.trim(),
      });
      setSubmitted(true);
    } catch (err: any) {
      const status = err?.response?.status;
      const msg    = err?.response?.data?.message;
      if (status === 429) {
        setSendError('You have already submitted an enquiry recently. Please wait a few minutes before trying again.');
      } else {
        setSendError(msg || 'Unable to submit your enquiry. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setSendError(null);
      setForm({ customerName: '', mobile: '', email: '', address: '', message: '' });
      setErrors({});
    }, 300);
  };

  const inputCls = (field: keyof FormState) =>
    `w-full rounded-xl border px-4 py-3 text-sm bg-white dark:bg-gray-800
     text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500
     transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40
     ${errors[field]
       ? 'border-red-400 dark:border-red-500'
       : 'border-gray-200 dark:border-gray-700 focus:border-orange-400 dark:focus:border-orange-500'}`;

  return (
    <>
      {/* ── Floating Action Button ───────────────────────────── */}
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.65 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Ask about delivery"
        className="fixed bottom-40 right-4 z-40 flex flex-col items-center justify-center
                   w-16 h-16 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-700
                   active:bg-blue-800 transition-colors shadow-blue-500/40 select-none"
      >
        <Truck className="w-6 h-6 text-white" />
        <span className="text-[8px] font-semibold text-white/80 leading-none mt-0.5">DELIVER</span>
      </motion.button>

      {/* ── Modal / Bottom Sheet ─────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="de-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                       bg-black/40 backdrop-blur-sm"
            onClick={ev => { if (ev.target === ev.currentTarget) handleClose(); }}
          >
            <motion.div
              key="de-sheet"
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full sm:max-w-md bg-white dark:bg-gray-900
                         rounded-t-3xl sm:rounded-3xl shadow-2xl
                         flex flex-col overflow-hidden"
              style={{ maxHeight: '90dvh' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4
                              border-b border-gray-100 dark:border-gray-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30
                                  flex items-center justify-center">
                    <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                      Delivery Enquiry
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Ask about delivery to your location
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  aria-label="Close"
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800
                             text-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1 px-6 py-5">
                <AnimatePresence mode="wait">
                  {/* ── Success state ─────────────────────── */}
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-10 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                        className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30
                                   flex items-center justify-center mb-5"
                      >
                        <CheckCircle className="w-11 h-11 text-green-500" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Enquiry Sent Successfully
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                        Thanks! The restaurant has received your delivery enquiry and will contact you shortly.
                      </p>
                      <button
                        onClick={handleClose}
                        className="mt-8 px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-600
                                   text-white font-semibold text-sm transition-colors"
                      >
                        Done
                      </button>
                    </motion.div>
                  ) : (
                    /* ── Form ──────────────────────────────── */
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onSubmit={handleSubmit}
                      noValidate
                      className="space-y-4"
                    >
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Name <span className="text-orange-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.customerName}
                          onChange={e => set('customerName', e.target.value)}
                          className={inputCls('customerName')}
                          placeholder="Your full name"
                          autoComplete="name"
                        />
                        {errors.customerName && (
                          <p className="mt-1 text-xs text-red-500">{errors.customerName}</p>
                        )}
                      </div>

                      {/* Mobile */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Mobile Number <span className="text-orange-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={form.mobile}
                          onChange={e => set('mobile', e.target.value)}
                          className={inputCls('mobile')}
                          placeholder="+91 98765 43210"
                          autoComplete="tel"
                          inputMode="tel"
                        />
                        {errors.mobile && (
                          <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>
                        )}
                      </div>

                      {/* Delivery Address */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Delivery Address <span className="text-orange-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.address}
                          onChange={e => set('address', e.target.value)}
                          className={inputCls('address')}
                          placeholder="Street, locality, city, pincode"
                          autoComplete="street-address"
                        />
                        {errors.address && (
                          <p className="mt-1 text-xs text-red-500">{errors.address}</p>
                        )}
                      </div>

                      {/* Email (optional) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Email{' '}
                          <span className="text-xs text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={e => set('email', e.target.value)}
                          className={inputCls('email')}
                          placeholder="you@example.com"
                          autoComplete="email"
                          inputMode="email"
                        />
                        {errors.email && (
                          <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                        )}
                      </div>

                      {/* Message (optional) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Message{' '}
                          <span className="text-xs text-gray-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                          rows={3}
                          value={form.message}
                          onChange={e => set('message', e.target.value)}
                          className={`${inputCls('message')} resize-none`}
                          placeholder="Ask us anything about delivery — availability, timing, charges…"
                        />
                        {errors.message && (
                          <p className="mt-1 text-xs text-red-500">{errors.message}</p>
                        )}
                      </div>

                      {/* API error */}
                      {sendError && (
                        <p className="text-sm text-red-600 dark:text-red-400
                                      bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3">
                          {sendError}
                        </p>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={sending}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                                   bg-orange-500 hover:bg-orange-600 disabled:opacity-60
                                   disabled:cursor-not-allowed text-white font-semibold text-sm
                                   transition-colors shadow-sm"
                      >
                        {sending
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                          : <><Send className="w-4 h-4" /> Submit Enquiry</>
                        }
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
