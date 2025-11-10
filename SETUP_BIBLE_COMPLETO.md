# ✅ Setup Completo - com.bible

## Status do Projeto

O projeto **com.bible** foi configurado com sucesso como fork do **com.rich**.

### 🎯 O que foi feito:

#### 1. ✅ Configuração do Database
- **Database URL**: https://wnfuesmdcdsgplkvgdva.supabase.co
- **Status**: Configurado e conectado
- **Variáveis de ambiente**: Atualizadas no `.env`

#### 2. ✅ Branding Atualizado
- Todas as referências de "com.rich" foram alteradas para "com.bible"
- Arquivos atualizados: 65 arquivos de código-fonte
- `index.html` atualizado com novo título e meta tags
- Substituições feitas:
  - `com.rich` → `com.bible`
  - `therichclub` → `thebibleclub`
  - `richclub` → `bibleclub`
  - `TheRichClub` → `TheBibleClub`
  - `RichClub` → `BibleClub`

#### 3. ✅ Build Testado
- Build executado com sucesso
- Todos os módulos compilados
- Pronto para deploy

## 📋 Próximos Passos Obrigatórios

### Passo 1: Aplicar Migrações do Database

**IMPORTANTE**: O database está vazio. Você precisa aplicar as migrações.

#### Opção A: Via SQL Editor do Supabase (Recomendado)

1. Acesse: https://supabase.com/dashboard/project/wnfuesmdcdsgplkvgdva/sql/new

2. Execute o script consolidado:
   - Arquivo: `MIGRATION_SCRIPT_BIBLE.sql` (34.879 linhas)
   - Contém todas as 221 migrações consolidadas

3. Se der timeout, execute em partes menores (20-30 migrações por vez)

#### Opção B: Via Supabase CLI

```bash
# 1. Instalar CLI (se não tiver)
npm install -g supabase

# 2. Login
supabase login

# 3. Linkar ao projeto
supabase link --project-ref wnfuesmdcdsgplkvgdva

# 4. Aplicar migrações
supabase db push
```

### Passo 2: Verificar Database

Após aplicar as migrações, execute no SQL Editor:

```sql
-- Ver todas as tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Deve retornar 50+ tabelas
```

### Passo 3: Configurar Variáveis de Ambiente Adicionais

O projeto precisa destas variáveis para funcionar completamente:

```env
# PayPal (para pagamentos)
VITE_PAYPAL_CLIENT_ID=seu_paypal_client_id
PAYPAL_SECRET=seu_paypal_secret

# Resend (para emails)
RESEND_API_KEY=seu_resend_key

# Cloudflare Turnstile (anti-spam)
VITE_TURNSTILE_SITE_KEY=seu_turnstile_site_key
TURNSTILE_SECRET_KEY=seu_turnstile_secret

# Google Safe Browsing (segurança)
GOOGLE_SAFE_BROWSING_KEY=seu_google_key
```

### Passo 4: Testar a Aplicação

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse: http://localhost:5173

3. Teste:
   - [ ] Página inicial carrega
   - [ ] Registro de novo usuário
   - [ ] Login
   - [ ] Dashboard
   - [ ] Criação de perfil

## 📂 Arquivos Importantes

### Configuração
- `.env` - Variáveis de ambiente
- `vite.config.ts` - Configuração do Vite
- `tailwind.config.js` - Configuração do Tailwind

### Migrações
- `MIGRATION_SCRIPT_BIBLE.sql` - Script consolidado com todas as 221 migrações
- `INSTRUCOES_MIGRACAO_BIBLE.md` - Instruções detalhadas para aplicar migrações
- `supabase/migrations/` - Migrações individuais (221 arquivos)

### Documentação
- `README.md` - Documentação principal
- `docs/SETUP_GUIDE.md` - Guia completo de setup
- `docs/` - Documentação técnica completa

## 🔧 Troubleshooting

### Problema: Tela branca ao acessar
**Solução**: Verifique se as migrações foram aplicadas no database.

### Problema: Erro "Missing Supabase environment variables"
**Solução**: Verifique o arquivo `.env` e reinicie o servidor.

### Problema: Erro ao fazer login
**Solução**:
1. Verifique se as migrações foram aplicadas
2. Verifique se a tabela `customers` existe
3. Verifique se as policies de RLS estão ativas

### Problema: Build falha
**Solução**: Execute `npm install` e tente novamente.

## 📊 Estrutura do Database

Após aplicar as migrações, você terá:

### Tabelas Principais (50+)
- **Core**: customers, domains, orders, invoices
- **Assinaturas**: subscription_plans, subscriptions, trial_rights
- **Usuários**: user_profiles, profile_links, store_products
- **Social**: social_posts, social_comments, social_likes, social_follows
- **Admin**: support_tickets, audit_logs, protected_brands
- **Afiliados**: affiliates, affiliate_referrals, affiliate_payouts

### Storage Buckets (3)
- `profile-images` - Imagens de perfil
- `public-assets` - Assets públicos
- `social-media` - Mídia da rede social

### Functions (20+)
- get_user_role()
- check_profile_ownership()
- increment_story_views()
- E outras...

## 🚀 Deploy para Produção

Quando estiver pronto para deploy:

1. Configure as variáveis de ambiente no serviço de hosting (Netlify/Vercel)
2. Configure o domínio customizado
3. Execute testes finais
4. Deploy!

### Netlify Deploy:
```bash
npm run build
netlify deploy --prod
```

### Vercel Deploy:
```bash
npm run build
vercel --prod
```

## 📞 Suporte

Se tiver problemas:

1. Verifique o arquivo `INSTRUCOES_MIGRACAO_BIBLE.md`
2. Consulte `docs/SETUP_GUIDE.md`
3. Consulte `docs/TROUBLESHOOTING_GUIDE.md`

---

## ✅ Checklist Final

Antes de considerar o setup completo:

- [x] Database configurado e conectado
- [ ] Migrações aplicadas (221 migrações)
- [x] Branding atualizado para com.bible
- [x] Build testado e funcionando
- [ ] Variáveis de ambiente adicionais configuradas
- [ ] Primeiro usuário criado e testado
- [ ] PayPal configurado para pagamentos
- [ ] Emails configurados (Resend)
- [ ] Segurança configurada (Turnstile + Safe Browsing)
- [ ] Deploy para produção

---

**Projeto**: com.bible
**Database**: wnfuesmdcdsgplkvgdva.supabase.co
**Status**: ✅ Configuração inicial completa
**Próximo passo**: Aplicar migrações do database
