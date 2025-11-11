/**
 * Domain Provisioning Service
 *
 * Idempotent provisioning flow:
 * 1. Generate metadata JSON
 * 2. Upload to IPFS
 * 3. Mint NFT
 * 4. Configure Cloudflare DNS (CNAME + TXT)
 * 5. Update domains table
 * 6. Audit all steps
 */

import type { DomainMetadata, IPFSUploadResult } from './ipfs';
import type { MintNFTResult } from './nft';
import type { DNSRecordResult } from './cloudflare';
import { uploadToIPFS } from './ipfs';
import { mintNFT } from './nft';
import { upsertDNSRecords } from './cloudflare';

export interface ProvisioningConfig {
  // IPFS
  ipfsProvider: 'pinata' | 'infura';
  ipfsApiKey: string;
  ipfsApiSecret: string;

  // NFT
  nftContractAddress: string;
  nftPrivateKey: string;
  rpcUrl: string;
  chain: string;

  // Cloudflare
  cloudflareZoneId: string;
  cloudflareApiToken: string;
  publicAppHost: string;

  // Supabase
  supabaseUrl: string;
  supabaseServiceKey: string;
}

export interface ProvisioningResult {
  success: boolean;
  domain: string;
  steps: {
    metadata?: { completed: boolean; data?: DomainMetadata };
    ipfs?: { completed: boolean; data?: IPFSUploadResult };
    nft?: { completed: boolean; data?: MintNFTResult };
    dns?: { completed: boolean; data?: { cname: DNSRecordResult; txt: DNSRecordResult } };
    database?: { completed: boolean };
  };
  errors: string[];
}

/**
 * Main provisioning function (idempotent)
 */
export async function provisionDomain(
  orderId: string,
  config: ProvisioningConfig
): Promise<ProvisioningResult> {
  const { createClient } = await import('npm:@supabase/supabase-js@2');

  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

  const result: ProvisioningResult = {
    success: false,
    domain: '',
    steps: {},
    errors: [],
  };

  try {
    console.log('=== Starting provisioning for order:', orderId);

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    if (order.status !== 'paid') {
      throw new Error(`Order not paid: ${order.status}`);
    }

    result.domain = order.fqdn;
    const label = order.fqdn.replace('.pix.global', '');

    // Check if already provisioned
    const { data: existingDomain } = await supabase
      .from('domains')
      .select('*')
      .eq('fqdn', order.fqdn)
      .maybeSingle();

    if (existingDomain && existingDomain.status === 'active') {
      console.log('Domain already provisioned, verifying...');

      // Domain exists, verify it's complete
      if (
        existingDomain.nft_token_id &&
        existingDomain.nft_contract &&
        existingDomain.ipfs_hash
      ) {
        console.log('Domain fully provisioned, skipping');
        result.success = true;
        result.steps.metadata = { completed: true };
        result.steps.ipfs = { completed: true };
        result.steps.nft = { completed: true };
        result.steps.dns = { completed: true };
        result.steps.database = { completed: true };
        return result;
      }

      console.log('Domain incomplete, continuing provisioning...');
    }

    // STEP 1: Generate metadata
    console.log('Step 1: Generating metadata...');

    const metadata: DomainMetadata = {
      domain: order.fqdn,
      type: order.metadata?.type || 'personal',
      created: new Date().toISOString(),
      price_pix: order.price_brl || 0,
      price_usd: order.metadata?.amountUsd || order.price_brl || 0,
      owner: order.user_id,
      orderId: order.id,
      attributes: {
        label,
        registrar: 'pix.global',
        blockchain: config.chain,
      },
    };

    result.steps.metadata = { completed: true, data: metadata };

    await supabase.from('audits').insert({
      table_name: 'domains',
      record_id: order.fqdn,
      action: 'PROVISION_START',
      user_id: order.user_id,
      metadata: { orderId, step: 'metadata' },
    });

    // STEP 2: Upload to IPFS
    console.log('Step 2: Uploading to IPFS...');

    let ipfsResult: IPFSUploadResult;

    if (existingDomain?.ipfs_hash) {
      console.log('IPFS already uploaded:', existingDomain.ipfs_hash);
      ipfsResult = {
        ipfsHash: existingDomain.ipfs_hash,
        ipfsUrl: `ipfs://${existingDomain.ipfs_hash}`,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${existingDomain.ipfs_hash}`,
      };
    } else {
      ipfsResult = await uploadToIPFS(
        metadata,
        config.ipfsApiKey,
        config.ipfsApiSecret
      );
      console.log('IPFS uploaded:', ipfsResult.ipfsHash);
    }

    result.steps.ipfs = { completed: true, data: ipfsResult };

    await supabase.from('audits').insert({
      table_name: 'domains',
      record_id: order.fqdn,
      action: 'IPFS_UPLOAD',
      user_id: order.user_id,
      metadata: { orderId, ipfsHash: ipfsResult.ipfsHash },
    });

    // STEP 3: Mint NFT
    console.log('Step 3: Minting NFT...');

    let nftResult: MintNFTResult;

    if (existingDomain?.nft_token_id) {
      console.log('NFT already minted, token ID:', existingDomain.nft_token_id);
      nftResult = {
        tokenId: existingDomain.nft_token_id,
        transactionHash: existingDomain.metadata?.transactionHash || '',
        blockNumber: existingDomain.metadata?.blockNumber || 0,
        contractAddress: existingDomain.nft_contract || config.nftContractAddress,
        chain: config.chain,
      };
    } else {
      // Get user's wallet address (or use admin wallet)
      const { data: customer } = await supabase
        .from('customers')
        .select('wallet_address')
        .eq('user_id', order.user_id)
        .maybeSingle();

      const ownerAddress =
        customer?.wallet_address || '0x0000000000000000000000000000000000000000';

      nftResult = await mintNFT(
        config.nftContractAddress,
        ownerAddress,
        ipfsResult.gatewayUrl,
        config.nftPrivateKey,
        config.rpcUrl,
        config.chain
      );

      console.log('NFT minted, token ID:', nftResult.tokenId);
    }

    result.steps.nft = { completed: true, data: nftResult };

    await supabase.from('audits').insert({
      table_name: 'domains',
      record_id: order.fqdn,
      action: 'NFT_MINT',
      user_id: order.user_id,
      metadata: {
        orderId,
        tokenId: nftResult.tokenId,
        transactionHash: nftResult.transactionHash,
        contractAddress: nftResult.contractAddress,
      },
    });

    // STEP 4: Configure DNS
    console.log('Step 4: Configuring Cloudflare DNS...');

    const dnsResult = await upsertDNSRecords(
      config.cloudflareZoneId,
      config.cloudflareApiToken,
      label,
      config.publicAppHost,
      nftResult.contractAddress,
      nftResult.tokenId,
      nftResult.chain
    );

    console.log('DNS configured:', dnsResult);

    result.steps.dns = { completed: true, data: dnsResult };

    await supabase.from('audits').insert({
      table_name: 'domains',
      record_id: order.fqdn,
      action: 'DNS_CONFIGURE',
      user_id: order.user_id,
      metadata: {
        orderId,
        cnameId: dnsResult.cname.recordId,
        txtId: dnsResult.txt.recordId,
      },
    });

    // STEP 5: Update database
    console.log('Step 5: Updating domains table...');

    const domainData = {
      fqdn: order.fqdn,
      type: metadata.type,
      owner_id: order.user_id,
      status: 'active',
      nft_token_id: nftResult.tokenId,
      nft_contract: nftResult.contractAddress,
      ipfs_hash: ipfsResult.ipfsHash,
      metadata: {
        orderId: order.id,
        purchasedAt: order.paid_at,
        pricePaid: order.price_brl,
        currency: 'USD',
        transactionHash: nftResult.transactionHash,
        blockNumber: nftResult.blockNumber,
        chain: nftResult.chain,
        ipfsUrl: ipfsResult.ipfsUrl,
        gatewayUrl: ipfsResult.gatewayUrl,
        cnameId: dnsResult.cname.recordId,
        txtId: dnsResult.txt.recordId,
      },
    };

    if (existingDomain) {
      // Update existing
      await supabase
        .from('domains')
        .update(domainData)
        .eq('fqdn', order.fqdn);
    } else {
      // Insert new
      await supabase.from('domains').insert(domainData);
    }

    result.steps.database = { completed: true };

    await supabase.from('audits').insert({
      table_name: 'domains',
      record_id: order.fqdn,
      action: 'PROVISION_COMPLETE',
      user_id: order.user_id,
      metadata: {
        orderId,
        tokenId: nftResult.tokenId,
        ipfsHash: ipfsResult.ipfsHash,
      },
    });

    console.log('=== Provisioning complete for:', order.fqdn);

    result.success = true;
    return result;
  } catch (error) {
    console.error('Provisioning error:', error);
    result.errors.push(error.message);

    // Log error
    if (result.domain) {
      try {
        await supabase.from('audits').insert({
          table_name: 'domains',
          record_id: result.domain,
          action: 'PROVISION_FAILED',
          metadata: {
            orderId,
            error: error.message,
            steps: result.steps,
          },
        });
      } catch (auditError) {
        console.error('Failed to log error audit:', auditError);
      }
    }

    return result;
  }
}
