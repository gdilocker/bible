# Sistema de Domínio Ativo no Dashboard

## Resumo das Alterações

Implementado um sistema completo que permite ao usuário:
1. **Ativar/Desativar domínios** diretamente nos cards da página "Meus Domínios"
2. **Alternar domínios** no Dashboard com seletor visual
3. **Ver atalhos dinâmicos** que refletem apenas o domínio ativo e seus módulos habilitados

## Comportamento Implementado

### 1. Botões de Ativar/Desativar na Página "Meus Domínios"
- **Localização**: Dentro de cada card de domínio, acima do botão "Gerenciar Página"
- **Funcionalidade**:
  - Se o domínio está ativo: Mostra badge verde "Domínio Ativo no Dashboard"
  - Se o domínio NÃO está ativo: Mostra botão azul "Ativar este Domínio"
- **Visual**:
  - Badge verde com ícone de check quando ativo
  - Botão azul interativo quando inativo
- **Comportamento**: Ao clicar em "Ativar", o domínio se torna ativo e o Dashboard é atualizado

### 2. Seletor de Domínio Ativo no Dashboard
- **Localização**: Aparece no topo do Dashboard quando o usuário tem 2 ou mais domínios
- **Funcionalidade**: Permite alternar entre os domínios com um único clique
- **Visual**: O domínio ativo é destacado com um fundo gradiente escuro e um ícone de check

### 3. Atalhos Rápidos Dinâmicos
Os atalhos exibidos no Dashboard agora seguem estas regras:

#### "Minha Página"
- **Sempre visível** se o domínio ativo tiver um perfil configurado
- Direciona para a página de edição do perfil daquele domínio específico

#### "Loja"
- **Só aparece** se `store_enabled = true` no perfil do domínio ativo
- Se desativado, o card não é exibido

#### "Feed Social"
- **Só aparece** se `social_enabled = true` no perfil do domínio ativo
- Se desativado, o card não é exibido

### 4. Mensagens Contextuais

#### Quando o domínio não tem perfil configurado:
```
⚠️ Perfil não configurado
Configure seu perfil para o domínio [nome-do-dominio] para ver os atalhos disponíveis.
[Botão: Configurar Perfil]
```

#### Quando apenas a página está ativa:
```
ℹ️ Apenas a Página está ativa
Ative a Loja ou o Feed Social nas configurações do seu perfil para ver mais atalhos.
```

## Alterações Técnicas

### 1. Migração de Banco de Dados
**Arquivo**: `supabase/migrations/20251103000000_active_domain_system.sql`

#### Nova coluna em `customers`:
- `active_domain_id` (uuid): Armazena o ID do domínio atualmente ativo
- **Default**: Primeiro domínio registrado pelo usuário

#### Funções criadas:
- `set_first_domain_as_active()`: Define automaticamente o primeiro domínio como ativo
- `validate_active_domain_ownership()`: Valida que o domínio pertence ao usuário

#### Triggers:
- `trigger_set_first_domain_active`: Executado ao inserir um novo domínio
- `trigger_validate_active_domain`: Valida antes de atualizar o domínio ativo

#### Políticas RLS:
- Usuários podem atualizar seu próprio `active_domain_id`
- Validação garante que só podem selecionar domínios que possuem

### 2. Componente DomainsPage.tsx

#### Novos estados:
```typescript
const [activeDomainId, setActiveDomainId] = useState<string | null>(null);
const [customerId, setCustomerId] = useState<string | null>(null);
```

#### Nova função:
```typescript
const handleActivateDomain = async (domainId: string) => {
  // Atualiza active_domain_id no banco
  // Mostra alerta de sucesso
  // Atualiza estado local
}
```

#### Botões nos cards:
- Cada card de domínio mostra:
  - Badge verde se for o domínio ativo
  - Botão azul "Ativar este Domínio" se não for ativo
- Ao clicar no botão, o domínio é ativado instantaneamente

### 3. Componente PanelDashboard.tsx

#### Novos estados:
```typescript
const [activeDomainId, setActiveDomainId] = useState<string | null>(null);
const [profileData, setProfileData] = useState<ProfileData | null>(null);
const [customerId, setCustomerId] = useState<string | null>(null);
```

#### Nova interface:
```typescript
interface ProfileData {
  id: string;
  subdomain: string;
  store_enabled: boolean;
  social_enabled: boolean;
  domain_id: string;
}
```

#### Função de alternância:
```typescript
const handleSwitchDomain = async (domainId: string) => {
  // Atualiza active_domain_id no banco
  // Busca perfil do novo domínio
  // Atualiza estado local
}
```

#### Lógica de atalhos:
- Atalhos são montados dinamicamente baseados no `profileData`
- Verifica `store_enabled` e `social_enabled` antes de adicionar os cards
- **Fallback de compatibilidade**: Se não encontrar perfil por `domain_id`, busca por `user_id` (para perfis antigos)

## Fluxo do Usuário

### Cenário 1: Ativar domínio pela página "Meus Domínios"
1. Usuário acessa "Gerenciar > Domínios / Páginas"
2. Vê seus 2 domínios listados
3. Domínio `eriksonleif.com.rich` mostra badge verde "Domínio Ativo no Dashboard"
4. Domínio `leif.com.rich` mostra botão azul "Ativar este Domínio"
5. Usuário clica no botão azul do `leif.com.rich`
6. Sistema atualiza o banco de dados
7. Mostra alerta: "Domínio ativado com sucesso! Este domínio agora está ativo no Dashboard."
8. Badge muda: agora `leif.com.rich` está com badge verde
9. Usuário vai ao Dashboard e vê os atalhos do novo domínio ativo

### Cenário 2: Alternar domínio pelo Dashboard
1. Usuário acessa o Dashboard
2. Sistema carrega o domínio ativo atual (ou define o primeiro como ativo)
3. Exibe seletor de domínios no topo
4. Mostra atalhos apenas do domínio ativo
5. Usuário clica em outro domínio no seletor
6. Sistema atualiza o `active_domain_id` no banco
7. Dashboard recarrega os atalhos do novo domínio ativo

### Cenário 3: Domínio sem perfil
1. Usuário seleciona um domínio que não tem perfil configurado
2. Sistema exibe mensagem de alerta
3. Usuário clica em "Configurar Perfil"
4. É redirecionado para a página de edição do perfil

### Cenário 4: Módulos desativados
1. Usuário tem perfil configurado, mas desativou a Loja
2. Dashboard mostra apenas os cards "Minha Página" e "Feed Social"
3. Card "Loja" não é exibido

## Exemplo Prático

### Domínio `eriksonleif.com.rich`:
- Página: ✅ Ativa
- Loja: ✅ Ativa
- Social: ❌ Desativado

**Atalhos exibidos**: Minha Página + Loja

### Domínio `leif.com.rich`:
- Página: ✅ Ativa
- Loja: ❌ Desativado
- Social: ✅ Ativo

**Atalhos exibidos**: Minha Página + Feed Social

## Benefícios

1. **Visão Precisa**: Usuário vê apenas o que está ativo para o domínio selecionado
2. **Contexto Claro**: Sabe exatamente qual domínio está gerenciando
3. **Sem Confusão**: Não há atalhos para módulos desativados
4. **Experiência Fluida**: Alternância entre domínios é instantânea
5. **Feedback Visual**: Domínio ativo é claramente destacado
6. **Controle Total**: Botões diretos nos cards para ativar domínios

## Compatibilidade e Correções

- ✅ Funciona com domínios existentes
- ✅ Define automaticamente o primeiro domínio como ativo
- ✅ Usuários com 1 domínio não veem o seletor (desnecessário)
- ✅ Admin continua com acesso ilimitado
- ✅ **Retrocompatível**: Busca perfis por `user_id` se não encontrar por `domain_id`
- ✅ **Atalhos restaurados**: Sistema agora encontra perfis antigos que não têm `domain_id`

## Segurança

- RLS garante que usuários só modificam seu próprio `active_domain_id`
- Validação no banco impede seleção de domínios de outros usuários
- Triggers garantem consistência dos dados
- Políticas RLS mantêm a segurança do sistema

## O Que Foi Corrigido

### Problema 1: Atalhos Sumiram
**Causa**: Sistema buscava perfis apenas por `domain_id`, mas perfis antigos não têm esse campo populado.

**Solução**: Implementado fallback que busca por `user_id` se não encontrar por `domain_id`, garantindo compatibilidade com perfis antigos.

### Problema 2: Faltavam Botões de Ativar
**Causa**: Não havia interface para ativar/desativar domínios.

**Solução**: Adicionados botões diretos nos cards da página "Meus Domínios":
- Badge verde quando o domínio está ativo
- Botão azul "Ativar este Domínio" quando não está ativo
