import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { Mail, Plus, Search, Edit2, Trash2, Lock, Unlock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface EmailAccount {
  id: string;
  user_id: string;
  email_address: string;
  display_name: string;
  quota_mb: number;
  used_mb: number;
  status: string;
  created_at: string;
  user_email?: string;
}

export default function AdminEmail() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<EmailAccount | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadAccounts();
  }, [user]);

  const loadAccounts = async () => {
    try {
      setLoading(true);

      // Get all email accounts with user info
      const { data, error } = await supabase
        .from('email_accounts')
        .select(`
          *,
          user_email:auth.users(email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAccounts(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading accounts:', error);
      setLoading(false);
    }
  };

  const handleSuspendAccount = async (accountId: string, suspend: boolean) => {
    try {
      const { error } = await supabase
        .from('email_accounts')
        .update({ status: suspend ? 'suspended' : 'active' })
        .eq('id', accountId);

      if (error) throw error;

      alert(suspend ? 'Conta suspensa com sucesso' : 'Conta reativada com sucesso');
      loadAccounts();
    } catch (error) {
      console.error('Error updating account:', error);
      alert('Erro ao atualizar conta');
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta? Todos os e-mails serão perdidos!')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('email_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      alert('Conta excluída com sucesso');
      loadAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Erro ao excluir conta');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Ativa
          </span>
        );
      case 'suspended':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Suspensa
          </span>
        );
      case 'deleted':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Deletada
          </span>
        );
      default:
        return null;
    }
  };

  const filteredAccounts = accounts.filter(account =>
    account.email_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <AdminPageHeader
          title="Gestão de E-mails"
          description="Gerencie contas de e-mail @com.rich"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="text-gray-600 text-sm mb-1">Total de Contas</div>
            <div className="text-3xl font-bold text-black">{accounts.length}</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="text-gray-600 text-sm mb-1">Contas Ativas</div>
            <div className="text-3xl font-bold text-green-600">
              {accounts.filter(a => a.status === 'active').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="text-gray-600 text-sm mb-1">Contas Suspensas</div>
            <div className="text-3xl font-bold text-red-600">
              {accounts.filter(a => a.status === 'suspended').length}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="text-gray-600 text-sm mb-1">Espaço Total Usado</div>
            <div className="text-3xl font-bold text-blue-600">
              {(accounts.reduce((sum, a) => sum + a.used_mb, 0) / 1024).toFixed(1)} GB
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar contas de e-mail..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nova Conta
            </button>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando contas...</p>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-1">Nenhuma conta encontrada</p>
              <p className="text-gray-500 text-sm">
                {searchQuery ? 'Tente uma busca diferente' : 'Crie a primeira conta de e-mail'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      E-mail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Armazenamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">{account.email_address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{account.display_name || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(account.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {account.used_mb} MB / {account.quota_mb} MB
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-black h-1.5 rounded-full"
                            style={{ width: `${(account.used_mb / account.quota_mb) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(account.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSuspendAccount(account.id, account.status === 'active')}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            title={account.status === 'active' ? 'Suspender' : 'Reativar'}
                          >
                            {account.status === 'active' ? (
                              <Lock className="w-4 h-4 text-gray-600" />
                            ) : (
                              <Unlock className="w-4 h-4 text-green-600" />
                            )}
                          </button>
                          <button
                            onClick={() => setSelectedAccount(account)}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteAccount(account.id)}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
