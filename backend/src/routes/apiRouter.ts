import { Router } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.js';
import { getBusinessProfile, updateBusinessProfile } from '../services/businessService.js';
import { createCustomer, getCustomerById, getCustomerHistory, getCustomers, updateCustomer } from '../services/customerService.js';
import { getBusinessSummary } from '../services/dashboardService.js';
import { createEmployee, getEmployees } from '../services/employeeService.js';
import { calculateCashFlow, calculateProfit, createExpense, getExpenses, getTransactions } from '../services/financeService.js';
import { getInventoryTransactions, recordInventoryTransaction } from '../services/inventoryService.js';
import { createInvoice, getInvoiceById, getInvoices } from '../services/invoiceService.js';
import { createPayable, getPayables, recordPayablePayment } from '../services/payablesService.js';
import { getPayments, recordPayment } from '../services/paymentService.js';
import { createProduct, getLowStockProducts, getProductById, getProducts, updateProduct } from '../services/productService.js';
import { getReceivables } from '../services/receivablesService.js';
import {
  getCustomerReport,
  getExpenseReport,
  getIncomeReport,
  getInventoryReport,
  getPayablesReport,
  getReceivablesReport,
  getSalesReport,
  getServiceReport,
} from '../services/reportsService.js';
import { createSale, getSaleById, getSales } from '../services/saleService.js';
import {
  addPartToServiceJob,
  createServiceJob,
  getServiceJobById,
  getServiceJobs,
  updateServiceJobStatus,
} from '../services/serviceJobService.js';
import { createSupplier, getSuppliers, updateSupplier } from '../services/supplierService.js';

export const apiRouter = Router();

// Apply Auth Middleware to all API routes
apiRouter.use(authMiddleware as any);

// Business Profile & Summary
apiRouter.get('/business/profile', async (req, res) => {
  try {
    const profile = await getBusinessProfile();
    res.json(profile);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/business/profile', async (req, res) => {
  try {
    const profile = await updateBusinessProfile(req.body);
    res.json(profile);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/dashboard/summary', async (req, res) => {
  try {
    const { period, start_date, end_date } = req.query;
    const summary = await getBusinessSummary(
      (period as any) || 'this_month',
      start_date as string,
      end_date as string
    );
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Customers
apiRouter.get('/customers', async (req, res) => {
  try {
    const { query, status, limit, offset } = req.query;
    const result = await getCustomers({
      query: query as string,
      status: status as any,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/customers', async (req: AuthenticatedRequest, res) => {
  try {
    const customer = await createCustomer(req.body, req.user?.id);
    res.status(201).json(customer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/customers/:id', async (req, res) => {
  try {
    const customer = await getCustomerById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/customers/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const customer = await updateCustomer(req.params.id, req.body, req.user?.id);
    res.json(customer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/customers/:id/history', async (req, res) => {
  try {
    const history = await getCustomerHistory(req.params.id);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Products & Inventory
apiRouter.get('/products', async (req, res) => {
  try {
    const { category, query, low_stock, status, limit, offset } = req.query;
    const result = await getProducts({
      category: category as any,
      query: query as string,
      low_stock_only: low_stock === 'true',
      status: status as any,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/products/low-stock', async (req, res) => {
  try {
    const products = await getLowStockProducts();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/products', async (req: AuthenticatedRequest, res) => {
  try {
    const product = await createProduct(req.body, req.user?.id);
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/products/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const product = await updateProduct(req.params.id, req.body, req.user?.id);
    res.json(product);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/inventory/transactions', async (req: AuthenticatedRequest, res) => {
  try {
    const result = await recordInventoryTransaction(req.body, req.user?.id);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/inventory/transactions', async (req, res) => {
  try {
    const { product_id, type, limit, offset } = req.query;
    const transactions = await getInventoryTransactions({
      product_id: product_id as string,
      type: type as any,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Service Jobs
apiRouter.get('/services/jobs', async (req, res) => {
  try {
    const { status, customer_id, device_type, query, limit, offset } = req.query;
    const result = await getServiceJobs({
      status: status as any,
      customer_id: customer_id as string,
      device_type: device_type as string,
      query: query as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/services/jobs', async (req: AuthenticatedRequest, res) => {
  try {
    const job = await createServiceJob(req.body, req.user?.id);
    res.status(201).json(job);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/services/jobs/:id', async (req, res) => {
  try {
    const job = await getServiceJobById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Service job not found' });
    res.json(job);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/services/jobs/:id/status', async (req: AuthenticatedRequest, res) => {
  try {
    const { status, technician_notes, final_cost } = req.body;
    const job = await updateServiceJobStatus(
      req.params.id,
      status,
      technician_notes,
      final_cost,
      req.user?.id
    );
    res.json(job);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/services/jobs/:id/parts', async (req: AuthenticatedRequest, res) => {
  try {
    const result = await addPartToServiceJob(
      { ...req.body, service_job_id: req.params.id },
      req.user?.id
    );
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Sales
apiRouter.post('/sales', async (req: AuthenticatedRequest, res) => {
  try {
    const result = await createSale(req.body, req.user?.id);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/sales', async (req, res) => {
  try {
    const { customer_id, payment_status, limit, offset } = req.query;
    const result = await getSales({
      customer_id: customer_id as string,
      payment_status: payment_status as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/sales/:id', async (req, res) => {
  try {
    const result = await getSaleById(req.params.id);
    if (!result) return res.status(404).json({ error: 'Sale not found' });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Invoices & Payments
apiRouter.post('/invoices', async (req: AuthenticatedRequest, res) => {
  try {
    const invoice = await createInvoice(req.body, req.user?.id);
    res.status(201).json(invoice);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/invoices', async (req, res) => {
  try {
    const { customer_id, status, limit, offset } = req.query;
    const result = await getInvoices({
      customer_id: customer_id as string,
      status: status as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/payments', async (req: AuthenticatedRequest, res) => {
  try {
    const payment = await recordPayment(req.body, req.user?.id);
    res.status(201).json(payment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/payments', async (req, res) => {
  try {
    const { customer_id, invoice_id, service_job_id, limit, offset } = req.query;
    const result = await getPayments({
      customer_id: customer_id as string,
      invoice_id: invoice_id as string,
      service_job_id: service_job_id as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Financials, Receivables, Payables, Expenses
apiRouter.get('/receivables', async (req, res) => {
  try {
    const result = await getReceivables(req.query as any);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/payables', async (req, res) => {
  try {
    const result = await getPayables(req.query as any);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/payables', async (req: AuthenticatedRequest, res) => {
  try {
    const payable = await createPayable(req.body, req.user?.id);
    res.status(201).json(payable);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/payables/:id/pay', async (req: AuthenticatedRequest, res) => {
  try {
    const { amount, payment_method } = req.body;
    const result = await recordPayablePayment(req.params.id, amount, payment_method, req.user?.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/finance/expenses', async (req: AuthenticatedRequest, res) => {
  try {
    const expense = await createExpense(req.body, req.user?.id);
    res.status(201).json(expense);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/finance/expenses', async (req, res) => {
  try {
    const result = await getExpenses(req.query as any);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/finance/profit', async (req, res) => {
  try {
    const { period, start_date, end_date } = req.query;
    const profit = await calculateProfit(period as any, start_date as string, end_date as string);
    res.json(profit);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/finance/cash-flow', async (req, res) => {
  try {
    const { period, start_date, end_date } = req.query;
    const cashFlow = await calculateCashFlow(period as any, start_date as string, end_date as string);
    res.json(cashFlow);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/finance/transactions', async (req, res) => {
  try {
    const result = await getTransactions(req.query as any);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reports Router
apiRouter.get('/reports/sales', async (req, res) => {
  try {
    const report = await getSalesReport(req.query as any);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/reports/services', async (req, res) => {
  try {
    const report = await getServiceReport(req.query as any);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/reports/income', async (req, res) => {
  try {
    const report = await getIncomeReport(req.query as any);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/reports/expenses', async (req, res) => {
  try {
    const report = await getExpenseReport(req.query as any);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/reports/receivables', async (req, res) => {
  try {
    const report = await getReceivablesReport(req.query as any);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/reports/payables', async (req, res) => {
  try {
    const report = await getPayablesReport(req.query as any);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/reports/inventory', async (req, res) => {
  try {
    const report = await getInventoryReport(req.query as any);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/reports/customers', async (req, res) => {
  try {
    const report = await getCustomerReport();
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
