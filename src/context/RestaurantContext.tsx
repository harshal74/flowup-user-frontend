import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { RestaurantSettings, Category, MenuItem } from '../types';
import { settingsService, categoryService, menuService } from '../services';

interface RestaurantContextType {
  settings: RestaurantSettings | null;
  categories: Category[];
  menuItems: MenuItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [settingsData, categoriesData, menuData] = await Promise.all([
        settingsService.getSettings(),
        categoryService.getCategories(),
        menuService.getMenuItems(),
      ]);

      setSettings(settingsData);
      setCategories(categoriesData.sort((a, b) => a.displayOrder - b.displayOrder));
      setMenuItems(menuData);

      // Update browser tab title and favicon from restaurant settings
      if (settingsData?.restaurantName) {
        document.title = settingsData.restaurantName;
      }
      if (settingsData?.restaurantLogo) {
        const link: HTMLLinkElement =
          document.querySelector("link[rel~='icon']") || document.createElement('link');
        link.rel = 'icon';
        link.href = settingsData.restaurantLogo;
        document.head.appendChild(link);
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        setError('Restaurant not found. Please scan a valid QR code.');
      } else if (status === 400) {
        setError('Invalid restaurant. Please scan a valid QR code.');
      } else {
        setError('Failed to load restaurant data. Please try again.');
      }
      console.error('Error fetching restaurant data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <RestaurantContext.Provider
      value={{
        settings,
        categories,
        menuItems,
        isLoading,
        error,
        refetch: fetchData,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}
