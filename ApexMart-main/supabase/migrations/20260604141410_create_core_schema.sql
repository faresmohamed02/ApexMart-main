/*
  # ApexMart Core Schema

  ## Tables Created

  ### customers
  - id (uuid, pk)
  - name, email (unique), phone, avatar_initials, avatar_color
  - status: active | inactive | blocked
  - lifetime_value, total_orders
  - created_at, last_order_at

  ### products
  - id (uuid, pk)
  - name, sku (unique), category, description
  - price, stock, image_url
  - status: active | draft | archived
  - created_at, updated_at

  ### orders
  - id (uuid, pk), order_number (unique sequential string)
  - customer_id (fk -> customers)
  - status: delivered | pending | processing | cancelled
  - subtotal, shipping, tax, total
  - shipping_address (jsonb)
  - created_at, updated_at

  ### order_items
  - id (uuid, pk)
  - order_id (fk -> orders), product_id (fk -> products)
  - quantity, unit_price, total_price

  ### notifications
  - id (uuid, pk)
  - type: order_placed | low_stock | new_customer | system
  - title, message
  - read (bool), metadata (jsonb)
  - created_at

  ### store_settings
  - id (uuid, pk, single row)
  - store_name, currency, timezone, accent_color
  - notify_orders, notify_low_stock, notify_customers (bool)

  ## Security
  - RLS enabled on all tables
  - anon role given SELECT on all tables (read-only public dashboard)
  - anon role given INSERT/UPDATE/DELETE on products, orders, order_items, notifications, store_settings
*/

-- ─── CUSTOMERS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  email            text UNIQUE NOT NULL,
  phone            text DEFAULT '',
  avatar_initials  text NOT NULL DEFAULT '',
  avatar_color     text NOT NULL DEFAULT 'from-emerald-400 to-emerald-600',
  status           text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','blocked')),
  lifetime_value   numeric(12,2) NOT NULL DEFAULT 0,
  total_orders     integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  last_order_at    timestamptz
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read customers"
  ON customers FOR SELECT TO anon USING (true);

CREATE POLICY "anon can insert customers"
  ON customers FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon can update customers"
  ON customers FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ─── PRODUCTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  sku          text UNIQUE NOT NULL,
  category     text NOT NULL DEFAULT '',
  description  text DEFAULT '',
  price        numeric(10,2) NOT NULL DEFAULT 0,
  stock        integer NOT NULL DEFAULT 0,
  image_url    text DEFAULT '',
  status       text NOT NULL DEFAULT 'active' CHECK (status IN ('active','draft','archived')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read products"
  ON products FOR SELECT TO anon USING (true);

CREATE POLICY "anon can insert products"
  ON products FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon can update products"
  ON products FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon can delete products"
  ON products FOR DELETE TO anon USING (true);

-- ─── ORDERS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     text UNIQUE NOT NULL,
  customer_id      uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  status           text NOT NULL DEFAULT 'pending' CHECK (status IN ('delivered','pending','processing','cancelled')),
  subtotal         numeric(10,2) NOT NULL DEFAULT 0,
  shipping         numeric(10,2) NOT NULL DEFAULT 0,
  tax              numeric(10,2) NOT NULL DEFAULT 0,
  total            numeric(10,2) NOT NULL DEFAULT 0,
  shipping_address jsonb NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read orders"
  ON orders FOR SELECT TO anon USING (true);

CREATE POLICY "anon can insert orders"
  ON orders FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon can update orders"
  ON orders FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ─── ORDER ITEMS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL DEFAULT '',
  quantity     integer NOT NULL DEFAULT 1,
  unit_price   numeric(10,2) NOT NULL DEFAULT 0,
  total_price  numeric(10,2) NOT NULL DEFAULT 0
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read order_items"
  ON order_items FOR SELECT TO anon USING (true);

CREATE POLICY "anon can insert order_items"
  ON order_items FOR INSERT TO anon WITH CHECK (true);

-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type       text NOT NULL DEFAULT 'system' CHECK (type IN ('order_placed','low_stock','new_customer','system')),
  title      text NOT NULL,
  message    text NOT NULL DEFAULT '',
  read       boolean NOT NULL DEFAULT false,
  metadata   jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read notifications"
  ON notifications FOR SELECT TO anon USING (true);

CREATE POLICY "anon can insert notifications"
  ON notifications FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon can update notifications"
  ON notifications FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ─── STORE SETTINGS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_settings (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name        text NOT NULL DEFAULT 'ApexMart',
  currency          text NOT NULL DEFAULT 'USD',
  timezone          text NOT NULL DEFAULT 'America/New_York',
  accent_color      text NOT NULL DEFAULT 'emerald',
  notify_orders     boolean NOT NULL DEFAULT true,
  notify_low_stock  boolean NOT NULL DEFAULT true,
  notify_customers  boolean NOT NULL DEFAULT false
);

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read settings"
  ON store_settings FOR SELECT TO anon USING (true);

CREATE POLICY "anon can insert settings"
  ON store_settings FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon can update settings"
  ON store_settings FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_customer     ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status       ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at   ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku        ON products(sku);
CREATE INDEX IF NOT EXISTS idx_notifications_read  ON notifications(read, created_at DESC);
