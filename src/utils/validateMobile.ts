/**
 * FlowUp Frontend Mobile Number Validation Utility
 *
 * Matches the backend logic in backend/src/utils/validateMobile.js.
 *
 * Business rule: Indian 10-digit mobile numbers.
 *   - Exactly 10 digits after stripping non-numeric characters.
 *   - Accepts +91 / 91 prefix (12-digit strings).
 *   - Accepts leading 0 (11 digits → strip leading zero → 10 digits).
 *   - First digit must be 6–9 (valid Indian mobile range).
 *
 * Used by:
 *   - CheckoutPage (customer order)
 *   - DeliveryEnquiryButton (delivery enquiry form)
 */

const INDIAN_MOBILE_RE = /^[6-9]\d{9}$/;

/** Strip non-digits, remove +91/91 prefix, return 10-digit string or null. */
export function stripMobile(value: string): string | null {
  let digits = value.trim().replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0'))  digits = digits.slice(1);
  return digits.length === 10 ? digits : null;
}

/** Returns true if the value is a valid Indian 10-digit mobile number. */
export function isValidMobile(value: string): boolean {
  const digits = stripMobile(value);
  return !!digits && INDIAN_MOBILE_RE.test(digits);
}

/** Returns the canonical 10-digit string. Throws if invalid — validate first. */
export function normalizeMobile(value: string): string {
  const digits = stripMobile(value);
  if (!digits || !INDIAN_MOBILE_RE.test(digits)) {
    throw new Error(`Invalid mobile number: ${value}`);
  }
  return digits;
}

export const MOBILE_ERROR_MESSAGE =
  'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
