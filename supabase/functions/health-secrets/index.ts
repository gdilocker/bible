/**
 * Edge Function: Health Check - Production Secrets Validation
 *
 * GET /functions/v1/health-secrets
 *
 * Validates all production API keys and connections without exposing secrets.
 * Returns boolean status for each service: PayPal, Cloudflare, RPC, IPFS, NFT
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ============================================================================
// PayPal Validation
// ============================================================================
async function validatePayPal(): Promise<{ success: boolean; error?: string }> {
  try {
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const paypalEnv = Deno.env.get('PAYPAL_ENV') || 'sandbox';

    if (!clientId || !clientSecret) {
      return { success: false, error: 'Missing credentials' };
    }

    const baseUrl = paypalEnv === 'sandbox'
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    const auth = btoa(`${clientId}:${clientSecret}`);

    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    if (!data.access_token) {
      return { success: false, error: 'No access token' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Connection failed' };
  }
}

// ============================================================================
// Cloudflare DNS Validation
// ============================================================================
async function validateCloudflare(): Promise<{ success: boolean; error?: string }> {
  try {
    const apiToken = Deno.env.get('CLOUDFLARE_API_TOKEN');
    const zoneId = Deno.env.get('CLOUDFLARE_ZONE_ID');
    const apiBase = Deno.env.get('CLOUDFLARE_API_BASE') || 'https://api.cloudflare.com/client/v4';

    if (!apiToken || !zoneId) {
      return { success: false, error: 'Missing credentials' };
    }

    const response = await fetch(`${apiBase}/zones/${zoneId}/dns_records?per_page=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    if (!data.success) {
      return { success: false, error: 'API returned error' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Connection failed' };
  }
}

// ============================================================================
// RPC/Blockchain Validation
// ============================================================================
async function validateRPC(): Promise<{ success: boolean; error?: string }> {
  try {
    const rpcUrl = Deno.env.get('RPC_URL');

    if (!rpcUrl) {
      return { success: false, error: 'Missing RPC URL' };
    }

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'web3_clientVersion',
        params: [],
        id: 1,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    if (!data.result) {
      return { success: false, error: 'No result' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Connection failed' };
  }
}

// ============================================================================
// IPFS Validation (Pinata)
// ============================================================================
async function validateIPFS(): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = Deno.env.get('IPFS_API_KEY');
    const apiSecret = Deno.env.get('IPFS_SECRET');

    if (!apiKey || !apiSecret) {
      return { success: false, error: 'Missing credentials' };
    }

    // Test Pinata authentication
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': apiSecret,
      },
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    if (!data.message || data.message !== 'Congratulations! You are communicating with the Pinata API!') {
      return { success: false, error: 'Invalid response' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Connection failed' };
  }
}

// ============================================================================
// NFT Contract Validation
// ============================================================================
async function validateNFT(): Promise<{ success: boolean; error?: string }> {
  try {
    const contractAddress = Deno.env.get('NFT_CONTRACT_ADDRESS');
    const abiJson = Deno.env.get('NFT_CONTRACT_ABI_JSON');
    const rpcUrl = Deno.env.get('RPC_URL');

    if (!contractAddress || !abiJson || !rpcUrl) {
      return { success: false, error: 'Missing configuration' };
    }

    // Validate contract address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
      return { success: false, error: 'Invalid address format' };
    }

    // Parse ABI to find name() function
    let abi;
    try {
      abi = JSON.parse(abiJson);
    } catch {
      return { success: false, error: 'Invalid ABI JSON' };
    }

    const nameFunction = abi.find((item: any) =>
      item.type === 'function' && item.name === 'name'
    );

    if (!nameFunction) {
      return { success: false, error: 'name() function not found in ABI' };
    }

    // Call name() function to verify contract
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: contractAddress,
            data: '0x06fdde03', // name() function selector
          },
          'latest',
        ],
        id: 1,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    if (data.error) {
      return { success: false, error: 'Contract call failed' };
    }

    if (!data.result || data.result === '0x') {
      return { success: false, error: 'No contract at address' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Validation failed' };
  }
}

// ============================================================================
// Main Handler
// ============================================================================
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Run all validations in parallel
    const [paypal, cloudflare, rpc, ipfs, nft] = await Promise.all([
      validatePayPal(),
      validateCloudflare(),
      validateRPC(),
      validateIPFS(),
      validateNFT(),
    ]);

    // Count successes
    const validations = { paypal, cloudflare, rpc, ipfs, nft };
    const total = Object.keys(validations).length;
    const passed = Object.values(validations).filter(v => v.success).length;

    const response = {
      status: passed === total ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        paypal: paypal.success,
        cloudflare: cloudflare.success,
        rpc: rpc.success,
        ipfs: ipfs.success,
        nft: nft.success,
      },
      details: {
        paypal: paypal.success ? 'Connected' : paypal.error || 'Failed',
        cloudflare: cloudflare.success ? 'Connected' : cloudflare.error || 'Failed',
        rpc: rpc.success ? 'Connected' : rpc.error || 'Failed',
        ipfs: ipfs.success ? 'Connected' : ipfs.error || 'Failed',
        nft: nft.success ? 'Contract verified' : nft.error || 'Failed',
      },
      summary: {
        total,
        passed,
        failed: total - passed,
        percentage: Math.round((passed / total) * 100),
      },
    };

    const statusCode = passed === total ? 200 : 503;

    return new Response(
      JSON.stringify(response, null, 2),
      {
        status: statusCode,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Health check error:', error);
    return new Response(
      JSON.stringify({
        status: 'error',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
