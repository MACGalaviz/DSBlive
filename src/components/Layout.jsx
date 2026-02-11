import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Database, FileText, ClipboardList, BarChart3 } from 'lucide-react'
import { useApp } from '../contexts/AppContext'

export default function Layout({ children }) {
  const { darkMode, toggleDarkMode } = useApp()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard' },
    { path: '/fields', icon: Database, label: 'Fields' },
    { path: '/forms', icon: FileText, label: 'Forms' },
    { path: '/records', icon: ClipboardList, label: 'Records' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                DSBlive
              </h1>
            </div>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors
                  ${isActive(path)
                    ? 'bg-gray-50 dark:bg-gray-900 text-blue-600 dark:text-blue-400 border-t-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
