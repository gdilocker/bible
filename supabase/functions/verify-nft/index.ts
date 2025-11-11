/**
 * Edge Function: Complete Domain Verification
 *
 * GET /verify-nft?fqdn=maria.pix.global
 *
 * Verifies:
 * 1. DNS TXT record (nft_contract, token_id)
 * 2. NFT ownership on-chain (ownerOf)
 * 3. Token URI (ipfs://)
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

// ERC721 ABI for verification
const NFT_ABI = [
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
];

/**
 * Verify DNS TXT record
 */
async function verifyDNS(fqdn: string): Promise<{
  verified: boolean;
  contract?: string;
  tokenId?: string;
  error?: string;
}> {
  try {
    // Use Google DNS-over-HTTPS
    const dnsUrl = `https://dns.google/resolve?name=${fqdn}&type=TXT`;
    const response = await fetch(dnsUrl);

    if (!response.ok) {
      return { verified: false, error: 'DNS lookup failed' };
    }

    const data = await response.json();

    if (!data.Answer || data.Answer.length === 0) {
      return { verified: false, error: 'No TXT records found' };
    }

    // Look for NFT record
    for (const record of data.Answer) {
      const txt = record.data.replace(/"/g, '');

      // Parse: "nft_contract=0x...; token_id=123; chain=polygon"
      const contractMatch = txt.match(/nft_contract=([^;]+)/);
      const tokenIdMatch = txt.match(/token_id=([^;]+)/);

      if (contractMatch && tokenIdMatch) {
        return {
          verified: true,
          contract: contractMatch[1].trim(),
          tokenId: tokenIdMatch[1].trim(),
        };
      }
    }

    return { verified: false, error: 'NFT record not found in TXT' };
  } catch (error) {
    console.error('DNS verification error:', error);
    return {
      verified: false,
      error: error.message,
    };
  }
}

/**
 * Verify NFT on-chain
 */
async function verifyOnChain(
  contractAddress: string,
  tokenId: string,
  rpcUrl: string
): Promise<{
  verified: boolean;
  owner?: string;
  tokenUri?: string;
  error?: string;
}> {
  try {
    const { ethers } = await import('npm:ethers@6');

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, NFT_ABI, provider);

    // Get owner
    const owner = await contract.ownerOf(tokenId);

    // Get tokenURI
    let tokenUri = '';
    try {
      tokenUri = await contract.tokenURI(tokenId);
    } catch (e) {
      console.warn('Could not fetch tokenURI:', e);
    }

    return {
      verified: true,
      owner: owner.toLowerCase(),
      tokenUri,
    };
  } catch (error) {
    console.error('On-chain verification error:', error);
    return {
      verified: false,
      error: error.message,
    };
  }
}

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

    const { createClient } = await import('npm:@supabase/supabase-js@2');

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch domain from database
    const { data: domain, error: domainError } = await supabase
      .from('domains')
      .select('*')
      .eq('fqdn', fqdn)
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

    // Check if NFT info exists in database
    if (!domain.nft_contract || !domain.nft_token_id) {
      return new Response(
        JSON.stringify({
          fqdn: domain.fqdn,
          chain: domain.metadata?.chain || 'polygon',
          contract: null,
          token_id: null,
          owner: null,
          token_uri: null,
          dns_verified: false,
          onchain_owner_verified: false,
          message: 'NFT not minted yet',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Verifying domain:', fqdn);
    console.log('Expected contract:', domain.nft_contract);
    console.log('Expected token ID:', domain.nft_token_id);

    // Verify DNS TXT record
    const dnsVerification = await verifyDNS(fqdn);
    console.log('DNS verification:', dnsVerification);

    // Check if DNS matches database
    const dnsMatches =
      dnsVerification.verified &&
      dnsVerification.contract?.toLowerCase() === domain.nft_contract.toLowerCase() &&
      dnsVerification.tokenId === domain.nft_token_id;

    // Verify on-chain
    const rpcUrl = Deno.env.get('BLOCKCHAIN_RPC_URL') || 'https://polygon-rpc.com';
    const onchainVerification = await verifyOnChain(
      domain.nft_contract,
      domain.nft_token_id,
      rpcUrl
    );
    console.log('On-chain verification:', onchainVerification);

    // Build response
    const response = {
      fqdn: domain.fqdn,
      chain: domain.metadata?.chain || 'polygon',
      contract: domain.nft_contract,
      token_id: parseInt(domain.nft_token_id, 10),
      owner: onchainVerification.owner || null,
      token_uri: onchainVerification.tokenUri || null,
      dns_verified: dnsMatches,
      onchain_owner_verified: onchainVerification.verified,

      // Additional debug info
      dns_details: {
        verified: dnsVerification.verified,
        found_contract: dnsVerification.contract || null,
        found_token_id: dnsVerification.tokenId || null,
        matches_db: dnsMatches,
        error: dnsVerification.error || null,
      },
      onchain_details: {
        verified: onchainVerification.verified,
        error: onchainVerification.error || null,
      },
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
