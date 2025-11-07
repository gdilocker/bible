# 📧 SISTEMA DE E-MAIL INSTITUCIONAL - PLANO DE IMPLEMENTAÇÃO

**Data**: 2025-11-07
**Status**: Ready to Start
**Estimativa**: 6-9 dias de desenvolvimento

---

## 📋 RESUMO EXECUTIVO

Documentação completa de arquitetura criada em `EMAIL_SYSTEM_ARCHITECTURE.md`.

Sistema projetado com:
- ✅ 9 tabelas no banco de dados
- ✅ 8+ edge functions planejadas
- ✅ Admin UI completa especificada
- ✅ Integração Mailcow API documentada
- ✅ DNS, segurança e backups planejados

---

## 🎯 O QUE FOI ENTREGUE AGORA

### 1. Documentação Técnica Completa (`EMAIL_SYSTEM_ARCHITECTURE.md`)

**Conteúdo:**
- Arquitetura detalhada com diagramas
- Schema completo do banco de dados (9 tabelas)
- RLS policies para segurança
- API endpoints da Mailcow documentados
- Edge functions especificadas
- Templates de e-mail listados
- Configurações DNS/SSL necessárias
- Plano de backup e restore
- Monitoramento e alertas
- Fases de deployment

**Total**: 400+ linhas de documentação técnica profissional

---

## 🏗️ COMPONENTES DO SISTEMA

### Database Tables (9)

1. **email_accounts** - Caixas de e-mail
2. **email_aliases** - Aliases (@com.rich)
3. **email_forwards** - Forwards/redirecionamentos
4. **email_auto_replies** - Respostas automáticas
5. **email_audit_logs** - Auditoria completa
6. **email_stats** - Estatísticas e métricas
7. **email_templates** - Templates transacionais
8. **email_queue** - Fila de envio
9. **email_system_status** - Status dos serviços

### Edge Functions (8+)

1. `email-create-mailbox` - Criar caixa
2. `email-list-mailboxes` - Listar caixas
3. `email-update-mailbox` - Atualizar caixa
4. `email-delete-mailbox` - Deletar caixa
5. `email-create-alias` - Criar alias
6. `email-get-stats` - Estatísticas
7. `email-send-transactional` - Enviar e-mail sistema
8. `email-backup-trigger` - Trigger de backup

### UI Components

1. `AdminEmails.tsx` - Página principal
2. `EmailAccountsTable.tsx` - Lista de contas
3. `CreateEmailModal.tsx` - Criar conta
4. `EditEmailModal.tsx` - Editar conta
5. `EmailStatsCard.tsx` - Cards de estatísticas
6. `EmailAliasManager.tsx` - Gestão de aliases
7. `EmailAutoReplyModal.tsx` - Auto-resposta
8. `EmailSystemStatus.tsx` - Status geral

---

## 🚦 PRÉ-REQUISITOS PARA COMEÇAR

### 1. Infraestrutura (VOCÊ PRECISA PROVER)

```
✅ Servidor VPS com:
   - 4 CPU cores
   - 8 GB RAM
   - 100 GB SSD
   - Ubuntu 22.04 LTS
   - IP dedicado público
   - Portas liberadas: 25, 465, 587, 143, 993, 443

✅ DNS configurável (com.rich):
   - Acesso para criar registros MX, A, TXT
   - Reverse DNS (PTR) configurável no provedor

✅ Domínio válido (com.rich):
   - Já possui
```

### 2. Decisões Técnicas

**Escolher Stack de E-mail:**

**Opção A: Mailcow (RECOMENDADO)**
- ✅ Open source e gratuito
- ✅ API REST completa
- ✅ Interface web incluída
- ✅ Docker-compose ready
- ✅ Antispam/antivírus incluído
- ✅ Comunidade ativa
- ⏱️ Setup: 2-4 horas

**Opção B: Mail-in-a-Box**
- ✅ Muito simples de instalar
- ❌ API limitada
- ❌ Menos customizável
- ⏱️ Setup: 1-2 horas

**Opção C: iRedMail**
- ✅ Bom desempenho
- ❌ API não nativa
- ❌ Mais complexo
- ⏱️ Setup: 4-6 horas

**RECOMENDAÇÃO**: **Mailcow** pela API completa e flexibilidade.

---

## 📅 PLANO DE EXECUÇÃO (6-9 DIAS)

### PHASE 1: Infraestrutura (1-2 dias) 🔴 BLOQUEANTE

**Ações:**
```bash
# 1. Provisionar VPS
- Contratar VPS (DigitalOcean, Hetzner, AWS, etc)
- Ubuntu 22.04 LTS
- 4 cores, 8GB RAM, 100GB SSD
- IP dedicado

# 2. Configurar DNS
- Criar registros MX, A, TXT (SPF, DKIM, DMARC)
- Configurar reverse DNS (PTR)
- Aguardar propagação (1-24h)

# 3. Instalar Mailcow
cd /opt
git clone https://github.com/mailcow/mailcow-dockerized
cd mailcow-dockerized
./generate_config.sh
docker-compose pull
docker-compose up -d

# 4. Configurar SSL
- Certificados Let's Encrypt automáticos
- Validar acesso: https://mail.com.rich

# 5. Configurar Firewall
ufw allow 25,465,587,143,993,443/tcp
ufw enable
```

**Entregável:** Mailcow rodando e acessível

---

### PHASE 2: Database & API (1-2 dias)

**Ações:**
```sql
# 1. Aplicar migration
- Criar 9 tabelas
- Configurar RLS
- Criar índices
- Criar functions auxiliares

# 2. Desenvolver edge functions
- email-create-mailbox
- email-list-mailboxes
- email-update-mailbox
- email-delete-mailbox
- email-create-alias
- email-get-stats
- email-send-transactional
- email-backup-trigger

# 3. Testar integração Mailcow API
- Validar autenticação
- Testar CRUD operations
- Verificar error handling
```

**Entregável:** API funcional e testada

---

### PHASE 3: Admin UI (2-3 dias)

**Ações:**
```typescript
# 1. Criar página AdminEmails
- Layout com tabs (Contas, Aliases, Stats, Config)
- Breadcrumb e navegação

# 2. Criar componentes
- EmailAccountsTable (lista paginada)
- CreateEmailModal (form validation)
- EditEmailModal
- EmailStatsCard (métricas)
- EmailAliasManager
- EmailAutoReplyModal
- EmailSystemStatus (healthcheck)

# 3. Integrar com edge functions
- useQuery para listas
- useMutation para ações
- Toast notifications
- Loading states
- Error boundaries

# 4. Implementar features
- Busca e filtros
- Bulk actions
- Export CSV
- Audit log viewer
```

**Entregável:** Admin UI completa e funcional

---

### PHASE 4: Templates & Transactional (1 dia)

**Ações:**
```typescript
# 1. Criar templates base
- welcome-email
- password-reset
- link-blocked
- link-approved
- domain-expiring
- subscription-payment-failed
- subscription-cancelled
- trial-ending

# 2. Implementar fila
- Worker para processar email_queue
- Retry logic (exponential backoff)
- Error logging

# 3. Integrar no-reply@com.rich
- Configurar FROM padrão
- Template engine (variables)
- Unsubscribe handling
```

**Entregável:** Sistema de e-mails transacionais funcionando

---

### PHASE 5: Testing & Launch (1 dia)

**Ações:**
```bash
# 1. Testes de entregabilidade
- Enviar para Gmail, Outlook, Yahoo
- Verificar inbox vs spam
- Validar SPF/DKIM/DMARC pass

# 2. Teste backup/restore
- Executar backup
- Simular restore em ambiente teste
- Validar integridade

# 3. Monitoramento
- Configurar healthchecks
- Alertas (PagerDuty, Discord, Telegram)
- Dashboard de métricas

# 4. Documentação operacional
- Runbook de incidentes
- Procedimentos de backup/restore
- Guia de troubleshooting
```

**Entregável:** Sistema em produção, monitorado e documentado

---

## 💰 CUSTOS ESTIMADOS

### Infraestrutura Mensal

```
VPS (4 cores, 8GB, 100GB):
- DigitalOcean: ~$48/mês
- Hetzner: ~€30/mês (~$32)
- AWS Lightsail: ~$40/mês

Backup Storage (opcional):
- S3/Spaces: ~$5-10/mês

Total: $40-60/mês
```

### Desenvolvimento

```
Phase 1 (Infra): 1-2 dias
Phase 2 (API): 1-2 dias
Phase 3 (UI): 2-3 dias
Phase 4 (Templates): 1 dia
Phase 5 (Testing): 1 dia

Total: 6-9 dias de dev
```

---

## 🎯 CRITÉRIOS DE ACEITE

### ✅ Funcional

- [ ] Criar conta `contact@com.rich` pelo admin
- [ ] Login IMAP funciona (Thunderbird/Outlook)
- [ ] Envio SMTP funciona com TLS
- [ ] Receber e-mail de Gmail
- [ ] SPF/DKIM/DMARC pass no MXToolbox
- [ ] Criar alias `suporte@com.rich` → `contact@com.rich`
- [ ] Ativar auto-reply funciona
- [ ] Envio transacional via `no-reply@com.rich`
- [ ] Dashboard mostra stats corretas
- [ ] Backup executado com sucesso
- [ ] Restore testado e funcionando

### ✅ Segurança

- [ ] RLS policies funcionando
- [ ] Audit log registra todas ações
- [ ] Senhas nunca expostas (só no Mailcow)
- [ ] API key Mailcow em secret
- [ ] TLS em todas conexões
- [ ] Rate limiting ativo

### ✅ Performance

- [ ] Envio < 2s (transacional)
- [ ] Listagem < 500ms
- [ ] Criação de conta < 5s
- [ ] Fila processa 100 e-mails/min

---

## 📞 SUPORTE PÓS-IMPLEMENTAÇÃO

### Documentos a criar:

1. **RUNBOOK_EMAIL_INCIDENTS.md**
   - Fila travada → como resolver
   - Bounce rate alto → checklist
   - IP blacklisted → procedimento
   - Certificado expirando → renovação
   - Disco cheio → limpeza

2. **EMAIL_BACKUP_RESTORE_GUIDE.md**
   - Backup manual
   - Backup automatizado
   - Restore completo
   - Restore seletivo (uma caixa)
   - Disaster recovery

3. **EMAIL_MONITORING_SETUP.md**
   - Healthchecks
   - Alertas críticos
   - Métricas importantes
   - Dashboards recomendados

---

## 🚀 COMEÇAR AGORA

### Próximos Passos Imediatos:

1. **DECIDIR**: Aprovar arquitetura proposta?
2. **PROVER**: Contratar VPS e configurar DNS?
3. **AGENDAR**: Quando iniciar desenvolvimento?

### Quando estiver pronto:

```bash
# Eu vou:
1. Criar migration no Supabase
2. Desenvolver edge functions
3. Criar Admin UI completa
4. Implementar templates
5. Fazer testes end-to-end
6. Documentar operação

# Você vai:
1. Provisionar VPS
2. Instalar Mailcow
3. Configurar DNS
4. Gerar API key Mailcow
5. Configurar backup
6. Monitorar produção
```

---

## 📚 DOCUMENTOS ENTREGUES

1. ✅ `EMAIL_SYSTEM_ARCHITECTURE.md` - Arquitetura completa (400+ linhas)
2. ✅ `EMAIL_SYSTEM_IMPLEMENTATION_PLAN.md` - Este documento

**Total**: Documentação profissional completa para implementação.

---

## ❓ DÚVIDAS FREQUENTES

**Q: Posso usar Gmail/SendGrid para envios transacionais?**
A: Sim, mas vai contra o requisito de "servidor próprio". Poderia ser fallback.

**Q: Preciso mesmo de 8GB RAM?**
A: Para começar, 4GB funciona. 8GB é recomendado para crescimento.

**Q: Quanto custa manter?**
A: $40-60/mês VPS + tempo de manutenção (1-2h/semana).

**Q: E se o servidor cair?**
A: E-mails ficam em fila no remetente por 24-72h. Importante ter monitoring.

**Q: Posso migrar depois para cloud?**
A: Sim! Backup/restore permite migração fácil.

---

**PRONTO PARA COMEÇAR?** Me avise quando:
1. VPS estiver provisionado
2. DNS configurado
3. Mailcow instalado

Aí eu crio a migration e desenvolvo todo o resto! 🚀

---

**Autor**: AI Assistant
**Última atualização**: 2025-11-07
