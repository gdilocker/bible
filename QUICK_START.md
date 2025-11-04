# 🚀 Guia Rápido de Primeiros Passos - COM.RICH

## Para Você Começar AGORA (15 minutos)

### Passo 1: Configurar Secrets (10 min)

Acesse [Supabase Dashboard](https://app.supabase.com) → Seu Projeto → Settings → Edge Functions → Secrets

**Adicione estes 4 secrets:**

```bash
# PayPal (use sandbox primeiro para testes)
PAYPAL_CLIENT_ID=seu_client_id_aqui
PAYPAL_CLIENT_SECRET=seu_client_secret_aqui
PAYPAL_MODE=sandbox

# Cloudflare Turnstile (anti-bot)
TURNSTILE_SECRET_KEY=0x4AAAA...
```

**Onde conseguir:**
- **PayPal:** [developer.paypal.com/dashboard](https://developer.paypal.com/dashboard) → Apps & Credentials → Create App
- **Turnstile:** [dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile → Criar site

---

### Passo 2: Testar Localmente (2 min)

```bash
# Já está rodando? Não precisa fazer nada!
# Quer rodar local? Use:
npm install
npm run dev
```

Acesse: http://localhost:5173

---

### Passo 3: Fazer um Teste Completo (3 min)

1. **Registrar conta**
   - Clique em "Cadastrar"
   - Preencha email e senha
   - ✅ Deve criar conta e logar automaticamente

2. **Testar pagamento sandbox**
   - Vá em "Pricing"
   - Escolha um plano (Standard ou Elite)
   - No PayPal sandbox, use:
     - Email: `sb-buyer@personal.example.com`
     - Senha: Qualquer senha de teste
   - Complete o pagamento
   - ✅ Deve retornar para /success e ativar plano

3. **Registrar domínio**
   - Vá em "Domínios" → "Registrar Novo"
   - Digite um nome (ex: "joao")
   - ✅ Deve criar joao.com.rich

4. **Editar perfil**
   - Vá em "Meu Perfil" → "Editar"
   - Adicione links, mude cores
   - Salve
   - ✅ Acesse yourname.com.rich e veja ao vivo

**Se tudo funcionou: PARABÉNS! Está pronto para produção! 🎉**

---

## Para Ir Para Produção (5 min)

### Passo 4: Trocar PayPal para LIVE

No Supabase Dashboard, atualize os secrets:

```bash
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=seu_client_id_PRODUCAO
PAYPAL_CLIENT_SECRET=seu_client_secret_PRODUCAO
```

⚠️ **IMPORTANTE:** Use credenciais de PRODUÇÃO do PayPal, não sandbox!

---

### Passo 5: Deploy

**Opção A - Netlify (Recomendado - Grátis):**
1. Conecte seu repo no [Netlify](https://app.netlify.com)
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Adicione as variáveis de ambiente do `.env`
5. Deploy!

**Opção B - Vercel:**
1. Conecte seu repo no [Vercel](https://vercel.com)
2. Framework preset: Vite
3. Adicione variáveis de ambiente
4. Deploy!

**Opção C - Cloudflare Pages:**
1. Conecte repo no [Cloudflare Pages](https://pages.cloudflare.com)
2. Build command: `npm run build`
3. Output: `dist`
4. Deploy!

---

## Próximos Passos (Opcional)

### Adicionar Domínio Custom
1. No seu provedor de deploy, adicione custom domain
2. Configure DNS: CNAME para seu deploy
3. Aguarde propagação (até 24h)
4. SSL automático

### Configurar Emails (Opcional)
- SendGrid, Resend ou Mailgun
- Templates em português
- Edge function `email` já está pronta

### Analytics (Opcional)
- Google Analytics 4
- Ou use o sistema interno de clicks

---

## Dúvidas Comuns

**Q: PayPal não está funcionando?**
A: Verifique se PAYPAL_MODE está correto (sandbox/live) e se as credenciais combinam com o modo

**Q: Domínio não foi criado?**
A: Verifique se tem plano ativo. Free tem limite de 1 domínio.

**Q: Perfil não aparece público?**
A: Certifique-se que está em modo público no editor de perfil

**Q: Edge functions com erro?**
A: Verifique se os secrets foram configurados e redeploy as functions

---

## Recursos

- **Documentação Completa:** `LAUNCH_CHECKLIST.md`
- **Secrets Detalhados:** `docs/guides/REQUIRED_SECRETS.md`
- **Segurança:** `docs/guides/SECURITY.md`
- **Suporte:** Abra um ticket em /support

---

## Checklist Rápido

- [ ] Secrets configurados no Supabase
- [ ] Teste de registro funcionando
- [ ] Teste de pagamento sandbox OK
- [ ] Domínio sendo criado
- [ ] Perfil público acessível
- [ ] PayPal em modo LIVE (produção)
- [ ] Deploy realizado
- [ ] Domínio custom configurado (opcional)

---

**Pronto para lançar?** 🚀

Se todos os checkboxes acima estão marcados, você está pronto para receber usuários reais!

**Boa sorte com o lançamento!** 🎉
