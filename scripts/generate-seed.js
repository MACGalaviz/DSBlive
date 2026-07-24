// Seed generator for DSBlive.
//
// Produces a re-runnable SQL file that showcases the platform's flexibility:
// many DIFFERENT forms across unrelated domains, mixed field types, and lots of
// records whose created_at is spread across a date window so time charts work.
//
// Usage:
//   node scripts/generate-seed.js                      # defaults
//   node scripts/generate-seed.js --multiplier 3       # 3x more records
//   node scripts/generate-seed.js --months 18          # spread over 18 months
//   node scripts/generate-seed.js --seed 42            # reproducible output
//   node scripts/generate-seed.js --out my-seed.sql    # custom output path
//
// The output starts with TRUNCATE ... RESTART IDENTITY CASCADE. This WIPES the
// whole database on every run so that BIGSERIAL ids are deterministic (field N =
// Nth inserted field). The numeric keys inside records.data ARE field ids, so
// this determinism is required for records to point at the right fields.

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2)
const getArg = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback
}

const MULTIPLIER = parseFloat(getArg('multiplier', '1'))
const MONTHS = parseInt(getArg('months', '12'), 10)
const OUT = getArg('out', 'supabase-seed-generated.sql')
const SEED = parseInt(getArg('seed', '20260723'), 10)

// ---------------------------------------------------------------------------
// Deterministic RNG (mulberry32) so --seed gives reproducible output
// ---------------------------------------------------------------------------
let rngState = SEED >>> 0
const rng = () => {
  rngState |= 0
  rngState = (rngState + 0x6d2b79f5) | 0
  let t = Math.imul(rngState ^ (rngState >>> 15), 1 | rngState)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const randInt = (min, max) => Math.floor(rng() * (max - min + 1)) + min
const randFloat = (min, max, decimals = 2) =>
  (rng() * (max - min) + min).toFixed(decimals)
const pick = (arr) => arr[Math.floor(rng() * arr.length)]
const chance = (p) => rng() < p

// ---------------------------------------------------------------------------
// Date helpers — spread created_at across the window [now - MONTHS, now]
// ---------------------------------------------------------------------------
const NOW = Date.now()
const WINDOW_MS = MONTHS * 30 * 24 * 60 * 60 * 1000

const randomTimestamp = () => new Date(NOW - rng() * WINDOW_MS)
const toDateStr = (d) => d.toISOString().slice(0, 10) // YYYY-MM-DD
const toTimeStr = (d) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

// ---------------------------------------------------------------------------
// Value generators keyed by domain vocabulary
// ---------------------------------------------------------------------------
const firstNames = ['Ana', 'Luis', 'Maria', 'Carlos', 'Sofia', 'Diego', 'Lucia', 'Javier', 'Elena', 'Pablo', 'Marta', 'Hugo', 'Laura', 'Ivan', 'Nora']
const lastNames = ['Garcia', 'Lopez', 'Martinez', 'Ruiz', 'Torres', 'Diaz', 'Moreno', 'Romero', 'Alonso', 'Gil']
const person = () => `${pick(firstNames)} ${pick(lastNames)}`

// ---------------------------------------------------------------------------
// Forms — each is an independent domain. Every form carries at least one
// number, one selector and one date field so the data-type-driven dashboard
// always has something to chart. Field `gen` receives the record timestamp.
// ---------------------------------------------------------------------------
const FORMS = [
  {
    name: 'Retail Sales',
    description: 'Point-of-sale transactions across store departments',
    records: 320,
    fields: [
      { name: 'product', type: 'text', gen: () => pick(['Wireless Mouse', 'USB-C Cable', 'Notebook', 'Water Bottle', 'Desk Lamp', 'Backpack', 'Headphones', 'Coffee Mug', 'Phone Case', 'Power Bank']) },
      { name: 'unit_price', type: 'number', gen: () => randFloat(5, 400) },
      { name: 'quantity', type: 'number', gen: () => randInt(1, 8) },
      { name: 'category', type: 'selector', options: ['Electronics', 'Office', 'Home', 'Outdoor', 'Accessories'], gen: (o) => pick(o) },
      { name: 'payment_method', type: 'selector', options: ['Cash', 'Card', 'Transfer', 'Wallet'], gen: (o) => pick(o) },
      { name: 'sale_date', type: 'date', gen: (_, ts) => toDateStr(ts) },
      { name: 'refunded', type: 'boolean', gen: () => (chance(0.08) ? 'true' : 'false') },
    ],
  },
  {
    name: 'Gym Check-ins',
    description: 'Member facility access and session tracking',
    records: 400,
    fields: [
      { name: 'member', type: 'text', gen: () => person() },
      { name: 'age', type: 'number', gen: () => randInt(16, 68) },
      { name: 'membership', type: 'selector', options: ['Basic', 'Premium', 'Student', 'Corporate'], gen: (o) => pick(o) },
      { name: 'duration_min', type: 'number', gen: () => randInt(20, 120) },
      { name: 'checkin_time', type: 'time', gen: (_, ts) => toTimeStr(ts) },
      { name: 'visit_date', type: 'date', gen: (_, ts) => toDateStr(ts) },
      { name: 'first_visit', type: 'boolean', gen: () => (chance(0.12) ? 'true' : 'false') },
    ],
  },
  {
    name: 'Restaurant Orders',
    description: 'Kitchen tickets with service type and rating',
    records: 300,
    fields: [
      { name: 'dish', type: 'text', gen: () => pick(['Margherita Pizza', 'Caesar Salad', 'Ramen Bowl', 'Beef Burger', 'Sushi Set', 'Pad Thai', 'Tacos', 'Risotto', 'Falafel Wrap', 'Pancakes']) },
      { name: 'price', type: 'number', gen: () => randFloat(80, 420) },
      { name: 'table', type: 'number', gen: () => randInt(1, 24) },
      { name: 'service', type: 'selector', options: ['Dine-in', 'Takeout', 'Delivery'], gen: (o) => pick(o) },
      { name: 'rating', type: 'selector', options: ['1', '2', '3', '4', '5'], gen: () => pick(['3', '4', '4', '5', '5', '2']) },
      { name: 'order_time', type: 'time', gen: (_, ts) => toTimeStr(ts) },
      { name: 'order_date', type: 'date', gen: (_, ts) => toDateStr(ts) },
    ],
  },
  {
    name: 'Clinic Visits',
    description: 'Outpatient appointments and wait times',
    records: 260,
    fields: [
      { name: 'patient', type: 'text', gen: () => person() },
      { name: 'age', type: 'number', gen: () => randInt(1, 92) },
      { name: 'department', type: 'selector', options: ['General', 'Cardiology', 'Pediatrics', 'Dermatology', 'Orthopedics'], gen: (o) => pick(o) },
      { name: 'wait_min', type: 'number', gen: () => randInt(5, 90) },
      { name: 'diagnosis', type: 'selector', options: ['Routine', 'Follow-up', 'Acute', 'Chronic'], gen: (o) => pick(o) },
      { name: 'visit_date', type: 'date', gen: (_, ts) => toDateStr(ts) },
      { name: 'needs_followup', type: 'boolean', gen: () => (chance(0.3) ? 'true' : 'false') },
    ],
  },
  {
    name: 'Fleet Fuel Logs',
    description: 'Vehicle refueling and odometer records',
    records: 280,
    fields: [
      { name: 'vehicle', type: 'text', gen: () => `${pick(['Van', 'Truck', 'Sedan', 'Pickup'])}-${randInt(100, 999)}` },
      { name: 'liters', type: 'number', gen: () => randFloat(15, 90) },
      { name: 'cost', type: 'number', gen: () => randFloat(300, 2200) },
      { name: 'fuel_type', type: 'selector', options: ['Diesel', 'Regular', 'Premium', 'Electric'], gen: (o) => pick(o) },
      { name: 'odometer', type: 'number', gen: () => randInt(10000, 240000) },
      { name: 'fill_date', type: 'date', gen: (_, ts) => toDateStr(ts) },
      { name: 'full_tank', type: 'boolean', gen: () => (chance(0.7) ? 'true' : 'false') },
    ],
  },
  {
    name: 'Real Estate Listings',
    description: 'Property inventory with pricing and status',
    records: 180,
    fields: [
      { name: 'address', type: 'text', gen: () => `${randInt(1, 300)} ${pick(['Oak', 'Maple', 'Pine', 'Cedar', 'Elm'])} St` },
      { name: 'price', type: 'number', gen: () => randInt(80000, 950000) },
      { name: 'bedrooms', type: 'number', gen: () => randInt(1, 6) },
      { name: 'area_m2', type: 'number', gen: () => randInt(45, 480) },
      { name: 'property_type', type: 'selector', options: ['Apartment', 'House', 'Studio', 'Loft', 'Townhouse'], gen: (o) => pick(o) },
      { name: 'status', type: 'selector', options: ['Available', 'Reserved', 'Sold', 'Rented'], gen: (o) => pick(o) },
      { name: 'listed_date', type: 'date', gen: (_, ts) => toDateStr(ts) },
    ],
  },
  {
    name: 'Event Tickets',
    description: 'Ticket sales by tier and sales channel',
    records: 340,
    fields: [
      { name: 'event', type: 'text', gen: () => pick(['Jazz Night', 'Tech Summit', 'Food Festival', 'Marathon', 'Art Expo', 'Comedy Show', 'Film Premiere']) },
      { name: 'price', type: 'number', gen: () => randFloat(150, 3500) },
      { name: 'quantity', type: 'number', gen: () => randInt(1, 6) },
      { name: 'tier', type: 'selector', options: ['General', 'VIP', 'Student', 'Backstage'], gen: (o) => pick(o) },
      { name: 'channel', type: 'selector', options: ['Online', 'Box Office', 'Partner', 'App'], gen: (o) => pick(o) },
      { name: 'event_date', type: 'date', gen: (_, ts) => toDateStr(ts) },
      { name: 'checked_in', type: 'boolean', gen: () => (chance(0.6) ? 'true' : 'false') },
    ],
  },
  {
    name: 'Support Tickets',
    description: 'Customer support cases and resolution metrics',
    records: 360,
    fields: [
      { name: 'subject', type: 'text', gen: () => pick(['Login issue', 'Billing question', 'Feature request', 'Bug report', 'Refund request', 'Account access', 'Performance']) },
      { name: 'priority', type: 'selector', options: ['Low', 'Medium', 'High', 'Urgent'], gen: (o) => pick(o) },
      { name: 'resolution_hours', type: 'number', gen: () => randFloat(0.5, 72, 1) },
      { name: 'channel', type: 'selector', options: ['Email', 'Chat', 'Phone', 'Portal'], gen: (o) => pick(o) },
      { name: 'satisfaction', type: 'number', gen: () => randInt(1, 5) },
      { name: 'created_date', type: 'date', gen: (_, ts) => toDateStr(ts) },
      { name: 'resolved', type: 'boolean', gen: () => (chance(0.82) ? 'true' : 'false') },
    ],
  },
  {
    name: 'Library Loans',
    description: 'Book lending activity and returns',
    records: 240,
    fields: [
      { name: 'book', type: 'text', gen: () => pick(['Dune', '1984', 'Sapiens', 'The Hobbit', 'Clean Code', 'Hyperion', 'Neuromancer', 'The Odyssey']) },
      { name: 'member', type: 'text', gen: () => person() },
      { name: 'loan_days', type: 'number', gen: () => randInt(3, 45) },
      { name: 'genre', type: 'selector', options: ['Fiction', 'Sci-Fi', 'History', 'Tech', 'Classic'], gen: (o) => pick(o) },
      { name: 'loan_date', type: 'date', gen: (_, ts) => toDateStr(ts) },
      { name: 'returned', type: 'boolean', gen: () => (chance(0.75) ? 'true' : 'false') },
    ],
  },
  {
    name: 'Weather Readings',
    description: 'Environmental sensor measurements by station',
    records: 420,
    fields: [
      { name: 'station', type: 'text', gen: () => `Station-${pick(['North', 'South', 'East', 'West', 'Central'])}` },
      { name: 'temperature', type: 'number', gen: () => randFloat(-5, 42, 1) },
      { name: 'humidity', type: 'number', gen: () => randInt(15, 98) },
      { name: 'condition', type: 'selector', options: ['Clear', 'Cloudy', 'Rain', 'Storm', 'Fog', 'Snow'], gen: (o) => pick(o) },
      { name: 'wind_kmh', type: 'number', gen: () => randFloat(0, 85, 1) },
      { name: 'reading_time', type: 'time', gen: (_, ts) => toTimeStr(ts) },
      { name: 'reading_date', type: 'date', gen: (_, ts) => toDateStr(ts) },
    ],
  },
]

// ---------------------------------------------------------------------------
// Build in-memory model — single source of truth for ids.
// field id = position in the flat `fields` array (1-based).
// form id  = position in FORMS (1-based).
// ---------------------------------------------------------------------------
const fields = [] // { id, name, type, options }
const formFields = [] // { formId, fieldId, sortOrder }
let fieldId = 0

FORMS.forEach((form, fi) => {
  const formId = fi + 1
  form.fields.forEach((f, sortOrder) => {
    fieldId += 1
    fields.push({ id: fieldId, name: f.name, type: f.type, options: f.options || null })
    formFields.push({ formId, fieldId, sortOrder })
    f._id = fieldId // stash resolved id back on the definition for record gen
  })
})

// Records
const records = [] // { formId, data, createdAt }
FORMS.forEach((form, fi) => {
  const formId = fi + 1
  const count = Math.round(form.records * MULTIPLIER)
  for (let i = 0; i < count; i++) {
    const ts = randomTimestamp()
    const data = {}
    form.fields.forEach((f) => {
      data[f._id] = String(f.gen(f.options || null, ts))
    })
    records.push({ formId, data, createdAt: ts.toISOString() })
  }
})

// ---------------------------------------------------------------------------
// Emit SQL
// ---------------------------------------------------------------------------
const esc = (s) => String(s).replace(/'/g, "''")
const sqlOptions = (opts) => (opts ? `'${esc(JSON.stringify(opts))}'` : 'NULL')

const lines = []
lines.push('-- Auto-generated by scripts/generate-seed.js — DO NOT edit by hand.')
lines.push(`-- Generated: ${new Date().toISOString()}`)
lines.push(`-- Config: multiplier=${MULTIPLIER} months=${MONTHS} seed=${SEED}`)
lines.push(`-- Forms: ${FORMS.length}  Fields: ${fields.length}  Records: ${records.length}`)
lines.push('--')
lines.push('-- WARNING: this wipes ALL data (TRUNCATE ... RESTART IDENTITY CASCADE)')
lines.push('-- so that BIGSERIAL ids are deterministic. Run on a showcase/demo DB only.')
lines.push('')
lines.push('BEGIN;')
lines.push('')
lines.push('TRUNCATE records, form_fields, form_types, fields RESTART IDENTITY CASCADE;')
lines.push('')

// fields
lines.push('-- Fields')
lines.push('INSERT INTO fields (name, data_type, options) VALUES')
lines.push(
  fields
    .map((f) => `  ('${esc(f.name)}', '${f.type}', ${sqlOptions(f.options)})`)
    .join(',\n') + ';'
)
lines.push('')

// form_types
lines.push('-- Form types')
lines.push('INSERT INTO form_types (name, description) VALUES')
lines.push(
  FORMS
    .map((f) => `  ('${esc(f.name)}', '${esc(f.description)}')`)
    .join(',\n') + ';'
)
lines.push('')

// form_fields
lines.push('-- Form <-> field associations')
lines.push('INSERT INTO form_fields (form_type_id, field_id, sort_order) VALUES')
lines.push(
  formFields
    .map((ff) => `  (${ff.formId}, ${ff.fieldId}, ${ff.sortOrder})`)
    .join(',\n') + ';'
)
lines.push('')

// records (chunked so no single statement is enormous)
lines.push('-- Records')
const CHUNK = 500
for (let i = 0; i < records.length; i += CHUNK) {
  const chunk = records.slice(i, i + CHUNK)
  lines.push('INSERT INTO records (form_type_id, data, created_at) VALUES')
  lines.push(
    chunk
      .map(
        (r) =>
          `  (${r.formId}, '${esc(JSON.stringify(r.data))}', '${r.createdAt}')`
      )
      .join(',\n') + ';'
  )
}
lines.push('')
lines.push('COMMIT;')
lines.push('')

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = join(__dirname, '..', OUT)
writeFileSync(outPath, lines.join('\n'), 'utf8')

console.log(
  `Wrote ${OUT}: ${FORMS.length} forms, ${fields.length} fields, ${records.length} records ` +
    `(multiplier=${MULTIPLIER}, months=${MONTHS}, seed=${SEED}).`
)
