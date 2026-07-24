import { useState, useMemo } from 'react'
import { useApp } from '../contexts/AppContext'
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Database, FileText, ClipboardList, Layers, LayoutDashboard, PieChart as PieIcon, Activity, CalendarClock } from 'lucide-react'
import { isChartEnabled } from '../utils/charts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function DashboardPage() {
  const { fields, formTypes, records, loading, darkMode } = useApp()
  const [selectedFormType, setSelectedFormType] = useState('all')
  const [groupByField, setGroupByField] = useState('')

  const stats = useMemo(() => ({
    totalFields: fields.length,
    totalFormTypes: formTypes.length,
    totalRecords: records.length,
    recordsToday: records.filter(r => {
      const today = new Date().toDateString()
      return new Date(r.created_at).toDateString() === today
    }).length
  }), [fields, formTypes, records])

  const filteredRecords = useMemo(() => 
    selectedFormType === 'all'
      ? records
      : records.filter(r => r.form_type_id.toString() === selectedFormType.toString())
  , [selectedFormType, records])

  const groupedStats = useMemo(() => {
    if (selectedFormType === 'all' || filteredRecords.length === 0) return null;
    const form = formTypes.find(f => f.id.toString() === selectedFormType.toString());
    if (!form || !form.form_fields) return null;

    const allFields = form.form_fields.map(ff => ff.fields);
    const numericFields = allFields.filter(f => f.data_type === 'number');
    // Default to a categorical field (selector/boolean). Grouping by free-text
    // like a name produces one tiny group per value, which is noise.
    const defaultGroupField = allFields.find(f => f.data_type === 'selector' || f.data_type === 'boolean') || allFields[0];
    const activeGroupFieldId = groupByField || defaultGroupField?.id;
    
    if (!activeGroupFieldId) return null;

    const groups = {};
    filteredRecords.forEach(reg => {
      const data = reg.data;
      let groupValue = data[activeGroupFieldId] || "N/A";
      if (!groups[groupValue]) {
        groups[groupValue] = { 
          name: groupValue, 
          count: 0, 
          ...numericFields.reduce((acc, nf) => ({ ...acc, [nf.name]: 0 }), {}) 
        };
      }
      groups[groupValue].count += 1;
      numericFields.forEach(nf => {
        const val = parseFloat(data[nf.id]);
        if (!isNaN(val)) groups[groupValue][nf.name] += val;
      });
    });

    return { 
      data: Object.values(groups), 
      availableFields: allFields, 
      numericFields, 
      activeFieldName: allFields.find(f => f.id.toString() === activeGroupFieldId.toString())?.name 
    };
  }, [selectedFormType, filteredRecords, formTypes, groupByField]);

  const numericStats = useMemo(() => {
    if (!filteredRecords.length || selectedFormType === 'all') return null
    const form = formTypes.find(f => f.id.toString() === selectedFormType.toString())
    if (!form || !form.form_fields) return null

    const numericFields = form.form_fields.map(ff => ff.fields).filter(f => f.data_type === 'number')
    if (numericFields.length === 0) return null

    return numericFields.map(field => {
      const values = filteredRecords.map(r => parseFloat(r.data[field.id])).filter(v => !isNaN(v))
      if (values.length === 0) return null
      const sum = values.reduce((a, b) => a + b, 0)
      return {
        name: field.name,
        average: (sum / values.length).toFixed(2),
        maximum: Math.max(...values).toFixed(2),
        minimum: Math.min(...values).toFixed(2),
        total: sum.toFixed(2)
      }
    }).filter(Boolean)
  }, [selectedFormType, filteredRecords, formTypes])

  const selectorStats = useMemo(() => {
    if (!filteredRecords.length || selectedFormType === 'all') return null
    const form = formTypes.find(f => f.id.toString() === selectedFormType.toString())
    if (!form || !form.form_fields) return null

    const selectors = form.form_fields.map(ff => ff.fields).filter(f => f.data_type === 'selector')
    return selectors.map(field => {
      const counts = {}
      filteredRecords.forEach(r => {
        const val = r.data[field.id]
        if (val) counts[val] = (counts[val] || 0) + 1
      })
      const data = Object.entries(counts).map(([name, value]) => ({ name, value }))
      return { name: field.name, data }
    }).filter(s => s.data.length > 0)
  }, [selectedFormType, filteredRecords, formTypes])

  // Records grouped by month (YYYY-MM) — works for both global and per-form.
  const timeSeries = useMemo(() => {
    if (!filteredRecords.length) return []
    const byMonth = {}
    filteredRecords.forEach(r => {
      const key = new Date(r.created_at).toISOString().slice(0, 7)
      byMonth[key] = (byMonth[key] || 0) + 1
    })
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }))
  }, [filteredRecords])

  // Global: share of records per form type (donut).
  const recordsShare = useMemo(() =>
    formTypes
      .map(f => ({ name: f.name, value: records.filter(r => r.form_type_id === f.id).length }))
      .filter(d => d.value > 0)
  , [formTypes, records])

  // Per-form: monthly sum of each numeric field (multi-line trend).
  const numericTrend = useMemo(() => {
    if (selectedFormType === 'all' || !filteredRecords.length) return null
    const form = formTypes.find(f => f.id.toString() === selectedFormType.toString())
    if (!form || !form.form_fields) return null
    const numericFields = form.form_fields.map(ff => ff.fields).filter(f => f.data_type === 'number')
    if (numericFields.length === 0) return null

    const byMonth = {}
    filteredRecords.forEach(r => {
      const key = new Date(r.created_at).toISOString().slice(0, 7)
      if (!byMonth[key]) byMonth[key] = { month: key, ...numericFields.reduce((a, nf) => ({ ...a, [nf.name]: 0 }), {}) }
      numericFields.forEach(nf => {
        const v = parseFloat(r.data[nf.id])
        if (!isNaN(v)) byMonth[key][nf.name] += v
      })
    })
    return {
      data: Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)),
      numericFields
    }
  }, [selectedFormType, filteredRecords, formTypes])

  // Fields of the selected form (empty on the global view).
  const formFieldList = useMemo(() => {
    if (selectedFormType === 'all') return []
    const form = formTypes.find(f => f.id.toString() === selectedFormType.toString())
    return form?.form_fields?.map(ff => ff.fields) || []
  }, [selectedFormType, formTypes])

  // Average of the first numeric field per category (answers "sum of ages" issue).
  const avgByGroup = useMemo(() => {
    if (!filteredRecords.length || !formFieldList.length) return null
    const cat = formFieldList.find(f => f.data_type === 'selector' || f.data_type === 'boolean')
    const num = formFieldList.find(f => f.data_type === 'number')
    if (!cat || !num) return null
    const groups = {}
    filteredRecords.forEach(r => {
      const g = r.data[cat.id] || 'N/A'
      const v = parseFloat(r.data[num.id])
      if (isNaN(v)) return
      if (!groups[g]) groups[g] = { name: g, sum: 0, n: 0 }
      groups[g].sum += v
      groups[g].n += 1
    })
    const data = Object.values(groups).map(g => ({ name: g.name, average: +(g.sum / g.n).toFixed(2) }))
    return data.length ? { catName: cat.name, numName: num.name, data } : null
  }, [filteredRecords, formFieldList])

  // True/false ratio per boolean field.
  const booleanStats = useMemo(() => {
    if (!filteredRecords.length || !formFieldList.length) return null
    const booleans = formFieldList.filter(f => f.data_type === 'boolean')
    const stats = booleans.map(field => {
      let yes = 0, no = 0
      filteredRecords.forEach(r => {
        const v = r.data[field.id]
        if (v === 'true') yes++
        else if (v === 'false') no++
      })
      return { name: field.name, data: [{ name: 'Yes', value: yes }, { name: 'No', value: no }] }
    }).filter(s => s.data.some(d => d.value > 0))
    return stats.length ? stats : null
  }, [filteredRecords, formFieldList])

  // Most frequent values of the first text field (top 8).
  const topValues = useMemo(() => {
    if (!filteredRecords.length || !formFieldList.length) return null
    const textField = formFieldList.find(f => f.data_type === 'text')
    if (!textField) return null
    const counts = {}
    filteredRecords.forEach(r => {
      const v = r.data[textField.id]
      if (v) counts[v] = (counts[v] || 0) + 1
    })
    const data = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
    return data.length ? { fieldName: textField.name, data } : null
  }, [filteredRecords, formFieldList])

  // First selector's category breakdown per month (stacked bars).
  const stackedTrend = useMemo(() => {
    if (!filteredRecords.length || !formFieldList.length) return null
    const selector = formFieldList.find(f => f.data_type === 'selector')
    if (!selector) return null
    const byMonth = {}
    const seriesSet = new Set()
    filteredRecords.forEach(r => {
      const m = new Date(r.created_at).toISOString().slice(0, 7)
      const val = r.data[selector.id]
      if (!byMonth[m]) byMonth[m] = { month: m }
      if (val) {
        byMonth[m][val] = (byMonth[m][val] || 0) + 1
        seriesSet.add(val)
      }
    })
    const data = Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month))
    return { fieldName: selector.name, data, series: [...seriesSet] }
  }, [filteredRecords, formFieldList])

  // Scatter between the first two numeric fields.
  const scatterData = useMemo(() => {
    if (!filteredRecords.length || !formFieldList.length) return null
    const nums = formFieldList.filter(f => f.data_type === 'number')
    if (nums.length < 2) return null
    const [x, y] = nums
    const data = filteredRecords
      .map(r => ({ x: parseFloat(r.data[x.id]), y: parseFloat(r.data[y.id]) }))
      .filter(p => !isNaN(p.x) && !isNaN(p.y))
      .slice(0, 400)
    return data.length ? { xName: x.name, yName: y.name, data } : null
  }, [filteredRecords, formFieldList])

  // Records by day of the week (from created_at).
  const weekdayStats = useMemo(() => {
    if (!filteredRecords.length || selectedFormType === 'all') return null
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const counts = days.map(name => ({ name, count: 0 }))
    filteredRecords.forEach(r => { counts[new Date(r.created_at).getDay()].count++ })
    return counts
  }, [filteredRecords, selectedFormType])

  // Enabled charts for the selected form (null => all applicable).
  const chartConfig = formTypes.find(f => f.id.toString() === selectedFormType.toString())?.chart_config

  // Theme-aware tooltip styling (recharts inlines these; not driven by CSS classes).
  const tooltipStyle = {
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
    color: darkMode ? '#f9fafb' : '#111827',
  }
  const tooltipItemStyle = { color: darkMode ? '#f9fafb' : '#111827' }
  const tooltipLabelStyle = { color: darkMode ? '#9ca3af' : '#6b7280', fontWeight: 700 }

  if (loading) return <div className="flex justify-center items-center h-96 text-primary font-bold animate-pulse">Loading Analytics...</div>

  return (
    <div className="space-y-8 pb-12 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={32} /> Dashboard
        </h2>
        <p className="text-gray-500 dark:text-gray-400">Data analysis & business intelligence</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Records', value: stats.totalRecords, icon: ClipboardList, color: 'text-primary' },
          { label: 'Form Types', value: stats.totalFormTypes, icon: FileText, color: 'text-green-500' },
          { label: 'Fields', value: stats.totalFields, icon: Database, color: 'text-orange-500' },
          { label: 'Today', value: stats.recordsToday, icon: TrendingUp, color: 'text-purple-500' }
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</p>
                <p className="text-3xl font-black mt-1">{kpi.value}</p>
              </div>
              <kpi.icon size={28} className={kpi.color} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 shadow-xl">
        <div className="flex flex-wrap items-end justify-start gap-8 mb-10 pb-8 border-b border-gray-100 dark:border-gray-700">
          
          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 px-1">
              <FileText size={14} /> 1. Select Form
            </label>
            <select 
              value={selectedFormType} 
              onChange={(e) => { setSelectedFormType(e.target.value); setGroupByField(''); }}
              className="w-full md:w-64 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="all">Global Activity</option>
              {formTypes.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          {groupedStats && isChartEnabled(chartConfig, 'comparison') && (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
              <label className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2 px-1">
                <Layers size={14} /> 2. Group & Compare by
              </label>
              <div className="relative">
                <select 
                  value={groupByField} 
                  onChange={(e) => setGroupByField(e.target.value)}
                  className="w-full md:w-64 bg-primary/10 dark:bg-primary/20 border-2 border-primary/30 text-primary dark:text-blue-300 rounded-xl p-3 pr-10 text-sm font-black outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                >
                  {groupedStats.availableFields.map(f => (
                    <option key={f.id} value={f.id} className="text-black bg-white dark:bg-gray-800 font-sans">
                      {f.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-primary">
                  <Layers size={16} />
                </div>
              </div>
            </div>
          )}
        </div>

        {numericStats && isChartEnabled(chartConfig, 'summaries') && (
          <div className="mb-12 animate-in fade-in duration-500">
            <h3 className="text-sm font-black text-gray-400 uppercase mb-6 tracking-widest flex items-center gap-2">
              <Activity size={18} className="text-primary" /> Field Summaries
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {numericStats.map(s => (
                <div key={s.name} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 group hover:border-primary transition-colors">
                  <p className="font-black text-primary text-sm mb-4 uppercase">{s.name}</p>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-500 italic"><span>Average:</span> <span className="font-bold text-gray-900 dark:text-gray-100">{s.average}</span></div>
                    <div className="flex justify-between text-gray-500 italic"><span>Min / Max:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{s.minimum} / {s.maximum}</span></div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-between items-end">
                      <span className="text-xs font-bold text-gray-400 uppercase">Total sum:</span>
                      <span className="text-2xl font-black text-gray-900 dark:text-white">{s.total}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {groupedStats && isChartEnabled(chartConfig, 'comparison') && (
          <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 mb-12">
            <h3 className="text-xs font-black text-gray-400 uppercase mb-8 tracking-widest">
              Comparison by {groupedStats.activeFieldName}
            </h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupedStats.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(59, 130, 246, 0.05)'}}
                    contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} 
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="count" name="Records" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  {groupedStats.numericFields.map((nf, i) => (
                    <Bar key={nf.id} dataKey={nf.name} name={nf.name} fill={COLORS[(i + 1) % COLORS.length]} radius={[6, 6, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectorStats && isChartEnabled(chartConfig, 'distribution') && (
          <div className="pt-10 border-t border-gray-100 dark:border-gray-700 animate-in slide-in-from-bottom-4">
            <h3 className="text-sm font-black text-gray-400 uppercase mb-8 tracking-widest flex items-center gap-2">
              <PieIcon size={18} className="text-purple-500" /> Value Distribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {selectorStats.map((stat, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <p className="text-center font-black text-xs mb-6 uppercase text-gray-500">{stat.name}</p>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={stat.data} 
                          innerRadius={60} 
                          outerRadius={85} 
                          paddingAngle={8} 
                          dataKey="value"
                          stroke="none"
                        >
                          {stat.data.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center gap-4">
                    {stat.data.map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">{d.name} ({d.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedFormType !== 'all' && timeSeries.length > 0 && isChartEnabled(chartConfig, 'activity') && (
          <div className="pt-10 border-t border-gray-100 dark:border-gray-700 animate-in fade-in duration-500 space-y-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <CalendarClock size={18} className="text-primary" /> Activity Over Time
            </h3>
            <div className="h-[300px] bg-gray-50 dark:bg-gray-900/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeries}>
                  <defs>
                    <linearGradient id="formActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                  <Area type="monotone" dataKey="count" name="Records" stroke="#3b82f6" strokeWidth={3} fill="url(#formActivity)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedFormType !== 'all' && numericTrend && isChartEnabled(chartConfig, 'trend') && (
          <div className="pt-10 border-t border-gray-100 dark:border-gray-700 animate-in fade-in duration-500 space-y-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={18} className="text-green-500" /> Numeric Trends (monthly total)
            </h3>
            <div className="h-[320px] bg-gray-50 dark:bg-gray-900/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={numericTrend.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                  <Legend iconType="circle" />
                  {numericTrend.numericFields.map((nf, i) => (
                    <Line key={nf.id} type="monotone" dataKey={nf.name} name={nf.name} stroke={COLORS[i % COLORS.length]} strokeWidth={2.5} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedFormType !== 'all' && avgByGroup && isChartEnabled(chartConfig, 'avgByGroup') && (
          <div className="pt-10 border-t border-gray-100 dark:border-gray-700 animate-in fade-in duration-500 space-y-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Activity size={18} className="text-orange-500" /> Average {avgByGroup.numName} by {avgByGroup.catName}
            </h3>
            <div className="h-[320px] bg-gray-50 dark:bg-gray-900/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={avgByGroup.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(245,158,11,0.05)' }} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                  <Bar dataKey="average" name={`Avg ${avgByGroup.numName}`} fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedFormType !== 'all' && booleanStats && isChartEnabled(chartConfig, 'booleanRatio') && (
          <div className="pt-10 border-t border-gray-100 dark:border-gray-700 animate-in fade-in duration-500 space-y-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <PieIcon size={18} className="text-green-500" /> Yes / No Ratio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {booleanStats.map((stat, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-900/20 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-center font-black text-xs mb-6 uppercase text-gray-500">{stat.name}</p>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stat.data} innerRadius={55} outerRadius={80} paddingAngle={6} dataKey="value" stroke="none">
                          <Cell fill="#10b981" />
                          <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex justify-center gap-4">
                    {stat.data.map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: i === 0 ? '#10b981' : '#ef4444' }}></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">{d.name} ({d.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedFormType !== 'all' && topValues && isChartEnabled(chartConfig, 'topValues') && (
          <div className="pt-10 border-t border-gray-100 dark:border-gray-700 animate-in fade-in duration-500 space-y-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" /> Top {topValues.fieldName}
            </h3>
            <div className="h-[340px] bg-gray-50 dark:bg-gray-900/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={topValues.data}>
                  <XAxis type="number" stroke="#9ca3af" fontSize={11} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={11} axisLine={false} tickLine={false} width={130} />
                  <Tooltip cursor={{ fill: 'rgba(59,130,246,0.05)' }} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedFormType !== 'all' && stackedTrend && stackedTrend.series.length > 0 && isChartEnabled(chartConfig, 'stacked') && (
          <div className="pt-10 border-t border-gray-100 dark:border-gray-700 animate-in fade-in duration-500 space-y-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Layers size={18} className="text-purple-500" /> {stackedTrend.fieldName} Over Time
            </h3>
            <div className="h-[340px] bg-gray-50 dark:bg-gray-900/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stackedTrend.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                  <Legend iconType="circle" />
                  {stackedTrend.series.map((s, i) => (
                    <Bar key={s} dataKey={s} name={s} stackId="a" fill={COLORS[i % COLORS.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedFormType !== 'all' && scatterData && isChartEnabled(chartConfig, 'scatter') && (
          <div className="pt-10 border-t border-gray-100 dark:border-gray-700 animate-in fade-in duration-500 space-y-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Activity size={18} className="text-pink-500" /> {scatterData.xName} vs {scatterData.yName}
            </h3>
            <div className="h-[340px] bg-gray-50 dark:bg-gray-900/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis type="number" dataKey="x" name={scatterData.xName} stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="number" dataKey="y" name={scatterData.yName} stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <ZAxis range={[40, 40]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                  <Scatter data={scatterData.data} fill="#ec4899" fillOpacity={0.5} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedFormType !== 'all' && weekdayStats && isChartEnabled(chartConfig, 'weekday') && (
          <div className="pt-10 border-t border-gray-100 dark:border-gray-700 animate-in fade-in duration-500 space-y-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <CalendarClock size={18} className="text-primary" /> Weekday Activity
            </h3>
            <div className="h-[280px] bg-gray-50 dark:bg-gray-900/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(59,130,246,0.05)' }} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                  <Bar dataKey="count" name="Records" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedFormType === 'all' && (
          <div className="space-y-10 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase">Records per Form Type</h4>
                <div className="h-[300px] bg-gray-50 dark:bg-gray-900/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={formTypes.map(f => ({ name: f.name, count: records.filter(r => r.form_type_id === f.id).length })).sort((a, b) => b.count - a.count)}>
                      <XAxis type="number" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} width={110} />
                      <Tooltip cursor={{fill: 'rgba(16,185,129,0.05)'}} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                      <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase">Record Share</h4>
                <div className="h-[300px] bg-gray-50 dark:bg-gray-900/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={recordsShare} innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value" nameKey="name" stroke="none">
                        {recordsShare.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                      <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                <CalendarClock size={16} className="text-primary" /> Submission Activity (monthly)
              </h4>
              <div className="h-[300px] bg-gray-50 dark:bg-gray-900/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeries}>
                    <defs>
                      <linearGradient id="globalActivity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                    <Area type="monotone" dataKey="count" name="Records" stroke="#3b82f6" strokeWidth={3} fill="url(#globalActivity)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
