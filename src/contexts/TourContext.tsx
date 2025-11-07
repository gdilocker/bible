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

      if (error) throw error;

      await loadTourProgress();
    } catch (error) {
      console.error('Error saving tour progress:', error);
    }
  };

  const startTour = (tourType: 'purchase' | 'page_mastery') => {
    setActiveTour(tourType);
    setCurrentStep(1);
    setIsActive(true);
    saveTourProgress(tourType, 1);
  };

  const nextStep = () => {
    if (!activeTour) return;

    const steps = getTourSteps(activeTour);
    const nextStepNum = Math.min(currentStep + 1, steps.length);

    setCurrentStep(nextStepNum);
    saveTourProgress(activeTour, nextStepNum);
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
          id: 'view-plans',
          target: '[data-tour="view-plans"]',
          title: 'Explore os planos',
          content: 'Cada plano oferece benefícios exclusivos. Do Prime ao Supreme, escolha o nível de presença digital ideal para você.',
          position: 'bottom',
          highlight: true
        },
        {
          id: 'plans-comparison',
          target: '[data-tour="plans-grid"]',
          title: 'Compare recursos',
          content: 'Prime: 25% comissão. Elite: 50% comissão + eventos exclusivos. Supreme: infraestrutura dedicada e suporte white-glove.',
          position: 'top',
          highlight: false
        },
        {
          id: 'select-plan',
          target: '[data-tour="plan-cta"]',
          title: 'Escolha seu plano',
          content: 'Selecione o plano desejado e avance para garantir seu domínio exclusivo.',
          position: 'top',
          highlight: true
        },
        {
          id: 'secure-checkout',
          target: '[data-tour="checkout-form"]',
          title: 'Pagamento seguro',
          content: 'Finalize com proteção total. Seus dados são criptografados e sua compra é 100% segura.',
          position: 'right',
          highlight: false
        },
        {
          id: 'welcome-dashboard',
          target: '[data-tour="dashboard-welcome"]',
          title: 'Bem-vindo ao seu painel',
          content: 'Compra concluída! Agora você pode criar e gerenciar sua página premium. Vamos começar?',
          position: 'center',
          highlight: false
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
