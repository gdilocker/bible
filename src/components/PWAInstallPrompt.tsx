import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import Logo from './Logo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    if ((window.navigator as any).standalone === true) {
      return;
    }

    let testTimer: NodeJS.Timeout;

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
      console.log('PWA: beforeinstallprompt capturado');
      if (testTimer) clearTimeout(testTimer);
    };

    const onAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
      console.log('PWA: App instalado com sucesso');
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    // Mostra banner para iOS após delay (não tem beforeinstallprompt)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !localStorage.getItem('pwa_dismissed')) {
      setTimeout(() => {
        setVisible(true);
      }, 5000);
    } else {
      // MODO TESTE: Mostra banner após 3s se não houver evento (para desenvolvimento/teste)
      testTimer = setTimeout(() => {
        console.log('PWA: Modo teste - mostrando banner (sem beforeinstallprompt)');
        setVisible(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
      if (testTimer) clearTimeout(testTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('PWA: User choice:', outcome);

      if (outcome === 'accepted') {
        setVisible(false);
      }
    } catch (error) {
      console.error('PWA: Erro ao instalar:', error);
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('pwa_dismissed', Date.now().toString());
  };

  // Não mostra se foi dismissed recentemente
  const dismissedTime = localStorage.getItem('pwa_dismissed');
  if (dismissedTime) {
    const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissed < 7) {
      return null;
    }
  }

  if (!visible) {
    return null;
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4">
      <div className="mx-auto max-w-md rounded-2xl border border-[#D4AF37] bg-black/90 backdrop-blur-sm p-4 text-white shadow-2xl">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors p-1"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <Logo size={48} />
          <div className="text-lg font-semibold text-[#D4AF37]">Instalar The Rich Club</div>
        </div>

        {!isIOS ? (
          <>
            <button
              onClick={handleInstall}
              disabled={!deferredPrompt || installing}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] px-4 py-3 font-bold text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Download size={18} className={installing ? 'animate-spin' : ''} />
              {installing ? 'Instalando...' : 'Instalar App'}
            </button>
            {!deferredPrompt && (
              <div className="mt-3 text-xs text-gray-300 text-center leading-relaxed px-2">
                <p className="mb-2">O instalador nativo estará disponível quando você acessar via <span className="text-[#D4AF37] font-semibold">HTTPS em produção</span>.</p>
                <p className="text-gray-400">
                  Por enquanto, use o menu <span className="text-[#D4AF37]">⋮</span> do Chrome → <span className="text-[#D4AF37]">"Adicionar à tela inicial"</span>
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="mt-3 text-sm text-gray-200 leading-relaxed">
            No iPhone: Toque em <span className="text-[#D4AF37] font-semibold">□↗</span> (Compartilhar) e depois em <span className="text-[#D4AF37] font-semibold">"Adicionar à Tela de Início"</span>.
          </div>
        )}

        <button
          onClick={handleDismiss}
          className="mt-2 w-full rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-sm transition-colors"
        >
          Agora não
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
