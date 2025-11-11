import React, { useState, useEffect } from 'react';
import { Search, Globe, Hash, CheckCircle, XCircle, Loader2, AlertCircle, DollarSign, Crown } from 'lucide-react';
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

  const currentPrice = searchValue && !localError
    ? precoPorDominio(searchValue, activeTab)
    : null;

  useEffect(() => {
    if (searchValue) {
      const detected = detectNameType(searchValue);
      if (detected !== activeTab) {
        setActiveTab(detected);
      }
    }
  }, [searchValue]);

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
      description: 'Registre seu nome pessoal e seja encontrado globalmente. Ex: seunome.pix.global',
      placeholder: 'seunome',
      icon: Globe,
      examples: ['seunome', 'suamarca', 'seuapelido'],
    },
    numeric: {
      title: 'Créditos Digitais',
      subtitle: 'Ativo digital exclusivo',
      description: 'Crédito digital único que pode ser usado como identificador ou ativo digital. Ex: 777.pix.global',
      placeholder: '12345',
      icon: Hash,
      examples: ['777', '2024', '100000'],
    },
  };

  const content = tabContent[activeTab];
  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      {/* Hero Header */}
      <div className="relative border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#FFC107]/10 backdrop-blur-sm border border-[#FFC107]/30 rounded-full px-6 py-2 mb-6">
              <Crown className="w-4 h-4 text-[#FFC107]" />
              <span className="text-[#FFC107] text-xs font-semibold tracking-widest uppercase">Domain Registry</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
              Registrar <span className="bg-gradient-to-r from-[#FFC107] via-[#FFD54F] to-[#FF9800] bg-clip-text text-transparent">Domínio</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Encontre e registre sua identidade digital única
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-6 py-6 rounded-2xl transition-all ${
              activeTab === 'personal'
                ? 'bg-gradient-to-br from-[#FFC107]/20 to-[#FF9800]/10 border-2 border-[#FFC107] text-white shadow-lg shadow-[#FFC107]/20'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <Globe className={`w-8 h-8 ${activeTab === 'personal' ? 'text-[#FFC107]' : 'text-gray-500'}`} />
              <div>
                <div className="font-bold text-lg">Identidade Global</div>
                <div className="text-sm opacity-75">Nome pessoal</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('numeric')}
            className={`px-6 py-6 rounded-2xl transition-all ${
              activeTab === 'numeric'
                ? 'bg-gradient-to-br from-[#FFC107]/20 to-[#FF9800]/10 border-2 border-[#FFC107] text-white shadow-lg shadow-[#FFC107]/20'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <Hash className={`w-8 h-8 ${activeTab === 'numeric' ? 'text-[#FFC107]' : 'text-gray-500'}`} />
              <div>
                <div className="font-bold text-lg">Créditos Digitais</div>
                <div className="text-sm opacity-75">Ativo digital</div>
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
            className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10"
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFC107] to-[#FF9800] shadow-lg shadow-[#FFC107]/30">
                <Icon className="w-8 h-8 text-black" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white">{content.title}</h2>
                <p className="text-gray-400 mt-1">{content.subtitle}</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/5 rounded-xl p-5 mb-8 border border-white/10">
              <p className="text-gray-300 leading-relaxed">{content.description}</p>
            </div>

            {/* Search Input */}
            <div className="relative mb-8">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value.toLowerCase())}
                  onKeyPress={handleKeyPress}
                  placeholder={content.placeholder}
                  className="w-full pl-16 pr-40 py-5 bg-white/10 border border-white/20 rounded-2xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all"
                  maxLength={64}
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[#FFC107] font-semibold">
                  .pix.global
                </div>
              </div>

              <div className="flex justify-between items-center mt-3 px-2">
                <span className="text-sm text-gray-500">
                  {searchValue.length}/64 caracteres
                </span>
                {searchValue && (
                  <span className="text-sm text-gray-400">
                    Tipo: {activeTab === 'personal' ? 'Identidade' : 'Créditos Digitais'}
                  </span>
                )}
              </div>
            </div>

            {/* Price Display */}
            {currentPrice && !localError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-2xl p-6 mb-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Preço</p>
                      <p className="text-3xl font-bold text-white">
                        {formatPrice(currentPrice.finalPrice, 'BRL')}
                      </p>
                    </div>
                  </div>
                  {currentPrice.multipliers.length > 0 && (
                    <div className="text-right">
                      {currentPrice.multipliers.map((mult, idx) => (
                        <div key={idx} className="text-sm text-[#FFC107] font-medium">
                          {mult.name} ×{mult.factor}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {currentPrice.details && (
                  <p className="text-sm text-gray-400 mt-3">{currentPrice.details}</p>
                )}
              </motion.div>
            )}

            {/* Local Error */}
            {localError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-red-500/10 border border-red-500/50 rounded-2xl p-5 mb-8"
              >
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <span className="text-red-400">{localError}</span>
              </motion.div>
            )}

            {/* Validation Result */}
            <AnimatePresence>
              {validationResult && !localError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center gap-4 rounded-2xl p-6 mb-8 ${
                    validationResult.available
                      ? 'bg-emerald-500/10 border border-emerald-500/50'
                      : 'bg-red-500/10 border border-red-500/50'
                  }`}
                >
                  {validationResult.available ? (
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-6 h-6 text-red-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className={`text-xl font-bold ${
                      validationResult.available ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {validationResult.available ? 'Disponível!' : 'Indisponível'}
                    </p>
                    {validationResult.reason && (
                      <p className="text-gray-400 mt-1">{validationResult.reason}</p>
                    )}
                    {validationResult.available && validationResult.fqdn && (
                      <p className="text-gray-400 mt-1">
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
              className={`w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                !searchValue || isChecking || localError
                  ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#FFC107] to-[#FF9800] hover:from-[#FFD54F] hover:to-[#FFC107] text-black shadow-lg shadow-[#FFC107]/30 hover:shadow-[#FFC107]/50 hover:scale-[1.02]'
              }`}
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Search className="w-6 h-6" />
                  Verificar Disponibilidade
                </>
              )}
            </button>

            {/* Continue Button */}
            {validationResult?.available && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mt-4 py-5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-3 hover:scale-[1.02]"
              >
                Continuar com o Registro
                <CheckCircle className="w-6 h-6" />
              </motion.button>
            )}

            {/* Examples */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-sm text-gray-500 mb-3">Exemplos populares:</p>
              <div className="flex flex-wrap gap-2">
                {content.examples.map((example) => (
                  <button
                    key={example}
                    onClick={() => setSearchValue(example)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white text-sm transition-all"
                  >
                    {example}.pix.global
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
