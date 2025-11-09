# 🚀 Instruções de Deploy PWA - CRÍTICO

## ⚠️ **PROBLEMA IDENTIFICADO:**

O instalador nativo do Chrome **NÃO ABRE** porque os arquivos PWA retornam **404** em produção.

### **Causa Raiz:**
- ✅ Build contém todos os arquivos PWA em `/dist`
- ❌ Netlify não está servindo os arquivos corretamente
- ❌ Arquivos retornam 404 ao invés de 200

---

## 📋 **CHECKLIST PRÉ-DEPLOY:**

Verifique localmente ANTES de fazer deploy:

```bash
# 1. Verificar que dist/ contém:
ls -la dist/
# Deve ter:
# - manifest.json
# - sw.js
# - apple-touch-icon.png
# - icons/icon-192x192.png
# - icons/icon-512x512.png

# 2. Testar localmente:
npx serve dist -p 3000

# 3. Abrir http://localhost:3000 e verificar:
# - manifest.json carrega (não 404)
# - sw.js carrega (não 404)
# - /icons/icon-192x192.png carrega (não 404)
```

---

## 🔧 **ARQUIVOS MODIFICADOS:**

### **1. netlify.toml**
```toml
# PWA files - serve directly without redirects
[[redirects]]
  from = "/manifest.json"
  to = "/manifest.json"
  status = 200
  force = true

[[redirects]]
  from = "/sw.js"
  to = "/sw.js"
  status = 200
  force = true

[[redirects]]
  from = "/icons/*"
  to = "/icons/:splat"
  status = 200
  force = true

# SPA fallback - MUST be last
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### **2. _headers**
```
# PWA files
/manifest.json
  Content-Type: application/manifest+json
  Cache-Control: public, max-age=3600
  Access-Control-Allow-Origin: *

/sw.js
  Content-Type: application/javascript
  Cache-Control: no-cache, no-store, must-revalidate
  Service-Worker-Allowed: /

/icons/*
  Content-Type: image/png
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *
```

---

## 🚀 **DEPLOY STEPS:**

### **Opção A: Netlify CLI (Recomendado)**

```bash
# 1. Build
npm run build

# 2. Deploy
netlify deploy --prod --dir=dist

# 3. Aguardar deploy completar (1-2 min)

# 4. Testar arquivos:
curl -I https://com.rich/manifest.json
curl -I https://com.rich/sw.js
curl -I https://com.rich/icons/icon-192x192.png

# Todos devem retornar 200, não 404!
```

### **Opção B: Git Push (Automático)**

```bash
# 1. Commit tudo
git add .
git commit -m "fix: adiciona arquivos PWA completos"
git push

# 2. Aguardar Netlify build automático (2-3 min)

# 3. Verificar deploy em:
# https://app.netlify.com/sites/com-rich/deploys
```

---

## ✅ **VERIFICAÇÃO PÓS-DEPLOY:**

### **1. Testar arquivos PWA:**

```bash
# Manifest
curl -I https://com.rich/manifest.json
# Deve retornar: HTTP/2 200

# Service Worker
curl -I https://com.rich/sw.js
# Deve retornar: HTTP/2 200

# Ícones
curl -I https://com.rich/icons/icon-192x192.png
# Deve retornar: HTTP/2 200

curl -I https://com.rich/icons/icon-512x512.png
# Deve retornar: HTTP/2 200
```

### **2. Testar no Chrome Mobile:**

```
1. Abrir Chrome no celular
2. Ir para https://com.rich
3. Abrir DevTools via USB:
   - Conectar celular no PC via USB
   - PC: chrome://inspect
   - Inspecionar página do celular

4. No DevTools → Console, rodar:
   (async () => {
     const m = await fetch('/manifest.json');
     const s = await fetch('/sw.js');
     const i = await fetch('/icons/icon-192x192.png');
     console.log({
       manifest: m.status,
       sw: s.status,
       icon: i.status
     });
   })();

5. Deve mostrar: { manifest: 200, sw: 200, icon: 200 }
```

### **3. Forçar reload do PWA:**

```javascript
// No console do Chrome mobile:

// Limpar tudo
caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
localStorage.clear();
sessionStorage.clear();

// Desregistrar SW antigo
navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(reg => reg.unregister()));

// Recarregar
location.reload(true);

// Aguardar 5 segundos e verificar:
setTimeout(() => {
  navigator.serviceWorker.getRegistration()
    .then(reg => console.log('SW:', reg ? 'Ativo' : 'Não registrado'));
}, 5000);
```

---

## 🐛 **TROUBLESHOOTING:**

### **Erro: manifest.json retorna 404**

```bash
# Verificar se existe em dist:
ls -la dist/manifest.json

# Se não existe:
npm run build
ls -la dist/manifest.json

# Se existe mas retorna 404 em produção:
# - Limpar cache do Netlify
# - Fazer novo deploy
netlify deploy --prod --dir=dist
```

### **Erro: sw.js retorna 404**

```bash
# Verificar redirect no netlify.toml
cat netlify.toml | grep -A5 "sw.js"

# Deve ter:
# [[redirects]]
#   from = "/sw.js"
#   to = "/sw.js"
#   status = 200
#   force = true
```

### **Erro: beforeinstallprompt não dispara**

```javascript
// Após corrigir 404s, testar:

// 1. Limpar dados do site
// Chrome → Settings → Site Settings → com.rich → Clear data

// 2. Visitar site novamente
// 3. Aguardar 3 segundos
// 4. Modal deve aparecer
// 5. Botão "Instalar App" deve estar ATIVO

// 6. Verificar no console:
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('✅ beforeinstallprompt DISPAROU!');
});
```

---

## 📊 **DIAGNÓSTICO COMPLETO:**

Cole no console do Chrome após deploy:

```javascript
(async () => {
  console.clear();
  console.log('🔍 PWA Production Check\n');

  // 1. HTTPS
  console.log('✅ HTTPS:', location.protocol === 'https:');

  // 2. Manifest
  try {
    const m = await fetch('/manifest.json');
    console.log(m.ok ? '✅' : '❌', 'Manifest:', m.status);
    if (m.ok) {
      const json = await m.json();
      console.log('  - Nome:', json.name);
      console.log('  - Ícones:', json.icons.length);
    }
  } catch (e) {
    console.log('❌ Manifest erro:', e.message);
  }

  // 3. Service Worker
  try {
    const s = await fetch('/sw.js');
    console.log(s.ok ? '✅' : '❌', 'SW:', s.status);
  } catch (e) {
    console.log('❌ SW erro:', e.message);
  }

  // 4. Ícones
  const icons = ['/icons/icon-192x192.png', '/icons/icon-512x512.png'];
  for (const icon of icons) {
    try {
      const i = await fetch(icon);
      console.log(i.ok ? '✅' : '❌', icon, ':', i.status);
    } catch (e) {
      console.log('❌', icon, ':', e.message);
    }
  }

  // 5. SW Registration
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.getRegistration();
    console.log('\n📡 Service Worker:');
    console.log('  - Registrado:', !!reg);
    if (reg) {
      console.log('  - State:', reg.active?.state);
      console.log('  - Scope:', reg.scope);
    }
  }

  // 6. beforeinstallprompt
  console.log('\n⚡ beforeinstallprompt:');
  let bipFired = false;
  window.addEventListener('beforeinstallprompt', (e) => {
    bipFired = true;
    console.log('✅ DISPAROU! (App é instalável)');
  });

  setTimeout(() => {
    if (!bipFired) {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      if (standalone) {
        console.log('ℹ️  App já está instalado');
      } else {
        console.log('⚠️  Não disparou (aguarde ou já foi dispensado)');
      }
    }
  }, 3000);

  console.log('\n✨ Diagnóstico iniciado! Aguardando 3s...\n');
})();
```

---

## 🎯 **RESULTADO ESPERADO:**

Após o deploy correto:

```
🔍 PWA Production Check

✅ HTTPS: true
✅ Manifest: 200
  - Nome: The Rich Club
  - Ícones: 2
✅ SW: 200
✅ /icons/icon-192x192.png : 200
✅ /icons/icon-512x512.png : 200

📡 Service Worker:
  - Registrado: true
  - State: activated
  - Scope: https://com.rich/

⚡ beforeinstallprompt:
✅ DISPAROU! (App é instalável)
```

---

## 📱 **TESTE FINAL NO CELULAR:**

1. **Limpar cache do Chrome:**
   - Configurações → Privacidade → Limpar dados

2. **Visitar https://com.rich**

3. **Aguardar 3 segundos**

4. **Modal PWA aparece**

5. **Clicar "Instalar App"**

6. **🎉 PROMPT NATIVO DO CHROME ABRE!**

7. **Confirmar instalação**

8. **App aparece na tela inicial**

---

**Status:** ⚠️ AGUARDANDO DEPLOY
**Build:** ✅ Pronto (15.99s)
**Arquivos:** ✅ Todos em dist/
**Próximo passo:** FAZER DEPLOY NO NETLIFY

---

## 🚨 **ATENÇÃO:**

Não adianta testar localmente! O problema está **em produção**.

Você **DEVE** fazer o deploy primeiro, depois testar em https://com.rich

O build está correto, só falta subir para produção! 🚀
