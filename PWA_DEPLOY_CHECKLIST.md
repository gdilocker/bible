# ✅ PWA Deploy Checklist - com.rich

## Arquivos no dist/ (CONFIRMADO)

```
✅ dist/manifest.json (1.6KB)
✅ dist/sw.js (789 bytes)
✅ dist/_headers (2.8KB) 
✅ dist/netlify.toml (816 bytes)
✅ dist/icons/ (9 arquivos PNG)
✅ dist/apple-touch-icon.png
```

---

## Passo 1: Deploy

Faça upload de **TODA** a pasta `dist/` para o servidor que hospeda `https://com.rich`

**IMPORTANTE:** Os arquivos precisam estar na **raiz do domínio**, não em subpasta.

---

## Passo 2: Validar URLs (OBRIGATÓRIO)

Após o deploy, teste estas URLs no navegador:

### ✅ Manifest
```
https://com.rich/manifest.json
```
- Status: **200 OK**
- Content-Type: `application/manifest+json` ou `application/json`
- Deve mostrar JSON (não HTML de erro 404)

### ✅ Service Worker
```
https://com.rich/sw.js
```
- Status: **200 OK**
- Content-Type: `application/javascript` ou `text/javascript`
- Deve mostrar código JavaScript (não HTML de erro 404)

### ✅ Ícones
```
https://com.rich/icons/icon-192x192.png
https://com.rich/icons/icon-512x512.png
```
- Status: **200 OK**
- Content-Type: `image/png`
- Deve exibir imagem (não erro 404)

---

## Passo 3: Testar no Chrome Desktop

1. Abra `https://com.rich` no Chrome
2. Abra DevTools (F12)
3. Vá em **Application** > **Manifest**
4. Verifique:
   - ✅ Nome: "The Rich Club"
   - ✅ Start URL: "/"
   - ✅ Ícones: todos com status OK (sem erros 404)
5. Vá em **Application** > **Service Workers**
6. Verifique:
   - ✅ Status: `activated and is running`
   - ✅ Source: `sw.js`

---

## Passo 4: Testar Installable (Chrome Desktop)

1. No DevTools, vá em **Lighthouse**
2. Selecione **Progressive Web App**
3. Clique **Analyze page load**
4. Procure por **"Installable"**
5. Deve mostrar: ✅ **Pass**

Se mostrar **erro**, olhe os detalhes:
- Manifest errors?
- Service worker errors?
- Icons missing?

---

## Passo 5: Testar Banner no Android

### Pré-requisitos
- Chrome para Android (versão atualizada)
- Celular com Android 8.0+
- **Remover app se já instalado**
- **Limpar dados do site:** Settings > Site Settings > com.rich > Clear & reset

### Teste
1. Abra `https://com.rich` no Chrome (aba normal, não anônima)
2. Aguarde **5-15 segundos**
3. Banner deve aparecer automaticamente no rodapé:
   - Título: "Instalar The Rich Club"
   - Botão: "Instalar App"
4. Toque em **"Instalar App"**
5. Prompt nativo do Chrome deve abrir
6. Aceite a instalação
7. App deve abrir em tela cheia
8. Volte ao Chrome > recarregue a página
9. Banner **não deve** reaparecer

---

## Troubleshooting

### ❌ Erro: manifest.json retorna 404
**Causa:** Arquivo não foi deployado ou está em pasta errada  
**Solução:** Confirme que `dist/manifest.json` foi copiado para raiz do servidor

### ❌ Erro: sw.js retorna 404
**Causa:** Arquivo não foi deployado  
**Solução:** Confirme que `dist/sw.js` foi copiado para raiz do servidor

### ❌ Erro: ícones retornam 404
**Causa:** Pasta `icons/` não foi deployada  
**Solução:** Confirme que `dist/icons/` foi copiada para servidor

### ❌ Service Worker não ativa
**Causa:** Erro de CORS, HTTPS, ou cache  
**Solução:** 
- Force hard refresh (Ctrl+Shift+R)
- Limpe cache do site no DevTools
- Verifique console por erros

### ❌ Banner não aparece no Android
**Possíveis causas:**
1. Service Worker não está ativo → verifique DevTools
2. Manifest inválido → verifique DevTools > Application > Manifest
3. App já foi instalado → desinstale e limpe dados
4. Usuário já dispensou antes → limpe dados do site
5. Chrome não disparou `beforeinstallprompt` → aguarde mais tempo ou recarregue

### ❌ Lighthouse mostra "Not installable"
**Olhe os erros específicos:**
- "No matching service worker detected" → SW não registrou
- "Manifest start_url is not cached" → SW não cacheou a URL inicial
- "Icons are not suitable" → ícones inválidos ou muito pequenos

---

## Prints Obrigatórios para Confirmação

📸 **Screenshot 1:** `https://com.rich/manifest.json` mostrando JSON válido  
📸 **Screenshot 2:** DevTools > Application > Manifest mostrando detalhes completos  
📸 **Screenshot 3:** DevTools > Application > Service Workers mostrando "activated"  
📸 **Screenshot 4:** Lighthouse > PWA mostrando "Installable: Pass"  
📸 **Screenshot 5:** Banner visível no celular Android  
📸 **Screenshot 6:** Prompt nativo de instalação do Chrome

---

## ⚠️ Nota Importante sobre Ícones

Os ícones atuais são **placeholders minimalistas** (70 bytes cada).

Para produção real, você deve substituir por **ícones PNG reais** com:
- Logo do The Rich Club
- Tamanho mínimo: 5-10KB cada
- Pelo menos 192x192 e 512x512 em alta qualidade

**Como substituir:**
1. Crie os ícones PNG com seu designer
2. Sobrescreva os arquivos em `public/icons/`
3. Rebuild: `npm run build`
4. Deploy novamente

---

## Status Atual

✅ Código do banner: **PRONTO**  
✅ Manifest.json: **CRIADO**  
✅ Service Worker: **CRIADO**  
✅ Build com arquivos PWA: **COMPLETO**  
⏳ Deploy em produção: **PENDENTE**  
⏳ Validação em com.rich: **PENDENTE**  

**Próximo passo:** Deploy do `dist/` para `https://com.rich`
