# 🔐 ANÁLISE DE VARIÁVEIS DE AMBIENTE - SISTEMAS ATIVOS/INATIVOS

**Data:** 2025-11-08
**Objetivo:** Identificar quais variáveis de ambiente são realmente necessárias

---

## 📊 RESUMO EXECUTIVO

| Variável | Status | Uso Atual | Recomendação |
|----------|--------|-----------|--------------|
| **TURNSTILE_SECRET_KEY** | ✅ **ATIVO** | Sistema de segurança anti-bot | **MANTER** |
| **GOOGLE_SAFE_BROWSING_API_KEY** | ✅ **ATIVO** | Verificação de links maliciosos | **MANTER** |
| **OPENAI_API_KEY** | 🟡 **OPCIONAL** | Chatbot com IA (fallback existe) | **OPCIONAL** |
| **ANTHROPIC_API_KEY** | 🟡 **OPCIONAL** | Chatbot com IA (fallback existe) | **OPCIONAL** |
| **PAYPAL_CLIENT_ID** | ✅ **ATIVO** | Sistema de pagamento principal | **OBRIGATÓRIO** |
| **PAYPAL_CLIENT_SECRET** | ✅ **ATIVO** | Sistema de pagamento principal | **OBRIGATÓRIO** |
| **PAYPAL_MODE** | ✅ **ATIVO** | Ambiente PayPal (sandbox/live) | **OBRIGATÓRIO** |
| **CRON_SECRET** | ✅ **ATIVO** | Segurança de jobs agendados | **MANTER** |

---

## 🔍 ANÁLISE DETALHADA

### 1. **TURNSTILE_SECRET_KEY** - ✅ ATIVO E CRÍTICO

**Onde é usado:**
- `supabase/functions/_shared/captcha.verify.ts`
- Função `verifyTurnstile()`

**Finalidade:**
- Proteção anti-bot do Cloudflare Turnstile
- Valida tokens de captcha em endpoints críticos
- Previne ataques automatizados

**Usado em:**
- Registro de usuários
- Login
- Criação de domínios
- Envio de formulários críticos

**O que acontece sem ele:**
```typescript
if (!secretKey) {
  console.error('TURNSTILE_SECRET_KEY not configured');
  return false; // Bloqueia requisição
}
```

**Impacto de remover:**
- ❌ Sistema de segurança anti-bot desativado
- ❌ Vulnerável a bots e ataques automatizados
- ❌ Pode sofrer spam e abuso

**RECOMENDAÇÃO:** ✅ **MANTER OBRIGATORIAMENTE**

---

### 2. **GOOGLE_SAFE_BROWSING_API_KEY** - ✅ ATIVO E IMPORTANTE

**Onde é usado:**
- `supabase/functions/_shared/link.security.ts`
- `supabase/functions/verify-link-security/index.ts`
- `supabase/functions/periodic-link-security-check/index.ts`

**Finalidade:**
- Verificação de URLs maliciosas
- Proteção contra phishing, malware, scams
- Sistema de moderação de links

**Como funciona:**
```typescript
const apiKey = Deno.env.get('GOOGLE_SAFE_BROWSING_API_KEY');

if (!apiKey) {
  // FALLBACK: Marca como "pending" em vez de bloquear
  return {
    status: 'pending',
    notes: 'Verificação de segurança não configurada'
  };
}
```

**Impacto de remover:**
- ⚠️ Links não são verificados automaticamente
- ⚠️ Usuários podem adicionar URLs maliciosas
- ⚠️ Marca como "pending" (requer moderação manual)
- ✅ Sistema continua funcionando (com fallback)

**RECOMENDAÇÃO:** ✅ **MANTER** (tem fallback gracioso, mas importante para segurança)

---

### 3. **OPENAI_API_KEY** - 🟡 OPCIONAL (CHATBOT)

**Onde é usado:**
- `supabase/functions/chatbot-process/index.ts`

**Finalidade:**
- Chatbot com IA para respostas avançadas
- Processa perguntas complexas com GPT

**Como funciona:**
```typescript
const openaiKey = Deno.env.get("OPENAI_API_KEY");
const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

// Sistema tem 3 níveis de resposta:
// 1. Base de conhecimento (artigos de suporte) - SEMPRE funciona
// 2. Pattern matching avançado - SEMPRE funciona
// 3. LLM (OpenAI/Claude) - OPCIONAL
```

**Sistema sem as chaves:**
- ✅ Chatbot continua funcionando
- ✅ Responde usando base de conhecimento (artigos)
- ✅ Responde usando patterns (regras pré-programadas)
- ❌ Não responde perguntas muito complexas/inéditas

**Impacto de remover:**
- ✅ Chatbot **continua funcionando** em modo básico
- ❌ Respostas menos "inteligentes"
- ❌ Não improvisa respostas novas
- ✅ Economia de custos (sem cobrança OpenAI/Anthropic)

**RECOMENDAÇÃO:** 🟡 **OPCIONAL** - Sistema funciona sem, mas com limitações

**Se quiser economizar:** Pode remover no início e adicionar depois se necessário.

---

### 4. **ANTHROPIC_API_KEY** - 🟡 OPCIONAL (CHATBOT)

**Mesma análise que OPENAI_API_KEY**

O sistema tenta usar as duas APIs alternadamente:
- Tenta OpenAI primeiro
- Se falhar ou não existir, tenta Anthropic
- Se ambas falharem, usa respostas básicas

**RECOMENDAÇÃO:** 🟡 **OPCIONAL** - Redundância da OpenAI

---

### 5. **PAYPAL_CLIENT_ID** - ✅ OBRIGATÓRIO

**Onde é usado:**
- `supabase/functions/paypal-create-order/index.ts`
- `supabase/functions/paypal-create-subscription/index.ts`
- `supabase/functions/paypal-capture/index.ts`
- `supabase/functions/paypal-webhook/index.ts`
- `supabase/functions/payment-reconciliation/index.ts`
- `supabase/functions/domain-transfer/index.ts`
- `src/pages/Checkout.tsx` (frontend)

**Finalidade:**
- Autenticação com PayPal API
- Sistema de pagamento principal do site

**Impacto de remover:**
- ❌ **SISTEMA DE PAGAMENTOS PARA COMPLETAMENTE**
- ❌ Não é possível comprar domínios
- ❌ Não é possível criar assinaturas
- ❌ Site não gera receita

**RECOMENDAÇÃO:** ✅ **ABSOLUTAMENTE OBRIGATÓRIO** - Sem isso o site não funciona

---

### 6. **PAYPAL_CLIENT_SECRET** - ✅ OBRIGATÓRIO

**Mesma análise que PAYPAL_CLIENT_ID**

Usadas juntas para autenticação OAuth com PayPal.

**RECOMENDAÇÃO:** ✅ **ABSOLUTAMENTE OBRIGATÓRIO**

---

### 7. **PAYPAL_MODE** - ✅ OBRIGATÓRIO

**Valores possíveis:**
- `sandbox` - Ambiente de testes
- `live` - Produção real

**Onde é usado:**
- Todas as edge functions do PayPal
- Define se usa API de testes ou produção

**Impacto de remover:**
- ❌ Sistema não sabe qual ambiente usar
- ❌ Pagamentos param de funcionar

**RECOMENDAÇÃO:** ✅ **OBRIGATÓRIO** (deve ser `live` em produção)

---

### 8. **CRON_SECRET** - ✅ ATIVO E IMPORTANTE

**Onde é usado:**
- `supabase/functions/periodic-link-security-check/index.ts`
- Todas as edge functions executadas via CRON

**Finalidade:**
- Segurança: Valida que chamadas CRON são legítimas
- Previne execução não autorizada de jobs agendados

**Como funciona:**
```typescript
const cronSecret = req.headers.get('x-cron-secret');
const expectedSecret = Deno.env.get('CRON_SECRET');

if (cronSecret !== expectedSecret) {
  return new Response('Unauthorized', { status: 401 });
}
```

**Jobs que usam:**
- Verificação periódica de links maliciosos
- Notificações de domínios expirando
- Limpeza de dados antigos
- Processamento de pagamentos pendentes

**Impacto de remover:**
- ⚠️ Qualquer um pode executar jobs agendados
- ⚠️ Possível DoS atacando endpoints de CRON
- ⚠️ Vulnerabilidade de segurança

**RECOMENDAÇÃO:** ✅ **MANTER** (segurança importante)

---

## 📋 RESUMO DE RECOMENDAÇÕES

### ✅ **OBRIGATÓRIAS (Não remover nunca)**

```env
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx
PAYPAL_MODE=live
```

**Motivo:** Sistema de pagamentos principal. Sem isso o site não funciona.

---

### ✅ **ALTAMENTE RECOMENDADAS (Segurança)**

```env
TURNSTILE_SECRET_KEY=xxx
GOOGLE_SAFE_BROWSING_API_KEY=xxx
CRON_SECRET=xxx
```

**Motivo:**
- **TURNSTILE:** Proteção anti-bot (crítico para segurança)
- **SAFE_BROWSING:** Proteção contra links maliciosos (tem fallback, mas importante)
- **CRON_SECRET:** Segurança de jobs agendados

---

### 🟡 **OPCIONAIS (Funcionalidade Extra)**

```env
OPENAI_API_KEY=xxx          # Opcional - Chatbot inteligente
ANTHROPIC_API_KEY=xxx        # Opcional - Fallback do chatbot
```

**Motivo:**
- Chatbot funciona sem elas (modo básico)
- Adiciona "inteligência" extra
- Custo mensal variável
- Pode adicionar depois se sentir necessidade

**Economia:** ~$20-50/mês (depende do uso)

---

## 💰 ANÁLISE DE CUSTOS

### **Com Todas as Chaves:**

| Serviço | Custo Mensal | Obrigatório? |
|---------|--------------|--------------|
| PayPal | $0 (% transação) | ✅ SIM |
| Turnstile | $0 (gratuito) | ✅ SIM |
| Safe Browsing | $0 (quota grátis) | ✅ SIM |
| CRON Secret | $0 (interno) | ✅ SIM |
| OpenAI GPT | ~$20-50 | 🟡 OPCIONAL |
| Anthropic Claude | ~$20-40 | 🟡 OPCIONAL |
| **TOTAL** | **~$40-90/mês** | - |

### **Sem IAs (Recomendado para início):**

| Serviço | Custo Mensal |
|---------|--------------|
| PayPal | $0 (% transação) |
| Turnstile | $0 |
| Safe Browsing | $0 |
| CRON Secret | $0 |
| **TOTAL** | **$0/mês** ✅ |

---

## 🎯 RECOMENDAÇÃO FINAL

### **PARA PRODUÇÃO (Launch Inicial):**

**Configurar OBRIGATORIAMENTE:**
```env
# Pagamentos (CRÍTICO)
PAYPAL_CLIENT_ID=live_xxx
PAYPAL_CLIENT_SECRET=live_xxx
PAYPAL_MODE=live

# Segurança (CRÍTICO)
TURNSTILE_SECRET_KEY=xxx
GOOGLE_SAFE_BROWSING_API_KEY=xxx
CRON_SECRET=xxx
```

**NÃO configurar inicialmente (economizar):**
```env
# Chatbot IA (OPCIONAL - adicionar depois se necessário)
# OPENAI_API_KEY=xxx
# ANTHROPIC_API_KEY=xxx
```

### **Comportamento com essa config:**

✅ Sistema de pagamentos: 100% funcional
✅ Segurança anti-bot: 100% ativa
✅ Verificação de links: 100% ativa
✅ Jobs agendados: 100% seguros
✅ Chatbot: Funciona em modo básico (sem IA)
✅ Custo mensal: $0 (só % transação PayPal)

---

## 🚀 QUANDO ADICIONAR AS OPCIONAIS?

**Adicione OPENAI_API_KEY / ANTHROPIC_API_KEY quando:**

1. Chatbot recebe muitas perguntas que não consegue responder
2. Usuários reclamam de respostas muito "robóticas"
3. Quer oferecer suporte mais "humano"
4. Tem orçamento para investir (~$40-90/mês)

**Como adicionar depois:**

1. Criar conta OpenAI/Anthropic
2. Adicionar chaves no Supabase Dashboard → Settings → Edge Functions → Secrets
3. Sistema detecta automaticamente e ativa modo IA
4. Zero mudanças no código necessárias

---

## ✅ CHECKLIST DE CONFIGURAÇÃO

### **Produção (Launch):**

- [ ] ✅ PAYPAL_CLIENT_ID (obrigatório)
- [ ] ✅ PAYPAL_CLIENT_SECRET (obrigatório)
- [ ] ✅ PAYPAL_MODE=live (obrigatório)
- [ ] ✅ TURNSTILE_SECRET_KEY (obrigatório)
- [ ] ✅ GOOGLE_SAFE_BROWSING_API_KEY (obrigatório)
- [ ] ✅ CRON_SECRET (obrigatório)
- [ ] 🟡 OPENAI_API_KEY (opcional - deixar para depois)
- [ ] 🟡 ANTHROPIC_API_KEY (opcional - deixar para depois)

### **Desenvolvimento/Testes:**

- [ ] ✅ PAYPAL_CLIENT_ID (sandbox)
- [ ] ✅ PAYPAL_CLIENT_SECRET (sandbox)
- [ ] ✅ PAYPAL_MODE=sandbox
- [ ] ✅ TURNSTILE_SECRET_KEY (test key)
- [ ] 🟡 GOOGLE_SAFE_BROWSING_API_KEY (opcional)
- [ ] ✅ CRON_SECRET (qualquer string)
- [ ] ❌ OPENAI_API_KEY (não necessário)
- [ ] ❌ ANTHROPIC_API_KEY (não necessário)

---

**Última atualização:** 2025-11-08
**Status:** Análise completa - Pronto para decisão de deploy
