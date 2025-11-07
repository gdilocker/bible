import { useEffect } from 'react';
import { useTourContext } from '../contexts/TourContext';
import { useAuth } from '../contexts/AuthContext';

interface UseTourOptions {
  tourType: 'purchase' | 'page_mastery';
  autoStart?: boolean;
  startCondition?: () => boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

export function useTour(options: UseTourOptions) {
  const { user } = useAuth();
  const {
    activeTour,
    currentStep,
    isActive,
    progress,
    startTour,
    nextStep,
    previousStep,
    skipTour,
    completeTour,
    getTourSteps
  } = useTourContext();

  const {
    tourType,
    autoStart = false,
    startCondition,
    onComplete,
    onSkip
  } = options;

  useEffect(() => {
    if (!user) return;

    // Se autoStart está ativo e não há tour em andamento
    if (autoStart && !isActive && !progress?.completed) {
      // Verificar condição de início se fornecida
      if (startCondition && !startCondition()) {
        return;
      }

      // Iniciar tour automaticamente após um pequeno delay
      const timer = setTimeout(() => {
        startTour(tourType);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, autoStart, isActive, progress, tourType]);

  const handleComplete = () => {
    completeTour();
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    skipTour();
    if (onSkip) {
      onSkip();
    }
  };

  const isTourActive = isActive && activeTour === tourType;
  const steps = getTourSteps(tourType);

  return {
    // Estado
    isActive: isTourActive,
    currentStep,
    totalSteps: steps.length,
    steps,
    progress: isTourActive ? (currentStep / steps.length) * 100 : 0,

    // Ações
    start: () => startTour(tourType),
    next: nextStep,
    previous: previousStep,
    skip: handleSkip,
    complete: handleComplete,

    // Helpers
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === steps.length,
    canGoBack: currentStep > 1,
    canGoForward: currentStep < steps.length
  };
}

// Hook para detectar se é primeira visita do usuário
export function useIsFirstVisit() {
  const { user } = useAuth();
  const { progress } = useTourContext();

  if (!user) return false;

  // É primeira visita se não há nenhum tour completado
  return !progress || (!progress.completed && progress.currentStep === 1);
}

// Hook para verificar se deve mostrar tour de compra
export function useShouldShowPurchaseTour() {
  const { user } = useAuth();
  const { progress } = useTourContext();
  const isFirstVisit = useIsFirstVisit();

  // Mostrar tour de compra se:
  // 1. Usuário está logado
  // 2. É primeira visita OU tour não foi completado/pulado
  // 3. Não tem domínio registrado ainda
  return user && (
    isFirstVisit ||
    (!progress?.completed && !progress?.skipped)
  );
}

// Hook para verificar se deve mostrar tour de página
export function useShouldShowPageMasteryTour(hasPublishedProfile: boolean) {
  const { user } = useAuth();
  const { progress } = useTourContext();

  // Mostrar tour de página se:
  // 1. Usuário está logado
  // 2. Tour de compra foi completado
  // 3. Ainda não completou o tour de página
  // 4. Tem perfil mas ainda não publicou
  return user &&
    progress?.tourType === 'purchase' &&
    progress?.completed &&
    !hasPublishedProfile;
}
