CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'buyer', 'admin')),
  name TEXT NOT NULL,
  mobile TEXT,
  district TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farmer_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  soil_type TEXT,
  water_source TEXT,
  land_area_acres NUMERIC,
  village TEXT,
  preferred_language TEXT
);

CREATE TABLE IF NOT EXISTS buyer_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  buyer_type TEXT NOT NULL,
  reliability_score NUMERIC NOT NULL DEFAULT 80
);

CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL REFERENCES users(id),
  crop TEXT NOT NULL,
  quantity_kg NUMERIC NOT NULL CHECK (quantity_kg > 0),
  quality TEXT NOT NULL,
  expected_price_per_kg NUMERIC NOT NULL CHECK (expected_price_per_kg >= 0),
  harvest_date TEXT NOT NULL,
  district TEXT NOT NULL,
  village TEXT,
  status TEXT NOT NULL DEFAULT 'Looking for Buyers',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buyer_demands (
  id TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL REFERENCES users(id),
  crop TEXT NOT NULL,
  quantity_kg NUMERIC NOT NULL CHECK (quantity_kg > 0),
  target_price_per_kg NUMERIC NOT NULL CHECK (target_price_per_kg >= 0),
  required_date TEXT NOT NULL,
  district TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES listings(id),
  farmer_id TEXT NOT NULL REFERENCES users(id),
  buyer_id TEXT NOT NULL REFERENCES users(id),
  quantity_kg NUMERIC NOT NULL CHECK (quantity_kg > 0),
  price_per_kg NUMERIC NOT NULL CHECK (price_per_kg >= 0),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS logistics_plans (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  collection_point TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  route_summary TEXT NOT NULL,
  distance_km NUMERIC NOT NULL,
  utilization_percent NUMERIC NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emergency_cases (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  cancelled_quantity_kg NUMERIC NOT NULL,
  risk_score NUMERIC NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crop_recommendations (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  inputs JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('ai', 'prototype')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_farmer ON listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer ON orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_logistics_order ON logistics_plans(order_id);
CREATE INDEX IF NOT EXISTS idx_emergency_order ON emergency_cases(order_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_farmer ON crop_recommendations(farmer_id);
