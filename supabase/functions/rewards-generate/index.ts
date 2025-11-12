import { createClient } from 'npm:@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface GenerateRewardRequest {
  user_id: string;
  amount_usd: number;
  reward_type?: 'commission' | 'sale' | 'bonus' | 'referral';
  source_id?: string;
}

Deno.serve(async (req: Request) => {
  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Get auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify admin or system call
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if admin (for manual generation)
    const { data: customer } = await supabase
      .from('customers')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    const isAdmin = customer?.role === 'admin';

    // Parse body
    const body: GenerateRewardRequest = await req.json();
    const { user_id, amount_usd, reward_type = 'commission', source_id } = body;

    if (!user_id || !amount_usd || amount_usd <= 0) {
      return new Response(
        JSON.stringify({ error: 'user_id e amount_usd são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only admin or self can generate
    if (!isAdmin && user.id !== user_id) {
      return new Response(
        JSON.stringify({ error: 'Sem permissão' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call generate_reward_domain function
    const { data: rewardDomain, error: generateError } = await supabase.rpc(
      'generate_reward_domain',
      {
        p_user_id: user_id,
        p_amount_usd: amount_usd,
        p_reward_type: reward_type,
        p_source_id: source_id
      }
    );

    if (generateError) {
      console.error('Error generating reward domain:', generateError);
      throw new Error('Erro ao gerar domínio de recompensa: ' + generateError.message);
    }

    if (!rewardDomain || rewardDomain.length === 0) {
      throw new Error('Função não retornou domínio');
    }

    const domain = rewardDomain[0];

    // Get user email for notification
    const { data: userData } = await supabase.auth.admin.getUserById(user_id);
    const userEmail = userData?.user?.email;

    // TODO: Send email notification
    console.log(`Reward domain generated: ${domain.full_domain} for ${userEmail}`);

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        domain: {
          id: domain.domain_id,
          name: domain.domain_name,
          type: domain.domain_type,
          full_domain: domain.full_domain,
          value_usd: amount_usd
        },
        message: `Domínio ${domain.full_domain} gerado como recompensa`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in rewards-generate:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erro interno'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
