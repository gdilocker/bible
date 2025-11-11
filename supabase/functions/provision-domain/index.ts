/**
 * Edge Function: Provision Domain
 *
 * POST /provision-domain
 * Body: { orderId: string }
 *
 * Triggers domain provisioning (IPFS + NFT + DNS)
 */

import { provisionDomain } from '../../../src/server/provision/provisionDomain.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'orderId is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Provisioning domain for order:', orderId);

    // Get config from environment
    const config = {
      // IPFS
      ipfsProvider: 'pinata' as const,
      ipfsApiKey: Deno.env.get('IPFS_API_KEY') || '',
      ipfsApiSecret: Deno.env.get('IPFS_API_SECRET') || '',

      // NFT
      nftContractAddress: Deno.env.get('NFT_CONTRACT_ADDRESS') || '',
      nftPrivateKey: Deno.env.get('NFT_PRIVATE_KEY') || '',
      rpcUrl: Deno.env.get('BLOCKCHAIN_RPC_URL') || 'https://polygon-rpc.com',
      chain: Deno.env.get('BLOCKCHAIN_CHAIN') || 'polygon',

      // Cloudflare
      cloudflareZoneId: Deno.env.get('CLOUDFLARE_ZONE_ID') || '',
      cloudflareApiToken: Deno.env.get('CLOUDFLARE_API_TOKEN') || '',
      publicAppHost: Deno.env.get('PUBLIC_APP_HOST') || 'app.pix.global',

      // Supabase
      supabaseUrl: Deno.env.get('SUPABASE_URL') || '',
      supabaseServiceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    };

    // Validate config
    const requiredKeys = [
      'ipfsApiKey',
      'ipfsApiSecret',
      'nftContractAddress',
      'nftPrivateKey',
      'cloudflareZoneId',
      'cloudflareApiToken',
      'supabaseUrl',
      'supabaseServiceKey',
    ];

    const missingKeys = requiredKeys.filter((key) => !config[key as keyof typeof config]);

    if (missingKeys.length > 0) {
      console.error('Missing configuration:', missingKeys);
      return new Response(
        JSON.stringify({
          error: 'Provisioning not configured',
          missing: missingKeys,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Provision domain
    const result = await provisionDomain(orderId, config);

    if (result.success) {
      return new Response(
        JSON.stringify({
          success: true,
          domain: result.domain,
          steps: result.steps,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          domain: result.domain,
          steps: result.steps,
          errors: result.errors,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
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
