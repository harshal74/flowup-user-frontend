import api from './api';
import { getRestaurantId } from '../utils/restaurantId';
import type {
  RestaurantSettings,
  Category,
  MenuItem,
  MenuItemCategory,
  OrderPayload,
  OrderResponse,
  PaymentConfig,
} from '../types';

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
      params: { restaurantId: getRestaurantId() },
    });
    return unwrap<RestaurantSettings>(response.data);
  },
};

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories', {
      params: { restaurantId: getRestaurantId() },
    });
    const categories = unwrap<Category[]>(response.data);
    return Array.isArray(categories) ? categories.filter((cat) => cat.isActive) : [];
  },
};

export const menuService = {
  getMenuItems: async (): Promise<MenuItem[]> => {
    const response = await api.get('/menu', {
      params: { restaurantId: getRestaurantId() },
    });
    const items = unwrap<MenuItem[]>(response.data);
    return Array.isArray(items) ? normaliseMenuItems(items) : [];
  },
};

export const orderService = {
  placeOrder: async (order: OrderPayload): Promise<OrderResponse> => {
    const response = await api.post('/orders', {
      ...order,
      restaurantId: getRestaurantId(),
    });
    return unwrap<OrderResponse>(response.data);
  },
};

export const paymentService = {
  getConfig: async (): Promise<PaymentConfig> => {
    const response = await api.get('/payment/config', {
      params: { restaurantId: getRestaurantId() },
    });
    return response.data as PaymentConfig;
  },

  createRazorpayOrder: async (orderData: {
    orderType: string;
    customer: { name: string; mobile: string; address?: string };
    items: { menuId: string; quantity: number; itemNote?: string }[];
    note?: string;
    address?: string;
    deliveryLocation?: { latitude: number; longitude: number };
    idempotencyKey?: string;
  }): Promise<{ razorpayOrderId: string; amount: number; currency: string; keyId: string; intentId?: string; alreadyPaid?: boolean }> => {
    const response = await api.post('/payment/create-order', {
      ...orderData,
      restaurantId: getRestaurantId(),
    });
    return response.data;
  },

  verifyAndCreateOrder: async (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderPayload: OrderPayload;
  }): Promise<OrderResponse> => {
    const response = await api.post('/payment/verify-and-create-order', payload);
    return unwrap<OrderResponse>(response.data);
  },
};

export { api };
