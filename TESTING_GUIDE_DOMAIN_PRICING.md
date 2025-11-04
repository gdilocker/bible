# 🧪 Guia de Testes - Sistema de Precificação por Assinatura

**Data:** 28 de Outubro de 2025
**Status:** ✅ **DEPLOYED & READY TO TEST**

---

## 📋 **O QUE FOI IMPLEMENTADO**

Sistema inteligente que detecta se o usuário possui assinatura ativa e ajusta automaticamente:

- **Preços exibidos** (mensal do plano vs $100/ano)
- **Botões de ação** (Ver Planos vs Adicionar Domínio)
- **Mensagens** (personalizadas por status de assinatura)

---

## 🚀 **DEPLOYMENT STATUS**

| Componente | Status | Observação |
|------------|--------|------------|
| Edge Function `domains` | ✅ Deployed | Detecta userId e assinatura |
| Frontend `DomainSearch.tsx` | ✅ Updated | Envia auth token |
| Build | ✅ Success | 9.62s |
| Arquivo de teste | ✅ Created | `test-domain-pricing.html` |

---

## 🧪 **COMO TESTAR**

### **Opção 1: Teste Manual no Aplicativo**

#### **1. Teste SEM Assinatura (Usuário não logado)**

```bash
1. Abrir navegador em modo anônimo
2. Acessar https://seu-dominio.com
3. Na barra de busca, digitar: "teste123"
4. Clicar em "Buscar"

✅ RESULTADO ESPERADO:
   - Badge: "✅ Disponível"
   - Preço: "$50/mês" (ou valor do plano Standard)
   - Descrição: "Plano Standard"
   - Botão: "Ver Planos"
   - Ao clicar: redireciona para /valores
```

#### **2. Teste COM Assinatura Standard (Domínio Regular)**

```bash
1. Fazer login com conta que tem plano Standard ativo
2. Na barra de busca, digitar: "teste456"
3. Clicar em "Buscar"

✅ RESULTADO ESPERADO:
   - Badge: "✅ Disponível"
   - Preço: "$100/ano" ⭐ NOVO
   - Descrição: "Domínio adicional"
   - Botão: "Adicionar domínio por $100/ano" ⭐ NOVO
   - Ao clicar: redireciona para /checkout?price=100
```

#### **3. Teste COM Assinatura Standard (Domínio Premium)**

```bash
1. Fazer login com conta que tem plano Standard ativo
2. Na barra de busca, digitar: "ferrari"
3. Clicar em "Buscar"

✅ RESULTADO ESPERADO:
   - Badge: "💎 PREMIUM"
   - Mensagem: "Faça upgrade para acessar domínios premium"
   - Botão: "Fazer Upgrade para Elite"
   - Ao clicar: redireciona para /panel/billing
```

#### **4. Teste COM Assinatura Elite (Domínio Premium)**

```bash
1. Fazer login com conta que tem plano Elite ativo
2. Na barra de busca, digitar: "rolex"
3. Clicar em "Buscar"

✅ RESULTADO ESPERADO:
   - Badge: "💎 PREMIUM"
   - Preço: "Sob Consulta"
   - Botão: "Solicitar Orçamento"
   - Ao clicar: redireciona para /panel/support
```

---

### **Opção 2: Teste Automatizado (HTML)**

Foi criado um arquivo de teste interativo em `test-domain-pricing.html`.

#### **Como usar:**

1. **Configurar credenciais:**
   ```javascript
   // Editar as linhas no arquivo test-domain-pricing.html:
   const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
   const SUPABASE_ANON_KEY = 'SUA_ANON_KEY';
   ```

2. **Abrir o arquivo:**
   ```bash
   # Opção 1: Abrir diretamente no navegador
   open test-domain-pricing.html

   # Opção 2: Servir via HTTP
   python3 -m http.server 8000
   # Acessar: http://localhost:8000/test-domain-pricing.html
   ```

3. **Executar testes:**
   - Login com credenciais de teste
   - Clicar nos botões de teste
   - Verificar resultados exibidos
   - Comparar JSON responses

---

## 📊 **CHECKLIST DE TESTES**

### **Cenários Críticos:**

- [ ] **Teste 1:** Usuário não logado busca domínio regular
  - Deve ver: "Ver Planos" + preço mensal

- [ ] **Teste 2:** Usuário logado SEM assinatura busca domínio regular
  - Deve ver: "Ver Planos" + preço mensal

- [ ] **Teste 3:** Usuário COM Standard busca domínio regular
  - Deve ver: **"$100/ano"** + "Adicionar domínio" ⭐ PRINCIPAL

- [ ] **Teste 4:** Usuário COM Elite busca domínio regular
  - Deve ver: **"$100/ano"** + "Adicionar domínio" ⭐ PRINCIPAL

- [ ] **Teste 5:** Usuário COM Standard busca domínio premium
  - Deve ver: "Fazer Upgrade para Elite"

- [ ] **Teste 6:** Usuário COM Elite busca domínio premium
  - Deve ver: "Solicitar Orçamento"

---

## 🔍 **VALIDAÇÃO DA RESPOSTA DA API**

### **Campos novos na resposta:**

```typescript
interface DomainCheckResult {
  // ... campos existentes
  userHasSubscription?: boolean;     // ⭐ NOVO
  userPlanType?: string;              // ⭐ NOVO (standard|elite)
  showDirectPurchase?: boolean;       // ⭐ NOVO
  price: {
    monthly: number;
    currency: string;
    yearly?: number;                  // ⭐ NOVO (sempre 100)
  } | null;
}
```

### **Exemplo de resposta para usuário COM assinatura:**

```json
{
  "status": "AVAILABLE",
  "fqdn": "teste456.com.rich",
  "isAvailable": true,
  "isPremium": false,
  "planRequired": "STANDARD_OR_ELITE",
  "price": {
    "monthly": 50,
    "currency": "USD",
    "yearly": 100           // ⭐ NOVO - preço anual fixo
  },
  "message": "✅ Domínio disponível para registro.\nAdicione este domínio por US$ 100/ano.",
  "userHasSubscription": true,     // ⭐ NOVO
  "userPlanType": "standard",      // ⭐ NOVO
  "showDirectPurchase": true       // ⭐ NOVO
}
```

### **Exemplo de resposta para usuário SEM assinatura:**

```json
{
  "status": "AVAILABLE",
  "fqdn": "teste456.com.rich",
  "isAvailable": true,
  "isPremium": false,
  "planRequired": "STANDARD_OR_ELITE",
  "price": {
    "monthly": 50,
    "currency": "USD"
    // yearly NÃO aparece
  },
  "message": "✅ Domínio disponível para registro.\nPara registrar este domínio, escolha um dos nossos planos de licenciamento.",
  "userHasSubscription": false,    // ⭐ NOVO
  "showDirectPurchase": false      // ⭐ NOVO
}
```

---

## 🐛 **TROUBLESHOOTING**

### **Problema 1: Sempre mostra "Ver Planos" mesmo logado**

**Possíveis causas:**
- Auth token não está sendo enviado
- Usuário não tem assinatura ativa no banco
- Campo `status` da subscription não é `'active'`

**Como verificar:**
```sql
-- No Supabase SQL Editor:
SELECT
  u.email,
  s.status,
  sp.plan_type
FROM auth.users u
LEFT JOIN subscriptions s ON s.user_id = u.id
LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
WHERE u.email = 'seu@email.com';
```

**Solução:**
```sql
-- Se subscription não existe ou está inativa:
UPDATE subscriptions
SET status = 'active'
WHERE user_id = 'USER_ID_AQUI';
```

---

### **Problema 2: Erro "Could not extract user ID"**

**Causa:** Token inválido ou expirado

**Como verificar:**
1. Abrir DevTools (F12)
2. Aba Network
3. Buscar request para `/functions/v1/domains`
4. Verificar header `Authorization`

**Solução:**
- Fazer logout e login novamente
- Verificar se session está ativa:
  ```javascript
  const { data } = await supabase.auth.getSession();
  console.log('Session:', data.session);
  ```

---

### **Problema 3: Preço sempre $50/mês**

**Causa:** Campo `price.yearly` não está sendo retornado

**Como verificar:**
1. Abrir DevTools → Network
2. Ver response da API `/domains`
3. Verificar se `userHasSubscription: true`

**Solução:**
- Verificar se edge function foi deployada
- Checar logs da edge function:
  ```bash
  # No Supabase Dashboard:
  Functions → domains → Logs
  ```

---

## 📝 **TESTES DE REGRESSÃO**

Após implementar, verificar que funcionalidades antigas não quebraram:

- [ ] Busca de domínios indisponíveis continua funcionando
- [ ] Sugestões de domínios alternativos aparecem
- [ ] Busca de perfis públicos (sem `.com.rich`) funciona
- [ ] Redirecionamento para landing page de premium funciona
- [ ] Catálogo de domínios premium carrega normalmente

---

## 🎯 **CRITÉRIOS DE SUCESSO**

✅ **O sistema está funcionando corretamente quando:**

1. Usuário **SEM assinatura** vê "Ver Planos" e preço mensal
2. Usuário **COM assinatura** vê "$100/ano" e botão de adicionar
3. Transição de não-assinante → assinante atualiza os preços automaticamente
4. Não há erros no console do navegador
5. Build passa sem erros
6. Edge function retorna response em < 2 segundos

---

## 📸 **SCREENSHOTS ESPERADOS**

### **Antes (para todos os usuários):**
```
┌─────────────────────────────────┐
│ teste.com.rich        ✅        │
│                                 │
│ Disponível para registro       │
│                                 │
│           $50/mês               │
│         Plano Standard          │
│                                 │
│      [ Ver Planos ]             │
└─────────────────────────────────┘
```

### **Depois (para usuários COM assinatura):**
```
┌─────────────────────────────────┐
│ teste.com.rich        ✅        │
│                                 │
│ Disponível para registro       │
│ Adicione por US$ 100/ano        │
│                                 │
│         $100/ano  ⭐            │
│      Domínio adicional          │
│                                 │
│  [ Adicionar por $100/ano ]  ⭐ │
└─────────────────────────────────┘
```

---

## 🚀 **PRÓXIMAS ETAPAS**

Após confirmar que tudo está funcionando:

1. [ ] Testar em produção com usuários reais
2. [ ] Monitorar logs da edge function por 24h
3. [ ] Coletar feedback de 5-10 usuários
4. [ ] Ajustar mensagens se necessário
5. [ ] Documentar casos especiais encontrados

---

## 📞 **SUPORTE**

Se encontrar problemas:

1. Verificar logs da edge function no Supabase Dashboard
2. Verificar console do navegador (F12)
3. Testar com arquivo `test-domain-pricing.html`
4. Verificar status das assinaturas no banco de dados

---

## ✅ **DEPLOYMENT COMPLETO**

```
✅ Edge Function: DEPLOYED
✅ Frontend: BUILT
✅ Documentação: CRIADA
✅ Testes: PRONTOS
✅ Status: PRODUCTION READY
```

**Sistema pronto para uso!** 🎉

---

**Criado em:** 28/10/2025
**Última atualização:** 28/10/2025
**Versão:** 1.0.0
