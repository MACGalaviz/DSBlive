import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { Plus, Edit2, Trash2, X, Save, Filter } from 'lucide-react'

export default function RecordsPage() {
  const { fields, formTypes, records, createRecord, updateRecord, deleteRecord, loading } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedFormType, setSelectedFormType] = useState(null)
  const [filterFormType, setFilterFormType] = useState('all')
  const [formValues, setFormValues] = useState({})

  const resetForm = () => {
    setFormValues({})
    setSelectedFormType(null)
    setEditingId(null)
    setShowForm(false)
  }

  const handleSelectFormType = (formId) => {
    const form = formTypes.find(f => f.id === formId)
    setSelectedFormType(form)
    
    const initialValues = {}
    form.form_fields.forEach(ff => {
      initialValues[ff.fields.id] = ''
    })
    setFormValues(initialValues)
  }

  const handleEdit = (record) => {
    const form = formTypes.find(f => f.id === record.form_type_id)
    setSelectedFormType(form)
    setFormValues(record.data || {})
    setEditingId(record.id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const recordData = {
      form_type_id: selectedFormType.id,
      data: formValues,
      created_at: editingId ? undefined : new Date().toISOString()
    }

    try {
      if (editingId) {
        await updateRecord(editingId, recordData)
      } else {
        await createRecord(recordData)
      }
      resetForm()
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await deleteRecord(id)
      } catch (error) {
        alert('Error: ' + error.message)
      }
    }
  }

  const renderField = (field) => {
    const value = formValues[field.id] || ''

    switch (field.data_type) {
      case 'number':
        return (
          <input
            type="number"
            step="any"
            value={value}
            onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            required
          />
        )
      
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            required
          />
        )
      
      case 'time':
        return (
          <input
            type="time"
            value={value}
            onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            required
          />
        )
      
      case 'selector':
        return (
          <select
            value={value}
            onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      
      case 'boolean':
        return (
          <select
            value={value}
            onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select...</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        )
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            required
          />
        )
    }
  }

  const getFieldById = (fieldId) => {
    return fields.find(f => f.id === fieldId)
  }

  const formatValue = (field, value) => {
    if (!value) return '-'
    
    switch (field?.data_type) {
      case 'boolean':
        return value === 'true' ? 'Yes' : 'No'
      case 'number':
        return parseFloat(value).toLocaleString()
      default:
        return value
    }
  }

  const filteredRecords = filterFormType === 'all'
    ? records
    : records.filter(r => r.form_type_id === filterFormType)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Record Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Register data using your forms
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={formTypes.length === 0}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          New Record
        </button>
      </div>

      {formTypes.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 dark:text-yellow-200">
            You must create forms before registering data.
          </p>
        </div>
      )}

      {showForm && !selectedFormType && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select a Form Type
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formTypes.map(form => (
              <button
                key={form.id}
                onClick={() => handleSelectFormType(form.id)}
                className="text-left p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {form.name}
                </h4>
                {form.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {form.description}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {showForm && selectedFormType && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingId ? 'Edit Record' : `New Record: ${selectedFormType.name}`}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedFormType.form_fields
              .sort((a, b) => a.sort_order - b.sort_order)
              .map(ff => (
                <div key={ff.fields.id}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {ff.fields.name}
                    <span className="text-xs text-gray-500 ml-2">
                      ({ff.fields.data_type})
                    </span>
                  </label>
                  {renderField(ff.fields)}
                </div>
              ))}

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {records.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filterFormType}
            onChange={(e) => setFilterFormType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All forms</option>
            {formTypes.map(form => (
              <option key={form.id} value={form.id}>
                {form.name}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {filteredRecords.length} record(s)
          </span>
        </div>
      )}

      {filteredRecords.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            No records yet. Create your first record!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map(record => {
            const form = formTypes.find(f => f.id === record.form_type_id)
            
            return (
              <div
                key={record.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {form?.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(record.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(record)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(record.data || {}).map(([fieldId, value]) => {
                    const field = getFieldById(parseInt(fieldId))
                    if (!field) return null
                    
                    return (
                      <div key={fieldId} className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {field.name}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatValue(field, value)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}