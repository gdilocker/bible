# 🔒 Testes de RLS Policies - Pix.Global

## Objetivo

Verificar que as políticas de Row Level Security (RLS) estão funcionando corretamente e que:
- Usuários só acessam seus próprios dados
- Service role tem acesso total (admin bypass)
- Tentativas de acesso não autorizado são bloqueadas

## Preparação

### 1. Criar 2 usuários de teste

No dashboard do Supabase (Auth > Users):
- **user1@test.com** / senha123
- **user2@test.com** / senha456

Anote os UUIDs de cada usuário.

## Testes de Domains

### Teste 1: Usuário vê apenas seus domínios

```sql
-- Como user1
INSERT INTO domains (fqdn, type, owner_user_id, status)
VALUES ('user1.pix.global', 'personal', 'UUID_USER1', 'active');

-- Como user2
INSERT INTO domains (fqdn, type, owner_user_id, status)
VALUES ('user2.pix.global', 'personal', 'UUID_USER2', 'active');

-- user1 tenta ver todos os domínios
SELECT * FROM domains;
-- ✅ Deve retornar apenas user1.pix.global
```

### Teste 2: Usuário não pode ver domínios de outros

```sql
-- Como user1
SELECT * FROM domains WHERE owner_user_id = 'UUID_USER2';
-- ✅ Deve retornar 0 linhas (bloqueado por RLS)
```

### Teste 3: Usuário não pode modificar domínios de outros

```sql
-- Como user1
UPDATE domains
SET status = 'suspended'
WHERE owner_user_id = 'UUID_USER2';
-- ✅ Deve afetar 0 linhas (bloqueado por RLS)

DELETE FROM domains WHERE owner_user_id = 'UUID_USER2';
-- ✅ Deve afetar 0 linhas (bloqueado por RLS)
```

### Teste 4: Service role tem acesso total

```sql
-- Como service_role (admin)
SELECT * FROM domains;
-- ✅ Deve retornar TODOS os domínios

UPDATE domains SET status = 'active' WHERE fqdn = 'user2.pix.global';
-- ✅ Deve funcionar normalmente
```

## Testes de Orders

### Teste 5: Usuário vê apenas seus pedidos

```sql
-- Como user1
INSERT INTO orders (fqdn, user_id, price_pix, currency, provider, status)
VALUES ('test1.pix.global', 'UUID_USER1', 100.00, 'BRL', 'mercadopago', 'pending');

-- Como user2
INSERT INTO orders (fqdn, user_id, price_pix, currency, provider, status)
VALUES ('test2.pix.global', 'UUID_USER2', 150.00, 'BRL', 'mercadopago', 'pending');

-- user1 tenta ver todos os pedidos
SELECT * FROM orders;
-- ✅ Deve retornar apenas pedidos de user1
```

### Teste 6: Usuário não pode criar pedidos para outros

```sql
-- Como user1
INSERT INTO orders (fqdn, user_id, price_pix, currency, provider)
VALUES ('fake.pix.global', 'UUID_USER2', 50.00, 'BRL', 'mercadopago');
-- ❌ Deve FALHAR com erro de policy (WITH CHECK violation)
```

## Testes de Routes

### Teste 7: Usuário gerencia rotas de seus domínios

```sql
-- Como user1 (assumindo que possui domain_id X)
INSERT INTO routes (domain_id, pix_key, active, priority)
VALUES ('UUID_DOMAIN_USER1', 'user1@email.com', true, 1);
-- ✅ Deve funcionar

SELECT * FROM routes;
-- ✅ Deve retornar apenas rotas de domínios de user1
```

### Teste 8: Usuário não pode criar rotas para domínios de outros

```sql
-- Como user1 tentando criar rota para domínio de user2
INSERT INTO routes (domain_id, pix_key, active, priority)
VALUES ('UUID_DOMAIN_USER2', 'fake@email.com', true, 1);
-- ❌ Deve FALHAR com erro de policy
```

## Testes de Audits

### Teste 9: Usuário vê apenas seus próprios logs

```sql
-- Criar ações que geram audits
-- Como user1
UPDATE domains SET status = 'active' WHERE owner_user_id = 'UUID_USER1';

-- Ver audits
SELECT * FROM audits;
-- ✅ Deve retornar apenas audits onde actor = UUID_USER1
```

### Teste 10: Sistema pode criar audits

```sql
-- Audits são criados automaticamente pelos triggers
-- Verificar se foram criados:
SELECT COUNT(*) FROM audits WHERE entity = 'domains';
-- ✅ Deve ter registros das operações anteriores
```

## Testes de Funções

### Teste 11: Contar domínios do usuário

```sql
-- Como user1
SELECT * FROM get_user_domains_count();
-- ✅ Deve retornar estatísticas apenas de user1
```

### Teste 12: Verificar disponibilidade de domínio

```sql
SELECT check_domain_available('user1.pix.global');
-- ✅ false (já existe)

SELECT check_domain_available('disponivel.pix.global');
-- ✅ true (disponível)
```

### Teste 13: Obter rotas ativas

```sql
SELECT * FROM get_domain_active_routes('UUID_DOMAIN_USER1');
-- ✅ Retorna rotas ativas ordenadas por prioridade
```

### Teste 14: Criar pedido seguro

```sql
-- Como user1
SELECT create_order_safe(
  'novo.pix.global',
  'UUID_USER1',
  100.00,
  'BRL',
  'mercadopago'
);
-- ✅ Retorna UUID do pedido criado

-- Tentar criar duplicado imediatamente
SELECT create_order_safe(
  'novo.pix.global',
  'UUID_USER1',
  100.00,
  'BRL',
  'mercadopago'
);
-- ❌ Deve FALHAR: "Já existe um pedido pendente"
```

### Teste 15: Completar pedido

```sql
-- Como service_role
SELECT complete_order_and_create_domain(
  'UUID_PEDIDO',
  'premium'
);
-- ✅ Retorna UUID do domínio criado
-- ✅ Pedido atualizado para 'paid'
-- ✅ Domínio criado automaticamente
```

## Teste de Triggers

### Teste 16: updated_at atualiza automaticamente

```sql
-- Como user1
SELECT updated_at FROM domains WHERE owner_user_id = 'UUID_USER1';
-- Guardar timestamp

-- Aguardar 2 segundos
SELECT pg_sleep(2);

-- Atualizar registro
UPDATE domains SET status = 'active' WHERE owner_user_id = 'UUID_USER1';

-- Verificar novo timestamp
SELECT updated_at FROM domains WHERE owner_user_id = 'UUID_USER1';
-- ✅ Timestamp deve ser mais recente
```

### Teste 17: Auditoria automática

```sql
-- Contar audits antes
SELECT COUNT(*) FROM audits WHERE entity = 'domains';

-- Como user1
DELETE FROM domains WHERE fqdn = 'user1.pix.global';

-- Verificar novo audit
SELECT COUNT(*) FROM audits WHERE entity = 'domains';
-- ✅ Deve ter 1 audit a mais (ação 'delete')

-- Ver detalhes
SELECT action, metadata FROM audits
WHERE entity = 'domains'
ORDER BY created_at DESC
LIMIT 1;
-- ✅ Deve mostrar ação 'delete' com dados antigos no metadata
```

### Teste 18: Validação de tipo de domínio

```sql
-- Tentar criar domínio numérico com tipo errado
INSERT INTO domains (fqdn, type, owner_user_id)
VALUES ('12345.pix.global', 'personal', 'UUID_USER1');
-- ❌ Deve FALHAR: "Domínio numérico deve ter type=numeric"

-- Criar corretamente
INSERT INTO domains (fqdn, type, owner_user_id)
VALUES ('12345.pix.global', 'numeric', 'UUID_USER1');
-- ✅ Deve funcionar
```

## Checklist Final

- [ ] user1 vê apenas seus domínios
- [ ] user1 não vê domínios de user2
- [ ] user1 não pode modificar domínios de user2
- [ ] service_role vê todos os domínios
- [ ] user1 vê apenas seus pedidos
- [ ] user1 não pode criar pedidos para user2
- [ ] user1 gerencia rotas de seus domínios
- [ ] user1 não pode criar rotas para domínios de user2
- [ ] user1 vê apenas seus audits
- [ ] Triggers de updated_at funcionam
- [ ] Auditoria automática funciona
- [ ] Validação de tipo funciona
- [ ] Funções auxiliares funcionam
- [ ] Pedidos com duplicatas são bloqueados
- [ ] Completar pedido cria domínio automaticamente

## ✅ Resultado Esperado

**Todos os testes devem passar**, garantindo que:
1. RLS está ativo e funcional
2. Usuários são isolados corretamente
3. Service role tem acesso administrativo
4. Triggers e funções funcionam
5. Sistema está seguro

## 🚨 Se algum teste falhar:

1. Verificar se migrations foram aplicadas corretamente
2. Verificar se RLS está ativado: `ALTER TABLE xxx ENABLE ROW LEVEL SECURITY;`
3. Verificar policies existentes: `\dp tablename` (psql) ou via dashboard
4. Revisar logs de erro no Supabase Dashboard

---

**Projeto**: Pix.Global
**Database**: bjiymzindbxpdxhhuwgg.supabase.co
**Documento**: Testing RLS Policies
