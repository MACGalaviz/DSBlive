import { useEffect } from 'react'
import { X } from 'lucide-react'

// Reusable confirmation modal styled to match the app's cards.
// Controlled: render it always and drive it with `open`.
const VARIANTS = {
  danger: { button: 'bg-red-600 hover:bg-red-700', accent: 'text-red-600 dark:text-red-400', ring: 'bg-red-100 dark:bg-red-900/30' },
  success: { button: 'bg-green-600 hover:bg-green-700', accent: 'text-green-600 dark:text-green-400', ring: 'bg-green-100 dark:bg-green-900/30' },
  primary: { button: 'bg-blue-600 hover:bg-blue-700', accent: 'text-blue-600 dark:text-blue-400', ring: 'bg-blue-100 dark:bg-blue-900/30' },
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  icon: Icon,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  const v = VARIANTS[variant] || VARIANTS.primary

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          {Icon && (
            <div className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${v.ring}`}>
              <Icon className={`w-5 h-5 ${v.accent}`} />
            </div>
          )}
          <div className="flex-1">
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {message && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white transition-colors ${v.button}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
