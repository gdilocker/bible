import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Logo from './Logo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [bip, setBip] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;

    if (isStandalone) {
      console.log('[PWA] App já instalado, não mostra prompt');
      return;
    }

    const onBIP = (e: Event) => {
      e.preventDefault();
      setBip(e as BeforeInstallPromptEvent);
      setVisible(true);
      console.log('[PWA] beforeinstallprompt disparou - Mostrando modal');
    };

    const onInstalled = () => {
      console.log('[PWA] App instalado com sucesso!');
      setVisible(false);
      setBip(null);
      localStorage.setItem('pwa_installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);

    // SEMPRE mostra o modal após 3 segundos (sem cooldown)
    // TODO: Adicionar regras personalizadas futuras baseadas em:
    // - stats.views (quantas vezes viu)
    // - stats.dismissCount (quantas vezes dispensou)
    // - stats.lastDismissed (quando dispensou pela última vez)
    // - Tipo de usuário (guest, free, premium)
    // - Comportamento (tempo no site, páginas visitadas)
    const showTimer = setTimeout(() => {
      // Registra estatísticas para futuras regras
      const stats = JSON.parse(localStorage.getItem('pwa_stats') || '{}');
      stats.views = (stats.views || 0) + 1;
      stats.lastSeen = Date.now();
      localStorage.setItem('pwa_stats', JSON.stringify(stats));

      console.log('[PWA] Mostrando modal automaticamente (3s)', stats);
      setVisible(true);
    }, 3000);

    // MODO PREVIEW: Adiciona listener global para testar modal
    (window as any).__showPWAModal = () => {
      console.log('[PWA] Modo preview ativado');
      setVisible(true);
    };

    return () => {
      clearTimeout(showTimer);
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
      delete (window as any).__showPWAModal;
    };
  }, []);

  const handleInstall = async () => {
    if (!bip) return;
    setInstalling(true);
    try {
      await bip.prompt();
      const { outcome } = await bip.userChoice;
      console.log('[PWA] userChoice:', outcome);
    } finally {
      setInstalling(false);
      setBip(null);
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    setVisible(false);

    // Registra estatísticas (mas não bloqueia futuras exibições)
    const stats = JSON.parse(localStorage.getItem('pwa_stats') || '{}');
    stats.dismissCount = (stats.dismissCount || 0) + 1;
    stats.lastDismissed = Date.now();
    localStorage.setItem('pwa_stats', JSON.stringify(stats));

    console.log('[PWA] Modal dispensado', stats);
    // Nota: Modal voltará a aparecer na próxima visita (3s)
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (!visible && !isIOS) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4">
      <div className="mx-auto max-w-md rounded-2xl border border-[#D4AF37] bg-black/90 backdrop-blur-sm p-4 text-white shadow-2xl">
        <div className="flex items-center gap-3">
          <Logo size={48} />
          <div className="text-lg font-semibold">Instalar The Rich Club</div>
        </div>

        {!isIOS ? (
          <>
            <button
              onClick={handleInstall}
              disabled={!bip || installing}
              className="mt-4 w-full rounded-xl bg-[#D4AF37] px-4 py-3 font-bold text-black disabled:opacity-50"
            >
              {installing ? 'Instalando...' : 'Instalar App'}
            </button>
            {!bip && (
              <div className="mt-3 p-3 bg-white/5 rounded-lg text-xs text-gray-300 leading-relaxed">
                <p className="mb-2">
                  <strong className="text-[#D4AF37]">Em produção (HTTPS):</strong> Este botão abrirá o instalador nativo do Chrome.
                </p>
                <p className="text-gray-400">
                  <strong>Agora (desenvolvimento):</strong> Use o menu <span className="text-[#D4AF37]">⋮</span> → "Adicionar à tela inicial"
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="mt-3 text-sm text-gray-200">
            No iPhone: Compartilhar → "Adicionar à Tela de Início".
          </p>
        )}

        <button
          onClick={handleDismiss}
          className="mt-2 w-full rounded-xl bg-white/10 px-4 py-2 text-sm"
        >
          Agora não
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
