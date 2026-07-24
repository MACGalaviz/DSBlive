<div align="center">

# 📊 DSBlive

**A no-code dynamic data platform — design your own fields, forms and dashboards, then explore the data with 12 kinds of interactive charts.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Recharts](https://img.shields.io/badge/Recharts-2-8884d8)](https://recharts.org)

[**🌐 Live Demo**](https://macgalaviz.github.io/DSBlive/) · [**📖 Setup Guide**](docs/INTEGRATION.md) · [**⚡ Quickstart**](docs/QUICKSTART.md)

</div>

---

## Overview

DSBlive lets you model **any** kind of data without touching the schema. Define
reusable **fields** (text, number, date, time, selector, yes/no), combine them
into **forms**, and capture **records**. Every form gets an automatic analytics
dashboard, and you pick exactly which charts each form shows.

It ships as a **public read-only showcase**: anyone can browse everything, but
only the owner account can write — enforced at the database with Supabase RLS.

### 🔑 Demo access (read-only)

```
Email:    demo@dsblive.app
Password: DemoDSB2026
```

## ✨ Features

- **Dynamic schema** — create fields, assemble forms, and record data, all from the UI.
- **12 chart types** — summaries, distributions, trends, comparisons, correlations and more.
- **Per-form chart config** — tick which charts appear for each form; saved in the database.
- **Chart Gallery** — a dedicated tab showing every chart with sample data and how it aggregates.
- **Favorites** — star records and browse them in a dedicated Favorites tab.
- **Duplicate** — clone a record with the current date for fast repeat entry.
- **Search & pagination** — instant client-side search on fields, forms and records.
- **Dark / light mode** — theme-aware everything, including chart tooltips.
- **Confirmation modals** — polished dialogs for destructive actions.
- **Owner-only writes** — public read, owner write, enforced by Row Level Security.

## 📈 Chart catalog

| Chart | What it shows |
|-------|---------------|
| Field Summaries | Average / min / max / total per numeric field |
| Comparison by Group | Grouped bar summing numeric fields per category |
| Average by Group | Average of a numeric field per category (not summed) |
| Value Distribution | Donut per selector field |
| Yes / No Ratio | True vs false split per boolean field |
| Top Values | Most frequent values of a text field |
| Activity Over Time | Records per month |
| Cumulative Growth | Running total of records over time |
| Numeric Trends | Monthly total of each numeric field |
| Stacked Over Time | Category breakdown per month |
| Correlation | Scatter plot between two numeric fields |
| Weekday Activity | Records by day of the week |

## 🛠️ Tech stack

React 19 · Tailwind CSS 4 · Supabase (PostgreSQL + Auth + RLS) · Recharts · React Router (HashRouter) · Vite

## 🚀 Quick start

```bash
git clone https://github.com/MACGalaviz/DSBlive.git
cd DSBlive
npm install
npm run dev          # http://localhost:5173/DSBlive/
```

Then point the app at your Supabase project (URL + anon key in
`src/services/supabase.js`) and run the SQL below. Full walkthrough:
[**docs/INTEGRATION.md**](docs/INTEGRATION.md).

## 🗄️ Database

All SQL lives in [`db/`](db/). Run it in the Supabase **SQL Editor**.

| File | When to run |
|------|-------------|
| `db/supabase-setup.sql` | **Fresh install** — creates tables + RLS (already includes every column). Replace `OWNER_USER_ID` with your owner UID first. |
| `db/supabase-add-chart-config.sql` | **Existing DB** — adds the per-form `chart_config` column. |
| `db/supabase-add-favorites.sql` | **Existing DB** — adds the `is_favorite` column. |
| `db/supabase-example-data.sql` | Optional small example dataset. |
| `db/supabase-seed-generated.sql` | Optional large demo seed (10 forms, 69 fields, 3100 records). ⚠️ `TRUNCATE`s all data. |

### Regenerating the demo seed

```bash
npm run seed:gen                          # -> db/supabase-seed-generated.sql
npm run seed:gen -- --multiplier 3        # 3x more records
npm run seed:gen -- --months 18 --seed 42 # wider date range, reproducible
```

## 📂 Project structure

```
DSBlive/
├── db/                     SQL: schema, migrations, seeds
├── docs/                   INTEGRATION · QUICKSTART · COMPLETE_GUIDE
├── scripts/
│   └── generate-seed.js    Multi-domain seed generator
├── src/
│   ├── components/         Layout, ConfirmModal
│   ├── contexts/           AppContext, AuthContext
│   ├── pages/              Dashboard, Fields, Forms, Records, Charts, Login
│   ├── services/           supabase.js
│   └── utils/              charts.js (chart catalog)
└── .github/workflows/      deploy.yml, keepalive.yml
```

## 🔒 Access model

Public read, owner-only write — enforced by Supabase RLS in `db/supabase-setup.sql`:

- `SELECT` is open to everyone (public showcase).
- `INSERT` / `UPDATE` / `DELETE` require `auth.uid()` to equal the owner UID.

The anon key ships in the client bundle and is **public by design** — RLS, not
key secrecy, is what protects the data. Keep public sign-ups disabled in Supabase.

## 📦 Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
publishes to GitHub Pages automatically. Live at
`https://<user>.github.io/DSBlive/`.

## 📚 Documentation

- [**Integration guide**](docs/INTEGRATION.md) — full Supabase + deploy setup
- [**Quickstart**](docs/QUICKSTART.md) — the short version
- [**Complete guide**](docs/COMPLETE_GUIDE.md) — architecture and usage in depth

## 📄 License

See [`License`](License).
