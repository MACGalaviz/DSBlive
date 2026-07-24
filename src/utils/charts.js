// Shared dashboard chart catalog.
//
// Both FormsPage (checkboxes to enable/disable charts per form) and
// DashboardPage (which charts to render) rely on these definitions so they
// stay in sync. A form's enabled charts are stored in form_types.chart_config
// as an array of chart keys. NULL/undefined means "all applicable charts".

// Each chart declares which field types it needs to be meaningful.
export const CHART_CATALOG = [
  { key: 'summaries', label: 'Field Summaries', description: 'Average / min / max / total per numeric field', applies: (t) => t.number > 0 },
  { key: 'comparison', label: 'Comparison by Group', description: 'Grouped bar chart across a categorical field', applies: (t) => t.selector > 0 || t.boolean > 0 },
  { key: 'distribution', label: 'Value Distribution', description: 'Donut chart per selector field', applies: (t) => t.selector > 0 },
  { key: 'activity', label: 'Activity Over Time', description: 'Records submitted per month', applies: () => true },
  { key: 'trend', label: 'Numeric Trends', description: 'Monthly total of each numeric field', applies: (t) => t.number > 0 },
  { key: 'avgByGroup', label: 'Average by Group', description: 'Average of a numeric field per category (not summed)', applies: (t) => t.number > 0 && (t.selector > 0 || t.boolean > 0) },
  { key: 'booleanRatio', label: 'Yes / No Ratio', description: 'Donut of true vs false per boolean field', applies: (t) => t.boolean > 0 },
  { key: 'topValues', label: 'Top Values', description: 'Most frequent values of a text field', applies: (t) => t.text > 0 },
  { key: 'stacked', label: 'Stacked Over Time', description: 'Category breakdown per month (stacked bars)', applies: (t) => t.selector > 0 },
  { key: 'scatter', label: 'Correlation', description: 'Scatter plot between two numeric fields', applies: (t) => t.number >= 2 },
  { key: 'weekday', label: 'Weekday Activity', description: 'Records by day of the week', applies: () => true },
]

// Count field types from an array of { data_type } (accepts raw fields or the
// { fields: {...} } shape returned by the form_fields join).
export const countFieldTypes = (items) => {
  const counts = { number: 0, selector: 0, boolean: 0, text: 0, date: 0, time: 0 }
  items?.forEach((item) => {
    const type = item?.data_type ?? item?.fields?.data_type
    if (type in counts) counts[type]++
  })
  return counts
}

// Charts that make sense for the given field-type counts.
export const availableCharts = (counts) => CHART_CATALOG.filter((c) => c.applies(counts))

// A chart is enabled when config is null (all) or explicitly includes its key.
export const isChartEnabled = (chartConfig, key) =>
  chartConfig == null ? true : Array.isArray(chartConfig) && chartConfig.includes(key)
