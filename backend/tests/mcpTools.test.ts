import { describe, expect, it, vi } from 'vitest';
import { handleMCPReadTool } from '../src/mcp/tools/readTools.js';
import { handleMCPWriteTool } from '../src/mcp/tools/writeTools.js';

// Robust chainable QueryBuilder mock for Vitest tests
vi.mock('../src/config/supabase.js', () => {
  const createQueryBuilder = () => {
    const builder: any = {
      select: () => builder,
      insert: () => builder,
      update: () => builder,
      delete: () => builder,
      eq: () => builder,
      in: () => builder,
      or: () => builder,
      gte: () => builder,
      lte: () => builder,
      order: () => builder,
      range: () => builder,
      limit: () => builder,
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      single: () =>
        Promise.resolve({
          data: {
            id: 'mock-id-1234',
            name: 'Mock Customer',
            phone: '9876543210',
            created_at: new Date().toISOString(),
          },
          error: null,
        }),
      then: (resolve: any) => resolve({ data: [], count: 0, error: null }),
    };
    return builder;
  };

  return {
    supabase: {},
    supabaseAdmin: {
      from: () => createQueryBuilder(),
      rpc: () => Promise.resolve({ data: null, error: { message: 'RPC mock fallback' } }),
    },
  };
});

describe('MCP Read and Write Tools', () => {
  it('executes MCP read tool "get_business_summary" cleanly', async () => {
    const summary = await handleMCPReadTool('get_business_summary', { period: 'this_month' });
    expect(summary).toHaveProperty('total_income');
    expect(summary).toHaveProperty('profit');
    expect(summary).toHaveProperty('low_stock_items');
  });

  it('handles invalid tool names gracefully', async () => {
    const res = await handleMCPReadTool('non_existent_tool', {});
    expect(res).toHaveProperty('error');
  });

  it('executes MCP write tool "create_customer" successfully', async () => {
    const customer = await handleMCPWriteTool('create_customer', {
      name: 'Prakash Shinde',
      phone: '9988776655',
    });
    expect(customer).toHaveProperty('id');
    expect(customer.name).toBe('Mock Customer');
  });
});
