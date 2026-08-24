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

/**
 * Extract restaurant slug from path-based URL: /restaurant/:slug
 */
function getSlugFromPath(): string | null {
  const match = window.location.pathname.match(/^\/restaurant\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
  return match ? match[1] : null;
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
