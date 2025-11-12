import React, { useState } from 'react';
import { Search, CreditCard, Zap, User, AlertCircle, CheckCircle, ShoppingCart } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { validateDomain, generateSuggestions, calculateCreditPrice, calculateQuickAccessPrice, formatPrice, type DomainType, type QuickAccessPattern } from '../lib/domainValidation';
import { useCart } from '../contexts/CartContext';

type Tab = 'identity' | 'credit' | 'quick_access';

interface Suggestion {
  name: string;
  type: string;
  price: number;
  available: boolean;
}

const DomainPurchase: React.FC = () => {
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState<Tab>('identity');
  const [searchInput, setSearchInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    available: boolean;
    name: string;
    price?: number;
    error?: string;
    suggestions?: Suggestion[];
  } | null>(null);

  // Quick Access pattern selection
  const [quickPattern, setQuickPattern] = useState<QuickAccessPattern>('LN');
  const [quickSuggestions, setQuickSuggestions] = useState<string[]>([]);

  const handleAddToCart = (name: string, type: 'credit' | 'quick_access', price: number, pattern?: string) => {
    addItem({ name, type, price, pattern });
  };

  const handleSearch = async () => {
    if (!searchInput.trim()) return;

    setSearching(true);
    setSearchResult(null);

    try {
      const validation = validateDomain(searchInput);

      if (!validation.valid) {
        setSearchResult({
          available: false,
          name: searchInput,
          error: validation.error
        });
        setSearching(false);
        return;
      }

      // Call API to check availability
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-domain-availability?name=${encodeURIComponent(searchInput)}&type=${activeTab}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        }
      );

      const data = await response.json();
      setSearchResult(data);

    } catch (error) {
      console.error('Error checking domain:', error);
      setSearchResult({
        available: false,
        name: searchInput,
        error: 'Erro ao verificar disponibilidade'
      });
    } finally {
      setSearching(false);
    }
  };

  const handleGenerateQuickAccess = () => {
    const suggestions = generateSuggestions(quickPattern, 10);
    setQuickSuggestions(suggestions);
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Registre Seu Domínio .pix.global
            </h1>
            <p className="text-xl text-gray-400">
              Escolha entre Identidade Digital, Créditos Digitais ou Acesso Rápido
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={() => {
                setActiveTab('identity');
                setSearchResult(null);
                setSearchInput('');
              }}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
                activeTab === 'identity'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'
              }`}
            >
              <User className="w-5 h-5 inline-block mr-2" />
              Identidade Digital
            </button>

            <button
              onClick={() => {
                setActiveTab('credit');
                setSearchResult(null);
                setSearchInput('');
              }}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
                activeTab === 'credit'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/50'
                  : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'
              }`}
            >
              <CreditCard className="w-5 h-5 inline-block mr-2" />
              Créditos Digitais
            </button>

            <button
              onClick={() => {
                setActiveTab('quick_access');
                setSearchResult(null);
                setSearchInput('');
              }}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
                activeTab === 'quick_access'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/50'
                  : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'
              }`}
            >
              <Zap className="w-5 h-5 inline-block mr-2" />
              Acesso Rápido
            </button>
          </div>

          {/* Content */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">

            {/* Identity Tab */}
            {activeTab === 'identity' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Identidade Digital
                </h2>
                <p className="text-gray-400 mb-6">
                  Registre seu nome.pix.global com página personalizada e presença digital global.
                </p>

                <div className="flex gap-4 mb-6">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="seunome"
                    className="flex-1 bg-black border border-zinc-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={searching}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    {searching ? 'Verificando...' : 'Buscar'}
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                    <div className="text-2xl font-bold text-white mb-2">$25/ano</div>
                    <div className="text-blue-400 font-semibold mb-4">Plano Basic</div>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✓ 1 identidade digital</li>
                      <li>✓ Página pública personalizável</li>
                      <li>✓ Links ilimitados</li>
                      <li>✓ Estatísticas básicas</li>
                    </ul>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                    <div className="text-2xl font-bold text-white mb-2">$35/ano</div>
                    <div className="text-blue-400 font-semibold mb-4">Plano Pro</div>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✓ Tudo do Basic</li>
                      <li>✓ E-mail profissional @pix.global</li>
                      <li>✓ Estatísticas avançadas</li>
                      <li>✓ Suporte prioritário</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Credit Tab */}
            {activeTab === 'credit' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Créditos Digitais (Números)
                </h2>
                <p className="text-gray-400 mb-6">
                  Números exclusivos com pagamento único. Propriedade vitalícia, sem anuidade.
                </p>

                <div className="flex gap-4 mb-6">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value.replace(/[^0-9]/g, ''))}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="777"
                    className="flex-1 bg-black border border-zinc-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={searching}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    {searching ? 'Verificando...' : 'Buscar'}
                  </button>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Tabela de Preços por Raridade</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-300">
                        <span>8+ dígitos:</span>
                        <span className="font-semibold text-emerald-400">$1 - $10</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>6-7 dígitos:</span>
                        <span className="font-semibold text-emerald-400">$20 - $500</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>4-5 dígitos:</span>
                        <span className="font-semibold text-emerald-400">$1k - $10k</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-300">
                        <span>2-3 dígitos especiais:</span>
                        <span className="font-semibold text-emerald-400">$50k - $500k</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>1 dígito:</span>
                        <span className="font-semibold text-emerald-400">$1M+</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Access Tab */}
            {activeTab === 'quick_access' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Acesso Rápido (Alfanumérico)
                </h2>
                <p className="text-gray-400 mb-6">
                  Códigos curtos e memoráveis. Pagamento único, sem caracteres ambíguos.
                </p>

                <div className="space-y-4 mb-6">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pattern"
                        checked={quickPattern === 'LN'}
                        onChange={() => setQuickPattern('LN')}
                        className="text-amber-500"
                      />
                      <span className="text-white font-mono">L+N</span>
                      <span className="text-gray-400 text-sm">(ex: a1) - $2</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pattern"
                        checked={quickPattern === 'LLNN'}
                        onChange={() => setQuickPattern('LLNN')}
                        className="text-amber-500"
                      />
                      <span className="text-white font-mono">LL+NN</span>
                      <span className="text-gray-400 text-sm">(ex: br22) - $3</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pattern"
                        checked={quickPattern === 'code'}
                        onChange={() => setQuickPattern('code')}
                        className="text-amber-500"
                      />
                      <span className="text-white font-mono">Código Seguro</span>
                      <span className="text-gray-400 text-sm">(6-10 chars) - $5</span>
                    </label>
                  </div>

                  <button
                    onClick={handleGenerateQuickAccess}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Gerar Opções
                  </button>

                  {quickSuggestions.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {quickSuggestions.map((code, idx) => (
                        <button
                          key={idx}
                          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-4 py-3 rounded-lg font-mono text-sm transition-colors"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-gray-300">
                  <AlertCircle className="w-4 h-4 inline-block mr-2 text-amber-400" />
                  Sem caracteres ambíguos (0/o/1/l/i) para evitar erros de digitação
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchResult && (
              <div className="mt-8 pt-8 border-t border-zinc-800">
                {searchResult.error ? (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-red-400 font-semibold mb-2">Erro de Validação</div>
                        <div className="text-gray-300">{searchResult.error}</div>
                      </div>
                    </div>
                  </div>
                ) : searchResult.available ? (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <div className="text-xl font-bold text-white">
                        {searchResult.name}.pix.global está disponível!
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-green-400 mb-4">
                      {formatPrice(searchResult.price || 0)}
                    </div>
                    {activeTab !== 'identity' ? (
                      <div className="space-y-3">
                        <button
                          onClick={() => handleAddToCart(
                            searchResult.name,
                            activeTab as 'credit' | 'quick_access',
                            searchResult.price || 0
                          )}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          Adicionar ao Carrinho
                        </button>
                        <button className="w-full bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors">
                          Comprar Agora
                        </button>
                      </div>
                    ) : (
                      <button className="w-full bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors">
                        Comprar Agora
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="w-6 h-6 text-yellow-400" />
                      <div className="text-xl font-bold text-white">
                        {searchResult.name}.pix.global já está registrado
                      </div>
                    </div>

                    {searchResult.suggestions && searchResult.suggestions.length > 0 && (
                      <div>
                        <div className="text-gray-300 mb-4">Sugerimos estas alternativas:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {searchResult.suggestions.map((suggestion, idx) => (
                            <div
                              key={idx}
                              className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 flex justify-between items-center"
                            >
                              <div>
                                <div className="text-white font-mono">{suggestion.name}.pix.global</div>
                                <div className="text-sm text-gray-400">{formatPrice(suggestion.price)}</div>
                              </div>
                              <button
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
                                disabled={!suggestion.available}
                              >
                                {suggestion.available ? 'Comprar' : 'Indisponível'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default DomainPurchase;
