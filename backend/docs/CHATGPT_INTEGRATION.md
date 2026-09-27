# ChatGPT & AI Integration Guide

This guide explains how to connect **ChatGPT** (or any AI client) to the **Mainframe Computers Business System** using either:
1. **ChatGPT Custom GPT Actions** (Recommended for web ChatGPT on chatgpt.com)
2. **Model Context Protocol (MCP)** (Recommended for Claude Desktop, Cursor, and local MCP hosts)

---

## 🌐 Method 1: ChatGPT Custom GPT (Web interface)

You can connect ChatGPT on `chatgpt.com` directly to your local or deployed backend using **Custom GPT Actions**.

### Step 1: Start your Backend Server
Ensure your backend server is running:
```bash
cd "/home/tanish/Desktop/MAINFRAME DASHBOARD /backend"
npm run dev
```
*(Server listens on `http://localhost:4000`)*

### Step 2: Make your local server publicly accessible (For local dev)
Since ChatGPT runs on OpenAI's servers, use `ngrok` or `localtunnel` to expose port 4000:
```bash
npx ngrok http 4000
```
Copy your generated HTTPS URL (e.g., `https://abc-123.ngrok-free.app`).

### Step 3: Create a Custom GPT on ChatGPT
1. Open [ChatGPT](https://chatgpt.com) and go to **Explore GPTs** → **Create**.
2. Go to the **Configure** tab:
   - **Name**: `Mainframe Computers Business Assistant`
   - **Instructions**:
     > You are the AI Assistant for Mainframe Computers (Computer Sales, Services & Repair in Kolhapur).
     > You have direct access to business data (sales, customer history, repair jobs, expenses, profit summary).
     > ALWAYS use the provided Actions to fetch real business metrics before answering questions about revenue, repair status, or inventory. Never guess numbers.
3. Under **Actions**, click **Create new action**.
4. Import the OpenAPI specification from `docs/openapi.json` (or paste its content).
5. Update the `servers.url` in the OpenAPI schema with your public ngrok URL:
   ```json
   "servers": [
     {
       "url": "https://abc-123.ngrok-free.app/api/v1"
     }
   ]
   ```
6. Click **Save** / **Publish** (Only me or Anyone with link).

Now you can ask ChatGPT:
- *"What is our total income and net profit this month?"*
- *"Show me active repair jobs for Dell laptops."*
- *"Create a new customer named Rahul Patil with phone 9876543210."*

---

## 🤖 Method 2: Model Context Protocol (MCP) Server

If you use **Claude Desktop**, **Cursor**, or an MCP-compatible host, use our built-in MCP server!

### Step 1: Test MCP Server Locally
```bash
cd "/home/tanish/Desktop/MAINFRAME DASHBOARD /backend"
npm run mcp:start
```

### Step 2: Configure in Claude Desktop / MCP Host
Add the following entry to your `claude_desktop_config.json` (located at `~/.config/Claude/claude_desktop_config.json` on Linux):

```json
{
  "mcpServers": {
    "mainframe-computers": {
      "command": "npx",
      "args": [
        "-y",
        "tsx",
        "/home/tanish/Desktop/MAINFRAME DASHBOARD /backend/src/mcp/index.ts"
      ],
      "env": {
        "SUPABASE_URL": "https://aintltpyycuodulsaubx.supabase.co",
        "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
      }
    }
  }
}
```

### Registered MCP Tools (31 Tools)
- **Read Tools (21)**: `get_business_summary`, `get_sales`, `get_sale`, `get_customers`, `get_customer`, `get_service_jobs`, `get_service_job`, `get_payments`, `get_income`, `get_expenses`, `get_transactions`, `get_receivables`, `get_payables`, `get_inventory`, `get_products`, `get_low_stock`, `get_invoices`, `get_business_activity`, `get_financial_report`, `get_service_report`, `get_sales_report`.
- **Write Tools (10)**: `create_customer`, `update_customer`, `create_service_job`, `update_service_job_status`, `create_sale`, `create_expense`, `record_payment`, `create_invoice`, `add_product`, `update_inventory`.
