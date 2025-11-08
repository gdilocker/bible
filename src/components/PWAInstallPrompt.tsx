import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detectar se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone
      || document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Verificar se já foi fechado
    const promptDismissed = localStorage.getItem('pwa-prompt-dismissed');
    const dismissedTime = promptDismissed ? parseInt(promptDismissed) : 0;
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

    if (dismissedTime && Date.now() - dismissedTime < sevenDaysInMs) {
      return;
    }

    // Listener para Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Mostrar após 3 segundos
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Para iOS, mostrar após 5 segundos se não instalado
    if (iOS) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt && !isIOS) return;

    if (deferredPrompt) {
      // Android/Chrome
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowPrompt(false);
      }

      setDeferredPrompt(null);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Prompt Card */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-[400px] z-[9999] animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-2xl border border-gray-800/50 overflow-hidden">
          {/* Header com gradiente dourado */}
          <div className="bg-gradient-to-r from-yellow-600/20 via-yellow-500/20 to-yellow-600/20 p-4 border-b border-yellow-600/20">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-600 to-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-600/30">
                  <Smartphone className="w-7 h-7 text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">The Rich Club</h3>
                  <p className="text-xs text-gray-400">Instalar aplicativo</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors p-1"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            {isIOS ? (
              // Instruções para iOS
              <div className="space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  Para instalar o app <strong className="text-yellow-500">The Rich Club</strong> no seu iPhone:
                </p>
                <ol className="space-y-3 text-sm text-gray-400">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-600/20 text-yellow-500 flex items-center justify-center text-xs font-bold">1</span>
                    <span>Toque no botão <strong>Compartilhar</strong> (ícone ⎋) abaixo</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-600/20 text-yellow-500 flex items-center justify-center text-xs font-bold">2</span>
                    <span>Role e selecione <strong>"Adicionar à Tela de Início"</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-600/20 text-yellow-500 flex items-center justify-center text-xs font-bold">3</span>
                    <span>Confirme tocando em <strong>"Adicionar"</strong></span>
                  </li>
                </ol>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    Agora não
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-400 transition-all shadow-lg shadow-yellow-600/30 text-sm font-bold"
                  >
                    Entendi
                  </button>
                </div>
              </div>
            ) : (
              // Prompt para Android/Chrome
              <div className="space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  Instale <strong className="text-yellow-500">The Rich Club</strong> para acesso rápido e experiência completa de aplicativo.
                </p>

                <div className="grid grid-cols-3 gap-2 py-2">
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto rounded-full bg-yellow-600/10 flex items-center justify-center mb-2">
                      <span className="text-xl">🚀</span>
                    </div>
                    <p className="text-xs text-gray-400">Acesso rápido</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto rounded-full bg-yellow-600/10 flex items-center justify-center mb-2">
                      <span className="text-xl">📱</span>
                    </div>
                    <p className="text-xs text-gray-400">Fullscreen</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto rounded-full bg-yellow-600/10 flex items-center justify-center mb-2">
                      <span className="text-xl">⚡</span>
                    </div>
                    <p className="text-xs text-gray-400">Offline</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    Agora não
                  </button>
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-400 transition-all shadow-lg shadow-yellow-600/30 flex items-center justify-center gap-2 text-sm font-bold"
                  >
                    <Download className="w-4 h-4" />
                    Instalar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 pb-4">
            <p className="text-xs text-gray-500 text-center">
              Menos de 1MB • Funciona offline • Seguro e privado
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
