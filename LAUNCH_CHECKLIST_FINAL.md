# 🚀 CHECKLIST COMPLETO PARA LANÇAMENTO - .COM.RICH

Data de criação: 2025-11-07
Status: **EM PREPARAÇÃO PARA BETA**

---

## 📊 STATUS GERAL DO PROJETO

### ✅ **IMPLEMENTADO E FUNCIONANDO** (Pronto para produção)

#### Sistema Core
- ✅ Autenticação de usuários (Supabase Auth)
- ✅ Sistema de perfis personalizáveis
- ✅ Editor de links com estilos customizados
- ✅ Sistema de domínios (.com.rich)
- ✅ Páginas públicas de perfil
- ✅ Sistema de assinatura (3 planos: Prime, Elite, Supreme)
- ✅ Integração PayPal (pagamentos e assinaturas)
- ✅ Sistema de trial gratuito (14 dias)
- ✅ Limites de conteúdo por plano
- ✅ Sistema de domínios premium
- ✅ Marketplace de domínios
- ✅ DNS Management
- ✅ Sistema de transferência de domínios

#### Sistemas de Segurança
- ✅ Verificação e moderação de links maliciosos (NOVO)
- ✅ Link Security com Google Safe Browsing API (NOVO)
- ✅ Verificação periódica automática (NOVO)
- ✅ Bloqueio automático de links maliciosos (NOVO)
- ✅ Sistema de revisão manual (NOVO)
- ✅ Sistema de marcas protegidas (Global Brands)
- ✅ Sistema de palavras reservadas
- ✅ Proteção de marca "President" e "Club"
- ✅ Sistema de 2FA (Two-Factor Authentication)
- ✅ Rate limiting e proteção anti-abuse
- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ Auditoria de ações administrativas

#### Sistema Social
- ✅ Feed social com posts
- ✅ Sistema de likes e comentários
- ✅ Sistema de followers
- ✅ Posts salvos
- ✅ Moderação de conteúdo social
- ✅ Reportar conteúdo impróprio

#### Sistema de E-commerce
- ✅ Loja virtual (Store Manager)
- ✅ Gerenciamento de produtos
- ✅ Controle de visibilidade de loja
- ✅ Botão de loja em perfis

#### Sistema de Afiliados/Revendedores
- ✅ Programa de afiliados funcional
- ✅ Dashboard de afiliados
- ✅ Sistema de comissões (25% e 50%)
- ✅ Tracking de referências
- ✅ ROI Calculator
- ✅ Termos de afiliados

#### Painel Administrativo
- ✅ Dashboard admin completo
- ✅ Gerenciamento de usuários
- ✅ Gerenciamento de pedidos
- ✅ Gerenciamento de afiliados
- ✅ Gerenciamento de domínios premium
- ✅ Moderação de links maliciosos (NOVO)
- ✅ Moderação de conteúdo social
- ✅ Sistema de logs
- ✅ Chatbot management
- ✅ Payment reconciliation
- ✅ Configurações gerais

#### Funcionalidades Premium
- ✅ Templates de tema pré-configurados
- ✅ Custom CSS editor
- ✅ Google Fonts selector
- ✅ Background editor (imagem/vídeo)
- ✅ QR Code generator
- ✅ Analytics dashboard
- ✅ Link scheduling (agendamento)
- ✅ Password protection em links
- ✅ Profile display modes

#### Documentação
- ✅ README completo
- ✅ Guias de segurança
- ✅ Documentação de APIs
- ✅ Sistema de suporte com artigos
- ✅ FAQ
- ✅ Políticas e termos
- ✅ Guia de sistema de links maliciosos (NOVO)

---

## 🔧 **PENDENTE - CONFIGURAÇÃO E DEPLOY**

### 🔴 **CRÍTICO** (Obrigatório antes do lançamento)

#### 1. Configurar Google Safe Browsing API (NOVO)
**Prioridade:** 🔴 CRÍTICA
**Tempo estimado:** 30 minutos
**Responsável:** DevOps/Backend

**Passos:**
1. Acessar [Google Cloud Console](https://console.cloud.google.com/)
2. Criar projeto ou usar existente
3. Ativar **Safe Browsing API**
4. Criar API Key
5. Adicionar ao Supabase:
   ```bash
   supabase secrets set GOOGLE_SAFE_BROWSING_API_KEY=your-key-here
   ```
6. Testar edge function `verify-link-security`
7. Documentar key em vault/documentação segura

**Validação:**
- [ ] API Key criada e funcionando
- [ ] Testado verificação de link malicioso conhecido
- [ ] Testado verificação de link seguro
- [ ] Edge function retornando resultados corretos

---

#### 2. Deploy Edge Functions
**Prioridade:** 🔴 CRÍTICA
**Tempo estimado:** 1 hora
**Responsável:** DevOps

**Edge Functions a deployar:**

```bash
# Verificação de links (NOVO)
supabase functions deploy verify-link-security

# Verificação periódica (NOVO)
supabase functions deploy periodic-link-security-check

# Funções existentes
supabase functions deploy paypal-create-order
supabase functions deploy paypal-capture
supabase functions deploy paypal-create-subscription
supabase functions deploy paypal-webhook
supabase functions deploy domain-lifecycle-cron
supabase functions deploy trial-expiration-handler
supabase functions deploy communication-dispatcher
supabase functions deploy payment-reconciliation
supabase functions deploy premium-domain-lifecycle
supabase functions deploy auto-create-profile
supabase functions deploy ensure-customer
supabase functions deploy handle-plan-change
supabase functions deploy delete-account
supabase functions deploy security-monitor
```

**Validação:**
- [ ] Todas as functions deployadas sem erro
- [ ] Testar cada function manualmente
- [ ] Verificar logs no Supabase Dashboard
- [ ] Confirmar que secrets estão configurados

---

#### 3. Configurar Cron Jobs (NOVO + Existentes)
**Prioridade:** 🔴 CRÍTICA
**Tempo estimado:** 45 minutos
**Responsável:** DevOps

**Cron Jobs necessários:**

| Function | Schedule | Descrição |
|----------|----------|-----------|
| `periodic-link-security-check` | `0 2 * * *` | Verifica links 1x/dia às 2h (NOVO) |
| `domain-lifecycle-cron` | `0 1 * * *` | Lifecycle de domínios às 1h |
| `trial-expiration-handler` | `0 0 * * *` | Expira trials à meia-noite |
| `premium-domain-lifecycle` | `0 3 * * *` | Lifecycle premium às 3h |
| `payment-reconciliation` | `0 */6 * * *` | Reconciliação a cada 6h |

**Configurar no Supabase Dashboard:**
1. Edge Functions > [nome da function]
2. Enable Cron Schedule
3. Inserir cron expression
4. Configurar `CRON_SECRET` se necessário
5. Salvar e testar

**Validação:**
- [ ] Todos os cron jobs configurados
- [ ] Testado execução manual de cada um
- [ ] Verificar logs de execução
- [ ] Confirmar horários adequados (timezone)

---

#### 4. Configurar PayPal Production
**Prioridade:** 🔴 CRÍTICA
**Tempo estimado:** 2 horas
**Responsável:** Finance + DevOps

**Passos:**

1. **PayPal Business Account:**
   - [ ] Conta business criada e verificada
   - [ ] Documentos empresariais aprovados
   - [ ] Conta bancária vinculada

2. **Criar Planos de Assinatura no PayPal:**
   ```
   Plan IDs necessários:
   - Prime ($50/mês)
   - Elite ($70/mês)
   - Supreme (By Request - se aplicável)
   ```
   - [ ] Planos criados no PayPal Dashboard
   - [ ] Copiar Plan IDs

3. **Atualizar Database:**
   ```sql
   UPDATE subscription_plans
   SET paypal_plan_id = 'PLAN-XXX'
   WHERE plan_type = 'prime';

   UPDATE subscription_plans
   SET paypal_plan_id = 'PLAN-YYY'
   WHERE plan_type = 'elite';
   ```

4. **Configurar Webhooks PayPal:**
   - URL: `https://[seu-projeto].supabase.co/functions/v1/paypal-webhook`
   - Events:
     - `PAYMENT.SALE.COMPLETED`
     - `BILLING.SUBSCRIPTION.CREATED`
     - `BILLING.SUBSCRIPTION.ACTIVATED`
     - `BILLING.SUBSCRIPTION.CANCELLED`
     - `BILLING.SUBSCRIPTION.SUSPENDED`
     - `BILLING.SUBSCRIPTION.PAYMENT.FAILED`

5. **Configurar Secrets:**
   ```bash
   supabase secrets set PAYPAL_CLIENT_ID=production-client-id
   supabase secrets set PAYPAL_CLIENT_SECRET=production-secret
   supabase secrets set PAYPAL_WEBHOOK_ID=webhook-id
   supabase secrets set PAYPAL_MODE=live
   ```

**Validação:**
- [ ] Teste de compra real (valor mínimo)
- [ ] Webhook recebido e processado
- [ ] Assinatura criada no DB
- [ ] Upgrade de plano funcionando
- [ ] Cancelamento funcionando

---

#### 5. Configurar DNS e Domínio Principal
**Prioridade:** 🔴 CRÍTICA
**Tempo estimado:** 2 horas
**Responsável:** DevOps

**Domínio:** `com.rich` (ou domínio escolhido)

1. **Registrar Domínio:**
   - [ ] Domínio registrado
   - [ ] Auto-renewal ativado
   - [ ] Whois privacy ativado

2. **Configurar DNS:**
   ```
   A Record:
   @ → [IP do servidor/CDN]

   CNAME Records:
   www → seu-dominio.com
   * → seu-dominio.com (wildcard para subdomínios)

   TXT Records:
   @ → [SPF record para emails]
   @ → [DKIM se aplicável]
   ```

3. **SSL/TLS:**
   - [ ] Certificado SSL configurado
   - [ ] Redirect HTTP → HTTPS
   - [ ] Certificado wildcard para subdomínios

4. **CDN (Cloudflare/Similar):**
   - [ ] Configurado e testado
   - [ ] Cache rules otimizadas
   - [ ] Security rules ativas

**Validação:**
- [ ] https://com.rich acessível
- [ ] https://www.com.rich acessível
- [ ] Subdomínios funcionando (ex: teste.com.rich)
- [ ] SSL válido e confiável
- [ ] DNS propagado globalmente

---

#### 6. Configurar Email/SMTP
**Prioridade:** 🔴 CRÍTICA
**Tempo estimado:** 2 horas
**Responsável:** DevOps

**Para emails transacionais:**

**Opção A: SendGrid**
```bash
supabase secrets set SENDGRID_API_KEY=your-key
```

**Opção B: AWS SES**
```bash
supabase secrets set AWS_SES_REGION=us-east-1
supabase secrets set AWS_SES_ACCESS_KEY=your-key
supabase secrets set AWS_SES_SECRET_KEY=your-secret
```

**Opção C: Postmark**
```bash
supabase secrets set POSTMARK_SERVER_TOKEN=your-token
```

**Templates de Email necessários:**
- [ ] Welcome email
- [ ] Email verification
- [ ] Password reset
- [ ] Trial expiration warning (3 dias antes)
- [ ] Trial expired
- [ ] Payment received
- [ ] Payment failed
- [ ] Subscription cancelled
- [ ] Link blocked notification (NOVO)
- [ ] Link review requested (admin) (NOVO)

**Configurar em Supabase:**
- Supabase Dashboard > Authentication > Email Templates
- Customizar cada template

**Validação:**
- [ ] Envio de email de teste
- [ ] Templates renderizando corretamente
- [ ] Links nos emails funcionando
- [ ] Emails não indo para spam
- [ ] SPF/DKIM configurados

---

#### 7. Configurar Cloudflare Turnstile (Captcha)
**Prioridade:** 🟡 ALTA
**Tempo estimado:** 1 hora
**Responsável:** DevOps

**Passos:**
1. Criar conta Cloudflare Turnstile
2. Criar site widget
3. Copiar Site Key e Secret Key
4. Configurar secrets:
   ```bash
   supabase secrets set TURNSTILE_SECRET_KEY=your-secret
   ```
5. Adicionar no frontend (.env):
   ```
   VITE_TURNSTILE_SITE_KEY=your-site-key
   ```

**Onde usar:**
- [ ] Formulário de registro
- [ ] Formulário de login (após 3 tentativas falhas)
- [ ] Formulário de contato
- [ ] Request password reset

**Validação:**
- [ ] Captcha aparecendo nos formulários
- [ ] Validação no backend funcionando
- [ ] Não bloqueando usuários legítimos

---

#### 8. Configurar Monitoramento e Alertas
**Prioridade:** 🟡 ALTA
**Tempo estimado:** 3 horas
**Responsável:** DevOps

**Opção A: Sentry (Recomendado)**
```bash
npm install @sentry/react @sentry/vite-plugin

# Configurar
supabase secrets set SENTRY_DSN=your-dsn
```

**Opção B: LogRocket**
**Opção C: Datadog**

**Métricas a monitorar:**
- [ ] Error rate (frontend e backend)
- [ ] API response times
- [ ] Database query performance
- [ ] Edge function execution time
- [ ] Failed payments
- [ ] Failed email sends
- [ ] Links bloqueados (alertar se >100/dia) (NOVO)
- [ ] Verificações de segurança falhando (NOVO)

**Alertas configurados para:**
- [ ] Error rate > 1%
- [ ] API latency > 3s
- [ ] Database CPU > 80%
- [ ] Disk usage > 85%
- [ ] Failed payments > 5/hour
- [ ] Links maliciosos detectados (NOVO)

**Validação:**
- [ ] Dashboard de monitoramento acessível
- [ ] Teste de alerta enviando erro proposital
- [ ] Alertas chegando no canal correto (email/Slack)

---

#### 9. Backup e Disaster Recovery
**Prioridade:** 🟡 ALTA
**Tempo estimado:** 2 horas
**Responsável:** DevOps

**Backups do Supabase:**
- [ ] Point-in-time recovery habilitado
- [ ] Backups automáticos diários configurados
- [ ] Retention: mínimo 30 dias
- [ ] Testar restore de backup

**Backups de Assets (imagens, vídeos):**
- [ ] S3/Storage bucket com versioning
- [ ] Replicação cross-region se possível
- [ ] Lifecycle policy para arquivos antigos

**Documentar:**
- [ ] Procedimento de restore
- [ ] Contatos de emergência
- [ ] RPO (Recovery Point Objective): < 1 hora
- [ ] RTO (Recovery Time Objective): < 4 horas

**Validação:**
- [ ] Backup manual executado
- [ ] Restore testado em ambiente de teste
- [ ] Documentação validada por outro dev

---

#### 10. Configurar Analytics
**Prioridade:** 🟡 ALTA
**Tempo estimado:** 2 horas
**Responsável:** Marketing + DevOps

**Google Analytics 4:**
```html
<!-- Adicionar no index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

**Eventos customizados a trackear:**
- [ ] User registration
- [ ] Trial started
- [ ] Subscription purchased
- [ ] Link created
- [ ] Link clicked (público)
- [ ] Domain purchased
- [ ] Link blocked (NOVO)
- [ ] Review requested (NOVO)
- [ ] Store product viewed
- [ ] Social post created

**Configurar Goals:**
- [ ] Trial → Paid conversion
- [ ] Registration → Profile creation
- [ ] Profile view → Link click

**Alternativa: Plausible/Fathom (Privacy-friendly)**

**Validação:**
- [ ] Events sendo enviados
- [ ] Dashboard mostrando dados
- [ ] Conversões rastreando corretamente

---

### 🟡 **IMPORTANTE** (Recomendado antes do lançamento)

#### 11. Revisar e Atualizar Políticas Legais
**Prioridade:** 🟡 IMPORTANTE
**Tempo estimado:** 4 horas
**Responsável:** Legal/Compliance

**Documentos a revisar:**
- [ ] Termos de Serviço (`/terms`)
- [ ] Política de Privacidade (`/privacy`)
- [ ] Política de Cookies (`/cookies`)
- [ ] Política de Reembolso (`/refund-policy`)
- [ ] DMCA/Copyright Notice (`/copyright-notice`)
- [ ] Acceptable Use Policy (`/acceptable-use`)
- [ ] Termos de Afiliados (`/affiliate-terms`)
- [ ] Termos de Loja (`/store-terms`)
- [ ] Termos Sociais (`/social-terms`)
- [ ] Política de Links Maliciosos (NOVO)

**Adicionar/Verificar:**
- [ ] Informações da empresa (CNPJ, endereço, etc.)
- [ ] Contato do DPO (Data Protection Officer)
- [ ] Processo de GDPR/LGPD compliance
- [ ] Como usuário pode exportar dados
- [ ] Como usuário pode deletar conta
- [ ] Processo de bloqueio de links (NOVO)

**Validação:**
- [ ] Revisão por advogado especializado
- [ ] Links para políticas no footer
- [ ] Aceite obrigatório no registro
- [ ] Versionamento de políticas

---

#### 12. Teste de Carga e Performance
**Prioridade:** 🟡 IMPORTANTE
**Tempo estimado:** 8 horas
**Responsável:** QA + DevOps

**Ferramentas:**
- k6
- Apache JMeter
- Artillery

**Cenários de teste:**
- [ ] 100 usuários simultâneos navegando
- [ ] 50 registros simultâneos
- [ ] 100 verificações de links simultâneas (NOVO)
- [ ] 20 checkouts simultâneos
- [ ] 1000 page views/minuto

**Métricas alvo:**
- [ ] Response time < 500ms (p95)
- [ ] Error rate < 0.1%
- [ ] Database CPU < 70% sob carga
- [ ] Edge functions < 2s execution time

**Otimizações se necessário:**
- [ ] Add database indexes
- [ ] Implement caching
- [ ] CDN configuration
- [ ] Query optimization

**Validação:**
- [ ] Sistema estável sob carga
- [ ] Sem memory leaks
- [ ] Sem degradação após 1h de carga

---

#### 13. Security Audit
**Prioridade:** 🟡 IMPORTANTE
**Tempo estimado:** 6 horas
**Responsável:** Security Team/DevOps

**Checklist de segurança:**

**Frontend:**
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Content Security Policy headers
- [ ] No secrets no código
- [ ] Dependencies atualizadas

**Backend:**
- [ ] SQL injection protection (via Supabase)
- [ ] Rate limiting ativo
- [ ] Input validation
- [ ] Output sanitization
- [ ] Proper error handling (não expor detalhes)

**Authentication:**
- [ ] Password strength requirements
- [ ] 2FA disponível e testado
- [ ] Session timeout configurado
- [ ] Refresh token rotation
- [ ] Account lockout após tentativas falhas

**RLS (Row Level Security):**
- [ ] Todas as tabelas com RLS habilitado
- [ ] Policies testadas
- [ ] Sem bypass possível
- [ ] Admin policies específicas

**APIs:**
- [ ] CORS configurado corretamente
- [ ] API keys não expostas
- [ ] Webhook signatures validadas
- [ ] Rate limiting por endpoint

**Verificação de Links (NOVO):**
- [ ] Google Safe Browsing API protegida
- [ ] Timeout em verificações (evitar DOS)
- [ ] Cache de verificações
- [ ] Limit de verificações por IP

**Validação:**
- [ ] Scan com OWASP ZAP
- [ ] Penetration testing básico
- [ ] Dependency vulnerabilities check
- [ ] SSL Labs A+ rating

---

#### 14. Preparar Conteúdo de Lançamento
**Prioridade:** 🟡 IMPORTANTE
**Tempo estimado:** 8 horas
**Responsável:** Marketing + Content

**Home Page:**
- [ ] Hero section com CTA claro
- [ ] Feature highlights
- [ ] Social proof (quando disponível)
- [ ] Pricing claro
- [ ] FAQ
- [ ] Depoimentos (se houver)

**Landing Pages:**
- [ ] Premium domains landing
- [ ] Affiliate program landing
- [ ] For Business (Supreme plan)

**Blog Posts preparados:**
- [ ] "Como criar seu perfil digital em 5 minutos"
- [ ] "Por que você precisa de um domínio .com.rich"
- [ ] "Segurança: Como protegemos seus links" (NOVO)
- [ ] "Programa de afiliados: Ganhe 50%"

**Tutoriais em Vídeo:**
- [ ] Getting started
- [ ] Customizar perfil
- [ ] Criar loja virtual
- [ ] Entender status de segurança (NOVO)

**Emails de Onboarding (sequência):**
- [ ] Day 0: Welcome + começar
- [ ] Day 2: Dica de customização
- [ ] Day 5: Explore recursos premium
- [ ] Day 10: Últimos dias de trial
- [ ] Day 13: Último lembrete trial

**Validação:**
- [ ] Conteúdo revisado (gramática/ortografia)
- [ ] CTAs testados
- [ ] Links funcionando
- [ ] Imagens otimizadas

---

#### 15. Configurar Suporte ao Cliente
**Prioridade:** 🟡 IMPORTANTE
**Tempo estimado:** 4 horas
**Responsável:** Support Team

**Sistema de Tickets:**
- [ ] Integração funcionando (`/support`)
- [ ] Email notifications configurados
- [ ] SLA definido (resposta em < 24h)
- [ ] Macros/respostas prontas criadas

**Base de Conhecimento:**
- [ ] Artigos de FAQ populados
- [ ] Tutoriais step-by-step
- [ ] Troubleshooting guides
- [ ] Artigo: "Meu link foi bloqueado, o que fazer?" (NOVO)
- [ ] Vídeos tutoriais embedados

**Canais de Suporte:**
- [ ] Email support@ configurado
- [ ] Chat ao vivo (se aplicável)
- [ ] WhatsApp Business (opcional)
- [ ] Horário de atendimento definido

**Chatbot (Admin):**
- [ ] Treinado com FAQs
- [ ] Respostas automáticas configuradas
- [ ] Escalation para humano funcionando

**Validação:**
- [ ] Teste de envio de ticket
- [ ] Teste de resposta do chatbot
- [ ] Templates de email configurados
- [ ] Base de conhecimento pesquisável

---

### 🔵 **DESEJÁVEL** (Pós-lançamento imediato)

#### 16. Melhorias de UX Identificadas
**Prioridade:** 🔵 DESEJÁVEL
**Tempo estimado:** variável

- [ ] Loading skeletons em todas as páginas
- [ ] Animações de transição suaves
- [ ] Dark mode (sistema ou toggle)
- [ ] Atalhos de teclado (power users)
- [ ] Drag & drop para reordenar links (já existe, testar)
- [ ] Preview em tempo real no editor
- [ ] Undo/Redo em editores
- [ ] Copy link ao clicar (one-click)

---

#### 17. Otimizações de Performance
**Prioridade:** 🔵 DESEJÁVEL
**Tempo estimado:** 8 horas

- [ ] Code splitting (route-based)
- [ ] Lazy loading de componentes pesados
- [ ] Image optimization (WebP, lazy load)
- [ ] Bundle size reduction
- [ ] Service Worker para cache
- [ ] Pre-fetch de rotas comuns
- [ ] Database query optimization
- [ ] Add redis cache layer (se necessário)

---

#### 18. Features Futuras (Roadmap)
**Prioridade:** 🔵 FUTURO
**Planejamento:** Post-MVP

**V2.0 Features:**
- [ ] Integração com mais providers de segurança (VirusTotal, PhishTank) (NOVO)
- [ ] Machine Learning para detecção de phishing (NOVO)
- [ ] Whitelist/Blacklist de domínios (NOVO)
- [ ] Notificações push
- [ ] Mobile app (React Native)
- [ ] Integrações (Zapier, Make)
- [ ] A/B testing nativo
- [ ] Advanced analytics (heatmaps, funnels)
- [ ] Team collaboration features
- [ ] White-label para Supreme
- [ ] API pública documentada
- [ ] Webhooks para desenvolvedores

**V3.0 Features:**
- [ ] Marketplace de templates
- [ ] Plugin system
- [ ] Multi-language support
- [ ] Blockchain verification (NFT profiles)
- [ ] AI-powered design suggestions

---

## 📝 **CHECKLIST DE DEPLOY FINAL**

### Dia D-7 (Uma semana antes)

- [ ] Todos os itens CRÍTICOS (🔴) completados
- [ ] Teste de ponta a ponta completo
- [ ] Backup full do database
- [ ] Staging environment = produção
- [ ] Performance test aprovado
- [ ] Security audit aprovado

### Dia D-3 (Três dias antes)

- [ ] Todos os itens IMPORTANTES (🟡) completados
- [ ] Conteúdo de marketing aprovado
- [ ] Email templates testados
- [ ] Suporte preparado e treinado
- [ ] Monitoramento configurado
- [ ] Runbook de incidentes pronto

### Dia D-1 (Um dia antes)

- [ ] Code freeze (sem novos commits)
- [ ] Deploy em staging
- [ ] Smoke tests em staging
- [ ] DNS propagado (se mudou)
- [ ] Team briefing sobre lançamento
- [ ] Plano de rollback documentado

### Dia D (Lançamento)

**Manhã (antes do horário de pico):**
- [ ] ✅ Deploy para produção
- [ ] ✅ Verificar todas as pages carregando
- [ ] ✅ Smoke test: registro → pagamento → profile
- [ ] ✅ Verificar edge functions ativas
- [ ] ✅ Verificar cron jobs rodando
- [ ] ✅ Monitoramento sem alertas
- [ ] ✅ Testar verificação de link malicioso (NOVO)

**Tarde (monitoramento ativo):**
- [ ] Anunciar em redes sociais
- [ ] Enviar email para early adopters
- [ ] Monitorar dashboards ativamente
- [ ] Responder dúvidas rapidamente
- [ ] Tracking de conversões

**Noite:**
- [ ] Review das métricas do dia
- [ ] Identificar bugs urgentes
- [ ] Planejar hotfixes se necessário
- [ ] Backup do estado atual

### Semana 1 Pós-Lançamento

**Daily:**
- [ ] Review de métricas (conversão, engagement, churn)
- [ ] Check de error logs
- [ ] Monitoring de performance
- [ ] Suporte aos primeiros usuários
- [ ] Coletar feedback

**Ajustes rápidos:**
- [ ] Hotfix de bugs críticos
- [ ] Ajustes de copy/UX baseado em feedback
- [ ] Fine-tuning de emails/notifications
- [ ] Otimizações de performance se necessário

---

## 🎯 **CRITÉRIOS DE SUCESSO - SEMANA 1**

### Métricas Técnicas
- [ ] Uptime > 99.5%
- [ ] Error rate < 0.5%
- [ ] API response time < 500ms (p95)
- [ ] Zero critical bugs
- [ ] Zero data loss incidents
- [ ] Verificações de links funcionando 100% (NOVO)

### Métricas de Negócio
- [ ] X registros (definir meta)
- [ ] Y% trial → paid conversion
- [ ] Z NPS score > 50
- [ ] Feedback positivo predominante
- [ ] Nenhuma reclamação grave não resolvida

---

## 📞 **CONTATOS E RESPONSABILIDADES**

### Equipe Core

| Papel | Nome | Contato | Responsabilidade |
|-------|------|---------|------------------|
| Tech Lead | - | - | Decisões técnicas, arquitetura |
| DevOps | - | - | Deploy, infra, monitoring |
| Backend | - | - | APIs, database, edge functions |
| Frontend | - | - | UI/UX, React, performance |
| QA | - | - | Testes, quality assurance |
| Security | - | - | Security audit, compliance |
| Product | - | - | Features, roadmap, priorização |
| Marketing | - | - | Conteúdo, lançamento, growth |
| Support | - | - | Atendimento, tickets, FAQ |

### On-Call (Semana de Lançamento)

| Dia | Pessoa | Backup |
|-----|--------|--------|
| Segunda | - | - |
| Terça | - | - |
| Quarta | - | - |
| Quinta | - | - |
| Sexta | - | - |
| Fim de semana | - | - |

---

## 🚨 **PLANO DE ROLLBACK**

### Cenário: Deploy com problema crítico

1. **Identificação (T+0):**
   - Alerta de monitoring ou report de usuário
   - Validar severidade: crítico vs. não-crítico

2. **Decisão (T+5min):**
   - Tech Lead decide: rollback vs. hotfix
   - Se uptime < 98% → rollback imediato

3. **Rollback (T+10min):**
   ```bash
   # Frontend: revert para última versão estável
   # Supabase: restore database se necessário
   # Edge functions: redeploy versão anterior
   ```

4. **Comunicação (T+15min):**
   - Status page atualizado
   - Email para usuários afetados
   - Social media update

5. **Post-Mortem (T+24h):**
   - Documento de análise
   - Root cause
   - Action items
   - Prevenir recorrência

---

## 📊 **DASHBOARD DE ACOMPANHAMENTO**

### Links Úteis (a preencher no lançamento)

- **Produção:** https://com.rich
- **Admin:** https://com.rich/admin
- **Staging:** https://staging.com.rich
- **Supabase Dashboard:** https://app.supabase.com/project/[id]
- **Analytics:** https://analytics.google.com/...
- **Monitoring:** https://sentry.io/...
- **Status Page:** https://status.com.rich
- **Support:** https://com.rich/support

---

## ✅ **RESUMO EXECUTIVO**

### **Sistema de Moderação de Links (NOVO)** ✅

**Status:** ✅ **IMPLEMENTADO**
**Pendente:** 🔴 Configurar Google Safe Browsing API
**Estimativa:** 30min de configuração

**O que foi feito:**
- ✅ Database schema completo
- ✅ Edge functions criadas
- ✅ Frontend com indicadores visuais
- ✅ Painel admin completo
- ✅ Verificação automática
- ✅ Verificação periódica (cron)
- ✅ Bloqueio automático
- ✅ Revisão manual
- ✅ Histórico completo
- ✅ Exportação CSV
- ✅ Documentação completa

**Para lançar:**
1. Configurar Google Safe Browsing API Key
2. Deploy edge functions
3. Configurar cron job
4. Testar com link malicioso conhecido
5. ✅ PRONTO!

---

### Prioridades Imediatas (Antes do Lançamento)

#### 🔴 CRÍTICO (Não lança sem isso)
1. ✅ Sistema de moderação de links (IMPLEMENTADO)
2. 🔴 Google Safe Browsing API (30min)
3. 🔴 Deploy edge functions (1h)
4. 🔴 Configurar cron jobs (45min)
5. 🔴 PayPal production (2h)
6. 🔴 DNS e domínio (2h)
7. 🔴 Email/SMTP (2h)

**Total estimado:** ~8 horas de trabalho

#### 🟡 IMPORTANTE (Fortemente recomendado)
8. 🟡 Turnstile/Captcha (1h)
9. 🟡 Monitoring/Sentry (3h)
10. 🟡 Backups (2h)
11. 🟡 Analytics (2h)
12. 🟡 Políticas legais (4h)
13. 🟡 Load testing (8h)
14. 🟡 Security audit (6h)
15. 🟡 Conteúdo marketing (8h)
16. 🟡 Suporte (4h)

**Total estimado:** ~38 horas de trabalho

---

### Timeline Sugerido

**Semana 1 (Configuração Crítica):**
- Dias 1-2: Itens 2-7 (críticos)
- Dias 3-4: Itens 8-12 (importantes)
- Dia 5: Buffer/ajustes

**Semana 2 (Testes e Preparação):**
- Dias 1-2: Itens 13-14 (testes)
- Dias 3-4: Itens 15-16 (conteúdo)
- Dia 5: Review final

**Semana 3 (Lançamento):**
- Segunda: Prep final
- Terça: LANÇAMENTO
- Resto: Monitoring + hotfixes

---

## 🎉 **VOCÊ ESTÁ PRONTO PARA LANÇAR QUANDO:**

- ✅ Todos os itens 🔴 CRÍTICOS completados
- ✅ 80%+ dos itens 🟡 IMPORTANTES completados
- ✅ Teste de ponta a ponta 100% OK
- ✅ Team alinhado e preparado
- ✅ Plano de rollback documentado
- ✅ Monitoring ativo e alertas configurados
- ✅ Suporte preparado para primeiros usuários

---

**Boa sorte no lançamento! 🚀🎊**

---

_Última atualização: 2025-11-07_
_Próxima revisão: Antes do lançamento_
