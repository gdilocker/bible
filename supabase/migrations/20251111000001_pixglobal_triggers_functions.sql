/*
  # Pix.Global - Triggers e Funções Auxiliares

  ## Descrição
  Funções e triggers para automação e auditoria:
  - Atualização automática de updated_at
  - Log automático de auditoria
  - Validações adicionais
  - Funções auxiliares

  ## Funções Criadas

  1. `update_updated_at_column()` - Atualiza timestamp automaticamente
  2. `audit_log()` - Cria log de auditoria automático
  3. `validate_domain_type()` - Valida tipo de domínio baseado no FQDN
  4. `get_user_domains_count()` - Retorna quantidade de domínios do usuário
*/

-- =============================================================================
-- FUNÇÃO: Atualizar updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Atualiza automaticamente a coluna updated_at';

-- =============================================================================
-- TRIGGERS: updated_at
-- =============================================================================

-- Domains
DROP TRIGGER IF EXISTS update_domains_updated_at ON domains;
CREATE TRIGGER update_domains_updated_at
  BEFORE UPDATE ON domains
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Routes
DROP TRIGGER IF EXISTS update_routes_updated_at ON routes;
CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FUNÇÃO: Auditoria Automática
-- =============================================================================

CREATE OR REPLACE FUNCTION audit_log()
RETURNS TRIGGER AS $$
DECLARE
  v_actor text;
  v_action text;
  v_old_data jsonb;
  v_new_data jsonb;
  v_metadata jsonb;
BEGIN
  -- Determinar ator
  v_actor := COALESCE(
    auth.uid()::text,
    current_setting('request.jwt.claims', true)::json->>'sub',
    'system'
  );

  -- Determinar ação
  IF (TG_OP = 'INSERT') THEN
    v_action := 'create';
    v_new_data := to_jsonb(NEW);
    v_metadata := jsonb_build_object(
      'new', v_new_data
    );
  ELSIF (TG_OP = 'UPDATE') THEN
    v_action := 'update';
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    v_metadata := jsonb_build_object(
      'old', v_old_data,
      'new', v_new_data
    );
  ELSIF (TG_OP = 'DELETE') THEN
    v_action := 'delete';
    v_old_data := to_jsonb(OLD);
    v_metadata := jsonb_build_object(
      'old', v_old_data
    );
  END IF;

  -- Inserir log de auditoria
  INSERT INTO audits (actor, action, entity, entity_id, metadata)
  VALUES (
    v_actor,
    v_action,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    v_metadata
  );

  -- Retornar registro apropriado
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION audit_log() IS 'Cria automaticamente logs de auditoria para operações em tabelas';

-- =============================================================================
-- TRIGGERS: Auditoria
-- =============================================================================

-- Domains audit
DROP TRIGGER IF EXISTS audit_domains ON domains;
CREATE TRIGGER audit_domains
  AFTER INSERT OR UPDATE OR DELETE ON domains
  FOR EACH ROW
  EXECUTE FUNCTION audit_log();

-- Orders audit
DROP TRIGGER IF EXISTS audit_orders ON orders;
CREATE TRIGGER audit_orders
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION audit_log();

-- Routes audit
DROP TRIGGER IF EXISTS audit_routes ON routes;
CREATE TRIGGER audit_routes
  AFTER INSERT OR UPDATE OR DELETE ON routes
  FOR EACH ROW
  EXECUTE FUNCTION audit_log();

-- =============================================================================
-- FUNÇÃO: Validar tipo de domínio
-- =============================================================================

CREATE OR REPLACE FUNCTION validate_domain_type()
RETURNS TRIGGER AS $$
BEGIN
  -- Extrair subdomain do FQDN (parte antes do primeiro ponto)
  DECLARE
    v_subdomain text;
  BEGIN
    v_subdomain := split_part(NEW.fqdn, '.', 1);

    -- Se subdomain é puramente numérico, deve ser type='numeric'
    IF v_subdomain ~ '^[0-9]+$' THEN
      IF NEW.type != 'numeric' THEN
        RAISE EXCEPTION 'Domínio numérico deve ter type=numeric';
      END IF;
    -- Se subdomain contém letras, deve ser type='personal'
    ELSIF v_subdomain ~ '[a-zA-Z]' THEN
      IF NEW.type != 'personal' THEN
        RAISE EXCEPTION 'Domínio com letras deve ter type=personal';
      END IF;
    END IF;

    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_domain_type() IS 'Valida se o tipo do domínio corresponde ao FQDN';

-- Trigger de validação
DROP TRIGGER IF EXISTS validate_domain_type_trigger ON domains;
CREATE TRIGGER validate_domain_type_trigger
  BEFORE INSERT OR UPDATE ON domains
  FOR EACH ROW
  EXECUTE FUNCTION validate_domain_type();

-- =============================================================================
-- FUNÇÃO: Contar domínios do usuário
-- =============================================================================

CREATE OR REPLACE FUNCTION get_user_domains_count(p_user_id uuid DEFAULT NULL)
RETURNS TABLE(
  total bigint,
  active bigint,
  suspended bigint,
  pending bigint,
  expired bigint,
  personal bigint,
  numeric bigint
) AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Se não fornecido, usar usuário autenticado
  v_user_id := COALESCE(p_user_id, auth.uid());

  RETURN QUERY
  SELECT
    COUNT(*)::bigint as total,
    COUNT(*) FILTER (WHERE status = 'active')::bigint as active,
    COUNT(*) FILTER (WHERE status = 'suspended')::bigint as suspended,
    COUNT(*) FILTER (WHERE status = 'pending')::bigint as pending,
    COUNT(*) FILTER (WHERE status = 'expired')::bigint as expired,
    COUNT(*) FILTER (WHERE type = 'personal')::bigint as personal,
    COUNT(*) FILTER (WHERE type = 'numeric')::bigint as numeric
  FROM domains
  WHERE owner_user_id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_domains_count IS 'Retorna estatísticas de domínios do usuário';

-- =============================================================================
-- FUNÇÃO: Obter histórico de auditoria de uma entidade
-- =============================================================================

CREATE OR REPLACE FUNCTION get_entity_audit_log(
  p_entity text,
  p_entity_id text,
  p_limit int DEFAULT 50
)
RETURNS TABLE(
  id uuid,
  actor text,
  action text,
  metadata jsonb,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.actor,
    a.action,
    a.metadata,
    a.created_at
  FROM audits a
  WHERE a.entity = p_entity
    AND a.entity_id = p_entity_id
  ORDER BY a.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_entity_audit_log IS 'Retorna histórico de auditoria de uma entidade';

-- =============================================================================
-- FUNÇÃO: Verificar disponibilidade de domínio
-- =============================================================================

CREATE OR REPLACE FUNCTION check_domain_available(p_fqdn text)
RETURNS boolean AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM domains
    WHERE fqdn = p_fqdn
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_domain_available IS 'Verifica se um domínio está disponível para registro';

-- =============================================================================
-- FUNÇÃO: Obter rotas ativas de um domínio
-- =============================================================================

CREATE OR REPLACE FUNCTION get_domain_active_routes(p_domain_id uuid)
RETURNS TABLE(
  id uuid,
  pix_provider text,
  pix_key text,
  crypto_type text,
  crypto_address text,
  paypal_link text,
  priority int
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.pix_provider,
    r.pix_key,
    r.crypto_type,
    r.crypto_address,
    r.paypal_link,
    r.priority
  FROM routes r
  WHERE r.domain_id = p_domain_id
    AND r.active = true
  ORDER BY r.priority ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_domain_active_routes IS 'Retorna rotas ativas de um domínio ordenadas por prioridade';

-- =============================================================================
-- FUNÇÃO: Criar pedido e verificar duplicatas
-- =============================================================================

CREATE OR REPLACE FUNCTION create_order_safe(
  p_fqdn text,
  p_user_id uuid,
  p_price_pix numeric,
  p_currency text,
  p_provider text
)
RETURNS uuid AS $$
DECLARE
  v_order_id uuid;
  v_existing_pending int;
BEGIN
  -- Verificar se já existe pedido pendente para este domínio e usuário
  SELECT COUNT(*) INTO v_existing_pending
  FROM orders
  WHERE fqdn = p_fqdn
    AND user_id = p_user_id
    AND status = 'pending'
    AND created_at > (now() - interval '30 minutes');

  IF v_existing_pending > 0 THEN
    RAISE EXCEPTION 'Já existe um pedido pendente para este domínio';
  END IF;

  -- Criar pedido
  INSERT INTO orders (fqdn, user_id, price_pix, currency, provider, status)
  VALUES (p_fqdn, p_user_id, p_price_pix, p_currency, p_provider, 'pending')
  RETURNING id INTO v_order_id;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_order_safe IS 'Cria um pedido verificando duplicatas recentes';

-- =============================================================================
-- FUNÇÃO: Finalizar pedido e criar domínio
-- =============================================================================

CREATE OR REPLACE FUNCTION complete_order_and_create_domain(
  p_order_id uuid,
  p_plan text DEFAULT 'basic'
)
RETURNS uuid AS $$
DECLARE
  v_order record;
  v_domain_id uuid;
BEGIN
  -- Buscar pedido
  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido não encontrado ou já processado';
  END IF;

  -- Verificar se domínio já existe
  IF EXISTS (SELECT 1 FROM domains WHERE fqdn = v_order.fqdn) THEN
    RAISE EXCEPTION 'Domínio já está registrado';
  END IF;

  -- Determinar tipo baseado no FQDN
  DECLARE
    v_subdomain text;
    v_type text;
  BEGIN
    v_subdomain := split_part(v_order.fqdn, '.', 1);
    IF v_subdomain ~ '^[0-9]+$' THEN
      v_type := 'numeric';
    ELSE
      v_type := 'personal';
    END IF;

    -- Criar domínio
    INSERT INTO domains (
      fqdn,
      type,
      owner_user_id,
      plan,
      status
    ) VALUES (
      v_order.fqdn,
      v_type,
      v_order.user_id,
      p_plan,
      'active'
    ) RETURNING id INTO v_domain_id;
  END;

  -- Atualizar pedido
  UPDATE orders
  SET status = 'paid', updated_at = now()
  WHERE id = p_order_id;

  RETURN v_domain_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION complete_order_and_create_domain IS 'Finaliza pedido e cria domínio automaticamente';
