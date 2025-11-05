# Sistema Completo de Lifecycle de Domínios .com.rich

## 📋 Visão Geral

Este documento detalha o sistema profissional de gerenciamento do ciclo de vida de domínios implementado na plataforma .com.rich, incluindo políticas de renovação, perda, recuperação e medidas antifraude.

## 🔄 Ciclo de Vida Completo (Do Zero ao Uso)

### 1. Busca e Reserva
- Usuário pesquisa `nome.com.rich`
- Sistema cria **reserva temporária de 15 minutos** para evitar "sniping"
- Reserva válida enquanto usuário completa cadastro e pagamento

### 2. Criação de Conta + KYC Leve
- Captura: nome, e-mail, telefone, país, documento
- **KYC obrigatório** para planos Elite/Supreme antes de ativar DNS
- Detecção de múltiplas contas suspeitas (mesmo cartão/IP/dispositivo)

### 3. Pagamento
- **Prime**: Trial de 14 dias (DNS limitado durante trial)
- **Elite/Supreme**: Pagamento mensal/sob consulta
- Domínio só ativa completamente após pagamento confirmado

### 4. Ativação
- Estados DNS: `parked` (trial) → `active` (pós-pagamento)
- **Bloqueio automático de 60 dias** para transferência após criação/renovação
- Notificações automáticas configuradas (D-14, D-7, D-3, D-1)

### 5. Uso Contínuo
- Cobrança recorrente mensal
- Painel mostra: dias restantes, status de pagamento, próxima cobrança
- Acesso a todos recursos do plano contratado

---

## 📅 Estados do Domínio e Cronologia

### Estado: ACTIVE
**Duração**: Indefinida (enquanto pagamentos em dia)
- Domínio totalmente operacional
- DNS ativo e configurável
- Acesso a todos recursos do plano
- Bloqueio de transferência por 60 dias após ativação/renovação

### Estado: GRACE (Período de Graça)
**Duração**: Dias 1-15 após falha de pagamento
- **Serviços continuam ativos**
- Sem taxa adicional para regularizar
- Notificações automáticas: D+1, D+5, D+10, D+14
- Banner no painel com countdown e botão de pagamento
- **Transição automática**: Dia 16 → REDEMPTION

### Estado: REDEMPTION (Resgate)
**Duração**: Dias 16-45 após falha de pagamento
- **Domínio suspenso** (DNS mostra página de aviso)
- Custo de recuperação: Mensalidade + Taxa de Resgate (USD $50)
- Painel mostra custo total e permite pagamento direto
- Notificações: D+16, D+30, D+40, D+44
- **Transição automática**: Dia 46 → REGISTRY_HOLD

### Estado: REGISTRY_HOLD (Proteção do Registro)
**Duração**: Dias 46-60 após falha de pagamento
- Domínio permanece suspenso
- **Não disponível para terceiros**
- Recuperação possível mediante contato com suporte
- Taxa especial de recuperação: USD $100 + mensalidade
- Notificações: D+46, D+55, D+59
- **Transição automática**: Dia 61 → AUCTION

### Estado: AUCTION (Leilão Interno)
**Duração**: Dias 61-75 após falha de pagamento
- Domínio disponível em leilão interno/lista de espera
- **Prioridade do dono original até Dia 65** (right of first refusal)
- Após D+65: Ofertas públicas abertas
- Dono original pode recuperar pagando todas taxas + lance vencedor
- Notificações: D+61, D+65 (fim da prioridade), D+70, D+74
- **Transição automática**: Dia 76 → PENDING_DELETE

### Estado: PENDING_DELETE (Exclusão Pendente)
**Duração**: Dias 76-80 após falha de pagamento
- Janela técnica final
- **Sem possibilidade de recuperação** pelo dono anterior
- Preparação para liberação
- Notificação final: D+76
- **Transição automática**: Dia 81 → RELEASED

### Estado: RELEASED (Liberado)
**Duração**: Permanente
- Domínio volta ao inventário geral
- Proprietário anterior removido
- Disponível para novo registro
- Pode se tornar **Premium** a critério do registro

### Estado: DISPUTE_HOLD (Em Disputa)
**Duração**: Indefinida (até resolução)
- Ativado por: Chargeback, fraude detectada, ordem judicial
- Domínio **suspenso imediatamente**
- Requer análise manual do suporte
- Não permite recuperação automática

### Estado: UNPAID_HOLD (Trial Expirado)
**Duração**: Até pagamento
- Trial Prime (14 dias) expirou sem pagamento
- Domínio em modo `parked` (landing page)
- Sem acesso a recursos premium
- **Não permite mudança de plano** até regularizar
- Pode regularizar a qualquer momento pagando primeira mensalidade

### Estado: PARKED (Estacionado)
**Duração**: Durante trial
- Domínio durante período de teste (14 dias)
- DNS limitado (apenas preview/landing page)
- Sem funcionalidades premium completas
- **Transição**: Pagamento → ACTIVE | Fim trial → UNPAID_HOLD

---

## 💰 Taxas de Recuperação

| Período | Taxa Base | Descrição |
|---------|-----------|-----------|
| **Grace (D1-15)** | $0 | Sem taxa adicional |
| **Redemption (D16-45)** | $50 | Taxa de resgate + mensalidade |
| **Registry Hold (D46-60)** | $100 | Taxa especial + mensalidade |
| **Auction (D61-75)** | Variável | Todas taxas + lance vencedor |
| **Após D76** | N/A | Sem recuperação possível |

---

## 🔒 Medidas Antifraude Implementadas

### 1. Trial Prime (14 dias)
- DNS **limitado** durante trial (modo `parked`)
- Sem acesso completo a recursos premium
- Se não pagar: `unpaid_hold` + bloqueio de mudança de plano
- Notificação 2 dias antes do fim do trial

### 2. Bloqueio por Pendência
- Fatura vencida = **bloqueio de qualquer troca de plano**
- Mensagem clara: "Regularize o pagamento para alterar plano"
- Botão direto para área de pagamentos

### 3. Período de Bloqueio (60 dias)
- **60 dias após pagamento** para qualquer troca de plano
- Vale para upgrade e downgrade
- Opcional: Permitir upgrade imediato cobrando diferença

### 4. Chargeback = Suspensão Imediata
- Status automático: `dispute_hold`
- Domínio suspenso até resolução
- Análise manual obrigatória

### 5. Velocity Limits (Limites de Velocidade)
- Máximo **2 domínios** para novos usuários nas primeiras 48h
- Detecção de padrões suspeitos (mesmo cartão/IP/device)
- Revisão manual para casos flagged

### 6. Device Fingerprinting
- Coleta: IP, User-Agent, resolução tela, timezone, plugins
- Detecta múltiplas contas do mesmo usuário
- Score de risco (0-100) para análise

### 7. Comissões de Afiliados
- Pagamento **30 dias após** confirmação de pagamento
- Sistema de "clawback" em caso de reembolso/chargeback
- Proteção contra fraude de afiliados

---

## 📧 Sistema de Notificações

### Pré-Expiração (Antes do Vencimento)
- **D-14**: "Seu domínio vence em 14 dias"
- **D-7**: "Apenas 1 semana para renovar"
- **D-3**: "Atenção: 3 dias para vencer"
- **D-1**: "URGENTE: Seu domínio vence amanhã"

### Pós-Expiração (Após Vencimento)
- **D+1**: "Período de Graça iniciado" (sem taxa até D+15)
- **D+10**: "5 dias restantes sem taxa adicional"
- **D+16**: "Período de Resgate - Taxa requerida"
- **D+30**: "15 dias para resgate com taxa"
- **D+45**: "ÚLTIMO DIA de resgate"
- **D+46**: "Período de Proteção - Contate suporte"
- **D+60**: "Pré-leilão - Última chance"
- **D+61**: "Leilão iniciado - Você tem prioridade até D+65"
- **D+65**: "Prioridade expirou - Leilão público"
- **D+75**: "Leilão encerrado - Exclusão iminente"
- **D+76**: "Exclusão pendente - Sem recuperação"

### Canais de Entrega
- **E-mail**: Todos os alertas
- **SMS**: Alertas críticos (D+1, D+16, D+45, D+61)
- **WhatsApp**: Premium (Elite/Supreme)
- **In-App**: Banner persistente no painel com countdown

---

## 🛠️ Implementação Técnica

### Database Schema

```sql
-- Campos adicionados à tabela domains
grace_until timestamptz            -- Fim período de graça (D+15)
redemption_until timestamptz       -- Fim período resgate (D+45)
registry_hold_until timestamptz    -- Fim proteção registro (D+60)
auction_until timestamptz          -- Fim leilão (D+75)
pending_delete_until timestamptz   -- Fim exclusão pendente (D+80)
locked_until timestamptz           -- Bloqueio transferência (60d)
last_paid_invoice_id uuid          -- Última fatura paga
recovery_fee_applied boolean       -- Taxa recuperação aplicada
late_fee_amount numeric(10,2)      -- Valor de multa
parking_template text              -- Template landing page
suspension_reason text             -- Motivo suspensão
original_owner_priority_until timestamptz  -- Prioridade no leilão
```

### Novas Tabelas

1. **domain_lifecycle_events**: Audit trail de transições
2. **domain_notifications**: Notificações agendadas
3. **fraud_detection_logs**: Logs de detecção de fraude
4. **recovery_fees_config**: Configuração de taxas por período

### Funções PostgreSQL

- `calculate_recovery_cost(domain_id)`: Calcula custo total de recuperação
- `transition_domain_state(domain_id, new_state, triggered_by, notes)`: Transição de estado
- `schedule_domain_notifications(domain_id, user_id)`: Agenda notificações

### Edge Function (Cron Job)

**`domain-lifecycle-cron`**: Execução diária
- Identifica domínios que precisam transicionar
- Executa transições automáticas
- Envia notificações pendentes
- Gera relatório de execução

**Agendamento recomendado**: Todo dia às 02:00 UTC

```bash
# Configurar no crontab do Supabase
0 2 * * * curl -X POST https://[project].supabase.co/functions/v1/domain-lifecycle-cron \
  -H "Authorization: Bearer [service-role-key]"
```

### Frontend Components

1. **DomainLifecycleTimeline**: Timeline visual no painel do usuário
2. **PlanChangeValidator**: Validação de mudança de plano
3. **PlanChangeBlockedMessage**: Mensagens de bloqueio
4. **RecoveryPaymentFlow**: Fluxo de pagamento de recuperação

---

## 📊 Métricas e Monitoramento

### KPIs Importantes

1. **Taxa de Recuperação**
   - % de domínios recuperados no Grace
   - % de domínios recuperados no Redemption
   - % perdidos definitivamente

2. **Receita de Recuperação**
   - Total arrecadado em taxas de resgate
   - Média de dias até recuperação

3. **Efetividade de Notificações**
   - Taxa de abertura por tipo de notificação
   - Taxa de conversão (notificação → pagamento)

4. **Detecção de Fraude**
   - Contas flagged vs confirmadas como fraude
   - Chargebacks prevenidos
   - Multi-accounts detectados

### Dashboards Recomendados

1. **Domain Lifecycle Overview**
   - Domínios por estado (gráfico pizza)
   - Timeline de transições (7/30/90 dias)
   - Domínios em risco de perda

2. **Revenue Recovery**
   - Receita de taxas de resgate
   - Comparativo: Grace vs Redemption vs Registry Hold
   - Projeção de perdas

3. **Fraud Detection**
   - Score de risco por usuário
   - Padrões suspeitos detectados
   - Ações tomadas (blocked/flagged/allowed)

---

## ✅ Checklist de Deploy

### Backend
- [x] Migration criada e testada
- [x] Funções PostgreSQL implementadas
- [x] RLS policies configuradas
- [x] Indexes de performance criados
- [ ] Cron job agendado no servidor
- [ ] Webhook handlers atualizados (PayPal)
- [ ] Integração com serviço de e-mail (SendGrid/Postmark)
- [ ] Integração com SMS (Twilio)

### Frontend
- [x] Componente DomainLifecycleTimeline
- [x] PlanChangeValidator integrado
- [x] FAQ atualizado com políticas
- [ ] Página de recuperação de domínio
- [ ] Banner de countdown no painel
- [ ] Landing page para domínios suspensos
- [ ] Testes de UI em todos estados

### Documentação
- [x] FAQ com ciclo de vida completo
- [x] Documentação técnica (este arquivo)
- [ ] Termos de Uso atualizados
- [ ] Política de Privacidade revisada
- [ ] Guia de usuário: "Como recuperar domínio"

### Operações
- [ ] Runbook para suporte: Recuperação manual
- [ ] Playbook para disputa de chargeback
- [ ] Processo de revisão manual de fraude
- [ ] SLA definido para cada tipo de ticket

---

## 🚀 Próximos Passos

### Fase 1: MVP (Concluído)
- ✅ States e transições básicas
- ✅ Cálculo de taxas
- ✅ Timeline visual
- ✅ FAQ atualizado

### Fase 2: Automação (Em Progresso)
- [ ] Cron job em produção
- [ ] Integração e-mail/SMS
- [ ] Webhooks de pagamento atualizados
- [ ] Testes E2E do ciclo completo

### Fase 3: Otimização (Futuro)
- [ ] Sistema de leilão real
- [ ] IA para detecção de fraude
- [ ] Dashboard analytics
- [ ] API pública para consulta de status

---

## 📞 Contato e Suporte

Para questões sobre este sistema:
- **Técnico**: development@com.rich
- **Produto**: product@com.rich
- **Suporte**: support@com.rich

---

**Documento gerado em**: 2025-11-08
**Versão**: 1.0
**Responsável**: Sistema Bolt.new IA
