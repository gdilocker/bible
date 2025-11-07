# Sistema de Verificação e Moderação de Links Maliciosos

## 📋 Visão Geral

Sistema completo de verificação automática e moderação manual de links cadastrados pelos usuários no projeto .com.rich, garantindo segurança e proteção contra phishing, malware e outros conteúdos maliciosos.

---

## 🎯 Funcionalidades Principais

### 1. Verificação Automática de Segurança
- **Verificação em tempo real**: Ao cadastrar ou editar um link, o sistema verifica automaticamente sua segurança
- **Google Safe Browsing API**: Integração com a API do Google para detecção de ameaças
- **Padrões suspeitos**: Detecção de padrões comuns em links maliciosos:
  - URLs encurtadas (bit.ly, tinyurl, etc.)
  - IPs diretos ao invés de domínios
  - TLDs suspeitos (.tk, .ml, .ga, etc.)
  - Padrões de phishing (fake-login, verify-account, etc.)

### 2. Status de Segurança dos Links

Cada link possui um dos seguintes status:

| Status | Ícone | Descrição | Ação |
|--------|-------|-----------|------|
| ✅ **Seguro** | CheckCircle | Link verificado e aprovado | Exibido normalmente |
| ⚠️ **Suspeito** | AlertTriangle | Padrão suspeito detectado | Sob revisão |
| 🚫 **Malicioso** | Ban | Link identificado como malicioso | **BLOQUEADO** |
| ⏳ **Pendente** | Clock | Aguardando verificação | Aguardando |
| 🔍 **Em Revisão** | Clock | Revisão manual solicitada | Aguardando admin |

### 3. Bloqueio Automático
- Links identificados como maliciosos são **bloqueados automaticamente**
- **NÃO aparecem** na página pública do usuário
- Usuário é notificado com o motivo do bloqueio
- Possibilidade de solicitar revisão manual

### 4. Verificação Periódica (Cron)
- Sistema verifica automaticamente todos os links ativos **1x por dia**
- Garante que links que se tornaram maliciosos sejam identificados
- Edge function: `periodic-link-security-check`
- Processa até 100 links por execução

### 5. Painel do Usuário
- **Indicadores visuais** de status ao lado de cada link
- **Motivo do bloqueio** exibido se link for bloqueado
- **Botão "Solicitar Revisão"** para links bloqueados
- Contador de verificações realizadas

### 6. Painel Administrativo Completo

Localização: **Admin Dashboard > Operações > Moderação de Links** (`/admin/link-moderation`)

#### Estatísticas em Tempo Real
- Total de links
- Links seguros
- Links suspeitos
- Links maliciosos
- Links pendentes
- Links bloqueados

#### Filtros e Busca
- Buscar por URL ou título
- Filtrar por status (todos, pendentes, seguros, suspeitos, maliciosos, em revisão)
- Filtrar por bloqueio (todos, apenas bloqueados, apenas ativos)
- Botão de atualização

#### Visualização de Links
- Lista completa com informações:
  - Status visual
  - URL e título
  - Dados do usuário (nome, email, domínio)
  - Número de verificações
  - Data da última verificação
- Seleção múltipla para ações em lote

#### Ações Administrativas

**Por Link:**
- 👁️ **Ver Detalhes**: Modal com histórico completo
- 🔄 **Reverificar**: Força nova verificação imediata
- ✅ **Aprovar**: Marca manualmente como seguro
- 🚫 **Bloquear**: Bloqueia manualmente (com justificativa obrigatória)
- ↩️ **Restaurar**: Desbloqueia link previamente bloqueado

**Em Lote:**
- Selecionar múltiplos links
- Reverificar todos selecionados de uma vez

#### Modal de Detalhes
Quando o admin clica em "Ver Detalhes", abre modal com:

**Informações do Link:**
- URL completa (com link externo)
- Título
- Status atual com descrição
- Motivo do bloqueio (se aplicável)

**Informações do Usuário:**
- Nome
- Email
- Domínio (.com.rich)
- Total de verificações

**Histórico de Verificações:**
- Data/hora de cada verificação
- Status resultante
- Tipo de verificação (automática, manual, periódica)
- Provider usado (Google Safe Browsing)
- Ameaças detectadas (se houver)
- Notas/observações

**Histórico de Moderação:**
- Data/hora da ação
- Tipo de ação (aprovado, bloqueado, revisão solicitada, etc.)
- Admin que executou
- Justificativa/motivo

#### Exportação
- **Botão CSV**: Exporta lista completa de links com todos os dados
- Formato: URL, Título, Status, Bloqueado, Usuário, Email, Domínio, Verificações, Última Verificação

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `link_security_checks`
Armazena histórico de todas as verificações de segurança.

```sql
- id (uuid, PK)
- link_id (uuid, FK → profile_links)
- url (text)
- status (enum: safe, suspicious, malicious, pending)
- check_type (enum: automatic, manual, periodic, user_request)
- threat_types (jsonb) - tipos de ameaças detectadas
- provider (text) - ex: google_safe_browsing
- raw_response (jsonb) - resposta completa da API
- checked_at (timestamptz)
- checked_by (uuid, FK → auth.users) - null se automático
- notes (text)
```

### Tabela: `link_moderation_actions`
Registra todas as ações administrativas de moderação.

```sql
- id (uuid, PK)
- link_id (uuid, FK → profile_links)
- security_check_id (uuid, FK → link_security_checks)
- action_type (enum: approved, blocked, review_requested, recheck, restored, force_safe)
- reason (text)
- performed_by (uuid, FK → auth.users)
- performed_at (timestamptz)
- metadata (jsonb)
```

### Colunas Adicionadas em `profile_links`

```sql
- security_status (enum: safe, suspicious, malicious, pending, under_review)
- is_blocked (boolean, default false)
- last_security_check (timestamptz)
- security_check_count (integer, default 0)
- block_reason (text)
```

---

## 🔧 Edge Functions

### 1. `verify-link-security`
**Função:** Verifica segurança de um link específico

**Endpoint:** `POST /functions/v1/verify-link-security`

**Payload:**
```json
{
  "linkId": "uuid-do-link",
  "url": "https://example.com",
  "checkType": "automatic" | "manual" | "periodic" | "user_request"
}
```

**Response:**
```json
{
  "success": true,
  "checkId": "uuid-do-check",
  "result": {
    "status": "safe" | "suspicious" | "malicious" | "pending",
    "threatTypes": ["MALWARE", "PHISHING"],
    "isBlocked": false,
    "notes": "URL verificada e considerada segura"
  }
}
```

**Features:**
- Integração com Google Safe Browsing API
- Detecção de padrões suspeitos locais
- Registro automático em `link_security_checks`
- Atualização automática do status em `profile_links` via trigger
- Rate limiting e cache

### 2. `periodic-link-security-check`
**Função:** Verifica periodicamente todos os links ativos (CRON)

**Endpoint:** `POST /functions/v1/periodic-link-security-check`

**Headers:**
```
Authorization: Bearer <CRON_SECRET>
```

**Response:**
```json
{
  "success": true,
  "message": "Verificação periódica concluída",
  "results": {
    "total": 50,
    "safe": 45,
    "suspicious": 3,
    "malicious": 1,
    "pending": 0,
    "errors": 1
  }
}
```

**Features:**
- Busca links não verificados há 24h
- Processa até 100 links por execução
- Delay de 100ms entre verificações
- Log detalhado de cada verificação

---

## 🔐 Segurança e RLS

### Políticas de Row Level Security

#### `link_security_checks`
- **Admins**: Podem ver todos os checks
- **Usuários**: Podem ver apenas checks de seus próprios links
- **Sistema**: Pode inserir checks (automático)
- **Admins**: Podem atualizar checks (revisão manual)

#### `link_moderation_actions`
- **Admins**: Podem ver todas as ações
- **Usuários**: Podem ver ações em seus próprios links
- **Admins**: Podem inserir ações (moderação)

#### `profile_links` (Atualizado)
- **Visualização pública**: Links bloqueados (`is_blocked = true`) são **automaticamente filtrados**
- **Owner**: Pode ver todos seus links, incluindo bloqueados
- **Admins**: Acesso total

### Triggers Automáticos

**`trigger_update_link_security_status`**
- Dispara após INSERT em `link_security_checks`
- Atualiza automaticamente `profile_links` com:
  - Novo `security_status`
  - `is_blocked = true` se malicioso
  - `last_security_check`
  - Incrementa `security_check_count`
  - Define `block_reason` se malicioso

---

## 🔄 Fluxo de Funcionamento

### Fluxo 1: Usuário Cria/Edita Link

```
1. Usuário salva link no LinkEditor
2. Sistema chama profileLinksService.createLink() ou updateLink()
3. Link é salvo no banco com status "pending"
4. Sistema chama profileLinksService.verifyLinkSecurity() (async)
5. Edge function verify-link-security é chamada
6. Google Safe Browsing API é consultada
7. Padrões suspeitos são verificados localmente
8. Resultado é registrado em link_security_checks
9. Trigger atualiza automaticamente profile_links
10. Se malicioso: link é bloqueado (is_blocked = true)
11. Usuário vê status atualizado no painel
```

### Fluxo 2: Verificação Periódica (Cron)

```
1. Cron job dispara edge function periodic-link-security-check
2. Função busca links não verificados há 24h
3. Para cada link (até 100):
   a. Verifica segurança via Google Safe Browsing
   b. Registra em link_security_checks
   c. Trigger atualiza profile_links
   d. Se tornou malicioso: bloqueia automaticamente
4. Retorna estatísticas da execução
```

### Fluxo 3: Usuário Solicita Revisão

```
1. Link é bloqueado (status "malicious")
2. Usuário clica em "Solicitar Revisão Manual"
3. Sistema chama função request_link_review()
4. Status muda para "under_review"
5. Ação registrada em link_moderation_actions
6. Admin recebe notificação (futura feature)
7. Admin analisa no painel de moderação
8. Admin aprova ou mantém bloqueado (com justificativa)
```

### Fluxo 4: Admin Modera Link

```
1. Admin acessa /admin/link-moderation
2. Visualiza lista de links com filtros
3. Clica em "Ver Detalhes" de um link
4. Analisa histórico de verificações e ações
5. Executa ação:
   - Reverificar: Força nova consulta à API
   - Aprovar: Marca como "safe" manualmente
   - Bloquear: Marca como "malicious" com justificativa
   - Restaurar: Remove bloqueio
6. Ação registrada em link_moderation_actions
7. Link atualizado em profile_links
8. Usuário vê mudança no painel
```

---

## 🎨 Componentes Frontend

### `LinkSecurityStatus.tsx`
Componente reutilizável para exibir status de segurança.

**Props:**
- `linkId` (string)
- `status` (enum)
- `isBlocked` (boolean)
- `blockReason` (string, opcional)
- `showDetails` (boolean, default false)
- `onReviewRequest` (function, opcional)

**Modos:**
- **Compacto**: Badge pequeno com ícone e label
- **Detalhado**: Card completo com descrição e botão de revisão

### `AdminLinkModeration.tsx`
Página completa de administração.

**Seções:**
- Dashboard com estatísticas
- Filtros e busca
- Lista de links com ações
- Modal de detalhes
- Modal de confirmação de ações
- Exportação CSV

### `LinkEditor.tsx` (Atualizado)
Editor de links do usuário.

**Alterações:**
- Importa `LinkSecurityStatus`
- Exibe status ao lado de cada link
- Mostra motivo do bloqueio se aplicável
- Chama verificação automática após salvar

---

## 🔑 Variáveis de Ambiente

### Obrigatórias

```env
GOOGLE_SAFE_BROWSING_API_KEY=your-api-key-here
```

### Opcionais

```env
CRON_SECRET=secret-for-cron-auth
```

---

## 📊 Funções SQL Auxiliares

### `request_link_review(p_link_id, p_user_message)`
Permite usuário solicitar revisão manual de link bloqueado.

```sql
SELECT request_link_review(
  'uuid-do-link',
  'Acredito que este link foi bloqueado por engano'
);
```

**Retorna:**
```json
{
  "success": true,
  "action_id": "uuid-da-acao",
  "message": "Revisão solicitada com sucesso"
}
```

### `get_links_for_periodic_check(p_hours_since_last_check)`
Busca links que precisam de verificação periódica.

```sql
SELECT * FROM get_links_for_periodic_check(24);
```

**Retorna:**
- link_id
- url
- profile_id
- last_check

---

## 🚀 Configuração e Deploy

### 1. Aplicar Migration

A migration já foi aplicada automaticamente:
```
supabase/migrations/link_security_moderation_system.sql
```

### 2. Configurar Google Safe Browsing API

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto (ou use existente)
3. Ative a **Safe Browsing API**
4. Crie credenciais (API Key)
5. Adicione ao Supabase:
   ```bash
   supabase secrets set GOOGLE_SAFE_BROWSING_API_KEY=your-key
   ```

### 3. Deploy Edge Functions

```bash
# Deploy verify-link-security
supabase functions deploy verify-link-security

# Deploy periodic-link-security-check
supabase functions deploy periodic-link-security-check
```

### 4. Configurar Cron Job

No Supabase Dashboard > Edge Functions > periodic-link-security-check:
- Habilitar Cron
- Schedule: `0 */1 * * *` (a cada hora)
ou `0 2 * * *` (uma vez por dia às 2h)

### 5. Deploy Frontend

```bash
npm run build
# Deploy para seu servidor/CDN
```

---

## 📈 Métricas e Monitoramento

### Estatísticas Disponíveis no Admin

- Total de links cadastrados
- Taxa de links seguros/suspeitos/maliciosos
- Links bloqueados (atual)
- Verificações realizadas (total)
- Ações de moderação executadas

### Logs e Auditoria

Todas as ações são registradas em:
- `link_security_checks`: Histórico de verificações
- `link_moderation_actions`: Histórico de ações admin

### Queries Úteis

**Links mais verificados:**
```sql
SELECT url, title, security_check_count
FROM profile_links
ORDER BY security_check_count DESC
LIMIT 10;
```

**Estatísticas por status:**
```sql
SELECT
  security_status,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_blocked) as blocked
FROM profile_links
GROUP BY security_status;
```

**Ações por admin:**
```sql
SELECT
  c.email as admin,
  COUNT(*) as total_actions,
  COUNT(*) FILTER (WHERE action_type = 'blocked') as blocks,
  COUNT(*) FILTER (WHERE action_type = 'approved') as approvals
FROM link_moderation_actions lma
JOIN customers c ON c.user_id = lma.performed_by
GROUP BY c.email;
```

---

## 🐛 Troubleshooting

### Link não está sendo verificado

1. Verificar se edge function está deployada
2. Verificar logs da função no Supabase Dashboard
3. Verificar se API key do Google está configurada
4. Verificar RLS policies

### Link não aparece na página pública

- Verificar se `is_blocked = false`
- Verificar se `is_active = true`
- Ver logs de query no navegador

### Verificação periódica não funciona

1. Verificar se cron está habilitado
2. Verificar se `CRON_SECRET` está configurado
3. Ver logs da edge function
4. Verificar função `get_links_for_periodic_check()`

---

## ✅ Checklist de Implementação

- ✅ Migration aplicada com sucesso
- ✅ Edge functions criadas
- ✅ Componente LinkSecurityStatus implementado
- ✅ LinkEditor atualizado com verificação automática
- ✅ Página AdminLinkModeration completa
- ✅ Rota `/admin/link-moderation` adicionada
- ✅ Link no AdminDashboard adicionado
- ✅ Filtro de bloqueados na visualização pública
- ✅ RLS policies configuradas
- ✅ Triggers automáticos funcionando
- ✅ Build bem-sucedido

---

## 🎯 Próximos Passos (Futuras Melhorias)

1. **Notificações:**
   - Email ao usuário quando link é bloqueado
   - Email ao admin quando revisão é solicitada
   - Notificações in-app

2. **Machine Learning:**
   - Treinar modelo próprio de detecção
   - Análise de conteúdo da página
   - Detecção de phishing mais avançada

3. **Integrações Adicionais:**
   - VirusTotal API
   - PhishTank
   - URLhaus

4. **Dashboard Analítico:**
   - Gráficos de tendências
   - Mapa de calor de ameaças
   - Relatórios automatizados

5. **Whitelist/Blacklist:**
   - Lista de domínios sempre permitidos
   - Lista de domínios sempre bloqueados
   - Gerenciamento no admin

---

## 📞 Suporte

Para questões técnicas ou bugs:
1. Verificar logs no Supabase Dashboard
2. Verificar este documento
3. Contatar equipe de desenvolvimento

---

**Sistema implementado e pronto para produção!** 🚀✨
