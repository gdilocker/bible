/**
 * Edge Function: Verify NFT On-Chain
 *
 * GET /verify-nft?fqdn=maria.pix.global
 * Verifies NFT ownership on blockchain
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

// Minimal ABI for ownerOf function
const OWNER_OF_ABI = [
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
];

async function verifyNFTOnChain(
  contractAddress: string,
  tokenId: string,
  rpcUrl: string
): Promise<{
  verified: boolean;
  owner?: string;
  error?: string;
}> {
  try {
    const { ethers } = await import('npm:ethers@6');

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, OWNER_OF_ABI, provider);

    const owner = await contract.ownerOf(tokenId);

    return {
      verified: true,
      owner: owner.toLowerCase(),
    };
  } catch (error) {
    console.error('NFT verification error:', error);
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

    // Fetch domain
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

    // Check if NFT info exists
    if (!domain.nft_contract || !domain.nft_token_id) {
      return new Response(
        JSON.stringify({
          verified: false,
          message: 'NFT not minted yet',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get RPC URL from env
    const rpcUrl = Deno.env.get('BLOCKCHAIN_RPC_URL') || 'https://polygon-rpc.com';

    // Verify on-chain
    const verification = await verifyNFTOnChain(
      domain.nft_contract,
      domain.nft_token_id,
      rpcUrl
    );

    if (verification.verified) {
      return new Response(
        JSON.stringify({
          verified: true,
          contract: domain.nft_contract,
          tokenId: domain.nft_token_id,
          owner: verification.owner,
          chain: domain.metadata?.chain || 'polygon',
          transactionHash: domain.metadata?.transactionHash,
          blockNumber: domain.metadata?.blockNumber,
          ipfsHash: domain.ipfs_hash,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          verified: false,
          message: 'Could not verify NFT on-chain',
          error: verification.error,
        }),
        {
          status: 200,
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
