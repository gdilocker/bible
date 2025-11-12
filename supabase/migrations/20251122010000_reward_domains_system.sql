/*
  # Sistema de Domínios de Recompensa

  ## Resumo
  Implementa gerador automático de domínios como forma de pagamento de créditos/comissões.
  Todo crédito é convertido em ativo digital real (domínio).

  ## 1. Alterações em Domains
  - Adiciona flag `reward_generated` (boolean)
  - Adiciona `reward_source_id` (referência à comissão/venda)

  ## 2. Alterações em Commissions
  - Adiciona `paid_via_domain_id` (referência ao domínio gerado)
  - Adiciona status 'paid_via_domain'

  ## 3. Nova Tabela: reward_domain_rules
  - Define faixas de valor e tipo de domínio gerado

  ## 4. Função: generate_reward_domain()
  - Gera domínio automaticamente baseado no valor
  - Garante unicidade
  - Registra em nome do beneficiário
*/

-- =====================================================
-- 1. ADICIONAR COLUNAS EM DOMAINS
-- =====================================================

DO $$
BEGIN
  -- Flag para domínios de recompensa
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'domains' AND column_name = 'reward_generated'
  ) THEN
    ALTER TABLE domains ADD COLUMN reward_generated boolean DEFAULT false;
  END IF;

  -- Referência à fonte da recompensa (comissão, venda, etc)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'domains' AND column_name = 'reward_source_id'
  ) THEN
    ALTER TABLE domains ADD COLUMN reward_source_id uuid;
  END IF;

  -- Tipo de recompensa
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'domains' AND column_name = 'reward_type'
  ) THEN
    ALTER TABLE domains ADD COLUMN reward_type text CHECK (reward_type IN ('commission', 'sale', 'bonus', 'referral'));
  END IF;
END $$;

-- Índices
CREATE INDEX IF NOT EXISTS idx_domains_reward ON domains(reward_generated) WHERE reward_generated = true;
CREATE INDEX IF NOT EXISTS idx_domains_reward_source ON domains(reward_source_id) WHERE reward_source_id IS NOT NULL;

-- =====================================================
-- 2. ATUALIZAR PARTNER_COMMISSIONS
-- =====================================================

DO $$
BEGIN
  -- Referência ao domínio gerado como pagamento
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'partner_commissions' AND column_name = 'paid_via_domain_id'
  ) THEN
    ALTER TABLE partner_commissions ADD COLUMN paid_via_domain_id uuid REFERENCES domains(id);
  END IF;

  -- Atualizar constraint de status
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'partner_commissions_status_check'
    AND table_name = 'partner_commissions'
  ) THEN
    ALTER TABLE partner_commissions DROP CONSTRAINT partner_commissions_status_check;
  END IF;

  ALTER TABLE partner_commissions ADD CONSTRAINT partner_commissions_status_check
    CHECK (status IN ('pending', 'approved', 'paid_via_domain', 'cancelled'));
END $$;

-- Índice
CREATE INDEX IF NOT EXISTS idx_commissions_paid_domain ON partner_commissions(paid_via_domain_id) WHERE paid_via_domain_id IS NOT NULL;

-- =====================================================
-- 3. TABELA DE REGRAS DE RECOMPENSA
-- =====================================================

CREATE TABLE IF NOT EXISTS reward_domain_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_amount_usd numeric(10,2) NOT NULL,
  max_amount_usd numeric(10,2) NOT NULL,
  domain_type text NOT NULL CHECK (domain_type IN ('quick_access', 'credit')),
  pattern_type text CHECK (pattern_type IN ('LN', 'LLNN', 'code', 'numeric')),
  min_digits int,
  max_digits int,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_amount_range CHECK (min_amount_usd < max_amount_usd)
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_reward_rules_active ON reward_domain_rules(is_active, min_amount_usd, max_amount_usd);

-- Seed de regras padrão
INSERT INTO reward_domain_rules (min_amount_usd, max_amount_usd, domain_type, pattern_type, description) VALUES
  (0.01, 5.00, 'quick_access', 'LN', 'Até $5 - Código curto L+N (ex: a1)'),
  (5.01, 50.00, 'credit', 'numeric', 'De $5 a $50 - Número 8+ dígitos'),
  (50.01, 500.00, 'credit', 'numeric', 'De $50 a $500 - Número 6-7 dígitos'),
  (500.01, 999999.99, 'credit', 'numeric', 'Acima de $500 - Número 4-5 dígitos')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. FUNÇÃO: GERAR DOMÍNIO DE RECOMPENSA
-- =====================================================

CREATE OR REPLACE FUNCTION generate_reward_domain(
  p_user_id uuid,
  p_amount_usd numeric,
  p_reward_type text DEFAULT 'commission',
  p_source_id uuid DEFAULT NULL
)
RETURNS TABLE (
  domain_id uuid,
  domain_name text,
  domain_type text,
  full_domain text
) AS $$
DECLARE
  v_rule record;
  v_domain_name text;
  v_domain_type text;
  v_pattern_type text;
  v_attempts int := 0;
  v_max_attempts int := 100;
  v_exists boolean;
  v_new_domain_id uuid;
BEGIN
  -- Buscar regra aplicável
  SELECT * INTO v_rule
  FROM reward_domain_rules
  WHERE is_active = true
    AND p_amount_usd >= min_amount_usd
    AND p_amount_usd <= max_amount_usd
  ORDER BY min_amount_usd DESC
  LIMIT 1;

  IF v_rule IS NULL THEN
    RAISE EXCEPTION 'Nenhuma regra encontrada para valor %', p_amount_usd;
  END IF;

  v_domain_type := v_rule.domain_type;
  v_pattern_type := v_rule.pattern_type;

  -- Loop para gerar domínio único
  LOOP
    v_attempts := v_attempts + 1;

    IF v_attempts > v_max_attempts THEN
      RAISE EXCEPTION 'Não foi possível gerar domínio único após % tentativas', v_max_attempts;
    END IF;

    -- Gerar nome baseado no tipo
    IF v_domain_type = 'quick_access' THEN
      IF v_pattern_type = 'LN' THEN
        -- L+N: a1, b2, etc
        v_domain_name := chr(97 + floor(random() * 26)::int) || floor(random() * 9 + 1)::text;
      ELSIF v_pattern_type = 'LLNN' THEN
        -- LL+NN: br22, us45, etc
        v_domain_name := chr(97 + floor(random() * 26)::int) ||
                         chr(97 + floor(random() * 26)::int) ||
                         floor(random() * 90 + 10)::text;
      ELSE
        -- Código seguro (6-10 chars)
        v_domain_name := '';
        FOR i IN 1..8 LOOP
          v_domain_name := v_domain_name || substr('abcdefghjkmnpqrstuvwxyz23456789', floor(random() * 31 + 1)::int, 1);
        END LOOP;
      END IF;
    ELSIF v_domain_type = 'credit' THEN
      -- Gerar número baseado na faixa
      IF p_amount_usd > 500 THEN
        -- 4-5 dígitos
        v_domain_name := (10000 + floor(random() * 90000))::text;
      ELSIF p_amount_usd > 50 THEN
        -- 6-7 dígitos
        v_domain_name := (1000000 + floor(random() * 9000000))::text;
      ELSE
        -- 8+ dígitos
        v_domain_name := (100000000 + floor(random() * 900000000)::bigint)::text;
      END IF;
    END IF;

    -- Verificar se existe
    SELECT EXISTS (
      SELECT 1 FROM domains WHERE domain_name = v_domain_name
    ) INTO v_exists;

    EXIT WHEN NOT v_exists;
  END LOOP;

  -- Inserir domínio
  INSERT INTO domains (
    user_id,
    domain_name,
    domain_type,
    purchase_price_usd,
    reward_generated,
    reward_type,
    reward_source_id,
    status,
    for_sale,
    transferable_from,
    pattern_type
  ) VALUES (
    p_user_id,
    v_domain_name,
    v_domain_type,
    p_amount_usd,
    true,
    p_reward_type,
    p_source_id,
    'active',
    false,
    now(), -- Transferível imediatamente
    v_pattern_type
  )
  RETURNING id INTO v_new_domain_id;

  -- Retornar dados do domínio criado
  RETURN QUERY
  SELECT
    v_new_domain_id,
    v_domain_name,
    v_domain_type,
    v_domain_name || '.pix.global' as full_domain;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. TRIGGER: AUTO-GERAR DOMÍNIO AO APROVAR COMISSÃO
-- =====================================================

CREATE OR REPLACE FUNCTION auto_generate_reward_on_commission_approval()
RETURNS TRIGGER AS $$
DECLARE
  v_domain record;
BEGIN
  -- Só processar quando mudar para 'approved' e não tiver domínio gerado
  IF NEW.status = 'approved' AND OLD.status = 'pending' AND NEW.paid_via_domain_id IS NULL THEN

    -- Gerar domínio de recompensa
    SELECT * INTO v_domain
    FROM generate_reward_domain(
      NEW.partner_id,
      NEW.commission_credits, -- Usar o valor em créditos como base
      'commission',
      NEW.id
    );

    -- Atualizar comissão com referência ao domínio
    UPDATE partner_commissions
    SET
      paid_via_domain_id = v_domain.domain_id,
      status = 'paid_via_domain',
      approved_at = now()
    WHERE id = NEW.id;

    -- TODO: Disparar e-mail de notificação
    -- PERFORM notify_reward_domain_generated(NEW.partner_id, v_domain.full_domain);

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_generate_reward ON partner_commissions;
CREATE TRIGGER trigger_auto_generate_reward
  AFTER UPDATE ON partner_commissions
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_reward_on_commission_approval();

-- =====================================================
-- 6. VIEW: DOMÍNIOS DE RECOMPENSA POR USUÁRIO
-- =====================================================

CREATE OR REPLACE VIEW user_reward_domains AS
SELECT
  d.id,
  d.user_id,
  d.domain_name,
  d.domain_name || '.pix.global' as full_domain,
  d.domain_type,
  d.purchase_price_usd as reward_value_usd,
  d.reward_type,
  d.reward_source_id,
  d.created_at as received_at,
  d.status,
  d.for_sale,
  CASE
    WHEN d.reward_type = 'commission' THEN
      (SELECT sale_type FROM partner_commissions WHERE id = d.reward_source_id)
    ELSE NULL
  END as commission_source
FROM domains d
WHERE d.reward_generated = true
ORDER BY d.created_at DESC;

-- =====================================================
-- 7. RLS PARA REWARD DOMAINS
-- =====================================================

-- Usuários podem ver seus próprios domínios de recompensa
CREATE POLICY "Users can view own reward domains"
  ON domains FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    AND reward_generated = true
  );

-- =====================================================
-- 8. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON COLUMN domains.reward_generated IS 'True se domínio foi gerado automaticamente como recompensa';
COMMENT ON COLUMN domains.reward_source_id IS 'ID da comissão/venda que originou esta recompensa';
COMMENT ON COLUMN domains.reward_type IS 'Tipo: commission, sale, bonus, referral';
COMMENT ON COLUMN partner_commissions.paid_via_domain_id IS 'Domínio gerado como pagamento desta comissão';
COMMENT ON TABLE reward_domain_rules IS 'Regras para geração automática de domínios por faixa de valor';
COMMENT ON FUNCTION generate_reward_domain IS 'Gera domínio único como recompensa baseado no valor';
