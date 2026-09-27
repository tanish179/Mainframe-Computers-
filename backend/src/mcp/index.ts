import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { handleMCPReadTool } from './tools/readTools.js';
import { handleMCPWriteTool } from './tools/writeTools.js';

export const mcpServer = new Server(
  {
    name: 'mainframe-computers-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const READ_TOOLS = [
  'get_business_summary',
  'get_sales',
  'get_sale',
  'get_customers',
  'get_customer',
  'get_service_jobs',
  'get_service_job',
  'get_payments',
  'get_income',
  'get_expenses',
  'get_transactions',
  'get_receivables',
  'get_payables',
  'get_inventory',
  'get_products',
  'get_low_stock',
  'get_invoices',
  'get_business_activity',
  'get_financial_report',
  'get_service_report',
  'get_sales_report',
];

const WRITE_TOOLS = [
  'create_customer',
  'update_customer',
  'create_service_job',
  'update_service_job_status',
  'create_sale',
  'create_expense',
  'record_payment',
  'create_invoice',
  'add_product',
  'update_inventory',
];

export const TOOL_SCHEMAS: Record<string, { description: string; inputSchema: Record<string, any> }> = {
  create_sale: {
    description: 'Create a new sale (supports service sales and inventory product sales)',
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: { type: ['string', 'null'], description: 'Optional customer UUID' },
        description: { type: 'string', description: 'Description of the sale or service (e.g. Windows installation)' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              product_id: { type: ['string', 'null'], description: 'Product UUID if selling inventory product' },
              name: { type: 'string', description: 'Item name' },
              quantity: { type: 'number', description: 'Quantity sold' },
              unit_price: { type: 'number', description: 'Unit price in INR' },
              discount: { type: 'number', description: 'Item discount' },
            },
            required: ['unit_price'],
          },
        },
        discount: { type: 'number', description: 'Total sale discount' },
        tax: { type: 'number', description: 'Tax amount' },
        payment_method: {
          type: 'string',
          enum: ['cash', 'UPI', 'card', 'bank_transfer', 'other'],
          description: 'Payment method used',
        },
        amount_paid: { type: 'number', description: 'Amount paid by customer' },
        notes: { type: ['string', 'null'], description: 'Additional notes' },
      },
    },
  },
  create_expense: {
    description: 'Record a new business expense',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: [
            'Rent', 'Electricity', 'Internet', 'Salary', 'Transport', 'Marketing',
            'Software', 'Hardware Purchase', 'Inventory Purchase', 'Tools', 'Maintenance', 'Other'
          ],
          description: 'Expense category',
        },
        description: { type: 'string', description: 'Expense description' },
        amount: { type: 'number', description: 'Expense amount in INR' },
        vendor: { type: ['string', 'null'], description: 'Vendor name' },
        payment_method: {
          type: 'string',
          enum: ['cash', 'UPI', 'card', 'bank_transfer', 'other'],
          description: 'Payment method',
        },
        expense_date: { type: 'string', description: 'Date of expense (YYYY-MM-DD)' },
        reference: { type: ['string', 'null'], description: 'Reference ID' },
        status: { type: 'string', enum: ['paid', 'pending', 'cancelled'] },
        notes: { type: ['string', 'null'], description: 'Notes' },
      },
      required: ['category', 'description', 'amount', 'payment_method'],
    },
  },
  record_payment: {
    description: 'Record a payment received for sale/invoice',
    inputSchema: {
      type: 'object',
      properties: {
        customer_id: { type: ['string', 'null'], description: 'Optional customer ID' },
        invoice_id: { type: ['string', 'null'], description: 'Optional invoice ID' },
        sale_id: { type: ['string', 'null'], description: 'Optional sale ID' },
        amount: { type: 'number', description: 'Payment amount in INR' },
        payment_method: {
          type: 'string',
          enum: ['cash', 'UPI', 'card', 'bank_transfer', 'other'],
          description: 'Payment method',
        },
        payment_date: { type: 'string', description: 'Date of payment' },
        reference: { type: ['string', 'null'], description: 'Payment reference' },
        notes: { type: ['string', 'null'], description: 'Notes' },
      },
      required: ['amount', 'payment_method'],
    },
  },
  add_product: {
    description: 'Add a new product to inventory',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Product name' },
        category: {
          type: 'string',
          enum: [
            'Laptop', 'Desktop', 'CPU', 'GPU', 'RAM', 'SSD', 'HDD',
            'Motherboard', 'Power Supply', 'Monitor', 'Keyboard', 'Mouse',
            'Printer', 'Cartridge', 'Cable', 'CCTV', 'Accessory', 'Other'
          ],
          description: 'Product category',
        },
        sku: { type: 'string', description: 'SKU' },
        brand: { type: 'string', description: 'Brand' },
        model: { type: 'string', description: 'Model' },
        purchase_price: { type: 'number', description: 'Purchase price in INR' },
        selling_price: { type: 'number', description: 'Selling price in INR' },
        stock_quantity: { type: 'number', description: 'Initial stock quantity' },
        minimum_stock_level: { type: 'number', description: 'Minimum stock alert level' },
      },
      required: ['name', 'category', 'sku', 'brand', 'model', 'purchase_price', 'selling_price', 'stock_quantity'],
    },
  },
  update_inventory: {
    description: 'Record an inventory stock transaction',
    inputSchema: {
      type: 'object',
      properties: {
        product_id: { type: 'string', description: 'Product UUID' },
        type: {
          type: 'string',
          enum: ['stock_in', 'stock_out', 'adjustment', 'damaged', 'returned', 'used_in_service'],
          description: 'Transaction type',
        },
        quantity: { type: 'number', description: 'Quantity change' },
        reference_type: { type: ['string', 'null'], description: 'Reference type' },
        reference_id: { type: ['string', 'null'], description: 'Reference ID' },
        notes: { type: ['string', 'null'], description: 'Notes' },
      },
      required: ['product_id', 'type', 'quantity'],
    },
  },
};

mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      ...READ_TOOLS.map((name) => ({
        name,
        description: `Read business information using ${name}`,
        inputSchema: { type: 'object', properties: {} },
      })),
      ...WRITE_TOOLS.map((name) => {
        const schemaDef = TOOL_SCHEMAS[name] || {
          description: `Execute business operation using ${name}`,
          inputSchema: { type: 'object', properties: {} },
        };
        return {
          name,
          description: schemaDef.description,
          inputSchema: schemaDef.inputSchema,
        };
      }),
    ],
  };
});

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const toolArgs = (args as Record<string, any>) || {};

  if (READ_TOOLS.includes(name)) {
    const data = await handleMCPReadTool(name, toolArgs);
    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  } else if (WRITE_TOOLS.includes(name)) {
    const data = await handleMCPWriteTool(name, toolArgs);
    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  } else {
    throw new Error(`Tool not found: ${name}`);
  }
});

async function runMCPServer() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  console.error('🚀 Mainframe Computers MCP Server running on Stdio');
}

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  runMCPServer().catch((err) => {
    console.error('MCP Server error:', err);
    process.exit(1);
  });
}
