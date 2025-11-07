import React, { useState } from 'react';
import { X, Paperclip, Image, Smile, Send, Minimize2, Maximize2 } from 'lucide-react';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: {
    to: string[];
    cc: string[];
    bcc: string[];
    subject: string;
    body: string;
  }) => void;
  replyTo?: {
    to: string;
    subject: string;
  };
}

export default function ComposeModal({ isOpen, onClose, onSend, replyTo }: ComposeModalProps) {
  const [to, setTo] = useState(replyTo?.to || '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(replyTo?.subject ? `Re: ${replyTo.subject}` : '');
  const [body, setBody] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!to.trim() || !subject.trim()) {
      alert('Preencha o destinatário e o assunto');
      return;
    }

    onSend({
      to: to.split(',').map(e => e.trim()).filter(Boolean),
      cc: cc.split(',').map(e => e.trim()).filter(Boolean),
      bcc: bcc.split(',').map(e => e.trim()).filter(Boolean),
      subject: subject.trim(),
      body: body.trim()
    });

    // Reset form
    setTo('');
    setCc('');
    setBcc('');
    setSubject('');
    setBody('');
    setShowCc(false);
    setShowBcc(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
      {/* Backdrop */}
      {!isMinimized && (
        <div
          className="absolute inset-0 bg-black/30"
          onClick={onClose}
        />
      )}

      {/* Modal */}
      <div className={`relative bg-white rounded-t-2xl shadow-2xl transition-all ${
        isMinimized ? 'w-64 h-14' : 'w-full max-w-2xl h-[80vh]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-black">
            {replyTo ? 'Responder' : 'Nova Mensagem'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
            >
              {isMinimized ? (
                <Maximize2 className="w-5 h-5 text-gray-600" />
              ) : (
                <Minimize2 className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Recipients */}
            <div className="border-b border-gray-200">
              <div className="flex items-center px-6 py-3">
                <label className="text-sm font-medium text-gray-600 w-16">Para:</label>
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="destinatario@com.rich"
                  className="flex-1 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                />
                <div className="flex items-center gap-2 ml-4">
                  {!showCc && (
                    <button
                      onClick={() => setShowCc(true)}
                      className="text-sm text-gray-600 hover:text-black transition-colors"
                    >
                      CC
                    </button>
                  )}
                  {!showBcc && (
                    <button
                      onClick={() => setShowBcc(true)}
                      className="text-sm text-gray-600 hover:text-black transition-colors"
                    >
                      CCO
                    </button>
                  )}
                </div>
              </div>

              {showCc && (
                <div className="flex items-center px-6 py-3 border-t border-gray-100">
                  <label className="text-sm font-medium text-gray-600 w-16">CC:</label>
                  <input
                    type="text"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    placeholder="Com cópia"
                    className="flex-1 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                </div>
              )}

              {showBcc && (
                <div className="flex items-center px-6 py-3 border-t border-gray-100">
                  <label className="text-sm font-medium text-gray-600 w-16">CCO:</label>
                  <input
                    type="text"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    placeholder="Cópia oculta"
                    className="flex-1 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center px-6 py-3 border-t border-gray-100">
                <label className="text-sm font-medium text-gray-600 w-16">Assunto:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Assunto do e-mail"
                  className="flex-1 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-6">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Escreva sua mensagem..."
                className="w-full h-full text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Anexar arquivo">
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Inserir imagem">
                  <Image className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Inserir emoji">
                  <Smile className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSend}
                  className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Enviar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
