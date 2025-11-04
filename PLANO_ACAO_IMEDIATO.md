# Plano de Ação Imediato - com.rich

## 🔴 SPRINT 1: CORREÇÕES CRÍTICAS DE SEGURANÇA (Semana 1)

### Dia 1-2: Segurança de Webhooks
- [ ] Implementar verificação de assinatura PayPal em `paypal-webhook`
- [ ] Implementar verificação de assinatura Dynadot em `dynadot-webhook`
- [ ] Adicionar idempotency keys (tabela `webhook_events` com hash do payload)
- [ ] Testar com eventos duplicados

### Dia 3: Rate Limiting
- [ ] Aplicar `rateLimit.middleware.ts` em TODAS as edge functions públicas
- [ ] Configurar limites:
  - Login: 5 tentativas / 15 min
  - Registro: 3 / hora
  - Password reset: 3 / hora
  - API calls: 100 / minuto por usuário

### Dia 4: Sanitização de Inputs
- [ ] Implementar sanitização de CSS customizado (profile_settings)
- [ ] Validar URLs de background (imagem/vídeo)
- [ ] Adicionar validação de file upload (tipo MIME, tamanho max)
- [ ] Implementar DOMPurify em todos os inputs de usuário

### Dia 5: CSRF Protection
- [ ] Implementar tokens CSRF
- [ ] Adicionar verificação em todas as mutations
- [ ] Testar com Postman/curl

---

## 🟠 SPRINT 2: CORREÇÕES CRÍTICAS DE BANCO (Semana 2)

### Dia 1: Cleanup de Email System
```sql
-- Migration: 20251029010000_remove_email_tables.sql
DROP TABLE IF EXISTS aliases CASCADE;
DROP TABLE IF EXISTS mailboxes CASCADE;
DROP TABLE IF EXISTS mail_domains CASCADE;

-- Remover colunas relacionadas
ALTER TABLE domains DROP COLUMN IF EXISTS dkim_selector;
ALTER TABLE domains DROP COLUMN IF EXISTS dkim_public;
```

### Dia 2: Consolidação de profile_themes
```sql
-- Migration: 20251029020000_consolidate_profile_themes.sql

-- Migrar dados para user_profiles (adicionar colunas lá)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS theme_template_id uuid REFERENCES profile_theme_templates(id);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS custom_css text;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS background_type text CHECK (background_type IN ('color', 'gradient', 'image', 'video'));
-- ... outras colunas de tema

-- Dropar tabelas antigas
DROP TABLE IF EXISTS profile_themes CASCADE;
DROP TABLE IF EXISTS profile_applied_templates CASCADE;
```

### Dia 3: Remover Duplicatas de Migration
- [ ] Deletar arquivo `20251028230455_20251028300000_090_domain_transfer_system.sql`
- [ ] Deletar arquivo `20251027174818_20251027165000_075_create_profile_themes_table.sql`
- [ ] Verificar se há outras duplicatas

### Dia 4-5: Simplificação de RLS
```sql
-- Exemplo: customers table
DROP POLICY IF EXISTS "Users can read own customer data" ON customers;

CREATE POLICY "Users can read own customer data"
  ON customers FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    (auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin'
  );
```

- [ ] Aplicar pattern em TODAS as tabelas
- [ ] Remover função `get_user_role`
- [ ] Testar performance antes/depois

---

## 🟡 SPRINT 3: USER ROLE REFACTOR (Semana 3)

### Objetivo: Mover role para JWT metadata

### Dia 1-2: Migração de Dados
```sql
-- Migration: 20251029030000_migrate_roles_to_metadata.sql

-- Criar função para sincronizar role
CREATE OR REPLACE FUNCTION sync_user_role_to_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar metadata no auth.users
  UPDATE auth.users
  SET raw_app_metadata = jsonb_set(
    COALESCE(raw_app_metadata, '{}'::jsonb),
    '{role}',
    to_jsonb(NEW.role)
  )
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para sincronizar automaticamente
CREATE TRIGGER sync_role_on_customer_change
  AFTER INSERT OR UPDATE OF role ON customers
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_role_to_metadata();

-- Migrar roles existentes
DO $$
DECLARE
  customer_record RECORD;
BEGIN
  FOR customer_record IN SELECT user_id, role FROM customers LOOP
    UPDATE auth.users
    SET raw_app_metadata = jsonb_set(
      COALESCE(raw_app_metadata, '{}'::jsonb),
      '{role}',
      to_jsonb(customer_record.role)
    )
    WHERE id = customer_record.user_id;
  END LOOP;
END $$;
```

### Dia 3: Atualizar AuthContext
```typescript
// src/contexts/AuthContext.tsx
const getUserWithRole = (supabaseUser: SupabaseUser): User => {
  const role = supabaseUser.app_metadata?.role || 'user';

  return {
    id: supabaseUser.id,
    email: supabaseUser.email!,
    name: supabaseUser.user_metadata?.name,
    role: role as 'user' | 'admin' | 'reseller',
    // ... outros campos
  };
};
```

### Dia 4-5: Atualizar Todas as RLS Policies
- [ ] Substituir `get_user_role(auth.uid())` por `(auth.jwt()->>'app_metadata')::jsonb->>'role'`
- [ ] Testar TODAS as permissões
- [ ] Verificar edge functions que checam role

---

## 🟢 SPRINT 4: VALIDAÇÕES E ESTABILIDADE (Semana 4)

### Dia 1: Idempotência em Operações Críticas

```typescript
// Exemplo: paypal-webhook
const processPayPalWebhook = async (event: any) => {
  const eventId = event.id;

  // Verificar se já processamos este evento
  const { data: existing } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('provider', 'paypal')
    .eq('external_id', eventId)
    .single();

  if (existing) {
    console.log(`Event ${eventId} already processed`);
    return { success: true, message: 'Already processed' };
  }

  // Processar evento
  // ...

  // Marcar como processado
  await supabase.from('webhook_events').insert({
    provider: 'paypal',
    external_id: eventId,
    payload: event,
    processed_at: new Date().toISOString()
  });
};
```

### Dia 2: Retry Logic para Registro de Domínio

```typescript
// Edge function: domains
const registerDomainWithRetry = async (domain: string, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await registerWithDynadot(domain);
      return result;
    } catch (error) {
      if (attempt === maxRetries) throw error;

      // Exponential backoff: 2^attempt seconds
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
```

### Dia 3: Validação de Premium Domains

```typescript
// Antes de listar domínio premium
const validateDomainOwnership = async (userId: string, domain: string) => {
  const { data } = await supabase
    .from('domains')
    .select('id')
    .eq('fqdn', domain)
    .eq('customer_id', (
      await supabase.from('customers')
        .select('id')
        .eq('user_id', userId)
        .single()
    ).data.id)
    .single();

  if (!data) {
    throw new Error('You do not own this domain');
  }
};
```

### Dia 4: Implementar Protected Brands Check

```typescript
// No checkout flow
const checkProtectedBrand = async (subdomain: string) => {
  const { data: brands } = await supabase
    .from('protected_brands')
    .select('*')
    .eq('status', 'active');

  for (const brand of brands || []) {
    const pattern = new RegExp(brand.pattern, 'i');
    if (pattern.test(subdomain)) {
      return {
        isProtected: true,
        brand: brand.name,
        requiresVerification: true
      };
    }
  }

  return { isProtected: false };
};
```

### Dia 5: Testes E2E Críticos
- [ ] Fluxo completo de registro de domínio
- [ ] Fluxo de pagamento PayPal
- [ ] Upgrade/downgrade de plano
- [ ] Sistema de afiliados
- [ ] Criação e publicação de post social

---

## 🔵 SPRINT 5: PERFORMANCE E MONITORING (Semana 5)

### Dia 1: Adicionar Índices Faltantes

```sql
-- Migration: 20251029050000_add_performance_indexes.sql

-- Índices para queries frequentes
CREATE INDEX IF NOT EXISTS idx_orders_customer_status ON orders(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_domains_customer_status ON domains(customer_id, registrar_status);
CREATE INDEX IF NOT EXISTS idx_social_posts_profile_created ON social_posts(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_likes_post ON social_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_post ON social_comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_social_follows_follower ON social_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_social_follows_following ON social_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_profile_links_profile ON profile_links(profile_id, display_order);

-- Índices para admin queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
```

### Dia 2: Implementar Caching Básico

```typescript
// Lib de cache simples com TTL
class SimpleCache {
  private cache = new Map<string, { value: any; expiresAt: number }>();

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  set(key: string, value: any, ttlSeconds: number = 300) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    });
  }
}

export const cache = new SimpleCache();

// Uso em edge functions
const getCachedSubscriptionPlan = async (planId: string) => {
  const cacheKey = `plan:${planId}`;
  const cached = cache.get(cacheKey);

  if (cached) return cached;

  const { data } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .single();

  cache.set(cacheKey, data, 600); // 10 minutos
  return data;
};
```

### Dia 3: Frontend Code Splitting

```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';

// Lazy load páginas pesadas
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const SocialFeed = lazy(() => import('./pages/SocialFeed'));
const ProfileManager = lazy(() => import('./pages/ProfileManager'));

// No router
<Route
  path="/admin/*"
  element={
    <Suspense fallback={<LoadingScreen />}>
      <AdminDashboard />
    </Suspense>
  }
/>
```

### Dia 4: Implementar Monitoring

```typescript
// lib/monitoring.ts
export const logError = async (error: Error, context: any) => {
  // Log para Supabase
  await supabase.from('error_logs').insert({
    message: error.message,
    stack: error.stack,
    context: JSON.stringify(context),
    timestamp: new Date().toISOString()
  });

  // Se tiver Sentry/similar integrar aqui
};

export const trackMetric = async (metric: string, value: number) => {
  await supabase.from('metrics').insert({
    metric,
    value,
    timestamp: new Date().toISOString()
  });
};
```

### Dia 5: Cleanup e Documentation
- [ ] Remover console.logs desnecessários
- [ ] Adicionar JSDoc em funções críticas
- [ ] Atualizar README com instruções de setup
- [ ] Documentar variáveis de ambiente necessárias

---

## 🟣 SPRINT 6: FEATURES ESSENCIAIS (Semana 6)

### Dia 1: Sistema de Moderação

```typescript
// src/pages/AdminSocialModeration.tsx - Já existe mas verificar funcionalidade

// Adicionar auto-moderação básica
const checkContentModeration = (text: string): { approved: boolean; reason?: string } => {
  const bannedWords = ['palavra1', 'palavra2']; // Carregar do banco

  for (const word of bannedWords) {
    if (text.toLowerCase().includes(word)) {
      return { approved: false, reason: 'Contains banned word' };
    }
  }

  // Verificar spam (muitas URLs)
  const urlCount = (text.match(/https?:\/\//g) || []).length;
  if (urlCount > 3) {
    return { approved: false, reason: 'Too many URLs' };
  }

  return { approved: true };
};
```

### Dia 2: Sistema de Refunds

```typescript
// Edge function: paypal-refund
Deno.serve(async (req) => {
  const { orderId, reason } = await req.json();

  // Buscar order
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (!order?.provider_capture_id) {
    return new Response(JSON.stringify({ error: 'No capture ID' }), { status: 400 });
  }

  // Processar refund no PayPal
  const refundResponse = await fetch(
    `https://api.paypal.com/v2/payments/captures/${order.provider_capture_id}/refund`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${paypalAccessToken}`
      },
      body: JSON.stringify({ reason })
    }
  );

  // Atualizar order
  await supabase
    .from('orders')
    .update({ status: 'refunded', refund_reason: reason })
    .eq('id', orderId);

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
```

### Dia 3: Grace Period para Assinaturas

```sql
-- Migration: 20251029060000_add_subscription_grace_period.sql

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS grace_period_end timestamptz;

-- Função para calcular grace period (7 dias após expiração)
CREATE OR REPLACE FUNCTION calculate_grace_period()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' OR NEW.status = 'expired' THEN
    NEW.grace_period_end = NEW.current_period_end + INTERVAL '7 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_grace_period
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_grace_period();
```

### Dia 4: Upgrade/Downgrade com Pro-rata

```typescript
// edge function: handle-plan-change
const calculateProration = (
  currentPlan: any,
  newPlan: any,
  daysRemaining: number
) => {
  const currentDailyRate = currentPlan.price_cents / 30;
  const newDailyRate = newPlan.price_cents / 30;

  const refund = Math.round(currentDailyRate * daysRemaining);
  const charge = Math.round(newDailyRate * 30); // Novo ciclo completo

  return {
    refund,
    charge,
    net: charge - refund
  };
};
```

### Dia 5: Testes de Integração
- [ ] Teste de webhook idempotência
- [ ] Teste de retry logic
- [ ] Teste de moderação automática
- [ ] Teste de refund flow
- [ ] Teste de pro-rata calculation

---

## 📊 CHECKLIST FINAL PRÉ-PRODUÇÃO

### Segurança
- [ ] Webhook signatures implementadas
- [ ] Rate limiting ativo
- [ ] CSRF protection implementado
- [ ] Inputs sanitizados
- [ ] File uploads validados
- [ ] Secrets não estão no código
- [ ] RLS em todas as tabelas
- [ ] Admin role via JWT metadata

### Performance
- [ ] Índices em todas as FKs
- [ ] Queries otimizadas (sem N+1)
- [ ] Caching implementado
- [ ] Code splitting no frontend
- [ ] Imagens otimizadas
- [ ] Bundle < 500kb gzipped

### Funcionalidades
- [ ] Registro de domínio funcional
- [ ] PayPal integração testada
- [ ] Upgrade/downgrade funciona
- [ ] Sistema social operacional
- [ ] Marketplace funcional
- [ ] Admin dashboard completo

### Monitoramento
- [ ] Error logging implementado
- [ ] Metrics tracking ativo
- [ ] Alertas configurados
- [ ] Backup automático configurado

### Documentação
- [ ] README atualizado
- [ ] Variáveis de ambiente documentadas
- [ ] API endpoints documentados
- [ ] Fluxos principais documentados
- [ ] Matriz de permissões documentada

---

## 🎯 MÉTRICAS DE SUCESSO

- Latência P95 < 500ms
- Erro rate < 0.1%
- Uptime > 99.9%
- Bundle size < 500kb gzipped
- Database queries < 50ms P95
- Zero vulnerabilidades críticas
- Cobertura de testes > 60%

---

## 🚀 GO/NO-GO DECISION

### GO se:
✅ Todos os itens CRÍTICOS (🔴) resolvidos
✅ 80% dos itens ALTO IMPACTO (🟠) resolvidos
✅ Testes de integração passando
✅ Security audit aprovado
✅ Performance aceitável

### NO-GO se:
❌ Qualquer item de segurança crítico pendente
❌ Webhooks não são idempotentes
❌ RLS tem vulnerabilidades
❌ Não há monitoring
❌ Não há backup strategy
