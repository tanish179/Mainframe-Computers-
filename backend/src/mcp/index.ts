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

mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      ...READ_TOOLS.map((name) => ({
        name,
        description: `Read business information using ${name}`,
        inputSchema: { type: 'object', properties: {} },
      })),
      ...WRITE_TOOLS.map((name) => ({
        name,
        description: `Execute business operation using ${name}`,
        inputSchema: { type: 'object', properties: {} },
      })),
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
