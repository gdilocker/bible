/**
 * NFT Minting Service
 *
 * Mints NFT on Polygon blockchain
 */

// Minimal ERC721 ABI for minting
export const NFT_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenURI', type: 'string' },
    ],
    name: 'mint',
    outputs: [{ name: 'tokenId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: true, name: 'tokenId', type: 'uint256' },
    ],
    name: 'Transfer',
    type: 'event',
  },
];

export interface MintNFTResult {
  tokenId: string;
  transactionHash: string;
  blockNumber: number;
  contractAddress: string;
  chain: string;
}

/**
 * Mint NFT using ethers.js
 * Note: This is a simplified implementation for Deno environment
 */
export async function mintNFT(
  contractAddress: string,
  ownerAddress: string,
  tokenURI: string,
  privateKey: string,
  rpcUrl: string,
  chain: string = 'polygon'
): Promise<MintNFTResult> {
  // Import ethers dynamically for Deno
  const { ethers } = await import('npm:ethers@6');

  // Connect to provider
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // Create wallet
  const wallet = new ethers.Wallet(privateKey, provider);

  // Create contract instance
  const contract = new ethers.Contract(contractAddress, NFT_ABI, wallet);

  console.log('Minting NFT...');
  console.log('Contract:', contractAddress);
  console.log('Owner:', ownerAddress);
  console.log('TokenURI:', tokenURI);

  // Call mint function
  const tx = await contract.mint(ownerAddress, tokenURI);

  console.log('Transaction sent:', tx.hash);

  // Wait for confirmation
  const receipt = await tx.wait();

  console.log('Transaction confirmed in block:', receipt.blockNumber);

  // Extract tokenId from Transfer event
  let tokenId = '0';

  for (const log of receipt.logs) {
    try {
      const parsedLog = contract.interface.parseLog(log);
      if (parsedLog && parsedLog.name === 'Transfer') {
        tokenId = parsedLog.args.tokenId.toString();
        console.log('Token ID:', tokenId);
        break;
      }
    } catch (e) {
      // Skip logs that don't match our ABI
      continue;
    }
  }

  return {
    tokenId,
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    contractAddress,
    chain,
  };
}

/**
 * Verify NFT ownership
 */
export async function verifyNFTOwnership(
  contractAddress: string,
  tokenId: string,
  expectedOwner: string,
  rpcUrl: string
): Promise<boolean> {
  const { ethers } = await import('npm:ethers@6');

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const ownerOfAbi = [
    {
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      name: 'ownerOf',
      outputs: [{ name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const contract = new ethers.Contract(contractAddress, ownerOfAbi, provider);

  try {
    const owner = await contract.ownerOf(tokenId);
    return owner.toLowerCase() === expectedOwner.toLowerCase();
  } catch (e) {
    console.error('Error verifying NFT ownership:', e);
    return false;
  }
}
