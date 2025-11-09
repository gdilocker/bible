import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    if ((window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
      console.log('PWA: Install prompt disponível');
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      console.log('PWA: App instalado!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const timer = setTimeout(() => {
      if (!isInstalled && !deferredPrompt && !localStorage.getItem('pwa_dismissed')) {
        setShowInstallPrompt(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [deferredPrompt, isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      showManualInstallInstructions();
      return;
    }

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallPrompt(false);
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Erro na instalação:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const showManualInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    let instructions = '';

    if (isIOS) {
      instructions = 'Para instalar no iPhone/iPad:\n\n1. Toque no ícone de compartilhar (□↗)\n2. Role para baixo e toque em "Adicionar à Tela de Início"\n3. Toque em "Adicionar"';
    } else if (isAndroid) {
      instructions = 'Para instalar no Android:\n\n1. Toque no menu (⋮) do navegador\n2. Toque em "Adicionar à tela inicial"\n3. Confirme';
    } else {
      instructions = 'Para instalar no computador:\n\n1. Clique no ícone na barra de endereços\n2. Ou menu > "Instalar aplicativo"\n3. Confirme a instalação';
    }

    alert(instructions);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa_dismissed', Date.now().toString());
  };

  if (isInstalled) {
    return null;
  }

  const dismissedTime = localStorage.getItem('pwa_dismissed');
  if (dismissedTime) {
    const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissed < 7) {
      return null;
    }
  }

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[9999] animate-fade-in">
      <div className="bg-black border-2 border-[#D4AF37] rounded-xl shadow-2xl p-5">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <img
            src="/icons/icon-192x192.png"
            alt="The Rich Club"
            className="w-16 h-16 rounded-xl"
          />

          <div className="flex-1 pr-8">
            <h3 className="text-lg font-bold text-[#D4AF37] mb-1">
              Instalar The Rich Club
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Instale nosso app para acesso rápido e experiência completa
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="flex-1 bg-[#D4AF37] text-black font-semibold py-2.5 px-4 rounded-lg hover:bg-[#FFD700] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Download size={16} />
                {isInstalling ? 'Instalando...' : 'Instalar'}
              </button>

              <button
                onClick={handleDismiss}
                className="flex-1 bg-gray-800 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-700 transition-all"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
