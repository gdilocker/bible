# 🚀 MOCK PAYMENT - QUICK START

**Tempo para começar:** 2 minutos
**Objetivo:** Testar funil de vendas completo sem PayPal

---

## ⚡ START EM 3 PASSOS

### 1. Ative o Mock Mode
```bash
# Já está ativo em .env:
VITE_USE_PAYMENT_MOCK=true
```

### 2. Inicie o Servidor
```bash
npm run dev
```

### 3. Teste o Funil
1. Abra http://localhost:5173
2. Busque: `testuser.rich`
3. Clique "Register"
4. Preencha o formulário
5. Selecione plano Prime
6. Aceite termos
7. Clique "Pagar com PayPal"

**Resultado esperado:** Success em ~5 segundos! 🎉

---

## ✅ VERIFICAÇÃO RÁPIDA

### Console do Browser (F12)
```
✅ [Checkout] Using MOCK payment mode
✅ [Mock Payment] Creating order
✅ 🔄 Processando captura MOCK
✅ [Mock Capture] ✅ Order created
✅ [Mock Capture] ✅ Domain created
✅ [Mock Capture] ✅ Subscription created
✅ 🧪 Mock Payment Details: {...}
```

### Database (Quick Query)
```sql
SELECT
  o.total_cents,
  d.registrar_status,
  s.status as subscription_status
FROM orders o
JOIN domains d ON d.customer_id = o.customer_id
LEFT JOIN subscriptions s ON s.user_id = (
  SELECT user_id FROM customers WHERE id = o.customer_id
)
WHERE o.paypal_order_id LIKE 'MOCK-%'
ORDER BY o.created_at DESC LIMIT 1;
```

**Esperado:**
- `total_cents`: 3500 (não zero!)
- `registrar_status`: 'active'
- `subscription_status`: 'active'

---

## 🔧 TROUBLESHOOTING

**Console diz "Using REAL payment mode"?**
```bash
# 1. Verifique .env
cat .env | grep MOCK

# 2. Reinicie servidor
Ctrl+C
npm run dev

# 3. Hard refresh browser
Ctrl+Shift+R
```

**Erro "Function not found"?**
```bash
# Deploy edge functions (se necessário)
# Via Supabase Dashboard ou CLI
```

---

## 📚 DOCUMENTAÇÃO COMPLETA

- **Setup detalhado:** `PAYMENT_MOCK_README.md` (14 páginas)
- **Test report:** `MOCK_FUNIL_REPORT.md` (análise completa)
- **Sales analysis:** `ANALISE_LOGICA_VENDAS.md` (27 páginas)

---

## 🎯 NEXT STEPS

1. ✅ Rodar teste básico (5 min)
2. ⏳ Validar queries SQL (2 min)
3. ⏳ Testar múltiplos planos (10 min)
4. ⏳ Aplicar fixes no sistema real (1-2 dias)

**Está pronto! Basta testar! 🚀**
