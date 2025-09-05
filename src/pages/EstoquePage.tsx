import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  CheckCircle, 
  Edit3, 
  Eye, 
  EyeOff, 
  Trash2,
  Clock,
  AlertTriangle,
  X,
  Save,
  Undo2
} from 'lucide-react';
import { Item, parseCurrency, formatCurrency, ageInDays } from '../lib/utils';

type FilterType = 'all' | 'available' | 'unavailable' | 'outdated' | 'no-price' | 'unpublished';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EstoquePage: React.FC = () => {
  // Mock data - in production this would come from API
  const [items, setItems] = useState<Item[]>([
    {
      id: '1',
      title: 'Tinta Spray Vermelha 400ml',
      price: 15.90,
      available: true,
      verifiedAt: '2025-01-25T10:00:00Z',
      active: true,
      updatedAt: '2025-01-25T10:00:00Z'
    },
    {
      id: '2',
      title: 'WD-40 300ml',
      price: 25.50,
      available: true,
      verifiedAt: '2024-12-20T15:30:00Z',
      active: true,
      updatedAt: '2024-12-20T15:30:00Z'
    },
    {
      id: '3',
      title: 'Parafuso Phillips 3x20',
      price: null,
      available: false,
      verifiedAt: '2025-01-20T08:00:00Z',
      active: true,
      updatedAt: '2025-01-20T08:00:00Z'
    },
    {
      id: '4',
      title: 'Martelo 500g',
      price: 35.00,
      available: true,
      verifiedAt: '2024-11-15T12:00:00Z',
      active: false,
      updatedAt: '2024-11-15T12:00:00Z'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Filter items based on search and active filter
  const filteredItems = items.filter(item => {
    // Search filter
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Category filter
    switch (activeFilter) {
      case 'available':
        return item.available && item.active;
      case 'unavailable':
        return !item.available && item.active;
      case 'outdated':
        return item.verifiedAt && ageInDays(item.verifiedAt) > 30 && item.active;
      case 'no-price':
        return item.price === null && item.active;
      case 'unpublished':
        return !item.active;
      default:
        return true;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = {
    total: items.length,
    available: items.filter(item => item.available && item.active).length,
    outdated: items.filter(item => item.verifiedAt && ageInDays(item.verifiedAt) > 30 && item.active).length
  };

  // Filter chips configuration
  const filterChips = [
    { id: 'all', label: 'Todos', count: items.length },
    { id: 'available', label: 'Disponíveis', count: stats.available },
    { id: 'unavailable', label: 'Indisponíveis', count: items.filter(item => !item.available && item.active).length },
    { id: 'outdated', label: 'Desatualizados', count: stats.outdated },
    { id: 'no-price', label: 'Sem preço', count: items.filter(item => item.price === null && item.active).length },
    { id: 'unpublished', label: 'Despublicados', count: items.filter(item => !item.active).length }
  ];

  // Toast management
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after 5 seconds if no action
    if (!toast.action) {
      setTimeout(() => removeToast(id), 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Item actions
  const toggleAvailable = (itemId: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            available: !item.available,
            verifiedAt: !item.available ? new Date().toISOString() : item.verifiedAt
          }
        : item
    ));
  };

  const confirmItem = (itemId: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            verifiedAt: new Date().toISOString(),
            available: true
          }
        : item
    ));
    addToast({ type: 'success', message: 'Item confirmado com sucesso!' });
  };

  const confirmAllItems = () => {
    const now = new Date().toISOString();
    setItems(prev => prev.map(item => ({ 
      ...item, 
      verifiedAt: now,
      available: true
    })));
    addToast({ type: 'success', message: `${items.length} itens confirmados!` });
  };

  const unpublishItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    setItems(prev => prev.map(i => 
      i.id === itemId ? { ...i, active: false } : i
    ));

    addToast({
      type: 'info',
      message: `"${item.title}" foi despublicado`,
      action: {
        label: 'Desfazer',
        onClick: () => {
          setItems(prev => prev.map(i => 
            i.id === itemId ? { ...i, active: true } : i
          ));
          removeToast(''); // Will be handled by the toast system
        }
      }
    });
  };

  const republishItem = (itemId: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, active: true } : item
    ));
    addToast({ type: 'success', message: 'Item republicado!' });
  };

  const deleteItem = (itemId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      setItems(prev => prev.filter(item => item.id !== itemId));
      addToast({ type: 'success', message: 'Item excluído!' });
    }
  };

  const saveItem = (item: Partial<Item>) => {
    // Validation
    if (!item.title || item.title.trim().length < 2) {
      addToast({ type: 'error', message: 'Título deve ter pelo menos 2 caracteres' });
      return;
    }

    // Check for duplicates (case-insensitive)
    const isDuplicate = items.some(existingItem => 
      existingItem.id !== item.id && 
      existingItem.title.toLowerCase() === item.title!.toLowerCase()
    );

    if (isDuplicate) {
      if (!window.confirm('Já existe um item com este título. Deseja continuar?')) {
        return;
      }
    }

    const now = new Date().toISOString();

    if (isCreating) {
      // Create new item
      const newItem: Item = {
        id: Date.now().toString(),
        title: item.title!.trim(),
        price: item.price || null,
        available: item.available ?? true,
        verifiedAt: now,
        active: true,
        updatedAt: now
      };
      setItems(prev => [newItem, ...prev]);
      addToast({ type: 'success', message: 'Item criado com sucesso!' });
    } else {
      // Update existing item
      setItems(prev => prev.map(existingItem => 
        existingItem.id === item.id 
          ? { ...existingItem, ...item, updatedAt: now }
          : existingItem
      ));
      addToast({ type: 'success', message: 'Item atualizado!' });
    }

    setEditingItem(null);
    setIsCreating(false);
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingItem({
      id: '',
      title: '',
      price: null,
      available: true,
      active: true,
      updatedAt: new Date().toISOString()
    });
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setIsCreating(false);
  };

  // Auto-remove toasts with actions after 5 seconds
  useEffect(() => {
    toasts.forEach(toast => {
      if (toast.action) {
        const timer = setTimeout(() => removeToast(toast.id), 5000);
        return () => clearTimeout(timer);
      }
    });
  }, [toasts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Estoque</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Gerencie os produtos da sua loja</p>
      </div>

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`p-4 rounded-lg shadow-lg border max-w-sm ${
                toast.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
                toast.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
                'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{toast.message}</span>
                <div className="flex items-center gap-2 ml-3">
                  {toast.action && (
                    <button
                      onClick={toast.action.onClick}
                      className="text-xs font-medium underline hover:no-underline"
                    >
                      {toast.action.label}
                    </button>
                  )}
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {filterChips.map(chip => (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id as FilterType)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === chip.id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {chip.label} ({chip.count})
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={startCreating}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Novo item
          </button>
          <button
            onClick={confirmAllItems}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            Confirmar todos
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isCreating ? 'Novo Item' : 'Editar Item'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Nome do produto"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço (opcional)
                  </label>
                  <input
                    type="text"
                    value={editingItem.price ? formatCurrency(editingItem.price).replace('R$', '').trim() : ''}
                    onChange={(e) => {
                      const parsed = parseCurrency(e.target.value);
                      setEditingItem(prev => prev ? { ...prev, price: parsed } : null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="available"
                    checked={editingItem.available}
                    onChange={(e) => setEditingItem(prev => prev ? { ...prev, available: e.target.checked } : null)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="available" className="ml-2 text-sm text-gray-700">
                    Disponível
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => saveItem(editingItem)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Items Table/Cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Item</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Preço</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Disponível</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Confirmado há</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item, index) => {
                const daysOld = item.verifiedAt ? ageInDays(item.verifiedAt) : null;
                const isOutdated = daysOld && daysOld > 30;
                
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div className={`font-medium ${!item.active ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {item.title}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {item.price ? (
                        <span className="text-gray-900">{formatCurrency(item.price)}</span>
                      ) : (
                        <span className="text-gray-400 text-sm">Sem preço</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleAvailable(item.id)}
                        disabled={!item.active}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                          item.available ? 'bg-emerald-500' : 'bg-gray-200'
                        } ${!item.active ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            item.available ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {daysOld ? (
                        <div className="flex items-center justify-center gap-1">
                          {isOutdated && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                          <span className={isOutdated ? 'text-orange-600 font-medium' : 'text-gray-600'}>
                            {isOutdated ? 'Verificar' : `${daysOld}d`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        {isOutdated && (
                          <button
                            onClick={() => confirmItem(item.id)}
                            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                            title="Confirmar agora"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => item.active ? unpublishItem(item.id) : republishItem(item.id)}
                          className={`p-1 hover:bg-gray-50 rounded ${
                            item.active ? 'text-gray-600 hover:text-gray-700' : 'text-green-600 hover:text-green-700'
                          }`}
                          title={item.active ? 'Despublicar' : 'Republicar'}
                        >
                          {item.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden p-4 space-y-4">
          {paginatedItems.map((item, index) => {
            const daysOld = item.verifiedAt ? ageInDays(item.verifiedAt) : null;
            const isOutdated = daysOld && daysOld > 30;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className={`font-medium ${!item.active ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {item.title}
                    </h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {item.price ? formatCurrency(item.price) : 'Sem preço'}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleAvailable(item.id)}
                    disabled={!item.active}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      item.available ? 'bg-emerald-500' : 'bg-gray-200'
                    } ${!item.active ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        item.available ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    {daysOld ? (
                      <>
                        {isOutdated && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                        <span className={isOutdated ? 'text-orange-600 font-medium' : 'text-gray-600'}>
                          {isOutdated ? 'Verificar' : `Confirmado há ${daysOld}d`}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">Não confirmado</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {isOutdated && (
                      <button
                        onClick={() => confirmItem(item.id)}
                        className="p-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => item.active ? unpublishItem(item.id) : republishItem(item.id)}
                      className={`p-1 hover:bg-gray-100 rounded ${
                        item.active ? 'text-gray-600 hover:text-gray-700' : 'text-green-600 hover:text-green-700'
                      }`}
                    >
                      {item.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer with Stats and Pagination */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-600">
            {stats.total} itens • {stats.available} disponíveis • {stats.outdated} desatualizados
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};