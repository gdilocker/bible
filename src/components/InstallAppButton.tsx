import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { InstallAppModal } from './InstallAppModal';

export function InstallAppButton() {
  const [showModal, setShowModal] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);

  useEffect(() => {
    const dismissedAt = localStorage.getItem('installAppDismissed');

    if (!dismissedAt) {
      setShouldShowButton(true);
      return;
    }

    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const timeSinceDismissed = Date.now() - parseInt(dismissedAt);

    if (timeSinceDismissed > sevenDaysInMs) {
      localStorage.removeItem('installAppDismissed');
      setShouldShowButton(true);
    } else {
      setShouldShowButton(true);
    }
  }, []);

  if (!shouldShowButton) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#D4AF37] text-black font-bold rounded-full shadow-lg shadow-[#FFD700]/30 hover:shadow-xl hover:shadow-[#FFD700]/40 transition-all duration-300 transform hover:scale-105 animate-in slide-in-from-bottom-4 duration-500"
        aria-label="Instalar App"
      >
        <Download className="w-5 h-5" />
        <span className="text-sm">Instalar App</span>
      </button>

      {showModal && <InstallAppModal onClose={() => setShowModal(false)} />}
    </>
  );
}
