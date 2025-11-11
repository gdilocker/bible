import React, { useState } from 'react';
import { Globe, Hash, TrendingUp, Sparkles, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  precoPorDominio,
  formatPrice,
  getAllExamplesWithPrices,
  getLengthPricingTable,
  getMultipliersTable,
} from '../lib/pricing';

export default function DomainPricing() {
  const examples = getAllExamplesWithPrices();
  const lengthTable = getLengthPricingTable();
  const multipliersTable = getMultipliersTable();
  const [calculatorInput, setCalculatorInput] = useState('');
  const [calculatorType, setCalculatorType] = useState<'personal' | 'numeric'>('personal');

  const calculatedPrice = calculatorInput
    ? precoPorDominio(calculatorInput, calculatorType)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Preços de Domínios
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Transparência total: conheça como precificamos cada domínio Pix.Global
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Price Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Calculadora de Preços</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Digite o domínio
              </label>
              <input
                type="text"
                value={calculatorInput}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase();
                  setCalculatorInput(value);
                  // Auto-detect type
                  if (value && /^\d+$/.test(value)) {
                    setCalculatorType('numeric');
                  } else if (value) {
                    setCalculatorType('personal');
                  }
                }}
                placeholder="maria ou 777"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCalculatorType('personal')}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                    calculatorType === 'personal'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  <Globe className="w-4 h-4 inline mr-2" />
                  Identidade
                </button>
                <button
                  onClick={() => setCalculatorType('numeric')}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                    calculatorType === 'numeric'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  <Hash className="w-4 h-4 inline mr-2" />
                  Token
                </button>
              </div>
            </div>
          </div>

          {calculatedPrice && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-6 bg-gray-900/50 rounded-xl border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Preço Total</p>
                  <p className="text-3xl font-bold text-white">
                    {formatPrice(calculatedPrice.finalPrice, 'BRL')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">
                    {calculatorInput}.pix.global
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Preço Base:</span>
                  <span>{formatPrice(calculatedPrice.basePrice, 'BRL')}</span>
                </div>
                {calculatedPrice.multipliers.map((mult, idx) => (
                  <div key={idx} className="flex justify-between text-blue-400">
                    <span>{mult.name} (×{mult.factor}):</span>
                    <span>
                      {formatPrice(
                        calculatedPrice.basePrice * mult.factor,
                        'BRL'
                      )}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-700">
                  <p className="text-xs text-gray-500">{calculatedPrice.details}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Personal Pricing */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Identidades Pessoais</h2>
              <p className="text-gray-400 text-sm">Nomes e identificadores únicos</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600/20 to-blue-600/10 rounded-xl p-6 mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-white">R$ 25,00</span>
              <span className="text-gray-400">preço fixo</span>
            </div>
            <p className="text-sm text-gray-300">
              Todos os domínios pessoais (com letras) têm o mesmo preço
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {examples.personal.map((ex, idx) => (
              <div
                key={idx}
                className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
              >
                <p className="text-white font-medium mb-1">
                  {ex.label}.pix.global
                </p>
                <p className="text-sm text-gray-400 mb-3">{ex.description}</p>
                <p className="text-lg font-bold text-blue-400">
                  {formatPrice(ex.pricing.finalPrice, 'BRL')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Numeric Pricing - Length Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Hash className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Tokens Numéricos</h2>
              <p className="text-gray-400 text-sm">Preços baseados em comprimento</p>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6 flex gap-3">
            <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              Números mais curtos são mais raros e valiosos. Multiplicadores podem
              aumentar o valor base.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Comprimento
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Exemplo
                  </th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">
                    Preço Base
                  </th>
                </tr>
              </thead>
              <tbody>
                {lengthTable.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-white font-medium">
                      {row.length} {typeof row.length === 'number' ? 'dígito' : 'dígitos'}
                    </td>
                    <td className="py-3 px-4 text-gray-400 font-mono">
                      {row.example}.pix.global
                    </td>
                    <td className="py-3 px-4 text-right text-purple-400 font-bold">
                      {formatPrice(row.basePrice, 'BRL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Multipliers */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Multiplicadores Premium</h2>
              <p className="text-gray-400 text-sm">
                Padrões especiais aumentam o valor
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {multipliersTable.map((mult, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-xl p-6 border border-yellow-600/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">{mult.name}</h3>
                  <div className="px-3 py-1 bg-yellow-600/30 rounded-full text-yellow-400 font-bold text-sm">
                    ×{mult.factor}
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-4">{mult.description}</p>
                <div className="space-y-2">
                  {mult.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-gray-400 font-mono">{ex}</span>
                      <span className="text-yellow-400">
                        {formatPrice(
                          precoPorDominio(ex, 'numeric').finalPrice,
                          'BRL'
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Examples - Numeric Special */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Números Especiais</h3>
            <div className="space-y-3">
              {examples.numeric.special.map((ex, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium font-mono">
                      {ex.label}.pix.global
                    </p>
                    <p className="text-xs text-gray-400">{ex.description}</p>
                  </div>
                  <p className="text-lg font-bold text-purple-400">
                    {formatPrice(ex.pricing.finalPrice, 'BRL')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Números Premium</h3>
            <div className="space-y-3">
              {examples.numeric.premium.map((ex, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg border border-yellow-600/30"
                >
                  <div>
                    <p className="text-white font-medium font-mono">
                      {ex.label}.pix.global
                    </p>
                    <p className="text-xs text-gray-400">{ex.description}</p>
                  </div>
                  <p className="text-lg font-bold text-yellow-400">
                    {formatPrice(ex.pricing.finalPrice, 'BRL')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Pronto para registrar seu domínio?
          </h2>
          <p className="text-blue-100 mb-6">
            Encontre o domínio perfeito para sua identidade digital
          </p>
          <a
            href="/registrar"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-all"
          >
            Buscar Domínio
          </a>
        </div>
      </div>
    </div>
  );
}
