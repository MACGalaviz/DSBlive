import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import FieldsPage from './pages/FieldsPage'
import FormsPage from './pages/FormsPage'
import RecordsPage from './pages/RecordsPage'

function App() {
  return (
    <AppProvider>
      <BrowserRouter basename="/DSBlive/">
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/fields" element={<FieldsPage />} />
            <Route path="/forms" element={<FormsPage />} />
            <Route path="/records" element={<RecordsPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
