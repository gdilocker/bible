# 🔍 QUERIES DE VALIDAÇÃO E TESTE

Data de criação: 2025-11-07

Este documento contém queries SQL úteis para validar o sistema de moderação de links e outros aspectos críticos da plataforma antes do lançamento.

---

## 📊 SISTEMA DE MODERAÇÃO DE LINKS

### 1. Verificar estrutura das tabelas

```sql
-- Ver estrutura da tabela link_security_checks
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'link_security_checks'
ORDER BY ordinal_position;

-- Ver estrutura da tabela profile_links (campo security_status)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profile_links'
AND column_name IN ('id', 'profile_id', 'url', 'security_status', 'last_security_check');
```

### 2. Verificar RLS policies

```sql
-- Ver policies da tabela link_security_checks
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'link_security_checks';

-- Ver policies da tabela profile_links relacionadas a segurança
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profile_links'
AND qual LIKE '%security%';
```

### 3. Testar inserção de verificação de segurança

```sql
-- Inserir verificação de teste (substitua os UUIDs por valores reais)
INSERT INTO link_security_checks (
  link_id,
  url,
  status,
  check_type,
  threat_types,
  provider,
  raw_response,
  checked_at
) VALUES (
  gen_random_uuid(), -- ou um link_id real
  'https://example.com',
  'safe',
  'automatic',
  '[]'::jsonb,
  'google_safe_browsing',
  '{"matches": []}'::jsonb,
  NOW()
);

-- Verificar inserção
SELECT * FROM link_security_checks
ORDER BY created_at DESC
LIMIT 5;
```

### 4. Listar links por status de segurança

```sql
-- Contar links por status
SELECT
  security_status,
  COUNT(*) as total
FROM profile_links
WHERE security_status IS NOT NULL
GROUP BY security_status
ORDER BY total DESC;

-- Listar links bloqueados
SELECT
  pl.id,
  pl.url,
  pl.title,
  pl.security_status,
  pl.last_security_check,
  up.display_name as perfil
FROM profile_links pl
JOIN user_profiles up ON pl.profile_id = up.id
WHERE pl.security_status = 'blocked'
ORDER BY pl.last_security_check DESC
LIMIT 20;

-- Listar links sob revisão
SELECT
  pl.id,
  pl.url,
  pl.title,
  pl.security_status,
  pl.last_security_check,
  up.display_name as perfil
FROM profile_links pl
JOIN user_profiles up ON pl.profile_id = up.id
WHERE pl.security_status = 'under_review'
ORDER BY pl.last_security_check DESC
LIMIT 20;
```

### 5. Histórico de verificações de um link

```sql
-- Histórico completo de verificações (substitua pelo link_id real)
SELECT
  id,
  status,
  check_type,
  threat_types,
  provider,
  checked_at,
  checked_by,
  notes
FROM link_security_checks
WHERE link_id = 'COLOQUE-UUID-DO-LINK-AQUI'
ORDER BY checked_at DESC;

-- Contar verificações por status
SELECT
  status,
  check_type,
  COUNT(*) as total
FROM link_security_checks
GROUP BY status, check_type
ORDER BY total DESC;
```

### 6. Links que precisam de reverificação

```sql
-- Links safe que não são verificados há mais de 24h
SELECT
  pl.id,
  pl.url,
  pl.title,
  pl.security_status,
  pl.last_security_check,
  NOW() - pl.last_security_check as tempo_desde_ultima_verificacao
FROM profile_links pl
WHERE pl.security_status = 'safe'
AND pl.last_security_check < NOW() - INTERVAL '24 hours'
ORDER BY pl.last_security_check ASC
LIMIT 50;
```

### 7. Estatísticas de segurança

```sql
-- Dashboard de estatísticas
WITH stats AS (
  SELECT
    COUNT(*) FILTER (WHERE security_status = 'safe') as safe_count,
    COUNT(*) FILTER (WHERE security_status = 'blocked') as blocked_count,
    COUNT(*) FILTER (WHERE security_status = 'under_review') as review_count,
    COUNT(*) FILTER (WHERE security_status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE security_status IS NULL) as no_check_count,
    COUNT(*) as total_links
  FROM profile_links
)
SELECT
  safe_count,
  blocked_count,
  review_count,
  pending_count,
  no_check_count,
  total_links,
  ROUND(100.0 * safe_count / NULLIF(total_links, 0), 2) as pct_safe,
  ROUND(100.0 * blocked_count / NULLIF(total_links, 0), 2) as pct_blocked,
  ROUND(100.0 * review_count / NULLIF(total_links, 0), 2) as pct_review
FROM stats;
```

---

## 👥 USUÁRIOS E ASSINATURAS

### 8. Validar estrutura de usuários e planos

```sql
-- Contar usuários por plano
SELECT
  s.plan_type,
  s.status,
  COUNT(DISTINCT c.user_id) as total_users
FROM customers c
LEFT JOIN subscriptions s ON c.id = s.customer_id
GROUP BY s.plan_type, s.status
ORDER BY total_users DESC;

-- Usuários em trial
SELECT
  c.id,
  c.email,
  s.plan_type,
  s.trial_ends_at,
  s.trial_ends_at - NOW() as tempo_restante
FROM customers c
JOIN subscriptions s ON c.id = s.customer_id
WHERE s.status = 'trialing'
ORDER BY s.trial_ends_at ASC;

-- Usuários com assinatura ativa
SELECT
  c.email,
  s.plan_type,
  s.status,
  s.current_period_end,
  d.fqdn as dominio
FROM customers c
JOIN subscriptions s ON c.id = s.customer_id
LEFT JOIN domains d ON c.id = d.customer_id
WHERE s.status = 'active'
ORDER BY c.created_at DESC
LIMIT 20;
```

### 9. Validar limites de domínio por plano

```sql
-- Usuários Prime com mais de 1 domínio (PROBLEMA!)
SELECT
  c.email,
  s.plan_type,
  COUNT(d.id) as total_dominios
FROM customers c
JOIN subscriptions s ON c.id = s.customer_id
JOIN domains d ON c.id = d.customer_id
WHERE s.plan_type = 'prime'
GROUP BY c.id, c.email, s.plan_type
HAVING COUNT(d.id) > 1;

-- Contagem de domínios por usuário
SELECT
  c.email,
  s.plan_type,
  COUNT(d.id) as total_dominios,
  CASE
    WHEN s.plan_type = 'prime' AND COUNT(d.id) > 1 THEN '⚠️ PROBLEMA'
    ELSE '✅ OK'
  END as status
FROM customers c
JOIN subscriptions s ON c.id = s.customer_id
LEFT JOIN domains d ON c.id = d.customer_id
GROUP BY c.id, c.email, s.plan_type
ORDER BY total_dominios DESC;
```

---

## 🌐 DOMÍNIOS

### 10. Validar domínios

```sql
-- Domínios por status
SELECT
  registrar_status,
  COUNT(*) as total
FROM domains
GROUP BY registrar_status
ORDER BY total DESC;

-- Domínios expirando nos próximos 30 dias
SELECT
  d.fqdn,
  d.registrar_status,
  d.expires_at,
  d.expires_at - NOW() as tempo_ate_expiracao,
  c.email as proprietario
FROM domains d
JOIN customers c ON d.customer_id = c.id
WHERE d.expires_at < NOW() + INTERVAL '30 days'
AND d.registrar_status NOT IN ('suspended', 'deleted')
ORDER BY d.expires_at ASC;

-- Domínios com problemas
SELECT
  d.fqdn,
  d.registrar_status,
  d.expires_at,
  c.email
FROM domains d
JOIN customers c ON d.customer_id = c.id
WHERE d.registrar_status IN ('suspended', 'redemption', 'pending_delete')
ORDER BY d.expires_at ASC;
```

---

## 💳 PAGAMENTOS E PEDIDOS

### 11. Validar pedidos

```sql
-- Pedidos por status
SELECT
  status,
  payment_method,
  COUNT(*) as total,
  SUM(amount_usd) as total_value
FROM orders
GROUP BY status, payment_method
ORDER BY total DESC;

-- Pedidos pendentes há mais de 24h
SELECT
  o.id,
  o.order_number,
  o.status,
  o.amount_usd,
  o.created_at,
  NOW() - o.created_at as tempo_pendente,
  c.email
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status IN ('pending', 'processing')
AND o.created_at < NOW() - INTERVAL '24 hours'
ORDER BY o.created_at ASC;

-- Últimas 20 transações
SELECT
  o.order_number,
  o.status,
  o.payment_method,
  o.amount_usd,
  o.created_at,
  c.email
FROM orders o
JOIN customers c ON o.customer_id = c.id
ORDER BY o.created_at DESC
LIMIT 20;
```

---

## 🔐 SEGURANÇA E AUDITORIA

### 12. Validar RLS em tabelas críticas

```sql
-- Verificar se RLS está habilitado em todas as tabelas
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;

-- Tabelas SEM RLS habilitado (PROBLEMA!)
SELECT
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT LIKE 'pg_%'
AND rowsecurity = false
ORDER BY tablename;
```

### 13. Logs de auditoria (se implementado)

```sql
-- Ações administrativas recentes
SELECT
  action,
  table_name,
  record_id,
  user_id,
  created_at
FROM admin_logs
ORDER BY created_at DESC
LIMIT 50;
```

---

## 📱 SOCIAL E CONTEÚDO

### 14. Validar conteúdo social

```sql
-- Posts por status de visibilidade
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deletados
FROM social_posts;

-- Top posts por likes
SELECT
  sp.id,
  sp.content,
  COUNT(sl.id) as total_likes,
  up.display_name as autor
FROM social_posts sp
LEFT JOIN social_likes sl ON sp.id = sl.post_id
JOIN user_profiles up ON sp.user_id = up.user_id
WHERE sp.deleted_at IS NULL
GROUP BY sp.id, sp.content, up.display_name
ORDER BY total_likes DESC
LIMIT 10;

-- Posts reportados
SELECT
  sp.id,
  sp.content,
  COUNT(sr.id) as total_reports,
  up.display_name as autor
FROM social_posts sp
JOIN social_reports sr ON sp.id = sr.post_id
JOIN user_profiles up ON sp.user_id = up.user_id
WHERE sr.status = 'pending'
GROUP BY sp.id, sp.content, up.display_name
ORDER BY total_reports DESC;
```

---

## 🚀 PERFORMANCE

### 15. Verificar índices criados

```sql
-- Listar índices do sistema de segurança
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('link_security_checks', 'profile_links')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Tamanho das tabelas principais
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profile_links', 'link_security_checks', 'domains', 'orders', 'social_posts')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Queries lentas (se pg_stat_statements estiver habilitado)
SELECT
  calls,
  mean_exec_time,
  query
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## 🧪 TESTES DE INTEGRIDADE

### 16. Verificar integridade referencial

```sql
-- Domínios sem customer (PROBLEMA!)
SELECT COUNT(*) as orphaned_domains
FROM domains d
WHERE NOT EXISTS (
  SELECT 1 FROM customers c WHERE c.id = d.customer_id
);

-- Links sem profile (PROBLEMA!)
SELECT COUNT(*) as orphaned_links
FROM profile_links pl
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles up WHERE up.id = pl.profile_id
);

-- Verificações de segurança sem link (pode ser OK se link foi deletado)
SELECT COUNT(*) as checks_without_link
FROM link_security_checks lsc
WHERE NOT EXISTS (
  SELECT 1 FROM profile_links pl WHERE pl.id = lsc.link_id
);
```

### 17. Teste de permissões

```sql
-- Testar se usuário comum pode ver links de outros (NÃO DEVERIA!)
-- Execute isso como usuário não-admin
SET LOCAL role authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "USER-UUID-AQUI", "role": "authenticated"}';

SELECT * FROM profile_links
WHERE profile_id != (SELECT id FROM user_profiles WHERE user_id = current_setting('request.jwt.claims')::json->>'sub')
LIMIT 1;

-- Se retornar linhas, RLS está quebrado!

-- Resetar role
RESET role;
```

---

## 📈 MÉTRICAS DE NEGÓCIO

### 18. Dashboard executivo

```sql
-- Resumo geral da plataforma
WITH metrics AS (
  SELECT
    (SELECT COUNT(*) FROM customers) as total_users,
    (SELECT COUNT(*) FROM domains WHERE registrar_status = 'active') as active_domains,
    (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_subs,
    (SELECT COUNT(*) FROM subscriptions WHERE status = 'trialing') as trial_users,
    (SELECT COUNT(*) FROM profile_links) as total_links,
    (SELECT COUNT(*) FROM profile_links WHERE security_status = 'safe') as safe_links,
    (SELECT COUNT(*) FROM profile_links WHERE security_status = 'blocked') as blocked_links,
    (SELECT COUNT(*) FROM social_posts WHERE deleted_at IS NULL) as total_posts,
    (SELECT SUM(amount_usd) FROM orders WHERE status = 'completed') as total_revenue
)
SELECT
  total_users as "👥 Total Usuários",
  active_domains as "🌐 Domínios Ativos",
  active_subs as "💳 Assinaturas Ativas",
  trial_users as "🎁 Usuários Trial",
  total_links as "🔗 Total Links",
  safe_links as "✅ Links Seguros",
  blocked_links as "🚫 Links Bloqueados",
  total_posts as "📱 Posts Sociais",
  '$' || COALESCE(total_revenue, 0) as "💰 Receita Total (USD)"
FROM metrics;
```

### 19. Conversão de trial para pago

```sql
-- Taxa de conversão trial → paid
WITH trial_stats AS (
  SELECT
    COUNT(*) FILTER (WHERE status = 'trialing') as current_trials,
    COUNT(*) FILTER (WHERE status = 'active' AND trial_ends_at IS NOT NULL) as converted,
    COUNT(*) FILTER (WHERE status IN ('canceled', 'unpaid_hold') AND trial_ends_at IS NOT NULL) as not_converted
  FROM subscriptions
)
SELECT
  current_trials as "Trials Ativos",
  converted as "Convertidos",
  not_converted as "Não Convertidos",
  ROUND(100.0 * converted / NULLIF(converted + not_converted, 0), 2) || '%' as "Taxa de Conversão"
FROM trial_stats;
```

---

## 🎯 CHECKLIST DE VALIDAÇÃO PRÉ-LANÇAMENTO

Execute estas queries e verifique os resultados:

```sql
-- ✅ 1. RLS habilitado em todas as tabelas
SELECT COUNT(*) FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false
AND tablename NOT LIKE 'pg_%';
-- Resultado esperado: 0

-- ✅ 2. Nenhum domínio órfão
SELECT COUNT(*) FROM domains d
WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.id = d.customer_id);
-- Resultado esperado: 0

-- ✅ 3. Nenhum link órfão
SELECT COUNT(*) FROM profile_links pl
WHERE NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = pl.profile_id);
-- Resultado esperado: 0

-- ✅ 4. Índices de segurança existem
SELECT COUNT(*) FROM pg_indexes
WHERE indexname IN (
  'idx_link_security_checks_link_created',
  'idx_link_security_checks_status',
  'idx_profile_links_profile_security'
);
-- Resultado esperado: 3

-- ✅ 5. Nenhum usuário Prime com múltiplos domínios
SELECT COUNT(*) FROM (
  SELECT c.id
  FROM customers c
  JOIN subscriptions s ON c.id = s.customer_id
  JOIN domains d ON c.id = d.customer_id
  WHERE s.plan_type = 'prime'
  GROUP BY c.id
  HAVING COUNT(d.id) > 1
) violations;
-- Resultado esperado: 0

-- ✅ 6. Tabela link_security_checks existe e tem estrutura correta
SELECT COUNT(*) FROM information_schema.columns
WHERE table_name = 'link_security_checks'
AND column_name IN ('id', 'link_id', 'url', 'status', 'threat_types', 'checked_at');
-- Resultado esperado: 6

-- ✅ 7. Campo security_status existe em profile_links
SELECT COUNT(*) FROM information_schema.columns
WHERE table_name = 'profile_links'
AND column_name = 'security_status';
-- Resultado esperado: 1
```

---

## 📝 NOTAS

- Todas estas queries devem ser executadas no console do Supabase ou via SQL editor
- Algumas queries requerem permissões de admin
- UUIDs de exemplo devem ser substituídos por valores reais do seu sistema
- Para performance, limite sempre resultados com `LIMIT` em produção
- Use `EXPLAIN ANALYZE` antes de queries complexas em produção

---

**Última atualização:** 2025-11-07
