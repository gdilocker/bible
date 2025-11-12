/*
  # Sistema de Carteira de Créditos Internos

  ## Resumo
  Implementa carteira de créditos Pix.Global (moeda interna) separada do PayPal.
  Toda economia interna (marketplace, comissões, transferências) usa créditos.

  ## 1. Tabela: user_wallets
  - Saldo de créditos de cada usuário
  - Histórico de ganhos e gastos

  ## 2. Tabela: wallet_transactions
  - Todas as movimentações de créditos
  - Rastreabilidade completa

  ## 3. Tabela: platform_revenue
  - Receitas da plataforma (dinheiro real + créditos)
  - Separação por fonte

  ## 4. Triggers
  - Auto-create wallet no signup
  - Auto-register transactions
*/

-- =====================================================
-- 1. CARTEIRA DE CRÉDITOS (USER_WALLETS)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_usd numeric(12,2) DEFAULT 0 CHECK (balance_usd >= 0),
  total_earned numeric(12,2) DEFAULT 0 CHECK (total_earned >= 0),
  total_spent numeric(12,2) DEFAULT 0 CHECK (total_spent >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_balance ON user_wallets(balance_usd) WHERE balance_usd > 0;

-- RLS
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet"
  ON user_wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet balance"
  ON user_wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 2. HISTÓRICO DE TRANSAÇÕES (WALLET_TRANSACTIONS)
-- =====================================================

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('credit', 'debit')),
  source text NOT NULL CHECK (source IN (
    'commission',
    'marketplace_sale',
    'marketplace_purchase',
    'platform_bonus',
    'refund',
    'fee',
    'reward_conversion',
    'transfer_received',
    'transfer_sent',
    'initial_bonus'
  )),
  reference_id uuid,
  balance_before numeric(12,2) NOT NULL,
  balance_after numeric(12,2) NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_wallet_txns_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_txns_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_txns_source ON wallet_transactions(source);
CREATE INDEX IF NOT EXISTS idx_wallet_txns_reference ON wallet_transactions(reference_id) WHERE reference_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wallet_txns_created ON wallet_transactions(created_at DESC);

-- RLS
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON wallet_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. RECEITAS DA PLATAFORMA (PLATFORM_REVENUE)
-- =====================================================

CREATE TABLE IF NOT EXISTS platform_revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  source_type text NOT NULL CHECK (source_type IN (
    'direct_sale',        -- Venda direta via PayPal
    'marketplace_fee',    -- Taxa 5% marketplace
    'subscription',       -- Renovação identity
    'transfer_fee',       -- Taxa de transferência premium
    'listing_fee'         -- Taxa de listagem
  )),
  source_id uuid,
  currency text DEFAULT 'USD',
  payment_method text CHECK (payment_method IN ('paypal', 'internal_credits')),
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_revenue_source_type ON platform_revenue(source_type);
CREATE INDEX IF NOT EXISTS idx_revenue_payment_method ON platform_revenue(payment_method);
CREATE INDEX IF NOT EXISTS idx_revenue_created ON platform_revenue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_source_id ON platform_revenue(source_id) WHERE source_id IS NOT NULL;

-- RLS
ALTER TABLE platform_revenue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view revenue"
  ON platform_revenue FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- =====================================================
-- 4. FUNÇÃO: ADICIONAR CRÉDITOS
-- =====================================================

CREATE OR REPLACE FUNCTION add_wallet_credits(
  p_user_id uuid,
  p_amount numeric,
  p_source text,
  p_reference_id uuid DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_wallet record;
  v_transaction_id uuid;
BEGIN
  -- Validar amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Obter wallet (lock para evitar race condition)
  SELECT * INTO v_wallet
  FROM user_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_wallet IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
  END IF;

  -- Atualizar saldo
  UPDATE user_wallets
  SET
    balance_usd = balance_usd + p_amount,
    total_earned = total_earned + p_amount,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Registrar transação
  INSERT INTO wallet_transactions (
    user_id,
    amount,
    type,
    source,
    reference_id,
    balance_before,
    balance_after,
    description
  ) VALUES (
    p_user_id,
    p_amount,
    'credit',
    p_source,
    p_reference_id,
    v_wallet.balance_usd,
    v_wallet.balance_usd + p_amount,
    p_description
  )
  RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. FUNÇÃO: DEBITAR CRÉDITOS
-- =====================================================

CREATE OR REPLACE FUNCTION debit_wallet_credits(
  p_user_id uuid,
  p_amount numeric,
  p_source text,
  p_reference_id uuid DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_wallet record;
  v_transaction_id uuid;
BEGIN
  -- Validar amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Obter wallet (lock)
  SELECT * INTO v_wallet
  FROM user_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_wallet IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for user %', p_user_id;
  END IF;

  -- Verificar saldo
  IF v_wallet.balance_usd < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Current: %, Required: %', v_wallet.balance_usd, p_amount;
  END IF;

  -- Atualizar saldo
  UPDATE user_wallets
  SET
    balance_usd = balance_usd - p_amount,
    total_spent = total_spent + p_amount,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Registrar transação
  INSERT INTO wallet_transactions (
    user_id,
    amount,
    type,
    source,
    reference_id,
    balance_before,
    balance_after,
    description
  ) VALUES (
    p_user_id,
    p_amount,
    'debit',
    p_source,
    p_reference_id,
    v_wallet.balance_usd,
    v_wallet.balance_usd - p_amount,
    p_description
  )
  RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. TRIGGER: AUTO-CREATE WALLET ON SIGNUP
-- =====================================================

CREATE OR REPLACE FUNCTION create_wallet_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_wallets (user_id, balance_usd)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_wallet ON auth.users;
CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_wallet_on_signup();

-- =====================================================
-- 7. ATUALIZAR SISTEMA DE COMISSIONAMENTO
-- =====================================================

-- Adicionar coluna para vincular comissão à transação de wallet
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'partner_commissions' AND column_name = 'wallet_transaction_id'
  ) THEN
    ALTER TABLE partner_commissions ADD COLUMN wallet_transaction_id uuid REFERENCES wallet_transactions(id);
  END IF;
END $$;

-- =====================================================
-- 8. VIEW: WALLET SUMMARY
-- =====================================================

CREATE OR REPLACE VIEW user_wallet_summary AS
SELECT
  w.user_id,
  w.balance_usd,
  w.total_earned,
  w.total_spent,
  COUNT(DISTINCT wt.id) as total_transactions,
  SUM(CASE WHEN wt.type = 'credit' THEN wt.amount ELSE 0 END) as total_credits,
  SUM(CASE WHEN wt.type = 'debit' THEN wt.amount ELSE 0 END) as total_debits,
  (
    SELECT COUNT(*)
    FROM domains
    WHERE user_id = w.user_id
    AND reward_generated = true
  ) as reward_domains_count,
  w.created_at as wallet_created_at,
  w.updated_at as last_activity
FROM user_wallets w
LEFT JOIN wallet_transactions wt ON wt.user_id = w.user_id
GROUP BY w.user_id, w.balance_usd, w.total_earned, w.total_spent, w.created_at, w.updated_at;

-- =====================================================
-- 9. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE user_wallets IS 'Carteira de créditos internos Pix.Global de cada usuário';
COMMENT ON TABLE wallet_transactions IS 'Histórico completo de movimentações de créditos';
COMMENT ON TABLE platform_revenue IS 'Receitas da plataforma (dinheiro real + créditos)';
COMMENT ON FUNCTION add_wallet_credits IS 'Adiciona créditos à carteira do usuário (thread-safe)';
COMMENT ON FUNCTION debit_wallet_credits IS 'Debita créditos da carteira do usuário (thread-safe)';
COMMENT ON COLUMN user_wallets.balance_usd IS 'Saldo atual em créditos (equivalente USD)';
COMMENT ON COLUMN user_wallets.total_earned IS 'Total ganho historicamente';
COMMENT ON COLUMN user_wallets.total_spent IS 'Total gasto historicamente';
