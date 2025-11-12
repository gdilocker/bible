# 💳 ARQUITETURA FINANCEIRA PIX.GLOBAL

## 📋 RESUMO EXECUTIVO

**PayPal é APENAS o gateway de entrada de pagamentos externos.**

Após a entrada do dinheiro, **toda a economia interna** (revendas, comissões, transferências) acontece **100% dentro do sistema Pix.Global**, sem nenhuma interação com PayPal.

---

## 🎯 CONCEITO FUNDAMENTAL

```
┌─────────────────────────────────────────────────────────────┐
│                    MUNDO EXTERNO (Dinheiro Real)            │
│                                                             │
│  Cliente → PayPal → Pix.Global (Empresa)                   │
│                                                             │
│  [ÚNICA ENTRADA DE DINHEIRO REAL]                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    PayPal encerra aqui
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              ECONOMIA INTERNA PIX.GLOBAL                    │
│                                                             │
│  • Créditos Internos                                        │
│  • Marketplace P2P                                          │
│  • Comissões                                                │
│  • Transferências                                           │
│  • Recompensas (domínios)                                   │
│  • Taxas (5%)                                               │
│                                                             │
│  [SEM PAYPAL - TUDO INTERNO]                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUXO OPERACIONAL DETALHADO

### **1️⃣ COMPRA EXTERNA (Dinheiro Real → PayPal)**

#### **Cenário A: Compra de Identity (Assinatura)**
```
Cliente → PayPal Subscription ($25 ou $35/ano)
    ↓
PayPal processa
    ↓
Webhook: payment_succeeded
    ↓
Sistema Pix.Global:
  ✅ Libera identity + página
  ✅ Ativa assinatura
  ✅ Registra venda confirmada
  ✅ Calcula comissão (10% do valor)
  ✅ Converte em CRÉDITOS PIX.GLOBAL (não dinheiro)
  ✅ Gera domínio de recompensa automaticamente
    ↓
PayPal ENCERRA AQUI
```

#### **Cenário B: Compra de Credit/Quick Access (One-Time)**
```
Cliente → Carrinho (múltiplos domínios)
    ↓
PayPal One-Time (ex: $1.002 por 777 + a1)
    ↓
PayPal processa
    ↓
Webhook: capture.completed
    ↓
Sistema Pix.Global:
  ✅ Registra TODOS os domínios atomicamente
  ✅ Marca venda confirmada
  ✅ Calcula comissão (10%)
  ✅ Converte em CRÉDITOS PIX.GLOBAL
  ✅ Gera domínio de recompensa
    ↓
PayPal ENCERRA AQUI
```

**IMPORTANTE:**
- Dinheiro entra na conta PayPal da empresa Pix.Global
- PayPal desconta suas taxas (2.9% + $0.30)
- Sistema recebe confirmação via webhook
- **A partir daqui, TUDO é interno**

---

### **2️⃣ ECONOMIA INTERNA (Sem PayPal)**

Tudo que acontece entre usuários é **100% dentro do sistema Pix.Global**, usando **créditos internos**.

#### **A. Marketplace P2P**

```
Usuário A lista domínio "777.pix.global" por $500
    ↓
Usuário B compra usando CRÉDITOS PIX.GLOBAL
    ↓
Sistema Pix.Global (transação interna):
  ✅ Transfere propriedade A → B
  ✅ Debita $500 de créditos de B
  ✅ Credita $475 para A (desconta 5% de taxa)
  ✅ $25 fica para Pix.Global (receita da plataforma)
  ✅ Registra comissão se houver afiliado
  ✅ Gera domínio de recompensa para comissão
    ↓
NENHUMA INTERAÇÃO COM PAYPAL
```

**Fluxo SQL:**
```sql
BEGIN TRANSACTION;

-- 1. Transferir propriedade
UPDATE domains
SET user_id = buyer_id
WHERE id = domain_id;

-- 2. Processar pagamento em créditos internos
UPDATE user_wallets
SET balance = balance - 500
WHERE user_id = buyer_id;

UPDATE user_wallets
SET balance = balance + 475  -- 500 - 5%
WHERE user_id = seller_id;

-- 3. Registrar taxa da plataforma
INSERT INTO platform_revenue (amount, source, type)
VALUES (25, listing_id, 'marketplace_fee');

-- 4. Registrar comissão se houver afiliado
INSERT INTO partner_commissions (...)
VALUES (...);

COMMIT;
```

#### **B. Comissões**

```
Venda confirmada de $750
    ↓
Parceiro tem direito a 10% = $75
    ↓
Sistema Pix.Global:
  ✅ NÃO paga $75 em dinheiro
  ✅ Converte em CRÉDITOS PIX.GLOBAL
  ✅ Trigger automático gera domínio de recompensa
  ✅ Ex: recebe "7474747.pix.global" (valor: $75)
  ✅ Parceiro pode:
     - Manter como investimento
     - Vender no marketplace (em créditos)
     - Transferir para outro usuário
    ↓
ZERO ENVOLVIMENTO DO PAYPAL
```

#### **C. Transferências de Domínios**

```
Usuário A quer transferir domínio para Usuário B
    ↓
Sistema Pix.Global:
  ✅ Verifica regras (carência de 12 meses para identity)
  ✅ Gera token seguro
  ✅ Envia e-mail para B
  ✅ B aceita com token
  ✅ Transferência registrada no banco
  ✅ Logs de auditoria
    ↓
TUDO CONTROLADO INTERNAMENTE
```

#### **D. Uso de Créditos**

Usuários podem usar seus créditos internos para:

1. **Comprar no Marketplace**
   - Compra domínios de outros usuários
   - Pagamento em créditos

2. **Pagar Taxas**
   - Taxa de listagem
   - Taxa de transferência premium
   - Upgrades de plano

3. **Trocar por Domínios**
   - Sistema pode ter "loja interna"
   - Domínios especiais só com créditos

4. **Acumular Valor**
   - Saldo em créditos
   - Sem expiração
   - Pode crescer com vendas

**Não há saques em dinheiro** (por design)

---

### **3️⃣ RECEITAS DA PLATAFORMA**

A Pix.Global ganha de **três formas**:

#### **A. Vendas Diretas (via PayPal)**
```
Cliente compra identity/credit/quick_access
    ↓
PayPal processa
    ↓
Pix.Global recebe dinheiro real (menos taxas PayPal)
    ↓
RECEITA PRIMÁRIA
```

#### **B. Taxas de Marketplace (interno)**
```
Venda P2P de $500
    ↓
Pix.Global retém 5% = $25 em créditos
    ↓
RECEITA SECUNDÁRIA (em créditos)
```

#### **C. Renovações (via PayPal)**
```
Assinatura identity renovada
    ↓
PayPal processa $25 ou $35
    ↓
Pix.Global recebe
    ↓
RECEITA RECORRENTE
```

---

## 🔐 BENEFÍCIOS DA ARQUITETURA

### **Para a Plataforma**

| Benefício | Descrição |
|-----------|-----------|
| **Segurança Jurídica** | PayPal só vê vendas legítimas de produtos digitais. Operações internas não passam por ele. |
| **Controle Total** | Todas as transferências P2P estão no banco de dados, sem risco de chargeback secundário. |
| **Sustentabilidade** | Valor circula dentro do ecossistema, fortalecendo a moeda interna. |
| **Evita Regulação** | Sem conversão para dinheiro real = não é instituição de pagamento. |
| **Monetização Contínua** | Taxas, renovações e upgrades mantêm receita recorrente. |
| **Zero Fraude Interna** | Transações P2P não podem sofrer chargeback (são em créditos). |

### **Para os Usuários**

| Benefício | Descrição |
|-----------|-----------|
| **Liquidez Interna** | Créditos podem ser usados para compras, sem depender de PayPal. |
| **Ativos Permanentes** | Domínios são propriedade vitalícia. |
| **Marketplace Ágil** | Compra/venda instantânea em créditos (sem esperar PayPal). |
| **Recompensas Reais** | Comissões viram domínios (ativos com valor). |
| **Economia Justa** | Taxas claras, sem surpresas. |

---

## 📊 TABELAS DO SISTEMA

### **Créditos Internos** (novo)

```sql
CREATE TABLE user_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id),
  balance_usd numeric(12,2) DEFAULT 0 CHECK (balance_usd >= 0),
  total_earned numeric(12,2) DEFAULT 0,
  total_spent numeric(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Histórico de movimentações
CREATE TABLE wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  amount numeric(12,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('credit', 'debit')),
  source text NOT NULL CHECK (source IN (
    'commission', 'marketplace_sale', 'marketplace_purchase',
    'platform_bonus', 'refund', 'fee'
  )),
  reference_id uuid,
  balance_after numeric(12,2) NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);
```

### **Receitas da Plataforma**

```sql
CREATE TABLE platform_revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric(12,2) NOT NULL,
  source_type text NOT NULL CHECK (source_type IN (
    'direct_sale',        -- Venda direta via PayPal
    'marketplace_fee',    -- Taxa 5% marketplace
    'subscription',       -- Renovação identity
    'transfer_fee'        -- Taxa de transferência premium
  )),
  source_id uuid,        -- ID da transação origem
  currency text DEFAULT 'USD',
  payment_method text,   -- 'paypal' ou 'internal_credits'
  created_at timestamptz DEFAULT now()
);
```

---

## 🔄 DIAGRAMA DE FLUXO

```
┌─────────────────────────────────────────────────────────────────┐
│                     ENTRADA (PayPal)                            │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ↓
              ┌─────────────────────────┐
              │  Cliente paga via PayPal │
              └─────────────────────────┘
                            │
                            ↓
              ┌─────────────────────────┐
              │ PayPal processa e repassa│
              └─────────────────────────┘
                            │
                            ↓
              ┌─────────────────────────┐
              │  Webhook confirmação     │
              └─────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              ECONOMIA INTERNA (Pix.Global)                      │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Marketplace │  │  Comissões   │  │ Transferências│        │
│  │     P2P      │  │  (domínios)  │  │   (tokens)    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│         │                  │                  │                │
│         └──────────────────┴──────────────────┘                │
│                            │                                    │
│                            ↓                                    │
│                  ┌──────────────────┐                          │
│                  │ Créditos Internos │                          │
│                  │   (user_wallets)  │                          │
│                  └──────────────────┘                          │
│                                                                 │
│  [ZERO INTERAÇÃO COM PAYPAL]                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### **FEITO:**
- ✅ PayPal One-Time para carrinho
- ✅ Registro atômico de múltiplos domínios
- ✅ Sistema de comissionamento
- ✅ Gerador automático de domínios de recompensa
- ✅ Painel de recompensas

### **A FAZER:**
- ⏳ Tabela `user_wallets` (carteira de créditos)
- ⏳ Tabela `wallet_transactions` (histórico)
- ⏳ Tabela `platform_revenue` (receitas)
- ⏳ Marketplace com pagamento em créditos internos
- ⏳ Sistema de transferências com tokens
- ⏳ PayPal Subscription para identity
- ⏳ Webhooks completos (refund/chargeback)

---

## 📝 REGRAS DE NEGÓCIO

### **1. Entrada de Dinheiro (PayPal)**
- ✅ Cliente compra com dinheiro real
- ✅ PayPal processa e repassa para Pix.Global
- ✅ Webhook confirma
- ✅ Sistema libera produto/serviço

### **2. Economia Interna (Créditos)**
- ✅ Comissões geram créditos (ou domínios)
- ✅ Marketplace usa créditos
- ✅ Transferências são gratuitas (ou taxa mínima)
- ✅ Sem saques em dinheiro

### **3. Receitas da Plataforma**
- ✅ Vendas diretas (PayPal → dinheiro real)
- ✅ Taxas internas (créditos → acumulados)
- ✅ Renovações (PayPal → dinheiro real)

### **4. Proteções**
- ✅ Créditos não expiram
- ✅ Domínios de recompensa são permanentes
- ✅ Transações internas não podem sofrer chargeback
- ✅ Auditoria completa de todas as operações

---

## 🎯 INSTRUÇÃO OFICIAL PARA BOLT

> **ARQUITETURA FINANCEIRA OFICIAL PIX.GLOBAL:**
>
> O PayPal deve ser integrado **exclusivamente** como gateway de entrada para:
> - Compras diretas de domínios (identity, credit, quick_access)
> - Assinaturas de planos (identity Basic/Pro)
>
> **Após a confirmação do pagamento via webhook**, todas as operações subsequentes devem ocorrer **inteiramente dentro do sistema Pix.Global**:
> - Marketplace P2P (pagamento em créditos internos)
> - Transferências de domínios (controle interno com tokens)
> - Comissões (pagas em créditos ou domínios gerados automaticamente)
> - Recompensas (domínios automáticos)
>
> **Nenhuma dessas transações internas deve gerar chamadas ou dependência do PayPal.**
>
> O sistema mantém uma carteira interna de créditos (`user_wallets`) onde:
> - Comissões são creditadas
> - Vendas P2P são debitadas/creditadas
> - Taxas são retidas pela plataforma
>
> **Não há conversão de créditos para dinheiro real.** O ecossistema é fechado.

---

## 🚀 PRÓXIMOS PASSOS

1. **Implementar carteira de créditos** (`user_wallets`)
2. **Marketplace com pagamento interno** (créditos)
3. **Sistema de transferências** (init/accept com tokens)
4. **PayPal Subscription** para identity
5. **Webhooks completos** (todas as situações)
6. **Painel de créditos** para usuários
7. **Dashboard de receitas** para admins

---

## 📚 GLOSSÁRIO

| Termo | Definição |
|-------|-----------|
| **Créditos Pix.Global** | Moeda interna da plataforma. Não conversível em dinheiro. |
| **Marketplace P2P** | Compra/venda entre usuários usando créditos. |
| **Domínio de Recompensa** | Domínio gerado automaticamente como pagamento de comissão. |
| **Carteira** | Saldo de créditos de cada usuário. |
| **Taxa de Plataforma** | 5% retido em vendas P2P. |
| **Economia Fechada** | Valor circula internamente, sem saques. |

---

## ✅ CONCLUSÃO

**A arquitetura está desenhada para:**

1. ✅ **Receber dinheiro real** apenas via PayPal (entrada controlada)
2. ✅ **Circular valor internamente** via créditos (economia fechada)
3. ✅ **Pagar comissões em ativos** (domínios gerados)
4. ✅ **Manter controle total** (sem depender de terceiros)
5. ✅ **Evitar fraudes internas** (créditos não são reversíveis)
6. ✅ **Garantir sustentabilidade** (taxas + renovações)

**Sistema financeiro robusto, seguro e escalável!** 💎🚀
