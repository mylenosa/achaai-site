import { useEffect, useMemo, useState, type FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Edit3, Trash2, ChevronUp, ChevronDown, Upload } from 'lucide-react'

import { useAuthContext } from '../hooks/useAuth'
import { formatBRL } from '../utils/formatters'

import { ToastStack, type Toast } from '../components/ToastStack'
import { EditProductModal, type ProductUI } from '../components/modals/EditProductModal'
import { ConfirmDeleteModal } from '../components/modals/ConfirmDeleteModal'
import { ImportStockModal } from '../components/modals/ImportStockModal'

import {
  getMyStoreId,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../services/productService'

type SortField = 'title' | 'price'
type SortDirection = 'asc' | 'desc'

export const EstoquePage: FC = () => {
  const { dev } = useAuthContext()

  const [storeId, setStoreId] = useState<number | null>(null)
  const [items, setItems] = useState<ProductUI[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('title')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const [editingItem, setEditingItem] = useState<ProductUI | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ProductUI | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  const [toasts, setToasts] = useState<Toast[]>([])

  /* --------------------------- helpers --------------------------- */
  const addToast = (t: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { ...t, id }])
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 5000)
  }
  const dismissToast = (id: string) =>
    setToasts(prev => prev.filter(t => t.id !== id))

  const mapDbToUI = (rows: { id: number; nome: string | null; preco: number | null; updated_at: string }[]) =>
    rows.map(r => ({ id: String(r.id), title: r.nome ?? '', price: r.preco ?? null, updatedAt: r.updated_at }))

  /* ------------------------ carregar loja+itens ------------------------ */
  useEffect(() => {
    ;(async () => {
      try {
        const id = await getMyStoreId()
        setStoreId(id)
        if (id) {
          const rows = await listProducts(id)
          setItems(mapDbToUI(rows))
        } else {
          addToast({ type: 'info', message: 'Crie o perfil da loja primeiro.' })
        }
      } catch (e: any) {
        addToast({ type: 'error', message: e?.message ?? 'Erro ao carregar estoque' })
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refresh = async () => {
    if (!storeId) return
    const rows = await listProducts(storeId)
    setItems(mapDbToUI(rows))
  }

  /* ---------------------------- busca / sort ---------------------------- */
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter(i =>
      searchTerm ? i.title.toLowerCase().includes(searchTerm.toLowerCase()) : true
    )
    filtered.sort((a, b) => {
      let aVal: any, bVal: any
      if (sortField === 'title') { aVal = a.title.toLowerCase(); bVal = b.title.toLowerCase() }
      else { aVal = a.price ?? -1; bVal = b.price ?? -1 }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return filtered
  }, [items, searchTerm, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDirection(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDirection('asc') }
  }
  const getSortIcon = (field: SortField) =>
    sortField !== field ? null : (sortDirection === 'asc'
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />)

  /* ------------------------------ CRUD ------------------------------ */
  const startCreating = () => {
    setIsCreating(true)
    setEditingItem({ id: '', title: '', price: null, updatedAt: new Date().toISOString() })
  }
  const startEditing = (it: ProductUI) => { setEditingItem({ ...it }); setIsCreating(false) }
  const cancelEditing = () => { setEditingItem(null); setIsCreating(false) }

  const saveItem = async (item: Partial<ProductUI>) => {
    if (!storeId) return addToast({ type: 'error', message: 'Loja não encontrada' })
    if (!item.title || item.title.trim().length < 2)
      return addToast({ type: 'error', message: 'Nome deve ter pelo menos 2 caracteres' })
    if (item.price != null && item.price < 0)
      return addToast({ type: 'error', message: 'Preço deve ser ≥ 0' })

    try {
      if (isCreating) {
        const row = await createProduct(storeId, item.title!.trim(), item.price ?? null)
        setItems(prev => [{ id: String(row.id), title: row.nome ?? '', price: row.preco ?? null, updatedAt: row.updated_at }, ...prev])
        addToast({ type: 'success', message: 'Item criado!' })
      } else {
        const row = await updateProduct(Number(item.id), item.title!.trim(), item.price ?? null)
        const next = { id: String(row.id), title: row.nome ?? '', price: row.preco ?? null, updatedAt: row.updated_at }
        setItems(prev => prev.map(p => (p.id === next.id ? next : p)))
        addToast({ type: 'success', message: 'Item atualizado!' })
      }
      setEditingItem(null); setIsCreating(false)
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message ?? 'Erro ao salvar' })
    }
  }

  const deleteItem = (id: string) => {
    const it = items.find(i => i.id === id)
    if (!it) return
    setItemToDelete(it)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    try {
      await deleteProduct(Number(itemToDelete.id))
      setItems(prev => prev.filter(i => i.id !== itemToDelete.id))
      addToast({ type: 'info', message: 'Item excluído' })
    } catch (e: any) {
      addToast({ type: 'error', message: e?.message ?? 'Erro ao excluir' })
    } finally {
      setItemToDelete(null)
    }
  }

  /* ------------------------------ render ------------------------------ */
  const showEmptyState = !loading && filteredAndSortedItems.length === 0

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Estoque</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Gerencie os produtos da sua loja</p>
          </div>
          {dev && storeId && (
            <span className="text-xs text-gray-400">store #{storeId}</span>
          )}
        </div>
      </div>

      {/* Toasts */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      {/* Toolbar */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={startCreating}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 sm:py-3 rounded-lg transition-colors font-medium text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Novo item
            </button>

            <button
              onClick={() => setImportOpen(true)}
              className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 sm:py-3 rounded-lg transition-colors font-medium text-sm sm:text-base"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              Importar
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {showEmptyState && !loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-gray-400 mb-4"><Search className="w-12 h-12 mx-auto" /></div>
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
            <Plus className="w-5 h-5" /> Novo item
          </button>
        </div>
      )}

      {/* Tabela / Cards */}
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
                      <div className="font-medium text-gray-900">{item.title}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-900">{formatBRL(item.price)}</span>
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
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <div className="text-sm text-gray-600 mt-1">{formatBRL(item.price)}</div>
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

      {/* Modais */}
      <AnimatePresence>
        <EditProductModal
          isOpen={!!editingItem}
          initial={editingItem}
          creating={isCreating}
          onCancel={cancelEditing}
          onSave={(payload) => saveItem({ ...payload })}
        />
      </AnimatePresence>

      <AnimatePresence>
        {importOpen && storeId && (
          <ImportStockModal
            isOpen={importOpen}
            storeId={storeId}
            existingTitles={new Map(items.map(i => [i.title.toLowerCase().trim(), { id: Number(i.id) }]))}
            onClose={() => setImportOpen(false)}
            onResult={async (res) => {
              if (res.errors.length) addToast({ type: 'error', message: `Erros: ${res.errors.length}` })
              if (res.imported || res.updated) await refresh()
              addToast({
                type: 'success',
                message: `Importados ${res.imported} • Atualizados ${res.updated}${res.errors.length ? ` • Erros ${res.errors.length}` : ''}`
              })
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {itemToDelete && (
          <ConfirmDeleteModal
            isOpen={!!itemToDelete}
            itemTitle={itemToDelete.title}
            onConfirm={confirmDelete}
            onCancel={() => setItemToDelete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
