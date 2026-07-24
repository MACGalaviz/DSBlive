# 🚀 Quick Start - DSBlive

## 5-Minute Setup

### 1. Configure Supabase (2 minutes)

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project (wait 1-2 minutes)
3. Go to **Authentication** > **Users** > **Add user** and create your
   **owner** account (your email) and a read-only **demo** account. Copy the
   owner's **User UID**.
4. In `supabase-setup.sql`, replace `OWNER_USER_ID` with that UID.
5. Go to **SQL Editor** and run `supabase-setup.sql`, then (optional)
   `supabase-example-data.sql` for demo data.
6. In **Authentication** > **Providers**, disable new sign-ups.
7. Go to **Settings** > **API** and copy the Project URL + anon/publishable key.

### 2. Configure the App (1 minute)

1. Open `src/services/supabase.js` and replace the credentials:

```javascript
const supabaseUrl = 'https://yourproject.supabase.co'
const supabaseAnonKey = 'sb_publishable_...'
```

2. Open `src/contexts/AuthContext.jsx` and set `OWNER_UID` to your owner UID
   (the same one used in `supabase-setup.sql`), so only you see the edit controls.

### 3. Install and Run (2 minutes)

```bash
npm install
npm run dev
```

Ready! Open http://localhost:5173/DSBlive/

Log in with the demo account to browse (read-only), or your owner account to edit.

## First Steps

### Create your first field
1. Go to **Fields** > **New Field**
2. Name: "price", Type: Number

### Create your first form
1. Go to **Forms** > **New Form**
2. Name: "Purchases"
3. Select the "price" field

### Create your first record
1. Go to **Records** > **New Record**
2. Select "Purchases"
3. Enter a price

### View statistics
1. Go to **Dashboard**
2. Enjoy your charts!

## Deploy to GitHub Pages

```bash
# 1. Create repo on GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USER/DSBlive.git
git push -u origin main

# 2. On GitHub: Settings > Pages > Source: GitHub Actions
# 3. The workflow is already configured, it will deploy automatically
```

Your app will be at: `https://YOUR_USER.github.io/DSBlive/`

## Problems?

- **Supabase Error**: Verify credentials in `src/services/supabase.js`
- **No data visible**: Make sure you executed the SQL in Supabase
- **Build Error**: Run `npm install` again

## Next Steps

- Customize colors in `src/index.css`
- Add more field types in `src/pages/FieldsPage.jsx`
- Set up the keep-alive workflow so the free Supabase project is not paused

Have fun building your forms!
