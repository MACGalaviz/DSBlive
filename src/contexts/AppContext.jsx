import { createContext, useContext, useState, useEffect } from 'react'
import { fieldService, formTypeService, recordService } from '../services/supabase'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [fields, setFields] = useState([])
  const [formTypes, setFormTypes] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  // Persist dark mode
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const loadData = async () => {
    try {
      setLoading(true)
      const [fieldsData, formTypesData, recordsData] = await Promise.all([
        fieldService.getAll(),
        formTypeService.getAll(),
        recordService.getAll()
      ])
      setFields(fieldsData)
      setFormTypes(formTypesData)
      setRecords(recordsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleDarkMode = () => setDarkMode(!darkMode)

  // CRUD Fields
  const createField = async (field) => {
    const newField = await fieldService.create(field)
    setFields([...fields, newField])
    return newField
  }

  const updateField = async (id, field) => {
    const updated = await fieldService.update(id, field)
    setFields(fields.map(f => f.id === id ? updated : f))
    return updated
  }

  const deleteField = async (id) => {
    await fieldService.delete(id)
    setFields(fields.filter(f => f.id !== id))
  }

  // CRUD Form Types
  const createFormType = async (formType, fieldIds) => {
    const newForm = await formTypeService.create(formType, fieldIds)
    await loadData() // Reload to get relationships
    return newForm
  }

  const updateFormType = async (id, formType, fieldIds) => {
    await formTypeService.update(id, formType, fieldIds)
    await loadData()
  }

  const deleteFormType = async (id) => {
    await formTypeService.delete(id)
    setFormTypes(formTypes.filter(f => f.id !== id))
  }

  // CRUD Records
  const createRecord = async (record) => {
    const newRecord = await recordService.create(record)
    setRecords([newRecord, ...records])
    return newRecord
  }

  const updateRecord = async (id, record) => {
    const updated = await recordService.update(id, record)
    setRecords(records.map(r => r.id === id ? updated : r))
    return updated
  }

  const deleteRecord = async (id) => {
    await recordService.delete(id)
    setRecords(records.filter(r => r.id !== id))
  }

  const value = {
    fields,
    formTypes,
    records,
    loading,
    darkMode,
    toggleDarkMode,
    createField,
    updateField,
    deleteField,
    createFormType,
    updateFormType,
    deleteFormType,
    createRecord,
    updateRecord,
    deleteRecord,
    refreshData: loadData
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
