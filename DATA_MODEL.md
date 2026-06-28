# Tunisian Artisanal E-Commerce - Data Model Schema

Date: 2026-06-11

## Overview

This document defines the core PostgreSQL tables and relationships for the e-commerce platform. Built with Prisma ORM in mind, designed to support MVP and scalable to Phase 2+.

---

## Core Tables

### 1. Users

Stores customer and admin accounts.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role ENUM('customer', 'admin') DEFAULT 'customer',
  preferred_language VARCHAR(2) DEFAULT 'fr', -- 'fr', 'ar', 'en'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP, -- soft delete
  INDEX (email),
  INDEX (role),
  INDEX (created_at)
);
```

### 2. Categories

Product categories/taxonomy.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_fr VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  slug_fr VARCHAR(100) UNIQUE,
  slug_ar VARCHAR(100) UNIQUE,
  slug_en VARCHAR(100) UNIQUE,
  description_fr TEXT,
  description_ar TEXT,
  description_en TEXT,
  image_url VARCHAR(500),
  parent_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX (parent_category_id),
  INDEX (slug_fr),
  INDEX (slug_ar),
  INDEX (slug_en)
);
```

### 3. Products

Core product table.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name_fr VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  slug_fr VARCHAR(255) UNIQUE NOT NULL,
  slug_ar VARCHAR(255) UNIQUE NOT NULL,
  slug_en VARCHAR(255) UNIQUE NOT NULL,
  description_fr TEXT,
  description_ar TEXT,
  description_en TEXT,
  price_usd DECIMAL(10, 2) NOT NULL, -- base price in USD
  price_tnd DECIMAL(10, 2), -- optional: Tunisian dinar pricing
  cost_usd DECIMAL(10, 2), -- internal: cost for profit calculation
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  stock_quantity INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  rating_average DECIMAL(3, 2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  INDEX (category_id),
  INDEX (sku),
  INDEX (slug_fr),
  INDEX (slug_ar),
  INDEX (slug_en),
  INDEX (status),
  INDEX (featured),
  INDEX (created_at)
);
```

### 4. Product Images

Images for each product (multiple images per product).

```sql
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  alt_text_fr VARCHAR(255),
  alt_text_ar VARCHAR(255),
  alt_text_en VARCHAR(255),
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX (product_id),
  INDEX (is_primary)
);
```

### 5. Product Attributes

Flexible key-value store for product specifications (material, dimensions, color, etc.).

```sql
CREATE TABLE product_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attribute_name_fr VARCHAR(100) NOT NULL,
  attribute_name_ar VARCHAR(100) NOT NULL,
  attribute_name_en VARCHAR(100) NOT NULL,
  attribute_value_fr VARCHAR(255),
  attribute_value_ar VARCHAR(255),
  attribute_value_en VARCHAR(255),
  display_order INT DEFAULT 0,
  INDEX (product_id)
);
```

### 6. Product Variants (Phase 2)

For products with variants (size, color, etc.). Can be added later if needed for MVP.

```sql
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(100) UNIQUE NOT NULL,
  size VARCHAR(50),
  color VARCHAR(50),
  material VARCHAR(100),
  price_usd DECIMAL(10, 2),
  stock_quantity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX (product_id),
  INDEX (sku)
);
```

### 7. Reviews & Ratings

Customer reviews and ratings for products.

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  helpful_count INT DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT FALSE,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX (product_id),
  INDEX (user_id),
  INDEX (status),
  INDEX (created_at),
  UNIQUE (product_id, user_id) -- one review per user per product
);
```

### 8. Wishlist

User wishlists for saving products.

```sql
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, product_id),
  INDEX (user_id),
  INDEX (product_id)
);
```

### 9. Addresses

Shipping and billing addresses.

```sql
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address_type ENUM('shipping', 'billing') DEFAULT 'shipping',
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  street_address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state_province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2) NOT NULL DEFAULT 'TN', -- ISO 3166-1 alpha-2 (Tunisia = TN)
  phone VARCHAR(20),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX (user_id),
  INDEX (is_default)
);
```

### 10. Carts

Shopping cart (transient, can be deleted after order or after 30 days of inactivity).

```sql
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) UNIQUE, -- for guest carts
  status ENUM('active', 'abandoned', 'converted_to_order') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
  INDEX (user_id),
  INDEX (session_id),
  INDEX (status)
);
```

### 11. Cart Items

Items in a cart.

```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_at_add DECIMAL(10, 2) NOT NULL, -- snapshot of product price when added
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX (cart_id),
  INDEX (product_id)
);
```

### 12. Orders

Main order table.

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL, -- human-readable, e.g., ORD-20260611-001
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- nullable for guest orders
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'canceled', 'refunded') DEFAULT 'pending',
  payment_method ENUM('card', 'cash_on_delivery') NOT NULL,
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  subtotal_usd DECIMAL(10, 2) NOT NULL,
  tax_usd DECIMAL(10, 2) DEFAULT 0,
  shipping_cost_usd DECIMAL(10, 2) DEFAULT 0,
  discount_usd DECIMAL(10, 2) DEFAULT 0, -- for coupons, future use
  total_usd DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  shipping_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
  billing_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
  notes TEXT,
  tracking_number VARCHAR(100),
  stripe_payment_intent_id VARCHAR(255), -- for card payments
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  INDEX (user_id),
  INDEX (order_number),
  INDEX (status),
  INDEX (payment_status),
  INDEX (created_at)
);
```

### 13. Order Items

Line items in an order.

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name VARCHAR(255) NOT NULL, -- snapshot of name
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price_usd DECIMAL(10, 2) NOT NULL,
  subtotal_usd DECIMAL(10, 2) NOT NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX (order_id),
  INDEX (product_id)
);
```

### 14. Payments

Payment transaction records (can be queried separately from orders for advanced analytics).

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method ENUM('card', 'cash_on_delivery') NOT NULL,
  amount_usd DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  INDEX (order_id),
  INDEX (status),
  INDEX (stripe_payment_intent_id)
);
```

### 15. Email Logs

Track sent emails for order confirmations, shipping updates, etc.

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email_type ENUM('order_confirmation', 'shipping_notification', 'delivery_confirmation', 'newsletter') DEFAULT 'order_confirmation',
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  status ENUM('sent', 'failed', 'bounced') DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX (order_id),
  INDEX (user_id),
  INDEX (status)
);
```

---

## Key Design Decisions

1. **Multilingual Fields**: All user-facing text (names, descriptions, etc.) is stored in three language columns (`_fr`, `_ar`, `_en`) to avoid complex translation lookups.

2. **Denormalization for Performance**: Product rating data (average + count) is stored on the product table for faster queries; can be updated by triggers or after reviews are created.

3. **Soft Deletes**: Users and products support soft deletes (`deleted_at` field) to preserve historical data and allow recovery if needed.

4. **Price Snapshots**: Cart items and order items store the price at the time of addition/order, preventing retroactive price changes from affecting past orders.

5. **Guest Carts & Orders**: Carts and orders support both authenticated users and guests via `session_id` or nullable `user_id`.

6. **Scalable Variants**: Product variants are in a separate table, easy to expand for Phase 2 multi-variant support without breaking MVP.

7. **Payment Tracking**: Payments are logged separately from orders to support future analytics, refunds, and multiple payment attempts.

8. **Indexes**: High-read paths (slugs, status, created_at) are indexed for performance; write-heavy tables prioritize on foreign keys.

---

## Migration Strategy (Prisma)

Once the schema is defined in Prisma `schema.prisma`:

```bash
npm run prisma migrate dev --name initial_schema
```

This will:
- Create the database schema
- Generate Prisma client
- Create migration files for version control

---

## Future Extensions (Phase 2+)

- **Coupons/Discounts**: Add `coupons`, `coupon_usage` tables.
- **Analytics Events**: Add `analytics_events` table for tracking page views, clicks, conversions.
- **Inventory History**: Add `inventory_adjustments` table for stock change audit trail.
- **Customer Tags**: Add `customer_tags` table for segmentation.
- **Vendor Tables** (if multi-vendor): Add `vendors`, `vendor_payouts`, `vendor_commissions`.

---

## Performance Considerations

- **Query Optimization**: Key reads (product catalog, order history) should be served from Redis cache when possible.
- **Bulk Operations**: Batch product imports should use PostgreSQL `COPY` or bulk insert transactions.
- **Archival**: Old carts and email logs should be archived or deleted after 1 year to keep table size manageable.
- **Connection Pooling**: Use Prisma's connection pooling or pgBouncer for high-concurrency scenarios.

---

## Security Considerations

- **PII Protection**: User data (addresses, email) should be encrypted at rest for GDPR/privacy compliance.
- **Audit Trail**: Consider adding `created_by`, `updated_by` fields to critical tables for admin actions.
- **Rate Limiting**: Database connection limits should be set to prevent brute force attacks.
