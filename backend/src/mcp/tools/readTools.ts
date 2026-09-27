import { getActivityLogs, logAIAudit } from '../../services/activityService.js';
import { getCustomers, getCustomerById, getCustomerHistory } from '../../services/customerService.js';
import { getBusinessSummary } from '../../services/dashboardService.js';
import { getExpenses, getTransactions, calculateProfit } from '../../services/financeService.js';
import { getInventoryTransactions } from '../../services/inventoryService.js';
import { getInvoices } from '../../services/invoiceService.js';
import { getPayables } from '../../services/payablesService.js';
import { getPayments } from '../../services/paymentService.js';
import { getProducts, getLowStockProducts } from '../../services/productService.js';
import { getReceivables } from '../../services/receivablesService.js';
import { getSalesReport, getServiceReport } from '../../services/reportsService.js';
import { getSales, getSaleById } from '../../services/saleService.js';
import { getServiceJobs, getServiceJobById } from '../../services/serviceJobService.js';

export async function handleMCPReadTool(name: string, args: Record<string, any>) {
  let result: any;
  let status: 'success' | 'failed' = 'success';

  try {
    switch (name) {
      case 'get_business_summary':
        result = await getBusinessSummary(args.period || 'this_month', args.start_date, args.end_date);
        break;
      case 'get_sales':
        result = await getSales(args);
        break;
      case 'get_sale':
        result = await getSaleById(args.id);
        break;
      case 'get_customers':
        result = await getCustomers(args);
        break;
      case 'get_customer':
        if (args.include_history) {
          result = await getCustomerHistory(args.id);
        } else {
          result = await getCustomerById(args.id);
        }
        break;
      case 'get_service_jobs':
        result = await getServiceJobs(args);
        break;
      case 'get_service_job':
        result = await getServiceJobById(args.id);
        break;
      case 'get_payments':
        result = await getPayments(args);
        break;
      case 'get_income':
        result = await getTransactions({ type: 'income', ...args });
        break;
      case 'get_expenses':
        result = await getExpenses(args);
        break;
      case 'get_transactions':
        result = await getTransactions(args);
        break;
      case 'get_receivables':
        result = await getReceivables(args);
        break;
      case 'get_payables':
        result = await getPayables(args);
        break;
      case 'get_inventory':
        result = await getInventoryTransactions(args);
        break;
      case 'get_products':
        result = await getProducts(args);
        break;
      case 'get_low_stock':
        result = await getLowStockProducts();
        break;
      case 'get_invoices':
        result = await getInvoices(args);
        break;
      case 'get_business_activity':
        result = await getActivityLogs(args.limit, args.offset);
        break;
      case 'get_financial_report':
        result = await calculateProfit(args.period || 'this_month', args.start_date, args.end_date);
        break;
      case 'get_service_report':
        result = await getServiceReport(args);
        break;
      case 'get_sales_report':
        result = await getSalesReport(args);
        break;
      default:
        throw new Error(`Unknown MCP read tool: ${name}`);
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
