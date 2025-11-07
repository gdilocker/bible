import React from 'react';
import { Inbox, Send, FileText, Trash2, AlertOctagon, Folder, Plus, Star } from 'lucide-react';

interface EmailFolder {
  id: string;
  name: string;
  type: string;
  unread_count: number;
  total_count: number;
}

interface EmailSidebarProps {
  folders: EmailFolder[];
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string) => void;
  onCompose: () => void;
}

export default function EmailSidebar({ folders, selectedFolderId, onFolderSelect, onCompose }: EmailSidebarProps) {
  const getFolderIcon = (type: string) => {
    switch (type) {
      case 'inbox':
        return <Inbox className="w-5 h-5" />;
      case 'sent':
        return <Send className="w-5 h-5" />;
      case 'drafts':
        return <FileText className="w-5 h-5" />;
      case 'trash':
        return <Trash2 className="w-5 h-5" />;
      case 'spam':
        return <AlertOctagon className="w-5 h-5" />;
      case 'starred':
        return <Star className="w-5 h-5" />;
      default:
        return <Folder className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Compose Button */}
      <div className="p-4">
        <button
          onClick={onCompose}
          className="w-full bg-black text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Escrever
        </button>
      </div>

      {/* Folders */}
      <nav className="flex-1 overflow-y-auto px-2">
        <div className="space-y-1">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => onFolderSelect(folder.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFolderId === folder.id
                  ? 'bg-gray-100 text-black'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <div className="flex items-center gap-3">
                {getFolderIcon(folder.type)}
                <span>{folder.name}</span>
              </div>
              {folder.unread_count > 0 && (
                <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full">
                  {folder.unread_count}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Storage Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 mb-2">Armazenamento</div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
          <div className="bg-black h-2 rounded-full" style={{ width: '35%' }}></div>
        </div>
        <div className="text-xs text-gray-600">350 MB de 1 GB usados</div>
      </div>
    </div>
  );
}
