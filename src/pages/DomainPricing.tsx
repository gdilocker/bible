import React, { useState } from 'react';
import { Globe, Hash, TrendingUp, Sparkles, Info, Crown, DollarSign, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  precoPorDominio,
  formatPrice,
  getAllExamplesWithPrices,
  getLengthPricingTable,
  getMultipliersTable,
} from '../lib/pricing';

export default function DomainPricing() {
  const allExamples = getAllExamplesWithPrices();
  const lengthTable = getLengthPricingTable();
  const multipliersTable = getMultipliersTable();
  const [calculatorInput, setCalculatorInput] = useState('');
  const [calculatorType, setCalculatorType] = useState<'personal' | 'numeric'>('personal');

  const calculatedPrice = calculatorInput
    ? precoPorDominio(calculatorInput, calculatorType)
    : null;

  const examples = [
    ...allExamples.personal.map((ex: any) => ({
      domain: ex.label,
      type: 'personal' as const,
      price: ex.pricing.finalPrice,
      multipliers: ex.pricing.multipliers.map((m: any) => m.name),
    })),
    ...allExamples.numeric.basic.map((ex: any) => ({
      domain: ex.label,
      type: 'numeric' as const,
      price: ex.pricing.finalPrice,
      multipliers: ex.pricing.multipliers.map((m: any) => m.name),
    })),
    ...allExamples.numeric.special.map((ex: any) => ({
      domain: ex.label,
      type: 'numeric' as const,
      price: ex.pricing.finalPrice,
      multipliers: ex.pricing.multipliers.map((m: any) => m.name),
    })),
  ].slice(0, 12);

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      {/* Hero Header */}
      <div className="relative border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-[#FFC107]/10 backdrop-blur-sm border border-[#FFC107]/30 rounded-full px-6 py-2 mb-6">
              <DollarSign className="w-4 h-4 text-[#FFC107]" />
              <span className="text-[#FFC107] text-xs font-semibold tracking-widest uppercase">Pricing</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
              Preços de <span className="bg-gradient-to-r from-[#FFC107] via-[#FFD54F] to-[#FF9800] bg-clip-text text-transparent">Domínios</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Transparência total: conheça como precificamos cada domínio Pix.Global
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Price Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#FFC107]/10 to-[#FF9800]/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-[#FFC107]/20"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFC107] to-[#FF9800] shadow-lg shadow-[#FFC107]/30">
              <Calculator className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Calculadora de Preços</h2>
              <p className="text-gray-400 mt-1">Calcule o valor do seu domínio</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-white mb-3 tracking-wide">
                Digite o domínio
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={calculatorInput}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase();

                    // Se o tipo for "Créditos Digitais", aceitar apenas números
                    if (calculatorType === 'numeric') {
                      // Remove caracteres não numéricos
                      const numericValue = value.replace(/\D/g, '');
                      setCalculatorInput(numericValue);
                    } else {
                      setCalculatorInput(value);
                      // Auto-detectar tipo baseado no conteúdo
                      if (value && /^\d+$/.test(value)) {
                        setCalculatorType('numeric');
                      } else if (value) {
                        setCalculatorType('personal');
                      }
                    }
                  }}
                  placeholder="maria ou 777"
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#FFC107] font-semibold">
                  .pix.global
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-3 tracking-wide">
                Tipo
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCalculatorType('personal')}
                  className={`px-6 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                    calculatorType === 'personal'
                      ? 'bg-gradient-to-r from-[#FFC107] to-[#FF9800] text-black shadow-lg shadow-[#FFC107]/30'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  Identidade
                </button>
                <button
                  onClick={() => setCalculatorType('numeric')}
                  className={`px-6 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                    calculatorType === 'numeric'
                      ? 'bg-gradient-to-r from-[#FFC107] to-[#FF9800] text-black shadow-lg shadow-[#FFC107]/30'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <Hash className="w-5 h-5" />
                  Créditos Digitais
                </button>
              </div>
            </div>
          </div>

          {/* Result */}
          {calculatedPrice && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Preço Calculado</p>
                  <p className="text-5xl font-bold text-white">
                    {formatPrice(calculatedPrice.finalPrice, 'BRL')}
                  </p>
                </div>
                {calculatedPrice.multipliers.length > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-400 mb-2">Multiplicadores</p>
                    {calculatedPrice.multipliers.map((mult, idx) => (
                      <div key={idx} className="text-lg text-[#FFC107] font-bold">
                        {mult.name} ×{mult.factor}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {calculatedPrice.details && (
                <p className="text-gray-400 leading-relaxed">{calculatedPrice.details}</p>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Length Pricing Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Preços por Tamanho</h2>
              <p className="text-gray-400 mt-1">Quanto menor, mais valorizado</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {lengthTable.map((entry, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#FFC107]/50 transition-all group"
              >
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold text-white group-hover:text-[#FFC107] transition-colors">
                    {entry.length}
                  </span>
                  <span className="text-gray-400 text-sm">caracteres</span>
                </div>
                <p className="text-2xl font-bold text-[#FFC107] mb-2">
                  {formatPrice(entry.basePrice, 'USD')}
                </p>
                <p className="text-sm text-gray-400 font-mono">ex: {entry.example}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Multipliers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Multiplicadores</h2>
              <p className="text-gray-400 mt-1">Características que aumentam o valor</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {multipliersTable.map((mult) => (
              <div
                key={mult.name}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{mult.name}</h3>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-bold">
                    ×{mult.factor}
                  </span>
                </div>
                <p className="text-gray-400 mb-3">{mult.description}</p>
                {mult.examples.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {mult.examples.map((ex) => (
                      <span
                        key={ex}
                        className="px-2 py-1 bg-white/5 text-gray-300 rounded text-xs font-mono"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#FFC107]/20 to-[#FF9800]/10">
              <Crown className="w-6 h-6 text-[#FFC107]" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Exemplos de Preços</h2>
              <p className="text-gray-400 mt-1">Domínios reais e seus valores</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {examples.map((example) => (
              <div
                key={example.domain}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#FFC107]/50 transition-all group"
              >
                <div className="flex items-center gap-2 mb-4">
                  {example.type === 'personal' ? (
                    <Globe className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Hash className="w-5 h-5 text-purple-400" />
                  )}
                  <span className="text-sm text-gray-400 uppercase tracking-wide">
                    {example.type === 'personal' ? 'Identidade' : 'Créditos Digitais'}
                  </span>
                </div>

                <p className="text-xl font-bold text-white mb-2 group-hover:text-[#FFC107] transition-colors font-mono">
                  {example.domain}.pix.global
                </p>

                <p className="text-3xl font-bold text-[#FFC107] mb-3">
                  {formatPrice(example.price, 'BRL')}
                </p>

                {example.multipliers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {example.multipliers.map((mult) => (
                      <span
                        key={mult}
                        className="px-2 py-1 bg-[#FFC107]/10 text-[#FFC107] rounded text-xs font-medium"
                      >
                        {mult}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-3xl p-8 border border-blue-500/20"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-500/20 flex-shrink-0">
              <Info className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Sobre os Preços</h3>
              <div className="space-y-3 text-gray-300 leading-relaxed">
                <p>
                  <strong className="text-white">Transparência Total:</strong> Nosso sistema de precificação é completamente transparente. O preço base depende do tamanho do domínio.
                </p>
                <p>
                  <strong className="text-white">Multiplicadores:</strong> Características especiais como números repetidos, sequências ou padrões aplicam multiplicadores sobre o preço base.
                </p>
                <p>
                  <strong className="text-white">Valor Justo:</strong> Quanto mais curto e exclusivo o domínio, maior seu valor. Domínios premium seguem precificação especial.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
