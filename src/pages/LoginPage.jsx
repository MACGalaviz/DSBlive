import { useState } from 'react'
import { authService } from '../services/supabase'
import { LayoutDashboard, Lock, Mail, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      await authService.signIn(email, password)
    } catch (err) {
      setError('Credenciales inválidas o error de conexión')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-10 border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="p-4 bg-primary/10 rounded-2xl mb-4 text-primary">
            <LayoutDashboard size={48} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black dark:text-white tracking-tighter">DSBlive</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Business Intelligence Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-400 tracking-widest px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 pl-12 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all" 
                placeholder="nombre@empresa.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-400 tracking-widest px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 pl-12 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all" 
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-xl text-center">{error}</div>}

          <button 
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'ACCEDER AL SISTEMA'}
          </button>
        </form>
      </div>
    </div>
  )
}
