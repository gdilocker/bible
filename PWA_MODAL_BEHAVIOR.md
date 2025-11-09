# 📱 Comportamento do Modal PWA

## ✅ **COMO FUNCIONA AGORA (SEM COOLDOWN)**

### **Quando o modal aparece:**

1. **Automaticamente após 3 segundos** em TODAS as visitas
2. **Sem limite de vezes** - aparece sempre
3. **Não bloqueia após dispensar** - volta na próxima visita

### **Quando NÃO aparece:**

- ❌ App já está **instalado** (detecta modo standalone)
- ❌ Apenas nestes casos (proteção básica)

---

## 📊 **ESTATÍSTICAS REGISTRADAS**

O modal registra automaticamente em `localStorage`:

```json
{
  "views": 15,              // Quantas vezes viu o modal
  "dismissCount": 8,        // Quantas vezes clicou "Agora não"
  "lastSeen": 1699999999,   // Timestamp última vez que viu
  "lastDismissed": 1699999888  // Timestamp última vez que dispensou
}
```

### **Como ver as estatísticas:**

```javascript
// No console do navegador:
JSON.parse(localStorage.getItem('pwa_stats'))
```

---

## 🎯 **COMPORTAMENTO ATUAL**

### **Desktop/Celular Android (Chrome):**

```
1. Carrega página
2. Aguarda 3 segundos
3. Modal aparece automaticamente
4. Usuário clica "Agora não"
5. Modal fecha
6. Recarrega página → Modal aparece novamente (3s)
```

### **iPhone/iPad (Safari):**

```
1. Carrega página
2. Aguarda 3 segundos
3. Modal aparece com instruções iOS
4. Mostra: "Compartilhar → Adicionar à Tela de Início"
```

---

## 🔮 **REGRAS FUTURAS (TODO)**

Você pode adicionar regras inteligentes baseadas em:

### **Exemplos de regras:**

```typescript
// 1. Mostrar apenas nas primeiras 3 visitas
if (stats.views > 3) {
  return; // Não mostra mais
}

// 2. Parar de mostrar se dispensou 5 vezes
if (stats.dismissCount >= 5) {
  return; // Usuário não quer instalar
}

// 3. Aguardar 1 dia após dispensar
const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
if (stats.lastDismissed > oneDayAgo) {
  return; // Aguarda 1 dia
}

// 4. Mostrar apenas para usuários premium
if (userPlan !== 'premium' && userPlan !== 'elite') {
  return; // Apenas premium+
}

// 5. Mostrar apenas após X páginas visitadas
const pagesVisited = sessionStorage.getItem('pages_visited') || 0;
if (pagesVisited < 3) {
  return; // Aguarda navegar mais
}
```

---

## 🧪 **COMO TESTAR**

### **Opção 1: Botão de Teste (Desenvolvimento)**

Na página inicial, clique no botão dourado:
```
📱 Ver Modal PWA
```

### **Opção 2: Console**

```javascript
// Forçar exibição
__showPWAModal()

// Ver estatísticas
JSON.parse(localStorage.getItem('pwa_stats'))

// Resetar estatísticas
localStorage.removeItem('pwa_stats')

// Simular instalação
localStorage.setItem('pwa_installed', 'true')
```

### **Opção 3: Aguardar 3 segundos**

1. Carrega qualquer página
2. Aguarda 3 segundos
3. Modal aparece automaticamente

---

## 📝 **CÓDIGO RELEVANTE**

### **Arquivo:** `src/components/PWAInstallPrompt.tsx`

```typescript
// Linha 42-58: Timer de 3 segundos que sempre dispara
const showTimer = setTimeout(() => {
  // Aqui você adiciona as regras futuras
  const stats = JSON.parse(localStorage.getItem('pwa_stats') || '{}');

  // EXEMPLO DE REGRA:
  // if (stats.dismissCount >= 3) {
  //   console.log('[PWA] Usuário dispensou 3x, não mostra mais');
  //   return;
  // }

  stats.views = (stats.views || 0) + 1;
  stats.lastSeen = Date.now();
  localStorage.setItem('pwa_stats', JSON.stringify(stats));

  setVisible(true);
}, 3000);
```

---

## 🎨 **PERSONALIZAÇÃO**

### **Mudar tempo de exibição:**

```typescript
// De 3 segundos para 5 segundos:
setTimeout(() => { ... }, 5000);

// Mostrar imediatamente:
setTimeout(() => { ... }, 0);
```

### **Adicionar animação de entrada:**

```typescript
// No return do componente:
<motion.div
  initial={{ y: 100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  exit={{ y: 100, opacity: 0 }}
  className="fixed bottom-0..."
>
```

---

## ⚙️ **CONFIGURAÇÕES ATUAIS**

| Configuração | Valor | Editável em |
|--------------|-------|-------------|
| Tempo até mostrar | 3 segundos | Linha 49 |
| Cooldown após dispensar | **NENHUM** | Removido |
| Limite de exibições | **ILIMITADO** | - |
| Estatísticas | ✅ Ativas | localStorage |
| Detecta instalação | ✅ Sim | Linha 17-22 |

---

## 🚀 **PRÓXIMOS PASSOS**

1. **Testar em produção** (https://com.rich)
2. **Monitorar estatísticas** dos usuários
3. **Criar regras inteligentes** baseadas em comportamento
4. **A/B test** diferentes timings e mensagens
5. **Dashboard admin** para ver taxa de instalação

---

## 📱 **SUPORTE**

### **Navegadores compatíveis:**

- ✅ Chrome/Edge (Desktop + Android)
- ✅ Safari (iOS) - com instruções manuais
- ✅ Samsung Internet
- ✅ Firefox (limitado)
- ❌ Internet Explorer (não suporta PWA)

### **Requisitos:**

- ✅ HTTPS ativo
- ✅ manifest.json válido
- ✅ Service Worker registrado
- ✅ Ícones 192x192 e 512x512

---

**Última atualização:** 2025-11-09
**Build:** ✅ Pronto para produção
