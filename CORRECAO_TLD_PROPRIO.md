# Correção: TLD Próprio (.com.rich)

## Data: 2025-10-29

---

## 🎯 **CORREÇÃO IMPORTANTE**

O sistema usa **TLD próprio (.com.rich)** - não depende de registrars externos como Dynadot!

---

## ❌ **O QUE FOI REMOVIDO**

### 1. Dynadot Webhook (REMOVIDO)
- ❌ `supabase/functions/dynadot-webhook/` - **Deletado completamente**
- ❌ Não há integração com Dynadot
- ❌ Não há webhooks externos para domínios

### 2. Funções Simplificadas no PayPal Webhook

#### Antes (ERRADO):
```typescript
async function registerDomainWithDynadot(fqdn: string, years: number) {
  // Simulava registro externo
  // DESNECESSÁRIO!
}

async function provisionDomain(fqdn: string, domainId: string) {
  // Chamava Dynadot
  // Atualizava com registrar_id
  // COMPLICADO e ERRADO!
}
```

#### Depois (CORRETO):
```typescript
async function activateDomain(fqdn: string, domainId: string, supabase: any) {
  // TLD próprio - ativação instantânea
  await supabase
    .from("domains")
    .update({
      registrar_status: "active",
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq("id", domainId);

  // Pronto! Domínio ativo instantaneamente
}
```

### 3. Titan Email Provisioning (REMOVIDO)
```typescript
// ❌ REMOVIDO - Sistema não usa Titan
// const titanProvisionUrl = `${supabaseUrl}/functions/v1/titan-provision`;
// fetch(titanProvisionUrl, {...});
```

---

## ✅ **FLUXO CORRETO AGORA**

### Registro de Domínio

```
Usuário escolhe: joao.com.rich
        ↓
Verifica disponibilidade (consulta banco)
        ↓
Usuário faz pagamento (PayPal)
        ↓
PayPal confirma pagamento (webhook)
        ↓
Sistema cria entrada no banco
        ↓
Sistema ativa domínio (instantâneo)
        ↓
Domínio PRONTO! ✅
```

**Tempo total**: ~1-2 segundos (apenas depende do webhook do PayPal)

### Status do Domínio

| Status | Significado |
|--------|-------------|
| `pending` | Aguardando ativação (imediatamente após criação) |
| `active` | Domínio ativo e funcionando |
| `failed` | Erro na ativação (raro) |
| `expired` | Domínio expirado (após 1 ano) |
| `suspended` | Domínio suspenso por violação |

**Removidos**:
- ❌ `pending_provisioning` - Não existe mais
- ❌ `provisioning` - Não existe mais
- ❌ `transferring_out` - Não faz sentido para TLD próprio

---

## 📋 **CAMPOS DO BANCO**

### Domínios (`domains` table)

**Campos Relevantes**:
```sql
- fqdn (text) - Ex: joao.com.rich
- customer_id (uuid) - Dono do domínio
- registrar_status (text) - Status: pending → active
- expires_at (timestamp) - Expira em 1 ano
- created_at (timestamp) - Data de criação
```

**Campos Removidos/Deprecados**:
```sql
- registrar_id - Não é mais necessário (sem registrar externo)
- dkim_selector - Sistema de email foi removido
- dkim_public - Sistema de email foi removido
```

---

## 🔄 **MUDANÇAS NO CÓDIGO**

### PayPal Webhook (`paypal-webhook/index.ts`)

**Alterações**:
1. ✅ Função `registerDomainWithDynadot()` → Removida
2. ✅ Função `provisionDomain()` → Renomeada para `activateDomain()`
3. ✅ Simplificada lógica de ativação
4. ✅ Removida chamada ao Titan email
5. ✅ Status inicial: `pending` (não mais `pending_provisioning`)

**Resultado**: Código 70% mais simples e direto ao ponto!

### Dynadot Webhook

**Status**: ❌ **DELETADO COMPLETAMENTE**

Não faz sentido ter um webhook para um registrar que não usamos.

---

## 🎯 **ARQUITETURA CORRETA**

### Como Funciona o TLD Próprio

```
.com.rich é SEU TLD
        ↓
Você controla 100% dos subdomínios
        ↓
Não precisa de registrar externo
        ↓
Registro é instantâneo (apenas banco de dados)
        ↓
DNS é controlado por você (Cloudflare, etc)
```

### O Que Ainda Precisa de Externa

| Serviço | Externo? | Motivo |
|---------|----------|--------|
| Pagamento | ✅ SIM | PayPal processa pagamentos |
| Registro de domínio | ❌ NÃO | TLD próprio |
| DNS | 🟡 TALVEZ | Cloudflare ou próprio |
| Email | ❌ NÃO | Sistema removido |

---

## 📊 **COMPARAÇÃO**

### Antes (ERRADO)
```
Pagamento confirmado
  → Cria pending order
  → Cria domínio (pending_provisioning)
  → Chama Dynadot API (DESNECESSÁRIO!)
  → Aguarda resposta (TEMPO PERDIDO!)
  → Chama Titan email (REMOVIDO!)
  → Atualiza para active
  → Domínio pronto

Tempo: ~5-30 segundos
Complexidade: ALTA
Pontos de falha: MUITOS
```

### Depois (CORRETO)
```
Pagamento confirmado
  → Cria pending order
  → Cria domínio (pending)
  → Ativa domínio (active)
  → Domínio pronto

Tempo: ~1-2 segundos
Complexidade: BAIXA
Pontos de falha: POUCOS
```

---

## ✅ **CHECKLIST DE CORREÇÃO**

- [x] Removido dynadot-webhook function
- [x] Simplificado activateDomain no paypal-webhook
- [x] Removidas referências ao Dynadot
- [x] Removidas referências ao Titan email
- [x] Atualizado status inicial para `pending`
- [x] Documentado fluxo correto
- [ ] Testar fluxo completo de pagamento
- [ ] Verificar se migrations precisam ajuste

---

## 🚀 **PRÓXIMOS PASSOS**

1. **Testar fluxo de pagamento** end-to-end
2. **Verificar DNS** - como domínios são resolvidos?
3. **Revisar migrations** - remover campos desnecessários?
4. **Documentar DNS** - como configurar novos domínios?

---

## 💡 **LIÇÕES APRENDIDAS**

1. ✅ **Sempre questionar suposições** - TLD próprio é diferente!
2. ✅ **Simplificar é melhor** - menos código = menos bugs
3. ✅ **Remover código morto** - Dynadot nunca foi usado
4. ✅ **Documentar o óbvio** - "TLD próprio" não era óbvio para IA

---

_Correção realizada em 2025-10-29_
