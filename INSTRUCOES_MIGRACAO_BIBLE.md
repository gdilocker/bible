# 🚀 Instruções para Aplicar Migrações - com.bible

## Database Info
- **URL**: https://wnfuesmdcdsgplkvgdva.supabase.co
- **Projeto**: com.bible
- **Total de Migrações**: 221

## 📋 Opção 1: Via Supabase Dashboard (Recomendado)

### Passo 1: Acessar SQL Editor
1. Abra: https://supabase.com/dashboard/project/wnfuesmdcdsgplkvgdva/sql/new
2. Login com suas credenciais

### Passo 2: Executar Script Consolidado
O arquivo `MIGRATION_SCRIPT_BIBLE.sql` contém todas as 221 migrações consolidadas.

**AVISO**: O arquivo tem 34.879 linhas. O SQL Editor pode ter limite de tamanho.

#### Opção A: Arquivo Completo
```bash
# Copiar e colar o conteúdo de MIGRATION_SCRIPT_BIBLE.sql
cat MIGRATION_SCRIPT_BIBLE.sql
```

#### Opção B: Por Lotes (Se der timeout)
Execute as migrações em grupos de 20-30 por vez.

### Passo 3: Verificar Sucesso
```sql
-- Ver todas as tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Deve retornar aproximadamente 50+ tabelas
```

## 📋 Opção 2: Via CLI do Supabase

Se você tem o Supabase CLI instalado:

```bash
# 1. Fazer login
supabase login

# 2. Linkar ao projeto
supabase link --project-ref wnfuesmdcdsgplkvgdva

# 3. Aplicar todas as migrações
supabase db push

# 4. Verificar status
supabase migration list
```

## 📋 Opção 3: Manualmente (Mais Seguro)

Execute cada migração individualmente no SQL Editor:

1. Abra: https://supabase.com/dashboard/project/wnfuesmdcdsgplkvgdva/sql/new

2. Execute as migrações nesta ordem:

### Migrações Críticas (Fazer primeiro)
```bash
1. 20251013221138_001_init.sql           # Estrutura base
2. 20251013222306_002_add_roles.sql      # Sistema de roles
3. 20251014170355_009_pricing_plans.sql  # Planos de preços
4. 20251016232455_015_affiliate_system.sql # Sistema de afiliados
5. 20251017004828_016_support_system.sql   # Sistema de suporte
```

### Migrações Secundárias
Execute as demais em ordem cronológica (por nome de arquivo).

## ✅ Verificação Final

Após aplicar as migrações, execute estes testes:

```sql
-- 1. Contar tabelas
SELECT COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public';

-- 2. Ver tabelas principais
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'customers',
  'domains',
  'orders',
  'subscription_plans',
  'user_profiles',
  'social_posts',
  'support_tickets'
)
ORDER BY table_name;

-- 3. Ver functions
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 4. Ver storage buckets
SELECT * FROM storage.buckets;
```

## 🎯 Tabelas Principais Esperadas

Após as migrações, você deve ter estas tabelas:

### Core
- `customers` - Clientes
- `domains` - Domínios/subdomínios
- `orders` - Pedidos
- `pending_orders` - Pedidos pendentes
- `invoices` - Faturas

### Assinaturas
- `subscription_plans` - Planos de assinatura
- `subscriptions` - Assinaturas ativas
- `trial_rights` - Controle de trials

### Usuários
- `user_profiles` - Perfis de usuários
- `profile_links` - Links nos perfis
- `store_products` - Produtos na loja

### Social
- `social_posts` - Posts da rede social
- `social_comments` - Comentários
- `social_likes` - Curtidas
- `social_follows` - Seguidores

### Admin
- `support_tickets` - Tickets de suporte
- `audit_logs` - Logs de auditoria
- `protected_brands` - Marcas protegidas
- `reserved_keywords` - Palavras reservadas

### Afiliados
- `affiliates` - Sistema de afiliados
- `affiliate_referrals` - Referências
- `affiliate_payouts` - Pagamentos

## 🔧 Troubleshooting

### Erro: "relation already exists"
- Isso é normal, significa que a tabela já foi criada
- Continue com as próximas migrações

### Erro: "permission denied"
- Verifique se está usando a conta de admin do projeto
- Verifique no painel: Settings > Database > Connection String

### Erro: "timeout"
- Divida o script em partes menores
- Execute 20-30 migrações por vez

## 📞 Próximos Passos

Após aplicar as migrações:

1. ✅ Testar login na aplicação
2. ✅ Criar primeiro usuário
3. ✅ Testar funcionalidades principais
4. ✅ Configurar variáveis de ambiente adicionais (PayPal, etc)

---

**Dúvidas?** Revise a documentação em `docs/SETUP_GUIDE.md`
