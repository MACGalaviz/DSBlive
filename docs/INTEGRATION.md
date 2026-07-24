# DSBlive - Dynamic Schema Builder

A modern web application for creating and managing dynamic forms with real-time statistics.

## 👁️ Access Model

The app is a **public read-only showcase**: anyone can browse the forms, records
and dashboards. Only the **owner account** can create, edit or delete data.
This is enforced at the database level with Supabase RLS — hidden/disabled
buttons in the UI are only cosmetic.

**Demo access (read-only):**

```
Email:    demo@dsblive.app
Password: DemoDSB2026
```

Log in with those credentials to explore. Editing controls stay disabled.

## 🚀 Features

- ✅ **Dynamic Field Creation** - Define reusable attributes (text, number, date, selector, etc.)
- ✅ **Form Management** - Combine fields to create custom form types
- ✅ **Data Recording** - Capture information using your forms
- ✅ **Statistics Dashboard** - Visualize data with interactive charts
- ✅ **Dark/Light Mode** - Adaptive interface with persistence
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **React 19** - Frontend framework
- **Tailwind CSS 4** - Styling
- **Supabase** - Backend and PostgreSQL database
- **Context API** - State management
- **Recharts** - Charts and visualizations
- **React Router** - Navigation
- **Vite** - Build tool

## 📋 Prerequisites

- Node.js 18+
- Supabase account (free)
- Git

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <your-repo>
cd dsblive
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Supabase

#### a) Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create an account or sign in
3. Create a new project
4. Wait for the project to be ready

#### b) Run SQL Script

1. In your Supabase project, go to **SQL Editor**
2. Open the `db/supabase-setup.sql` file
3. Copy all the content
4. Paste it in the Supabase SQL Editor
5. Click **Run**

This will create the tables:
- `fields` - Reusable attributes/fields
- `form_types` - Form types
- `form_fields` - Relationship between forms and fields
- `records` - Recorded data

#### c) Get Credentials

1. In Supabase, go to **Settings** > **API**
2. Copy:
   - **Project URL** (something like: `https://xxxxx.supabase.co`)
   - **anon/public key** (public key)

#### d) Create accounts and lock writes to the owner

1. In Supabase, go to **Authentication** > **Users** > **Add user** and create:
   - your **owner** account (your real email + password)
   - a **demo** account (`demo@dsblive.app` / `DemoDSB2026`)
2. Open your owner user and copy its **User UID**.
3. In `db/supabase-setup.sql`, replace every `OWNER_USER_ID` with that UID, then
   run the whole script in the SQL Editor.
4. In `src/contexts/AuthContext.jsx`, set `OWNER_UID` to the same UID so the
   owner sees the editing controls enabled (non-owners get read-only UI).
5. Go to **Authentication** > **Providers** (or **Sign In / Providers**) and
   **disable new sign-ups**, so only these two accounts can ever exist.

#### e) (Optional) Load demo data

Run `db/supabase-example-data.sql` in the SQL Editor on the fresh database to
populate example fields, forms and records for the showcase.

### 4. Configure Environment Variables

Open `src/services/supabase.js` and replace:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL'  // ← Your Project URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'  // ← Your anon key
```

With your actual credentials:

```javascript
const supabaseUrl = 'https://yourproject.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### 5. Run in Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173/DSBlive/`

## 📦 Deploy to GitHub Pages

### 1. Create GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/DSBlive.git
git push -u origin main
```

### 2. Configure GitHub Pages

1. Go to your repository on GitHub
2. **Settings** > **Pages**
3. In **Source**, select **GitHub Actions**

### 3. Deploy

The GitHub Actions workflow is already configured. Just push to `main` and it will deploy automatically.

Your app will be at: `https://YOUR_USERNAME.github.io/DSBlive/`

## 📖 Usage Guide

### 3-Stage Workflow:

#### **STAGE 1: Create Fields**

1. Go to **Fields**
2. Click **New Field**
3. Define:
   - Name (e.g. "price", "quantity", "store")
   - Data type (text, number, date, time, selector, yes/no)
   - Options (if selector, e.g. "kg, liters, units")

**Example:**
```
Field: "price"
Type: Number

Field: "unit"
Type: Selector
Options: kg, liters, units
```

#### **STAGE 2: Create Forms**

1. Go to **Forms**
2. Click **New Form**
3. Give it a name (e.g. "Product Purchases")
4. Select the fields it will use
5. Order them by dragging

**Example:**
```
Form: "Purchases"
Fields: product_name, price, quantity, unit, store
```

#### **STAGE 3: Record Data**

1. Go to **Records**
2. Click **New Record**
3. Select the form type
4. Fill in the fields
5. Save

**Example:**
```
Type: Purchases
- Name: Cat litter
- Price: 150
- Quantity: 5
- Unit: kg
- Store: Walmart
```

### View Statistics

1. Go to **Dashboard**
2. Select a specific form or view all
3. Visualize:
   - Averages, maximums and minimums of numeric fields
   - Selector distributions
   - Temporal trends
   - Records per form

## 🎨 Customization

### Colors

Edit `src/index.css`:

```css
@theme {
  --color-primary: #3b82f6;      /* Blue */
  --color-primary-dark: #2563eb; /* Dark blue */
}
```

### Additional Field Types

To add new field types, edit `src/pages/FieldsPage.jsx`:

```javascript
const DATA_TYPES = [
  // ... existing
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' }
]
```

## 🔒 Security

Access is **public read, owner-only write**, enforced by Supabase RLS
(`db/supabase-setup.sql`):

- `SELECT` is open to everyone (public showcase).
- `INSERT` / `UPDATE` / `DELETE` require `auth.uid()` to match the owner UID.

Notes:

- The anon key ships in the client bundle and is **public by design** — it is
  not a secret. RLS is what protects the data, not hiding the key.
- Disabling the edit buttons in the UI is cosmetic; the database rejects any
  non-owner write regardless of the UI.
- Keep public sign-ups disabled in Supabase so no one can create a writable
  account. Only the owner and the read-only demo account should exist.

## 🐛 Troubleshooting

### Supabase Connection Error

- Verify credentials in `src/services/supabase.js` are correct
- Ensure the SQL script executed correctly
- Check that tables exist in Supabase

### App doesn't deploy to GitHub Pages

- Verify the workflow is in `.github/workflows/deploy.yml`
- Ensure GitHub Actions is enabled
- Check that `base` in `vite.config.js` matches the repo name

### Charts don't display

- Ensure you have created records
- Select a specific form in the dashboard
- Verify fields are of the correct type (numeric for statistics)

## 📝 Example Use Cases

### Example 1: Pet Purchases

**Fields:**
- product_name (text)
- price (number)
- quantity (number)
- unit (selector: kg, liters, units)
- store (text)

**Form:** "Pet Purchases"

**Useful statistics:**
- Which is the most expensive product?
- Which store do I shop at most?
- Average spend per purchase

### Example 2: Cat Feeding

**Fields:**
- food_type (text)
- quantity (number)
- time (time)
- date (date)

**Form:** "Cat Feeding"

**Useful statistics:**
- Daily/weekly consumption
- Most frequent feeding times
- Consumption trend

## 🤝 Contributions

Contributions are welcome! Please:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source. Use it as you wish.

## ✨ Credits

Built with React 19, Tailwind 4, and Supabase.
