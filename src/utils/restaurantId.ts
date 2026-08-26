/**
 * Multi-Tenant Restaurant ID Resolution
 *
 * Priority:
 * 1. URL query param: ?restaurant=flw_xxxxxxxx
 * 2. Previously stored restaurantId (from a QR scan in this session)
 * 3. VITE_RESTAURANT_ID env var (backward compat during migration)
 *
 * Once resolved, the ID is stored in sessionStorage so it persists
 * across page navigations within the same tab/session but not across
 * different restaurant visits in new tabs.
 */

const STORAGE_KEY = 'flowup_restaurantId';
const SLUG_KEY = 'flowup_restaurantSlug';

/**
 * Extract restaurantId from the current URL query string.
 * Returns null if not present.
 */
function getFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('restaurant') || null;
}

// Path segments that are real app routes, NOT restaurant slugs.
// A root-level path like /brew-cafe is treated as a slug ONLY if the first
// segment is not one of these reserved app routes.
const RESERVED_PATHS = new Set([
  'checkout', 'order-success', 'table', 'restaurant',
]);

const SLUG_SEGMENT_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Extract restaurant slug from the URL path.
 *
 * Supports two shapes (backward compatible):
 *   1. /restaurant/:slug   (legacy explicit form — kept working)
 *   2. /:slug              (root-level public form — app.flowup.co.in/brew-cafe)
 *
 * Returns null if the path doesn't contain a resolvable slug.
 */
function getSlugFromPath(): string | null {
  const path = window.location.pathname.replace(/\/+$/, ''); // strip trailing slash

  // Legacy: /restaurant/:slug
  const explicit = path.match(/^\/restaurant\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
  if (explicit) return explicit[1];

  // Root-level: /:slug  (single segment only)
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 1) {
    const seg = segments[0].toLowerCase();
    if (SLUG_SEGMENT_RE.test(seg) && !RESERVED_PATHS.has(seg)) {
      return seg;
    }
  }

  return null;
}

/**
 * Get the active restaurantId for this session.
 * Call this from anywhere that needs the restaurant context.
 */
export function getRestaurantId(): string {
  // 1. Check URL query param — always takes priority (fresh QR scan)
  const fromUrl = getFromUrl();
  if (fromUrl && fromUrl.trim()) {
    sessionStorage.setItem(STORAGE_KEY, fromUrl.trim());
    sessionStorage.removeItem(SLUG_KEY);
    return fromUrl.trim();
  }

  // 2. Check sessionStorage (already resolved in this tab)
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored && stored.trim()) {
    return stored.trim();
  }

  // 3. Fallback to env var (single-tenant backward compat)
  const envId = (import.meta.env.VITE_RESTAURANT_ID as string) || '';
  if (envId.trim()) {
    sessionStorage.setItem(STORAGE_KEY, envId.trim());
    return envId.trim();
  }

  return '';
}

/**
 * Get the restaurant slug if the user arrived via /restaurant/:slug URL.
 * Returns null if no slug-based access was used.
 */
export function getRestaurantSlug(): string | null {
  return sessionStorage.getItem(SLUG_KEY) || getSlugFromPath();
}

/**
 * Check whether we have a valid restaurantId already resolved.
 * Does NOT consider slug presence — slug must be resolved first.
 */
export function hasRestaurantId(): boolean {
  return getRestaurantId().length > 0;
}

/**
 * Check whether a slug-based URL is being accessed (needs resolution).
 */
export function hasSlugPath(): boolean {
  return !!getSlugFromPath();
}

/**
 * Force-set the restaurantId (e.g., after resolving from slug).
 */
export function setRestaurantId(id: string): void {
  if (id && id.trim()) {
    sessionStorage.setItem(STORAGE_KEY, id.trim());
  }
}

/**
 * Store the slug for reference (e.g., after resolving via API).
 */
export function setRestaurantSlug(slug: string): void {
  if (slug && slug.trim()) {
    sessionStorage.setItem(SLUG_KEY, slug.trim());
  }
}
