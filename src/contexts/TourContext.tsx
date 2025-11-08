import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { TourStep } from '../components/GuidedTour';

interface TourProgress {
  tourType: 'purchase' | 'page_mastery';
  currentStep: number;
  totalSteps: number;
  completed: boolean;
  skipped: boolean;
}

interface TourContextType {
  // Estado
  activeTour: 'purchase' | 'page_mastery' | null;
  currentStep: number;
  isActive: boolean;
  progress: TourProgress | null;

  // Ações
  startTour: (tourType: 'purchase' | 'page_mastery') => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  resumeTour: () => void;
  getTourSteps: (tourType: 'purchase' | 'page_mastery') => TourStep[];
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeTour, setActiveTour] = useState<'purchase' | 'page_mastery' | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState<TourProgress | null>(null);

  // Carregar progresso do tour ao montar
  useEffect(() => {
    if (user) {
      loadTourProgress();
    }
  }, [user]);

  const loadTourProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_tour_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Verificar se há tour não completado
      const incompleteTour = data?.find(t => !t.completed && !t.skipped);
      if (incompleteTour) {
        setProgress({
          tourType: incompleteTour.tour_type,
          currentStep: incompleteTour.current_step,
          totalSteps: incompleteTour.total_steps,
          completed: incompleteTour.completed,
          skipped: incompleteTour.skipped
        });
      }
    } catch (error) {
      console.error('Error loading tour progress:', error);
    }
  };

  const saveTourProgress = async (
    tourType: 'purchase' | 'page_mastery',
    step: number,
    completed: boolean = false,
    skipped: boolean = false
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_tour_progress')
        .upsert({
          user_id: user.id,
          tour_type: tourType,
          current_step: step,
          total_steps: getTourSteps(tourType).length,
          completed,
          skipped,
          last_seen_at: new Date().toISOString(),
          completed_at: completed ? new Date().toISOString() : null
        }, {
          onConflict: 'user_id,tour_type'
        });

      if (error) {
        // Fallback gracioso: Se a tabela não existir, continuar sem persistir
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.warn('Tour progress table not available, continuing without persistence');
          return;
        }
        throw error;
      }

      await loadTourProgress();
    } catch (error) {
      console.warn('Tour progress not saved (continuing):', error);
    }
  };

  const startTour = (tourType: 'purchase' | 'page_mastery') => {
    console.log('🎯 Starting tour:', tourType);

    // Delay estratégico de 300ms para garantir que DOM está estável
    setTimeout(() => {
      setActiveTour(tourType);
      setCurrentStep(1);
      setIsActive(true);
      saveTourProgress(tourType, 1);

      console.log('✅ Tour activated with 300ms delay for DOM stability');
    }, 300);
  };

  const nextStep = () => {
    if (!activeTour) {
      console.warn('❌ nextStep called but no active tour');
      return;
    }

    const steps = getTourSteps(activeTour);
    const nextStepNum = Math.min(currentStep + 1, steps.length);

    console.log('🔄 TourContext.nextStep()', {
      currentStep,
      nextStepNum,
      totalSteps: steps.length,
      activeTour
    });

    setCurrentStep(nextStepNum);
    saveTourProgress(activeTour, nextStepNum);

    console.log('✅ Current step updated to:', nextStepNum);
  };

  const previousStep = () => {
    const prevStepNum = Math.max(currentStep - 1, 1);
    setCurrentStep(prevStepNum);

    if (activeTour) {
      saveTourProgress(activeTour, prevStepNum);
    }
  };

  const skipTour = () => {
    if (activeTour) {
      saveTourProgress(activeTour, currentStep, false, true);
    }

    setIsActive(false);
    setActiveTour(null);
    setCurrentStep(1);
  };

  const completeTour = () => {
    if (activeTour) {
      saveTourProgress(activeTour, currentStep, true, false);
    }

    setIsActive(false);
    setActiveTour(null);
    setCurrentStep(1);
  };

  const resumeTour = () => {
    if (progress && !progress.completed && !progress.skipped) {
      setActiveTour(progress.tourType);
      setCurrentStep(progress.currentStep);
      setIsActive(true);
    }
  };

  const getTourSteps = (tourType: 'purchase' | 'page_mastery'): TourStep[] => {
    if (tourType === 'purchase') {
      return [
        {
          id: 'home-search',
          target: '[data-tour="domain-search"]',
          title: 'Sua identidade digital premium',
          content: 'Comece aqui. Digite o nome desejado e descubra se está disponível. Seu domínio .com.rich é único e exclusivo.',
          position: 'top',
          highlight: true,
          action: () => {
            // Focar no campo de busca quando o step abrir
            setTimeout(() => {
              const input = document.getElementById('domain-search-input') as HTMLInputElement;
              if (input) {
                input.focus();
              }
            }, 300);
          }
        },
        {
          id: 'home-features',
          target: '[data-tour="features"]',
          title: 'Valor e identidade',
          content: 'Mais do que um domínio, .com.rich é a chave para um ecossistema exclusivo de oportunidades e reconhecimento global.',
          position: 'top',
          highlight: true
        },
        {
          id: 'home-benefits',
          target: '[data-tour="benefits"]',
          title: 'Diferenciais premium',
          content: 'Registro seguro SSL, verificação instantânea, reconhecimento global e ativação imediata. Tudo pensado para você.',
          position: 'top',
          highlight: true
        },
        {
          id: 'view-plans',
          target: '[data-tour="view-plans"]',
          title: 'Próximo passo',
          content: 'Pronto para começar? Clique aqui para explorar os planos e garantir sua identidade digital premium agora mesmo!',
          position: 'bottom',
          highlight: true
        }
      ];
    } else {
      return [
        {
          id: 'profile-overview',
          target: '[data-tour="profile-tabs"]',
          title: 'Seu hub de criação',
          content: 'Organize seu perfil em seções: Informações básicas, Visual, Links, Social, Analytics e muito mais.',
          position: 'bottom',
          highlight: true
        },
        {
          id: 'profile-basics',
          target: '[data-tour="profile-form"]',
          title: 'Informações essenciais',
          content: 'Adicione avatar, nome de exibição e biografia. Seja autêntico e memorável.',
          position: 'right',
          highlight: true
        },
        {
          id: 'background-editor',
          target: '[data-tour="background-tab"]',
          title: 'Personalize o visual',
          content: 'Escolha cores, gradientes ou imagens de fundo. Crie uma identidade visual única que representa você.',
          position: 'bottom',
          highlight: true
        },
        {
          id: 'links-manager',
          target: '[data-tour="links-section"]',
          title: 'Adicione seus links',
          content: 'Links para site, portfólio, produtos, redes sociais. Cada um personalizável com cores e ícones.',
          position: 'top',
          highlight: true
        },
        {
          id: 'visibility-control',
          target: '[data-tour="visibility-toggle"]',
          title: 'Controle de visibilidade',
          content: 'Mantenha privado enquanto edita ou torne público para o mundo ver. Você decide.',
          position: 'left',
          highlight: true
        },
        {
          id: 'preview-publish',
          target: '[data-tour="preview-button"]',
          title: 'Visualize antes de publicar',
          content: 'Teste em desktop, tablet e mobile. Veja exatamente como ficará antes de tornar público.',
          position: 'bottom',
          highlight: true
        },
        {
          id: 'analytics-dashboard',
          target: '[data-tour="analytics-tab"]',
          title: 'Acompanhe seu impacto',
          content: 'Dados em tempo real: visualizações de perfil, cliques em links e origem do tráfego.',
          position: 'bottom',
          highlight: true
        }
      ];
    }
  };

  return (
    <TourContext.Provider
      value={{
        activeTour,
        currentStep,
        isActive,
        progress,
        startTour,
        nextStep,
        previousStep,
        skipTour,
        completeTour,
        resumeTour,
        getTourSteps
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTourContext() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTourContext must be used within a TourProvider');
  }
  return context;
}
