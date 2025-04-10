import { create } from 'zustand';
import { Product, CartItem, Category } from '../types/database.types';

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

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],

  addItem: (productId: string) => {
    set((state) => ({
      items: [...state.items, productId],
    }));
  },

  removeItem: (productId: string) => {
    set((state) => ({
      items: state.items.filter((id) => id !== productId),
    }));
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
