import React, { useState, useEffect, useRef } from 'react';
import { Download, X } from 'lucide-react';
import Logo from './Logo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const mountTimeRef = useRef(Date.now());

  const addDebug = (message: string) => {
    const timestamp = ((Date.now() - mountTimeRef.current) / 1000).toFixed(2);
    const logMessage = `[${timestamp}s] ${message}`;
    console.log('[PWA]', logMessage);
    setDebugInfo(prev => [...prev, logMessage]);
  };

  useEffect(() => {
    addDebug('🚀 PWAInstallPrompt montado');
    addDebug(`User Agent: ${navigator.userAgent.substring(0, 100)}...`);
    addDebug(`URL: ${window.location.href}`);
    addDebug(`Protocol: ${window.location.protocol}`);

    // Verificar se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');

    if (isStandalone) {
      addDebug('❌ App já instalado (standalone mode)');
      return;
    }

    // Verificar se usuário já dispensou
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed === 'true') {
      addDebug('❌ Usuário já dispensou o banner anteriormente');
      return;
    }

    addDebug('✅ App não está instalado (modo navegador)');

    // Detectar plataforma
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isChrome = /Chrome/.test(userAgent) && !/Edge/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);

    addDebug(`📱 Plataforma: iOS=${isIOS}, Android=${isAndroid}, Chrome=${isChrome}, Firefox=${isFirefox}`);

    if (isIOS) {
      addDebug('❌ iOS não suporta beforeinstallprompt');
      return;
    }

    if (isFirefox) {
      addDebug('❌ Firefox não suporta beforeinstallprompt');
      return;
    }

    // Verificar HTTPS
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    addDebug(`🔒 Secure context: ${isSecure ? 'SIM' : 'NÃO'}`);

    if (!isSecure) {
      addDebug('⚠️ HTTPS necessário para PWA em produção');
    }

    // Verificar Service Worker
    if ('serviceWorker' in navigator) {
      addDebug('✅ Service Worker API disponível');

      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          addDebug(`✅ Service Worker registrado: ${reg.active?.state}`);
        } else {
          addDebug('⚠️ Service Worker NÃO registrado');
        }
      });

      navigator.serviceWorker.ready
        .then(reg => addDebug(`✅ Service Worker pronto: ${reg.active?.state}`))
        .catch(err => addDebug(`❌ Erro no Service Worker: ${err.message}`));
    } else {
      addDebug('❌ Service Worker API não disponível');
    }

    // Verificar manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      const manifestHref = manifestLink.getAttribute('href');
      addDebug(`✅ Manifest linkado: ${manifestHref}`);

      fetch(manifestHref!)
        .then(res => res.json())
        .then(manifest => {
          addDebug(`✅ Manifest carregado: "${manifest.name}"`);
          addDebug(`🎨 Ícones no manifest: ${manifest.icons?.length || 0}`);
        })
        .catch(err => addDebug(`❌ Erro ao carregar manifest: ${err.message}`));
    } else {
      addDebug('❌ Manifest NÃO está linkado no HTML!');
    }

    addDebug('⏳ Aguardando evento beforeinstallprompt...');

    // Timer para detectar timeout
    const timeoutId = setTimeout(() => {
      if (!deferredPrompt) {
        addDebug('⚠️ beforeinstallprompt NÃO disparou após 15 segundos');
        addDebug('💡 Possíveis causas:');
        addDebug('  1. Service Worker não está ativo');
        addDebug('  2. Manifest inválido ou ícones inacessíveis');
        addDebug('  3. App já foi instalado antes');
        addDebug('  4. Navegador em modo incógnito');
        addDebug('  5. Critérios de engajamento não atendidos');
        addDebug('  6. Chrome ainda está "pensando"');
      }
    }, 15000);

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      addDebug('🎉 ✅✅✅ beforeinstallprompt CAPTURADO!');
      e.preventDefault();

      clearTimeout(timeoutId);

      setDeferredPrompt(e);
      setShowInstallPrompt(true);

      addDebug('🎨 Banner ativado - renderizando agora!');
      addDebug(`Estado: deferredPrompt=SIM, showInstallPrompt=true`);

      // Log adicional após 1 segundo para confirmar renderização
      setTimeout(() => {
        const banner = document.querySelector('[data-pwa-banner="true"]');
        if (banner) {
          addDebug('✅ Banner renderizado no DOM');
        } else {
          addDebug('❌ Banner NÃO encontrado no DOM!');
        }
      }, 1000);
    };

    const handleAppInstalled = () => {
      addDebug('🎉 App instalado com sucesso!');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    addDebug('✅ Event listeners registrados');

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      addDebug('🧹 Limpeza concluída');
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    addDebug('👆 Botão "Instalar App" clicado');

    if (!deferredPrompt) {
      addDebug('❌ deferredPrompt não disponível');
      return;
    }

    try {
      addDebug('📱 Chamando deferredPrompt.prompt()...');
      await deferredPrompt.prompt();

      addDebug('⏳ Aguardando resposta do usuário...');
      const { outcome } = await deferredPrompt.userChoice;

      addDebug(`📊 Resposta: ${outcome}`);

      if (outcome === 'accepted') {
        addDebug('✅ Usuário ACEITOU instalação');
        localStorage.setItem('pwa-install-dismissed', 'true');
      } else {
        addDebug('❌ Usuário RECUSOU instalação');
        localStorage.setItem('pwa-install-dismissed', 'true');
      }

      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    } catch (error) {
      addDebug(`❌ Erro: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleDismiss = () => {
    addDebug('❌ Banner dispensado pelo usuário');
    localStorage.setItem('pwa-install-dismissed', 'true');
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  // Log do estado de renderização
  useEffect(() => {
    console.log('[PWA] Render:', { showInstallPrompt, hasDeferredPrompt: !!deferredPrompt });
  }, [showInstallPrompt, deferredPrompt]);

  // Não exibir se não houver prompt ou em iOS
  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[9999]"
      data-pwa-banner="true"
    >
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
