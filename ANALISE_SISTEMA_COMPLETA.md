# Análise Profunda do Sistema com.rich

## Data da Análise
2025-10-29

## Resumo Executivo

Sistema complexo de gestão de domínios premium (.com.rich), perfis de usuário, marketplace, e rede social integrada. O sistema possui:

- **126 migrations** de banco de dados
- **21 Edge Functions** do Supabase
- **66 páginas** React/TypeScript
- **42 componentes** reutilizáveis
- **~85 tabelas** no banco de dados

---

## 1. ARQUITETURA GERAL

### 1.1 Stack Tecnológico
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage
- **Pagamentos**: PayPal
- **Registrar de Domínios**: Dynadot (via API)
- **Segurança**: Cloudflare Turnstile (planejado)

### 1.2 Módulos Principais

1. **Gestão de Domínios**
2. **Sistema de Assinaturas**
3. **Marketplace de Domínios Premium**
4. **Perfis de Usuário Customizáveis**
5. **Rede Social**
6. **Sistema de Afiliados**
7. **Suporte e Tickets**
8. **Admin Dashboard**

---

## 2. ANÁLISE DO BANCO DE DADOS

### 2.1 Tabelas Core (Fundamentais)

#### **Usuários e Autenticação**
- `customers` - Clientes vinculados a auth.users
- `subscriptions` - Assinaturas ativas
- `subscription_plans` - Planos disponíveis (Basic, Standard, Elite, Supreme)
- `user_profiles` - Perfis públicos dos usuários
- `recovery_codes` - Códigos de recuperação 2FA

#### **Domínios**
- `domains` - Domínios registrados
- `dns_records` - Registros DNS
- `domain_catalog` - Catálogo de domínios disponíveis
- `premium_domains` - Domínios premium à venda
- `premium_domain_purchases` - Histórico de compras premium
- `domain_transfers` - Transferências de domínio
- `domain_license_history` - Histórico de licenciamento
- `protected_brands` - Marcas protegidas (requer verificação)
- `reserved_keywords` - Palavras-chave reservadas

#### **Email (LEGADO - REMOVIDO)**
- `mail_domains`, `mailboxes`, `aliases` - **REMOVIDOS** mas estrutura ainda existe no schema inicial
- **PROBLEMA**: Migration 20251019210039_remove_email_functionality.sql remove funcionalidades mas não dropar tabelas

#### **Pedidos e Pagamento**
- `orders` - Pedidos de domínio
- `pending_orders` - Pedidos aguardando pagamento
- `invoices` - Faturas
- `premium_payment_history` - Histórico de pagamentos premium

#### **Perfis e Customização**
- `profile_links` - Links do perfil (bio links)
- `profile_stats` - Estatísticas de visualização
- `profile_analytics` - Analytics detalhados
- `profile_themes` - **DUPLICADO** - Existe em múltiplas migrations
- `profile_theme_templates` - Templates de temas
- `profile_applied_templates` - Templates aplicados
- `social_buttons` - Botões sociais
- `content_blocks` - Blocos de conteúdo
- `profile_settings` - Configurações de privacidade
- `subdomains` - Subdomínios vinculados
- `physical_cards` - Cartões físicos NFC

#### **Rede Social**
- `social_posts` - Posts da rede social
- `social_likes` - Curtidas
- `social_comments` - Comentários
- `social_shares` - Compartilhamentos
- `social_follows` - Seguindo/Seguidores
- `social_reports` - Denúncias
- `social_notifications` - Notificações
- `social_bookmarks` - Favoritos

**STORIES REMOVIDOS** (20251029000000_remove_stories_system.sql):
- ~~`stories`~~
- ~~`story_views`~~
- ~~`story_highlights`~~
- ~~`story_highlight_items`~~

#### **Afiliados e Comissões**
- `affiliates` - Afiliados cadastrados
- `affiliate_clicks` - Cliques em links de afiliado
- `affiliate_commissions` - Comissões geradas
- `affiliate_withdrawals` - Saques solicitados

#### **Suporte**
- `support_articles` - Base de conhecimento
- `support_tickets` - Tickets de suporte
- `ticket_messages` - Mensagens dos tickets

#### **Recursos Avançados (Sub-utilizados)**
- `profile_polls` + `poll_options` + `poll_votes` - Sistema de enquetes
- `ab_tests` + `ab_variants` + `ab_results` - Testes A/B
- `lead_capture_forms` + `form_submissions` - Captura de leads
- `product_catalog` - Catálogo de produtos
- `profile_faqs` - FAQs do perfil
- `profile_comments` - Comentários no perfil
- `profile_meta_tags` - Meta tags SEO
- `click_analytics` - Analytics de cliques
- `profile_webhooks` - Webhooks
- `marketing_pixels` - Pixels de marketing
- `profile_admins` - Administradores de perfil
- `profile_change_history` - Histórico de mudanças
- `tip_donations` - Doações/gorjetas
- `subscription_content` - Conteúdo pago
- `content_subscriptions` - Assinaturas de conteúdo
- `public_profiles_directory` - Diretório público
- `utm_campaigns` - Campanhas UTM
- `cart_items` - Carrinho de compras
- `plan_change_log` - Log de mudanças de plano
- `licensing_requests` - Solicitações de licenciamento

#### **Admin e Logs**
- `audit_logs` - Logs de auditoria
- `admin_settings` - Configurações do admin
- `api_credentials` - Credenciais de API (REMOVIDO)
- `pricing_rules` + `currency_rates` - Precificação dinâmica
- `premium_overrides` - Sobrescritas de preço
- `pricing_plans` - Planos de precificação

### 2.2 Problemas Identificados no Schema

#### **CRÍTICOS**

1. **Inconsistência Email System**
   - Tabelas `mail_domains`, `mailboxes`, `aliases` criadas na migration 001
   - Migration 20251019210039 remove funcionalidade mas NÃO dropa as tabelas
   - **AÇÃO**: Criar migration para dropar tabelas definitivamente

2. **Tabela `profile_themes` Duplicada**
   - Criada em migration 030_advanced_profile_features
   - Recriada em migration 075_create_profile_themes_table (duplicada em 2 arquivos!)
   - Migration 20251027183624_deprecate_profile_themes_table tenta depreciar
   - **AÇÃO**: Consolidar em uma única tabela, remover duplicatas

3. **Migration `domain_transfers` Duplicada**
   - 20251028300000_090_domain_transfer_system.sql
   - 20251028230455_20251028300000_090_domain_transfer_system.sql
   - **AÇÃO**: Remover duplicata

4. **Stories System Parcialmente Removido**
   - Migration 20251029000000_remove_stories_system.sql remove tabelas
   - MAS migrations 086, 087 ainda existem e criam funções/policies para stories
   - **AÇÃO**: Revisar e garantir remoção completa

#### **ALTO IMPACTO**

5. **RLS Recursion Problems**
   - Múltiplas migrations tentam corrigir recursão em RLS:
     - 027_fix_customers_rls_recursion
     - 028_fix_all_admin_rls_recursion
     - 064_fix_rls_recursion_v2
     - 066_fix_customers_rls_for_self_lookup
     - 068_simplify_customers_rls_no_recursion
   - **SINTOMA**: Várias tentativas indicam problema não resolvido
   - **AÇÃO**: Auditar todas as policies de RLS e remover subqueries

6. **Foreign Key Indexes Missing**
   - Migration 20251027181533 adiciona índices faltantes
   - **RISCO**: Performance degradada antes desta migration
   - **AÇÃO**: Verificar se TODAS as FKs têm índices

7. **Campos `domain_type` Adicionados Múltiplas Vezes**
   - Migration 050 adiciona `domain_type`
   - Migration 069 adiciona `domain_type` novamente
   - **AÇÃO**: Consolidar em uma única migration

8. **Tabelas de Recursos Avançados Não Utilizadas**
   - Polls, A/B testing, lead forms, product catalog, etc.
   - **PESO**: ~15 tabelas que adicionam complexidade sem uso
   - **AÇÃO**: Considerar remover se não houver roadmap claro

#### **MÉDIO IMPACTO**

9. **Falta de Constraints Adequadas**
   - Apenas 274 CHECK constraints em 126 migrations
   - **EXEMPLO**: Status fields sem ENUM constraints
   - **AÇÃO**: Adicionar CHECK constraints para campos status

10. **Naming Inconsistency**
    - `user_profiles` vs `profile_*` (sem prefixo user_)
    - `social_*` vs sem prefixo em outras tabelas sociais
    - **AÇÃO**: Estabelecer convenção de nomenclatura

11. **Timestamps Inconsistentes**
    - Alguns usam `created_at`, outros `createdAt` (apenas no TypeScript)
    - Alguns têm `updated_at`, outros não
    - **AÇÃO**: Padronizar timestamps em todas as tabelas

---

## 3. ANÁLISE DO SISTEMA DE AUTENTICAÇÃO E AUTORIZAÇÃO

### 3.1 Sistema de Roles

**Roles Implementados** (002_add_roles.sql):
- `user` (padrão)
- `admin`
- `reseller`

**Verificação de Role**:
```sql
CREATE OR REPLACE FUNCTION get_user_role(user_uuid uuid)
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role FROM customers WHERE user_id = user_uuid LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.2 Problemas de Autenticação

#### **CRÍTICO**

1. **User Role Não Está em auth.users**
   - Role armazenado em `customers.role`
   - Requer JOIN para verificar permissões
   - **PROBLEMA**: Potencial para usuário sem customer record
   - **AÇÃO**: Mover role para `auth.users.raw_app_metadata`

2. **Function `get_user_role` Tem SECURITY DEFINER**
   - Pode ser explorado para privilege escalation
   - **AÇÃO**: Substituir por políticas RLS diretas

3. **2FA Implementation Incomplete**
   - Tabela `recovery_codes` existe
   - Mas falta integração completa no frontend
   - **AÇÃO**: Verificar se 2FA está funcional end-to-end

#### **ALTO IMPACTO**

4. **Admin Bypass em RLS**
   - Múltiplas policies têm `OR get_user_role(auth.uid()) = 'admin'`
   - **RISCO**: Um usuário que conseguir set role='admin' tem acesso total
   - **AÇÃO**: Usar `auth.jwt() -> 'app_metadata' -> 'role'` ao invés de function

5. **Reseller Permissions Não Documentadas**
   - Role existe mas não há documentação de permissões
   - **AÇÃO**: Documentar matriz de permissões por role

### 3.3 RLS Policies

**Estatísticas**:
- 274 CHECK constraints
- 122 FOREIGN KEY references
- 210 índices criados

**Padrões Identificados**:
1. Maioria das policies usa `customer_id IN (SELECT ... WHERE user_id = auth.uid())`
2. Admin checks via `get_user_role(auth.uid()) = 'admin'`
3. Muitas tentativas de corrigir recursão em policies

**Recomendação CRÍTICA**:
- Simplificar TODAS as policies
- Usar índices apropriados
- Remover função `get_user_role` e usar metadata do JWT

---

## 4. ANÁLISE DO FLUXO DE DOMÍNIOS

### 4.1 Fluxo de Registro

```
User Search Domain
  ↓
Check Availability (domains edge function)
  ↓
Create Order (pending_orders)
  ↓
PayPal Checkout
  ↓
PayPal Webhook
  ↓
Create Domain Entry (domains table)
  ↓
Register with Dynadot (via dynadot-webhook)
  ↓
Update domain status
  ↓
Create DNS Records
  ↓
Link to Profile (if applicable)
```

### 4.2 Problemas Identificados

#### **CRÍTICO**

1. **Sem Idempotência em Webhooks**
   - PayPal pode enviar eventos duplicados
   - Dynadot pode enviar eventos duplicados
   - **RISCO**: Cobrança duplicada ou registro duplicado
   - **AÇÃO**: Implementar idempotency keys

2. **Sem Retry Logic em Falhas de Registro**
   - Se Dynadot API falhar, pedido fica pendente indefinidamente
   - **AÇÃO**: Implementar sistema de retry com exponential backoff

3. **Falta de Verificação de Saldo/Estoque**
   - Não verifica se há saldo em Dynadot antes de criar pedido
   - **AÇÃO**: Pré-validar antes de aceitar pagamento

#### **ALTO IMPACTO**

4. **Domain Licensing Model Complexo**
   - Múltiplos status: active, suspended, revoked, expired, pending
   - Múltiplos tipos: exclusive_personal, exclusive_business, trial, promotional
   - **PROBLEMA**: Lógica de licenciamento não está clara no código
   - **AÇÃO**: Documentar state machine de licenciamento

5. **Premium Domains Sem Verificação de Propriedade**
   - Qualquer usuário Elite+ pode listar domínio premium
   - **RISCO**: Usuário pode listar domínio que não possui
   - **AÇÃO**: Adicionar verificação de propriedade antes de listar

6. **Protected Brands Sem Validação Completa**
   - Sistema existe mas não está integrado no fluxo de registro
   - **AÇÃO**: Integrar verificação de marca protegida no checkout

### 4.3 DNS Management

- Usa tabela `dns_records`
- Edge function `/dns` para operações CRUD
- **FALTA**: Validação de registros DNS antes de salvar
- **FALTA**: Propagação de DNS para Dynadot/Cloudflare

---

## 5. ANÁLISE DO SISTEMA DE ASSINATURAS

### 5.1 Planos Disponíveis

1. **Basic** (Grátis)
   - 1 perfil
   - Recursos básicos

2. **Standard** ($X/mês)
   - Múltiplos perfis
   - Customização avançada
   - Posts na rede social

3. **Elite** ($XX/mês)
   - Todos do Standard
   - Vender domínios premium
   - Comissões de afiliado

4. **Supreme** ($XXX/mês)
   - Todos do Elite
   - Licenciamento de múltiplos domínios
   - Recursos exclusivos

### 5.2 Problemas Identificados

#### **CRÍTICO**

1. **Valores dos Planos Não Estão no Código**
   - Precificação está hardcoded em alguns lugares
   - Não está sincronizada com `subscription_plans` table
   - **AÇÃO**: Centralizar preços no banco e carregar dinamicamente

2. **Sem Gerenciamento de Upgrade/Downgrade**
   - Migration 089 cria sistema de downgrade
   - Mas lógica de upgrade não está clara
   - **PROBLEMA**: Prorating não implementado
   - **AÇÃO**: Implementar lógica de pro-rata

3. **Admin Tem Elite "Lifetime" Mas Não Está Persistido**
   - Migration 091 menciona "admin lifetime benefits"
   - Mas não cria subscription record para admin
   - **AÇÃO**: Criar subscription virtual para admins

#### **ALTO IMPACTO**

4. **Subscription Status Não É Verificado Consistentemente**
   - Alguns endpoints verificam, outros não
   - **RISCO**: Usuário pode usar recursos premium após cancelamento
   - **AÇÃO**: Middleware/guard para verificar subscription em TODOS os endpoints

5. **Sem Período de Graça (Grace Period)**
   - Assinatura expira e usuário perde acesso imediatamente
   - **AÇÃO**: Implementar período de graça de 7 dias

6. **Comissões de Afiliado Calculadas Manualmente**
   - Não há trigger automático para calcular comissões
   - **AÇÃO**: Criar trigger no order completion

---

## 6. ANÁLISE DO SISTEMA DE PAGAMENTOS

### 6.1 Fluxo PayPal

```
Create Order (paypal-create-order function)
  ↓
User approves in PayPal
  ↓
Capture Payment (paypal-capture function)
  ↓
Webhook notification (paypal-webhook function)
  ↓
Update order status
  ↓
Provision resources
```

### 6.2 Problemas Identificados

#### **CRÍTICO**

1. **PayPal Webhook Sem Verificação de Assinatura**
   - Arquivo `_shared/webhook.security.ts` existe
   - Mas não verifica se webhook é realmente do PayPal
   - **RISCO**: Qualquer pessoa pode enviar webhook falso
   - **AÇÃO**: Implementar verificação de assinatura do PayPal

2. **Secrets Hardcoded ou em .env**
   - PayPal Client ID/Secret podem estar expostos
   - **AÇÃO**: Migrar para Supabase Secrets ou environment variables seguros

3. **Sem Fallback para Falhas de Pagamento**
   - Se PayPal webhook falhar, pedido fica pendente
   - **AÇÃO**: Implementar polling de status como fallback

#### **ALTO IMPACTO**

4. **Refunds Não Implementados**
   - Não há função para processar reembolsos
   - **AÇÃO**: Implementar edge function para refunds

5. **Múltiplas Moedas Não Testadas**
   - Sistema menciona `currency_rates` mas não usa
   - **AÇÃO**: Implementar ou remover suporte multi-moeda

---

## 7. ANÁLISE DO SISTEMA DE PERFIS

### 7.1 Estrutura

- `user_profiles` - Perfil base
- `profile_links` - Links bio
- `profile_stats` - Estatísticas
- `profile_analytics` - Analytics detalhados
- `profile_settings` - Configurações
- `social_buttons` - Botões sociais
- `content_blocks` - Blocos de conteúdo

### 7.2 Customização

- Background (imagem ou vídeo)
- Fonte customizada (Google Fonts)
- Cores dos links
- Animações dos botões
- CSS customizado
- Temas/templates

### 7.3 Problemas Identificados

#### **MÉDIO IMPACTO**

1. **Profile Themes Confusion**
   - 3 sistemas diferentes de temas
   - Não está claro qual é o correto
   - **AÇÃO**: Consolidar em um único sistema

2. **CSS Customizado Sem Sanitização**
   - Usuário pode injetar CSS arbitrário
   - **RISCO**: XSS via CSS injection
   - **AÇÃO**: Sanitizar CSS customizado

3. **Vídeos de Background Sem Limite de Tamanho**
   - Pode causar problemas de performance
   - **AÇÃO**: Limitar tamanho de vídeo e implementar compressão

4. **Muitas Tabelas para Profile Features**
   - 15+ tabelas relacionadas a perfis
   - **PROBLEMA**: Complexidade desnecessária
   - **AÇÃO**: Considerar merge de tabelas semelhantes

---

## 8. ANÁLISE DO SISTEMA SOCIAL

### 8.1 Features

- Posts (texto, imagem, vídeo)
- Likes
- Comentários
- Compartilhamentos
- Seguir/Seguidores
- Notificações
- Denúncias
- Bookmarks
- ~~Stories~~ (REMOVIDO)

### 8.2 Problemas Identificados

#### **ALTO IMPACTO**

1. **Posts Sem Moderação Automática**
   - Não há filtro de conteúdo impróprio
   - **AÇÃO**: Implementar moderação via AI ou lista de palavras

2. **Denúncias Sem Workflow de Revisão**
   - Tabela `social_reports` existe
   - Mas não há interface admin para revisar
   - **AÇÃO**: Criar página admin para moderação

3. **Notificações Podem Crescer Indefinidamente**
   - Sem política de cleanup de notificações antigas
   - **AÇÃO**: Implementar TTL de 30 dias

#### **MÉDIO IMPACTO**

4. **Feed Algorithm Muito Simples**
   - Apenas ORDER BY created_at
   - **AÇÃO**: Implementar algoritmo com engagement score

5. **Stories Removido Mas Migrations Ainda Existem**
   - Migrations 081, 086, 087 criam estrutura de stories
   - Migration 20251029 remove
   - **AÇÃO**: Remover migrations antigas ou marcar como deprecated

---

## 9. ANÁLISE DAS EDGE FUNCTIONS

### 9.1 Funções Existentes

1. `auto-create-profile` - Criar perfil ao registrar
2. `check-marketplace-domains` - Verificar domínios no marketplace
3. `csp-report` - Receber relatórios CSP
4. `delete-account` - Deletar conta
5. `dns` - Gerenciar DNS
6. `domain-transfer` - Transferir domínio
7. `domains` - Operações de domínio
8. `dynadot-webhook` - Webhook Dynadot
9. `ensure-customer` - Garantir customer existe
10. `generate-invoice-pdf` - Gerar PDF de fatura
11. `handle-plan-change` - Mudança de plano
12. `paypal-capture` - Capturar pagamento PayPal
13. `paypal-create-order` - Criar ordem PayPal
14. `paypal-webhook` - Webhook PayPal
15. `premium-domain-lifecycle` - Lifecycle domínios premium
16. `qr` - Gerar QR code
17. `reseller-commission` - Calcular comissão
18. `reseller-track` - Track cliques afiliado
19. `revoke-sessions` - Revogar sessões
20. `security-monitor` - Monitorar segurança
21. `upload-social-media` - Upload mídia social

### 9.2 Problemas Identificados

#### **CRÍTICO**

1. **CORS Headers Inconsistentes**
   - Algumas functions têm CORS, outras não
   - **AÇÃO**: Usar middleware `_shared/cors.middleware.ts` em TODAS

2. **Sem Rate Limiting**
   - Arquivo `_shared/rateLimit.middleware.ts` existe
   - Mas não é usado em todas as functions
   - **AÇÃO**: Aplicar rate limiting em todas as functions públicas

3. **Sem Autenticação em Algumas Functions**
   - Algumas functions não verificam JWT
   - **AÇÃO**: Todas as functions (exceto webhooks) devem verificar auth

4. **Erro de Handling Inconsistente**
   - Algumas retornam 500, outras 400
   - **AÇÃO**: Padronizar error responses

#### **ALTO IMPACTO**

5. **Logs Excessivos em Produção**
   - `console.log` em produção
   - **AÇÃO**: Usar apenas em dev ou enviar para logging service

6. **Timeouts Não Configurados**
   - Functions podem rodar indefinidamente
   - **AÇÃO**: Configurar timeout de 30s em todas

---

## 10. ANÁLISE DE SEGURANÇA

### 10.1 Medidas Implementadas

- RLS em todas as tabelas
- 2FA (parcial)
- Audit logs
- Recovery codes
- Session revocation
- Security monitor function
- CSP reporting

### 10.2 Problemas Críticos de Segurança

#### **CRÍTICO**

1. **SQL Injection Potencial**
   - Algumas queries usam string concatenation
   - **AÇÃO**: Usar prepared statements sempre

2. **XSS em Profile Customization**
   - CSS customizado não sanitizado
   - Background pode ter URLs maliciosas
   - **AÇÃO**: Sanitizar TODOS os inputs de customização

3. **CSRF Não Implementado**
   - Sem tokens CSRF
   - **AÇÃO**: Implementar CSRF protection

4. **Secrets em .env Commitados?**
   - Verificar se .env está no .gitignore
   - **AÇÃO**: Auditar repositório

5. **Rate Limiting Não Aplicado**
   - Login, registro, etc. sem rate limit
   - **RISCO**: Brute force attacks
   - **AÇÃO**: Implementar rate limiting global

6. **Cloudflare Turnstile Não Implementado**
   - Arquivo existe mas não está integrado
   - **AÇÃO**: Integrar Turnstile em login/registro

7. **File Upload Sem Validação**
   - Pode fazer upload de arquivos arbitrários
   - **AÇÃO**: Validar tipo MIME, tamanho, content

8. **Webhook Security Fraca**
   - Webhooks não verificam assinatura
   - **AÇÃO**: Implementar verificação de assinatura

#### **ALTO IMPACTO**

9. **Password Reset Sem Rate Limit**
   - Pode enviar infinitos emails
   - **AÇÃO**: Rate limit por IP e email

10. **Session Management Fraco**
    - Sem controle de sessões simultâneas
    - **AÇÃO**: Limitar sessões ativas por usuário

11. **Logs Contêm Dados Sensíveis**
    - Pode estar logando passwords, tokens
    - **AÇÃO**: Sanitizar logs

---

## 11. PROBLEMAS DE PERFORMANCE

### 11.1 Banco de Dados

1. **Faltam Índices em Queries Frequentes**
   - Migration 20251027181533 adiciona alguns
   - Mas pode faltar mais
   - **AÇÃO**: Analisar slow query log

2. **N+1 Queries Potenciais**
   - Frontend pode estar fazendo queries em loop
   - **AÇÃO**: Auditar e otimizar queries

3. **Sem Caching**
   - Todas as queries vão ao banco
   - **AÇÃO**: Implementar Redis ou cache em memória

### 11.2 Frontend

1. **Bundle Muito Grande**
   - 2179 kB (481 kB gzipped)
   - **AÇÃO**: Code splitting, lazy loading

2. **Imagens Não Otimizadas**
   - Sem compressão automática
   - **AÇÃO**: Usar image optimization service

---

## 12. RECOMENDAÇÕES PRIORITÁRIAS

### DEVE SER FEITO ANTES DE PRODUÇÃO

1. ✅ **Remover sistema de email completamente** (tabelas + migrations)
2. ✅ **Consolidar profile_themes** (remover duplicatas)
3. ✅ **Implementar webhook signature verification**
4. ✅ **Implementar rate limiting global**
5. ✅ **Sanitizar CSS customizado**
6. ✅ **Adicionar idempotency keys em webhooks**
7. ✅ **Mover user role para JWT metadata**
8. ✅ **Implementar CSRF protection**
9. ✅ **Validar file uploads**
10. ✅ **Remover secrets do código**

### ALTA PRIORIDADE (1-2 semanas)

11. ⚠️ **Documentar matriz de permissões**
12. ⚠️ **Implementar sistema de retry em falhas**
13. ⚠️ **Adicionar moderação de conteúdo**
14. ⚠️ **Implementar refunds**
15. ⚠️ **Cleanup de notificações antigas**
16. ⚠️ **Adicionar testes automatizados**
17. ⚠️ **Implementar monitoring/alerting**
18. ⚠️ **Otimizar bundle size**

### MÉDIA PRIORIDADE (1 mês)

19. 📋 **Remover tabelas não utilizadas**
20. 📋 **Consolidar naming conventions**
21. 📋 **Implementar caching**
22. 📋 **Adicionar slow query monitoring**
23. 📋 **Documentar fluxos completos**
24. 📋 **Implementar grace period**
25. 📋 **Melhorar algoritmo de feed**

### BAIXA PRIORIDADE (Backlog)

26. 💡 **Implementar multi-currency**
27. 💡 **Adicionar testes A/B funcionais**
28. 💡 **Implementar product catalog**
29. 💡 **Criar sistema de webhooks para usuários**
30. 💡 **Adicionar marketing pixels**

---

## 13. DÉBITO TÉCNICO ESTIMADO

- **Migrations duplicadas/conflitantes**: 8-12 horas
- **Security fixes**: 40-60 horas
- **RLS simplification**: 20-30 horas
- **Performance optimization**: 30-40 horas
- **Documentation**: 20-30 horas
- **Testing**: 60-80 horas

**TOTAL**: ~180-252 horas (4-6 semanas para 1 dev)

---

## 14. CONCLUSÃO

Sistema ambicioso com muitas features, mas precisa de:

1. **Consolidação** - Remover duplicatas e código morto
2. **Segurança** - Implementar proteções críticas
3. **Simplificação** - Reduzir complexidade desnecessária
4. **Documentação** - Fluxos e permissões
5. **Testes** - Cobertura mínima de 60%

O sistema TEM POTENCIAL mas não está pronto para produção no estado atual.

**Risco de lançar agora**: 🔴 ALTO
**Tempo para production-ready**: 4-6 semanas
**Prioridade #1**: Segurança e estabilidade
