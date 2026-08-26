import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, CartProvider, RestaurantProvider } from './context';
import { HomePage } from './pages/HomePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SlugResolver } from './components/SlugResolver';
import { LandingPage } from './pages/LandingPage';
import { hasRestaurantId, hasSlugPath, getRestaurantSlug, setRestaurantId } from './utils/restaurantId';

/**
 * On app boot, extract ?restaurant= from the URL and persist it
 * in sessionStorage. This runs once before React renders.
 */
function initRestaurantFromUrl(): void {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('restaurant');
  if (id && id.trim()) {
    setRestaurantId(id.trim());
  }
}

// Run immediately on module load
initRestaurantFromUrl();

function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';

  // Root URL with no restaurant context → intentional FlowUp entry page.
  // (No slug, no ?restaurant= id, and not a resolvable slug path.)
  if (pathname === '/' && !hasRestaurantId() && !hasSlugPath()) {
    return (
      <ThemeProvider>
        <LandingPage />
      </ThemeProvider>
    );
  }

  // If we have a slug-based path (/:slug or /restaurant/:slug) but no
  // restaurantId resolved yet, render the resolver which converts the slug
  // to a restaurantId and reloads.
  const slug = getRestaurantSlug();
  if (slug && !hasRestaurantId()) {
    return <SlugResolver slug={slug} />;
  }

  // If no restaurantId is available and no slug path, show not-found.
  if (!hasRestaurantId() && !hasSlugPath()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
            <span className="text-4xl">🍽️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Restaurant Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Please scan a valid QR code at the restaurant to access the menu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <RestaurantProvider>
          <CartProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/restaurant/:slug" element={<HomePage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
              <Route path="/table/:tableNumber" element={<HomePage />} />
              {/* Root-level slug: app.flowup.co.in/brew-cafe */}
              <Route path="/:slug" element={<HomePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
              }}
            />
          </CartProvider>
        </RestaurantProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
