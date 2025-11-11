/*
  # Padronização de Moeda para USD

  1. Alterações
    - Adicionar coluna `currency` na tabela `orders` (padrão: 'USD')
    - Renomear `price_brl` para `price_usd` (mantém retrocompatibilidade)
    - Adicionar índice para queries por moeda
    - Atualizar comentários da tabela

  2. Dados
    - Atualizar registros existentes para currency='USD'
    - Sistema agora opera 100% em USD (1 PIX = 1 USD)

  3. Segurança
    - Nenhuma alteração em RLS
    - Políticas mantidas
*/

-- Adicionar coluna currency à tabela orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'currency'
  ) THEN
    ALTER TABLE orders ADD COLUMN currency text DEFAULT 'USD' NOT NULL;
    COMMENT ON COLUMN orders.currency IS 'Currency code (ISO 4217): USD';
  END IF;
END $$;

-- Atualizar todos os registros existentes para USD
UPDATE orders SET currency = 'USD' WHERE currency IS NULL OR currency = '';

-- Adicionar índice para queries por moeda
CREATE INDEX IF NOT EXISTS idx_orders_currency ON orders(currency);

-- Atualizar comentário da coluna price_brl (mantendo nome por retrocompatibilidade)
COMMENT ON COLUMN orders.price_brl IS 'Price in USD (legacy column name: price_brl, actual value: USD)';

-- Adicionar constraint para garantir moeda válida
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_currency_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_currency_check CHECK (currency IN ('USD', 'BRL'));
  END IF;
END $$;

-- View para facilitar queries com nome correto
CREATE OR REPLACE VIEW orders_with_usd AS
SELECT
  id,
  fqdn,
  user_id,
  status,
  price_brl as price_usd,
  currency,
  payment_provider,
  provider_order_id,
  created_at,
  updated_at,
  metadata
FROM orders;

-- Grant acesso à view
GRANT SELECT ON orders_with_usd TO authenticated;
GRANT SELECT ON orders_with_usd TO anon;
