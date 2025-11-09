import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Share } from 'lucide-react';
import Logo from './Logo';

interface InstallAppModalProps {
  onClose: () => void;
}

export function InstallAppModal({ onClose }: InstallAppModalProps) {
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('android');

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isIOS) {
      setPlatform('ios');
    } else if (isAndroid) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('installAppDismissed', Date.now().toString());
    onClose();
  };

  const instructions = {
    android: {
      icon: <Smartphone className="w-8 h-8 text-[#FFD700]" />,
      steps: [
        'Toque no menu (⋮) no canto superior direito',
        'Selecione "Instalar app"',
        'Confirme tocando em "Instalar"',
        'O ícone do diamante aparecerá na sua tela inicial'
      ]
    },
    ios: {
      icon: <Share className="w-8 h-8 text-[#FFD700]" />,
      steps: [
        'Toque no ícone de compartilhar (□↑) na barra inferior',
        'Role para baixo e selecione "Adicionar à Tela de Início"',
        'Toque em "Adicionar" no canto superior direito',
        'O ícone aparecerá na sua tela inicial'
      ]
    },
    desktop: {
      icon: <Download className="w-8 h-8 text-[#FFD700]" />,
      steps: [
        'Clique no ícone de instalação (⊕) na barra de endereços',
        'Ou acesse Menu (⋮) → "Instalar .com.rich"',
        'Confirme a instalação',
        'O app abrirá em uma janela separada'
      ]
    }
  };

  const currentInstructions = instructions[platform];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-gradient-to-br from-black via-gray-900 to-black border border-[#FFD700]/20 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Header com efeito dourado */}
        <div className="relative bg-gradient-to-r from-[#FFD700]/10 via-[#D4AF37]/10 to-[#FFD700]/10 p-6 border-b border-[#FFD700]/20">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-[#FFD700]/30 border-2 border-[#FFD700]">
              <Logo size={60} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Instalar .com.rich
              </h2>
              <p className="text-sm text-gray-400">
                Acesse mais rápido, em tela cheia e com experiência premium
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">

          {/* Badge da plataforma */}
          <div className="flex justify-center">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 text-sm text-[#FFD700] font-medium">
              {platform === 'android' && 'Android'}
              {platform === 'ios' && 'iPhone/iPad'}
              {platform === 'desktop' && 'Desktop'}
            </span>
          </div>

          {/* Instruções */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-center">Como instalar:</h3>
            <ol className="space-y-3">
              {currentInstructions.steps.map((step, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FFD700] text-black font-bold text-sm flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-300 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Benefícios */}
          <div className="bg-gradient-to-br from-[#FFD700]/5 to-transparent border border-[#FFD700]/10 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-[#FFD700] uppercase tracking-wide">Benefícios</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>✓ Acesso instantâneo da tela inicial</li>
              <li>✓ Experiência em tela cheia</li>
              <li>✓ Funciona offline (em breve)</li>
              <li>✓ Notificações personalizadas</li>
            </ul>
          </div>
        </div>

        {/* Footer com botões */}
        <div className="p-6 bg-gradient-to-t from-[#FFD700]/5 to-transparent border-t border-[#FFD700]/10 space-y-3">
          <button
            onClick={handleDismiss}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#D4AF37] text-black font-bold text-sm hover:shadow-lg hover:shadow-[#FFD700]/30 transition-all duration-300 transform hover:scale-[1.02]"
          >
            Entendi, vou instalar!
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-3 px-6 rounded-xl border border-gray-700 text-gray-400 text-sm hover:bg-gray-800/50 hover:text-white transition-all duration-300"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
