/**
 * IPFS Upload Service
 *
 * Uploads domain metadata to IPFS
 */

export interface DomainMetadata {
  domain: string;
  type: 'personal' | 'numeric';
  created: string;
  price_pix: number;
  price_usd: number;
  owner: string;
  orderId: string;
  attributes?: Record<string, any>;
}

export interface IPFSUploadResult {
  ipfsHash: string;
  ipfsUrl: string;
  gatewayUrl: string;
}

/**
 * Upload metadata to IPFS via Pinata
 */
export async function uploadToIPFS(
  metadata: DomainMetadata,
  apiKey: string,
  apiSecret: string
): Promise<IPFSUploadResult> {
  const pinataEndpoint = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

  const body = {
    pinataContent: metadata,
    pinataMetadata: {
      name: `${metadata.domain}-metadata.json`,
    },
    pinataOptions: {
      cidVersion: 1,
    },
  };

  const response = await fetch(pinataEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      pinata_api_key: apiKey,
      pinata_secret_api_key: apiSecret,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Pinata upload error:', error);
    throw new Error(`Failed to upload to IPFS: ${response.status}`);
  }

  const result = await response.json();

  return {
    ipfsHash: result.IpfsHash,
    ipfsUrl: `ipfs://${result.IpfsHash}`,
    gatewayUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
  };
}

/**
 * Alternative: Upload via Infura IPFS
 */
export async function uploadToIPFSInfura(
  metadata: DomainMetadata,
  projectId: string,
  projectSecret: string
): Promise<IPFSUploadResult> {
  const auth = btoa(`${projectId}:${projectSecret}`);

  const formData = new FormData();
  const blob = new Blob([JSON.stringify(metadata, null, 2)], {
    type: 'application/json',
  });
  formData.append('file', blob, `${metadata.domain}-metadata.json`);

  const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Infura IPFS upload error:', error);
    throw new Error(`Failed to upload to Infura IPFS: ${response.status}`);
  }

  const result = await response.json();

  return {
    ipfsHash: result.Hash,
    ipfsUrl: `ipfs://${result.Hash}`,
    gatewayUrl: `https://ipfs.io/ipfs/${result.Hash}`,
  };
}

/**
 * Get upload function based on provider
 */
export function getIPFSUploader(provider: 'pinata' | 'infura' = 'pinata') {
  return provider === 'pinata' ? uploadToIPFS : uploadToIPFSInfura;
}
