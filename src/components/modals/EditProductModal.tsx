import { motion } from 'framer-motion'
import { Save } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { PriceInput } from '../ui'

export type ProductUI = { id: string; title: string; price: number|null; updatedAt: string }

export function EditProductModal({
  isOpen, initial, creating, onCancel, onSave
}: {
  isOpen: boolean
  initial: ProductUI | null
  creating: boolean
  onCancel: () => void
  onSave: (data: { id?: string; title: string; price: number|null }) => void
}) {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState<number|null>(null)
  const first = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initial) { setTitle(initial.title); setPrice(initial.price ?? null) }
    if (isOpen) setTimeout(() => first.current?.focus(), 50)
  }, [initial, isOpen])

  if (!isOpen || !initial) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
      <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .95 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{creating ? 'Novo Item' : 'Editar Item'}</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="product-title" className="block text-sm font-medium text-gray-700 mb-1">Nome do produto *</label>
            <input
              ref={first}
              type="text"
              id="product-title"
              name="product-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoComplete="off"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Nome do produto"
            />
          </div>
          <div>
            <PriceInput
              value={price ? price.toString() : ""}
              onChange={(_, numericValue) => setPrice(numericValue)}
              placeholder="0,00"
              label="Preço (opcional)"
              id="product-price"
              name="product-price"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => onSave({ id: initial.id, title: title.trim(), price })} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Salvar
          </button>
          <button onClick={onCancel} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  )
}
