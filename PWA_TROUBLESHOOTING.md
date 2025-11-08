# 🔧 PWA NÃO APARECE PARA INSTALAR? - DIAGNÓSTICO

**Data:** 2025-11-08

---

## ❗ PROBLEMA PRINCIPAL IDENTIFICADO

O PWA **só funciona em PRODUÇÃO**, não em desenvolvimento (`npm run dev`).

### **Por quê?**

No arquivo `src/main.tsx`, o Service Worker é registrado apenas se:

```typescript
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Registra service worker
}
```

**`import.meta.env.PROD`** = só é `true` em build de produção!

---

## ✅ SOLUÇÕES

### **Opção 1: Testar em Produção (RECOMENDADO)**

```bash
# 1. Fazer build
npm run build

# 2. Servir build localmente
npx http-server dist -p 8080 -c-1

# 3. Abrir no navegador
# http://localhost:8080

# 4. Verificar console
# Deve aparecer: "[PWA] Service Worker registered"

# 5. Chrome DevTools → Application → Manifest
# Deve mostrar todos os dados do PWA

# 6. Ícone ➕ aparece na barra de endereço
```

---

### **Opção 2: Habilitar PWA em Desenvolvimento (Para Testes)**

Se quiser testar PWA com `npm run dev`:

**Editar `src/main.tsx`:**

```typescript
// ANTES (só produção):
if ('serviceWorker' in navigator && import.meta.env.PROD) {

// DEPOIS (dev também):
if ('serviceWorker' in navigator) {
```

**⚠️ ATENÇÃO:**
- Remover isso antes de ir para produção
- Service Worker em dev pode causar cache issues
- Só use para testar PWA

---

### **Opção 3: Deploy no Netlify (MELHOR)**

```bash
git add .
git commit -m "Add complete PWA"
git push

# Netlify faz deploy automático
# Abrir site em produção
# PWA estará ativo automaticamente
```

---

## 🔍 CHECKLIST DE DIAGNÓSTICO

### **1. Verificar se está em Produção**

```
❌ npm run dev → PWA não funciona
✅ npm run build + http-server → PWA funciona
✅ Deploy Netlify → PWA funciona
```

### **2. Verificar Console do Browser**

**Em PRODUÇÃO deve aparecer:**
```
[PWA] Service Worker registered: https://site.com/
```

**Se não aparecer:**
- Você está em `npm run dev` (não funciona)
- Ou há erro no service worker

### **3. Verificar Manifest.json**

```
Abrir: https://site.com/manifest.json

Deve retornar JSON com:
- name: "com.rich - Domínios Premium"
- icons: 8 ícones
- start_url: "/"
```

**Se retornar 404:**
- Vite não copiou public/
- Build não rodou corretamente

### **4. Verificar Service Worker**

```
Chrome DevTools → Application → Service Workers

Status esperado: "activated and running"

Se não aparecer:
- Não está em produção
- Service worker não registrou
- Há erro no service-worker.js
```

### **5. Verificar Ícones**

```
Abrir: https://site.com/icon-192x192.png
Abrir: https://site.com/icon-512x512.png

Devem mostrar logo CR dourado em preto

Se 404:
- Build não copiou ícones
- Faltou npm run build
```

### **6. Verificar HTTPS**

PWA **REQUER HTTPS** (exceto localhost)!

```
❌ http://site.com → PWA não funciona
✅ https://site.com → PWA funciona
✅ http://localhost → PWA funciona (exceção)
```

**Netlify:** HTTPS automático ✓

---

## 🎯 CRITÉRIOS PARA PWA APARECER

Para o ícone ➕ aparecer no Chrome, TODOS devem estar OK:

1. ✅ HTTPS ativo (ou localhost)
2. ✅ manifest.json válido e acessível
3. ✅ Service Worker registrado e ativo
4. ✅ Ícones 192x192 e 512x512 presentes
5. ✅ start_url acessível
6. ✅ display: "standalone" no manifest

---

## 🧪 TESTE PASSO A PASSO

### **No seu computador:**

```bash
# 1. Build
cd /projeto
npm run build

# 2. Verificar se arquivos foram gerados
ls -la dist/manifest.json
ls -la dist/service-worker.js
ls -la dist/icon-192x192.png
ls -la dist/icon-512x512.png

# Todos devem existir!

# 3. Servir localmente
npx http-server dist -p 8080 -c-1

# 4. Abrir Chrome
# http://localhost:8080

# 5. Abrir DevTools (F12)
# Console deve mostrar:
# [PWA] Service Worker registered

# 6. Application → Manifest
# Deve mostrar nome, ícones, etc.

# 7. Application → Service Workers
# Status: "activated and running"

# 8. Ícone ➕ deve aparecer na barra!
```

### **Se não aparecer:**

**A. Console está vazio?**
- Você não está em produção
- Ou service worker não registrou

**B. Erro no console?**
- Ler erro e corrigir
- Comum: manifest.json inválido

**C. Manifest não carrega?**
- Arquivo não existe em /dist/
- Build não copiou public/

**D. Service Worker não ativa?**
- Erro no service-worker.js
- HTTPS não ativo (em servidor remoto)

---

## 📱 TESTAR EM PRODUÇÃO (Netlify)

Depois do deploy:

```bash
# 1. Abrir site em produção
https://seu-site.netlify.app

# 2. Chrome DevTools → Console
# Deve ver: [PWA] Service Worker registered

# 3. Application → Manifest
# Nome, ícones, tudo OK?

# 4. Lighthouse → PWA
# Rodar audit
# Score deve ser 100

# 5. Ícone ➕ na barra de endereço
# Se não aparecer, ver erros acima

# 6. Testar instalação
# Clicar em ➕
# Instalar app
# Abrir → deve funcionar standalone
```

---

## 🐛 ERROS COMUNS

### **1. "Failed to register service worker"**

**Causa:** Arquivo service-worker.js não existe
**Solução:**
```bash
# Verificar se existe
ls dist/service-worker.js

# Se não existe
npm run build
```

### **2. "Manifest: Line 1, column 1, Syntax error"**

**Causa:** manifest.json inválido
**Solução:**
```bash
# Validar JSON
cat dist/manifest.json | python -m json.tool

# Se erro, corrigir public/manifest.json
```

### **3. "No matching service worker detected"**

**Causa:** Service worker não registra em dev
**Solução:**
```bash
# Usar build de produção
npm run build
npx http-server dist -p 8080
```

### **4. "Site cannot be installed: no matching service worker"**

**Causa:** Service worker não está ativo
**Solução:**
- Verificar console por erros
- Verificar Application → Service Workers
- Status deve ser "activated"

### **5. Ícone ➕ não aparece**

**Causas possíveis:**
- Não está em HTTPS (em servidor remoto)
- Manifest inválido
- Service worker não ativo
- Ícones 192/512 não existem
- Já instalou antes (desinstale primeiro)

---

## ✅ SOLUÇÃO DEFINITIVA

**Para garantir que PWA funcione:**

1. **Local (desenvolvimento):**
```bash
npm run build
npx http-server dist -p 8080 -c-1
# Abrir http://localhost:8080
# PWA vai funcionar!
```

2. **Produção (Netlify):**
```bash
git add .
git commit -m "Add PWA"
git push
# Deploy automático
# HTTPS automático
# PWA ativo!
```

3. **Verificar:**
- Console: [PWA] Service Worker registered ✓
- DevTools: Application → Manifest ✓
- DevTools: Application → Service Workers ✓
- Lighthouse: PWA score 100 ✓
- Ícone ➕ na barra ✓

---

## 🎯 RESUMO

**PWA não aparece porque:**

1. ❌ Você está usando `npm run dev` (não funciona)
2. ❌ Não fez build (`npm run build`)
3. ❌ Não está servindo build de produção
4. ❌ Não fez deploy no Netlify

**Solução:**

1. ✅ `npm run build`
2. ✅ `npx http-server dist -p 8080`
3. ✅ Abrir `http://localhost:8080`
4. ✅ Ícone ➕ aparece!

**OU**

1. ✅ `git push`
2. ✅ Netlify faz deploy
3. ✅ Abrir site em produção
4. ✅ PWA ativo!

---

## 📞 CHECKLIST FINAL

Antes de perguntar "por que não funciona?":

- [ ] Fiz `npm run build`?
- [ ] Estou servindo `/dist/` não `npm run dev`?
- [ ] Arquivo `/dist/manifest.json` existe?
- [ ] Arquivo `/dist/service-worker.js` existe?
- [ ] Ícones `/dist/icon-*.png` existem?
- [ ] Console mostra "[PWA] Service Worker registered"?
- [ ] DevTools → Application → Manifest OK?
- [ ] DevTools → Application → Service Workers ativo?
- [ ] Estou em HTTPS (ou localhost)?

**Se todos ✓ → PWA vai funcionar!**
**Se algum ❌ → Corrigir e tentar novamente**

---

**Última atualização:** 2025-11-08
**Status:** Guia completo de troubleshooting PWA
