import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import Logo from './Logo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Se já está instalado, não mostrar
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return; // Não fazer nada se não houver prompt nativo

    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Erro na instalação:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  // Não exibir em iOS ou se não houver prompt disponível
  if (!showInstallPrompt || /iPhone|iPad|iPod/.test(navigator.userAgent)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[9999]">
      <div className="bg-gradient-to-br from-black via-gray-900 to-black border border-[#D4AF37] rounded-2xl shadow-[0_8px_32px_rgba(212,175,55,0.25)] backdrop-blur-sm p-6 relative overflow-hidden">
        {/* Efeito de brilho no fundo */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-transparent pointer-events-none"></div>

        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-500 hover:text-[#D4AF37] transition-all duration-200 z-10 p-1 hover:bg-white/5 rounded-lg"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 relative z-10">
          <div className="flex-shrink-0 bg-black p-3 rounded-2xl shadow-lg border-2 border-[#D4AF37] flex items-center justify-center">
            <Logo size={56} />
          </div>

          <div className="flex-1 pr-6">
            <h3 className="text-xl font-bold text-[#D4AF37] mb-1 tracking-tight">
              Instalar The Rich Club
            </h3>
            <p className="text-sm text-gray-400 mb-5 leading-relaxed">
              Instale nosso app para acesso rápido e experiência premium
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleInstallClick}
                className="w-full bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] bg-[length:200%_100%] text-black font-bold py-3.5 px-6 rounded-xl hover:bg-[position:100%_0] transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg hover:shadow-[0_4px_20px_rgba(212,175,55,0.4)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download size={18} className="animate-bounce" />
                <span>Instalar App</span>
              </button>

              <button
                onClick={handleDismiss}
                className="w-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-white/10 hover:border-white/20"
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
