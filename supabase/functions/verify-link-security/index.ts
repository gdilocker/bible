import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.middleware.ts';
import { checkUrlSafety, recordSecurityCheck, isUrlSuspicious } from '../_shared/link.security.ts';

interface VerifyLinkRequest {
  linkId: string;
  url: string;
  checkType?: 'automatic' | 'manual' | 'periodic' | 'user_request';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (!authError && user) {
        userId = user.id;
      }
    }

    const { linkId, url, checkType = 'automatic' }: VerifyLinkRequest = await req.json();

    if (!linkId || !url) {
      return new Response(
        JSON.stringify({ error: 'linkId e url são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Verificando link ${linkId}: ${url}`);

    const suspicious = isUrlSuspicious(url);

    if (suspicious.suspicious) {
      console.log(`URL suspeita detectada: ${suspicious.reason}`);
    }

    const securityResult = await checkUrlSafety(url);

    if (suspicious.suspicious && securityResult.status === 'safe') {
      securityResult.status = 'suspicious';
      securityResult.notes = `${securityResult.notes} | Padrão suspeito: ${suspicious.reason}`;
    }

    const recordResult = await recordSecurityCheck(
      supabase,
      linkId,
      securityResult,
      checkType,
      checkType === 'manual' ? userId : undefined
    );

    if (!recordResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Erro ao registrar verificação',
          details: recordResult.error
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: linkData } = await supabase
      .from('profile_links')
      .select('security_status, is_blocked')
      .eq('id', linkId)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        checkId: recordResult.checkId,
        result: {
          status: securityResult.status,
          threatTypes: securityResult.threatTypes,
          isBlocked: linkData?.is_blocked || false,
          notes: securityResult.notes
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-link-security:', error);
    return new Response(
      JSON.stringify({
        error: 'Erro interno do servidor',
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
