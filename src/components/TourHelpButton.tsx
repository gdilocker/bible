import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, RotateCcw, Lightbulb, MessageCircle, X, Sparkles, Zap, Target, Crown } from 'lucide-react';
import { useTourContext } from '../contexts/TourContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function TourHelpButton() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showQuickTips, setShowQuickTips] = useState(false);
  const { startTour, progress } = useTourContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Prevenir scroll quando modal está aberto
  useEffect(() => {
    if (showQuickTips) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showQuickTips]);

  // Fechar modal com tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showQuickTips) {
          setShowQuickTips(false);
        } else if (isMenuOpen) {
          setIsMenuOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showQuickTips, isMenuOpen]);

  // Determinar qual tour mostrar baseado na página atual
  const getCurrentTourType = (): 'purchase' | 'page_mastery' => {
    const path = location.pathname;

    // Tour de Página (page_mastery) - páginas de edição/gerenciamento
    if (
      path.includes('/panel/profile') ||
      path.includes('/panel/domains') ||
      path.includes('/panel/loja') ||
      path.includes('/minha-pagina')
    ) {
      return 'page_mastery';
    }

    // Tour de Compra (purchase) - páginas públicas e de venda
    return 'purchase';
  };

  const handleRestartTour = () => {
    const tourType = getCurrentTourType();
    setIsMenuOpen(false);

    // Se for tour de compra e não estiver na Home, navegar primeiro
    if (tourType === 'purchase' && location.pathname !== '/') {
      navigate('/');
      // Delay maior para aguardar navegação + renderização completa
      setTimeout(() => {
        startTour(tourType);
      }, 800);
    } else {
      // Delay para animação de fechamento do menu
      setTimeout(() => {
        startTour(tourType);
      }, 300);
    }
  };

  const handleQuickTips = () => {
    setIsMenuOpen(false);
    setShowQuickTips(true);
  };

  // Dicas contextuais baseadas na página
  const getContextualTips = () => {
    const tourType = getCurrentTourType();

    if (tourType === 'purchase') {
      return [
        {
          icon: Sparkles,
          color: 'from-amber-500 to-amber-600',
          title: 'Teste Grátis Prime',
          tip: '14 dias de acesso completo sem compromisso. Cancele quando quiser.'
        },
        {
          icon: Crown,
          color: 'from-slate-600 to-teal-600',
          title: 'Plano Elite Recomendado',
          tip: '50% de comissão em afiliados + acesso a eventos exclusivos e networking premium.'
        },
        {
          icon: Target,
          color: 'from-blue-500 to-blue-600',
          title: 'Domínio Exclusivo',
          tip: 'Seu nome.com.rich é único e exclusivo. Ninguém mais pode registrar o mesmo.'
        },
        {
          icon: Zap,
          color: 'from-emerald-500 to-emerald-600',
          title: 'Ativação Instantânea',
          tip: 'Seu domínio e página ficam ativos imediatamente após o pagamento.'
        }
      ];
    } else {
      return [
        {
          icon: Sparkles,
          color: 'from-purple-500 to-purple-600',
          title: 'Templates Prontos',
          tip: 'Use templates profissionais pré-configurados para começar rapidamente.'
        },
        {
          icon: Target,
          color: 'from-blue-500 to-blue-600',
          title: 'Preview Responsivo',
          tip: 'Teste em desktop, tablet e mobile antes de publicar. Sempre perfeito!'
        },
        {
          icon: Zap,
          color: 'from-amber-500 to-amber-600',
          title: 'Links Ilimitados',
          tip: 'Adicione quantos links quiser com cores, ícones e animações personalizadas.'
        },
        {
          icon: Crown,
          color: 'from-slate-600 to-teal-600',
          title: 'Analytics em Tempo Real',
          tip: 'Veja visualizações e cliques ao vivo. Saiba exatamente o que funciona.'
        }
      ];
    }
  };

  const handleContact = () => {
    setIsMenuOpen(false);
    navigate('/contact');
  };

  const tourType = getCurrentTourType();
  const tourName = tourType === 'purchase' ? 'Jornada de Compra' : 'Dominar Sua Página';

  return (
    <div className="fixed bottom-6 right-6 z-[9990] flex flex-col items-end gap-3">
      {/* Menu Flutuante */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl overflow-hidden w-72"
          >
            {/* Header do Menu */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-slate-100 p-1.5 rounded-lg">
                  <Compass className="w-4 h-4 text-slate-700" />
                </div>
                <span className="font-semibold text-sm text-slate-900">Central de Ajuda</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg transition-all"
                aria-label="Fechar menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Opções do Menu */}
            <div className="p-2">
              {/* Ver Tour Novamente */}
              <button
                onClick={handleRestartTour}
                className="w-full flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-all group"
              >
                <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-2 rounded-lg shadow-sm group-hover:shadow-md transition-all flex-shrink-0">
                  <RotateCcw className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-sm text-slate-900 mb-0.5">
                    Ver tour guiado novamente
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {tourName} • {progress?.completed ? 'Completado' : 'Revisar passos'}
                  </p>
                </div>
              </button>

              {/* Dicas Rápidas */}
              <button
                onClick={handleQuickTips}
                className="w-full flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-all group"
              >
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg shadow-sm group-hover:shadow-md transition-all flex-shrink-0">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-sm text-slate-900 mb-0.5">
                    Dicas rápidas
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sugestões contextuais e atalhos
                  </p>
                </div>
              </button>

              {/* Falar com Suporte */}
              <button
                onClick={handleContact}
                className="w-full flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-all group"
              >
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg shadow-sm group-hover:shadow-md transition-all flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-sm text-slate-900 mb-0.5">
                    Falar com suporte
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Estamos aqui para ajudar
                  </p>
                </div>
              </button>
            </div>

            {/* Footer com indicação do tour atual */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
              <p className="text-[10px] text-slate-500 text-center">
                Tour ativo: <span className="font-semibold text-slate-700">{tourName}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão Principal */}
      <motion.button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all ${
          isMenuOpen
            ? 'bg-slate-900 scale-95'
            : 'bg-white/90 backdrop-blur-md hover:bg-white hover:shadow-xl hover:scale-105'
        }`}
        whileHover={{ rotate: isMenuOpen ? 0 : 15 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Central de ajuda"
      >
        {/* Anel de destaque sutil */}
        <div className={`absolute inset-0 rounded-full border-2 transition-all ${
          isMenuOpen
            ? 'border-slate-700'
            : 'border-slate-200 group-hover:border-slate-300'
        }`} />

        {/* Ícone */}
        <Compass className={`w-6 h-6 transition-all ${
          isMenuOpen
            ? 'text-white rotate-0'
            : 'text-slate-700 group-hover:text-slate-900 group-hover:rotate-12'
        }`} />

        {/* Badge de notificação (opcional - pode ser usado para indicar novidades) */}
        {!progress?.completed && !isMenuOpen && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
        )}
      </motion.button>

      {/* Tooltip de ajuda (aparece ao hover se menu fechado) */}
      {!isMenuOpen && (
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
          <div className="bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            Central de Ajuda
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-slate-900" />
          </div>
        </div>
      )}

      {/* Modal de Dicas Rápidas - Renderizado via Portal */}
      {showQuickTips && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[99998] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowQuickTips(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-2xl"
            >
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 sm:p-2.5 rounded-xl shadow-md">
                        <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Dicas Rápidas</h2>
                        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                          {getCurrentTourType() === 'purchase'
                            ? 'Maximize sua experiência'
                            : 'Otimize sua página'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowQuickTips(false)}
                      className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 sm:p-2 rounded-lg transition-all flex-shrink-0"
                      aria-label="Fechar dicas"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Dicas */}
                <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-h-[60vh] overflow-y-auto">
                  {getContextualTips().map((tip, index) => {
                    const Icon = tip.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className="group bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-3 sm:p-4 hover:shadow-lg hover:border-slate-300 transition-all duration-300"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`bg-gradient-to-br ${tip.color} p-2 sm:p-2.5 rounded-lg shadow-sm group-hover:shadow-md transition-all flex-shrink-0`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 mb-1 sm:mb-1.5 text-sm">
                              {tip.title}
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {tip.tip}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="hidden sm:inline">Precisa de mais ajuda?</span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setShowQuickTips(false);
                        const tourType = getCurrentTourType();

                        // Se for tour de compra e não estiver na Home, navegar primeiro
                        if (tourType === 'purchase' && location.pathname !== '/') {
                          navigate('/');
                          setTimeout(() => startTour(tourType), 800);
                        } else {
                          setTimeout(() => startTour(tourType), 300);
                        }
                      }}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg transition-all border border-slate-200"
                    >
                      Ver Tour
                    </button>
                    <button
                      onClick={() => {
                        setShowQuickTips(false);
                        setTimeout(() => navigate('/contact'), 300);
                      }}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all shadow-sm"
                    >
                      Suporte
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
