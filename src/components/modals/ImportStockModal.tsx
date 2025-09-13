import { motion } from 'framer-motion'
import { FileText, Upload } from 'lucide-react'
import { useState } from 'react'
import * as XLSX from 'xlsx'
import { parseBRL } from '../../utils/formatters'
import { createProduct, updateProduct } from '../../services/StoreService'

export function ImportStockModal({
  isOpen, storeId, existingTitles, onClose, onResult
}: {
  isOpen: boolean
  storeId: number
  existingTitles: Map<string, { id: number }>
  onClose: () => void
  onResult: (res: { imported: number; updated: number; ignored: number; errors: Array<{ line: number; reason: string }> }) => void
}) {
  const [file, setFile] = useState<File|null>(null)
  const [busy, setBusy] = useState(false)

  if (!isOpen) return null

  const downloadTemplate = () => {
    const data = [['Item', 'Preço (opcional)'], ['Tinta Spray Vermelha 400ml', '15,90'], ['WD-40 300ml', '25,50'], ['Parafuso Phillips 3x20', '']]
    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Estoque')
    ;(ws as any)['!cols'] = [{ width: 30 }, { width: 15 }]
    XLSX.writeFile(wb, 'modelo_estoque.xlsx')
  }

  const handleImport = async () => {
    if (!file) return
    setBusy(true)
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 }) as any[][]
      const body = rows.slice(1)

      const norm = (s: string) => s.toLowerCase().trim()
      let imported = 0, updated = 0
      const errors: Array<{ line: number; reason: string }> = []

      for (let i = 0; i < body.length; i++) {
        const [rawTitle, rawPrice] = body[i]
        const title = typeof rawTitle === 'string' ? rawTitle.trim() : ''
        if (!title) { errors.push({ line: i + 2, reason: 'Item vazio' }); continue }
        const price = (typeof rawPrice === 'string' || typeof rawPrice === 'number') ? parseBRL(String(rawPrice)) : null
        const key = norm(title)
        const existing = existingTitles.get(key)
        if (existing) { await updateProduct(existing.id, title, price); updated++ }
        else { await createProduct(storeId, title, price); imported++ }
      }

      onResult({ imported, updated, ignored: 0, errors })
      onClose()
    } catch (e) {
      onResult({ imported: 0, updated: 0, ignored: 0, errors: [{ line: 0, reason: e instanceof Error ? e.message : 'Erro ao importar' }] })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
      <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .95 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Importar Estoque (.xlsx)</h3>

        <div className="space-y-4">
          <div className="flex justify-center">
            <button onClick={downloadTemplate} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium text-sm">
              <FileText className="w-4 h-4" /> Baixar modelo (.xlsx)
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Selecionar arquivo</label>
            <input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
          </div>
          <p className="text-xs text-gray-500">Use colunas: Item e Preço (opcional).</p>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleImport} disabled={!file || busy}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2">
            {busy ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Importando...</>) : (<><Upload className="w-4 h-4" /> Importar</>)}
          </button>
          <button onClick={onClose} disabled={busy} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">Cancelar</button>
        </div>
      </motion.div>
    </div>
  )
}
