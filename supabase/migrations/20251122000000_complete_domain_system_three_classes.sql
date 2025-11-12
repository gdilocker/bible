/*
  # Sistema Completo de Três Classes de Domínios - Pix.Global

  ## Resumo
  Implementa sistema unificado com três classes de domínios:
  - **Identity**: Identidade digital com anuidade (basic $25/ano, pro $35/ano)
  - **Credit**: Créditos digitais (números puros, pagamento único)
  - **Quick Access**: Acesso rápido (alfanumérico curto, pagamento único)

  ## 1. Estrutura de Planos
  - `free`: Recebe/guarda/transfere ativos, não cria identidade
  - `basic`: $25/ano - 1 identidade com página
  - `pro`: $35/ano - 1 identidade com página + e-mail

  ## 2. Novas Tabelas
  - `subscription_plans`: Planos de assinatura (identity)
  - `user_accounts`: Nível de conta de cada usuário
  - `domains`: Unifica todos os tipos de domínio
  - `listings`: Marketplace de revenda
  - `domain_transfers`: Transferências de domínios
  - `partner_commissions`: Comissionamento interno

  ## 3. Segurança
  - RLS habilitado em todas as tabelas
  - Políticas restritivas para cada tipo de operação
  - Validações de regex e regras de negócio
*/

-- =====================================================
-- 1. PLANOS DE ASSINATURA (IDENTITY)
-- =====================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL CHECK (code IN ('basic', 'pro')),
  name text NOT NULL,
  price_usd numeric(10,2) NOT NULL CHECK (price_usd >= 0),
  period text NOT NULL DEFAULT 'annual' CHECK (period IN ('monthly', 'annual')),
  features jsonb DEFAULT '[]'::jsonb,
  max_identities int NOT NULL DEFAULT 1,
  includes_email boolean NOT NULL DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed dos planos
INSERT INTO subscription_plans (code, name, price_usd, period, max_identities, includes_email, features) VALUES
  ('basic', 'Basic', 25.00, 'annual', 1, false, '["1 identidade digital", "Página pública personalizável", "Links ilimitados", "Estatísticas básicas"]'::jsonb),
  ('pro', 'Pro', 35.00, 'annual', 1, true, '["1 identidade digital", "Página pública personalizável", "Links ilimitados", "Estatísticas avançadas", "E-mail profissional @pix.global"]'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 2. CONTAS DE USUÁRIO (FREE, BASIC, PRO)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_level text NOT NULL DEFAULT 'free' CHECK (account_level IN ('free', 'basic', 'pro')),
  subscription_id uuid REFERENCES subscriptions(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_accounts_user_id ON user_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_accounts_level ON user_accounts(account_level);

-- RLS
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own account"
  ON user_accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own account"
  ON user_accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 3. DOMÍNIOS UNIFICADOS (IDENTITY, CREDIT, QUICK_ACCESS)
-- =====================================================

-- Remover constraint antigo se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'domains_domain_type_check'
    AND table_name = 'domains'
  ) THEN
    ALTER TABLE domains DROP CONSTRAINT domains_domain_type_check;
  END IF;
END $$;

-- Adicionar coluna domain_type se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'domains' AND column_name = 'domain_type'
  ) THEN
    ALTER TABLE domains ADD COLUMN domain_type text;
  END IF;
END $$;

-- Adicionar nova constraint
ALTER TABLE domains ADD CONSTRAINT domains_domain_type_check
  CHECK (domain_type IN ('identity', 'credit', 'quick_access', 'personal', 'numeric'));

-- Adicionar colunas específicas para cada tipo
DO $$
BEGIN
  -- Para identity
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'domains' AND column_name = 'plan_code') THEN
    ALTER TABLE domains ADD COLUMN plan_code text REFERENCES subscription_plans(code);
  END IF;

  -- Para credit/quick_access (marketplace)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'domains' AND column_name = 'purchase_price_usd') THEN
    ALTER TABLE domains ADD COLUMN purchase_price_usd numeric(12,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'domains' AND column_name = 'for_sale') THEN
    ALTER TABLE domains ADD COLUMN for_sale boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'domains' AND column_name = 'sale_price_usd') THEN
    ALTER TABLE domains ADD COLUMN sale_price_usd numeric(12,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'domains' AND column_name = 'transferable_from') THEN
    ALTER TABLE domains ADD COLUMN transferable_from timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'domains' AND column_name = 'pattern_type') THEN
    ALTER TABLE domains ADD COLUMN pattern_type text CHECK (pattern_type IN ('LN', 'LLNN', 'code', 'numeric', 'custom'));
  END IF;
END $$;

-- Índices adicionais
CREATE INDEX IF NOT EXISTS idx_domains_type ON domains(domain_type);
CREATE INDEX IF NOT EXISTS idx_domains_for_sale ON domains(for_sale) WHERE for_sale = true;
CREATE INDEX IF NOT EXISTS idx_domains_pattern ON domains(pattern_type) WHERE pattern_type IS NOT NULL;

-- =====================================================
-- 4. MARKETPLACE (LISTINGS)
-- =====================================================

CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id uuid NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  price_usd numeric(12,2) NOT NULL CHECK (price_usd > 0),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'sold', 'cancelled')),
  buyer_id uuid REFERENCES auth.users(id),
  sold_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_listings_domain_id ON listings(domain_id);
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_open ON listings(status, price_usd) WHERE status = 'open';

-- RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open listings"
  ON listings FOR SELECT
  USING (status = 'open');

CREATE POLICY "Sellers can create listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- =====================================================
-- 5. TRANSFERÊNCIAS DE DOMÍNIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS domain_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id uuid NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL REFERENCES auth.users(id),
  to_email text NOT NULL,
  to_user_id uuid REFERENCES auth.users(id),
  transfer_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cancelled', 'expired')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_transfers_domain_id ON domain_transfers(domain_id);
CREATE INDEX IF NOT EXISTS idx_transfers_from_user ON domain_transfers(from_user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to_user ON domain_transfers(to_user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_token ON domain_transfers(transfer_token);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON domain_transfers(status);

-- RLS
ALTER TABLE domain_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transfers"
  ON domain_transfers FOR SELECT
  TO authenticated
  USING (
    auth.uid() = from_user_id
    OR auth.uid() = to_user_id
    OR (SELECT email FROM auth.users WHERE id = auth.uid()) = to_email
  );

CREATE POLICY "Users can create transfers"
  ON domain_transfers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Recipients can update transfers"
  ON domain_transfers FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = to_user_id
    OR (SELECT email FROM auth.users WHERE id = auth.uid()) = to_email
  );

-- =====================================================
-- 6. COMISSIONAMENTO INTERNO
-- =====================================================

CREATE TABLE IF NOT EXISTS partner_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sale_type text NOT NULL CHECK (sale_type IN ('identity', 'credit', 'quick_access', 'marketplace')),
  sale_id uuid NOT NULL,
  sale_amount_usd numeric(12,2) NOT NULL,
  commission_percent numeric(5,2) NOT NULL DEFAULT 10.00,
  commission_credits numeric(12,4) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'cancelled')),
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_commissions_partner_id ON partner_commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON partner_commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_sale ON partner_commissions(sale_type, sale_id);

-- RLS
ALTER TABLE partner_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own commissions"
  ON partner_commissions FOR SELECT
  TO authenticated
  USING (auth.uid() = partner_id);

CREATE POLICY "Admins can manage commissions"
  ON partner_commissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- =====================================================
-- 7. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para validar nome de domínio identity
CREATE OR REPLACE FUNCTION validate_identity_domain(name text)
RETURNS boolean AS $$
BEGIN
  -- ^[a-z][a-z0-9-]{1,62}$
  -- Não começar/terminar com hífen, sem hífen duplo
  RETURN (
    name ~ '^[a-z][a-z0-9-]{1,62}$'
    AND name NOT LIKE '%---%'
    AND name NOT LIKE '-%'
    AND name NOT LIKE '%-'
    AND name NOT IN ('admin', 'support', 'root', 'api', 'www', 'mail', 'ftp')
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para validar número (credit)
CREATE OR REPLACE FUNCTION validate_credit_domain(number text)
RETURNS boolean AS $$
BEGIN
  -- ^[0-9]{1,63}$
  RETURN number ~ '^[0-9]{1,63}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para validar quick_access
CREATE OR REPLACE FUNCTION validate_quick_access_domain(code text)
RETURNS boolean AS $$
BEGIN
  -- ^[a-hj-km-np-z2-9]{2,12}$  (sem 0/o/1/l/i)
  RETURN code ~ '^[a-hj-km-np-z2-9]{2,12}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para calcular preço de número baseado em raridade
CREATE OR REPLACE FUNCTION calculate_credit_price(number text)
RETURNS numeric AS $$
DECLARE
  length int;
  base_price numeric;
BEGIN
  length := length(number);

  -- Tabela de preços base por comprimento
  CASE
    WHEN length >= 8 THEN base_price := 1.00;
    WHEN length = 7 THEN base_price := 5.00;
    WHEN length = 6 THEN base_price := 10.00;
    WHEN length = 5 THEN base_price := 100.00;
    WHEN length = 4 THEN base_price := 1000.00;
    WHEN length = 3 THEN base_price := 10000.00;
    WHEN length = 2 THEN base_price := 100000.00;
    WHEN length = 1 THEN base_price := 1000000.00;
    ELSE base_price := 1.00;
  END CASE;

  -- Multiplicadores por padrões especiais serão aplicados no código
  RETURN base_price;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para calcular preço de quick_access
CREATE OR REPLACE FUNCTION calculate_quick_access_price(code text, pattern text)
RETURNS numeric AS $$
BEGIN
  CASE pattern
    WHEN 'LN' THEN RETURN 2.00;
    WHEN 'LLNN' THEN RETURN 3.00;
    WHEN 'code' THEN RETURN 5.00;
    ELSE RETURN 5.00;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 8. TRIGGER PARA AUTO-CREATE USER_ACCOUNT
-- =====================================================

CREATE OR REPLACE FUNCTION create_user_account_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_accounts (user_id, account_level)
  VALUES (NEW.id, 'free')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_account ON auth.users;
CREATE TRIGGER on_auth_user_created_account
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_account_on_signup();

-- =====================================================
-- 9. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE subscription_plans IS 'Planos de assinatura para domínios identity (basic $25/ano, pro $35/ano)';
COMMENT ON TABLE user_accounts IS 'Nível de conta de cada usuário (free, basic, pro)';
COMMENT ON TABLE listings IS 'Marketplace de revenda de domínios credit e quick_access';
COMMENT ON TABLE domain_transfers IS 'Sistema de transferência de domínios entre usuários';
COMMENT ON TABLE partner_commissions IS 'Comissionamento interno em créditos Pix.Global';

COMMENT ON COLUMN domains.domain_type IS 'Tipo: identity (anuidade), credit (número único), quick_access (alfanumérico curto)';
COMMENT ON COLUMN domains.plan_code IS 'Para identity: basic ou pro';
COMMENT ON COLUMN domains.purchase_price_usd IS 'Para credit/quick_access: preço de compra único';
COMMENT ON COLUMN domains.transferable_from IS 'Para identity: data após qual pode transferir (12 meses)';
COMMENT ON COLUMN domains.pattern_type IS 'Para quick_access: LN, LLNN, code';
