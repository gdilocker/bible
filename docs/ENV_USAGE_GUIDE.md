# 📖 Guia de Uso de Variáveis de Ambiente

## Estrutura

O projeto Pix.Global usa variáveis de ambiente para configurações sensíveis e específicas do ambiente.

### Arquivos

- `.env` - Variáveis reais (NÃO commitado no git)
- `.env.example` - Template de exemplo
- `src/lib/env.ts` - Helper para acessar variáveis de forma segura

## 🎯 Client-Side (React/Vite)

### Acessar variáveis no React:

```typescript
import { clientEnv } from '@/lib/env';

// Supabase
const supabaseUrl = clientEnv.supabase.url;
const supabaseKey = clientEnv.supabase.anonKey;

// URLs
const baseUrl = clientEnv.urls.base; // https://pix.global
const appUrl = clientEnv.urls.app;   // https://app.pix.global

// Ambiente
if (clientEnv.isDev) {
  console.log('Modo desenvolvimento');
}
```

### ⚠️ IMPORTANTE para Client-Side

- Apenas variáveis que começam com `VITE_` são expostas ao cliente
- Nunca coloque secrets (API keys, tokens) em variáveis `VITE_`
- Variáveis client são públicas no bundle final

## 🔐 Server-Side (Edge Functions)

### Acessar variáveis em Edge Functions:

```typescript
import { serverEnv, getEnvVar, requireEnvVar } from '../../../src/lib/env';

// Método 1: Usando helpers
const cloudflareToken = serverEnv.cloudflare.apiToken();
const paymentKey = serverEnv.payment.apiKey();

// Método 2: Acesso direto com default
const rpcUrl = getEnvVar('RPC_URL', 'https://default-rpc.com');

// Método 3: Obrigatória (lança erro se não existir)
const webhookSecret = requireEnvVar('PAYMENT_WEBHOOK_SECRET');
```

### Exemplo completo de Edge Function:

```typescript
// supabase/functions/cloudflare-dns/index.ts
import { serverEnv } from '../../../src/lib/env';

Deno.serve(async (req) => {
  try {
    // Acessar variáveis
    const apiToken = serverEnv.cloudflare.apiToken();
    const zoneId = serverEnv.cloudflare.zoneId();
    const apiBase = serverEnv.cloudflare.apiBase();

    if (!apiToken || !zoneId) {
      return new Response(
        JSON.stringify({ error: 'Cloudflare não configurado' }),
        { status: 500 }
      );
    }

    // Usar as variáveis
    const response = await fetch(`${apiBase}/zones/${zoneId}/dns_records`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return new Response(JSON.stringify(data));

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```

## 📦 Variáveis Disponíveis

### Supabase
```bash
VITE_SUPABASE_URL=          # URL do projeto (CLIENT)
VITE_SUPABASE_ANON_KEY=     # Chave pública (CLIENT)
SUPABASE_SERVICE_ROLE_KEY=  # Chave privada (SERVER)
```

### Cloudflare
```bash
CLOUDFLARE_API_TOKEN=       # Token da API
CLOUDFLARE_ZONE_ID=         # ID da zona DNS
CLOUDFLARE_API_BASE=        # URL base da API
```

### Blockchain/NFT
```bash
RPC_URL=                    # URL do nó RPC
NFT_CONTRACT_ADDRESS=       # Endereço do contrato
NFT_CONTRACT_ABI_JSON=      # ABI do contrato (JSON)
OWNER_WALLET=               # Carteira do proprietário
```

### IPFS
```bash
IPFS_API_KEY=               # Chave da API IPFS
IPFS_SECRET=                # Secret IPFS
IPFS_GATEWAY_URL=           # URL do gateway
```

### Pagamentos
```bash
PAYMENT_PROVIDER=           # mercadopago | stripe | paypal
PAYMENT_API_KEY=            # Chave da API
PAYMENT_WEBHOOK_SECRET=     # Secret do webhook
```

### URLs
```bash
PUBLIC_BASE_URL=            # https://pix.global
PUBLIC_APP_URL=             # https://app.pix.global
PUBLIC_API_URL=             # https://api.pix.global
```

## 🔍 Validação

### Validar variáveis obrigatórias:

```typescript
import { validateRequiredEnvVars } from '@/lib/env';

const requiredVars = [
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ZONE_ID',
  'PAYMENT_API_KEY',
];

const { valid, missing } = validateRequiredEnvVars(requiredVars);

if (!valid) {
  throw new Error(`Variáveis faltando: ${missing.join(', ')}`);
}
```

## 🚀 Deploy

### Netlify

1. Acesse: https://app.netlify.com/sites/your-site/settings/deploys#environment
2. Adicione cada variável com seu valor
3. Redeploy o site

### Vercel

```bash
# Via CLI
vercel env add CLOUDFLARE_API_TOKEN

# Ou no dashboard
# https://vercel.com/your-project/settings/environment-variables
```

### Supabase Edge Functions

As variáveis são automaticamente injetadas nas Edge Functions via:
- Painel do Supabase: Settings > Edge Functions > Environment Variables
- CLI: `supabase secrets set VAR_NAME=value`

## 🧪 Teste sem valores

O app compila mesmo sem valores preenchidos:

```bash
npm run build
```

Todos os helpers retornam strings vazias ou defaults seguros quando variáveis não estão definidas.

## 📋 Checklist de Setup

- [ ] Copiar `.env.example` para `.env`
- [ ] Preencher variáveis do Supabase
- [ ] Configurar Cloudflare (se usar DNS management)
- [ ] Configurar provedor de pagamento
- [ ] (Opcional) Configurar blockchain/NFT
- [ ] (Opcional) Configurar IPFS
- [ ] Testar build: `npm run build`
- [ ] Configurar variáveis no ambiente de produção

## ⚠️ Segurança

### ✅ PODE fazer:
- Usar `VITE_` para URLs públicas
- Acessar variáveis server-side em Edge Functions
- Commitar `.env.example`

### ❌ NÃO PODE:
- Commitar arquivo `.env` real
- Colocar secrets em variáveis `VITE_`
- Expor API keys no client-side
- Hardcodar valores sensíveis no código

## 🆘 Troubleshooting

### Erro: "Cannot read property of undefined"
- Variável não definida no `.env`
- Use `getEnvVar()` com default ou verifique ortografia

### Variável não acessível no cliente
- Variáveis client-side precisam começar com `VITE_`
- Reinicie o dev server após adicionar variável

### Edge Function não vê variável
- Configure no Supabase Dashboard
- Use `supabase secrets set` via CLI
- Verifique se não está usando `import.meta.env` (Node não suporta)

---

**Projeto**: Pix.Global
**Arquivo**: `src/lib/env.ts`
**Última atualização**: 2025-11-11
