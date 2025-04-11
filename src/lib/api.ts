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
  Review,
  UserProfile,
  Address,
  PaymentMethod
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

// New function to get related products
export const getRelatedProducts = async (productId: string, categoryId: string, limit: number = 4): Promise<Product[]> => {
  try {
    // Get products in the same category, excluding the current product
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .neq('id', productId)
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
};

// New function to get product images
export const getProductImages = async (productId: string): Promise<string[]> => {
  try {
    // In a real implementation, this would fetch from a product_images table
    // For now, we'll return a simulated response
    return [
      'https://images.unsplash.com/photo-1600348759200-5b94753c5a4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80',
      'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=735&q=80',
      'https://images.unsplash.com/photo-1601493700895-eea82a48a8f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      'https://images.unsplash.com/photo-1601493700518-42b241a914d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
    ];
  } catch (error) {
    console.error('Error fetching product images:', error);
    return [];
  }
};

// New function to get product nutrition information
export const getProductNutrition = async (productId: string): Promise<any> => {
  try {
    // In a real implementation, this would fetch from a product_nutrition table
    // For now, we'll return a simulated response
    return {
      servingSize: '30g',
      calories: 160,
      protein: 6,
      fat: 14,
      carbs: 6,
      fiber: 3,
      sugar: 1,
      vitamins: ['Vitamin E', 'Vitamin B6'],
      minerals: ['Magnesium', 'Phosphorus']
    };
  } catch (error) {
    console.error('Error fetching product nutrition:', error);
    return null;
  }
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

export const getRecentOrders = async (userId: string, limit: number = 5): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

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

export const getGiftBoxItems = async (giftBoxId: string): Promise<any[]> => {
  try {
    // In a real implementation, this would fetch from a gift_box_items table
    // For now, we'll return a simulated empty array since we're using the product selection UI
    return [];
  } catch (error) {
    console.error('Error fetching gift box items:', error);
    return [];
  }
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

// New function to track recently viewed products
export const trackProductView = async (userId: string | null, productId: string): Promise<void> => {
  try {
    if (!userId) {
      // For anonymous users, we could use localStorage in the component
      return;
    }

    // In a real implementation, this would insert into a recently_viewed table
    // For now, we'll just log it
    console.log(`User ${userId} viewed product ${productId}`);
  } catch (error) {
    console.error('Error tracking product view:', error);
  }
};

// New function to get recently viewed products
export const getRecentlyViewedProducts = async (userId: string): Promise<Product[]> => {
  try {
    // In a real implementation, this would fetch from a recently_viewed table
    // For now, we'll return a simulated response
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(4);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching recently viewed products:', error);
    return [];
  }
};

// New function to subscribe to product availability notifications
export const subscribeToProductNotifications = async (email: string, productId: string): Promise<boolean> => {
  try {
    // In a real implementation, this would insert into a product_notifications table
    // For now, we'll just simulate success
    console.log(`Subscribed ${email} to notifications for product ${productId}`);
    return true;
  } catch (error) {
    console.error('Error subscribing to product notifications:', error);
    return false;
  }
};

// User Profile API
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateUserProfile = async (
  userId: string,
  profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    emailNewsletter?: boolean;
    emailOrderUpdates?: boolean;
    emailPromotions?: boolean;
    smsOrderUpdates?: boolean;
    smsPromotions?: boolean;
  }
): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      phone: profileData.phone,
      email_newsletter: profileData.emailNewsletter,
      email_order_updates: profileData.emailOrderUpdates,
      email_promotions: profileData.emailPromotions,
      sms_order_updates: profileData.smsOrderUpdates,
      sms_promotions: profileData.smsPromotions,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Address API
export const getUserAddresses = async (userId: string): Promise<Address[]> => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getAddressById = async (addressId: string): Promise<Address | null> => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('id', addressId)
    .single();

  if (error) throw error;
  return data;
};

export const createAddress = async (
  userId: string,
  addressData: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    isDefault: boolean;
  }
): Promise<Address> => {
  // If setting as default, update all other addresses to not be default
  if (addressData.isDefault) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id: userId,
      full_name: addressData.fullName,
      address_line1: addressData.addressLine1,
      address_line2: addressData.addressLine2,
      city: addressData.city,
      state: addressData.state,
      postal_code: addressData.postalCode,
      country: addressData.country,
      phone: addressData.phone,
      is_default: addressData.isDefault,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAddress = async (
  addressId: string,
  userId: string,
  addressData: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    isDefault: boolean;
  }
): Promise<Address> => {
  // If setting as default, update all other addresses to not be default
  if (addressData.isDefault) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);
  }

  const { data, error } = await supabase
    .from('addresses')
    .update({
      full_name: addressData.fullName,
      address_line1: addressData.addressLine1,
      address_line2: addressData.addressLine2,
      city: addressData.city,
      state: addressData.state,
      postal_code: addressData.postalCode,
      country: addressData.country,
      phone: addressData.phone,
      is_default: addressData.isDefault,
      updated_at: new Date().toISOString()
    })
    .eq('id', addressId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAddress = async (addressId: string): Promise<void> => {
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', addressId);

  if (error) throw error;
};

export const setDefaultAddress = async (addressId: string, userId: string): Promise<void> => {
  // First, set all addresses to not default
  await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', userId);

  // Then set the selected address as default
  const { error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', addressId);

  if (error) throw error;
};

// Payment Methods API
export const getUserPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getPaymentMethodById = async (paymentMethodId: string): Promise<PaymentMethod | null> => {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('id', paymentMethodId)
    .single();

  if (error) throw error;
  return data;
};

export const createPaymentMethod = async (
  userId: string,
  paymentData: {
    cardholderName: string;
    cardNumber: string; // Only last 4 digits will be stored
    cardType: string;
    expiryMonth: string;
    expiryYear: string;
    isDefault: boolean;
  }
): Promise<PaymentMethod> => {
  // If setting as default, update all other payment methods to not be default
  if (paymentData.isDefault) {
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId);
  }

  // Extract last 4 digits of card number
  const lastFour = paymentData.cardNumber.replace(/\D/g, '').slice(-4);

  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      user_id: userId,
      cardholder_name: paymentData.cardholderName,
      last_four: lastFour,
      card_type: paymentData.cardType,
      expiry_month: paymentData.expiryMonth,
      expiry_year: paymentData.expiryYear,
      is_default: paymentData.isDefault,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePaymentMethod = async (
  paymentMethodId: string,
  userId: string,
  paymentData: {
    cardholderName: string;
    expiryMonth: string;
    expiryYear: string;
    isDefault: boolean;
  }
): Promise<PaymentMethod> => {
  // If setting as default, update all other payment methods to not be default
  if (paymentData.isDefault) {
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId);
  }

  const { data, error } = await supabase
    .from('payment_methods')
    .update({
      cardholder_name: paymentData.cardholderName,
      expiry_month: paymentData.expiryMonth,
      expiry_year: paymentData.expiryYear,
      is_default: paymentData.isDefault,
      updated_at: new Date().toISOString()
    })
    .eq('id', paymentMethodId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePaymentMethod = async (paymentMethodId: string): Promise<void> => {
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', paymentMethodId);

  if (error) throw error;
};

export const setDefaultPaymentMethod = async (paymentMethodId: string, userId: string): Promise<void> => {
  // First, set all payment methods to not default
  await supabase
    .from('payment_methods')
    .update({ is_default: false })
    .eq('user_id', userId);

  // Then set the selected payment method as default
  const { error } = await supabase
    .from('payment_methods')
    .update({ is_default: true })
    .eq('id', paymentMethodId);

  if (error) throw error;
};

