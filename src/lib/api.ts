import { supabase } from './supabase';
import {
  Product,
  Category,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Wishlist,
  WishlistItem,
  GiftBox,
  BulkOrderRequest,
  Review
} from '../types/database.types';

// Products API
export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching products:', error);
    return [];
  }
};

export const getProductsByCategory = async (categorySlug: string | null): Promise<Product[]> => {
  try {
    // If categorySlug is null, return all products
    if (!categorySlug) {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;
      return data || [];
    }

    // Get category ID from slug
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (categoryError) {
      if (categoryError.code === 'PGRST116') {
        // Category not found
        console.warn(`Category with slug ${categorySlug} not found`);
        return [];
      }
      throw categoryError;
    }

    if (!category) return [];

    // Get products by category ID
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', category.id);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .limit(8);

  if (error) throw error;
  return data || [];
};

export const getBestsellerProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_bestseller', true)
    .limit(4);

  if (error) throw error;
  return data || [];
};

// Categories API
export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching categories:', error);
    return [];
  }
};

export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Category not found
        console.warn(`Category with slug ${slug} not found`);
        return null;
      }
      console.error('Error fetching category by slug:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Unexpected error fetching category by slug:', error);
    return null;
  }
};

// Cart API
export const getCart = async (userId: string): Promise<Cart | null> => {
  const { data, error } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const createCart = async (userId: string): Promise<Cart> => {
  const { data, error } = await supabase
    .from('carts')
    .insert({ user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getCartItems = async (cartId: string): Promise<CartItem[]> => {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cartId);

  if (error) throw error;
  return data || [];
};

export const addToCart = async (cartId: string, productId: string, quantity: number): Promise<CartItem> => {
  // Check if item already exists in cart
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cartId)
    .eq('product_id', productId)
    .single();

  if (existingItem) {
    // Update quantity if item exists
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Add new item if it doesn't exist
    const { data, error } = await supabase
      .from('cart_items')
      .insert({ cart_id: cartId, product_id: productId, quantity })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export const updateCartItemQuantity = async (cartItemId: string, quantity: number): Promise<CartItem> => {
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeFromCart = async (cartItemId: string): Promise<void> => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId);

  if (error) throw error;
};

// Wishlist API
export const getWishlist = async (userId: string): Promise<Wishlist | null> => {
  const { data, error } = await supabase
    .from('wishlists')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const createWishlist = async (userId: string): Promise<Wishlist> => {
  const { data, error } = await supabase
    .from('wishlists')
    .insert({ user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getWishlistItems = async (wishlistId: string): Promise<WishlistItem[]> => {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*')
    .eq('wishlist_id', wishlistId);

  if (error) throw error;
  return data || [];
};

export const addToWishlist = async (wishlistId: string, productId: string): Promise<WishlistItem> => {
  const { data, error } = await supabase
    .from('wishlist_items')
    .insert({ wishlist_id: wishlistId, product_id: productId })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeFromWishlist = async (wishlistItemId: string): Promise<void> => {
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('id', wishlistItemId);

  if (error) throw error;
};

// Orders API
export const createOrder = async (
  userId: string,
  subtotal: number,
  discountAmount: number = 0,
  taxAmount: number = 0,
  shippingAmount: number = 0,
  shippingDetails: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  },
  paymentMethod: string,
  couponCode: string | null = null,
  couponId: string | null = null
): Promise<Order> => {
  // Calculate total amount
  const totalAmount = subtotal - discountAmount + taxAmount + shippingAmount;

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      subtotal: subtotal,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      shipping_amount: shippingAmount,
      total_amount: totalAmount,
      shipping_address: shippingDetails.address,
      shipping_city: shippingDetails.city,
      shipping_state: shippingDetails.state,
      shipping_postal_code: shippingDetails.postalCode,
      shipping_country: shippingDetails.country,
      payment_method: paymentMethod,
      coupon_code: couponCode,
      coupon_id: couponId,
      status: 'pending',
      payment_status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;

  // If a coupon was applied, update its usage count
  if (couponId) {
    await applyCouponToOrder(data.id, couponId);
  }

  return data;
};

export const addOrderItems = async (
  orderId: string,
  items: { productId: string; quantity: number; price: number }[]
): Promise<OrderItem[]> => {
  const orderItems = items.map(item => ({
    order_id: orderId,
    product_id: item.productId,
    quantity: item.quantity,
    price: item.price
  }));

  const { data, error } = await supabase
    .from('order_items')
    .insert(orderItems)
    .select();

  if (error) throw error;
  return data;
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) throw error;
  return data;
};

export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (error) throw error;
  return data || [];
};

// Gift Boxes API
export const getGiftBoxes = async (): Promise<GiftBox[]> => {
  const { data, error } = await supabase
    .from('gift_boxes')
    .select('*');

  if (error) throw error;
  return data || [];
};

export const getGiftBoxById = async (id: string): Promise<GiftBox | null> => {
  const { data, error } = await supabase
    .from('gift_boxes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Coupons API
export const validateCoupon = async (code: string, subtotal: number) => {
  try {
    // Use the RPC function to validate the coupon
    const { data, error } = await supabase
      .rpc('validate_coupon', {
        coupon_code: code,
        order_amount: subtotal
      });

    if (error) {
      console.error('Error validating coupon:', error);
      return null;
    }

    if (!data.valid) {
      console.log('Coupon validation failed:', data.message);
      return null;
    }

    // Get the full coupon details
    const { data: couponData, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', data.id)
      .single();

    if (couponError) {
      console.error('Error fetching coupon details:', couponError);
      return null;
    }

    return couponData;
  } catch (error) {
    console.error('Error validating coupon:', error);
    return null;
  }
};

export const applyCouponToOrder = async (orderId: string, couponId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('apply_coupon_to_order', {
        order_id: orderId,
        coupon_id: couponId
      });

    if (error) {
      console.error('Error applying coupon to order:', error);
      return false;
    }

    return data;
  } catch (error) {
    console.error('Error applying coupon to order:', error);
    return false;
  }
};

// Bulk Order Requests API
export const createBulkOrderRequest = async (
  userId: string,
  requestData: {
    companyName?: string;
    contactName?: string;
    email: string;
    phone?: string;
    productDetails: string;
    quantity: number;
    customPackaging: boolean;
  }
): Promise<BulkOrderRequest> => {
  const { data, error } = await supabase
    .from('bulk_order_requests')
    .insert({
      user_id: userId,
      company_name: requestData.companyName,
      contact_name: requestData.contactName,
      email: requestData.email,
      phone: requestData.phone,
      product_details: requestData.productDetails,
      quantity: requestData.quantity,
      custom_packaging: requestData.customPackaging,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserBulkOrderRequests = async (userId: string): Promise<BulkOrderRequest[]> => {
  const { data, error } = await supabase
    .from('bulk_order_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Reviews API
export const getProductReviews = async (productId: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createReview = async (
  userId: string,
  productId: string,
  rating: number,
  comment?: string
): Promise<Review> => {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      user_id: userId,
      product_id: productId,
      rating,
      comment
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Newsletter API
export const subscribeToNewsletter = async (email: string): Promise<void> => {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email });

  if (error) throw error;
};
