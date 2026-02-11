import { useState, useMemo } from 'react'
import { useApp } from '../contexts/AppContext'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Database, FileText, ClipboardList, Layers, LayoutDashboard, PieChart as PieIcon, Activity } from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function DashboardPage() {
  const { fields, formTypes, records, loading } = useApp()
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
    const activeGroupFieldId = groupByField || allFields[0]?.id;
    
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

          {groupedStats && (
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

        {numericStats && (
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

        {groupedStats && (
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
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff' }} 
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

        {selectorStats && (
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
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px' }} />
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

        {selectedFormType === 'all' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Records per Form Type</h4>
              <div className="h-[300px] bg-gray-50 dark:bg-gray-900/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formTypes.map(f => ({ name: f.name, count: records.filter(r => r.form_type_id === f.id).length }))}>
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px' }} />
                    <Bar dataKey="count" fill="#10b981" radius={[10, 10, 10, 10]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Submission Activity</h4>
              <div className="h-[300px] bg-gray-50 dark:bg-gray-900/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={records.slice(-10).map((r, i) => ({ i, val: i + 1 }))}>
                    <Line type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={4} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
