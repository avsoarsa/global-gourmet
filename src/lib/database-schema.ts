/**
 * Global Gourmet Database Schema
 * 
 * This file documents the database schema for the Global Gourmet e-commerce platform.
 * It provides a reference for all tables, their relationships, and the purpose of each table.
 */

/**
 * Categories Table
 * 
 * Stores product categories such as "Dry Fruits", "Nuts & Seeds", etc.
 * 
 * Fields:
 * - id: UUID (Primary Key)
 * - name: VARCHAR(255) - Category name
 * - slug: VARCHAR(255) - URL-friendly version of the name
 * - description: TEXT - Category description
 * - created_at: TIMESTAMP - When the category was created
 * - updated_at: TIMESTAMP - When the category was last updated
 */

/**
 * Products Table
 * 
 * Stores all product information.
 * 
 * Fields:
 * - id: UUID (Primary Key)
 * - name: VARCHAR(255) - Product name
 * - slug: VARCHAR(255) - URL-friendly version of the name
 * - description: TEXT - Product description
 * - price: DECIMAL(10, 2) - Regular price
 * - sale_price: DECIMAL(10, 2) - Sale price (if applicable)
 * - stock_quantity: INTEGER - Number of items in stock
 * - is_featured: BOOLEAN - Whether the product is featured on the homepage
 * - is_bestseller: BOOLEAN - Whether the product is a bestseller
 * - is_organic: BOOLEAN - Whether the product is organic
 * - category_id: UUID (Foreign Key to categories.id)
 * - image_url: TEXT - URL to the product image
 * - rating: DECIMAL(3, 2) - Average product rating
 * - review_count: INTEGER - Number of reviews
 * - created_at: TIMESTAMP - When the product was created
 * - updated_at: TIMESTAMP - When the product was last updated
 */

/**
 * User Profiles Table
 * 
 * Extends the Supabase auth.users table with additional user information.
 * 
 * Fields:
 * - id: UUID (Primary Key, Foreign Key to auth.users.id)
 * - first_name: VARCHAR(255)
 * - last_name: VARCHAR(255)
 * - phone: VARCHAR(50)
 * - address: TEXT
 * - city: VARCHAR(255)
 * - state: VARCHAR(255)
 * - postal_code: VARCHAR(20)
 * - country: VARCHAR(255)
 * - is_admin: BOOLEAN - Whether the user is an admin
 * - created_at: TIMESTAMP
 * - updated_at: TIMESTAMP
 */

/**
 * Orders Table
 * 
 * Stores order information.
 * 
 * Fields:
 * - id: UUID (Primary Key)
 * - user_id: UUID (Foreign Key to auth.users.id)
 * - status: VARCHAR(50) - Order status (pending, processing, shipped, delivered, cancelled)
 * - total_amount: DECIMAL(10, 2) - Total order amount
 * - shipping_address: TEXT
 * - shipping_city: VARCHAR(255)
 * - shipping_state: VARCHAR(255)
 * - shipping_postal_code: VARCHAR(20)
 * - shipping_country: VARCHAR(255)
 * - payment_method: VARCHAR(50)
 * - payment_status: VARCHAR(50)
 * - created_at: TIMESTAMP
 * - updated_at: TIMESTAMP
 */

/**
 * Order Items Table
 * 
 * Stores individual items within an order.
 * 
 * Fields:
 * - id: UUID (Primary Key)
 * - order_id: UUID (Foreign Key to orders.id)
 * - product_id: UUID (Foreign Key to products.id)
 * - quantity: INTEGER
 * - price: DECIMAL(10, 2) - Price at the time of purchase
 * - created_at: TIMESTAMP
 */

/**
 * Carts Table
 * 
 * Stores shopping cart information.
 * 
 * Fields:
 * - id: UUID (Primary Key)
 * - user_id: UUID (Foreign Key to auth.users.id)
 * - created_at: TIMESTAMP
 * - updated_at: TIMESTAMP
 */

/**
 * Cart Items Table
 * 
 * Stores individual items within a shopping cart.
 * 
 * Fields:
 * - id: UUID (Primary Key)
 * - cart_id: UUID (Foreign Key to carts.id)
 * - product_id: UUID (Foreign Key to products.id)
 * - quantity: INTEGER
 * - created_at: TIMESTAMP
 * - updated_at: TIMESTAMP
 */

/**
 * Wishlists Table
 * 
 * Stores wishlist information.
 * 
 * Fields:
 * - id: UUID (Primary Key)
 * - user_id: UUID (Foreign Key to auth.users.id)
 * - created_at: TIMESTAMP
 */

/**
 * Wishlist Items Table
 * 
 * Stores individual items within a wishlist.
 * 
 * Fields:
 * - id: UUID (Primary Key)
 * - wishlist_id: UUID (Foreign Key to wishlists.id)
 * - product_id: UUID (Foreign Key to products.id)
 * - created_at: TIMESTAMP
 */

/**
 * Gift Boxes Table
 * 
 * Stores gift box information.
 * 
 * Fields:
 * - id: UUID (Primary Key)
 * - name: VARCHAR(255)
 * - description: TEXT
 * - base_price: DECIMAL(10, 2)
 * - image_url: TEXT
 * - is_customizable: BOOLEAN
 * - created_at: TIMESTAMP
 * - updated_at: TIMESTAMP
 */

/**
 * Bulk Order Requests Table
 * 
 * Stores bulk order request information.
 * 
 * Fields:
 * - id: UUID (Primary Key)
 * - user_id: UUID (Foreign Key to auth.users.id)
 * - company_name: VARCHAR(255)
 * - contact_name: VARCHAR(255)
 * - email: VARCHAR(255)
 * - phone: VARCHAR(50)
 * - product_details: TEXT
 * - quantity: INTEGER
 * - custom_packaging: BOOLEAN
 * - status: VARCHAR(50)
 * - created_at: TIMESTAMP
 * - updated_at: TIMESTAMP
 */

/**
 * Reviews Table
 * 
 * Stores product reviews.
 * 
 * Fields:
 * - id: UUID (Primary Key)
 * - product_id: UUID (Foreign Key to products.id)
 * - user_id: UUID (Foreign Key to auth.users.id)
 * - rating: INTEGER (1-5)
 * - comment: TEXT
 * - created_at: TIMESTAMP
 * - updated_at: TIMESTAMP
 */

/**
 * Newsletter Subscribers Table
 * 
 * Stores newsletter subscriber information.
 * 
 * Fields:
 * - id: UUID (Primary Key)
 * - email: VARCHAR(255)
 * - is_active: BOOLEAN
 * - created_at: TIMESTAMP
 */

// Export types for TypeScript usage
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
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
}

export interface UserProfile {
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
}

export interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  payment_method: string | null;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface Cart {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  wishlist_id: string;
  product_id: string;
  created_at: string;
}

export interface GiftBox {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  image_url: string | null;
  is_customizable: boolean;
  created_at: string;
  updated_at: string;
}

export interface BulkOrderRequest {
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
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}
