export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_organic: boolean;
  category_id: string;
  image_url: string | null;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
};

export type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  status: string;
  subtotal: number;
  total_amount: number;
  shipping_amount: number;
  tax_amount: number;
  discount_amount: number;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  payment_method: string | null;
  payment_status: string;
  coupon_code: string | null;
  coupon_id: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
};

export type Cart = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type CartItem = {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export type Wishlist = {
  id: string;
  user_id: string;
  created_at: string;
};

export type WishlistItem = {
  id: string;
  wishlist_id: string;
  product_id: string;
  created_at: string;
};

export type GiftBox = {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  image_url: string | null;
  is_customizable: boolean;
  created_at: string;
  updated_at: string;
};

export type BulkOrderRequest = {
  id: string;
  user_id: string;
  company_name: string | null;
  contact_name: string | null;
  email: string;
  phone: string | null;
  product_details: string;
  quantity: number;
  custom_packaging: boolean;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
};

export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_order_amount: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  usage_limit: number | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
};
