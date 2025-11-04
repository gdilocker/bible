# 🔍 Guia de Diagnóstico - Página Travada em "Verificando domínio..."

## Problema
A página pública fica travada eternamente mostrando "Verificando domínio..." ao acessar perfis.

## Logs Adicionados
Agora o sistema tem logs detalhados no console do navegador. Para ver:

1. Abra o **DevTools** (F12 ou Ctrl+Shift+I)
2. Vá na aba **Console**
3. Recarregue a página
4. Procure por mensagens com emojis:
   - 🔍 Início do carregamento
   - 📋 Verificação de marca protegida
   - 👤 Carregamento de perfil
   - ✅ Sucesso
   - ❌ Erro

## Causas Comuns

### 1. Perfil Não Público
**Sintoma**: Console mostra "Profile loaded successfully" mas página não carrega

**Solução**: Execute no Supabase SQL Editor:
```sql
-- Ver status do perfil
SELECT subdomain, is_public, display_name
FROM user_profiles
WHERE subdomain = 'eriksonleif';

-- Tornar perfil público
UPDATE user_profiles
SET is_public = true
WHERE subdomain = 'eriksonleif';
```

### 2. RLS Bloqueando Acesso Anônimo
**Sintoma**: Console mostra erro de permissão

**Solução**: Verifique as políticas RLS:
```sql
-- Ver políticas da tabela
SELECT * FROM pg_policies
WHERE tablename = 'user_profiles';
```

Deve existir a política:
```sql
CREATE POLICY "Anyone can view public profiles"
  ON user_profiles FOR SELECT
  TO authenticated, anon
  USING (is_public = true);
```

### 3. Subdomain Não Existe
**Sintoma**: Console mostra "Profile not found"

**Solução**:
```sql
-- Listar todos os subdomínios
SELECT subdomain, display_name, is_public
FROM user_profiles;

-- Criar perfil se não existir
INSERT INTO user_profiles (user_id, subdomain, display_name, is_public)
VALUES (
  'USER_UUID_AQUI',
  'eriksonleif',
  'Erikson Leif',
  true
);
```

### 4. Timeout (10 segundos)
**Sintoma**: Console mostra "⏰ Loading timeout"

**Causas possíveis**:
- Conexão lenta com Supabase
- Query muito pesada
- Problema de RLS recursivo

**Solução**: Verifique a conexão e otimize queries

## Verificação Rápida

Execute este script no console do navegador após abrir a página:

```javascript
// Ver estado atual
console.log('🔍 Estado atual:', {
  loading: document.querySelector('[class*="animate-spin"]') !== null,
  notFound: document.body.textContent.includes('não encontrado'),
  subdomain: window.location.pathname.split('/')[1]
});
```

## Teste Manual

1. Acesse: `https://seu-site.com/eriksonleif`
2. Abra DevTools (F12)
3. Vá em Console
4. Procure os logs com emojis
5. Se aparecer "✅ Profile loaded successfully" mas nada carregar, o problema é no frontend
6. Se aparecer "❌" ou timeout, o problema é no backend/RLS

## Correção de Emergência

Se nada funcionar, force o perfil a ser público:

```sql
-- No Supabase SQL Editor
UPDATE user_profiles
SET is_public = true,
    password_protected = false
WHERE subdomain = 'eriksonleif';
```

## Contato para Suporte

Se o problema persistir após estas verificações:

1. Copie TODOS os logs do Console (F12 → Console → Botão direito → Save as...)
2. Tire screenshot da aba Network (F12 → Network) mostrando as requisições
3. Envie para análise com as informações do erro

---

**Nota**: O timeout de segurança de 10 segundos foi adicionado para evitar que a página fique travada eternamente. Após 10 segundos, a página força um estado de erro.
