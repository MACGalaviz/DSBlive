import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Edit2, Trash2, X, Save, GripVertical, BarChart3, Search } from 'lucide-react'
import { availableCharts, countFieldTypes } from '../utils/charts'

export default function FormsPage() {
  const { fields, formTypes, createFormType, updateFormType, deleteFormType, loading } = useApp()
  const { isOwner } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [selectedFields, setSelectedFields] = useState([])
  const [search, setSearch] = useState('')
  // Enabled dashboard charts for this form. null => all applicable charts.
  const [chartConfig, setChartConfig] = useState(null)

  const query = search.trim().toLowerCase()
  const filteredForms = query
    ? formTypes.filter(form =>
        form.name.toLowerCase().includes(query) ||
        (form.description || '').toLowerCase().includes(query) ||
        form.form_fields?.some(ff => ff.fields.name.toLowerCase().includes(query))
      )
    : formTypes

  const resetForm = () => {
    setFormData({ name: '', description: '' })
    setSelectedFields([])
    setChartConfig(null)
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (formType) => {
    setFormData({
      name: formType.name,
      description: formType.description || ''
    })

    const sortedFields = formType.form_fields
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(ff => ff.fields.id)

    setSelectedFields(sortedFields)
    setChartConfig(formType.chart_config ?? null)
    setEditingId(formType.id)
    setShowForm(true)
  }

  // Charts available given the currently selected fields' types.
  const selectedFieldObjects = selectedFields.map(id => fields.find(f => f.id === id)).filter(Boolean)
  const chartOptions = availableCharts(countFieldTypes(selectedFieldObjects))
  const enabledChartKeys = chartConfig ?? chartOptions.map(c => c.key)
  const isChartChecked = (key) => enabledChartKeys.includes(key)
  const toggleChart = (key) => {
    const base = chartConfig ?? chartOptions.map(c => c.key)
    setChartConfig(base.includes(key) ? base.filter(k => k !== key) : [...base, key])
  }

  const toggleField = (fieldId) => {
    setSelectedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    )
  }

  const moveField = (index, direction) => {
    const newFields = [...selectedFields]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex >= 0 && newIndex < newFields.length) {
      [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]]
      setSelectedFields(newFields)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (selectedFields.length === 0) {
      alert('You must select at least one field')
      return
    }

    try {
      const payload = { ...formData, chart_config: chartConfig }
      if (editingId) {
        await updateFormType(editingId, payload, selectedFields)
      } else {
        await createFormType(payload, selectedFields)
      }
      resetForm()
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this form?')) {
      try {
        await deleteFormType(id)
      } catch (error) {
        alert('Error: ' + error.message)
      }
    }
  }

  const getFieldName = (fieldId) => {
    return fields.find(f => f.id === fieldId)?.name || 'Unknown field'
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
            Form Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create form types by selecting fields
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={!isOwner || fields.length === 0}
          title={!isOwner ? 'Read-only demo — sign in as owner to edit' : undefined}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          New Form
        </button>
      </div>

      {fields.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 dark:text-yellow-200">
            You must create fields before creating forms.
          </p>
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingId ? 'Edit Form' : 'New Form'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Form Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Product Purchases"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Fields
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                {fields.map(field => (
                  <label
                    key={field.id}
                    className={`
                      flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all
                      ${selectedFields.includes(field.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field.id)}
                      onChange={() => toggleField(field.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-900 dark:text-white font-medium">
                      {field.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({field.data_type})
                    </span>
                  </label>
                ))}
              </div>

              {selectedFields.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Field order ({selectedFields.length}):
                  </p>
                  <div className="space-y-1">
                    {selectedFields.map((fieldId, index) => (
                      <div
                        key={fieldId}
                        className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 p-2 rounded"
                      >
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="flex-1 text-gray-900 dark:text-white">
                          {index + 1}. {getFieldName(fieldId)}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => moveField(index, 'up')}
                            disabled={index === 0}
                            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveField(index, 'down')}
                            disabled={index === selectedFields.length - 1}
                            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded disabled:opacity-30"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {chartOptions.length > 0 && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <BarChart3 className="w-4 h-4" />
                  Dashboard Charts
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Choose which charts appear for this form. Options depend on the selected field types.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {chartOptions.map(chart => (
                    <label
                      key={chart.key}
                      className={`
                        flex items-start gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all
                        ${isChartChecked(chart.key)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={isChartChecked(chart.key)}
                        onChange={() => toggleChart(chart.key)}
                        className="w-4 h-4 mt-0.5"
                      />
                      <span>
                        <span className="block text-gray-900 dark:text-white font-medium">
                          {chart.label}
                        </span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          {chart.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
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

      {formTypes.length > 0 && (
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, description or field..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {formTypes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            No forms created yet. Create your first form!
          </p>
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            No forms match &quot;{search}&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredForms.map(form => (
            <div
              key={form.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                    {form.name}
                  </h4>
                  {form.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {form.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(form)}
                    disabled={!isOwner}
                    title={!isOwner ? 'Read-only demo — sign in as owner to edit' : undefined}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(form.id)}
                    disabled={!isOwner}
                    title={!isOwner ? 'Read-only demo — sign in as owner to edit' : undefined}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Fields ({form.form_fields?.length || 0}):
                </p>
                <div className="flex flex-wrap gap-1">
                  {form.form_fields
                    ?.sort((a, b) => a.sort_order - b.sort_order)
                    .map(ff => (
                      <span
                        key={ff.fields.id}
                        className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded"
                      >
                        {ff.fields.name}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
