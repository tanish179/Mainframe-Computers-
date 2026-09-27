import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { apiRouter } from './routes/apiRouter.js';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ChatGPT Plugin Manifest Endpoint
app.get('/.well-known/ai-plugin.json', (req, res) => {
  const host = req.get('host') || `localhost:${PORT}`;
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;

  res.json({
    schema_version: 'v1',
    name_for_human: 'Mainframe Computers Manager',
    name_for_model: 'mainframe_computers_manager',
    description_for_human: 'Internal management plugin for Mainframe Computers sales, repairs, inventory, expenses, and profit.',
    description_for_model: 'Plugin for querying business summary metrics, customer CRM history, hardware repair service jobs, stock inventory, expenses, and net profit calculations for Mainframe Computers.',
    auth: {
      type: 'none',
    },
    api: {
      type: 'openapi',
      url: `${baseUrl}/openapi.json`,
      is_user_authenticated: false,
    },
    logo_url: `${baseUrl}/logo.png`,
    contact_email: 'contact@mainframecomputers.com',
    legal_info_url: `${baseUrl}/legal`,
  });
});

// OpenAPI Spec Endpoint for ChatGPT Plugin
app.get('/openapi.json', (req, res) => {
  const host = req.get('host') || `localhost:${PORT}`;
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;

  res.json({
    openapi: '3.0.0',
    info: {
      title: 'Mainframe Computers Business Management API',
      description: 'ChatGPT Plugin API to manage sales, repair service jobs, inventory, customer history, expenses, and profit.',
      version: '1.0.0',
    },
    servers: [
      {
        url: `${baseUrl}/api/v1`,
        description: 'Mainframe Backend API Server',
      },
    ],
    paths: {
      '/dashboard/summary': {
        get: {
          operationId: 'get_business_summary',
          summary: 'Get financial summary and active job count',
          parameters: [
            {
              name: 'period',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['today', 'this_week', 'this_month', 'last_month', 'this_year', 'custom'],
              },
            },
          ],
          responses: {
            '200': { description: 'Business summary metrics' },
          },
        },
      },
      '/customers': {
        get: {
          operationId: 'get_customers',
          summary: 'Get customer list',
          parameters: [
            { name: 'query', in: 'query', schema: { type: 'string' } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'Customer list' } },
        },
        post: {
          operationId: 'create_customer',
          summary: 'Create a new customer',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'phone'],
                  properties: {
                    name: { type: 'string' },
                    phone: { type: 'string' },
                    email: { type: 'string' },
                    address: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Customer created' } },
        },
      },
      '/services/jobs': {
        get: {
          operationId: 'get_service_jobs',
          summary: 'Get repair service jobs',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'query', in: 'query', schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'Repair jobs list' } },
        },
        post: {
          operationId: 'create_service_job',
          summary: 'Create a new repair service job',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['customer_id', 'device_type', 'device_brand', 'device_model', 'customer_problem'],
                  properties: {
                    customer_id: { type: 'string' },
                    device_type: { type: 'string' },
                    device_brand: { type: 'string' },
                    device_model: { type: 'string' },
                    customer_problem: { type: 'string' },
                    estimated_cost: { type: 'number' },
                    advance_paid: { type: 'number' },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Service job created' } },
        },
      },
      '/finance/profit': {
        get: {
          operationId: 'get_profit',
          summary: 'Get net profit calculation (Income - Expenses)',
          parameters: [
            { name: 'period', in: 'query', schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'Profit calculation' } },
        },
      },
      '/finance/expenses': {
        get: {
          operationId: 'get_expenses',
          summary: 'Get expenses',
          responses: { '200': { description: 'Expenses list' } },
        },
        post: {
          operationId: 'create_expense',
          summary: 'Create a new business expense',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['category', 'description', 'amount', 'payment_method'],
                  properties: {
                    category: { type: 'string' },
                    description: { type: 'string' },
                    amount: { type: 'number' },
                    payment_method: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { '201': { description: 'Expense created' } },
        },
      },
    },
  });
});

// Logo placeholder
app.get('/logo.png', (req, res) => {
  res.setHeader('Content-Type', 'image/png');
  // Send 1x1 blank transparent PNG byte stream
  res.send(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'));
});

// Healthcheck
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Mainframe Computers Backend',
    plugin_manifest: '/.well-known/ai-plugin.json',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1', apiRouter);

// Start server if main module
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  app.listen(PORT, () => {
    console.log(`🚀 Mainframe Business Backend running on port ${PORT}`);
    console.log(`🔌 ChatGPT Plugin Manifest: http://localhost:${PORT}/.well-known/ai-plugin.json`);
  });
}
