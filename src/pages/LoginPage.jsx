import { useState } from 'react'
import { authService } from '../services/supabase'
import { LayoutDashboard, Lock, Mail, Loader2, Sun, Moon } from 'lucide-react'

// Public read-only demo account (shown on the login screen and in the README).
// Create this user in Supabase > Authentication; it cannot edit data (RLS).
const DEMO_EMAIL = 'demo@dsblive.app'
const DEMO_PASSWORD = 'DemoDSB2026'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  // Local theme toggle: writes the same key/class AppContext uses, so the
  // choice carries over once logged in.
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode') || 'false'))

  const toggleTheme = () => {
    const next = !darkMode
    setDarkMode(next)
    localStorage.setItem('darkMode', JSON.stringify(next))
    document.documentElement.classList.toggle('dark', next)
  }

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
      <button
        onClick={toggleTheme}
        className="fixed top-5 right-5 p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
      </button>
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
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 pl-12 text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary outline-none transition-all"
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
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 pl-12 text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary outline-none transition-all"
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

        <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl text-center">
          <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-2">Demo Access · Read-only</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{DEMO_EMAIL}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-3">{DEMO_PASSWORD}</p>
          <button
            type="button"
            onClick={() => { setEmail(DEMO_EMAIL); setPassword(DEMO_PASSWORD) }}
            className="text-xs font-bold text-primary hover:underline"
          >
            Fill demo credentials
          </button>
        </div>
      </div>
    </div>
  )
}
