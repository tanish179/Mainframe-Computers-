# Mainframe Computers Business System - Backend

Internal Business Management System for **Mainframe Computers** (Computer Sales, Services & Repair Business in Kolhapur, Maharashtra, India).

## 🚀 Overview

This backend system provides a complete digital operating system supporting:
- Customer CRM & Service History
- Product Catalog & Stock Inventory
- Computer/Printer Repair & Service Job Lifecycles
- Point of Sale (POS), Invoicing & Payment Processing
- Financial Ledger, Expenses, Profit (`Income - Expense`), Cash Flow (`Money In - Money Out`)
- Customer Receivables & Supplier Payables
- Business Reports & Analytics
- Model Context Protocol (MCP) Server for optional AI/ChatGPT integration

> [!NOTE]
> The `frontend` directory is kept completely isolated. The backend services defined in `src/services/` serve as the single source of truth for both the future manual dashboard and the MCP server.

---

## 🏗️ Tech Stack

- **Runtime**: Node.js (ESM), TypeScript
- **Framework**: Express.js
- **Database & Auth**: Supabase (PostgreSQL), Row Level Security (RLS)
- **Validation**: Zod
- **AI Integration**: `@modelcontextprotocol/sdk` (MCP Server)
- **Testing**: Vitest

---

## 🗄️ Database Setup & Migrations

All migration scripts are located in `supabase/migrations/`:
1. `20260926000000_initial_schema.sql`: Schema definition for all 21 tables, UUID keys, foreign constraints, and indexes.
2. `20260926000001_rls_policies.sql`: Row Level Security policies for `OWNER`, `ADMIN`, and `STAFF`.
3. `20260926000002_functions_and_triggers.sql`: Stored functions, sequence generators for Job Numbers (`MJ-YYYY-XXXXX`) and Invoice Numbers (`INV-YYYY-XXXXX`), and `get_business_summary()` aggregator.

To apply migrations to your Supabase project:
```bash
supabase db push
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` and supply your Supabase credentials:

```env
PORT=4000
NODE_ENV=development

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

BUSINESS_NAME="Mainframe Computers"
DEFAULT_CURRENCY="INR"
DEFAULT_TIMEZONE="Asia/Kolkata"
```

---

## 🏃 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development REST API Server
```bash
npm run dev
```

### 3. Run MCP Server for ChatGPT / AI Clients
```bash
npm run mcp:start
```

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🧪 Testing & Verification

Run the Vitest test suite:
```bash
npm test
```

Run TypeScript strict type checking:
```bash
npm run type-check
```

---

## 🤖 MCP Server Tools

The MCP server exposes 31 tools that call the exact same business logic services:

### Read Tools (21)
- `get_business_summary`
- `get_sales`, `get_sale`
- `get_customers`, `get_customer`
- `get_service_jobs`, `get_service_job`
- `get_payments`, `get_income`, `get_expenses`, `get_transactions`
- `get_receivables`, `get_payables`
- `get_inventory`, `get_products`, `get_low_stock`
- `get_invoices`, `get_business_activity`
- `get_financial_report`, `get_service_report`, `get_sales_report`

### Write Tools (10)
- `create_customer`, `update_customer`
- `create_service_job`, `update_service_job_status`
- `create_sale`, `create_expense`
- `record_payment`, `create_invoice`
- `add_product`, `update_inventory`
