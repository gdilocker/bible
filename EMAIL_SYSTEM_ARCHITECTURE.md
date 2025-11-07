# 📧 SISTEMA DE E-MAIL INSTITUCIONAL - ARQUITETURA TÉCNICA

**Data**: 2025-11-07
**Versão**: 1.0
**Status**: Design Phase

---

## 🎯 OBJETIVO

Implementar servidor de e-mail próprio para domínio **com.rich** com gestão completa via admin panel, incluindo:
- Criação e gestão de caixas de e-mail
- SMTP/IMAP próprio
- Segurança (SPF, DKIM, DMARC, TLS)
- Backups automáticos
- Monitoramento e logs
- Preparado para futuro multi-tenant

---

## 🏗️ ARQUITETURA PROPOSTA

### Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (.com.rich)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Admin Panel - Seção "E-mails @com.rich"              │ │
│  │  - Gestão de caixas                                    │ │
│  │  - Aliases e forwards                                  │ │
│  │  - Auto-reply                                          │ │
│  │  - Logs e estatísticas                                 │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ API REST
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE (Database + Edge Functions)       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Edge Functions:                                       │ │
│  │  - email-create-mailbox                                │ │
│  │  - email-list-mailboxes                                │ │
│  │  - email-update-mailbox                                │ │
│  │  - email-delete-mailbox                                │ │
│  │  - email-create-alias                                  │ │
│  │  - email-get-stats                                     │ │
│  │  - email-send-transactional                            │ │
│  │  - email-backup-trigger                                │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Database Tables:                                      │ │
│  │  - email_accounts                                      │ │
│  │  - email_aliases                                       │ │
│  │  - email_forwards                                      │ │
│  │  - email_auto_replies                                  │ │
│  │  - email_audit_logs                                    │ │
│  │  - email_stats                                         │ │
│  │  - email_templates                                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ Mailcow API
                             ▼
┌─────────────────────────────────────────────────────────────┐
│               MAILCOW (Docker Self-Hosted)                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Services:                                             │ │
│  │  - Postfix (SMTP)          - Port 25, 465, 587        │ │
│  │  - Dovecot (IMAP/POP3)     - Port 143, 993            │ │
│  │  - Rspamd (Antispam)                                   │ │
│  │  - ClamAV (Antivírus)                                  │ │
│  │  - SOGo (Webmail opcional)                             │ │
│  │  - Mailcow API             - Port 443 (HTTPS)          │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Storage:                                              │ │
│  │  - /var/vmail (mailboxes)                              │ │
│  │  - /opt/mailcow-dockerized (config)                    │ │
│  │  - MySQL/MariaDB (metadata)                            │ │
│  │  - Redis (cache/sessions)                              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ DNS Records
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      DNS CONFIGURATION                       │
│  MX:        com.rich      → mail.com.rich (priority 10)     │
│  A:         mail.com.rich → [IP_SERVIDOR]                   │
│  A:         imap.com.rich → [IP_SERVIDOR]                   │
│  A:         smtp.com.rich → [IP_SERVIDOR]                   │
│  TXT (SPF): v=spf1 mx ~all                                  │
│  TXT (DKIM): dkim._domainkey.com.rich → [public_key]        │
│  TXT (DMARC): _dmarc.com.rich → v=DMARC1; p=quarantine     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 SCHEMA DO BANCO DE DADOS

### Tabela: `email_accounts`

```sql
CREATE TABLE email_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  domain VARCHAR(100) NOT NULL DEFAULT 'com.rich',

  -- Mailcow Integration
  mailcow_id VARCHAR(255) UNIQUE, -- ID no Mailcow

  -- Account Settings
  quota_mb INTEGER NOT NULL DEFAULT 5120, -- 5GB padrão
  used_mb INTEGER DEFAULT 0,
  password_hash TEXT, -- Armazenado no Mailcow, aqui só metadata

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, suspended, deleted
  is_admin BOOLEAN DEFAULT FALSE,

  -- Features
  can_send BOOLEAN DEFAULT TRUE,
  can_receive BOOLEAN DEFAULT TRUE,
  spam_filter_enabled BOOLEAN DEFAULT TRUE,
  virus_scan_enabled BOOLEAN DEFAULT TRUE,

  -- Rate Limiting
  send_limit_per_hour INTEGER DEFAULT 100,
  send_limit_per_day INTEGER DEFAULT 500,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  notes TEXT
);

CREATE INDEX idx_email_accounts_email ON email_accounts(email);
CREATE INDEX idx_email_accounts_domain ON email_accounts(domain);
CREATE INDEX idx_email_accounts_status ON email_accounts(status);
```

### Tabela: `email_aliases`

```sql
CREATE TABLE email_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias VARCHAR(255) NOT NULL,
  target_email VARCHAR(255) NOT NULL,
  domain VARCHAR(100) NOT NULL DEFAULT 'com.rich',

  -- Mailcow Integration
  mailcow_id VARCHAR(255) UNIQUE,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  notes TEXT,

  UNIQUE(alias, domain)
);

CREATE INDEX idx_email_aliases_alias ON email_aliases(alias);
CREATE INDEX idx_email_aliases_target ON email_aliases(target_email);
```

### Tabela: `email_forwards`

```sql
CREATE TABLE email_forwards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_email VARCHAR(255) NOT NULL,
  destination_email VARCHAR(255) NOT NULL,

  -- Mailcow Integration
  mailcow_id VARCHAR(255) UNIQUE,

  -- Options
  keep_local_copy BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  created_by UUID REFERENCES auth.users(id),

  UNIQUE(source_email, destination_email)
);
```

### Tabela: `email_auto_replies`

```sql
CREATE TABLE email_auto_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_account_id UUID REFERENCES email_accounts(id) ON DELETE CASCADE,

  -- Auto-Reply Settings
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  -- Schedule
  is_active BOOLEAN DEFAULT FALSE,
  start_date DATE,
  end_date DATE,

  -- Mailcow Integration
  mailcow_id VARCHAR(255) UNIQUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  created_by UUID REFERENCES auth.users(id)
);
```

### Tabela: `email_audit_logs`

```sql
CREATE TABLE email_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Action Details
  action VARCHAR(50) NOT NULL, -- create, update, delete, suspend, reset_password
  entity_type VARCHAR(50) NOT NULL, -- account, alias, forward, auto_reply
  entity_id UUID,
  email VARCHAR(255),

  -- Changes
  changes JSONB, -- Before/after values

  -- Actor
  performed_by UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,

  -- Status
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_audit_logs_action ON email_audit_logs(action);
CREATE INDEX idx_email_audit_logs_email ON email_audit_logs(email);
CREATE INDEX idx_email_audit_logs_created ON email_audit_logs(created_at DESC);
CREATE INDEX idx_email_audit_logs_performed_by ON email_audit_logs(performed_by);
```

### Tabela: `email_stats`

```sql
CREATE TABLE email_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_account_id UUID REFERENCES email_accounts(id) ON DELETE CASCADE,

  -- Period
  date DATE NOT NULL,
  hour INTEGER, -- NULL para stats diárias, 0-23 para horárias

  -- Metrics
  emails_sent INTEGER DEFAULT 0,
  emails_received INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,
  emails_spam INTEGER DEFAULT 0,
  emails_virus INTEGER DEFAULT 0,

  -- Size
  bytes_sent BIGINT DEFAULT 0,
  bytes_received BIGINT DEFAULT 0,

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(email_account_id, date, hour)
);

CREATE INDEX idx_email_stats_account_date ON email_stats(email_account_id, date DESC);
```

### Tabela: `email_templates`

```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Template Info
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Content
  subject VARCHAR(255) NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,

  -- Variables
  variables JSONB, -- { "name": "description", ... }

  -- Settings
  from_email VARCHAR(255) DEFAULT 'no-reply@com.rich',
  from_name VARCHAR(255) DEFAULT 'com.rich',
  reply_to VARCHAR(255),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0
);

CREATE INDEX idx_email_templates_slug ON email_templates(slug);
```

### Tabela: `email_queue`

```sql
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Email Details
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  to_email VARCHAR(255) NOT NULL,
  to_name VARCHAR(255),
  cc VARCHAR(255)[],
  bcc VARCHAR(255)[],
  reply_to VARCHAR(255),

  -- Content
  subject VARCHAR(255) NOT NULL,
  html_body TEXT,
  text_body TEXT,
  attachments JSONB,

  -- Metadata
  template_id UUID REFERENCES email_templates(id),
  variables JSONB,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, sending, sent, failed, cancelled
  priority INTEGER DEFAULT 5, -- 1 (highest) to 10 (lowest)

  -- Attempts
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,

  -- Response
  mailcow_message_id VARCHAR(255),
  smtp_response TEXT
);

CREATE INDEX idx_email_queue_status ON email_queue(status, scheduled_at);
CREATE INDEX idx_email_queue_to_email ON email_queue(to_email);
CREATE INDEX idx_email_queue_created ON email_queue(created_at DESC);
```

### Tabela: `email_system_status`

```sql
CREATE TABLE email_system_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Service Status
  mailcow_api_status VARCHAR(20) NOT NULL, -- up, down, degraded
  smtp_status VARCHAR(20) NOT NULL,
  imap_status VARCHAR(20) NOT NULL,

  -- Queue Stats
  queue_size INTEGER DEFAULT 0,
  queue_processing INTEGER DEFAULT 0,
  queue_failed INTEGER DEFAULT 0,

  -- Storage
  total_storage_mb BIGINT,
  used_storage_mb BIGINT,

  -- Certificates
  ssl_cert_expiry_date DATE,
  dkim_configured BOOLEAN DEFAULT FALSE,
  spf_configured BOOLEAN DEFAULT FALSE,
  dmarc_configured BOOLEAN DEFAULT FALSE,

  -- Last Check
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Alerts
  alerts JSONB -- [{ "type": "warning", "message": "..." }]
);
```

---

## 🔐 ROW LEVEL SECURITY (RLS)

Todas as tabelas terão RLS habilitado com policies específicas:

```sql
-- Apenas admins podem gerenciar e-mails
CREATE POLICY "Admins can manage email accounts"
  ON email_accounts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.user_id = auth.uid()
      AND c.role = 'admin'
    )
  );

-- Audit logs são read-only
CREATE POLICY "Admins can view audit logs"
  ON email_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.user_id = auth.uid()
      AND c.role = 'admin'
    )
  );

-- Stats são read-only
CREATE POLICY "Admins can view email stats"
  ON email_stats
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.user_id = auth.uid()
      AND c.role = 'admin'
    )
  );
```

---

## 🔌 MAILCOW API INTEGRATION

### API Endpoints Principais

```
Base URL: https://mail.com.rich/api/v1

Auth: API-Key header (X-API-Key: xxx)

Endpoints usados:
- POST   /api/v1/add/mailbox          - Criar caixa
- GET    /api/v1/get/mailbox/all      - Listar caixas
- POST   /api/v1/edit/mailbox         - Editar caixa
- POST   /api/v1/delete/mailbox       - Deletar caixa
- POST   /api/v1/add/alias            - Criar alias
- GET    /api/v1/get/alias/all        - Listar aliases
- POST   /api/v1/add/syncjob          - Auto-reply (via sieve)
- GET    /api/v1/get/logs/postfix     - Logs SMTP
- GET    /api/v1/get/logs/dovecot     - Logs IMAP
- GET    /api/v1/get/status/containers - Status serviços
```

### Request/Response Exemplos

**Criar Mailbox:**
```json
POST /api/v1/add/mailbox
{
  "local_part": "contact",
  "domain": "com.rich",
  "name": "Contact Team",
  "quota": 5120,
  "password": "secure_random_password",
  "password2": "secure_random_password",
  "active": "1"
}

Response: { "type": "success", "msg": "mailbox_added", "mailbox": "contact@com.rich" }
```

---

## 🎨 EDGE FUNCTIONS

### 1. `email-create-mailbox`

```typescript
POST /functions/v1/email-create-mailbox

Body: {
  email: "contact@com.rich",
  displayName: "Contact Team",
  quotaMb: 5120,
  password: "auto-generated",
  features: { canSend: true, canReceive: true, ... }
}

Response: {
  success: true,
  accountId: "uuid",
  email: "contact@com.rich",
  credentials: { username: "contact@com.rich", password: "xxx" }
}
```

### 2. `email-list-mailboxes`

```typescript
GET /functions/v1/email-list-mailboxes?search=contact&status=active

Response: {
  success: true,
  mailboxes: [
    {
      id: "uuid",
      email: "contact@com.rich",
      displayName: "Contact Team",
      quotaMb: 5120,
      usedMb: 234,
      status: "active",
      lastLogin: "2025-11-07T10:30:00Z",
      emailsSent24h: 45,
      emailsReceived24h: 123
    }
  ],
  total: 1
}
```

### 3. `email-send-transactional`

```typescript
POST /functions/v1/email-send-transactional

Body: {
  to: "user@example.com",
  templateSlug: "link-blocked",
  variables: { userName: "João", linkUrl: "https://evil.com" },
  priority: 1
}

Response: {
  success: true,
  queueId: "uuid",
  estimatedSendTime: "2025-11-07T10:31:00Z"
}
```

---

## 📄 TEMPLATES DE E-MAIL

Templates padrão a serem criados:

1. **welcome-email** - Boas vindas ao sistema
2. **password-reset** - Reset de senha
3. **link-blocked** - Link bloqueado por segurança
4. **link-approved** - Link aprovado após revisão
5. **domain-expiring** - Domínio expirando em X dias
6. **subscription-payment-failed** - Falha no pagamento
7. **subscription-cancelled** - Assinatura cancelada
8. **trial-ending** - Trial expirando em X dias

Cada template terá:
- Logo com.rich no header
- Design responsivo
- Rodapé com links úteis
- Unsubscribe (quando aplicável)

---

## 🔧 CONFIGURAÇÃO REQUERIDA

### DNS Records (com.rich)

```dns
# MX Record
com.rich.        3600    IN    MX    10 mail.com.rich.

# A Records
mail.com.rich.   3600    IN    A     [IP_SERVIDOR]
imap.com.rich.   3600    IN    A     [IP_SERVIDOR]
smtp.com.rich.   3600    IN    A     [IP_SERVIDOR]

# SPF
com.rich.        3600    IN    TXT   "v=spf1 mx ip4:[IP_SERVIDOR] ~all"

# DKIM (gerado pelo Mailcow)
dkim._domainkey.com.rich. 3600 IN TXT "v=DKIM1; k=rsa; p=[PUBLIC_KEY]"

# DMARC
_dmarc.com.rich. 3600    IN    TXT   "v=DMARC1; p=quarantine; rua=mailto:dmarc@com.rich; ruf=mailto:dmarc@com.rich; fo=1"

# Autodiscover (Outlook/Exchange)
autodiscover.com.rich. 3600 IN CNAME mail.com.rich.
```

### Portas Requeridas

```
25   - SMTP (incoming)
465  - SMTPS (SSL)
587  - Submission (STARTTLS)
143  - IMAP
993  - IMAPS (SSL)
443  - HTTPS (Mailcow API + Webmail)
```

### Servidor Requirements

```
Mínimo Recomendado:
- 4 CPU cores
- 8 GB RAM
- 100 GB SSD (storage)
- Ubuntu 22.04 LTS
- Docker + Docker Compose
- IP dedicado
- Reverse DNS configurado (PTR record)
```

---

## 📊 MONITORAMENTO

### Healthchecks

```sql
-- Function para verificar status
CREATE OR REPLACE FUNCTION check_email_system_health()
RETURNS TABLE (
  service VARCHAR,
  status VARCHAR,
  last_check TIMESTAMPTZ,
  details JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'mailcow_api'::VARCHAR,
    mailcow_api_status::VARCHAR,
    checked_at,
    jsonb_build_object(
      'queue_size', queue_size,
      'queue_failed', queue_failed,
      'storage_used_pct', ROUND(used_storage_mb::NUMERIC / total_storage_mb * 100, 2)
    ) as details
  FROM email_system_status
  ORDER BY checked_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
```

### Alertas

Gerar alerta quando:
- Fila > 1000 e-mails
- Taxa de falha > 10%
- Espaço em disco > 80%
- Certificado SSL expira em < 30 dias
- Serviço down por > 5 minutos

---

## 🔄 BACKUP E RESTORE

### Backup Strategy

```bash
# Daily Backup (cron)
0 3 * * * /opt/mailcow-backup.sh

# Backup inclui:
- MySQL/MariaDB dump (mailcow metadata)
- /var/vmail/* (mailboxes)
- /opt/mailcow-dockerized/data (config)
- DKIM keys

# Retention:
- Daily: 7 dias
- Weekly: 4 semanas
- Monthly: 12 meses
```

### Restore Procedure

```bash
# 1. Parar serviços
cd /opt/mailcow-dockerized
docker-compose down

# 2. Restaurar banco
mysql -u mailcow -p mailcow < backup-2025-11-07.sql

# 3. Restaurar mailboxes
rsync -av backup/vmail/ /var/vmail/

# 4. Restaurar config
rsync -av backup/data/ /opt/mailcow-dockerized/data/

# 5. Iniciar serviços
docker-compose up -d
```

---

## 🚀 DEPLOYMENT PHASES

### Phase 1: Infrastructure (1-2 dias)
- [ ] Provisionar servidor VPS
- [ ] Instalar Docker + Docker Compose
- [ ] Deploy Mailcow via docker-compose
- [ ] Configurar DNS records
- [ ] Obter certificados SSL
- [ ] Configurar firewall

### Phase 2: Database & API (1-2 dias)
- [ ] Criar migration no Supabase
- [ ] Criar edge functions
- [ ] Implementar integração Mailcow API
- [ ] Testar CRUD operations
- [ ] Implementar audit logging

### Phase 3: Admin UI (2-3 dias)
- [ ] Criar página AdminEmails
- [ ] Criar componentes (tabela, modals, forms)
- [ ] Implementar todas as ações
- [ ] Implementar dashboard/stats
- [ ] Testes end-to-end

### Phase 4: Templates & Transactional (1 dia)
- [ ] Criar templates de e-mail
- [ ] Implementar fila de envio
- [ ] Processar fila (cron/worker)
- [ ] Integrar no-reply@com.rich

### Phase 5: Testing & Launch (1 dia)
- [ ] Testes de entregabilidade
- [ ] Validar SPF/DKIM/DMARC
- [ ] Teste backup/restore
- [ ] Monitoramento ativo
- [ ] Documentação final

**Total estimado: 6-9 dias**

---

## 📚 PRÓXIMOS PASSOS

1. Aprovar arquitetura
2. Provisionar servidor
3. Iniciar Phase 1 (Infrastructure)
4. Criar migration (Phase 2)
5. Desenvolver edge functions (Phase 2)
6. Desenvolver Admin UI (Phase 3)
7. Launch!

---

**Autor**: AI Assistant
**Última atualização**: 2025-11-07
