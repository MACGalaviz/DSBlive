import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Database, FileText, ClipboardList } from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function DashboardPage() {
  const { fields, formTypes, records, loading } = useApp()
  const [selectedFormType, setSelectedFormType] = useState('all')

  const stats = {
    totalFields: fields.length,
    totalFormTypes: formTypes.length,
    totalRecords: records.length,
    recordsToday: records.filter(r => {
      const today = new Date().toDateString()
      return new Date(r.created_at).toDateString() === today
    }).length
  }

  const filteredRecords = selectedFormType === 'all'
    ? records
    : records.filter(r => r.form_type_id === selectedFormType)

  const recordsPerFormType = formTypes.map(form => ({
    name: form.name,
    count: records.filter(r => r.form_type_id === form.id).length
  }))

  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: records.filter(r => {
          const regDate = new Date(r.created_at).toDateString()
          return regDate === date.toDateString()
        }).length
      })
    }
    return days
  }

  const recordsPerDay = getLast7Days()

  const getNumericFieldStats = () => {
    if (!filteredRecords.length || selectedFormType === 'all') return null

    const form = formTypes.find(f => f.id === selectedFormType)
    if (!form) return null

    const numericFields = form.form_fields
      .map(ff => ff.fields)
      .filter(f => f.data_type === 'number')

    if (numericFields.length === 0) return null

    return numericFields.map(field => {
      const values = filteredRecords
        .map(r => parseFloat(r.data[field.id]))
        .filter(v => !isNaN(v))

      if (values.length === 0) return null

      const sum = values.reduce((a, b) => a + b, 0)
      const avg = sum / values.length
      const max = Math.max(...values)
      const min = Math.min(...values)

      return {
        name: field.name,
        average: avg.toFixed(2),
        maximum: max.toFixed(2),
        minimum: min.toFixed(2),
        total: sum.toFixed(2)
      }
    }).filter(Boolean)
  }

  const numericStats = getNumericFieldStats()

  const getSelectorFieldStats = () => {
    if (!filteredRecords.length || selectedFormType === 'all') return null

    const form = formTypes.find(f => f.id === selectedFormType)
    if (!form) return null

    const selectorFields = form.form_fields
      .map(ff => ff.fields)
      .filter(f => f.data_type === 'selector')

    if (selectorFields.length === 0) return null

    return selectorFields.map(field => {
      const valueCounts = {}
      
      filteredRecords.forEach(r => {
        const value = r.data[field.id]
        if (value) {
          valueCounts[value] = (valueCounts[value] || 0) + 1
        }
      })

      const chartData = Object.entries(valueCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

      return {
        name: field.name,
        data: chartData
      }
    }).filter(s => s.data.length > 0)
  }

  const selectorStats = getSelectorFieldStats()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Statistics and analysis of your data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Fields</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalFields}
              </p>
            </div>
            <Database className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Forms</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalFormTypes}
              </p>
            </div>
            <FileText className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Records</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalRecords}
              </p>
            </div>
            <ClipboardList className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.recordsToday}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {records.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Records per Form
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={recordsPerFormType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Last 7 Days
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={recordsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {formTypes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Analyze form:
            </label>
            <select
              value={selectedFormType}
              onChange={(e) => setSelectedFormType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              {formTypes.map(form => (
                <option key={form.id} value={form.id}>
                  {form.name}
                </option>
              ))}
            </select>
          </div>

          {numericStats && numericStats.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Numeric Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {numericStats.map(stat => (
                  <div
                    key={stat.name}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      {stat.name}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Average:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {stat.average}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Maximum:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {stat.maximum}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Minimum:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {stat.minimum}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
                        <span className="text-gray-600 dark:text-gray-400">Total:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {stat.total}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectorStats && selectorStats.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Value Distribution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectorStats.map((stat, index) => (
                  <div key={stat.name}>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 text-center">
                      {stat.name}
                    </h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={stat.data}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {stat.data.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedFormType !== 'all' && !numericStats && !selectorStats && (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              Not enough data to show statistics for this form.
            </p>
          )}
        </div>
      )}

      {records.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            No records to show statistics. Start by creating records!
          </p>
        </div>
      )}
    </div>
  )
}
