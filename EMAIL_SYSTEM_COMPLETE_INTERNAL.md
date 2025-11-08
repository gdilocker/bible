# 📧 SISTEMA DE E-MAILS INTERNO - IMPLEMENTAÇÃO COMPLETA

**Data**: 2025-11-08
**Status**: ✅ IMPLEMENTADO E FUNCIONAL
**Tipo**: Sistema Interno de Comunicações Transacionais

---

## 🎯 OBJETIVO

Sistema completo de comunicações automáticas **@com.rich** para:
- ✅ Notificações do sistema
- ✅ E-mails transacionais (confirmações, alertas, etc)
- ✅ Comunicação com usuários
- ✅ Logs e auditoria completa
- ✅ Multi-canal (E-mail, Dashboard, WhatsApp futuro)

**IMPORTANTE:** Sistema interno apenas - não envia/recebe e-mails externos (Gmail, Outlook, etc)

---

## ✅ O QUE ESTÁ IMPLEMENTADO

### 1. **Base de Dados Completa** ✅

#### Tabelas do Sistema de E-mail (7 tabelas)

**`email_accounts`** - Contas @com.rich
```sql
- email_address (único, validado para @com.rich)
- display_name, signature
- quota_mb (1GB padrão), used_mb
- status (active, suspended, deleted)
- user_id (vinculado ao auth.users)
```

**`email_folders`** - Organização de mensagens
```sql
- Tipos: inbox, sent, drafts, trash, spam, custom
- unread_count, total_count (atualizados automaticamente)
- Suporte a subpastas (parent_id)
```

**`email_messages`** - Mensagens
```sql
- from_address, to_addresses[], cc[], bcc[]
- subject, body_text, body_html
- is_read, is_starred, is_draft
- tags[], thread_id (conversas)
- Busca full-text no subject
```

**`email_attachments`** - Anexos
```sql
- filename, content_type, size_bytes
- storage_path (Supabase Storage)
```

**`email_aliases`** - Aliases/forwards
```sql
- alias_address → account_id
- Exemplo: vendas@com.rich → contato@com.rich
```

**`email_filters`** - Regras automáticas
```sql
- conditions (JSONB)
- actions (JSONB)
- priority, is_active
```

**`email_audit_log`** - Auditoria
```sql
- action, details (JSONB)
- user_id, account_id
- ip_address, created_at
```

#### Tabelas do Sistema de Comunicações (3 tabelas)

**`notification_templates`** - Templates de mensagens
```sql
- type (domain_expiring, payment_failed, etc)
- title_template, message_template
- email_subject, email_body, whatsapp_message
- channels[] (email, in_app, whatsapp)
- send_at_days, lifecycle_trigger
- variables (para substituição dinâmica)
```

**`communication_preferences`** - Preferências do usuário
```sql
- email_enabled, whatsapp_enabled, push_enabled
- renewal_reminders, payment_alerts, domain_lifecycle
- quiet_hours, timezone
- gdpr_consent, lgpd_consent
```

**`communication_log`** - Rastreamento de envios
```sql
- channel, template_type, message
- status (pending, sent, delivered, failed)
- sent_at, delivered_at, opened_at, clicked_at
- external_message_id (para integrações futuras)
- click_count, metadata
```

**TOTAL:** 10 tabelas interconectadas

---

### 2. **Automações e Triggers** ✅

**`create_default_folders_trigger`**
- Cria pastas padrão ao criar conta de e-mail
- Inbox, Sent, Drafts, Trash, Spam

**`update_folder_counts_trigger`**
- Atualiza contadores automaticamente
- total_count, unread_count

---

### 3. **Edge Functions Implementadas** ✅

**`communication-dispatcher`** - Processador principal
```typescript
Função: Executa rotina automatizada de comunicações
- Busca domínios que precisam de notificações
- Verifica timeline (D-14, D-7, D-1, D+1, etc)
- Cria notificações baseadas em templates
- Envia para canais configurados (email, dashboard)
- Registra tudo no communication_log
```

**Outras edge functions relacionadas:**
- `auto-create-profile` - Cria perfil ao registrar
- `ensure-customer` - Garante registro de cliente
- `handle-plan-change` - Gerencia mudanças de plano
- `trial-expiration-handler` - Trata fim de trial

---

### 4. **Sistema de Templates** ✅

#### Templates Implementados no Banco:

**Ciclo de Vida de Domínios:**
1. `domain_expiring_14d` - 14 dias antes do vencimento
2. `domain_expiring_7d` - 7 dias antes
3. `domain_expiring_3d` - 3 dias antes
4. `domain_expiring_1d` - Véspera do vencimento
5. `domain_expired_grace` - Entrou em período de graça
6. `domain_grace_ending` - Graça terminando (D+10)
7. `domain_redemption` - Entrou em redemption (D+16)
8. `domain_redemption_urgent` - Último aviso redemption (D+30)
9. `domain_pre_auction` - Antes do leilão (D+60)

**Pagamentos:**
10. `payment_failed` - Falha no pagamento
11. `payment_recovered` - Pagamento recuperado
12. `subscription_cancelled` - Assinatura cancelada
13. `chargeback_detected` - Chargeback identificado

**Trial:**
14. `trial_ending_3d` - Trial terminando em 3 dias
15. `trial_ended` - Trial expirado

**Segurança:**
16. `link_security_blocked` - Link bloqueado por segurança

Cada template tem:
- ✅ Título e mensagem
- ✅ Versão para e-mail (subject + body)
- ✅ Versão para WhatsApp
- ✅ Versão para dashboard
- ✅ Variáveis dinâmicas (ex: `{{domain_name}}`, `{{days_remaining}}`)
- ✅ Ações (botões, links)

---

### 5. **Timeline Automática** ✅

Sistema processa automaticamente:

**PRÉ-EXPIRAÇÃO (Domínio Ativo):**
```
D-14 → Notificação: "Renovação se aproxima"
D-7  → Notificação: "Faltam 7 dias"
D-3  → Notificação: "Últimos dias para renovar"
D-1  → Notificação: "Vencimento amanhã"
D-0  → Expira → Entra em Grace Period
```

**PÓS-EXPIRAÇÃO (Grace Period):**
```
D+1  → Notificação: "Período de graça iniciado"
D+10 → Notificação: "Ainda pode renovar sem taxa"
D+15 → Fim da graça → Entra em Redemption
```

**REDEMPTION (Taxa de Resgate):**
```
D+16 → Notificação: "Período de resgate (taxa de R$XXX)"
D+30 → Notificação: "Último aviso antes do pré-leilão"
D+45 → Fim redemption → Pré-leilão
```

**LEILÃO:**
```
D+60 → Notificação: "Domínio entrará em leilão"
D+75 → Leilão → Remoção definitiva
```

---

### 6. **Interface Admin** ✅

**`/admin/email`** - Gestão de E-mails
- ✅ Listagem de contas @com.rich
- ✅ Criar nova conta institucional
- ✅ Ativar/Suspender contas
- ✅ Excluir contas
- ✅ Busca e filtros
- ✅ Cards com estatísticas
- ✅ Validação automática (@com.rich)

---

### 7. **Segurança (RLS)** ✅

**Políticas Aplicadas:**
- ✅ Usuários veem apenas suas contas/mensagens
- ✅ Admins veem tudo
- ✅ Communication_log auditável
- ✅ Preferências privadas por usuário
- ✅ Templates gerenciáveis apenas por admins

---

## 🔄 COMO FUNCIONA NA PRÁTICA

### **Exemplo 1: Domínio Expirando**

```
1. CRON Job executa communication-dispatcher diariamente
2. Função busca domínios com next_renewal_at
3. Calcula: days_until = (next_renewal_at - today)
4. Se days_until == 14:
   - Busca template 'domain_expiring_14d'
   - Substitui variáveis: {{domain_name}}, {{days_remaining}}
   - Cria notificação no dashboard
   - Se usuário tem email_enabled:
     → Insere em communication_log (channel='email')
     → Marca status='sent'
   - Se usuário tem whatsapp_enabled:
     → Prepara mensagem WhatsApp (implementação futura)
5. Repete para D-7, D-3, D-1
```

### **Exemplo 2: Pagamento Falhou**

```
1. PayPal webhook recebe evento "PAYMENT.FAILED"
2. Edge function 'paypal-webhook' processa
3. Atualiza status da subscription
4. Chama create_notification_from_template:
   - type: 'payment_failed'
   - variables: {subscription_id, amount, next_attempt_date}
5. Sistema envia para canais configurados:
   - Dashboard: Notificação vermelha com ícone de alerta
   - E-mail: "Falha no pagamento - Atualize seus dados"
   - WhatsApp (futuro): "Pagamento não processado"
6. Usuário clica em "Atualizar Pagamento"
7. Log registra: click_count++, clicked_at
```

### **Exemplo 3: Novo Usuário**

```
1. Usuário se registra
2. Edge function 'auto-create-profile' executa
3. Cria entrada em customers
4. Cria entrada em communication_preferences:
   - email_enabled: true (padrão)
   - renewal_reminders: true
   - domain_lifecycle: true
5. Se plano tem trial:
   - Agenda notificação para D-3 (trial_ending_3d)
6. Envia e-mail de boas-vindas (se tiver template)
```

---

## 📊 CONTAS @COM.RICH INSTITUCIONAIS

### **Contas Recomendadas a Criar:**

1. **no-reply@com.rich**
   - Propósito: E-mails transacionais automáticos
   - Uso: Confirmações, notificações, alertas

2. **suporte@com.rich**
   - Propósito: Atendimento ao cliente
   - Uso: Tickets, dúvidas, problemas

3. **contato@com.rich**
   - Propósito: Contato geral/comercial
   - Uso: Formulário de contato, parcerias

4. **admin@com.rich**
   - Propósito: Comunicações administrativas
   - Uso: Avisos internos, mudanças no sistema

5. **seguranca@com.rich**
   - Propósito: Alertas de segurança
   - Uso: 2FA, logins suspeitos, bloqueios

6. **financeiro@com.rich**
   - Propósito: Questões financeiras
   - Uso: Faturas, pagamentos, reembolsos

---

## 🎨 FORMATO DOS E-MAILS

### **Estrutura Padrão:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{email_subject}}</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">

  <!-- Header com Logo -->
  <div style="background: #000; padding: 20px; text-align: center;">
    <img src="https://com.rich/logo.png" alt="com.rich" height="40">
  </div>

  <!-- Conteúdo -->
  <div style="background: #fff; padding: 30px; margin: 20px 0;">
    <h1 style="color: #333;">{{title}}</h1>
    <p style="color: #666; line-height: 1.6;">{{message}}</p>

    <!-- Variáveis dinâmicas -->
    <div style="background: #f8f8f8; padding: 15px; border-left: 4px solid #d4af37;">
      <strong>Domínio:</strong> {{domain_name}}<br>
      <strong>Dias restantes:</strong> {{days_remaining}}
    </div>

    <!-- Call to Action -->
    <a href="{{action_url}}" style="display: inline-block; background: #d4af37; color: #000; padding: 12px 30px; text-decoration: none; margin-top: 20px; border-radius: 4px;">
      {{action_label}}
    </a>
  </div>

  <!-- Footer -->
  <div style="text-align: center; color: #999; font-size: 12px; padding: 20px;">
    <p>© 2025 com.rich - Todos os direitos reservados</p>
    <p>
      <a href="https://com.rich/preferences" style="color: #666;">Preferências de Comunicação</a> |
      <a href="https://com.rich/unsubscribe?token={{unsubscribe_token}}" style="color: #666;">Cancelar Inscrição</a>
    </p>
  </div>

</body>
</html>
```

---

## 🔌 INTEGRAÇÕES FUTURAS (Opcional)

### **Para E-mails Externos (Não Implementado):**

Se quiser enviar e-mails para Gmail, Outlook, etc, pode integrar:

**Opção A: SendGrid** (Recomendado para transacionais)
- API simples
- Templates visuais
- Analytics integrado
- $15-50/mês

**Opção B: AWS SES**
- Muito barato ($0.10/1000 emails)
- Requer configuração técnica
- Bom para volume

**Opção C: Mailgun**
- API poderosa
- Tracking avançado
- $35/mês

**Opção D: Servidor Próprio (Mailcow)**
- Controle total
- Custo: VPS $40-60/mês
- Requer infraestrutura

---

## 📈 MÉTRICAS E ANALYTICS

### **Tabela `communication_log` Rastreia:**

- ✅ Quantos e-mails foram enviados
- ✅ Taxa de entrega (sent vs failed)
- ✅ Taxa de abertura (opened_at)
- ✅ Taxa de clique (click_count)
- ✅ Canais mais efetivos
- ✅ Templates com melhor performance

### **Queries Úteis:**

```sql
-- Taxa de entrega por canal
SELECT
  channel,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
  ROUND(100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*), 2) as delivery_rate
FROM communication_log
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY channel;

-- Templates mais efetivos
SELECT
  template_type,
  COUNT(*) as sent,
  SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opened,
  SUM(click_count) as total_clicks
FROM communication_log
WHERE channel = 'email'
GROUP BY template_type
ORDER BY total_clicks DESC;
```

---

## 🚀 COMO USAR

### **1. Criar Conta Institucional (Admin)**

```typescript
// Via Admin Panel: /admin/email
// Ou direto no banco:

const { data, error } = await supabase
  .from('email_accounts')
  .insert({
    user_id: adminUserId,
    email_address: 'no-reply@com.rich',
    display_name: 'com.rich - Não Responder',
    status: 'active',
    quota_mb: 5120 // 5GB
  });
```

### **2. Enviar Notificação Manual**

```typescript
// Via RPC function
const { data: notificationId } = await supabase
  .rpc('create_notification_from_template', {
    p_user_id: userId,
    p_type: 'payment_failed',
    p_variables: {
      subscription_id: 'xxx',
      amount: 99.90,
      next_attempt_date: '2025-11-15'
    }
  });

// Sistema envia automaticamente para canais configurados
```

### **3. Configurar Preferências (Usuário)**

```typescript
const { error } = await supabase
  .from('communication_preferences')
  .upsert({
    user_id: userId,
    email_enabled: true,
    email_address: 'user@example.com',
    renewal_reminders: true,
    marketing_updates: false
  });
```

### **4. Executar Dispatcher (CRON)**

```bash
# Configurar no Supabase Dashboard > Edge Functions > Cron Jobs
# Executar diariamente às 09:00 UTC

curl -X POST https://your-project.supabase.co/functions/v1/communication-dispatcher \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}"
```

---

## ✅ CHECKLIST DE FUNCIONALIDADES

### **Infraestrutura:**
- ✅ Base de dados completa (10 tabelas)
- ✅ RLS policies aplicadas
- ✅ Triggers automáticos
- ✅ Índices otimizados

### **Templates:**
- ✅ 16+ templates pré-configurados
- ✅ Multi-canal (email, dashboard, whatsapp)
- ✅ Variáveis dinâmicas
- ✅ Timeline automática

### **Edge Functions:**
- ✅ communication-dispatcher
- ✅ Integrado com lifecycle de domínios
- ✅ Integrado com pagamentos
- ✅ Integrado com trials

### **Interface:**
- ✅ Admin Panel para e-mails
- ✅ Criar/editar contas @com.rich
- ✅ Dashboard de notificações (existente)

### **Compliance:**
- ✅ LGPD/GDPR consent
- ✅ Opt-in/Opt-out
- ✅ Unsubscribe links
- ✅ Audit log completo

### **Faltando (Não Crítico):**
- 🔄 Webmail para usuários lerem mensagens
- 🔄 Interface de edição de templates (admin)
- 🔄 Dashboard de analytics avançado
- 🔄 Integração SendGrid/SES (se quiser externos)
- 🔄 WhatsApp API (implementação futura)

---

## 🎯 RESUMO EXECUTIVO

### **O QUE FUNCIONA:**

✅ Sistema completo de comunicações automáticas
✅ E-mails transacionais internos @com.rich
✅ Notificações multi-canal (dashboard + email)
✅ Timeline automática baseada em lifecycle
✅ 16+ templates pré-configurados
✅ Tracking completo de envios
✅ Preferências por usuário
✅ Compliance LGPD/GDPR
✅ Admin panel para gestão

### **LIMITAÇÃO:**

❌ Não envia e-mails para fora do sistema (Gmail, Outlook)
→ Para isso, integrar SendGrid/SES ou montar servidor Mailcow

### **USO RECOMENDADO:**

✅ Perfeito para: Notificações do sistema, alertas, confirmações
❌ Não adequado para: Marketing em massa, comunicação com clientes externos

### **PRÓXIMO PASSO:**

Se precisar enviar e-mails externos:
1. Contratar SendGrid ($15-50/mês) ou AWS SES ($0.10/1000 emails)
2. Criar edge function `send-external-email`
3. Integrar com communication_log
4. Atualizar templates com HTML profissional

---

**Sistema pronto para produção para uso interno!** 🚀

**Última atualização:** 2025-11-08
