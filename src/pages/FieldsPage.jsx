import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react'

const DATA_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'selector', label: 'Selector (options)' },
  { value: 'boolean', label: 'Yes/No' }
]

export default function FieldsPage() {
  const { fields, createField, updateField, deleteField, loading } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    data_type: 'text',
    options: ''
  })

  const resetForm = () => {
    setFormData({ name: '', data_type: 'text', options: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (field) => {
    setFormData({
      name: field.name,
      data_type: field.data_type,
      options: field.options ? field.options.join(', ') : ''
    })
    setEditingId(field.id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const fieldData = {
      name: formData.name.trim(),
      data_type: formData.data_type,
      options: formData.data_type === 'selector' && formData.options
        ? formData.options.split(',').map(o => o.trim()).filter(Boolean)
        : null
    }

    try {
      if (editingId) {
        await updateField(editingId, fieldData)
      } else {
        await createField(fieldData)
      }
      resetForm()
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this field?')) {
      try {
        await deleteField(id)
      } catch (error) {
        alert('Error: ' + error.message)
      }
    }
  }

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
            Field Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage fields for your forms
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Field
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingId ? 'Edit Field' : 'New Field'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Field Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. price, quantity, store"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Type
              </label>
              <select
                value={formData.data_type}
                onChange={(e) => setFormData({ ...formData, data_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {DATA_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.data_type === 'selector' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Options (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.options}
                  onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. kg, liters, units"
                  required
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Create'}
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

      {/* Field List */}
      {fields.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            No fields created yet. Create your first field!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map(field => (
            <div
              key={field.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {field.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {DATA_TYPES.find(t => t.value === field.data_type)?.label}
                  </p>
                  {field.options && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Options: {field.options.join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(field)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(field.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
