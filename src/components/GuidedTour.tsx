import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

export interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'auto';
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

interface Position {
  top: number;
  left: number;
  width: number;
  height: number;
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
  const [highlightPosition, setHighlightPosition] = useState<Position>({ top: 0, left: 0, width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState<Element | null>(null);

  const step = steps[currentStep - 1];
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === steps.length;
  const progress = (currentStep / steps.length) * 100;

  useEffect(() => {
    if (!isActive || !step) {
      setIsVisible(false);
      setTargetElement(null);
      return;
    }

    const timer = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);

      // Focar no input se for o step de busca
      if (step.id === 'home-search') {
        setTimeout(() => {
          const input = document.getElementById('domain-search-input') as HTMLInputElement;
          if (input && !input.disabled) {
            input.focus();
          }
        }, 500);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isActive, step, currentStep]);

  useEffect(() => {
    if (!isActive) return;

    let rafId: number;
    let lastCalcTime = 0;

    // Throttled calculate para performance otimizada
    const throttledCalculate = () => {
      const now = Date.now();
      if (now - lastCalcTime >= 16) { // ~60fps
        lastCalcTime = now;
        calculatePosition();
      }
      rafId = requestAnimationFrame(throttledCalculate);
    };

    const handleResize = () => calculatePosition();
    const handleScroll = () => calculatePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    // Sync contínuo usando RAF para 60fps suave
    rafId = requestAnimationFrame(throttledCalculate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isActive, step]);

  const calculatePosition = () => {
    if (!step?.target) return;

    const element = document.querySelector(step.target);
    if (!element) {
      console.warn(`Tour target not found: ${step.target}`);
      return;
    }

    setTargetElement(element);

    // ESTRATÉGIA: Calcular bounding box combinado dos FILHOS (campo + botão)
    // ignorando padding/margin do wrapper pai
    const children = Array.from(element.children) as HTMLElement[];

    if (children.length === 0) {
      console.warn('No children found in tour target');
      return;
    }

    // Calcular bounding box que envolve TODOS os filhos
    let minTop = Infinity;
    let minLeft = Infinity;
    let maxBottom = -Infinity;
    let maxRight = -Infinity;

    children.forEach(child => {
      const childRect = child.getBoundingClientRect();
      minTop = Math.min(minTop, childRect.top);
      minLeft = Math.min(minLeft, childRect.left);
      maxBottom = Math.max(maxBottom, childRect.bottom);
      maxRight = Math.max(maxRight, childRect.right);
    });

    // Criar rect virtual com o bounding box combinado
    const combinedWidth = maxRight - minLeft;
    const combinedHeight = maxBottom - minTop;

    const scrollTop = window.scrollY;
    const scrollLeft = window.scrollX;

    // Padding super fino de 2px para borda respirar
    const padding = 2;

    // Posição ABSOLUTA no documento
    const absoluteTop = minTop + scrollTop;
    const absoluteLeft = minLeft + scrollLeft;

    // Log detalhado para debug
    console.log('📍 Spotlight BOUNDING BOX:', {
      target: step.target,
      childrenCount: children.length,
      boundingBox: {
        top: `${Math.round(minTop)}px`,
        left: `${Math.round(minLeft)}px`,
        width: `${Math.round(combinedWidth)}px`,
        height: `${Math.round(combinedHeight)}px`
      },
      spotlight: {
        top: `${Math.round(absoluteTop - padding)}px`,
        left: `${Math.round(absoluteLeft - padding)}px`,
        width: `${Math.round(combinedWidth + padding * 2)}px`,
        height: `${Math.round(combinedHeight + padding * 2)}px`
      },
      padding: `${padding}px`,
      scroll: { top: Math.round(scrollTop), left: Math.round(scrollLeft) }
    });

    setHighlightPosition({
      top: absoluteTop - padding,
      left: absoluteLeft - padding,
      width: combinedWidth + (padding * 2),
      height: combinedHeight + (padding * 2)
    });

    // Dimensões do tooltip
    const tooltipWidth = 380;
    const tooltipHeight = 240;
    const gap = 24;

    let top = 0;
    let left = 0;

    const position = step.position || 'auto';

    // Posicionamento automático inteligente usando o bounding box combinado
    if (position === 'auto') {
      const spaceAbove = minTop;
      const spaceBelow = window.innerHeight - maxBottom;
      const spaceLeft = minLeft;
      const spaceRight = window.innerWidth - maxRight;

      // Prioridade: abaixo > acima > direita > esquerda
      if (spaceBelow >= tooltipHeight + gap) {
        // Abaixo
        top = maxBottom + scrollTop + gap;
        left = minLeft + scrollLeft + (combinedWidth / 2) - (tooltipWidth / 2);
      } else if (spaceAbove >= tooltipHeight + gap) {
        // Acima
        top = minTop + scrollTop - tooltipHeight - gap;
        left = minLeft + scrollLeft + (combinedWidth / 2) - (tooltipWidth / 2);
      } else if (spaceRight >= tooltipWidth + gap) {
        // Direita
        top = minTop + scrollTop + (combinedHeight / 2) - (tooltipHeight / 2);
        left = maxRight + scrollLeft + gap;
      } else if (spaceLeft >= tooltipWidth + gap) {
        // Esquerda
        top = minTop + scrollTop + (combinedHeight / 2) - (tooltipHeight / 2);
        left = minLeft + scrollLeft - tooltipWidth - gap;
      } else {
        // Centro como fallback
        top = window.innerHeight / 2 - tooltipHeight / 2 + scrollTop;
        left = window.innerWidth / 2 - tooltipWidth / 2 + scrollLeft;
      }
    } else {
      // Posicionamento manual
      switch (position) {
        case 'top':
          top = minTop + scrollTop - tooltipHeight - gap;
          left = minLeft + scrollLeft + (combinedWidth / 2) - (tooltipWidth / 2);
          break;
        case 'bottom':
          top = maxBottom + scrollTop + gap;
          left = minLeft + scrollLeft + (combinedWidth / 2) - (tooltipWidth / 2);
          break;
        case 'left':
          top = minTop + scrollTop + (combinedHeight / 2) - (tooltipHeight / 2);
          left = minLeft + scrollLeft - tooltipWidth - gap;
          break;
        case 'right':
          top = minTop + scrollTop + (combinedHeight / 2) - (tooltipHeight / 2);
          left = maxRight + scrollLeft + gap;
          break;
        case 'center':
          top = window.innerHeight / 2 - tooltipHeight / 2 + scrollTop;
          left = window.innerWidth / 2 - tooltipWidth / 2 + scrollLeft;
          break;
      }
    }

    // Ajustar se sair da tela (horizontal)
    const viewportPadding = 16;
    if (left < viewportPadding) {
      left = viewportPadding;
    }
    if (left + tooltipWidth > window.innerWidth - viewportPadding) {
      left = window.innerWidth - tooltipWidth - viewportPadding;
    }

    // Ajustar se sair da tela (vertical)
    if (top < viewportPadding + scrollTop) {
      top = viewportPadding + scrollTop;
    }
    if (top + tooltipHeight > window.innerHeight + scrollTop - viewportPadding) {
      top = window.innerHeight + scrollTop - tooltipHeight - viewportPadding;
    }

    setTooltipPosition({ top, left });

    // Scroll suave para o elemento
    if (step.highlight) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
  };

  const handleNext = () => {
    console.log('🎯 GuidedTour handleNext clicked', {
      currentStep,
      isLastStep,
      stepId: step.id
    });

    if (step.action) {
      step.action();
    }

    if (isLastStep) {
      console.log('✅ Completing tour');
      onComplete();
    } else {
      console.log('➡️ Going to next step');
      onNext();
    }
  };

  if (!isActive || !step || !isVisible) return null;

  const tourContent = (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[99998]" style={{ pointerEvents: 'none' }}>
        {/* Overlay Premium com Spotlight */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={{ pointerEvents: 'auto' }}
        >
          {/* SVG Mask para criar o efeito spotlight */}
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: 'none' }}
          >
            <defs>
              <mask id="tour-spotlight-mask">
                {/* Fundo branco = visível */}
                <rect x="0" y="0" width="100%" height="100%" fill="white" />

                {/* Recorte com bordas arredondadas = transparente */}
                <motion.rect
                  key={`mask-${currentStep}`}
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                    x: highlightPosition.left,
                    y: highlightPosition.top,
                    width: highlightPosition.width,
                    height: highlightPosition.height,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    mass: 0.8,
                  }}
                  fill="black"
                  rx="12"
                  ry="12"
                />
              </mask>

              {/* Filtro de blur suave */}
              <filter id="tour-blur-filter">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
              </filter>
            </defs>

            {/* Overlay escurecido com blur */}
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(15, 23, 42, 0.75)"
              mask="url(#tour-spotlight-mask)"
              filter="url(#tour-blur-filter)"
              style={{ pointerEvents: 'auto' }}
              onClick={onSkip}
            />
          </svg>

          {/* Borda animada ao redor do elemento destacado */}
          {step.highlight && (
            <motion.div
              key={`border-${currentStep}`}
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                x: highlightPosition.left,
                y: highlightPosition.top,
                width: highlightPosition.width,
                height: highlightPosition.height,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                mass: 0.8,
              }}
              className="absolute pointer-events-none"
            >
              {/* Borda externa com gradiente dourado premium - CALIBRADA */}
              <div className="absolute inset-0 rounded-xl">
                {/* Glow externo sutil */}
                <div className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-amber-400/40 via-yellow-300/40 to-amber-400/40 blur-sm" />

                {/* Borda sólida principal 2px para precisão milimétrica */}
                <div className="absolute inset-0 rounded-xl border-[2px] border-amber-400/90 shadow-[0_0_30px_rgba(251,191,36,0.35)]" />
              </div>

              {/* Animação de pulso sutil */}
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-amber-300/50"
                animate={{
                  scale: [1, 1.015, 1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          )}
        </motion.div>

        {/* Tooltip Premium do Tour */}
        <motion.div
          key={`step-${currentStep}`}
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -10 }}
          transition={{
            type: 'spring',
            damping: 28,
            stiffness: 400,
            duration: 0.4
          }}
          className="absolute w-[380px]"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            pointerEvents: 'auto',
            zIndex: 100000,
          }}
        >
          <div className="relative">
            {/* Glow effect premium */}
            <div className="absolute -inset-4 bg-gradient-to-br from-amber-500/20 via-transparent to-yellow-500/20 rounded-2xl blur-2xl" />

            {/* Card principal */}
            <div className="relative bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200/80 overflow-hidden backdrop-blur-xl">
              {/* Header Premium */}
              <div className="relative px-6 py-5 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
                {/* Decoração de fundo */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/40 to-transparent rounded-full blur-3xl" />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Ícone com gradiente premium */}
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl blur-md opacity-40" />
                      <div className="relative bg-gradient-to-br from-amber-500 to-yellow-600 p-2.5 rounded-xl shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-base leading-tight mb-1">
                        {step.title}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium">
                        {tourType === 'purchase' ? '✨ Jornada de Compra Premium' : '🎯 Domínio Completo'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onSkip}
                    className="flex-shrink-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                    aria-label="Pular tour"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="px-6 py-5">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {step.content}
                </p>
              </div>

              {/* Footer com controles */}
              <div className="px-6 py-5 bg-gradient-to-br from-slate-50 via-white to-slate-50 border-t border-slate-100">
                {/* Progress Bar Premium */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-semibold text-slate-700">
                      Passo {currentStep} de {steps.length}
                    </span>
                    <span className="text-xs font-medium text-amber-600">
                      {Math.round(progress)}% completo
                    </span>
                  </div>

                  {/* Barra de progresso com gradiente */}
                  <div className="relative w-full h-2 bg-slate-200/80 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 rounded-full shadow-lg"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      {/* Shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Botões de navegação */}
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={onPrevious}
                    disabled={isFirstStep}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
                      transition-all duration-200
                      ${isFirstStep
                        ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                        : 'text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-md active:scale-95'
                      }
                    `}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <span>{isLastStep ? 'Concluir' : 'Próximo'}</span>
                    {isLastStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Elemento target fica interativo */}
        {targetElement && (
          <div
            className="absolute pointer-events-auto"
            style={{
              top: highlightPosition.top,
              left: highlightPosition.left,
              width: highlightPosition.width,
              height: highlightPosition.height,
              zIndex: 99999,
            }}
          />
        )}
      </div>
    </AnimatePresence>
  );

  return createPortal(tourContent, document.body);
}
