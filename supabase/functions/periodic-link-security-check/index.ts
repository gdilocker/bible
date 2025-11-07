import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.middleware.ts';
import { checkUrlSafety, recordSecurityCheck } from '../_shared/link.security.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const cronSecret = Deno.env.get('CRON_SECRET');

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new Response(
        JSON.stringify({ error: 'Acesso não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Iniciando verificação periódica de segurança de links...');

    const { data: linksToCheck, error: fetchError } = await supabase
      .rpc('get_links_for_periodic_check', { p_hours_since_last_check: 24 });

    if (fetchError) {
      console.error('Erro ao buscar links:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar links', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!linksToCheck || linksToCheck.length === 0) {
      console.log('Nenhum link precisa de verificação no momento');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Nenhum link para verificar',
          checked: 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Verificando ${linksToCheck.length} links...`);

    const results = {
      total: linksToCheck.length,
      safe: 0,
      suspicious: 0,
      malicious: 0,
      pending: 0,
      errors: 0
    };

    for (const link of linksToCheck) {
      try {
        console.log(`Verificando link ${link.link_id}: ${link.url}`);

        const securityResult = await checkUrlSafety(link.url);

        await recordSecurityCheck(
          supabase,
          link.link_id,
          securityResult,
          'periodic'
        );

        results[securityResult.status]++;

        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Erro ao verificar link ${link.link_id}:`, error);
        results.errors++;
      }
    }

    console.log('Verificação periódica concluída:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verificação periódica concluída',
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in periodic-link-security-check:', error);
    return new Response(
      JSON.stringify({
        error: 'Erro interno do servidor',
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
