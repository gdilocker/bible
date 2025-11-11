# Padrão de Espaçamento de Páginas

## Visão Geral
Este documento define o padrão consistente para espaçamento de títulos e conteúdo em relação ao menu superior (Header) em todas as páginas do projeto.

## Padrões de Espaçamento

### 1. **Compact** (`pt-24 pb-12`)
- **Uso**: Páginas de formulário, checkout, páginas de erro/sucesso
- **Padding Top**: 96px (6rem)
- **Padding Bottom**: 48px (3rem)
- **Exemplos**: Login, Checkout, Success, Failure

### 2. **Default** (`pt-32 pb-16`)
- **Uso**: Páginas de conteúdo padrão, políticas, FAQ
- **Padding Top**: 128px (8rem)
- **Padding Bottom**: 64px (4rem)
- **Exemplos**: Terms, Privacy, FAQ, Contact, Pricing

### 3. **Large** (`pt-40 pb-20`)
- **Uso**: Landing pages, páginas premium, páginas institucionais
- **Padding Top**: 160px (10rem)
- **Padding Bottom**: 80px (5rem)
- **Exemplos**: Home, Premium Landing, Rich Club, Sistema Global

## Componente PageLayout

Use o componente `PageLayout` para garantir consistência:

```tsx
import { PageLayout } from '../components/PageLayout';

<PageLayout
  title="Título da Página"
  subtitle="Subtítulo opcional"
  headerSpacing="default" // 'compact' | 'default' | 'large'
  backgroundColor="bg-[#FAFAFA]" // Cor de fundo personalizada
>
  {/* Conteúdo da página */}
</PageLayout>
```

## Padrão de Títulos

### Hierarquia de Títulos
- **H1** (Título Principal): `text-5xl md:text-6xl font-bold`
- **H2** (Seções): `text-3xl md:text-4xl font-bold`
- **H3** (Subseções): `text-2xl md:text-3xl font-semibold`

### Espaçamento entre Seções
- Entre H1 e conteúdo: `mb-16`
- Entre H2 e conteúdo: `mb-8`
- Entre seções: `mb-12` ou `mb-16`

## Cores de Background Padrão

- **Páginas Claras**: `bg-[#FAFAFA]` ou `bg-[#F5F5F5]`
- **Páginas Escuras**: `bg-black` ou `bg-gray-900`
- **Páginas Gradiente**: `bg-gradient-to-br from-[cor1] to-[cor2]`

## Páginas Especiais (Sem Header/Footer)

Páginas que não exibem Header/Footer devem usar:
- Dashboard: `pt-16` (apenas espaço para respirar)
- Panel: `pt-0` (sem espaço adicional)
- Perfis Públicos: `pt-0` (fullscreen)

## Checklist de Implementação

- [ ] Usar componente PageLayout sempre que possível
- [ ] Definir headerSpacing apropriado para o tipo de página
- [ ] Usar hierarquia de títulos consistente
- [ ] Aplicar cores de background padrão
- [ ] Testar responsividade em mobile e desktop
- [ ] Verificar espaçamento em diferentes resoluções
