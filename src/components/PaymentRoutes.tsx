import { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PaymentRoutesData {
  pix_provider?: string;
  pix_key?: string;
  pix_beneficiary?: string;
  crypto_type?: string;
  crypto_address?: string;
  crypto_chain?: string;
  paypal_link?: string;
}

export default function PaymentRoutes() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<PaymentRoutesData>({
    pix_provider: 'email',
    pix_key: '',
    pix_beneficiary: '',
    crypto_type: 'USDC',
    crypto_address: '',
    crypto_chain: 'polygon',
    paypal_link: '',
  });

  useEffect(() => {
    if (user) {
      loadRoutes();
    }
  }, [user]);

  async function loadRoutes() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: routesError } = await supabase
        .from('payment_routes')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (routesError && routesError.code !== 'PGRST116') {
        throw routesError;
      }

      if (data) {
        setFormData({
          pix_provider: data.pix_provider || 'email',
          pix_key: data.pix_key || '',
          pix_beneficiary: data.pix_beneficiary || '',
          crypto_type: data.crypto_type || 'USDC',
          crypto_address: data.crypto_address || '',
          crypto_chain: data.crypto_chain || 'polygon',
          paypal_link: data.paypal_link || '',
        });
      }
    } catch (err) {
      console.error('Error loading routes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load payment routes');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSaved(false);

      // Check if routes exist
      const { data: existing } = await supabase
        .from('payment_routes')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (existing) {
        // Update
        const { error: updateError } = await supabase
          .from('payment_routes')
          .update({
            pix_provider: formData.pix_provider || null,
            pix_key: formData.pix_key || null,
            pix_beneficiary: formData.pix_beneficiary || null,
            crypto_type: formData.crypto_type || null,
            crypto_address: formData.crypto_address || null,
            crypto_chain: formData.crypto_chain || 'polygon',
            paypal_link: formData.paypal_link || null,
          })
          .eq('user_id', user?.id);

        if (updateError) throw updateError;
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('payment_routes')
          .insert({
            user_id: user?.id,
            pix_provider: formData.pix_provider || null,
            pix_key: formData.pix_key || null,
            pix_beneficiary: formData.pix_beneficiary || null,
            crypto_type: formData.crypto_type || null,
            crypto_address: formData.crypto_address || null,
            crypto_chain: formData.crypto_chain || 'polygon',
            paypal_link: formData.paypal_link || null,
          });

        if (insertError) throw insertError;
      }

      // Also update user_profiles.metadata for backward compatibility
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          metadata: {
            rotas: {
              pix_chave: formData.pix_key,
              pix_beneficiario: formData.pix_beneficiary,
              crypto_usdc_address: formData.crypto_address,
              crypto_chain: formData.crypto_chain,
              paypal_link: formData.paypal_link,
            },
          },
        })
        .eq('user_id', user?.id);

      if (profileError) {
        console.warn('Could not update profile metadata:', profileError);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving routes:', err);
      setError(err instanceof Error ? err.message : 'Failed to save payment routes');
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field: keyof PaymentRoutesData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <p className="text-green-800">Payment routes saved successfully!</p>
        </div>
      )}

      {/* Pix Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Pix (Brazil)
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pix Key Type
            </label>
            <select
              value={formData.pix_provider}
              onChange={(e) => handleChange('pix_provider', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="email">Email</option>
              <option value="cpf">CPF</option>
              <option value="phone">Phone</option>
              <option value="random">Random Key</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pix Key
            </label>
            <input
              type="text"
              value={formData.pix_key}
              onChange={(e) => handleChange('pix_key', e.target.value)}
              placeholder="your@email.com or CPF or phone"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beneficiary Name
            </label>
            <input
              type="text"
              value={formData.pix_beneficiary}
              onChange={(e) => handleChange('pix_beneficiary', e.target.value)}
              placeholder="Your Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Name displayed to payers
            </p>
          </div>
        </div>
      </div>

      {/* Crypto Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Crypto Payments
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crypto Type
            </label>
            <select
              value={formData.crypto_type}
              onChange={(e) => handleChange('crypto_type', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
              <option value="ETH">ETH</option>
              <option value="BTC">BTC</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wallet Address
            </label>
            <input
              type="text"
              value={formData.crypto_address}
              onChange={(e) => handleChange('crypto_address', e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blockchain
            </label>
            <select
              value={formData.crypto_chain}
              onChange={(e) => handleChange('crypto_chain', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="polygon">Polygon</option>
              <option value="ethereum">Ethereum</option>
              <option value="bsc">Binance Smart Chain</option>
              <option value="arbitrum">Arbitrum</option>
            </select>
          </div>
        </div>
      </div>

      {/* PayPal Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          PayPal
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PayPal.me Link
          </label>
          <input
            type="url"
            value={formData.paypal_link}
            onChange={(e) => handleChange('paypal_link', e.target.value)}
            placeholder="https://paypal.me/yourname"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Your PayPal.me link for easy payments
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Payment Routes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
