import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2,
  X,
  Save,
  ChevronUp,
  ChevronDown,
  FileText,
  Upload
} from 'lucide-react';
import { createExcelImportService, ImportResult } from '../services/ExcelService';
import { useAuthContext } from '../hooks/useAuth';
import * as XLSX from 'xlsx';

// Types
type Item = {
  id: string;
  title: string;
  price: number | null;
  updatedAt: string;
};

type SortField = 'title' | 'price';
type SortDirection = 'asc' | 'desc';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ImportModalState {
  isOpen: boolean;
  file: File | null;
  isImporting: boolean;
}

interface ImportDetailsModal {
  isOpen: boolean;
  result: ImportResult | null;
}

// Utils
const parseCurrency = (str: string): number | null => {
  if (!str || str.trim() === '') return null;
  
  // Remove currency symbols and spaces
  const cleaned = str.replace(/[R$\s]/g, '');
  
  // Handle Brazilian format (1.999,90) and US format (1,999.90)
  let normalized = cleaned;
  
  // If has both comma and dot, assume Brazilian format
  if (cleaned.includes(',') && cleaned.includes('.')) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  }
  // If has only comma, assume it's decimal separator
  else if (cleaned.includes(',') && !cleaned.includes('.')) {
    normalized = cleaned.replace(',', '.');
  }
  
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : Math.max(0, parsed);
};

const formatCurrency = (value: number | null): string => {
  if (value === null || value === undefined) return '—';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Mock data generator
const generateMockItems = (): Item[] => [
  {
    id: '1',
    title: 'Tinta Spray Vermelha 400ml',
    price: 15.90,
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'WD-40 300ml',
    price: 25.50,
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Parafuso Phillips 3x20',
    price: null,
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Martelo 500g',
    price: 35.00,
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    title: 'Furadeira Bosch',
    price: 189.90,
    updatedAt: new Date().toISOString()
  }
];

export const EstoquePage: React.FC = () => {
  const { dev } = useAuthContext();
  
  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem('itensMock');
    return saved ? JSON.parse(saved) : generateMockItems();
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lastDeleted, setLastDeleted] = useState<Item | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [importModal, setImportModal] = useState<ImportModalState>({
    isOpen: false,
    file: null,
    isImporting: false
  });
  const [detailsModal, setDetailsModal] = useState<ImportDetailsModal>({
    isOpen: false,
    result: null
  });

  const excelService = createExcelImportService();

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('itensMock', JSON.stringify(items));
  }, [items]);

  // Filter and sort items
  const filteredAndSortedItems = React.useMemo(() => {
    let filtered = items.filter(item => {
      if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortField) {
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'price':
          aVal = a.price ?? -1;
          bVal = b.price ?? -1;
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [items, searchTerm, sortField, sortDirection]);

  // Toast management
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after 5 seconds
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  // Item actions
  const deleteItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    setItemToDelete(item);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    setLastDeleted(itemToDelete);
    setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
    
    addToast({
      type: 'info',
      message: 'Item excluído',
      action: {
        label: 'Desfazer',
        onClick: () => {
          if (lastDeleted) {
            setItems(prev => [...prev, lastDeleted]);
            setLastDeleted(null);
          }
        }
      }
    });

    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setItemToDelete(null);
  };

  const saveItem = (item: Partial<Item>) => {
    // Validation
    if (!item.title || item.title.trim().length < 2) {
      addToast({ type: 'error', message: 'Nome deve ter pelo menos 2 caracteres' });
      return;
    }

    if (item.price !== null && item.price !== undefined && item.price < 0) {
      addToast({ type: 'error', message: 'Preço deve ser maior ou igual a zero' });
      return;
    }

    const now = new Date().toISOString();

    if (isCreating) {
      // Create new item
      const newItem: Item = {
        id: Date.now().toString(),
        title: item.title!.trim(),
        price: item.price || null,
        updatedAt: now
      };
      setItems(prev => [newItem, ...prev]);
      addToast({ type: 'success', message: 'Item criado!' });
    } else {
      // Update existing item
      setItems(prev => prev.map(existingItem => 
        existingItem.id === item.id 
          ? { 
              ...existingItem, 
              ...item, 
              updatedAt: now
            }
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
      updatedAt: new Date().toISOString()
    });
  };

  const startEditing = (item: Item) => {
    setEditingItem({ ...item });
    setIsCreating(false);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setIsCreating(false);
  };

  const openImportModal = () => {
    setImportModal({ isOpen: true, file: null, isImporting: false });
  };

  const closeImportModal = () => {
    setImportModal({ isOpen: false, file: null, isImporting: false });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImportModal(prev => ({ ...prev, file }));
  };

  const handleImport = async () => {
    if (!importModal.file) return;

    setImportModal(prev => ({ ...prev, isImporting: true }));

    try {
      const result = await excelService.importFile(importModal.file, items);
      
      // Update items state
      setItems([...items]);
      
      // Show success toast with details link
      const total = result.imported + result.updated + result.ignored;
      addToast({
        type: 'success',
        message: `Importados ${result.imported} • Atualizados ${result.updated} • Ignorados ${result.ignored}`,
        action: total > 0 && result.errors.length > 0 ? {
          label: 'ver detalhes',
          onClick: () => setDetailsModal({ isOpen: true, result })
        } : undefined
      });
      
      closeImportModal();
    } catch (error) {
      addToast({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Erro ao importar arquivo' 
      });
    } finally {
      setImportModal(prev => ({ ...prev, isImporting: false }));
    }
  };

  const downloadTemplate = () => {
    const data = [
      ['Item', 'Preço (opcional)'],
      ['Tinta Spray Vermelha 400ml', '15,90'],
      ['WD-40 300ml', '25.50'],
      ['Parafuso Phillips 3x20', '']
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Estoque');
    
    // Set column widths
    ws['!cols'] = [
      { width: 30 }, // Item column
      { width: 15 }  // Price column
    ];
    
    XLSX.writeFile(wb, 'modelo_estoque.xlsx');
  };

  const resetMockData = () => {
    if (window.confirm('Resetar todos os dados? Esta ação não pode ser desfeita.')) {
      const mockItems = generateMockItems();
      setItems(mockItems);
      addToast({ type: 'success', message: 'Dados resetados!' });
    }
  };

  // Empty state
  const showEmptyState = filteredAndSortedItems.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Estoque</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Gerencie os produtos da sua loja</p>
          </div>
          
          {/* DEV Reset Link */}
          {dev && (
            <button
              onClick={resetMockData}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Reset mock
            </button>
          )}
        </div>
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
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
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

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={startCreating}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Novo item
            </button>
            
            <button
              onClick={openImportModal}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              ⬆️
              Importar
            </button>
          </div>
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
                    Nome do produto *
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

      {/* Import Modal */}
      <AnimatePresence>
        {importModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Importar Estoque (.xlsx)
              </h3>
              
              <div className="space-y-4">
                {/* Download Template Button */}
                <div className="flex justify-center">
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                  >
                    📄 Baixar modelo (.xlsx)
                  </button>
                </div>
                
                {/* File Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecionar arquivo
                  </label>
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                
                {/* Help Text */}
                <p className="text-xs text-gray-500">
                  Use colunas: Item e Preço (opcional).
                </p>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleImport}
                  disabled={!importModal.file || importModal.isImporting}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {importModal.isImporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Importar
                    </>
                  )}
                </button>
                <button
                  onClick={closeImportModal}
                  disabled={importModal.isImporting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirmar Exclusão
              </h3>
              
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja excluir <strong>"{itemToDelete.title}"</strong>?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors font-medium"
                >
                  Sim, excluir
                </button>
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import Details Modal */}
      <AnimatePresence>
        {detailsModal.isOpen && detailsModal.result && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-96 overflow-y-auto"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detalhes da Importação
              </h3>
              
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-green-600">{detailsModal.result.imported}</div>
                      <div className="text-xs text-gray-600">Importados</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-blue-600">{detailsModal.result.updated}</div>
                      <div className="text-xs text-gray-600">Atualizados</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-orange-600">{detailsModal.result.ignored}</div>
                      <div className="text-xs text-gray-600">Ignorados</div>
                    </div>
                  </div>
                </div>
                
                {/* Errors */}
                {detailsModal.result.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Erros/Avisos ({Math.min(detailsModal.result.errors.length, 10)} de {detailsModal.result.errors.length})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {detailsModal.result.errors.slice(0, 10).map((error, index) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded p-2">
                          <div className="text-sm">
                            <span className="font-medium text-red-800">Linha {error.line}:</span>
                            <span className="text-red-700 ml-1">{error.reason}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setDetailsModal({ isOpen: false, result: null })}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {showEmptyState && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhum item encontrado' : 'Nenhum item cadastrado'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? `Nenhum resultado para "${searchTerm}"` : 'Comece adicionando seu primeiro produto'}
          </p>
          <button
            onClick={startCreating}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-colors font-medium flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Novo item
          </button>
        </div>
      )}

      {/* Items Table/Cards */}
      {!showEmptyState && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th 
                    className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-1">
                      Item
                      {getSortIcon('title')}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center gap-1">
                      Preço
                      {getSortIcon('price')}
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedItems.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {item.title}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-900">{formatCurrency(item.price)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => startEditing(item)}
                          className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden p-4 space-y-4">
            {filteredAndSortedItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.title}
                    </h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatCurrency(item.price)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => startEditing(item)}
                    className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};