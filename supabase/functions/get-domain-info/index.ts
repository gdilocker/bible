/**
 * Edge Function: Get Domain Info
 *
 * GET /get-domain-info?fqdn=maria.pix.global
 * Returns public domain information including payment routes
 */

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const fqdn = url.searchParams.get('fqdn');

    if (!fqdn) {
      return new Response(
        JSON.stringify({ error: 'FQDN is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch domain
    const { data: domain, error: domainError } = await supabase
      .from('domains')
      .select('*')
      .eq('fqdn', fqdn)
      .eq('status', 'active')
      .maybeSingle();

    if (domainError || !domain) {
      return new Response(
        JSON.stringify({ error: 'Domain not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch user profile (if exists)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', domain.owner_id)
      .maybeSingle();

    // Build response
    const response = {
      fqdn: domain.fqdn,
      label: domain.fqdn.replace('.pix.global', ''),
      type: domain.type,
      status: domain.status,

      // NFT info
      nft: {
        tokenId: domain.nft_token_id,
        contract: domain.nft_contract,
        chain: domain.metadata?.chain || 'polygon',
        ipfsHash: domain.ipfs_hash,
        ipfsUrl: domain.metadata?.ipfsUrl,
        gatewayUrl: domain.metadata?.gatewayUrl,
        transactionHash: domain.metadata?.transactionHash,
        blockNumber: domain.metadata?.blockNumber,
      },

      // Profile info (personal domains only)
      profile: domain.type === 'personal' && profile ? {
        displayName: profile.full_name || profile.display_name,
        bio: profile.bio,
        avatar: profile.avatar_url,
        location: profile.location,
        website: profile.website,
      } : null,

      // Payment routes (personal domains only)
      paymentRoutes: domain.type === 'personal' && profile?.metadata?.rotas ? {
        pix: {
          enabled: !!(
            profile.metadata.rotas.pix_chave ||
            profile.metadata.rotas.pix_qrcode
          ),
          chave: profile.metadata.rotas.pix_chave || null,
          qrcode: profile.metadata.rotas.pix_qrcode || null,
          beneficiario: profile.metadata.rotas.pix_beneficiario || null,
        },
        crypto: {
          enabled: !!(
            profile.metadata.rotas.crypto_wallet ||
            profile.metadata.rotas.crypto_usdc_address
          ),
          wallet: profile.metadata.rotas.crypto_wallet || null,
          usdcAddress: profile.metadata.rotas.crypto_usdc_address || null,
          chain: profile.metadata.rotas.crypto_chain || 'polygon',
        },
        paypal: {
          enabled: !!profile.metadata.rotas.paypal_link,
          link: profile.metadata.rotas.paypal_link || null,
        },
      } : null,

      // Timestamps
      createdAt: domain.created_at,
      purchasedAt: domain.metadata?.purchasedAt,
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
