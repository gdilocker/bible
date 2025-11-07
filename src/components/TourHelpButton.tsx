import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, RotateCcw, Lightbulb, MessageCircle, X } from 'lucide-react';
import { useTourContext } from '../contexts/TourContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function TourHelpButton() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { startTour, progress } = useTourContext();
  const navigate = useNavigate();
  const location = useLocation();

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

    // Pequeno delay para animação de fechamento do menu
    setTimeout(() => {
      startTour(tourType);
    }, 300);
  };

  const handleQuickTips = () => {
    setIsMenuOpen(false);
    // TODO: Implementar sistema de dicas rápidas no futuro
    alert('Dicas rápidas em breve! Por enquanto, explore o tour guiado completo.');
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
    </div>
  );
}
