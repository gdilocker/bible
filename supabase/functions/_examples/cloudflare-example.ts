/**
 * EXEMPLO: Edge Function com Cloudflare
 *
 * Este é um exemplo de como usar as variáveis de ambiente
 * em uma Edge Function do Supabase.
 *
 * Para criar uma função real, copie para:
 * supabase/functions/seu-nome/index.ts
 */

import { serverEnv, validateRequiredEnvVars } from '../../../src/lib/env.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Validar variáveis obrigatórias
    const { valid, missing } = validateRequiredEnvVars([
      'CLOUDFLARE_API_TOKEN',
      'CLOUDFLARE_ZONE_ID',
    ]);

    if (!valid) {
      return new Response(
        JSON.stringify({
          error: 'Configuração incompleta',
          missing: missing,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Acessar variáveis do Cloudflare
    const apiToken = serverEnv.cloudflare.apiToken();
    const zoneId = serverEnv.cloudflare.zoneId();
    const apiBase = serverEnv.cloudflare.apiBase();

    // Exemplo: Listar DNS records
    const response = await fetch(`${apiBase}/zones/${zoneId}/dns_records`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.statusText}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        records: data.result,
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
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
