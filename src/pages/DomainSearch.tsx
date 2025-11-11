import React, { useState, useEffect } from 'react';
import { Search, Globe, Hash, CheckCircle, XCircle, Loader2, AlertCircle, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateDomainName, detectNameType } from '../lib/blockedNames';
import { precoPorDominio, formatPrice } from '../lib/pricing';
import { clientEnv } from '../lib/env';

type TabType = 'personal' | 'numeric';

interface ValidationResult {
  available: boolean;
  type: 'personal' | 'numeric';
  reason?: string;
  fqdn?: string;
}

export default function DomainSearch() {
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [searchValue, setSearchValue] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Calcular preço em tempo real
  const currentPrice = searchValue && !localError
    ? precoPorDominio(searchValue, activeTab)
    : null;

  // Auto-detectar tipo baseado no input
  useEffect(() => {
    if (searchValue) {
      const detected = detectNameType(searchValue);
      if (detected !== activeTab) {
        setActiveTab(detected);
      }
    }
  }, [searchValue]);

  // Debounce para verificação automática
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue.length >= 1) {
        handleLocalValidation();
      } else {
        setLocalError(null);
        setValidationResult(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleLocalValidation = () => {
    // Validação local primeiro (rápida)
    const validation = validateDomainName(searchValue);

    if (!validation.valid) {
      setLocalError(validation.error || 'Nome inválido');
      setValidationResult(null);
    } else {
      setLocalError(null);
    }
  };

  const handleSearch = async () => {
    if (!searchValue) return;

    // Validação local
    const validation = validateDomainName(searchValue);
    if (!validation.valid) {
      setLocalError(validation.error || 'Nome inválido');
      return;
    }

    setIsChecking(true);
    setLocalError(null);

    try {
      const supabaseUrl = clientEnv.supabase.url;
      const response = await fetch(`${supabaseUrl}/functions/v1/check-domain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${clientEnv.supabase.anonKey}`,
        },
        body: JSON.stringify({ name: searchValue }),
      });

      const data = await response.json();
      setValidationResult(data);

    } catch (error) {
      console.error('Error checking domain:', error);
      setLocalError('Erro ao verificar disponibilidade');
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const tabContent = {
    personal: {
      title: 'Identidade Global',
      subtitle: 'Seu nome único na internet',
      description: 'Registre seu nome pessoal e seja encontrado globalmente. Ex: joao.pix.global',
      placeholder: 'seunome',
      icon: Globe,
      examples: ['maria', 'joaosilva', 'ana123'],
    },
    numeric: {
      title: 'Token Numérico',
      subtitle: 'Ativo digital exclusivo',
      description: 'Token numérico único que pode ser usado como identificador ou ativo digital. Ex: 777.pix.global',
      placeholder: '12345',
      icon: Hash,
      examples: ['777', '2024', '100000'],
    },
  };

  const content = tabContent[activeTab];
  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-white">Registrar Domínio</h1>
          <p className="text-gray-400 mt-2">Encontre e registre sua identidade digital única</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 px-6 py-4 rounded-xl transition-all ${
              activeTab === 'personal'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <Globe className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Identidade Global</div>
                <div className="text-xs opacity-75">Nome pessoal</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('numeric')}
            className={`flex-1 px-6 py-4 rounded-xl transition-all ${
              activeTab === 'numeric'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <Hash className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Token Numérico</div>
                <div className="text-xs opacity-75">Ativo digital</div>
              </div>
            </div>
          </button>
        </div>

        {/* Content Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className={`p-3 rounded-xl ${
                activeTab === 'personal'
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'bg-purple-600/20 text-purple-400'
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{content.title}</h2>
                <p className="text-gray-400 text-sm mt-1">{content.subtitle}</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
              <p className="text-gray-300 text-sm leading-relaxed">{content.description}</p>
            </div>

            {/* Search Input */}
            <div className="relative mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value.toLowerCase())}
                  onKeyPress={handleKeyPress}
                  placeholder={content.placeholder}
                  className="w-full px-6 py-4 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 pr-32"
                  maxLength={64}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  .pix.global
                </div>
              </div>

              {/* Character count */}
              <div className="flex justify-between items-center mt-2 px-2">
                <span className="text-xs text-gray-500">
                  {searchValue.length}/64 caracteres
                </span>
                {searchValue && (
                  <span className="text-xs text-gray-400">
                    Tipo: {activeTab === 'personal' ? 'Identidade' : 'Token'}
                  </span>
                )}
              </div>
            </div>

            {/* Price Display */}
            {currentPrice && !localError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-sm text-gray-400">Preço</p>
                      <p className="text-2xl font-bold text-white">
                        {formatPrice(currentPrice.finalPrice, 'BRL')}
                      </p>
                    </div>
                  </div>
                  {currentPrice.multipliers.length > 0 && (
                    <div className="text-right">
                      {currentPrice.multipliers.map((mult, idx) => (
                        <div key={idx} className="text-xs text-yellow-400">
                          {mult.name} ×{mult.factor}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {currentPrice.details && (
                  <p className="text-xs text-gray-400 mt-2">{currentPrice.details}</p>
                )}
              </motion.div>
            )}

            {/* Local Error */}
            {localError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6"
              >
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 text-sm">{localError}</span>
              </motion.div>
            )}

            {/* Validation Result */}
            <AnimatePresence>
              {validationResult && !localError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center gap-3 rounded-lg p-4 mb-6 ${
                    validationResult.available
                      ? 'bg-green-500/10 border border-green-500/50'
                      : 'bg-red-500/10 border border-red-500/50'
                  }`}
                >
                  {validationResult.available ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      validationResult.available ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {validationResult.available ? 'Disponível!' : 'Indisponível'}
                    </p>
                    {validationResult.reason && (
                      <p className="text-sm text-gray-400 mt-1">{validationResult.reason}</p>
                    )}
                    {validationResult.available && validationResult.fqdn && (
                      <p className="text-sm text-gray-400 mt-1">
                        {validationResult.fqdn}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={!searchValue || isChecking || !!localError}
              className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                !searchValue || isChecking || localError
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : activeTab === 'personal'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30'
              }`}
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Verificar Disponibilidade
                </>
              )}
            </button>

            {/* Continue Button (if available) */}
            {validationResult?.available && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mt-4 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
              >
                Continuar com o Registro
                <Search className="w-5 h-5" />
              </motion.button>
            )}

            {/* Examples */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-3">Exemplos populares:</p>
              <div className="flex flex-wrap gap-2">
                {content.examples.map((example) => (
                  <button
                    key={example}
                    onClick={() => setSearchValue(example)}
                    className="px-4 py-2 bg-gray-900/50 hover:bg-gray-900 border border-gray-700 hover:border-gray-600 rounded-lg text-sm text-gray-300 transition-all"
                  >
                    {example}.pix.global
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-2">Por que Pix.Global?</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Identidade única e global</li>
              <li>• Fácil de lembrar e compartilhar</li>
              <li>• Integração com pagamentos</li>
              <li>• Propriedade verificável</li>
            </ul>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-2">Regras de Nomenclatura</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• 1-64 caracteres</li>
              <li>• Apenas letras (a-z) e números (0-9)</li>
              <li>• Sem espaços ou caracteres especiais</li>
              <li>• Letras minúsculas apenas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
