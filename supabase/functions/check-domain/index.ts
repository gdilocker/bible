/**
 * Edge Function: Verificar Disponibilidade de Domínio
 *
 * POST /check-domain
 * Body: { name: string }
 * Response: { available: boolean, type: 'personal'|'numeric', reason?: string }
 */

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

// Lista de nomes bloqueados (sincronizada com src/lib/blockedNames.ts)
const BLOCKED_NAMES = new Set([
  'pix', 'pixglobal', 'global', 'admin', 'root', 'system', 'api', 'www', 'app',
  'dashboard', 'panel', 'suporte', 'support', 'help', 'ajuda',
  'google', 'facebook', 'amazon', 'microsoft', 'apple', 'meta', 'instagram',
  'whatsapp', 'twitter', 'x', 'youtube', 'netflix', 'spotify', 'tiktok',
  'linkedin', 'github', 'gitlab', 'bitbucket',
  'visa', 'mastercard', 'paypal', 'stripe', 'nubank', 'itau', 'bradesco',
  'santander', 'bb', 'caixa', 'picpay', 'mercadopago', 'pagseguro',
  'bitcoin', 'ethereum', 'binance', 'coinbase', 'metamask',
  'governo', 'government', 'federal', 'receita', 'policia', 'police', 'fbi', 'cia',
  'oficial', 'official', 'verified', 'verificado',
  'http', 'https', 'ftp', 'ssh', 'dns', 'smtp', 'imap', 'pop3',
  '0', '1', '00', '11', '000', '111', '123', '1234', '12345', '123456',
  'test', 'teste', 'example', 'exemplo', 'demo', 'temp', 'tmp', 'null', 'undefined',
]);

function validateNameFormat(name: string): { valid: boolean; error?: string } {
  const regex = /^[a-z0-9]{1,64}$/;

  if (!name || name.length === 0) {
    return { valid: false, error: 'Nome é obrigatório' };
  }

  if (name.length > 64) {
    return { valid: false, error: 'Nome deve ter no máximo 64 caracteres' };
  }

  if (!regex.test(name)) {
    return { valid: false, error: 'Apenas letras minúsculas e números são permitidos' };
  }

  return { valid: true };
}

function detectNameType(name: string): 'personal' | 'numeric' {
  return /^\d+$/.test(name) ? 'numeric' : 'personal';
}

function isNameBlocked(name: string): boolean {
  return BLOCKED_NAMES.has(name.toLowerCase().trim());
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Parse request
    const { name } = await req.json();

    if (!name) {
      return new Response(
        JSON.stringify({
          available: false,
          type: 'personal',
          reason: 'Nome é obrigatório',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Normalizar
    const normalized = name.toLowerCase().trim();

    // Validar formato
    const formatValidation = validateNameFormat(normalized);
    if (!formatValidation.valid) {
      return new Response(
        JSON.stringify({
          available: false,
          type: detectNameType(normalized),
          reason: formatValidation.error,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verificar blocklist
    if (isNameBlocked(normalized)) {
      return new Response(
        JSON.stringify({
          available: false,
          type: detectNameType(normalized),
          reason: 'Este nome está reservado ou bloqueado',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Detectar tipo
    const type = detectNameType(normalized);

    // Construir FQDN completo
    const fqdn = `${normalized}.pix.global`;

    // Conectar ao Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar se domínio já existe
    const { data: existingDomain, error: dbError } = await supabase
      .from('domains')
      .select('id, status')
      .eq('fqdn', fqdn)
      .maybeSingle();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({
          available: false,
          type,
          reason: 'Erro ao verificar disponibilidade',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Se domínio existe, não está disponível
    if (existingDomain) {
      return new Response(
        JSON.stringify({
          available: false,
          type,
          reason: 'Este domínio já está registrado',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Domínio disponível!
    return new Response(
      JSON.stringify({
        available: true,
        type,
        fqdn,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        available: false,
        type: 'personal',
        reason: 'Erro interno do servidor',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
