// Restaurant Settings — matches backend field names exactly
export interface RestaurantSettings {
  _id: string;
  restaurantId?: string;
  restaurantName: string;
  restaurantDescription: string;
  restaurantLogo: string;
  contactNumber: string;
  whatsappNumber: string;
  address: string;
  openingTime: string;
  closingTime: string;
  deliveryCharge: number;
  minimumOrderAmount: number;
  shopOpen: boolean;
  currency?: string;
  email?: string;
  averagePreparationTime?: number;
  feedbackEnabled?: boolean;
  whatsappNotificationsEnabled?: boolean;
  rating?: number;
  totalReviews?: number;
}

// Category
export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  displayOrder: number;
  isActive: boolean;
}

// Menu Item — categoryId can be a populated object or a plain string ID
export interface MenuItemCategory {
  _id: string;
  name: string;
}

export interface MenuItem {
  _id: string;
  categoryId: string | MenuItemCategory;
  name: string;
  description?: string;
  image: string;
  price: number;
  discountedPrice?: number;
  isVeg: boolean;
  isAvailable: boolean;
  isRecommended: boolean;
}

// Cart Item
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

// Order Type
export type OrderType = 'DINE_IN' | 'DELIVERY';

// Order item sent to backend
export interface OrderItem {
  menuId: string;
  quantity: number;
  itemNote?: string;
}

// Order Payload — matches backend createOrder controller exactly
export interface OrderPayload {
  orderType: OrderType;
  tableNumber?: number;
  customer: {
    name: string;
    mobile: string;
    address?: string;
  };
  items: OrderItem[];
  note?: string;
}

// Order Response
export interface OrderResponse {
  _id: string;
  orderNumber: string;
  status: string;
  estimatedTime: number | null;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
