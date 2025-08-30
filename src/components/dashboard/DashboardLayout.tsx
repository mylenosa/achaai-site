import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Store, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Search,
  ChevronDown,
  User
} from 'lucide-react';
import { useAuthContext } from '../../hooks/useAuth';
import { Analytics } from './Analytics';
import { StoreProfileForm } from './StoreProfileForm';
import { config } from '../../lib/config';

export const DashboardLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('analytics'); // Padrão: Analytics
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, signOut } = useAuthContext();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const menuItems = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Perfil da Loja', icon: Store },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  // Simular nome da loja (em produção viria do perfil)
  const storeName = 'Minha Loja'; // TODO: Buscar do perfil real

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo e Menu Mobile */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Abrir menu"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex items-center ml-2 md:ml-0">
                <div className="bg-emerald-500 rounded-full p-2 mr-3">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-800">
                  Portal {config.app.name}
                </h1>
              </div>
            </div>

            {/* Menu do Usuário */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <div className="bg-emerald-100 rounded-full p-2">
                  <Store className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">{storeName}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{storeName}</div>
                      <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Minha Conta
                    </button>
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sair
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 fixed md:static inset-y-0 left-0 z-30
          w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out
          border-r border-gray-200
        `}>
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200
                      ${activeTab === item.id
                        ? 'bg-emerald-50 text-emerald-700 border-r-4 border-emerald-500 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Overlay para mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 max-w-full overflow-hidden">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'profile' && <StoreProfileForm />}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
                  <p className="text-gray-600 mt-1">Gerencie as configurações da sua conta</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações da Conta</h3>
                  <p className="text-gray-600">
                    Funcionalidades avançadas de configuração em desenvolvimento.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Click outside handler para fechar menu do usuário */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  );
};