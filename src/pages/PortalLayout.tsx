// src/pages/PortalLayout.tsx
import { useState } from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Store, 
  LogOut, 
  Menu, 
  X,
  Search,
  ChevronDown,
  User,
  Package,
  Code
} from 'lucide-react';
import { useAuthContext } from '../hooks/useAuth';
import { config } from '../lib/config';
import { Helmet } from 'react-helmet-async';

export function PortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, signOut, isConfigured, dev, setDev } = useAuthContext();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/acesso';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/portal/dashboard' },
    { id: 'estoque', label: 'Estoque', icon: Package, path: '/portal/estoque' },
    { id: 'perfil', label: 'Perfil da Loja', icon: Store, path: '/portal/perfil' },
  ];

  const storeName = 'Minha Loja'; // TODO: trazer do perfil real

  // Se você ainda estiver usando o ProtectedRoute em App.tsx, pode remover este redirect.
  if (!isConfigured) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Portal | {config.app.name}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="w-full px-3 sm:px-4 lg:px-6">
            <div className="flex justify-between items-center h-16">
              {/* Logo e Menu Mobile */}
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label="Abrir menu"
                >
                  {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <div className="flex items-center ml-2 lg:ml-0">
                  <div className="bg-emerald-500 rounded-full p-2 mr-3">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                    Portal {config.app.name}
                  </h1>
                </div>
              </div>

              {/* DEV Toggle + Menu do Usuário */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setDev(!dev)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    dev 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={dev ? 'Desativar modo DEV' : 'Ativar modo DEV'}
                >
                  <Code className="w-4 h-4" />
                </button>
                {dev && (
                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    DEV
                  </span>
                )}

                {/* Menu do Usuário */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 sm:space-x-3 text-gray-700 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="bg-emerald-100 rounded-full p-2">
                      <Store className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="hidden sm:block text-left min-w-0">
                      <div className="text-sm font-medium truncate max-w-32 lg:max-w-none">{storeName}</div>
                      <div className="text-xs text-gray-500 truncate max-w-32 lg:max-w-none">{user?.email}</div>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="text-sm font-medium text-gray-900 truncate">{storeName}</div>
                          <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                        </div>
                        
                        <NavLink
                          to="/portal/perfil"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-3" />
                            Minha Conta
                          </div>
                        </NavLink>
                        
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
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside
            className={`
              fixed top-16 bottom-0 left-0 z-30
              w-64 bg-white shadow-lg border-r border-gray-200
              transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              lg:translate-x-0
            `}
          >
            <nav className="mt-4 sm:mt-6 px-3 sm:px-4 h-full overflow-y-auto">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <NavLink
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 shadow-sm font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      <span className="text-sm sm:text-base">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Overlay mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main */}
          <main className="flex-1 pt-4 sm:pt-6 lg:pt-8 px-3 sm:px-4 lg:px-6 xl:px-8 lg:ml-64">
            <Outlet />
          </main>
        </div>

        {/* Click outside para fechar menu do usuário */}
        {userMenuOpen && (
          <div
            className="fixed inset-0 z-10"
            onClick={() => setUserMenuOpen(false)}
          />
        )}
      </div>
    </>
  );
};
