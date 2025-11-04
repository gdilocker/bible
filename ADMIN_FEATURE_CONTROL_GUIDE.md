# 🛠️ Guia: Controle de Funcionalidades de Loja e Rede Social (Admin)

## 📍 Onde Encontrar

### Como Admin, você pode ativar/desativar Loja e Rede Social para cada usuário:

**Caminho de Navegação:**
```
1. Login como Admin
2. Acesse: Admin Dashboard (página inicial do admin)
3. Clique em: "Gerenciar Perfis"
   ou
   Acesse diretamente: /admin/profiles
```

## 🎯 Como Funciona

### 1. Lista de Perfis

Na página **"Gerenciar Perfis"** você verá todos os perfis de usuários cadastrados:

- Nome de exibição / Subdomínio
- E-mail do usuário
- Status (Público/Privado)
- Badge Elite (se aplicável)
- Visualizações
- Data de criação

### 2. Expandir Controles

Para cada perfil, clique no botão de expandir (ícone de seta) para ver:

**"Controle de Funcionalidades"**

Aqui você encontra dois toggles (interruptores):

#### 🏪 **Loja Virtual**
- **Toggle ON (Laranja)**: Loja permitida pelo admin
  - Se o usuário também ativou: Badge "✓ Ativa" (verde)
  - Se o usuário desativou: Badge "⚠ Desativada" (cinza)

- **Toggle OFF (Cinza)**: Loja bloqueada pelo admin
  - Badge "✗ Bloqueada" (vermelho)
  - Usuário não pode usar mesmo querendo

#### 💬 **Rede Social**
- **Toggle ON (Azul)**: Social permitida pelo admin
  - Se o usuário também ativou: Badge "✓ Ativa" (verde)
  - Se o usuário desativou: Badge "⚠ Desativada" (cinza)

- **Toggle OFF (Cinza)**: Social bloqueada pelo admin
  - Badge "✗ Bloqueada" (vermelho)
  - Usuário não pode usar mesmo querendo

## 🔄 Como Funciona a Lógica

### Duplo Controle (Admin + Usuário)

Para uma funcionalidade estar **realmente ativa**, ambos precisam permitir:

```
Loja ATIVA = store_allowed_by_admin (TRUE) + store_enabled (TRUE)
Social ATIVA = social_allowed_by_admin (TRUE) + social_enabled (TRUE)
```

### Estados Possíveis

| Admin | Usuário | Resultado Final | Badge |
|-------|---------|-----------------|-------|
| ✅ ON | ✅ ON | **Ativa** | 🟢 Ativa |
| ✅ ON | ❌ OFF | Desativada pelo usuário | ⚠️ Desativada |
| ❌ OFF | ✅ ON | **Bloqueada** | 🔴 Bloqueada |
| ❌ OFF | ❌ OFF | **Bloqueada** | 🔴 Bloqueada |

## 🎨 Visual do Componente

### Quando Ativa
```
┌─────────────────────────────────────────┐
│ 🏪 [Loja]  ✓ Ativa          🟠●────────│
│    Ativa                                 │
└─────────────────────────────────────────┘
```

### Quando Bloqueada
```
┌─────────────────────────────────────────┐
│ 🏪 [Loja]  ✗ Bloqueada       ─────────●│
│    Bloqueada pelo admin                  │
└─────────────────────────────────────────┘
```

### Quando Desativada pelo Usuário
```
┌─────────────────────────────────────────┐
│ 🏪 [Loja]  ⚠ Desativada     🟠●────────│
│    Desativada pelo usuário               │
└─────────────────────────────────────────┘
```

## 💡 Casos de Uso

### Bloquear Funcionalidade de um Usuário Específico
1. Acesse `/admin/profiles`
2. Encontre o perfil do usuário (use busca se necessário)
3. Clique para expandir os controles
4. **Desative** o toggle da funcionalidade (Loja ou Social)
5. ✅ Confirmação aparece automaticamente

### Permitir Funcionalidade Novamente
1. Acesse `/admin/profiles`
2. Encontre o perfil
3. **Ative** o toggle da funcionalidade
4. ✅ Usuário pode agora ativar se desejar

## 🔐 Permissões

### Quem Pode Acessar?
- ✅ **Apenas Admins** com `role = 'admin'` na tabela `customers`
- ❌ Usuários comuns NÃO têm acesso
- ❌ Resellers/Afiliados NÃO têm acesso

### Segurança
- Protegido por `ProtectedRoute` com `adminOnly={true}`
- RLS no Supabase garante que apenas admins podem modificar
- Toast de confirmação após cada alteração

## 📊 Colunas no Banco de Dados

**Tabela**: `user_profiles`

```sql
store_enabled: boolean          -- Usuário ativou/desativou Loja
store_allowed_by_admin: boolean -- Admin permite/bloqueia Loja
social_enabled: boolean         -- Usuário ativou/desativou Social
social_allowed_by_admin: boolean -- Admin permite/bloqueia Social
```

## 🚀 Atualizações em Tempo Real

Quando você muda um toggle:
- ✅ Atualização imediata no banco
- ✅ Toast de confirmação
- ✅ Lista recarrega automaticamente
- ✅ Usuário vê mudanças na próxima vez que acessar

## 📝 Notas Importantes

1. **Loja bloqueada = Usuário não vê aba "Loja"** na seção Gerenciar Página
2. **Social bloqueada = Usuário não vê aba "Meu Feed Social"** na seção Gerenciar Página
3. **Bloqueio é imediato** - não precisa relogar
4. **Admin não altera preferência do usuário** - apenas permite/bloqueia o uso
5. **Funcionalidades são independentes** - pode bloquear uma e permitir outra

## 🔧 Resolução de Problemas

### Usuário diz que não vê a funcionalidade

1. ✅ Verifique se admin permitiu (`store_allowed_by_admin = true`)
2. ✅ Verifique se usuário ativou (`store_enabled = true`)
3. ✅ Peça para usuário recarregar a página
4. ✅ Verifique logs no navegador (F12 → Console)

### Toggle não funciona

1. ✅ Verifique se você está logado como admin
2. ✅ Verifique conexão com internet
3. ✅ Abra console (F12) e veja se há erros
4. ✅ Tente recarregar a página e tentar novamente

## 📍 Acesso Rápido

**URL Direta**: `https://seudominio.com/admin/profiles`

**Menu**: Admin Dashboard → "Gerenciar Perfis"

---

✅ **Sistema implementado e funcionando perfeitamente!**
