import React from 'react';
import { ArrowLeft, Reply, ReplyAll, Forward, Trash2, Archive, Star, MoreVertical, Download, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DOMPurify from 'dompurify';

interface EmailMessage {
  id: string;
  from_name: string;
  from_address: string;
  to_addresses: string[];
  cc_addresses?: string[];
  subject: string;
  body_text?: string;
  body_html?: string;
  is_starred: boolean;
  received_at: string;
  attachments?: Array<{
    id: string;
    filename: string;
    content_type: string;
    size_bytes: number;
  }>;
}

interface EmailViewerProps {
  message: EmailMessage | null;
  onBack: () => void;
  onReply: () => void;
  onReplyAll: () => void;
  onForward: () => void;
  onDelete: () => void;
  onToggleStar: () => void;
}

export default function EmailViewer({
  message,
  onBack,
  onReply,
  onReplyAll,
  onForward,
  onDelete,
  onToggleStar
}: EmailViewerProps) {
  if (!message) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center text-gray-500">
          <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-medium">Selecione uma mensagem</p>
          <p className="text-sm">Escolha um e-mail da lista para visualizar</p>
        </div>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const sanitizedHtml = message.body_html ? DOMPurify.sanitize(message.body_html) : null;

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-black transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleStar}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              title="Destacar"
            >
              <Star
                className={`w-5 h-5 ${message.is_starred ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`}
              />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              title="Excluir"
            >
              <Trash2 className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 rounded hover:bg-gray-100 transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReply}
            className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center gap-2"
          >
            <Reply className="w-4 h-4" />
            Responder
          </button>
          <button
            onClick={onReplyAll}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ReplyAll className="w-4 h-4" />
            Responder a Todos
          </button>
          <button
            onClick={onForward}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Forward className="w-4 h-4" />
            Encaminhar
          </button>
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          {/* Subject */}
          <h1 className="text-2xl font-bold text-black mb-4">
            {message.subject || '(Sem assunto)'}
          </h1>

          {/* From/To Info */}
          <div className="mb-6 space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {(message.from_name || message.from_address).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {message.from_name || message.from_address}
                    </div>
                    <div className="text-sm text-gray-500">&lt;{message.from_address}&gt;</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(message.received_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Para:</span> {message.to_addresses.join(', ')}
                </div>
                {message.cc_addresses && message.cc_addresses.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">CC:</span> {message.cc_addresses.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">
                  {message.attachments.length} {message.attachments.length === 1 ? 'anexo' : 'anexos'}
                </span>
              </div>
              <div className="space-y-2">
                {message.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-white rounded border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <Paperclip className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-900">{attachment.filename}</div>
                        <div className="text-xs text-gray-500">{formatFileSize(attachment.size_bytes)}</div>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                      <Download className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="prose prose-sm max-w-none">
            {sanitizedHtml ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
            ) : (
              <div className="whitespace-pre-wrap text-gray-800">
                {message.body_text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
