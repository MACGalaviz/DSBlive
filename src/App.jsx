import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import FieldsPage from './pages/FieldsPage'
import FormsPage from './pages/FormsPage'
import RecordsPage from './pages/RecordsPage'
import ChartsPage from './pages/ChartsPage'
import LoginPage from './pages/LoginPage'

function AppContent() {
  const { user, authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <AppProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/fields" element={<FieldsPage />} />
          <Route path="/forms" element={<FormsPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/favorites" element={<RecordsPage favoritesOnly />} />
          <Route path="/charts" element={<ChartsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </AppProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthProvider>
  )
}

export default App