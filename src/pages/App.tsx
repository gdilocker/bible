import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, CreditCard, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MyDomains from '../components/MyDomains';
import PaymentRoutes from '../components/PaymentRoutes';

type Tab = 'domains' | 'payments';

export default function App() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('domains');

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My App</h1>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/panel/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <User className="w-5 h-5" />
                Dashboard
              </button>

              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('domains')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'domains'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                My Domains
              </span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'payments'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Settings
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'domains' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                My Domains
              </h2>
              <p className="text-gray-600">
                View and manage your registered domains
              </p>
            </div>
            <MyDomains />
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Settings
              </h2>
              <p className="text-gray-600">
                Configure how you receive payments on your public pages
              </p>
            </div>
            <PaymentRoutes />
          </div>
        )}
      </main>
    </div>
  );
}
