import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Star, Crown, CreditCard, Users, TrendingUp, Sparkles, AlertCircle, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SubscriptionPlan {
  id: string;
  plan_name: string;
  plan_type: string;
  price_usd: string | number;
  billing_cycle: string;
  description: string;
  features: string[];
  is_active: boolean;
  commission_rate?: number;
}

const FALLBACK_PLANS: SubscriptionPlan[] = [
  {
    id: 'prime',
    plan_name: 'Prime',
    plan_type: 'prime',
    price_usd: 50,
    billing_cycle: 'monthly',
    description: 'A porta de entrada para o clube com.rich. Presença digital exclusiva com elegância e sofisticação.',
    features: [
      'Licença exclusiva de domínio (seunome.com.rich)',
      'Página de perfil personalizável (pública ou privada)',
      'Editor completo: bio, avatar e links ilimitados',
      'Analytics profissional de acessos e cliques',
      'Acesso à coleção de nomes premium',
      'Integração com redes sociais',
      'Programa de afiliados: 25% de comissão recorrente em cada pagamento do cliente',
      'Suporte via plataforma'
    ],
    is_active: true,
    commission_rate: 0.25
  },
  {
    id: 'elite',
    plan_name: 'Elite',
    plan_type: 'elite',
    price_usd: 70,
    billing_cycle: 'monthly',
    description: 'Identidade digital e física de alto padrão. Voltado para quem deseja ir além da imagem online e fazer parte de um clube exclusivo.',
    features: [
      'Tudo do plano Prime',
      'Identidade física personalizada com QR Code dinâmico',
      'Design Black & Gold Edition exclusivo',
      'Selo Elite Member no painel e na página pública',
      'Destaque premium nas listagens e buscas',
      'Acesso antecipado à coleção de nomes premium',
      'Convites e benefícios exclusivos de membro',
      'Suporte prioritário dedicado',
      'Programa de afiliados: 50% de comissão recorrente em cada pagamento do cliente'
    ],
    is_active: true,
    commission_rate: 0.50
  },
  {
    id: 'supreme',
    plan_name: 'Supreme',
    plan_type: 'supreme',
    price_usd: 'By Request',
    billing_cycle: 'monthly',
    description: 'Licenciamento exclusivo de domínios premium com termos personalizados e suporte corporativo dedicado.',
    features: [
      'Exclusive License Fee (taxa única de licenciamento)',
      'Mensalidade personalizada sob consulta',
      'Portfólio de domínios premium globais',
      'Gerente de conta dedicado',
      'Suporte corporativo prioritário',
      'Garantias de SLA',
      'Termos contratuais customizados',
      'Onboarding white-glove',
      'Consultoria estratégica inclusa'
    ],
    is_active: true
  }
];

const Pricing: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const stateMessage = location.state?.message;
  const returnTo = location.state?.returnTo;

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .in('plan_type', ['prime', 'elite', 'supreme'])
        .order('price_usd', { ascending: true });

      // Reorder to show Prime, Elite, Supreme (Supreme has price 0 so it comes first)
      const orderedData = data ? [
        ...data.filter(p => p.plan_type === 'prime'),
        ...data.filter(p => p.plan_type === 'elite'),
        ...data.filter(p => p.plan_type === 'supreme')
      ] : [];

      if (error) {
        console.error('Error loading subscription plans:', error);
        setPlans(FALLBACK_PLANS);
      } else if (orderedData && orderedData.length > 0) {
        setPlans(orderedData);
      } else {
        console.log('No plans in database, using fallback');
        setPlans(FALLBACK_PLANS);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      setPlans(FALLBACK_PLANS);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planType: string) => {
    if (planType === 'supreme') return Crown;
    return planType === 'elite' ? Award : Star;
  };

  const getPlanColor = (planType: string) => {
    if (planType === 'supreme') return 'from-yellow-500 to-amber-600';
    return planType === 'elite' ? 'from-slate-500 to-teal-600' : 'from-slate-300 to-slate-400';
  };

  return (
    <div className="relative min-h-screen bg-[#F5F5F5] overflow-hidden">
      <div className="relative pt-32 pb-16">
        {stateMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"
          >
            <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-6 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-900 mb-2">Domínio Premium Requer Plano Elite</h3>
                <p className="text-amber-800">{stateMessage}</p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
              Planos de{' '}
              <span className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                Assinatura
              </span>
            </h1>
            <p className="text-xl text-[#6B7280] leading-relaxed">
              Escolha o plano ideal para sua licença exclusiva .com.rich
            </p>
          </div>
        </motion.section>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B2D42]"></div>
            <p className="text-[#6B7280] mt-4">Carregando planos...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6B7280] text-xl">Nenhum plano disponível no momento.</p>
            <p className="text-[#6B7280] text-sm mt-2">Por favor, tente novamente mais tarde.</p>
          </div>
        ) : (
          <motion.section
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {plans.map((plan, index) => {
                const Icon = getPlanIcon(plan.plan_type);
                const isPrime = plan.plan_type === 'prime';
                const isElite = plan.plan_type === 'elite';
                const isSupreme = plan.plan_type === 'supreme';

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    {plan.plan_type === 'prime' && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black px-6 py-2 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 border-2 border-amber-400 whitespace-nowrap">
                          <Sparkles className="w-4 h-4" />
                          <span>Acesso Exclusivo 14 Dias</span>
                        </div>
                      </div>
                    )}

                    {isElite && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-gradient-to-r from-slate-500 to-teal-600 text-white px-6 py-2 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 border-2 border-slate-400 whitespace-nowrap">
                          <Sparkles className="w-4 h-4" />
                          <span>Recomendado</span>
                        </div>
                      </div>
                    )}

                    {isSupreme && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black px-6 py-2 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 border-2 border-amber-400 whitespace-nowrap">
                          <Sparkles className="w-4 h-4" />
                          <span>Premium</span>
                        </div>
                      </div>
                    )}

                    <div className={`bg-white border-2 ${isSupreme ? 'border-yellow-500 shadow-xl' : isElite ? 'border-slate-500 shadow-xl' : 'border-slate-300'} rounded-2xl p-8 h-full hover:shadow-lg transition-all duration-300 relative`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${getPlanColor(plan.plan_type)}`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-black">{plan.plan_name}</h3>
                          {isPrime && (
                            <span className="text-sm text-slate-600 font-semibold">Prime Member</span>
                          )}
                          {isElite && (
                            <span className="text-sm text-slate-600 font-semibold">Elite Member</span>
                          )}
                          {isSupreme && (
                            <span className="text-sm text-yellow-600 font-semibold">By Request</span>
                          )}
                        </div>
                      </div>

                      <p className="text-[#6B7280] mb-6 min-h-[60px]">
                        {plan.description}
                      </p>

                      <div className="mb-8">
                        <div className="flex items-baseline gap-2 mb-2">
                          {isElite && (
                            <span className="text-2xl font-bold text-gray-400 line-through">
                              $100
                            </span>
                          )}
                          {isSupreme || (typeof plan.price_usd === 'number' && plan.price_usd === 0) || (typeof plan.price_usd === 'string' && parseFloat(plan.price_usd) === 0) ? (
                            <span className="text-4xl font-bold text-black">
                              By Request
                            </span>
                          ) : (
                            <>
                              <span className="text-5xl font-bold text-black">
                                ${typeof plan.price_usd === 'string' ? parseFloat(plan.price_usd) : plan.price_usd}
                              </span>
                              <span className="text-[#6B7280] text-xl">/mês</span>
                            </>
                          )}
                        </div>
                        {isElite && (
                          <p className="text-sm text-teal-700 font-semibold mt-1">
                            Promoção até 31/12/2024. Depois $100/mês
                          </p>
                        )}
                        {plan.commission_rate && plan.commission_rate > 0 && !isSupreme && (
                          <p className="text-sm text-slate-600 font-medium mt-2 flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            {plan.commission_rate * 100}% de comissão (${(typeof plan.price_usd === 'number' ? plan.price_usd : parseFloat(plan.price_usd as string || '0')) * plan.commission_rate} por venda)
                          </p>
                        )}
                      </div>
                      {isElite && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-600">
                            A partir de 1º de janeiro de 2025, o valor será $100/mês
                          </p>
                        </div>
                      )}

                      {isSupreme ? (
                        <Link
                          to="/contact"
                          className="block w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 text-center mb-8 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-md"
                        >
                          Solicitar Licença
                        </Link>
                      ) : (
                        <Link
                          to={`/register?plan=${plan.plan_type}`}
                          className={`block w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 text-center mb-8 ${
                            isElite
                              ? 'bg-gradient-to-r from-slate-500 to-teal-600 hover:from-slate-600 hover:to-teal-700 text-white shadow-md'
                              : 'bg-gradient-to-r from-slate-400 to-slate-900 hover:from-slate-500 hover:to-slate-600 text-white shadow-md'
                          }`}
                        >
                          Começar
                        </Link>
                      )}

                      <div className="space-y-4">
                        <p className="font-semibold text-black mb-3">
                          {isSupreme ? 'Recursos Exclusivos:' : isElite ? 'Tudo do Prime, mais:' : 'Inclui:'}
                        </p>
                        <ul className="space-y-3">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isElite ? 'text-yellow-500' : 'text-green-500'}`} />
                              <span className="text-black text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        <motion.section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-black">Programa de Afiliados</h2>
            </div>
            <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
              Ganhe comissões recorrentes promovendo nossos planos premium
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:border-green-300 transition-all duration-300"
              whileHover={{ y: -8, shadow: "0 20px 40px rgba(0,0,0,0.15)" }}
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-2xl mb-3 text-black text-center">
                Comissões Diferenciadas
              </h3>
              <p className="text-[#6B7280] text-sm mb-4 text-center">
                25% no plano Prime ($12.50/mês) e 50% no plano Elite ($35/mês)
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                  <span className="text-black font-medium">Prime</span>
                  <span className="font-bold text-green-600">$12.50/mês</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-yellow-100 rounded-lg border border-yellow-200">
                  <span className="text-black font-medium">Elite</span>
                  <span className="font-bold text-amber-600">$35/mês</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:border-yellow-300 transition-all duration-300"
              whileHover={{ y: -8, shadow: "0 20px 40px rgba(0,0,0,0.15)" }}
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl shadow-lg">
                  <CreditCard className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-2xl mb-3 text-black text-center">
                Pagamento Sob Demanda
              </h3>
              <p className="text-[#6B7280] text-sm text-center mb-4">
                Solicite o saque das suas comissões acumuladas via PayPal quando desejar
              </p>
              <div className="space-y-2 text-xs text-center">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-amber-800 font-semibold">
                    Comissões aprovadas ficam disponíveis para saque após 30 dias da confirmação do pagamento
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 font-semibold">
                    Valor mínimo para saque: US$ 200
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:border-slate-300 transition-all duration-300"
              whileHover={{ y: -8, shadow: "0 20px 40px rgba(0,0,0,0.15)" }}
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-slate-400 to-slate-900 rounded-2xl shadow-lg">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-2xl mb-3 text-black text-center">
                Comissão Recorrente por Vendas
              </h3>
              <p className="text-[#6B7280] text-sm text-center mb-4">
                Receba comissão em cada venda realizada através do seu link de parceria
              </p>
              <div className="space-y-2 text-xs text-center">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-emerald-900 font-semibold">
                    ✓ Planos: comissão em cada mensalidade paga
                  </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-emerald-900 font-semibold">
                    ✓ Domínios regulares e Premium: comissão em cada anuidade/renovação
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-slate-800 font-semibold">
                    Percentuais: 25% (Prime) • 50% (Elite)
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="text-slate-700 text-[10px]">
                    Cálculo sobre valor líquido. Sem comissão em estornos/inadimplência.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
              <Award className="w-5 h-5 text-slate-600" />
              <p className="text-black text-sm font-medium">
                Cada membro recebe um link de parceria exclusivo e pode acompanhar suas comissões no painel de afiliados
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-center">
            <p className="text-[#6B7280] text-sm">
              Tem dúvidas? <Link to="/contact" className="text-black hover:underline font-semibold">Entre em contato</Link> ou veja nosso <Link to="/faq" className="text-black hover:underline font-semibold">FAQ</Link>
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Pricing;
