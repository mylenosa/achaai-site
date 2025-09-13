import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export type Toast = {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
  action?: { label: string; onClick: () => void }
}

export function ToastStack({ toasts, onDismiss }: {
  toasts: Toast[]
  onDismiss: (id: string) => void
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`p-4 rounded-lg shadow-lg border max-w-sm ${
              t.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
              t.type === 'error'   ? 'bg-red-50 text-red-700 border-red-200' :
                                     'bg-blue-50 text-blue-700 border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm">{t.message}</span>
              <div className="flex items-center gap-2 ml-3">
                {t.action && (
                  <button onClick={t.action.onClick} className="text-xs font-medium underline hover:no-underline">
                    {t.action.label}
                  </button>
                )}
                <button onClick={() => onDismiss(t.id)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
