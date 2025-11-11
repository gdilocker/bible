import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Clock, Lock } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  const navigate = useNavigate();

  const handleNavigation = (to: string) => {
    navigate(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0B0B0B] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-12 mb-12 md:grid-cols-5">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <Logo size={56} />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              A Global Digital Identity LTD é a detentora da infraestrutura internacional de .pix.global. Não é banco, instituição de pagamento ou custodiante. Todas as licenças são registradas on-chain e vinculadas a domínios DNS reais.
            </p>
          </div>

          {/* Navegação */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4 tracking-wide">Navegação</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleNavigation('/')}
                  className="text-gray-400 hover:text-[#FFC107] transition-colors text-sm"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/registrar')}
                  className="text-gray-400 hover:text-[#FFC107] transition-colors text-sm"
                >
                  Registrar
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/precos')}
                  className="text-gray-400 hover:text-[#FFC107] transition-colors text-sm"
                >
                  Preços
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/club')}
                  className="text-gray-400 hover:text-[#FFC107] transition-colors text-sm"
                >
                  Sobre
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/entrar')}
                  className="text-gray-400 hover:text-[#FFC107] transition-colors text-sm"
                >
                  Entrar
                </button>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4 tracking-wide">Suporte</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleNavigation('/ajuda')}
                  className="text-gray-400 hover:text-[#FFC107] transition-colors text-sm"
                >
                  Ajuda
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/contato')}
                  className="text-gray-400 hover:text-[#FFC107] transition-colors text-sm"
                >
                  Contato
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4 tracking-wide">Legal</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleNavigation('/termos')}
                  className="text-gray-400 hover:text-[#FFC107] transition-colors text-sm"
                >
                  Termos
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/privacidade')}
                  className="text-gray-400 hover:text-[#FFC107] transition-colors text-sm"
                >
                  Privacidade
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8 space-y-8">
          {/* Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Pagamento Seguro</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Suporte 24/7</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#FFC107]/20 to-[#FF9800]/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#FFC107]" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">SSL Certificado</p>
              </div>
            </div>
          </div>

          {/* Legal Notice - Universal Footer */}
          <div className="bg-gradient-to-br from-amber-500/5 to-blue-500/5 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20">
            <div className="space-y-3">
              <p className="text-sm text-gray-300 leading-relaxed">
                Pix.Global é operada pela <span className="text-white font-semibold">Global Digital Identity LTD</span> (Company Nº 15830191 — registrada em Inglaterra e País de Gales).
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">
                A plataforma atua em conformidade com as normas internacionais de ativos digitais não financeiros. <span className="text-amber-400 font-semibold">Não somos instituição financeira, banco ou corretora.</span>
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">
                Pagamentos são processados de forma independente pelos gateways oficiais escolhidos pelo usuário (ex: PayPal, Stripe, Wise).
              </p>
              <p className="text-sm text-amber-400 leading-relaxed font-medium">
                Cada domínio .pix.global é um ativo digital exclusivo, registrado e auditado globalmente.
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div className="text-center md:text-left">
              <p>© 2025 Global Digital Identity LTD. All rights reserved.</p>
              <p className="text-xs mt-1">Company № 16339013 • Registered in England and Wales</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
