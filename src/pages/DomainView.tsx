import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, ExternalLink, Copy, CheckCircle2, Loader2 } from 'lucide-react';

interface DomainInfo {
  fqdn: string;
  label: string;
  type: 'personal' | 'numeric';
  status: string;
  nft: {
    tokenId?: string;
    contract?: string;
    chain?: string;
    ipfsHash?: string;
    gatewayUrl?: string;
    transactionHash?: string;
  };
  profile?: {
    displayName?: string;
    bio?: string;
    avatar?: string;
    location?: string;
    website?: string;
  };
  paymentRoutes?: {
    pix?: {
      enabled: boolean;
      chave?: string;
      qrcode?: string;
      beneficiario?: string;
    };
    crypto?: {
      enabled: boolean;
      wallet?: string;
      usdcAddress?: string;
      chain?: string;
    };
    paypal?: {
      enabled: boolean;
      link?: string;
    };
  };
}

interface NFTVerification {
  verified: boolean;
  owner?: string;
  tokenId?: string;
  contract?: string;
  chain?: string;
}

export default function DomainView() {
  const { fqdn } = useParams<{ fqdn: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState<DomainInfo | null>(null);
  const [verification, setVerification] = useState<NFTVerification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    loadDomain();
  }, [fqdn]);

  async function loadDomain() {
    if (!fqdn) {
      setError('Domain not specified');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const apiUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${apiUrl}/functions/v1/get-domain-info?fqdn=${fqdn}`
      );

      if (!response.ok) {
        throw new Error('Domain not found');
      }

      const data = await response.json();
      setDomain(data);

      // Verify NFT if available
      if (data.nft?.tokenId && data.nft?.contract) {
        verifyNFT(fqdn);
      }
    } catch (err) {
      console.error('Error loading domain:', err);
      setError(err instanceof Error ? err.message : 'Failed to load domain');
    } finally {
      setLoading(false);
    }
  }

  async function verifyNFT(domainFqdn: string) {
    try {
      const apiUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${apiUrl}/functions/v1/verify-nft?fqdn=${domainFqdn}`
      );

      if (response.ok) {
        const data = await response.json();
        setVerification(data);
      }
    } catch (err) {
      console.error('Error verifying NFT:', err);
    }
  }

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  function getBlockExplorerUrl(chain: string, hash: string) {
    if (chain === 'polygon' || chain === 'polygon-mumbai') {
      const network = chain === 'polygon-mumbai' ? 'mumbai.' : '';
      return `https://${network}polygonscan.com/tx/${hash}`;
    }
    return `#`;
  }

  function getIPFSUrl(hash: string) {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading domain...</p>
        </div>
      </div>
    );
  }

  if (error || !domain) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Domain Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'This domain does not exist or is not active.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const isPersonal = domain.type === 'personal';
  const isNumeric = domain.type === 'numeric';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">{domain.label}</h1>
            <p className="text-purple-100 text-lg">{domain.fqdn}</p>

            {/* Verification Badge */}
            {verification?.verified && (
              <div className="mt-4 inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Verified On-Chain</span>
              </div>
            )}
          </div>

          <div className="p-8">
            {/* Personal Domain Profile */}
            {isPersonal && domain.profile && (
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                  {domain.profile.avatar && (
                    <img
                      src={domain.profile.avatar}
                      alt={domain.profile.displayName}
                      className="w-20 h-20 rounded-full border-4 border-purple-500"
                    />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {domain.profile.displayName || domain.label}
                    </h2>
                    {domain.profile.location && (
                      <p className="text-gray-400">{domain.profile.location}</p>
                    )}
                  </div>
                </div>

                {domain.profile.bio && (
                  <p className="text-gray-300 mb-6">{domain.profile.bio}</p>
                )}

                {domain.profile.website && (
                  <a
                    href={domain.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {domain.profile.website}
                  </a>
                )}
              </div>
            )}

            {/* Payment Buttons (Personal only) */}
            {isPersonal && domain.paymentRoutes && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Payment Options</h3>
                <div className="space-y-3">
                  {/* Pix */}
                  {domain.paymentRoutes.pix?.enabled && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white">Pix (Brazil)</span>
                        <button
                          onClick={() => copyToClipboard(domain.paymentRoutes!.pix!.chave!, 'pix')}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          {copiedField === 'pix' ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-gray-400 text-sm break-all">{domain.paymentRoutes.pix.chave}</p>
                      {domain.paymentRoutes.pix.beneficiario && (
                        <p className="text-gray-500 text-xs mt-1">{domain.paymentRoutes.pix.beneficiario}</p>
                      )}
                    </div>
                  )}

                  {/* USDC Crypto */}
                  {domain.paymentRoutes.crypto?.enabled && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white">
                          USDC ({domain.paymentRoutes.crypto.chain || 'Polygon'})
                        </span>
                        <button
                          onClick={() => copyToClipboard(domain.paymentRoutes!.crypto!.usdcAddress!, 'crypto')}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          {copiedField === 'crypto' ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-gray-400 text-sm break-all font-mono">
                        {domain.paymentRoutes.crypto.usdcAddress || domain.paymentRoutes.crypto.wallet}
                      </p>
                    </div>
                  )}

                  {/* PayPal */}
                  {domain.paymentRoutes.paypal?.enabled && domain.paymentRoutes.paypal.link && (
                    <a
                      href={domain.paymentRoutes.paypal.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-blue-600 hover:bg-blue-700 rounded-lg p-4 text-white font-semibold text-center transition-colors"
                    >
                      Pay with PayPal
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* NFT Asset Info (Numeric domains) */}
            {isNumeric && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Digital Asset</h3>
                <p className="text-gray-300 mb-4">
                  This is a numeric domain registered as an NFT on the {domain.nft.chain} blockchain.
                </p>
              </div>
            )}

            {/* NFT Details */}
            {domain.nft && (domain.nft.tokenId || domain.nft.contract) && (
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  NFT Details
                </h3>

                <div className="space-y-3 text-sm">
                  {domain.nft.tokenId && (
                    <div>
                      <span className="text-gray-400">Token ID:</span>
                      <span className="text-white ml-2 font-mono">{domain.nft.tokenId}</span>
                    </div>
                  )}

                  {domain.nft.contract && (
                    <div>
                      <span className="text-gray-400">Contract:</span>
                      <span className="text-white ml-2 font-mono text-xs break-all">
                        {domain.nft.contract}
                      </span>
                    </div>
                  )}

                  {domain.nft.chain && (
                    <div>
                      <span className="text-gray-400">Chain:</span>
                      <span className="text-white ml-2 capitalize">{domain.nft.chain}</span>
                    </div>
                  )}

                  {domain.nft.transactionHash && (
                    <div>
                      <a
                        href={getBlockExplorerUrl(domain.nft.chain || 'polygon', domain.nft.transactionHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
                      >
                        View on Polygonscan
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {domain.nft.ipfsHash && (
                    <div>
                      <a
                        href={getIPFSUrl(domain.nft.ipfsHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
                      >
                        View Metadata on IPFS
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400">
          <p>Powered by Pix.Global</p>
        </div>
      </div>
    </div>
  );
}
