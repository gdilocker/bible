import React, { useState } from 'react';
import { ShoppingCart as CartIcon, X, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../lib/domainValidation';
import { useAuth } from '../contexts/AuthContext';

const ShoppingCart: React.FC = () => {
  const { items, removeItem, clearCart, total, count } = useCart();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      setError('Você precisa estar logado para finalizar a compra');
      return;
    }

    if (items.length === 0) {
      setError('Carrinho vazio');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create PayPal order
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-cart-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ items })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar pedido');
      }

      // Redirect to PayPal
      window.location.href = data.approval_url;

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
    } finally {
      setProcessing(false);
    }
  };

  if (count === 0 && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-2xl transition-all z-50"
      >
        <CartIcon className="w-6 h-6" />
      </button>
    );
  }

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-2xl transition-all z-50 group"
      >
        <CartIcon className="w-6 h-6" />
        {count > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {/* Cart Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-end">
          <div
            className="bg-zinc-900 w-full sm:w-96 sm:mr-6 sm:mb-6 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <CartIcon className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">
                  Carrinho ({count})
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <CartIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Seu carrinho está vazio</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.name}
                    className="bg-zinc-800 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="text-white font-mono font-semibold">
                        {item.name}.pix.global
                      </div>
                      <div className="text-sm text-gray-400 capitalize">
                        {item.type === 'credit' ? 'Crédito Digital' : 'Acesso Rápido'}
                        {item.pattern && ` (${item.pattern})`}
                      </div>
                      <div className="text-blue-400 font-semibold mt-1">
                        {formatPrice(item.price)}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.name)}
                      className="text-red-400 hover:text-red-300 transition-colors ml-4"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-zinc-800 p-6 space-y-4">
                {/* Total */}
                <div className="flex items-center justify-between text-lg">
                  <span className="text-gray-400">Total:</span>
                  <span className="text-2xl font-bold text-white">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-400">Pedido criado com sucesso!</p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={handleCheckout}
                    disabled={processing}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    {processing ? 'Processando...' : 'Finalizar Compra'}
                  </button>

                  <button
                    onClick={clearCart}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-gray-300 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Limpar Carrinho
                  </button>
                </div>

                {/* Info */}
                <p className="text-xs text-gray-500 text-center">
                  Pagamento único via PayPal. Todos os domínios serão registrados simultaneamente.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ShoppingCart;
