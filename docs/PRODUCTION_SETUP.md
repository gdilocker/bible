# Pix.Global - Production Setup Guide

Este guia detalha a configuração de chaves e credenciais para ambiente de produção.

---

## 📋 Overview

O sistema Pix.Global requer 5 integrações principais:

1. **PayPal** - Processamento de pagamentos
2. **Cloudflare** - Gerenciamento de DNS dinâmico
3. **Polygon RPC** - Blockchain (Polygon Mainnet)
4. **IPFS/Pinata** - Armazenamento de metadata NFT
5. **NFT Contract** - Smart Contract ERC-721

---

## 🔑 1. PayPal (LIVE Mode)

### Requisitos
- Conta PayPal Business verificada
- Localização: Qualquer país com suporte a PayPal Business

### Passos de Configuração

#### 1.1 Criar App PayPal
1. Acesse: https://developer.paypal.com/dashboard
2. Navegue até **My Apps & Credentials**
3. Selecione a aba **Live** (não sandbox)
4. Clique em **Create App**
5. Preencha:
   - **App Name**: Pix.Global
   - **App Type**: Merchant
6. Clique em **Create App**

#### 1.2 Obter Credenciais
No dashboard do app criado, anote:

```bash
PAYPAL_CLIENT_ID=AXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYPAL_CLIENT_SECRET=ELxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYPAL_ENV=live
```

#### 1.3 Configurar Webhook
1. No menu lateral, clique em **Webhooks**
2. Clique em **Add Webhook**
3. Preencha:
   - **Webhook URL**: `https://bjiymzindbxpdxhhuwgg.supabase.co/functions/v1/paypal-webhook`
   - **Event types**: Selecione:
     - `PAYMENT.CAPTURE.COMPLETED` (obrigatório)
     - `PAYMENT.CAPTURE.DENIED`
     - `PAYMENT.CAPTURE.REFUNDED`
4. Clique em **Save**

Anote o Webhook ID:
```bash
PAYPAL_WEBHOOK_ID=7XXxxxxxxxxxxxxxxxxxx
```

### Variáveis de Ambiente
```bash
PAYMENT_PROVIDER=paypal
PAYPAL_ENV=live
PAYPAL_CLIENT_ID=AXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYPAL_CLIENT_SECRET=ELxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYPAL_WEBHOOK_ID=7XXxxxxxxxxxxxxxxxxxx
```

### Teste de Validação
```bash
curl https://bjiymzindbxpdxhhuwgg.supabase.co/functions/v1/health-secrets
# Espera: { "checks": { "paypal": true, ... } }
```

---

## 🌐 2. Cloudflare (DNS Management)

### Requisitos
- Domínio `pix.global` configurado no Cloudflare
- Acesso ao dashboard do Cloudflare

### Passos de Configuração

#### 2.1 Obter Zone ID
1. Acesse: https://dash.cloudflare.com
2. Selecione o domínio **pix.global**
3. Na página de **Overview**, role até a seção **API**
4. Copie o **Zone ID**

```bash
CLOUDFLARE_ZONE_ID=1234567890abcdef1234567890abcdef
```

#### 2.2 Criar API Token
1. No menu superior direito, clique no seu perfil
2. Selecione **My Profile** → **API Tokens**
3. Clique em **Create Token**
4. Use o template **Edit zone DNS**
5. Configure:
   - **Permissions**:
     - Zone → DNS → Edit
   - **Zone Resources**:
     - Include → Specific zone → `pix.global`
   - **Client IP Address Filtering**: (deixe vazio para aceitar qualquer IP)
   - **TTL**: Start now, End never
6. Clique em **Continue to summary** → **Create Token**

Copie o token (aparece apenas uma vez):
```bash
CLOUDFLARE_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Variáveis de Ambiente
```bash
CLOUDFLARE_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLOUDFLARE_ZONE_ID=1234567890abcdef1234567890abcdef
CLOUDFLARE_API_BASE=https://api.cloudflare.com/client/v4
```

### Teste de Validação
```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/dns_records?per_page=1" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json"

# Espera: { "success": true, "result": [...] }
```

---

## ⛓️ 3. Polygon RPC (Alchemy)

### Requisitos
- Conta Alchemy (gratuita)
- Wallet MetaMask com MATIC para gas fees

### Passos de Configuração

#### 3.1 Criar App no Alchemy
1. Acesse: https://alchemy.com
2. Clique em **Create Account** (ou faça login)
3. No dashboard, clique em **+ Create new app**
4. Preencha:
   - **Name**: Pix.Global
   - **Chain**: Polygon
   - **Network**: Polygon Mainnet
5. Clique em **Create app**

#### 3.2 Obter RPC URL
1. No card do app criado, clique em **View Details**
2. Clique em **View Key**
3. Copie o **HTTPS endpoint**

```bash
RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

#### 3.3 Configurar Wallet
1. Abra MetaMask
2. Adicione rede Polygon Mainnet (se necessário)
3. Copie o endereço da sua wallet

```bash
OWNER_WALLET=0x1234567890123456789012345678901234567890
```

**IMPORTANTE:**
- Mantenha a seed phrase da wallet em local seguro (papel, cofre físico)
- Transfira MATIC para a wallet para pagar gas fees (~0.01 MATIC por mint)
- Nunca exponha a private key em código ou logs

### Variáveis de Ambiente
```bash
RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
OWNER_WALLET=0x1234567890123456789012345678901234567890
```

### Teste de Validação
```bash
curl -X POST "YOUR_RPC_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "web3_clientVersion",
    "params": [],
    "id": 1
  }'

# Espera: { "jsonrpc": "2.0", "id": 1, "result": "Geth/..." }
```

---

## 📦 4. IPFS (Pinata)

### Requisitos
- Conta Pinata (plano gratuito suporta 1GB)

### Passos de Configuração

#### 4.1 Criar Conta Pinata
1. Acesse: https://pinata.cloud
2. Clique em **Sign Up** e complete o cadastro
3. Verifique seu email

#### 4.2 Criar API Key
1. No dashboard, navegue até **API Keys** (menu lateral)
2. Clique em **+ New Key**
3. Configure:
   - **Key Name**: Pix.Global Production
   - **Admin**: ✓ (marque todas as permissões)
4. Clique em **Create Key**

Anote as credenciais (aparecem apenas uma vez):
```bash
IPFS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
IPFS_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Variáveis de Ambiente
```bash
IPFS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
IPFS_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
IPFS_GATEWAY_URL=https://gateway.pinata.cloud
```

### Teste de Validação
```bash
curl -X GET "https://api.pinata.cloud/data/testAuthentication" \
  -H "pinata_api_key: YOUR_API_KEY" \
  -H "pinata_secret_api_key: YOUR_SECRET"

# Espera: { "message": "Congratulations! You are communicating with the Pinata API!" }
```

---

## 🎨 5. NFT Contract (ERC-721)

### Opção A: thirdweb (Recomendado - Mais Fácil)

#### 5.1 Deploy via thirdweb
1. Acesse: https://thirdweb.com/dashboard
2. Clique em **Connect Wallet** e conecte sua MetaMask
3. Clique em **Deploy new contract**
4. Selecione **NFT Collection** (ERC-721)
5. Preencha:
   - **Name**: Pix.Global Domains
   - **Symbol**: PIXDOM
   - **Description**: Digital Identity Certificates for Pix.Global
   - **Network**: Polygon (Mainnet)
6. Clique em **Deploy Now**
7. Confirme a transação no MetaMask (pague gas fee em MATIC)

#### 5.2 Obter Contract Address e ABI
1. Após deploy, copie o **Contract Address** (0x...)
2. Clique na aba **Code**
3. Role até **Contract ABI** e clique em **Copy ABI JSON**

```bash
NFT_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
NFT_CONTRACT_ABI_JSON='[{"inputs":[],"name":"name","outputs":[{"type":"string"}],...}]'
```

### Opção B: Remix + OpenZeppelin (Avançado)

#### 5.1 Gerar Contrato
1. Acesse: https://wizard.openzeppelin.com
2. Selecione **ERC721**
3. Configure:
   - **Name**: Pix.Global Domains
   - **Symbol**: PIXDOM
   - **Features**: Mintable, URI Storage, Ownable
4. Copie o código gerado

#### 5.2 Deploy via Remix
1. Acesse: https://remix.ethereum.org
2. Cole o código do contrato
3. Compile o contrato (Ctrl+S)
4. Vá para **Deploy & Run Transactions**
5. Selecione:
   - **Environment**: Injected Provider - MetaMask
   - **Contract**: PixGlobalDomains
6. Clique em **Deploy**
7. Confirme no MetaMask

#### 5.3 Obter ABI
1. No Remix, vá para **Solidity Compiler**
2. Role até **Compilation Details**
3. Clique em **ABI** e copie o JSON

### Variáveis de Ambiente
```bash
NFT_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
NFT_CONTRACT_ABI_JSON='[{"inputs":[],"name":"name",...}]'
```

### Teste de Validação
```bash
curl -X POST "YOUR_RPC_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_call",
    "params": [
      {
        "to": "YOUR_CONTRACT_ADDRESS",
        "data": "0x06fdde03"
      },
      "latest"
    ],
    "id": 1
  }'

# Espera: { "jsonrpc": "2.0", "id": 1, "result": "0x..." }
# (result não pode ser "0x" - indica contrato encontrado)
```

---

## 🔐 Arquivo .env Final

Copie o template `.env.example` para `.env` e preencha:

```bash
# Supabase (já configurado)
VITE_SUPABASE_URL=https://bjiymzindbxpdxhhuwgg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudflare
CLOUDFLARE_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLOUDFLARE_ZONE_ID=1234567890abcdef1234567890abcdef
CLOUDFLARE_API_BASE=https://api.cloudflare.com/client/v4

# Blockchain / NFT
RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
NFT_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
NFT_CONTRACT_ABI_JSON='[{"inputs":[],"name":"name",...}]'
OWNER_WALLET=0x1234567890123456789012345678901234567890

# IPFS
IPFS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
IPFS_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
IPFS_GATEWAY_URL=https://gateway.pinata.cloud

# PayPal LIVE
PAYMENT_PROVIDER=paypal
PAYPAL_ENV=live
PAYPAL_CLIENT_ID=AXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYPAL_CLIENT_SECRET=ELxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYPAL_WEBHOOK_ID=7XXxxxxxxxxxxxxxxxxxx

# URLs Públicas
PUBLIC_BASE_URL=https://pix.global
PUBLIC_APP_URL=https://app.pix.global
PUBLIC_API_URL=https://api.pix.global
```

---

## ✅ Validação Final

### Health Check Endpoint

Execute o health check para validar todas as chaves:

```bash
curl https://bjiymzindbxpdxhhuwgg.supabase.co/functions/v1/health-secrets
```

**Resposta esperada (SUCCESS):**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-20T10:00:00.000Z",
  "checks": {
    "paypal": true,
    "cloudflare": true,
    "rpc": true,
    "ipfs": true,
    "nft": true
  },
  "details": {
    "paypal": "Connected",
    "cloudflare": "Connected",
    "rpc": "Connected",
    "ipfs": "Connected",
    "nft": "Contract verified"
  },
  "summary": {
    "total": 5,
    "passed": 5,
    "failed": 0,
    "percentage": 100
  }
}
```

### Interpretação dos Resultados

| Status | HTTP Code | Significado |
|--------|-----------|-------------|
| `healthy` | 200 | ✅ Todas as 5 chaves validadas |
| `degraded` | 503 | ⚠️ Uma ou mais chaves com problema |
| `error` | 500 | ❌ Erro interno no health check |

### Troubleshooting

Se algum check falhar:

#### PayPal: false
- ✓ Verifique se as credenciais são LIVE (não sandbox)
- ✓ Confirme que CLIENT_ID e CLIENT_SECRET estão corretos
- ✓ Teste obter token manualmente: https://developer.paypal.com/api/rest/

#### Cloudflare: false
- ✓ Verifique se o API Token tem permissão DNS:Edit
- ✓ Confirme que o Zone ID está correto
- ✓ Teste listar DNS records manualmente via API

#### RPC: false
- ✓ Verifique se o RPC URL é Polygon Mainnet (não Mumbai testnet)
- ✓ Confirme que o endpoint está respondendo
- ✓ Teste chamada RPC manual: `web3_clientVersion`

#### IPFS: false
- ✓ Verifique se API Key e Secret estão corretos
- ✓ Confirme que a conta Pinata está ativa
- ✓ Teste authentication endpoint manualmente

#### NFT: false
- ✓ Verifique se o contract address é válido (0x + 40 chars hex)
- ✓ Confirme que o contrato foi deployado (verifique no Polygonscan)
- ✓ Valide se o ABI JSON está bem formatado
- ✓ Teste chamada `name()` manualmente via RPC

---

## 🔒 Segurança

### Best Practices

1. **Nunca commite .env no repositório**
   - Arquivo `.env` está no `.gitignore`
   - Use `.env.example` como template

2. **Rotação de Chaves**
   - PayPal: Rotacione a cada 90 dias
   - Cloudflare: Rotacione se exposta em logs
   - IPFS: Rotacione se vazada

3. **Backup de Credenciais**
   - Armazene cópias em local seguro (1Password, LastPass)
   - Nunca em documentos locais ou emails

4. **Wallet Security**
   - Seed phrase em papel, em cofre físico
   - Nunca compartilhe private key
   - Use hardware wallet para produção (Ledger, Trezor)

5. **Monitoring**
   - Configure alertas para falhas no health check
   - Monitore transações blockchain suspeitas
   - Revise logs de webhook PayPal regularmente

---

## 📊 Próximos Passos

Após ter todos os checks em `true`:

1. ✅ **P1.5 Completo** - Chaves instaladas e validadas
2. → **P2** - Transição para produção (compra real)
3. → **P3** - Deploy em Netlify/Vercel
4. → **P4** - DNS propagation e testes finais

---

## 🆘 Suporte

### Links Úteis

- **PayPal Developer**: https://developer.paypal.com
- **Cloudflare API Docs**: https://developers.cloudflare.com/api
- **Alchemy Dashboard**: https://alchemy.com/dashboard
- **Pinata Docs**: https://docs.pinata.cloud
- **thirdweb Dashboard**: https://thirdweb.com/dashboard
- **Polygonscan**: https://polygonscan.com

### Checklist Final

Antes de seguir para P2, confirme:

- [ ] Arquivo `.env` preenchido com todas as chaves
- [ ] Health check retorna 100% (5/5 checks passed)
- [ ] Wallet tem MATIC suficiente para gas (~0.1 MATIC)
- [ ] NFT Contract deployado e verificado no Polygonscan
- [ ] PayPal Webhook configurado e ativo
- [ ] Backup das credenciais feito em local seguro

---

**Status:** Ready for Production Testing (P2) ✅
