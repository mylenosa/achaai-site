import { motion } from 'framer-motion'

export function ConfirmDeleteModal({
  isOpen, itemTitle, onConfirm, onCancel
}: {
  isOpen: boolean
  itemTitle: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
      <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .95 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Exclusão</h3>
        <p className="text-gray-600 mb-6">Tem certeza que deseja excluir <strong>"{itemTitle}"</strong>?</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors font-medium">Sim, excluir</button>
          <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
        </div>
      </motion.div>
    </div>
  )
}
