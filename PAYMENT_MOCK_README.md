# 🧪 MOCK PAYMENT SYSTEM - .com.rich

**Versão:** 1.0
**Data:** 5 de Novembro de 2025
**Status:** ✅ ATIVO

---

## 📋 ÍNDICE

1. [O Que É](#o-que-é)
2. [Por Que Usar](#por-que-usar)
3. [Como Ativar](#como-ativar)
4. [Como Desativar](#como-desativar)
5. [Fluxo Completo](#fluxo-completo)
6. [Testes Recomendados](#testes-recomendados)
7. [Troubleshooting](#troubleshooting)
8. [Limitações](#limitações)

---

## 🎯 O QUE É

O **Mock Payment System** é um sistema de pagamentos simulados que permite testar **todo o funil de vendas** do .com.rich **sem processar pagamentos reais no PayPal**.

### O Que É Simulado

✅ **Criação de ordem de pagamento**
✅ **Captura de pagamento**
✅ **Criação de `order` no banco com `total_cents > 0`**
✅ **Criação de `subscription` automática**
✅ **Ativação de domínio**
✅ **Registro de log de reconciliação**

### O Que NÃO É Simulado

❌ Integração real com PayPal
❌ Webhooks do PayPal
❌ Registro real de domínio (usa mock)
❌ Cobranças reais de cartão de crédito

---

## 💡 POR QUE USAR

### Casos de Uso

1. **Desenvolvimento Local**
   - Testar mudanças no fluxo de checkout
   - Validar lógica de ativação
   - Depurar problemas de pagamento

2. **Testes End-to-End**
   - Validar funil completo: busca → checkout → pagamento → ativação
   - Testar diferentes planos (Starter, Prime, Elite, Supreme)
   - Verificar criação correta de subscriptions

3. **Demo e Apresentações**
   - Mostrar fluxo completo sem processar pagamentos reais
   - Simular cenários de sucesso/erro
   - Treinar equipe de suporte

4. **Staging/QA**
   - Validar deployments antes de produção
   - Testar integrações com outros sistemas
   - Verificar performance do fluxo

### Vantagens

✅ **Zero custo** - Não gasta dinheiro com testes
✅ **Rápido** - Sem latência de APIs externas
✅ **Confiável** - Sempre retorna sucesso (controlado)
✅ **Rastreável** - Logs detalhados de cada etapa
✅ **Seguro** - Não expõe credenciais reais do PayPal

---

## ⚙️ COMO ATIVAR

### Método 1: Variável de Ambiente (Recomendado)

**1. Edite o arquivo `.env`:**

```bash
# No projeto root:
nano .env
```

**2. Adicione ou altere a variável:**

```bash
# Mock Payment Mode - Bypass PayPal for testing
# Set to 'true' to test full sales funnel without real PayPal transactions
VITE_USE_PAYMENT_MOCK=true
```

**3. Salve o arquivo (Ctrl+O, Enter, Ctrl+X)**

**4. Reinicie o servidor de desenvolvimento:**

```bash
npm run dev
```

**5. Verifique no console do browser:**

```
[Checkout] Using MOCK payment mode
```

### Método 2: Linha de Comando (Temporário)

```bash
# Linux/Mac:
VITE_USE_PAYMENT_MOCK=true npm run dev

# Windows (PowerShell):
$env:VITE_USE_PAYMENT_MOCK="true"; npm run dev

# Windows (CMD):
set VITE_USE_PAYMENT_MOCK=true && npm run dev
```

### Verificação

Abra o console do navegador (F12) e vá para o checkout. Você deve ver:

```
[Checkout] Using MOCK payment mode
```

---

## 🔌 COMO DESATIVAR

### Método 1: Variável de Ambiente

**1. Edite `.env`:**

```bash
VITE_USE_PAYMENT_MOCK=false
```

**2. Reinicie o servidor:**

```bash
npm run dev
```

### Método 2: Remover Variável

**1. Edite `.env` e remova a linha:**

```bash
# Remova ou comente:
# VITE_USE_PAYMENT_MOCK=true
```

**2. Reinicie o servidor**

### Verificação

No console do browser, você deve ver:

```
[Checkout] Using REAL payment mode
```

---

## 🔄 FLUXO COMPLETO

### 1. Busca de Domínio
```
User → Home Page → Search "johndoe.rich" → Domain available ✅
```

### 2. Checkout
```
User → Clicks "Register" → Checkout page
→ Fills contact info
→ Selects plan (Prime)
→ Accepts terms
→ Clicks "Pay with PayPal"
```

### 3. Mock Payment Create
```
Frontend → POST /functions/v1/mock-payment-create
{
  domain: "johndoe.rich",
  price: 35.00,
  planId: "uuid-prime-plan",
  planCode: "prime",
  contactInfo: {...},
  domainType: "personal"
}

Response:
{
  success: true,
  orderId: "MOCK-1699123456789-A7B2C3",
  approveUrl: "http://localhost:5173/paypal/return?token=MOCK-...",
  amount: 35.00,
  status: "CREATED",
  mock: true
}
```

**Banco de Dados (pending_orders):**
```sql
INSERT INTO pending_orders (
  user_id,
  paypal_order_id,
  fqdn,
  amount,
  total_cents,
  status
) VALUES (
  'user-uuid',
  'MOCK-1699123456789-A7B2C3',
  'johndoe.rich',
  35.00,
  3500,
  'pending'
);
```

### 4. Redirect to Mock Approval
```
Frontend → window.location.href = approveUrl
→ User redirected to /paypal/return?token=MOCK-...&mock=true
```

### 5. Mock Payment Capture
```
Frontend → POST /functions/v1/mock-payment-capture
{
  orderId: "MOCK-1699123456789-A7B2C3"
}

Backend Process:
1. ✅ Get pending_order
2. ✅ Update pending_order.status = "completed"
3. ✅ Create customer (if not exists)
4. ✅ Create order with total_cents = 3500
5. ✅ Create domain with status = "active"
6. ✅ Create subscription with status = "active"
7. ✅ Log to reconciliation

Response:
{
  success: true,
  status: "COMPLETED",
  orderId: "MOCK-1699123456789-A7B2C3",
  mock: true,
  processing_time_ms: 234,
  data: {
    order_id: "order-uuid",
    domain_id: "domain-uuid",
    subscription_id: "sub-uuid",
    total_cents: 3500,
    domain_status: "active",
    subscription_status: "active"
  }
}
```

**Banco de Dados (Final State):**

```sql
-- orders table
INSERT INTO orders (
  customer_id,
  fqdn,
  years,
  plan,
  plan_id,
  total_cents, -- ✅ 3500 (NOT zero!)
  status,
  paypal_order_id,
  payment_method
) VALUES (
  'customer-uuid',
  'johndoe.rich',
  1,
  'prime',
  'plan-uuid',
  3500,
  'completed',
  'MOCK-1699123456789-A7B2C3',
  'mock'
);

-- domains table
INSERT INTO domains (
  customer_id,
  fqdn,
  registrar_status, -- ✅ "active" (NOT pending!)
  expires_at,
  domain_type,
  registrar_id
) VALUES (
  'customer-uuid',
  'johndoe.rich',
  'active',
  '2026-11-05',
  'personal',
  'MOCK-DOMAIN-1699123456789'
);

-- subscriptions table (CRITICAL - Created automatically!)
INSERT INTO subscriptions (
  user_id,
  plan_id,
  status, -- ✅ "active"
  is_trial,
  started_at,
  next_billing_date,
  expires_at,
  payment_status,
  last_payment_date,
  paypal_subscription_id
) VALUES (
  'user-uuid',
  'plan-uuid',
  'active',
  false,
  '2025-11-05',
  '2025-12-05',
  '2025-12-05',
  'paid',
  '2025-11-05',
  'MOCK-SUB-MOCK-1699123456789-A7B2C3'
);

-- payment_reconciliation_log
INSERT INTO payment_reconciliation_log (
  started_at,
  completed_at,
  orders_checked,
  discrepancies_found,
  discrepancies_resolved,
  status,
  notes
) VALUES (
  '2025-11-05 10:30:00',
  '2025-11-05 10:30:01',
  1,
  0,
  0,
  'completed',
  'Mock payment processed: MOCK-1699123456789-A7B2C3'
);
```

### 6. Success Page
```
Frontend → Shows success message
→ Displays: "🧪 Pagamento Mock Confirmado!"
→ Warning: "⚠️ MODO TESTE - Nenhum pagamento real foi processado"
→ Redirects to /dashboard after 2s
```

### 7. Dashboard
```
User → Dashboard
→ Sees johndoe.rich domain (active ✅)
→ Has Prime plan access ✅
→ Can access all Prime features ✅
```

---

## ✅ TESTES RECOMENDADOS

### Teste 1: Fluxo Básico (Starter)

1. Ative mock mode
2. Busque domínio disponível: `testuser.rich`
3. Complete checkout com plano Starter
4. Verifique:
   - ✅ Order criado com total_cents > 0
   - ✅ Domain criado com status "active"
   - ✅ Subscription criada com status "active"

**SQL para verificar:**
```sql
SELECT
  o.id as order_id,
  o.total_cents,
  o.status as order_status,
  d.fqdn,
  d.registrar_status,
  s.status as subscription_status
FROM orders o
JOIN domains d ON d.customer_id = o.customer_id
LEFT JOIN subscriptions s ON s.user_id = (
  SELECT user_id FROM customers WHERE id = o.customer_id
)
WHERE o.fqdn = 'testuser.rich'
ORDER BY o.created_at DESC
LIMIT 1;
```

### Teste 2: Plano Prime

1. Busque: `primeuser.rich`
2. Selecione Prime plan
3. Complete checkout
4. Verifique total_cents = 3500 (domínio $25 + Prime $10)

### Teste 3: Plano Elite

1. Busque: `eliteuser.rich`
2. Selecione Elite plan
3. Verifique subscription com unlimited features

### Teste 4: Domain Type (Business)

1. Busque: `mybusiness.rich`
2. Selecione "Empresarial"
3. Verifique domain_type = "business"

### Teste 5: Múltiplos Domínios

1. Compre domain pessoal
2. Compre domain empresarial
3. Verifique display_order correto (1, 2)

### Teste 6: Error Handling

1. Tente checkout sem plano selecionado
2. Tente sem aceitar termos
3. Verifique error messages

---

## 🐛 TROUBLESHOOTING

### Problema: Console mostra "Using REAL payment mode"

**Solução:**
1. Verifique `.env`: `VITE_USE_PAYMENT_MOCK=true`
2. Reinicie servidor: `Ctrl+C`, depois `npm run dev`
3. Hard refresh: `Ctrl+Shift+R`

### Problema: Error "Endpoint not found"

**Causa:** Edge functions não deployed

**Solução:**
```bash
# Deploy mock functions
supabase functions deploy mock-payment-create
supabase functions deploy mock-payment-capture

# Or use Supabase Dashboard → Edge Functions
```

### Problema: total_cents = 0 no banco

**Causa:** Bug antigo não corrigido

**Verificação:**
```sql
SELECT total_cents, amount FROM pending_orders
WHERE paypal_order_id LIKE 'MOCK-%'
ORDER BY created_at DESC LIMIT 5;
```

**Se amount NULL ou total_cents = 0:**
- Verifique código em `mock-payment-create/index.ts` linha 72-78
- Deve ter: `total_cents: Math.round(price * 100)`

### Problema: Subscription não criada

**Verificação:**
```sql
SELECT
  u.email,
  s.status,
  s.created_at
FROM auth.users u
LEFT JOIN subscriptions s ON s.user_id = u.id
WHERE u.email = 'your@email.com';
```

**Se NULL:**
- Verifique `mock-payment-capture/index.ts` linha 140-165
- Confirme que `planId` está sendo passado

### Problema: Domain com status "pending"

**Causa:** Código não atualizado

**Fix:** Em `mock-payment-capture/index.ts` linha 128:
```typescript
registrar_status: "active",  // NOT "pending_provisioning"
```

---

## ⚠️ LIMITAÇÕES

### O Que Mock NÃO Testa

1. **Webhooks do PayPal**
   - BILLING.SUBSCRIPTION.CANCELLED
   - PAYMENT.SALE.COMPLETED
   - etc.

2. **Integração Real com Registrar**
   - Dynadot API calls
   - DNS propagation
   - WHOIS updates

3. **Renovação Automática**
   - PayPal subscription renewal
   - Billing cycle processing

4. **Payment Failures**
   - Insufficient funds
   - Card declined
   - Payment disputes

5. **Refunds**
   - PayPal refund API
   - Partial refunds

### Quando NÃO Usar Mock

❌ **Testes de integração com PayPal sandbox**
❌ **Validação de webhooks**
❌ **Testes de renovação mensal**
❌ **Staging final antes de produção**
❌ **Demo para stakeholders (use sandbox PayPal)**

Use **PayPal Sandbox** para testes mais realistas de integração.

---

## 📊 LOGS E DEBUGGING

### Console Logs

**Checkout (create order):**
```
[Checkout] Using MOCK payment mode
[Mock Payment] Creating order: {user_id, domain, price, planCode}
[Mock Payment] Pending order created: <uuid>
```

**Return Page (capture):**
```
🔍 PayPalReturn - URL params: {orderId, isMock: true}
🔄 Processando captura MOCK: MOCK-...
[Mock Capture] Processing order: MOCK-...
[Mock Capture] Pending order marked as completed
[Mock Capture] Using existing customer: <uuid>
[Mock Capture] ✅ Order created: <uuid> total_cents: 3500
[Mock Capture] ✅ Domain created: <uuid> status: active
[Mock Capture] ✅ Subscription created: <uuid>
[Mock Capture] ✅ Reconciliation logged
✅ Captura MOCK resultado: {success, status, data}
🧪 Mock Payment Details: {order_id, domain_id, subscription_id, total_cents, processing_time}
```

### Database Queries

**Ver últimos mock payments:**
```sql
SELECT
  po.paypal_order_id,
  po.fqdn,
  po.amount,
  po.total_cents,
  po.status,
  po.created_at,
  o.total_cents as order_total_cents,
  d.registrar_status,
  s.status as subscription_status
FROM pending_orders po
LEFT JOIN orders o ON o.paypal_order_id = po.paypal_order_id
LEFT JOIN domains d ON d.fqdn = po.fqdn
LEFT JOIN subscriptions s ON s.paypal_subscription_id LIKE CONCAT('MOCK-SUB-', po.paypal_order_id)
WHERE po.paypal_order_id LIKE 'MOCK-%'
ORDER BY po.created_at DESC
LIMIT 10;
```

**Ver reconciliation logs:**
```sql
SELECT * FROM payment_reconciliation_log
WHERE notes LIKE 'Mock payment%'
ORDER BY started_at DESC
LIMIT 10;
```

---

## 🎯 CHECKLIST DE VALIDAÇÃO

Antes de considerar o mock system funcional, verifique:

### Backend
- [ ] `mock-payment-create` deployed
- [ ] `mock-payment-capture` deployed
- [ ] Ambos retornam 200 OK
- [ ] Logs aparecem no console

### Frontend
- [ ] `.env` tem `VITE_USE_PAYMENT_MOCK=true`
- [ ] Console mostra "Using MOCK payment mode"
- [ ] Checkout redirect para /paypal/return?mock=true
- [ ] Success page mostra "🧪 Pagamento Mock Confirmado!"

### Database
- [ ] `pending_orders` criado com amount > 0
- [ ] `orders` criado com total_cents > 0
- [ ] `domains` criado com status = "active"
- [ ] `subscriptions` criado com status = "active"
- [ ] `payment_reconciliation_log` tem entry

### User Experience
- [ ] User vê success message
- [ ] User redirecionado para dashboard
- [ ] Domain aparece como ativo
- [ ] User tem acesso às features do plano

---

## 📝 NOTAS IMPORTANTES

1. **NUNCA use mock em produção**
   - Sempre desative antes de deploy para prod
   - Adicione check de environment se necessário

2. **Mock simula SUCESSO sempre**
   - Não testa cenários de erro
   - Para testar errors, use PayPal Sandbox

3. **Dados são reais no banco**
   - Mock cria registros reais
   - Limpe dados de teste periodicamente

4. **Performance pode diferir**
   - Mock é mais rápido que PayPal real
   - Use para validar lógica, não performance

5. **Logs são verbosos**
   - Facilita debugging
   - Remova antes de produção se necessário

---

## 🔄 ALTERNANDO ENTRE MOCK E REAL

**Para Desenvolvimento:**
```bash
VITE_USE_PAYMENT_MOCK=true npm run dev
```

**Para Staging (com PayPal Sandbox):**
```bash
VITE_USE_PAYMENT_MOCK=false npm run dev
# + PAYPAL_MODE=sandbox nas env vars do Supabase
```

**Para Produção:**
```bash
VITE_USE_PAYMENT_MOCK=false npm run build
# + PAYPAL_MODE=live nas env vars do Supabase
```

---

## 📞 SUPORTE

**Issues:** Reportar no GitHub com label `mock-payment`

**Logs:** Sempre inclua console logs completos

**Database State:** Inclua resultado das queries de validação

---

**Versão:** 1.0
**Última Atualização:** 5 de Novembro de 2025
**Autor:** Claude Code (Anthropic AI)
**Status:** ✅ Testado e Funcional
