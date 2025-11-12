# 🏛️ PIX.GLOBAL — ARQUITETURA OFICIAL

**Versão:** 1.0 Final  
**Status:** ✅ Implementado

## 📋 PRINCÍPIO FUNDAMENTAL

> **PayPal = APENAS gateway de entrada de dinheiro real**  
> **Toda economia interna = 100% dentro do Pix.Global**

---

## 🎯 COMISSIONAMENTO (CRÍTICO!)

### ✅ GERA Comissão (10%):
- Vendas diretas via PayPal (`source = 'system'`)
- Identity Subscription
- Carrinho One-Time

### ❌ NÃO GERA Comissão:
- Marketplace P2P (`source = 'marketplace'`)  
- Transferências gratuitas  
- Trocas entre usuários

Taxa 5% do marketplace é retida pela plataforma, NÃO gera comissão de afiliado.

---

## 📦 TRÊS CLASSES

| Classe | Anuidade | Transferência | Comissão |
|--------|----------|---------------|----------|
| Identity | Sim ($25/$35) | 12 meses | ✅ Sim (venda direta) |
| Credit | Não | Imediata | ✅ Sim (venda direta) |
| Quick Access | Não | Imediata | ✅ Sim (venda direta) |

---

## 🔄 FLUXOS

### PayPal (Entrada):
```
Cliente → PayPal → Webhook → Core → Comissão (source=system) ✅
```

### Marketplace (Interno):
```
Vendedor → Comprador (créditos) → Taxa 5% → SEM comissão ❌
```

### Transfer (Interno):
```
A → B (token) → Propriedade transferida → SEM comissão ❌
```

---

## ✅ STATUS

Build: 18.86s - SEM ERROS  
Documentação completa em `/docs/`

**Pronto para produção!** 🚀
