import React from 'react';
import { Star, Paperclip, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EmailMessage {
  id: string;
  from_name: string;
  from_address: string;
  subject: string;
  body_text: string;
  is_read: boolean;
  is_starred: boolean;
  received_at: string;
  has_attachments?: boolean;
}

interface EmailListProps {
  messages: EmailMessage[];
  selectedMessageId: string | null;
  onMessageSelect: (messageId: string) => void;
  onToggleStar: (messageId: string) => void;
  loading?: boolean;
}

export default function EmailList({ messages, selectedMessageId, onMessageSelect, onToggleStar, loading }: EmailListProps) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Nenhuma mensagem</p>
          <p className="text-gray-500 text-sm">Sua caixa de entrada está vazia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="divide-y divide-gray-200">
        {messages.map((message) => (
          <div
            key={message.id}
            onClick={() => onMessageSelect(message.id)}
            className={`px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors ${
              selectedMessageId === message.id ? 'bg-blue-50 hover:bg-blue-100' : ''
            } ${!message.is_read ? 'bg-white' : ''}`}
          >
            <div className="flex items-start gap-3">
              {/* Star */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar(message.id);
                }}
                className="mt-1 text-gray-400 hover:text-yellow-500 transition-colors"
              >
                <Star
                  className={`w-5 h-5 ${message.is_starred ? 'fill-yellow-500 text-yellow-500' : ''}`}
                />
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm ${!message.is_read ? 'font-bold text-black' : 'font-medium text-gray-700'}`}>
                    {message.from_name || message.from_address}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(message.received_at), 'dd MMM', { locale: ptBR })}
                  </span>
                </div>
                <div className={`text-sm mb-1 ${!message.is_read ? 'font-semibold text-black' : 'text-gray-900'}`}>
                  {message.subject || '(Sem assunto)'}
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {message.body_text?.substring(0, 100)}
                </div>
                {message.has_attachments && (
                  <div className="flex items-center gap-1 mt-2">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Anexo</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
