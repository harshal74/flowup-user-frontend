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
    } catch (err) {
      setError('Failed to load restaurant data. Please try again.');
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
