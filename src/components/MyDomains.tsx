import { useState, useEffect } from 'react';
import { ExternalLink, Eye, Shield, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Domain {
  id: string;
  fqdn: string;
  type: 'personal' | 'numeric';
  status: string;
  nft_token_id?: string;
  nft_contract?: string;
  ipfs_hash?: string;
  created_at: string;
  metadata?: {
    chain?: string;
    transactionHash?: string;
    gatewayUrl?: string;
  };
}

export default function MyDomains() {
  const { user } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDomains();
    }
  }, [user]);

  async function loadDomains() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: domainsError } = await supabase
        .from('domains')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (domainsError) throw domainsError;

      setDomains(data || []);
    } catch (err) {
      console.error('Error loading domains:', err);
      setError(err instanceof Error ? err.message : 'Failed to load domains');
    } finally {
      setLoading(false);
    }
  }

  function getBlockExplorerUrl(chain: string, hash: string) {
    if (chain === 'polygon' || chain === 'polygon-mumbai') {
      const network = chain === 'polygon-mumbai' ? 'mumbai.' : '';
      return `https://${network}polygonscan.com/tx/${hash}`;
    }
    return '#';
  }

  function getIPFSUrl(hash: string) {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }

  function getPublicUrl(fqdn: string) {
    return `/d/${fqdn}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No domains yet
        </h3>
        <p className="text-gray-600">
          Your registered domains will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {domains.map((domain) => (
        <div
          key={domain.id}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {domain.fqdn}
              </h3>
              <div className="flex items-center gap-3 text-sm">
                <span
                  className={`px-2 py-1 rounded-full ${
                    domain.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {domain.status}
                </span>
                <span
                  className={`px-2 py-1 rounded-full ${
                    domain.type === 'personal'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {domain.type}
                </span>
              </div>
            </div>

            <a
              href={getPublicUrl(domain.fqdn)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Page
            </a>
          </div>

          {/* NFT Info */}
          {domain.nft_token_id && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                NFT Details
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Token ID:</span>
                  <span className="ml-2 font-mono text-gray-900">
                    {domain.nft_token_id}
                  </span>
                </div>

                {domain.nft_contract && (
                  <div>
                    <span className="text-gray-600">Contract:</span>
                    <span className="ml-2 font-mono text-gray-900 text-xs break-all">
                      {domain.nft_contract.slice(0, 10)}...
                      {domain.nft_contract.slice(-8)}
                    </span>
                  </div>
                )}

                {domain.metadata?.chain && (
                  <div>
                    <span className="text-gray-600">Chain:</span>
                    <span className="ml-2 text-gray-900 capitalize">
                      {domain.metadata.chain}
                    </span>
                  </div>
                )}

                {domain.metadata?.transactionHash && (
                  <div>
                    <a
                      href={getBlockExplorerUrl(
                        domain.metadata.chain || 'polygon',
                        domain.metadata.transactionHash
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
                    >
                      View on Explorer
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {domain.ipfs_hash && (
                  <div className="md:col-span-2">
                    <a
                      href={getIPFSUrl(domain.ipfs_hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
                    >
                      View Metadata on IPFS
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500">
            Registered: {new Date(domain.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}
