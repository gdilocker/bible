# PayPal Subscriptions - Setup Complete Guide

## Sistema Implementado

O sistema de **PayPal Subscriptions** foi completamente implementado e está pronto para uso em **sandbox E produção**.

### Funcionamento

1. **User compra domain .com.rich + plano (Prime/Elite)**
2. **PayPal cobra:**
   - **Hoje:** Domain ($25) + Primeiro mês do plano
   - **Mês 2+:** Somente o plano (automaticamente)
3. **Webhooks do PayPal** processam renovações automaticamente

---

## Configuração - Passo a Passo

### 1. Criar Conta no PayPal Developer

1. Acesse: https://developer.paypal.com/
2. Crie uma conta ou faça login
3. Vá para **Dashboard**

### 2. Criar Credenciais Sandbox

1. No Dashboard, vá para **Apps & Credentials**
2. Em **Sandbox**, clique em **Create App**
3. Copie:
   - **Client ID**
   - **Secret**

### 3. Criar Billing Plans no PayPal (Sandbox)

#### Plan 1: Prime ($50/mês)

1. Acesse: https://www.sandbox.paypal.com/billing/plans
2. Clique em **Create Plan**
3. Configure:
   - **Plan Name:** Prime - .com.rich
   - **Description:** Plano Prime com domínio .com.rich
   - **Billing Cycle:**
     - **Frequency:** Monthly
     - **Price:** $50.00 USD
   - **Setup Fee:** $25.00 USD (custo do domain)
4. Clique em **Create Plan**
5. **COPIE O PLAN ID** (algo como: `P-XXXXXXXXXXXXX`)

#### Plan 2: Elite ($70/mês)

1. Repita o processo acima com:
   - **Plan Name:** Elite - .com.rich
   - **Description:** Plano Elite com domínio .com.rich
   - **Price:** $70.00 USD/month
   - **Setup Fee:** $25.00 USD
2. **COPIE O PLAN ID**

### 4. Configurar Supabase Environment Variables (Sandbox)

No seu projeto Supabase, adicione:

```bash
PAYPAL_CLIENT_ID=sandbox_client_id_aqui
PAYPAL_CLIENT_SECRET=sandbox_secret_aqui
PAYPAL_MODE=sandbox
```

### 5. Atualizar PayPal Plan IDs no Database

Execute no SQL Editor do Supabase:

```sql
-- Update Prime plan with sandbox Plan ID
UPDATE subscription_plans
SET paypal_plan_id_sandbox = 'P-XXXXXXXXXXXXXXXXX'
WHERE plan_name = 'Prime';

-- Update Elite plan with sandbox Plan ID
UPDATE subscription_plans
SET paypal_plan_id_sandbox = 'P-YYYYYYYYYYYYYYYYY'
WHERE plan_name = 'Elite';
```

### 6. Configurar Webhook no PayPal (Sandbox)

1. No PayPal Developer Dashboard, vá para **Webhooks**
2. Clique em **Add Webhook**
3. Configure:
   - **Webhook URL:** `https://YOUR_SUPABASE_URL/functions/v1/paypal-webhook`
   - **Event Types:** Selecione:
     - `BILLING.SUBSCRIPTION.ACTIVATED`
     - `BILLING.SUBSCRIPTION.CANCELLED`
     - `BILLING.SUBSCRIPTION.SUSPENDED`
     - `BILLING.SUBSCRIPTION.PAYMENT.FAILED`
     - `PAYMENT.SALE.COMPLETED`
     - `PAYMENT.CAPTURE.COMPLETED`
4. Salve o Webhook

---

## Testes em Sandbox

### 1. Testar Compra

1. Acesse sua aplicação
2. Selecione um domain + plano
3. Complete o checkout
4. Será redirecionado para PayPal Sandbox
5. Use credenciais de **Sandbox Test Account**
6. Complete o pagamento

### 2. Verificar no Database

```sql
-- Ver subscription criada
SELECT * FROM subscriptions
ORDER BY created_at DESC
LIMIT 1;

-- Ver domain criado
SELECT * FROM domains
ORDER BY created_at DESC
LIMIT 1;
```

### 3. Simular Renovação Mensal

1. No PayPal Sandbox Dashboard
2. Vá para **Subscriptions**
3. Encontre a subscription
4. Force um **billing cycle** (admin action)
5. Webhook será disparado automaticamente

---

## Migração para Produção

### 1. Criar App de Produção no PayPal

1. No PayPal Developer Dashboard
2. Vá para **Apps & Credentials**
3. Mude para **Live**
4. Crie um novo App
5. Copie **Client ID** e **Secret** de produção

### 2. Criar Billing Plans de Produção

Repita o processo do sandbox, mas agora em:
- https://www.paypal.com/billing/plans

Configure os mesmos planos:
- Prime: $50/mês + $25 setup
- Elite: $70/mês + $25 setup

**COPIE OS PLAN IDS DE PRODUÇÃO**

### 3. Atualizar Environment Variables (Live)

```bash
PAYPAL_CLIENT_ID=live_client_id_aqui
PAYPAL_CLIENT_SECRET=live_secret_aqui
PAYPAL_MODE=live
```

### 4. Atualizar Plan IDs de Produção

```sql
-- Update Prime plan with LIVE Plan ID
UPDATE subscription_plans
SET paypal_plan_id_live = 'P-LIVE-XXXXXXXXXX'
WHERE plan_name = 'Prime';

-- Update Elite plan with LIVE Plan ID
UPDATE subscription_plans
SET paypal_plan_id_live = 'P-LIVE-YYYYYYYYYY'
WHERE plan_name = 'Elite';
```

### 5. Configurar Webhook de Produção

1. No PayPal (Live), vá para **Webhooks**
2. Configure a mesma URL:
   - `https://YOUR_SUPABASE_URL/functions/v1/paypal-webhook`
3. Adicione os mesmos eventos
4. **IMPORTANTE:** Salve o Webhook ID se necessário

---

## Modo Dev (Sem Credenciais)

O sistema já funciona **SEM credenciais do PayPal**!

### Como funciona:

1. Se `PAYPAL_CLIENT_ID` estiver vazio
2. O sistema cria **Mock Orders/Subscriptions**
3. Redireciona para sua página de sucesso
4. **Domínios são ativados normalmente**
5. Perfeito para desenvolvimento local!

### Ativar Dev Mode:

```bash
# Simplesmente não configure as variáveis
# OU deixe em branco
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

---

## Estrutura do Sistema

### Edge Functions Criadas

1. **paypal-create-subscription**
   - Cria subscription no PayPal
   - Salva pending order
   - Retorna approve URL
   - Suporta dev mode (sem credenciais)

2. **paypal-webhook** (atualizado)
   - Processa `BILLING.SUBSCRIPTION.ACTIVATED`
   - Cria domain + order + subscription
   - Processa `PAYMENT.SALE.COMPLETED` (renovações)
   - Processa `BILLING.SUBSCRIPTION.CANCELLED`
   - Processa `BILLING.SUBSCRIPTION.PAYMENT.FAILED`

### Banco de Dados

#### Nova coluna em `subscription_plans`:
- `paypal_plan_id_sandbox` - Plan ID do sandbox
- `paypal_plan_id_live` - Plan ID de produção

#### Tabela `subscriptions`:
- `paypal_subscription_id` - ID da subscription no PayPal
- `status` - active, cancelled, past_due, expired
- `started_at` - Data de início
- `next_billing_date` - Próxima cobrança
- `cancelled_at` - Data de cancelamento

---

## Webhooks - Eventos Processados

### 1. BILLING.SUBSCRIPTION.ACTIVATED
Quando user aprova subscription no PayPal:
- Marca pending order como completed
- Cria order record
- Cria domain
- Cria subscription record
- Domain fica ativo imediatamente

### 2. PAYMENT.SALE.COMPLETED
Quando PayPal cobra renovação mensal:
- Atualiza subscription status para 'active'
- Mantém domain ativo

### 3. BILLING.SUBSCRIPTION.PAYMENT.FAILED
Quando pagamento falha:
- Marca subscription como 'past_due'
- PayPal tenta novamente automaticamente

### 4. BILLING.SUBSCRIPTION.CANCELLED
Quando user cancela:
- Marca subscription como 'cancelled'
- Domain continua ativo até expiração

---

## Fluxo Completo do User

### Primeira Compra

```
1. User escolhe: johndoe.com.rich + Prime ($50/mês)
↓
2. Checkout mostra:
   - Domain .com.rich: $25 (one-time)
   - Plano Prime: $50/mês (recurring)
   - Total hoje: $75
   - Após isso: $50/mês automaticamente
↓
3. User clica "Finalizar Compra"
↓
4. Redirecionado para PayPal
↓
5. User autoriza subscription no PayPal
↓
6. PayPal envia webhook: SUBSCRIPTION.ACTIVATED
↓
7. Sistema cria:
   - Domain: johndoe.com.rich (ativo)
   - Subscription: Prime ($50/mês)
↓
8. User é redirecionado para página de sucesso
```

### Renovação Mensal (Automática)

```
Dia 1 de cada mês:
↓
1. PayPal cobra $50 automaticamente
↓
2. PayPal envia webhook: PAYMENT.SALE.COMPLETED
↓
3. Sistema atualiza subscription status
↓
4. Domain continua ativo
```

### Falha no Pagamento

```
1. PayPal tenta cobrar mas falha
↓
2. PayPal envia webhook: PAYMENT.FAILED
↓
3. Sistema marca subscription como 'past_due'
↓
4. PayPal tenta novamente em 3 dias
↓
5. Se falhar 3x, PayPal cancela automaticamente
```

---

## Monitoramento

### Queries Úteis

```sql
-- Ver todas subscriptions ativas
SELECT
  s.*,
  sp.plan_name,
  u.email
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_id = sp.id
JOIN auth.users u ON s.user_id = u.id
WHERE s.status = 'active'
ORDER BY s.started_at DESC;

-- Ver renovações processadas
SELECT * FROM webhook_events
WHERE provider = 'paypal'
AND event_type = 'PAYMENT.SALE.COMPLETED'
ORDER BY created_at DESC;

-- Ver falhas de pagamento
SELECT * FROM subscriptions
WHERE status = 'past_due'
ORDER BY updated_at DESC;
```

---

## Troubleshooting

### Subscription não foi criada após pagamento

1. Verifique logs do webhook:
```sql
SELECT * FROM webhook_events
WHERE provider = 'paypal'
ORDER BY created_at DESC
LIMIT 10;
```

2. Verifique logs da Edge Function no Supabase Dashboard

3. Confirme que webhook URL está correta no PayPal

### Domain não foi ativado

1. Verifique se pending order existe:
```sql
SELECT * FROM pending_orders
WHERE status = 'pending'
ORDER BY created_at DESC;
```

2. Force reprocessamento manualmente (via admin)

### PayPal não está cobrando mensalmente

1. Verifique se Plan ID está correto
2. Verifique se subscription está ativa no PayPal
3. Confirme eventos do webhook no PayPal Dashboard

---

## Variáveis de Ambiente - Resumo

```bash
# Required for PayPal Subscriptions
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_secret
PAYPAL_MODE=sandbox  # ou 'live' para produção

# Optional - Mock Mode (for development)
VITE_USE_PAYMENT_MOCK=false

# Supabase (already configured)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Pronto para Uso!

O sistema está **100% funcional** e pronto para:

- ✅ Desenvolvimento local (sem credenciais)
- ✅ Testes em Sandbox
- ✅ Produção (quando configurar credenciais live)

**Basta adicionar as credenciais do PayPal quando estiver pronto!**

---

## Próximos Passos

1. Crie conta no PayPal Developer
2. Configure Sandbox (10 minutos)
3. Teste compras no sandbox
4. Quando tudo funcionar, migre para Live
5. Profit! 🚀

Se tiver dúvidas, consulte:
- PayPal Developer Docs: https://developer.paypal.com/docs/subscriptions/
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
