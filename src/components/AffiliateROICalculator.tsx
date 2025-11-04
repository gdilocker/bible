import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calculator, TrendingUp, ArrowRight } from 'lucide-react';

export const AffiliateROICalculator: React.FC = () => {
  const [primeReferrals, setPrimeReferrals] = useState(10);
  const [eliteReferrals, setEliteReferrals] = useState(10);

  const primeCommissionPerSale = 12.50;
  const elitePromoCommissionPerSale = 35;
  const elite2025CommissionPerSale = 50;

  const primeMonthly = primeReferrals * primeCommissionPerSale;
  const primeAnnual = primeMonthly * 12;

  const elitePromoMonthly = eliteReferrals * elitePromoCommissionPerSale;
  const elite2025Monthly = eliteReferrals * elite2025CommissionPerSale;
  const elitePromoAnnual = elitePromoMonthly * 12;
  const elite2025Annual = elite2025Monthly * 12;

  return (
    <div className="w-full space-y-8">
      {/* Prime Calculator */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-2xl p-8 shadow-xl border-2 border-blue-200">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm font-bold text-green-900">
              Receba em dólar — uma das moedas mais fortes e estáveis do mundo
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Calculadora Prime
            </h3>
            <p className="text-sm text-gray-600">
              Plano $50/mês — Comissão 25% ($12.50 por venda)
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Quantas vendas por mês você estima?
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="50"
              value={primeReferrals}
              onChange={(e) => setPrimeReferrals(parseInt(e.target.value))}
              className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${(primeReferrals / 50) * 100}%, rgb(219 234 254) ${(primeReferrals / 50) * 100}%, rgb(219 234 254) 100%)`
              }}
            />
            <div className="w-16 h-12 bg-white border-2 border-blue-300 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">{primeReferrals}</span>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-300"
        >
          <h4 className="font-bold text-gray-900 mb-4 text-center">Comissão Recorrente Estimada</h4>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700 font-medium mb-1">
                Comissão Mensal Recorrente
              </div>
              <div className="text-3xl font-bold text-blue-900">
                ${primeMonthly.toFixed(2)}
              </div>
              <div className="text-xs text-blue-600 mt-1">por mês</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
              <div className="text-sm text-indigo-700 font-medium mb-1">
                Comissão Anual Recorrente
              </div>
              <div className="text-3xl font-bold text-indigo-900">
                ${primeAnnual.toFixed(2)}
              </div>
              <div className="text-xs text-indigo-600 mt-1">por ano</div>
            </div>
          </div>
        </motion.div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-gray-700 leading-relaxed text-center">
            Os valores são apenas estimativas em USD. As comissões são pagas sobre o valor líquido, após descontos de taxas e impostos.
          </p>
        </div>
      </div>

      {/* Elite Calculator */}
      <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-50 rounded-2xl p-8 shadow-xl border-2 border-teal-200">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm font-bold text-green-900">
              Receba em dólar — uma das moedas mais fortes e valorizadas do mundo
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Calculadora Elite
            </h3>
            <p className="text-sm text-gray-600">
              Comissão 50% — $35/venda (promo) | $50/venda (2025)
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Quantas vendas por mês você estima?
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="50"
              value={eliteReferrals}
              onChange={(e) => setEliteReferrals(parseInt(e.target.value))}
              className="flex-1 h-2 bg-teal-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(20 184 166) 0%, rgb(20 184 166) ${(eliteReferrals / 50) * 100}%, rgb(204 251 241) ${(eliteReferrals / 50) * 100}%, rgb(204 251 241) 100%)`
              }}
            />
            <div className="w-16 h-12 bg-white border-2 border-teal-300 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-teal-600">{eliteReferrals}</span>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-teal-300">
            <h4 className="font-bold text-gray-900 mb-4 text-center">Comissão Recorrente — Promo até 31/12/2024</h4>
            <div className="text-center mb-3">
              <div className="text-xs text-gray-600 mb-1">Plano Elite: $70/mês — Comissão: 50%</div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200">
                <div className="text-sm text-teal-700 font-medium mb-1">
                  Comissão Mensal Recorrente
                </div>
                <div className="text-3xl font-bold text-teal-900">
                  ${elitePromoMonthly.toFixed(2)}
                </div>
                <div className="text-xs text-teal-600 mt-1">por mês</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg border border-cyan-200">
                <div className="text-sm text-cyan-700 font-medium mb-1">
                  Comissão Anual Total
                </div>
                <div className="text-3xl font-bold text-cyan-900">
                  ${elitePromoAnnual.toFixed(2)}
                </div>
                <div className="text-xs text-cyan-600 mt-1">por ano</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 shadow-lg border-2 border-purple-300">
            <div className="flex items-center gap-2 mb-3 justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h4 className="font-bold text-gray-900 text-center">Projeção a partir de 01/01/2025</h4>
            </div>
            <div className="text-center mb-3">
              <div className="text-xs text-gray-600 mb-1">Plano Elite: $100/mês — Comissão: 50%</div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/60 rounded-lg border border-purple-200">
                <div className="text-sm text-purple-700 font-medium mb-1">
                  Projeção Mensal Recorrente
                </div>
                <div className="text-3xl font-bold text-purple-900">
                  ${elite2025Monthly.toFixed(2)}
                </div>
                <div className="text-xs text-purple-600 mt-1">por mês</div>
              </div>

              <div className="text-center p-4 bg-white/60 rounded-lg border border-indigo-200">
                <div className="text-sm text-indigo-700 font-medium mb-1">
                  Projeção Anual Total
                </div>
                <div className="text-3xl font-bold text-indigo-900">
                  ${elite2025Annual.toFixed(2)}
                </div>
                <div className="text-xs text-indigo-600 mt-1">por ano</div>
              </div>
            </div>

            <div className="mt-3 text-center">
              <div className="inline-block px-3 py-1.5 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg border border-purple-300">
                <span className="text-xs font-semibold text-purple-900">
                  +${(elite2025Monthly - elitePromoMonthly).toFixed(2)}/mês a mais a partir de 2025
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-4 bg-teal-50 border border-teal-200 rounded-lg p-4">
          <p className="text-xs text-gray-700 leading-relaxed mb-2">
            Comissões calculadas em USD sobre o valor líquido.
          </p>
          <p className="text-xs text-gray-700 leading-relaxed mb-2">
            Valores sujeitos a variação conforme impostos, taxas e câmbio.
          </p>
          <p className="text-xs text-gray-700 leading-relaxed">
            O valor do plano Elite será reajustado para $100/mês a partir de 1º de janeiro de 2025.
          </p>
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <a
          href="/afiliados/termos"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold rounded-xl hover:shadow-2xl transition-all transform hover:scale-105"
        >
          Ver Termos Completos
          <ArrowRight className="w-5 h-5" />
        </a>

        <div className="mt-6 bg-gradient-to-r from-blue-50 to-slate-50 border-2 border-blue-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-blue-900 mb-2 text-center">
            Documento Oficial Registrado
          </p>
          <p className="text-xs text-gray-700 leading-relaxed text-center">
            Os Termos de Afiliados do .com.rich são documentos oficiais registrados na <strong className="text-black">Companies House</strong> (Reino Unido), garantindo transparência jurídica e autenticidade internacional.
          </p>
          <p className="text-xs text-gray-600 mt-2 text-center">
            <strong className="text-black">Global Digital Identity LTD</strong> — Companies House – England & Wales
          </p>
        </div>
      </motion.div>
    </div>
  );
};
