import api from './api';
import type {
  RestaurantSettings,
  Category,
  MenuItem,
  MenuItemCategory,
  OrderPayload,
  OrderResponse,
} from '../types';

// The restaurantId used across all API calls — driven by env var
const RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID || 'FLOWUP001';

// Unwraps both { success, data } and direct API responses
function unwrap<T>(data: unknown): T {
  if (
    data &&
    typeof data === 'object' &&
    'success' in (data as Record<string, unknown>) &&
    'data' in (data as Record<string, unknown>)
  ) {
    return (data as { success: boolean; data: T }).data;
  }
  return data as T;
}

// Normalises menu items so categoryId is always a plain string
function normaliseMenuItems(items: MenuItem[]): MenuItem[] {
  return items.map((item) => ({
    ...item,
    categoryId:
      item.categoryId && typeof item.categoryId === 'object'
        ? (item.categoryId as MenuItemCategory)._id
        : (item.categoryId as string),
  }));
}

export const settingsService = {
  getSettings: async (): Promise<RestaurantSettings> => {
    const response = await api.get('/settings', {
      params: { restaurantId: RESTAURANT_ID },
    });
    return unwrap<RestaurantSettings>(response.data);
  },
};

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories', {
      params: { restaurantId: RESTAURANT_ID },
    });
    const categories = unwrap<Category[]>(response.data);
    return Array.isArray(categories) ? categories.filter((cat) => cat.isActive) : [];
  },
};

export const menuService = {
  getMenuItems: async (): Promise<MenuItem[]> => {
    const response = await api.get('/menu', {
      params: { restaurantId: RESTAURANT_ID },
    });
    const items = unwrap<MenuItem[]>(response.data);
    return Array.isArray(items) ? normaliseMenuItems(items) : [];
  },
};

export const orderService = {
  placeOrder: async (order: OrderPayload): Promise<OrderResponse> => {
    const response = await api.post('/orders', order);
    return unwrap<OrderResponse>(response.data);
  },
};

export { api };
