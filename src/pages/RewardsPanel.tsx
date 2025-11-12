import React, { useState, useEffect } from 'react';
import { Gift, TrendingUp, DollarSign, Package, ExternalLink, AlertCircle } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../lib/domainValidation';

interface RewardDomain {
  id: string;
  domain_name: string;
  full_domain: string;
  domain_type: string;
  reward_value_usd: number;
  reward_type: string;
  received_at: string;
  status: string;
  for_sale: boolean;
  commission_source?: string;
}

const RewardsPanel: React.FC = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<RewardDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_rewards: 0,
    total_value: 0,
    active_domains: 0,
    listed_for_sale: 0
  });

  useEffect(() => {
    if (user) {
      loadRewards();
    }
  }, [user]);

  const loadRewards = async () => {
    try {
      setLoading(true);

      // Load reward domains from view
      const { data, error } = await supabase
        .from('user_reward_domains')
        .select('*')
        .eq('user_id', user!.id)
        .order('received_at', { ascending: false });

      if (error) throw error;

      setRewards(data || []);

      // Calculate stats
      const totalValue = (data || []).reduce((sum, r) => sum + (r.reward_value_usd || 0), 0);
      const activeDomains = (data || []).filter(r => r.status === 'active').length;
      const forSale = (data || []).filter(r => r.for_sale).length;

      setStats({
        total_rewards: (data || []).length,
        total_value: totalValue,
        active_domains: activeDomains,
        listed_for_sale: forSale
      });

    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRewardTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      commission: 'Comissão',
      sale: 'Venda',
      bonus: 'Bônus',
      referral: 'Indicação'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      credit: 'emerald',
      quick_access: 'amber'
    };
    return colors[type] || 'blue';
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center text-white">Carregando...</div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Gift className="w-8 h-8 text-amber-400" />
              <h1 className="text-4xl font-bold text-white">
                Meus Ativos Digitais de Recompensa
              </h1>
            </div>
            <p className="text-xl text-gray-400">
              Domínios gerados automaticamente como pagamento de comissões e vendas
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 text-amber-400" />
                <div className="text-3xl font-bold text-white">{stats.total_rewards}</div>
              </div>
              <div className="text-sm text-gray-400">Total de Recompensas</div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-emerald-400" />
                <div className="text-3xl font-bold text-white">{formatPrice(stats.total_value)}</div>
              </div>
              <div className="text-sm text-gray-400">Valor Total</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-blue-400" />
                <div className="text-3xl font-bold text-white">{stats.active_domains}</div>
              </div>
              <div className="text-sm text-gray-400">Domínios Ativos</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 text-purple-400" />
                <div className="text-3xl font-bold text-white">{stats.listed_for_sale}</div>
              </div>
              <div className="text-sm text-gray-400">À Venda</div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Como Funciona o Sistema de Recompensas
                </h3>
                <div className="text-gray-300 space-y-2 text-sm">
                  <p>
                    <strong>Créditos são convertidos em ativos reais:</strong> Quando você ganha comissões ou créditos,
                    o sistema automaticamente gera um domínio digital exclusivo para você.
                  </p>
                  <p>
                    <strong>Propriedade vitalícia:</strong> Cada domínio é registrado em seu nome e pode ser
                    transferido, vendido no marketplace ou mantido como investimento.
                  </p>
                  <p>
                    <strong>Valor proporcional:</strong> O tipo de domínio gerado depende do valor da recompensa —
                    quanto maior o valor, mais raro é o domínio.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rewards List */}
          {rewards.length === 0 ? (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
              <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Nenhuma Recompensa Ainda
              </h3>
              <p className="text-gray-400">
                Suas recompensas em domínios aparecerão aqui quando você ganhar comissões
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rewards.map((reward) => {
                const color = getTypeColor(reward.domain_type);
                return (
                  <div
                    key={reward.id}
                    className={`bg-zinc-900 border border-${color}-500/30 rounded-xl p-6 hover:border-${color}-500/50 transition-colors`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`text-2xl font-bold text-${color}-400 font-mono`}>
                            {reward.full_domain}
                          </div>
                          {reward.for_sale && (
                            <span className="bg-purple-500/20 text-purple-400 text-xs font-semibold px-3 py-1 rounded-full">
                              À VENDA
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4" />
                            <span>{getRewardTypeLabel(reward.reward_type)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            <span className={`font-semibold text-${color}-400`}>
                              {formatPrice(reward.reward_value_usd)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <span className="capitalize">
                              {reward.domain_type === 'credit' ? 'Crédito Digital' : 'Acesso Rápido'}
                            </span>
                          </div>

                          <div>
                            Recebido: {new Date(reward.received_at).toLocaleDateString('pt-BR')}
                          </div>

                          {reward.commission_source && (
                            <div className="text-xs bg-zinc-800 px-2 py-1 rounded">
                              Fonte: {reward.commission_source}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`/${reward.domain_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Ver Domínio
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </PageLayout>
  );
};

export default RewardsPanel;
