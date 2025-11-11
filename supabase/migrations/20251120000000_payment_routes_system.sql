/*
  # Payment Routes System

  1. New Tables
    - `payment_routes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `pix_provider` (text) - ex: "email", "cpf", "phone", "random"
      - `pix_key` (text) - chave pix
      - `pix_beneficiary` (text) - nome do beneficiário
      - `crypto_type` (text) - ex: "USDC", "USDT", "ETH"
      - `crypto_address` (text) - wallet address
      - `crypto_chain` (text) - ex: "polygon", "ethereum"
      - `paypal_link` (text) - paypal.me link
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `payment_routes` table
    - Users can only read/update their own routes
*/

-- Create payment_routes table
CREATE TABLE IF NOT EXISTS payment_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Pix (Brazil)
  pix_provider text,
  pix_key text,
  pix_beneficiary text,

  -- Crypto
  crypto_type text,
  crypto_address text,
  crypto_chain text DEFAULT 'polygon',

  -- PayPal
  paypal_link text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT payment_routes_user_id_unique UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE payment_routes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own payment routes" ON payment_routes;
DROP POLICY IF EXISTS "Users can insert own payment routes" ON payment_routes;
DROP POLICY IF EXISTS "Users can update own payment routes" ON payment_routes;
DROP POLICY IF EXISTS "Users can delete own payment routes" ON payment_routes;

-- Policies: Users can only manage their own routes
CREATE POLICY "Users can view own payment routes"
  ON payment_routes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment routes"
  ON payment_routes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment routes"
  ON payment_routes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment routes"
  ON payment_routes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_routes_user_id
  ON payment_routes(user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_payment_routes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payment_routes_updated_at ON payment_routes;

CREATE TRIGGER payment_routes_updated_at
  BEFORE UPDATE ON payment_routes
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_routes_updated_at();

-- Comment
COMMENT ON TABLE payment_routes IS 'User payment receiving routes (Pix, Crypto, PayPal)';
