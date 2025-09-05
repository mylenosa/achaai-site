import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  CheckCircle, 
  Edit3, 
  Trash2,
  Clock,
  AlertTriangle,
  X,
  Save,
  Upload,
  Download,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  DollarSign
} from 'lucide-react';
import { Item, parseCurrency, formatCurrency, ageInDays, toTitleKey, generateInventoryTemplate, parseInventoryExcel } from '../lib/utils';

// Business thresholds
const VERIFY_DAYS = 60;
const OLD_DAYS = 120;

type FilterType = 'all' | 'available' | 'unavailable' | 'outdated' | 'no-price';
type SortField = 'title' | 'price' | 'verifiedAt';
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

interface ImportResult {
  imported: number;
  updated: number;
  ignored: number;
  errors: { line: number; reason: string }[];
}

// Mock data generator
const generateMockItems = (): Item[] => [
  {
    id: '1',
    title: 'Tinta Spray Vermelha 400ml',
    price: 15.90,
    available: true,
    verifiedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    title: 'WD-40 300ml',
    price: 25.50,
    available: true,
    verifiedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(), // 80 days ago
    updatedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    title: 'Parafuso Phillips 3x20',
    price: null,
    available: false,
    verifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    title: 'Martelo 500g',
    price: 35.00,
    available: true,
    verifiedAt: new Date(Date.now() - 140 * 24 * 60 * 60 * 1000).toISOString(), // 140 days ago
    updatedAt: new Date(Date.now() - 140 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    title: 'Furadeira Bosch',
    price: 189.90,
    available: false,
    verifiedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
    updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const EstoquePage: React.FC = () => {
  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem('inventory_items');
    return saved ? JSON.parse(saved) : generateMockItems();
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastDeleted, setLastDeleted] = useState<Item | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [markAsAvailable, setMarkAsAvailable] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  
  const itemsPerPage = 50;

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('inventory_items', JSON.stringify(items));
  }, [items]);

  // Filter and sort items
  const filteredAndSortedItems = React.useMemo(() => {
    let filtered = items.filter(item => {
      // Search filter
      if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Category filter
      switch (activeFilter) {
        case 'available':
          return item.available;
        case 'unavailable':
          return !item.available;
        case 'outdated':
          return item.verifiedAt && ageInDays(item.verifiedAt) > VERIFY_DAYS;
        case 'no-price':
          return item.price === null;
        default:
          return true;
      }
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
        case 'verifiedAt':
          aVal = a.verifiedAt ? new Date(a.verifiedAt).getTime() : 0;
          bVal = b.verifiedAt ? new Date(b.verifiedAt).getTime() : 0;
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [items, searchTerm, activeFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);
  const paginatedItems = filteredAndSortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = {
    total: items.length,
    available: items.filter(item => item.available).length,
    outdated: items.filter(item => item.verifiedAt && ageInDays(item.verifiedAt) > VERIFY_DAYS).length
  };

  // Filter chips configuration
  const filterChips = [
    { id: 'all', label: 'Todos', count: items.length },
    { id: 'available', label: 'Disponíveis', count: stats.available },
    { id: 'unavailable', label: 'Indisponíveis', count: items.length - stats.available },
    { id: 'outdated', label: 'A revisar (≥60d)', count: stats.outdated },
    { id: 'no-price', label: 'Sem preço', count: items.filter(item => item.price === null).length }
  ];

  // Check if bulk confirm should be enabled
  const canBulkConfirm = items.some(item => 
    !item.available || (item.verifiedAt && ageInDays(item.verifiedAt) > VERIFY_DAYS)
  );

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

  // Get verification status color
  const getVerificationStatus = (item: Item) => {
    if (!item.verifiedAt) return 'text-gray-400';
    const days = ageInDays(item.verifiedAt);
    if (days <= VERIFY_DAYS) return { color: 'text-green-600', bg: 'bg-green-100', label: 'OK' };
    if (days <= OLD_DAYS) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'A revisar' };
    return { color: 'text-red-600', bg: 'bg-red-100', label: 'Desatualizado' };
  };

  // Item actions
  const toggleAvailable = (itemId: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            available: !item.available,
            verifiedAt: !item.available ? new Date().toISOString() : item.verifiedAt,
            updatedAt: new Date().toISOString()
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
            available: true,
            updatedAt: new Date().toISOString()
          }
        : item
    ));
    addToast({ type: 'success', message: 'Item confirmado!' });
  };

  const confirmAllItems = () => {
    const now = new Date().toISOString();
    const toUpdate = items.filter(item => 
      !item.available || (item.verifiedAt && ageInDays(item.verifiedAt) > VERIFY_DAYS)
    );
    
    setItems(prev => prev.map(item => {
      const needsUpdate = !item.available || (item.verifiedAt && ageInDays(item.verifiedAt) > VERIFY_DAYS);
      return needsUpdate ? {
        ...item,
        verifiedAt: now,
        available: true,
        updatedAt: now
      } : item;
    }));
    
    addToast({ type: 'success', message: `Disponibilidade confirmada para ${toUpdate.length} itens` });
  };

  const deleteItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (window.confirm(`Excluir "${item.title}"?`)) {
      setLastDeleted(item);
      setItems(prev => prev.filter(i => i.id !== itemId));
      
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
    }
  };

  const saveItem = (item: Partial<Item>) => {
    // Validation
    if (!item.title || item.title.trim().length < 2) {
      addToast({ type: 'error', message: 'Título deve ter pelo menos 2 caracteres' });
      return;
    }

    if (item.price !== null && item.price !== undefined && item.price < 0) {
      addToast({ type: 'error', message: 'Preço deve ser maior ou igual a zero' });
      return;
    }

    // Check for duplicates (case-insensitive)
    const titleKey = toTitleKey(item.title!);
    const isDuplicate = items.some(existingItem => 
      existingItem.id !== item.id && 
      toTitleKey(existingItem.title) === titleKey
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
        verifiedAt: item.available ? now : undefined,
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
              updatedAt: now,
              // Auto-confirm if available and editing title/price
              verifiedAt: (existingItem.available && (item.title !== existingItem.title || item.price !== existingItem.price)) 
                ? now 
                : existingItem.verifiedAt
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
      available: true,
      updatedAt: new Date().toISOString()
    });
  };

  const startEditingPrice = (item: Item) => {
    setEditingItem({ ...item });
    setIsCreating(false);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setIsCreating(false);
  };

  // Import functions
  const handleImport = async () => {
    if (!importFile) return;
    
    setIsImporting(true);
    try {
      const data = await parseInventoryExcel(importFile);
      const now = new Date().toISOString();
      const result: ImportResult = {
        imported: 0,
        updated: 0,
        ignored: 0,
        errors: []
      };

      const newItems = [...items];
      
      data.forEach((row, index) => {
        try {
          // Validate
          if (row.title.length < 2) {
            result.errors.push({ line: index + 2, reason: 'Título muito curto (mínimo 2 caracteres)' });
            result.ignored++;
            return;
          }
          
          if (row.price !== null && row.price < 0) {
            result.errors.push({ line: index + 2, reason: 'Preço deve ser maior ou igual a zero' });
            result.ignored++;
            return;
          }

          // Check if exists (case-insensitive)
          const titleKey = toTitleKey(row.title);
          const existingIndex = newItems.findIndex(item => toTitleKey(item.title) === titleKey);
          
          if (existingIndex >= 0) {
            // Update existing
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              price: row.price,
              available: markAsAvailable,
              verifiedAt: markAsAvailable ? now : newItems[existingIndex].verifiedAt,
              updatedAt: now
            };
            result.updated++;
          } else {
            // Create new
            const newItem: Item = {
              id: `import-${Date.now()}-${index}`,
              title: row.title,
              price: row.price,
              available: markAsAvailable,
              verifiedAt: markAsAvailable ? now : undefined,
              updatedAt: now
            };
            newItems.unshift(newItem);
            result.imported++;
          }
        } catch (error) {
          result.errors.push({ line: index + 2, reason: 'Erro ao processar linha' });
          result.ignored++;
        }
      });

      setItems(newItems);
      setImportResult(result);
      
      addToast({ 
        type: 'success', 
        message: `Importados ${result.imported} • Atualizados ${result.updated} • Ignorados ${result.ignored}` 
      });
      
    } catch (error) {
      addToast({ type: 'error', message: 'Erro ao processar arquivo Excel' });
    } finally {
      setIsImporting(false);
    }
  };

  const resetImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportResult(null);
    setMarkAsAvailable(true);
  };

  const resetMockData = () => {
    if (window.confirm('Resetar todos os dados? Esta ação não pode ser desfeita.')) {
      // Generate items with distributed verification dates (0-150 days)
      const mockItems = Array.from({ length: 30 }, (_, i) => {
        const daysAgo = Math.floor(Math.random() * 150);
        const verifiedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
        
        return {
          id: `mock-${i + 1}`,
          title: [
            'Tinta Spray Vermelha 400ml',
            'WD-40 300ml',
            'Parafuso Phillips 3x20',
            'Martelo 500g',
            'Furadeira Bosch',
            'Chave de Fenda',
            'Alicate Universal',
            'Fita Isolante',
            'Cola Branca',
            'Lixa d\'Água',
            'Prego 2x12',
            'Parafuso Fenda 4x30',
            'Tinta Látex Branca',
            'Pincel 2 polegadas',
            'Rolo de Pintura',
            'Massa Corrida',
            'Verniz Incolor',
            'Thinner',
            'Aguarrás',
            'Selador Acrílico',
            'Broca 6mm',
            'Broca 8mm',
            'Broca 10mm',
            'Parafusadeira',
            'Nível de Bolha',
            'Trena 5m',
            'Esquadro',
            'Régua 30cm',
            'Estilete',
            'Fita Dupla Face'
          ][i] || `Produto ${i + 1}`,
          price: Math.random() > 0.3 ? Math.round((Math.random() * 200 + 5) * 100) / 100 : null,
          available: Math.random() > 0.2,
          verifiedAt,
          updatedAt: verifiedAt
        };
      });
      
      setItems(mockItems);
      addToast({ type: 'success', message: 'Dados resetados!' });
    }
  };

  // Empty state
  const showEmptyState = paginatedItems.length === 0 && (searchTerm || activeFilter !== 'all');

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
            disabled={!canBulkConfirm}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            Confirmar disponibilidade
          </button>
          
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Upload className="w-4 h-4" />
            Importar .xlsx
          </button>
          
          <button
            onClick={generateInventoryTemplate}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            Baixar modelo
          </button>
          
          <button
            onClick={resetMockData}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Reset mock
          </button>
        </div>
      </div>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
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
              
              {!importResult ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selecionar arquivo
                    </label>
                    <input
                      type="file"
                      accept=".xlsx"
                      onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="markAvailable"
                      checked={markAsAvailable}
                      onChange={(e) => setMarkAsAvailable(e.target.checked)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="markAvailable" className="ml-2 text-sm text-gray-700">
                      Marcar todos como disponíveis
                    </label>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleImport}
                      disabled={!importFile || isImporting}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      {isImporting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {isImporting ? 'Importando...' : 'Importar'}
                    </button>
                    <button
                      onClick={resetImportModal}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Importação concluída!</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <div>• {importResult.imported} itens importados</div>
                      <div>• {importResult.updated} itens atualizados</div>
                      <div>• {importResult.ignored} itens ignorados</div>
                    </div>
                  </div>
                  
                  {importResult.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-800 mb-2">Erros encontrados:</h4>
                      <div className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                        {importResult.errors.slice(0, 10).map((error, index) => (
                          <div key={index}>Linha {error.line}: {error.reason}</div>
                        ))}
                        {importResult.errors.length > 10 && (
                          <div>... e mais {importResult.errors.length - 10} erros</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={resetImportModal}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition-colors font-medium"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                    Tem agora?
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

      {/* Empty State */}
      {showEmptyState && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum item encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? `Nenhum resultado para "${searchTerm}"` : 'Nenhum item neste filtro'}
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
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Tem agora?</th>
                  <th 
                    className="text-center py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('verifiedAt')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Última confirmação
                      {getSortIcon('verifiedAt')}
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item, index) => {
                  const daysOld = item.verifiedAt ? ageInDays(item.verifiedAt) : null;
                  const verificationStatus = getVerificationStatus(item);
                  
                  return (
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
                        {item.price ? (
                          <span className="text-gray-900">{formatCurrency(item.price)}</span>
                        ) : (
                          <button
                            onClick={() => startEditingPrice(item)}
                            className="text-gray-400 hover:text-emerald-600 text-sm flex items-center gap-1 transition-colors"
                          >
                            <DollarSign className="w-4 h-4" />
                            + Preço
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleAvailable(item.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                            item.available ? 'bg-emerald-500' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              item.available ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {daysOld !== null ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${verificationStatus.color} ${verificationStatus.bg}`}>
                              {verificationStatus.label}
                            </span>
                            <span className="text-xs text-gray-500">{daysOld}d</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {daysOld && daysOld > VERIFY_DAYS && (
                            <button
                              onClick={() => confirmItem(item.id)}
                              className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                              title="Confirmar agora"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setEditingItem(item)}
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
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden p-4 space-y-4">
            {paginatedItems.map((item, index) => {
              const daysOld = item.verifiedAt ? ageInDays(item.verifiedAt) : null;
              const verificationStatus = getVerificationStatus(item);
              
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
                      <h3 className="font-medium text-gray-900">
                        {item.title}
                      </h3>
                      <div className="text-sm text-gray-600 mt-1">
                        {item.price ? (
                          formatCurrency(item.price)
                        ) : (
                          <button
                            onClick={() => startEditingPrice(item)}
                            className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                          >
                            <DollarSign className="w-4 h-4" />
                            + Preço
                          </button>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAvailable(item.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        item.available ? 'bg-emerald-500' : 'bg-gray-200'
                      }`}
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
                      <Clock className="w-4 h-4 text-gray-400" />
                      {daysOld !== null ? (
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${verificationStatus.color} ${verificationStatus.bg}`}>
                            {verificationStatus.label}
                          </span>
                          <span className="text-xs text-gray-500">{daysOld}d</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Não confirmado</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {daysOld && daysOld > VERIFY_DAYS && (
                        <button
                          onClick={() => confirmItem(item.id)}
                          className="p-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setEditingItem(item)}
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
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer with Stats and Pagination */}
      {!showEmptyState && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-600">
              {stats.total} itens • {stats.available} disponíveis • {stats.outdated} a revisar
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};