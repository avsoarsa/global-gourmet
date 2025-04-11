import { create } from 'zustand';
import { Product, CartItem, Category, Address, PaymentMethod } from '../types/database.types';

interface CartStore {
  items: CartItem[];
  products: Record<string, Product>;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  products: {},

  addItem: (product: Product, quantity: number) => {
    set((state) => {
      // Check if item already exists
      const existingItemIndex = state.items.findIndex(
        (item) => item.product_id === product.id
      );

      let newItems = [...state.items];
      let newProducts = { ...state.products };

      // Add product to products record
      newProducts[product.id] = product;

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        };
      } else {
        // Add new item if it doesn't exist
        newItems.push({
          id: `local-${Date.now()}`,
          cart_id: 'local',
          product_id: product.id,
          quantity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      return { items: newItems, products: newProducts };
    });
  },

  removeItem: (id: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  updateQuantity: (id: string, quantity: number) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  totalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  totalPrice: () => {
    return get().items.reduce((total, item) => {
      const product = get().products[item.product_id];
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  },
}));

interface WishlistStore {
  items: string[]; // Product IDs
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

// Load wishlist from localStorage if available
const loadWishlistFromStorage = (): string[] => {
  if (typeof window === 'undefined') return [];

  try {
    const storedWishlist = localStorage.getItem('wishlist');
    return storedWishlist ? JSON.parse(storedWishlist) : [];
  } catch (error) {
    console.error('Error loading wishlist from localStorage:', error);
    return [];
  }
};

// Save wishlist to localStorage
const saveWishlistToStorage = (items: string[]) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('wishlist', JSON.stringify(items));
  } catch (error) {
    console.error('Error saving wishlist to localStorage:', error);
  }
};

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: loadWishlistFromStorage(),

  addItem: (productId: string) => {
    // Only add if not already in wishlist
    if (!get().isInWishlist(productId)) {
      const newItems = [...get().items, productId];
      set({ items: newItems });
      saveWishlistToStorage(newItems);
    }
  },

  removeItem: (productId: string) => {
    const newItems = get().items.filter((id) => id !== productId);
    set({ items: newItems });
    saveWishlistToStorage(newItems);
  },

  isInWishlist: (productId: string) => {
    return get().items.includes(productId);
  },
}));

interface CategoryStore {
  categories: Category[];
  selectedCategory: string | null;
  setCategories: (categories: Category[]) => void;
  setSelectedCategory: (slug: string | null) => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  selectedCategory: null,

  setCategories: (categories: Category[]) => {
    set({ categories });
  },

  setSelectedCategory: (slug: string | null) => {
    set({ selectedCategory: slug });
  },
}));

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthStore {
  isAuthenticated: boolean;
  userId: string | null;
  isAdmin: boolean;
  user: User | null;
  setAuth: (userId: string | null, isAdmin: boolean, userData?: Partial<User>) => void;
  updateUserData: (userData: Partial<User>) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  userId: null,
  isAdmin: false,
  user: null,

  setAuth: (userId: string | null, isAdmin: boolean, userData?: Partial<User>) => {
    if (userId && userData) {
      set({
        isAuthenticated: true,
        userId,
        isAdmin,
        user: {
          id: userId,
          email: userData.email || '',
          firstName: userData.firstName,
          lastName: userData.lastName
        }
      });
    } else {
      set({
        isAuthenticated: !!userId,
        userId,
        isAdmin
      });
    }
  },

  updateUserData: (userData: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null
    }));
  },

  signOut: () => {
    set({
      isAuthenticated: false,
      userId: null,
      isAdmin: false,
      user: null
    });
  },
}));

interface CheckoutStore {
  shippingAddress: Address | null;
  billingAddress: Address | null;
  shippingMethod: any | null;
  paymentMethod: PaymentMethod | null;
  orderId: string | null;
  setShippingAddress: (address: Address) => void;
  setBillingAddress: (address: Address | null) => void;
  setShippingMethod: (method: any) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setOrderId: (id: string) => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  shippingAddress: null,
  billingAddress: null,
  shippingMethod: null,
  paymentMethod: null,
  orderId: null,

  setShippingAddress: (address: Address) => {
    set({ shippingAddress: address });
  },

  setBillingAddress: (address: Address | null) => {
    set({ billingAddress: address });
  },

  setShippingMethod: (method: any) => {
    set({ shippingMethod: method });
  },

  setPaymentMethod: (method: PaymentMethod) => {
    set({ paymentMethod: method });
  },

  setOrderId: (id: string) => {
    set({ orderId: id });
  },

  clearCheckout: () => {
    set({
      shippingAddress: null,
      billingAddress: null,
      shippingMethod: null,
      paymentMethod: null,
      orderId: null
    });
  },
}));
