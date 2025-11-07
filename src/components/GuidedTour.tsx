import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

export interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;
  highlight?: boolean;
}

interface GuidedTourProps {
  steps: TourStep[];
  currentStep: number;
  isActive: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
  tourType: 'purchase' | 'page_mastery';
}

export default function GuidedTour({
  steps,
  currentStep,
  isActive,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
  tourType
}: GuidedTourProps) {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const step = steps[currentStep - 1];
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === steps.length;
  const progress = (currentStep / steps.length) * 100;

  useEffect(() => {
    if (!isActive || !step) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [isActive, step, currentStep]);

  useEffect(() => {
    if (!isActive) return;

    const handleResize = () => calculatePosition();
    const handleScroll = () => calculatePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isActive, step]);

  const calculatePosition = () => {
    if (!step?.target) return;

    const element = document.querySelector(step.target);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    setHighlightPosition({
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
      width: rect.width,
      height: rect.height
    });

    const tooltipWidth = 360;
    const tooltipHeight = 200;
    const padding = 20;

    let top = 0;
    let left = 0;

    const position = step.position || 'bottom';

    switch (position) {
      case 'top':
        top = rect.top + scrollTop - tooltipHeight - padding;
        left = rect.left + scrollLeft + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        top = rect.top + scrollTop + rect.height + padding;
        left = rect.left + scrollLeft + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = rect.top + scrollTop + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.left + scrollLeft - tooltipWidth - padding;
        break;
      case 'right':
        top = rect.top + scrollTop + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.left + scrollLeft + rect.width + padding;
        break;
      case 'center':
        top = window.innerHeight / 2 - tooltipHeight / 2 + scrollTop;
        left = window.innerWidth / 2 - tooltipWidth / 2 + scrollLeft;
        break;
    }

    // Ajustar se sair da tela
    if (left < 20) left = 20;
    if (left + tooltipWidth > window.innerWidth - 20) {
      left = window.innerWidth - tooltipWidth - 20;
    }
    if (top < 20 + scrollTop) top = 20 + scrollTop;

    setTooltipPosition({ top, left });

    // Scroll suave para o elemento se necessário
    if (step.highlight) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      onNext();
    }
  };

  if (!isActive || !step || !isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]"
          onClick={onSkip}
        />
      </AnimatePresence>

      {/* Highlight do elemento */}
      {step.highlight && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: highlightPosition.top - 8,
            left: highlightPosition.left - 8,
            width: highlightPosition.width + 16,
            height: highlightPosition.height + 16,
          }}
        >
          <div className="w-full h-full rounded-lg border-2 border-slate-900 shadow-xl bg-white/10">
            <div className="absolute inset-0 rounded-lg animate-pulse bg-slate-900/5" />
          </div>
        </motion.div>
      )}

      {/* Tooltip do Tour */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed z-[10000] w-[360px]"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 p-1.5 rounded-lg">
                <Sparkles className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {tourType === 'purchase' ? 'Jornada de Compra' : 'Dominar Sua Página'}
                </p>
              </div>
            </div>
            <button
              onClick={onSkip}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-all"
              aria-label="Pular tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="px-5 py-4">
            <p className="text-sm text-slate-700 leading-relaxed">
              {step.content}
            </p>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600">
                  Passo {currentStep} de {steps.length}
                </span>
                <span className="text-xs text-slate-500">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-slate-900 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {!isFirstStep && (
                  <button
                    onClick={onPrevious}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all border border-slate-200"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Voltar
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onSkip}
                  className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg transition-all"
                >
                  Pular
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all shadow-sm"
                >
                  {isLastStep ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Concluir
                    </>
                  ) : (
                    <>
                      Próximo
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de posição (seta) */}
        {step.position === 'bottom' && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
            <div className="w-4 h-4 bg-white border-l border-t border-slate-200 rotate-45" />
          </div>
        )}
        {step.position === 'top' && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <div className="w-4 h-4 bg-slate-50 border-r border-b border-slate-100 rotate-45" />
          </div>
        )}
      </motion.div>
    </>
  );
}
