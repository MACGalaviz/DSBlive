# 📱 Complete Guide - DSBlive

## 📦 Project Content

```
dsblive/
├── .github/workflows/      # GitHub Actions configuration
├── src/
│   ├── components/         # Reusable components
│   │   ├── Layout.jsx      # Main layout with navigation
│   │   └── LoadingSpinner.jsx
│   ├── contexts/           # Context API
│   │   └── AppContext.jsx  # Global app state
│   ├── pages/              # Main pages
│   │   ├── DashboardPage.jsx     # Dashboard with statistics
│   │   ├── FieldsPage.jsx        # Fields CRUD
│   │   ├── FormsPage.jsx         # Forms CRUD
│   │   └── RecordsPage.jsx       # Records CRUD
│   ├── services/
│   │   └── supabase.js     # Supabase configuration and services
│   ├── App.jsx             # Main component
│   ├── main.jsx            # Entry point
│   └── index.css           # Tailwind styles
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── db/supabase-setup.sql      # Script to create tables
├── db/supabase-example-data.sql  # Example data
└── README.md               # Full documentation
```

## 🎯 Data Architecture

### Database Model

```
┌─────────────┐
│   fields    │ ← Define reusable attributes
├─────────────┤
│ id          │
│ name        │
│ data_type   │
│ options     │
└─────────────┘
       ↓
       │ Many to Many
       ↓
┌──────────────────┐      ┌─────────────────────┐
│    form_types    │←────→│     form_fields     │
├──────────────────┤      ├─────────────────────┤
│ id               │      │ id_form_type        │
│ name             │      │ id_field            │
│ description      │      │ sort_order          │
└──────────────────┘      └─────────────────────┘
       ↓
       │ One to Many
       ↓
┌─────────────┐
│   records   │ ← Stores data in JSON
├─────────────┤
│ id          │
│ id_form_type│
│ data (JSON) │
│ created_at  │
└─────────────┘
```

### Data Flow Example

1. **Field "price"** → data_type: "number"
2. **Field "quantity"** → data_type: "number"  
3. **Field "unit"** → data_type: "selector", options: ["kg", "liters"]

These 3 fields are combined in:

4. **Form "Purchases"** → fields: [price, quantity, unit]

And the data is saved as:

5. **Record** → data: `{"price": "150", "quantity": "5", "unit": "kg"}`

## 🔧 Detailed Configuration

### Step 1: Prepare Supabase

#### 1.1 Create Project
1. Go to https://supabase.com
2. Click "New Project"
3. Complete:
   - **Name**: dsblive (or your preferred name)
   - **Database Password**: (generate a secure one)
   - **Region**: Choose the closest one
4. Click "Create new project"
5. Wait 1-2 minutes

#### 1.2 Run SQL
1. In your project, side menu: **SQL Editor**
2. Click "New query"
3. Open `db/supabase-setup.sql` in your editor
4. Copy ALL the content
5. Paste it into the Supabase editor
6. Click "Run" (bottom right corner)
7. You will see: "Success. No rows returned"

#### 1.3 Verify Tables
1. Side menu: **Table Editor**
2. You should see 4 tables:
   - fields
   - form_types
   - form_fields
   - records

#### 1.4 (Optional) Load Example Data
1. In SQL Editor, new query
2. Open `db/supabase-example-data.sql`
3. Copy and paste the content
4. Click "Run"

#### 1.5 Get Credentials
1. Side menu: **Settings** (gear icon)
2. Click "API"
3. In the **Project API keys** section:
   - Copy **URL** (e.g.: `https://abcdefgh.supabase.co`)
   - Copy **anon public** key (starts with `eyJhbGci...`)

### Step 2: Configure the Application

#### 2.1 Open the Project
```bash
cd dsblive
code .  # If using VS Code
```

#### 2.2 Configure Credentials
1. Open: `src/services/supabase.js`
2. Look for lines 4-5:
```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
```

3. Replace with your credentials:
```javascript
const supabaseUrl = 'https://abcdefgh.supabase.co'  // ← Your URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // ← Your key
```

4. Save the file (Ctrl+S or Cmd+S)

#### 2.3 Install Dependencies
```bash
npm install
```

This will install:
- react (19.0.0)
- react-dom (19.0.0)
- react-router-dom
- @supabase/supabase-js
- recharts
- lucide-react
- tailwindcss (4.0.0)
- vite

#### 2.4 Run in Development
```bash
npm run dev
```

You will see something like:
```
  VITE v5.1.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/DSBlive/
  ➜  Network: use --host to expose
```

Open http://localhost:5173/DSBlive/ in your browser

### Step 3: Deploy to GitHub Pages

#### 3.1 Create Repository on GitHub
1. Go to https://github.com
2. Click "+" → "New repository"
3. Name: `dsblive` (or your preferred name)
4. Public or Private (recommended: Public)
5. DO NOT check "Initialize with README"
6. Click "Create repository"

#### 3.2 Connect Local Project
```bash
# In the dsblive/ folder
git init
git add .
git commit -m "Initial commit: Complete DSBlive"
git branch -M main
git remote add origin https://github.com/YOUR_USER/dsblive.git
git push -u origin main
```

Replace `YOUR_USER` with your GitHub username.

#### 3.3 Configure GitHub Pages
1. In your GitHub repository
2. Click on **Settings** (top tab)
3. Left side menu: **Pages**
4. In **Source**: 
   - Select: **GitHub Actions**
   - (DO NOT use "Deploy from branch")

#### 3.4 Verify Deployment
1. Go to the **Actions** tab
2. You will see a "Deploy to GitHub Pages" workflow in progress
3. Wait 2-3 minutes (yellow icon → green)
4. If it turns green ✓ → Deployed successfully

#### 3.5 Access your Application
Your app will be at:
```
https://YOUR_USER.github.io/DSBlive/
```

⚠️ **IMPORTANT**: If you changed the repository name, update `vite.config.js`:
```javascript
base: '/YOUR_REPO_NAME/',
```

## 🎓 Usage Tutorial

### Scenario 1: Pet Purchase Log

#### Step 1: Create Fields
1. Go to **Fields**
2. Create the following fields:

| Name | Type | Options |
|--------|------|----------|
| product_name | Text | - |
| price | Number | - |
| quantity | Number | - |
| unit | Selector | kg, liters, units |
| store | Text | - |

#### Step 2: Create Form
1. Go to **Forms**
2. Click "New Form"
3. Name: `Pet Purchases`
4. Select ALL the created fields
5. Order them as you prefer
6. Click "Create"

#### Step 3: Register Purchases
1. Go to **Records**
2. Click "New Record"
3. Select "Pet Purchases"
4. Fill in the data:
   - Name: Cat litter
   - Price: 150
   - Quantity: 5
   - Unit: kg
   - Store: Walmart
5. Click "Save"

Repeat with more purchases:
- Cat food, $280, 3 kg, Petco
- Mouse toy, $45, 2 units, Amazon

#### Step 4: View Statistics
1. Go to **Dashboard**
2. In "Analyze form", select "Pet Purchases"
3. You will see:
   - **Numerical Statistics**: Average price, maximum, minimum
   - **Distribution**: Which units you use the most
   - **Charts**: Purchases per day

### Scenario 2: Feeding Control

#### Fields
| Name | Type | Options |
|--------|------|----------|
| food_type | Text | - |
| amount_grams | Number | - |
| time | Time | - |

#### Form
- Name: `Cat Feeding`
- Fields: [food_type, amount_grams, time]

#### Records
- Kibble, 50g, 08:00
- Wet food, 85g, 14:00
- Kibble, 50g, 20:00

#### Useful Statistics
- Average consumption per day
- Most frequent times
- Total food by type

## 🎨 Customization

### Change Colors

Edit `src/index.css`:

```css
@theme {
  --color-primary: #10b981;      /* Green */
  --color-primary-dark: #059669; /* Dark Green */
}
```

Suggested colors:
- Blue (default): `#3b82f6` / `#2563eb`
- Green: `#10b981` / `#059669`
- Purple: `#8b5cf6` / `#7c3aed`
- Orange: `#f59e0b` / `#d97706`
- Pink: `#ec4899` / `#db2777`

### Add New Field Types

Edit `src/pages/FieldsPage.jsx`, line ~7:

```javascript
const DATA_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'selector', label: 'Selector (options)' },
  { value: 'boolean', label: 'Yes/No' },
  
  // Add new types here:
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'url', label: 'URL' }
]
```

Then edit `src/pages/RecordsPage.jsx`, `renderField()` function to handle the new type.

### Change the Title

Edit `index.html`, line 7:

```html
<title>My Custom App</title>
```

And in `src/components/Layout.jsx`, line 28:

```jsx
<h1 className="text-xl font-bold text-gray-900 dark:text-white">
  My App
</h1>
```

## 🐛 Troubleshooting

### Error: "Failed to fetch"
**Cause**: Incorrect Supabase credentials  
**Solution**:
1. Check `src/services/supabase.js`
2. Ensure you copied the URL and key correctly
3. There should be no extra spaces

### Error: "relation does not exist"
**Cause**: Tables not created in Supabase  
**Solution**:
1. Go to Supabase SQL Editor
2. Run `db/supabase-setup.sql` again
3. Check in Table Editor that the tables exist

### Blank application after deploying
**Cause**: Incorrect base path  
**Solution**:
1. Open `vite.config.js`
2. Verify that `base: '/DSBlive/'` matches your repo name
3. If your repo is named "my-app", it must be `base: '/my-app/'`
4. Commit and push again

### Dark mode not working
**Cause**: localStorage blocked  
**Solution**:
1. Check browser cookie permissions
2. Try in incognito mode
3. Clear cache and reload

### Charts are not displaying
**Cause**: No data or incorrect type  
**Solution**:
1. Ensure you have created records
2. For numerical statistics, fields must be type "number"
3. Select a specific form in the dashboard

## 📊 Available Statistics Types

### For Numerical Fields
- **Average**: Arithmetic mean
- **Maximum**: Highest value
- **Minimum**: Lowest value
- **Total**: Sum of all values

### For Selector Fields
- **Pie Chart**: Percentage distribution
- **Count**: How many times each option was used

### General
- **Records per form**: Bar chart
- **Records per day**: Line chart (last 7 days)
- **Summary Cards**: Total fields, forms, records

## 🔒 Security Model

This app ships as a **public read-only showcase**: anyone can read; only the
**owner account** can write. It is already wired — `db/supabase-setup.sql` creates
these policies for every table:

```sql
-- Public read
CREATE POLICY "Public read" ON fields FOR SELECT USING (true);

-- Owner-only write (replace with your owner UID)
CREATE POLICY "Owner insert" ON fields FOR INSERT WITH CHECK (auth.uid() = 'OWNER_USER_ID'::uuid);
CREATE POLICY "Owner update" ON fields FOR UPDATE USING (auth.uid() = 'OWNER_USER_ID'::uuid);
CREATE POLICY "Owner delete" ON fields FOR DELETE USING (auth.uid() = 'OWNER_USER_ID'::uuid);
```

Key points:

1. **Two accounts only.** Create an owner account (you) and a read-only demo
   account in **Authentication > Users**, then disable public sign-ups.
2. **Writes are pinned to the owner UID.** Even a logged-in demo user cannot
   write — RLS rejects any `auth.uid()` that is not the owner.
3. **The anon/publishable key is public by design** (it ships in the client
   bundle). RLS — not hiding the key — is what protects the data.
4. **Disabled UI buttons are cosmetic.** The frontend disables edit controls for
   non-owners (`OWNER_UID` in `src/contexts/AuthContext.jsx`), but the database
   is the real gate.

For a **private** instance instead (any logged-in user may write), swap the
owner check for `auth.uid() IS NOT NULL`.

## 📈 Future Improvement Ideas

- [ ] Export data to CSV/Excel
- [ ] Import data from files
- [ ] Advanced filters in records
- [ ] Customizable charts
- [ ] Share forms with other users
- [ ] Notifications and reminders
- [ ] Mobile app with React Native
- [ ] Public API for integrations

## 🤝 Support

Problems or questions?

1. Check this complete guide
2. Consult the README.md
3. Check the browser console (F12)
4. Check Supabase logs

## 🎉 Congratulations!

You have successfully set up a complete dynamic form management application with real-time statistics.

**Achieved Features:**
- ✅ 3 Full CRUDs
- ✅ Dynamic form system
- ✅ Dashboard with statistics
- ✅ Dark mode
- ✅ Responsive design
- ✅ Deployed in the cloud

**Modern Stack:**
- ✅ React 19
- ✅ Tailwind CSS 4
- ✅ Supabase (PostgreSQL)
- ✅ GitHub Pages

Now customize it and create your own forms!
```
