import { logAIAudit } from '../../services/activityService.js';
import { createCustomer, updateCustomer } from '../../services/customerService.js';
import { createExpense } from '../../services/financeService.js';
import { recordInventoryTransaction } from '../../services/inventoryService.js';
import { createInvoice } from '../../services/invoiceService.js';
import { recordPayment } from '../../services/paymentService.js';
import { createProduct } from '../../services/productService.js';
import { createSale } from '../../services/saleService.js';
import { createServiceJob, updateServiceJobStatus } from '../../services/serviceJobService.js';

export async function handleMCPWriteTool(name: string, args: Record<string, any>) {
  let result: any;
  let status: 'success' | 'failed' = 'success';

  try {
    switch (name) {
      case 'create_customer':
        result = await createCustomer(args);
        break;
      case 'update_customer':
        result = await updateCustomer(args.id, args);
        break;
      case 'create_service_job':
        result = await createServiceJob(args);
        break;
      case 'update_service_job_status':
        result = await updateServiceJobStatus(args.job_id, args.status, args.technician_notes, args.final_cost);
        break;
      case 'create_sale':
        result = await createSale(args);
        break;
      case 'create_expense':
        result = await createExpense(args);
        break;
      case 'record_payment':
        result = await recordPayment(args);
        break;
      case 'create_invoice':
        result = await createInvoice(args);
        break;
      case 'add_product':
        result = await createProduct(args);
        break;
      case 'update_inventory':
        result = await recordInventoryTransaction(args as any);
        break;
      default:
        throw new Error(`Unknown MCP write tool: ${name}`);
    }
  } catch (err: any) {
    status = 'failed';
    result = { error: err.message };
  }

  await logAIAudit({
    tool_name: name,
    input_params: args,
    output_summary: status === 'success' ? 'Execution successful' : result.error,
    status,
  });

  return result;
}
