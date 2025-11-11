/*
  # Pix.Global - Core Schema

  ## Descrição
  Migration inicial para o sistema Pix.Global com suporte a:
  - Domínios (pessoais e numéricos) com NFT/Blockchain
  - Pedidos com múltiplos provedores de pagamento
  - Roteamento de pagamentos (Pix, Crypto, PayPal)
  - Auditoria completa de ações

  ## Tabelas Criadas

  ### 1. domains
  Domínios registrados no sistema (FQDN completos)
  - `id` - UUID único
  - `fqdn` - Nome completo do domínio (ex: joao.pix.global)
  - `type` - Tipo: 'personal' (nomes) ou 'numeric' (números)
  - `owner_user_id` - Proprietário (referência a auth.users)
  - `owner_wallet` - Carteira blockchain do proprietário
  - `plan` - Plano contratado
  - `status` - Status: 'active', 'suspended', 'pending', 'expired'
  - `nft_contract` - Endereço do contrato NFT
  - `token_id` - ID do token NFT
  - `routing` - Configuração de roteamento padrão
  - Timestamps de criação e atualização

  ### 2. orders
  Pedidos de registro/renovação de domínios
  - `id` - UUID único
  - `fqdn` - Domínio sendo adquirido
  - `user_id` - Comprador
  - `price_pix` - Preço em BRL
  - `currency` - Moeda (BRL, USD, etc)
  - `provider` - Provedor de pagamento usado
  - `provider_ref` - Referência externa do pagamento
  - `status` - Status: 'pending', 'paid', 'failed', 'cancelled'
  - Timestamps

  ### 3. routes
  Configurações de roteamento de pagamentos por domínio
  - `id` - UUID único
  - `domain_id` - Domínio associado
  - `pix_provider` - Provedor Pix (Mercado Pago, etc)
  - `pix_key` - Chave Pix para receber pagamentos
  - `crypto_type` - Tipo de criptomoeda (BTC, ETH, etc)
  - `crypto_address` - Endereço da carteira crypto
  - `paypal_link` - Link PayPal.me
  - `active` - Se a rota está ativa
  - `priority` - Prioridade de exibição (menor = maior prioridade)

  ### 4. audits
  Log de auditoria de todas as ações críticas
  - `id` - UUID único
  - `actor` - Quem executou a ação (user_id ou 'system')
  - `action` - Ação executada
  - `entity` - Tipo de entidade afetada
  - `entity_id` - ID da entidade
  - `metadata` - Dados adicionais em JSON
  - Timestamp

  ## Segurança
  - RLS habilitado em todas as tabelas
  - Usuários só acessam seus próprios dados
  - Service role tem acesso total (admin bypass)
  - Políticas separadas para SELECT, INSERT, UPDATE, DELETE
*/

-- =============================================================================
-- DOMAINS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fqdn text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('personal', 'numeric')),
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_wallet text,
  plan text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'suspended', 'pending', 'expired')),
  nft_contract text,
  token_id bigint,
  routing text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comentários
COMMENT ON TABLE domains IS 'Domínios registrados no Pix.Global';
COMMENT ON COLUMN domains.fqdn IS 'Nome completo do domínio (ex: joao.pix.global)';
COMMENT ON COLUMN domains.type IS 'Tipo de domínio: personal (nomes) ou numeric (números)';
COMMENT ON COLUMN domains.owner_wallet IS 'Carteira blockchain do proprietário';
COMMENT ON COLUMN domains.nft_contract IS 'Endereço do contrato NFT que representa este domínio';
COMMENT ON COLUMN domains.token_id IS 'ID do token NFT deste domínio';
COMMENT ON COLUMN domains.routing IS 'Configuração de roteamento padrão';

-- =============================================================================
-- ORDERS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fqdn text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  price_pix numeric NOT NULL,
  currency text NOT NULL DEFAULT 'BRL',
  provider text NOT NULL,
  provider_ref text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'expired')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comentários
COMMENT ON TABLE orders IS 'Pedidos de registro/renovação de domínios';
COMMENT ON COLUMN orders.fqdn IS 'Domínio sendo adquirido';
COMMENT ON COLUMN orders.price_pix IS 'Preço em moeda local (BRL)';
COMMENT ON COLUMN orders.provider IS 'Provedor de pagamento: mercadopago, stripe, paypal, crypto';
COMMENT ON COLUMN orders.provider_ref IS 'Referência externa do pagamento';

-- =============================================================================
-- ROUTES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id uuid NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  pix_provider text,
  pix_key text,
  crypto_type text,
  crypto_address text,
  paypal_link text,
  active boolean DEFAULT true,
  priority int DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comentários
COMMENT ON TABLE routes IS 'Configurações de roteamento de pagamentos por domínio';
COMMENT ON COLUMN routes.domain_id IS 'Domínio ao qual esta rota pertence';
COMMENT ON COLUMN routes.pix_provider IS 'Provedor Pix: mercadopago, pagseguro, etc';
COMMENT ON COLUMN routes.pix_key IS 'Chave Pix para receber pagamentos';
COMMENT ON COLUMN routes.crypto_type IS 'Tipo de criptomoeda: BTC, ETH, USDT, etc';
COMMENT ON COLUMN routes.crypto_address IS 'Endereço da carteira crypto';
COMMENT ON COLUMN routes.paypal_link IS 'Link PayPal.me ou email';
COMMENT ON COLUMN routes.priority IS 'Ordem de exibição (menor número = maior prioridade)';

-- =============================================================================
-- AUDITS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor text NOT NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Comentários
COMMENT ON TABLE audits IS 'Log de auditoria de todas as ações críticas do sistema';
COMMENT ON COLUMN audits.actor IS 'Quem executou a ação: user_id ou "system"';
COMMENT ON COLUMN audits.action IS 'Ação executada: create, update, delete, etc';
COMMENT ON COLUMN audits.entity IS 'Tipo de entidade: domain, order, route, etc';
COMMENT ON COLUMN audits.entity_id IS 'ID da entidade afetada';
COMMENT ON COLUMN audits.metadata IS 'Dados adicionais da ação em JSON';

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Domains
CREATE INDEX IF NOT EXISTS idx_domains_owner ON domains(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_domains_fqdn ON domains(fqdn);
CREATE INDEX IF NOT EXISTS idx_domains_status ON domains(status);
CREATE INDEX IF NOT EXISTS idx_domains_type ON domains(type);
CREATE INDEX IF NOT EXISTS idx_domains_nft ON domains(nft_contract, token_id) WHERE nft_contract IS NOT NULL;

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_fqdn ON orders(fqdn);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_provider ON orders(provider);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- Routes
CREATE INDEX IF NOT EXISTS idx_routes_domain ON routes(domain_id);
CREATE INDEX IF NOT EXISTS idx_routes_active ON routes(active, priority) WHERE active = true;

-- Audits
CREATE INDEX IF NOT EXISTS idx_audits_actor ON audits(actor);
CREATE INDEX IF NOT EXISTS idx_audits_entity ON audits(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audits_created ON audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audits_action ON audits(action);

-- =============================================================================
-- RLS (Row Level Security)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- DOMAINS POLICIES
-- =============================================================================

-- SELECT: Usuário vê apenas seus domínios
CREATE POLICY "Users can view own domains"
  ON domains FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid());

-- INSERT: Usuário pode criar domínios para si
CREATE POLICY "Users can create own domains"
  ON domains FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

-- UPDATE: Usuário pode atualizar seus domínios
CREATE POLICY "Users can update own domains"
  ON domains FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- DELETE: Usuário pode deletar seus domínios
CREATE POLICY "Users can delete own domains"
  ON domains FOR DELETE
  TO authenticated
  USING (owner_user_id = auth.uid());

-- Admin bypass (service_role tem acesso total)
CREATE POLICY "Service role has full access to domains"
  ON domains FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- ORDERS POLICIES
-- =============================================================================

-- SELECT: Usuário vê apenas seus pedidos
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: Usuário pode criar pedidos para si
CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: Usuário pode atualizar seus pedidos
CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: Usuário pode deletar seus pedidos
CREATE POLICY "Users can delete own orders"
  ON orders FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admin bypass
CREATE POLICY "Service role has full access to orders"
  ON orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- ROUTES POLICIES
-- =============================================================================

-- SELECT: Usuário vê rotas de seus domínios
CREATE POLICY "Users can view routes of own domains"
  ON routes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM domains
      WHERE domains.id = routes.domain_id
      AND domains.owner_user_id = auth.uid()
    )
  );

-- INSERT: Usuário pode criar rotas para seus domínios
CREATE POLICY "Users can create routes for own domains"
  ON routes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM domains
      WHERE domains.id = routes.domain_id
      AND domains.owner_user_id = auth.uid()
    )
  );

-- UPDATE: Usuário pode atualizar rotas de seus domínios
CREATE POLICY "Users can update routes of own domains"
  ON routes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM domains
      WHERE domains.id = routes.domain_id
      AND domains.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM domains
      WHERE domains.id = routes.domain_id
      AND domains.owner_user_id = auth.uid()
    )
  );

-- DELETE: Usuário pode deletar rotas de seus domínios
CREATE POLICY "Users can delete routes of own domains"
  ON routes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM domains
      WHERE domains.id = routes.domain_id
      AND domains.owner_user_id = auth.uid()
    )
  );

-- Admin bypass
CREATE POLICY "Service role has full access to routes"
  ON routes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- AUDITS POLICIES
-- =============================================================================

-- SELECT: Usuário vê apenas audits de suas ações
CREATE POLICY "Users can view own audit logs"
  ON audits FOR SELECT
  TO authenticated
  USING (actor = auth.uid()::text);

-- INSERT: Sistema/Edge Functions podem criar audits
CREATE POLICY "System can create audit logs"
  ON audits FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE/DELETE: Apenas service_role (audits são imutáveis para usuários)
CREATE POLICY "Only service role can modify audits"
  ON audits FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only service role can delete audits"
  ON audits FOR DELETE
  TO service_role
  USING (true);

-- Admin bypass
CREATE POLICY "Service role has full access to audits"
  ON audits FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
