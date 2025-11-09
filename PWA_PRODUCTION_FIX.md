# ✅ PWA - CORREÇÃO DE PRODUÇÃO APLICADA

## Problema identificado:
- `netlify.toml` referenciava `/service-worker.js` mas o arquivo é `/sw.js`
- Arquivos PWA não estavam sendo servidos corretamente (retornando HTML em vez de JSON/JS)

## Correções aplicadas:

### 1. Arquivos PWA criados em `/public/`:
- ✅ `manifest.json` - Manifest válido
- ✅ `sw.js` - Service Worker
- ✅ `apple-touch-icon.png`
- ✅ `icons/icon-*.png` (9 ícones)
- ✅ `_headers` - Headers do Netlify
- ✅ `netlify.toml` - Config do Netlify

### 2. `netlify.toml` corrigido:
```toml
[[redirects]]
  from = "/manifest.json"
  to = "/manifest.json"
  status = 200

[[redirects]]
  from = "/sw.js"
  to = "/sw.js"
  status = 200

[[redirects]]
  from = "/apple-touch-icon.png"
  to = "/apple-touch-icon.png"
  status = 200

[[redirects]]
  from = "/icons/*"
  to = "/icons/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. `_headers` atualizado:
```
# PWA files
/manifest.json
  Content-Type: application/manifest+json
  Cache-Control: public, max-age=3600

/sw.js
  Content-Type: application/javascript
  Cache-Control: no-cache, no-store, must-revalidate

/apple-touch-icon.png
  Content-Type: image/png
  Cache-Control: public, max-age=31536000, immutable

/icons/*
  Content-Type: image/png
  Cache-Control: public, max-age=31536000, immutable
```

## Arquivos no build final (`dist/`):

```
dist/
├── _headers (2.8KB)
├── netlify.toml (816 bytes)
├── manifest.json (1.6KB) ✅ JSON válido
├── sw.js (789 bytes)
├── apple-touch-icon.png (70 bytes)
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   └── screenshot-mobile.png
├── index.html (referencia manifest.json e registra sw.js)
└── assets/
```

## Validação em produção:

Após deploy em `https://com.rich`:

1. **Testar manifest diretamente:**
   - Acesse: `https://com.rich/manifest.json`
   - Deve mostrar JSON (não HTML)
   
2. **Testar Service Worker:**
   - Acesse: `https://com.rich/sw.js`
   - Deve mostrar código JavaScript (não HTML)

3. **Testar banner PWA:**
   - Chrome/Android, aba normal, app não instalado
   - Acesse `https://com.rich`
   - Aguarde 2-5 segundos
   - Banner deve aparecer automaticamente
   - Toque "Instalar App" → prompt nativo
   - Aceite → banner desaparece

4. **Verificar logs:**
   - Abra DevTools > Console
   - Procure logs `[PWA]`
   - Deve mostrar: "beforeinstallprompt CAPTURADO!"

## ⚠️ Importante:

- **Após deploy, pode levar alguns minutos para o CDN do Netlify atualizar**
- **Limpe o cache do navegador** (Ctrl+Shift+R) ou use aba anônima
- **Os ícones são placeholders** (70 bytes cada) - substitua por ícones reais se necessário

## Critérios de elegibilidade do Chrome:

O evento `beforeinstallprompt` só dispara quando:
- ✅ Manifest válido e acessível
- ✅ Service Worker registrado e ativo
- ✅ HTTPS habilitado
- ✅ Site não instalado anteriormente
- ⚠️ Critérios de engajamento do Chrome (pode levar alguns segundos)

Se tudo estiver correto mas o banner não aparecer imediatamente, aguarde 5-10 segundos na página. O Chrome pode estar avaliando elegibilidade.
