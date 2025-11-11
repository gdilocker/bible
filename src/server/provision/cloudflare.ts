/**
 * Cloudflare DNS Service
 *
 * Manages DNS records for provisioned domains
 */

export interface DNSRecordResult {
  recordId: string;
  type: string;
  name: string;
  content: string;
}

/**
 * Create CNAME record
 */
export async function createCNAMERecord(
  zoneId: string,
  apiToken: string,
  label: string,
  target: string
): Promise<DNSRecordResult> {
  const fqdn = `${label}.pix.global`;

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        type: 'CNAME',
        name: label,
        content: target,
        ttl: 1, // Auto
        proxied: false,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Cloudflare CNAME error:', error);
    throw new Error(`Failed to create CNAME: ${response.status}`);
  }

  const result = await response.json();

  return {
    recordId: result.result.id,
    type: 'CNAME',
    name: fqdn,
    content: target,
  };
}

/**
 * Create TXT record
 */
export async function createTXTRecord(
  zoneId: string,
  apiToken: string,
  label: string,
  content: string
): Promise<DNSRecordResult> {
  const fqdn = `${label}.pix.global`;

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        type: 'TXT',
        name: label,
        content,
        ttl: 1,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Cloudflare TXT error:', error);
    throw new Error(`Failed to create TXT: ${response.status}`);
  }

  const result = await response.json();

  return {
    recordId: result.result.id,
    type: 'TXT',
    name: fqdn,
    content,
  };
}

/**
 * Check if DNS record already exists
 */
export async function getDNSRecord(
  zoneId: string,
  apiToken: string,
  name: string,
  type: string
): Promise<DNSRecordResult | null> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=${type}&name=${name}`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const result = await response.json();

  if (result.result && result.result.length > 0) {
    const record = result.result[0];
    return {
      recordId: record.id,
      type: record.type,
      name: record.name,
      content: record.content,
    };
  }

  return null;
}

/**
 * Update existing DNS record
 */
export async function updateDNSRecord(
  zoneId: string,
  apiToken: string,
  recordId: string,
  type: string,
  name: string,
  content: string
): Promise<void> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        type,
        name,
        content,
        ttl: 1,
        proxied: type === 'CNAME' ? false : undefined,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Cloudflare update error:', error);
    throw new Error(`Failed to update DNS record: ${response.status}`);
  }
}

/**
 * Create or update DNS records (idempotent)
 */
export async function upsertDNSRecords(
  zoneId: string,
  apiToken: string,
  label: string,
  cnameTarget: string,
  nftContract: string,
  tokenId: string,
  chain: string
): Promise<{
  cname: DNSRecordResult;
  txt: DNSRecordResult;
}> {
  const fqdn = `${label}.pix.global`;
  const txtContent = `nft_contract=${nftContract}; token_id=${tokenId}; chain=${chain}`;

  // Check and create/update CNAME
  const existingCname = await getDNSRecord(zoneId, apiToken, fqdn, 'CNAME');

  let cnameResult: DNSRecordResult;

  if (existingCname) {
    console.log('CNAME exists, updating...');
    await updateDNSRecord(
      zoneId,
      apiToken,
      existingCname.recordId,
      'CNAME',
      label,
      cnameTarget
    );
    cnameResult = {
      ...existingCname,
      content: cnameTarget,
    };
  } else {
    console.log('Creating CNAME...');
    cnameResult = await createCNAMERecord(zoneId, apiToken, label, cnameTarget);
  }

  // Check and create/update TXT
  const existingTxt = await getDNSRecord(zoneId, apiToken, fqdn, 'TXT');

  let txtResult: DNSRecordResult;

  if (existingTxt) {
    console.log('TXT exists, updating...');
    await updateDNSRecord(
      zoneId,
      apiToken,
      existingTxt.recordId,
      'TXT',
      label,
      txtContent
    );
    txtResult = {
      ...existingTxt,
      content: txtContent,
    };
  } else {
    console.log('Creating TXT...');
    txtResult = await createTXTRecord(zoneId, apiToken, label, txtContent);
  }

  return {
    cname: cnameResult,
    txt: txtResult,
  };
}
