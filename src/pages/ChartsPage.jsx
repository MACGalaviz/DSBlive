import { useApp } from '../contexts/AppContext'
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { LayoutDashboard } from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

// Hardcoded demo data — this page is a static gallery so people can see what
// each chart looks like and understand what it aggregates, independent of the
// real database.
const CATEGORY_DATA = [
  { name: 'Food', count: 42, Revenue: 12500 },
  { name: 'Toys', count: 18, Revenue: 4300 },
  { name: 'Health', count: 27, Revenue: 9800 },
  { name: 'Cleaning', count: 12, Revenue: 3100 },
]
const MONTHLY = [
  { month: '2026-01', count: 20 },
  { month: '2026-02', count: 35 },
  { month: '2026-03', count: 28 },
  { month: '2026-04', count: 44 },
  { month: '2026-05', count: 39 },
  { month: '2026-06', count: 52 },
]
const TREND = [
  { month: '2026-01', Revenue: 8200, Units: 120 },
  { month: '2026-02', Revenue: 9600, Units: 145 },
  { month: '2026-03', Revenue: 7400, Units: 110 },
  { month: '2026-04', Revenue: 11200, Units: 168 },
  { month: '2026-05', Revenue: 10100, Units: 150 },
  { month: '2026-06', Revenue: 13400, Units: 190 },
]
const AVG_BY_GROUP = [
  { name: 'Cardiology', average: 58 },
  { name: 'Pediatrics', average: 9 },
  { name: 'General', average: 41 },
  { name: 'Orthopedics', average: 47 },
]
const BOOLEAN_DATA = [{ name: 'Yes', value: 78 }, { name: 'No', value: 22 }]
const TOP_VALUES = [
  { name: 'Cat food premium', count: 34 },
  { name: 'Cat litter', count: 28 },
  { name: 'Mouse toy', count: 19 },
  { name: 'Wet food cans', count: 15 },
  { name: 'Vitamins', count: 9 },
]
const STACKED = [
  { month: '2026-01', Online: 12, Store: 8, App: 4 },
  { month: '2026-02', Online: 18, Store: 10, App: 7 },
  { month: '2026-03', Online: 14, Store: 9, App: 5 },
  { month: '2026-04', Online: 22, Store: 12, App: 10 },
]
const STACKED_SERIES = ['Online', 'Store', 'App']
const SCATTER = [
  { x: 20, y: 320 }, { x: 35, y: 540 }, { x: 50, y: 690 }, { x: 42, y: 610 },
  { x: 28, y: 430 }, { x: 60, y: 880 }, { x: 15, y: 240 }, { x: 48, y: 700 },
  { x: 33, y: 500 }, { x: 55, y: 810 }, { x: 25, y: 390 }, { x: 45, y: 640 },
]
const WEEKDAY = [
  { name: 'Sun', count: 8 }, { name: 'Mon', count: 24 }, { name: 'Tue', count: 31 },
  { name: 'Wed', count: 28 }, { name: 'Thu', count: 35 }, { name: 'Fri', count: 42 }, { name: 'Sat', count: 19 },
]
const CUMULATIVE = [
  { month: '2026-01', total: 20 }, { month: '2026-02', total: 55 }, { month: '2026-03', total: 83 },
  { month: '2026-04', total: 127 }, { month: '2026-05', total: 166 }, { month: '2026-06', total: 218 },
]

export default function ChartsPage() {
  const { darkMode } = useApp()

  const tooltipStyle = {
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
    color: darkMode ? '#f9fafb' : '#111827',
  }
  const tooltipItemStyle = { color: darkMode ? '#f9fafb' : '#111827' }
  const tooltipLabelStyle = { color: darkMode ? '#9ca3af' : '#6b7280', fontWeight: 700 }

  // Each entry renders one chart type with an explanation of how it aggregates.
  const gallery = [
    {
      title: 'Field Summaries',
      how: 'For every numeric field it computes average, min, max and the total sum across all records. Not a chart — quick KPI cards.',
      render: () => (
        <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 h-full flex flex-col justify-center">
          <p className="font-black text-primary text-sm mb-4 uppercase">Price</p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-500 italic"><span>Average:</span> <span className="font-bold text-gray-900 dark:text-gray-100">182.40</span></div>
            <div className="flex justify-between text-gray-500 italic"><span>Min / Max:</span> <span className="font-medium text-gray-900 dark:text-gray-100">6.96 / 480.00</span></div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-between items-end">
              <span className="text-xs font-bold text-gray-400 uppercase">Total sum:</span>
              <span className="text-2xl font-black text-gray-900 dark:text-white">21,888</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Comparison by Group',
      how: 'Groups records by a category and SUMS each numeric field per group. Bar height = total. Great for money or quantity — misleading for identity numbers like age (use Average by Group for those).',
      render: () => (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={CATEGORY_DATA}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
            <Legend iconType="circle" />
            <Bar dataKey="count" name="Records" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Revenue" name="Revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Value Distribution',
      how: 'Counts how many records fall into each option of a selector field, shown as a donut. Answers "what share is each category?".',
      render: () => (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={CATEGORY_DATA} innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="count" nameKey="name" stroke="none">
              {CATEGORY_DATA.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
            <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '11px' }} />
          </PieChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Activity Over Time',
      how: 'Counts records per month using their creation date. Shows how submission volume evolves.',
      render: () => (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MONTHLY}>
            <defs>
              <linearGradient id="galleryActivity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
            <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
            <Area type="monotone" dataKey="count" name="Records" stroke="#3b82f6" strokeWidth={3} fill="url(#galleryActivity)" />
          </AreaChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Numeric Trends',
      how: 'For each numeric field, sums its values per month and plots one line each. Shows how totals move over time.',
      render: () => (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={TREND}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
            <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
            <Legend iconType="circle" />
            <Line type="monotone" dataKey="Revenue" stroke={COLORS[0]} strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="Units" stroke={COLORS[1]} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Average by Group',
      how: 'Groups records by a category and AVERAGES a numeric field (not summed). The right choice for ages, ratings or wait times where a total is meaningless.',
      render: () => (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={AVG_BY_GROUP}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
            <Bar dataKey="average" name="Avg age" fill="#f59e0b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Yes / No Ratio',
      how: 'For a boolean field, counts true vs false and shows the split as a donut.',
      render: () => (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={BOOLEAN_DATA} innerRadius={55} outerRadius={80} paddingAngle={6} dataKey="value" stroke="none">
              <Cell fill="#10b981" />
              <Cell fill="#ef4444" />
            </Pie>
            <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Top Values',
      how: 'Counts the most frequent values of a text field and ranks the top ones as horizontal bars.',
      render: () => (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={TOP_VALUES}>
            <XAxis type="number" stroke="#9ca3af" fontSize={11} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={11} axisLine={false} tickLine={false} width={120} />
            <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Stacked Over Time',
      how: 'Splits a selector field into stacked bars per month, so you see both the total and each category’s contribution over time.',
      render: () => (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={STACKED}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
            <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
            <Legend iconType="circle" />
            {STACKED_SERIES.map((s, i) => <Bar key={s} dataKey={s} stackId="a" fill={COLORS[i % COLORS.length]} />)}
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Correlation',
      how: 'Plots two numeric fields against each other, one dot per record, to reveal whether they move together.',
      render: () => (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis type="number" dataKey="x" name="Liters" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis type="number" dataKey="y" name="Cost" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
            <ZAxis range={[40, 40]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
            <Scatter data={SCATTER} fill="#ec4899" fillOpacity={0.6} />
          </ScatterChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Weekday Activity',
      how: 'Counts records by day of the week (from their creation date) to expose weekly patterns.',
      render: () => (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={WEEKDAY}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
            <Bar dataKey="count" name="Records" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Cumulative Growth',
      how: 'Adds each month on top of the previous ones — a running total of records. The line only ever rises; its steepness shows how fast the dataset is growing.',
      render: () => (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CUMULATIVE}>
            <defs>
              <linearGradient id="galleryCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
            <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
            <Area type="monotone" dataKey="total" name="Total records" stroke="#10b981" strokeWidth={3} fill="url(#galleryCumulative)" />
          </AreaChart>
        </ResponsiveContainer>
      ),
    },
  ]

  return (
    <div className="space-y-8 pb-12 text-gray-900 dark:text-gray-100">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={32} /> Chart Gallery
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Every chart type the dashboard can show, with sample data and how each one aggregates.
          Pick which ones appear per form when editing a form.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {gallery.map((chart, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex flex-col">
            <h3 className="text-lg font-black mb-1">{chart.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{chart.how}</p>
            <div className="h-[260px]">
              {chart.render()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
