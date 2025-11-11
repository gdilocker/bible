/**
 * EXEMPLO: Edge Function com Blockchain/NFT
 *
 * Demonstra como interagir com contratos NFT usando ethers.js
 *
 * NOTA: Para usar ethers.js em Deno, use: npm:ethers@6
 */

import { ethers } from 'npm:ethers@6';
import { serverEnv } from '../../../src/lib/env.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Acessar configurações blockchain
    const rpcUrl = serverEnv.blockchain.rpcUrl();
    const contractAddress = serverEnv.blockchain.contractAddress();
    const contractAbi = serverEnv.blockchain.contractAbi();
    const ownerWallet = serverEnv.blockchain.ownerWallet();

    // Validar configuração
    if (!rpcUrl || !contractAddress) {
      return new Response(
        JSON.stringify({ error: 'Blockchain not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Conectar ao provider
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Criar instância do contrato
    const contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      provider
    );

    // Exemplo: Ler dados do contrato (método de leitura, sem gas)
    const totalSupply = await contract.totalSupply();
    const name = await contract.name();
    const symbol = await contract.symbol();

    return new Response(
      JSON.stringify({
        success: true,
        contract: {
          address: contractAddress,
          name,
          symbol,
          totalSupply: totalSupply.toString(),
        },
        owner: ownerWallet,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Blockchain error:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * EXEMPLO: Mintar NFT (requer wallet com fundos)
 *
 * IMPORTANTE: Esta é apenas uma demonstração.
 * Em produção, use uma wallet segura e gerencie chaves privadas apropriadamente.
 */
async function mintNFTExample(to: string, tokenId: number) {
  const rpcUrl = serverEnv.blockchain.rpcUrl();
  const contractAddress = serverEnv.blockchain.contractAddress();
  const contractAbi = serverEnv.blockchain.contractAbi();

  // NUNCA commite private keys no código!
  // Use Supabase Vault ou outro serviço de secrets management
  const privateKey = Deno.env.get('PRIVATE_KEY') || '';

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

  // Executar transação (requer gas)
  const tx = await contract.mint(to, tokenId);
  await tx.wait(); // Aguardar confirmação

  return tx.hash;
}
