# DSBlive - Dynamic Schema Builder

A modern web application for creating and managing dynamic forms with real-time statistics.

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
2. Open the `supabase-setup.sql` file
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

The application will be available at `http://localhost:5173/dsblive/`

## 📦 Deploy to GitHub Pages

### 1. Create GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dsblive.git
git push -u origin main
```

### 2. Configure GitHub Pages

1. Go to your repository on GitHub
2. **Settings** > **Pages**
3. In **Source**, select **GitHub Actions**

### 3. Deploy

The GitHub Actions workflow is already configured. Just push to `main` and it will deploy automatically.

Your app will be at: `https://YOUR_USERNAME.github.io/dsblive/`

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

⚠️ **IMPORTANT**: Supabase policies are configured for public access. For production:

1. Enable authentication in Supabase
2. Update RLS policies in `supabase-setup.sql`
3. Implement login/registration in the app

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
