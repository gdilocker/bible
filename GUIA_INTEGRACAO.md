# Guia de Integração - Módulos de Segurança e Performance

## 📋 Visão Geral

Este guia mostra **exatamente** como integrar os novos módulos de segurança e performance que foram criados.

---

## 1. SANITIZAÇÃO DE CSS

### Onde Usar
Qualquer lugar que aceite CSS customizado do usuário.

### Locais Identificados

#### **ProfileManager.tsx** (ou similar)
Quando o usuário salvar CSS customizado:

```typescript
import { validateAndSanitizeCSS } from '../lib/sanitizeCSS';

// Antes de salvar
const handleSaveCustomCSS = async (css: string) => {
  // Validar e sanitizar
  const result = validateAndSanitizeCSS(css);

  if (!result.valid) {
    // Mostrar erro ao usuário
    toast.error(result.error || 'CSS inválido');
    return;
  }

  // Se o CSS foi modificado, avisar o usuário
  if (result.sanitized !== css) {
    toast.warning('Algumas regras CSS foram removidas por segurança');
  }

  // Salvar o CSS sanitizado
  const { error } = await supabase
    .from('user_profiles')
    .update({ custom_css: result.sanitized })
    .eq('id', profileId);

  if (error) {
    toast.error('Erro ao salvar CSS');
  } else {
    toast.success('CSS salvo com sucesso');
  }
};
```

#### **CustomCSSEditor.tsx**
Adicionar validação em tempo real:

```typescript
import { sanitizeCSS, validateCSSLength } from '../lib/sanitizeCSS';
import { useState, useEffect } from 'react';

const CustomCSSEditor = () => {
  const [css, setCSS] = useState('');
  const [sanitized, setSanitized] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    // Validar em tempo real (com debounce)
    const timeout = setTimeout(() => {
      if (!validateCSSLength(css)) {
        setWarnings(['CSS muito longo (máximo 50KB)']);
        return;
      }

      try {
        const clean = sanitizeCSS(css);
        setSanitized(clean);

        if (clean !== css) {
          setWarnings(['Algumas regras foram removidas por segurança']);
        } else {
          setWarnings([]);
        }
      } catch (e) {
        setWarnings(['CSS inválido']);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [css]);

  return (
    <div>
      <textarea
        value={css}
        onChange={(e) => setCSS(e.target.value)}
        className="w-full h-64 font-mono"
      />

      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mt-2">
          {warnings.map((w, i) => (
            <div key={i} className="text-yellow-800 text-sm">{w}</div>
          ))}
        </div>
      )}

      {/* Preview do CSS sanitizado */}
      {sanitized && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">CSS Sanitizado (Preview)</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
            {sanitized}
          </pre>
        </div>
      )}
    </div>
  );
};
```

---

## 2. VALIDAÇÃO DE FILE UPLOADS

### Onde Usar
Qualquer upload de arquivo (imagens, vídeos, documentos).

### Locais Identificados

#### **BackgroundEditor.tsx**
Validar antes de upload:

```typescript
import {
  validateImage,
  validateVideo,
  sanitizeFilename,
  generateUniqueFilename
} from '../lib/fileValidation';

const handleFileUpload = async (file: File, type: 'image' | 'video') => {
  // Validar
  const result = type === 'image'
    ? await validateImage(file)
    : await validateVideo(file);

  if (!result.valid) {
    toast.error(result.error || 'Arquivo inválido');
    return;
  }

  // Gerar nome único
  const uniqueName = generateUniqueFilename(file.name);

  // Upload para Supabase Storage
  const { data, error } = await supabase.storage
    .from('profile-images')
    .upload(`${userId}/${uniqueName}`, file);

  if (error) {
    toast.error('Erro ao fazer upload');
    return;
  }

  toast.success('Upload realizado com sucesso');
  return data.path;
};
```

#### **Avatar Upload** (AccountSettings.tsx ou similar)

```typescript
import { validateAvatar, generateUniqueFilename } from '../lib/fileValidation';

const handleAvatarUpload = async (file: File) => {
  // Validação mais estrita para avatares
  const result = await validateAvatar(file);

  if (!result.valid) {
    toast.error(result.error || 'Avatar inválido');
    return;
  }

  // Mostrar preview antes de upload
  const reader = new FileReader();
  reader.onloadend = () => {
    setAvatarPreview(reader.result as string);
  };
  reader.readAsDataURL(file);

  // Upload
  const uniqueName = generateUniqueFilename(file.name);
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`${userId}/${uniqueName}`, file);

  if (error) {
    toast.error('Erro ao fazer upload do avatar');
    return;
  }

  // Atualizar profile
  await supabase
    .from('user_profiles')
    .update({ avatar_url: data.path })
    .eq('user_id', userId);

  toast.success('Avatar atualizado');
};
```

#### **Edge Function: upload-social-media**
Validar no servidor também:

```typescript
// supabase/functions/upload-social-media/index.ts
import { validateImage, validateVideo } from '../../src/lib/fileValidation.ts';

Deno.serve(async (req) => {
  // ... CORS, auth, etc

  const formData = await req.formData();
  const file = formData.get('file') as File;
  const type = formData.get('type') as string;

  // Validar no servidor
  const result = type === 'image'
    ? await validateImage(file)
    : await validateVideo(file);

  if (!result.valid) {
    return new Response(
      JSON.stringify({ error: result.error }),
      { status: 400 }
    );
  }

  // Prosseguir com upload
  // ...
});
```

---

## 3. SISTEMA DE CACHE

### Onde Usar
Queries frequentes que não mudam rapidamente.

### Exemplos de Integração

#### **Carregar Subscription Plans** (Pricing.tsx)

```typescript
import { cache, CacheKeys, CacheTTL } from '../lib/cache';

const loadSubscriptionPlans = async () => {
  // Tentar do cache primeiro
  const cached = cache.get(CacheKeys.subscriptionPlan('all'));
  if (cached) {
    setPlans(cached);
    return;
  }

  // Se não estiver no cache, buscar do banco
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('price_cents', { ascending: true });

  if (error) {
    toast.error('Erro ao carregar planos');
    return;
  }

  // Cachear por 30 minutos
  cache.set(CacheKeys.subscriptionPlan('all'), data, CacheTTL.LONG);
  setPlans(data);
};
```

#### **Carregar User Profile** (ProfileManager.tsx)

```typescript
import { cache, CacheKeys, CacheTTL } from '../lib/cache';

// Usando get-or-set (mais limpo)
const loadUserProfile = async (userId: string) => {
  const profile = await cache.getOrSet(
    CacheKeys.userProfile(userId),
    async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      return data;
    },
    CacheTTL.MEDIUM // 5 minutos
  );

  setProfile(profile);
};
```

#### **Invalidar Cache Após Update**

```typescript
import { cache, CacheKeys } from '../lib/cache';

const updateProfile = async (userId: string, updates: any) => {
  const { error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', userId);

  if (!error) {
    // IMPORTANTE: Invalidar cache após atualização
    cache.delete(CacheKeys.userProfile(userId));
    toast.success('Perfil atualizado');
  }
};
```

#### **Cachear Premium Domains** (Marketplace.tsx)

```typescript
import { cache, CacheTTL } from '../lib/cache';

const loadPremiumDomains = async (page: number = 1) => {
  const cacheKey = `premium:domains:page:${page}`;

  const domains = await cache.getOrSet(
    cacheKey,
    async () => {
      const { data } = await supabase
        .from('premium_domains')
        .select('*')
        .eq('is_listed', true)
        .eq('status', 'available')
        .range((page - 1) * 20, page * 20 - 1)
        .order('created_at', { ascending: false });

      return data;
    },
    CacheTTL.SHORT // 1 minuto (marketplace é dinâmico)
  );

  setDomains(domains);
};
```

---

## 4. RATE LIMITING EM EDGE FUNCTIONS

### Como Aplicar

#### **Template Padrão**

```typescript
// supabase/functions/your-function/index.ts
import { rateLimitMiddleware } from '../_shared/rateLimit.middleware.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // RATE LIMITING - ADICIONAR AQUI
  const rateLimitResponse = await rateLimitMiddleware(
    req,
    `${req.method}:/your-function` // Use o nome da rota
  );
  if (rateLimitResponse) return rateLimitResponse;

  // Seu código aqui
  // ...

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
```

#### **Funções Que Precisam de Rate Limiting**

1. **domains** function:
```typescript
const rateLimitResponse = await rateLimitMiddleware(req, 'POST:/domains');
```

2. **dns** function:
```typescript
const rateLimitResponse = await rateLimitMiddleware(req, 'POST:/dns');
```

3. **domain-transfer** function:
```typescript
const rateLimitResponse = await rateLimitMiddleware(req, 'POST:/domain-transfer');
```

4. **upload-social-media** function:
```typescript
const rateLimitResponse = await rateLimitMiddleware(req, 'POST:/upload-social-media');
```

5. **delete-account** function:
```typescript
const rateLimitResponse = await rateLimitMiddleware(req, 'POST:/delete-account');
```

6. **Todas as outras funções públicas**

---

## 5. ADICIONAR IDEMPOTÊNCIA EM DYNADOT WEBHOOK

### Implementação

```typescript
// supabase/functions/dynadot-webhook/index.ts

Deno.serve(async (req: Request) => {
  // ... CORS

  const body = await req.text();
  const event = JSON.parse(body);

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // IDEMPOTENCY CHECK
  const eventId = event.id || event.order_id; // Ajustar conforme API Dynadot
  if (eventId) {
    const { data: existingEvent } = await supabaseClient
      .from("webhook_events")
      .select("id")
      .eq("provider", "dynadot")
      .eq("external_id", eventId)
      .maybeSingle();

    if (existingEvent) {
      console.log(`[Dynadot Webhook] Event ${eventId} already processed`);
      return new Response(
        JSON.stringify({ success: true, message: "Already processed" }),
        { status: 200 }
      );
    }
  }

  // Process event
  let result: any;
  switch (event.type) {
    case 'domain_registered':
      result = await handleDomainRegistered(event, supabaseClient);
      break;
    // ... outros eventos
  }

  // Store event as processed
  if (eventId && result.success !== false) {
    await supabaseClient
      .from("webhook_events")
      .insert({
        provider: "dynadot",
        external_id: eventId,
        event_type: event.type,
        payload: event,
      })
      .catch((err) => console.error("Failed to store webhook event:", err));
  }

  return new Response(
    JSON.stringify(result),
    { status: 200 }
  );
});
```

---

## 6. PROTECTED BRANDS VALIDATION

### Onde Implementar

#### **No Checkout** (Checkout.tsx)

```typescript
import { supabase } from '../lib/supabase';

const checkProtectedBrand = async (subdomain: string): Promise<{
  isProtected: boolean;
  brand?: string;
  requiresVerification: boolean;
}> => {
  const { data: brands } = await supabase
    .from('protected_brands')
    .select('*')
    .eq('status', 'active');

  if (!brands) return { isProtected: false, requiresVerification: false };

  for (const brand of brands) {
    try {
      const pattern = new RegExp(brand.pattern, 'i');
      if (pattern.test(subdomain)) {
        return {
          isProtected: true,
          brand: brand.name,
          requiresVerification: true
        };
      }
    } catch (e) {
      console.error('Invalid regex pattern:', brand.pattern);
    }
  }

  return { isProtected: false, requiresVerification: false };
};

// Usar antes de permitir checkout
const handleCheckout = async () => {
  const check = await checkProtectedBrand(selectedDomain);

  if (check.isProtected) {
    setShowProtectedBrandModal(true);
    setProtectedBrandInfo(check);
    return;
  }

  // Prosseguir com checkout normal
  proceedWithCheckout();
};
```

#### **Modal de Protected Brand**

```tsx
const ProtectedBrandModal = ({ brand, onVerify, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md">
        <h2 className="text-xl font-bold mb-4">Marca Protegida</h2>
        <p className="mb-4">
          O domínio que você selecionou contém a marca protegida <strong>{brand}</strong>.
        </p>
        <p className="mb-4">
          Para registrar este domínio, você precisa comprovar que tem direitos sobre esta marca.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onVerify}
            className="flex-1 bg-blue-600 text-white py-2 rounded"
          >
            Solicitar Verificação
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 py-2 rounded"
          >
            Escolher Outro Domínio
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 7. TESTE DE INTEGRAÇÃO

### Checklist de Testes

#### **CSS Sanitization**
```bash
# Teste 1: CSS válido
input: "body { color: red; }"
expected: Pass

# Teste 2: JavaScript injection
input: "body { behavior: url('javascript:alert(1)'); }"
expected: Blocked

# Teste 3: CSS muito longo
input: "body { ... }" (> 50KB)
expected: Error "CSS too long"
```

#### **File Validation**
```bash
# Teste 1: Imagem válida
file: image.jpg (JPEG, 2MB)
expected: Pass

# Teste 2: Arquivo muito grande
file: video.mp4 (150MB)
expected: Error "Video too large"

# Teste 3: Tipo inválido
file: malicious.exe renamed to image.jpg
expected: Error "File content does not match type"
```

#### **Cache**
```bash
# Teste 1: Cache miss -> fetch -> cache hit
1. Buscar planos (deve ir ao banco)
2. Buscar planos novamente (deve vir do cache)
3. Verificar logs: "Cache miss" -> "Cache hit"

# Teste 2: Cache invalidation
1. Buscar profile (cache)
2. Atualizar profile (invalidar cache)
3. Buscar profile (deve ir ao banco novamente)
```

#### **Rate Limiting**
```bash
# Teste 1: Limite normal
1. Fazer 5 requests POST /domains em 1 minuto
2. 6º request deve retornar 429 Too Many Requests

# Teste 2: Headers corretos
1. Verificar headers X-RateLimit-Limit, Remaining, Reset
2. Verificar header Retry-After quando bloqueado
```

#### **Idempotency**
```bash
# Teste 1: Webhook duplicado
1. Enviar webhook PayPal (event_id=123)
2. Processar (deve criar order)
3. Enviar mesmo webhook novamente (event_id=123)
4. Deve retornar "Already processed" sem criar order duplicado
```

---

## 8. MONITORING E LOGS

### Adicionar Logs Úteis

```typescript
// Exemplo de logging estruturado
console.log('[Cache] Hit:', CacheKeys.userProfile(userId));
console.log('[Cache] Miss:', CacheKeys.subscriptionPlan('all'));
console.log('[Validation] CSS sanitized, removed X properties');
console.log('[Validation] File rejected:', { type: file.type, size: file.size });
console.log('[RateLimit] Exceeded:', { route: 'POST:/domains', ip: '1.2.3.4' });
console.log('[Idempotency] Duplicate event detected:', eventId);
```

### Métricas para Monitorar

1. **Cache Hit Rate**:
   - Objetivo: > 70%
   - Métrica: (hits / (hits + misses)) * 100

2. **Rate Limit Violations**:
   - Objetivo: < 1% das requests
   - Alertar se > 5%

3. **File Validation Rejections**:
   - Objetivo: < 2% dos uploads
   - Revisar se > 10% (pode indicar UX ruim)

4. **Webhook Duplicates Detected**:
   - Objetivo: Detectar 100% das duplicatas
   - Alertar se não detectar

---

## ✅ CHECKLIST FINAL DE INTEGRAÇÃO

### Frontend
- [ ] Importar sanitizeCSS em ProfileManager
- [ ] Importar validateImage/Video em uploads
- [ ] Importar cache em queries frequentes
- [ ] Adicionar feedback de validação ao usuário
- [ ] Testar todos os fluxos de upload
- [ ] Testar salvamento de CSS customizado

### Backend (Edge Functions)
- [ ] Adicionar rate limiting em domains
- [ ] Adicionar rate limiting em dns
- [ ] Adicionar rate limiting em domain-transfer
- [ ] Adicionar rate limiting em upload-social-media
- [ ] Adicionar rate limiting em delete-account
- [ ] Adicionar idempotency em dynadot-webhook
- [ ] Validar arquivos no servidor (upload-social-media)

### Database
- [ ] Rodar migrations (010, 020, 030, 040)
- [ ] Verificar índices criados
- [ ] Verificar tabela webhook_events
- [ ] Testar queries com novos índices

### Testing
- [ ] Testes de CSS sanitization
- [ ] Testes de file validation
- [ ] Testes de cache (hit/miss)
- [ ] Testes de rate limiting
- [ ] Testes de idempotency
- [ ] Testes end-to-end de cada fluxo

### Documentation
- [ ] Atualizar README com novos módulos
- [ ] Documentar variáveis de ambiente
- [ ] Criar guia para novos desenvolvedores

---

## 🆘 TROUBLESHOOTING

### "Cache não está funcionando"
- Verificar se está usando as keys corretas
- Verificar TTL (pode ter expirado)
- Verificar se está invalidando após updates

### "File validation sempre falha"
- Verificar magic bytes do arquivo
- Verificar se MIME type está correto
- Verificar limites de tamanho

### "Rate limiting não está bloqueando"
- Verificar se middleware foi adicionado ANTES da lógica
- Verificar configuração de limites em rateLimit.middleware.ts
- Verificar logs para ver se está sendo chamado

### "Idempotency não está funcionando"
- Verificar se webhook_events table existe
- Verificar se event_id está presente
- Verificar RLS policies em webhook_events

---

_Guia criado em 2025-10-29_
