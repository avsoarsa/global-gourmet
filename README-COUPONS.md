# Coupon System for Global Gourmet

This document provides an overview of the coupon system implemented for the Global Gourmet e-commerce website.

## Features

- Admin panel for creating, editing, and managing coupons
- Support for percentage and fixed amount discounts
- Coupon validation with minimum order amount
- Date-based validity periods
- Usage limits per coupon
- Coupon application in checkout process

## Database Schema

The coupon system uses the following database tables:

### Coupons Table

| Column               | Type                    | Description                                   |
|----------------------|-------------------------|-----------------------------------------------|
| id                   | UUID                    | Primary key                                   |
| code                 | TEXT                    | Unique coupon code                            |
| description          | TEXT                    | Optional description                          |
| discount_type        | TEXT                    | 'percentage' or 'fixed'                       |
| discount_value       | DECIMAL                 | Discount amount or percentage                 |
| minimum_order_amount | DECIMAL                 | Minimum order amount required                 |
| is_active            | BOOLEAN                 | Whether the coupon is active                  |
| start_date           | TIMESTAMP WITH TIME ZONE| Optional start date for validity              |
| end_date             | TIMESTAMP WITH TIME ZONE| Optional end date for validity                |
| usage_limit          | INTEGER                 | Optional maximum number of uses               |
| usage_count          | INTEGER                 | Current number of uses                        |
| created_at           | TIMESTAMP WITH TIME ZONE| Creation timestamp                            |
| updated_at           | TIMESTAMP WITH TIME ZONE| Last update timestamp                         |

### Orders Table (Updated)

The orders table has been updated with the following new columns:

| Column          | Type    | Description                                |
|-----------------|---------|-------------------------------------------|
| subtotal        | DECIMAL | Order subtotal before discounts           |
| discount_amount | DECIMAL | Discount amount applied                   |
| tax_amount      | DECIMAL | Tax amount                                |
| shipping_amount | DECIMAL | Shipping amount                           |
| coupon_id       | UUID    | Reference to the applied coupon           |

## Database Functions

### validate_coupon

This function validates a coupon code against an order amount:

```sql
CREATE OR REPLACE FUNCTION public.validate_coupon(
    coupon_code TEXT,
    order_amount DECIMAL
) RETURNS JSONB
```

### apply_coupon_to_order

This function applies a coupon to an order and updates the coupon usage count:

```sql
CREATE OR REPLACE FUNCTION public.apply_coupon_to_order(
    order_id UUID,
    coupon_id UUID
) RETURNS BOOLEAN
```

## API Functions

### validateCoupon

```typescript
export const validateCoupon = async (code: string, subtotal: number) => {
  // Validates a coupon code and returns the coupon details if valid
}
```

### applyCouponToOrder

```typescript
export const applyCouponToOrder = async (orderId: string, couponId: string): Promise<boolean> => {
  // Applies a coupon to an order and updates the coupon usage count
}
```

## Components

### CouponCode Component

The `CouponCode` component allows users to enter and apply coupon codes during checkout:

```typescript
interface CouponCodeProps {
  onApply: (discount: number, discountType: string, code: string) => void;
  onRemove: () => void;
  subtotal: number;
}
```

### Admin Coupon Management

The admin panel includes a coupon management page at `/admin/coupons` that allows administrators to:

- Create new coupons
- Edit existing coupons
- Activate/deactivate coupons
- Delete coupons
- View coupon usage statistics

## How to Use

### For Customers

1. Add products to your cart
2. Proceed to checkout
3. Enter a valid coupon code in the coupon field
4. Click "Apply" to apply the discount
5. Complete your order

### For Administrators

1. Log in with an admin account
2. Navigate to the Admin Dashboard
3. Click on "Coupons" in the sidebar
4. Use the interface to create, edit, or manage coupons

## Testing Coupons

You can test the coupon system with the following example coupons:

1. **WELCOME10**: 10% off any order
2. **SUMMER2024**: 15% off orders over $50
3. **FREESHIP**: $10 off orders over $75

## Implementation Notes

- Coupons are validated server-side to prevent manipulation
- Row-level security ensures only admins can manage coupons
- Coupon codes are case-sensitive
- Discount amounts are calculated in real-time during checkout
- Fixed amount discounts cannot exceed the order subtotal
