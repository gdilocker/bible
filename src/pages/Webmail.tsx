import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import EmailSidebar from '../components/email/EmailSidebar';
import EmailList from '../components/email/EmailList';
import EmailViewer from '../components/email/EmailViewer';
import ComposeModal from '../components/email/ComposeModal';
import { Search, Settings, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmailFolder {
  id: string;
  name: string;
  type: string;
  unread_count: number;
  total_count: number;
}

interface EmailMessage {
  id: string;
  from_name: string;
  from_address: string;
  to_addresses: string[];
  cc_addresses?: string[];
  subject: string;
  body_text?: string;
  body_html?: string;
  is_read: boolean;
  is_starred: boolean;
  received_at: string;
  has_attachments?: boolean;
  attachments?: Array<{
    id: string;
    filename: string;
    content_type: string;
    size_bytes: number;
  }>;
}

export default function Webmail() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [emailAccount, setEmailAccount] = useState<any>(null);
  const [folders, setFolders] = useState<EmailFolder[]>([]);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadEmailAccount();
  }, [user]);

  useEffect(() => {
    if (selectedFolderId) {
      loadMessages(selectedFolderId);
    }
  }, [selectedFolderId]);

  useEffect(() => {
    if (selectedMessageId) {
      loadMessage(selectedMessageId);
    }
  }, [selectedMessageId]);

  const loadEmailAccount = async () => {
    try {
      // Get or create email account
      let { data: account, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;

      if (!account) {
        // Create default email account
        const emailAddress = `${user!.email!.split('@')[0]}@com.rich`;
        const { data: newAccount, error: createError } = await supabase
          .from('email_accounts')
          .insert({
            user_id: user!.id,
            email_address: emailAddress,
            display_name: user!.name || user!.email!.split('@')[0]
          })
          .select()
          .single();

        if (createError) throw createError;
        account = newAccount;
      }

      setEmailAccount(account);

      // Load folders
      const { data: foldersData, error: foldersError } = await supabase
        .from('email_folders')
        .select('*')
        .eq('account_id', account.id)
        .order('type', { ascending: true });

      if (foldersError) throw foldersError;

      setFolders(foldersData || []);

      // Select inbox by default
      const inbox = foldersData?.find(f => f.type === 'inbox');
      if (inbox) {
        setSelectedFolderId(inbox.id);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading email account:', error);
      setLoading(false);
    }
  };

  const loadMessages = async (folderId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_messages')
        .select(`
          *,
          attachments:email_attachments(*)
        `)
        .eq('folder_id', folderId)
        .order('received_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedMessages = data?.map(msg => ({
        ...msg,
        has_attachments: msg.attachments && msg.attachments.length > 0
      })) || [];

      setMessages(formattedMessages);
      setLoading(false);
    } catch (error) {
      console.error('Error loading messages:', error);
      setLoading(false);
    }
  };

  const loadMessage = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('email_messages')
        .select(`
          *,
          attachments:email_attachments(*)
        `)
        .eq('id', messageId)
        .single();

      if (error) throw error;

      setSelectedMessage(data);

      // Mark as read
      if (!data.is_read) {
        await supabase
          .from('email_messages')
          .update({ is_read: true })
          .eq('id', messageId);

        // Refresh messages to update UI
        if (selectedFolderId) {
          loadMessages(selectedFolderId);
        }
      }
    } catch (error) {
      console.error('Error loading message:', error);
    }
  };

  const handleToggleStar = async (messageId: string) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      await supabase
        .from('email_messages')
        .update({ is_starred: !message.is_starred })
        .eq('id', messageId);

      // Update local state
      setMessages(messages.map(m =>
        m.id === messageId ? { ...m, is_starred: !m.is_starred } : m
      ));

      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage({ ...selectedMessage, is_starred: !selectedMessage.is_starred });
      }
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const handleSendEmail = async (email: {
    to: string[];
    cc: string[];
    bcc: string[];
    subject: string;
    body: string;
  }) => {
    try {
      if (!emailAccount) return;

      // Get sent folder
      const sentFolder = folders.find(f => f.type === 'sent');
      if (!sentFolder) return;

      // Create message in sent folder
      const { error } = await supabase
        .from('email_messages')
        .insert({
          account_id: emailAccount.id,
          folder_id: sentFolder.id,
          from_address: emailAccount.email_address,
          from_name: emailAccount.display_name,
          to_addresses: email.to,
          cc_addresses: email.cc.length > 0 ? email.cc : null,
          bcc_addresses: email.bcc.length > 0 ? email.bcc : null,
          subject: email.subject,
          body_text: email.body,
          is_read: true,
          sent_at: new Date().toISOString()
        });

      if (error) throw error;

      alert('E-mail enviado com sucesso!');

      // Reload messages if we're viewing sent folder
      if (selectedFolderId === sentFolder.id) {
        loadMessages(sentFolder.id);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Erro ao enviar e-mail. Tente novamente.');
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;

    try {
      const trashFolder = folders.find(f => f.type === 'trash');
      if (!trashFolder) return;

      await supabase
        .from('email_messages')
        .update({ folder_id: trashFolder.id })
        .eq('id', selectedMessage.id);

      alert('Mensagem movida para lixeira');

      // Reload messages
      if (selectedFolderId) {
        loadMessages(selectedFolderId);
      }

      setSelectedMessageId(null);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  if (loading && !emailAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando webmail...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-black">Webmail</h1>
          <div className="text-sm text-gray-600">
            {emailAccount?.email_address}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar e-mails..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black w-64"
            />
          </div>

          {/* Refresh */}
          <button
            onClick={() => selectedFolderId && loadMessages(selectedFolderId)}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Atualizar"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>

          {/* Settings */}
          <button
            onClick={() => navigate('/panel/dashboard')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Configurações"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <EmailSidebar
          folders={folders}
          selectedFolderId={selectedFolderId}
          onFolderSelect={setSelectedFolderId}
          onCompose={() => setIsComposeOpen(true)}
        />

        {/* Email List */}
        <div className="w-96 border-r border-gray-200 flex flex-col">
          <EmailList
            messages={messages}
            selectedMessageId={selectedMessageId}
            onMessageSelect={setSelectedMessageId}
            onToggleStar={handleToggleStar}
            loading={loading}
          />
        </div>

        {/* Email Viewer */}
        <EmailViewer
          message={selectedMessage}
          onBack={() => {
            setSelectedMessageId(null);
            setSelectedMessage(null);
          }}
          onReply={() => {
            if (selectedMessage) {
              setIsComposeOpen(true);
            }
          }}
          onReplyAll={() => {
            if (selectedMessage) {
              setIsComposeOpen(true);
            }
          }}
          onForward={() => {
            if (selectedMessage) {
              setIsComposeOpen(true);
            }
          }}
          onDelete={handleDelete}
          onToggleStar={() => {
            if (selectedMessage) {
              handleToggleStar(selectedMessage.id);
            }
          }}
        />
      </div>

      {/* Compose Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={handleSendEmail}
        replyTo={selectedMessage ? {
          to: selectedMessage.from_address,
          subject: selectedMessage.subject
        } : undefined}
      />
    </div>
  );
}
